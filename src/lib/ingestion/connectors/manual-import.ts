import { RawEvidenceInput, SourceConnector, CorpusType, VerificationStatus } from '../types';

export class ManualStructuredImportConnector implements SourceConnector {
  readonly name = 'ManualStructuredImportConnector';
  readonly corpus_type: CorpusType = 'USER_EVIDENCE';
  readonly source_platform: string;
  readonly source_type = 'PUBLIC_FORUM';
  readonly permitted_route = 'MANUAL_STRUCTURED_IMPORT';

  private dataPayload: RawEvidenceInput[] = [];

  constructor(platform = 'Reddit') {
    this.source_platform = platform;
  }

  /**
   * Loads records from a JSON array or JSON string.
   */
  loadFromJson(jsonInput: string | RawEvidenceInput[]): void {
    if (typeof jsonInput === 'string') {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        throw new Error('Manual JSON import must contain an array of evidence objects');
      }
      this.dataPayload = parsed;
    } else if (Array.isArray(jsonInput)) {
      this.dataPayload = jsonInput;
    } else {
      throw new Error('Invalid JSON input for manual import');
    }
  }

  /**
   * Parses standard CSV text with headers into RawEvidenceInput objects.
   */
  loadFromCsv(csvText: string): void {
    const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) {
      throw new Error('CSV input must contain at least a header row and one data row');
    }

    // Parse CSV line taking quotes into account
    const parseCsvLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCsvLine(lines[0] || '');
    const records: RawEvidenceInput[] = [];

    for (let r = 1; r < lines.length; r++) {
      const currentLine = lines[r];
      if (!currentLine) continue;
      const values = parseCsvLine(currentLine);
      const record: Record<string, string | null> = {};
      headers.forEach((h, idx) => {
        const val = values[idx];
        record[h] = val === '' || val === undefined ? null : val;
      });

      records.push({
        corpus_type: (record.corpus_type as CorpusType) || 'USER_EVIDENCE',
        source_platform: record.source_platform || this.source_platform,
        source_type: record.source_type || 'PUBLIC_FORUM',
        product_name: record.product_name ?? null,
        product_id: record.product_id ?? null,
        source_record_id: record.source_record_id ?? null,
        source_url: record.source_url || '',
        canonical_url: record.canonical_url ?? null,
        original_url: record.original_url ?? null,
        parent_thread_url: record.parent_thread_url ?? null,
        sequence_in_thread: record.sequence_in_thread != null ? parseInt(String(record.sequence_in_thread), 10) : null,
        title: record.title ?? null,
        original_text: record.original_text || '',
        language: record.language ?? 'en',
        country_market: record.country_market ?? null,
        rating: record.rating != null ? parseFloat(String(record.rating)) : null,
        helpful_score: record.helpful_score != null ? parseInt(String(record.helpful_score), 10) : null,
        published_at: record.published_at ?? null,
        collection_method: record.collection_method || 'MANUAL_STRUCTURED_IMPORT',
        verification_status: (record.verification_status as VerificationStatus) || 'SOURCE_VERIFIED',
        source_access_notes: record.source_access_notes ?? null,
      });
    }

    this.dataPayload = records;
  }

  async fetchRecords(): Promise<RawEvidenceInput[]> {
    return this.dataPayload;
  }
}
