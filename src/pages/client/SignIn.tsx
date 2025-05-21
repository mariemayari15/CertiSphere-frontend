import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginClient } from '../../services/authService';
import '../../styles/SignIn.css';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [clientCode, setClientCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = await loginClient(clientCode, password);
      if (token) localStorage.setItem('authToken', token);
      setLoading(false);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="signin-wrapper bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card signin-card overflow-hidden shadow-lg border-0">
              <div className="row g-0">
                <div className="col-lg-6 bg-primary text-white p-4 p-lg-5 d-flex flex-column">
                  <div className="brand-container mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="logo-circle me-2">
                        <i className="bi bi-shield-check fs-4"></i>
                      </div>
                      <h1 className="brand-name fs-3 fw-bold mb-0">CertiSphere</h1>
                    </div>
                  </div>
                  <div className="hero-content mt-4">
                    <h2 className="fw-bold fs-1 mb-3">Welcome Back</h2>
                    <p className="fs-5 mb-4 text-white-50">
                      Access your certification management portal
                    </p>
                    <div className="benefits-container">
                      <div className="benefit-item d-flex align-items-start mb-4">
                        <div className="benefit-icon me-3 p-2 rounded-circle bg-white text-primary">
                          <i className="bi bi-upload fs-5"></i>
                        </div>
                        <div className="benefit-info">
                          <h4 className="fw-bold fs-5">Manage Multiple Certifications</h4>
                          <p className="text-white-50">Keep all your certificates in one secure place</p>
                        </div>
                      </div>
                      <div className="benefit-item d-flex align-items-start mb-4">
                        <div className="benefit-icon me-3 p-2 rounded-circle bg-white text-primary">
                          <i className="bi bi-search fs-5"></i>
                        </div>
                        <div className="benefit-info">
                          <h4 className="fw-bold fs-5">Real-time Tracking</h4>
                          <p className="text-white-50">Monitor certification progress at every stage</p>
                        </div>
                      </div>
                      <div className="benefit-item d-flex align-items-start mb-4">
                        <div className="benefit-icon me-3 p-2 rounded-circle bg-white text-primary">
                          <i className="bi bi-credit-card fs-5"></i>
                        </div>
                        <div className="benefit-info">
                          <h4 className="fw-bold fs-5">Secure Payments</h4>
                          <p className="text-white-50">Pay for certificates using encrypted transactions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="decoration position-absolute bottom-0 end-0 opacity-25">
                    <div className="circle-1"></div>
                    <div className="circle-2"></div>
                    <div className="circle-3"></div>
                  </div>
                </div>
                
                
                <div className="col-lg-6 bg-white p-4 p-lg-5">
                  <div className="form-wrapper">
                    <div className="text-center mb-4">
                      <h2 className="fw-bold text-certisphere-blue">Sign In to Your Account</h2>
                      <p className="text-muted">Enter your credentials to access your certification dashboard</p>
                    </div>
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}
                    <form onSubmit={handleSubmit} className="signin-form">
                      <div className="form-section bg-light p-4 rounded mb-4 position-relative border-start border-primary border-4">
                        <div className="mb-3">
                          <label htmlFor="clientCode" className="form-label fw-medium">Client Code</label>
                          <div className="input-group">
                            <span className="input-group-text bg-white text-primary">
                              <i className="bi bi-person"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control border-start-0"
                              id="clientCode"
                              placeholder="Enter your Client Code"
                              value={clientCode}
                              onChange={(e) => setClientCode(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label htmlFor="password" className="form-label fw-medium">Password</label>
                          <div className="input-group">
                            <span className="input-group-text bg-white text-primary">
                              <i className="bi bi-lock"></i>
                            </span>
                            <input
                              type="password"
                              className="form-control border-start-0"
                              id="password"
                              placeholder="Enter your password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        className="btn btn-primary w-100 py-2 mb-4 signin-button"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Signing In...
                          </>
                        ) : (
                          'Sign In '
                        )}
                      </button>
                      <div className="text-center">
                        <div className="mb-3">
                          <Link to="/forgot-password" className="text-decoration-none fw-medium">Forgot Password?</Link>
                        </div>
                        <div className="text-muted">
                          New to our platform? <Link to="/signup" className="text-decoration-none fw-semibold">Create Account</Link>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                {/* End Right */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
