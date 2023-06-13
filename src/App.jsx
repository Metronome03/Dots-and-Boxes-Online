import { useContext, useEffect, useState } from 'react';
import socket from './Sockets';
import GameMenu from './GameMenu';
import GameWindow from './GameWindow';
import { UserContext } from './User';

function App() {
  const [gameActive,setGameActive]=useState(false);
  const {user}=useContext(UserContext);

  useEffect(()=>{
    socket.on('joined-game',()=>{
      setGameActive(true);
    });
  },[]);
  if(user==null)
  {
    return (
      <div id="retrieving-user">Retrieving User...</div>
    );
  }
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

export default App
