import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FiUser, FiLock, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import 'bootstrap/dist/css/bootstrap.min.css';

import { login } from '../../services/authService';
import '../../styles/AdminLogin.css';

interface DecodedToken {
    userId: number;
    clientCode: string;
    role: string;
    iat: number;
    exp: number;
  }
  
const Login: React.FC = () => {
  const navigate = useNavigate();
  const [adminCode, setAdminCode] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const { token } = await login(adminCode, password);
      localStorage.setItem('authToken', token);
      const decoded = jwtDecode<DecodedToken>(token);
      if (decoded.role !== 'admin') {
        setErrorMsg('You are not an admin. Access denied.');
        localStorage.removeItem('authToken');
        return;
      }
      navigate('/admin');
    } catch (error: any) {
      console.error('Admin login error:', error);
      setErrorMsg(error.message || 'Server error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-container">
              <div className="logo-icon">CS</div>
              <h2 className="logo-text">CertiSphere</h2>
            </div>
            <h1 className="login-title">Admin Portal</h1>
            <p className="login-subtitle">Enter your credentials to access the admin dashboard</p>
          </div>

          {errorMsg && (
            <div className="error-message">
              <FiAlertCircle className="error-icon" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="adminCode" className="input-label">Admin Code</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  id="adminCode"
                  type="text"
                  placeholder="Enter your admin code"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  required
                  autoFocus
                  className="input-field"
                  style={{ paddingLeft: "60px" }}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password" className="input-label">Password</label>
                <Link to="/forgot-password" className="forgot-password">
                  Forgot password?
                </Link>
              </div>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                  style={{ paddingLeft: "60px" }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="login-button btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
              {!isLoading && <FiArrowRight className="button-icon" />}
            </button>
          </form>

         
        </div>
      </div>
    </div>
  );
};

export default Login;