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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip, 
  Alert,
  Breadcrumbs,
  Link,
  Avatar,
  LinearProgress,
  Divider
} from '@mui/material';
import { 
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Quiz as QuizIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const quizId = searchParams.get('quizId');
  const classId = searchParams.get('classId');
  
  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (quizId) {
      fetchQuizResults();
      fetchQuizStatistics();
    }
  }, [quizId]);

  const fetchQuizResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/quizzes/${quizId}/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuiz(response.data.quiz);
      setResults(response.data.results);
    } catch (err) {
      setError('Failed to load quiz results');
      console.error('Error fetching quiz results:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/quizzes/${quizId}/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatistics(response.data);
    } catch (err) {
      console.error('Error fetching quiz statistics:', err);
    }
  };

  const exportResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/quizzes/${quizId}/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${quiz?.title || 'quiz'}_results.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export results');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  const calculatePercentage = (score, maxScore) => {
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  };

  if (loading) return <Typography>Loading...</Typography>;

  if (!quizId) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning">
          Please select a quiz to view results.
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
          href={`/quizzes?classId=${quiz?.classId}`}
          onClick={(e) => { e.preventDefault(); navigate(`/quizzes?classId=${quiz?.classId}`); }}
        >
          Quizzes
        </Link>
        <Typography color="text.primary">
          Results - {quiz?.title}
        </Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Quiz Results & Analytics
          </Typography>
          {quiz && (
            <Typography variant="h6" color="primary">
              {quiz.title}
            </Typography>
          )}
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={exportResults}
          disabled={results.length === 0}
        >
          Export CSV
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PeopleIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h4">{statistics.totalSubmissions}</Typography>
                    <Typography color="textSecondary">Total Submissions</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon sx={{ mr: 2, color: 'success.main' }} />
                  <Box>
                    <Typography variant="h4">{statistics.averageScore}%</Typography>
                    <Typography color="textSecondary">Average Score</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ mr: 2, color: 'success.main' }} />
                  <Box>
                    <Typography variant="h4">{statistics.highestScore}%</Typography>
                    <Typography color="textSecondary">Highest Score</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CancelIcon sx={{ mr: 2, color: 'error.main' }} />
                  <Box>
                    <Typography variant="h4">{statistics.lowestScore}%</Typography>
                    <Typography color="textSecondary">Lowest Score</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Results Table */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Student Results</Typography>
        </Box>
        
        {results.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Percentage</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted At</TableCell>
                  <TableCell>Time Taken</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {result.studentId?.fullName?.charAt(0) || 'S'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {result.studentId?.fullName || 'Unknown Student'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {result.studentId?.studentId}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {result.totalScore} / {result.maxScore}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={calculatePercentage(result.totalScore, result.maxScore)}
                            color={getScoreColor(result.totalScore, result.maxScore)}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {calculatePercentage(result.totalScore, result.maxScore)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={result.status === 'submitted' ? 'Completed' : result.status}
                        size="small"
                        color={result.status === 'submitted' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(result.submittedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {result.timeTaken ? `${Math.round(result.timeTaken / 60)} min` : 'N/A'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <AssessmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Submissions Yet
            </Typography>
            <Typography color="textSecondary">
              Results will appear here once students start taking the quiz.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Question Analysis */}
      {quiz && quiz.questions && quiz.questions.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Question Analysis
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {quiz.questions.map((question, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Question {index + 1}: {question.question}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    Question Type: {question.type.replace('_', ' ')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Points: {question.points}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    Correct Answers: 0 / {results.length}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={0} 
                    sx={{ mt: 1 }}
                  />
                </Grid>
              </Grid>
              
              {index < quiz.questions.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </Paper>
      )}
    </Container>
  );
};

export default Results;