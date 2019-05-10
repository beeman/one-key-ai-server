import * as io from 'socket.io';

export class SocketIOServer {
    private static instance: io.Server = io();

    public static getInstance(): io.Server {
        return SocketIOServer.instance;
    }
}