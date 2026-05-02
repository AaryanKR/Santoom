import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import VideocamIcon from '@mui/icons-material/Videocam';
import { IconButton, Container, Grid, Divider } from '@mui/material';

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(history);
      } catch {
        // implement snackbar here
      }
    };
    fetchHistory();
  }, [getHistoryOfUser]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // --- NEW: Clear History Function ---
  const handleClearHistory = () => {
    // 1. This clears it from the screen immediately
    setMeetings([]); 
    
    // 2. TODO: If you have a backend, you will want to add an API call here 
    // to actually delete the records from your MongoDB database!
    // Example: await clearUserHistoryAPI();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      {/* HEADER SECTION */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton 
            onClick={() => routeTo("/home")} 
            sx={{ backgroundColor: '#1976d2', color: 'white', '&:hover': { backgroundColor: '#115293' } }}
          >
            <HomeIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">
            Meeting History
          </Typography>
        </Box>

        {/* CLEAR HISTORY BUTTON */}
        {meetings.length > 0 && (
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<DeleteIcon />}
            onClick={handleClearHistory}
          >
            Clear All
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* MEETINGS GRID SECTION */}
      {meetings.length !== 0 ? (
        <Grid container spacing={3}>
          {meetings.map((e, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Card 
                elevation={3} 
                sx={{ 
                  borderRadius: 2, 
                  transition: '0.3s', 
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } 
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1.5} gap={1}>
                    <VideocamIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold" component="div">
                      {e.meetingCode}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                    <EventIcon fontSize="small" />
                    <Typography sx={{ fontSize: 15 }}>
                      {formatDate(e.date)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        /* EMPTY STATE SECTION */
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt={10}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No history found!
          </Typography>
          <Typography variant="body1" color="text.disabled">
            Join or create a new meeting to see your history here.
          </Typography>
        </Box>
      )}
    </Container>
  );
}