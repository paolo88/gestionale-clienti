export interface Client {
  id: string;
  name: string;
  vat_number: string | null;
  channel: string | null;
  province: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  category: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Revenue {
  id: string;
  client_id: string;
  company_id: string;
  period: string; // YYYY-MM-DD
  amount: number;
  source: 'manual' | 'import';
  import_batch_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  clients?: Client;
  companies?: Company;
}

export interface ImportBatch {
  id: string;
  filename: string | null;
  imported_at: string;
  total_rows: number;
  success_rows: number;
  error_rows: number;
  error_report: any;
}
