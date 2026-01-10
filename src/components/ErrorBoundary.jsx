import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Game error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="screen-container">
          <div className="glass-panel p-6 text-center">
            <h2 className="text-heading-md mb-4">Oops!</h2>
            <p className="text-body mb-4">Something went wrong.</p>
            <button className="btn-primary" onClick={() => window.location.reload()}>Restart Game</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
