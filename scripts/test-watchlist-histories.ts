import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
);

async function testWatchlistAndHistories() {
  console.log('Testing Watchlist and Histories...');
  
  // Sign in
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'test@cineverse.com',
    password: 'testpassword123',
  });

  if (signInError) {
    console.error('Sign in error:', signInError.message);
    return;
  }

  console.log('Signed in as:', signInData.user?.email);

  // Test adding to watchlist
  const { data: watchlistData, error: watchlistError } = await supabase
    .from('watchlist')
    .insert({
      user_id: signInData.user?.id,
      id: 550, // Fight Club movie ID
      type: 'movie',
      adult: false,
      backdrop_path: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
      poster_path: '/nn7PzhNtM8mQyvR2IIJHb2jgJlJ.jpg',
      release_date: '1999-10-15',
      title: 'Fight Club',
      vote_average: 8.8
    })
    .select()
    .single();

  if (watchlistError) {
    console.error('Watchlist insert error:', watchlistError.message);
  } else {
    console.log('Added to watchlist:', watchlistData);
  }

  // Test adding to histories
  const { data: historyData, error: historyError } = await supabase
    .from('histories')
    .insert({
      user_id: signInData.user?.id,
      media_id: 13, // Game of Thrones ID
      type: 'tv',
      season: 1,
      episode: 1,
      duration: 62,
      last_position: 30,
      completed: false,
      adult: false,
      backdrop_path: '/wHa6KOa3Q18phLORLzC8Zg0j2l.jpg',
      poster_path: '/4EYPN5mVIhKLfxGruy7VAFZ2j9b.jpg',
      release_date: '2011-04-17',
      title: 'Game of Thrones',
      vote_average: 8.4
    })
    .select()
    .single();

  if (historyError) {
    console.error('History insert error:', historyError.message);
  } else {
    console.log('Added to history:', historyData);
  }

  // Test reading watchlist
  const { data: userWatchlist, error: readWatchlistError } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', signInData.user?.id);

  if (readWatchlistError) {
    console.error('Read watchlist error:', readWatchlistError.message);
  } else {
    console.log('User watchlist:', userWatchlist);
  }

  // Test reading histories
  const { data: userHistories, error: readHistoriesError } = await supabase
    .from('histories')
    .select('*')
    .eq('user_id', signInData.user?.id)
    .order('updated_at', { ascending: false });

  if (readHistoriesError) {
    console.error('Read histories error:', readHistoriesError.message);
  } else {
    console.log('User histories:', userHistories);
  }

  // Test RLS - try to access another user's data (should fail)
  const { data: otherData, error: otherError } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', '00000000-0000-0000-0000-000000000000'); // Fake user ID

  if (otherError) {
    console.log('RLS working - Cannot access other user data:', otherError.message);
  } else {
    console.log('RLS issue - Can access other user data:', otherData);
  }

  // Sign out
  await supabase.auth.signOut();
  console.log('Test completed');
}

testWatchlistAndHistories().catch(console.error);
