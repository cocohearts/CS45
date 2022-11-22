class Tile {
    constructor(x, y, col, speed, m, b, size) {
        this.x = x;
        this.y = y;
        this.col = col;
        this.speed = speed;
        this.m = m;
        this.b = b;
        this.size = size;
        this.disappeared = false;
    }
  
    tileUpdate() {
        this.y += this.speed;
    }
    
    tileDraw(height) {
        if (0 < this.y && this.y < height+this.size && !this.disappeared) {
            fill(this.col);
            circle(this.x * this.m + this.b, this.y, this.size);
            erase();
            circle(this.x * this.m + this.b, this.y, this.size/2);
            noErase();
        }
    }
}

class Button {
    constructor(x, col) {
        this.x = x;
        this.y = 0;
        this.col = col;
        this.m = 0;
        this.b = 0;
        this.realsize = 0;
        this.size = 0;
        this.flair = 0;
    }
    buttonDraw() {
        // flair_len must be odd
        let flair_len = 7;
        let flair_factor = 1.1;
        if (this.flair > 0) {
            if (this.flair < flair_len) {
                if (this.flair <= flair_len/2) {
                    this.size *= flair_factor;
                } else {
                    this.size /= flair_factor;
                }
                this.flair++;
            }
            else {
                this.flair = 0;
            }
        }

        fill(this.col);
        circle(this.x * this.m + this.b, this.y, this.size);
        // fill(0);
        erase();
        circle(this.x * this.m + this.b, this.y, 2 * this.size / 3);
        noErase();
        fill(this.col);
        circle(this.x * this.m + this.b, this.y, this.size / 3);
    }
}

function load_tiles() {
    var result = null;
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", './static/tiles.txt', false);
    xhttp.send();
    var tile_vals = [];
    result = xhttp.responseText;
    for (var tile_line of result.split(/\r?\n/)) {
        if (tile_line.length >= 1) {
            let str_tile_val = tile_line.split(" ");
            tile_vals.push([parseInt(str_tile_val[0]),parseInt(str_tile_val[1])]);
        }
    }
    return tile_vals;
}

function log_out() {
    var xhttp = new XMLHttpRequest();

    xhttp.open("POST","/oauth2",true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            window.location.assign('/');
        }
    }
}
class CanvasSpecs {
    constructor() {
        this.color_dict = {
            1 : '#FA9FB4',
            2 : '#A2FFC5',
            3 : '#FDFDCB',
            4 : '#C0D0F5'
        }
        this.button_color_list = [
            '#FF184E',
            '#25E525',
            '#F7F713',
            '#004DFF'
        ]
        this.key_dict = {
            'a' : 1,
            's' : 2,
            'd' : 3,
            'f' : 4,
        }
        this.keys = ['a', 's', 'd', 'f'];
        this.score = 0;
        this.started = false;
        this.finished = false;
    }
}

function show_results(score) {
    var resultsForm = document.getElementById("results_form");
    var returnLink = document.getElementById("return_link");
    var resultsButton = document.getElementById("results_button");
    var spacer = document.getElementById("horizontal_spacer")
    
    spacer.style.display = 'none';
    resultsButton.style.display = 'block';
    resultsButton.innerHTML = 'See how you stack up!'
    returnLink.style.display = 'block';
    resultsButton.setAttribute("value", score);
}

function size_initalize(myCanvasSpecs, tileArray, buttonArray) {
    let width = myCanvasSpecs.width;
    let height = myCanvasSpecs.height;
    let m = width * 0.24;
    let b = width * -0.1;
    let button_height = 0.75 * height;
    let button_size = 0.12 * width;
    let tile_size = 0.08 * width;
    let tile_speed = 0.0125 * width;
    let height_factor = 0.0025 * height;
    for (let tile of tileArray) {
        tile.m = m;
        tile.b = b;
        tile.size = tile_size;
        tile.speed = tile_speed;
        tile.y *= height_factor;
    }
    for (let button of buttonArray) {
        button.m = m;
        button.b = b;
        button.size = button_size;
        button.y = button_height;
    }
}

function postScores(score) {
    var xhttp = new XMLHttpRequest();

    xhttp.open("POST","/savescore",true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    // let xparams = `{
    //     "score" : ${score}
    // }`;
    xhttp.send("score="+score);

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log("score_post" + this.responseText);
        }
    }
}

export { Tile, Button, load_tiles, CanvasSpecs, show_results, size_initalize, postScores, log_out };