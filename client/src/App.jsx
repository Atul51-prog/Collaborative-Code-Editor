import React, { useEffect, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';

import Errorpage from './components/Error/Errorpage';
import Home from './components/Home/Home';
import Rooms from './components/Room/Rooms';
import Room from './components/InsideRoom/Room';

import { io } from 'socket.io-client';
import { SnackbarProvider } from 'notistack';

import CreateAccount from './pages/CreateAccount';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Logout from './pages/Logout';

import { AuthProvider, useAuth } from './auth';
import ProtectedRoute from './ProtectedRoute';

import { BACKEND_URL } from './config';

const AppRoutes = () => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setSocket((currentSocket) => {
        if (currentSocket) {
          currentSocket.disconnect();
        }

        return null;
      });

      return;
    }

    const s = io(BACKEND_URL);

    console.log('Connecting socket to:', BACKEND_URL);

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <SnackbarProvider>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>

        <Route path="/login">
          <LoginPage />
        </Route>

        <Route path="/forgot-password">
          <ForgotPasswordPage />
        </Route>

        <Route path="/signup">
          <CreateAccount />
        </Route>

        <ProtectedRoute path="/rooms">
          <Rooms socket={socket} />
        </ProtectedRoute>

        <ProtectedRoute path="/room/:id">
          <Room
            socket={socket}
            nameOfUser={user?.userName || ''}
          />
        </ProtectedRoute>

        <Route path="/logout">
          <Logout />
        </Route>

        <Route>
          <Errorpage />
        </Route>
      </Switch>
    </SnackbarProvider>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;