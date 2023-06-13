import { createContext,useEffect,useState } from "react";
import socket from "./Sockets";

const RoomContext=createContext();


const RoomProvider=({children})=>{
    const [roomID,setRoomID]=useState(null);
    const [adminID,setAdminID]=useState(null);
    const [room,setRoom]=useState({});
    const [gameReadyStatus,setgameReadyStatus]=useState(false);
    const [gridSize,setGridSize]=useState(16);
    const [currentPlayerID,setcurrentPlayerID]=useState(null);
    const [moves,setMoves]=useState({});

    
    useEffect(()=>{
        socket.on('roomID',(roomid)=>{
            setRoomID(roomid);
            console.log(roomid);
        });

        socket.on('adminID',(adminID)=>{
            setAdminID(adminID);
            console.log(adminID);
        });
    
        socket.on('present-players',(presentPlayers)=>{
            console.log("Present players:",presentPlayers);
            setRoom(presentPlayers);
        });
      
        socket.on('player-joined',(newPlayer)=>{
            console.log("new Player:", newPlayer);
            setRoom((prevRoom) => {
                return {...prevRoom, ...newPlayer};
            });
        });
      
        socket.on('selected-color',(playerID,color)=>{
            console.log("selected-color:",color);
            setRoom((prevRoom)=>{
                const updatedRoom={...prevRoom};
                updatedRoom[playerID].color=color;
                return updatedRoom;
            });
        });

        socket.on('game-ready-status',value=>{
            setgameReadyStatus(value);
        })
        
        socket.on('current-player',(currentPlayerID)=>{
            console.log("current-player:",currentPlayerID);
            setcurrentPlayerID(currentPlayerID);
        });

        socket.on('move-made',(playerID,lineID)=>{
            setMoves((prevMoves)=>{
                const updatedMoves={...prevMoves};
                updatedMoves[lineID]=playerID;
                console.log(updatedMoves)
                return updatedMoves;
            });
        });

        socket.on('score-update',(playerID,score)=>{
            setRoom(prevRoom=>{
                const updatedRoom={...prevRoom};
                updatedRoom[playerID].score=score;
                return updatedRoom;
            });
        });
    },[]);
    
    const contextValue={
        roomID,setRoomID,
        adminID,setAdminID,
        room,setRoom,
        gameReadyStatus,setgameReadyStatus,
        gridSize,setGridSize,
        currentPlayerID,setcurrentPlayerID,
        moves,setMoves};

    return (
        <RoomContext.Provider value={contextValue}>
            {children}
            </RoomContext.Provider>
    );
};

export { RoomContext,RoomProvider };