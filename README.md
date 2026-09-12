# SynCode

A real-time collaborative code editor built with the MERN stack and Socket.io. It allows multiple developers to write, discuss, and run code together in virtual rooms with multi-language execution and an integrated AI assistant.

---

## 🎥 Video Tutorial & Demo

Check out the full walkthrough video of SynCode in action:

▶ **[Watch Video Tutorial (Video syncode project.mp4)](./Video%20syncode%20project.mp4)**

---

## What It Does

- **Real-Time Code Collaboration:** Edit code simultaneously with peers in shared rooms with live synchronization powered by Socket.io and Monaco Editor.
- **Multi-Language Execution:** Compile and run C++, Python, JavaScript, Java, C, and Go programs with custom standard input (stdin) using the JDoodle API.
- **Execution Caching:** Server-side caching for identical runs within 2 minutes to prevent rate limits and preserve daily compiler credits.
- **Integrated AI Helper:** A concise coding assistant powered by Google Gemini (gemini-3.6-flash) for debugging, explanations, and code review with persistent chat history.
- **Room Chat:** Dedicated side panel for text communication between room members without obscuring the code editor.
- **User Authentication & Password Reset:** JWT-based login, secure passwords with bcrypt, and OTP-based password reset sent via Gmail SMTP.

---

## Tech Stack

- **Frontend:** React 17, Vite, Monaco Editor (`@monaco-editor/react`), Socket.io Client, Material-UI, React-Reflex, Axios
- **Backend:** Node.js, Express, Socket.io, Mongoose (MongoDB Atlas), Nodemailer, `@google/genai`
- **APIs:** JDoodle Compiler API, Google Gemini API

---

## Project Structure

```
Collaborative-Code-Editor/
├── client/                     # Frontend React application (Vite)
│   ├── public/                 # Static assets and SPA routing rules
│   ├── src/
│   │   ├── components/         # Editor, chat, rooms, input/output panels
│   │   ├── pages/              # Login, signup, forgot password pages
│   │   ├── App.jsx             # Router and socket initialization
│   │   └── auth.js             # Authentication context and session management
│   ├── vercel.json             # SPA rewrites for Vercel
│   └── vite.config.js
│
├── server/                     # Backend Node.js API & Socket.io server
│   ├── src/
│   │   ├── db/                 # MongoDB database connection
│   │   ├── middleware/         # JWT authentication middleware
│   │   ├── models/             # User and Room schemas
│   │   ├── router/             # Auth and AI routes
│   │   ├── services/           # Nodemailer email service
│   │   ├── config.env.example  # Example environment variables
│   │   └── index.js            # Server entrypoint and execution handler
│   └── package.json
└── README.md
```

---

## Environment Variables

Create a file named `config.env` in `server/src/` with the following variables:

```env
DATABASE=your_mongodb_connection_string
PORT=5000
SECRET_KEY=your_random_secret_key
CLIENT_URL=http://localhost:5173

# JDoodle Compiler API
JDOODLE_CLIENT_ID=your_jdoodle_client_id
JDOODLE_CLIENT_SECRET=your_jdoodle_client_secret
JDOODLE_URL=https://api.jdoodle.com/v1/execute

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash
GEMINI_MAX_TOKENS=450

# Email (Gmail SMTP for password reset)
EMAIL_SERVICE=gmail
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
EMAIL_FROM="SynCode Support" <your_email@gmail.com>
```

---

## Running Locally

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB)
- Free JDoodle API credentials
- Free Google Gemini API key

### 1. Clone the repository
```bash
git clone https://github.com/Atul51-prog/Collaborative-Code-Editor.git
cd Collaborative-Code-Editor
```

### 2. Setup the Server
```bash
cd server
npm install
npm start
```
The server will run on `http://localhost:5000`.

### 3. Setup the Client
In a new terminal:
```bash
cd client
npm install
npm start
```
The client will open on `http://localhost:5173`.

---

## Deployment

- **Backend:** Can be deployed to [Render](https://render.com) or [Railway](https://railway.app) as a Web Service. Set root directory to `server`, build command to `npm install`, and start command to `npm start`. Add environment variables in the dashboard.
- **Frontend:** Can be deployed to [Vercel](https://vercel.com) or [Netlify](https://netlify.com). Set root directory to `client`, build command to `npm run build`, output directory to `dist`, and set `VITE_BACKEND_URL` to your live backend URL.

---

## License

This project is licensed under the ISC License.
