import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './logo.svg'; 
import './SignInPage.css'; 

function SignInPage({ signedUpUsers, setSignedInUser }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [signInError, setSignInError] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Reset signInError when user starts typing
    setSignInError(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if the entered username exists in the signed-up users
    const user = signedUpUsers.find(user => user.username === formData.username);

    if (user) {
      // Check if the entered password matches the password for the username
      if (user.password === formData.password) {
        // Password matches, user is signed in
        setSignedInUser(user); // Set the signed-in user
        setSignInError(false);
        alert('Signed in successfully!');
        navigate(`/`); // Redirect to the home page
      } else {
        // Password does not match
        setSignInError(true);
      }
    } else {
      // Username does not exist
      setSignInError(true);
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
          <button type="submit" className="btn btn-primary">Sign In</button>
          {signInError && <p className="error-message">Invalid username or password. Please try again.</p>}
        </form>
        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default SignInPage;
