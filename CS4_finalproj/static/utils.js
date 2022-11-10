class Tile {
    constructor(x, y, col, speed, m, b, size) {
        this.x = x;
        this.y = y;
        this.col = col;
        this.speed = speed;
        this.m = m;
        this.b = b;
        this.size = size;
    }
  
    tileUpdate() {
        this.y += this.speed;
    }
    
    tileDraw() {
        if (0 < this.y < height) {
        fill(this.col);
        ellipse(this.x * this.m + this.b, this.y, this.size, this.size);
        }
    }
}

class Button {
    constructor(x, y, col, m, b, size) {
        this.x = x;
        this.y = y;
        this.col = col;
        this.m = m;
        this.b = b;
        this.size = size;
    }
    buttonDraw() {
        fill(this.col);
        ellipse(this.x * this.m + this.b, this.y, this.size, this.size);
    }
}

function load_tiles() {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", './static/tiles.txt', false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
        result = xmlhttp.responseText;
    }
    var tile_vals = [];
    for (var tile_line of result.split(/\r?\n/)) {
        if (tile_line.length >= 1) {
            let str_tile_val = tile_line.split(" ");
            tile_vals.push([parseInt(str_tile_val[0]),parseInt(str_tile_val[1])]);
        }
    }
    return tile_vals;
}

class CanvasSpecs {
    constructor() {
        this.color_dict = {
            1 : 'rgb(228,95,95)',
            2 : 'red',
            3 : 'yellow',
            4 : 'cyan'
        }
        this.button_color_list = [
            'red',
            'yellow',
            'green',
            'blue'
        ]
        this.key_dict = {
            'a' : 1,
            's' : 2,
            'd' : 3,
            'f' : 4,
        }
        this.keys = ['a', 's', 'd', 'f'];
        
    }
}

export { Tile, Button, load_tiles };