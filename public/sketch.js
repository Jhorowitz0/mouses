//check README.md for more information

/// <reference path="TSDef/p5.global-mode.d.ts" />

//create a socket connection
var socket;
var pointer;
var pointerYou;
var pointerAttack;
var pointerDead;
//I send updates at the same rate as the server update
var UPDATE_TIME = 1000 / 10;

//setup is called when all the assets have been loaded
function preload() {
    //load the image and store it in pointer
    pointer = loadImage('assets/pointer.png');
    pointerYou = loadImage('assets/pointer_you.png');
    pointerAttack = loadImage('assets/pointer_attack.png');
    pointerDead = loadImage('assets/pointer_dead.png');
}

function setup() {
    //create a canvas
    createCanvas(800, 600);
    //paint it white
    background(255, 255, 255);

    noCursor();

    //I create socket but I wait to assign all the functions before opening a connection
    socket = io({
        autoConnect: false
    });

    //detects a server connection 
    socket.on('connect', onConnect);
    //handles the messages from the server, the parameter is a string
    socket.on('message', onMessage);
    //handles the user action broadcast by the server, the parameter is an object
    socket.on('state', updateState);

    socket.open();

    //every x time I update the server on my position
    setInterval(function () {
        socket.emit('clientUpdate', { x: mouseX, y: mouseY});
    }, UPDATE_TIME);
}

//this p5 function is called continuously 60 times per second by default
//we are not using it yet, we update the canvas only when we receive new updates, see below
function draw() {
}

function mousePressed(){
    socket.emit('attack', { x: mouseX, y: mouseY});
}

function mouseReleased(){
    socket.emit('return');
}

//called by the server every 30 fps
function updateState(state) {

    //draw a black background
    background(0,0,0);

    //iterate through the players
    for (var playerId in state.players) {
        if (state.players.hasOwnProperty(playerId)) {
            var playerState = state.players[playerId];

            //image(pointer, playerState.x, playerState.y);
            if(playerState.isDead){
                image(pointerDead, playerState.x, playerState.y);
            }else if(playerState.isAttacking){
                noStroke();
                fill(255,0,0,100);
                ellipse(playerState.x,playerState.y,20,20);
                image(pointerAttack, playerState.x, playerState.y);
            }else if(playerId == socket.id) {
                image(pointerYou, playerState.x, playerState.y);
            }else{
                image(pointer, playerState.x, playerState.y);
            }
        }
    }

}

//connected to the server
function onConnect() {
    if (socket.id) {
        console.log("Connected to the server");
        socket.emit('newPlayer', { x: mouseX, y: mouseY });
    }
}

//a message from the server
function onMessage(msg) {
    if (socket.id) {
        console.log("Message from server: " + msg);
    }
}