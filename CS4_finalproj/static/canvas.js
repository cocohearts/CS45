import * as utils from './utils.js';

let myCanvas = new utils.CanvasSpecs();
let song;

window.preload = function() {
    song = loadSound('static/my_music.mp3');
}

window.setup = function() {
    noStroke();
    var canvas_height = Math.min(9*window.innerWidth/13, window.innerHeight) * 0.9;
    var canvas_width = 13/9 * canvas_height;
    myCanvas.height = canvas_height;
    myCanvas.width = canvas_width;
    let myCanvasObj = createCanvas(canvas_width, canvas_height);
    myCanvasObj.parent('game_container');
    utils.size_initalize(myCanvas,tileArray,buttonArray);
}

var tileArray = [];
var strTileArray = utils.initialize_tilearr();
var buttonArray = [];

for (let index = 1; index <= 4; index++) {
    buttonArray.push(new utils.Button(index,myCanvas.button_color_list[index-1]));
}

for (let int_tile_val of strTileArray) {
    tileArray.push(new utils.Tile(int_tile_val[0],int_tile_val[1],myCanvas.color_dict[int_tile_val[0]],5,0,0,0));
}

window.draw = function() {
    background('black');
    frameRate(60);
    let width = myCanvas.width;
    let height = myCanvas.height;

    if (!myCanvas.started) {
        fill('white');
        textAlign(CENTER);
        textSize(0.08 * height);
        text("volume on                          press space to start",width*0.1,height*0.53,width*0.8,height*0.4);
        return;
    }

    for (let button of buttonArray) {
        button.buttonDraw();
    }

    if (tileArray.at(-1).y <= height) {
        for (let tile of tileArray) {
            tile.tileUpdate();
            tile.tileDraw(height);
        }
    } else if (!myCanvas.finished) {
        myCanvas.finished = true;
        utils.postScores(Math.round(myCanvas.score));
    }

    fill('white');
    textSize(0.1 * height);
    text("score: " + Math.round(myCanvas.score).toString(),0.5*width,0.965*height);
}

window.keyTyped = function() {
    if (!myCanvas.started || !(myCanvas.keys.includes(window.key)) || tileArray.at(-1).y > height) {
        return;
    }

    buttonArray[myCanvas.key_dict[window.key]-1].flair ++;

    let button_height = buttonArray[0].y;
    var nearby_indices = [];
    for (let index = 0; index < tileArray.length; index++) {
        if (tileArray[index].x === myCanvas.key_dict[window.key]) {
            if (tileArray[index].y >= button_height) {
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
        if (Math.abs(tileArray[index].y - button_height) <= myCanvas.height/10) {
            tileArray[index].disappeared = true;
            break;
        }
    }

    let distance = Number.POSITIVE_INFINITY;
    for (let index of nearby_indices) {
        distance = Math.min(distance, Math.abs(tileArray[index].y - button_height));
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
            var return_link = document.getElementById("return_link");
            return_link.style.display = "block";
        }
    }
}