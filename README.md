# WeCode - Real-Time Collaborative Code Editor

WeCode is a powerful, web-based collaborative code editor that allows multiple developers to write, edit, and run code together in real-time. Built with modern web technologies, it features a full-fledged in-browser execution environment, live cursors, and seamless project management.

## 🚀 Features

- **Real-Time Collaboration**: Powered by [Yjs](https://yjs.dev/) and WebSockets, experience blazing-fast synchronized typing with your team.
- **Live Multi-player Cursors**: See exactly who is typing what and where, with dynamic color-coded cursors and hover name tags.
- **In-Browser Execution**: Run full-stack Node.js, React, and Vue applications directly in your browser using [WebContainers](https://webcontainers.io/). No remote servers required for execution!
- **Rich Code Editor**: Integrated with [Monaco Editor](https://microsoft.github.io/monaco-editor/) (the engine behind VS Code) for syntax highlighting, autocompletion, and a premium editing experience.
- **Project Management**: Create, duplicate, and manage workspaces. Invite collaborators and manage project access securely.
- **Team Presence & Chat**: View who is currently online in your workspace with live avatar indicators and communicate via the integrated ephemeral chat.
- **Modern UI/UX**: A sleek, responsive, glassmorphic interface with full dark mode support.

## 🛠️ Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- Monaco Editor (`@monaco-editor/react`, `y-monaco`)
- WebContainer API (`@webcontainer/api`)
- Socket.IO Client
- xterm.js (Terminal emulator)

**Backend**
- Node.js & Express
- MongoDB & Mongoose
- Socket.IO (WebSockets)
- JWT Authentication
- Cloudinary (Avatar image hosting)

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (local or Atlas)
- Cloudinary account (for profile image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Collaborative Code Editor"
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`.

## 🤝 Collaboration Workflow
1. Create an account and start a new project.
2. Share the unique Project ID with your teammates.
3. Teammates can request to join via their dashboard.
4. Accept their request, and they will immediately appear in your workspace.
5. Start coding together!
