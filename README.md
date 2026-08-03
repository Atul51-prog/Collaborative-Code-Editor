# SynCode

## Overview

SynCode is a real-time collaborative code editor designed for developers to code, discuss, and execute programs together in a shared environment. It provides a seamless experience for pair programming, technical interviews, or collaborative learning.

## Features

- **Real-time Collaboration:** Synchronized code editing across multiple users using Socket.io.
- **Multi-Language Support:** Supports C++, Python, JavaScript, C, Java, and Go.
- **Code Execution:** Integrated with JDoodle API to compile and run code directly in the browser.
- **Live Chat:** Built-in chat functionality for real-time communication within the room.
- **Room Management:** Create or join rooms via unique room codes.
- **Customization:** Support for Light/Dark themes and adjustable font sizes.
- **File Operations:** Download code snippets or upload files directly into the editor.
- **Authentication:** Secure user registration and login system using JWT and MongoDB.

## Tech Stack

- **Frontend:** React.js, Material-UI, Bootstrap, Monaco Editor, Socket.io-client.
- **Backend:** Node.js, Express.js, Socket.io, Mongoose (MongoDB).
- **Authentication:** JSON Web Tokens (JWT), Bcryptjs.
- **Execution Engine:** JDoodle API.

## Folder Structure

- `/client`: Contains the React frontend application.
- `/server`: Contains the Node.js/Express backend, API routes, and database models.

## Installation

### Prerequisites

- Node.js installed
- MongoDB instance (or Atlas connection string)
- JDoodle API credentials

### Setup

1. Clone the repository.
2. **Server Setup:**
   - Navigate to `/server`.
   - Create a `config.env` file based on `src/config.env.example`.
   - Run `npm install`.
   - Start the server: `node src/index.js`.
3. **Client Setup:**
   - Navigate to `/client`.
   - Run `npm install`.
   - Start the development server: `npm start`.

## Usage

1. Register or Login to your account.
2. Navigate to the "Room" section.
3. Create a new room or join an existing one using a room code.
4. Share the room code with collaborators.
5. Select a language, write code, and use the "Run" button to execute.

## Scripts

- **Client:**
  - `npm start`: Runs the app in development mode.
  - `npm run build`: Builds the app for production.
- **Server:**
  - The server is configured to run via `node src/index.js`.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the ISC License.
