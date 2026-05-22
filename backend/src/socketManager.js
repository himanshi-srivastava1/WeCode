import { Project } from "./models/project.models.js";
import { User } from "./models/user.models.js";
import mongoose from "mongoose";

export const initializeSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // User joins the room for their specific project
        socket.on('join-workspace-room', async (data) => {
            const { projectId, user } = data;
            if (!projectId || !user) return;

            socket.join(`project_${projectId}`);
            socket.projectId = projectId;
            socket.userId = user._id;

            console.log(`User ${user.username} joined room project_${projectId}`);

            // Broadcast updated online users
            const room = io.sockets.adapter.rooms.get(`project_${projectId}`);
            const onlineUsersMap = new Map();
            if (room) {
                for (const clientId of room) {
                    const clientSocket = io.sockets.sockets.get(clientId);
                    if (clientSocket && clientSocket.user) {
                        onlineUsersMap.set(clientSocket.user._id.toString(), clientSocket.user);
                    }
                }
            }
            io.to(`project_${projectId}`).emit('online-users-updated', Array.from(onlineUsersMap.values()));
        });

        // Joiner requests to join the project
        socket.on('request-to-join', async (data) => {
            const { projectId, user } = data;
            try {
                const query = mongoose.Types.ObjectId.isValid(projectId) 
                    ? { $or: [{ _id: projectId }, { projectId: projectId }] }
                    : { projectId: projectId };
                
                const project = await Project.findOne(query);
                if (!project) {
                    return io.to(socket.id).emit('join-result', { accepted: false, reason: 'Invalid Project ID' });
                }

                // Emit to the owner in the project room using the actual MongoDB _id
                io.to(`project_${project._id.toString()}`).emit('join-request', {
                    projectId: project._id.toString(),
                    user,
                    socketId: socket.id // We pass the joiner's socket ID to reply directly
                });
            } catch (err) {
                console.error("Error in request-to-join:", err);
                io.to(socket.id).emit('join-result', { accepted: false, reason: 'Server error' });
            }
        });

        // Owner responds to the join request
        socket.on('join-response', async (data) => {
            const { accepted, projectId, joinerId, joinerSocketId } = data;

            if (accepted) {
                try {
                    // Intelligently find project by either MongoDB _id or UUID string
                    const query = mongoose.Types.ObjectId.isValid(projectId) 
                        ? { $or: [{ _id: projectId }, { projectId: projectId }] }
                        : { projectId: projectId };

                    const project = await Project.findOneAndUpdate(
                        query,
                        { $addToSet: { collaborators: joinerId } },
                        { new: true }
                    );
                    
                    const user = await User.findByIdAndUpdate(
                        joinerId,
                        { $addToSet: { collaboratedProjects: project ? project._id : projectId } },
                        { new: true }
                    );

                    if (project && user) {
                        // Inform the joiner that they were accepted
                        io.to(joinerSocketId).emit('join-result', { accepted: true, projectId });
                    } else {
                        io.to(joinerSocketId).emit('join-result', { accepted: false, error: 'Database record not found' });
                    }
                } catch (error) {
                    console.error("Error processing join response:", error);
                    io.to(joinerSocketId).emit('join-result', { accepted: false, error: 'Server error' });
                }
            } else {
                // Inform the joiner that they were declined
                io.to(joinerSocketId).emit('join-result', { accepted: false, reason: 'Declined by owner' });
            }
        });

        // File System Sync Events
        socket.on('file-created', (data) => {
            if (!socket.projectId) return;
            // Broadcast to all other users in the room
            socket.to(`project_${socket.projectId}`).emit('file-created', data);
        });

        socket.on('file-renamed', (data) => {
            if (!socket.projectId) return;
            socket.to(`project_${socket.projectId}`).emit('file-renamed', data);
        });

        socket.on('file-deleted', (data) => {
            if (!socket.projectId) return;
            socket.to(`project_${socket.projectId}`).emit('file-deleted', data);
        });

        socket.on('file-tree-updated', (data) => {
            if (!socket.projectId) return;
            socket.to(`project_${socket.projectId}`).emit('file-tree-updated', data);
        });

        socket.on('opened-files-updated', (data) => {
            if (!socket.projectId) return;
            socket.to(`project_${socket.projectId}`).emit('opened-files-updated', data);
        });

        socket.on('send-chat-message', (data) => {
            if (!socket.projectId) return;
            // Broadcast to everyone in the room including the sender
            io.to(`project_${socket.projectId}`).emit('new-chat-message', data);
        });

        socket.on('leave-workspace-room', async (data) => {
            const { projectId, userId } = data;
            if (!projectId || !userId) return;

            socket.leave(`project_${projectId}`);
            if (socket.projectId === projectId) socket.projectId = null;
            if (socket.userId === userId) socket.userId = null;

            console.log(`User ${userId} left room project_${projectId}`);

            const room = io.sockets.adapter.rooms.get(`project_${projectId}`);
            const onlineUsersMap = new Map();
            if (room) {
                for (const clientId of room) {
                    const clientSocket = io.sockets.sockets.get(clientId);
                    if (clientSocket && clientSocket.user) {
                        onlineUsersMap.set(clientSocket.user._id.toString(), clientSocket.user);
                    }
                }
            }
            io.to(`project_${projectId}`).emit('online-users-updated', Array.from(onlineUsersMap.values()));
        });

        socket.on('disconnect', async () => {
            console.log('User disconnected:', socket.id);
            if (socket.projectId && socket.userId) {
                const room = io.sockets.adapter.rooms.get(`project_${socket.projectId}`);
                const onlineUsersMap = new Map();
                if (room) {
                    for (const clientId of room) {
                        const clientSocket = io.sockets.sockets.get(clientId);
                        if (clientSocket && clientSocket.user) {
                            onlineUsersMap.set(clientSocket.user._id.toString(), clientSocket.user);
                        }
                    }
                }
                io.to(`project_${socket.projectId}`).emit('online-users-updated', Array.from(onlineUsersMap.values()));
            }
        });
    });
};
