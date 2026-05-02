import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/" sx={{ fontWeight: 'bold', textDecoration: 'none' }}>
        Santoom
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

// 🎨 UPGRADED THEME: This makes everything look much more modern!
const defaultTheme = createTheme({
  typography: {
    fontFamily: '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none', // Removes the old-school ALL CAPS from buttons
      fontWeight: 600,       // Makes button text slightly bolder
      fontSize: '1rem',
    },
    h5: {
      fontWeight: 700,       // Makes headings bolder
    }
  },
  shape: {
    borderRadius: 8,         // Rounds the corners of text fields and buttons slightly
  },
  palette: {
    primary: {
      main: '#2563eb',       // A vibrant, modern tech blue
    },
    secondary: {
      main: '#ec4899',       // A nice pink accent for the lock icon
    }
  },
});

export default function Authentication() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");

  const [formState, setFormState] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  let handleAuth = async () => {
    try {
      if (formState === 0) {
        let result = await handleLogin(username, password);
      }
      if (formState === 1) {
        let result = await handleRegister(name, username, password);
        console.log(result);
        setUsername("");
        setMessage(result);
        setOpen(true);
        setError("");
        setFormState(0);
        setPassword("");
      }
    } catch (err) {
      let message = (err.response?.data?.message || "An error occurred");
      setError(message);
    }
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      {/* 🛠️ LAYOUT FIX: Added width: '100vw', margin: 0, and overflowX: 'hidden' */}
      <Grid container component="main" sx={{ height: '100vh', width: '100vw', m: 0, overflowX: 'hidden' }}>
        <CssBaseline />
        
        {/* FORM GRID ITEM */}
        <Grid size={{ xs: 12, sm: 8, md: 5 }} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 50, height: 50 }}>
              <LockOutlinedIcon fontSize="medium" />
            </Avatar>

            <Typography component="h1" variant="h5" sx={{ mt: 1, mb: 3 }}>
              Welcome to Santoom
            </Typography>
    
            <Box display="flex" gap={2} mb={2}>
              <Button 
                variant={formState === 0 ? "contained" : "outlined"} 
                onClick={() => { setFormState(0); setError(""); }}
                sx={{ px: 4 }}
              >
                Sign in
              </Button>
              <Button 
                variant={formState === 1 ? "contained" : "outlined"} 
                onClick={() => { setFormState(1); setError(""); }}
                sx={{ px: 4 }}
              >
                Sign up
              </Button>
            </Box>

            <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
              {formState === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="fullname"
                  label="Full name"
                  name="fullname"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && <Typography color="error" sx={{ mt: 1, textAlign: 'center' }}>{error}</Typography>}

              <Button
                type="button" 
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                onClick={handleAuth}
              >
                {formState === 0 ? "Login" : "Register"} 
              </Button>
              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>

        {/* WALLPAPER GRID ITEM */}
        <Grid
          size={{ xs: 12, sm: 4, md: 7 }}
          sx={{
              display: { xs: 'none', sm: 'block' }, 
              overflow: 'hidden', 
            }}
        >
          <img 
            src="https://images.unsplash.com/photo-1578997864329-d747473f7359?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="login background"
            style={{
              width: '100%',
              height: '100vh',
              objectFit: 'cover', 
              display: 'block'
            }}
          />
        </Grid>

      </Grid>

      <Snackbar 
        open={open}
        autoHideDuration={4000}
        message={message}
        onClose={() => setOpen(false)} 
      />
    </ThemeProvider>
  );
}