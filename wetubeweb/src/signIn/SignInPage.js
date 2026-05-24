import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './logo.svg'; 
import './SignInPage.css'; 
import { signIn } from '../api/client';

function SignInPage({ onAuthSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [signInError, setSignInError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Reset signInError when user starts typing
    setSignInError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const { token, user } = await signIn({
        username: formData.username,
        password: formData.password,
      });

      onAuthSuccess(token, user);
      navigate(`/`);
    } catch (error) {
      setSignInError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="SignInContainer">
      <div className="SignInForm">
        <img src={logo} alt="Logo" className="Logo" /> {/* Add the logo */}
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="input-group flex-nowrap">
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          {/* Password */}
          <div className="input-group flex-nowrap">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
          {signInError && <p className="error-message">{signInError}</p>}
        </form>
        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default SignInPage;
