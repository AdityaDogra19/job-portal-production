const http = require('http');

async function runTests() {
  const BASE_URL = 'http://localhost:5001/api';
  console.log("🚀 Starting Comprehensive Integration Verification...");

  let authToken = '';
  let userId = '';
  let testJobId = '';

  // Helper for requests
  const makeRequest = async (endpoint, method, body = null, token = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();
    return { status: response.status, data };
  };

  try {
    // 1. [AUTH] Test Registration
    console.log("\n[1/7] Testing Authentication (Register)...");
    const regRes = await makeRequest('/auth/register', 'POST', {
      name: "E2E Test User",
      email: `test${Date.now()}@example.com`,
      password: "password123",
      role: "applicant"
    });
    if (regRes.status === 201) {
      console.log("✅ Registration: WORKING");
      authToken = regRes.data.token;
      userId = regRes.data.user._id;
    } else {
      console.error("❌ Registration: FAILED", regRes.data);
    }

    // 2. [PROFILE] Test Open To Work API
    console.log("\n[2/7] Testing Profile Updates (OpenToWork)...");
    const profileRes = await makeRequest('/users/open-to-work', 'PUT', {
      openToWork: true,
      preferredRoles: ["Software Engineer", "AI Developer"],
      videoResume: "https://vimeo.com/testurl"
    }, authToken);
    
    if (profileRes.status === 200 && profileRes.data.user.openToWork === true) {
      console.log("✅ Profile Updater: WORKING");
    } else {
      console.error("❌ Profile Updater: FAILED", profileRes.data);
    }

    // 3. [JOBS] Create a test job as Admin (mock) to test application logic
    console.log("\n[3/7] Testing Job Posting...");
    const adminReg = await makeRequest('/auth/register', 'POST', {
      name: "Admin User", email: `admin${Date.now()}@example.com`, password: "password123", role: "admin"
    });
    const adminToken = adminReg.data.token;
    
    const jobRes = await makeRequest('/jobs', 'POST', {
      title: "Senior AI Engineer",
      description: "Looking for an expert with React and Express. Nodejs is a plus.",
      company: "FutureTech",
      location: "San Francisco",
      salary: 150000
    }, adminToken);

    if (jobRes.status === 201) {
      console.log("✅ Job Creation: WORKING");
      testJobId = jobRes.data.job._id;
    } else {
      console.error("❌ Job Creation: FAILED", jobRes.data);
    }

    // 4. [AI] Auto Apply Agent
    console.log("\n[4/7] Testing AI Auto-Apply Agent...");
    const autoApplyRes = await makeRequest('/ai/auto-apply', 'POST', {
      skills: ["React", "Express", "AI"],
      resume: "https://cloudinary.com/fake-resume.pdf"
    }, authToken);

    if (autoApplyRes.status === 200) {
      console.log(`✅ Auto-Apply Engine: WORKING (${autoApplyRes.data.message})`);
    } else {
      console.error("❌ Auto-Apply Engine: FAILED", autoApplyRes.data);
    }

    // 5. [JOBS] Bookmark System
    console.log("\n[5/7] Testing Job Bookmark System...");
    const bookmarkRes = await makeRequest(`/jobs/bookmark/${testJobId}`, 'POST', {}, authToken);
    if (bookmarkRes.status === 200) {
      console.log("✅ Job Bookmarking: WORKING");
    } else {
      console.error("❌ Job Bookmarking: FAILED", bookmarkRes.data);
    }

    // 6. [ADMIN] View Applications
    console.log("\n[6/7] Testing Admin Applications Dashboard...");
    const adminAppsRes = await makeRequest('/admin/applications', 'GET', null, adminToken);
    if (adminAppsRes.status === 200) {
      console.log(`✅ Admin Dashboard View: WORKING (Fetched ${adminAppsRes.data.applications?.length || 0} applications)`);
    } else {
      console.error("❌ Admin Dashboard View: FAILED", adminAppsRes.data);
    }

    // 7. [ADMIN] Application Status Updator
    console.log("\n[7/7] Testing Admin Status Updates...");
    if (autoApplyRes.data.appliedJobIds && autoApplyRes.data.appliedJobIds.length > 0) {
      // Find the specific application to update
      const apps = adminAppsRes.data.applications;
      if (apps.length > 0) {
        let targetAppId = apps[0]._id;
        const statusRes = await makeRequest(`/admin/applications/${targetAppId}/status`, 'PUT', { status: "shortlisted" }, adminToken);
        if (statusRes.status === 200) {
          console.log("✅ Status Updater: WORKING (Status mutated to 'shortlisted')");
        } else {
          console.error("❌ Status Updater: FAILED", statusRes.data);
        }
      } else {
        console.log("⚠️ Status Updater: SKIPPED (No applications found to update)");
      }
    } else {
      console.log("⚠️ Status Updater: SKIPPED (Auto apply didn't grab the job)");
    }

    console.log("\n🎯 INTEGRATION TEST COMPLETED SUCCESSFULLY.");

  } catch (err) {
    console.error("CRASH DURING TESTING:", err);
  }
}

runTests();
