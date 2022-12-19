import chartUtils from './0-utils'
import { persian, depersian } from '../d3-utils'

(function () {
    //if (!chartUtils.enableNewCharts) return;

    var impl = {
        type: chartUtils.chartsId.iframe.type,
        expandedChartType: chartUtils.chartsId.iframe.extendTypes,
        category: 'ChartJs',
        config: { needDim: false, needMeasure: false, needServerData: false },
        changeSeriesPropertyBaseOnExpandedType: function (props, type) {

        },
        draw: function (input, settings, refreshWithData, titlebar) {

            var root = `<iframe class="temporal" style="width:100%; height:100%;"
                                src="${settings.chartProp.general.link}" title="W3Schools Free Online Web Tutorials"></iframe>`

            $(settings.selector + ' ').append(root);
            $(settings.selector + ' ').css('margin','0 -1rem -1rem -1rem')

        },

    };
    var set = {
        hasGeneralSettings: true,
        general: [
            { key: 'link', title: 'آدرس', type: 'text', default: '' },
        ],
        series: [
        ]
    };
    impl.settings = set;
    impl.getSettings = function () {
        return set;
    };
    app = app || {};
    app.charts = app.charts || {};
    app.charts.list = app.charts.list || [];
    app.charts.list.push(impl);

})();
