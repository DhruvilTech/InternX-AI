
async function run() {
  const baseUrl = 'http://localhost:5000';
  const email = 'arjundev@gmail.com';
  const password = 'Password@123';

  try {
    console.log('[TEST] Logging in...');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const loginData = await loginRes.json();
    if (!loginData.success) {
      console.error('[TEST] Login failed:', loginData);
      return;
    }

    const token = loginData.data.accessToken;
    console.log('[TEST] Login successful. Token obtained.');

    // Fetch career paths
    console.log('[TEST] Fetching career paths...');
    const careersRes = await fetch(`${baseUrl}/api/careers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const careersData = await careersRes.json();
    const careerId = careersData.data.careers[0]._id;
    console.log(`[TEST] Found career path ID: ${careerId}`);

    // Select career path
    console.log('[TEST] Selecting career path...');
    const selectRes = await fetch(`${baseUrl}/api/careers/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ careerId })
    });
    const selectData = await selectRes.json();
    console.log('[TEST] Select career response:', selectData.message);

    // Generate internship and tasks
    console.log('[TEST] Generating internship and tasks...');
    const generateRes = await fetch(`${baseUrl}/api/internships/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const generateData = await generateRes.json();
    console.log('[TEST] Generate response success:', generateData.success);
    if (generateData.success) {
      console.log('[TEST] Generated Internship:', generateData.data.internship.companyName);
      console.log(`[TEST] Generated Tasks count: ${generateData.data.tasks.length}`);
      console.log('[TEST] Task titles:');
      generateData.data.tasks.forEach(t => console.log(`- ${t.title} (${t.status})`));
    } else {
      console.error('[TEST] Generate failed:', generateData);
    }

  } catch (err) {
    console.error('[TEST] Error during API verification:', err.message);
  }
}

run();
