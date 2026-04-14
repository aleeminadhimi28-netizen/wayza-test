import { Server } from "socket.io";

let io;

export const initSocket = (server, allowedOrigins) => {
    io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log(`[Socket] New client connected: ${socket.id}`);

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
