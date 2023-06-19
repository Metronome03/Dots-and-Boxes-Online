import { useContext,useEffect,useRef,useState } from "react";
import { RoomContext } from "./Room";
import socket from "./Sockets";
import { UserContext } from "./User";

function Scorecard({player,count})
{
    const {user}=useContext(UserContext);
    const {currentPlayerID,adminID,roomID}=useContext(RoomContext);

    const handleRemove=()=>{
        if(confirm("Remove this player?"))
        socket.emit('leave-game',player._id,roomID);
    }
    if(user._id==adminID&&player._id!=adminID)
    return (
        <button id="player-score-card" onClick={handleRemove} style={{backgroundColor:player.color}} className={`basis-1/5 w-full text-xl font-bold ${player._id==currentPlayerID?"border border-4 border-black border-solid":""} flex flex-row justify-evenly items-center`}>
            <div id="s-no" className="basis-4/12 flex flex-row justify-center">{count}</div>
            <div id="player-name" className="basis-8/12 flex flex-row justify-center">{player.playerName}</div>
            <div id="player-score" className="basis-4/12 flex flex-row justify-center">{player.score}</div>
        </button>
    );
    else
    return (
        <div id="player-score-card" style={{backgroundColor:player.color}} className={`basis-1/5 w-full text-xl font-bold ${player._id==currentPlayerID?"border border-4 border-black border-solid":""} flex flex-row justify-evenly items-center`}>
            <div id="s-no" className="basis-4/12 flex flex-row justify-center">{count}</div>
            <div id="player-name" className="basis-8/12 flex flex-row justify-center">{player.playerName}</div>
            <div id="player-score" className="basis-4/12 flex flex-row justify-center">{player.score}</div>
        </div>
    );
}

function PlayerScores()
{
    let count=0;
    
    const {room}=useContext(RoomContext);
    //const [room,setRoom]=useState({1:{playerName:"Prabhat",color:'red',score:0},2:{playerName:"Vikas",color:'blue',score:0},3:{playerName:"Prebby",color:'green',score:0},4:{playerName:"Vicky",color:'yellow',score:0}});
    return (
        <div id="scores" className="w-full h-full basis-1/2 input-border flex flex-col justify-start items-center">
            <div id="player-score-card" className="basis-1/5 w-full text-xl font-bold flex flex-row justify-evenly items-center">
                <div id="s-no" className="basis-4/12 flex flex-row justify-center">S No.</div>
                <div id="player-name" className="basis-8/12 flex flex-row justify-center">Player</div>
                <div id="player-score" className="basis-4/12 flex flex-row justify-center">Score</div>
            </div>
            {
                Object.keys(room).map(_id=>{
                    count+=1;
                    return <Scorecard key={_id} count={count} player={{_id,playerName:room[_id].playerName,color:room[_id].color,score:room[_id].score}}/>
                })
            }
        </div>
    );
}

function GameChat()
{
    const [messages,setMessages]=useState([]);
    //const [messages,setMessages]=useState([{playerName:"HI",matter:"Hello"}]);
    const {roomID}=useContext(RoomContext);
    const {user}=useContext(UserContext);
    const inputRef=useRef(null);
    const lastMessageRef=useRef(null);

    const handleMessageSend=()=>{
        const message=inputRef.current.value;
        if(message.length!=0)
        {
            socket.emit('message-sent',user,message,roomID);
            //setMessages((prevMessages)=>[...prevMessages,{player:user,message}]);
            inputRef.current.value="";
        }
    };
    const handleEnterMessage=(e)=>{
        if(e.key=='Enter')
        {
            e.preventDefault();
            handleMessageSend();
        }
    };
    useEffect(()=>{
        const messageSent=(player,message)=>{
            setMessages((prevMessages)=>[...prevMessages,{player,message}]);
        };
        socket.on('message-sent',messageSent);
        document.addEventListener('keydown',handleEnterMessage);
        return ()=>{
            socket.off('message-sent',messageSent);
        }
    },[]);
    
    useEffect(()=>{
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    },[messages]);

    return (
        <div id="game-chat" className="w-full h-full basis-1/2 input-border overflow-hidden flex flex-col justify-evenly items-center">
            <div id="chat-room-header" className="basis 1/6 text-2xl font-black">Chat Room</div>
            <div id="messages" className="basis-4/6 w-11/12 h-4/6 overflow-auto flex flex-col justify-start items-start">
                {
                    messages.map((message,index)=>{
                        return <div id="message" key={index} ref={index === messages.length - 1 ? lastMessageRef : null} className="">{message.player.playerName} : {message.message}</div>
                    })
                }
            </div>
            <div id="message-input-handle" className="basis-1/6 w-11/12 h-full flex flex-row justify-evenly items-center">
                <input id="message-input" ref={inputRef} className="basis-9/12 w-9/12 h-2/12 input-border"/>
                <button id="message-send-button" onClick={handleMessageSend} className="basis-1/12 w-2/12 h-2/12 color-border hover:bg-black hover:text-white flex flex-row justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16" id="IconChangeColor"> <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" id="mainIconPathAttribute"></path> </svg>
                </button>
            </div>
        </div>
    );
}

function PlayerInfoStuff()
{
    return (
        <div id="player-info-stuff" className="basis-2/6 w-full h-full overflow-hidden flex flex-row md:flex-col justify-center items-center">
            <PlayerScores/>
            <GameChat/>
        </div>
    );
}

export default PlayerInfoStuff;