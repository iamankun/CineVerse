-- Fix Authentication Security for Lint Rule 0012

-- Step 1: Enable email confirmation (if not already enabled)
-- This requires users to verify their email before signing in
UPDATE auth.config 
SET value = 'true' 
WHERE name = 'require_email_confirmation';

-- Step 2: Enable captcha for sign-ups
UPDATE auth.config 
SET value = 'true' 
WHERE name = 'external_captcha_enabled';

-- Step 3: Disable anonymous sign-ins (if not needed)
UPDATE auth.config 
SET value = 'false' 
WHERE name = 'enable_anonymous_sign_ins';

-- Step 4: Enable rate limiting for anonymous users
-- Limit to 10 requests per minute
UPDATE auth.config 
SET value = '10/min' 
WHERE name = 'rate_limit_anonymous_users';

-- Step 5: Ensure site URL is properly configured
UPDATE auth.config 
SET value = 'https://yourdomain.com' 
WHERE name = 'site_url';

-- Step 6: Add additional security headers
-- Enable session timeout (24 hours)
UPDATE auth.config 
SET value = '86400' 
WHERE name = 'session_timeout';

-- Step 7: Check current configuration
SELECT name, value, description 
FROM auth.config 
WHERE name IN (
    'require_email_confirmation',
    'external_captcha_enabled', 
    'enable_anonymous_sign_ins',
    'rate_limit_anonymous_users',
    'site_url',
    'session_timeout'
);
