// [Sergio D. Jubera]
// Represent a route or path to follow by an entity, point by point. It is used
// mainly for enemies' walking around. Can be used either for 2D or 3D points.

var TILEDMapClass = Class.extend({
    _points: [],
    loop: true,
    backAndForth: false,
    _currentPointIdx: -1,
    _currentDirection: 'forwards',   // 'forwards' | 'backwards'
    init: function(loop, backAndForth) {
        if (loop)
            this.loop = loop;
        if (backAndForth)
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
    moveForward: function() {
        this._currentPointIdx = this._nextPointIdx();
        return !(this._currentPointIdx < 0 || this._currentPointIdx === 'null');
    },
    // Updates current point to the previous one, based on current direction and 
    // "loop" and "backAndForth" properties. Returns "false" when it's reached
    // the end of the route, and "true" otherwise.
    moveBackwards: function() {
        this._currentPointIdx = this._previousPointIdx();
        return !(this._currentPointIdx < 0 || this._currentPointIdx === 'null');
    },
    // Adds an additional point to the end of the route.
    addPoint: function(point) {
        this._points.push(point);
        if (this._currentPointIdx < 0)
            this._currentPointIdx = 0
    },
    // TO DO (not used yet): removePoint()
    removePoint: function() {
    },
    // Returns the index of the next point of the route, based on current
    // direction and "loop" and "backAndForth" properties. 
    _nextPointIdx: function() {
        if (this._currentPointIdx < 0)
            return -1;
        
        if (this.loop) {
            if (this.backAndForth) {
                if (this._currentDirection === 'forwards') {
                    
                }
                else {

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
                if (this._currentDirection === 'forwards') {
                    
                }
                else {

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
        if (this._currentPointIdx < 0)
            return -1;
        
        if (this.loop) {
            if (this.backAndForth) {
                if (this._currentDirection === 'forwards') {
                    
                }
                else {

                }
            }
            else {
                if (this._currentDirection === 'forwards')
                    return (this._currentPointIdx - 1 < 0 ? this._points.length - 1 : this._currentPointIdx - 1);
                else
                    return ((this._currentPointIdx + 1) % this._points.length);
            }
        }
        else {
            if (this.backAndForth) {
                if (this._currentDirection === 'forwards') {
                    
                }
                else {

                }
            }
            else {
                var pIdx = -1;
                if (this._currentDirection === 'forwards')
                    pIdx = this._currentPointIdx - 1;
                else
                    pIdx = this._currentPointIdx + 1;
                
                if (pIdx < 0 || pIdx >= this._points.length)
                    return -1;
                return pIdx;
            }
        }
    }
});