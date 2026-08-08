import React, { useEffect, useState } from 'react'
import { Route, Switch } from 'react-router-dom'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle";
import Errorpage from './components/Error/Errorpage';
import Home from './components/Home/Home';
import Rooms from './components/Room/Rooms';
import Room from './components/InsideRoom/Room';
import { io } from "socket.io-client"
import { SnackbarProvider } from "notistack";
import CreateAccount from './pages/CreateAccount';
import LoginPage from './pages/LoginPage';
import Logout from './pages/Logout';
import { AuthProvider, useAuth } from './auth';
import ProtectedRoute from './ProtectedRoute';


const AppRoutes = () => {

	const [socket, setSocket] = useState()
	const { user, isAuthenticated } = useAuth();

	useEffect(() => {
		if (!isAuthenticated) {
			setSocket((currentSocket) => {
				if (currentSocket) {
					currentSocket.disconnect();
				}
				return undefined;
			});
			return;
		}

		const s = io("http://localhost:5000");
		console.log(s);
		setSocket(s);
		
		return () => {
			s.disconnect();
		}
	}, [isAuthenticated]);

	return (
		<SnackbarProvider>
				<Switch>
					<Route exact path="/">
						<Home></Home>
					</Route>

					<Route path="/login">
						<LoginPage></LoginPage>
					</Route>

					<Route path="/signup">
						<CreateAccount></CreateAccount>
					</Route>

					<ProtectedRoute path="/rooms">
						<Rooms socket={socket}></Rooms>
					</ProtectedRoute>


					<ProtectedRoute path="/room/:id">
						<Room socket={socket} nameOfUser={user?.userName || ''}></Room>
					</ProtectedRoute>

					<Route path="/logout">
						<Logout></Logout>
					</Route>

					<Route>
						<Errorpage></Errorpage>
					</Route>
				</Switch>

		</SnackbarProvider>
	)
}

const App = () => (
	<AuthProvider>
		<AppRoutes />
	</AuthProvider>
)

export default App
