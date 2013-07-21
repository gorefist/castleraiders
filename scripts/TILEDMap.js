// [Sergio D. Jubera]
// This is based on the same file from Udacity course, 
// with some modifications which are commented properly, if any.

TILEDMapClass = Class.extend({
    // This is where we store the full parsed
    // JSON of the map.json file.
    currMapData: null,
    // tilesets stores each individual tileset
    // from the map.json's 'tilesets' Array.
    // The structure of each entry of this
    // Array is explained below in the
    // parseAtlasDefinition method.
    tilesets: [],
    // This is where we store the width and
    // height of the map in tiles. This is
    // in the 'width' and 'height' fields
    // of map.json, respectively.
    // The values 100 here are just set
    // so these fields are initialized to
    // something, rather than null.
    numXTiles: 100,
    numYTiles: 100,
    // The size of each individual map
    // tile, in pixels. This is in the
    // 'tilewidth' and 'tileheight' fields
    // of map.json, respectively.
    // The values 64 here are just set
    // so these fields are initialized to
    // something, rather than null.
    tileSize: {
        "x": 64,
        "y": 64
    },
    // The size of the entire map,
    // in pixels. This is calculated
    // based on the 'numXTiles', 'numYTiles',
    // and 'tileSize' parameters.
    // The values 64 here are just set
    // so these fields are initialized to
    // something, rather than null.
    pixelSize: {
        "x": 64,
        "y": 64
    },
    // Counter to keep track of how many tile
    // images we have successfully loaded.
    imgLoadCount: 0,
    // Boolean flag we set once our tile images
    // has finished loading.
    fullyLoaded: false,
    foregroundLayer: null, // [Sergio D. Jubera] This layer is special, it must
    // be drawn apart from the other layers.
    backgroundLayer: null, // [Sergio D. Jubera] The same for the background.
    //-----------------------------------------
    // Load the json file at the url 'map' into
    // memory. This is similar to the requests
    // we've done in the past using
    // XMLHttpRequests.
    load: function(map) {

        // Perform an XMLHttpRequest to grab the
        // JSON file at url 'map'.
        xhrGet(map, function(data) {
            // Once the XMLHttpRequest loads, call the
            // parseMapJSON method.
            gMap.parseMapJSON(data.responseText);
        }, null);
    },
    //-----------------------------------------
    // Parses the map data from 'mapJSON', then
    // stores that data in a number of members
    // of our 'TILEDMapClass' that are defined
    // above.
    parseMapJSON: function(mapJSON) {
        // Call JSON.parse on 'mapJSON' and store
        // the resulting map data
        gMap.currMapData = JSON.parse(mapJSON);

        var map = gMap.currMapData;

        // Set 'numXTiles' and 'numYTiles' from the
        // 'width' and 'height' fields of our parsed
        // map data.
        gMap.numXTiles = map.width;
        gMap.numYTiles = map.height;

        // Set the 'tileSize.x' and 'tileSize.y' fields
        // from the 'tilewidth' and 'tileheight' fields
        // of our parsed map data.
        gMap.tileSize.x = map.tilewidth;
        gMap.tileSize.y = map.tileheight;

        // Set the 'pixelSize.x' and 'pixelSize.y' fields
        // by multiplying the number of tiles in our map
        // by the size of each tile in pixels.
        gMap.pixelSize.x = gMap.numXTiles * gMap.tileSize.x;
        gMap.pixelSize.y = gMap.numYTiles * gMap.tileSize.y;

        // Loop through 'map.tilesets', an Array...
        for (var i = 0; i < map.tilesets.length; i++) {

            // ...loading each of the provided tilesets as
            // Images...
            var img = new Image();
            img.onload = function() {
                // ...Increment the above 'imgLoadCount'
                // field of 'TILEDMap' as each tileset is 
                // loading...
                gMap.imgLoadCount++;
                if (gMap.imgLoadCount === map.tilesets.length) {
                    // ...Once all the tilesets are loaded, 
                    // set the 'fullyLoaded' flag to true...
                    gMap.fullyLoaded = true;
                }
            };

            // The 'src' value to load each new Image from is in
            // the 'image' property of the 'tilesets'.
            img.src = MAP_ASSETS_SUBFOLDER + '/' + map.tilesets[i].image.replace(/^.*[\\\/]/, '');

            // This is the javascript object we'll create for
            // the 'tilesets' Array above. First, fill in the
            // given fields with the corresponding fields from
            // the 'tilesets' Array in 'currMapData'.
            var ts = {
                "firstgid": gMap.currMapData.tilesets[i].firstgid,
                // 'image' should equal the Image object we
                // just created.

                "image": img,
                "imageheight": gMap.currMapData.tilesets[i].imageheight,
                "imagewidth": gMap.currMapData.tilesets[i].imagewidth,
                "name": gMap.currMapData.tilesets[i].name,
                // These next two fields are tricky. You'll
                // need to calculate this data from the
                // width and height of the overall image and
                // the size of each individual tile.
                // 
                // Remember: This should be an integer, so you
                // might need to do a bit of manipulation after
                // you calculate it.

                "numXTiles": Math.floor(gMap.currMapData.tilesets[i].imagewidth / gMap.tileSize.x),
                "numYTiles": Math.floor(gMap.currMapData.tilesets[i].imageheight / gMap.tileSize.y)
            };

            // After that, push the newly created object into
            // the 'tilesets' Array above. Javascript Arrays
            // have a handy method called, appropriately, 'push'
            // that does exactly this. It takes the object
            // we'd like to put into the Array as a parameter.
            // 
            // YOUR CODE HERE
            gMap.tilesets.push(ts);
        }
    },
    //-----------------------------------------
    // Grabs a tile from our 'layer' data and returns
    // the 'pkt' object for the layer we want to draw.
    // It takes as a parameter 'tileIndex', which is
    // the id of the tile we'd like to draw in our
    // layer data.
    getTilePacket: function(tileIndex) {

        // We define a 'pkt' object that will contain
        // 
        // 1) The Image object of the given tile.
        // 2) The (x,y) values that we want to draw
        //    the tile to in map coordinates.
        var pkt = {
            "img": null,
            "px": 0,
            "py": 0
        };

        // The first thing we need to do is find the
        // appropriate tileset that we want to draw
        // from.
        //
        // Remember, if the tileset's 'firstgid'
        // parameter is less than the 'tileIndex'
        // of the tile we want to draw, then we know
        // that tile is not in the given tileset and
        // we can skip to the next one.
        var tile = 0;
        for (tile = gMap.tilesets.length - 1; tile >= 0; tile--) {
            if (gMap.tilesets[tile].firstgid <= tileIndex)
                break;
        }

        // Next, we need to set the 'img' parameter
        // in our 'pkt' object to the Image object
        // of the appropriate 'tileset' that we found
        // above.
        pkt.img = gMap.tilesets[tile].image;


        // Finally, we need to calculate the position to
        // draw to based on:
        //
        // 1) The local id of the tile, calculated from the
        //    'tileIndex' of the tile we want to draw and
        //    the 'firstgid' of the tileset we found earlier.
        var localIdx = tileIndex - gMap.tilesets[tile].firstgid;

        // 2) The (x,y) position of the tile in terms of the
        //    number of tiles in our tileset. This is based on
        //    the 'numXTiles' of the given tileset. Note that
        //    'numYTiles' isn't actually needed here. Think about
        //    how the tiles are arranged if you don't see this,
        //    It's a little tricky. You might want to use the 
        //    modulo and division operators here.
        var lTileX = Math.floor(localIdx % gMap.tilesets[tile].numXTiles);
        var lTileY = Math.floor(localIdx / gMap.tilesets[tile].numXTiles);

        // 3) the (x,y) pixel position in our tileset image of the
        //    tile we want to draw. This is based on the tile
        //    position we just calculated and the (x,y) size of
        //    each tile in pixels.
        pkt.px = (lTileX * gMap.tileSize.x);
        pkt.py = (lTileY * gMap.tileSize.y);


        return pkt;
    },
    //-----------------------------------------
    // Draws all of the map data to the passed-in
    // canvas context, 'ctx'.
    drawElements: function(ctx) {
        // First, we need to check if the map data has
        // already finished loading...
        if (!gMap.fullyLoaded)
            return;

        // ...Now, for every single layer in the 'layers' Array
        // of 'currMapData'...
        for (var layerIdx = 0; layerIdx < gMap.currMapData.layers.length; layerIdx++) {
            // Check if the 'type' of the layer is "tilelayer". If it isn't, we don't
            // care about drawing it...
            if (gMap.currMapData.layers[layerIdx].type !== "tilelayer"
                    || !gMap.currMapData.layers[layerIdx].visible) // [Sergio D. Jubera] don't draw if it's hidden
                continue;

            // [Sergio D. Jubera] foreground layer must be drawn separately:
            if (gMap.currMapData.layers[layerIdx].name === 'foreground') {
                gMap.foregroundLayer = gMap.currMapData.layers[layerIdx];
                continue;
            }

            // [Sergio D. Jubera] the same for the background:
            if (gMap.currMapData.layers[layerIdx].name === 'background') {
                gMap.backgroundLayer = gMap.currMapData.layers[layerIdx];
                continue;
            }

            this._drawLayer(gMap.currMapData.layers[layerIdx].data);
        }
    },
    drawForeground: function(ctx) {
        if (!this.fullyLoaded || this.foregroundLayer === null)
            return;

        this._drawLayer(this.foregroundLayer.data);
    },
    drawBackground: function(ctx) {
        if (!this.fullyLoaded || this.backgroundLayer === null)
            return;

        this._drawLayer(this.backgroundLayer.data);
    },
    width: function() {
        return this.numXTiles * this.tileSize.x;
    },
    height: function() {
        return this.numYTiles * this.tileSize.y;
    },
    readMetadata: function() {
        var routes = {}; // Here I'll be storing the routes as I go through all
        // map metadata, and in the end I'll bind them to their owner enemies.
        var enemies = {}; // Here I'll be storing the enemies.

        // For both vars, "routes" and "enemies", the property "route" will be
        // used as key. This property is stored within the obj extracted from
        // map metadata.

        // [Sergio D. Jubera]
        // Now we need to read layers of a special type, 'objectgroup', used
        // for collisions, entity spawn, etc.
        for (var layerIdx = 0; layerIdx < gMap.currMapData.layers.length; layerIdx++) {
            var lyr = gMap.currMapData.layers[layerIdx];
            if (lyr.type == "objectgroup" && lyr.visible)
            {
                if (lyr.name == 'collisions') {
                    // walls and static objects (trees, rocks, etc.)
                    for (var i = 0; i < lyr.objects.length; i++) {
                        var obj = lyr.objects[i];
                        var ent = new EntityClass({x: obj.x + obj.width * 0.5, y: obj.y + obj.height * 0.5}, {w: obj.width, h: obj.height});
                        ent.setUpPhysics('static');
                    }
                }
                else if (lyr.name == 'spawn') {
                    // Entities spawn coordinates (width & height are ignored)
                    for (var i = 0; i < lyr.objects.length; i++) {
                        var obj = lyr.objects[i];

                        if (obj.name === 'soldier') {
                            var ent = gGameEngine.spawnSoldier('soldier',
                                    {x: obj.x, y: obj.y},
                            SOLDIER_SIZE,
                                    obj.type,
                                    obj.properties.name ? obj.properties.name : null,
                                    obj.properties.maxHP ? obj.properties.maxHP : null,
                                    obj.properties.damage ? obj.properties.damage : null,
                                    obj.properties.faceAngle ? obj.properties.faceAngle : null,
                                    obj.properties.speed ? obj.properties.speed : obj.type === 'skeleton' ? DEFAULT_WALKING_VELOCITY * 0.3 : DEFAULT_WALKING_VELOCITY);
                            if (ent.soldierType === 'skeleton' && obj.properties && obj.properties.route)
                                enemies[obj.properties.route] = ent;
                        }
                        else if (obj.name === 'chest' || obj.name === 'heart')
                            gGameEngine.spawnItem(obj.name, {x: obj.x, y: obj.y}, obj.properties ? obj.properties.value : null);
                    }
                }
                else if (lyr.name == 'routes') {
                    for (var i = 0; i < lyr.objects.length; i++) {
                        var parsedObj = lyr.objects[i];
                        var routeObj = new AiRouteClass(
                                parsedObj.properties.loop,
                                parsedObj.properties.backAndForth
                                );

                        for (var p = 0; p < parsedObj.polyline.length; p++) {
                            routeObj.addPoint(new Vec2(parsedObj.x + parsedObj.polyline[p].x, parsedObj.y + parsedObj.polyline[p].y));
                        }

                        routes[parsedObj.name] = routeObj;
                    }
                }
            }
        }

        // Now I've read all metadata, I can bind routes to enemies:
        for (var ent in enemies)
            enemies[ent].ai.route = routes[ent];

        // create map bounds
        var boundsThickness = 100; // thickness (in px) for the phys bodies to limit the map
        // Top
        var ent = new EntityClass({x: this.width() / 2, y: 0 - boundsThickness * 0.5}, {w: this.width(), h: boundsThickness});
        ent.setUpPhysics('static');

        // Bottom
        ent = new EntityClass({x: this.width() / 2, y: this.height() + boundsThickness * 0.5}, {w: this.width(), h: boundsThickness});
        ent.setUpPhysics('static');

        // Left
        ent = new EntityClass({x: 0 - boundsThickness * 0.5, y: this.height() / 2}, {w: boundsThickness, h: this.height()});
        ent.setUpPhysics('static');

        // Right
        ent = new EntityClass({x: this.width() + boundsThickness * 0.5, y: this.height() / 2}, {w: boundsThickness, h: this.height()});
        ent.setUpPhysics('static');
    },
    _drawLayer: function(layerData) {
        // ...For each tileID in the 'data' Array...
        for (var tileIDX = 0; tileIDX < layerData.length; tileIDX++) {
            // ...Check if that tileID is 0. Remember, we don't draw
            // draw those, so we can skip processing them...
            var tID = layerData[tileIDX];
            if (tID === 0)
                continue;

            // ...If the tileID is not 0, then we grab the
            // packet data using getTilePacket.
            var tPKT = gMap.getTilePacket(tID);

            // Now we need to calculate the (x,y) position we want to draw
            // to in our game world.
            //
            // We've performed a similar calculation in 'getTilePacket',
            // think about how to calculate this based on the tile id and
            // various tile properties that our TILEDMapClass has.
            //
            var worldX = Math.floor(tileIDX % gMap.numXTiles) * gMap.tileSize.x;
            var worldY = Math.floor(tileIDX / gMap.numXTiles) * gMap.tileSize.y;


            // Now, we're finally drawing the map to our canvas! The 'drawImage'
            // method of our 'ctx' object takes nine arguments:
            //
            // 1) The Image object to draw,
            // 2) The source x coordinate in our Image,
            // 3) The source y coordinate in our Image,
            // 4) The source width of our tile,
            // 5) The source height of our tile,
            // 6) The canvas x coordinate to draw to,
            // 7) The canvas y coordinate to draw to,
            // 8) The destination width,
            // 9) The destination height
            //
            // Note that we don't want to stretch our tiles at all, so the
            // source height and width should be the same as the destination!
            //

            ctx.drawImage(tPKT.img, tPKT.px, tPKT.py, gMap.tileSize.x, gMap.tileSize.y, worldX, worldY, gMap.tileSize.x, gMap.tileSize.y);
        }
    }
});

var gMap = new TILEDMapClass();