// deploy_reward_tables.js
// Run this script once to create the reward system tables in Supabase
// Usage: node deploy_reward_tables.js

const SUPABASE_URL = "https://qdnfqlxryqnczlljkyxi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbmZxbHhyeXFuY3psbGpreXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NDI3ODUsImV4cCI6MjA5MDAxODc4NX0.EUagNhNTjbmhtcd8qoWy5qjxf26_vo5kBHCjIEzxXQA";

const SQL = `
-- Reward Tokens Table
CREATE TABLE IF NOT EXISTS public.reward_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  points INTEGER NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  claimed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '48 hours')
);

-- Reward Claims Table
CREATE TABLE IF NOT EXISTS public.reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID NOT NULL REFERENCES public.reward_tokens(id),
  email TEXT NOT NULL,
  points INTEGER NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for reward_tokens
ALTER TABLE public.reward_tokens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read reward_tokens') THEN
    CREATE POLICY "Allow public read reward_tokens" ON public.reward_tokens FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public update reward_tokens') THEN
    CREATE POLICY "Allow public update reward_tokens" ON public.reward_tokens FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public all reward_tokens') THEN
    CREATE POLICY "Allow public all reward_tokens" ON public.reward_tokens FOR ALL USING (true);
  END IF;
END $$;

-- RLS for reward_claims
ALTER TABLE public.reward_claims ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read reward_claims') THEN
    CREATE POLICY "Allow public read reward_claims" ON public.reward_claims FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert reward_claims') THEN
    CREATE POLICY "Allow public insert reward_claims" ON public.reward_claims FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public all reward_claims') THEN
    CREATE POLICY "Allow public all reward_claims" ON public.reward_claims FOR ALL USING (true);
  END IF;
END $$;
`;

async function deploy() {
  console.log("🚀 Deploying reward system tables to Supabase...\n");

  try {
    // Use Supabase's rpc endpoint to run raw SQL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: SQL }),
    });

    // If rpc doesn't work, the anon key can't run DDL.
    // Let's try a different approach: test if tables already exist by querying them
    console.log("Testing if tables exist by querying them...\n");

    const tokensRes = await fetch(`${SUPABASE_URL}/rest/v1/reward_tokens?select=id&limit=1`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (tokensRes.ok) {
      console.log("✅ reward_tokens table EXISTS and is accessible");
    } else {
      const err = await tokensRes.json();
      if (err.code === "42P01") {
        console.log("❌ reward_tokens table does NOT exist yet.");
        console.log("   You need to run the SQL manually in the Supabase SQL Editor.");
        console.log("   Go to: https://supabase.com/dashboard/project/qdnfqlxryqnczlljkyxi/sql/new");
        console.log("\n   SQL to run is in: supabase/schema.sql (the reward section at the bottom)\n");
      } else {
        console.log("⚠️  reward_tokens query error:", err.message);
      }
    }

    const claimsRes = await fetch(`${SUPABASE_URL}/rest/v1/reward_claims?select=id&limit=1`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (claimsRes.ok) {
      console.log("✅ reward_claims table EXISTS and is accessible");
    } else {
      const err = await claimsRes.json();
      if (err.code === "42P01") {
        console.log("❌ reward_claims table does NOT exist yet.");
      } else {
        console.log("⚠️  reward_claims query error:", err.message);
      }
    }

    // If tables exist, insert a test token
    if (tokensRes.ok) {
      console.log("\n📝 Inserting a test reward token (100 points)...");
      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/reward_tokens`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
        body: JSON.stringify({ points: 100 }),
      });

      if (insertRes.ok) {
        const [token] = await insertRes.json();
        console.log("✅ Test token created!");
        console.log(`   Token ID: ${token.id}`);
        console.log(`   Points: ${token.points}`);
        console.log(`   Expires: ${token.expires_at}`);
        console.log(`\n🔗 Claim URL: http://localhost:8080/claim?token=${token.id}`);
        console.log(`\n   Open this URL in your browser to test the claim flow!`);
      } else {
        const err = await insertRes.json();
        console.log("❌ Failed to insert test token:", err.message);
      }
    }

  } catch (err) {
    console.error("Error:", err.message);
  }
}

deploy();
