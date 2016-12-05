define([], () => {
    const dependency = {
        reducer: undefined,
    };

    function inject(reducer) {
        dependency.reducer = reducer;
    }

    function parseList(waypointList) {
        return dependency.reducer.reduceList(waypointList);
    }

    return {
        inject,
        parseList
    }

});