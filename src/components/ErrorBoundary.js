import React from 'react';
import { logger } from '../utils/logger';
import ErrorFallback from './ErrorFallback';

/**
 * Error Boundary for catching React component errors
 * Prevents the entire app from crashing when an error occurs
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to logger
    logger.error('React Error Boundary caught error', error, {
      componentStack: errorInfo.componentStack,
      errorInfo,
      force: true // Force log even in production
    });

    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    logger.info('Resetting error boundary');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Optionally reload app
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

