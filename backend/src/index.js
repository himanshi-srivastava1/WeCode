import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/index.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { initializeSocket } from "./socketManager.js";
import { WebSocketServer } from 'ws';

// Create a require function to safely import y-websocket's internal utilities
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { setupWSConnection } = require('y-websocket/bin/utils');

const port = process.env.PORT || 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
        credentials: true
    }
});

const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws, req) => {
    // Determine document name based on URL, e.g., /yjs/projectId
    let docName = 'default';
    if (req.url) {
        const urlParts = req.url.split('/');
        if (urlParts.length > 2 && urlParts[1] === 'yjs') {
            docName = urlParts[2];
        }
    }
    setupWSConnection(ws, req, { docName });
});

httpServer.on('upgrade', (request, socket, head) => {
    if (request.url.startsWith('/yjs/')) {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    }
});

initializeSocket(io);

connectDB()
    .then(() => {
        httpServer.listen(port, () => {
            console.log(`App is listening on port ${port}`);
        })
    })
    .catch((err) => {
        console.log("MongoDB connection error ", err);
        process.exit(1);
    });