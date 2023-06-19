import { useContext,useEffect,useRef,useState } from "react";
import { RoomContext } from "./Room";
import socket from "./Sockets";
import { UserContext } from "./User";

function Game()
{
    const { user }=useContext(UserContext);
    const { gridSize,currentPlayerID,setcurrentPlayerID,moves,room,roomID }=useContext(RoomContext);
    const [sizes,setSizes]=useState(()=>{
        let sizes=[];
        for(let i=1;i<gridSize*2;i++)
        {
            if(i%2!=0)
            sizes.push('1fr');
            else
            sizes.push('6fr');
        }
        return sizes;
    });
    
    const createGrid=()=>{
        const grid=[];
        for(let i=1;i<gridSize*2;i++)
        {
            const row=[];
            for(let j=1;j<gridSize*2;j++)
            {
                if(i%2!=0)
                {
                    if(j%2!=0)
                    row.push(
                        <div key={`${i}-${j}`} id={`${i}-${j}`} className="bg-black"></div>
                    );
                    else
                    row.push(
                        <button key={`${i}-${j}`} id={`${i}-${j}`} onClick={handleLine}  className={`hover:bg-black ${moves.hasOwnProperty(`${i}-${j}`)?"bg-black":""}`}></button>
                    );
                }
                else
                {
                    if(j%2!=0)
                    {
                        row.push(
                            <button key={`${i}-${j}`} id={`${i}-${j}`} onClick={handleLine} className={`hover:bg-black ${moves.hasOwnProperty(`${i}-${j}`)?"bg-black":""}`}></button>
                        );
                    }
                    else
                    {
                        row.push(
                            <div key={`${i}-${j}`} style={moves.hasOwnProperty(`${i}-${j}`)?{backgroundColor:room[moves[`${i}-${j}`]].color}:{}} id={`${i}-${j}`}></div>
                        );
                    }
                }
            }
            grid.push(row);
        }
        return grid;
    };

    const handleLine=(e)=>{
        if(user._id==currentPlayerID&&!e.target.classList.contains('bg-black'))
        {
            setcurrentPlayerID(null);
            socket.emit('move-made',currentPlayerID,e.target.id,roomID);
        }
    };
    return (
        <div id="game" style={{gridTemplateRows:sizes.join(' '),gridTemplateColumns:sizes.join(' ')}} className={`basis-10/12 w-11/12 h-full grid`}>
            {createGrid()}
        </div>
    );
}

function GameOver()
{
    const {room,roomID}=useContext(RoomContext);
    
    //const [room,setRoom]=useState({1:{playerName:"A",color:"blue",score:10},2:{playerName:"B",color:"Red",score:20}});
    
    const ControlButtons=()=>{
        const { user }=useContext(UserContext);
        const { adminID,roomID,gameReadyStatus }=useContext(RoomContext);
        const handleRestart=()=>{
            if(gameReadyStatus)
            {
                socket.emit('restart-game',adminID,roomID);
            }
            
        };
        const handleSettings=(e)=>{
            socket.emit('game-started',false,roomID);
        };
        const handleLeave=()=>{
            socket.emit('leave-game',user._id,roomID);
        }
        if(user._id==adminID)
        return (
            <div id="admin-buttons" className="basis-full h-full flex flex-row justify-evenly">
                <button id="restart-game-button" onClick={handleRestart} className="basis-3/12 h-full input-border hover:bg-black hover:text-white">Restart Game</button>
                <button id="settings-button" onClick={handleSettings} className="basis-3/12 h-full input-border hover:bg-black hover:text-white">Game Settings</button> 
                <button id="leave-game-button" onClick={handleLeave} className="basis-3/12 h-full input-border hover:bg-black hover:text-white">Leave Game</button>   
            </div>
        );
        else
        return (
            <button id="leave-game-button" onClick={handleLeave} className="basis-4/12 h-full input-border hover:bg-black hover:text-white">Leave Game</button>
        );
    }
    let sNo=0;
    const sortedRoom=Object.values(room).sort((a,b)=>b.score-a.score);
    return (
        <div id="game-over-info" className="basis-11/12 w-11/12 overflow-auto flex flex-col justify-evenly items-center">
            <div id="winner" className="basis-1/12 w-full text-3xl font-bold flex flex-row justify-center items-center">
                Winner :  {''}
                {
                    sortedRoom[0].playerName
                }
            </div>
            <div id="scorecard" className="basis-1/12 w-full text-2xl font-bold flex flex-row justify-center items-center">
                Scorecard
            </div>
            <div id="final-score-card" className="basis-7/12 w-5/6 border border-black border-2 text-xl font-bold flex flex-col justify-evenly items-center">
            <div id="final-score-line" className="basis-2/12 w-full flex flex-row justify-evenly items-center">
                <div id="player-sNo">S No.</div>
                <div id="player-name">Player</div>
                <div id="player-score">Score</div>
            </div>
                {
                    sortedRoom.map(player=>{
                        sNo+=1;
                        return (
                            <div id="final-score-line" style={{backgroundColor:player.color}} className="basis-2/12 w-full border border-black border-2 flex flex-row justify-evenly items-center">
                                <div id="player-sNo">{sNo}</div>
                                <div id="player-name">{player.playerName}</div>
                                <div id="player-score">{player.score}</div>
                            </div>
                        );
                    })
                }
            </div>
            <div id="control-buttons" className="basis-1/12 w-11/12 flex flex-row justify-evenly">
                <ControlButtons/>
            </div>
        </div>
    );
}

function GameScreen()
{
    
    const { user }=useContext(UserContext);
    const { setMoves,setRoom,setcurrentPlayerID,roomID }=useContext(RoomContext);
    const [gameOver,setGameOver]=useState(false);
    const handleLeave=()=>{
        socket.emit('leave-game',user._id,roomID);
    }
    useEffect(()=>{
        const gameOver=()=>{
            setGameOver(true);
            setcurrentPlayerID(null);
            setMoves({});
        };
        const restartGame=(currentPlayerID)=>{
            setGameOver(false);
            setcurrentPlayerID(currentPlayerID);
            setRoom(prevRoom=>{
                const updatedRoom={...prevRoom};
                Object.keys(prevRoom).map(id=>{
                    updatedRoom[id].score=0;
                });
                return updatedRoom;
            });
        };
        socket.on('game-over',gameOver);
        socket.on('restart-game',restartGame);
        return ()=>{
            socket.off('game-over',gameOver);
            socket.off('restart-game',restartGame);
        };
    },[]);
    if(!gameOver)
    return (
        <div id="game-screen" className="basis-4/6 w-full h-full flex flex-col justify-evenly items-center">
            <div id="leave-game-container" className="basis-1/12 w-11/12 flex flex-row justify-end">
                <button id="leave-game-button" onClick={handleLeave} className="basis-3/12 h-4/6 md:h-full input-border hover:bg-black hover:text-white">Leave Game</button>
            </div>
            <Game/>
        </div>
    );
    else
    return (
        <div id="game-over-screen" className="basis-4/6 w-full h-full flex flex-col justify-evenly items-center">
            <GameOver/>
        </div>
    );
}

export default GameScreen;