// [Sergio D. Jubera]
// Aux functions to be used anywhere

// [Sergio D. Jubera]
// The same function defined in the course.
// This is gonna fail if requesting files to the local machine: for security
// purposes it must be an http resource, unless the browser is launched with
// the proper option/flag. Launching Chrome from NetBeans 7.3.1 works fine.

function xhrGet(reqUri, callback, type) {
    var requestObject = new XMLHttpRequest();
    requestObject.open("GET", reqUri, true);
    if (type !== null)
    {
        requestObject.responseType = type;
    }
    requestObject.onload = function() {
        return callback(requestObject);
    };
    requestObject.send();
}

//Draws an oval. If scaleX = scaleY, then it'll be a circle.
function drawOval(context, centerX, centerY, scaleX, scaleY, radius) {
    // save state
    context.save();

    // translate context
    context.translate(centerX, centerY);

    // scale context
    context.scale(scaleX, scaleY);

    // draw circle which will be stretched into an oval
    context.beginPath();
    context.arc(0, // pos.x
            0, // pos.y
            radius, // radius
            0, // starting angle
            2 * Math.PI, // ending angle
            true);          // counterclockwise

    // apply styling
    context.fillStyle = 'yellow';
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = 'yellow';
    context.stroke();

    // restore to original state
    context.restore();
}

// Used to draw elements in scene in order and make a pseudo-3D effect, since
// the graphics used are specific for that kind of perspective
function compareVerticalPosition(entA, entB)
{
    if (entA.pos.y < entB.pos.y)
        return -1;
    else if (entA.pos.y > entB.pos.y)
        return 1;
    return 0;
}

// This is based on lesson "Input", chapter "Quantize" of the Udacity course.
// 'vector' is the vector which angle is being quantized, and 'sectors' is the
// number of discrete sectors to use.
function quantizeAngle(vector, sectors) {
    return (Math.round(Math.atan2(vector.y, vector.x) / (2 * Math.PI) * sectors) + sectors) % sectors;
}

function faceAngleToString(angle) {
    if (angle < 1)
        return 'right';
    else if (angle < 2)
        return 'down';
    else if (angle < 3)
        return 'left';
    else
        return 'up';
}

// Converts value from meters to pixels. The 'scale' parameter indicates the
// ratio modifier. If omitted, the ratio will be the default 1m:50px. Ratio also
// can be considered as zoom (1 = 100%).
// http://box2d.org/2011/12/pixels/
function toPixels(meters, scale) {
    return meters * 50.0 * (scale ? scale : PIXEL_METER_SCALE ? PIXEL_METER_SCALE : 1.0);
}

// Converts value from pixels to meters. The 'scale' parameter indicates the
// ratio modifier. If omitted, the ratio will be the default 1m:64px. Ratio also
// can be considered as zoom (1 = 100%).
// http://box2d.org/2011/12/pixels/
function toMeters(pixels, scale) {
    return pixels * 0.02 / (scale ? scale : PIXEL_METER_SCALE ? PIXEL_METER_SCALE : 1.0);
}

// Custom assert function for unit testing.
function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

// Gets the distance between 2 points in the plane.
function distance(p1, p2) {
    return (new Vec2(p2.x - p1.x, p2.y - p1.y)).Length();
}

// Calculates the translation vector (from currentSoldier to default view 
// point). This will be applied to canvas context to center the view port in
// current soldier (under user's control).
function calculateViewPortTranslation()
{
    // TO DO: check if canvas size is greater than map size
    var translation = new Vec2(
            canvas.width * 0.5 - gGameEngine.currentSoldier().pos.x,
            canvas.height * 0.5 - gGameEngine.currentSoldier().pos.y);
    //Make sure it doesn't go beyond map bounds
    if (gGameEngine.currentSoldier().pos.x < (canvas.width * 0.5))
        translation.x = 0;
    else if (gGameEngine.currentSoldier().pos.x > (gMap.width() - canvas.width * 0.5))
        translation.x = canvas.width * 0.5 - (gMap.width() - canvas.width * 0.5);
    if (gGameEngine.currentSoldier().pos.y < (canvas.height * 0.5))
        translation.y = 0;
    else if (gGameEngine.currentSoldier().pos.y > (gMap.height() - canvas.height * 0.5))
        translation.y = canvas.height * 0.5 - (gMap.height() - canvas.height * 0.5);
    return translation;
}

// Calculates if an element is visible. This function is used to avoid wasting
// time in calculations and drawings of things outside the current view port.
function isInsideViewPort(pos, size) {
    var trV = calculateViewPortTranslation();

    return !(((pos.x + size.w * 0.5 + trV.x) < 0) ||
            ((pos.x - size.w * 0.5 + trV.x) > canvas.width) ||
            ((pos.y + size.h * 0.5 + trV.y) < 0) ||
            ((pos.y - size.h * 0.5 + trV.y) > canvas.height));
}

// This is from GRITS code. It checks the conditionFunction and, if it returns
// FALSE, waits "waitMs" milliseconds and call the function again. This will be
// happening until the conditionFunction returs TRUE. Then, it will call the
// resultFunction and finish. Default interval between calls to
// conditionFunction is 1 second (1000 ms). This is specially useful when
// waiting for some condition to be TRUE before execute some code (e.g.: 
// wait for all assets to be loaded in order to start running the game).
function checkWait(conditionFunction, resultFunction, waitMs)
{
    var tev = setInterval(function()
    {
        if (conditionFunction())
        {
            resultFunction();
            clearInterval(tev);
        }
    }, waitMs? waitMs : 1000);
}
