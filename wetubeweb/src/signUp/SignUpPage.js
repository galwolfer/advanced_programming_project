import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './logo.svg'; // Import your logo image
import './signUpPage.css'; // Import your CSS file
import { signUp } from '../api/client';

function SignUpPage({ onAuthSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    profilePicture: null
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [availabilityError, setAvailabilityError] = useState('');
  const [passwordValid, setPasswordValid] = useState(true); // State to track password validity
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const fileInputRef = useRef(null); // Ref for file input

  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Hide "Sign-up successful!" message when typing in another input field
    setIsSuccess(false);

    // Reset validation messages when typing in the respective fields
    if (name === 'username') {
      setAvailabilityError('');
    }

    if (name === 'email') {
      setAvailabilityError('');
    }

    if (name === 'password' || name === 'confirmPassword') {
      setPasswordsMatch(true);
      setPasswordValid(true); // Reset password validity message
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setIsSuccess(false); // Hide "Sign-up successful!" message when uploading another image
    setFormData({
      ...formData,
      profilePicture: file
    });
  };

  const validatePassword = (password) => {
    // Regular expression to check for at least 8 characters, at least one uppercase letter, one lowercase letter, and one number
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset validation messages
    setPasswordsMatch(true);
    setAvailabilityError('');
    setPasswordValid(true);

    // Check if confirm password matches password
    if (formData.password !== formData.confirmPassword) {
      setPasswordsMatch(false);
      return;
    }

    // Check if password meets complexity requirements
    if (!validatePassword(formData.password)) {
      setPasswordValid(false);
      return;
    }

    if (
      formData.username.trim() === '' ||
      formData.email.trim() === '' ||
      formData.password.trim() === '' ||
      formData.confirmPassword.trim() === '' ||
      formData.displayName.trim() === ''
    ) {
      // If any required field is empty, show an alert or error message
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const profilePictureUrl = formData.profilePicture ? await fileToDataUrl(formData.profilePicture) : '';
      const { token, user } = await signUp({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        profilePictureUrl,
      });

      onAuthSuccess(token, user);
      setIsSuccess(true);
      navigate('/');

      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
        profilePicture: null,
      });

      fileInputRef.current.value = null;
    } catch (error) {
      setAvailabilityError(error.message);
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="SignUpContainer">
      <div className="SignUpForm">
        <img src={logo} alt="Logo" className="Logo" /> {/* Add the logo */}
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="input-group flex-nowrap">
            <input
              type="text"
              className={`form-control ${availabilityError ? 'error-outline' : ''}`}
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          {/* Email */}
          <div className="input-group flex-nowrap">
            <input
              type="email"
              className={`form-control ${availabilityError ? 'error-outline' : ''}`}
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          {/* Password */}
          <div className="input-group flex-nowrap">
            <input
              type="password"
              className={`form-control ${!passwordValid ? 'error-outline' : ''}`}
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {!passwordValid && <p className="error-message">Password must be at least 8 characters long, contain both letters and numbers, and at least one capital letter.</p>}
          </div>
          {/* Confirm Password */}
          <div className="input-group flex-nowrap">
            <input
              type="password"
              className={`form-control ${!passwordsMatch ? 'error-outline' : ''}`}
              placeholder="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {!passwordsMatch && <p className="error-message">Passwords do not match.</p>}
          </div>
          {/* Display Name */}
          <div className="input-group flex-nowrap">
            <input
              type="text"
              className="form-control"
              placeholder="Display Name"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
            />
          </div>
          {/* Profile Picture */}
          <div className="input-group flex-nowrap">
            <input
              ref={fileInputRef} // Attach ref to file input
              type="file"
              className="form-control"
              onChange={handleFileChange}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Submit'}
          </button>
        </form>
        {availabilityError && <p className="error-message">{availabilityError}</p>}
        {isSuccess && <p className="success-message">Sign-up successful!</p>}
        <p className="signin-link">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;
