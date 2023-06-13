import {io} from 'socket.io-client';


const socket=io('http://localhost:3000');

socket.on('connect',()=>{
    console.log('socket-id:',socket.id);
});



export default socket;