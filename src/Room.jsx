import { createContext,useContext,useEffect,useState } from "react";
import socket from "./Sockets";
import { UserContext } from "./User";

const RoomContext=createContext();


const RoomProvider=({children})=>{
    const {user}=useContext(UserContext);
    const [roomID,setRoomID]=useState(null);
    const [adminID,setAdminID]=useState(null);
    const [room,setRoom]=useState({});
    const [gameReadyStatus,setgameReadyStatus]=useState(false);
    const [allowSeparateJoin,setAllowSeparateJoin]=useState(false);
    const [gridSize,setGridSize]=useState(16);
    const [currentPlayerID,setcurrentPlayerID]=useState(null);
    const [moves,setMoves]=useState({});

    
    useEffect(()=>{
        const changeRoomID=(roomid)=>{
            setRoomID(roomid);
            console.log(roomid);
        };
        const changeadminID=(adminID)=>{
            console.log("user:",user)
            setAdminID(adminID);
            console.log(adminID);
        };
        const changePresentPlayers=(presentPlayers)=>{
            console.log("Present players:",presentPlayers);
            setRoom(presentPlayers);
        };
        const changePlayerJoined=(newPlayer)=>{
            console.log("new Player:", newPlayer);
            setRoom((prevRoom) => {
                return {...prevRoom, ...newPlayer};
            });
        };
        const changeGridSize=(newGridSize)=>{
            setGridSize(newGridSize);
        };
        const changeSelectedColor=(playerID,color)=>{
            console.log("selected-color:",color);
            setRoom((prevRoom)=>{
                const updatedRoom={...prevRoom};
                updatedRoom[playerID].color=color;
                return updatedRoom;
            });
        };
        const changeGameReadyStatus=(value)=>{
            setgameReadyStatus(value);
        };
        const changeCurrentPlayer=(currentPlayerID)=>{
            console.log("current-player:",currentPlayerID);
            setcurrentPlayerID(currentPlayerID);
        };
        const changeAllMoves=(moves)=>{
            setMoves(moves);
        };
        const changePlayerLeft=(playerID,adminID,possibleCurrentPlayerID)=>{
            if(playerID==user._id)
            {
                console.log("resetting-room")
                setRoomID(null);
                setAdminID(null);
                setRoom({});
                setgameReadyStatus(false);
                setGridSize(4);
                setcurrentPlayerID(null);
                setMoves({});
            }
            else
            {
                setAdminID(adminID);
                console.log("leaving");
                setcurrentPlayerID(prevPlayer=>{
                    if(prevPlayer==playerID)
                    return possibleCurrentPlayerID;
                    else
                    return prevPlayer;
                });
                setMoves(prevMoves=>{
                    const updatedMoves={...prevMoves};
                    Object.keys(updatedMoves).map(lineID=>{
                        if(updatedMoves[lineID]==playerID)
                        {
                            delete updatedMoves[lineID];
                        }
                    });
                    return updatedMoves;
                });
                setRoom(prevRoom=>{
                    const updatedRoom={...prevRoom};
                    delete updatedRoom[playerID];
                    return updatedRoom;
                });
            }
        };
        const changeMoveMade=(playerID,lineID)=>{
            setMoves((prevMoves)=>{
                const updatedMoves={...prevMoves};
                updatedMoves[lineID]=playerID;
                console.log(updatedMoves)
                return updatedMoves;
            });
        };
        const changeScoreUpdate=(playerID,score)=>{
            setRoom(prevRoom=>{
                const updatedRoom={...prevRoom};
                updatedRoom[playerID].score=score;
                return updatedRoom;
            });
        };
        socket.on('roomID',changeRoomID);
        socket.on('adminID',changeadminID);
        socket.on('present-players',changePresentPlayers);
        socket.on('player-joined',changePlayerJoined);
        socket.on('grid-size',changeGridSize);
        socket.on('selected-color',changeSelectedColor);
        socket.on('game-ready-status',changeGameReadyStatus)
        socket.on('current-player',changeCurrentPlayer);
        socket.on('all-moves',changeAllMoves);
        socket.on('player-left',changePlayerLeft);
        socket.on('move-made',changeMoveMade);
        socket.on('score-update',changeScoreUpdate);
        return ()=>{
            socket.off('roomID',changeRoomID);
            socket.off('adminID',changeadminID);
            socket.off('present-players',changePresentPlayers);
            socket.off('player-joined',changePlayerJoined);
            socket.off('grid-size',changeGridSize);
            socket.off('selected-color',changeSelectedColor);
            socket.off('game-ready-status',changeGameReadyStatus)
            socket.off('current-player',changeCurrentPlayer);
            socket.off('all-moves',changeAllMoves);
            socket.off('player-left',changePlayerLeft);
            socket.off('move-made',changeMoveMade);
            socket.off('score-update',changeScoreUpdate);
        };
    },[]);
    
    const contextValue={
        roomID,setRoomID,
        adminID,setAdminID,
        room,setRoom,
        gameReadyStatus,setgameReadyStatus,
        allowSeparateJoin,setAllowSeparateJoin,
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