-- Create RPC functions for health checks and admin operations

-- Function to get table info
CREATE OR REPLACE FUNCTION get_table_info(p_table_name text)
RETURNS TABLE(
  table_name text,
  column_name text,
  data_type text,
  is_nullable text,
  column_default text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default
  FROM information_schema.tables t
  JOIN information_schema.columns c ON t.table_name = c.table_name
  WHERE t.table_name = p_table_name
    AND t.table_schema = 'public'
  ORDER BY c.ordinal_position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to execute SQL (admin only)
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  EXECUTE sql;
  RETURN 'SQL executed successfully';
EXCEPTION WHEN OTHERS THEN
  RETURN 'Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_table_info TO anon, authenticated;
GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;
