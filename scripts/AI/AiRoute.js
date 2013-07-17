// [Sergio D. Jubera]
// Represent a route or path to follow by an entity, point by point. It is used
// mainly for enemies' walking around. Can be used either for 2D or 3D points.

var AiRouteClass = Class.extend({
    _points: [],
    loop: true,
    backAndForth: false,
    _currentPointIdx: -1,
    _currentDirection: 'forwards', // 'forwards' | 'backwards'
    init: function(loop, backAndForth) {

        this.loop = loop;

        this.backAndForth = backAndForth;

    },
    // Returns the current point of the route
    currentPoint: function() {
        if (this._currentPointIdx < 0)
            return null;

        return this._points[this._currentPointIdx];
    },
    // Returns the next point of the route, based on current direction and 
    // "loop" and "backAndForth" properties.
    nextPoint: function() {
        var pIdx = this._nextPointIdx();

        if (pIdx < 0 || pIdx === null)
            return null;

        return this._points[pIdx];
    },
    // Returns the previous point of the route, based on current direction and
    // "loop" and "backAndForth" properties.
    previousPoint: function() {
        var pIdx = this._previousPointIdx();

        if (pIdx < 0 || pIdx === null)
            return null;

        return this._points[pIdx];
    },
    // Updates current point to the next one, based on current direction and 
    // "loop" and "backAndForth" properties. Returns "false" when it's reached
    // the end of the route, and "true" otherwise.
    moveToNext: function() {
        var next = this._nextPointIdx();

        //Update direction if necessary (only if "backAndForth" === true):
        if (this.backAndForth) {
            if (next !== null && next >= 0 && next < this._points.length) {
                
                if (this.loop) {
                    if (this._currentDirection === 'forwards' && next === this._currentPointIdx - 1)
                        this._currentDirection = 'backwards';
                    else if (this._currentDirection === 'backwards' && next === this._currentPointIdx + 1)
                        this._currentDirection = 'forwards';
                }
                else {
                    if (this._currentDirection === 'forwards' && next === this._currentPointIdx - 1)
                        this._currentDirection = 'backwards';
                    else if (this._currentDirection === 'backwards' && next === this._currentPointIdx + 1)
                        this._currentDirection = 'UNDEFINED, THIS SHOULD NEVER HAPPEN!!!';
                }

                this._currentPointIdx = next;
                return true;
            }

            this._currentPointIdx = -1;
            return false;
        }

        this._currentPointIdx = next;
        return !(next === null || next < 0 || next >= this._points.length);
    },
    // Updates current point to the previous one, based on current direction and 
    // "loop" and "backAndForth" properties. Returns "false" when it's reached
    // the end of the route, and "true" otherwise.
    moveToPrevious: function() {
        this.changeDir();
        var success = this.moveToNext();
        this.changeDir();
        return success;
    },
    // Changes direction: if it's going forwards, it'll go backwards and
    // viceversa.
    changeDir: function() {
        if (this._currentDirection === 'forwards')
            this._currentDirection = 'backwards';
        else if (this._currentDirection === 'backwards')
            this._currentDirection = 'forwards';
    },
    // Adds an additional point to the end of the route.
    addPoint: function(point) {
        this._points.push(point);
        if (this._currentPointIdx < 0)
            this._currentPointIdx = 0;
    },
    // TO DO (not used yet): removePoint()
    removePoint: function() {
    },
    // Resets current point to 1st element, if any. Also, resets direction to
    // "forwards".
    reset: function() {
        this._currentDirection = 'forwards';
        
        if (this._points.length > 0)
            this._currentPointIdx = 0;
    },
    // Returns the index of the next point of the route, based on current
    // direction and "loop" and "backAndForth" properties. 
    _nextPointIdx: function() {
        // Special case (1/2): _points has 0 elements:
        if (this._currentPointIdx < 0 || this._points.length <= 0)
            return -1;

        // Special case (2/2): _points has just 1 element:
        if (this._points.length === 1)
            return (this.loop ? 0 : -1);

        // _points has, at least, 2 elements
        if (this.loop) {
            if (this.backAndForth) {
                if (this._currentDirection === 'forwards') {
                    pIdx = this._currentPointIdx + 1;

                    if (pIdx >= this._points.length)
                        return this._currentPointIdx - 1;
                    return pIdx;
                }
                else {
                    pIdx = this._currentPointIdx - 1;

                    if (pIdx < 0)
                        return this._currentPointIdx + 1;
                    return pIdx;
                }
            }
            else {
                if (this._currentDirection === 'forwards')
                    return ((this._currentPointIdx + 1) % this._points.length);
                else
                    return (this._currentPointIdx - 1 < 0 ? this._points.length - 1 : this._currentPointIdx - 1);
            }
        }
        else {
            if (this.backAndForth) {
                var pIdx = -1;

                if (this._currentDirection === 'forwards') {
                    pIdx = this._currentPointIdx + 1;

                    if (pIdx >= this._points.length)
                        return this._currentPointIdx - 1;
                    return pIdx;
                }
                else {
                    pIdx = this._currentPointIdx - 1;

                    if (pIdx < 0)
                        return -1;
                    return pIdx;
                }
            }
            else {
                var pIdx = -1;

                if (this._currentDirection === 'forwards')
                    pIdx = this._currentPointIdx + 1;
                else
                    pIdx = this._currentPointIdx - 1;

                if (pIdx < 0 || pIdx >= this._points.length)
                    return -1;
                return pIdx;
            }
        }
    },
    // Returns the index of the previous point of the route, based on current
    // direction and "loop" and "backAndForth" properties. 
    _previousPointIdx: function() {
        this.changeDir();
        var idx = this._nextPointIdx();
        this.changeDir();
        return idx;
    }
});