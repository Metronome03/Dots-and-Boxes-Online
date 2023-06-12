const express=require('express');
const userModel=require('../models/user_account.js');
const userRouter=express.Router();
const jwt=require('jsonwebtoken');

/**********************************************/



/*********************************************/
function socektRouter(io)
{
    userRouter.use(express.static('user_pages/game/dist'));
    userRouter.get('/',async (req,res)=>{
        /*const decoded=jwt.decode(req.cookies.jwt);
        console.log("Decoded jwt token for user:",decoded);*/
        res.sendFile('user_pages/game/dist/index.html',{root:__dirname+'/../'});
    });


    //Other endpoints
    userRouter.get('/get-user',async (req,res)=>{
        const id=jwt.decode(req.cookies.jwt).id;
        const result=await userModel.findById(id);
        const {_id,username}=result;
        res.send({_id,playerName:username});
    });

    let nextRoomID=1001,rooms={};
    //Socket events 
    io.on('connection',(socket)=>{

        socket.on('create-game',(adminData)=>{
            if(adminData)
            {
                let roomID=nextRoomID.toString();
                let adminID=adminData._id;
                const obj={};
                obj[adminID]={playerName:adminData.playerName,color:null,score:0};
                rooms[roomID]={admin:adminID,number:1,selected:0,players:obj,moves:[],messages:[]};
                socket.join(roomID);
                socket.emit('roomID',roomID);
                socket.emit('present-players',rooms[roomID].players);
                nextRoomID+=1;
            }
        });
        socket.on('join-game',(playerData,roomID)=>{
            const playerID=playerData._id;
            const obj={};
            obj[playerID]={playerName:playerData.playerName,color:null,score:0};
            rooms[roomID].players[playerID]=obj[playerID];
            rooms[roomID].number+=1;
            socket.join(roomID);
            socket.emit('roomID',roomID);
            socket.emit('adminID',rooms[roomID].admin);
            socket.emit('present-players',rooms[roomID].players);
            socket.broadcast.to(roomID).emit('player-joined',obj);
            io.to(roomID).emit('game-ready-status',false);
        });
        socket.on('color-selected',(playerID,color,roomID)=>{
            rooms[roomID].players[playerID].color=color;
            if(color==null)
            {
                rooms[roomID].selected-=1;
                io.to(roomID).emit('game-ready-status',false);
            }
            else
            {
                rooms[roomID].selected+=1;
                if(rooms[roomID].selected==rooms[roomID].number)
                io.to(roomID).emit('game-ready-status',true);
            }
            socket.broadcast.to(roomID).emit('selected-color',playerID,color);
        });
        socket.on('game-started',(roomID)=>{
            rooms[roomID].status='running';
            socket.broadcast.to(roomID).emit('game-started');
        });
        socket.on('message-sent',(player,message,roomID)=>
        {
            rooms[roomID].messages.push({player:player,message:message});
            io.to(roomID).emit('message-sent',player,message);
        });
    })

    return userRouter;
}

module.exports=socektRouter;