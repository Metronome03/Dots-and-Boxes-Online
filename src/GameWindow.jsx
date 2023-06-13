import { useEffect, useState } from "react";
import GameSettings from "./GameSettings";
import GamePlay from "./GamePlay";
import socket from "./Sockets";

function GameWindow()
{
    const [gameState,setGameState]=useState(false);
    useEffect(()=>{
        socket.on('game-started',()=>{
            setGameState(true);
        })
    },[]);
    if(!gameState)
    {
        return (
            <GameSettings/>
        );
    }
    else
    {
        return (
            <GamePlay/>
        );
    }
}

export default GameWindow;