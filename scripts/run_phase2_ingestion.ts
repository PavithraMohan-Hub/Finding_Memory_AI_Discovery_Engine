import * as fs from 'fs';
import * as path from 'path';
import { getSupabaseServerClient } from '../src/lib/db/supabase-server';
import {
  ManualStructuredImportConnector,
  ingestEvidenceBatch,
} from '../src/lib/ingestion';

async function main() {
  console.log('==================================================');
  console.log('STARTING PHASE 2 INGESTION PIPELINE EXECUTION');
  console.log('==================================================');

  // Verify server client
  const client = getSupabaseServerClient();

  // 1. Ensure source exists in source_registry
  const sourceDisplayName = 'Reddit Public Discussions (r/googlephotos & r/GooglePixel)';
  let { data: existingSource } = await client
    .from('source_registry')
    .select('*')
    .eq('display_name', sourceDisplayName)
    .maybeSingle();

  if (!existingSource) {
    console.log(`Source not found in registry. Creating source record for: ${sourceDisplayName}...`);
    const { data: newSource, error: sourceInsertErr } = await client
      .from('source_registry')
      .insert({
        source_platform: 'Reddit',
        corpus_type: 'USER_EVIDENCE',
        display_name: sourceDisplayName,
        product_name: 'Google Photos',
        priority: 4,
        access_status: 'MANUAL_ONLY',
        permitted_route: 'MANUAL_STRUCTURED_IMPORT',
        terms_reference_url: 'https://www.redditinc.com/policies/user-agreement',
        approval_status: 'APPROVED_FOR_MANUAL_SLICE',
        ai_processing_permitted: true,
        display_conditions: 'Verbatim user statement citation with source link',
        rate_limits: 'Manual import: researcher curated',
        retention_conditions: 'Honors deletion requests upon withdrawal',
        notes: 'Phase 2 manual structured import of verified public user retrieval experiences from r/googlephotos and r/GooglePixel.',
      })
      .select()
      .single();

    if (sourceInsertErr) {
      console.error('Failed to register source:', sourceInsertErr.message);
      process.exit(1);
    }
    existingSource = newSource;
  }

  console.log(`Active Source ID: ${existingSource.source_id} (${existingSource.display_name})`);

  // 2. Load 10 canonical records via ManualStructuredImportConnector
  const jsonPath = path.resolve('data/phase2_vertical_slice_evidence.json');
  const rawJson = fs.readFileSync(jsonPath, 'utf8');
  const connector = new ManualStructuredImportConnector('Reddit');
  connector.loadFromJson(rawJson);
  const records = await connector.fetchRecords();

  console.log(`Connector loaded ${records.length} records from ${jsonPath}.`);

  // 3. Ingest batch
  console.log('Executing batch ingestion with normalization, validation, and deduplication...');
  const summary = await ingestEvidenceBatch({
    client,
    source_id: existingSource.source_id,
    batch_purpose: 'Phase 2 — 10-record vertical slice',
    records,
  });

  console.log('--------------------------------------------------');
  console.log('INGESTION SUMMARY:');
  console.log(`Batch ID:          ${summary.batch_id}`);
  console.log(`Source ID:         ${summary.source_id}`);
  console.log(`Status:            ${summary.status}`);
  console.log(`Records Considered:${summary.records_considered}`);
  console.log(`Records Stored:    ${summary.records_stored}`);
  console.log(`Duplicates Found:  ${summary.records_duplicate}`);
  console.log(`Records Failed:    ${summary.records_failed}`);
  if (summary.errors.length > 0) {
    console.error('Errors encountered:', summary.errors);
  }
  console.log('--------------------------------------------------');

  // 4. Verify Database Records
  const { data: dbRecords, error: dbErr, count } = await client
    .from('raw_evidence')
    .select('evidence_id, source_record_id, title, is_canonical, content_fingerprint, source_url', { count: 'exact' })
    .eq('collection_batch_id', summary.batch_id);

  if (dbErr) {
    console.error('Failed to query raw_evidence:', dbErr.message);
    process.exit(1);
  }

  console.log(`Database verification: Found ${count} raw_evidence records in this batch.`);
  dbRecords?.forEach((r, idx) => {
    console.log(`  [${idx + 1}] ID: ${r.evidence_id} | RecordID: ${r.source_record_id} | Canonical: ${r.is_canonical} | Title: "${r.title?.slice(0, 45)}..."`);
  });

  console.log('==================================================');
  console.log('PHASE 2 INGESTION EXECUTION COMPLETE');
  console.log('==================================================');
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
