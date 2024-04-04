import { Socket } from "socket.io";
import { UserManager } from "./UserManger";
interface Interests{

}
interface Offer{
  id: string,
  interests: Interests
}

const userManager = new UserManager();


function addSocketListener(socket:Socket){
    // an offer come (want to match)
    socket.on("offer", (offer: Offer) => {
        const user = {
            userName: offer.id,
            socket: socket,
        }
        userManager.addUser(user);
        userManager.matchUser(user);
    });
    
}
