const express=require('express');
const userModel=require('../models/user_account.js');
const userRouter=express.Router();
const jwt=require('jsonwebtoken');

/**********************************************/

const handleSocketRemoval=(id)=>{
    if(userTracker.hasOwnProperty(id))
    {
        const socket=userTracker[id].socket;
        const playerID=id;
        if(userTracker[playerID].room)
        {
            console.log(rooms)
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
            io.to(roomID).emit('player-left',playerID,rooms[roomID].admin,nextPlayerID);
            userTracker[playerID].socket.leave(roomID);
            userTracker[playerID].room=null;
            if(rooms[roomID].number==0)
            {
                delete rooms[roomID];
            }
            delete userTracker[playerID];
            console.log(rooms)
        }
        delete socketTracker[socket.id];
    }
}


/*********************************************/
let socketTracker={},userTracker={};
let nextRoomID=1001,rooms={};

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
                console.log("Deleted user")
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
        console.log(socket.id)
        socket.on('create-game',(adminData)=>{
            if(adminData&&(!userTracker.hasOwnProperty(adminData._id)||!userTracker[adminData._id].room))
            {
                let roomID=nextRoomID.toString();
                let adminID=adminData._id;
                const obj={};
                obj[adminID]={playerName:adminData.playerName,color:null,score:0};
                rooms[roomID]={admin:adminID,number:1,selected:0,gridSize:16,status:false,players:obj,moves:{},messages:[]};
                socketTracker[socket.id]=adminID;
                userTracker[adminID]={socket:socket,room:roomID};
                socket.join(roomID);
                socket.emit('roomID',roomID);
                socket.emit('adminID',rooms[roomID].admin);
                socket.emit('present-players',rooms[roomID].players);
                socket.emit('joined-game');
                nextRoomID+=1;
                if(nextRoomID==10000)
                nextRoomID=1001;
            }
        });
        socket.on('join-game',(playerData,roomID)=>{
            if(playerData&&(!userTracker.hasOwnProperty(playerData._id)||!userTracker[playerData._id].room)&&rooms.hasOwnProperty(roomID)&&rooms[roomID].number<4&&!rooms[roomID].players.hasOwnProperty(playerData._id))
            {
                const playerID=playerData._id;
                const obj={};
                obj[playerID]={playerName:playerData.playerName,color:null,score:0};
                rooms[roomID].players[playerID]=obj[playerID];
                rooms[roomID].number+=1;
                socketTracker[socket.id]=playerID;
                userTracker[playerID]={socket:socket,room:roomID};
                socket.join(roomID);
                socket.emit('roomID',roomID);
                socket.emit('adminID',rooms[roomID].admin);
                socket.emit('present-players',rooms[roomID].players);
                socket.broadcast.to(roomID).emit('player-joined',obj);
                socket.emit('joined-game',rooms[roomID].status);
                socket.emit('all-moves',rooms[roomID].moves)
                io.to(roomID).emit('game-ready-status',false);
            }
        });
        socket.on('leave-game',(playerID,roomID)=>{
            if(playerID&&rooms.hasOwnProperty(roomID)&&userTracker.hasOwnProperty(playerID))
            {
                Object.keys(rooms[roomID].moves).map(lineID=>{
                    if(rooms[roomID].moves[lineID]==playerID)
                    {
                        delete rooms[roomID].moves[lineID]
                    }
                })
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
                io.to(roomID).emit('player-left',playerID,rooms[roomID].admin,nextPlayerID);
                userTracker[playerID].socket.leave(roomID);
                userTracker[playerID].room=null;
                if(rooms[roomID].number==0)
                {
                    delete rooms[roomID];
                }   
                console.log(rooms); 
            }  
        });
        socket.on('grid-size',(newGridValue,roomID)=>{
            if(newGridValue&&rooms.hasOwnProperty(roomID))
            {
                io.to(roomID).emit('grid-size',newGridValue);
            }
        });
        socket.on('color-selected',(playerID,color,roomID)=>{
            if(playerID&&rooms.hasOwnProperty(roomID)&&userTracker.hasOwnProperty(playerID))
            {
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
            }
        });
        socket.on('game-started',(value,roomID)=>{
            if(rooms.hasOwnProperty(roomID))
            {
                if(value==true)
                {
                    rooms[roomID].status=true;
                    io.to(roomID).emit('current-player',Object.keys(rooms[roomID].players)[0]);
                }
                else
                {
                    rooms[roomID].messages=[];
                    rooms[roomID].status=false;
                    Object.keys(rooms[roomID].players).map(id=>{
                        rooms[roomID].players[id].score=0;
                    });
                    io.to(roomID).emit('present-players',rooms[roomID].players);
                }
                io.to(roomID).emit('game-started',value);
            }
        });
        socket.on('message-sent',(player,message,roomID)=>
        {
            if(player&&message&&rooms.hasOwnProperty(roomID)&&userTracker.hasOwnProperty(player._id))
            {
                rooms[roomID].messages.push({player:player,message:message});
                io.to(roomID).emit('message-sent',player,message);
            }
        });
        socket.on('move-made',(currentPlayerID,lineID,roomID)=>{
            if(currentPlayerID&&lineID&&rooms.hasOwnProperty(roomID)&&userTracker.hasOwnProperty(currentPlayerID))
            {
                io.to(roomID).emit('move-made',currentPlayerID,lineID,roomID);
                rooms[roomID].moves[lineID]=currentPlayerID;
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
                    const gridSize=rooms[roomID].gridSize;
                    rooms[roomID].moves[line[0]+box[0]+'-'+parseInt(line[1]+box[1])]=currentPlayerID;
                    rooms[roomID].players[currentPlayerID].score+=1;
                    io.to(roomID).emit('score-update',currentPlayerID,rooms[roomID].players[currentPlayerID].score);
                    io.to(roomID).emit('move-made',currentPlayerID,line[0]+box[0]+'-'+parseInt(line[1]+box[1]));
                    if(Object.keys(rooms[roomID].moves).length==((gridSize*2-1)*(gridSize*2-1))-(gridSize*gridSize))
                    {
                        io.to(roomID).emit('game-over');
                        rooms[roomID].moves={};
                        rooms[roomID].status=false;
                    }
                    else
                    socket.emit('current-player',currentPlayerID);
                }
                else
                {
                    let nextIndex=Object.keys(rooms[roomID].players).indexOf(currentPlayerID)+1;
                    if(nextIndex>=Object.keys(rooms[roomID].players).length)
                    nextIndex=0;
                    io.to(roomID).emit('current-player',Object.keys(rooms[roomID].players)[nextIndex]);
                }
            }
        });
        socket.on('restart-game',(playerID,roomID)=>{
            if(rooms.hasOwnProperty(roomID)&&userTracker.hasOwnProperty(playerID))
            {
                rooms[roomID].messages=[];
                Object.keys(rooms[roomID].players).map(id=>{
                    rooms[roomID].players[id].score=0;
                });
                io.to(roomID).emit('restart-game',rooms[roomID].players[Object.keys(rooms[roomID].players)[0]]);
                io.to(roomID).emit('current-player',Object.keys(rooms[roomID].players)[0]);
            }
        });
        socket.on('disconnect',()=>{
            if(socketTracker[socket.id])
            {
                console.log("Disconnecting and removing");
                const playerID=socketTracker[socket.id];
                if(userTracker[playerID].room)
                {
                    console.log(rooms)
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
                    io.to(roomID).emit('player-left',playerID,rooms[roomID].admin,nextPlayerID);
                    userTracker[playerID].socket.leave(roomID);
                    userTracker[playerID].room=null;
                    if(rooms[roomID].number==0)
                    {
                        delete rooms[roomID];
                    }
                    delete userTracker[playerID];
                    console.log(rooms)
                }
                delete socketTracker[socket.id];
            }
            else
            console.log("Socket didnt join any room");
        });
    })

    return userRouter;
}

module.exports={socektRouter,handleSocketRemoval};