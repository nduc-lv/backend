// type MAXIMUM_ALLOWED_BOUNDARY = 999
// type ComputeRange<
//   N extends number,
//   Result extends Array<unknown> = [],
// > =
//   /**
//    * If length of Result is equal to N,
//    * stop recursion and return Result
//    */
//   (Result['length'] extends N
//     ? Result
//     /**
//      * Otherwise, call ComputeRange recursively with same N,
//      * but with extendsd Result - add Result.length to current Result
//      * 
//      * First step:
//      * Result is [] -> ComputeRange is called with [...[], 0]
//      * 
//      * Second step:
//      * Result is [0] -> ComputeRange is called with [...[0], 1]
//      * 
//      * Third step:
//      * Result is [0, 1] -> ComputeRange is called with [...[0, 1], 2]
//      * 
//      * ComputeRange is called until Result will meet a length requirement
//      */
//     : ComputeRange<N, [...Result, Result['length']]>
//   )

import { Socket } from "socket.io"

// // 0 , 1, 2 ... 998
// type Language = ComputeRange<MAXIMUM_ALLOWED_BOUNDARY>[10]
// type MovieGenre = ComputeRange<MAXIMUM_ALLOWED_BOUNDARY>[10]
// type BookGenre = ComputeRange<MAXIMUM_ALLOWED_BOUNDARY>[10]
type Gender = 0 | 1 // 0 -> male, 1 -> female
export interface Profile{
    age: number,
    gender: number,
    sexualInterests: number
    language: number,
    interests: Array<number>
}
export interface User{
    userId:string,
    profile: Profile,
    socket: Socket
}