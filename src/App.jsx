import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RequestForm from './pages/RequestForm';
import History from './pages/History';
import MyPage from './pages/MyPage';
import AdminDashboard from './pages/AdminDashboard';
import CategoryDetail from './pages/CategoryDetail';
import InstitutionDetail from './pages/InstitutionDetail';
import RegionDetail from './pages/RegionDetail';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Home />} /> {/* Changed to Public */}
          <Route path="/request/:id" element={
            <PrivateRoute>
              <RequestForm />
            </PrivateRoute>
          } />
          <Route path="/history" element={
            <PrivateRoute>
              <History />
            </PrivateRoute>
          } />
          <Route path="/mypage" element={
            <PrivateRoute>
              <MyPage />
            </PrivateRoute>
          } />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/category/:categoryName" element={<CategoryDetail />} />
          <Route path="/institution/:id" element={<InstitutionDetail />} />
          <Route path="/region/:sido/:sigungu" element={<RegionDetail />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
