const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testClassCreation() {
  try {
    console.log('🧪 Testing Class Creation...\n');

    // Step 1: Login as teacher
    console.log('1. Logging in as teacher...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'teacher@test.com',
      password: 'teacher123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Get school years
    console.log('\n2. Fetching school years...');
    const schoolYearsResponse = await axios.get(`${API_BASE}/schools`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (schoolYearsResponse.data.length === 0) {
      console.log('❌ No school years found. Creating one...');
      
      // Create a school year
      const newSchoolYear = await axios.post(`${API_BASE}/schools`, {
        year: '2025-2026'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ School year created:', newSchoolYear.data.year);
      
      // Add a semester
      const semesterResponse = await axios.post(`${API_BASE}/schools/${newSchoolYear.data._id}/semesters`, {
        name: 'First'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Semester added:', semesterResponse.data.semesters[0].name);
      
      // Use the created school year
      const schoolYear = newSchoolYear.data;
      const semester = semesterResponse.data.semesters[0];
      
      // Step 3: Create a class
      console.log('\n3. Creating a class...');
      const classData = {
        schoolYearId: schoolYear._id,
        semester: semester.name,
        courseCode: 'CS101',
        courseDescription: 'Introduction to Computer Science',
        year: '1st',
        section: 'A'
      };
      
      const classResponse = await axios.post(`${API_BASE}/classes`, classData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Class created successfully!');
      console.log('Class Code:', classResponse.data.classCode);
      console.log('Course:', classResponse.data.courseCode, '-', classResponse.data.courseDescription);
      
    } else {
      const schoolYear = schoolYearsResponse.data[0];
      console.log('✅ Found school year:', schoolYear.year);
      
      if (schoolYear.semesters && schoolYear.semesters.length > 0) {
        const semester = schoolYear.semesters[0];
        console.log('✅ Found semester:', semester.name);
        
        // Step 3: Create a class
        console.log('\n3. Creating a class...');
        const classData = {
          schoolYearId: schoolYear._id,
          semester: semester.name,
          courseCode: 'CS101',
          courseDescription: 'Introduction to Computer Science',
          year: '1st',
          section: 'A'
        };
        
        const classResponse = await axios.post(`${API_BASE}/classes`, classData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Class created successfully!');
        console.log('Class Code:', classResponse.data.classCode);
        console.log('Course:', classResponse.data.courseCode, '-', classResponse.data.courseDescription);
      } else {
        console.log('❌ No semesters found in school year');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
  }
}

testClassCreation();