-- Competition Participants Table
CREATE TABLE IF NOT EXISTS public.competition_participants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
    user_email text NOT NULL,
    submission_url text,
    placement integer DEFAULT 0,
    status text DEFAULT 'joined'::text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(competition_id, user_email)
);

-- User Notifications Table
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Allow public read access to participants (so everyone can see who joined)
CREATE POLICY "Allow public read access to participants" 
ON public.competition_participants FOR SELECT USING (true);

-- Allow anyone to insert/update their own participation (since we aren't enforcing strict user auth rows yet, we rely on UI constraints)
CREATE POLICY "Allow insertion into participants" 
ON public.competition_participants FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow updates to participants" 
ON public.competition_participants FOR UPDATE USING (true);

-- Allow admins full access assuming UI handles email checks
-- For notifications, let users read their own (or allow public select and filter on UI for now to match current setup)
CREATE POLICY "Allow public select on notifications" 
ON public.user_notifications FOR SELECT USING (true);

CREATE POLICY "Allow anon insert to notifications" 
ON public.user_notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon update to notifications" 
ON public.user_notifications FOR UPDATE USING (true);
