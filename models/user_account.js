const mongoose=require('mongoose');
const bcrypt=require('bcrypt');

const schema=new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Please enter an email"],
        unique:true,
        lowercase:true,
        validate:[(x)=>{
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(x))
            return true;
            else
            return false;
        },"Please enter a valid e-mail address"]
    },
    username:{
        type:String,
        required:[true,"Please enter a username"]
    },
    password:{
        type:String,
        required:[true,"Please enter a password"],
        minlength:[8,"Password should have minimum of 8 characters"]
    },
});

schema.pre('save',async function(next){
    const salt= await bcrypt.genSalt();
    this.password=await bcrypt.hash(this.password,salt);
    next();
});

schema.statics.login=async function(email,password){
    let user=await this.findOne({email:email});
    if(!user)
    user=await this.find({username:email});
    if((!Array.isArray(user)&&user)||(Array.isArray(user)&&user.length>0))
    {
        let userIndex=0,isValid=false;
        if(!Array.isArray(user))
        isValid=await bcrypt.compare(password,user.password);
        else
        {
            for(let i=0;i<user.length;i++)
            {
                if(isValid==true)
                break;
                isValid=await bcrypt.compare(password,user[i].password);
                userIndex=i;
            }
        }
        if(isValid)
        {
            if(!Array.isArray(user))
            return user;
            else
            {
                return user[userIndex];
            }
        }
        else
        throw Error("Incorrect password");
    }
    else
    {
        throw Error("This user does not exist");
    }   
};

const user=mongoose.model('users',schema);

module.exports=user;