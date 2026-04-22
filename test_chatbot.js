async function testBackend() {
  console.log("Testing AI Chatbot Backend...");
  try {
    const response = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'test-user-id',
        role: 'patient',
        message: 'What is ADHD?'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Success! Response received.");
      console.log("Bot Response Snippet:", data.response.substring(0, 100) + "...");
    } else {
      console.log("Failed. Status:", response.status);
      const err = await response.text();
      console.log("Error details:", err);
    }
  } catch (err) {
    console.log("Error connecting to backend:", err.message);
  }
}

testBackend();
