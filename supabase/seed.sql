-- CineVerse Database Seed File
-- This file is used to seed initial data into the database during development
-- Add your seed data below

-- Note: Profiles cần user ID từ auth.users
-- Trong môi trường development, cần tạo auth users trước hoặc sử dụng ID thực tế

-- Insert sample watchlist data (sử dụng user ID thực tế sau khi auth)
-- INSERT INTO public.watchlist (user_id, id, type, adult, backdrop_path, poster_path, release_date, title, vote_average)
-- VALUES 
--     ('real-user-uuid-here', 550, 'movie', false, '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg', '/nn7PzhNtM8mQyvR2IIJHb2jgJlJ.jpg', '1999-10-15', 'Fight Club', 8.8),
--     ('real-user-uuid-here', 13, 'tv', false, '/wHa6KOa3Q18phLORLzC8Zg0j2l.jpg', '/4EYPN5mVIhKLfxGruy7VAFZ2j9b.jpg', '2011-04-17', 'Game of Thrones', 8.4)
-- ON CONFLICT (user_id, id, type) DO NOTHING;

-- Insert sample history data (sử dụng user ID thực tế sau khi auth)
-- INSERT INTO public.histories (user_id, media_id, type, season, episode, duration, last_position, completed, adult, backdrop_path, poster_path, release_date, title, vote_average)
-- VALUES 
--     ('real-user-uuid-here', 550, 'movie', 0, 0, 139, 45, false, false, '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg', '/nn7PzhNtM8mQyvR2IIJHb2jgJlJ.jpg', '1999-10-15', 'Fight Club', 8.8),
--     ('real-user-uuid-here', 13, 'tv', 1, 1, 62, 30, false, false, '/wHa6KOa3Q18phLORLzC8Zg0j2l.jpg', '/4EYPN5mVIhKLfxGruy7VAFZ2j9b.jpg', '2011-04-17', 'Game of Thrones', 8.4)
-- ON CONFLICT (user_id, media_id, type, season, episode) DO NOTHING;

-- Test data sẽ được thêm sau khi có user thực tế thông qua application
SELECT 'Database seeded successfully. Test data will be added when users register through the application.' AS message;
