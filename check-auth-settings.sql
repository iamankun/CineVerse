-- Check Authentication Settings for Lint Rule 0012

-- Step 1: Check if email confirmation is required
SELECT 
    'Email confirmation required' as setting,
    CASE 
        WHEN (SELECT current_setting('auth.require_email_confirmation', true)::boolean) = true 
        THEN 'YES - Good'
        ELSE 'NO - Risk'
    END as status;

-- Step 2: Check if external providers are configured
SELECT 
    'External providers' as setting,
    CASE 
        WHEN COUNT(*) > 0 THEN 'YES - Good'
        ELSE 'NO - Consider adding'
    END as status
FROM auth.providers 
WHERE active = true;

-- Step 3: Check if captcha is configured
SELECT 
    'Captcha configured' as setting,
    CASE 
        WHEN (SELECT current_setting('auth.external_captcha_enabled', true)::boolean) = true 
        THEN 'YES - Good'
        ELSE 'NO - Risk'
    END as status;

-- Step 4: Check sign-up restrictions
SELECT 
    'Sign-up restrictions' as setting,
    CASE 
        WHEN (SELECT current_setting('auth.enable_signup', true)::boolean) = true 
        THEN 'YES - Enabled'
        ELSE 'NO - Disabled'
    END as status;

-- Step 5: Check site URL configuration
SELECT 
    'Site URL configured' as setting,
    CASE 
        WHEN (SELECT current_setting('auth.site_url', true)) IS NOT NULL 
        THEN 'YES - Good'
        ELSE 'NO - Risk'
    END as status;

-- Step 6: Check if anonymous users can sign in
SELECT 
    'Anonymous sign-ins' as setting,
    CASE 
        WHEN (SELECT current_setting('auth.enable_anonymous_sign_ins', true)::boolean) = true 
        THEN 'YES - Risk'
        ELSE 'NO - Good'
    END as status;

-- Step 7: Check rate limiting
SELECT 
    'Rate limiting' as setting,
    CASE 
        WHEN (SELECT current_setting('auth.rate_limit_anonymous_users', true)) IS NOT NULL 
        THEN 'YES - Good'
        ELSE 'NO - Risk'
    END as status;
