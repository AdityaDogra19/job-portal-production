const fs = require('fs');

(async () => {
  // 1. Create a dummy PDF file locally
  fs.writeFileSync('test_resume.pdf', '%PDF-1.4 Fake PDF Data');

  let token;
  // 2. Try to register Applicant
  const regReq = await fetch('http://localhost:5001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Aditya Applicant', email: 'aditya_app@test.com', password: 'password123', role: 'applicant' })
  });
  const regData = await regReq.json();
  
  if (regData.token) {
     token = regData.token;
  } else {
     const logReq = await fetch('http://localhost:5001/api/auth/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email: 'aditya_app@test.com', password: 'password123' })
     });
     const logData = await logReq.json();
     token = logData.token;
  }
  
  // 3. Get the first available Job ID from our database
  const jobsReq = await fetch('http://localhost:5001/api/jobs');
  const jobsData = await jobsReq.json();
  if (!jobsData.jobs || jobsData.jobs.length === 0) {
      console.log('No jobs exist to apply to!');
      return;
  }
  const jobId = jobsData.jobs[0]._id;

  // 4. Fire the Multer File Upload Request Using Form-Data!
  const FormData = require('form-data');
  const form = new FormData();
  form.append('resume', fs.createReadStream('test_resume.pdf'));

  const applyReq = await fetch('http://localhost:5001/api/jobs/' + jobId + '/apply', {
    method: 'POST',
    headers: { 
      'Authorization': 'Bearer ' + token,
       ...form.getHeaders()
    },
    body: form
  });
  
  const result = await applyReq.json();
  console.log(JSON.stringify(result, null, 2));
  
  // 5. Cleanup the fake dummy file
  try { fs.unlinkSync('test_resume.pdf'); } catch(e){}
})();
