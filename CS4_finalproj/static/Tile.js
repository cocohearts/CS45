class TileArray {
    constructor(lane1, lane2, lane3, lane4) {
        this.lane1 = lane1;
        this.lane2 = lane2;
        this.lane3 = lane3;
        this.lane4 = lane4;
    }
}

class Tile {
    constructor(x, y, col, speed, m, b) {
        this.x = x;
        this.y = y;
        this.col = col;
        this.speed = speed;
        this.m = m;
        this.b = b;
    }
  
    tileUpdate() {
        this.y += this.speed;
    }
    
    tileDraw() {
        if (0 < this.y < height) {
        // const c = this.col;
        fill(this.col);
        // fill(100);
        ellipse(this.x * this.m + this.b, this.y, 24, 24);
        }
    }
}

export { TileArray, Tile };