import {Socket} from "socket.io";
import { uuid } from "uuidv4";

interface User{
    userName: string;
    socket: Socket;
}
interface Room{
    user1: User;
    user2: User
}
export class RoomManger{
    private rooms: Map<string, Room>;

    constructor(){
        this.rooms = new Map<string, Room>();
    }

    // createRoom(user1: User, user2: User){
    //     const roomId = uuid();
    //     this.rooms.set(roomId, {user1, user2});
    //     // let the user know a room has been created
    //     user1.socket.emit("found-room", roomId);
    //     user2.socket.emit("found-room", roomId);

    //     // join room
    //     user1.socket.join(roomId);
    //     user2.socket.join(roomId);
    //     user1.socket.to(roomId).emit("connected", "hi");
    //     user2.socket.to(roomId).emit("connected", "hi");
    // }

    // need functions to access room
}