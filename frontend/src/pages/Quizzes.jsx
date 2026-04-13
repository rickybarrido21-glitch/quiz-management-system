import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  IconButton, 
  Chip, 
  Alert,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  Link
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Quiz as QuizIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import api from '../services/api';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Quizzes = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const classId = searchParams.get('classId');
  
  const [classInfo, setClassInfo] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, quizId: null });

  useEffect(() => {
    if (classId) {
      fetchClassInfo();
      fetchQuizzes();
    }
  }, [classId]);

  const fetchClassInfo = async () => {
    try {
      const response = await api.get(`/classes/${classId}`);
      setClassInfo(response.data);
    } catch (err) {
      setError('Failed to load class information');
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await api.get(`/quizzes?classId=${classId}`);
      setQuizzes(response.data);
    } catch (err) {
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleQuizStatus = async (quizId, currentStatus) => {
    try {
      await api.patch(`/quizzes/${quizId}`, { isActive: !currentStatus });
      fetchQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quiz status');
    }
  };

  const handleDeleteQuiz = async () => {
    try {
      await api.delete(`/quizzes/${deleteDialog.quizId}`);
      fetchQuizzes();
      setDeleteDialog({ open: false, quizId: null });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete quiz');
    }
  };

  const openDeleteDialog = (quizId) => {
    setDeleteDialog({ open: true, quizId });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, quizId: null });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  const getQuizStatus = (quiz) => {
    const now = new Date();
    const availableFrom = quiz.availableFrom ? new Date(quiz.availableFrom) : null;
    const availableUntil = quiz.availableUntil ? new Date(quiz.availableUntil) : null;

    if (!quiz.isActive) return { status: 'Inactive', color: 'default' };
    if (availableFrom && now < availableFrom) return { status: 'Scheduled', color: 'info' };
    if (availableUntil && now > availableUntil) return { status: 'Expired', color: 'error' };
    return { status: 'Active', color: 'success' };
  };

  if (loading) return <Typography>Loading...</Typography>;

  if (!classId) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning">
          Please select a class from the Classes page to manage quizzes.
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
        <Link 
          color="inherit" 
          href="/classes"
          onClick={(e) => { e.preventDefault(); navigate('/classes'); }}
        >
          Classes
        </Link>
        <Typography color="text.primary">
          {classInfo?.courseCode} - Quizzes
        </Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Quiz Management
          </Typography>
          {classInfo && (
            <Box>
              <Typography variant="h6" color="primary">
                {classInfo.courseCode} - {classInfo.courseDescription}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {classInfo.year} Year, Section {classInfo.section} | Class Code: {classInfo.classCode}
              </Typography>
            </Box>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(`/quizzes/new?classId=${classId}`)}
        >
          Create Quiz
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {quizzes.map((quiz) => {
          const status = getQuizStatus(quiz);
          return (
            <Grid item xs={12} md={6} lg={4} key={quiz._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      {quiz.title}
                    </Typography>
                    <Chip 
                      label={status.status} 
                      size="small" 
                      color={status.color}
                    />
                  </Box>
                  
                  {quiz.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {quiz.description}
                    </Typography>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <QuizIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="body2">
                        {quiz.questions?.length || 0} Questions
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ScheduleIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="body2">
                        {quiz.timeLimit} minutes
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PeopleIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="body2">
                        0 Submissions
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" display="block" color="textSecondary">
                      Available: {formatDate(quiz.availableFrom)}
                    </Typography>
                    <Typography variant="caption" display="block" color="textSecondary">
                      Until: {formatDate(quiz.availableUntil)}
                    </Typography>
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={quiz.isActive}
                        onChange={() => handleToggleQuizStatus(quiz._id, quiz.isActive)}
                        size="small"
                      />
                    }
                    label={quiz.isActive ? "Active" : "Inactive"}
                  />
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/quizzes/${quiz._id}/edit?classId=${classId}`)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<AssessmentIcon />}
                    onClick={() => navigate(`/results?quizId=${quiz._id}`)}
                  >
                    Results
                  </Button>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => openDeleteDialog(quiz._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {quizzes.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <QuizIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Quizzes Created
          </Typography>
          <Typography color="textSecondary" sx={{ mb: 2 }}>
            Create your first quiz for this class. Students will be able to take quizzes once they're activated.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/quizzes/new?classId=${classId}`)}
          >
            Create First Quiz
          </Button>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={closeDeleteDialog}>
        <DialogTitle>Delete Quiz</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this quiz? This action cannot be undone.
            All quiz submissions will also be deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteQuiz} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Quizzes;