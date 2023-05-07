const express=require('express');
const fs=require('fs');
const userModel=require('../models/user_account.js');
const userRouter=express.Router();
const jwt=require('jsonwebtoken');


/**********************************************/



/*********************************************/

userRouter.get('/',async (req,res)=>{
    const decoded=jwt.decode(req.cookies.jwt);
    console.log("Decoded jwt token for user:",decoded);
    res.sendFile('user_pages/user_home.html',{root:__dirname+'/../' });
});

userRouter.use(express.static('user_pages/game/build'));
userRouter.get('/create-game',async (req,res,next)=>{
    fs.readFile(__dirname+'/../user_pages/game/build/index.html','utf8',(err,data)=>{
        if(err)
        {
            throw(err);
        }
        else
        {
            
            res.send(data);
            //res.sendFile('user_pages/game/build/index.html',{root:__dirname+'/../'});
        }
    });
    
});






module.exports=userRouter;