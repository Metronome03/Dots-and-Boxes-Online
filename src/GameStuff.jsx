import { useContext, useEffect, useState } from 'react';
import socket from './Sockets';
import GameMenu from './GameMenu';
import GameWindow from './GameWindow';
import { UserContext } from './User';
import { RoomContext } from './Room';

function GameStuff()
{
    const [gameActive,setGameActive]=useState(false);
    const {user}=useContext(UserContext);
    const { setAllowSeparateJoin,roomID }=useContext(RoomContext);

    useEffect(()=>{
        const joinedGame=(status)=>{
            setGameActive(true);
            setAllowSeparateJoin(status);
        };
        const playerLeft=(playerID)=>{
            if(user._id==playerID)
            {
                console.log("renavigating")
                setGameActive(false);
            }
        };
        socket.on('joined-game',joinedGame);
        socket.on('player-left',playerLeft);
        return ()=>{
            socket.off('joined-game',joinedGame);
            socket.off('player-left',playerLeft);
        };
      },[]);
    
    if(!gameActive)
    {
        return (
            <GameMenu setGameActive={setGameActive}/>
            );
    }
    else
    {
        return (
            <GameWindow/>
            );
    }
}

export default GameStuff;