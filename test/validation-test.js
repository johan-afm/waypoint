define(['QUnit', 'src/waypoint-validation'], (qunit, validation) => {

    function validWaypointData(waypoint) {
        qunit.test( "Waypoint data validation", function( assert ) {
            const isValidTimestamp = validation.isValidTimestamp(waypoint.timestamp);
            const isValidPosition = validation.isValidPosition(waypoint.position);
            const isValidSpeed = validation.isValidSpeed(waypoint.speed);
            const isValidSpeedLimit = validation.isValidSpeedLimit(waypoint['speed_limit']);

            const allValid = isValidTimestamp && isValidPosition && isValidSpeed && isValidSpeedLimit;


            assert.equal(isValidTimestamp, true, "Valid waypoint timestamp" );
            assert.equal(isValidPosition, true, "Valid waypoint position" );
            assert.equal(isValidSpeed, true, "Valid waypoint speed" );
            assert.equal(isValidSpeedLimit, true, "Valid waypoint speed limit" );
        });
    }

    function correctWaypointPropertyCount(waypoint) {
        qunit.test("Waypoint property count", function (assert) {
            assert.equal(Object.keys(waypoint).length, 4, "Waypoint property count");
        });
    }

    function run() {
        const validWaypoint = {
            "timestamp": "2016-06-21T12:00:00.000Z",
            "position": {
                "latitude": 59.334,
                "longitude": 18.0667
            },
            "speed": 6.3889,
            "speed_limit": 8.33
        };

        validWaypointData(validWaypoint);
        correctWaypointPropertyCount(validWaypoint);

    }

    return {
        run
    }
});


