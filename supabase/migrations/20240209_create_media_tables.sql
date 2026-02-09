-- Create DienAnh table
CREATE TABLE IF NOT EXISTS public."DienAnh" (
  id SERIAL PRIMARY KEY,
  tmdb_id INTEGER NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  year INTEGER NOT NULL,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for DienAnh
CREATE INDEX IF NOT EXISTS idx_dienanh_tmdb_id ON public."DienAnh"(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_dienanh_title ON public."DienAnh"(title);
CREATE INDEX IF NOT EXISTS idx_dienanh_year ON public."DienAnh"(year);

-- Create ChuongTrinhTV table
CREATE TABLE IF NOT EXISTS public."ChuongTrinhTV" (
  id SERIAL PRIMARY KEY,
  tmdb_id INTEGER NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  year INTEGER NOT NULL,
  seasons JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for ChuongTrinhTV
CREATE INDEX IF NOT EXISTS idx_chuongtrinhtv_tmdb_id ON public."ChuongTrinhTV"(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_chuongtrinhtv_title ON public."ChuongTrinhTV"(title);
CREATE INDEX IF NOT EXISTS idx_chuongtrinhtv_year ON public."ChuongTrinhTV"(year);

-- Enable RLS
ALTER TABLE public."DienAnh" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ChuongTrinhTV" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "DienAnh_select_policy" ON public."DienAnh";
CREATE POLICY "DienAnh_select_policy" ON public."DienAnh" FOR SELECT USING (true);

DROP POLICY IF EXISTS "DienAnh_insert_policy" ON public."DienAnh";
CREATE POLICY "DienAnh_insert_policy" ON public."DienAnh" FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "DienAnh_update_policy" ON public."DienAnh";
CREATE POLICY "DienAnh_update_policy" ON public."DienAnh" FOR UPDATE USING (true);

DROP POLICY IF EXISTS "DienAnh_delete_policy" ON public."DienAnh";
CREATE POLICY "DienAnh_delete_policy" ON public."DienAnh" FOR DELETE USING (true);

DROP POLICY IF EXISTS "ChuongTrinhTV_select_policy" ON public."ChuongTrinhTV";
CREATE POLICY "ChuongTrinhTV_select_policy" ON public."ChuongTrinhTV" FOR SELECT USING (true);

DROP POLICY IF EXISTS "ChuongTrinhTV_insert_policy" ON public."ChuongTrinhTV";
CREATE POLICY "ChuongTrinhTV_insert_policy" ON public."ChuongTrinhTV" FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "ChuongTrinhTV_update_policy" ON public."ChuongTrinhTV";
CREATE POLICY "ChuongTrinhTV_update_policy" ON public."ChuongTrinhTV" FOR UPDATE USING (true);

DROP POLICY IF EXISTS "ChuongTrinhTV_delete_policy" ON public."ChuongTrinhTV";
CREATE POLICY "ChuongTrinhTV_delete_policy" ON public."ChuongTrinhTV" FOR DELETE USING (true);
