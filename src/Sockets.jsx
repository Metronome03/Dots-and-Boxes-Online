import {io} from 'socket.io-client';

const socket=io(window.location.href);

socket.on('connect',()=>{
    console.log('socket-id:',socket.id);
});



export default socket;