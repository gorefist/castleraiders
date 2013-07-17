function runAiRouteTests() {
    var rLoop = new AiRouteClass(true, false);          //loop = true; backAndForth = false;
    var rSimple = new AiRouteClass(false, false);       //loop = false; backAndForth = false;
    var rFull = new AiRouteClass(true, true);           //loop = true; backAndForth = true;
    var rBackAndForth = new AiRouteClass(false, true);  //loop = false; backAndForth = true;

    var maxElements = 5;
    var maxSteps = 50;
    
    console.log("TESTING SIMPLE ROUTE:");
    _comprehensiveTest(rSimple);
    _generalUsageTest(rSimple.loop, rSimple.backAndForth, maxElements, maxSteps);
    console.log("Ok.");

    console.log("TESTING LOOP ROUTE:");
    _comprehensiveTest(rLoop);
    _generalUsageTest(rLoop.loop, rLoop.backAndForth, maxElements, maxSteps);
    console.log("Ok.");

    console.log("TESTING BACK&FORTH ROUTE:");
    _comprehensiveTest(rBackAndForth);
    _generalUsageTest(rBackAndForth.loop, rBackAndForth.backAndForth, maxElements, maxSteps);
    console.log("Ok.");

    console.log("TESTING LOOP + BACK&FORTH ROUTE:");
    _comprehensiveTest(rFull);
    _generalUsageTest(rFull.loop, rFull.backAndForth, maxElements, maxSteps);
    console.log("Ok.");
}

function _generalUsageTest(loop, backAndForth, maxElements, maxSteps) {
    var route = new AiRouteClass(loop, backAndForth);
    
    for (var i = 0; i <= maxElements; i++) {
        console.log("Testing general usage for " + i + " elements:");

        if (route.currentPoint())
            console.log("(" + route.currentPoint().x + "," + route.currentPoint().y + ")");
        else
            console.log("Reached the end.");

        for (var j = 1; j <= maxSteps; j++) {
            route.moveToNext();

            if (route.currentPoint())
                console.log("(" + route.currentPoint().x + "," + route.currentPoint().y + ")");
            else
                console.log("Reached the end.");
        }

        route.addPoint({x: "x" + (i + 1), y: "y" + (i + 1)});
        route.reset();
    }
}

function _comprehensiveTest(route) {
    // 0 elements
    var i = 0;
    var numElements = route._points.length;

    assert(route.currentPoint() === null || route.currentPoint() < 0, "FAILED .currentPoint() for " + i + " elements.");
    assert(route.nextPoint() === null || route.currentPoint() < 0, "FAILED .nextPoint() for " + i + " elements.");
    assert(route.previousPoint() === null || route.previousPoint() < 0, "FAILED .previousPoint() for " + i + " elements.");
    assert(!route.moveToNext(), "FAILED .moveToNext() for " + i + " elements.");
    assert(!route.moveToPrevious(), "FAILED .moveToPrevious() for " + i + " elements.");

    var dirBefore = route._currentDirection;
    route.changeDir();
    var dirAfter = route._currentDirection;
    assert(dirBefore !== dirAfter, "FAILED .changeDir() for " + i + " elements.");

    route.reset();
    assert(route.currentPoint() === null && dirBefore === route._currentDirection && dirBefore === 'forwards', "FAILED .reset() for " + i + " elements.");

    //removePoint
    //_nextPointIdx
    //_previousPointIdx

    route.addPoint({x: 1, y: 1});
    assert(route._points.length === (numElements + 1), "FAILED .addPoint() for " + i + " elements.");

    // 1 element
    i = 1;
    numElements = route._points.length;

    assert(route.currentPoint() && route.currentPoint().x === 1 && route.currentPoint().y === 1, "FAILED .currentPoint() for " + i + " elements.");

    if (route.loop) {
        assert(route.nextPoint().x === 1 && route.nextPoint().y === 1, "FAILED .nextPoint() for " + i + " elements.");
        assert(route.previousPoint().x === 1 && route.previousPoint().y === 1, "FAILED .previousPoint() for " + i + " elements.");
        assert(route.moveToNext() && route.currentPoint().x === 1 && route.currentPoint().y === 1, "FAILED .moveToNext() for " + i + " elements.");
        assert(route.moveToPrevious() && route.currentPoint().x === 1 && route.currentPoint().y === 1, "FAILED .moveToPrevious() for " + i + " elements.");
    }
    else {
        assert(route.nextPoint() === null, "FAILED .nextPoint() for " + i + " elements.");
        assert(route.previousPoint() === null, "FAILED .previousPoint() for " + i + " elements.");
        assert(!route.moveToNext(), "FAILED .moveToNext() for " + i + " elements.");
        assert(!route.moveToPrevious(), "FAILED .moveToPrevious() for " + i + " elements.");
    }

    var dirBefore = route._currentDirection;
    route.changeDir();
    var dirAfter = route._currentDirection;
    assert(dirBefore !== dirAfter, "FAILED .changeDir() for " + i + " elements.");

    route.reset();
    assert(route.currentPoint() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && dirBefore === route._currentDirection && dirBefore === 'forwards', "FAILED .reset() for " + i + " elements.");

    //removePoint
    //_nextPointIdx
    //_previousPointIdx

    route.addPoint({x: 2, y: 2});
    assert(route._points.length === (numElements + 1), "FAILED .addPoint() for " + i + " elements.");

    // 2 elements
    i = 2;
    numElements = route._points.length;

    assert(route.currentPoint() && route.currentPoint().x === 1 && route.currentPoint().y === 1, "FAILED .currentPoint() for " + i + " elements.");

    // Check previous and next elements, and moving current element in all different cases
    if (route.loop) {
        if (route.backAndForth) {
            // 1) Forwards

            // 1.1) Regular case (next element)
            assert(route.nextPoint().x === 2 && route.nextPoint().y === 2, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 2 && route.previousPoint().y === 2, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToNext() && route.currentPoint().x === 2 && route.currentPoint().y === 2 && route._currentDirection === 'forwards', "FAILED .moveToNext() for " + i + " elements.");

            // 1.2) Special case (next element): pass the end of the array, next element equals the previous one (but direction changes to "backwards")
            assert(route.nextPoint().x === 1 && route.nextPoint().y === 1, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 1 && route.previousPoint().y === 1, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToNext() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'backwards', "FAILED .moveToNext() for " + i + " elements.");  // direction changes!!!

            route.reset();
            assert(route.currentPoint() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'forwards', "FAILED .reset() for " + i + " elements.");

            // 1.3) Special case (previous element): pass the beginning of the array, previous element equals next one, but direction changes to "backwards"
            assert(route.previousPoint().x === 2 && route.previousPoint().y === 2, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.nextPoint().x === 2 && route.nextPoint().y === 2, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.moveToPrevious() && route.currentPoint().x === 2 && route.currentPoint().y === 2 && route._currentDirection === 'backwards', "FAILED .moveToNext() for " + i + " elements."); // direction changes!!!

            route.reset();
            assert(route.currentPoint() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'forwards', "FAILED .reset() for " + i + " elements.");

            // 1.4) Regular case (previous element)
            assert(route.nextPoint().x === 2 && route.nextPoint().y === 2, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 2 && route.previousPoint().y === 2, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToNext() && route.currentPoint().x === 2 && route.currentPoint().y === 2 && route._currentDirection === 'forwards', "FAILED .moveToNext() for " + i + " elements.");
            assert(route.previousPoint().x === 1 && route.previousPoint().y === 1, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.nextPoint().x === 1 && route.nextPoint().y === 1, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.moveToPrevious() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'forwards', "FAILED .moveToNext() for " + i + " elements.");

            // 2) Backwards
            route.changeDir();

            // 2.1) Special case (next element): pass the beginning of the array, next element equals previous one, but direction changes to "forwards"
            assert(route.nextPoint().x === 2 && route.nextPoint().y === 2, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 2 && route.previousPoint().y === 2, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToNext() && route.currentPoint().x === 2 && route.currentPoint().y === 2 && route._currentDirection === 'forwards', "FAILED .moveToNext() for " + i + " elements."); // direction changes!!!

            route.reset();
            assert(route.currentPoint() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'forwards', "FAILED .reset() for " + i + " elements.");
            route.changeDir();

            // 2.2) Regular case (previous element)
            assert(route.nextPoint().x === 2 && route.nextPoint().y === 2, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 2 && route.previousPoint().y === 2, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToPrevious() && route.currentPoint().x === 2 && route.currentPoint().y === 2 && route._currentDirection === 'backwards', "FAILED .moveToNext() for " + i + " elements.");

            // 2.2) Special case (previous element): pass the end of the array, previous element equals next one (but direction changes to "forward")
            assert(route.previousPoint().x === 1 && route.previousPoint().y === 1, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.nextPoint().x === 1 && route.nextPoint().y === 1, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.moveToPrevious() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'forwards', "FAILED .moveToNext() for " + i + " elements."); // direction changes!!!

            route.reset();
            assert(route.currentPoint() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'forwards', "FAILED .reset() for " + i + " elements.");
            route.changeDir();

            // 2.4) Regular case (next element)
            assert(route.nextPoint().x === 2 && route.nextPoint().y === 2, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 2 && route.previousPoint().y === 2, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToPrevious() && route.currentPoint().x === 2 && route.currentPoint().y === 2 && route._currentDirection === 'backwards', "FAILED .moveToNext() for " + i + " elements.");
            assert(route.previousPoint().x === 1 && route.previousPoint().y === 1, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.nextPoint().x === 1 && route.nextPoint().y === 1, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.moveToNext() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'backwards', "FAILED .moveToNext() for " + i + " elements.");
        }
        else {
            // 1) Forwards

            // 1.1) Regular case (next element)
            assert(route.nextPoint().x === 2 && route.nextPoint().y === 2, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 2 && route.previousPoint().y === 2, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToNext() && route.currentPoint().x === 2 && route.currentPoint().y === 2 && route._currentDirection === 'forwards', "FAILED .moveToNext() for " + i + " elements.");

            // 1.2) Special case (next element): pass the end and go back to 1st element:        
            assert(route.nextPoint().x === 1 && route.nextPoint().y === 1, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 1 && route.previousPoint().y === 1, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToNext() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'forwards', "FAILED .moveToNext() for " + i + " elements.");

            // 1.3) Special case (previous element): pass the beginning and go back to last element:        
            assert(route.nextPoint().x === 2 && route.nextPoint().y === 2, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 2 && route.previousPoint().y === 2, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToPrevious() && route.currentPoint().x === 2 && route.currentPoint().y === 2 && route._currentDirection === 'forwards', "FAILED .moveToNext() for " + i + " elements.");

            // 1.4) Regular case (previous element)
            assert(route.nextPoint().x === 1 && route.nextPoint().y === 1, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 1 && route.previousPoint().y === 1, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToPrevious() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'forwards', "FAILED .moveToNext() for " + i + " elements.");

            // 2) Backwards
            route.changeDir();

            // 2.1) Special case (next element): pass the beginning and go back to last element:        
            assert(route.nextPoint().x === 2 && route.nextPoint().y === 2, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 2 && route.previousPoint().y === 2, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToNext() && route.currentPoint().x === 2 && route.currentPoint().y === 2 && route._currentDirection === 'backwards', "FAILED .moveToNext() for " + i + " elements.");

            // 2.2) Regular case (next element)
            assert(route.nextPoint().x === 1 && route.nextPoint().y === 1, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 1 && route.previousPoint().y === 1, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToNext() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'backwards', "FAILED .moveToNext() for " + i + " elements.");

            // 2.3) Regular case (previous element)
            assert(route.nextPoint().x === 2 && route.nextPoint().y === 2, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 2 && route.previousPoint().y === 2, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToPrevious() && route.currentPoint().x === 2 && route.currentPoint().y === 2 && route._currentDirection === 'backwards', "FAILED .moveToNext() for " + i + " elements.");

            // 2.4) Special case (previous element): pass the end and go back to 1st element:
            assert(route.nextPoint().x === 1 && route.nextPoint().y === 1, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 1 && route.previousPoint().y === 1, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToPrevious() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'backwards', "FAILED .moveToNext() for " + i + " elements.");
        }
    }
    // No loop
    else {
        if (route.backAndForth) {
            // 1) Forwards

            // 1.1) Regular case (next element)
            assert(route.nextPoint().x === 2 && route.nextPoint().y === 2, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint() === null, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToNext() && route.currentPoint().x === 2 && route.currentPoint().y === 2 && route._currentDirection === 'forwards', "FAILED .moveToNext() for " + i + " elements.");

            // 1.2) Special case (next element): pass the end of the array, next element equals the previous one (but direction changes to "backwards")
            assert(route.nextPoint().x === 1 && route.nextPoint().y === 1, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 1 && route.previousPoint().y === 1, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToNext() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'backwards', "FAILED .moveToNext() for " + i + " elements.");  // direction changes!!!

            route.reset();
            assert(route.currentPoint() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'forwards', "FAILED .reset() for " + i + " elements.");

            // 1.3) Special case (previous element): pass the beginning of the array, no previous element
            assert(route.previousPoint() === null, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.nextPoint().x === 2 && route.nextPoint().y === 2, "FAILED .nextPoint() for " + i + " elements.");
            assert(!route.moveToPrevious() && route.currentPoint() === null && route._currentDirection === 'forwards', "FAILED .moveToNext() for " + i + " elements.");

            route.reset();
            assert(route.currentPoint() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'forwards', "FAILED .reset() for " + i + " elements.");

            // 1.4) Regular case (previous element)
            assert(route.nextPoint().x === 2 && route.nextPoint().y === 2, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint() === null, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToNext() && route.currentPoint().x === 2 && route.currentPoint().y === 2 && route._currentDirection === 'forwards', "FAILED .moveToNext() for " + i + " elements.");
            assert(route.previousPoint().x === 1 && route.previousPoint().y === 1, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.nextPoint().x === 1 && route.nextPoint().y === 1, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.moveToPrevious() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'forwards', "FAILED .moveToNext() for " + i + " elements.");

            // 2) Backwards
            route.changeDir();

            // 2.1) Special case (next element): pass the beginning of the array, no next element
            assert(route.nextPoint() === null, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 2 && route.previousPoint().y === 2, "FAILED .previousPoint() for " + i + " elements.");
            assert(!route.moveToNext() && route.currentPoint() === null && route._currentDirection === 'backwards', "FAILED .moveToNext() for " + i + " elements.");

            route.reset();
            assert(route.currentPoint() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'forwards', "FAILED .reset() for " + i + " elements.");
            route.changeDir();

            // 2.2) Regular case (previous element)
            assert(route.nextPoint() === null, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 2 && route.previousPoint().y === 2, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToPrevious() && route.currentPoint().x === 2 && route.currentPoint().y === 2 && route._currentDirection === 'backwards', "FAILED .moveToNext() for " + i + " elements.");

            // 2.2) Special case (previous element): pass the end of the array, previous element equals next one (but direction changes to "forward")
            assert(route.previousPoint().x === 1 && route.previousPoint().y === 1, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.nextPoint().x === 1 && route.nextPoint().y === 1, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.moveToPrevious() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'forwards', "FAILED .moveToNext() for " + i + " elements."); // direction changes!!!

            route.reset();
            assert(route.currentPoint() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'forwards', "FAILED .reset() for " + i + " elements.");
            route.changeDir();

            // 2.4) Regular case (next element)
            assert(route.nextPoint() === null, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 2 && route.previousPoint().y === 2, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToPrevious() && route.currentPoint().x === 2 && route.currentPoint().y === 2 && route._currentDirection === 'backwards', "FAILED .moveToNext() for " + i + " elements.");
            assert(route.previousPoint().x === 1 && route.previousPoint().y === 1, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.nextPoint().x === 1 && route.nextPoint().y === 1, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.moveToNext() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'backwards', "FAILED .moveToNext() for " + i + " elements.");
        }
        else {
            // 1) Forwards

            // 1.1) Regular case (next element)
            assert(route.nextPoint().x === 2 && route.nextPoint().y === 2, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint() === null, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToNext() && route.currentPoint().x === 2 && route.currentPoint().y === 2 && route._currentDirection === 'forwards', "FAILED .moveToNext() for " + i + " elements.");

            // 1.2) Special case (next element): pass the end of the array, no more elements
            assert(route.nextPoint() === null, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 1 && route.previousPoint().y === 1, "FAILED .previousPoint() for " + i + " elements.");
            assert(!route.moveToNext() && route.currentPoint() === null && route._currentDirection === 'forwards', "FAILED .moveToNext() for " + i + " elements.");

            route.reset();
            assert(route.currentPoint() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'forwards', "FAILED .reset() for " + i + " elements.");

            // 1.3) Special case (previous element): pass the beginning of the array, no previous element
            assert(route.nextPoint().x === 2 && route.nextPoint().y === 2, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint() === null, "FAILED .previousPoint() for " + i + " elements.");
            assert(!route.moveToPrevious() && route.currentPoint() === null && route._currentDirection === 'forwards', "FAILED .moveToNext() for " + i + " elements.");

            route.reset();
            assert(route.currentPoint() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'forwards', "FAILED .reset() for " + i + " elements.");

            // 1.4) Regular case (previous element)
            assert(route.nextPoint().x === 2 && route.nextPoint().y === 2, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint() === null, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToNext() && route.currentPoint().x === 2 && route.currentPoint().y === 2 && route._currentDirection === 'forwards', "FAILED .moveToNext() for " + i + " elements.");
            assert(route.nextPoint() === null, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 1 && route.previousPoint().y === 1, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToPrevious() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'forwards', "FAILED .moveToNext() for " + i + " elements.");

            // 2) Backwards
            route.changeDir();

            // 2.1) Special case: pass the beginning of the array, no more elements
            assert(route.nextPoint() === null, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 2 && route.previousPoint().y === 2, "FAILED .previousPoint() for " + i + " elements.");
            assert(!route.moveToNext() && route.currentPoint() === null && route._currentDirection === 'backwards', "FAILED .moveToNext() for " + i + " elements.");

            route.reset();
            assert(route.currentPoint() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'forwards', "FAILED .reset() for " + i + " elements.");
            route.changeDir();

            // 2.2) Regular case (previous element)
            assert(route.nextPoint() === null, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 2 && route.previousPoint().y === 2, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToPrevious() && route.currentPoint().x === 2 && route.currentPoint().y === 2 && route._currentDirection === 'backwards', "FAILED .moveToNext() for " + i + " elements.");

            // 2.3) Regular case (next element)
            assert(route.nextPoint().x === 1 && route.nextPoint().y === 1, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint() === null, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToNext() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'backwards', "FAILED .moveToNext() for " + i + " elements.");

            // 2.4) Special case: pass the end of the array, no previous element
            assert(route.nextPoint() === null, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint().x === 2 && route.previousPoint().y === 2, "FAILED .previousPoint() for " + i + " elements.");
            assert(route.moveToPrevious() && route.currentPoint().x === 2 && route.currentPoint().y === 2 && route._currentDirection === 'backwards', "FAILED .moveToNext() for " + i + " elements.");
            assert(route.nextPoint().x === 1 && route.nextPoint().y === 1, "FAILED .nextPoint() for " + i + " elements.");
            assert(route.previousPoint() === null, "FAILED .previousPoint() for " + i + " elements.");
            assert(!route.moveToPrevious() && route.currentPoint() === null && route._currentDirection === 'backwards', "FAILED .moveToNext() for " + i + " elements.");
        }
    }

    // Here, the route should be left in the same state it was just before the if-else:
    route.reset();
    assert(route.currentPoint() && route.currentPoint().x === 1 && route.currentPoint().y === 1 && route._currentDirection === 'forwards', "FAILED .reset() for " + i + " elements.");

    // Go on checking asserts...
    var dirBefore = route._currentDirection;
    route.changeDir();
    var dirAfter = route._currentDirection;
    assert(dirBefore !== dirAfter, "FAILED .changeDir() for " + i + " elements.");
    route.changeDir();
    dirAfter = route._currentDirection;
    assert(dirBefore === dirAfter, "FAILED .changeDir() for " + i + " elements.");

    //removePoint
    //_nextPointIdx
    //_previousPointIdx

    route.addPoint({x: 3, y: 3});
    assert(route._points.length === (numElements + 1), "FAILED .addPoint() for " + i + " elements.");
}