import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import Signup from './Pages/Signup';
import Login from './Pages/Login';
import Profile from './Pages/Profile';
import Home from './Pages/Home';
import CreateGig from './components/CreateGig';
import Gigs from './components/Gigs';
import GigDetails from './components/GigDetails'
import Ticket from './components/Ticket';
import Tickets from './components/Tickets';
import UserProfile from './components/UserProfile';
import GlobalChat from './Pages/GlobalChat';
// import { Home } from 'lucide-react';




const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-gig" element={<CreateGig />} />
        <Route path="/gigs" element={<Gigs />} />
        <Route path="/gigs/:id" element={<GigDetails />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/tickets/:id" element={<Ticket />} />
        <Route path="/users/:id" element={<UserProfile />} />
        <Route path="/global-chat" element={<GlobalChat />} />
      </Routes>
    </Router>
  );
};

export default App;