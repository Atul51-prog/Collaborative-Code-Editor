import React, { useRef, useState, useEffect } from 'react';
import { NavLink} from "react-router-dom";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react"
import { IconContext } from "react-icons";
import {
	BrowserView,
	MobileView
} from "react-device-detect";
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import { useHistory } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import IconButton from '@material-ui/core/IconButton';
import Brightness7RoundedIcon from '@material-ui/icons/Brightness7Rounded';
import Brightness4RoundedIcon from '@material-ui/icons/Brightness4Rounded';
import { RiCheckFill } from 'react-icons/ri';
import ShareRoundedIcon from '@material-ui/icons/ShareRounded';
import Messages from '../ChatFeature/Messages/Messages';
import Input from '../ChatFeature/Input/Input';
import AIChatPanel from '../ChatFeature/AIChatPanel';
import GetAppRoundedIcon from '@material-ui/icons/GetAppRounded';
import PublishRoundedIcon from '@material-ui/icons/PublishRounded';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import ChatBubbleOutlineRoundedIcon from '@material-ui/icons/ChatBubbleOutlineRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import fileDownload from 'js-file-download'
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded';
import './editor.css';

const MyEditor = (props) => {

	const socket = props.socket;
	const {
		nameOfUser,
		setcodeInRoom,
		setlanguageInRoom,
		setRoomTheme,
		setRoomFontSize,
	} = props;
    const history = useHistory();

	const [theme, setTheme] = useState("vs-dark");
	const [language, setLanguage] = useState("cpp");
	// Check if editor is ready
	const [isEditorReady, setIsEditorReady] = useState(false)
	// Send chunks of code on change
	const [editorCode, seteditorCode] = useState("")
	// Set value of editor
	const [value, setValue] = useState('')
	const [sendInitialData, setSendInitialData] = useState(false)
	const [users, setUsers] = useState(0)
	const [usersList, setUsersList] = useState([])
	const [isUsersPopupOpen, setIsUsersPopupOpen] = useState(false)
	const usersPopupRef = useRef(null)
	const [title, setTitle] = useState("Untitled")
	const [titleInfo, setTitleInfo] = useState("Untitled")
	const [titleChange, setTitleChange] = useState(false)
	const [fileExtensionValue, setfileExtensionValue] = useState(0)

	const [currentUsers, setcurrentUsers] = useState('');
	const [message, setMessage] = useState('');
	const [messages, setMessages] = useState([]);
	const [fontsize, setFontsize] = useState("16px")
	const [activeSidePanel, setActiveSidePanel] = useState(null)

	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	let { id } = useParams();
	const roomStorageKey = `syncode.room.${id}`;

	// Maps language name → select index (must match the options order)
	const languageIndexMap = { cpp: 0, python: 1, javascript: 2, c: 3, java: 4, go: 5 };

	useEffect(() => {
		const storedRoom = localStorage.getItem(roomStorageKey);

		if (!storedRoom) {
			return;
		}

		try {
			const roomState = JSON.parse(storedRoom);

			if (roomState.code) {
				setValue(roomState.code);
				seteditorCode(roomState.code);
				setcodeInRoom(roomState.code);
			}

			if (roomState.title) {
				setTitle(roomState.title);
				setTitleInfo(roomState.title);
			}

			if (roomState.language) {
				setLanguage(roomState.language);
				setlanguageInRoom(roomState.language);
				const idx = languageIndexMap[roomState.language];
				if (idx !== undefined) setfileExtensionValue(idx);
			}
		} catch (error) {
			console.log(error);
			localStorage.removeItem(roomStorageKey);
		}
	}, [roomStorageKey, setcodeInRoom, setlanguageInRoom]);

	useEffect(() => {
		localStorage.setItem(roomStorageKey, JSON.stringify({
			code: editorCode,
			title,
			language,
		}));
	}, [roomStorageKey, editorCode, title, language]);

	// Join the current room after the socket is ready, including reconnects.
	useEffect(() => {
		if (!socket || !nameOfUser) {
			return;
		}

		const joinCurrentRoom = () => {
			socket.emit('join-room', { id, nameOfUser });
		};

		if (socket.connected) {
			joinCurrentRoom();
		}

		socket.on('connect', joinCurrentRoom);

		return () => {
			socket.off('connect', joinCurrentRoom);
		};
	}, [socket, id, nameOfUser])

	// Ref for editor
	const editorRef = useRef();

	// Called on initialization, adds ref
	const handleEditorDidMount = (editor, monaco) => {
		setIsEditorReady(true);
		editorRef.current = editor;
	};

	// Ensure Monaco re-layouts on window resize or panel toggle
	useEffect(() => {
		const handleWindowResize = () => {
			if (editorRef.current) {
				editorRef.current.layout();
			}
		};
		window.addEventListener('resize', handleWindowResize);
		const timer = setTimeout(handleWindowResize, 150);
		return () => {
			window.removeEventListener('resize', handleWindowResize);
			clearTimeout(timer);
		};
	}, [activeSidePanel]);

	const toggleSidePanel = (panelName) => {
		setActiveSidePanel((current) => {
			const next = current === panelName ? null : panelName;
			if (next === "chat") {
				setHasUnreadChat(false);
			}
			return next;
		});
	};

	// Called whenever there is a change in the editor
	const handleEditorChange = (value, event) => {
		const nextCode = value || '';
		setValue(nextCode);
		seteditorCode(nextCode);
		setcodeInRoom(nextCode);
		if (socket) {
			socket.emit('code-change', nextCode);
		}
	};

	// For theme of code editor
	const toggleTheme = () => {
		if (theme==="light") {
			enqueueSnackbar('Changed to Dark mode',{
				variant:"success"
			});
		}
		else{
			enqueueSnackbar('Changed to Light mode',{
				variant:"success"
			});
		}
		setTheme(theme === "light" ? "vs-dark" : "light")
		setRoomTheme(theme === "light" ? "vs-dark" : "light")
	}

	//for copying room code
	const copyRoomCode = () => {
		navigator.clipboard.writeText(id);
		enqueueSnackbar(`Room-code copied! Share this code with your friends and Code with them!🤩`, {
			variant:"success"
		});
	}

	const [hasUnreadChat, setHasUnreadChat] = useState(false);

	// Recieve code, title, language changes and chat messages
	useEffect(() => {
		if (!socket) {
			return;
		}

		const handleCodeUpdate = (data) => {
			const nextCode = typeof data === 'string' ? data : data?.code || '';
			setValue(nextCode)
			setcodeInRoom(nextCode)
            seteditorCode(nextCode)
		}

		const handleLanguageUpdate = (data) => {
			setLanguage(data)
			setlanguageInRoom(data)
			const idx = languageIndexMap[data];
			if (idx !== undefined) setfileExtensionValue(idx);
		}

		const handleTitleUpdate = (data) => {
			setTitleInfo(data)
			setTitle(data)
		}

		const handleReceiveMessage = (msg) => {
			setMessages((prev) => [...prev, msg]);
			if (msg.sender && msg.sender !== nameOfUser && msg.sender !== 'admin') {
				setActiveSidePanel((current) => {
					if (current !== "chat") {
						setHasUnreadChat(true);
					}
					return current;
				});
			}
		};

		const handleRequestInfo = () => {
			setSendInitialData(true)
		}

		const handleAcceptInfo = (data) => {
			setTitleInfo(data.title)
			setLanguage(data.language)
			setlanguageInRoom(data.language)
			const idx = languageIndexMap[data.language];
			if (idx !== undefined) setfileExtensionValue(idx);
			setValue(data.code)
			setcodeInRoom(data.code)
		}

		const handleJoinedUsers = (data) => {
			setUsers(data)
		}

		const handleRoomUsersList = (data) => {
			if (Array.isArray(data)) {
				setUsersList(data);
			}
		}

		socket.on('code-update', handleCodeUpdate)
		socket.on('language-update', handleLanguageUpdate)
		socket.on('title-update', handleTitleUpdate)
		socket.on('receive-message', handleReceiveMessage);
		socket.on('request-info', handleRequestInfo)
		socket.on('accept-info', handleAcceptInfo)
		socket.on('joined-users', handleJoinedUsers)
		socket.on('room-users-list', handleRoomUsersList)

		return () => {
			socket.off('code-update', handleCodeUpdate)
			socket.off('language-update', handleLanguageUpdate)
			socket.off('title-update', handleTitleUpdate)
			socket.off('receive-message', handleReceiveMessage);
			socket.off('request-info', handleRequestInfo)
			socket.off('accept-info', handleAcceptInfo)
			socket.off('joined-users', handleJoinedUsers)
			socket.off('room-users-list', handleRoomUsersList)
		}
	}, [socket, setcodeInRoom, setlanguageInRoom])

	useEffect(() => {
		const handleOutsideClick = (e) => {
			if (usersPopupRef.current && !usersPopupRef.current.contains(e.target)) {
				setIsUsersPopupOpen(false);
			}
		};
		if (isUsersPopupOpen) {
			document.addEventListener('mousedown', handleOutsideClick);
		}
		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
		};
	}, [isUsersPopupOpen]);


	// If a new user join, send him current language and title used by other sockets.
	useEffect(() => {
		if (socket) {
			if (sendInitialData === true) {
				socket.emit('user-join', { code: editorCode, title: title, language: language })
				setSendInitialData(false)
			}
		}
		
	}, [socket, sendInitialData, editorCode, title, language])

	const languages = ["cpp", "python", "javascript", "c", "java", "go"]
	const languageExtension = ["cpp", "py", "js", "c", "java", "go"]
	const fontSizes = ["10px", "12px", "14px", "16px", "18px", "20px", "22px", "24px", "26px", "28px", "30px"]

	const changeLanguage = (e) => {
		const newLang = languages[e.target.value];
		setLanguage(newLang);
		setlanguageInRoom(newLang);
		setfileExtensionValue(e.target.value);
		if (socket) {
			socket.emit('language-change', newLang);
		}
	}

	const changeFontSize = (e) => {
		setFontsize(fontSizes[e.target.value])
		setRoomFontSize(fontSizes[e.target.value])
	}

	const titleUpdating = (e) => {
		setTitleInfo(e.target.value)
		setTitleChange(true)
	}

	const leaveRoom = (e) =>{
		if (socket) {
			socket.emit('leaving', {nameOfUser});
		}
		history.push("/");
	}

	const sendMessage = (event) => {
		event.preventDefault();

		if (message && socket) {
			socket.emit('sendMessage', { message, sender: nameOfUser });
			setMessage("");
		}
	}

	const titleUpdated = (e) => {
		setTitle(titleInfo);
		setTitleChange(false);
		if (socket) {
			socket.emit('title-change', titleInfo);
		}
	};

	const downloadCode = (e) => {
		if (e) e.preventDefault();
		fileDownload(editorCode, `${title}.${languageExtension[fileExtensionValue]}`);
	};

	const showFile = async (e) => {
		e.preventDefault()
		const reader = new FileReader()
		reader.onload = async (e) => { 
		  const text = (e.target.result)
		  setValue(text)
		  setcodeInRoom(text)
		  seteditorCode(text)
		//   alert(text)
		};
		reader.readAsText(e.target.files[0])
	}

	const hiddenFileInput = React.useRef(null);
	
  	const handleUpload = event => {
    	hiddenFileInput.current.click();
  	};
  

	return (
		<>
			<BrowserView className="w-100">
				{!socket && (
					<div style={{ padding: '2rem', textAlign: 'center' }}>Connecting to room...</div>
				)}

				{socket && (
				<>
				<nav className="syncode-editor-nav">
					{/* Left Group: Brand, File name, Language */}
					<div className="syncode-nav-left">
						<NavLink className="syncode-brand" to="/" onClick={leaveRoom} title="Leave room and go home">
							<span>SynCode</span>
						</NavLink>

						<form className="syncode-title-form" onSubmit={(e) => { e.preventDefault(); titleUpdated(); }}>
							<input
								className="syncode-title-input"
								type="text"
								placeholder="File name"
								value={titleInfo}
								onChange={titleUpdating}
								title="Click to rename file"
							/>
							{titleChange === true && (
								<button
									type="button"
									className="syncode-title-save-btn"
									onClick={titleUpdated}
									disabled={!isEditorReady}
									title="Save file name"
								>
									<IconContext.Provider value={{ size: "1.2em" }}>
										<RiCheckFill className="checkIcon" />
									</IconContext.Provider>
								</button>
							)}
						</form>

						<select
							className="syncode-select syncode-lang-select"
							title="Select Language"
							value={fileExtensionValue}
							onChange={changeLanguage}
						>
							<option value="0">C++</option>
							<option value="1">Python</option>
							<option value="2">JavaScript</option>
							<option value="3">C</option>
							<option value="4">Java</option>
							<option value="5">Go</option>
						</select>
					</div>

					{/* Center Group: Run Button & Font Size */}
					<div className="syncode-nav-center">
						<button
							type="button"
							className={`syncode-run-btn ${props.isRunning ? 'running' : ''}`}
							title={props.isRunning ? "Running code..." : "Run Code (Compile & Execute)"}
							disabled={Boolean(props.isRunning)}
							onClick={props.runcode}
						>
							<PlayArrowRoundedIcon fontSize="small" className="syncode-run-icon" />
							<span className="syncode-btn-text">{props.isRunning ? "Running..." : "Run"}</span>
						</button>

						<select
							className="syncode-select syncode-font-select"
							title="Editor Font Size"
							defaultValue="3"
							onChange={changeFontSize}
						>
							<option value="0">10px</option>
							<option value="1">12px</option>
							<option value="2">14px</option>
							<option value="3">16px</option>
							<option value="4">18px</option>
							<option value="5">20px</option>
							<option value="6">22px</option>
							<option value="7">24px</option>
							<option value="8">26px</option>
							<option value="9">28px</option>
							<option value="10">30px</option>
						</select>
					</div>

					{/* Right Group: Collab Tools, AI, Chat, Theme, Download/Upload, Leave */}
					<div className="syncode-nav-right">
						<div className="syncode-participants-wrapper" ref={usersPopupRef}>
							<button
								type="button"
								className={`syncode-participants-pill ${isUsersPopupOpen ? 'active' : ''}`}
								onClick={() => setIsUsersPopupOpen(!isUsersPopupOpen)}
								title="Click to view all online users in this room"
							>
								<span className="syncode-live-dot" />
								<span className="syncode-participants-text">
									{usersList.length > 0 ? usersList.length : users || 1} online
								</span>
							</button>

							{isUsersPopupOpen && (
								<div className="syncode-users-popover">
									<div className="syncode-users-popover-header">
										<div className="syncode-users-popover-title">
											<span className="syncode-live-dot" />
											<span>Collaborators ({usersList.length > 0 ? usersList.length : users || 1})</span>
										</div>
										<button
											type="button"
											className="syncode-users-popover-close"
											onClick={() => setIsUsersPopupOpen(false)}
											title="Close"
										>
											✕
										</button>
									</div>

									<div className="syncode-users-list">
										{(usersList.length > 0 ? usersList : [nameOfUser || 'You']).map((uname, index) => {
											const isCurrentUser = uname === nameOfUser;
											return (
												<div key={index} className="syncode-user-item">
													<div className="syncode-user-avatar">
														{uname.charAt(0).toUpperCase()}
													</div>
													<div className="syncode-user-info">
														<span className="syncode-user-name" title={uname}>
															{uname}
														</span>
														{isCurrentUser && (
															<span className="syncode-you-tag">You</span>
														)}
													</div>
													<span className="syncode-user-online-badge">● Active</span>
												</div>
											);
										})}
									</div>

									<div className="syncode-users-popover-footer">
										<button
											type="button"
											className="syncode-invite-btn"
											onClick={() => {
												copyRoomCode();
												setIsUsersPopupOpen(false);
											}}
										>
											<ShareRoundedIcon fontSize="small" className="mr-1" />
											Invite Collaborators
										</button>
									</div>
								</div>
							)}
						</div>

						<button
							type="button"
							className={`syncode-nav-action syncode-ai-btn ${activeSidePanel === "ai" ? "active" : ""}`}
							onClick={() => toggleSidePanel("ai")}
							title="Toggle AI Assistant"
						>
							<span className="syncode-ai-star">✦</span>
							<span className="syncode-btn-text">AI Help</span>
						</button>

						<button
							type="button"
							className={`syncode-nav-action ${activeSidePanel === "chat" ? "active" : ""}`}
							onClick={() => toggleSidePanel("chat")}
							title={hasUnreadChat ? "New unread team message - Open Chat" : "Toggle Team Chat"}
						>
							<div className="syncode-chat-icon-container">
								<ChatBubbleOutlineRoundedIcon fontSize="small" />
								{hasUnreadChat && (
									<span className="syncode-chat-unread-dot" title="New unread message" />
								)}
							</div>
							<span className="syncode-btn-text">Chat</span>
						</button>

						<IconButton
							className="syncode-icon-btn"
							color="primary"
							onClick={copyRoomCode}
							title="Copy Room Link & Code"
						>
							<ShareRoundedIcon fontSize="small" />
						</IconButton>

						<IconButton
							className="syncode-icon-btn"
							color="primary"
							onClick={downloadCode}
							title="Download Code File"
						>
							<GetAppRoundedIcon fontSize="small" />
						</IconButton>

						<IconButton
							className="syncode-icon-btn"
							color="primary"
							onClick={handleUpload}
							title="Upload Local File"
						>
							<PublishRoundedIcon fontSize="small" />
						</IconButton>
						<input
							type="file"
							ref={hiddenFileInput}
							onChange={(e) => showFile(e)}
							style={{ display: 'none' }}
						/>

						<IconButton
							className="syncode-icon-btn"
							color="primary"
							onClick={toggleTheme}
							title={theme === "vs-dark" ? "Switch to Light theme" : "Switch to Dark theme"}
						>
							{theme === "vs-dark" ? (
								<Brightness7RoundedIcon fontSize="small" />
							) : (
								<Brightness4RoundedIcon fontSize="small" />
							)}
						</IconButton>

						<IconButton
							className="syncode-icon-btn syncode-leave-btn"
							onClick={leaveRoom}
							title="Leave Room"
						>
							<ExitToAppRoundedIcon fontSize="small" />
						</IconButton>
					</div>
				</nav>

				<div className="syncode-main-row">
					<div className="syncode-editor-wrapper">
						<Editor
							height="100%"
							width="100%"
							theme={theme}
							language={language}
							value={value}
							onMount={handleEditorDidMount}
							onChange={handleEditorChange}
							loading={<div className="syncode-editor-loading">Loading editor...</div>}
							options={{
								fontSize: fontsize,
								minimap: { enabled: false },
								scrollBeyondLastLine: false,
								automaticLayout: true,
								tabSize: 4,
								wordWrap: 'on',
								suggestOnTriggerCharacters: true,
								quickSuggestions: true,
							}}
						/>
					</div>

					{activeSidePanel && (
						<aside className="syncode-docked-panel" aria-label="Side Panel">
							<div className="syncode-docked-card">
								<div className="syncode-docked-header">
									<div className="syncode-docked-title">
										{activeSidePanel === "chat" ? (
											<>
												<ChatBubbleOutlineRoundedIcon fontSize="small" />
												<span>Room Chat</span>
											</>
										) : (
											<>
												<span className="syncode-ai-sparkle">✦</span>
												<span>AI Assistant</span>
											</>
										)}
									</div>
									<div className="syncode-docked-actions">
										{activeSidePanel === "chat" && <span className="syncode-online-badge">● Live</span>}
										<IconButton size="small" onClick={() => setActiveSidePanel(null)} title="Close panel">
											<CloseRoundedIcon fontSize="small" />
										</IconButton>
									</div>
								</div>

								<div className="syncode-docked-body">
									{activeSidePanel === "chat" ? (
										<div className="syncode-chat-container">
											<Messages messages={messages} nameOfUser={nameOfUser} />
											<Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
										</div>
									) : (
										<AIChatPanel roomId={id} />
									)}
								</div>
							</div>
						</aside>
					)}
				</div>
				</>
				)}
			</BrowserView>
		</>
	);

}

export default MyEditor;
