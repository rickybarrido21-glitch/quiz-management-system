import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Class as ClassIcon
} from '@mui/icons-material';
import api from '../services/api';

const SchoolYears = () => {
  const navigate = useNavigate();
  const [schoolYears, setSchoolYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [formData, setFormData] = useState({ year: '' });
  const [expandedYear, setExpandedYear] = useState(null);

  // Load school years on component mount
  useEffect(() => {
    fetchSchoolYears();
  }, []);

  const fetchSchoolYears = async () => {
    try {
      const response = await api.get('/schools');
      const years = response.data;

      // For each semester, fetch class count
      const yearsWithCounts = await Promise.all(years.map(async (year) => {
        const semestersWithCounts = await Promise.all((year.semesters || []).map(async (semester) => {
          try {
            const classRes = await api.get(`/classes?schoolYearId=${year._id}&semester=${semester.name}`);
            return { ...semester, classCount: classRes.data.length };
          } catch {
            return { ...semester, classCount: 0 };
          }
        }));
        return { ...year, semesters: semestersWithCounts };
      }));

      setSchoolYears(yearsWithCounts);
    } catch (err) {
      setError('Failed to load school years');
      console.error('Error fetching school years:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateAcademicYear = (year) => {
    const pattern = /^\d{4}-\d{4}$/;
    if (!pattern.test(year)) return false;
    
    const [startYear, endYear] = year.split('-').map(Number);
    return endYear === startYear + 1;
  };

  const handleSubmit = async () => {
    if (!validateAcademicYear(formData.year)) {
      setError('Academic year must be in format YYYY-YYYY (e.g., 2025-2026)');
      return;
    }

    try {
      if (editingYear) {
        await api.put(`/schools/${editingYear._id}`, formData);
      } else {
        await api.post('/schools', formData);
      }
      fetchSchoolYears();
      handleCloseDialog();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save school year');
    }
  };

  const handleDelete = async (yearId) => {
    if (!window.confirm('Are you sure you want to delete this school year?')) return;
    try {
      await api.delete(`/schools/${yearId}`);
      fetchSchoolYears();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete school year');
    }
  };

  const handleOpenDialog = (year = null) => {
    setEditingYear(year);
    setFormData({ year: year?.year || '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingYear(null);
    setFormData({ year: '' });
  };

  const handleAddSemester = async (schoolYearId, semesterType) => {
    try {
      await api.post(`/schools/${schoolYearId}/semesters`, { name: semesterType });
      fetchSchoolYears();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add semester');
    }
  };

  const handleDeleteSemester = async (schoolYearId, semesterId) => {
    if (!window.confirm('Are you sure you want to delete this semester?')) return;
    try {
      await api.delete(`/schools/${schoolYearId}/semesters/${semesterId}`);
      fetchSchoolYears();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete semester');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom>
          School Years Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add School Year
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {schoolYears.map((year) => (
          <Grid item xs={12} key={year._id}>
            <Accordion 
              expanded={expandedYear === year._id}
              onChange={() => setExpandedYear(expandedYear === year._id ? null : year._id)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <SchoolIcon sx={{ mr: 2 }} />
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Academic Year {year.year}
                  </Typography>
                  <Chip 
                    label={`${year.semesters?.length || 0} Semesters`} 
                    size="small" 
                    sx={{ mr: 2 }}
                  />
                  <IconButton 
                    size="small" 
                    onClick={(e) => { e.stopPropagation(); handleOpenDialog(year); }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={(e) => { e.stopPropagation(); handleDelete(year._id); }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Semesters
                  </Typography>
                  
                  <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                    {['First', 'Second', 'Summer'].map((semesterType) => {
                      const exists = year.semesters?.some(s => s.name === semesterType);
                      return (
                        <Button
                          key={semesterType}
                          variant={exists ? "outlined" : "contained"}
                          size="small"
                          disabled={exists}
                          onClick={() => handleAddSemester(year._id, semesterType)}
                        >
                          {exists ? `${semesterType} ✓` : `Add ${semesterType}`}
                        </Button>
                      );
                    })}
                  </Box>

                  {year.semesters && year.semesters.length > 0 ? (
                    <List>
                      {year.semesters.map((semester) => (
                        <ListItem key={semester._id}>
                          <ClassIcon sx={{ mr: 2 }} />
                          <ListItemText 
                            primary={`${semester.name} Semester`}
                            secondary={`${semester.classCount ?? semester.classes?.length ?? 0} classes`}
                          />
                          <ListItemSecondaryAction>
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{ mr: 1 }}
                              onClick={() => navigate(`/classes?schoolYear=${year._id}&semester=${semester._id}`)}
                            >
                              Manage Classes
                            </Button>
                            <IconButton 
                              edge="end" 
                              onClick={() => handleDeleteSemester(year._id, semester._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="textSecondary">
                      No semesters created yet. Add semesters to organize your classes.
                    </Typography>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>

      {schoolYears.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No School Years Created
          </Typography>
          <Typography color="textSecondary" sx={{ mb: 2 }}>
            Create your first academic year to start organizing your classes and quizzes.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Create First School Year
          </Button>
        </Paper>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingYear ? 'Edit School Year' : 'Add New School Year'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Academic Year"
            placeholder="e.g., 2025-2026"
            fullWidth
            variant="outlined"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            helperText="Format: YYYY-YYYY (e.g., 2025-2026)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingYear ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SchoolYears;