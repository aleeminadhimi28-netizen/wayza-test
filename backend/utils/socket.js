import { Server } from "socket.io";

let io;

export const initSocket = (server, originCheck) => {
    io = new Server(server, {
        cors: {
            origin: originCheck,
            methods: ["GET", "POST"],
            credentials: true
        }
    });


    io.on("connection", (socket) => {
        console.log(`[Socket] New client connected: ${socket.id}`);

        // Join a user-specific room for notifications
        socket.on("join_user", (email) => {
            if (email) {
                socket.join(`user:${email}`);
                console.log(`[Socket] Client ${socket.id} joined user room: ${email}`);
            }
        });

        socket.on("join_room", (bookingId) => {
            socket.join(bookingId);
            console.log(`[Socket] Client ${socket.id} joined room: ${bookingId}`);
        });

        socket.on("leave_room", (bookingId) => {
            socket.leave(bookingId);
            console.log(`[Socket] Client ${socket.id} left room: ${bookingId}`);
        });

        socket.on("disconnect", () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

export const emitMessage = (bookingId, message) => {
    if (io) {
        io.to(bookingId).emit("new_message", message);
    }
};

/**
 * Push a notification to a specific user's socket room
 * @param {string} email - User email
 * @param {object} notification - The notification document
 */
export const emitNotification = (email, notification) => {
    if (io) {
        io.to(`user:${email}`).emit("new_notification", notification);
    }
};
