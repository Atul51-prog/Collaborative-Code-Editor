import React, { useState, useRef, useEffect, useCallback } from 'react';
import MyEditor from './../Editor/myEditor';
import Box from './../EditorBox/Box';
import axios from "axios";
import InputBox from './../EditorBox/InputBox';
import { useSnackbar } from 'notistack';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';

import 'react-reflex/styles.css'

import { BACKEND_URL } from './../../config';

const Room = (props) => {

	const socket = props.socket;

	const getLanguageVersion = {
		cpp17: "0", // g++ 17 GCC 9.10
		c: "4",     // C (GCC 9.1.0)
		java: "3",  // JDK 11.0.4
		python3: "3", // 3.7.4
		go: "3",    // 1.13.1
		nodejs: "3", // 12.11.1
	};
	const getLanguage = {
		cpp: "cpp17",
		c: "c",
		java: "java",
		python: "python3",
		go: "go",
		javascript: "nodejs",
	};

	const [input, setInput] = useState("");
	const [languageInRoom, setlanguageInRoom] = useState("cpp");
	const [output, setoutput] = useState("");
	const [codeInRoom, setcodeInRoom] = useState("");
	const [stats, setstats] = useState("");
	const [RoomFontSize, setRoomFontSize] = useState("");
	const [RoomTheme, setRoomTheme] = useState("vs-dark");
	const [isError, setisError] = useState(false);
	const [isRunning, setIsRunning] = useState(false);

	const isRunningRef = useRef(false);
	const executionIdRef = useRef(0);
	const inputRef = useRef(input);
	const codeRef = useRef(codeInRoom);
	const languageRef = useRef(languageInRoom);

	useEffect(() => {
		inputRef.current = input;
	}, [input]);

	useEffect(() => {
		codeRef.current = codeInRoom;
	}, [codeInRoom]);

	useEffect(() => {
		languageRef.current = languageInRoom;
	}, [languageInRoom]);

	const updateInput = useCallback((newVal) => {
		const val = typeof newVal === 'string' ? newVal : String(newVal ?? '');
		inputRef.current = val;
		setInput(val);
	}, []);

	const updateCode = useCallback((newVal) => {
		const val = typeof newVal === 'string' ? newVal : String(newVal ?? '');
		codeRef.current = val;
		setcodeInRoom(val);
	}, []);

	const updateLanguage = useCallback((newVal) => {
		languageRef.current = newVal;
		setlanguageInRoom(newVal);
	}, []);

	const { enqueueSnackbar } = useSnackbar();

	const runCode = async () => {
		if (isRunningRef.current) {
			console.log("Execution already in progress, ignoring duplicate trigger");
			return;
		}

		const currentExecutionId = ++executionIdRef.current;
		isRunningRef.current = true;
		setIsRunning(true);

		try {
			const script = codeRef.current;
			const currentLang = languageRef.current;
			const language = getLanguage[currentLang] || currentLang;
			const versionIndex = getLanguageVersion[language] || "0";
			
			let rawStdin = inputRef.current;
			let stdin = "";
			if (typeof rawStdin === "string") {
				stdin = rawStdin;
			} else if (Array.isArray(rawStdin)) {
				stdin = rawStdin.join("\n");
			} else if (rawStdin !== null && rawStdin !== undefined) {
				stdin = String(rawStdin);
			}
			stdin = stdin.replace(/\r\n/g, "\n");

			console.log("RUN STDIN:", JSON.stringify(stdin));
			console.log("REQUEST STDIN:", JSON.stringify(stdin));

			const response = await axios({
				method: "POST",
				url: `${BACKEND_URL}/execute`,
				data: {
					script: script,
					language: language,
					stdin: stdin,
					versionIndex: versionIndex
				},
				responseType: "json",
			});

			if (executionIdRef.current !== currentExecutionId) {
				return;
			}

			if (response.status === 200 && response.data) {
				const data = response.data;
				const isFailed =
					data.isExecutionSuccess === false ||
					data.isCompiled === false ||
					data.memory === null ||
					(data.statusCode && data.statusCode !== 200);

				if (isFailed) {
					setisError(true);
					enqueueSnackbar(data.isCompiled === false ? 'Compilation Error' : 'Execution Error', {
						variant: "warning"
					});
					const formattedOutput = (data.output || data.error || 'Execution failed').replace(/^\n+/, '');
					setoutput(formattedOutput);
				} else {
					setisError(false);
					enqueueSnackbar('Code executed successfully', {
						variant: "success"
					});
					const rawOutput = data.output ?? '';
					setoutput(rawOutput.replace(/^\n+/, ''));
				}

				const mem = data.memory != null ? `${data.memory} kilobyte(s)` : 'N/A';
				const cpu = data.cpuTime != null ? `${data.cpuTime} sec(s)` : 'N/A';
				setstats(`Memory used: ${mem}.\nCPU time: ${cpu}.`);
			} else {
				setisError(true);
				setoutput(response.data?.error || 'Some error occurred');
				enqueueSnackbar('Some Error occurred', {
					variant: "error"
				});
			}
		} catch (err) {
			if (executionIdRef.current === currentExecutionId) {
				setisError(true);
				const errMsg = err.response?.data?.error || err.response?.data?.output || err.message || 'Execution request failed';
				setoutput(errMsg);
				enqueueSnackbar(errMsg, {
					variant: "error"
				});
			}
		} finally {
			if (executionIdRef.current === currentExecutionId) {
				isRunningRef.current = false;
				setIsRunning(false);
			}
		}
	};

	return (
		<div className="syncode-room-shell">
			<ReflexContainer orientation="horizontal">
				<ReflexElement className="syncode-workspace-element" minSize={200} flex={0.70}>
					<MyEditor
						socket={socket}
						nameOfUser={props.nameOfUser}
						setRoomTheme={setRoomTheme}
						setRoomFontSize={setRoomFontSize}
						runcode={runCode}
						isRunning={isRunning}
						setcodeInRoom={updateCode}
						setlanguageInRoom={updateLanguage}
					>
					</MyEditor>
				</ReflexElement>

				<ReflexSplitter className="syncode-reflex-splitter horizontal" />

				<ReflexElement className="syncode-bottom-row" minSize={120} maxSize={450} flex={0.30}>
					<ReflexContainer orientation="vertical">
						<ReflexElement className="syncode-bottom-panel" minSize={180}>
							<InputBox feature="Input" theme={RoomTheme} setProperty={updateInput} value={input} fontSize={RoomFontSize}/>
						</ReflexElement>
						<ReflexSplitter className="syncode-reflex-splitter vertical" />
						<ReflexElement className="syncode-bottom-panel" minSize={180}>
							<Box feature={isError?"Error":"Output"} theme={RoomTheme} value={output} fontSize={RoomFontSize}/>
						</ReflexElement>
						<ReflexSplitter className="syncode-reflex-splitter vertical" />
						<ReflexElement className="syncode-bottom-panel" minSize={180}>
							<Box feature="Stats" theme={RoomTheme} value={stats} fontSize={RoomFontSize}/>
						</ReflexElement>
					</ReflexContainer>
				</ReflexElement>
			</ReflexContainer>
		</div>
	)
}

export default Room
