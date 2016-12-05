define([], () => {
    const DISTANCE_API_KEY = 'AIzaSyC2TL1VJ1vM4rTALnAbfS0GTEcPR0tTWUo';
    const API_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';
    const UNIT_METERS = 'meters';

    let _google;

    function inject(googleMaps) {
        _google = googleMaps;
    }

    function latLong(geo) {
        return `${geo.latitude},${geo.longitude}`;
    }

    function queryString(from, to) {
        return `units=${UNIT_METERS}&origins=${latLong(from)}&destinations=${latLong(to)}&key=${DISTANCE_API_KEY}`
    }

    function url(fromGeoCoordinate, toGeoCoordinate) {
        return `${API_URL}?${queryString(fromGeoCoordinate, toGeoCoordinate)}`;
    }

    function distanceMatrixResponseOk(status) {
        return status === 'OK';
    }

    function distanceMatrixResponseFormatOk(response) {
        return response && response.rows && response.rows[0] && response.rows[0].elements && response.rows[0].elements[0];
    }

    function distanceCalculationOk(response) {
        return response.rows[0].elements[0].status === 'OK';
    }

    function requestOk(response, status) {
        return distanceMatrixResponseOk(status) &&
            distanceMatrixResponseFormatOk(response) &&
            distanceCalculationOk(response);
    }

    function distanceBetween(fromGeoCoordinate, toGeoCoordinate) {
        return new Promise((resolve, reject) => {
            const from = new _google.maps.LatLng(fromGeoCoordinate.latitude, fromGeoCoordinate.longitude);
            const to = new _google.maps.LatLng(toGeoCoordinate.latitude, toGeoCoordinate.longitude);

            service = new _google.maps.DistanceMatrixService();
            service.getDistanceMatrix(
                {
                    origins: [from],
                    destinations: [to],
                    travelMode: 'DRIVING',
                    unitSystem: google.maps.UnitSystem.METRIC,
                    avoidHighways: false,
                    avoidTolls: false,
                }, callback);
            function callback(response, status) {
                if (requestOk(response, status)) {
                    const element = response.rows[0].elements[0];
                    const distance = element.distance.value;
                    resolve(distance);
                } else {
                    console.error(`Error using Google Maps DistanceMatrix Service. status=${status}`, response);
                    reject('GeoCoordinate distance error');
                }
            }
        });
    }

    return {
        distanceBetween,
        inject,
    };
});