const testRewardAPI = async () => {
  // 1. Replace this with the REWARD_SECRET you set in the Supabase Dashboard
  const secretKey = "YOUR_SECRET_HERE"; 

  const url = "https://qdnfqlxryqnczlljkyxi.supabase.co/functions/v1/issue-reward";
  const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbmZxbHhyeXFuY3psbGpreXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NDI3ODUsImV4cCI6MjA5MDAxODc4NX0.EUagNhNTjbmhtcd8qoWy5qjxf26_vo5kBHCjIEzxXQA";

  console.log(`Sending POST request to ${url}...`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${anonKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        points: 100,
        secret_key: secretKey
      })
    });

    const data = await response.json();
    console.log(`\nStatus Code: ${response.status}`);
    console.log("Response Body:", data);

  } catch (error) {
    console.error("Error making request:", error);
  }
};

testRewardAPI();
