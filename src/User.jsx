import { createContext, useEffect, useState } from "react";
import { getUser } from "./Mongo";

const UserContext=createContext();

const UserProvider=({children})=>{
    const [user,setUser]=useState(null);
    
    useEffect(()=>{
        getUser(setUser);

    },[]);


    const contextValue={user,setUser};

    return (
        <UserContext.Provider value={contextValue}>
            {children}
            </UserContext.Provider>
    );
};

export {UserContext,UserProvider};


