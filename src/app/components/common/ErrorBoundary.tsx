import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { addError } from '../../store/appState/appSlice';

interface ErrorBoundaryProps {
  /**
   * Child components that this error boundary wraps
   */
  children: ReactNode;
  /**
   * Optional fallback component to render when an error occurs
   */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  /**
   * Whether an error has been caught
   */
  hasError: boolean;
  /**
   * The error that was caught, if any
   */
  error: Error | null;
}

/**
 * ErrorBoundary component to catch and handle runtime errors gracefully
 * 
 * Usage:
 * ```tsx
 * <ErrorBoundary fallback={<p>Something went wrong</p>}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // Ideally, log this error to an error reporting service
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render fallback UI if provided, otherwise a default error message
      return this.props.fallback || (
        <div className="p-4 bg-red-100 text-red-700 rounded-md m-4">
          <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
          <p className="mb-2">The application encountered an unexpected error.</p>
          <details className="bg-red-50 p-2 rounded">
            <summary className="cursor-pointer">Technical Details</summary>
            <p className="font-mono text-sm mt-2 whitespace-pre-wrap break-words">
              {this.state.error?.toString()}
            </p>
          </details>
          <button
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={() => window.location.reload()}
          >
            Refresh the page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Function component wrapper for ErrorBoundary to provide Redux integration
 */
export const ErrorBoundary = (props: ErrorBoundaryProps): JSX.Element => {
  return <ErrorBoundaryClass {...props} />;
};

/**
 * Hook to report errors to Redux store
 * @param error The error object
 * @param componentName Name of the component where the error occurred
 */
export const useErrorReporting = (error: unknown, componentName: string): void => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (error) {
      dispatch(addError({
        code: 'COMPONENT_ERROR',
        message: `Error in ${componentName}`,
        details: error instanceof Error ? error.message : String(error)
      }));
    }
  }, [error, componentName, dispatch]);
};