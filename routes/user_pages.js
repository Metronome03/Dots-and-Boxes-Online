const express=require('express');
const userModel=require('../models/user_account.js');
const userRouter=express.Router();
const jwt=require('jsonwebtoken');
const addSocketListeners=require('./socket_listeners.js');

/**********************************************/

const handleSocketRemoval=(id)=>{
    if(userTracker.hasOwnProperty(id))
    {
        const socket=userTracker[id].socket;
        const playerID=id;
        if(userTracker[playerID].room)
        {
            
            const roomID=userTracker[playerID].room;
            Object.keys(rooms[roomID].moves).map(lineID=>{
                if(rooms[roomID].moves[lineID]==playerID)
                {
                    delete rooms[roomID].moves[lineID]
                }
            });
            if(rooms[roomID].players[playerID].color!=null)
            rooms[roomID].selected-=1;
            rooms[roomID].number-=1;    
            let nextIndex=Object.keys(rooms[roomID].players).indexOf(playerID)+1;
            if(nextIndex>=Object.keys(rooms[roomID].players).length)
            nextIndex=0;   
            const nextPlayerID=Object.keys(rooms[roomID].players)[nextIndex];
            delete rooms[roomID].players[playerID];
            if(rooms[roomID].admin==playerID)
            {
                rooms[roomID].admin=Object.keys(rooms[roomID].players)[0];
            }
            socket.broadcast.to(roomID).emit('player-left',playerID,rooms[roomID].admin,nextPlayerID);
            socket.emit('player-left',playerID,rooms[roomID].admin,nextPlayerID);
            userTracker[playerID].socket.leave(roomID);
            userTracker[playerID].room=null;
            if(rooms[roomID].number==0)
            {
                delete rooms[roomID];
            }
            delete userTracker[playerID];
            socket.emit('page-reload');
        }
        delete socketTracker[socket.id];
    }
}


/*********************************************/
let socketTracker={},userTracker={};
let rooms={};

function socektRouter(io)
{
    userRouter.use(express.static('user_pages/game/dist'));
    userRouter.get('/',async (req,res)=>{
        /*const decoded=jwt.decode(req.cookies.jwt);
        console.log("Decoded jwt token for user:",decoded);*/
        res.sendFile('user_pages/game/dist/index.html',{root:__dirname+'/../'});
    });


    //Other endpoints
    userRouter.get('/user',async (req,res)=>{
        const id=jwt.decode(req.cookies.jwt).id;
        try
        {
            const result=await userModel.findById(id);
            const {_id,username}=result;
            res.send({_id,playerName:username});
        }
        catch(err)
        {
            console.log(err);
        }
    });

    userRouter.put('/user',async(req,res)=>{
        const id=jwt.decode(req.cookies.jwt).id;
        const username=req.body.username;
        try
        {
            const user=await userModel.findByIdAndUpdate(id,{username:username},{new:true});
            if(user)
            {
                const {_id,username}=user;
                res.json({_id,playerName:username});
            }
            else
            {
                return res.status(404).json({error:"Couldn't update the username"});
            }
        }
        catch(err)
        {
            console.log(err);
        }
    });

    userRouter.delete('/user',async (req,res)=>{
        const id=jwt.decode(req.cookies.jwt).id;
        try
        {
            const user=await userModel.findByIdAndDelete(id);
            if(user)
            {
                console.log("Deleted user:",user);
                res.json(user);
            }
            else
            {
                res.status(404).json("Couldn't delete the user");
            }
        } 
        catch(err)
        {
            console.log(err);
        }
    });
    
    //Socket events
    
 
    io.on('connection',(socket)=>{
        console.log(socket.id);
        addSocketListeners(socket,io,socketTracker,userTracker,rooms);  
    })

    return userRouter;
}

module.exports={socektRouter,handleSocketRemoval};