import React from 'react';

type Props = { children?: React.ReactNode };
type State = { hasError: boolean };

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: any, info: any) {
    // Log error and component stack to console for debugging
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught error:', error);
    // eslint-disable-next-line no-console
    console.error('Component stack:', info?.componentStack);
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20 }}>
          <h3>Se ha producido un error en la UI (ErrorBoundary)</h3>
          <div>Revisa la consola para más detalles.</div>
        </div>
      );
    }
    return this.props.children as React.ReactNode;
  }
}

export default ErrorBoundary;
