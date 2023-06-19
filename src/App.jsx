import { useContext } from 'react';
import { UserContext } from './User';
import { RoomProvider } from './Room';
import GameStuff from './GameStuff';

function App() {
  
  const {user}=useContext(UserContext);
  
  if(user==null)
  {
    return (
      <div id="retrieving-user">Retrieving User...</div>
    );
  }
  else
  {
    return (
      <RoomProvider>
        <GameStuff/>
      </RoomProvider>
    );
    
  }
}

export default App
