define(['QUnit', 'src/waypoint-reducer'], (qunit, reducer) => {
    function before() {
    }

    const tests = {
        deltaTime() {
            const from = '2016-01-01T12:00:00.000Z';
            const to = '2016-01-01T12:00:01.000Z';

            qunit.test('Delta time between two ISO8601 DateTimes',
                (assert) => {
                    assert.equal(reducer.deltaTime(from, to), 1, 'Delta time calculation');
                }
            );
        },
        /* I wrote this to test the integration towards Google Maps initially,
         * but it should not be run with the unit tests. So, should be (re)moved.
         */
        distance() {
            const from = {
                "latitude": 59.334,
                "longitude": 18.0667
            };
            const to = {
                "latitude": 59.3337,
                "longitude": 18.0662
            };

            qunit.test('Google maps integration / Async distance calculation',
                (assert) => {
                    const done = assert.async();

                    const geoDistanceMock = {
                        distanceBetween(from, to) {
                            return Promise.resolve(52);
                        }
                    };
                    reducer.inject(geoDistanceMock);

                    reducer.distance(from, to)
                        .then((response) => {
                            assert.equal(response, 52, 'Distance calculation');
                            done();
                        });
                });
        },
        reduceList() {
            /* While using the same property names as real data, the geoDistance calculation
             * has been mocked to calculate distance using pythagoras and therefor considers
             * latitude and longitude as (x, y) coordinates in the plane, in meters.
             */
            const lists = [
                /* 0th */
                [{
                    timestamp: "2016-06-21T12:00:00.000Z",
                    position: {
                        latitude: 0,
                        longitude: 0,
                    },
                    speed: 1,
                    speed_limit: 3
                }, {
                    timestamp: "2016-06-21T12:00:03.000Z",
                    position: {
                        latitude: 6,
                        longitude: 0
                    },
                    speed: 4,
                    speed_limit: 3
                }], /* 1st */ [{
                    timestamp: "2016-06-21T12:00:00.000Z",
                    position: {
                        latitude: 0,
                        longitude: 0,
                    },
                    speed: 1,
                    speed_limit: 2
                }, {
                    timestamp: "2016-06-21T12:00:03.000Z",
                    position: {
                        latitude: 9,
                        longitude: 0
                    },
                    speed: 4,
                    speed_limit: 2
                }], /* 2nd */ [{
                    timestamp: "2016-06-21T12:00:00.000Z",
                    position: {
                        latitude: 0,
                        longitude: 0,
                    },
                    speed: 2,
                    speed_limit: 2
                }, {
                    timestamp: "2016-06-21T12:00:03.000Z",
                    position: {
                        latitude: 9,
                        longitude: 0
                    },
                    speed: 4,
                    speed_limit: 2
                }], /* 3rd */ [{
                    timestamp: "2016-06-21T12:00:00.000Z",
                    position: {
                        latitude: 0,
                        longitude: 0,
                    },
                    speed: 1,
                    speed_limit: 2
                }, {
                    timestamp: "2016-06-21T12:00:03.000Z",
                    position: {
                        latitude: 4.5,
                        longitude: 0
                    },
                    speed: 2,
                    speed_limit: 2
                }], /* 4th */ [{
                    timestamp: "2016-06-21T12:00:00.000Z",
                    position: {
                        latitude: 0,
                        longitude: 0,
                    },
                    speed: 2,
                    speed_limit: 2
                }, {
                    timestamp: "2016-06-21T12:00:04.000Z",
                    position: {
                        latitude: 10,
                        longitude: 0
                    },
                    speed: 0,
                    speed_limit: 2
                }],
            ];

            qunit.test('Waypoint List Reduction',
                (assert) => {
                    const asyncDone = assert.async(5);

                    const geoDistanceMock = {
                        distanceBetween(from, to) {
                            const dx = Math.abs(from.latitude - to.latitude);
                            const dy = Math.abs(from.longitude - to.longitude);

                            const dz = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

                            return Promise.resolve(dz);
                        }
                    };
                    const validationMock = {
                        isValidWaypoint(waypoint) {
                            return true;
                        }
                    };
                    reducer.inject(geoDistanceMock, validationMock);

                    reducer.reduceList(lists[0])
                        .then((comparison) => {
                            assert.equal(comparison.distance, 6, 'Accumulated distance');
                            assert.equal(comparison.duration, 3, 'Accumulated time');
                            assert.equal(comparison.durationSpeeding, 0.5, 'Accumulated duration speeding');
                            assert.equal(comparison.distanceSpeeding, 1.75, 'Accumulated distance speeding');

                            asyncDone();
                        });
                    reducer.reduceList(lists[1])
                        .then((comparison) => {
                            assert.equal(comparison.distance, 9, 'Accumulated distance');
                            assert.equal(comparison.duration, 3, 'Accumulated time');
                            assert.equal(comparison.durationSpeeding, 2.5, 'Accumulated duration speeding');
                            assert.equal(comparison.distanceSpeeding, 8.25, 'Accumulated distance speeding');

                            asyncDone();
                        });
                    reducer.reduceList(lists[2])
                        .then((comparison) => {
                            assert.equal(comparison.distance, 9, 'Accumulated distance');
                            assert.equal(comparison.duration, 3, 'Accumulated time');
                            assert.equal(comparison.durationSpeeding, 3, 'Accumulated duration speeding');
                            assert.equal(comparison.distanceSpeeding, 9, 'Accumulated distance speeding');


                            asyncDone();
                        });
                    reducer.reduceList(lists[3])
                        .then((comparison) => {
                            assert.equal(comparison.distance, 4.5, 'Accumulated distance');
                            assert.equal(comparison.duration, 3, 'Accumulated time');
                            assert.equal(comparison.durationSpeeding, 0, 'Accumulated duration speeding');
                            assert.equal(comparison.distanceSpeeding, 0, 'Accumulated distance speeding');


                            asyncDone();
                        });
                    reducer.reduceList(lists[4])
                        .then((comparison) => {
                            assert.equal(comparison.distance, 10, 'Accumulated distance');
                            assert.equal(comparison.duration, 4, 'Accumulated time');
                            assert.equal(comparison.durationSpeeding, 3, 'Accumulated time');
                            assert.equal(comparison.distanceSpeeding, 9, 'Accumulated time');

                            asyncDone();
                        });
                });
        }
    };


    function run() {
        before();

        tests.deltaTime();
        tests.reduceList();
    }

    return {
        run
    };
});