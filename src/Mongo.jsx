

const getUser=async (setUser)=>
{
    const result=await fetch('/get-user');
    const data=await result.json();
    setUser(data);
}

export { getUser };
