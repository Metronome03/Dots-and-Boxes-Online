let joinGameButton=document.querySelector("button#join-game");
let settingsButton=document.querySelector("button#settings");
let joinGameBackButton=document.querySelector("button#back-from-join");
let settingsBackButton=document.querySelector("button#back-from-settings");
let changeUsernameButton=document.querySelector("button#change-username");
let changeUsernameBackButton=document.querySelector("button#back-from-change");


joinGameButton.addEventListener("click",()=>{
    let joinGameWindow=document.querySelector("section#join-game-window");
    let menuOptionsWindow=document.querySelector("section#menu-options");
    joinGameWindow.style.display="flex";
    menuOptionsWindow.style.display="none";
});
settingsButton.addEventListener("click",()=>{
    let settingsWindow=document.querySelector("section#settings-window");
    let menuOptionsWindow=document.querySelector("section#menu-options");
    settingsWindow.style.display="flex";
    menuOptionsWindow.style.display="none";
});

joinGameBackButton.addEventListener("click",()=>{
    let joinGameWindow=document.querySelector("section#join-game-window");
    let menuOptionsWindow=document.querySelector("section#menu-options");
    joinGameWindow.style.display="none";
    menuOptionsWindow.style.display="flex";
});
settingsBackButton.addEventListener("click",()=>{
    let settingsWindow=document.querySelector("section#settings-window");
    let menuOptionsWindow=document.querySelector("section#menu-options");
    settingsWindow.style.display="none";
    menuOptionsWindow.style.display="flex";
});

changeUsernameButton.addEventListener("click",()=>{
    let changeUsernameWindow=document.querySelector("section#new-username-window");
    let settingsWindow=document.querySelector("section#settings-window");
    changeUsernameWindow.style.display="flex";
    settingsWindow.style.display="none";
});

changeUsernameBackButton.addEventListener("click",()=>{
    let changeUsernameWindow=document.querySelector("section#new-username-window");
    let settingsWindow=document.querySelector("section#settings-window");
    changeUsernameWindow.style.display="none";
    settingsWindow.style.display="flex";
});
