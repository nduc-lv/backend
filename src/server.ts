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
import { Socket } from 'dgram';
import { UserManager } from './UserManger';
import { User } from './util/UserInterface';
import { Offer } from './util/OfferInterface';
// **** Variables **** //

const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server, {cors: {
  origin: '*',
}});
const userManager = new UserManager();
// **** Setup **** //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser(EnvVars.CookieProps.Secret));

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


io.on("connection", (socket: socketio.Socket) => {
  console.log("a new user connected", socket.id);
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
    console.log(reason, socket.id);
  });
  socket.on("share-video", (roomId:string) => {
    socket.to(roomId).emit("sharing");
  })
})

// **** Export default **** //

export default server;
