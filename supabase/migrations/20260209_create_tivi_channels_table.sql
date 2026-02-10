-- Create TV Channels table
CREATE TABLE IF NOT EXISTS public."TiviChannels" (
  id SERIAL PRIMARY KEY,
  channel_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  logo TEXT,
  url TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'm3u8',
  category VARCHAR(50) DEFAULT 'Tin Tức',
  country VARCHAR(10) DEFAULT 'VN',
  quality VARCHAR(10) DEFAULT 'HD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tivichannels_channel_id ON public."TiviChannels"(channel_id);
CREATE INDEX IF NOT EXISTS idx_tivichannels_category ON public."TiviChannels"(category);
CREATE INDEX IF NOT EXISTS idx_tivichannels_country ON public."TiviChannels"(country);

-- Enable RLS
ALTER TABLE public."TiviChannels" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "TiviChannels_select_policy" ON public."TiviChannels";
CREATE POLICY "TiviChannels_select_policy" ON public."TiviChannels" FOR SELECT USING (true);

DROP POLICY IF EXISTS "TiviChannels_insert_policy" ON public."TiviChannels";
CREATE POLICY "TiviChannels_insert_policy" ON public."TiviChannels" FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "TiviChannels_update_policy" ON public."TiviChannels";
CREATE POLICY "TiviChannels_update_policy" ON public."TiviChannels" FOR UPDATE USING (true);

DROP POLICY IF EXISTS "TiviChannels_delete_policy" ON public."TiviChannels";
CREATE POLICY "TiviChannels_delete_policy" ON public."TiviChannels" FOR DELETE USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_tivichannels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tivichannels_updated_at_trigger ON public."TiviChannels";
CREATE TRIGGER update_tivichannels_updated_at_trigger
  BEFORE UPDATE ON public."TiviChannels"
  FOR EACH ROW
  EXECUTE FUNCTION update_tivichannels_updated_at();
