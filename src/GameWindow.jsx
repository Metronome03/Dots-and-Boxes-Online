import { useEffect, useState } from "react";
import GameSettings from "./GameSettings";
import GamePlay from "./GamePlay";
import socket from "./Sockets";

function GameWindow()
{
    const [gameState,setGameState]=useState(false);
    useEffect(()=>{
        const gameStartred=(value)=>{
            setGameState(value);
        };
        socket.on('game-started',gameStartred);
        return ()=>{
            socket.off('game-started',gameStartred);
        };
    },[]);
    if(!gameState)
    {
        return (
            <GameSettings setGameState={setGameState}/>
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