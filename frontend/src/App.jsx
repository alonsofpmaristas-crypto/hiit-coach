import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import TodayPage from './features/session/TodayPage.jsx';
import RankingsPage from './features/rankings/RankingsPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<ProtectedRoute><TodayPage /></ProtectedRoute>} />
        <Route path="/rankings" element={<RankingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
