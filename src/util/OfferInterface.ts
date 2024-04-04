import { User } from "./UserInterface";
import { Socket } from "socket.io";
import { Profile } from "./UserInterface";

export interface Offer{
    userId: string,
    profile: Profile,
}