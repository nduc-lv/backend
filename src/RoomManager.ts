import {Socket} from "socket.io";
import { uuid } from "uuidv4";
import { RoomProfileInterface } from "./util/RoomProfileInterface";


export class RoomManger{
    private rooms: Map<string, RoomProfileInterface>;
    constructor(){
        this.rooms = new Map<string, RoomProfileInterface>();
    }

    addRoom(room: RoomProfileInterface){
        this.rooms.set(room.roomId, room)
        console.log("Room added", room.roomId)
    }

    getRooms(){
        return Array.from(this.rooms, ([roomId, room]) => {
            if (!room.private){
                return room
            }
        })
    }
}