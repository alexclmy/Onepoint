-- Migration to add veille_history table

-- Create veille_history table
CREATE TABLE IF NOT EXISTS veille_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  parameters JSONB NOT NULL,
  keywords JSONB NOT NULL,
  company_id UUID REFERENCES company(id) ON DELETE SET NULL,
  sub_queries JSONB NOT NULL,
  results JSONB NOT NULL,
  final_report TEXT NOT NULL,
  model_used TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_veille_history_created_at ON veille_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_veille_history_company_id ON veille_history(company_id);
