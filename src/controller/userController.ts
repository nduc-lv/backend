import User from "@src/models/User";
import asyncHandler from "express-async-handler"
import { Request, Response } from 'express';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

interface SignupInterface {
    name: string;
    email: string;
    password: string;
    dateOfBirth: string;
    gender: number;
    sexualInterests: number;
    language: number;
}
interface LoginInterface {
    email: string;
    password: string;
}
export const signUp  = asyncHandler(async (req: Request<object, object, SignupInterface>, res: Response) => {
    const email = req.body.email;
    const user = await User.findOne({email: email});
    if (user){
        res.status(409).json({
             message: "Existed"
         })
        return;
    }
    else{
        const info = {
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10),
            dateOfBirth: req.body.dateOfBirth,
            gender: req.body.gender,
            token: null,
            sexualInterests: req.body.sexualInterests,
            language: req.body.language,
            followed: [],
        }
        const newUser = new User(info);
        await newUser.save();
        res.status(200).json({
            message: "Success"
        });
        return;
    }
})

export const login = asyncHandler(async (req: Request<object, object, LoginInterface>, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({email: email});
    if (user && user.password){
        const isSame = bcrypt.compareSync(password, user?.password);
        if (isSame) {
            const token = jwt.sign({id: user._id}, "hello", {
                expiresIn: '30 days',
            });
            await User.updateOne({_id: user._id}, {token: token})
            res.status(200).json({
                token,
            });
            return;
        }
        res.status(403).json({
            message: "Wrong password"
        })
        return;
    }
    res.status(404).json({
        message: "Not found user"
    })
    return;
});

export const authen = asyncHandler((req: Request, res: Response, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == 'null' || !token) {
        res.sendStatus(400);
        return;
    }
    try {
        const user = jwt.verify(token, 'hello');
        res.locals.user = user;
        next();
        return;
    }
    catch (e) {
        res.status(401).json({
            message: "ERR TOKEN",
        });
        return;
    }
});

export const getFollowers = asyncHandler(async (req: Request, res: Response<object, Record<string, {id: string}>>) => {
    const user = await User.findById(res.locals.user.id).populate("followed").exec();
    res.status(200).json({
        followed: user?.followed,
    });
    return;
});

export const addFollow = asyncHandler(async (req: Request<object,object, {peerId: string}>, res: Response<object, Record<string, {id: string}>>) => {
    console.log(res.locals.user.id);
    console.log(req.body.peerId);
    await User.findByIdAndUpdate(res.locals.user.id, { $push: { followed: req.body.peerId } });
    await User.findByIdAndUpdate(req.body.peerId, {$push: {followed: res.locals.user.id}});
    res.status(200).json({
        message: "Success"
    })
});

export const removeFollow = asyncHandler(async (req: Request<object, object, {peerId: string}>, res: Response<object, Record<string, {id: string}>>) => {
    await User.findByIdAndUpdate(res.locals.user.id, { $pullAll: {followed: [req.body.peerId]}});
    await User.findByIdAndUpdate(req.body.peerId, {$pullAll: {followed: [res.locals.user.id]}});
    res.status(200).json({
        message: "success"
    });
    return;
})

export const getInfo = asyncHandler(async (req: Request<{userId: string}, object, object>, res: Response<object, Record<string, {id: string}>>) => {
    const user = await User.findById(req.params.userId).exec();
    if (!user) {
        res.status(404).json({
            message: "User not found",
        })
        return;
    }
    res.status(200).json({
        uid: user._id,
        name: user?.name,
        gender: user?.gender,
        dateOfBirth: user?.dateOfBirth,
        language: user?.language,
        sexualInterests: user?.sexualInterests,
    });
    return;
});

export const getMyInfo = asyncHandler(async (req: Request, res: Response<object, Record<string, {id: string}>>) => {
    const user = await User.findById(res.locals.user.id).exec();
    if (!user) {
        res.status(404).json({
            message: "User not found",
        })
        return;
    }
    res.status(200).json({
        name: user?.name,
        gender: user?.gender,
        dateOfBirth: user?.dateOfBirth,
        language: user?.language,
        sexualInterests: user?.sexualInterests,
        uid: user._id,
    });
    return;
});


