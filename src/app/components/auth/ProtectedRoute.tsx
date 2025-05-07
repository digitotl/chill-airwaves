import React, { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  // Get user authentication state from Redux store
  const user = useSelector((state: RootState) => state.user);

  // Check if user is authenticated by verifying if email exists
  const isAuthenticated = !!user.email;

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // If authenticated, render the children components
  return <>{children}</>;
};