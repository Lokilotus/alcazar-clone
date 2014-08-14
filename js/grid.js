Tile = function(x, y) {
    this.x = x;
    this.y = y;
    this.neighborLinks = [];
}

Tile.directions = {
    UP : "UP",
    DOWN : "DOWN",
    LEFT : "LEFT",
    RIGHT : "RIGHT"
};

Tile.prototype.getNeighborLinks = function() {
    var links = [];
    var directionsArray = [
        Tile.directions.UP,
        Tile.directions.DOWN,
        Tile.directions.LEFT,
        Tile.directions.RIGHT
    ];
    for (var i = 0; i < directionsArray.length; i++) {
        if (this.neighborLinks[directionsArray[i]]) {
            links.push(this.neighborLinks[directionsArray[i]]);
        }
    }
    return links;
}

TileLink = function(tile1, tile2) {
    this.tiles = [tile1, tile2];
    this.state = TileLink.stateEnum.CLEAR;
    this.highlighted = false
}

TileLink.prototype.other = function(tile) {
    // return the other endpoint
    if (tile == this.tiles[0]) { return this.tiles[1]; }
    else if (tile == this.tiles[1]) { return this.tiles[0]; }
    else { throw new Error("Provided tile not in TileLink"); }
}

TileLink.prototype.isDoor = function() {
    // doors have the outer tile (coordinates -1, -1) as one of their tiles
    return (this.tiles[0].x == -1 && this.tiles[0].y == -1)
        || (this.tiles[1].x == -1 && this.tiles[1].y == -1)
}

TileLink.stateEnum = {
    USER_WALL : "USER WALL",
    LEVEL_WALL : "LEVEL WALL",
    IN_PATH : "IN PATH",
    CLEAR : "CLEAR"
};

TileLinkDescriptor = function(x, y, dir) {
    this.x = x;
    this.y = y;
    this.dir = dir;
}

Grid = function(sizeX, sizeY) {
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.tiles = [];
    for (var i = 0; i < sizeX; i++) {
        this.tiles[i] = [];
        for (var j = 0; j < sizeY; j++) {
            this.tiles[i][j] = new Tile(i, j);
            var cur = this.tiles[i][j];
            if (i > 0) {
                var left = this.tiles[i-1][j];
                var link = new TileLink(cur, left);
                cur.neighborLinks[Tile.directions.LEFT] = link;
                left.neighborLinks[Tile.directions.RIGHT] = link;
            }
            if (j > 0) {
                var up = this.tiles[i][j-1];
                var link = new TileLink(cur, up);
                cur.neighborLinks[Tile.directions.UP] = link;
                up.neighborLinks[Tile.directions.DOWN] = link;
            }
        }
    }
    this.outerTile = new Tile(-1, -1); // represent "outside"
}

Grid.prototype.getTile = function(i, j) { return this.tiles[i][j]; }
Grid.prototype.getLink = function(linkDescriptor) {
    x = linkDescriptor.x;
    y = linkDescriptor.y;
    dir = linkDescriptor.dir;
    return this.tiles[x][y].neighborLinks[dir];
}

Grid.prototype.getDoors = function() {
    var doors = [];
    for (var i = 0; i < this.outerTile.neighborLinks.length; i++) {
        var doorLink = this.outerTile.neighborLinks[i];
        var doorTile = doorLink.other(this.outerTile);
        // find door direction
        var directionsArray = [
            Tile.directions.UP,
            Tile.directions.DOWN,
            Tile.directions.LEFT,
            Tile.directions.RIGHT
        ];
        for (var j = 0; j < directionsArray.length; j++ ) {
            var dir = directionsArray[j];
            if (doorTile.neighborLinks[dir] == doorLink) {
                doors.push(new TileLinkDescriptor(doorTile.x, doorTile.y, dir));
            }
        }
    }
    return doors;
}

Grid.prototype.getLevelWalls = function() {
    var levelWalls = [];
    for (var i = 0; i < this.sizeX; i++) {
        for (var j = 0; j < this.sizeY; j++) {
            var directionsArray = [
            // only two directions (else we get duplicates)
            Tile.directions.UP,
            Tile.directions.LEFT,
            ];
            for (var d = 0; d < directionsArray.length; d++) {
                var dir = directionsArray[d];
                var link = level.grid.getLink(new TileLinkDescriptor(i, j, dir));
                if (link && link.state == TileLink.stateEnum.LEVEL_WALL) {
                    levelWalls.push(new TileLinkDescriptor(i, j, dir));
                }
            }
        }
    }
    return levelWalls;
}
