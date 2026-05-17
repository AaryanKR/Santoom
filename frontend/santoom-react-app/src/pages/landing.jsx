import React from 'react'
import "../App.css"
import logo from "../assets/santoom_img.jpg";
import { createTheme, ThemeProvider, Typography, Button, Box } from '@mui/material';
import {Link, useNavigate} from "react-router-dom"

export default function landing() {

  const router = useNavigate();

  const navTheme = createTheme({
  typography: {
    fontFamily: '"Inter", "Poppins", "sans-serif"',
    button: { textTransform: 'none', fontWeight: 600 },
  },
});

  return (
    <div className='landingPageContainer'>
      <ThemeProvider theme={navTheme}>
        <Box 
          component="nav" 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: { xs: '15px 10px', md: '20px' }, // Less padding on mobile
            flexDirection: { xs: 'row', md: 'row' } // Keeps logo and button on same row
          }}
        >
          <Box className='navHeader' sx={{ display: 'flex', alignItems: 'center', gap: { xs: '10px', md: '15px' } }}>
            <h2 style={{ fontFamily: "Georgia", fontWeight: 800, margin: 0, fontSize: '2rem' }}>Santoom</h2>
            <img src={logo} alt="Santoom Logo" className='logo' style={{ height: "40px", borderRadius: "8px" }} />
          </Box>

          <Box className='navList' sx={{ display: 'flex', alignItems: 'center', gap: { xs: '10px', md: '25px' } }}>
            {/* Hides text links on small screens (xs), shows them on medium screens and up (md) */}
            <Typography 
              onClick={() => router("/akr19")}
              sx={{ display: { xs: 'none', md: 'block' }, fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', '&:hover': { color: '#2563eb' } }}
            >
              Join as guest
            </Typography>

            <Typography 
              onClick={() => router("/auth")}
              sx={{ display: { xs: 'none', md: 'block' }, fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', '&:hover': { color: '#2563eb' } }}
            >
              Register
            </Typography>

            <Button 
              variant="contained" 
              onClick={() => router("/auth")}
              sx={{ 
                borderRadius: '8px', 
                px: { xs: 2, md: 3 }, // Slightly smaller button on mobile
                py: { xs: 0.5, md: 1 },
                backgroundColor: '#2563eb',
                '&:hover': { backgroundColor: '#1d4ed8' } 
              }}
            >
              Login
            </Button>
          </Box>
        </Box>
      </ThemeProvider>

      {/* Replaced generic div with a responsive Box */}
      <Box 
        className="landingMainContainer" 
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' }, // Stacks vertically on mobile!
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: { xs: '20px', md: '0 80px' },
          textAlign: { xs: 'center', md: 'left' }, // Centers text on mobile
          marginTop: { xs: '20px', md: '0' }
        }}
      >
        <Box sx={{ flex: 1, paddingBottom: { xs: '30px', md: '0' } }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1, marginBottom: '20px' }}>
            <span style={{color:"#FF9839"}}>Connect</span> with your loved ones
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>Cover a distance by Santoom Video Call</p>
          <div role='button' style={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }}}>
            <Link to={"/auth"} className="getStartedBtn" style={{ padding: '12px 24px', backgroundColor: '#FF9839', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
              Get started
            </Link>
          </div>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {/* Constrains the image so it never forces the screen to scroll horizontally */}
          <img src="/mobile.png" alt="Mobile Preview" style={{ width: '100%', maxWidth: '400px', height: 'auto' }} />
        </Box>
      </Box>

      {/* Responsive Footer */}
      <Box 
        className='footer' 
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' }, // Stacks footer items on mobile
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px',
          gap: { xs: '15px', sm: '0' },
          marginTop: 'auto'
        }}
      >
        <div className='certify'>
          <b>&copy; Santoom Private Limited</b>
        </div>
        <div className='authorify' style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
            <a href="/">Privacy</a>
            <p className="dotfoot" style={{ margin: 0, display: 'inline' }}>.</p>
            <a href="/">Terms</a>
            <p className="dotfoot" style={{ margin: 0, display: 'inline' }}>.</p>
            <a href="/">Sitemap</a>
            <p className="dotfoot" style={{ margin: 0, display: 'inline' }}>.</p>
            <a href="/">Company details</a>
        </div>
      </Box>
    </div>
  )
}