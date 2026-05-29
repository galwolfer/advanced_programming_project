import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container text-center mt-5">
          <div className="alert alert-danger d-inline-block">
            <h2 className="mb-3">Oops! Something went wrong.</h2>
            <p>{this.state.error?.toString()}</p>
            <button className="btn btn-outline-danger mt-3" onClick={this.handleReload}>
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
