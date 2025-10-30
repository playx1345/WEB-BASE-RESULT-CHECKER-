-- Remove unused tables: messages and threads
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.threads CASCADE;