# Supabase Authentication Endpoints Guide

## 📋 CineVerse Configuration

### Supabase URL
```
https://exsoflgvdreikabvhvkg.supabase.co
```

### Redirect URLs (đã cấu hình trong Dashboard)
```
http://localhost:3000/api/auth/callback
https://yourdomain.com/api/auth/callback
```

## 🔗 OAuth Endpoints (Google)

### Method 1: Client SDK (Recommended)
```javascript
// Dùng trong GoogleLoginButton.tsx
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/api/auth/callback`,
    skipBrowserRedirect: false,
    queryParams: {
      access_type: "offline",
      prompt: "consent",
    },
  },
});
```

### Method 2: Direct GET URL
```http
GET https://exsoflgvdreikabvhvkg.supabase.co/auth/v1/authorize?provider=google&redirect_to=http://localhost:3000/api/auth/callback
```

### Method 3: REST API Call
```bash
curl -X GET "https://exsoflgvdreikabvhvkg.supabase.co/auth/v1/authorize?provider=google&redirect_to=http://localhost:3000/api/auth/callback"
```

## 📧 Email/Magic Link Endpoints

### Method 1: Client SDK (Recommended)
```javascript
// Đăng ký với magic link
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: 'http://localhost:3000/api/auth/callback',
  },
});

// Đăng nhập với magic link
const { data, error } = await supabase.auth.verifyOtp({
  email: 'user@example.com',
  token: '123456',
  type: 'signup',
});
```

### Method 2: REST API
```bash
# Gửi magic link
curl -X POST "https://exsoflgvdreikabvhvkg.supabase.co/auth/v1/otp" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "options": {
      "emailRedirectTo": "http://localhost:3000/api/auth/callback"
    }
  }'

# Verify OTP
curl -X POST "https://exsoflgvdreikabvhvkg.supabase.co/auth/v1/verify" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "token": "123456",
    "type": "signup"
  }'
```

## 🔄 Callback Handler

### Current Implementation
```typescript
// src/app/api/auth/callback/route.ts
export const GET = async (request: NextRequest) => {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  
  // Exchange code for session
  const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);
  
  // Handle success/error
  if (error) {
    return NextResponse.redirect(`${origin}/auth?error=true&message=${encodeURIComponent(error.message)}`);
  }
  
  // Redirect to home
  return NextResponse.redirect(`${origin}/`);
};
```

## 🎯 Các OAuth Providers Supported

```http
# Google
https://exsoflgvdreikabvhvkg.supabase.co/auth/v1/authorize?provider=google&redirect_to=http://localhost:3000/api/auth/callback

# GitHub
https://exsoflgvdreikabvhvkg.supabase.co/auth/v1/authorize?provider=github&redirect_to=http://localhost:3000/api/auth/callback

# Apple
https://exsoflgvdreikabvhvkg.supabase.co/auth/v1/authorize?provider=apple&redirect_to=http://localhost:3000/api/auth/callback

# Facebook
https://exsoflgvdreikabvhvkg.supabase.co/auth/v1/authorize?provider=facebook&redirect_to=http://localhost:3000/api/auth/callback
```

## 🔧 Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://exsoflgvdreikabvhvkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📱 Testing URLs

### Local Development
```http
http://localhost:3000/auth
```

### OAuth Flow Test
```http
https://exsoflgvdreikabvhvkg.supabase.co/auth/v1/authorize?provider=google&redirect_to=http://localhost:3000/api/auth/callback
```

### Magic Link Test
```bash
curl -X POST "https://exsoflgvdreikabvhvkg.supabase.co/auth/v1/otp" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 🚀 Best Practices

1. **Dùng Client SDK**: An toàn và đơn giản hơn
2. **Redirect URLs**: Phải đăng ký trong Supabase Dashboard
3. **Error Handling**: Xử lý lỗi trong callback
4. **Session Management**: SDK tự động quản lý cookies
5. **Security**: Không expose service role key ở client

## 📊 Flow Summary

```
User Click Login → OAuth URL → Google → User Consent → 
Supabase Callback → Session Created → Redirect to App
```

**CineVerse đã được cấu hình đầy đủ cho authentication flow!** 🎉
