import React from 'react';
import { Result, Button } from 'antd';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Something went wrong"
          subTitle="Sorry, an error occurred while loading this page."
          extra={[
            <Button 
              type="primary" 
              key="reload"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>,
            <Button 
              key="home"
              onClick={() => window.location.href = '/dashboard'}
            >
              Go to Dashboard
            </Button>
          ]}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 