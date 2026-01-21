import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login({ email, password });

    if (result.success) {
      navigate('/');
    }

    setLoading(false);
  };

  const quickLogin = async (role) => {
    const credentials = {
      president: { email: 'president@acik.com', password: 'password123' },
      cfo: { email: 'cfo@acik.com', password: 'password123' },
      pm: { email: 'pm@acik.com', password: 'password123' },
      marketing: { email: 'marketing@acik.com', password: 'password123' }
    };

    const cred = credentials[role];
    setLoading(true);

    const result = await login(cred);

    if (result.success) {
      navigate('/');
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <h1>ACIK</h1>
            <p>Management System</p>
          </div>
          <div className="login-features">
            <div className="feature">
              <span className="feature-icon">📊</span>
              <h3>Project Management</h3>
              <p>Track and manage all your projects efficiently</p>
            </div>
            <div className="feature">
              <span className="feature-icon">👥</span>
              <h3>Team Collaboration</h3>
              <p>Work together seamlessly with your team</p>
            </div>
            <div className="feature">
              <span className="feature-icon">📈</span>
              <h3>Analytics & Reports</h3>
              <p>Get insights with powerful analytics</p>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-container">
            <h2>Welcome Back</h2>
            <p className="login-subtitle">Sign in to your account</p>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="form-input"
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="quick-login">
              <p className="quick-login-title">Quick Login (Demo):</p>
              <div className="quick-login-buttons">
                <button onClick={() => quickLogin('president')} className="btn-quick">
                  President
                </button>
                <button onClick={() => quickLogin('cfo')} className="btn-quick">
                  CFO
                </button>
                <button onClick={() => quickLogin('pm')} className="btn-quick">
                  PM
                </button>
                <button onClick={() => quickLogin('marketing')} className="btn-quick">
                  Marketing
                </button>
              </div>
            </div>

            <div className="login-footer">
              <p>All passwords: <code>password123</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
