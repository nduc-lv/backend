import { Router } from 'express';


import {signUp, login, addFollow, removeFollow, getFollowers, getInfo, authen, getMyInfo} from "@src/controller/userController";


// **** Variables **** //





// ** Add UserRouter ** //

const userRouter = Router();
userRouter.post("/signup", signUp);
userRouter.post("/login", login);
userRouter.post("/addFollow", authen, addFollow);
userRouter.post("/removeFollow", authen, removeFollow);
userRouter.get("/getFollowers", authen, getFollowers);
userRouter.get("/getInfo", getInfo);
userRouter.get("/getMyInfo", authen, getMyInfo)

// Get all users


// **** Export default **** //

export default userRouter;
