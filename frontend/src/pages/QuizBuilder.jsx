import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  TextField, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  IconButton, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Breadcrumbs,
  Link,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  RadioGroup,
  Radio,
  FormHelperText,
  Snackbar
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  DragIndicator as DragIcon,
  Quiz as QuizIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  Settings as SettingsIcon,
  QuestionAnswer as QuestionIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const QuizBuilder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { id: quizId } = useParams();
  const classId = searchParams.get('classId');
  
  // Multi-step form state
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Quiz Settings', 'Add Questions', 'Preview & Save'];
  
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  // Quiz state
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    timeLimit: 60,
    randomizeQuestions: false,
    availableFrom: '',
    availableUntil: '',
    questions: []
  });

  // Question form state
  const [newQuestion, setNewQuestion] = useState({
    type: 'multiple_choice',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1
  });

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewQuestionIndex, setPreviewQuestionIndex] = useState(0);

  useEffect(() => {
    if (classId) {
      fetchClassInfo();
    }
    if (quizId) {
      fetchQuiz();
    }
  }, [classId, quizId]);

  const fetchClassInfo = async () => {
    try {
      const response = await api.get(`/classes/${classId}`);
      setClassInfo(response.data);
    } catch (err) {
      setError('Failed to load class information');
    }
  };

  const fetchQuiz = async () => {
    try {
      const response = await api.get(`/quizzes/${quizId}`);
      const quizData = response.data;
      
      // Format dates for datetime-local input
      if (quizData.availableFrom) {
        quizData.availableFrom = new Date(quizData.availableFrom).toISOString().slice(0, 16);
      }
      if (quizData.availableUntil) {
        quizData.availableUntil = new Date(quizData.availableUntil).toISOString().slice(0, 16);
      }
      
      setQuiz(quizData);
      
      // Set appropriate step based on quiz state
      if (quizData.questions && quizData.questions.length > 0) {
        setActiveStep(2); // Go to preview step if questions exist
      } else if (quizData.title) {
        setActiveStep(1); // Go to questions step if basic info exists
      }
    } catch (err) {
      setError('Failed to load quiz');
    }
  };

  // Validation functions
  const validateQuizSettings = () => {
    const errors = {};
    
    if (!quiz.title.trim()) {
      errors.title = 'Quiz title is required';
    }
    
    if (quiz.timeLimit < 1) {
      errors.timeLimit = 'Time limit must be at least 1 minute';
    }
    
    if (quiz.availableFrom && quiz.availableUntil) {
      const fromDate = new Date(quiz.availableFrom);
      const untilDate = new Date(quiz.availableUntil);
      if (fromDate >= untilDate) {
        errors.availableUntil = 'End date must be after start date';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateQuestion = () => {
    if (!newQuestion.question.trim()) {
      setError('Question text is required');
      return false;
    }

    if (newQuestion.type === 'multiple_choice') {
      if (newQuestion.options.some(opt => !opt.trim())) {
        setError('All options must be filled for multiple choice questions');
        return false;
      }
      if (!newQuestion.correctAnswer) {
        setError('Please select the correct answer');
        return false;
      }
    }

    if (newQuestion.type === 'true_false' && !newQuestion.correctAnswer) {
      setError('Please select the correct answer');
      return false;
    }

    if (newQuestion.points < 1) {
      setError('Points must be at least 1');
      return false;
    }

    return true;
  };

  // Step navigation
  const handleNext = () => {
    if (activeStep === 0 && !validateQuizSettings()) {
      return;
    }
    
    if (activeStep === 1 && quiz.questions.length === 0) {
      setError('Please add at least one question before proceeding');
      return;
    }
    
    setActiveStep((prevStep) => prevStep + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleQuizChange = (field, value) => {
    setQuiz(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleQuestionChange = (field, value) => {
    setNewQuestion(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion(prev => ({ ...prev, options: updatedOptions }));
  };

  const addQuestion = () => {
    if (!validateQuestion()) {
      return;
    }

    const questionToAdd = { ...newQuestion, id: Date.now() };
    
    if (editingQuestionIndex !== null) {
      const updatedQuestions = [...quiz.questions];
      updatedQuestions[editingQuestionIndex] = questionToAdd;
      setQuiz(prev => ({ ...prev, questions: updatedQuestions }));
      setEditingQuestionIndex(null);
      setSuccess('Question updated successfully');
    } else {
      setQuiz(prev => ({ ...prev, questions: [...prev.questions, questionToAdd] }));
      setSuccess('Question added successfully');
    }

    resetQuestionForm();
    setShowQuestionForm(false);
    setError('');
  };

  const editQuestion = (index) => {
    setNewQuestion(quiz.questions[index]);
    setEditingQuestionIndex(index);
    setShowQuestionForm(true);
  };

  const deleteQuestion = (index) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const updatedQuestions = quiz.questions.filter((_, i) => i !== index);
      setQuiz(prev => ({ ...prev, questions: updatedQuestions }));
    }
  };

  const resetQuestionForm = () => {
    setNewQuestion({
      type: 'multiple_choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1
    });
  };

  const saveQuiz = async () => {
    if (!validateQuizSettings()) {
      setActiveStep(0);
      return;
    }

    if (quiz.questions.length === 0) {
      setError('Quiz must have at least one question');
      setActiveStep(1);
      return;
    }

    setLoading(true);
    try {
      // Clean questions — remove local 'id' field, keep only backend fields
      const cleanedQuestions = quiz.questions.map(({ id, ...q }) => ({
        type: q.type,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer || '',
        points: q.points || 1
      }));

      const quizData = {
        title: quiz.title,
        description: quiz.description,
        classId,
        timeLimit: quiz.timeLimit,
        randomizeQuestions: quiz.randomizeQuestions,
        availableFrom: quiz.availableFrom || null,
        availableUntil: quiz.availableUntil || null,
        questions: cleanedQuestions
      };

      if (quizId) {
        await api.put(`/quizzes/${quizId}`, quizData);
        setSuccess('Quiz updated successfully');
      } else {
        await api.post('/quizzes', quizData);
        setSuccess('Quiz created successfully');
      }

      setTimeout(() => {
        navigate(`/quizzes?classId=${classId}`);
      }, 1500);
    } catch (err) {
      console.error('Save quiz error:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  // Preview functionality
  const openPreview = () => {
    if (quiz.questions.length === 0) {
      setError('No questions to preview');
      return;
    }
    setPreviewQuestionIndex(0);
    setPreviewOpen(true);
  };

  const nextPreviewQuestion = () => {
    if (previewQuestionIndex < quiz.questions.length - 1) {
      setPreviewQuestionIndex(prev => prev + 1);
    }
  };

  const prevPreviewQuestion = () => {
    if (previewQuestionIndex > 0) {
      setPreviewQuestionIndex(prev => prev - 1);
    }
  };

  const renderPreviewDialog = () => {
    if (quiz.questions.length === 0) return null;
    
    const question = quiz.questions[previewQuestionIndex];
    
    return (
      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Quiz Preview</Typography>
            <Typography variant="body2" color="textSecondary">
              Question {previewQuestionIndex + 1} of {quiz.questions.length}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {previewQuestionIndex + 1}. {question.question}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Points: {question.points} | Type: {question.type.replace('_', ' ')}
            </Typography>
          </Box>

          {question.type === 'multiple_choice' && (
            <FormControl component="fieldset">
              <RadioGroup>
                {question.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio />}
                    label={`${String.fromCharCode(65 + index)}. ${option}`}
                    sx={{
                      color: option === question.correctAnswer ? 'success.main' : 'inherit',
                      fontWeight: option === question.correctAnswer ? 'bold' : 'normal'
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {question.type === 'true_false' && (
            <FormControl component="fieldset">
              <RadioGroup>
                <FormControlLabel
                  value="true"
                  control={<Radio />}
                  label="True"
                  sx={{
                    color: question.correctAnswer === 'true' ? 'success.main' : 'inherit',
                    fontWeight: question.correctAnswer === 'true' ? 'bold' : 'normal'
                  }}
                />
                <FormControlLabel
                  value="false"
                  control={<Radio />}
                  label="False"
                  sx={{
                    color: question.correctAnswer === 'false' ? 'success.main' : 'inherit',
                    fontWeight: question.correctAnswer === 'false' ? 'bold' : 'normal'
                  }}
                />
              </RadioGroup>
            </FormControl>
          )}

          {(question.type === 'short_answer' || question.type === 'essay') && (
            <Box>
              <TextField
                fullWidth
                multiline={question.type === 'essay'}
                rows={question.type === 'essay' ? 4 : 1}
                placeholder={`Enter your ${question.type === 'essay' ? 'essay' : 'answer'} here...`}
                disabled
                sx={{ mb: 2 }}
              />
              {question.correctAnswer && (
                <Box>
                  <Typography variant="subtitle2" color="success.main">
                    Sample Answer:
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    {question.correctAnswer}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={prevPreviewQuestion} 
            disabled={previewQuestionIndex === 0}
            startIcon={<BackIcon />}
          >
            Previous
          </Button>
          <Button 
            onClick={nextPreviewQuestion} 
            disabled={previewQuestionIndex === quiz.questions.length - 1}
            endIcon={<NextIcon />}
          >
            Next
          </Button>
          <Button onClick={() => setPreviewOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderQuizSettings = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <SettingsIcon sx={{ mr: 1 }} />
        Quiz Settings
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Quiz Title"
            value={quiz.title}
            onChange={(e) => handleQuizChange('title', e.target.value)}
            placeholder="Enter quiz title..."
            error={!!validationErrors.title}
            helperText={validationErrors.title}
            required
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Time Limit (minutes)"
            type="number"
            value={quiz.timeLimit}
            onChange={(e) => handleQuizChange('timeLimit', parseInt(e.target.value) || 60)}
            inputProps={{ min: 1 }}
            error={!!validationErrors.timeLimit}
            helperText={validationErrors.timeLimit}
            required
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={quiz.description}
            onChange={(e) => handleQuizChange('description', e.target.value)}
            placeholder="Enter quiz description (optional)..."
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Available From"
            type="datetime-local"
            value={quiz.availableFrom}
            onChange={(e) => handleQuizChange('availableFrom', e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText="Leave empty for immediate availability"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Available Until"
            type="datetime-local"
            value={quiz.availableUntil}
            onChange={(e) => handleQuizChange('availableUntil', e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={!!validationErrors.availableUntil}
            helperText={validationErrors.availableUntil || "Leave empty for no end date"}
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={quiz.randomizeQuestions}
                onChange={(e) => handleQuizChange('randomizeQuestions', e.target.checked)}
              />
            }
            label="Randomize Question Order"
          />
          <FormHelperText>
            When enabled, questions will appear in random order for each student
          </FormHelperText>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderQuestionsStep = () => (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <QuestionIcon sx={{ mr: 1 }} />
          Questions ({quiz.questions.length})
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={openPreview}
            disabled={quiz.questions.length === 0}
            sx={{ mr: 1 }}
          >
            Preview
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowQuestionForm(true)}
          >
            Add Question
          </Button>
        </Box>
      </Box>

      {showQuestionForm && renderQuestionForm()}

      {quiz.questions.map((question, index) => (
        <Accordion key={question.id || index} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <DragIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography sx={{ flexGrow: 1 }}>
                {index + 1}. {question.question}
              </Typography>
              <Chip 
                label={question.type.replace('_', ' ')} 
                size="small" 
                sx={{ mr: 1 }}
              />
              <Chip 
                label={`${question.points} pts`} 
                size="small" 
                color="primary"
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {question.type === 'multiple_choice' && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Options:</Typography>
                  {question.options.map((option, optIndex) => (
                    <Typography 
                      key={optIndex} 
                      variant="body2" 
                      sx={{ 
                        ml: 2, 
                        color: option === question.correctAnswer ? 'success.main' : 'text.primary',
                        fontWeight: option === question.correctAnswer ? 'bold' : 'normal'
                      }}
                    >
                      {String.fromCharCode(65 + optIndex)}. {option}
                      {option === question.correctAnswer && ' ✓'}
                    </Typography>
                  ))}
                </Box>
              )}
              
              {question.type === 'true_false' && (
                <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                  Correct Answer: {question.correctAnswer}
                </Typography>
              )}
              
              {(question.type === 'short_answer' || question.type === 'essay') && question.correctAnswer && (
                <Box>
                  <Typography variant="subtitle2">Sample Answer:</Typography>
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {question.correctAnswer}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button size="small" onClick={() => editQuestion(index)}>
                  Edit
                </Button>
                <Button size="small" color="error" onClick={() => deleteQuestion(index)}>
                  Delete
                </Button>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      {quiz.questions.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <QuizIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Questions Added
          </Typography>
          <Typography color="textSecondary" sx={{ mb: 2 }}>
            Start building your quiz by adding questions.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowQuestionForm(true)}
          >
            Add First Question
          </Button>
        </Box>
      )}
    </Paper>
  );

  const renderPreviewStep = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <ViewIcon sx={{ mr: 1 }} />
        Quiz Preview & Summary
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>{quiz.title}</Typography>
              {quiz.description && (
                <Typography variant="body1" color="textSecondary" paragraph>
                  {quiz.description}
                </Typography>
              )}
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Time Limit:</strong> {quiz.timeLimit} minutes
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Questions:</strong> {quiz.questions.length}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Total Points:</strong> {quiz.questions.reduce((sum, q) => sum + q.points, 0)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Randomized:</strong> {quiz.randomizeQuestions ? 'Yes' : 'No'}
                  </Typography>
                </Grid>
                {quiz.availableFrom && (
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Available:</strong> {new Date(quiz.availableFrom).toLocaleString()} 
                      {quiz.availableUntil && ` - ${new Date(quiz.availableUntil).toLocaleString()}`}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
          
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={openPreview}
            fullWidth
            disabled={quiz.questions.length === 0}
          >
            Preview Quiz Questions
          </Button>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Question Summary</Typography>
              <List dense>
                {quiz.questions.map((question, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${index + 1}. ${question.question.substring(0, 50)}${question.question.length > 50 ? '...' : ''}`}
                      secondary={`${question.type.replace('_', ' ')} • ${question.points} pts`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderQuestionForm = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {editingQuestionIndex !== null ? 'Edit Question' : 'Add New Question'}
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Question"
              multiline
              rows={2}
              value={newQuestion.question}
              onChange={(e) => handleQuestionChange('question', e.target.value)}
              placeholder="Enter your question here..."
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newQuestion.type}
                label="Type"
                onChange={(e) => handleQuestionChange('type', e.target.value)}
              >
                <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                <MenuItem value="true_false">True/False</MenuItem>
                <MenuItem value="short_answer">Short Answer</MenuItem>
                <MenuItem value="essay">Essay</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Points"
              type="number"
              value={newQuestion.points}
              onChange={(e) => handleQuestionChange('points', parseInt(e.target.value) || 1)}
              inputProps={{ min: 1 }}
            />
          </Grid>

          {newQuestion.type === 'multiple_choice' && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Options</Typography>
              {newQuestion.options.map((option, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    sx={{ mr: 2 }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newQuestion.correctAnswer === option}
                        onChange={(e) => handleQuestionChange('correctAnswer', e.target.checked ? option : '')}
                      />
                    }
                    label="Correct"
                  />
                </Box>
              ))}
            </Grid>
          )}

          {newQuestion.type === 'true_false' && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Correct Answer</InputLabel>
                <Select
                  value={newQuestion.correctAnswer}
                  label="Correct Answer"
                  onChange={(e) => handleQuestionChange('correctAnswer', e.target.value)}
                >
                  <MenuItem value="true">True</MenuItem>
                  <MenuItem value="false">False</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          {newQuestion.type === 'short_answer' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Sample Answer (for reference)"
                value={newQuestion.correctAnswer}
                onChange={(e) => handleQuestionChange('correctAnswer', e.target.value)}
                placeholder="Provide a sample correct answer..."
              />
            </Grid>
          )}
        </Grid>
      </CardContent>
      
      <CardActions>
        <Button onClick={addQuestion} variant="contained" startIcon={<SaveIcon />}>
          {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
        </Button>
        <Button onClick={() => {
          setShowQuestionForm(false);
          setEditingQuestionIndex(null);
          resetQuestionForm();
        }}>
          Cancel
        </Button>
      </CardActions>
    </Card>
  );

  if (!classId) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning">
          Please select a class to create a quiz.
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
        <Link 
          color="inherit" 
          href={`/quizzes?classId=${classId}`}
          onClick={(e) => { e.preventDefault(); navigate(`/quizzes?classId=${classId}`); }}
        >
          Quizzes
        </Link>
        <Typography color="text.primary">
          {quizId ? 'Edit Quiz' : 'Create Quiz'}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {quizId ? 'Edit Quiz' : 'Create New Quiz'}
        </Typography>
        {classInfo && (
          <Typography variant="subtitle1" color="textSecondary">
            {classInfo.courseCode} - {classInfo.courseDescription}
          </Typography>
        )}
      </Box>

      {/* Success Message */}
      {success && (
        <Snackbar 
          open={!!success} 
          autoHideDuration={3000} 
          onClose={() => setSuccess('')}
        >
          <Alert severity="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        </Snackbar>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Multi-step Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Box sx={{ mb: 3 }}>
        {activeStep === 0 && renderQuizSettings()}
        {activeStep === 1 && renderQuestionsStep()}
        {activeStep === 2 && renderPreviewStep()}
      </Box>

      {/* Navigation Buttons */}
      <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<BackIcon />}
        >
          Back
        </Button>
        
        <Box>
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<NextIcon />}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={saveQuiz}
              disabled={loading}
              startIcon={<SaveIcon />}
              color="success"
            >
              {loading ? 'Saving...' : (quizId ? 'Update Quiz' : 'Create Quiz')}
            </Button>
          )}
        </Box>
      </Paper>

      {/* Preview Dialog */}
      {renderPreviewDialog()}
    </Container>
  );
};

export default QuizBuilder;