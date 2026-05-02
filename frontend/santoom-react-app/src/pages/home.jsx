import React, { useContext, useState } from 'react' 
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import "../App.css";
import { Button, IconButton, TextField, Box, Typography, Link } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';
import logo from "../assets/santoom_img.jpg";
import { createTheme, ThemeProvider } from '@mui/material/styles';

// 🎨 Bring in the exact same modern theme from your Auth page!
const defaultTheme = createTheme({
  typography: {
    fontFamily: '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  palette: {
    primary: { main: '#2563eb' },
  },
});

function HomeComponent() {
    let navigate = useNavigate();   
    const [meetingCode , setMeetingCode] = useState("");
    const {addToUserHistory} = useContext(AuthContext);

    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`)
    }

  return (
    <ThemeProvider theme={defaultTheme}>
        {/* ✨ THE FIX: This Box wraps the whole page and forces the height to be at least 100vh */}
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            
            {/* --- NAVBAR --- */}
            <div className="navBar" style={{ padding: "10px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <img src={logo} alt="Santoom Logo" className='logo' style={{ height: "40px", borderRadius: "8px" }} />
                    <Typography variant="h5" sx={{ color: "white", fontWeight: "bold" }}>
                        Santoom
                    </Typography>
                </div>

                <div className="subNavbar">
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <IconButton style={{ color: "white" }} onClick={() => navigate("/history")}>
                            <RestoreIcon />
                        </IconButton>
                        <Typography 
                            onClick={() => navigate("/history")}
                            sx={{ fontSize: "1.1rem", cursor: "pointer", color: "white", fontWeight: 500, '&:hover': { color: '#e2e8f0' } }} 
                        >
                            History
                        </Typography>

                        <Button 
                            variant="contained" 
                            color="error"
                            sx={{ marginLeft: "25px", px: 3, borderRadius: "20px" }} 
                            onClick={() => {
                                localStorage.removeItem("token")
                                navigate("/auth")
                            }}
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- MIDDLE CONTENT --- */}
            {/* ✨ THE FIX: flexGrow: 1 makes this section act like a spring, pushing the footer down! */}
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }} className="meetContainer">
                <div className="leftPanel" style={{ padding: "0 5%" }}>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: "#1e293b", mb: 2, lineHeight: 1.2 }}>
                            Providing Quality Video Calls Just Like Quality Education
                        </Typography>
                        
                        <Typography variant="h6" sx={{ color: "#64748b", mb: 4 }}>
                            Secure, fast, and easy to use. Enter your code below to jump right in.
                        </Typography>

                        <Box sx={{ display: 'flex', gap: "15px", alignItems: 'center' }}>
                            <TextField 
                                onChange={e => setMeetingCode(e.target.value)} 
                                id="outlined-basic" 
                                label="Meeting Code" 
                                variant="outlined" 
                                sx={{ backgroundColor: 'white', borderRadius: 1 }}
                            />
                            <Button 
                                onClick={handleJoinVideoCall} 
                                variant='contained'
                                size="large"
                                sx={{ height: "55px", px: 4, fontSize: "1.1rem", borderRadius: "8px" }}
                            >
                                Join
                            </Button>
                        </Box>
                    </Box>
                </div>
                
                <div className='rightPanel' style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <img srcSet='/logo3.png' alt="Video Call Illustration" style={{ maxWidth: "100%", height: "auto" }} />
                </div>
            </Box>

            {/* --- UPGRADED FOOTER --- */}
            {/* ✨ THE FIX: mt: 'auto' guarantees it stays at the bottom */}
            <Box component="footer" sx={{ 
                py: 3, 
                px: 4, 
                mt: 'auto', 
                backgroundColor: '#020d17', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                flexWrap: 'wrap',
                borderTop: '1px solid #e2e8f0'
            }}>
                <Typography variant="body2" color="white" sx={{ fontWeight: 500 }}>
                    &copy; {new Date().getFullYear()} <b>Santoom Private Limited</b>
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <Link href="/" color="white" underline="hover" variant="body2">Privacy</Link>
                    <Typography color="text.disabled" variant="body2">•</Typography>
                    <Link href="/" color="white" underline="hover" variant="body2">Terms</Link>
                    <Typography color="text.disabled" variant="body2">•</Typography>
                    <Link href="/" color="white" underline="hover" variant="body2">Sitemap</Link>
                    <Typography color="text.disabled" variant="body2">•</Typography>
                    <Link href="/" color="white" underline="hover" variant="body2">Company details</Link>
                </Box>
            </Box>

        </Box>
    </ThemeProvider>
  )
}

export default withAuth(HomeComponent)