import { useContext, useEffect, useState } from "react";
import { UserContext } from "./User";
import { RoomContext } from './Room';
import socket from "./Sockets";

function ColorDisplay({player,color})
{
    const {setRoom,roomID}=useContext(RoomContext);
    const {user}=useContext(UserContext);

    const handleUnselect=()=>{
        if(player._id==user._id)
        {
            /*setRoom((prevRoom)=>{
                const updatedRoom={...prevRoom};
                updatedRoom[player._id].color=null;
                return updatedRoom;
            });*/
            socket.emit('color-selected',player._id,null,roomID);
        }
    };

    if(color==null)
    {
        return (
            <button id="color-display" className="basis-4/12 w-2/12 md:w-4/12 bg-biege color-border"></button>
        );
    }
    else
    {
        return (
            <button id="color-display" onClick={handleUnselect} style={{backgroundColor:color}} className="basis-4/12 w-2/12 md:w-4/12 bg-biege color-border"></button>
        );
    }
}

function PlayerCard({player,colors})
{
    const { user }=useContext(UserContext);
    const { adminID,roomID,setRoom}=useContext(RoomContext);

    const handleRemove=(e)=>{
        console.log("playerID",player._id)
        socket.emit('leave-game',player._id,roomID);
    };

    const handleColorPick=(e)=>{
        if(player._id==user._id)
        {
            const selectedColor=e.target.style.backgroundColor;
            /*setRoom((prevRoom)=>{
                const updatedRoom={...prevRoom};
                updatedRoom[user._id].color=selectedColor;
                return updatedRoom;
            });*/
            socket.emit('color-selected',player._id,selectedColor,roomID);
        }
    };
    return (
        <div id="player-card" className="basis-3/12 w-full h-full flex flex-col justify-evenly items-center">
            <ColorDisplay key={player.color} player={player} color={player.color}/>
            <div id="player-name" className="basis-2/12">{player.playerName}</div>
            <div id="color-picker" className="basis-2/12 w-1/12 md:w-2/12 grid grid-rows-2 grid-cols-2 gap-1">
                {
                    colors.map(color=>{
                        return <button onClick={handleColorPick} id={color+'-selector-button'} style={{backgroundColor:color}} className="w-full h-full rounded"></button>
                    })
                }
            </div>
            {
                adminID==user._id &&player._id!=adminID&&
                <div id="admin-player-button" className="basis-2/12 md:basis-1/12 w-3/12 md:w-6/12 flex flex-row justify-end">
                <button id="remove-button" onClick={handleRemove} className="rounded-full basis-1/12 md:basis-2/12 h-full md:h-9/12 bg-red-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16" id="IconChangeColor"> <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" id="mainIconPathAttribute" fill="#ffffff"></path> <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" id="mainIconPathAttribute" fill="#ffffff"></path> </svg>
                </button>
                </div>
            }
        </div>
    );
}

function PlayersDisplay()
{
    const {room}=useContext(RoomContext);
    //const [room,setRoom]=useState({1:{playerName:"Prabhat",color:null},2:{playerName:"Vikas",color:null},3:{playerName:"Prebby",color:null},4:{playerName:"Vicky",color:null}});
    const [colors,setColors]=useState([]);
    useEffect(()=>{
        const allColors=['rgb(29,78,216)','rgb(22,163,74)','rgb(234,179,8)','rgb(220,38,38)'];
        setColors((prevColors)=>{
            const selectedColors=Object.values(room).map(player=>player.color!=null&&player.color.replace(/\s/g,''));
            const availableColors=allColors.filter(color=>!selectedColors.includes(color));
            return availableColors;
        });
    },[room]);
    
    return (
        <div id="color-selector" className="basis-6/12 w-full flex flex-col md:flex-row justify-evenly items-center">
            {
                Object.keys(room).map(_id=>{
                    return <PlayerCard player={{_id,playerName:room[_id].playerName,color:room[_id].color}} colors={colors} key={_id}/>
                })
            }
        </div>
    );
}

function AdminView()
{
    const { user }=useContext(UserContext);
    const {roomID,gameReadyStatus,gridSize}=useContext(RoomContext);
    const handleGridChange=(e)=>{
        const newGridValue=e.target.value;
        socket.emit('grid-size',newGridValue,roomID);
    };
    const handleLeave=()=>{
        socket.emit('leave-game',user._id,roomID);
    }
    function StartButton()
    {
        const handleStart=()=>{
            socket.emit('game-started',true,roomID);
        }
        if(gameReadyStatus)
        {
            return (
                <button onClick={handleStart} id="start-game" className="basis-5/12 w-full h-full input-border hover:bg-black hover:text-white">Start Game</button>
            );
        }
    }
    return (
        <div id="view" className="basis-10/12 w-full text-xl font-bold flex flex-col justify-evenly items-center">
            <PlayersDisplay/>
            <div id="about-grid-size" className="w-4/6 h-full basis-1/12 flex flex-row justify-evenly items-center">
                <div id="grid-size-subtext">Grid Size :</div>
                <input type="range" id="set-grid-size" min="12" max="20" value={gridSize} className="slider" onChange={handleGridChange}/>
                <div id="display-grid-size">{gridSize}</div>
            </div>
            <div id="invite-code" className="basis-1/12">Send this code to invite  :  {roomID}</div>
            <div id="control-buttons" className="basis-1/12 md:basis-2/12 w-10/12 sm:w-full flex flex-col sm:flex-row justify-evenly items-center">
                <StartButton />
                <button id="leave-game" onClick={handleLeave} className="basis-5/12 w-full h-full input-border hover:bg-black hover:text-white">Leave Game</button>
            </div>
        </div>
    );
}

function PlayerView({setGameState})
{
    const { user }=useContext(UserContext);
    const { roomID,gameReadyStatus,allowSeparateJoin,gridSize }=useContext(RoomContext);

    const handleJoin=()=>{
        setGameState(true);
    };
    const handleLeave=()=>{
        socket.emit('leave-game',user._id,roomID);
    };
    return (
        <div id="view" className="basis-11/12 w-full text-xl font-bold flex flex-col justify-evenly items-center">
            <PlayersDisplay/>
            <div id="about-grid-size" className="h-full basis-1/12 flex flex-row justify-evenly items-center">
                <div id="grid-size-subtext">Grid Size :</div>
                <div id="display-grid-size">{gridSize}</div>
            </div>
            <div id="control-buttons" className="basis-1/12 md:basis-2/12 w-10/12 sm:w-full flex flex-col sm:flex-row justify-evenly items-center">
                {gameReadyStatus&&allowSeparateJoin&&<button onClick={handleJoin} id="join-game" className="basis-5/12 w-full h-full input-border hover:bg-black hover:text-white">Join</button>}
                <button id="leave-game" onClick={handleLeave} className="basis-5/12 w-full h-full input-border hover:bg-black hover:text-white">Leave Game</button>
            </div>
        </div>
    );
}

function PlayerViewDecider({setGameState})
{
    const {user}=useContext(UserContext);
    const {adminID}=useContext(RoomContext);
    
    if(user._id==adminID)
    {
        return <AdminView />;
    }
    else
    {
        return <PlayerView setGameState={setGameState}/>;
    }
}


function GameSettings({setGameState})
{
    return (
        <div id="game-settings" className="w-full h-full basis-full flex flex-col justify-center items-center">
            <div id="game-room-head" className="basis-1/12 text-4xl font-black">Game Room</div>
            <PlayerViewDecider setGameState={setGameState} />
        </div>
    );
}

export default GameSettings;