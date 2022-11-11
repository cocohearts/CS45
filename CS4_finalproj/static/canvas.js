// four buttons
import { Tile, Button, load_tiles, CanvasSpecs, show_results, size_initalize } from './utils.js';

let myCanvas = new CanvasSpecs();

window.setup = function() {
    var canvas_dim = Math.min(windowWidth, windowHeight) * 0.8;
    myCanvas.size = canvas_dim+0;
    console.log(canvas_dim);
    console.log(myCanvas.size);
    let myCanvasObj = createCanvas(canvas_dim, canvas_dim);
    myCanvasObj.parent('game_container');
    size_initalize(myCanvas,tileArray,buttonArray);
    // var CanvasElem = document.getElementById("defaultCanvas0");
    // CanvasElem.className = 'game_container';
}

console.log(myCanvas.size);

var tileArray = [];
var buttonArray = [];

myCanvas.size = 400;

for (let index = 1; index <= 4; index++) {
    buttonArray.push(new Button(index,0,myCanvas.button_color_list[index-1],0,0,0));
}
for (let int_tile_val of load_tiles()) {
    tileArray.push(new Tile(int_tile_val[0],int_tile_val[1],myCanvas.color_dict[int_tile_val[0]],5,0,0,0));
}

window.draw = function() {
    background('black');
    let size = myCanvas.size;
    console.log(myCanvas.size);

    if (!myCanvas.started) {
        fill(0, 102, 153);
        textAlign(CENTER);
        textSize(0.08 * size);
        text("click anywhere to start",size*0.1,size*0.4,size*0.8,size*0.4);
        return;
    }

    for (let button of buttonArray) {
        button.buttonDraw();
    }
    if (tileArray.at(-1).y <= height) {
        for (let tile of tileArray) {
            tile.tileUpdate();
            tile.tileDraw();
    }}
    else {
        show_results(Math.round(myCanvas.score));
    }
    fill(0, 102, 153);
    textSize(0.1 * size);
    text("score: " + Math.round(myCanvas.score).toString(),0.5*size,0.85*size);
}

window.keyTyped = function() {
    if (!(myCanvas.keys.includes(window.key))) {
        return;
    }

    if (tileArray.at(-1).y > height) {
        return;
    }
    let button_height = buttonArray[0].y;
    var nearby_indices = [];
    for (let index = 0; index < tileArray.length; index++) {
        if (tileArray[index].x === myCanvas.key_dict[window.key]) {
            if (tileArray[index].y >= button_height) {
                if (nearby_indices.length === 0) {
                    nearby_indices.push(index);
                }
                else {
                    nearby_indices[0] = index;
                }
            }
            else {
                nearby_indices.push(index);
                break;
            }
        }
    }
    let distances = [];
    for (let index of nearby_indices) {
        distances.push(Math.abs(tileArray[index].y - button_height));
    }
    let distance = Math.min(...distances);
    
    myCanvas.score += 300/(distance+5)-5;
}

window.mouseClicked = function() {
    myCanvas.started = true;
}