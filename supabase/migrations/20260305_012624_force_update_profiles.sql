-- Force update the trigger and fix existing profiles
-- This will ensure all new and existing profiles have correct values

-- Drop and recreate trigger with correct values
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function with correct field values
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Log for debugging
    RAISE LOG 'Creating profile for user % with email %', NEW.id, NEW.email;
    
    -- Insert profile with correct field values
    INSERT INTO public.profiles (
        id, 
        username,
        email,
        full_name,
        role,
        verify,
        created_at
    )
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'username',
            split_part(NEW.email, '@', 1)
        ),
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            split_part(NEW.email, '@', 1)
        ),
        'member',
        'false',
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        verify = EXCLUDED.verify,
        created_at = NOW();
    
    -- Log success
    RAISE LOG 'Profile created successfully for user % with email %, role=member, verify=false', 
             NEW.id, NEW.email;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the signup process
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Force update all existing profiles to have correct values
UPDATE public.profiles 
SET 
    email = auth.users.email,
    role = 'member',
    verify = 'false'
FROM auth.users 
WHERE public.profiles.id = auth.users.id;

-- Log completion
DO $$
BEGIN
    RAISE LOG 'Trigger and profiles updated - all profiles now have role=member, verify=false';
END $$;
