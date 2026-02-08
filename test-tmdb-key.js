/**
 * Test script to check TMDB API key validity
 */
const testTMDBKey = async () => {
  const accessToken = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzYjc2Njk0MTcxZjIyYWE4MWM4ODI0NWI2YzI3Y2RhZSIsIm5iZiI6MTczNDQzMzk3Ny4xNzI5OTk5LCJzdWIiOiI2NzYxNWNiOTMyODMyMmZjZjMxODllZGQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.x7QLyTfmR_GufiCqGIIe_l7V2JpMJ4t6Gya1LpqvDos";
  
  console.log('🔍 Testing TMDB API key...');
  
  try {
    const response = await fetch('https://api.themoviedb.org/3/movie/popular', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API key is valid!');
      console.log('Total results:', data.total_results);
      console.log('First movie:', data.results[0]?.title);
    } else {
      const error = await response.json();
      console.log('❌ API key error:', error);
      
      if (response.status === 401) {
        console.log('🔑 API key is invalid or expired');
        console.log('💡 Solution: Get a new API key from https://www.themoviedb.org/settings/api');
      }
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

// Run test
testTMDBKey();
