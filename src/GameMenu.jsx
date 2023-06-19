import { MemoryRouter, Routes, Route,useNavigate } from "react-router-dom";
import { useContext,useRef } from "react";
import socket from "./Sockets";
import {UserContext} from './User';

function MainMenu({setGameActive}) {
  const {user}=useContext(UserContext);

  const navigate=useNavigate();
  
  const handleCreate=()=>{
    
    socket.emit('create-game',user);
  };

  const handleJoin=()=>{
    navigate('/join-game');
  };

  const handleSettings=()=>{
    navigate('/settings');
  }; 
  
  return (
    <div id="main-menu" className="basis-full w-full flex flex-col justify-evenly items-center">
      <button id="create-game" onClick={handleCreate} className="w-11/12 p-[2%] text-xl input-border hover:bg-black hover:text-white">CREATE GAME</button>
      <button id="join-game" onClick={handleJoin} className="w-11/12 p-[2%] text-xl input-border hover:bg-black hover:text-white">JOIN GAME</button>
      <button id="settings" onClick={handleSettings} className="w-11/12 p-[2%] text-xl input-border hover:bg-black hover:text-white">SETTINGS</button>
    </div>
  );
}

function JoinGame({setGameActive}) {
  const navigate=useNavigate();
  const inputValue=useRef(null);
  const {user}=useContext(UserContext);

  const handleJoin=()=>{
    navigate(-1);
    socket.emit('join-game',user,inputValue.current.value);
  };

  const handleGoBack=()=>{
    navigate(-1);
  };
  return (
    <div id="join-game-window" className="basis-full w-full flex flex-col justify-evenly items-center">
      <div id="enter-game-head">Enter the game ID:</div>
      <input type="text" id="enter-game-input" ref={inputValue} className="w-11/12 input-border p-[2%]" />
      <button id="join" onClick={handleJoin} className="w-11/12 p-[2%] text-xl input-border hover:bg-black hover:text-white">Join Game</button>
      <button id="back-from-join" onClick={handleGoBack} className="w-11/12 p-[2%] text-xl input-border hover:bg-black hover:text-white">Back</button>
    </div>
  );
}

function Settings() {
  const navigate=useNavigate();
  const {user,setUser}=useContext(UserContext);

  const handleDelete=async ()=>{
    if(confirm("Are you sure you want to delete this user?"))
    {
      try
      {
        const result=await fetch('/user',{method:'DELETE'});
        if(result.ok)
        {
          setUser(null);
          const respnse=await fetch('/logout');
          location.assign(result.url);
        }
      }
      catch(err)
      {
        console.log(err);
      }
    }
  };

  const handleLogout=async (e)=>{
    try
    {
      const result=await fetch('/logout');
      location.assign(result.url);
    }
    catch(err)
    {
      console.log("Something went wrong");
    }
  };

  const handleChangeUsername=()=>{
    navigate('/change-username');
  };

  const handleGoBack=()=>{
    navigate(-1);
  };
  return (
    <div id="settings-window" className="basis-full w-full flex flex-col justify-evenly items-center">
      <button id="change-username" onClick={handleChangeUsername} className="w-11/12 p-[2%] text-xl input-border hover:bg-black hover:text-white">Change Username</button>
      <button id="delete-user" onClick={handleDelete} className="w-11/12 p-[2%] text-xl input-border hover:bg-black hover:text-white">Delete User</button>
      <button id="logout" onClick={handleLogout} className="w-11/12 p-[2%] text-xl input-border hover:bg-black hover:text-white">Log Out</button>
      <button id="back-from-settings" onClick={handleGoBack} className="w-11/12 p-[2%] text-xl input-border hover:bg-black hover:text-white">Back</button>
    </div>
  );
}

function ChangeUsername() {

  const {setUser}=useContext(UserContext);
  const navigate=useNavigate();
  const inputValue=useRef(null);
  
  const handleChangeUsername=async ()=>{
    try
    {
      const result=await fetch('/user',{
        method:'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body:JSON.stringify({username:inputValue.current.value})
      });
      if(result.ok)
      {
        const data=await result.json();
        console.log(data);
        setUser(data);
        handleGoBack(); 
      }
    }
    catch(err)
    {
      console.log(err)
    }
  };
  const handleGoBack=()=>{
    navigate(-1);
  };
  return (
    <div id="new-username-window" className="basis-full w-full flex flex-col justify-evenly items-center">
      <div id="new-username-head">Enter your new username:</div>
      <input type="text" id="new-username-input" ref={inputValue} className="w-11/12 input-border p-[2%]" />
      <button id="change" onClick={handleChangeUsername} className="w-11/12 p-[2%] text-xl input-border hover:bg-black hover:text-white">Change Username</button>
      <button id="back-from-change" onClick={handleGoBack} className="w-11/12 p-[2%] text-xl input-border hover:bg-black hover:text-white">Back</button>
    </div>
  );
}

function GameRoutes({setGameActive})
{
    return (
      <div id="menu-options" className="basis-2/4 w-full md:h-full font-black flex flex-col justify-evenly items-center text-4xl">
        <MemoryRouter>
        <Routes>
            <Route index element={<MainMenu setGameActive={setGameActive}/>} />
            <Route path="join-game" element={<JoinGame setGameActive={setGameActive}/>} />
            <Route path="settings" element={<Settings />} />
            <Route path="change-username" element={<ChangeUsername />} />
        </Routes>
        </MemoryRouter>
    </div>
    );
}

function GameMenu({setGameActive})
{
  return (
    <div id="game-menu" className="w-full h-full flex flex-col md:flex-row justify-center items-center">
      <div id="game-title" className="basis-2/4 w-full md:h-full font-black flex flex-col justify-evenly items-center text-4xl">
            <div id="dots" className="basis-1/4 w-full flex justify-center items-center bg-blue-700">DOTS</div>
            <div id="and" className="basis-1/4 w-full flex justify-center items-center bg-green-600">AND</div>
            <div id="boxes" className="basis-1/4 w-full flex justify-center items-center bg-yellow-500">BOXES</div>
            <div id="online" className="basis-1/4 w-full flex justify-center items-center bg-red-600">ONLINE</div>
      </div>
      <GameRoutes setGameActive={setGameActive}/>
    </div>
  );
}

export default GameMenu;