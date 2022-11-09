// four buttons
// import { Tile, TileArray } from './Tile.js';

function setup() {
    createCanvas(400, 400);
}

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

class TileArray {
    constructor(lane1, lane2, lane3, lane4) {
        this.lane1 = lane1;
        this.lane2 = lane2;
        this.lane3 = lane3;
        this.lane4 = lane4;
    }
}

class Tile {
    constructor(x, y, col, speed) {
        this.x = x;
        this.y = y;
        this.col = col;
        this.speed = speed;
    }
  
    tileUpdate() {
        this.y += this.speed;
    }
    
    tileDraw() {
        if (0 < this.y < height) {
        // const c = this.col;
        fill(this.col);
        // fill(100);
        ellipse(this.x * m + b, this.y, 24, 24);
        }
    }
}

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

tileArray.push(new Tile(2,100,'rgb(228,95,95)',5));
tileArray.push(new Tile(1,100,'red',5));
tileArray.push(new Tile(3,100,'rgb(141,29,29)',5));
tileArray.push(new Tile(4,100,'rgb(141,29,29)',5));


function draw() {
    background('black');
    
    for (var button of buttonArray) {
        button.buttonDraw();
    }
    if (tileArray.at(-1).y <= height) {
        for (var tile of tileArray) {
            tile.tileUpdate();
            tile.tileDraw();
            textSize(32);
        }
    }
    fill(0, 102, 153);
    text(Math.round(score).toString(),10,30);
}

function keyTyped() {
    if (!(keys.includes(key))) {
        return;
    }

    if (tileArray.at(-1).y > height) {
        return;
    }
    var nearby_indices = [];
    for (let index = 0; index < tileArray.length; index++) {
        if (tileArray[index].x === key_dict[key]) {
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
    distances = [];
    for (var index of nearby_indices) {
        distances.push(Math.abs(tileArray[index].y - button_height));
    }
    distance = Math.min(...distances);
    
    score += Math.min(100/(distance+5));
}