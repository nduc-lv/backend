import {Socket} from "socket.io";
import { uuid } from "uuidv4";
import { RoomProfileInterface } from "./util/RoomProfileInterface";

interface YoutubePlayer{
    playing: boolean,
    timeToSeek: number | null,
    videoId: string | null,
}
export class RoomManger{
    private rooms: Map<string, RoomProfileInterface>;
    private socketRoom: Map<string, string>;
    private socketYoutube: Map<string, YoutubePlayer>;
    private followRoom: Map<string, Array<string>>;
    private socketFollow: Map<string, string>;
    constructor(){
        this.rooms = new Map<string, RoomProfileInterface>();
        this.socketRoom = new Map<string, string>()
        this.socketYoutube = new Map<string, YoutubePlayer>()
        this.followRoom = new Map<string, Array<string>>()
        this.socketFollow = new Map<string, string>
    }

    public addRoom(room: RoomProfileInterface){
        this.rooms.set(room.roomId, room);
        this.socketRoom.set(room.socketId, room.roomId);
        this.socketYoutube.set(room.socketId, {playing: false, timeToSeek: 0, videoId: ""})
        console.log("Room added", room.roomId);
    }

    public getRooms(){
        return Array.from(this.rooms, ([roomId, room]) => {
            console.log(room.private)
            if (room.private != 1){
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
        this.socketYoutube.delete(socketId)
        if (roomId){
            this.rooms.delete(roomId);
        }
    }
    public checkRoom(socketId: string) {
        return this.socketRoom.has(socketId);
    }
    public playVideo(socketId: string) {
        const timeToSeek = this.socketYoutube.get(socketId)!.timeToSeek;
        const videoId = this.socketYoutube.get(socketId)!.videoId;
        this.socketYoutube.set(socketId, {playing: true, timeToSeek, videoId});
    }
    public stopVideo(socketId: string) {
        const timeToSeek = this.socketYoutube.get(socketId)!.timeToSeek;
        const videoId = this.socketYoutube.get(socketId)!.videoId;
        this.socketYoutube.set(socketId, {playing: false, timeToSeek, videoId});
    }
    public seekVideo(socketId: string, timeToSeek:number) {
        const playing = this.socketYoutube.get(socketId)!.playing;
        const videoId = this.socketYoutube.get(socketId)!.videoId;
        this.socketYoutube.set(socketId, {playing, timeToSeek, videoId});
    }
    public addVideo(socketId: string, videoId: string) {
        this.socketYoutube.set(socketId, {playing: true, timeToSeek: 0, videoId});
    }
    public removeVideo(socketId:string) {
        this.socketYoutube.set(socketId, {playing: false, timeToSeek: 0, videoId: ""});
    }
    public getVideo(socketId: string) {
        return this.socketYoutube.get(socketId)
    }
    public addFollowRoom(uid: string) {
        this.followRoom.set(uid, [])
    }
    public addFollwedUser(uid1: string, uid2: string) {
        if (!this.followRoom.get(uid1)?.includes(uid2)) {
            const followers = this.followRoom.get(uid1)
            followers?.push(uid2)
            if (followers){
                this.followRoom.set(uid1, followers)
            }
        }
    }
    public deleteFollowRoom(uid: string){
        this.followRoom.delete(uid)
    }
    public getFollowers(uid: string){
        return this.followRoom.get(uid)
    }
    public addSocketFollow(socketId: string, uid: string){
        this.socketFollow.set(socketId, uid)
    }
    public getSocketFollow(socketId:string) {
        return this.socketFollow.get(socketId)
    }
}