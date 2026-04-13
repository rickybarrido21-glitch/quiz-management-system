import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const Subjects = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Subjects Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Subjects management functionality will be implemented here.
          This will include creating subjects, assigning teachers, and generating class codes.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Subjects;