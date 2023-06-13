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
            if(playerData&&rooms[roomID].number<4)
            {
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
                socket.emit('joined-game');
                io.to(roomID).emit('game-ready-status',false);
            }
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
            io.to(roomID).emit('selected-color',playerID,color);
        });
        socket.on('game-started',(roomID)=>{
            rooms[roomID].status='running';
            io.to(roomID).emit('game-started');
            io.to(roomID).emit('current-player',Object.keys(rooms[roomID].players)[0]);
        });
        socket.on('message-sent',(player,message,roomID)=>
        {
            rooms[roomID].messages.push({player:player,message:message});
            io.to(roomID).emit('message-sent',player,message);
        });
        socket.on('move-made',(currentPlayerID,lineID,roomID)=>{
            io.to(roomID).emit('move-made',currentPlayerID,lineID,roomID);
            rooms[roomID].moves[lineID]=currentPlayerID;
            //console.log(rooms[roomID].moves)
            let line=lineID.split('-');
            line[0]=parseInt(line[0]);
            line[1]=parseInt(line[1]);
            let pointMade=false,box=[0,0];
            if(line[0]%2!=0)
            {
                let toBeChecked1=[line[0]-2+'-'+line[1],line[0]-1+'-'+parseInt(line[1]-1),line[0]-1+'-'+parseInt(line[1]+1)];
                let toBeChecked2=[line[0]+2+'-'+line[1],line[0]+1+'-'+parseInt(line[1]-1),line[0]+1+'-'+parseInt(line[1]+1)];
                let marked=0;
                toBeChecked1.map(id=>{
                    if(rooms[roomID].moves.hasOwnProperty(id))
                    marked++;
                });          
                if(marked==3)
                {
                    pointMade=true;
                    box=[-1,0];
                }
                marked=0;     
                if(!pointMade)
                toBeChecked2.map(id=>{
                    if(rooms[roomID].moves.hasOwnProperty(id))
                    marked++;
                });          
                if(marked==3)
                {
                    pointMade=true;
                    box=[1,0] 
                }
            }
            else
            {
                let toBeChecked1=[line[0]+'-'+parseInt(line[1]+2),line[0]-1+'-'+parseInt(line[1]+1),line[0]+1+'-'+parseInt(line[1]+1)];
                let toBeChecked2=[line[0]+'-'+parseInt(line[1]-2),line[0]-1+'-'+parseInt(line[1]-1),line[0]+1+'-'+parseInt(line[1]-1)];
                let marked=0;
                toBeChecked1.map(id=>{
                    if(rooms[roomID].moves.hasOwnProperty(id))
                    marked++;
                });          
                if(marked==3)
                {
                    pointMade=true;
                    box=[0,1];
                }
                marked=0;     
                if(!pointMade)
                toBeChecked2.map(id=>{
                    if(rooms[roomID].moves.hasOwnProperty(id))
                    marked++;
                });          
                if(marked==3)
                {
                    pointMade=true;
                    box=[0,-1];
                }
            }
            if(pointMade)
            {
                rooms[roomID].players[currentPlayerID].score+=1;
                io.to(roomID).emit('score-update',currentPlayerID,rooms[roomID].players[currentPlayerID].score);
                io.to(roomID).emit('move-made',currentPlayerID,line[0]+box[0]+'-'+parseInt(line[1]+box[1]));
                socket.emit('current-player',currentPlayerID);
            }
            else
            {
                let nextIndex=Object.keys(rooms[roomID].players).indexOf(currentPlayerID)+1;
                if(nextIndex>=Object.keys(rooms[roomID].players).length)
                nextIndex=0;
                io.to(roomID).emit('current-player',Object.keys(rooms[roomID].players)[nextIndex]);
            }
        });
    })

    return userRouter;
}

module.exports=socektRouter;