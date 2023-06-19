

const getUser=async (setUser)=>
{
    try
    {
        const result=await fetch('/user');
        const data=await result.json();
        setUser(data);
    }
    catch(err)
    {
        console.log(err);
    }
}

export { getUser };
