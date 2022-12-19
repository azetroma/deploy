import tinycolor from 'tinycolor2'
const ribbonPlugin = {
    id: 'custom_canvas_background_color',

    isPointInPath(path, x, y) {
        if (path.a.x <= x && path.b.x) { }
    },

    beforeEvent(chart, args, pluginOptions) {
        const event = args.event;
    },
    shapes: [],

    onlabelcallback(chart, { tooltipItem, callback }) {
        callback.call = () => {
            let preIndex = tooltipItem.dataIndex - 1;
            if (preIndex < 0) return '';

            let current = chart.sortedData[tooltipItem.dataIndex];
            let pre = chart.sortedData[preIndex];

            let rank = _.findIndex(current.data, { 'datasetIndex': tooltipItem.datasetIndex });
            let preRank = _.findIndex(pre.data, { 'datasetIndex': tooltipItem.datasetIndex });


            let delta = (preRank - rank);
            if (delta > 0) return '▲' + (delta)
            if (delta < 0) return '▼' + (delta)
            return '';
        };
    },

    beforeDraw: (chart, args, options) => {

        chart.sortedData = {};

        // iterate over datasets
        chart.data.datasets.forEach((dataset, datasetIndex) => {

            // iterate over dataset records
            dataset.data.forEach((data, index) => {

                // create data container for bar stack data
                if (!chart.sortedData[index]) {
                    chart.sortedData[index] = {
                        data: []
                    };
                }

                // save data
                chart.sortedData[index].data[datasetIndex] = {
                    datasetIndex: datasetIndex,
                    hidden: chart.getDatasetMeta(datasetIndex).hidden ? true : false,
                    color: dataset.backgroundColor,
                    value: dataset.data[index],
                    y: chart.getDatasetMeta(datasetIndex).data[index].y,
                    base: chart.getDatasetMeta(datasetIndex).data[index].base,
                };

            });
        });

        var chartTop = chart.scales['y'].top;
        var max = chart.scales['y'].max;
        var h = chart.scales['y'].height / max;

        // iterate over datasets
        chart.data.datasets.forEach((dataset, datasetIndex) => {

            // iterate over dataset records
            dataset.data.forEach((data, index) => {

                // sort data in bar stack by value
                chart.sortedData[index].data = Object.keys(chart.sortedData[index].data)
                    .map(k => chart.sortedData[index].data[k])
                    .sort((a, b) => b.value - a.value);

                // iterate over stack records
                chart.sortedData[index].data.forEach((d, i) => {

                    // calculate base value
                    d.base = chartTop + (max - Object.keys(chart.sortedData[index].data)
                        .map(k => chart.sortedData[index].data[k].value)
                        .reduce((a, b) => a + b, 0)) * h
                        + Object.keys(chart.sortedData[index].data)
                            .map(k => chart.sortedData[index].data[k])
                            .filter(d => d.hidden)
                            .reduce((a, b) => a + b.value, 0) * h;

                    // increase base value with values of previous records
                    for (var j = 0; j < i; j++) {
                        d.base += chart.sortedData[index].data[j].hidden
                            ? 0
                            : h * chart.sortedData[index].data[j].value;
                    }

                    // set y value
                    d.y = d.base + h * d.value;

                });
            });
        });

        //plugin.shapes = [];
        chart.getDatasetMeta(args.index).data.forEach((data, index) => {
            var el = chart.sortedData[index].data.filter(e => e.datasetIndex === args.index)[0];
            data.y = el.y;
            data.base = el.base;
        });

        //plugin.drawLines(chart);
    },

    drawLines(chart) {
        for (var set = 0; set < chart.config._config.data.datasets.length; set++) {
            let dataset = chart.getDatasetMeta(set);
            let color = dataset.data[0].options.backgroundColor;

            for (var i = 0; i < dataset.data.length - 1; i++) {
                let from = dataset.data[i];
                let to = dataset.data[i + 1];
                /*
                a -- b
                d -- c
                 */
                let a = { x: from.x + from.width / 2, y: from.y + 1 };
                let b = { x: to.x - to.width / 2, y: to.y + 1 };
                let c = { x: to.x - to.width / 2, y: to.base };
                let d = { x: from.x + from.width / 2, y: from.base };


                const ctx = chart.ctx;

                ctx.save();
                let shape = new Path2D();
                shape.moveTo(a.x, a.y);
                shape.bezierCurveTo(a.x + (b.x - a.x) / 2, a.y, a.x + (b.x - a.x) / 2, b.y, b.x, b.y)
                shape.lineTo(c.x, c.y);
                shape.bezierCurveTo(d.x + (c.x - d.x) / 2, c.y, d.x + (c.x - d.x) / 2, d.y, d.x, d.y)
                shape.lineTo(a.x, a.y);


                ctx.lineWidth = 1
                ctx.strokeStyle = '#000000';
                ctx.fillStyle = tinycolor(color).setAlpha(0.1).toRgbString();;
                //ctx.stroke();
                ctx.fill(shape);

                //plugin.shapes.push({ ctx, shape, from, to, set, i, path: [a, b, c, d] });
                ctx.restore();

            }
        }
    },

    beforeDatasetDraw(chart, args) {
        chart.getDatasetMeta(args.index).data.forEach((data, index) => {
            var el = chart.sortedData[index].data.filter(e => e.datasetIndex === args.index)[0];
            data.y = el.y;
            data.base = el.base;
        });
        ribbonPlugin.drawLines(chart);
    },
    afterDatasetDraw(chart, args) {

    },

    defaults: {
        color: 'lightGreen'
    }
}
export default ribbonPlugin;