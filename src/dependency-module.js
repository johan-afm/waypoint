define(
    ['src/geo-distance-dependency', 'src/waypoint-list-processor-dependency', 'src/waypoint-reducer-dependency'],
    (geoDistance, listProcessor, reducer) => {
        console.info("Dependencies injected");

        return listProcessor;
    }
);