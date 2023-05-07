const express=require('express');
const userModel=require('../models/user_account.js');
const authRouter=express.Router();
const jwt=require('jsonwebtoken');

/****************************************************************/

const errorProcessing=(err,userModel)=>{
    let error={};
    if(err.message==="This user does not exist")
    {
        error['email']=err.message;
        return error;
    }
    if(err.message==="Incorrect password")
    {
        error['password']=err.message;
        return error;
    }
    if(err.code==11000)
    {
        error['email']="A user with this email already exists";
    }
    if(err.message.includes(`${userModel.collection.collectionName} validation failed`))
    {
        
        errors=Object.values(err.errors);
        errors.forEach(element => {
            error[element.properties.path]=element.properties.message;
        });
    }
    return error;
}

/*****************************************************************/

authRouter.get('/login',(req,res)=>{
    res.render('login_page.ejs',{user:'',error:{}});
}); 

authRouter.post('/login',async (req,res)=>{
    const {email,password}=req.body;
    try
    {
        const user=await userModel.login(email,password);
        console.log("User logging in:",user);
        const maxAge=30*24*60*60;
        const token=jwt.sign({id:user._id},'dots boxes secret',{expiresIn:maxAge});
        res.cookie('jwt',token,{httpOnly:true,secure:true,maxAge:maxAge*1000});
        res.redirect('/');
    }
    catch(err)
    {
        console.log(err);
        const error=errorProcessing(err,userModel);
        res.render('login_page.ejs',{user:'',error:error});
    }    
});

authRouter.get('/signup',(req,res)=>{
    res.render('signup_page.ejs',{error:{}});
});

authRouter.post('/signup',async (req,res)=>{
    const {email,username,password}=req.body;
        
    try
    {
        const user=await userModel.create({email,username,password});
        res.status(201).render('login_page.ejs',{user:user.username,error:{}});
    }
    catch(err)
    {
        console.log("Something went wrong");
        const error=errorProcessing(err,userModel);
        console.log(error);
        res.status(404).render('signup_page.ejs',{error:error});
    }
});




module.exports=authRouter;