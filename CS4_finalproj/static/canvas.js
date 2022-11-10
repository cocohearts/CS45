// four buttons
import { Tile, Button, load_tiles } from './utils.js';

// const x = 600;
// let x = Math.min(window.windowWidth, window.windowHeight);
// console.log(x);
let canvas_dim = [];
window.setup = function() {
    
    // console.log(x);
    // let x = 400;
    // createCanvas(x, x);
    canvas_dim = Math.min(windowWidth, windowHeight) / 2;
    createCanvas(canvas_dim, canvas_dim);
}

var score = 0;
const keys = ['a', 's', 'd', 'f'];
const key_dict = {
    'a' : 1,
    's' : 2,
    'd' : 3,
    'f' : 4,
};

const color_dict = {
    1 : 'rgb(228,95,95)',
    2 : 'red',
    3 : 'yellow',
    4 : 'cyan'
}

const button_color_list = [
    'red',
    'yellow',
    'green',
    'blue'
]

// const m = canvas_dim/5;
// const b = 0;
// const button_height = 0.75 * canvas_dim;
// const button_rad = 0.12 * canvas_dim;
// const tile_size = 0.06 * canvas_dim;

const m = 80;
const b = 0;
const button_height = Math.floor(0.75 * canvas_dim);
console.log(button_height);
console.log(canvas_dim);
const button_rad = 48;
const tile_size = 24;

var tileArray = [];
var buttonArray = [];

for (let index = 1; index <= 4; index++) {
    buttonArray.push(new Button(index,button_height,button_color_list[index-1],m,b,button_rad));
}

for (let int_tile_val of load_tiles()) {
    tileArray.push(new Tile(int_tile_val[0],int_tile_val[1],color_dict[int_tile_val[0]],5,m,b,tile_size));
}

// console.log(tileArray);

window.draw = function() {
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
    fill(0, 102, 153);
    textSize(32);
    text(Math.round(score).toString(),10,30);
}

window.keyTyped = function() {
    if (!(keys.includes(window.key))) {
        return;
    }

    if (tileArray.at(-1).y > height) {
        return;
    }
    var nearby_indices = [];
    for (let index = 0; index < tileArray.length; index++) {
        if (tileArray[index].x === key_dict[window.key]) {
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
    
    score += Math.min(100/(distance+5)-5);
}