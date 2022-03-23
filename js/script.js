const mapSize = 99;
const obstacles = 15;
let tiles = [];
let possibleMoves = 3;
let playerActive;
let activePlayer = 1;
let currentWeapon = 1;
let turn = 0;
let playerDefend = null;
let player1Active = true;
let player2Active = false;
let move = true;
let attacked = false;
let hover = false;

const attackBtn1 = $('.btn-attack-1');
const attackBtn2 = $('.btn-attack-2');
const defendBtn1 = $('.btn-defend-1');
const defendBtn2 = $('.btn-defend-2');
const startButton = $('#start');
const mapContainer = $('#board-game');
const startContainer = $('#intro');
const gameOverContainer =$('#gameOver');
const playerContainerDiv = $('.player-container');
const powerDiv1 = $('.health-1');
const powerDiv2 = $('.health-2');
const body = $('body');
const turnMessage = [
"It's your turn! Good Luck!",
"Be careful, don't start your fight if you aren't strong!",
"Do you have enough health?",
"Your enemy is behind your back!",
"Make a move!",
]
const noTurnMessage = 'Wait for your turn!';
let scores = 0;

// map constructor function to create map tile board with obstacles
class Map {
    constructor(mapSize) {
        this.mapSize = mapSize;
        this.create = function () {
            for (let i = 0; i <= mapSize; i++) {
                mapContainer.append('<li class="box" data-index="' + i + '"></li>');
                let numTiles = $('.box').length;
                tiles.push(numTiles);
            }
        };
        this.obstacles = function (itemClass) {
            addComponents(itemClass);
        };
    }
}

// create game map object
let game = new Map(mapSize);

// participant construction function
class participant {
    constructor(name, lifeScore, itemClass, player, weapon, power, activePath) {
        this.name = name;
        this.lifeScore = lifeScore;
        this.itemClass = itemClass;
        this.player = player;
        this.weapon = weapon;
        this.power = power;
        this.activePath = activePath;
        //add players to the map
        this.add = function () {
            addComponents(this.itemClass, this.player);
        };
        // set information about player on the boards;
        this.setData = function () {
            $('.name-' + this.player).text(this.name);
            $('#life-' + this.player).text(this.lifeScore);
            $('<img src="image/wp-1.png">').appendTo(".weapon-" + this.player);
            $('.health-' + this.player).text(this.power);
        };
        //players fight logic
        this.attack = function (whichParticipant) {
            if (playerDefend == 1) {
                whichParticipant.lifeScore -= (this.power / 2);
                playerDefend = 0;
            }
            else {
                whichParticipant.lifeScore -= this.power;
            }
            $('#life-' + whichParticipant.player).text(whichParticipant.lifeScore);
            if (whichParticipant.lifeScore <= 0) {
                gameOver();
            }
        };
        // check who is the winner and who lost the game and display the information on the Game Over Board 
        this.winner = function (whichParticipant) {
            if (whichParticipant.lifeScore <= 0) {
                $('#winner').text(this.name);
                $('#looser').text(whichParticipant.name);
            }
            else if (this.lifeScore <= 0) {
                $('#winner').text(whichParticipant.name);
                $('#looser').text(this.name);
            }
        };
    }
}

// weapon function constructor:
class Weapon {
    constructor(type, value, itemClass) {
        this.type = type;
        this.value = value;
        this.itemClass = itemClass;
        // add weapons to the map
        this.add = function () {
            addComponents(this.itemClass);
        };
    }
}
;

// create Players
let player1 = new participant('Player 1', 100, 'player1', 1, 'wp-1', 10, 'image/path-1.png');
let player2 = new participant('Player 2', 100, 'player2', 2, 'wp-1', 10, 'image/path-2.png');

// create weapons with their attributes:
let defaultWeapon = new Weapon('DefaultWeapon', 10, 'wp-1 weapon');
let firstwp = new Weapon('FirstWeapon', 30, 'wp-2 weapon');
let secondwp = new Weapon('SecondWeapon', 40, 'wp-3 weapon');
let thirdwp = new Weapon('ThirdWeapon', 50, 'wp-4 weapon');

// initialize the movment of the players:

function movePlayer() {
    let gameBox = $('.box');
    gameBox.hover( function () {
            hover = true;
            let hovered = $(this).data('index');
            posNew = getCoordinates(hovered);
            //check the posible horizontal move
            for (let i in Math.min(posOld.x, posNew.x)) {
                let num = getTileIndex(i, posOld.y);
                let tile = $('.box[data-index="' + num + '"]');
                if (tile.hasClass('obstacle')) {
                    return;
                }
                if (player1Active) {
                    if (tile.hasClass('player2')) {
                        return;
                    }
                } else {
                    if (tile.hasClass('player1')) {
                        return;
                    }
                }
            }
            //check the posible vertical move
            for (let i in Math.min(posOld.y, posNew.y)) {
                let num = getTileIndex(posOld.x, i);
                let tile = $('.box[data-index="' + num + '"]');
                if (tile.hasClass('obstacle')) {
                    return;
                }
                if (player1Active) {
                    if (tile.hasClass('player2')) {
                        return;
                    }
                } else {
                    if (tile.hasClass('player1')) {
                        return;
                    }
                }
            }
            if (!attacked) {
                if (posNew.y === posOld.y && posNew.x <= posOld.x + possibleMoves && posNew.x >= posOld.x - possibleMoves
                    || posNew.x === posOld.x && posNew.y <= posOld.y + possibleMoves && posNew.y >= posOld.y - possibleMoves) {

                    if (player1Active) {
                        $(this).css('backgroundImage', 'url(' + player1.activePath + ')');

                    } else {
                        $(this).css('backgroundImage', 'url(' + player2.activePath + ')');
                    }
                }

            }
        }, 
        function () {
            hover = false;
            $(this).css('backgroundImage', '');
        }
    );
    // by the click method choose the next position of the player 
    gameBox.on('click', function () {
        hover = false;
        let sqClicked = $(this).data('index');
        posNew = getCoordinates(sqClicked);
        //new position of the player choosen by mouse click vertically - coordinate X
        for (let i in Math.min(posOld.x, posNew.x)) {
            let num = getTileIndex(i, posOld.y);
            let tile = $('.box[data-index="' + num + '"]');
            if (tile.hasClass('obstacle')) {
                $(this).css('cursor', 'not-allowed');
                return;
            }
            if (player1Active) {
                if (tile.hasClass('player2')) {
                    return;
                }
            } else {
                if (tile.hasClass('player1')) {
                    return;
                }
            }
        }
        //check possible new position of the player choosen by mouse click vertically
        for (let i = Math.min(posOld.y, posNew.y); i <= Math.max(posOld.y, posNew.y); i++) {
            let num = getTileIndex(posOld.x, i);
            let tile = $('.box[data-index="' + num + '"]');
            // if new tile includes obstacle - don't move
            if (tile.hasClass('obstacle')) {
                $(this).css('cursor', 'not-allowed');
                return;
            }
            // if new tile includes players - don't move
            if (player1Active) {
                if (tile.hasClass('player2')) {
                    return;
                }
            } else {
                if (tile.hasClass('player1')) {
                    return;
                }
            }
        }
        if (player1Active) {
            if ($(this).hasClass('player1')){
                return;
            }
        }else{
            if ($(this).hasClass('player2')){
                return;
            }
        }

        if (move) {
            // check when the player can move maximum 3 tiles (possibleMoves) horizontally or vertically
            if (posNew.y === posOld.y && posNew.x <= posOld.x + possibleMoves && posNew.x >= posOld.x - possibleMoves
                || posNew.x === posOld.x && posNew.y <= posOld.y + possibleMoves && posNew.y >= posOld.y - possibleMoves) {
                // check the position X
                for (let i = Math.min(posOld.x, posNew.x); i <= Math.max(posOld.x, posNew.x); i++) {
                    let num = getTileIndex(i, posOld.y);
                    checkWeapon(num);
                }
                // check the position Y
                for (let i = Math.min(posOld.y, posNew.y); i <= Math.max(posOld.y, posNew.y); i++) {
                    let num = getTileIndex(posOld.x, i);
                    checkWeapon(num);
                }
                whoIsActive();
                //setting active player after the other player moves
                if (player1Active) {
                    playerPosition = boxPosition('.player2');
                    posOld = getCoordinates(playerPosition);
                    $('.player1').removeClass('player1').removeClass('active');
                    $(this).addClass('player1');
                    $('.player2').addClass('active');
                    fight(posNew, posOld);
                    player1Active = false;

                
                } else {
                    playerPosition = boxPosition('.player1');
                    posOld = getCoordinates(playerPosition);
                    $('.player2').removeClass('player2').removeClass('active');
                    $(this).addClass('player2');
                    $('.player1').addClass('active');
                    fight(posNew, posOld);
                    player1Active = true;
                }
            }
        }
    });
}

// add components
function addComponents(itemClass, player) {
    let restOfTiles = tiles;
    let boxes = $('.box');
    let empty = true;
    while (empty) {
        let item = random(mapSize);
        if (player === 1) {
            positionOfPlayer = (item % 10 === 0);
        } else if (player === 2) {
            positionOfPlayer = (item % 10 === 9);
        } else {
            positionOfPlayer = (item % 10 !== 0 && item % 10 !== 9);
        }
        if (positionOfPlayer && restOfTiles.includes(item)) {
            boxes.eq(item).addClass(itemClass);
            let index = restOfTiles.indexOf(item);
            restOfTiles.splice(index, 1);
            empty = false;
        }
    }
}
// replace the weapon on the map:
function replaceWeaponOnMap(value, weapon, num) {
    let tile = $('.box[data-index="' + num + '"]');
    whoIsActive();
    tile.removeClass(weapon).addClass(playerActive.weapon);
    playerActive.weapon = weapon;    
    playerNotActive.power = value;        
}

// check weapon on the tile and call replace functions
function checkWeapon(num) {
    let tile = $('.box[data-index="' + num + '"]');
    if (tile.hasClass('weapon')) {
        if (tile.hasClass('wp-1')) {
            currentWeapon = 1;
            replaceWeaponOnMap(defaultWeapon.value, 'wp-1', num);
            replaceWeaponOnBoard(defaultWeapon.value);
            return;
        }
        if (tile.hasClass('wp-2')) {
            currentWeapon = 2;
            replaceWeaponOnMap(firstwp.value, 'wp-2', num);
            replaceWeaponOnBoard(firstwp.value);
            return;
        }
        if (tile.hasClass('wp-3')) {
            currentWeapon = 3;
            replaceWeaponOnMap(secondwp.value,'wp-3',num);
            replaceWeaponOnBoard(secondwp.value); 
            return;
        }
        if (tile.hasClass('wp-4')) {
            currentWeapon = 4;
            replaceWeaponOnMap(thirdwp.value, 'wp-4', num);
            replaceWeaponOnBoard(thirdwp.value);
            return;
        }
        }
}

// If players cross over adjacent squares (horizontally or vertically), a battle begins
function fight(posNew, posOld) {

    if (posNew.x === posOld.x 
        && posNew.y <= posOld.y + 1 && posNew.y >= posOld.y - 1 ||posNew.y === posOld.y 
        && posNew.x <= posOld.x + 1 && posNew.x >= posOld.x - 1) {
        move = false;
        hover = false;
        fightingArea();
        scores = 0;
        fightPlayerOne();
        fightPlayerTwo();
    }
}

//initialize the Game
function initGame() {
    game.create();
    for (let i = 0; i < obstacles; i += 1) {
        game.obstacles('obstacle');
    }
    firstwp.add();
    secondwp.add();
    thirdwp.add();
    player1.add();
    player2.add();
    player1.setData();
    player2.setData();
    $('.player1').addClass('active');

}

initGame();
movePlayer();

// Active player
function whoIsActive() {
    if (player1Active) {
        activePlayer = 2;
        notActivePlayer = 1;
        setActivePlayer(player2, player1, powerDiv2);
        setActiveBoard(notActivePlayer, activePlayer);
        displayMessageOnBoard(activePlayer);  
    } else {
        activePlayer = 1; 
        notActivePlayer = 2;
        setActivePlayer(player1, player2, powerDiv1);
        setActiveBoard(notActivePlayer, activePlayer,);
        displayMessageOnBoard(activePlayer);
    }

}

// to find position x and y  
function getCoordinates(tile) {
    return {
        x: (tile) % 10,
        y: Math.floor((tile) / 10)
    }
}
const boxPosition = (itemClass) => {
    return $(itemClass).data('index');
};
let playerPosition = boxPosition('.player1');
let posOld = getCoordinates(playerPosition);

function getTileIndex(x, y) {
    return y * 10 + x;
}

// random game components' position
function random(num) {
    return Math.floor(Math.random() * num);
}

function setActivePlayer(Active, notActive, activePowerDiv) {
    playerActive = Active;
    playerNotActive = notActive; 
    activePlayerPowerDiv = activePowerDiv;      
}
// current information about game
function setActiveBoard(notActivePlayer, activePlayer) {
    $('#player-' + notActivePlayer).removeClass('active-board');
    $('#player-' + activePlayer).addClass('active-board');
}
// display random message on active player's board
function displayMessageOnBoard(activePlayer) {  
    let text = turnMessage[Math.floor(Math.random()*turnMessage.length)];
    $('.turn-' + activePlayer).text(text);
    $('.turn-' + notActivePlayer).text(noTurnMessage);
}
// replace the information on the player's board:
function replaceWeaponOnBoard(power){
    whoIsActive();
    $('.weapon-' + notActivePlayer).empty();
    $('<img src="image/wp-' + currentWeapon +'.png">').appendTo(".weapon-" + notActivePlayer);
    $(".health-" + notActivePlayer).text(power);
}

// show and hide buttons during the fight
function combat() {
    if(turn == 0) {
        attackBtn1.hide();
        defendBtn1.hide();
        attackBtn2.hide();
        defendBtn2.hide();
    }else if(turn == 1) {
        attackBtn2.hide();
        defendBtn2.hide();
        attackBtn1.show(1000);
        defendBtn1.show(1000);
    } else if (turn == 2) {
        attackBtn1.hide();
        defendBtn1.hide();
        attackBtn2.show(1000);
        defendBtn2.show(1000);       
    }
}
// players attack
function fightingArea() {
    mapContainer.hide();
    $('#player-1').css('margin-left', '600px');
    $('#player-2').css('margin-right', '700px');
    $(body).css({
        'backgroundImage' : 'url("image/bgg.jpg")',
        'backgroundSize'  : 'cover',
        'height' : '700px'
    })
    $('div.turn-1').empty();
    $('div.turn-2').empty();
    $('#player-' + activePlayer).removeClass('active-board');
    attackBtn1.show(2000);
    defendBtn1.show(2000);

}
// display Game Over
function gameOver() {
    $('.player-container').hide();
    $('header').hide();
    gameOverContainer.show(2000);
    player1.winner(player2);
}

function startGame(){
    playerContainerDiv.show(2000);
    mapContainer.show(2000);
    startContainer.hide(2000);
    attackBtn1.hide();
    attackBtn2.hide(); 
    defendBtn1.hide();
    defendBtn2.hide();
 };

// attack and defend buttons connected with attack function mentioned in player function constructor
function fightPlayerOne(){
    attackBtn1.click(function() {
        player1.attack(player2);
        pleyerDefend = 0;
        turn = 2;
        activePlayer = 2;
        combat();
    });
    defendBtn1.click(function(){
        playerDefend = 1;
        turn = 2;
        activePlayer = 2;
        combat();
        
    })
}
function fightPlayerTwo() {
        attackBtn2.click(function() {
        player2.attack(player1);
        pleyerDefend = 0;
        turn = 1;
        activePlayer = 1;
        combat();
    });
    defendBtn2.click(function(){       
        turn = 1;
        playerDefend = 1;
        activePlayer = 1;
        combat();
        
    })
}



