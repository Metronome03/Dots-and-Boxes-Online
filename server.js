const express=require('express');
const mongoose=require('mongoose');
const authRouter=require('./routes/authentication.js');
const userRouter=require('./routes/user_pages.js');
const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser');
const { Server } = require("socket.io");

var cors = require('cors')

const app=express();
const server=require('http').createServer(app);

app.use(cors())
app.use(cookieParser());
app.set('view engine','ejs');
app.set('views',['authentication_pages'])
app.use(express.urlencoded({extended: false}));
app.use(express.static('tailwind/output'));

const PORT=3000;
let i=0;
let io;
const db="mongodb+srv://dboadmin:lvz5cAafTQ3VvopN@dotsboxes.i3r3gcy.mongodb.net/dotsboxes?retryWrites=true&w=majority";
mongoose.connect(db,{autoIndex:true})
.then(()=>{
    server.listen(PORT,()=>{
        console.log(`Server is running at ${PORT}`);
    });
    console.log("Database is connected");
    
    io=new Server(server,{
        cors:{
            origin:['http://localhost:3001']
    }
});
    app.use(authStatus,userRouter(io));
})
.catch((err)=>{
    console.log("Failed to connect to database");
    console.log(err);
});


/******************************************************/

function authStatus(req,res,next){
    const token=req.cookies.jwt;
    if(token)
    {
        //console.log("Encoded token:",token);
        jwt.verify(token,'dots boxes secret',(err,decoded)=>{
            if(err)
            {
                res.redirect('/login');
            }
            else
            {
                //console.log("Decoded token:",decoded)
                next();
            }
        });
    }
    else
    {
        res.redirect('/login')
    }
};

/******************************************************/


app.use(authRouter);





