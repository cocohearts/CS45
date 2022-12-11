import * as utils from './utils.js';

let myCanvas = new utils.CanvasSpecs();
let song;
let myStart;

let tileArray = [];
let strTileArray = utils.readTiles();
let buttonArray = [];

for (let index = 1; index <= 4; index++) {
    buttonArray.push(new utils.Button(index,myCanvas.button_color_list[index-1]));
}

for (let int_tile_val of strTileArray) {
    tileArray.push(new utils.Tile(int_tile_val[0],int_tile_val[1],myCanvas.color_dict[int_tile_val[0]]));
}

window.preload = function() {
    song = loadSound('static/my_music.mp3');
}

window.setup = function() {
    background('black');
    frameRate(myCanvas.framerate);
    noStroke();
    let canvasHeight = Math.min(9*window.innerWidth/13, window.innerHeight) * 0.9;
    let canvasWidth = 13/9 * canvasHeight;
    myCanvas.canvasHeight = canvasHeight;
    myCanvas.canvasWidth = canvasWidth;
    let myCanvasObj = createCanvas(canvasWidth, canvasHeight);
    myCanvasObj.parent('game_container');
    utils.arrayInitialize(myCanvas,tileArray,buttonArray);
}

window.draw = function() {
    background('black');
    let canvasHeight = myCanvas.canvasHeight;

    if (!myCanvas.started) {
        fill('white');
        textAlign(CENTER);
        textSize(0.08 * canvasHeight);
        text("volume on                          press space to start",width*0.1,canvasHeight*0.53,width*0.8,canvasHeight*0.4);
        return;
    }

    for (let button of buttonArray) {
        button.buttonDraw();
    }

    if (tileArray.at(-1).y <= canvasHeight) {
        for (let tile of tileArray) {
            tile.tileUpdate(Date.now() - myStart,myCanvas);
            tile.tileDraw(myCanvas);
        }
    } else if (!myCanvas.finished) {
        myCanvas.finished = true;
        utils.postScores(Math.round(myCanvas.score));
    }

    fill('white');
    textSize(0.1 * canvasHeight);
    text("score: " + Math.round(myCanvas.score).toString(),0.5*width,0.965*canvasHeight);
}

window.keyTyped = function() {
    if (!myCanvas.started || !(myCanvas.keys.includes(window.key)) || tileArray.at(-1).y > myCanvas.canvasHeight) {
        return;
    }

    buttonArray[myCanvas.key_dict[window.key]-1].flair ++;

    let nearby_indices = [];
    for (let index = 0; index < tileArray.length; index++) {
        if (tileArray[index].column === myCanvas.key_dict[window.key]) {
            if (tileArray[index].y >= myCanvas.buttonHeight) {
                if (nearby_indices.length === 0) {
                    nearby_indices.push(index);
                } else {
                    nearby_indices[0] = index;
                }
            } else {
                nearby_indices.push(index);
                break;
            }
        }
    }

    for (let index of nearby_indices) {
        if (Math.abs(tileArray[index].y - myCanvas.buttonHeight) <= myCanvas.canvasHeight/10) {
            tileArray[index].disappeared = true;
            break;
        }
    }

    let distance = Number.POSITIVE_INFINITY;
    for (let index of nearby_indices) {
        distance = Math.min(distance, Math.abs(tileArray[index].y - myCanvas.buttonHeight));
    }
    
    myCanvas.score += 22 * (2 ** (-0.004 * distance ** 2)) - 1;
}

window.keyPressed = function() {
    if (window.key == ' ') {
        if (myCanvas.started) {
            window.location.reload();
        }
        else {
            song.play();
            myCanvas.started = true;
            let return_link = document.getElementById("return_link");
            return_link.style.display = "block";
            myStart = Date.now();
        }
    }
}