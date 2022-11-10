// four buttons
import { TileArray, Tile } from './Tile.js';

window.setup = function() {
    createCanvas(400, 400);
}

var result = null;
var xmlhttp = new XMLHttpRequest();
xmlhttp.open("GET", './static/tiles.txt', false);
xmlhttp.send();
if (xmlhttp.status==200) {
    result = xmlhttp.responseText;
}
const arr = result.split(/\r?\n/);
var tile_vals = [];
for (var tile_line of result.split(/\r?\n/)) {
    tile_vals.push(tile_line.split(" "));
}
console.log(arr);
console.log(tile_vals);

var score = 0;
const keys = ['a', 's', 'd', 'f'];
const key_dict = {
    'a' : 1,
    's' : 2,
    'd' : 3,
    'f' : 4,
};

const m = 80;
const b = 0;
const button_height = 300;

class Button {
    constructor(x, y, col) {
        this.x = x;
        this.y = y;
        this.col = col;
    }
    buttonDraw() {
        fill(this.col);
        ellipse(this.x * m + b, this.y, 48, 48);
    }
}

var tileArray = [];
var buttonArray = [];
buttonArray.push(new Button(1,button_height,'red'));
buttonArray.push(new Button(2,button_height,'green'));
buttonArray.push(new Button(3,button_height,'yellow'));
buttonArray.push(new Button(4,button_height,'blue'));

tileArray.push(new Tile(2,100,'rgb(228,95,95)',5,m,b));
tileArray.push(new Tile(1,100,'red',5,m,b));
tileArray.push(new Tile(3,100,'rgb(141,29,29)',5,m,b));
tileArray.push(new Tile(4,100,'rgb(141,29,29)',5,m,b));

for (let tile_val of tile_vals) {
    var int_tile_val = [parseInt(tile_val[0]),parseInt(tile_val[1])];
    tileArray.push(new Tile(int_tile_val[0],int_tile_val[1],'red',5,m,b));
}

console.log(tileArray);


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