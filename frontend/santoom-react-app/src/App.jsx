import {BrowserRouter as Router , Routes , Route} from 'react-router-dom';
import './App.css'
import LandingPage from './pages/landing.jsx';
import Authentication from './pages/authentication.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import VideoMeetComponent from './pages/VideoMeet.jsx';
import HomeComponent from './pages/home';
import History from './pages/history';

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path = "/" element = {<LandingPage />}></Route>
            <Route path = "/auth" element = {<Authentication />}></Route>
            <Route path="/:url" element = {<VideoMeetComponent />}></Route>
            <Route path='/home' element={<HomeComponent />} />
            <Route path='/history' element={<History />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
