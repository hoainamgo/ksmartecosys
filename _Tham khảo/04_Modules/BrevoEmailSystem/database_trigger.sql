-- 1. Enable pg_net extension (Required for HTTP requests)
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- 2. Create the Trigger Function
-- Replace 'https://your-worker-url.workers.dev/api/webhooks/auth' with your actual Worker URL
CREATE OR REPLACE FUNCTION public.handle_new_user_email()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://your-worker-url.workers.dev/api/webhooks/auth',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
        'type', 'INSERT',
        'record', jsonb_build_object(
          'email', NEW.email,
          'raw_user_meta_data', NEW.raw_user_meta_data
        )
      )
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the Trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_email();
