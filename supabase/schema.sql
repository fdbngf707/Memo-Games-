-- Run this in your Supabase SQL Editor

-- Games Table
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT NOT NULL,
  "imageUrl" TEXT,
  "releaseDate" TEXT,
  "downloadLink" TEXT,
  "trailerUrl" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- News Table
CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- FAQs Table
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Merch Table
CREATE TABLE public.merch (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  "imageUrl" TEXT,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Threads Table
CREATE TABLE public.threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb NOT NULL
);

-- Setup Row Level Security (RLS) policies
-- Allow public read access to all tables except threads
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merch ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read games" ON public.games FOR SELECT USING (true);
CREATE POLICY "Allow public read news" ON public.news FOR SELECT USING (true);
CREATE POLICY "Allow public read faqs" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Allow public read merch" ON public.merch FOR SELECT USING (true);

-- Allow public to insert into threads (Contact form)
CREATE POLICY "Allow public insert threads" ON public.threads FOR INSERT WITH CHECK (true);

-- Allow anon to read and write everything for now so the admin dashboard works without changing Auth.
-- IMPORTANT: Since the admin dashboard uses a hardcoded hash password and NOT Supabase Auth,
-- we need to temporarily allow public ALL access to these tables.
CREATE POLICY "Allow public all games" ON public.games FOR ALL USING (true);
CREATE POLICY "Allow public all news" ON public.news FOR ALL USING (true);
CREATE POLICY "Allow public all faqs" ON public.faqs FOR ALL USING (true);
CREATE POLICY "Allow public all merch" ON public.merch FOR ALL USING (true);
CREATE POLICY "Allow public all threads" ON public.threads FOR ALL USING (true);

-- =============================================
-- Reward Claim System Tables
-- =============================================

-- Reward Tokens Table (vouchers issued by Discord bot)
CREATE TABLE public.reward_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  points INTEGER NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  claimed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '48 hours')
);

-- Reward Claims Table (audit log for admin dashboard)
CREATE TABLE public.reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID NOT NULL REFERENCES public.reward_tokens(id),
  email TEXT NOT NULL,
  points INTEGER NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for reward_tokens
ALTER TABLE public.reward_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read reward_tokens" ON public.reward_tokens FOR SELECT USING (true);
CREATE POLICY "Allow public update reward_tokens" ON public.reward_tokens FOR UPDATE USING (true);
CREATE POLICY "Allow public all reward_tokens" ON public.reward_tokens FOR ALL USING (true);

-- RLS for reward_claims
ALTER TABLE public.reward_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read reward_claims" ON public.reward_claims FOR SELECT USING (true);
CREATE POLICY "Allow public insert reward_claims" ON public.reward_claims FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public all reward_claims" ON public.reward_claims FOR ALL USING (true);
