import React from 'react';
import { Redirect, Route, useLocation } from 'react-router-dom';
import { useAuth } from './auth';

const ProtectedRoute = ({ children, ...rest }) => {
  const { initializing, isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <Route
      {...rest}
      render={() => {
        if (initializing) {
          return <div style={{ padding: '2rem', textAlign: 'center' }}>Checking session...</div>;
        }

        if (!isAuthenticated) {
          return <Redirect to={{ pathname: '/login', state: { from: location } }} />;
        }

        return children;
      }}
    />
  );
};

export default ProtectedRoute;
