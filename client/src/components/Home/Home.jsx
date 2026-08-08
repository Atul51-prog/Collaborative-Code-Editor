import React from 'react'
import { Link } from 'react-router-dom';
import './Home.css';
import { NavLink } from 'react-router-dom';
import {
	BrowserView,
	MobileView
} from "react-device-detect";
import { useAuth } from '../../auth';
import GroupWorkOutlinedIcon from '@material-ui/icons/GroupWorkOutlined';
import AssistantOutlinedIcon from '@material-ui/icons/AssistantOutlined';
import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';
import ForumOutlinedIcon from '@material-ui/icons/ForumOutlined';

const features = [
    {
        icon: <GroupWorkOutlinedIcon />,
        title: 'Real-Time Collaboration',
        text: 'Multiple developers can edit the same file simultaneously with live cursor tracking.',
    },
    {
        icon: <AssistantOutlinedIcon />,
        title: 'Integrated AI Assistant',
        text: 'Ask coding questions, generate code, explain logic and debug errors without leaving the workspace.',
    },
    {
        icon: <CodeOutlinedIcon />,
        title: 'Built-in Compiler',
        text: 'Run code instantly and view output inside the browser.',
    },
    {
        icon: <ForumOutlinedIcon />,
        title: 'Team Communication',
        text: 'Share ideas through live messaging while writing code.',
    },
];

const audiences = ['Students', 'Interview Preparation', 'Developers', 'Hackathon Teams'];
const workflowItems = ['Create a room', 'Invite collaborators', 'Write and run code', 'Discuss changes'];

const Home = () => {
	const { isAuthenticated } = useAuth();

    return (
        <>
        <BrowserView>
        <div className="home-page">

            <nav className="navbar navbar-expand-lg navbar-dark fixed-top home-nav">
                <div className="container">
                    <NavLink exact to="/" className="navbar-brand" href="#">SynCode</NavLink>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav ml-auto">
                            <li className="nav-item active">
                                <NavLink className="nav-link my-link" to="/">Home</NavLink>
                            </li>
                            <li className="nav-item active">
                                <NavLink className="nav-link my-link" to="/rooms">Room</NavLink>
                            </li>
                            {!isAuthenticated
                            ?
                            <li className="nav-item active">
                                <NavLink className="nav-link my-link" to="/login">Sign In</NavLink>
                            </li>
                            :
                            <li className="nav-item active" style={{display:"none"}}>
                                <NavLink className="nav-link my-link" to="/login">Sign In</NavLink>
                            </li>
                            }
                            {!isAuthenticated
                            ?
                            <li className="nav-item active">
                                <NavLink className="nav-link my-link" to="/signup">Sign Up</NavLink>
                            </li>
                            :
                            <li className="nav-item active" style={{display:"none"}}>
                                <NavLink className="nav-link my-link" to="/signup">Sign Up</NavLink>
                            </li>
                            }
                            {!isAuthenticated
                            ?
                            <li className="nav-item active" style={{display:"none"}}>
                                <NavLink className="nav-link my-link" to="/logout">Logout</NavLink>
                            </li>
                            :
                            <li className="nav-item active">
                                <NavLink className="nav-link my-link" to="/logout">Logout</NavLink>
                            </li>
                            }


                            {/* <li className="nav-item active">
                                <NavLink className="nav-link my-link" to="/login">Sign In</NavLink>
                            </li>
                            <li className="nav-item active">
                                <NavLink className="nav-link my-link" to="/signup">Sign Up</NavLink>
                            </li>
                            <li className="nav-item active">
                                <NavLink className="nav-link my-link" to="/logout">Logout</NavLink>
                            </li> */}
                        </ul>

                    </div>
                </div>
            </nav>

            <header className="headerClass">
                <div className="container home-container">
                    <section className="home-overview">
                        <div className="home-hero">
                            <p className="home-kicker">SynCode</p>
                            <h1>Real-Time Collaborative Coding</h1>
                            <p className="home-tagline">Code Together. Build Faster.</p>
                            <p className="home-subheading">
                                Write, compile and discuss code with your teammates in one shared workspace powered by real-time synchronization and integrated AI assistance.
                            </p>
                            <div className="home-actions">
                                <Link to={isAuthenticated ? "/rooms" : "/login"} className="home-btn home-btn-primary">Start Coding</Link>
                                <Link to="/rooms" className="home-btn home-btn-secondary">Join a Room</Link>
                            </div>
                        </div>

                        <aside className="home-status-panel" aria-label="SynCode workspace summary">
                            <div className="home-status-header">
                                <span>Workspace flow</span>
                                <span className="home-status-dot">Live</span>
                            </div>
                            <ol className="home-workflow">
                                {workflowItems.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ol>
                            <div className="home-status-note">
                                Built for interviews, pair programming, college projects and hackathon teams.
                            </div>
                        </aside>
                    </section>

                    <section className="home-main-grid">
                        <div className="home-section-block">
                            <div className="home-section-heading">
                                <span>Core tools</span>
                                <p>Everything needed for a focused coding session.</p>
                            </div>
                            <div className="home-features">
                                {features.map((feature) => (
                                    <article className="home-feature" key={feature.title}>
                                        <div className="home-feature-icon">{feature.icon}</div>
                                        <div>
                                            <h2>{feature.title}</h2>
                                            <p>{feature.text}</p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div className="home-panel">
                            <span className="home-section-label">Why SynCode</span>
                            <p>
                                SynCode combines collaborative editing, team communication and online code execution into one focused workspace. It keeps everyone on the same file, the same discussion and the same output without switching tools.
                            </p>
                        </div>

                        <div className="home-panel">
                            <span className="home-section-label">Who is it for?</span>
                            <div className="home-audience-grid">
                                {audiences.map((audience) => (
                                    <div className="home-audience-card" key={audience}>{audience}</div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <footer className="home-footer">
                        <div className="home-footer-links">
                            <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
                            <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
                            <a href="mailto:contact@example.com">Contact</a>
                            <span>Version 1.0</span>
                        </div>
                        <p>Made by Atul Kumar</p>
                    </footer>
                    </div>
            </header>
        </div>
        </BrowserView>
        <MobileView>
            <div className="mobile-notValid text-center" style={{position:'absolute', top:"50%", left:"50%", transform:'translate(-50%, -50%)'}}>
				<h1>Dear user, unfortunately this app is not supported in MobileView.</h1>
				<h1>Kindly use on a Desktop.</h1>
			</div>
        </MobileView>
        </>
    )
}

export default Home
