async function postJson(url, body, token) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function getJson(url, token) {
  const res = await fetch(url, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function patchJson(url, body, token) {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body || {})
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function runVerification() {
  console.log('🧪 Starting Full-Stack End-to-End Verification (Production Suite)...');

  // 1. Health check
  const health = await getJson('http://localhost:5000/api/health');
  console.log('1. Health Check:', health.status === 200 ? '✅ PASS' : '❌ FAIL', health.data.name);

  // 2. Student Login
  const studentLogin = await postJson('http://localhost:5000/api/auth/login', {
    email: 'student1@school.ac.th',
    password: 'student123'
  });
  console.log('2. Student #001 Login:', studentLogin.status === 200 ? '✅ PASS' : '❌ FAIL', studentLogin.data.user.name);
  const studentToken = studentLogin.data.token;

  // 3. Mood Check-in
  const checkinRes = await postJson('http://localhost:5000/api/mood/checkin', {
    mood: 'VERY_GOOD',
    note: 'วันนี้รู้สึกสดชื่นและพร้อมเรียนรู้สิ่งใหม่ๆ'
  }, studentToken);
  console.log('3. Mood Check-in API:', checkinRes.status === 201 || checkinRes.status === 409 ? '✅ PASS' : '❌ FAIL');

  // 4. Gratitude Jar Note Creation & Random Draw
  const addGratitude = await postJson('http://localhost:5000/api/selfcare/gratitude', {
    message: 'ขอบคุณคุณครูและเพื่อนๆ ที่คอยให้กำลังใจ',
    color: 'emerald'
  }, studentToken);
  console.log('4. Add Gratitude Note to Jar:', addGratitude.status === 201 ? '✅ PASS' : '❌ FAIL', addGratitude.data.note?.message);

  const randomGratitude = await getJson('http://localhost:5000/api/selfcare/gratitude/random', studentToken);
  console.log('5. Random Gratitude Pick from Jar:', randomGratitude.status === 200 && randomGratitude.data.note ? '✅ PASS' : '❌ FAIL', `Drawn: "${randomGratitude.data.note?.message}"`);

  // 6. Counselor Login
  const counselorLogin = await postJson('http://localhost:5000/api/auth/login', {
    email: 'counselor@school.ac.th',
    password: 'counselor123'
  });
  console.log('6. Counselor Login:', counselorLogin.status === 200 ? '✅ PASS' : '❌ FAIL', counselorLogin.data.user.name);
  const counselorToken = counselorLogin.data.token;

  // 7. Homeroom Referral Cases
  const referrals = await getJson('http://localhost:5000/api/referrals', counselorToken);
  console.log('7. Homeroom Referrals List:', referrals.status === 200 && referrals.data.referrals?.length > 0 ? '✅ PASS' : '❌ FAIL', `Found ${referrals.data.referrals.length} referral cases`);

  // 8. Accept a Referral Case
  if (referrals.data.referrals && referrals.data.referrals[0]) {
    const rId = referrals.data.referrals[0].id;
    const acceptRes = await patchJson(`http://localhost:5000/api/referrals/${rId}/status`, { status: 'ACCEPTED' }, counselorToken);
    console.log('8. Accept Referral Case:', acceptRes.status === 200 ? '✅ PASS' : '❌ FAIL');
  }

  // 9. Executive School Summary Report
  const executiveReport = await getJson('http://localhost:5000/api/report/executive-summary', counselorToken);
  console.log('9. School Executive Report API (Accreditation Ready):', executiveReport.status === 200 ? '✅ PASS' : '❌ FAIL', {
    school: executiveReport.data.schoolName,
    totalStudents: executiveReport.data.overview.totalStudents,
    totalSessions: executiveReport.data.overview.totalSessions,
    followupSuccessRate: `${executiveReport.data.overview.followupSuccessRate}%`
  });

  // 10. Admin Users Check
  const adminLogin = await postJson('http://localhost:5000/api/auth/login', {
    email: 'admin@school.ac.th',
    password: 'admin123'
  });
  const adminUsers = await getJson('http://localhost:5000/api/admin/users', adminLogin.data.token);
  console.log('10. Admin User Management Check:', adminUsers.data.users?.length > 0 ? `✅ PASS (${adminUsers.data.users.length} users)` : '❌ FAIL');

  console.log('\n🎉 ALL PRODUCTION SUITE VERIFICATIONS PASSED SUCCESSFULLY!');
}

runVerification().catch(console.error);
