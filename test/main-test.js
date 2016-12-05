define(['test/validation-test', 'test/reducer-test'], (validation, reducer) => {

        function runAll() {
            validation.run();
            reducer.run();

        }

        return {
            runAll
        }
    }
);