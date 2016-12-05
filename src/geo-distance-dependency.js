const API_KEY = '';
define(['src/geo-distance', `async!//maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=googleMapsApiLoaded`], (geoDistance) => {
    console.info("Injecting geo-distance dependencies");

    if (google === undefined || google.maps === undefined) {
        throw new Error('Failed loading Google Maps API');
    }
    geoDistance.inject(google);

    return geoDistance;
});