import { Socket } from "socket.io";
import { RoomManger } from "@src/RoomManager";
import {v4} from "uuid";
// add interests
import { User } from "./util/UserInterface";


export class UserManager{
    private waitlist:Array<User>;
    private userList:Array<User>;
    private roomManager:RoomManger;
    constructor(){
        this.roomManager = new RoomManger();
        this.waitlist = new Array<User>;
        this.userList = new Array<User>;
    }

    addUser(user: User){
        user.profile.interests.sort();
        this.userList.push(user);
    }

    matchUser(user: User){
        let maxScore = 0;
        let candidate:User;
        let candidateIndex = -1;
        if (this.waitlist.length == 0){
            console.log("waiting queue is empty");
            this.waitlist.push(user);
        }
        else{
            console.log("go into here");
            for (let i = 0; i < this.waitlist.length; i++){
                console.log("and here")
                // need to have a more sophisticated algorithm to match
                if (user.userId == this.waitlist[i].userId){
                    console.log("same user");
                    continue;
                }
                // priority language
                if (user.profile.language != this.waitlist[i].profile.language){
                    console.log("language")
                    continue;
                }
                if (user.profile.age != this.waitlist[i].profile.age){
                    console.log("age");
                    continue;
                }
                // priority gender and sexual interests
                // if (user.profile.sexualInterests == 2){
                //     if (this.waitlist[i].profile.sexualInterests != 2 && this.waitlist[i].profile.sexualInterests != user.profile.gender){
                //         continue;
                //     }
                // }
                // else if (user.profile.sexualInterests != this.waitlist[i].profile.gender || this.waitlist[i].profile.sexualInterests != user.profile.gender){
                //     continue;
                // }
                if (user.profile.sexualInterests == 2){
                    if (this.waitlist[i].profile.sexualInterests != 2 && this.waitlist[i].profile.sexualInterests != user.profile.gender){
                        console.log("gender 1");
                        continue;
                    }
                }
                else if (user.profile.sexualInterests != this.waitlist[i].profile.gender || this.waitlist[i].profile.sexualInterests != user.profile.gender){
                    console.log("gender 2");
                    continue;
                }
                // match interests
                let currScore = 0;
                for (let j = 0; j < 5; j++){
                    if (this.waitlist[i].profile.interests.includes(user.profile.interests[j])){
                        console.log("match + 1");
                        currScore += 1;
                    }
                }
                if (currScore > maxScore){
                    maxScore = currScore;
                    candidate = this.waitlist[i];
                    candidateIndex = i;
                }
                // if (user.userId != this.waitlist[i].userId){
                //     const roomId = uuid();
                //     user.socket.emit("found-peer", roomId);
                //     this.waitlist[i].socket.emit("found-peer", roomId);
                //     this.waitlist.splice(i, 1);
                //     return;
                // }
            }
            if (maxScore == 0){
                console.log("no matched candidate")
                this.waitlist.push(user);  
            }
            else{
                console.log("found peer", candidate!.profile.name);
                const roomId = v4();
                console.log(user.socket.id);
                user.socket.emit("found-peer", roomId, candidate!.profile.name);
                candidate!.socket.emit("found-peer", roomId, user.profile.name);
                this.waitlist.splice(candidateIndex, 1);
            }
            
        }
    }
    removeUser(socket: Socket){
        this.userList = this.userList.filter((eachUser) => {
            return (eachUser.socket.id != socket.id)
        })
        this.waitlist = this.waitlist.filter((each) => {
            return (each.socket.id != socket.id)
        })
    }
    // need functions to communicate to users in the room
}