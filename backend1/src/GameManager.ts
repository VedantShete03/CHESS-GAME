

import { WebSocket } from "ws";
import { INIT_GAME } from "./messages";
import { MOVE } from "./messages";
import { Game } from "./Game";


export class GameManager {
    private games: Game[];
    private pendingUser: WebSocket | null;
    private users: WebSocket[];

    constructor(){
        this.games=[];
        this.pendingUser = null;
        this.users=[];
    }



    addUser(socket: WebSocket){
        this.users.push(socket);
        this.addHandler(socket);

    }
    removeUser(socket: WebSocket){
        this.users = this.users.filter(user => user !== socket);
        //stop game
    }
    private addHandler(socket: WebSocket){
        socket.on("message", (data)=> {
            const message = JSON.parse(data.toString());
            console.log("almost checkmate reached");
            if(message.type === MOVE){
                console.log("inside move")
                const game=this.games.find(game => game.player1===socket || game.player2===socket);
                if(game){
                    console.log("inside makemove")
                    game.makeMove(socket,message.payload.move);
                }
            
            }
            else if(message.type === "CHECKMATE"){ // Assuming "CHECKMATE" is the message type for checkmate
                console.log("Checkmate detected");
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if(game){
                    // Notify both players about the checkmate, with basic error handling
                    [game.player1, game.player2].forEach(player => {
                        if(player) { // Basic validation to ensure player is not null or undefined
                            try {
                                player.send(JSON.stringify({ type: "CHECKMATE", payload: { message: "Checkmate! Game over." } }));
                            } catch (error) {
                                console.error(`Error sending checkmate message to player: ${error}`);
                            }
                        }
                    });
            
                    // Remove the game from the active games list
                    this.games = this.games.filter(g => g !== game);
                }
            }
            else if(message.type === INIT_GAME){
                if(this.pendingUser){
                    //start a game
                    const game=new Game(this.pendingUser,socket);
                    this.games.push(game);
                    this.pendingUser=null;
                }
                else{
                    this.pendingUser = socket;
                }
            }
            
        })
    }
}


