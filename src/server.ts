/**
 * Setup express server.
*/

import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';
import logger from 'jet-logger';
import 'express-async-errors';

import BaseRouter from '@src/routes/api';
import Paths from '@src/constants/Paths';

import EnvVars from '@src/constants/EnvVars';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';

import { NodeEnvs } from '@src/constants/misc';
import { RouteError } from '@src/other/classes';

import http from 'http';
import * as socketio from "socket.io";
import { UserManager } from './UserManger';
import { User } from './util/UserInterface';
import { Offer } from './util/OfferInterface';
import { RoomProfileInterface } from './util/RoomProfileInterface';
import cors from "cors";
import { RoomManger } from './RoomManager';
import userRouter from '@src/routes/api';
// **** Variables **** //

const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server, {cors: {
  origin: '*',
}});
const userManager = new UserManager();
const roomManger = new RoomManger(); 
// **** Setup **** //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser(EnvVars.CookieProps.Secret));
app.use(cors());
// Show routes called in console during development
if (EnvVars.NodeEnv === NodeEnvs.Dev.valueOf()) {
  app.use(morgan('dev'));
}

// Security
if (EnvVars.NodeEnv === NodeEnvs.Production.valueOf()) {
  app.use(helmet());
}

// Add APIs, must be after middleware
app.use(Paths.Base, BaseRouter);

// Add error handler
app.use((
  err: Error,
  _: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (EnvVars.NodeEnv !== NodeEnvs.Test.valueOf()) {
    logger.err(err, true);
  }
  let status = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status = err.status;
  }
  return res.status(status).json({ error: err.message });
});


// ** Front-End Content ** //

// Set views directory (html)
const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);

// Set static directory (js and css).
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// Nav to users pg by default
app.get('/', (_: Request, res: Response) => {
  return res.sendFile('users.html', { root: viewsDir })
});

// Redirect to login if not logged in.
app.get('/users', (_: Request, res: Response) => {
  return res.sendFile('users.html', { root: viewsDir });
});

app.use("/api", userRouter);


io.on("connection", (socket: socketio.Socket) => {
  console.log("a new user connected", socket.id);
  socket.join(socket.id);
  socket.emit("room-list", roomManger.getRooms());
  // add interest
  socket.on("match-user", (offer: Offer) => {
    // get offer instead of userName
    console.log("an user wants to match", socket.id);
    const user:User = {
      ...offer,
      socket: socket,
    }
    // need some condition to check
    userManager.addUser(user);
    userManager.matchUser(user);
  });
  socket.on("join-room", (roomId:string, peerId:string) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', peerId);
    console.log("Peer: ",peerId);
    console.log(roomId);
  })
  socket.on("disconnect", (reason) => {
    // need to find which room this guy in
    userManager.removeUser(socket);
    roomManger.deleteRoomBySocketId(socket.id)
    io.emit("new-room-added", roomManger.getRooms());
    const uid = roomManger.getSocketFollow(socket.id)
    console.log(uid)
    if (uid) {
      console.log("logout", uid)
      const followers = roomManger.getFollowers(uid);
      console.log(followers)
      if (followers){
        for (let i = 0; i < followers?.length; i++){
          console.log("send to", followers[i])
          io.to(followers[i]).emit("logout", uid)
        }
      }
      roomManger.deleteFollowRoom(uid)
    }
    console.log(reason, socket.id);
  });
  socket.on("share-video", (roomId:string) => {
    socket.to(roomId).emit("sharing");
  });
  socket.on("watch-video", (roomId:string, videoId:string)=>{
    console.log("watch-video", roomId, videoId);
    socket.to(roomId).emit('found-video',videoId);
  });
  socket.on("video-seek", (roomId, timeToSeek) => {
    socket.to(roomId).emit("video-seek", timeToSeek);
  });
  socket.on('video-stop', (roomId) => {
    socket.to(roomId).emit("video-stop");
  });
  socket.on("video-play", (roomId) => {
    socket.to(roomId).emit("video-play");
  });
  socket.on("peer-success", (id:string) => {
    io.to(socket.id).emit("peer-success");
  });
  socket.on("peer-fail", (id:string)=>{
    io.to(id).emit("peer-fail");
  });
  socket.on("connection-ebstablished", (id:string)=>{
    io.to(id).emit("connection-ebstablished");
  })
  socket.on("connection-failed", (id:string) => {
    io.to(id).emit("connection-failed");
  });
  socket.on("reconnect", (id:string) => {
    io.to(id).emit("reconnect");
  });
  socket.on("text-messages", (message, roomId) => {
    socket.to(roomId).emit("text-messages", message);
  })
  socket.on("create-room", (roomProfile:RoomProfileInterface) => {
    roomManger.addRoom(roomProfile);
    const rooms = roomManger.getRooms();
    io.emit("new-room-added", rooms);
  })
  socket.on("join-request", (socketId, name, gender) => {
    socket.to(socketId).emit("join-request", {name, gender, socketId: socket.id})
  })
  socket.on("found-peer", (socketId, roomId, peerName) => {
    console.log("found-peer", socket.id, socketId)
    io.to(socketId).emit("found-peer", roomId, peerName)
  })
  socket.on("request-accepted", (socketId, roomId,name) => {
    console.log("request-accepted")
    roomManger.deleteRoomByRoomId(roomId);
    io.except(socketId).emit("new-room-added", roomManger.getRooms());
    socket.to(socketId).emit("request-accepted", roomId, name)
  });
  socket.on("quit-room", (roomId) => {
    roomManger.deleteRoomByRoomId(roomId);
    io.emit("new-room-added", roomManger.getRooms());
  })
  socket.on("decline-user", (socketId) => {
    socket.to(socketId).emit("request-declined")
  })
  socket.on("get-available-rooms", () => {
    io.to(socket.id).emit("new-room-added", roomManger.getRooms());
  })
  socket.on("check-room", (socketId: string) => {
    const exist:boolean = roomManger.checkRoom(socketId);
    io.to(socket.id).emit("confirm-room", exist)
  })
  socket.on("alone-video-play", (socketId: string) => {
    io.emit(`alone-video-play-${socketId}`);
  })
  socket.on("alone-video-stop", (socketId: string) => {
    io.emit(`alone-video-stop-${socketId}`);
  })
  socket.on("alone-video-seek", (socketId: string, timeToSeek: number) => {
    io.emit(`alone-video-seek-${socketId}`, timeToSeek)
  })
  socket.on('add-video', (socketId:string, videoId: string) => {
    roomManger.addVideo(socketId, videoId);
    const youtube = roomManger.getVideo(socketId)
    io.emit(`preview-${socketId}`, youtube)
  })
  socket.on("remove-video", (socketId:string) => {
    io.emit(`remove-video-${socketId}`)
    roomManger.removeVideo(socketId)
  })
  socket.on("preview", (reqId: string, preWatchId: string) => {
    const youtube = roomManger.getVideo(preWatchId)
    io.to(reqId).emit(`preview-${preWatchId}`, youtube)
  })
  socket.on("get-latest", (reqId:string, toId:string) => {
    io.to(toId).emit("get-latest", reqId)
  })
  socket.on("latest-timestamp", (timeStamp:number, socketId:string) => {
    io.to(socketId).emit("latest-timestamp", timeStamp)
  })
  socket.on("follow", (uid:string, roomId:string) => {
    socket.to(roomId).emit("follow", uid)
  })
  socket.on("follow-err", (roomId:string) => {
    socket.to(roomId).emit("follow-err")
  })
  socket.on("follow-success", (roomId: string) => {
    socket.to(roomId).emit("follow-success")
  })
  socket.on("login", (uid: string) => {
    socket.join(uid)
    roomManger.addFollowRoom(uid)
    roomManger.addSocketFollow(socket.id, uid)
  })
  socket.on("notify", (uid2:string, name:string, uid1:string) => {
    roomManger.addFollwedUser(uid1, uid2)
    roomManger.addFollwedUser(uid2, uid1)
    socket.to(uid2).emit("online", name, uid1);
  })
  socket.on("me-too", (uid1:string, name:string, uidFollow: string) => {
    socket.to(uid1).emit("me-too", name, uidFollow);
  })
  socket.on("toggle-camera", (roomId:string, mode:boolean) => {
    socket.to(roomId).emit("toggle-camera", mode)
  })
  socket.on("chat", (roomId: string, mode: string) => {
    socket.to(roomId).emit("chat", mode)
  })
  socket.on("logout", (uid:string) => {
    const followers = roomManger.getFollowers(uid);
    if (followers){
      for (let i = 0; i < followers.length; i++){
        socket.to(followers[i]).emit("logout", uid)
      }
    }
  })
  socket.on("follow-dup", (roomId:string) => {
    socket.to(roomId).emit("follow-dup")
  })
  socket.on("unfollowed", (uid: string, uid2: string) => {
    socket.to(uid).emit("unfollowed", uid2)
  })
});


// **** Export default **** //

export default server;
