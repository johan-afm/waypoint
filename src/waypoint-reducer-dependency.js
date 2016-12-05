define(['src/waypoint-reducer',
    'src/geo-distance', 'src/waypoint-validation'
], (reducer, geoDistance, validation) => {
    console.info("Injecting waypoint-reducer dependencies");
    reducer.inject(geoDistance, validation);

    return reducer;
});