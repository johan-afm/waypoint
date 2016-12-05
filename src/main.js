require.config({
    baseUrl: '/',
    paths: {
        'async': 'lib/async',
    },
});

require(['src/dependency-module'], (listProcessor) => {
    fetch('/waypoint.json')
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Failed fetching waypoint JSON data');
        })
        .then(listProcessor.parseList)
        .then((categorized) => {
            console.log(categorized);
            const pre = document.createElement('pre');
            pre.innerText = JSON.stringify(categorized);
            document.getElementsByTagName('body')[0].appendChild(pre);

        })
        .catch(err => {
            console.error('Abnormal program termination', err);
        });
});
