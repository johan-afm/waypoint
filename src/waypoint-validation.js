define([], () => {
    function isFloat(n) {
        return n === +n && n !== (n|0);
    }

    function isValidTimestamp(timestamp) {
        return timestamp &&
            new Date(timestamp).toISOString() === timestamp;
    }

    function isValidLongitude(longitude) {
        return longitude &&
            isFloat(longitude) &&
            0.0 <= longitude &&
            longitude <= 180.0;
    }

    function isValidLatitude(latitude) {
        return latitude &&
            isFloat(latitude) &&
            -90.0 <= latitude &&
            latitude <= 90.0;
    }

    function isValidPosition(position) {
        return position &&
            isValidLatitude(position.latitude) &&
            isValidLongitude(position.longitude);
    }

    function isValidSpeed(speed) {
        return isFloat(speed);
    }

    function isValidSpeedLimit(speedLimit) {
        return isFloat(speedLimit);
    }

    function isValidWaypoint(waypoint) {
        return waypoint &&
            isValidTimestamp(waypoint.timestamp) &&
            isValidPosition(waypoint.position) &&
            isValidSpeed(waypoint.speed) &&
            isValidSpeedLimit(waypoint['speed_limit']);
    }

    return {
        isValidTimestamp,
        isValidPosition,
        isValidSpeed,
        isValidSpeedLimit,
        isValidWaypoint,
    }
});