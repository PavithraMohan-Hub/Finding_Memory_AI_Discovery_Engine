import { getSupabaseServerClient } from '../src/lib/db/supabase-server';

async function main() {
  const client = getSupabaseServerClient();

  const { data: sources } = await client.from('source_registry').select('*');
  console.log('--- SOURCE REGISTRY ---');
  console.log(`Sources count: ${sources?.length}`);
  sources?.forEach((s) => {
    console.log(`  Source ID: ${s.source_id} | Platform: ${s.source_platform} | Name: ${s.display_name} | Access: ${s.access_status}`);
  });

  const { data: batches } = await client.from('collection_batches').select('*');
  console.log('\n--- COLLECTION BATCHES ---');
  console.log(`Batches count: ${batches?.length}`);
  batches?.forEach((b) => {
    console.log(`  Batch ID: ${b.batch_id} | Status: ${b.status} | Stored: ${b.records_stored} | Fetched: ${b.records_fetched} | Dups: ${b.records_duplicate} | Failed: ${b.records_failed}`);
  });

  const { data: records, count } = await client
    .from('raw_evidence')
    .select('evidence_id, source_record_id, title, original_text, source_url, content_fingerprint, is_canonical, published_at, verification_status', { count: 'exact' });

  console.log('\n--- RAW EVIDENCE RECORDS ---');
  console.log(`Total records in DB: ${count}`);
  records?.forEach((r, idx) => {
    console.log(`\nRecord ${idx + 1}:`);
    console.log(`  ID:           ${r.evidence_id}`);
    console.log(`  Source ID:    ${r.source_record_id}`);
    console.log(`  Title:        ${r.title}`);
    console.log(`  Canonical:    ${r.is_canonical}`);
    console.log(`  Status:       ${r.verification_status}`);
    console.log(`  Published:    ${r.published_at}`);
    console.log(`  URL:          ${r.source_url}`);
    console.log(`  Fingerprint:  ${r.content_fingerprint.slice(0, 24)}...`);
    console.log(`  Excerpt:      "${r.original_text.slice(0, 90)}..."`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
