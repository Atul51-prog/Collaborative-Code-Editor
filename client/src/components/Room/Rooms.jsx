import React, { useEffect, useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';
import roombackground from './../../assets/Backgrounds/rooms.svg';
import Typewriter from 'typewriter-effect';
import { useAuth } from '../../auth';
import AddBoxRoundedIcon from '@material-ui/icons/AddBoxRounded';
import GroupAddRoundedIcon from '@material-ui/icons/GroupAddRounded';
import CodeRoundedIcon from '@material-ui/icons/CodeRounded';
import MeetingRoomRoundedIcon from '@material-ui/icons/MeetingRoomRounded';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import './Rooms.css';

const Rooms = (props) => {
    const history = useHistory();
    const { user, logout } = useAuth();
    const [roomCode, setRoomCode] = useState('');
    const [joinRoom, setJoinRoom] = useState('');
    const [roomLink, setRoomLink] = useState('');
    const socket = props.socket;

    const generateRoomCode = () => {
        const newCode = uuidV4();
        setRoomCode(newCode);
    };

    useEffect(() => {
        if (roomCode !== '') {
            if (socket) {
                socket.emit('created-room', roomCode);
            }
            history.push(`/room/${roomCode}`);
        }
    }, [roomCode, history, socket]);

    const handleJoinSubmit = (e) => {
        if (e) e.preventDefault();
        const trimmed = joinRoom.trim();
        if (trimmed !== '') {
            setRoomLink(trimmed);
        }
    };

    useEffect(() => {
        if (roomLink !== '') {
            history.push(`/room/${roomLink}`);
        }
    }, [roomLink, history]);

    return (
        <div className="rooms-wrapper" style={{ backgroundImage: `url(${roombackground})` }}>
            <div className="rooms-backdrop-overlay" />

            {/* Top Navigation */}
            <nav className="navbar navbar-expand-lg syncode-top-nav">
                <div className="container-fluid px-4">
                    <NavLink exact to="/" className="syncode-nav-brand">
                        <CodeRoundedIcon className="mr-2" style={{ color: '#007acc' }} />
                        <span>SynCode</span>
                    </NavLink>

                    <div className="ml-auto d-flex align-items-center">
                        <NavLink className="syncode-nav-item mr-3" to="/">
                            Home
                        </NavLink>
                        {user && (
                            <span className="syncode-user-pill mr-3">
                                <span className="syncode-status-indicator" />
                                {user.userName}
                            </span>
                        )}
                        <button
                            type="button"
                            className="btn syncode-logout-btn btn-sm"
                            onClick={() => logout()}
                            title="Sign out"
                        >
                            <ExitToAppRoundedIcon fontSize="small" className="mr-1" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            {/* Centered Hub Card */}
            <main className="rooms-main-container">
                <div className="syncode-hub-card">
                    <div className="syncode-hub-badge">
                        <span className="syncode-badge-dot" />
                        Collaborative Code Studio
                    </div>

                    <h1 className="syncode-hub-title">
                        Welcome, <span className="highlight">{user?.userName || 'Developer'}</span>
                    </h1>

                    <div className="syncode-typewriter-box">
                        <Typewriter
                            options={{
                                strings: [
                                    'Create a new coding room in seconds',
                                    'Share a code snippet and collaborate live',
                                    'Execute multi-language programs together',
                                    'Pair program with real-time AI assistance'
                                ],
                                autoStart: true,
                                loop: true,
                                delay: 45,
                                deleteSpeed: 25,
                            }}
                        />
                    </div>

                    <p className="syncode-hub-description">
                        Start an instant workspace for pair programming, interviews, or team project sprints.
                    </p>

                    <div className="syncode-hub-actions">
                        <button
                            type="button"
                            className="syncode-btn syncode-btn-primary"
                            onClick={generateRoomCode}
                        >
                            <AddBoxRoundedIcon className="mr-2" />
                            Create Room
                        </button>

                        <button
                            type="button"
                            className="syncode-btn syncode-btn-secondary"
                            data-toggle="modal"
                            data-target="#joinRoomModal"
                        >
                            <GroupAddRoundedIcon className="mr-2" />
                            Join Room
                        </button>
                    </div>

                    <div className="syncode-hub-footer">
                        <div className="syncode-feature-chip">
                            <MeetingRoomRoundedIcon fontSize="small" className="mr-1" style={{ color: '#4fc1ff' }} />
                            <span>Unique room codes</span>
                        </div>
                        <div className="syncode-feature-chip">
                            <span className="syncode-bullet">●</span>
                            <span>No setup required</span>
                        </div>
                        <div className="syncode-feature-chip">
                            <span className="syncode-bullet">●</span>
                            <span>Instant compilation</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Join Room Modal */}
            <div className="modal fade" id="joinRoomModal" tabIndex="-1" aria-labelledby="joinRoomModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content syncode-dark-modal">
                        <div className="modal-header syncode-modal-header">
                            <h5 className="modal-title syncode-modal-title" id="joinRoomModalLabel">
                                <GroupAddRoundedIcon className="mr-2" style={{ color: '#007acc' }} />
                                Join Existing Room
                            </h5>
                            <button type="button" className="close text-light" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <form onSubmit={handleJoinSubmit}>
                            <div className="modal-body syncode-modal-body">
                                <p className="syncode-modal-help">
                                    Enter the room ID provided by your team member or collaborator:
                                </p>
                                <div className="form-group mb-0">
                                    <input
                                        type="text"
                                        className="form-control syncode-modal-input"
                                        placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                                        value={joinRoom}
                                        onChange={(e) => setJoinRoom(e.target.value)}
                                        autoFocus
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer syncode-modal-footer">
                                <button type="button" className="btn syncode-modal-btn-cancel" data-dismiss="modal">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn syncode-modal-btn-join"
                                    data-dismiss="modal"
                                    disabled={!joinRoom.trim()}
                                >
                                    Enter Room
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Rooms;
