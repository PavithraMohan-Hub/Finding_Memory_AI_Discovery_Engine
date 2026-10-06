import * as assert from 'assert';
import { randomUUID } from 'crypto';
import { getSupabaseServerClient } from '../src/lib/db/supabase-server';
import {
  generateContentFingerprint,
  ingestEvidenceBatch,
  ManualStructuredImportConnector,
  normalizeIsoDate,
  normalizeText,
  normalizeUrl,
  rawEvidenceInputSchema,
} from '../src/lib/ingestion';

async function runTests() {
  console.log('==================================================');
  console.log('STARTING PHASE 2 AUTOMATED TEST SUITE');
  console.log('==================================================');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`[FAIL] ${name}: ${err.message || String(err)}`);
      failed++;
    }
  }

  const client = getSupabaseServerClient();

  // --------------------------------------------------------------------------
  // POSITIVE TESTS (PASS)
  // --------------------------------------------------------------------------

  await test('P2-POS-01: Valid Record Normalization', async () => {
    const raw = '  Some   weird \t whitespace \r\n and  multiple \n\n\n\n breaks   ';
    const normalized = normalizeText(raw);
    assert.strictEqual(normalized, 'Some weird whitespace \n and multiple \n\n breaks');

    const rawUrl = 'https://www.reddit.com/r/googlephotos/comments/123/test/?utm_source=share&utm_medium=web2x&ref=home#top';
    const cleanUrl = normalizeUrl(rawUrl);
    assert.strictEqual(cleanUrl, 'https://www.reddit.com/r/googlephotos/comments/123/test');

    const cleanDate = normalizeIsoDate('2025-10-12T13:24:59Z');
    assert.strictEqual(cleanDate, '2025-10-12T13:24:59.000Z');
  });

  await test('P2-POS-02: Valid Fingerprint Generation', async () => {
    const text1 = 'Looking for bird photos in my album';
    const text2 = '  looking for   BIRD photos in my album   ';
    const fp1 = generateContentFingerprint(text1);
    const fp2 = generateContentFingerprint(text2);
    assert.strictEqual(fp1.length, 64);
    assert.strictEqual(fp1, fp2);
  });

  await test('P2-POS-03: Valid Insertion & DB Retrieval', async () => {
    const { data: records, error } = await client
      .from('raw_evidence')
      .select('evidence_id, corpus_type, original_text, source_url, content_fingerprint, is_canonical')
      .eq('corpus_type', 'USER_EVIDENCE')
      .eq('is_canonical', true);

    assert.ifError(error);
    assert.ok(records && records.length >= 10, `Expected at least 10 records, found ${records?.length}`);
  });

  await test('P2-POS-04: Source Linkage Integrity', async () => {
    const { data: records, error } = await client
      .from('raw_evidence')
      .select('evidence_id, source_id, source_registry(display_name, corpus_type)')
      .limit(5);

    assert.ifError(error);
    assert.ok(records && records.length > 0);
    for (const r of records) {
      assert.ok(r.source_id);
      assert.ok((r as any).source_registry);
      assert.strictEqual((r as any).source_registry.corpus_type, 'USER_EVIDENCE');
    }
  });

  await test('P2-POS-05: Batch Linkage Integrity', async () => {
    const { data: batches, error } = await client
      .from('collection_batches')
      .select('batch_id, source_id, status, records_stored, records_fetched')
      .eq('status', 'COMPLETE');

    assert.ifError(error);
    assert.ok(batches && batches.length > 0);
    const batch = batches[0];
    assert.ok(batch);
    assert.strictEqual(batch.status, 'COMPLETE');
    assert.strictEqual(batch.records_stored, 10);
  });

  await test('P2-POS-06: Verifiable Original Source URLs', async () => {
    const { data: records, error } = await client
      .from('raw_evidence')
      .select('evidence_id, source_url')
      .limit(10);

    assert.ifError(error);
    assert.ok(records && records.length >= 10);
    for (const r of records) {
      assert.ok(r.source_url.startsWith('https://'));
      assert.ok(r.source_url.includes('reddit.com'));
    }
  });

  await test('P2-POS-07: Manual Import Connectors (JSON and CSV)', async () => {
    const connectorJson = new ManualStructuredImportConnector('Reddit');
    connectorJson.loadFromJson([
      {
        corpus_type: 'USER_EVIDENCE',
        source_platform: 'Reddit',
        source_type: 'PUBLIC_FORUM',
        source_url: 'https://example.com/test',
        original_text: 'Test user searching for photos in album',
        collection_method: 'MANUAL_STRUCTURED_IMPORT',
      },
    ]);
    const jsonRecords = await connectorJson.fetchRecords();
    assert.strictEqual(jsonRecords.length, 1);

    const connectorCsv = new ManualStructuredImportConnector('Reddit');
    const csvContent =
      'corpus_type,source_platform,source_type,source_url,original_text,collection_method\n' +
      '"USER_EVIDENCE","Reddit","PUBLIC_FORUM","https://example.com/csv-test","Test user finding photos in archive","MANUAL_STRUCTURED_IMPORT"';
    connectorCsv.loadFromCsv(csvContent);
    const csvRecords = await connectorCsv.fetchRecords();
    assert.strictEqual(csvRecords.length, 1);
    assert.ok(csvRecords[0]);
    assert.strictEqual(csvRecords[0].original_text, 'Test user finding photos in archive');
  });

  // --------------------------------------------------------------------------
  // NEGATIVE TESTS (FAIL AS EXPECTED)
  // --------------------------------------------------------------------------

  await test('P2-NEG-01: Rejection of Missing Required Source', async () => {
    const badSourceId = randomUUID();
    let threw = false;
    try {
      await ingestEvidenceBatch({
        client,
        source_id: badSourceId,
        records: [
          {
            corpus_type: 'USER_EVIDENCE',
            source_platform: 'Reddit',
            source_type: 'PUBLIC_FORUM',
            source_url: 'https://example.com/test',
            original_text: 'Trying to find photos from vacation',
            collection_method: 'MANUAL_STRUCTURED_IMPORT',
          },
        ],
      });
    } catch (err: any) {
      threw = true;
      assert.ok(err.message.includes('Invalid source_id'));
    }
    assert.ok(threw, 'Expected ingestion to throw for non-existent source_id');
  });

  await test('P2-NEG-02: Rejection of Missing Original Text', async () => {
    const result = rawEvidenceInputSchema.safeParse({
      corpus_type: 'USER_EVIDENCE',
      source_platform: 'Reddit',
      source_type: 'PUBLIC_FORUM',
      source_url: 'https://example.com/test',
      original_text: '   ',
      collection_method: 'MANUAL_STRUCTURED_IMPORT',
    });
    assert.strictEqual(result.success, false);
  });

  await test('P2-NEG-03: Rejection of Invalid Corpus Type', async () => {
    const result = rawEvidenceInputSchema.safeParse({
      corpus_type: 'INVALID_CORPUS_TYPE' as any,
      source_platform: 'Reddit',
      source_type: 'PUBLIC_FORUM',
      source_url: 'https://example.com/test',
      original_text: 'Trying to find photos from vacation',
      collection_method: 'MANUAL_STRUCTURED_IMPORT',
    });
    assert.strictEqual(result.success, false);
  });

  await test('P2-NEG-04: Rejection of Malformed Record (Invalid URL / SSRF)', async () => {
    const result = rawEvidenceInputSchema.safeParse({
      corpus_type: 'USER_EVIDENCE',
      source_platform: 'Reddit',
      source_type: 'PUBLIC_FORUM',
      source_url: 'http://169.254.169.254/latest/meta-data',
      original_text: 'Trying to find photos from vacation',
      collection_method: 'MANUAL_STRUCTURED_IMPORT',
    });
    assert.strictEqual(result.success, false);
  });

  await test('P2-NEG-05: Deduplication Handling of Duplicate Content', async () => {
    // Get an existing record to duplicate
    const { data: existing } = await client
      .from('raw_evidence')
      .select('source_id, original_text, source_url, source_record_id')
      .limit(1)
      .single();

    assert.ok(existing);

    // Attempt to ingest identical record in a new test batch
    const summary = await ingestEvidenceBatch({
      client,
      source_id: existing.source_id,
      batch_purpose: 'Phase 2 — Deduplication Verification Test',
      records: [
        {
          corpus_type: 'USER_EVIDENCE',
          source_platform: 'Reddit',
          source_type: 'PUBLIC_FORUM',
          source_url: existing.source_url,
          source_record_id: existing.source_record_id,
          original_text: existing.original_text,
          collection_method: 'MANUAL_STRUCTURED_IMPORT',
          verification_status: 'SOURCE_VERIFIED',
        },
      ],
    });

    assert.strictEqual(summary.records_duplicate, 1);
    assert.strictEqual(summary.records_stored, 1);

    // Verify record in database has is_canonical = false and duplicate_status = DUPLICATE
    const { data: dupRecord } = await client
      .from('raw_evidence')
      .select('is_canonical, duplicate_status, duplicate_group_id')
      .eq('collection_batch_id', summary.batch_id)
      .single();

    assert.ok(dupRecord);
    assert.strictEqual(dupRecord.is_canonical, false);
    assert.strictEqual(dupRecord.duplicate_status, 'DUPLICATE');
    assert.ok(dupRecord.duplicate_group_id);

    // Clean up test batch so it doesn't pollute production metrics
    await client.from('raw_evidence').delete().eq('collection_batch_id', summary.batch_id);
    await client.from('collection_batches').delete().eq('batch_id', summary.batch_id);
  });

  await test('P2-NEG-06: Browser Secret Protection (Throws on client)', async () => {
    // Simulate browser environment
    (global as any).window = {};
    let threw = false;
    try {
      getSupabaseServerClient();
    } catch (err: any) {
      threw = true;
      assert.ok(err.message.includes('FATAL SECURITY VIOLATION'));
    } finally {
      delete (global as any).window;
    }
    assert.ok(threw, 'Expected getSupabaseServerClient to throw when window is defined');
  });

  console.log('==================================================');
  console.log(`TEST RESULTS: ${passed} passed, ${failed} failed`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
