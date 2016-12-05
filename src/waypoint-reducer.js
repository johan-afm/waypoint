define([''], () => {
    const dependency = {
        geoDistance: undefined,
        validation: undefined,
    };

    function inject(geoDistance, validation) {
        dependency.geoDistance = geoDistance;
        dependency.validation = validation;
    }

    function deltaTime(from, to) {
        const deltaMs = new Date(to) - new Date(from);

        if (deltaMs < 0) {
            throw new Error(`Delta time must be > 0, was ${deltaMs}ms for time instances from=${from}, to=${to}`);
        }
        return deltaMs / 1000;
    }

    function distance(from, to) {
        return dependency.geoDistance.distanceBetween(from, to)
            .then((response) => {
                return response;
            });
    }

    function averageSpeed(distance, deltaTime) {
        return distance / deltaTime;
    }

    function speedingSum(vStart, vEnd, duration) {
        return {
            duration,
            distance: duration * (vStart + vEnd) / 2
        }
    }
    function findAboveLimit(vStart, vEnd, vLimit, duration) {
        // Makes vStart <= vEnd
        if (vStart > vEnd) {
            return findAboveLimit(vEnd, vStart, vLimit, duration);
        }
        const vAverage = (vStart + vEnd) / duration;
        if (vAverage > vLimit && vStart >= vLimit) {
            return {
                vStart,
                vEnd,
                duration,
            };
        }
        if (vStart === vLimit) {
            /* This if condition gives: vStart === vLimit
             * 2nd if failed (or would have returned), which together with this if means vAverage <= vLimit
             * Because of 1st if condition: vStart <= vEnd
             * Together that gives: vAverage === vLimit
             * (because: vStart <= vEnd, vStart === vLimit, vAverage <= vLimit, vStart <= vAverage <= vEnd)
             * So there can be no speed above vLimit
             */
            return undefined;
        }
        if (vStart < vLimit && vLimit <= vEnd) {
            // how long from t(0) until v reaches vLimit
            const tToLimit = duration * (vLimit - vStart) / (vEnd - vStart);
            return {
                vStart: vLimit,
                vEnd,
                duration: duration - tToLimit
            };
        }
        return undefined;
    }
    function findIntersectionWhenLimitBetweenMinMax(vMin, vMax, vLimit, duration) {
        if (vMin > vMax) {
            return findIntersectionWhenLimitBetweenMinMax(vMax, vMin, vLimit, duration);
        }
        const tIntersect = duration * (vLimit - vMin) / (vMax - vMin);
        const vIntersect = vMin + tIntersect * (vMax - vMin) / duration;
        return {
            durationAbove: duration - tIntersect,
            vAt: vIntersect,
        };
    }
    function speedAlwaysBelowLimit(vStart, vEnd, vAverage, vLimit) {
        return vAverage < vLimit && vStart <= vAverage && vEnd <= vLimit;
    }
    function speedAlwaysAboveLimit(vStart, vEnd, vAverage, vLimit) {
        return vAverage > vLimit && vStart >= vAverage && vEnd >= vLimit;
    }
    function speedAtAverage(vStart, vEnd, vAverage, vLimit) {
        return vAverage === vLimit && vStart === vLimit && vEnd === Limit;
    }
    function averageBetweenStartAndEnd(vStart, vEnd, vAverage) {
        return vStart < vAverage && vAverage < vEnd;
    }
    function speeding(vStart, vEnd, vAverage, vLimit, duration) {
        const sum = {
            durationSpeeding: 0,
            distanceSpeeding: 0,
        };
        /* Speed below limit the entire time
         * Assuming:
         *      Acceleration / deceleration has stayed as constant as possible
         */
        if (speedAlwaysBelowLimit(vStart, vEnd, vAverage, vLimit)) {
            return sum;

        }
        // Speed above limit the entire time
        if (speedAlwaysAboveLimit(vStart, vEnd, vAverage, vLimit)) {
            sum.durationSpeeding = duration;
            sum.distanceSpeeding = vAverage * duration;

            return sum;
        }
        // Exactly keeping the speed limit
        if (speedAtAverage(vStart, vEnd, vAverage, vLimit)) {
            return sum;
        }

        /* Crossing the speed limit between t(start) and t(end)
         * Assuming:
         *      Constant acceleration / deceleration from v(start) to v(average) over t
         *      Constant acceleration / deceleration from v(average) to v(end) over (duration - t)
         *
         * This gives two triangles that must be of equal size, thus
         *      t * (vAverage - vStart) = (duration - t) * (vEnd - vAverage)
         *      duration * (vEnd - vAverage) + t * (vAverage - vEnd) = t * (vAverage - vStart)
         *      duration * (vEnd - vAverage) = t * (vEnd - vStart)
         * Solving for t (and 0 + t = tAverage; the time when v intersects vAverage)
         */
        if (averageBetweenStartAndEnd(vStart, vEnd, vAverage)) {
            const tAverage = duration * (vEnd - vAverage) / (vEnd - vStart);

            if (vLimit < vAverage) {

                // durationFromIntersect
                // vAtIntersect
                const intersect = findIntersectionWhenLimitBetweenMinMax(vStart, vAverage, vLimit, tAverage);
                sum.distanceSpeeding = intersect.durationAbove * (intersect.vAt + vAverage) / 2;
                sum.distanceSpeeding += (duration - tAverage) * (vAverage + vEnd) / 2;
                sum.durationSpeeding = intersect.durationAbove;
                sum.durationSpeeding += duration - tAverage;
            } else if (vLimit === tAverage) {
                sum.durationSpeeding = duration - tAverage;
                sum.distanceSpeeding = sum.durationSpeeding * (vAverage + vEnd) / 2;
            } else {
                const intersect = findIntersectionWhenLimitBetweenMinMax(vAverage, vEnd, vLimit, duration - tAverage);
                sum.distanceSpeeding = intersect.durationAbove * (intersect.vAt + vEnd) / 2;
                sum.durationSpeeding = intersect.durationAbove;
            }
            return sum;
        }

        /* Both t(start) and t(end) are on one side of t(limit),
         * while t(average) is on the other side of t(limit).
         * Assuming:
         *      constant acceleration / deceleration from t(start) to t(mid)
         *      constant acceleration / deceleration from t(mid) to t(end)
         *      and solving for speed at t(mid) to match the actual average speed
         *
         * This gives the following speed calculation
         *      avg = ((start + mid) / 2 + (mid + end) / 2)) / 2
         */
        const vMid = (vAverage * 4 - vStart - vEnd) / 2;

        const firstHalf = findAboveLimit(vStart, vMid, vLimit, duration / 2);
        if (firstHalf !== undefined) {
            const firstSum = speedingSum(firstHalf.vStart, firstHalf.vEnd, firstHalf.duration);
            sum.durationSpeeding += firstSum.duration;
            sum.distanceSpeeding += firstSum.distance;
        }
        const secondHalf = findAboveLimit(vMid, vEnd, vLimit, duration / 2);
        if (secondHalf !== undefined) {
            const secondSum = speedingSum(secondHalf.vStart, secondHalf.vEnd, secondHalf.duration);
            sum.durationSpeeding += secondSum.duration;
            sum.distanceSpeeding += secondSum.distance;
        }
        return sum;
    }

    function wayPointDelta(from, to) {
        return Promise
            .all([
                deltaTime(from.timestamp, to.timestamp),
                distance(from.position, to.position),
            ])
            .then(([deltaTime, distance]) => {
                const average = averageSpeed(distance, deltaTime);
                const vMin = Math.min(from.speed, to.speed);
                const vMax = Math.max(from.speed, to.speed);
                const speedingSum = speeding(vMin, vMax, average, from['speed_limit'], deltaTime);

                const comparison = {
                    distance: distance,
                    duration: deltaTime,
                    startSpeed: from.speed,
                    endSpeed: to.speed,
                    averageSpeed: average,
                    durationSpeeding: speedingSum.durationSpeeding,
                    distanceSpeeding: speedingSum.distanceSpeeding,
                };
                return comparison;
            });
    }

    function reduceList(waypointList) {
        const initialAccumulator = {
            distance: 0,
            duration: 0,
            distanceSpeeding: 0,
            durationSpeeding: 0,
            previous: undefined,
        };

        const valid = dependency.validation;
        return waypointList.reduce((accumulationPromise, waypoint) => {
            return accumulationPromise.then((accumulator) => {

                if (!valid.isValidWaypoint(waypoint)) {
                    accumulator.previous = undefined;
                    return accumulator;
                } else {
                    /* Only use pairs of valid waypoints for calculations */
                    if (accumulator.previous !== undefined) {
                        return wayPointDelta(accumulator.previous, waypoint)
                            .then((comparison) => {
                                accumulator.duration += comparison.duration;
                                accumulator.distance += comparison.distance;
                                accumulator.distanceSpeeding += comparison.distanceSpeeding;
                                accumulator.durationSpeeding += comparison.durationSpeeding;

                                accumulator.previous = waypoint;
                                return accumulator;
                            });
                    }
                    accumulator.previous = waypoint;
                    return accumulator;
                }

            });
        }, Promise.resolve(initialAccumulator))
            .then((result) => {
                return {
                    duration: result.duration,
                    distance: result.distance,
                    distanceSpeeding: result.distanceSpeeding,
                    durationSpeeding: result.durationSpeeding,
                };
            });
    }

    return {
        deltaTime,
        distance,
        inject,
        reduceList,
        wayPointDelta,
    };
});