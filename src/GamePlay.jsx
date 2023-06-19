import PlayerInfoStuff from "./PlayerInfoStuff";
import GameScreen from "./GameScreen";

function GamePlay()
{
    return (
        <div id="game-play" className="basis-full w-full h-full flex flex-col md:flex-row justify-center items-center">
            <PlayerInfoStuff/>
            <GameScreen/>
        </div>
    );
}

export default GamePlay;
