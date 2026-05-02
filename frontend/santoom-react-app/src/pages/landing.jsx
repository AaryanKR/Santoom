import React from 'react'
import "../App.css"
import logo from "../assets/santoom_img.jpg";
import { createTheme, ThemeProvider, Typography, Button } from '@mui/material';
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
  <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
    <div className='navHeader' style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      {/* Keeping your original inline style but updating font-weight */}
      <h2 style={{ fontFamily: "Georgia", fontWeight: 800, margin: 0, fontSize: '2rem' }}>Santoom</h2>
      <img src={logo} alt="Santoom Logo" className='logo' style={{ height: "40px", borderRadius: "8px" }} />
    </div>

    <div className='navList' style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
      <Typography 
        onClick={() => router("/akr19")}
        sx={{ fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', '&:hover': { color: '#2563eb' } }}
      >
        Join as guest
      </Typography>

      <Typography 
        onClick={() => router("/auth")}
        sx={{ fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', '&:hover': { color: '#2563eb' } }}
      >
        Register
      </Typography>

      <Button 
        variant="contained" 
        onClick={() => router("/auth")}
        sx={{ 
          borderRadius: '8px', 
          px: 3, 
          backgroundColor: '#2563eb',
          '&:hover': { backgroundColor: '#1d4ed8' } 
        }}
      >
        Login
      </Button>
    </div>
  </nav>
</ThemeProvider>

      <div className="landingMainContainer">
        <div>
          <h1><span style={{color:"#FF9839"}}>Connect</span> with your loved ones</h1>
          <p>Cover a distance by Santoom Video Call</p>
          <div role='button'>
            <Link to={"/auth"}>Get started</Link>
          </div>
        </div>
        <div>
          <img src="/mobile.png" alt="" />
        </div>
      </div>

      <div className='footer'>
        <div className='certify'>
          <b>&copy; Santoom Private Limited</b>
        </div>
        <div className='authorify'>
          <a href="/">Privacy</a>
            <p className="dotfoot">.</p>
            <a href="/">Terms</a>
            <p className="dotfoot">.</p>
            <a href="/">Sitemap</a>
            <p className="dotfoot">.</p>
            <a href="/">Company details</a>
        </div>
      </div>
    </div>
  )
}
