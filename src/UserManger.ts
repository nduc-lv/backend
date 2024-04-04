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
            this.waitlist.push(user);
        }
        else{
            console.log("go into here");
            for (let i = 0; i < this.waitlist.length; i++){
                console.log("and here")
                // need to have a more sophisticated algorithm to match
                if (user.userId == this.waitlist[i].userId){
                    console.log("true?")
                    console.log(user.userId, this.waitlist[i].userId);
                    continue;
                }
                // priority language
                if (user.profile.language != this.waitlist[i].profile.language){
                    console.log("language")
                    continue;
                }
                if (user.profile.age != this.waitlist[i].profile.age){
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
                        continue;
                    }
                }
                else if (user.profile.sexualInterests != this.waitlist[i].profile.gender || this.waitlist[i].profile.sexualInterests != user.profile.gender){
                    console.log("user gender", user.profile.gender);
                    console.log("user interests", user.profile.sexualInterests);
                    console.log("candidate gender", this.waitlist[i].profile.gender);
                    console.log("candidate interest", this.waitlist[i].profile.sexualInterests);
                    continue;
                }
                // match interests
                let currScore = 0;
                for (let j = 0; j < 5; j++){
                    console.log(this.waitlist[i].profile.interests);
                    console.log(user.profile.interests);
                    if (this.waitlist[i].profile.interests.includes(user.profile.interests[j])){
                        console.log(this.waitlist[i].profile.interests);
                        console.log(user.profile.interests);
                        currScore += 1;
                    }
                    else{
                        console.log("not match")
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
                this.waitlist.push(user);  
            }
            else{
                const roomId = v4();
                console.log(user.socket.id);
                user.socket.emit("found-peer", roomId);
                candidate!.socket.emit("found-peer", roomId);
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