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
  IconButton, 
  Chip, 
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Breadcrumbs,
  Link
} from '@mui/material';
import { 
  Check as CheckIcon, 
  Close as CloseIcon, 
  Person as PersonIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import api from '../services/api';
import { useSearchParams, useNavigate } from 'react-router-dom';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Students = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const classId = searchParams.get('classId');
  
  const [classInfo, setClassInfo] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [rejectionDialog, setRejectionDialog] = useState({ open: false, requestId: null });
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (classId) {
      fetchClassInfo();
      fetchEnrolledStudents();
      fetchPendingRequests();
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

  const fetchEnrolledStudents = async () => {
    try {
      const response = await api.get(`/classes/${classId}`);
      // enrolledStudents is now populated with Student model data
      setEnrolledStudents(response.data.enrolledStudents || []);
    } catch (err) {
      setError('Failed to load enrolled students');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await api.get(`/classes/${classId}/enrollment-requests?status=pending`);
      setPendingRequests(response.data.requests || response.data || []);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await api.patch(`/classes/enrollment-requests/${requestId}`, { status: 'approved' });
      fetchEnrolledStudents();
      fetchPendingRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve enrollment');
    }
  };

  const handleRejectRequest = async () => {
    try {
      await api.patch(`/classes/enrollment-requests/${rejectionDialog.requestId}`, {
        status: 'rejected',
        rejectionReason: rejectionReason
      });
      fetchPendingRequests();
      setRejectionDialog({ open: false, requestId: null });
      setRejectionReason('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject enrollment');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student from the class?')) return;
    try {
      await api.delete(`/classes/${classId}/students/${studentId}`);
      fetchEnrolledStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove student');
    }
  };

  const openRejectionDialog = (requestId) => {
    setRejectionDialog({ open: true, requestId });
  };

  const closeRejectionDialog = () => {
    setRejectionDialog({ open: false, requestId: null });
    setRejectionReason('');
  };

  if (loading) return <Typography>Loading...</Typography>;

  if (!classId) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning">
          Please select a class from the Classes page to manage students.
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
          {classInfo?.courseCode} - Students
        </Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Student Management
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={`Enrolled Students (${enrolledStudents.length})`} 
            icon={<PersonIcon />}
            iconPosition="start"
          />
          <Tab 
            label={`Pending Requests (${pendingRequests.length})`} 
            icon={<EmailIcon />}
            iconPosition="start"
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {enrolledStudents.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Course & Year</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enrolledStudents.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {student.fullName?.charAt(0) || 'S'}
                          </Avatar>
                          <Typography variant="body2">
                            {student.fullName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {student.course}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {student.year} Year, Section {student.section}
                        </Typography>
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color="error"
                          onClick={() => handleRemoveStudent(student._id)}
                          title="Remove from class"
                        >
                          <RemoveIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Enrolled Students
              </Typography>
              <Typography color="textSecondary">
                Students will appear here after their enrollment requests are approved.
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {pendingRequests.length > 0 ? (
            <Grid container spacing={2}>
              {pendingRequests.map((request) => (
                <Grid item xs={12} md={6} key={request._id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                          {request.studentId?.fullName?.charAt(0) || 'S'}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6">
                            {request.studentId?.fullName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {request.studentId?.email}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          <strong>Student ID:</strong> {request.studentId?.studentId}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Course:</strong> {request.studentId?.course}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Year & Section:</strong> {request.studentId?.year} Year, Section {request.studentId?.section}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Requested:</strong> {new Date(request.requestedAt).toLocaleDateString()}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckIcon />}
                          onClick={() => handleApproveRequest(request._id)}
                          fullWidth
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<CloseIcon />}
                          onClick={() => openRejectionDialog(request._id)}
                          fullWidth
                        >
                          Reject
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <EmailIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Pending Requests
              </Typography>
              <Typography color="textSecondary">
                New enrollment requests will appear here for your approval.
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Paper>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialog.open} onClose={closeRejectionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Enrollment Request</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason (Optional)"
            placeholder="Provide a reason for rejection..."
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRejectionDialog}>Cancel</Button>
          <Button onClick={handleRejectRequest} variant="contained" color="error">
            Reject Request
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Students;