// four buttons
import { Tile, Button, load_tiles, CanvasSpecs, show_results } from './utils.js';

// const x = 600;
// let x = Math.min(window.windowWidth, window.windowHeight);
// console.log(x);

let myCanvas = new CanvasSpecs();
var initiated = false;
// let finished = new Boolean(false);

let CanvasSize = {
    size : 0
};

window.setup = function() {
    var canvas_dim = Math.min(windowWidth, windowHeight) * 0.7;
    myCanvas.size = canvas_dim+0;
    CanvasSize.size = canvas_dim;
    console.log(canvas_dim);
    console.log(myCanvas.size);
    createCanvas(canvas_dim, canvas_dim);
}

console.log(myCanvas.size);

const m = 80;
const b = 0;
// const button_height = Math.floor(0.75 * myCanvas.size);
// const button_height = 300;
// console.log(button_height);
console.log(myCanvas.size);
const button_rad = 48;
const tile_size = 24;

var tileArray = [];
var buttonArray = [];

myCanvas.size = 400;

for (let index = 1; index <= 4; index++) {
    buttonArray.push(new Button(index,0,myCanvas.button_color_list[index-1],0,0,0));
}
for (let int_tile_val of load_tiles()) {
    tileArray.push(new Tile(int_tile_val[0],int_tile_val[1],myCanvas.color_dict[int_tile_val[0]],5,0,0,0));
}

function size_initalize() {
    let size = myCanvas.size;
    let m = myCanvas.size/5;
    // let m = 1;
    let b = 0;
    let button_height = 0.75 * myCanvas.size;
    // let button_height = 300;
    let button_size = 0.12 * myCanvas.size;
    let tile_size = 0.06 * myCanvas.size;
    let tile_speed = 0.0125 * myCanvas.size;
    for (let tile of tileArray) {
        tile.m = m;
        tile.b = b;
        tile.size = tile_size;
        tile.speed = tile_speed;
    }
    for (let button of buttonArray) {
        button.m = m;
        button.b = b;
        button.size = button_size;
        button.y = button_height;
    }
}

window.draw = function() {
    console.log(initiated);
    if(!initiated) {
        initiated = true;
        size_initalize();
        return;
    }
    background('black');
    
    for (let button of buttonArray) {
        button.buttonDraw();
    }
    if (tileArray.at(-1).y <= height) {
        for (let tile of tileArray) {
            tile.tileUpdate();
            tile.tileDraw();
        }
    }
    else {
        show_results(Math.round(myCanvas.score));
    }
    fill(0, 102, 153);
    textSize(32);
    text(Math.round(myCanvas.score).toString(),10,30);
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