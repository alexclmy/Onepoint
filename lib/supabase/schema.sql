-- Experts table
CREATE TABLE IF NOT EXISTS experts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  expertise TEXT NOT NULL,
  tone TEXT NOT NULL CHECK (tone IN ('formal', 'creative', 'analytical', 'strategic', 'pragmatic')),
  system_prompt TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT false,
  avatar TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_input TEXT NOT NULL,
  selected_actions JSONB NOT NULL,
  selected_experts JSONB NOT NULL,
  user_involved BOOLEAN DEFAULT false,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'waiting_user', 'completed', 'failed')),
  timeline JSONB NOT NULL DEFAULT '[]',
  result TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LLM Config table
CREATE TABLE IF NOT EXISTS llm_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'custom')),
  model TEXT NOT NULL,
  temperature DECIMAL(3, 2) NOT NULL DEFAULT 0.7,
  max_tokens INTEGER NOT NULL DEFAULT 4000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Questions table
CREATE TABLE IF NOT EXISTS user_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default LLM config
INSERT INTO llm_configs (provider, model, temperature, max_tokens)
VALUES ('openai', 'gpt-4-turbo-preview', 0.7, 4000)
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_experts_is_custom ON experts(is_custom);
CREATE INDEX IF NOT EXISTS idx_user_questions_analysis_id ON user_questions(analysis_id);
