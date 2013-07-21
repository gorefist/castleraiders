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