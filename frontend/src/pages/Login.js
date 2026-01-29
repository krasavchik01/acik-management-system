import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://acik-management-system-backend.onrender.com/api'
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000/api');

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('waking'); // 'waking' | 'ready' | 'error'
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Warm up the backend server immediately when login page loads
  useEffect(() => {
    let cancelled = false;

    const warmUp = async () => {
      try {
        await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        // Any response (even 401) means server is awake
        if (!cancelled) setServerStatus('ready');
      } catch (err) {
        // Network error — try again
        if (!cancelled) {
          setTimeout(async () => {
            try {
              await fetch(`${API_URL}/auth/me`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              });
              if (!cancelled) setServerStatus('ready');
            } catch {
              if (!cancelled) setServerStatus('error');
            }
          }, 3000);
        }
      }
    };

    warmUp();
    return () => { cancelled = true; };
  }, []);

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
      admin: { email: 'admin@acik.com', password: 'password123' },
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

  const getServerStatusText = () => {
    if (serverStatus === 'waking') return 'Сервер просыпается...';
    if (serverStatus === 'ready') return 'Сервер готов';
    return 'Сервер недоступен';
  };

  const getServerStatusClass = () => {
    if (serverStatus === 'waking') return 'server-waking';
    if (serverStatus === 'ready') return 'server-ready';
    return 'server-error';
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

            {/* Server status indicator */}
            <div className={`server-status ${getServerStatusClass()}`}>
              <span className="server-dot"></span>
              <span>{getServerStatusText()}</span>
            </div>

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
                {loading ? (serverStatus === 'waking' ? 'Сервер просыпается...' : 'Вход...') : 'Войти'}
              </button>
            </form>

            <div className="quick-login">
              <p className="quick-login-title">Быстрый вход (Демо):</p>
              <div className="quick-login-buttons">
                <button onClick={() => quickLogin('admin')} className="btn-quick btn-quick-admin" disabled={loading}>
                  Admin
                </button>
                <button onClick={() => quickLogin('president')} className="btn-quick" disabled={loading}>
                  President
                </button>
                <button onClick={() => quickLogin('cfo')} className="btn-quick" disabled={loading}>
                  CFO
                </button>
                <button onClick={() => quickLogin('pm')} className="btn-quick" disabled={loading}>
                  PM
                </button>
                <button onClick={() => quickLogin('marketing')} className="btn-quick" disabled={loading}>
                  Marketing
                </button>
              </div>
            </div>

            <div className="login-footer">
              <p>Все пароли: <code>password123</code></p>
              {serverStatus === 'waking' && (
                <p className="server-hint">
                  Первый вход может занять до 30 сек — бесплатный сервер Render просыпается после простоя
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
