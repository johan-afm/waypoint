define(['src/waypoint-list-processor', 'src/waypoint-reducer'], (listProcessor, reducer) => {
    console.info("Injecting waypoint-list-processor dependencies");
    listProcessor.inject(reducer);

    return listProcessor;
});