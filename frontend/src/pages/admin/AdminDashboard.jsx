import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'User Management', path: '/admin/users' },
    { label: 'Student Management', path: '/admin/students' },
    { label: 'Faculty Management', path: '/admin/faculty' },
    { label: 'Course Management', path: '/admin/courses' },
    { label: 'Enrollment Management', path: '/admin/enrollments' }
  ];

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            SCMS - Admin Dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250, pt: 2 }}>
          <Typography variant="h6" sx={{ px: 2, mb: 2 }}>
            Admin Menu
          </Typography>
          <List>
            {menuItems.map(item => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Welcome, {user?.firstName || 'Admin'}!
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage users, courses, enrollments, and more from here
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
              onClick={() => navigate('/admin/users')}
            >
              <CardContent>
                <Typography color="primary" gutterBottom>
                  👥
                </Typography>
                <Typography variant="h6">User Management</Typography>
                <Typography variant="body2" color="textSecondary">
                  Create, edit, delete users
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
              onClick={() => navigate('/admin/students')}
            >
              <CardContent>
                <Typography color="primary" gutterBottom>
                  🎓
                </Typography>
                <Typography variant="h6">Student Management</Typography>
                <Typography variant="body2" color="textSecondary">
                  Manage student records
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
              onClick={() => navigate('/admin/faculty')}
            >
              <CardContent>
                <Typography color="primary" gutterBottom>
                  👨‍🏫
                </Typography>
                <Typography variant="h6">Faculty Management</Typography>
                <Typography variant="body2" color="textSecondary">
                  Manage faculty records
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
              onClick={() => navigate('/admin/courses')}
            >
              <CardContent>
                <Typography color="primary" gutterBottom>
                  📚
                </Typography>
                <Typography variant="h6">Course Management</Typography>
                <Typography variant="body2" color="textSecondary">
                  Create, edit, delete courses
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
              onClick={() => navigate('/admin/enrollments')}
            >
              <CardContent>
                <Typography color="primary" gutterBottom>
                  ✅
                </Typography>
                <Typography variant="h6">Enrollment Management</Typography>
                <Typography variant="body2" color="textSecondary">
                  Manage student enrollments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
