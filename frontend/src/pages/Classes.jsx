import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  IconButton, 
  Chip, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Breadcrumbs,
  Link
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Group as GroupIcon,
  Quiz as QuizIcon
} from '@mui/icons-material';
import api from '../services/api';
import { useSearchParams, useNavigate } from 'react-router-dom';const Classes = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const schoolYearId = searchParams.get('schoolYear');
  const semesterId = searchParams.get('semester');
  
  const [classes, setClasses] = useState([]);
  const [schoolYear, setSchoolYear] = useState(null);
  const [semester, setSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    courseCode: '',
    courseDescription: '',
    year: '',
    section: ''
  });

  useEffect(() => {
    if (schoolYearId && semesterId) {
      fetchSchoolYearInfo();
    }
  }, [schoolYearId, semesterId]);

  useEffect(() => {
    if (semester) {
      fetchClasses();
    }
  }, [semester]);

  const fetchClasses = async () => {
    try {
      if (!semester) return;
      const response = await api.get(`/classes?schoolYearId=${schoolYearId}&semester=${semester.name}`);
      const classesData = response.data;

      // Fetch quiz count for each class
      const classesWithCounts = await Promise.all(classesData.map(async (cls) => {
        try {
          const quizRes = await api.get(`/quizzes?classId=${cls._id}`);
          return { ...cls, quizCount: quizRes.data.length };
        } catch {
          return { ...cls, quizCount: 0 };
        }
      }));

      setClasses(classesWithCounts);
    } catch (err) {
      setError('Failed to load classes');
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolYearInfo = async () => {
    try {
      const response = await api.get(`/schools/${schoolYearId}`);
      setSchoolYear(response.data);
      const foundSemester = response.data.semesters?.find(s => s._id === semesterId);
      setSemester(foundSemester);
    } catch (err) {
      console.error('Error fetching school year info:', err);
    }
  };

  const handleSubmit = async () => {
    if (!formData.courseCode || !formData.courseDescription || !formData.year || !formData.section) {
      setError('All fields are required');
      return;
    }

    if (!semester) {
      setError('Semester information not loaded');
      return;
    }

    try {
      const classData = { ...formData, schoolYearId, semester: semester.name };

      if (editingClass) {
        await api.put(`/classes/${editingClass._id}`, classData);
      } else {
        await api.post('/classes', classData);
      }

      fetchClasses();
      handleCloseDialog();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save class');
    }
  };

  const handleDelete = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      await api.delete(`/classes/${classId}`);
      fetchClasses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete class');
    }
  };

  const handleRegenerateCode = async (classId) => {
    try {
      const response = await api.patch(`/classes/${classId}/regenerate-code`, {});
      setClasses(classes.map(cls =>
        cls._id === classId ? { ...cls, classCode: response.data.classCode } : cls
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to regenerate class code');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const handleOpenDialog = (classItem = null) => {
    setEditingClass(classItem);
    setFormData({
      courseCode: classItem?.courseCode || '',
      courseDescription: classItem?.courseDescription || '',
      year: classItem?.year || '',
      section: classItem?.section || ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingClass(null);
    setFormData({
      courseCode: '',
      courseDescription: '',
      year: '',
      section: ''
    });
  };

  if (loading) return <Typography>Loading...</Typography>;

  if (!schoolYearId || !semesterId) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning">
          Please select a school year and semester from the School Years page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link 
          color="inherit" 
          href="/school-years"
          onClick={(e) => { e.preventDefault(); navigate('/school-years'); }}
        >
          School Years
        </Link>
        <Typography color="text.primary">
          {schoolYear?.year} - {semester?.name} Semester
        </Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Classes Management
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {schoolYear?.year} Academic Year - {semester?.name} Semester
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Class
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {classes.map((classItem) => (
          <Grid item xs={12} md={6} lg={4} key={classItem._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {classItem.courseCode}
                  </Typography>
                  <Chip 
                    label={`${classItem.year} - ${classItem.section}`} 
                    size="small" 
                    color="primary"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {classItem.courseDescription}
                </Typography>

                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  p: 1, 
                  bgcolor: 'grey.100', 
                  borderRadius: 1,
                  mb: 2
                }}>
                  <Box>
                    <Typography variant="caption" display="block">
                      Class Code
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {classItem.classCode}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => copyToClipboard(classItem.classCode)}
                      title="Copy class code"
                    >
                      <CopyIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleRegenerateCode(classItem._id)}
                      title="Regenerate class code"
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip 
                    icon={<GroupIcon />}
                    label={`${classItem.enrolledStudents?.length || 0} Students`} 
                    size="small" 
                    variant="outlined"
                  />
                  <Chip 
                    icon={<QuizIcon />}
                    label={`${classItem.quizCount ?? 0} Quizzes`}
                    size="small" 
                    variant="outlined"
                  />
                </Box>
              </CardContent>
              
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<GroupIcon />}
                  onClick={() => navigate(`/students?classId=${classItem._id}`)}
                >
                  Students
                </Button>
                <Button 
                  size="small" 
                  startIcon={<QuizIcon />}
                  onClick={() => navigate(`/quizzes?classId=${classItem._id}`)}
                >
                  Quizzes
                </Button>
                <IconButton 
                  size="small" 
                  onClick={() => handleOpenDialog(classItem)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleDelete(classItem._id)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {classes.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Classes Created
          </Typography>
          <Typography color="textSecondary" sx={{ mb: 2 }}>
            Create your first class for this semester. Students will use the class code to enroll.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Create First Class
          </Button>
        </Paper>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingClass ? 'Edit Class' : 'Add New Class'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="Course Code"
                placeholder="e.g., CS101"
                fullWidth
                variant="outlined"
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Course Description"
                placeholder="e.g., Introduction to Computer Science"
                fullWidth
                variant="outlined"
                multiline
                rows={2}
                value={formData.courseDescription}
                onChange={(e) => setFormData({ ...formData, courseDescription: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Year Level</InputLabel>
                <Select
                  value={formData.year}
                  label="Year Level"
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                >
                  <MenuItem value="1st">1st Year</MenuItem>
                  <MenuItem value="2nd">2nd Year</MenuItem>
                  <MenuItem value="3rd">3rd Year</MenuItem>
                  <MenuItem value="4th">4th Year</MenuItem>
                  <MenuItem value="5th">5th Year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Section"
                placeholder="e.g., A"
                fullWidth
                variant="outlined"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingClass ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Classes;