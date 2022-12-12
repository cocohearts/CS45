class Tile {
    constructor(column, targetTime, color) {
        this.x = 0;
        this.y = 0;
        this.color = color;
        this.column = column;
        this.msTargetTime = targetTime * 1000;
        this.hidden = true;
        this.disappeared = false;
    }

    // places tile into new location based on elapsed time in ms
    tileUpdate(msElapsedTime,myCanvasSpecs) {
        let remainingTime = this.msTargetTime - msElapsedTime;
        if (this.hidden) {
            if (myCanvasSpecs.buttonHeight + myCanvasSpecs.tileSize > remainingTime * myCanvasSpecs.msSpeed) {
                this.hidden = false;
            }
        }
        if (!this.hidden) {
            this.y = myCanvasSpecs.buttonHeight - remainingTime * myCanvasSpecs.msSpeed;
            if (this.y > myCanvasSpecs.canvasHeight * 1.2) {
                this.hidden = true;
            }
        }
    }
    
    tileDraw(myCanvasSpecs) {
        // checking if the tile has disappeared
        if (!this.hidden && !this.disappeared) {
            fill(this.color);
            circle(this.x, this.y, myCanvasSpecs.tileSize);
            erase();
            circle(this.x, this.y, myCanvasSpecs.tileSize / 2);
            noErase();
        }
    }
}

class Button {
    constructor(column, color) {
        this.x = 0;
        this.y = 0;
        this.color = color;
        this.column = column;
        this.flair = 0;
        this.size = 0;
    }

    buttonDraw() {
        // flair_len must be odd
        let flair_len = 7;
        let flair_factor = 1.1;
        // 1 is added to the flair to cue
        if (this.flair > 0) {
            if (this.flair < flair_len) {
                if (this.flair <= flair_len / 2) {
                    // first half
                    this.size *= flair_factor;
                } else {
                    // second half
                    this.size /= flair_factor;
                }
                // increment flair counter
                this.flair ++;
            }
            else {
                // reached end of cycle, reset
                this.flair = 0;
            }
        }

        fill(this.color);
        circle(this.x, this.y, this.size);
        erase();
        circle(this.x, this.y, 2 * this.size / 3);
        noErase();
        fill(this.color);
        circle(this.x, this.y, this.size / 3);
    }
}

class CanvasSpecs {
    constructor() {
        // color dictionary for tiles
        this.color_dict = {
            1 : '#FA9FB4',
            2 : '#A2FFC5',
            3 : '#FDFDCB',
            4 : '#C0D0F5'
        }
        // color list for buttons
        this.button_color_list = [
            '#FF184E',
            '#25E525',
            '#F7F713',
            '#004DFF'
        ]
        // mapping keys to columns
        this.key_dict = {
            'a' : 1,
            's' : 2,
            'd' : 3,
            'f' : 4,
            'j' : 1,
            'k' : 2,
            'l' : 3,
            ';' : 4
        }

        this.keys = ['a', 's', 'd', 'f','j','k','l',';'];
        this.score = 0;
        this.started = false;
        this.finished = false;
        this.framerate = 60;
        this.msSpeed = 0;
        this.canvasHeight = 0;
        this.canvasWidth = 0;
        this.buttonHeight = 0;
        this.tileSize = 0;
    }
}

function readTiles() {
    // reads tiles from text file
    var result = null;
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", './static/tiles.txt', false);
    xhttp.send();
    var tile_vals = [];
    result = xhttp.responseText;

    for (var tile_line of result.split(/\r?\n/)) {
        if (tile_line.length >= 1) {
            let str_tile_val = tile_line.split(" ");
            tile_vals.push([parseFloat(str_tile_val[0]),parseFloat(str_tile_val[1])]);
        }
    }
    return tile_vals;
}

function arrayInitialize(myCanvasSpecs, tileArray, buttonArray) {
    let canvasWidth = myCanvasSpecs.canvasWidth;
    let canvasHeight = myCanvasSpecs.canvasHeight;

    let m = canvasWidth * 0.24;
    let b = width * -0.1;
    let buttonHeight = 0.75 * canvasHeight;
    let buttonSize = 0.12 * canvasWidth;
    let tileSize = 0.08 * canvasWidth;
    let msTileSpeed = 0.00075 * canvasWidth;

    myCanvasSpecs.buttonHeight = buttonHeight;
    myCanvasSpecs.buttonSize = buttonSize;
    myCanvasSpecs.msSpeed = msTileSpeed;
    myCanvasSpecs.tileSize = tileSize;

    for (let tile of tileArray) {
        tile.x = tile.column * m + b;
    }

    for (let button of buttonArray) {
        button.x = m * button.column + b;
        button.y = buttonHeight;
        button.size = buttonSize;
    }
}

function postScores(score) {
    var xhttp = new XMLHttpRequest();

    xhttp.open("POST","./savescore",true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhttp.send("score = " + score);
}

export { Tile, Button, readTiles, CanvasSpecs, arrayInitialize, postScores };