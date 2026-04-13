import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Divider
} from '@mui/material';
import {
  School,
  TrendingUp,
  Schedule,
  AutoAwesome
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const mainCard = {
    title: 'School Years',
    description: 'Manage your complete academic structure',
    features: ['Academic Years', 'Semesters', 'Classes', 'Quizzes'],
    icon: <School sx={{ fontSize: 48 }} />,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    path: '/school-years'
  };

  const quickStats = [
    {
      title: 'Active School Years',
      value: '2',
      icon: <Schedule />,
      color: '#4caf50'
    },
    {
      title: 'Total Classes',
      value: '12',
      icon: <School />,
      color: '#2196f3'
    },
    {
      title: 'Quizzes Created',
      value: '45',
      icon: <AutoAwesome />,
      color: '#ff9800'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Welcome Back! 👋
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ mb: 3, fontWeight: 300 }}
        >
          Manage your complete academic ecosystem in one place
        </Typography>
      </Box>

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickStats.map((stat, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: stat.color, 
                    width: 56, 
                    height: 56, 
                    mx: 'auto', 
                    mb: 2,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: stat.color }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Action Card */}
      <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card 
            sx={{ 
              background: mainCard.gradient,
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: 'none',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
              }
            }}
            onClick={() => navigate(mainCard.path)}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    width: 64, 
                    height: 64, 
                    mr: 3,
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {mainCard.icon}
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {mainCard.title}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    {mainCard.description}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ bgcolor: 'rgba(255,255,255,0.3)', mb: 3 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                  Everything you need to manage:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {mainCard.features.map((feature, index) => (
                    <Chip
                      key={index}
                      label={feature}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
            <CardActions sx={{ px: 4, pb: 4 }}>
              <Button 
                variant="contained" 
                size="large"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                  }
                }}
                startIcon={<TrendingUp />}
              >
                Get Started
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3,
              background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              🎯 Quick Tips
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              • Start by creating a School Year for your academic period
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              • Add semesters to organize your academic calendar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Create classes within semesters and build quizzes for each class
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3,
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              📊 System Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#4caf50', borderRadius: '50%', mr: 1 }} />
              <Typography variant="body2">All systems operational</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#4caf50', borderRadius: '50%', mr: 1 }} />
              <Typography variant="body2">Database connected</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#4caf50', borderRadius: '50%', mr: 1 }} />
              <Typography variant="body2">Ready to create content</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;