import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from './logo.svg'; // Import your logo image
import './signUpPage.css'; // Import your CSS file

function SignUpPage({ setSignedUpUsers, signedUpUsers }) {
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
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [emailAvailable, setEmailAvailable] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true); // State to track password validity

  const fileInputRef = useRef(null); // Ref for file input

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Hide "Sign-up successful!" message when typing in another input field
    setIsSuccess(false);

    // Reset validation messages when typing in the respective fields
    if (name === 'username') {
      setUsernameAvailable(true);
    }

    if (name === 'email') {
      setEmailAvailable(true);
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Reset validation messages
    setPasswordsMatch(true);
    setUsernameAvailable(true);
    setEmailAvailable(true);
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

    // Check if username already exists
    if (signedUpUsers.some(user => user.username === formData.username)) {
      setUsernameAvailable(false);
      return;
    }

    // Check if email already exists
    if (signedUpUsers.some(user => user.email === formData.email)) {
      setEmailAvailable(false);
      return;
    }

    // Check if all required fields are filled
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

    // Create an object representing the user
    const newUser = {
      username: formData.username,
      email: formData.email,
      password: formData.password, // Note: You should not store passwords in plaintext in a real application
      displayName: formData.displayName,
      profilePicture: formData.profilePicture
    };

    // Save the user object
    // You can save it in your backend or in local storage depending on your application's architecture
    console.log('New user:', newUser);

    // Update the list of signed-up user objects
    setSignedUpUsers(prevUsers => [...prevUsers, newUser]);

    // Show success message
    setIsSuccess(true);

    // Clear form data
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
      profilePicture: null
    });

    // Reset file input field
    fileInputRef.current.value = null;
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
              className={`form-control ${!usernameAvailable ? 'error-outline' : ''}`}
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            {!usernameAvailable && <p className="error-message">Username not available. Please choose a different one.</p>}
          </div>
          {/* Email */}
          <div className="input-group flex-nowrap">
            <input
              type="email"
              className={`form-control ${!emailAvailable ? 'error-outline' : ''}`}
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {!emailAvailable && <p className="error-message">Email already in use. Please use a different one.</p>}
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
          <button type="submit" className="btn btn-primary">Submit</button>
        </form>
        {isSuccess && <p className="success-message">Sign-up successful!</p>}
        <p className="signin-link">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;
