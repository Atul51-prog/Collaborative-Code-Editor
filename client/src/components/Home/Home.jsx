import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { BrowserView, MobileView } from 'react-device-detect';
import { useAuth } from '../../auth';
import CodeRoundedIcon from '@material-ui/icons/CodeRounded';
import ArrowForwardRoundedIcon from '@material-ui/icons/ArrowForwardRounded';
import GroupWorkOutlinedIcon from '@material-ui/icons/GroupWorkOutlined';
import PlayCircleOutlineRoundedIcon from '@material-ui/icons/PlayCircleOutlineRounded';
import ChatBubbleOutlineRoundedIcon from '@material-ui/icons/ChatBubbleOutlineRounded';
import './Home.css';

const Home = () => {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <>
            <BrowserView>
                <div className="home-wrapper">
                    {/* Top Navigation */}
                    <nav className="navbar navbar-expand-lg home-navbar">
                        <div className="container home-nav-container">
                            <NavLink exact to="/" className="home-brand">
                                <CodeRoundedIcon className="mr-2" style={{ color: '#3b82f6', fontSize: '1.5rem' }} />
                                <span>SynCode</span>
                            </NavLink>

                            <div className="d-flex align-items-center">
                                <ul className="navbar-nav flex-row align-items-center">
                                    <li className="nav-item mr-3">
                                        <NavLink className="home-nav-link" to="/">Home</NavLink>
                                    </li>
                                    <li className="nav-item mr-3">
                                        <NavLink className="home-nav-link" to="/rooms">Rooms</NavLink>
                                    </li>
                                    {!isAuthenticated ? (
                                        <>
                                            <li className="nav-item mr-2">
                                                <NavLink className="home-nav-link" to="/login">Sign In</NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <Link to="/signup" className="btn home-signup-btn">
                                                    Sign Up
                                                </Link>
                                            </li>
                                        </>
                                    ) : (
                                        <>
                                            <li className="nav-item mr-2">
                                                <span className="home-user-pill">
                                                    <span className="home-user-dot" />
                                                    {user?.userName || 'User'}
                                                </span>
                                            </li>
                                            <li className="nav-item">
                                                <button
                                                    type="button"
                                                    className="btn home-logout-btn"
                                                    onClick={() => logout()}
                                                >
                                                    Logout
                                                </button>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </nav>

                    {/* Simple, Clean Centered Hero */}
                    <header className="home-hero-section">
                        <div className="container text-center">
                            <div className="home-hero-content">
                                <div className="home-hero-badge">
                                    Online Pair Programming
                                </div>
                                <h1 className="home-hero-headline">
                                    Real-time collaborative code editor.
                                </h1>
                                <p className="home-hero-subtext">
                                    Create a shared room, invite peers or teammates, and write, compile, and run code together with live sync and chat.
                                </p>
                                <div className="home-hero-actions justify-content-center">
                                    <Link to="/rooms" className="home-cta-primary">
                                        {isAuthenticated ? "Go to Rooms" : "Start Coding"}
                                        <ArrowForwardRoundedIcon className="ml-2" fontSize="small" />
                                    </Link>
                                    {!isAuthenticated && (
                                        <Link to="/login" className="home-cta-secondary">
                                            Sign In
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Simple 3-Card Features */}
                    <section className="home-features-section">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-4 mb-4 mb-md-0">
                                    <div className="home-feature-card">
                                        <div className="home-feature-icon">
                                            <GroupWorkOutlinedIcon fontSize="medium" />
                                        </div>
                                        <h3 className="home-feature-title">Live Collaboration</h3>
                                        <p className="home-feature-desc">
                                            Multiple people edit the same code at the same time. Changes synchronize instantly across all devices.
                                        </p>
                                    </div>
                                </div>
                                <div className="col-md-4 mb-4 mb-md-0">
                                    <div className="home-feature-card">
                                        <div className="home-feature-icon">
                                            <PlayCircleOutlineRoundedIcon fontSize="medium" />
                                        </div>
                                        <h3 className="home-feature-title">Multi-Language Execution</h3>
                                        <p className="home-feature-desc">
                                            Write and execute C++, Python, JavaScript, Java, C, and Go directly in the browser with custom input.
                                        </p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="home-feature-card">
                                        <div className="home-feature-icon">
                                            <ChatBubbleOutlineRoundedIcon fontSize="medium" />
                                        </div>
                                        <h3 className="home-feature-title">Team Chat & AI Help</h3>
                                        <p className="home-feature-desc">
                                            Discuss code in the room chat side-panel, or ask the built-in AI assistant for concise explanations.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Simple Footer */}
                    <footer className="home-footer">
                        <div className="container d-flex flex-wrap justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <CodeRoundedIcon className="mr-2" style={{ color: '#3b82f6', fontSize: '1.2rem' }} />
                                <span className="font-weight-semibold text-light">SynCode</span>
                            </div>
                            <div className="home-footer-links">
                                <Link to="/rooms" className="text-muted mr-3">Rooms</Link>
                                <NavLink to="/" className="text-muted mr-3">Home</NavLink>
                                <span className="text-muted">Simple Collaborative Coding</span>
                            </div>
                        </div>
                    </footer>
                </div>
            </BrowserView>
            <MobileView>
                <div className="mobile-notValid text-center" style={{ position: 'absolute', top: "50%", left: "50%", transform: 'translate(-50%, -50%)' }}>
                    <h1>Dear user, unfortunately this app is not supported in MobileView.</h1>
                    <h1>Kindly use on a Desktop.</h1>
                </div>
            </MobileView>
        </>
    );
};

export default Home;
