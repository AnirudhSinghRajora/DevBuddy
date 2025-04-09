import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './app.css';
import MainLayout from './layouts/MainLayout';
import Dashboard from './components/dashboard/Dashboard';
import SpotifyCallback from './components/SpotifyCallback';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/callback" element={<SpotifyCallback />} />
        <Route path="/" element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        } />
      </Routes>
    </Router>
  );
}
