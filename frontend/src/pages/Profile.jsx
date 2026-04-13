import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const Profile = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Profile Settings
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Profile management functionality will be implemented here.
          This will include updating user information, changing passwords, and account settings.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Profile;