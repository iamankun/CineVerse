// Script để kiểm tra environment variables
// Chạy với: node debug-env.js

console.log("=== ENVIRONMENT VARIABLES CHECK ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING");
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING");
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING");

// Test URL format
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("✅ SUPABASE_URL format is valid");
  } catch (e) {
    console.log("❌ SUPABASE_URL format is INVALID:", e.message);
  }
}

console.log("\n=== VERCEL ENV CHECK ===");
console.log("VERCEL:", process.env.VERCEL);
console.log("VERCEL_ENV:", process.env.VERCEL_ENV);
