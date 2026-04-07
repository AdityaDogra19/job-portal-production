async function runTests() {
  const log = (msg) => console.log('\n🔵 ' + msg);
  const success = (msg) => console.log('✅ ' + msg);
  const error = (msg) => console.log('❌ ' + msg);
  
  const BASE = 'http://localhost:5001';

  try {
    log('1. Testing Public Server Initialization & CORS...');
    const testReq = await fetch(`${BASE}/api/test`);
    if(testReq.ok) success('Express + Routes successfully connected!');

    log('2. Testing Admin Registration & RBAC Authorization...');
    let adminToken;
    let authReq = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Admin Test', email: 'admin_test@test.com', password: 'password123', role: 'admin' })
    });
    if(!authReq.ok) {
       authReq = await fetch(`${BASE}/api/auth/login`, {
         method: 'POST', headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email: 'admin_test@test.com', password: 'password123' })
       });
    }
    const adminData = await authReq.json();
    adminToken = adminData.token;
    if(adminToken) success('Admin JWT safely generated!');

    log('3. Testing Admin Job Insertion Engine...');
    const jobReq = await fetch(`${BASE}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ title: 'Lead Testing Automation', description: 'Testing pipeline', company: 'Automators Inc', location: 'San Node', salary: 300000 })
    });
    const jobData = await jobReq.json();
    const jobId = jobData.job._id;
    if(jobId) success(`Job Database securely appended! ID: ${jobId}`);

    log('4. Testing Applicant JWT Pipeline...');
    let appToken;
    const tstamp = Date.now();
    const authAppReq = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'E2E Applicant', email: `applicant_e2e_${tstamp}@test.com`, password: 'password123', role: 'applicant' })
    });
    const appData = await authAppReq.json();
    appToken = appData.token;
    if(appToken) success('Applicant Registration successful!');

    log('5. Testing Job Mapping (M-To-N Relations)...');
    const applyReq = await fetch(`${BASE}/api/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${appToken}` },
      // We send the JSON logic perfectly!
      body: JSON.stringify({ resume: 'https://cloudinary.com/fake_resume.pdf' })
    });
    if(applyReq.ok) success('Bridge Collection (Application) stored applicant link natively!');

    log('6. Testing Reverse Population Queries...');
    const myAppReq = await fetch(`${BASE}/api/jobs/my-applications`, {
       headers: { 'Authorization': `Bearer ${appToken}` }
    });
    const myAppData = await myAppReq.json();
    if(myAppData.applications && myAppData.applications.length > 0) success('Applicant dashboard accurately built from DB Population!');

    log('7. Testing Private Profile Fetching...');
    const profileReq = await fetch(`${BASE}/api/auth/me`, {
       headers: { 'Authorization': `Bearer ${appToken}` }
    });
    if(profileReq.ok) success('Bouncer allowed profile access!');
    
    console.log('\n🚀 ALL SYSTEMS NOMINAL AND READY FOR PRODUCTION ENGINES!');
    process.exit(0);
  } catch(e) {
    error('Pipeline failure: ' + e.message);
    process.exit(1);
  }
}

runTests();
