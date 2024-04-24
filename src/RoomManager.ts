import {Socket} from "socket.io";
import { uuid } from "uuidv4";
import { RoomProfileInterface } from "./util/RoomProfileInterface";


export class RoomManger{
    private rooms: Map<string, RoomProfileInterface>;
    private socketRoom: Map<string, string>;
    constructor(){
        this.rooms = new Map<string, RoomProfileInterface>();
        this.socketRoom = new Map<string, string>()
    }

    public addRoom(room: RoomProfileInterface){
        this.rooms.set(room.roomId, room);
        this.socketRoom.set(room.socketId, room.roomId);
        console.log("Room added", room.roomId);
    }

    public getRooms(){
        return Array.from(this.rooms, ([roomId, room]) => {
            if (!room.private){
                return room;
            }
        })
    }
    public deleteRoomByRoomId(roomId: string){
        this.rooms.delete(roomId);
    }
    public deleteRoomBySocketId(socketId: string) {
        const roomId = this.socketRoom.get(socketId);
        this.socketRoom.delete(socketId);
        if (roomId){
            this.rooms.delete(roomId);
        }
    }
}