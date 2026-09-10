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
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [joinError, setJoinError] = useState('');
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

    const extractRoomId = (rawInput) => {
        if (!rawInput) return '';
        let trimmed = rawInput.trim().replace(/\/+$/, '');
        if (trimmed.includes('/room/')) {
            const parts = trimmed.split('/room/');
            return parts[parts.length - 1].split('?')[0].split('#')[0].trim();
        }
        return trimmed;
    };

    const handleJoinSubmit = (e) => {
        if (e) e.preventDefault();
        const cleanId = extractRoomId(joinRoom);
        if (!cleanId) {
            setJoinError('Please enter or paste a valid room code or link.');
            return;
        }
        setIsJoinModalOpen(false);
        setJoinRoom('');
        setJoinError('');
        history.push(`/room/${cleanId}`);
    };

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
                            onClick={() => {
                                setIsJoinModalOpen(true);
                                setJoinError('');
                            }}
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

            {/* Controlled Join Room Modal */}
            {isJoinModalOpen && (
                <div className="syncode-modal-overlay" onClick={() => setIsJoinModalOpen(false)}>
                    <div className="syncode-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content syncode-dark-modal">
                            <div className="modal-header syncode-modal-header">
                                <h5 className="modal-title syncode-modal-title">
                                    <GroupAddRoundedIcon className="mr-2" style={{ color: '#007acc' }} />
                                    Join Existing Room
                                </h5>
                                <button
                                    type="button"
                                    className="close text-light"
                                    onClick={() => setIsJoinModalOpen(false)}
                                    aria-label="Close"
                                >
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleJoinSubmit}>
                                <div className="modal-body syncode-modal-body">
                                    <p className="syncode-modal-help">
                                        Enter the room ID or paste the room link provided by your collaborator:
                                    </p>
                                    <div className="form-group mb-2">
                                        <input
                                            type="text"
                                            className="form-control syncode-modal-input"
                                            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                                            value={joinRoom}
                                            onChange={(e) => {
                                                setJoinRoom(e.target.value);
                                                if (joinError) setJoinError('');
                                            }}
                                            autoFocus
                                        />
                                    </div>
                                    {joinError && (
                                        <div className="text-danger small mt-1 font-weight-bold">
                                            {joinError}
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer syncode-modal-footer">
                                    <button
                                        type="button"
                                        className="btn syncode-modal-btn-cancel"
                                        onClick={() => setIsJoinModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn syncode-modal-btn-join"
                                        disabled={!joinRoom.trim()}
                                    >
                                        Enter Room
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Rooms;
