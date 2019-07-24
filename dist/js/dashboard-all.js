/* داشبورد مدیریت صدف 
 sadafdashboard.ir 


*/
// داشبورد مدیریتی صدف info@sadafdashboard.ir 

var app = app || {};

app.chartCommons = {};

app.chartCommons.tooltip = {
    tooltipFormatter: function(set, fh, f, showPersain) {
        var body = set.points.map(function(point) {
            var bodyFormat = f || '{{point.label}}: <p class="ltr inline" style="padding:0; margin:0;" ><b>{{point.data}}</b></p>';
            return bodyFormat.replace(/{{([^(}})]+)}}/gm, function(i, p1) {
                if (!p1.match(/point\.(data|label|color|format|percentage)/)) return p1;
                var e = eval(p1);
                if (e === "NaN") e = "تعریف نشده";
                var s = !isNaN(e) ? persian(d3.format(point.format)(e), showPersain) : e;
                return '<span class="inline ltr">' + s + "</span>";
            });
        }).join("<br/>");
        var headerFormat = fh || "";
        var header = headerFormat.replace(/{{([^(}})]+)}}/gm, function(i, p1) {
            var e = eval(p1);
            return isNaN(e) || p1 === "set.key" ? e : persian(d3.format(set.format)(e), showPersain);
        });
        if (header && body.trim()) header += "<BR/>";
        r = '<div style="margin:0;text-align: right; padding:0;direction: rtl;">' + header + body + "</div>";
        var d = _.cloneDeep(filterXSS.whiteList);
        d.span = [ "class" ];
        var fxx = filterXSS(r, {
            whiteList: d
        });
        return fxx;
    }
};

app.chartCommons.levelTypeUtils = {
    getParam: function(settings) {
        if (settings.editMode) return;
        if (settings.chartProp.levelTypes && settings.chartProp.levelTypes.enable) {
            var find = app.chartCommons.drillDown.get(settings.ChartInPageId);
            var drillCount = find && _.isArray(find.drillDown) ? find.drillDown.length : 0;
            var index = Math.min(drillCount, Object.keys(settings.chartProp.levelTypes.props).length - 1);
            var newSet = settings.chartProp.levelTypes.props[index];
            newSet.prop.levelTypes = _.merge({}, settings.chartProp.levelTypes);
            settings.chartProp = newSet.prop;
            settings.type = newSet.type;
        }
    }
};

app.chartCommons.highchartSetTheme = function() {
    var colors = d3.scale.category10();
    Highcharts.setOptions({
        lang: {
            loading: "در حال بارگذاری...",
            months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
            shortMonths: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
            weekdays: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
            decimalPoint: ".",
            numericSymbols: [ "k", "M", "G", "T", "P", "E" ],
            resetZoom: "حالت اولیه",
            resetZoomTitle: "حالت اولیه 1:1",
            thousandsSep: ","
        },
        global: {
            useUTC: true,
            canvasToolsURL: "http://code.highcharts.com/4.1.4/modules/canvas-tools.js",
            VMLRadialGradientURL: "http://code.highcharts.com/4.1.4/gfx/vml-radial-gradient.png"
        }
    });
    Highcharts.theme = {
        chart: {},
        xAxis: {
            title: {
                text: null,
                align: "middle"
            }
        },
        yAxis: {
            endOnTick: false,
            title: {
                text: null,
                align: "middle"
            },
            labels: {
                formatter: function() {
                    return persian(d3.format(",")(this.value));
                }
            },
            lineWidth: 2,
            lineColor: "#D8D8D8",
            tickWidth: 1
        },
        tooltip: {
            valueSuffix: "",
            useHTML: true,
            formatter: function() {
                return "<b>" + this.x + "</b>: <b>" + this.series.tooltipOptions.pointFormatter(this) + "</b>";
            },
            headerFormat: "",
            style: {
                "text-align": "right"
            }
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                }
            },
            series: {
                animation: {
                    duration: 800,
                    easing: "easeInCubic"
                },
                allowPointSelect: true,
                fillOpacity: .1,
                marker: {
                    fillColor: "#FFFFFF",
                    lineWidth: 2,
                    lineColor: null
                }
            }
        },
        credits: {
            enabled: false
        },
        colors: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ].map(function(d, i) {
            return colors(i);
        }),
        chart: {
            animation: {
                duration: 400,
                easing: "linear"
            },
            panning: true,
            panKey: "shift"
        },
        title: {
            text: null,
            style: {
                color: "#000",
                font: "bold 16px Droid, Tahoma, Arial"
            }
        },
        subtitle: {
            style: {
                color: "#666666",
                font: "bold 12px Droid, Tahoma, Arial"
            }
        },
        legend: {
            itemStyle: {
                font: "9pt Droid, Tahoma, Arial",
                color: "black"
            },
            itemHoverStyle: {
                color: "gray"
            }
        }
    };
    Highcharts.setOptions(Highcharts.theme);
};

app.chartCommons.getError = function(input) {
    if (!input.result) {
        var title = +input.errorType == 0 ? "منبع داده غیر فعال است" : "اشکال در پرس و جو";
        return "<div class='temporal error'> <h4>" + title + "</h4><p>" + input.errorMessage + "</p></div>";
    }
    return "<div class='temporal error'> مشکلی در روند برنام ایجاد شده است</div>";
};

app.chartCommons.clearFilterParamsCache = function(allParams) {
    if (!allParams) {
        allParams = JSON.parse(localStorage.getItem("filter-params") || "[]");
    }
    var time = new Date().getTime() - 1e3 * 60 * 60 * 24;
    _.remove(allParams, function(item) {
        if (item.time < time) return true;
        return false;
    });
    localStorage.setItem("filter-params", JSON.stringify(allParams));
};

app.chartCommons.openLink = function(model, data) {
    if (!model || !model.checked) return;
    if (!model.type) {
        model.type = "dashboard";
        if (model.dashboardId == -1) model.type = "link";
    }
    if (app.mobileMode) {
        JavaListener.post("open-dashboard", JSON.stringify(model));
        return;
    }
    if (model.type == "dashboard") {
        var key = "";
        if (model.passFilterType == "value-with-other" || model.passFilterType == "value") {
            if (model.passFilterType == "value") {
                app.chartCommons.userFilter.clearAll();
                app.chartCommons.drillDown.clearAll();
            }
            if (data) {
                var x = {
                    id: -1,
                    values: data.value,
                    valuesCaption: data.caption,
                    variableType: 0,
                    dimensionName: data.dimensionName,
                    chartInPageId: data.ChartInPageId,
                    datasourceId: data.DataSourceId,
                    disableClear: false,
                    refreshDatasource: data.refreshDatasource
                };
                app.chartCommons.userFilter.setFilter(x);
            }
            data = {
                drillDown: app.chartCommons.drillDown.filters,
                userFilter: app.chartCommons.userFilter.filters
            };
            var allParams = JSON.parse(localStorage.getItem("filter-params") || "[]");
            key = "filter-" + md5(JSON.stringify(data));
            _.remove(allParams, {
                key: key
            });
            allParams.push({
                dash: model.dashboardId,
                key: key,
                data: data,
                time: new Date().getTime()
            });
            localStorage.setItem("filter-params", JSON.stringify(allParams));
        }
        var appc = location.hash.replace(/.*app\/(\d+)\/dashboard.*/, "$1");
        location.hash = "#/app/" + appc + "/dashboard/" + model.dashboardId + (key ? "/" + key : "");
    }
    if (model.type == "back") {
        window.history.back();
    }
    if (model.type == "link") {
        var win = window.open(model.link, "_blank");
        if (win) {
            win.focus();
        } else {
            alert("Please allow popups for this site");
        }
    }
};

app.chartCommons.calculateFields = function(series, calcFormulas, columnIsNumeric) {
    return;
    if (!calcFormulas || !calcFormulas.fields) return;
    if (!series) return;
    var formulas = calcFormulas.fields;
    function calc(item, series, columnIsNumeric) {
        if (series.labels.indexOf(item.name) != -1) {
            return;
        }
        if (!(series.data instanceof Array)) {
            return;
        }
        var isValid = /^({\s*r?([+-]?\d*)\s*,?\s*c?(\d*)}|[\d\s\+-\/\)\(\*]*|'[^']*')*$/gim.test(item.formula);
        if (!isValid) {
            alert("### Not valid " + item.formula);
            return;
        }
        var indexes = [];
        var repFormula = item.formula.replace(/{\s*r?([\+-]?\d*)\s*,?\s*c?(\d*)}/gim, function(i, r, c) {
            indexes.push({
                row: +r,
                col: +c
            });
            return "$" + (indexes.length - 1);
        });
        function getCell(array, row, col) {
            row = row < 0 ? 0 : row >= array.length ? array.length - 1 : row;
            col = col < 0 ? 0 : col >= array[0].length ? array[0].length - 1 : col;
            return array[row][col];
        }
        for (var i = 0; i < series.data.length; i++) {
            var rowFormula = repFormula.replace(/\$(\d+)/gim, function(s, index) {
                var o = indexes[+index];
                var cell = getCell(series.data, o.row + i, o.col);
                if (columnIsNumeric) {
                    if (!columnIsNumeric[o.col]) return "'" + cell + "'";
                }
                return cell || 0;
            });
            series.data[i].push(eval(rowFormula));
        }
        series.labels.push(item.name);
    }
    _.forEach(formulas, function(f) {
        calc(f, series, columnIsNumeric);
    });
};

app.chartCommons.drillDown = {
    filters: [],
    add: function(chartInPageId, datasourceId, k, v, refreshDatasource) {
        if (!_.isArray(v)) {
            v = [ v ];
        }
        if (!_.isArray(k)) {
            k = [ k ];
        }
        if (_.isArray(v)) {
            v = JSON.stringify(v);
            k = JSON.stringify(k);
        }
        var chart = _.find(this.filters, {
            chartInPageId: chartInPageId
        });
        if (_.isUndefined(chart)) {
            var entry = {
                chartInPageId: chartInPageId,
                datasourceId: datasourceId,
                refreshDatasource: refreshDatasource,
                drillDown: [ {
                    key: k,
                    value: v
                } ]
            };
            this.filters.push(entry);
            return entry.drillDown;
        }
        var pair = _.find(chart.drillDown, {
            key: k
        });
        if (!_.isUndefined(pair)) {
            _.remove(chart.drillDown, {
                key: k
            });
        }
        chart.drillDown.push({
            key: k,
            value: v
        });
        return chart.drillDown;
    },
    up: function(chartInPageId, upLevel) {
        var chart = _.find(this.filters, {
            chartInPageId: chartInPageId
        });
        if (_.isUndefined(chart)) return [];
        if (_.isUndefined(upLevel)) upLevel = 1;
        for (var i = 0; i < upLevel; i++) {
            if (chart.drillDown.length > 0) chart.drillDown.pop();
        }
        return chart.drillDown;
    },
    get: function(chartInPageId) {
        return _.find(this.filters, {
            chartInPageId: chartInPageId
        });
    },
    clear: function(chartInPageId) {
        return _.remove(this.filters, {
            chartInPageId: chartInPageId
        });
    },
    clearAll: function() {
        this.filters = [];
    }
};

app.chartCommons.getFilterHierarchy = function(chartInPageId, data) {
    var data = $(".cid" + chartInPageId + " .chart-dimentions-content").data("data");
    if (_.isUndefined(data)) return null;
    function justSelectedMembers(h) {
        if (!_.isArray(h)) return;
        for (var i = 0; i < h.length; i++) {
            var item = h[i];
            if (typeof item.Members != "undefined" && item.Members) {
                item.Members = item.Members.filter(function(d, i) {
                    return d.IsChecked;
                });
                item.FilteredMemberByUser = true;
            }
        }
        return h;
    }
    return {
        Hierarchies: justSelectedMembers(data.Hierarchies),
        Where: justSelectedMembers(data.Where),
        SeriesLevel: justSelectedMembers(data.SeriesLevel)
    };
};

app.chartCommons.userFilter = {
    filters: [],
    clearAll: function() {
        this.filters = [];
    },
    setUserControlFilters: function(d) {
        this.filters = [];
        if (_.isArray(d)) this.filters = d;
    },
    setFilter: function(data) {
        if (this.filters.length == 0) {
            this.filters.push(data);
            return;
        }
        var chartFilter = _.find(this.filters, {
            chartInPageId: data.chartInPageId,
            dimensionName: data.dimensionName
        });
        if (!_.isUndefined(chartFilter)) {
            _.remove(this.filters, {
                chartInPageId: data.chartInPageId,
                dimensionName: data.dimensionName
            });
        }
        this.filters.push(data);
    },
    setFilterIfNotExist: function(data) {
        if (_.isEmpty(data.values)) return;
        if (_.isArray(data.values) && data.values.length == 0) return;
        if (this.filters.length == 0) {
            this.filters.push(data);
            return;
        }
        var chartFilter = _.find(this.filters, {
            chartInPageId: data.chartInPageId
        });
        if (_.isUndefined(chartFilter)) {
            this.filters.push(data);
        }
    },
    getFilterValue: function(chartInPageId) {
        var chartFilter = _.find(this.filters, {
            chartInPageId: chartInPageId
        });
        if (_.isUndefined(chartFilter)) return null;
        return chartFilter;
    }
};

app.chartCommons.lastRefreshDateFormat = function(date) {
    if (!date) return "";
    if (app.lang.langType !== 0) {
        return date.D + "/" + date.M + "/" + date.Y + " - " + date.h + ":" + date.m + ":" + date.s + " ";
    }
    var dif = "";
    if (date.Diff) {
        if (date.Diff < 60 * 60 * 24) {
            dif += " - <b>";
            dif += date.Diff < 60 ? Math.floor(date.Diff) + " ثانیه پیش" : date.Diff < 60 * 60 ? Math.floor(date.Diff / 60) + " دقیقه پیش" : Math.floor(date.Diff / (60 * 60)) + " ساعت پیش";
            dif += "</b>";
        }
    }
    var monthName = +date.M == 1 ? "فروردین" : +date.M == 2 ? "اردیبهشت" : +date.M == 3 ? "خرداد" : +date.M == 4 ? "تیر" : +date.M == 5 ? "مرداد" : +date.M == 6 ? "شهریور" : +date.M == 7 ? "مهر" : +date.M == 8 ? "آبان" : +date.M == 9 ? "آذر" : +date.M == 10 ? "دی" : +date.M == 11 ? "بهمن" : "اسفند";
    return persian(date.D + " " + monthName + " ماه " + date.Y + " ساعت " + date.h + ":" + date.m + ":" + date.s + " " + dif, true);
};

app.chartCommons.setFilterParameter = function(settings) {
    var refresDs = settings.input && settings.input.RefreshDatasource ? settings.input.RefreshDatasource : null;
    var filters = app.chartCommons.getFilterParameter(settings.ChartInPageId, refresDs);
    settings.parameters.drillDown = filters.drillDown;
    if (settings.editMode) return;
    settings.parameters.otherFilters = filters.otherFilters;
    settings.parameters.userControlFilter = filters.userControlFilter;
    settings.parameters.userVariable = filters.userVariable;
};

app.chartCommons.getFilterParameter = function(chartInPage, refreshDatasource) {
    var ret = {
        drillDown: null
    };
    var selfDrill = _.find(app.chartCommons.drillDown.filters, {
        chartInPageId: chartInPage
    });
    if (!_.isUndefined(selfDrill)) ret.drillDown = selfDrill.drillDown;
    ret.otherFilters = _.filter(app.chartCommons.drillDown.filters, function(d) {
        if (!refreshDatasource) return false;
        var refresh = refreshDatasource.indexOf(d.datasourceId) != -1;
        return refresh && d.chartInPageId != chartInPage;
    });
    ret.userControlFilter = $.extend([], _.filter(app.chartCommons.userFilter.filters, function(d) {
        if (!refreshDatasource) return false;
        var refresh = refreshDatasource.indexOf(d.datasourceId) != -1;
        return refresh;
    }));
    var userVariable = JSON.parse(localStorage.getItem("userVariable"));
    ret.userVariable = userVariable;
    return ret;
};

app.chartCommons.expandedType = 1;

app.chartCommons.clicked = false;

app.chartCommons.changeSeriesPropertyBaseOnExpandedType = function(props, justOneSeries) {
    var expandedType = app.chartCommons.expandedType;
    props = props || {};
    props.info = props.info || {};
    props.info.aggregation = "1";
    if (expandedType === 1) {
        _.each(props.series, function(p, k) {
            if (justOneSeries && k != justOneSeries) return;
            p.seriesType = "bar";
            p.areaOpacity = .1;
        });
        props.info.stackedBar = "1";
        props.info.stackedLine = "1";
        props.info.isBox = false;
    }
    if (expandedType === 28) {
        _.each(props.series, function(p, k) {
            if (justOneSeries && k != justOneSeries) return;
            p.seriesType = "bar";
        });
        props.info.stackedBar = "1";
        props.info.stackedLine = "1";
        props.info.isBox = true;
    }
    if (expandedType == 2) {
        _.each(props.series, function(p, k) {
            if (justOneSeries && k != justOneSeries) return;
            p.seriesType = "bar";
            p.areaOpacity = .1;
        });
        props.info.stackedBar = "2";
        props.info.isBox = false;
        props.info.stackedLine = "1";
    }
    if (expandedType == 21) {
        _.each(props.series, function(p, k) {
            if (justOneSeries && k != justOneSeries) return;
            p.seriesType = "bar";
            p.areaOpacity = .1;
        });
        props.info.stackedBar = "3";
        props.info.stackedLine = "1";
        props.info.isBox = false;
    }
    if (expandedType == 3) {
        _.each(props.series, function(p, k) {
            if (justOneSeries && k != justOneSeries) return;
            p.seriesType = "line";
            p.lineType = "line-dot-area";
            p.areaOpacity = .1;
        });
        props.info.stackedBar = "1";
        props.info.stackedLine = "1";
        props.info.isBox = false;
    }
    if (expandedType == 4) {
        _.each(props.series, function(p, k) {
            if (justOneSeries && k != justOneSeries) return;
            p.areaOpacity = .1;
            p.lineType = "line-dot-area";
            p.seriesType = "line";
        });
        props.info.stackedBar = "1";
        props.info.stackedLine = "2";
        props.info.isBox = false;
    }
    if (expandedType == 22) {
        _.each(props.series, function(p, k) {
            if (justOneSeries && k != justOneSeries) return;
            p.areaOpacity = .1;
            p.seriesType = "line";
            p.lineType = "line-dot-area";
        });
        props.info.stackedBar = "1";
        props.info.stackedLine = "3";
        props.info.isBox = false;
    }
    if (expandedType == 5) {
        _.each(props.series, function(p, k) {
            if (justOneSeries && k != justOneSeries) return;
            p.seriesType = "line";
            p.lineType = "line-area";
            p.areaOpacity = .4;
        });
        props.info.stackedBar = "1";
        props.info.stackedLine = "1";
        props.info.isBox = false;
    }
    if (expandedType == 6) {
        _.each(props.series, function(p, k) {
            if (justOneSeries && k != justOneSeries) return;
            p.seriesType = "line";
            p.lineType = "line-area";
            p.areaOpacity = .4;
        });
        props.info.stackedBar = "1";
        props.info.stackedLine = "2";
        props.info.isBox = false;
    }
    if (expandedType == 23) {
        _.each(props.series, function(p, k) {
            if (justOneSeries && k != justOneSeries) return;
            p.seriesType = "line";
            p.lineType = "line-area";
            p.areaOpacity = .4;
        });
        props.info.stackedBar = "1";
        props.info.stackedLine = "3";
        props.info.isBox = false;
    }
    if (expandedType == 7) {
        props.info.hole = "0";
    }
    if (expandedType == 8) {
        props.info.hole = "50";
    }
    if (expandedType == 14) {
        props.info.aggregation = "-1";
    }
    if (expandedType == 29) {
        props.info.aggregation = "-1";
    }
    if (expandedType == 13) {
        props.info.aggregation = "1";
    }
    if (expandedType == 15) {
        props.info.type = "combo";
    }
    if (expandedType == 16) {
        props.info.type = "multi";
    }
    if (expandedType == 17) {
        props.info.type = "datepicker";
    }
    if (expandedType == 18) {
        props.info.type = "datepicker-range";
    }
    if (expandedType == 19) {
        props.info.type = "slider";
    }
    if (expandedType == 20) {
        props.info.type = "text";
    }
    if (expandedType == 9) {
        props.info.segmentType = "singleSegment";
        props.info.style = "arc";
    }
    if (expandedType == 24) {
        props.info.segmentType = "multiSegment";
        props.info.style = "arc";
    }
    if (expandedType == 25) {
        props.info.segmentType = "singleSegment";
        props.info.style = "horizontal";
    }
    if (expandedType == 26) {
        props.info.segmentType = "multiSegment";
        props.info.style = "horizontal";
    }
    if (expandedType == 27) {
        props.info.style = "number";
        props.info.icons = props.info.icons || [ {
            name: "icon warning"
        } ];
        props.info.showLabels = true;
    }
};

app.chartCommons.setDefault = function(props, d, type) {
    var colors = d3.scaleOrdinal(d3.schemeCategory10);
    if (_.isUndefined(d)) return;
    _.each(d, function(i, j) {
        var color = colors(j);
        var k = type;
        props.series = props.series || {};
        var dd = {
            bar: {
                seriesColor: color,
                seriesType: "bar",
                formatString: ",.0f",
                numberFactor: "1",
                showValues: false,
                hidden: false,
                cumulative: false,
                cumulative_formula: "sum",
                lineFace: "5,0",
                lineWeight: "2",
                lineStyle: "linear",
                lineType: "line-dot-area",
                showValueColor: "#333333",
                areaOpacity: .1,
                formatStringCustom: ",.0f",
                font: {
                    bold: false,
                    color: "#333333",
                    italic: false,
                    fontSize: "11px",
                    fontName: "IRANSans",
                    formatString: ",.3s",
                    formatStringCustom: ",.0f"
                },
                top: {
                    IsTop: false,
                    Top: 10,
                    IsPercent: false,
                    TopOrder: "DESC"
                }
            },
            map: {
                hidden: false,
                formatString: ",.0f",
                colorStart: "#31a354",
                colorEnd: "#c7e9c0",
                top: {
                    IsTop: false,
                    Top: 10,
                    IsPercent: false,
                    TopOrder: "DESC"
                }
            },
            pie: {
                main: true,
                numberFactor: "1",
                top: {
                    IsTop: false,
                    Top: 10,
                    IsPercent: false,
                    TopOrder: "DESC"
                }
            },
            gauge: {
                type: "value",
                typeMs: "value",
                numberFactor: "1",
                top: {
                    IsTop: false,
                    Top: 10,
                    IsPercent: false,
                    TopOrder: "DESC"
                }
            },
            radar: {
                numberFactor: "1",
                seriesColor: color,
                top: {
                    IsTop: false,
                    Top: 10,
                    IsPercent: false,
                    TopOrder: "DESC"
                }
            },
            table: {
                numberFactor: "1",
                textAlign: "right",
                formatString: ",.0f",
                fontSize: "1em",
                textItalic: false,
                textBold: false,
                color: "#000000",
                rowResult: "0",
                isHidden: false,
                top: {
                    IsTop: false,
                    Top: 10,
                    IsPercent: false,
                    TopOrder: "DESC"
                }
            },
            userControl: {
                numberFactor: "1",
                type: "value"
            },
            text: {}
        };
        var change = false;
        if (_.isUndefined(props.series[i]) && app.chartCommons.clicked === true) {
            change = true;
            app.chartCommons.clicked = false;
        }
        props.series[i] = $.extend({}, dd[k], props.series[i]);
        if (change) app.chartCommons.changeSeriesPropertyBaseOnExpandedType(props, i);
    });
};

app.chartCommons.commentUtils = {
    getLabelsMeasures: function(input) {
        var labels = [];
        var measures = [];
        var measuresKey = [];
        if (input.matrix) {
            _.each(input.matrix, function(d) {
                labels.push(d.captions);
            });
            _.each(input.series.labels, function(d) {
                measuresKey.push(d);
            });
            _.each(input.seriesLablesCaptions || input.series.labels, function(d) {
                measures.push(d);
            });
        } else {
            labels = input.headers;
        }
        return {
            labels: labels,
            measures: measures,
            measuresKey: measuresKey
        };
    },
    getCommentCount: function(comments, category, label) {
        var stringArray = category;
        if (_.isArray(category)) stringArray = _.sortBy(category).join(", ");
        return comments.filter(function(c) {
            return stringArray == c.label && c.measure == label;
        }).length;
    },
    getChartSelector: function(cip) {
        return ".cid" + cip;
    },
    clickOnCommentIcon: function(d, cip) {
        $(app.chartCommons.commentUtils.getChartSelector(cip)).trigger("new-comment", d);
        try {
            d3.event.preventDefault();
            d3.event.stopPropagation();
        } catch (e) {}
    },
    highlight: function(collections, d) {
        var f = false;
        _.each(collections, function(col) {
            if (col instanceof jQuery) {
                col.removeClass("selected");
            } else {
                col.classed("selected", false);
            }
        });
        _.each(collections, function(col) {
            if (f) return false;
            if (col instanceof jQuery) {
                var tableData = $(col[0]).data("table-data");
                col.each(function(d2, e) {
                    var i = $(e).data("xrow");
                    var j = $(e).data("xcol");
                    var d2 = tableData.rows[i][j];
                    if (d.category == d2.category && d.seriesLable == d2.seriesLable) {
                        d3.select(this).classed("selected", true);
                        f = true;
                        return false;
                    }
                });
                return;
            }
            col.each(function(d2) {
                if (d.category == d2.category && d.seriesLable == d2.seriesLable) {
                    d3.select(this).classed("selected", true);
                    f = true;
                    return false;
                }
            });
        });
    },
    setOnHighlightListener: function(d3Collection, cip) {
        var collections = $(app.chartCommons.commentUtils.getChartSelector(cip)).data("collections") || [];
        collections.push(d3Collection);
        $(app.chartCommons.commentUtils.getChartSelector(cip)).data("collections", collections);
        $(app.chartCommons.commentUtils.getChartSelector(cip)).off("highlight-element");
        $(app.chartCommons.commentUtils.getChartSelector(cip)).on("highlight-element", function(e, d) {
            if (!d) return;
            var collections = $(app.chartCommons.commentUtils.getChartSelector(cip)).data("collections") || [];
            app.chartCommons.commentUtils.highlight(collections, d);
        });
    },
    destroyListener: function(cip) {
        $(app.chartCommons.commentUtils.getChartSelector(cip)).data("collections", null);
    },
    addCommentIcon: function(cip, g, fx, fy) {
        if (!app.commentOnChart) return;
        var settings = $(app.chartCommons.commentUtils.getChartSelector(cip)).find(".chart-data").data("settings");
        if (!settings.permissions.Comment) return;
        var container = g.append("g").attr("transform", function(d, i) {
            return "translate(" + fx(d, i) + "," + fy(d, i) + ")scale(0.38)";
        }).attr("class", function(d) {
            return "comment" + (d.commentCount ? " show" : "");
        }).on("click", function(d) {
            app.chartCommons.commentUtils.clickOnCommentIcon(d, cip);
        });
        var t = container.append("rect");
        t.attrs({
            width: 50,
            height: 24,
            "class": "comment-background"
        });
        container.append("path").attr("d", "M10.718,18.561l6.78,5.311C17.609,23.957,17.677,24,17.743,24  c0.188,0,0.244-0.127,0.244-0.338v-5.023c0-0.355,0.233-0.637,0.548-0.637L21,18c2.219,0,3-1.094,3-2s0-13,0-14s-0.748-2-3.014-2  H2.989C0.802,0,0,0.969,0,2s0,13.031,0,14s0.828,2,3,2h6C9,18,10.255,18.035,10.718,18.561z");
        container.append("text").text(function(d) {
            return d.commentCount ? persian(d.commentCount, true) : "";
        }).attrs({
            x: 34,
            y: "0.7em"
        }).styles({
            "font-size": "20px"
        });
    },
    updateIconCommentCount: function(cip, cm, length) {
        var col = $(app.chartCommons.commentUtils.getChartSelector(cip)).data("collections")[0];
        if (col instanceof jQuery) {
            var tableData = $(col[0]).data("table-data");
            col.each(function() {
                var i = $(this).data("xrow");
                var j = $(this).data("xcol");
                var d = tableData.rows[i][j];
                var stringCat = _.sortBy(d.category).join(", ");
                if (d.seriesLable == cm.measure && stringCat == cm.label) {
                    var tabeleTd = $(app.chartCommons.commentUtils.getChartSelector(cip) + " td[data-xcol=" + j + "][data-xrow=" + i + "]");
                    var $tdComment = $(this).find(".comment");
                    var $tdComment2 = tabeleTd.find("svg:not(.td-comment) .comment");
                    if ($tdComment.length == 0) {
                        var $comment = $(app.chartCommons.commentUtils.getChartSelector(cip) + " svg");
                        $tdComment = $comment.clone().removeClass("td-comment");
                        $tdComment2 = $comment.clone().removeClass("td-comment");
                        $(this).append($tdComment);
                        tabeleTd.append($tdComment2);
                    }
                    $tdComment.find(".comment").attr("class", "comment show");
                    $tdComment.find("text").text(length ? persian(length, true) : "");
                    $tdComment2.find(".comment").attr("class", "comment show");
                    $tdComment2.find("text").text(length ? persian(length, true) : "");
                }
            });
            return;
        }
        var el = this;
        var chartComments = d3.selectAll(app.chartCommons.commentUtils.getChartSelector(cip) + " .comment");
        var modalComments = d3.selectAll("#" + app.chartCommons.commentUtils.getChartInModalSelector(cip) + " .comment");
        function update(col) {
            col.each(function(d) {
                var stringCat = _.sortBy(d.category).join(", ");
                if (d.seriesLable == cm.measure && stringCat == cm.label) {
                    d3.select(this).select("text").text(length ? persian(length, true) : "");
                    d3.select(this).classed("show", length > 0 ? true : false);
                }
            });
        }
        update(modalComments);
        update(chartComments);
    },
    getChartInModalSelector: function(cip) {
        return "modal-chart-container-" + cip;
    },
    showLastVersionChart: function() {}
};

app.chartCommons.renderComments = function(settings, input) {
    if (!app.commentOnChart) return;
    if (!settings.permissions.Comment) return;
    if (!input.FinalWhereList) return;
    var selector = app.chartCommons.commentUtils.getChartSelector(settings.ChartInPageId);
    var chartSelector = app.chartCommons.commentUtils.getChartInModalSelector(settings.ChartInPageId);
    var $commentIcon = $(selector + " .show-chart-comments");
    var commentSideHeight = 300;
    $(selector + " .comment-section").remove();
    var FilteredComments = input.comment;
    if (settings.fromCommentDialog) {
        return;
    }
    var lastVersionModalSelector = ".last-version-modal";
    $(".comment-modal.modal" + settings.ChartInPageId).remove();
    $(selector).off("new-comment");
    $commentIcon.off("click");
    createLastVersionChartModal();
    function createLastVersionChartModal() {
        var template = '<div class="ui fuild modal ' + lastVersionModalSelector.substring(1, 1e3) + ' rtl"  style="cursor: initial;">' + '     <i class="close icon"></i>' + '     <div class="header">نسخه قبلی نمودار</div>' + '     <div class="content" id="' + lastVersionModalSelector.substring(1, 1e3) + '" style="height:350px">' + '         <div class="ui active inverted dimmer"><div class="ui text loader">آماده‌سازی نمودار</div></div>' + "     </div>" + "</div>";
        if ($(lastVersionModalSelector).length == 0) {
            var $modal = $(template);
            $("body").append($modal);
            $modal.modal({
                allowMultiple: true,
                onVisible: function() {
                    app.chartCommons.commentUtils.showLastVersionChart();
                },
                onHidden: function() {
                    $(lastVersionModalSelector + " .content").html('<div class="ui active inverted dimmer"><div class="ui text loader">آماده‌سازی نمودار</div></div>');
                }
            });
        }
    }
    function createLableMeasureSelectTag(a, name) {
        if (!a || !a.length) return "";
        return filterXSS("" + '<div class="six wide field">' + '<select class="ui tiny search selection dropdown ' + (name ? name : "") + '">' + "<option>" + a.join("</option><option>") + "</option>" + "</select>" + "</div>");
    }
    function getValueFormat(d) {
        return filterXSS('<div class="ui mini label value comment-value" data-label="' + d.label + '" data-measure="' + d.measure + '" data-value="' + d.value + '" style="">  ' + d.measure + " در " + d.label + ": " + persian(d3.format(",.2f")(d.value), true) + "</div>");
    }
    function createComment(d) {
        var version = "";
        if (+d.chartVersion !== +input.version) {
            version = persian(" نسخه " + d.chartVersion + " نمودار ", true);
            version = '            <span class="version pointer" style="color:red;" data-version="' + d.chartVersion + '">' + version + "</span>";
        }
        return '<div class="comment" data-id="' + d.id + '">' + '    <div class="content">' + '        <span class="author">' + d.username + "</span>" + '        <span class="value-string">' + getValueFormat(d) + "</span>" + '        <div class="metadata">' + '            <span class="date">' + moment(d.time).fromNow() + "</span>" + version + "        </div>" + '        <div class="text">' + '            <span class="comment-text">' + filterXSS(d.comment) + "            </span>" + '            <span class="auto-hide animated ">' + '            <a class="reply pointer metadata"> پاسخ </a>' + (d.userId === app.userId ? '            <a class="edit pointer metadata"> ویرایش </a>' : "") + (d.userId === app.userId ? '            <a class="remove pointer metadata"> حذف </a>' : "") + "            </span>" + "        </div>" + '        <div class="actions">' + "        </div>" + "    </div>" + (d.childs && d.childs.length ? createComments(d.childs) : "") + "</div>";
    }
    var isMobile = $(window).width() < 768;
    function createComments(comments, style) {
        var c = (comments || []).map(createComment, style).join("");
        return '<div class="ui tiny relaxed threaded comments ' + (!style ? "" : " root") + '" ' + (!style ? "" : 'style=" ' + (isMobile ? "" : "min-height:" + commentSideHeight + "px; overflow:auto;") + '   flex-grow: 1;flex-shrink: 1;flex-basis: 0px;"') + ">" + c + "</div>";
    }
    function getPopupContent(comments) {
        var c = createComments(comments, true) + '<form class="ui tiny form">' + '  <div class="field">' + '    <input type="text" rows="2" placeholder="نظر شما چیست؟" />' + "  </div>" + '  <div class="fields">' + createLableMeasureSelectTag(labels, "labels") + createLableMeasureSelectTag(measures, "measures") + "  </div>" + "</form>";
        return '<div class="ui popup comment-popup comment-section rtl" style="cursor: initial;">' + c + "</div>";
    }
    function getModalContent(comments) {
        var finalWhere = input.FinalWhereList.map(function(d) {
            var t = "" + '<div class="ui orange mini label">' + "<span>" + d.Key.replace(/\[id\d+\].\[(.*)\]/, "$1") + ": </span>" + '<span style="font-weight:200;">' + d.Value.join(",") + "</span>" + "</div>";
            return t;
        }).join("");
        var comentTemplate = createComments(comments, true);
        var formTemplae = '<form class="ui tiny form">' + '  <div class="final-where">' + filterXSS(finalWhere) + "</div>" + '  <div class="comment-modal-value"><span class="measure-value"></span> در <span class="label-value"></span>  <span class="value-value"></span></div>' + '  <div class="field">' + '    <textarea type="text"  rows="1" placeholder="' + app.lang.translate("new comment") + '"></textarea>' + "  </div>" + "</form>";
        return '<div class="ui modal comment-modal comment-section rtl modal' + settings.ChartInPageId + '" style="cursor: initial;">' + '     <i class="close icon"></i>' + '     <div class="header">' + app.lang.translate("commenting") + "</div>" + '     <div class="content ' + (isMobile ? "scrolling" : "") + '" style="padding:0">' + '         <div class="ui mobile reversed stackable padded grid">' + '             <div class="six wide column" ' + (isMobile ? "" : 'style="border-left: 1px solid #dcddde;display: flex;flex-direction: column;justify-content: flex-end;"') + ">" + comentTemplate + '     <div class="header" style="flex"></div>' + formTemplae + "             </div>" + '             <div class="six wide column chart-container" id="' + chartSelector + '" >' + '                   <div class="ui active inverted dimmer"><div class="ui text loader">' + app.lang.translate("preparing chart") + "</div></div>" + "             </div>" + "         </div>" + "     </div>" + "</div>";
    }
    function getModalContent_v0(comments) {
        var comentTemplate = createComments(comments, true);
        var formTemplae = '<form class="ui tiny form">' + '  <div class="field">' + '    <input type="text"  placeholder="نظر شما چیست؟" />' + "  </div>" + '  <div class="fields">' + createLableMeasureSelectTag(labels, "labels") + createLableMeasureSelectTag(measures, "measures") + "  </div>" + "</form>";
        return '<div class="ui modal comment-modal comment-section rtl modal' + settings.ChartInPageId + '" style="cursor: initial;">' + '     <i class="close icon"></i><div class="header">کامنت گذاری</div>' + '     <div class="content" style="padding:0">' + '         <div class="ui padded grid">' + '             <div class="six wide column" style="border-left: 1px solid #dcddde;">' + comentTemplate + "             </div>" + '             <div class="six wide column chart-container" id="' + chartSelector + '" style="height: 400px;">' + '                   <div class="ui active inverted dimmer"><div class="ui text loader">آماده‌سازی نمودار</div></div>' + "             </div>" + "         </div>" + "     </div>" + '     <div class="actions">' + formTemplae + "     </div>" + "</div>";
    }
    function removeSelectedComment() {
        $popup.find(".selected-comment").remove();
        $popup.find(".selected-comment-edit").remove();
        $input.val(null);
    }
    function getValueByLabelMeasure(l, m) {
        if (!l || !m) return "";
        var lIndex = labels.indexOf(l);
        var mIndex = measures.indexOf(m);
        var selectedValue = input.series.data[lIndex][mIndex];
        return selectedValue;
    }
    function setEditBoxValues(d) {
        $input.val(d.comment);
        if (!d.seriesLable) {}
        var val = getValueByLabelMeasure(d.seriesLable, d.measure);
        $labelText.data("v", d.seriesLable);
        $measureText.data("v", d.measure);
        $input.focus();
        $showSelectedValueContainer.hide();
        if (d.seriesLable) {
            $showSelectedValueContainer.show();
            $labelText.text(d.seriesLable);
            $measureText.text(d.measure);
            $value.text(persian(d3.format(",.2f")(val), true));
        }
    }
    function setReplyListener($el) {
        $el.find(".version").on("click", function() {
            var v = $(this).data("version");
            app.chartCommons.commentUtils.showLastVersionChart = function() {
                $(lastVersionModalSelector + " .content").charts(settings.type, {
                    id: lastVersionModalSelector.substring(1, 1e3),
                    parameters: {
                        type: settings.dataType,
                        fromCommentDialog: true,
                        lastVersionInfo: {
                            version: v,
                            lastVersionChartId: settings.chartId
                        }
                    }
                });
            };
            $(lastVersionModalSelector).modal("show");
        });
        $el.find(".reply").on("click", function() {
            var id = $(this).parents(".comment").data("id");
            removeSelectedComment();
            $selectedComment = $('<div class="ui mini label selected-comment field" data-id="' + id + '">پاسخ به ' + id + ' <i class="icon close" style="margin:0;"/>  </div>');
            $popup.find(".ui.form").prepend($selectedComment);
            $selectedComment.find(".icon").on("click", removeSelectedComment);
            $input.focus();
        });
        $el.find(".edit").on("click", function() {
            var id = $(this).parents(".comment").data("id");
            var $comment = $(this).parents(".comment").first();
            removeSelectedComment();
            $selectedComment = $('<div class="ui mini label selected-comment-edit field" data-id="' + id + '"> ویرایش ' + id + ' <i class="icon close" style="margin:0;"/>  </div>');
            $popup.find(".ui.form").prepend($selectedComment);
            $selectedComment.find(".icon").on("click", removeSelectedComment);
            setEditBoxValues({
                comment: $comment.find(".comment-text").first().text().trim(),
                label: $comment.find(".value").first().data("label"),
                measure: $comment.find(".value").first().data("measure")
            });
        });
        $el.find(".remove").on("click", function() {
            var id = $(this).parents(".comment").data("id");
            var $comment = $(this).parents(".comment").first();
            var f = confirm("در صورت حذف کامنت تمام پاسخ‌ها نیز حذف می‌شوند. آیا برای حذف اطمینان دارید؟");
            if (!f) return;
            var url = app.urlPrefix + "api/chartComments/Delete?id=" + id;
            $.post(url).done(function(cm) {
                $comment.transition("scale");
                var rootComment = null;
                _.each(FilteredComments, function(f) {
                    if (f.id == id) {
                        rootComment = f;
                    }
                });
                findComment(input.comment, id, function(cs, c, index) {
                    if (c.id == id) {
                        cs.splice(index, 1);
                    }
                });
                if (rootComment) {
                    var len = app.chartCommons.commentUtils.getCommentCount(FilteredComments, cm.label, cm.measure);
                    app.chartCommons.commentUtils.updateIconCommentCount(settings.ChartInPageId, cm, len);
                }
            });
        });
    }
    function findComment(comments, id, callback) {
        var f = null;
        var index = 0;
        _.each(comments, function(c) {
            if (callback) callback(comments, c, index);
            if (c.id == id) {
                f = c;
                return false;
            }
            var inChild = findComment(c.childs, id);
            if (inChild) {
                f = inChild;
                return false;
            }
            index++;
        });
        return f;
    }
    function filterComments(filter) {
        $popup.find(" .root.comments > .comment").hide();
        _.each(filter, function(d) {
            $popup.find(" .root.comments > .comment[data-id=" + d.id + "]").show();
        });
    }
    function getFilteredComment(d) {
        var stringCat = _.sortBy(d.category).join(", ");
        return FilteredComments.filter(function(c) {
            return stringCat == c.label && d.seriesLable == c.measure;
        });
    }
    function showChart() {
        var s = _.extend({}, settings);
        s.id = chartSelector;
        s.fromCommentDialog = true;
        $("#" + s.id).empty();
        app.chartCommons.commentUtils.destroyListener(s.ChartInPageId);
        app.chartCommons.draw(s.type, input, s, false);
        $("#" + chartSelector).on("select-series", function(e, d) {
            setEditBoxValues({
                comment: "",
                label: d.category,
                measure: d.seriesLable,
                measureKey: d.seriesKey
            });
            filterComments(getFilteredComment(d));
        });
    }
    if (FilteredComments) {
        moment.locale("fa");
        $(selector).data("init-befor", true);
        var l = app.chartCommons.commentUtils.getLabelsMeasures(input);
        var labels = l.labels;
        var measures = l.measures;
        var measuresKey = l.measuresKey;
        var $popup = $(getModalContent(FilteredComments));
        var $input = $popup.find("textarea");
        var $btn = $popup.find(".button");
        var $chartContainer = $popup.find(".chart-container");
        var $showSelectedValueContainer = $popup.find(".comment-modal-value");
        var $measureText = $popup.find(".measure-value");
        var $labelText = $popup.find(".label-value");
        var $value = $popup.find(".value-value");
        var submit = function() {
            var selectedLabel = $labelText.data("v");
            var selectedMeasure = $measureText.data("v");
            if (!_.isArray(selectedLabel)) selectedLabel = [ selectedLabel ];
            if (_.isArray(selectedMeasure)) selectedMeasure = selectedMeasure[0];
            if (_.isEmpty($input.val())) {
                alert("کامنت خود را بنویسید");
                return;
            }
            if (_.isEmpty(selectedLabel)) {
                alert("یکی از ردیف‌های اطلاعاتی را انتخاب کنید");
                return;
            }
            if (_.isEmpty(selectedMeasure)) {
                alert("یکی از داده‌ها را انتخاب کنید");
                return;
            }
            var selectedValue = getValueByLabelMeasure(selectedLabel, selectedMeasure);
            var savedSettings = $(selector + " .chart-data").data("settings");
            var filters = app.chartCommons.getFilterParameter(savedSettings.ChartInPageId, savedSettings.input.RefreshDatasource);
            var parentId = $popup.find(".selected-comment").data("id");
            var editId = $popup.find(".selected-comment-edit").data("id");
            function success(cm) {
                $btn.removeClass("loading");
                $input.val(null);
                removeSelectedComment();
                FilteredComments = FilteredComments || [];
                var parent = findComment(FilteredComments, parentId);
                if (parent) {
                    parent.childs = parent.childs || [];
                    parent.childs.push(cm);
                } else {
                    FilteredComments.push(cm);
                    var len = app.chartCommons.commentUtils.getCommentCount(FilteredComments, cm.label, cm.measure);
                    app.chartCommons.commentUtils.updateIconCommentCount(settings.ChartInPageId, cm, len);
                }
                var $comments = $popup.find(".comments.root");
                if (parentId) {
                    $parentComment = $popup.find(".comment[data-id=" + parentId + "] .comments");
                    if ($parentComment.length == 0) {
                        $parentComment = $popup.find(".comment[data-id=" + parentId + "]");
                        var $innerComments = $(createComments());
                        $parentComment.append($innerComments);
                        $parentComment = $innerComments;
                    }
                    $comments = $parentComment;
                }
                var $cm = $(createComment(cm));
                $comments.append($cm);
                setReplyListener($cm);
                setTimeout(function() {
                    var c = $popup.find(".root.comments [data-id=" + cm.id + "]");
                    var r = $popup.find(".root.comments");
                    r.animate({
                        scrollTop: r.scrollTop() + c.offset().top - r.height() + c.height()
                    }, 400);
                    setTimeout(function() {
                        c.transition("pulse");
                    }, 400);
                }, 400);
            }
            var stringLabels = _.sortBy(selectedLabel).join(", ");
            var data = {
                where: savedSettings.input.FinalWhereList,
                chartId: savedSettings.chartId,
                dashboardId: dashboard.pageId,
                datasourceId: savedSettings.input.DataSourceId,
                dimention: savedSettings.input.CurrentDimName,
                input: JSON.stringify(savedSettings.input),
                drillDown: filters.drillDown,
                otherFilters: filters.otherFilters,
                userControlFilter: filters.userControlFilter,
                userVariable: filters.userVariable,
                comment: $input.val().trim(),
                parentId: parentId,
                label: stringLabels,
                measure: selectedMeasure,
                value: selectedValue
            };
            $btn.addClass("loading");
            if (editId) {
                $.post(app.urlPrefix + "api/ChartComments/edit?" + "id=" + editId + "&text=" + $input.val().trim() + "&label=" + selectedLabel + "&measure=" + selectedMeasure + "&value=" + selectedValue).done(function(cm) {
                    $btn.removeClass("loading");
                    removeSelectedComment();
                    $input.val(null);
                    var $comment = $popup.find(".comment[data-id=" + editId + "]").first();
                    var $commentText = $popup.find(".comment[data-id=" + editId + "] .comment-text").first();
                    var $commentValueString = $popup.find(".comment[data-id=" + editId + "] .value-string").first();
                    $commentText.text(cm.comment);
                    $commentValueString.html(getValueFormat(cm));
                    setTimeout(function() {
                        $comment.transition("pulse");
                    }, 400);
                }).fail(function(e) {
                    $btn.removeClass("loading");
                });
                return;
            }
            $.ajax({
                type: "POST",
                url: app.urlPrefix + "api/ChartComments/save/0",
                data: JSON.stringify(data),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: success,
                error: function(xhr) {
                    $btn.removeClass("loading");
                }
            });
        };
        var box = {
            type: "modal",
            render: function() {
                $(selector).append($popup);
                setReplyListener($popup);
                $input.on("keyup", function(e) {
                    if (e.keyCode == 13 && e.ctrlKey) {
                        $input.val($input.val() + "\n");
                        return;
                    }
                    if (e.keyCode == 13) {
                        submit();
                    }
                });
                if (this.type == "modal") {
                    $popup.modal({
                        allowMultiple: true,
                        onVisible: function myfunction() {
                            showChart();
                            $(app.chartCommons.commentUtils.getChartSelector(settings.ChartInPageId)).trigger("highlight-element", [ box.highlightedValue ]);
                        }
                    });
                    $commentIcon.on("click", function() {
                        var d = {
                            category: labels[0],
                            seriesLable: measures[1],
                            seriesLablekey: measuresKey[1]
                        };
                        $(selector).trigger("new-comment", d);
                    });
                }
                if (this.type == "popup") {
                    $commentIcon.popup({
                        popup: $(selector + " .popup.ui"),
                        target: $(selector + " .ui.card .content"),
                        title: "کامنت‌ها",
                        position: "top right",
                        boundary: $(".main-container"),
                        on: "click",
                        lastResort: true,
                        prefer: "opposite",
                        onShow: function(e, i) {
                            $(selector + " .menu-bar").addClass("show-dropdown");
                        },
                        onVisible: function() {
                            $parentDiv = $(".main-container.full-height-container");
                            $innerListItem = $popup;
                            $parentDiv.animate({
                                scrollTop: $parentDiv.scrollTop() - $parentDiv.height() + $innerListItem.offset().top + $innerListItem.height() + 40
                            }, 400);
                        },
                        onHide: function(e, i) {
                            $(selector + " .menu-bar").removeClass("show-dropdown");
                        }
                    });
                }
            },
            show: function() {
                if (this.type == "modal") {
                    $popup.modal("show");
                }
                if (this.type == "popup") {
                    $commentIcon.popup("show");
                }
            }
        };
        box.render();
        $(selector).on("new-comment", function(e, d) {
            setEditBoxValues({
                comment: "",
                seriesLable: d.category,
                measure: d.seriesLable,
                measureKey: d.seriesKey
            });
            filterComments(getFilteredComment(d));
            box.highlightedValue = d;
            box.show();
            $(selector).trigger("highlight-element", [ box.highlightedValue ]);
        });
    }
};

jQuery.fn.extend({
    lazyDropdown: function(options) {
        return this.each(function() {
            var $e = $(this);
            $e.on("click", function(ev) {
                if (!$e.data("init-dd")) {
                    ev.stopPropagation();
                    ev.preventDefault();
                    $e.data("init-dd", true);
                    $e.dropdown(options);
                    $e.click();
                }
            });
        });
    }
});

app.chartCommons.indicator = {
    ifToString: function(ifRows, labels, captions, settings) {
        var opMap = {
            "1": "برابر باشد با",
            "2": "مخاف باشد با",
            "3": "کوچک تر باشد از",
            "4": "کوچکتر یا مساوی باشد از",
            "5": "بزرگ‌تر باشد از",
            "6": "بزرگ‌تر یا مساوی باشد از",
            "7": "شامل",
            "8": "عدم شمول"
        };
        var getCaption = function(name) {
            if (!labels || !captions) return;
            var index = labels.indexOf(name);
            var prop = settings.chartProp.series[name] = settings.chartProp.series[name] || {};
            return prop.name || captions[index];
        };
        var ifString = _.map(ifRows, function(row) {
            return "" + getCaption(row.firstField) + " " + opMap[row.operand] + " " + (row.secondFieldIsText ? row.secondFieldInput : "" + getCaption(row.secondFieldSelect) + "");
        });
        return ifString.join(" و ");
    },
    checkRow: function(ifObj, fields, headers) {
        var Index = headers.indexOf(ifObj.firstField);
        if (Index == -1) return false;
        try {
            var r = fields[Index];
        } catch (e) {
            debugger;
        }
        var firstVal = fields[Index];
        var secVal = 0;
        if (ifObj.secondFieldIsText) {
            secVal = ifObj.secondFieldInput;
        } else {
            var i = headers.indexOf(ifObj.secondFieldSelect);
            if (i === -1) return false;
            secVal = fields[i];
        }
        firstVal = depersian(firstVal);
        secVal = depersian(secVal);
        if (!isNaN(secVal)) secVal = +secVal;
        if (!isNaN(firstVal)) firstVal = +firstVal;
        switch (+ifObj.operand) {
          case 1:
            return firstVal == secVal;

          case 2:
            return firstVal != secVal;

          case 3:
            return firstVal > secVal;

          case 4:
            return firstVal >= secVal;

          case 5:
            return firstVal < secVal;

          case 6:
            return firstVal <= secVal;

          case 7:
            return firstVal.indexOf(secVal) > -1;

          case 8:
            return firstVal.indexOf(secVal) <= -1;

          default:        }
    },
    getIndicator: function(fields, headers, indicator) {
        var result = [];
        var hKeys = headers;
        if (indicator) indicator.forEach(function(ind) {
            var isTrue = true;
            $.each(ind.ifRow, function(i, d) {
                if (!app.chartCommons.indicator.checkRow(d, fields, hKeys)) {
                    isTrue = false;
                    return false;
                }
            });
            if (isTrue) {
                result.push(JSON.parse(JSON.stringify(ind.thenRow)));
            }
        });
        return result;
    }
};

(function() {
    var out$ = typeof exports != "undefined" && exports || typeof define != "undefined" && {} || this || window;
    if (typeof define !== "undefined") define("save-svg-as-png", [], function() {
        return out$;
    });
    var xmlns = "http://www.w3.org/2000/xmlns/";
    var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" [<!ENTITY nbsp "&#160;">]>';
    var urlRegex = /url\(["']?(.+?)["']?\)/;
    var fontFormats = {
        woff2: "font/woff2",
        woff: "font/woff",
        otf: "application/x-font-opentype",
        ttf: "application/x-font-ttf",
        eot: "application/vnd.ms-fontobject",
        sfnt: "application/font-sfnt",
        svg: "image/svg+xml"
    };
    var isElement = function isElement(obj) {
        return obj instanceof HTMLElement || obj instanceof SVGElement;
    };
    var requireDomNode = function requireDomNode(el) {
        if (!isElement(el)) throw new Error("an HTMLElement or SVGElement is required; got " + el);
    };
    var isExternal = function isExternal(url) {
        return url && url.lastIndexOf("http", 0) === 0 && url.lastIndexOf(window.location.host) === -1;
    };
    var getFontMimeTypeFromUrl = function getFontMimeTypeFromUrl(fontUrl) {
        var formats = Object.keys(fontFormats).filter(function(extension) {
            return fontUrl.indexOf("." + extension) > 0;
        }).map(function(extension) {
            return fontFormats[extension];
        });
        if (formats) return formats[0];
        console.error("Unknown font format for " + fontUrl + ". Fonts may not be working correctly.");
        return "application/octet-stream";
    };
    var arrayBufferToBase64 = function arrayBufferToBase64(buffer) {
        var binary = "";
        var bytes = new Uint8Array(buffer);
        for (var i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };
    var getDimension = function getDimension(el, clone, dim) {
        var v = el.viewBox && el.viewBox.baseVal && el.viewBox.baseVal[dim] || clone.getAttribute(dim) !== null && !clone.getAttribute(dim).match(/%$/) && parseInt(clone.getAttribute(dim)) || el.getBoundingClientRect()[dim] || parseInt(clone.style[dim]) || parseInt(window.getComputedStyle(el).getPropertyValue(dim));
        return typeof v === "undefined" || v === null || isNaN(parseFloat(v)) ? 0 : v;
    };
    var getDimensions = function getDimensions(el, clone, width, height) {
        if (el.tagName === "svg") return {
            width: width || getDimension(el, clone, "width"),
            height: height || getDimension(el, clone, "height")
        }; else if (el.getBBox) {
            var _el$getBBox = el.getBBox(), x = _el$getBBox.x, y = _el$getBBox.y, _width = _el$getBBox.width, _height = _el$getBBox.height;
            return {
                width: x + _width,
                height: y + _height
            };
        }
    };
    var reEncode = function reEncode(data) {
        return decodeURIComponent(encodeURIComponent(data).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            var c = String.fromCharCode("0x" + p1);
            return c === "%" ? "%25" : c;
        }));
    };
    var uriToBlob = function uriToBlob(uri) {
        var byteString = window.atob(uri.split(",")[1]);
        var mimeString = uri.split(",")[0].split(":")[1].split(";")[0];
        var buffer = new ArrayBuffer(byteString.length);
        var intArray = new Uint8Array(buffer);
        for (var i = 0; i < byteString.length; i++) {
            intArray[i] = byteString.charCodeAt(i);
        }
        return new Blob([ buffer ], {
            type: mimeString
        });
    };
    var query = function query(el, selector) {
        if (!selector) return;
        try {
            return el.querySelector(selector) || el.parentNode && el.parentNode.querySelector(selector);
        } catch (err) {
            console.warn('Invalid CSS selector "' + selector + '"', err);
        }
    };
    var detectCssFont = function detectCssFont(rule, href) {
        var match = rule.cssText.match(urlRegex);
        var url = match && match[1] || "";
        if (!url || url.match(/^data:/) || url === "about:blank") return;
        var fullUrl = url.startsWith("../") ? href + "/../" + url : url.startsWith("./") ? href + "/." + url : url;
        return {
            text: rule.cssText,
            format: getFontMimeTypeFromUrl(fullUrl),
            url: fullUrl
        };
    };
    var inlineImages = function inlineImages(el) {
        return Promise.all(Array.from(el.querySelectorAll("image")).map(function(image) {
            var href = image.getAttributeNS("http://www.w3.org/1999/xlink", "href") || image.getAttribute("href");
            if (!href) return Promise.resolve(null);
            if (isExternal(href)) {
                href += (href.indexOf("?") === -1 ? "?" : "&") + "t=" + new Date().valueOf();
            }
            return new Promise(function(resolve, reject) {
                var canvas = document.createElement("canvas");
                var img = new Image();
                img.crossOrigin = "anonymous";
                img.src = href;
                img.onerror = function() {
                    return reject(new Error("Could not load " + href));
                };
                img.onload = function() {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    canvas.getContext("2d").drawImage(img, 0, 0);
                    image.setAttributeNS("http://www.w3.org/1999/xlink", "href", canvas.toDataURL("image/png"));
                    resolve(true);
                };
            });
        }));
    };
    var cachedFonts = {};
    var inlineFonts = function inlineFonts(fonts) {
        return Promise.all(fonts.map(function(font) {
            return new Promise(function(resolve, reject) {
                if (cachedFonts[font.url]) return resolve(cachedFonts[font.url]);
                var req = new XMLHttpRequest();
                req.addEventListener("load", function() {
                    var fontInBase64 = arrayBufferToBase64(req.response);
                    var fontUri = font.text.replace(urlRegex, 'url("data:' + font.format + ";base64," + fontInBase64 + '")') + "\n";
                    cachedFonts[font.url] = fontUri;
                    resolve(fontUri);
                });
                req.addEventListener("error", function(e) {
                    console.warn("Failed to load font from: " + font.url, e);
                    cachedFonts[font.url] = null;
                    resolve(null);
                });
                req.addEventListener("abort", function(e) {
                    console.warn("Aborted loading font from: " + font.url, e);
                    resolve(null);
                });
                req.open("GET", font.url);
                req.responseType = "arraybuffer";
                req.send();
            });
        })).then(function(fontCss) {
            return fontCss.filter(function(x) {
                return x;
            }).join("");
        });
    };
    var cachedRules = null;
    var styleSheetRules = function styleSheetRules() {
        if (cachedRules) return cachedRules;
        return cachedRules = Array.from(document.styleSheets).map(function(sheet) {
            try {
                return {
                    rules: sheet.cssRules,
                    href: sheet.href
                };
            } catch (e) {
                console.warn("Stylesheet could not be loaded: " + sheet.href, e);
                return {};
            }
        });
    };
    var inlineCss = function inlineCss(el, options) {
        var _ref = options || {}, selectorRemap = _ref.selectorRemap, modifyStyle = _ref.modifyStyle, modifyCss = _ref.modifyCss, fonts = _ref.fonts;
        var generateCss = modifyCss || function(selector, properties) {
            var sel = selectorRemap ? selectorRemap(selector) : selector;
            var props = modifyStyle ? modifyStyle(properties) : properties;
            return sel + "{" + props + "}\n";
        };
        var css = [];
        var detectFonts = typeof fonts === "undefined";
        var fontList = fonts || [];
        styleSheetRules().forEach(function(_ref2) {
            var rules = _ref2.rules, href = _ref2.href;
            if (!rules) return;
            Array.from(rules).forEach(function(rule) {
                if (typeof rule.style != "undefined") {
                    if (query(el, rule.selectorText)) css.push(generateCss(rule.selectorText, rule.style.cssText)); else if (detectFonts && rule.cssText.match(/^@font-face/)) {
                        var font = detectCssFont(rule, href);
                        if (font) fontList.push(font);
                    } else css.push(rule.cssText);
                }
            });
        });
        return inlineFonts(fontList).then(function(fontCss) {
            return css.join("\n") + fontCss;
        });
    };
    out$.prepareSvg = function(el, options, done) {
        requireDomNode(el);
        var _ref3 = options || {}, _ref3$left = _ref3.left, left = _ref3$left === undefined ? 0 : _ref3$left, _ref3$top = _ref3.top, top = _ref3$top === undefined ? 0 : _ref3$top, w = _ref3.width, h = _ref3.height, _ref3$scale = _ref3.scale, scale = _ref3$scale === undefined ? 1 : _ref3$scale, _ref3$responsive = _ref3.responsive, responsive = _ref3$responsive === undefined ? false : _ref3$responsive;
        return inlineImages(el).then(function() {
            var clone = el.cloneNode(true);
            var _ref4 = options || {}, _ref4$backgroundColor = _ref4.backgroundColor, backgroundColor = _ref4$backgroundColor === undefined ? "transparent" : _ref4$backgroundColor;
            clone.style.backgroundColor = backgroundColor;
            var _getDimensions = getDimensions(el, clone, w, h), width = _getDimensions.width, height = _getDimensions.height;
            if (el.tagName !== "svg") {
                if (el.getBBox) {
                    clone.setAttribute("transform", clone.getAttribute("transform").replace(/translate\(.*?\)/, ""));
                    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    svg.appendChild(clone);
                    clone = svg;
                } else {
                    console.error("Attempted to render non-SVG element", el);
                    return;
                }
            }
            clone.setAttribute("version", "1.1");
            clone.setAttribute("viewBox", [ left, top, width, height ].join(" "));
            if (!clone.getAttribute("xmlns")) clone.setAttributeNS(xmlns, "xmlns", "http://www.w3.org/2000/svg");
            if (!clone.getAttribute("xmlns:xlink")) clone.setAttributeNS(xmlns, "xmlns:xlink", "http://www.w3.org/1999/xlink");
            if (responsive) {
                clone.removeAttribute("width");
                clone.removeAttribute("height");
                clone.setAttribute("preserveAspectRatio", "xMinYMin meet");
            } else {
                clone.setAttribute("width", width * scale);
                clone.setAttribute("height", height * scale);
            }
            Array.from(clone.querySelectorAll("foreignObject > *")).forEach(function(foreignObject) {
                if (!foreignObject.getAttribute("xmlns")) foreignObject.setAttributeNS(xmlns, "xmlns", "http://www.w3.org/1999/xhtml");
            });
            return inlineCss(el, options).then(function(css) {
                var style = document.createElement("style");
                style.setAttribute("type", "text/css");
                style.innerHTML = "<![CDATA[\n" + css + "\n]]>";
                var defs = document.createElement("defs");
                defs.appendChild(style);
                clone.insertBefore(defs, clone.firstChild);
                var outer = document.createElement("div");
                outer.appendChild(clone);
                var src = outer.innerHTML.replace(/NS\d+:href/gi, 'xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href');
                if (typeof done === "function") done(src, width, height); else return {
                    src: src,
                    width: width,
                    height: height
                };
            });
        });
    };
    out$.svgAsDataUri = function(el, options, done) {
        requireDomNode(el);
        var result = out$.prepareSvg(el, options).then(function(_ref5) {
            var src = _ref5.src, width = _ref5.width, height = _ref5.height;
            var svgXml = "data:image/svg+xml;base64," + window.btoa(reEncode(doctype + src));
            if (typeof done === "function") {
                done(svgXml, width, height);
            }
            return svgXml;
        });
        return result;
    };
    out$.svgAsPngUri = function(el, options, done) {
        requireDomNode(el);
        var _ref6 = options || {}, _ref6$encoderType = _ref6.encoderType, encoderType = _ref6$encoderType === undefined ? "image/png" : _ref6$encoderType, _ref6$encoderOptions = _ref6.encoderOptions, encoderOptions = _ref6$encoderOptions === undefined ? .8 : _ref6$encoderOptions, canvg = _ref6.canvg;
        var convertToPng = function convertToPng(_ref7) {
            var src = _ref7.src, width = _ref7.width, height = _ref7.height;
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            var pixelRatio = window.devicePixelRatio || 1;
            canvas.width = width * pixelRatio;
            canvas.height = height * pixelRatio;
            canvas.style.width = canvas.width + "px";
            canvas.style.height = canvas.height + "px";
            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            if (canvg) canvg(canvas, src); else context.drawImage(src, 0, 0);
            var png = void 0;
            try {
                png = canvas.toDataURL(encoderType, encoderOptions);
            } catch (e) {
                if (typeof SecurityError !== "undefined" && e instanceof SecurityError || e.name === "SecurityError") {
                    console.error("Rendered SVG images cannot be downloaded in this browser.");
                    return;
                } else throw e;
            }
            if (typeof done === "function") done(png, canvas.width, canvas.height);
            return Promise.resolve(png);
        };
        if (canvg) return out$.prepareSvg(el, options).then(convertToPng); else return out$.svgAsDataUri(el, options).then(function(uri) {
            return new Promise(function(resolve, reject) {
                var image = new Image();
                image.onload = function() {
                    return resolve(convertToPng({
                        src: image,
                        width: image.width,
                        height: image.height
                    }));
                };
                image.onerror = function() {
                    reject("There was an error loading the data URI as an image on the following SVG\n" + window.atob(uri.slice(26)) + "Open the following link to see browser's diagnosis\n" + uri);
                };
                image.src = uri;
            });
        });
    };
    out$.download = function(name, uri) {
        if (navigator.msSaveOrOpenBlob) navigator.msSaveOrOpenBlob(uriToBlob(uri), name); else {
            var saveLink = document.createElement("a");
            if ("download" in saveLink) {
                saveLink.download = name;
                saveLink.style.display = "none";
                document.body.appendChild(saveLink);
                try {
                    var blob = uriToBlob(uri);
                    var url = URL.createObjectURL(blob);
                    saveLink.href = url;
                    saveLink.onclick = function() {
                        return requestAnimationFrame(function() {
                            return URL.revokeObjectURL(url);
                        });
                    };
                } catch (e) {
                    console.warn("This browser does not support object URLs. Falling back to string URL.");
                    saveLink.href = uri;
                }
                saveLink.click();
                document.body.removeChild(saveLink);
            } else {
                window.open(uri, "_temp", "menubar=no,toolbar=no,status=no");
            }
        }
    };
    out$.saveSvg = function(el, name, options) {
        requireDomNode(el);
        out$.svgAsDataUri(el, options || {}, function(uri) {
            return out$.download(name, uri);
        });
    };
    out$.saveSvgAsPng = function(el, name, options) {
        requireDomNode(el);
        out$.svgAsPngUri(el, options || {}, function(uri) {
            return out$.download(name, uri);
        });
    };
})();

app.chartCommons.exportPng = {
    svgString2Image: function(svgString, width, height, format, callback) {
        var format = format ? format : "png";
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;
        var r = $('<div class="bar-chart"><img /></div>');
        var image = r.find("img").get(0);
        image.onload = function() {
            context.clearRect(0, 0, width, height);
            context.drawImage(image, 0, 0, width, height);
            canvas.toBlob(function(blob) {
                var filesize = Math.round(blob.length / 1024) + " KB";
                if (callback) callback(blob, filesize);
            });
        };
        image.src = svgString;
    },
    getSVGString: function(svgNode) {
        var doctype = '<?xml version="1.0" standalone="no"?>' + '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
        var source = new XMLSerializer().serializeToString(svgNode);
        var blob = new Blob([ doctype + source ], {
            type: "image/svg+xml;charset=utf-8"
        });
        var url = window.URL.createObjectURL(blob);
        return url;
        svgNode.setAttribute("xlink", "http://www.w3.org/1999/xlink");
        var cssStyleText = getCSSStyles(svgNode);
        appendCSS(cssStyleText, svgNode);
        var serializer = new XMLSerializer();
        var svgString = serializer.serializeToString(svgNode);
        svgString = svgString.replace(/(\w+)?:?xlink=/g, "xmlns:xlink=");
        svgString = svgString.replace(/NS\d+:href/g, "xlink:href");
        return svgString;
        return "<div class='bar-chart'>" + svgString + "</div>";
        function getCSSStyles(parentElement) {
            var selectorTextArr = [];
            selectorTextArr.push("#" + parentElement.id);
            for (var c = 0; c < parentElement.classList.length; c++) if (!contains("." + parentElement.classList[c], selectorTextArr)) selectorTextArr.push("." + parentElement.classList[c]);
            var nodes = parentElement.getElementsByTagName("*");
            for (var i = 0; i < nodes.length; i++) {
                var id = nodes[i].id;
                if (!contains("#" + id, selectorTextArr)) selectorTextArr.push("#" + id);
                var classes = nodes[i].classList;
                for (var c = 0; c < classes.length; c++) if (!contains("." + classes[c], selectorTextArr)) selectorTextArr.push("." + classes[c]);
            }
            var extractedCSSText = "";
            for (var i = 0; i < document.styleSheets.length; i++) {
                var s = document.styleSheets[i];
                try {
                    if (!s.cssRules) continue;
                } catch (e) {
                    if (e.name !== "SecurityError") throw e;
                    continue;
                }
                var cssRules = s.cssRules;
                for (var r = 0; r < cssRules.length; r++) {
                    if (contains(cssRules[r].selectorText, selectorTextArr)) extractedCSSText += cssRules[r].cssText;
                }
            }
            return extractedCSSText;
            function contains(str, arr) {
                return arr.indexOf(str) === -1 ? false : true;
            }
        }
        function appendCSS(cssText, element) {
            var styleElement = document.createElement("style");
            styleElement.setAttribute("type", "text/css");
            styleElement.innerHTML = cssText;
            var refNode = element.hasChildNodes() ? element.children[0] : null;
            element.insertBefore(styleElement, refNode);
        }
    }
};

function prepareData(input, props) {
    var data = [];
    var matrix = input.matrix || [];
    for (var i = 0; i < input.matrix.length; i++) {
        var item = {};
        item.index = i;
        item.label = input.matrix[i].captions;
        item.onClickVal = input.matrix[i].canDrill ? input.matrix[i].values : "";
        item.canDrill = input.matrix[i].canDrill;
        item.value = input.matrix[i].values;
        item.kpis = input.kpis.data[i];
        item.series = input.series.data[i];
        var temp = [];
        if (item.kpis) for (var j = 0; j < item.kpis.length; j++) {
            var datum = [];
            for (var k = 0; k < item.kpis[j].length; k++) {
                if (item.kpis[j][k] === "") datum.push(item.kpis[j][k]); else datum.push(parseFloat(item.kpis[j][k]) || 0);
            }
            temp.push(datum);
        }
        item.kpis = temp;
        temp = [];
        for (var j = 0; j < item.series.length; j++) {
            if (item.series[j] === "" || item.series[j] === null || isNaN(item.series[j])) temp.push(item.series[j]); else temp.push(parseFloat(item.series[j]) || 0);
        }
        item.series = temp;
        data.push(item);
    }
    return data;
}

function persian(s, showPersian) {
    if (s == null) return s;
    if (typeof showPersian == "undefined") {
        showPersian = app.lang.isRtl();
    }
    if (!showPersian) return s;
    var reps = {
        0: "۰",
        1: "۱",
        2: "۲",
        3: "۳",
        4: "۴",
        5: "۵",
        6: "۶",
        7: "۷",
        8: "۸",
        9: "۹"
    };
    s = s + "";
    return s.replace(/(\d)/g, function(s, key) {
        return reps[key] || s;
    });
}

function depersian(s) {
    var reps = {
        "۰": 0,
        "۱": 1,
        "۲": 2,
        "۳": 3,
        "۴": 4,
        "۵": 5,
        "۶": 6,
        "۷": 7,
        "۸": 8,
        "۹": 9
    };
    s = s + "";
    return s.replace(/([۰۱۲۳۴۵۶۷۸۹])/g, function(s, key) {
        return typeof reps[key] != "undefined" ? reps[key] : s;
    });
}

function normilize(s) {
    var reps = {
        "ي": "ی",
        "إ": "ا",
        "ؤ": "و",
        "أ": "ا",
        "آ": "ا",
        "ک": "ك"
    };
    s = s + "";
    return s.replace(/(.)/g, function(s, key) {
        return reps[key] || s;
    });
}

d3.selection.prototype.settingsIcon = function(option) {
    return;
    option.CanExportXlsx = /true/gi.test(option.CanExportXlsx);
    if (!option.deleteLink) option.deleteLink = "#";
    if (!option.editLink) option.editLink = "#";
    var obj = $(this._groups[0][0]);
    obj.append('<span  class="glyphicon glyphicon-link close small-icon" style="margin-right: 5px;"> </span>');
    obj.addClass("over-show");
    if (option.RemoveFromPage || option.EditPermission || option.CanExportXlsx) {
        obj.append('<div class="ui mini dropdown icon circular left floated " ng-click="$event.stopPropagation();">                    <i class="settings icon"></i>                    <div class=" menu transition hidden" tabindex="-1">                      ' + (option.EditPermission ? ' <div class="item" ><a href="' + option.editLink + '"><span class="glyphicon glyphicon-pencil gray"/> <span data-trans-key="ویرایش" > </span></a></div>' : "") + "                      " + (option.EditPermission ? ' <div class="item" ><a class="clone-chart"><span class="glyphicon glyphicon-duplicate gray"/> <span data-trans-key="تکرار" > </span> </a></div>' : "") + "                      " + (option.RemoveFromPage ? ' <div class="item" ><a href="' + option.deleteLink + '"><span class="glyphicon glyphicon-trash gray"/> <span data-trans-key="حذف نمودار از صفحه" > </span></a></div>' : "") + "                      " + (option.CanExportXlsx ? '  <div class="item" ><a class="export-excel"><span class="glyphicon glyphicon-export gray"/> <span data-trans-key="خروجی اکسل" > </span></a></div>' : "") + '                       <div><a class="item export-print"><span class="glyphicon glyphicon-print gray"/> <span data-trans-key="print" > </span></a></div>                 </div>                </div>');
        obj.find(".export-excel").on("click", function() {
            if (option.onExportXlsx) option.onExportXlsx();
        });
        obj.find(".export-print").on("click", function() {
            app.print.printSingle("#" + option.settings.id, option.title);
        });
        obj.find(".clone-chart").on("click", function() {
            app.post(app.urlPrefix + "Moderation/Charts/CloneChart", {
                Id: option.chartId,
                PageId: dashboard.pageId
            }, function(data) {
                if (data.result && data.insertedId) {
                    var id = data.insertedId;
                    var link = app.urlPrefix + "charts/DashboardPage/getChartDetails";
                    app.post(link, {
                        chartId: id
                    }, function(data2) {
                        data2.pageId = data.chartInPageId;
                        dashboard.charts.push(data2);
                        dashboard.addChart(data2, null, false);
                        $("html, body").animate({
                            scrollTop: $(document).height() - $(window).height()
                        }, 1e3);
                    });
                }
            });
        });
    }
    var addedBefore = 0;
    function changeHieght(e) {}
    var hasDesc = typeof option.desc != "undefined" && option.desc != null && option.desc != "";
    var hasLastRefresh = typeof option.LastRefresh != "undefined" && option.LastRefresh != null;
    if ((hasDesc || hasLastRefresh) && option.CanExportXlsx) {
        obj.append('<span class="btn-group pull-right " >                 <span  type="button"  class="glyphicon glyphicon-info-sign close small-icon dropdown-toggle show-node left-margin" style="' + (option.isFresh ? "" : "color:red") + '"> </span>            </span>');
        obj.find(".glyphicon-info-sign").on("click", function() {
            obj.find(".desc").slideToggle({
                easing: "linear",
                duration: 200
            });
        });
    }
    var dateFormat = function(date) {
        if (app.lang.langType != 0) {
            return date.D + "/" + date.M + "/" + date.Y + " - " + date.h + ":" + date.m + ":" + date.s + " ";
        }
        var dif = "";
        if (date.Diff) {
            if (date.Diff < 60 * 60 * 24) {
                dif += " - <b>";
                dif += date.Diff < 60 ? Math.floor(date.Diff) + " ثانیه پیش" : date.Diff < 60 * 60 ? Math.floor(date.Diff / 60) + " دقیقه پیش" : Math.floor(date.Diff / (60 * 60)) + " ساعت پیش";
                dif += "</b>";
            }
        }
        var monthName = +date.M == 1 ? "فروردین" : +date.M == 2 ? "اردیبهشت" : +date.M == 3 ? "خرداد" : +date.M == 4 ? "تیر" : +date.M == 5 ? "مرداد" : +date.M == 6 ? "شهریور" : +date.M == 7 ? "مهر" : +date.M == 8 ? "آبان" : +date.M == 9 ? "آذر" : +date.M == 10 ? "دی" : +date.M == 11 ? "بهمن" : "اسفند";
        return persian(date.D + " " + monthName + " ماه " + date.Y + " ساعت " + date.h + ":" + date.m + ":" + date.s + " " + dif, true);
    };
    option.title += "&nbsp;";
    var desc = app.lang.translate("desc");
    var lastUpdate = app.lang.translate("lastUpdate");
    obj.append("            " + (option.showFilterIcon <= 0 ? "" : '<span class="btn-group pull-right " >                 <span  type="button"  class="glyphicon glyphicon-filter close small-icon dropdown-toggle show-node left-margin" > </span>            </span>') + '            <span class="myprogress pull-right" style="visibility:hidden"><img width="18px" height="18px" src="' + app.urlPrefix + 'Images/progress.gif"/></span>              <div class="title-move" style="cursor:move; margin-bottom:3px; margin-top:3px;">' + persian(option.title) + '</div>             <div class="desc" style="z-index:100;width:100%; right:0;display:none; padding: 10px; position: absolute; text-align: justify;">                   <div style=" padding:0;border: 0 none;">' + (!hasDesc ? "" : '<div style="margin-bottom:10px"><b style="border-bottomx: 1px solid #C0C0C0;display: xblock;padding-bottom: 5px;">' + desc + ": </b>" + (option.desc != null ? option.desc.replace(/(\r\n|\n|\r)/gm, "<br/>") : "") + "</div>") + (!hasLastRefresh ? "" : '<div style="font-size:0.8em"><b style="border-bottomx: 1px solid #C0C0C0;padding-bottom: 5px;">' + lastUpdate + ": </b>" + dateFormat(option.LastRefresh) + "</div>") + '</div>             </div>             <div  class="clear filter " style="z-index:20;margin:0 -7px; display:none; position:absolute; width:100%; height:' + ($("#" + option.settings.id).height() - $("#" + option.settings.id + " .title").height() - 20) + 'px; overflow:auto" ></div>');
    var settings = option.settings;
    obj.find(".glyphicon-link").on("click", function() {
        if (typeof settings == "undefined" || typeof settings.link == "undefined") settings.link = "hide"; else settings.link = settings.link == "show" ? "bold" : "show";
        if ($(this).hasClass("link")) $(this).removeClass("link"); else $(this).addClass("link");
    });
    if (typeof settings == "undefined" || typeof settings.link == "undefined" || option.settings.link == "hide") {
        obj.find(".glyphicon-link").hide();
    } else {
        if (option.settings.link == "show") obj.find(".glyphicon-link").removeClass("link"); else obj.find(".glyphicon-link").addClass("link");
    }
    obj.find(".clear.filter").on("click", function() {
        obj.find(".filter").slideToggle({
            done: function(ui, item) {
                app.lang.setLang({
                    selector: obj.find(".filter").selector
                });
            },
            start: function(e) {}
        });
    });
    obj.find(".glyphicon-filter").on("click", function() {
        var filter = obj.find(".filter");
        if (filter.html() == "") {
            filter.html('<div style="padding:3px"><img style="width: 1.3em" src="' + app.urlPrefix + 'Images/progress.gif" /><span  data-trans-key="در حال بارگذاری..."></span></div>');
            $.ajax(app.urlPrefix + "Charts/BarChart/GetChart?Id=" + option.chartId + "&ChartInPageId=" + option.ChartInPageId).done(function(data) {
                filter.data("data", data);
                var hierarchyHtml = null, ProvisionHtml = null, SeriesLevelHtml = null;
                function convertToUl(data, index) {
                    if (data != null) {
                        return "<ul class='sortable list-unstyled pointer' index='" + index + "'>" + data.map(function(item, i) {
                            if (!item.ShowFilter) {
                                return '<li value="' + item.Uniquename + '"> ' + item.Caption + "</li>";
                            }
                            return '<li value="' + item.Uniquename + '">  ' + item.Caption + '<span class="glyphicon glyphicon-filter icon-btn filter-member-dialog" style="float:left; margin-right:5px;"></span></li>';
                        }).join("") + "</ul>";
                    }
                    return "";
                }
                hierarchyHtml = convertToUl(data.Hierarchies, "Hierarchies");
                ProvisionHtml = convertToUl(data.Where, "Where");
                SeriesLevelHtml = convertToUl(data.SeriesLevel, "SeriesLevel");
                var table = '<table class="table chart-design" style="position:absolute;margin-bottom:0px; background-color:#fff;display:none; border-bottom:1px solid silver">                                         <tr class="active">                                             <th style="' + (SeriesLevelHtml == "" ? "display:none" : "") + '"><span data-trans-key="شاخص‌ها (ستون‌های عددی)" > </span> </th>                                             <th style="' + (hierarchyHtml == "" ? "display:none" : "") + '"><span data-trans-key="ابعاد (ستون‌های رشته‌ای)" > </span> </th>                                             <th style="' + (ProvisionHtml == "" ? "display:none" : "") + '"><span data-trans-key="شرط" > </span></th>                                         </tr>                                         <tr>                                             <td  style="' + (SeriesLevelHtml == "" ? "display:none" : "") + '"id="div-x" class="myc">' + SeriesLevelHtml + '</td>                                             <td  style="' + (hierarchyHtml == "" ? "display:none" : "") + '"id="div-y" class="myc">' + hierarchyHtml + '</td>                                             <td  style="' + (ProvisionHtml == "" ? "display:none" : "") + '"id="div-where" class="myc">' + ProvisionHtml + "</td>                                         </tr>                                     </table>";
                table = '<div style="position:relative; height:100%;"><div class="close-filter pointer" style="position:absolute; height:100%; width:100%;background-color:rgba(66, 66, 66, 0.368627); "></div>' + table + "</div>";
                filter.html(filterXSS(table));
                filter.find("table.chart-design").slideToggle({
                    done: function() {},
                    start: function(e) {
                        var end = e.tweens.filter(function(d) {
                            return d.prop == "height";
                        })[0].end;
                        changeHieght({
                            filter: end
                        });
                    }
                });
                filter.find(".close-filter").on("click", function() {});
                function onChange() {
                    function sortDataHierarchies(data, index) {
                        var array = data[index];
                        var newAr = [];
                        filter.find("ul[index=" + index + "] li").each(function(i, d) {
                            var Uniquename = $(this).attr("value");
                            var item = $.grep(array, function(d) {
                                return d.Uniquename == Uniquename;
                            })[0];
                            item.Members = $(this).data("members");
                            newAr.push(item);
                        });
                        data[index] = newAr;
                    }
                    sortDataHierarchies(data, "Hierarchies");
                    sortDataHierarchies(data, "Where");
                    sortDataHierarchies(data, "SeriesLevel");
                    option.onFilterChange(data);
                }
                filter.find(".filter-member-dialog").on("click", function() {
                    var el = $(this).parent();
                    var Uniquename = $(this).parent().attr("value");
                    var array = data[$(this).closest("ul").attr("index")];
                    var element = $.grep(array, function(d, i) {
                        return d.Uniquename == Uniquename;
                    })[0];
                    var members = $(this).parent().data("members");
                    var link = app.urlPrefix + "Charts/BarChart/GetMemberOfFilterHierarchy?Uniquename=" + Uniquename + "&Id=" + option.chartId + "&ChartInPageId=" + option.ChartInPageId;
                    if (typeof members == "undefined") {
                        $.ajax(link).done(function(d) {
                            $(this).parent().data("members", d);
                            showDialog(d, link);
                        });
                    } else {
                        showDialog(members, link);
                    }
                    function showDialog(members, link) {
                        app.helper.filterMemberDialog(members, link, function(mem) {
                            el.data("members", mem);
                            onChange();
                        });
                    }
                });
                filter.find(".sortable").sortable({
                    start: function(e, ui) {
                        ui.placeholder.addClass("filter-placeholder");
                        ui.placeholder.height(ui.item.height());
                        ui.placeholder.width(ui.item.width());
                        ui.placeholder.parent().width(ui.item.width());
                        ui.placeholder.parent().parent().width(ui.item.width());
                    },
                    stop: function(e, ui) {
                        onChange();
                    }
                });
            });
        }
        filter.slideToggle({
            done: function(ui, item) {
                app.lang.setLang({
                    selector: filter.selector
                });
            },
            start: function(e) {}
        });
    });
    if (!option.RemoveFromPage) obj.find(".title-move").css("cursor", "auto");
    return this;
};

d3.selection.prototype.legend = function(option, showPersian) {
    option.order = option.order || "horizental";
    option.colorPos = option.colorPos || "left";
    option.font = option.font || {};
    option.click = option.click || function() {};
    var divPad = 15;
    var st = {
        "top right": {
            "text-align": "right"
        },
        "top left": {
            "text-align": "left"
        },
        "top center": {
            "text-align": "center"
        },
        "bottom right": {
            "text-align": "right"
        },
        "bottom left": {
            "text-align": "left"
        },
        "bottom center": {
            "text-align": "center"
        },
        "center right": {
            "text-align": "right"
        },
        "center left": {
            "text-align": "right"
        }
    };
    var className = {
        "top right": "legend-top-right",
        "top left": "legend-top-left",
        "top center": "legend-top-center",
        "bottom right": "legend-bottom-right",
        "bottom left": "legend-bottom-left",
        "bottom center": "legend-bottom-center",
        "center right": "legend-center-right",
        "center left": "legend-center-left"
    };
    option.position = option.position || "top left";
    var style = {};
    var ul = this.append("div").attr("class", "legend-div temporal ").append("div").attr("class", "list-inline " + className[option.position]).styles(style);
    var items = ul.selectAll("nothingd").data(option.data).enter().append("span").style("font-size", option.font.fontSize || "9px").style("font-family", option.font.fontName || "IRANSans").style("font-weight", option.font.bold ? "bold" : "300" || "300").style("font-style", option.font.italic ? "italic" : "inherit" || "inherit").style("color", option.font.color || "#333333").attr("class", "pointer legend-item").on("click", function(d, i) {
        if (option.selector) {
            $(option.selector).trigger("legendClick", [ d.label, i, d ]);
        }
        option.click(d, i);
    });
    items.append("span").classed("text", true).text(function(d) {
        return persian(d.label, showPersian);
    });
    if (option.order === "vertical") {
        items.style("display", "block");
    }
    var colorItem;
    if (option.colorPos === "left") {
        colorItem = items.append("span");
    } else {
        colorItem = items.insert("span", ".text");
        items.style("text-align", "right");
    }
    colorItem.attr("class", "legend-color").style("background-color", function(d) {
        return d.color;
    }).style("-webkit-print-color-adjust", "exact");
    return ul;
};

d3.selection.prototype.breadcrumb = function(levels, settings, titlebar, showPersian) {
    var s = levels.slice(0);
    if (typeof s[0] !== "undefined" && s[0] !== null) {
        s.unshift(app.lang.translate("پاک کردن"));
    }
    var last = s[s.length - 1];
    s.splice(s.length - 1, 1);
    if (s.length > 0) {
        var callback = function(d, i) {
            var isFromCommentDialog = $("#" + settings.id).hasClass("fromCommentDialog");
            if (isFromCommentDialog) {
                return;
            }
            var isProgress = titlebar.isProgress;
            var showProgress = titlebar.showProgress;
            if (isProgress()) return;
            showProgress(true);
            var chartFilter = app.chartCommons.drillDown.up(settings.ChartInPageId, s.length - i);
            settings.parameters = {
                drillDown: chartFilter,
                isUp: true,
                upLevel: s.length - i,
                chartId: settings.chartId,
                ChartInPageId: settings.ChartInPageId
            };
            settings.drill = "up";
            app.chartCommons.levelTypeUtils.getParam(settings);
            $("#" + settings.id).charts(settings.type, "refreshWithData", settings);
        };
        var html = '<div class="ui mini breadcrumb floated right temporal">' + s.map(function(d) {
            return '<a class="section clickable">' + d + "</a>";
        }).join('<i class="' + (app.lang.isRtl() ? "left" : "right") + ' arrow icon divider"></i>') + '<i class="' + (app.lang.isRtl() ? "left" : "right") + ' arrow icon divider"></i><div class="section active">' + last + "</div></div>";
        $(this._groups[0][0]).append(html);
        $(this._groups[0][0]).find(".breadcrumb .clickable").each(function(i, d) {
            $(this).on("click", function() {
                callback(0, i);
            });
        });
        return;
    }
};

d3.selection.prototype.titlebar = function(option) {
    var title;
    var el = this;
    var $el = $(el._groups[0][0]);
    var isProgress = function() {
        return $el.find(".myprogress").css("visibility") == "visible";
    };
    var progress = $el.parents(".ui.card").find(".progress-overall");
    var showProgress = function(b) {
        if (b) {
            $el.find("*").attr("disabled", true);
            $el.find(".myprogress").css("visibility", "visible");
            progress.fadeIn();
        } else {
            $el.find("*").attr("disabled", false);
            $el.find(".myprogress").css("visibility", "hidden");
            progress.fadeOut();
        }
    };
    return {
        title: title,
        showProgress: showProgress,
        isProgress: isProgress
    };
};

var d3Utils = {
    prepareDataForBarChart: function(data, settings, seriesLabels, kpisLabels, seriesLabelsCaptions, kpisLabelsCaptions) {
        var colors = d3.scaleOrdinal(d3.schemeCategory10);
        $.each(data, function(i, item) {
            if (!item.kpis) return true;
            var tmpKpi = [];
            $.each(item.kpis, function(ii, d) {
                var p = settings.chartProp.series[kpisLabels[ii]] || settings.chartProp.series["default"];
                var c = colors(ii);
                if (typeof p == "undefined" && typeof model != "undefined") {
                    p = $.extend(true, {}, typeof model.seriesProp[kpisLabels[ii]] != "undefined" ? model.seriesProp[kpisLabels[ii]] : model.seriesProp.default);
                    p.seriesColor = colors(ii);
                }
                tmpKpi.push({
                    data: d,
                    prop: p,
                    key: kpisLabels[ii],
                    label: kpisLabelsCaptions && kpisLabelsCaptions.length > ii ? kpisLabelsCaptions[ii] : kpisLabels[ii],
                    type: "kpi",
                    seriesLable: kpisLabelsCaptions && kpisLabelsCaptions.length > ii ? kpisLabelsCaptions[ii] : kpisLabels[ii],
                    type: "kpi",
                    seriesKey: kpisLabels[ii],
                    category: item.label
                });
            });
            if (!item.series) return true;
            $.each(item.series, function(ii, d) {
                var p = settings.chartProp.series[seriesLabels[ii]];
                var cnd = d === "" || d === null || isNaN(d);
                var ctmpChild = {
                    type: "series",
                    data: cnd ? d : d * parseFloat(p.numberFactor),
                    prop: p,
                    key: seriesLabels[ii],
                    label: seriesLabelsCaptions && seriesLabelsCaptions.length > ii ? seriesLabelsCaptions[ii] : seriesLabels[ii],
                    seriesLable: seriesLabelsCaptions && seriesLabelsCaptions.length > ii ? seriesLabelsCaptions[ii] : seriesLabels[ii],
                    seriesKey: seriesLabels[ii],
                    category: item.label
                };
                ctmpChild.commentCount = app.chartCommons.commentUtils.getCommentCount(settings.input.comment, ctmpChild.category, ctmpChild.label);
                tmpKpi.push(ctmpChild);
            });
            item.series = tmpKpi;
        });
    },
    convertToKeyValue: function(input) {
        var seriesLabels = _.map(input.series.labels, function(d, i) {
            var hasCaption = input.seriesLablesCaptions && input.seriesLablesCaptions.length > i;
            return {
                key: d,
                value: hasCaption ? input.seriesLablesCaptions[i] : d
            };
        });
        var kpiLabels = _.map(input.kpis.labels, function(d, i) {
            var hasCaption = input.kpisLablesCaptions && input.kpisLablesCaptions.length > i;
            return {
                key: d,
                value: hasCaption ? input.kpisLablesCaptions[i] : d
            };
        });
        return {
            seriesLabels: seriesLabels,
            kpiLabels: kpiLabels
        };
    }
};

var app = app || {};

app.helper = app.helper || {};

(function() {
    var badForm = [ "ي", "إ", "ؤ", "أ", "ي", "ك" ];
    var normalForm = [ "ی", "ا", "و", "ا", "ی", "ک" ];
    function normalize(q) {
        for (var i = 0; i < q.length; i++) {
            for (var j = 0; j < badForm.length; j++) {
                if (q.charAt(i) === badForm[j]) q = q.replace(q.charAt(i), normalForm[j]);
            }
        }
        return q;
    }
    app.helper.filterMemberDialogOk = function() {
        var obj = $("#filter-member-dialog").data("data");
        $("#filter-member-dialog .li ").each(function(i, item) {
            var input = $(this).find("input");
            var member = $.grep(obj.members, function(d) {
                return d.Uniquename == input.attr("value");
            })[0];
            member.IsChecked = input.prop("checked");
        });
        obj.onfinish(obj.members);
        $("#filter-member-dialog").modal("hide");
    };
    app.helper.filterMemberDialog = function(members, link, onfinish) {
        var callback = function(e) {
            var winHeight = window.innerHeight;
            var modelHeight = $("#filter-member-dialog").outerHeight();
            var ulHeight = winHeight - modelHeight - 50;
            body = '<div class="ui form"><input type="text" class="form-control" id="filter-member-search" placeholder="جستجو"></div>                    <input id="select-all-member-filter" type="checkbox" style="margin-top:10px"/><label style="margin-right:5px;" for="select-all-member-filter"> همه </label>                    <div class="member-list"></div>';
            var el = $("#filter-member-dialog #filter-member-dialog-content");
            el.html(body);
            $("#select-all-member-filter").change(function() {
                var isChecked = this.checked;
                $("#filter-member-dialog .member-list .li input").filter(function() {
                    return $(this).is(":visible");
                }).prop("checked", isChecked);
            });
            setMembers(ulHeight, members, el);
            var timeout;
            $("#filter-member-dialog #filter-member-search").keyup(function() {
                var query = $(this).val().toLowerCase();
                query = normalize(query);
                if (link) {
                    if (query && query.length == 1) return;
                    clearTimeout(timeout);
                    timeout = setTimeout(function() {
                        $.ajax(link + "&query=" + query).done(function(d) {
                            var obj = $("#filter-member-dialog").data("data");
                            obj.members = d;
                            setMembers(ulHeight, d, el);
                        });
                    }, 400);
                } else {
                    $("#filter-member-dialog li").show();
                    $("#filter-member-dialog li").filter(function() {
                        var val = $(this).text().toLowerCase();
                        val = normalize(val);
                        return val.indexOf(query.toLowerCase()) == -1;
                    }).hide();
                }
            });
        };
        $("#filter-member-dialog").modal({
            onVisible: callback
        }).modal("show");
        function setMembers(ulHeight, members, el) {
            var body = '<div class=" " style="height:50vh; overflow:auto;"> ' + members.map(function(item, i) {
                return '<div class="li"><input value="' + item.Uniquename + '" type="checkbox" id="member-' + i + '" ' + (item.IsChecked ? " checked " : "") + ' /> <label class="unstyled-lable" for="member-' + i + '">' + item.Caption + "</label></div>";
            }).join("") + "</div>";
            el.find(".member-list").html(body);
            $("#filter-member-dialog").modal("refresh");
        }
        $("#filter-member-dialog").data("data", {
            members: members,
            onfinish: onfinish
        });
        $("#filter-member-dialog").modal("show");
    };
})($);

(function($) {
    function maybeCall(thing, ctx) {
        return typeof thing == "function" ? thing.call(ctx) : thing;
    }
    function Tipsy(element, options) {
        this.$element = $(element);
        this.options = options;
        this.enabled = true;
        this.fixTitle();
    }
    Tipsy.prototype = {
        show: function() {
            var title = this.getTitle();
            if (title && this.enabled) {
                var $tip = this.tip();
                $tip.find(".tipsy-inner")[this.options.html ? "html" : "text"](title);
                $tip[0].className = "tipsy";
                $tip.remove().css({
                    top: 0,
                    left: 0,
                    visibility: "hidden",
                    display: "block"
                }).prependTo(document.body);
                var pos = $.extend({}, this.$element.offset(), {
                    width: this.$element[0].offsetWidth || 0,
                    height: this.$element[0].offsetHeight || 0
                });
                if (typeof this.$element[0].nearestViewportElement == "object") {
                    var el = this.$element[0];
                    var rect = el.getBoundingClientRect();
                    pos.width = rect.width;
                    pos.height = rect.height;
                }
                var actualWidth = $tip[0].offsetWidth, actualHeight = $tip[0].offsetHeight, gravity = maybeCall(this.options.gravity, this.$element[0]);
                var tp;
                switch (gravity.charAt(0)) {
                  case "n":
                    tp = {
                        top: pos.top + pos.height + this.options.offset,
                        left: pos.left + pos.width / 2 - actualWidth / 2
                    };
                    break;

                  case "s":
                    tp = {
                        top: pos.top - actualHeight - this.options.offset,
                        left: pos.left + pos.width / 2 - actualWidth / 2
                    };
                    break;

                  case "e":
                    tp = {
                        top: pos.top + pos.height / 2 - actualHeight / 2,
                        left: pos.left - actualWidth - this.options.offset
                    };
                    break;

                  case "w":
                    tp = {
                        top: pos.top + pos.height / 2 - actualHeight / 2,
                        left: pos.left + pos.width + this.options.offset
                    };
                    break;

                  case "c":
                    tp = {
                        top: pos.top + pos.height / 2 - actualHeight / 2,
                        left: pos.left + pos.width / 2 - actualWidth / 2
                    };
                    break;
                }
                if (gravity.length == 2) {
                    if (gravity.charAt(1) == "w") {
                        tp.left = pos.left + pos.width / 2 - 15;
                    } else {
                        tp.left = pos.left + pos.width / 2 - actualWidth + 15;
                    }
                }
                $tip.css(tp).addClass("tipsy-" + gravity);
                $tip.find(".tipsy-arrow")[0].className = "tipsy-arrow tipsy-arrow-" + gravity.charAt(0);
                if (this.options.className) {
                    $tip.addClass(maybeCall(this.options.className, this.$element[0]));
                }
                if (this.options.fade) {
                    $tip.stop().css({
                        opacity: 0,
                        display: "block",
                        visibility: "visible"
                    }).animate({
                        opacity: this.options.opacity
                    });
                } else {
                    $tip.css({
                        visibility: "visible",
                        opacity: this.options.opacity
                    });
                }
                var t = this;
                var set_hovered = function(set_hover) {
                    return function() {
                        t.$tip.stop();
                        t.tipHovered = set_hover;
                        if (!set_hover) {
                            if (t.options.delayOut === 0) {
                                t.hide();
                            } else {
                                setTimeout(function() {
                                    if (t.hoverState == "out") t.hide();
                                }, t.options.delayOut);
                            }
                        }
                    };
                };
                $tip.hover(set_hovered(true), set_hovered(false));
            }
        },
        hide: function() {
            if (this.options.fade) {
                this.tip().stop().fadeOut(function() {
                    $(this).remove();
                });
            } else {
                this.tip().remove();
            }
        },
        fixTitle: function() {
            var $e = this.$element;
            if ($e.attr("title") || typeof $e.attr("original-title") != "string") {
                $e.attr("original-title", $e.attr("title") || "").removeAttr("title");
            }
            if (typeof $e.get(0).nearestViewportElement == "object") {
                if ($e.children("title").length) {
                    $e.append("<original-title>" + ($e.children("title").text() || "") + "</original-title>").children("title").remove();
                }
            }
        },
        getTitle: function() {
            var title, $e = this.$element, o = this.options;
            this.fixTitle();
            if (typeof o.title == "string") {
                var title_name = o.title == "title" ? "original-title" : o.title;
                if ($e.children(title_name).length) {
                    title = $e.children(title_name).html();
                } else {
                    title = $e.attr(title_name);
                }
            } else if (typeof o.title == "function") {
                title = o.title.call($e[0]);
            }
            title = ("" + title).replace(/(^\s*|\s*$)/, "");
            return title || o.fallback;
        },
        tip: function() {
            if (!this.$tip) {
                this.$tip = $('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>');
            }
            return this.$tip;
        },
        validate: function() {
            if (!this.$element[0].parentNode) {
                this.hide();
                this.$element = null;
                this.options = null;
            }
        },
        enable: function() {
            this.enabled = true;
        },
        disable: function() {
            this.enabled = false;
        },
        toggleEnabled: function() {
            this.enabled = !this.enabled;
        }
    };
    $.fn.tipsy = function(options) {
        if (options === true) {
            return this.data("tipsy");
        } else if (typeof options == "string") {
            var tipsy = this.data("tipsy");
            if (tipsy) tipsy[options]();
            return this;
        }
        options = $.extend({}, $.fn.tipsy.defaults, options);
        if (options.hoverlock && options.delayOut === 0) {
            options.delayOut = 100;
        }
        function get(ele) {
            var tipsy = $.data(ele, "tipsy");
            if (!tipsy) {
                tipsy = new Tipsy(ele, $.fn.tipsy.elementOptions(ele, options));
                $.data(ele, "tipsy", tipsy);
            }
            return tipsy;
        }
        function enter() {
            var tipsy = get(this);
            tipsy.hoverState = "in";
            if (options.delayIn === 0) {
                tipsy.show();
            } else {
                tipsy.fixTitle();
                setTimeout(function() {
                    if (tipsy.hoverState == "in") tipsy.show();
                }, options.delayIn);
            }
        }
        function leave() {
            var tipsy = get(this);
            tipsy.hoverState = "out";
            if (options.delayOut === 0) {
                tipsy.hide();
            } else {
                var to = function() {
                    if (!tipsy.tipHovered || !options.hoverlock) {
                        if (tipsy.hoverState == "out") tipsy.hide();
                    }
                };
                setTimeout(to, options.delayOut);
            }
        }
        if (options.trigger != "manual") {
            var binder = options.live ? "live" : "bind", eventIn = options.trigger == "hover" ? "mouseenter" : "focus", click = options.trigger == "hover" ? "click" : "blur", eventOut = options.trigger == "hover" ? "mouseleave" : "blur";
            this[binder](eventIn, enter)[binder](eventOut, leave)[binder](click, leave);
        }
        return this;
    };
    $.fn.tipsy.defaults = {
        className: null,
        delayIn: 0,
        delayOut: 0,
        fade: false,
        fallback: "",
        gravity: "n",
        html: false,
        live: false,
        offset: 0,
        opacity: .8,
        title: "title",
        trigger: "hover",
        hoverlock: false
    };
    $.fn.tipsy.elementOptions = function(ele, options) {
        return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
    };
    $.fn.tipsy.autoNS = function() {
        return $(this).offset().top > $(document).scrollTop() + $(window).height() / 2 ? "s" : "n";
    };
    $.fn.tipsy.autoWE = function() {
        return $(this).offset().left > $(document).scrollLeft() + $(window).width() / 2 ? "e" : "w";
    };
    $.fn.tipsy.autoBounds = function(margin, prefer) {
        return function() {
            var dir = {
                ns: prefer[0],
                ew: prefer.length > 1 ? prefer[1] : false
            }, boundTop = $(document).scrollTop() + margin, boundLeft = $(document).scrollLeft() + margin, $this = $(this);
            if ($this.offset().top < boundTop) dir.ns = "n";
            if ($this.offset().left < boundLeft) dir.ew = "w";
            if ($(window).width() + $(document).scrollLeft() - $this.offset().left < margin) dir.ew = "e";
            if ($(window).height() + $(document).scrollTop() - $this.offset().top < margin) dir.ns = "s";
            return dir.ns + (dir.ew ? dir.ew : "");
        };
    };
})(jQuery);

var app = app || {};

app.charts = app.charts || {};

app.charts.bar = {};

app.charts.bar.draw = function(input, settings, refreshWithData, titlebar) {
    var useComment = false;
    settings.input = input;
    var chartTitle = input.title;
    var chartInfo = input.chartInfo;
    app.chartCommons.calculateFields(input.series, settings.calculatedFields);
    var seriesLabels = typeof input.series != "undefined" ? input.series.labels : [];
    var kpisLabels = typeof input.kpis != "undefined" ? input.kpis.labels : [];
    var seriesLabelsCaptions = input.seriesLablesCaptions;
    var kpisLabelsCaptions = input.kpisLablesCaptions;
    var selector = "#" + settings.id;
    var isFromCommentDialog = $(selector).hasClass("fromCommentDialog");
    var margin = {
        top: 20,
        right: 20,
        bottom: 40,
        left: 20
    };
    var width = $(selector).width();
    var barHeight = settings.chartProp.info.chartSize == "small" ? 80 : settings.chartProp.info.chartSize == "medium" ? 130 : settings.chartProp.info.chartSize == "large" ? 160 : settings.chartProp.info.chartSize == "veryLarge" ? 200 : 130;
    var animate = app.mobileMode ? false : true;
    var hasHref = settings.chartProp.info.openDashboard && settings.chartProp.info.openDashboard.checked;
    var showPersian = typeof input.lang == "undefined" ? true : +input.lang == 0 ? true : false;
    var height = barHeight + margin.top + margin.bottom;
    var colors = d3.scaleOrdinal(d3.schemeCategory10);
    var isProgress = titlebar.isProgress;
    var showProgress = titlebar.showProgress;
    var title = titlebar.title;
    var getFormatString = function(prop, backup) {
        if (!prop) return ",.2f";
        var p = prop;
        if (!prop.formatString) {
            if (!backup) return ",.2f";
            p = backup;
        }
        return p.formatString != "custom" ? p.formatString : p.formatStringCustom;
    };
    var stacked = +settings.chartProp.info.stackedBar;
    var isStack = stacked == 3 || stacked == 2 ? true : false;
    var isStackPercent = stacked == 3 ? true : false;
    var stackedLine = +settings.chartProp.info.stackedLine;
    var isStackLine = stackedLine == 3 || stackedLine == 2 ? true : false;
    var isStackLinePercent = stackedLine == 3 ? true : false;
    app.chartCommons.setDefault(settings.chartProp, kpisLabels.concat(seriesLabels), "bar");
    if (!input.result) {
        $("#" + settings.id).append(app.chartCommons.getError(input));
        return;
    }
    var data = prepareData(input, settings.chartProp);
    var needAnimation = data.length < 25;
    var cc = d3.scaleOrdinal(d3.schemeCategory10);
    var pushedColor = [];
    for (var i = 0; i < seriesLabels.length; i++) {
        var p = settings.chartProp.series[seriesLabels[i]];
        if (typeof p == "undefined") {
            if (settings.chartProp.series.length == 0) {
                p = {
                    seriesColor: "#1F77B4",
                    seriesType: "bar",
                    formatStringCustom: ",.2f",
                    formatString: ",.2f",
                    numberFactor: "1",
                    showValues: false,
                    hidden: false,
                    cumulative: false,
                    lineFace: "5,0",
                    lineWeight: "2",
                    lineStyle: "linear",
                    lineType: "line-dot-area",
                    showValueColor: "#333333"
                };
            } else {
                p = $.extend({}, settings.chartProp.series[Object.keys(settings.chartProp.series)[0]]);
            }
            var color = "#1F77B4";
            for (var i = 0; i < 10; i++) {
                color = cc(i) || "#1f77b4";
                if (pushedColor.indexOf(color.toLowerCase()) == -1) break;
            }
            p.seriesColor = color;
            p.name = null;
            settings.chartProp.series[seriesLabels[i]] = p;
        }
        if (!p.font || p.datasourceType) p.font = {
            bold: false,
            color: p.showValueColor || "#333333",
            italic: false,
            fontSize: p.showValueFontSize || "12px",
            fontName: "Droid"
        };
        pushedColor.push(p.seriesColor.toLowerCase());
    }
    d3Utils.prepareDataForBarChart(data, settings, seriesLabels, kpisLabels, seriesLabelsCaptions, kpisLabelsCaptions);
    _.each(data, function(d) {
        _.each(d.series, function(s, i) {
            s.sIndex = i;
        });
    });
    var s = seriesLabels;
    if (settings.chartProp.info.isBox) {
        data = _.map(data, function(item) {
            var out = [];
            for (var i = 0; i < item.series.length / 6; i++) {
                var row = item.series[i * 6 + 0];
                row.box = {
                    q1: item.series[i * 6 + 0],
                    q2: item.series[i * 6 + 1],
                    q3: item.series[i * 6 + 2],
                    min: item.series[i * 6 + 3],
                    max: item.series[i * 6 + 4],
                    avg: item.series[i * 6 + 5]
                };
                out.push(row);
            }
            item.series = out;
            return item;
        });
        s = _.filter(seriesLabels, function(d, i) {
            return i % 6 === 0;
        });
    }
    if (settings.editMode) {
        $(selector).trigger("chartproperty", [ kpisLabels.concat(s) ]);
        $(selector).trigger("dimColor", [ _.map(input.matrix, function(d) {
            return d.values.join("-");
        }) ]);
    }
    var tempData = null;
    for (var i = 0; i < data.length; i++) {
        if (!tempData) tempData = new Array(data.length);
        for (var j = 0; j < data[i].series.length; j++) {
            if (!tempData[i]) tempData[i] = new Array(data[i].series.length);
            tempData[i][j] = tempData[i][j] || {
                sum: null,
                avg: null,
                "var": null
            };
            if (data[i].series[j].prop && data[i].series[j].prop.cumulative) {
                if (typeof data[i].series[j].prop.cumulative_formula == "undefined" || data[i].series[j].prop.cumulative_formula == "sum") {
                    tempData[i][j].sum = d3.sum(data.filter(function(d, index) {
                        return index <= i;
                    }), function(d, i) {
                        return d.series[j].data;
                    });
                }
                if (data[i].series[j].prop.cumulative_formula == "avg") {
                    tempData[i][j].avg = d3.mean(data.filter(function(d, index) {
                        return index <= i;
                    }), function(d, i) {
                        return d.series[j].data;
                    });
                }
                if (data[i].series[j].prop.cumulative_formula == "var") {
                    tempData[i][j].var = d3.variance(data.filter(function(d, index) {
                        return index <= i;
                    }), function(d, i) {
                        return d.series[j].data;
                    });
                }
                if (data[i].series[j].data == null && data[i].series[j].prop.dontShowZeroValue) {
                    tempData[i][j].sum = null;
                    tempData[i][j].avg = null;
                    tempData[i][j].var = null;
                }
            }
        }
    }
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].series.length; j++) {
            if (data[i].series[j].prop && data[i].series[j].prop.cumulative) {
                data[i].series[j].data = tempData[i][j].var || tempData[i][j].sum || tempData[i][j].avg;
            }
        }
    }
    if (isStackPercent) {
        data.forEach(function(item) {
            var bars = item.series.filter(function(d, i) {
                return !d.prop.hidden && d.prop.seriesType == "bar";
            });
            var sum = d3.sum(bars.map(function(d) {
                return Math.abs(d.data);
            }));
            bars.forEach(function(d) {
                d.data = d.data / sum * 100;
            });
        });
    }
    $(selector).addClass("bar-line-chart");
    var legendBar = d3.select(selector).append("div").attr("class", "legend-bar temporal");
    var sort;
    var sortSelector;
    sort = d3.select(selector).select("#sort_checkbox_btn");
    sortSelector = d3.select(selector).select("#sort_checkbox select");
    if (!sort._groups[0][0] && data.length > 0) {
        var sortDiv = legendBar.append("div").attr("id", "sort_checkbox").attr("class", "sort-checkbox");
        sort = sortDiv.append("label").append("input").attr("type", "checkbox").attr("id", "sort_checkbox_btn");
        sortDiv.select("label").append("span");
        app.lang.translateAsync("sort", function(t) {
            var label = $(sortDiv._groups[0][0]).find("span");
            label.html(" " + t);
        });
        var sortSelector = sortDiv.append("select").on("change", function() {
            var is = sort.property("checked");
            settings.isSort = is;
            if (sort.property("checked")) change();
        }).style("margin", "0 7px");
        if (kpisLabels.length + seriesLabels.length == 1) {
            sortSelector.style("visibility", "hidden").style("width", "1px");
        }
        sortSelector.selectAll("nothings").data(data[0].series.filter(function(d, i) {
            return !d.prop.hidden;
        }).map(function(d) {
            return {
                name: (d.prop.name || d.label).replace(/^\[measure\]/, ""),
                value: d.label
            };
        })).enter().append("option").text(function(d) {
            return persian(d.name, showPersian);
        }).attr("value", function(d) {
            return d.value;
        });
    }
    if (typeof settings.chartProp.info.showSortBox != "undefined" && !settings.chartProp.info.showSortBox) {
        $(selector + " #sort_checkbox").hide();
    }
    legendBar.breadcrumb(input.levels, settings, titlebar, showPersian);
    if (!input.matrix || input.matrix.length == 0) {
        legendBar.append("div").attr("class", "temporal").style("font-size", "0.8em").style("margin", "15px").append("span").attr("class", "translate").attr("data-trans-key", "داده‌ای برای نمایش وجود ندارد").text("داده‌ای برای نمایش وجود ندارد");
        return;
    }
    if (settings.chartProp.info.showLegends || typeof settings.chartProp.info.showLegends == "undefined") legendBar.legend({
        width: width,
        font: settings.chartProp.info.legendFont,
        position: settings.chartProp.info.legendPosition,
        selector: selector,
        data: data[0].series.filter(function(d, i) {
            return !d.prop.hidden;
        }).map(function(d) {
            return {
                label: (d.prop.name || d.label).replace(/^\[measure\]/, ""),
                color: d.prop.seriesColor,
                key: d.key,
                sIndex: d.sIndex
            };
        }),
        click: function(d) {
            if (!settings.editMode) $(selector + " .series-" + d.sIndex).fadeToggle();
        }
    }, showPersian);
    if (settings.chartProp.indicatorLegendShow) {
        legendBar.legend({
            order: "horizental",
            width: width,
            font: settings.chartProp.indicatorLegendFont,
            position: settings.chartProp.info.legendPosition,
            selector: selector,
            data: _.map(settings.chartProp.indicator, function(d, i) {
                var then = _.find(d.thenRow, {
                    operand: "1"
                });
                var color = then ? then.secondFieldColor : "#eeeeee";
                var title = d.title || app.chartCommons.indicator.ifToString(d.ifRow, input.series.labels, input.seriesLablesCaptions, settings);
                return {
                    label: title,
                    color: color
                };
            })
        }, showPersian);
    }
    var svg = null;
    if (_.indexOf([ "bottom left", "bottom right", "bottom center" ], settings.chartProp.info.legendPosition) != -1) {
        svg = d3.select(selector).insert("svg", ":first-child").attr("class", "temporal line-chart");
    } else {
        svg = d3.select(selector).append("svg").attr("class", "temporal line-chart");
    }
    var max = d3.max(data, function(d) {
        return d3.max(d.series.filter(function(d, i) {
            return !d.prop.hidden;
        }), function(d) {
            if (d.type == "kpi") {
                return d3.max(d.data);
            }
            if (d.type == "series") {
                return +d.data || 0;
            }
        });
    });
    var min = d3.min(data, function(d) {
        return d3.min(d.series.filter(function(d, i) {
            return !d.prop.hidden;
        }), function(d) {
            if (d.type == "kpi") {
                return d3.min(d.data);
            }
            if (d.type == "series") {
                return +d.data || 0;
            }
        });
    });
    if (settings.chartProp.info.isBox) {
        max = d3.max(data, function(d) {
            return d3.max(d.series.filter(function(d, i) {
                return !d.prop.hidden;
            }), function(d) {
                return d3.max([ d.box.q1.data, d.box.q2.data, d.box.q3.data, d.box.min.data, d.box.max.data, d.box.avg.data ]);
            });
        });
        min = d3.min(data, function(d) {
            return d3.min(d.series.filter(function(d, i) {
                return !d.prop.hidden;
            }), function(d) {
                return d3.min([ d.box.q1.data, d.box.q2.data, d.box.q3.data, d.box.min.data, d.box.max.data, d.box.avg.data ]);
            });
        });
    }
    if (isStack) {
        var maxStack = d3.max(data, function(d) {
            return d3.sum(d.series.filter(function(d, i) {
                return !d.prop.hidden && d.prop.seriesType == "bar";
            }), function(d) {
                if (d.type == "kpi") {
                    return d3.max(d.data);
                }
                if (d.type == "series") {
                    return d.data > 0 ? d.data : 0;
                }
            });
        });
        max = maxStack > max ? maxStack : max;
        var minStack = d3.min(data, function(d) {
            return d3.sum(d.series.filter(function(d, i) {
                return !d.prop.hidden;
            }), function(d) {
                if (d.type == "kpi") {
                    return d3.min(d.data);
                }
                if (d.type == "series") {
                    return d.data < 0 ? d.data : 0;
                }
            });
        });
        min = minStack < min ? minStack : min;
    }
    if (isStackLine) {
        var maxStack = d3.max(data, function(d) {
            return d3.sum(d.series.filter(function(d, i) {
                return !d.prop.hidden && d.prop.seriesType == "line";
            }), function(d) {
                if (d.type == "kpi") {
                    return d3.max(d.data);
                }
                if (d.type == "series") {
                    return d.data > 0 ? d.data : 0;
                }
            });
        });
        max = maxStack > max ? maxStack : max;
        var minStack = d3.min(data, function(d) {
            return d3.sum(d.series.filter(function(d, i) {
                return !d.prop.hidden;
            }), function(d) {
                if (d.type == "kpi") {
                    return d3.min(d.data);
                }
                if (d.type == "series") {
                    return d.data < 0 ? d.data : 0;
                }
            });
        });
        min = minStack < min ? minStack : min;
    }
    function calcMinMax(min, max) {
        if (!settings.chartProp.info.yAxisAuto) {
            if (min > 0) min = 0;
        }
        if (min == max) {
            if (min < 0) max = 0;
            if (min > 0) min = 0;
        }
        min = min == 0 ? 0 : min - Math.abs(.25 * (max - min));
        max = max + Math.abs(.25 * (max - min));
        return {
            min: min,
            max: max
        };
    }
    var tMinMax = calcMinMax(min, max);
    min = tMinMax.min;
    max = tMinMax.max;
    var barCount = data[0].series.filter(function(d) {
        return d.type == "series" && d.prop.seriesType == "bar" && !d.prop.hidden;
    }).length;
    var lineCount = data[0].series.filter(function(d) {
        return d.type == "series" && d.prop.seriesType == "line" && !d.prop.hidden;
    }).length;
    if (isStackLinePercent && lineCount > 0 || isStackPercent && barCount > 0) {
        max = 100;
        min = min < 0 ? -100 : 0;
    }
    if (settings.chartProp.info.yAxisMax) {
        max = +settings.chartProp.info.yAxisMax;
    }
    if (settings.chartProp.info.yAxisMin) {
        min = +settings.chartProp.info.yAxisMin;
    }
    var xAxisLen = +settings.chartProp.info.xAxisLen || 20;
    if (!settings.chartProp.info.font) settings.chartProp.info.font = {
        bold: false,
        color: "#333333",
        italic: false,
        fontSize: "12px",
        fontName: "Droid"
    };
    var xTrimLen = 50;
    var step = data.length / xTrimLen;
    var sample = function(d, i) {
        if (data.length < 35) return true;
        if (data.length <= xTrimLen) return true;
        if (i === 0) this.meter = 0;
        if (i >= this.meter) {
            this.meter += step;
            return true;
        }
        return false;
    };
    function getRotate() {
        return app.lang.isRtl() ? "rotate(-90)" : "rotate(-90)";
    }
    var xAxisLableWidth = 30;
    app.dashboardLayoutVersion = app.dashboardLayoutVersion || 2;
    if (app.dashboardLayoutVersion === 2) {
        var xtemp = d3.scaleBand().range([ width - 400, width ]).paddingInner(.1);
        xtemp.domain(data.map(function(d) {
            return d.label + "#" + d.index;
        }).filter(sample));
        var xAxis = d3.axisBottom(xtemp).tickFormat(function(str) {
            var s = str.replace(new RegExp("#\\d+$"), "");
            return (s.length > xAxisLen ? "..." : "") + persian(s.substring(0, xAxisLen), showPersian);
        });
        var xx = d3.select(selector).append("svg");
        xx.append("g").attr("class", "x axis").call(xAxis);
        xx.selectAll("g text").attr("transform", getRotate()).attr("x", "-1em").attr("dy", "0.1em").attr("y", "0").attr("fill", settings.chartProp.info.font.color).attr("class", "axes-x-label").style("font-family", settings.chartProp.info.font.fontName).style("font-size", settings.chartProp.info.font.fontSize).style("font-weight", settings.chartProp.info.font.bold ? "bold" : "normal").style("font-style", settings.chartProp.info.font.italic ? "italic" : "normal").append("title").text(function(d) {
            return persian(d.replace(new RegExp("#\\d+$"), ""), showPersian);
        });
        var c = xx.node();
        var box = c.getBBox();
        try {
            xAxisLableWidth = xx.selectAll("text")._groups[0][1].getBBox().height;
        } catch (e) {}
        var titleHeight = $(selector + " .title").outerHeight() || 0;
        var lb = $(selector + " .legend-bar");
        var legendHeight = typeof lb == "undefined" ? 0 : lb.height() + +lb.css("margin-top").replace("px", "");
        xx.remove();
        barHeight = $(selector).height() - titleHeight - box.height - margin.bottom - legendHeight;
        if (barHeight < 50) barHeight = 50;
        svg.attr("width", width).attr("height", barHeight + box.height + margin.bottom);
    }
    var y = d3.scaleLinear().range([ barHeight + margin.top, margin.top ]).domain([ min, max ]);
    var secondaryY = _.extend({
        enable: false,
        ticksType: "auto",
        ticksCount: 10,
        ticksSpace: 20,
        measures: {},
        font: {
            bold: false,
            color: "#333333",
            italic: false,
            fontSize: "10px",
            fontName: "IRANSans",
            formatString: settings.chartProp.info.formatString || ",.2f",
            formatStringCustom: ",.2f"
        }
    }, settings.chartProp.info.secondaryY);
    if (isStack || isStackLine) {
        secondaryY.enable = false;
    }
    if (secondaryY.enable) {
        var y2Max = d3.max(data, function(d) {
            return d3.max(d.series.filter(function(d, i) {
                return !d.prop.hidden && secondaryY.measures[d.seriesKey] === true;
            }), function(d) {
                if (d.type == "kpi") {
                    return d3.max(d.data);
                }
                if (d.type == "series") {
                    return +d.data || 0;
                }
            });
        });
        var y2Min = d3.min(data, function(d) {
            return d3.min(d.series.filter(function(d, i) {
                return !d.prop.hidden && secondaryY.measures[d.seriesKey] === true;
            }), function(d) {
                if (d.type == "kpi") {
                    return d3.min(d.data);
                }
                if (d.type == "series") {
                    return +d.data || 0;
                }
            });
        });
        var tMinMax = calcMinMax(y2Min, y2Max);
        y2Min = tMinMax.min;
        y2Max = tMinMax.max;
        var y2 = d3.scaleLinear().range([ barHeight + margin.top, margin.top ]).domain([ y2Min, y2Max ]);
    }
    if (settings.chartProp.info.formatString == "%") settings.chartProp.info.formatString = ".0%";
    settings.chartProp.info.fontYaxe = _.extend({
        bold: false,
        color: "#333333",
        italic: false,
        fontSize: "10px",
        fontName: "IRANSans",
        formatString: settings.chartProp.info.formatString || ",.2f",
        formatStringCustom: ",.2f"
    }, settings.chartProp.info.fontYaxe);
    var yAxis = d3.axisLeft(y).tickFormat(function(d) {
        var format = d3.format(settings.chartProp.info.fontYaxe.formatString);
        return persian(format(d), showPersian) + "";
    });
    var AxeY = _.extend({
        ticksType: "auto",
        ticksCount: 10,
        ticksSpace: 20
    }, settings.chartProp.info.AxeY);
    var tic = Math.floor(barHeight / 22) + 1;
    if (AxeY.ticksType === "count") {
        tic = AxeY.ticksCount;
    }
    if (AxeY.ticksType === "space") {
        tic = Math.floor(barHeight / AxeY.ticksSpace) + 1;
    }
    yAxis.ticks(tic);
    var yElement = svg.append("g").attr("class", "y axis").attr("transform", "translate(-10,0)");
    yElement.call(yAxis);
    yElement.selectAll(".tick text").attr("fill", settings.chartProp.info.fontYaxe.color).styles({
        "font-size": settings.chartProp.info.fontYaxe.fontSize,
        "font-family": settings.chartProp.info.fontYaxe.fontName,
        "font-weight": settings.chartProp.info.fontYaxe.bold ? "bold" : "normal",
        "font-style": settings.chartProp.info.fontYaxe.italic ? "italic" : "normal"
    });
    var yAxisBox = yElement._groups[0][0].getBBox();
    var y2AxisBox = {};
    if (secondaryY.enable) {
        var y2Axis = d3.axisRight(y2).tickFormat(function(d) {
            var format = d3.format(secondaryY.font.formatString);
            return persian(format(d), showPersian) + "";
        });
        var tic = Math.floor(barHeight / 22) + 1;
        if (secondaryY.ticksType === "count") {
            tic = secondaryY.ticksCount;
        }
        if (secondaryY.ticksType === "space") {
            tic = Math.floor(barHeight / secondaryY.ticksSpace) + 1;
        }
        y2Axis.ticks(tic);
        var y2Element = svg.append("g").attr("class", "y2 axis").attr("transform", "translate(-10,0)");
        y2Element.call(y2Axis);
        y2Element.selectAll(".tick text").attr("fill", secondaryY.font.color).styles({
            "font-size": secondaryY.font.fontSize,
            "font-family": secondaryY.font.fontName,
            "font-weight": secondaryY.font.bold ? "bold" : "normal",
            "font-style": secondaryY.font.italic ? "italic" : "normal"
        });
        y2AxisBox = y2Element._groups[0][0].getBBox();
    }
    var barWidth = width - yAxisBox.width - (y2AxisBox.width || 0) - margin.left;
    data = data.filter(function(d, i) {
        return i < barWidth - 2 - barWidth * .1;
    });
    var range = [ width - barWidth - (y2AxisBox.width || 0) + 10, width - 10 - (y2AxisBox.width || 0) ];
    var innerPad = .1;
    var outterPad = data.length == 1 ? 1 : data.length < 5 ? .5 : 0;
    var barsCharts = data[0].series.filter(function(d, i) {
        return !d.prop.hidden && d.prop.seriesType == "bar";
    });
    if (barsCharts.length == 0) outterPad = 0;
    yElement.attr("transform", "translate(" + (yAxisBox.width + margin.left) + ",0)");
    if (secondaryY.enable) {
        y2Element.attr("transform", "translate(" + (barWidth + margin.left + yAxisBox.width) + ",0)");
    }
    var tmpBar = $.grep(data[0].series, function(d, i) {
        return d.prop.seriesType == "bar" && !d.prop.hidden;
    });
    var tmpLine = $.grep(data[0].series, function(d, i) {
        return d.prop.seriesType == "line" && !d.prop.hidden;
    });
    var x = d3.scaleBand().range(range).paddingInner(innerPad).paddingOuter(outterPad);
    x.domain(data.map(function(d) {
        return d.label + "#" + d.index;
    }));
    var x0 = d3.scaleBand().range([ 0, x.bandwidth() ]).domain($.map(tmpBar, function(d) {
        return d.label;
    }));
    var xtrim = d3.scaleBand().range(range).paddingInner(innerPad).paddingOuter(outterPad);
    xTrimLen = Math.abs(range[0] - range[1]) / xAxisLableWidth;
    step = data.length / xTrimLen;
    xtrim.domain(data.map(function(d) {
        return d.label + "#" + d.index;
    }).filter(sample));
    var xAxis = d3.axisBottom(xtrim).tickFormat(function(str) {
        var s = str.replace(new RegExp("#\\d+$"), "");
        return (s.length > xAxisLen ? "..." : "") + persian(s.substring(0, xAxisLen), showPersian);
    });
    svg.append("svg:rect").attr("class", "background").style("fill", "white").style("opacity", "0").attr("width", barWidth).attr("height", +svg.attr("height")).attr("transform", "translate(" + (width - barWidth) + ",0)").on("click", function(d, i) {
        if (isFromCommentDialog) {
            return;
        }
        if (input.levels == "") return;
        if (isProgress()) return;
        showProgress(true);
        settings.isSort = sort.property("checked");
        app.chartCommons.drillDown.up(settings.ChartInPageId);
        settings.parameters = {
            isUp: true,
            chartId: settings.chartId,
            ChartInPageId: settings.ChartInPageId,
            notEditMode: !settings.editMode
        };
        app.chartCommons.levelTypeUtils.getParam(settings);
        $(selector).charts(settings.type, "refreshWithData", settings);
    });
    if (settings.chartProp.info.horizontalLines) svg.select(".y.axis").selectAll("g line").attr("x2", barWidth).attr("x1", "-6").style("opacity", "0.1");
    svg.select(".y.axis").append("text").attr("transform", "translate(0," + margin.top + ") " + getRotate()).attr("y", 6).attr("dy", ".71em").attr("class", "axes-x-label").text("");
    var flag = settings.chartProp.globalvariable && settings.chartProp.globalvariable.length > 0 && !settings.editMode && settings.chartProp.globalvariable.filter(function(d) {
        return d.field == input.CurrentDimName;
    }).length > 0;
    svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + (barHeight + margin.top) + ")").call(xAxis);
    var t = svg.select(".x.axis").selectAll("g text").attr("class", "axes-x-label").attr("x", "-1em").attr("dy", "0.1em").attr("y", "0").style("font-family", settings.chartProp.info.font.fontName).style("font-size", settings.chartProp.info.font.fontSize).attr("fill", settings.chartProp.info.font.color).style("font-weight", settings.chartProp.info.font.bold ? "bold" : "normal").style("font-style", settings.chartProp.info.font.italic ? "italic" : "normal");
    svg.select(".x.axis").selectAll("g").append("title").text(function(d) {
        return persian(d.replace(new RegExp("#\\d+$"), ""), showPersian);
    });
    var maxC = d3.max(t._groups[0], function(d) {
        return d.getBBox().width;
    });
    var maxLen = t._groups[0].length * maxC;
    var xRotate = maxLen > barWidth;
    xRotate = true;
    if (xRotate) t.attr("transform", getRotate());
    var onClickCalback = function(d, i) {
        $(".tipsy").remove();
        if (isFromCommentDialog) {
            return;
        }
        if (settings.chartProp.globalvariable && settings.chartProp.globalvariable.length > 0 && !settings.editMode) {
            app.globalVariableHelper.updateGlobalVariables([ input.CurrentDimName ], [ d.value ], settings.chartProp.globalvariable);
            $(selector + " .gd.selected-item").attr("class", $(this).attr("class").replace("selected-item", ""));
            $(selector + " .circle.selected-item").attr("class", $(this).attr("class").replace("selected-item", ""));
            $(this).attr("class", $(this).attr("class") + " selected-item");
        }
        if (!d.canDrill) {
            if (hasHref && !settings.editMode) {
                app.chartCommons.openLink(settings.chartProp.info.openDashboard, {
                    ChartInPageId: settings.ChartInPageId,
                    DataSourceId: settings.input.DataSourceId,
                    dimensionName: settings.input.dimensionName,
                    value: d.value,
                    refreshDatasource: settings.input.RefreshDatasource
                });
            }
            return;
        }
        if (isProgress()) return;
        showProgress(true);
        var is = sort.property("checked");
        settings.isSort = is;
        app.chartCommons.drillDown.add(settings.ChartInPageId, settings.input.DataSourceId, settings.input.CurrentDimName, d.onClickVal, settings.input.RefreshDatasource);
        settings.parameters = {
            selectedItem: d.onClickVal,
            chartId: settings.chartId,
            ChartInPageId: settings.ChartInPageId,
            notEditMode: !settings.editMode
        };
        app.chartCommons.levelTypeUtils.getParam(settings);
        $(selector).charts(settings.type, "refreshWithData", settings);
    };
    var chart = svg.append("g").attr("class", "charts");
    var g = chart.selectAll(".gd").data(data).enter().append("g").attr("transform", "translate(" + x(data[0].label + "#" + data[0].index) + ",0)").attr("class", function(d) {
        return "gd " + (d.onClickVal != "" || d.canDrill || flag || hasHref ? " pointer" : "");
    }).on("click", onClickCalback);
    function checkRow(ifObj, fields, headers) {
        var Index = headers.indexOf(ifObj.firstField);
        var firstVal = fields[Index];
        var secVal = ifObj.secondFieldIsText ? ifObj.secondFieldInput : fields[headers.indexOf(ifObj.secondFieldSelect)];
        firstVal = depersian(firstVal);
        secVal = depersian(secVal);
        if (!isNaN(secVal)) secVal = +secVal;
        if (!isNaN(firstVal)) firstVal = +firstVal;
        switch (+ifObj.operand) {
          case 1:
            return firstVal == secVal;

          case 2:
            return firstVal != secVal;

          case 3:
            return firstVal > secVal;

          case 4:
            return firstVal >= secVal;

          case 5:
            return firstVal < secVal;

          case 6:
            return firstVal <= secVal;

          case 7:
            return firstVal.indexOf(secVal) > -1;

          case 8:
            return firstVal.indexOf(secVal) <= -1;

          default:        }
    }
    var calc = {
        lastTexts: [],
        clear: function() {
            this.lastTexts = [];
        },
        noConfilict: function(w, h, xMap, y) {
            var noConfilict = true;
            for (var j = 0; j < this.lastTexts.length; j++) {
                var last = this.lastTexts[j];
                noConfilict = xMap + x.bandwidth() / 2 - w / 2 > last.x + 3 || last.y - last.h - 3 > y || last.y < y - h - 3;
                if (!noConfilict) break;
            }
            if (noConfilict) {
                if (this.lastTexts.length >= 5) this.lastTexts.shift();
                this.lastTexts.push({
                    x: xMap + w / 2,
                    y: y,
                    h: h
                });
            }
            return noConfilict;
        }
    };
    function pushThenRow(ret, values, headers) {
        if (settings.chartProp.indicator) {
            settings.chartProp.indicator.forEach(function(ind) {
                var isTrue = true;
                $.each(ind.ifRow, function(i, d) {
                    if (!checkRow(d, values, headers)) {
                        isTrue = false;
                        return false;
                    }
                });
                if (isTrue) {
                    ret.map(function(d) {
                        d.thenRows = d.thenRows || [];
                        d.thenRows.push(ind.thenRow);
                        return d;
                    });
                }
            });
        }
    }
    var recOverlap = settings.chartProp.info.overlapBars || false;
    var isbox = settings.chartProp.info.isBox;
    function getColor(d, i, def) {
        var dimColor = settings.chartProp.info.dimColor = settings.chartProp.info.dimColor || {};
        if (dimColor.enable) {
            var c = dimColor.data[d.category.join("-")];
            c = c || {};
            return c.color || def;
        }
        return def;
    }
    if (!isStack && !isbox) {
        var gg = g.selectAll("nothings").data(function(d) {
            var ret = d.series.filter(function(d) {
                return d.type == "series" && d.prop.seriesType == "bar" && !d.prop.hidden;
            });
            var headers = d.series.map(function(d) {
                return d.label;
            });
            var values = d.series.map(function(d) {
                return d.data;
            });
            pushThenRow(ret, values, headers);
            return ret;
        }).enter().append("g").attr("class", function(d) {
            return "series " + "series-" + d.sIndex;
        }).attr("transform", function(d, i) {
            return recOverlap ? "" : "translate(" + x0(d.label) + ",0)";
        });
        gg.append("rect").attr("sss", "xxxs").attr("width", recOverlap ? x.bandwidth() : x0.bandwidth()).attr("fill", function(d, i) {
            var color = getColor(d, i, d.prop.seriesColor);
            if (d.thenRows) {
                $.each(d.thenRows, function(i, thenRow) {
                    $.each(thenRow, function(i, thenRowItem) {
                        if (d.label != thenRowItem.firstField) return true;
                        switch (+thenRowItem.operand) {
                          case 1:
                            color = thenRowItem.secondFieldColor;
                            break;
                        }
                    });
                });
            }
            return color;
        }).attr("y", function(d) {
            var yFun = y;
            if (secondaryY.enable && secondaryY.measures[d.seriesKey] == true) {
                yFun = y2;
            }
            return d.data >= 0 ? yFun(d.data > max ? max : d.data) : yFun(Math.min(0, max));
        }).attr("height", function(d) {
            var yFun = y;
            if (secondaryY.enable && secondaryY.measures[d.seriesKey] == true) {
                yFun = y2;
            }
            var h = d.data > 0 ? yFun(Math.max(0, min)) - yFun(d.data > max ? max : d.data) : yFun(d.data < min ? min : d.data) - yFun(Math.min(0, max));
            return h;
        }).on("click", function(d) {
            if (isFromCommentDialog) {
                app.chartCommons.commentUtils.clickOnCommentIcon(d, settings.ChartInPageId);
            }
        });
        app.chartCommons.commentUtils.addCommentIcon(settings.ChartInPageId, gg, function(d) {
            return recOverlap ? x.bandwidth() / 2 - 5 : x0.bandwidth() / 2 - 5;
        }, function(d) {
            return (d.data >= 0 ? y(d.data > max ? max : d.data) : y(Math.min(0, max))) - 24;
        });
        if (isFromCommentDialog) {
            app.chartCommons.commentUtils.setOnHighlightListener(g.selectAll(".series"), settings.ChartInPageId);
        }
        var gt = chart.selectAll(".gd-text").data(data).enter().append("g").attr("transform", "translate(" + x(data[0].label + "#" + data[0].index) + ",0)").attr("class", function(d) {
            return "gd-text" + (d.onClickVal != "" || flag ? " pointer" : "");
        }).on("click", onClickCalback);
        var texts = gt.selectAll("nothings").data(function(d) {
            return d.series.filter(function(d) {
                return d.type == "series" && d.prop.seriesType == "bar" && !d.prop.hidden;
            });
        }).enter().append("text").text(function(d) {
            return !d.prop.showValues ? "" : persian(d3.format(getFormatString(d.prop.font, d.prop))(d.data), showPersian);
        }).attr("class", function(d) {
            return "series " + "series-" + d.sIndex;
        }).style("font-family", function(d) {
            return d.prop.font.fontName;
        }).style("font-size", function(d) {
            return d.prop.font.fontSize;
        }).attr("fill", function(d) {
            return d.prop.font.color;
        }).style("font-weight", function(d) {
            return d.prop.font.bold ? "bold" : "normal";
        }).style("font-style", function(d) {
            return d.prop.font.italic ? "italic" : "normal";
        }).attr("x", "0.3em").attr("dy", function(d) {
            return d.data >= 0 ? "-0.3em" : "1em";
        }).attr("transform", function(d, i) {
            return recOverlap ? "" : "translate(" + x0(d.label) + ",0)";
        }).attr("y", function(d) {
            var yFun = y;
            if (secondaryY.enable && secondaryY.measures[d.seriesKey] == true) {
                yFun = y2;
            }
            return d.data >= 0 ? yFun(d.data > max ? max : d.data) : yFun(d.data);
        }).on("click", function(d) {
            if (isFromCommentDialog) {
                app.chartCommons.commentUtils.clickOnCommentIcon(d, settings.ChartInPageId);
            }
        });
        var mapped = data.map(function(d) {
            return d.label + "#" + d.index;
        });
        texts._groups.forEach(function(item, i) {
            item.forEach(function(t, j) {
                var tw = t.getBBox().width;
                var th = t.getBBox().height;
                var bw = recOverlap ? x.bandwidth() : x0.bandwidth();
                var rr = x;
                var dd = data;
                var ri = i;
                var xMid = bw / 2 - tw / 2;
                d3.select(t).attr("x", xMid);
                if (!calc.noConfilict(tw, th, x(mapped[i]), d3.select(t).attr("y"))) {
                    $(t).remove();
                }
            });
        });
        calc.clear();
    } else if (isbox) {
        var gg = g.selectAll("nothings").data(function(d) {
            var ret = d.series.filter(function(d) {
                return d.type == "series" && d.prop.seriesType == "bar" && !d.prop.hidden;
            });
            var headers = d.series.map(function(d) {
                return d.label;
            });
            var values = d.series.map(function(d) {
                return d.data;
            });
            pushThenRow(ret, values, headers);
            return ret;
        }).enter().append("g");
        gg.attr("class", function(d) {
            return "series " + "series-" + d.sIndex;
        }).attr("transform", function(d, i) {
            return "translate(" + x0(d.label) + ",0)";
        });
        var getY = function(d) {
            var yFun = y;
            if (secondaryY.enable && secondaryY.measures[d.seriesKey] === true) {
                yFun = y2;
            }
            return d.data >= 0 ? yFun(d.data > max ? max : d.data) : yFun(0);
        };
        var xBase = 5;
        var boxWidth = x0.bandwidth() - xBase * 2;
        var colorFill = function(d, i) {
            return getColor(d, i, d.prop.seriesColor);
        };
        gg.append("line").attr("x1", xBase).attr("x2", boxWidth + xBase).attr("y1", function(d) {
            return getY(d.box.q2);
        }).attr("y2", function(d) {
            return getY(d.box.q2);
        }).style("display", function(d) {
            var box = d.prop.boxOption || {};
            if (box.dontShowMedian === true) {
                return "none";
            }
            return "auto";
        }).attr("stroke", colorFill);
        gg.append("line").attr("x1", boxWidth / 2 + xBase).attr("x2", boxWidth / 2 + xBase).attr("y1", function(d) {
            return getY(d.box.min);
        }).attr("y2", function(d) {
            return getY(d.box.q1);
        }).attr("stroke", colorFill);
        gg.append("line").attr("x1", boxWidth / 3 + xBase).attr("x2", 2 * boxWidth / 3 + xBase).attr("y1", function(d) {
            return getY(d.box.min);
        }).attr("y2", function(d) {
            return getY(d.box.min);
        }).attr("stroke", colorFill);
        gg.append("line").attr("x1", boxWidth / 3 + xBase).attr("x2", 2 * boxWidth / 3 + xBase).attr("y1", function(d) {
            return getY(d.box.max);
        }).attr("y2", function(d) {
            return getY(d.box.max);
        }).attr("stroke", colorFill);
        gg.append("line").attr("x1", boxWidth / 2 + xBase).attr("x2", boxWidth / 2 + xBase).attr("y1", function(d) {
            return getY(d.box.max);
        }).attr("y2", function(d) {
            return getY(d.box.q3);
        }).attr("stroke", colorFill);
        gg.append("circle").attr("cx", boxWidth / 2 + xBase).attr("cy", function(d) {
            return getY(d.box.avg);
        }).attr("r", "5px").style("display", function(d) {
            var box = d.prop.boxOption || {};
            if (box.dontShowAvg === true) {
                return "none";
            }
            return "auto";
        }).attr("stroke", colorFill);
        gg.append("rect").attr("width", boxWidth).attr("x", xBase).attr("stroke", colorFill).attr("fill", function(d) {
            var color = getColor(d, i, d.prop.seriesColor);
            if (d.thenRows) {
                $.each(d.thenRows, function(i, thenRow) {
                    $.each(thenRow, function(i, thenRowItem) {
                        if (d.label !== thenRowItem.firstField) return true;
                        switch (+thenRowItem.operand) {
                          case 1:
                            color = thenRowItem.secondFieldColor;
                            break;
                        }
                    });
                });
            }
            return color + "99";
        }).attr("y", function(d) {
            return getY(d.box.q3);
        }).attr("height", function(d) {
            return getY(d.box.q1) - getY(d.box.q3);
        }).on("click", function(d) {
            if (isFromCommentDialog) {
                app.chartCommons.commentUtils.clickOnCommentIcon(d, settings.ChartInPageId);
            }
        });
        var getBoxFontProp = function(d, i) {
            var box = d.prop.boxOption || {};
            var show = {};
            if (i === 0 || i === 2) show = box.q1q3ValueFont;
            if (i === 1) show = box.midValueFont;
            if (i === 3 || i === 4) show = box.minMaxValueFont;
            return show || {};
        };
        gg.append("g").selectAll("text").data(function(d) {
            return [ d.box.q1, d.box.q2, d.box.q3, d.box.min, d.box.max ];
        }).enter().append("text").attr("y", function(d) {
            return getY(d);
        }).attr("x", xBase).text(function(d, i) {
            var box = d.prop.boxOption || {};
            var show = false;
            if (i === 0 || i === 2) show = box.showq1q3Value;
            if (i === 1) {
                show = box.showMidValue && box.dontShowMedian !== true;
            }
            if (i === 3 || i === 4) show = box.showMinMaxValue;
            var font = getBoxFontProp(d, i);
            return show ? persian(d3.format(getFormatString(font, d.prop))(d.data), showPersian) : "";
        }).styles(function(d, i) {
            var font = getBoxFontProp(d, i);
            return {
                "font-family": font.fontName,
                "font-size": font.fontSize,
                fill: font.color,
                "font-weight": font.bold ? "bold" : "normal",
                "font-style": font.italic ? "italic" : "normal"
            };
        });
    } else {
        var mapped = data.map(function(d) {
            return d.label + "#" + d.index;
        });
        settings.chartProp.info.satckSumFont = settings.chartProp.info.satckSumFont || {};
        g.selectAll(".sum-text").data(function(d) {
            var ret = d.series.filter(function(d) {
                return d.type === "series" && d.prop.seriesType === "bar" && !d.prop.hidden;
            });
            return [ _.sum(_.map(ret, "data")) ];
        }).enter().append("text").attr("y", function(d) {
            var yFun = y;
            return d >= 0 ? yFun(d > max ? max : d) : yFun(0);
        }).text(function(d, i) {
            return !settings.chartProp.info.satckSumShow ? "" : d === 0 ? "" : persian(d3.format(settings.chartProp.info.satckSumFont.formatString)(d), showPersian);
        }).attr("dy", "-0.3em").style("font-family", settings.chartProp.info.satckSumFont.fontName).style("font-size", settings.chartProp.info.satckSumFont.fontSize).attr("fill", settings.chartProp.info.satckSumFont.color).style("font-weight", settings.chartProp.info.satckSumFont.bold ? "bold" : "normal").style("font-style", settings.chartProp.info.satckSumFont.italic ? "italic" : "normal").attr("x", function(d) {
            var tw = d3.select(this).node().getBBox().width;
            return x.bandwidth() / 2 - tw / 2;
        });
        var gg = g.selectAll("nothings").data(function(d) {
            var ret = d.series.filter(function(d) {
                return d.type === "series" && d.prop.seriesType === "bar" && !d.prop.hidden;
            });
            var headers = d.series.map(function(d) {
                return d.label;
            });
            var values = d.series.map(function(d) {
                return d.data;
            });
            pushThenRow(ret, values, headers);
            return ret;
        }).enter().append("g");
        gg.attr("class", function(d) {
            return "series " + "series-" + d.sIndex;
        }).attr("transform", function(d, i) {
            return "translate(0,0)";
        });
        gg.append("rect").attr("width", x.bandwidth()).attr("fill", function(d, i) {
            var color = d.prop.seriesColor;
            if (d.thenRows) {
                $.each(d.thenRows, function(i, thenRow) {
                    $.each(thenRow, function(i, thenRowItem) {
                        if (d.label != thenRowItem.firstField) return true;
                        switch (+thenRowItem.operand) {
                          case 1:
                            color = thenRowItem.secondFieldColor;
                            break;
                        }
                    });
                });
            }
            return color;
        }).attr("y", function(d) {
            var yFun = y;
            if (secondaryY.enable && secondaryY.measures[d.seriesKey] == true) {
                yFun = y2;
            }
            return d.data >= 0 ? yFun(d.data > max ? max : d.data) : yFun(0);
        }).attr("height", function(d) {
            var yFun = y;
            if (secondaryY.enable && secondaryY.measures[d.seriesKey] == true) {
                yFun = y2;
            }
            return d.data > 0 ? yFun(Math.max(0, min)) - yFun(d.data > max ? max : d.data) : yFun(d.data < min ? min : d.data) - yFun(0);
        }).on("click", function(d) {
            if (isFromCommentDialog) {
                app.chartCommons.commentUtils.clickOnCommentIcon(d, settings.ChartInPageId);
            }
        });
        var texts = [ [] ];
        var texts = gg.append("text").attr("class", function(d) {
            return "" + "series-" + d.sIndex;
        }).text(function(d, i) {
            return !d.prop.showValues ? "" : d.data == 0 ? "" : persian(d3.format(getFormatString(d.prop.font, d.prop))(d.data), showPersian);
        }).attr("dy", "0.3em").style("font-family", function(d) {
            return d.prop.font.fontName;
        }).style("font-size", function(d) {
            return d.prop.font.fontSize;
        }).attr("fill", function(d) {
            return d.prop.font.color;
        }).style("font-weight", function(d) {
            return d.prop.font.bold ? "bold" : "normal";
        }).style("font-style", function(d) {
            return d.prop.font.italic ? "italic" : "normal";
        }).attr("x", function(d) {
            var tw = d3.select(this).node().getBBox().width;
            return x.bandwidth() / 2 - tw / 2;
        }).attr("y", function(d) {
            var yFun = y;
            if (secondaryY.enable && secondaryY.measures[d.seriesKey] == true) {
                yFun = y2;
            }
            var height = d.data > 0 ? yFun(Math.max(0, min)) - yFun(d.data > max ? max : d.data) : yFun(d.data < min ? min : d.data) - yFun(0);
            var yx = d.data >= 0 ? yFun(d.data > max ? max : d.data) : yFun(0);
            return yx + height / 2;
        });
        app.chartCommons.commentUtils.addCommentIcon(settings.ChartInPageId, gg, function(d) {
            return x.bandwidth() / 2 - 5;
        }, function(d) {
            var yFun = y;
            if (secondaryY.enable && secondaryY.measures[d.seriesKey] == true) {
                yFun = y2;
            }
            var height = d.data > 0 ? yFun(Math.max(0, min)) - yFun(d.data > max ? max : d.data) : yFun(d.data < min ? min : d.data) - yFun(0);
            var yx = d.data >= 0 ? yFun(d.data > max ? max : d.data) : yFun(0);
            return yx + height / 2 - 24;
        });
        if (isFromCommentDialog) {
            app.chartCommons.commentUtils.setOnHighlightListener(g.selectAll(".series"), settings.ChartInPageId);
        }
        var comments = gg.selectAll(".comment");
        var lastEnd = -999999;
        gg._groups.forEach(function(els, i) {
            var textGroup = texts[i] || [];
            var maxHeightPos = 0;
            var maxHeightNeg = 0;
            var xMid = 0;
            els = _.reverse(els);
            textGroup = _.reverse(textGroup);
            els.forEach(function(d, j) {
                var t = textGroup[j] || null;
                var val = d["__data__"]["data"];
                var h = d3.select(d).select("rect").attr("height");
                if (val >= 0) {
                    d3.select(d).attr("transform", function(d, i) {
                        return "translate(0," + maxHeightPos + ")";
                    });
                    maxHeightPos -= +h;
                } else {
                    d3.select(d).attr("transform", function(d, i) {
                        return "translate(0," + maxHeightNeg + ")";
                    });
                    maxHeightNeg += +h;
                }
            });
        });
    }
    if (app.dashboardLayoutVersion == 1 || settings.editMode) {
        var t = svg.select(".x.axis").selectAll("g text").attr("class", "axes-x-label").attr("x", "-1em").attr("transform", function() {
            return xRotate ? getRotate() : "rotate(0)";
        }).attr("dy", "0.1em").attr("y", "0").style("font-family", settings.chartProp.info.font.fontName).style("font-size", settings.chartProp.info.font.fontSize).attr("fill", settings.chartProp.info.font.color).style("font-weight", settings.chartProp.info.font.bold ? "bold" : "normal").style("font-style", settings.chartProp.info.font.italic ? "italic" : "normal");
        var c = $(selector).find(".x").first().get(0);
        var box = c.getBBox();
        var extendedHeight = box.height - margin.bottom;
        svg.attr("width", width).attr("height", height + box.height);
    }
    var gg = g.selectAll("nothing").data(function(d) {
        return d.series.filter(function(d) {
            return d.type == "kpi" && d.prop.seriesType == "bar" && !d.prop.hidden;
        });
    }).enter().append("g").attr("class", "kpi").attr("transform", function(d, i) {
        return "translate(" + x0(d.label) + ",0)";
    });
    gg.append("rect").attr("width", x0.bandwidth()).attr("y", function(d) {
        return y(d.data[1] * 1.1);
    }).attr("height", function(d) {
        return barHeight + margin.top - y(d.data[1] * 1.1);
    }).attr("fill", "#eee");
    gg.append("rect").attr("width", x0.bandwidth()).attr("y", function(d) {
        return y(d.data[0]);
    }).attr("height", function(d) {
        return barHeight + margin.top - y(d.data[0]);
    }).attr("fill", function(d, i) {
        return colors(i);
    });
    gg.append("rect").attr("width", x0.bandwidth()).attr("y", function(d) {
        return y(d.data[1] * 1);
    }).attr("height", function(d) {
        return d.data[1] == 0 ? 0 : 2;
    }).attr("fill", "#333");
    var getStatusColor = function(val) {
        if (val > 0) {
            return "#71b37c";
        } else if (val == 0) {
            return "#8d8d8d";
        } else {
            return "#e14d57";
        }
    };
    gg.append("circle").attr("r", function(d) {
        return d.data[1] == 0 ? 0 : x0.bandwidth() / 2 < 5 ? x0.bandwidth() / 2 : 5;
    }).attr("fill", function(d) {
        return getStatusColor(d.data[1]);
    }).attr("cx", x0.bandwidth() / 2).attr("cy", function(d) {
        return y(d.data[1] * 1.1) - (x0.bandwidth() / 2 < 5 ? x0.bandwidth() / 2 : 5);
    });
    function getTooltipHtml(index, type, seriesType, indexOfSeries) {
        var rr = lineData;
        if (seriesType === "line") {
            index = lineData[indexOfSeries].values[index].dIndex;
        }
        var d = data[index].series;
        if (type === 1 && seriesType && typeof indexOfSeries !== "undefined") {
            d = d.filter(function(d) {
                return d.prop.seriesType === seriesType && !d.prop.hidden;
            });
            d = [ d[indexOfSeries] ];
        }
        if (type === 2) {
            d = d.filter(function(d) {
                return !d.prop.hidden;
            });
        }
        if (settings.chartProp.info.isBox) {
            var a = [];
            _.each(d, function(i) {
                _.each([ i.box.q1, i.box.q2, i.box.q3, i.box.min, i.box.max, i.box.avg ], function(item, i) {
                    var prefix = i == 0 ? "Q1" : i == 1 ? "Q2" : i == 2 ? "Q3" : i == 3 ? "MIN" : i == 4 ? "MAX" : i == 5 ? "AVG" : "";
                    a.push({
                        prop: item.prop,
                        data: item.data,
                        label: (item.prop.name || item.label) + " " + prefix,
                        format: getFormatString(item.prop),
                        color: item.prop.seriesColor
                    });
                });
            });
            d = a;
        }
        d = d.map(function(d) {
            return {
                data: d.data,
                label: d.prop.name || d.label,
                format: getFormatString(d.prop),
                color: d.prop.seriesColor
            };
        });
        return app.chartCommons.tooltip.tooltipFormatter({
            points: d,
            key: data[index].label,
            sum: d3.sum(d, function(d) {
                return d.data;
            }),
            avg: d3.sum(d, function(d) {
                return d.data;
            }) / d.length,
            format: d.length > 0 ? d[0].format : ",.2f"
        }, settings.chartProp.info.tooltipHeader, settings.chartProp.info.tooltipFormat, showPersian);
    }
    var colorStepGroup = chart.append("g");
    var areaGroup = chart.append("g");
    var lineGroup = chart.append("g");
    var circleGroup = chart.append("g");
    var lineData = getLineData(data);
    var lineInterpolate = d3.curveLinear;
    var area0 = d3.area().x(function(d) {
        return x(d.label) + x.bandwidth() / 2;
    }).y0(barHeight + margin.top).y1(y(min)).curve(lineInterpolate);
    var area = d3.area().x(function(d) {
        return x(d.label) + x.bandwidth() / 2;
    }).y0(barHeight + margin.top).y1(function(d) {
        var yFun = y;
        if (secondaryY.enable && secondaryY.measures[d.seriesKey] == true) {
            yFun = y2;
        }
        return yFun(d.value > max ? max : d.value < min ? min : d.value);
    }).curve(lineInterpolate);
    var line0 = d3.line().x(function(d) {
        return x(d.label) + x.bandwidth() / 2;
    }).y(function(d) {
        var yFun = y;
        var xMin = min;
        if (secondaryY.enable && secondaryY.measures[d.seriesKey] == true) {
            yFun = y2;
            xMin = y2Min;
        }
        return yFun(xMin);
    }).curve(lineInterpolate);
    var line = d3.line().x(function(d) {
        return Math.floor(x(d.label) + x.bandwidth() / 2);
    }).y(function(d) {
        var yFun = y;
        var xMin = min;
        var xMax = max;
        if (secondaryY.enable && secondaryY.measures[d.seriesKey] == true) {
            yFun = y2;
            xMin = y2Min;
            xMax = y2Max;
        }
        return Math.floor(yFun(d.value > xMax ? xMax : d.value < xMin ? xMin : d.value));
    }).curve(lineInterpolate);
    var temp = areaGroup.selectAll("nothings").data(lineData).enter().append("path").attr("class", function(d) {
        return "area " + " series-" + d.sIndex;
    }).attr("id", function(d, i) {
        return "area" + i;
    }).attr("fill", function(d, i) {
        if (!settings.chartProp.indicator || !settings.chartProp.indicator.length) return d.prop.seriesColor;
        return "url(#" + settings.id + "-" + i + ")";
    }).attr("z-index", "-1").style("opacity", function(d) {
        return d.prop.areaOpacity || .1;
    }).datum(function(d) {
        var ls = d.prop.lineType;
        if (ls == "line-dot-area" || ls == "line-area") return isStackLine ? d.valueStacked : d.values; else return 0;
    });
    if (animate) {
        temp.attr("d", function(d) {
            if (_.isArray(d) && d.length == 0) {
                return "M0,0";
            }
            return d === 0 ? "M0,0" : area0.curve(getCurve(d[0].prop.lineStyle))(d);
        }).transition().duration(settings.animationDuration).attr("d", function(d) {
            if (_.isArray(d) && d.length == 0) {
                return "M0,0";
            }
            return d === 0 ? "M0,0" : area.curve(getCurve(d[0].prop.lineStyle))(d);
        });
    } else {
        temp.attr("d", function(d) {
            if (_.isArray(d) && d.length == 0) {
                return "M0,0";
            }
            return d === 0 ? "M0,0" : area.curve(getCurve(d[0].prop.lineStyle))(d);
        });
    }
    function getCurve(s) {
        if (s == "linear") return d3.curveLinear;
        if (s == "cardinal") return d3.curveNatural;
        if (s == "step") return d3.curveStep;
        return d3.curveLinear;
    }
    temp = lineGroup.selectAll("nothings").data(lineData).enter().append("path").attr("class", function(d) {
        return "line " + " series-" + d.sIndex;
    }).attr("id", function(d, i) {
        return "line" + i;
    }).attr("stroke", function(d, i) {
        if (!settings.chartProp.indicator || !settings.chartProp.indicator.length) return d.prop.seriesColor;
        return "url(#" + settings.id + "-" + i + ")";
    }).attr("stroke-width", function(d, i) {
        return d.prop.lineWeight;
    }).attr("stroke-dasharray", function(d, i) {
        return d.prop.lineFace;
    }).datum(function(d) {
        var ls = d.prop.lineType;
        if (ls == "line-dot-area" || ls == "line-dot" || ls == "line-area" || ls == "line") return isStackLine ? d.valueStacked : d.values; else return 0;
    });
    if (animate) {
        temp.attr("d", function(d) {
            if (_.isArray(d) && d.length == 0) {
                return line0;
            }
            return d === 0 ? line0 : line0.curve(getCurve(d[0].prop.lineStyle))(d);
        }).transition().duration(settings.animationDuration).attr("d", function(d) {
            if (_.isArray(d) && d.length == 0) {
                return line;
            }
            return d === 0 ? line : line.curve(getCurve(d[0].prop.lineStyle))(d);
        });
    } else {
        temp.attr("d", function(d) {
            if (_.isArray(d) && d.length == 0) {
                return line;
            }
            return d === 0 ? line : line.curve(getCurve(d[0].prop.lineStyle))(d);
        });
    }
    var flag = settings.chartProp.globalvariable && settings.chartProp.globalvariable.length > 0 && !settings.editMode && settings.chartProp.globalvariable.filter(function(d) {
        return d.field == input.CurrentDimName;
    }).length > 0;
    var lineClickCallback = function(d, i) {
        if (isFromCommentDialog) {
            app.chartCommons.commentUtils.clickOnCommentIcon(d, settings.ChartInPageId);
            return;
        }
        if (settings.chartProp.globalvariable && settings.chartProp.globalvariable.length > 0 && !settings.editMode) {
            app.globalVariableHelper.updateGlobalVariables([ input.CurrentDimName ], [ d.primv ], settings.chartProp.globalvariable);
            $(selector + " .circle.selected-item").attr("class", $(this).attr("class").replace("selected-item", ""));
            $(selector + " .gd.selected-item").attr("class", $(this).attr("class").replace("selected-item", ""));
            $(this).attr("class", $(this).attr("class") + " selected-item");
        }
        if (d.onClickVal == "") {
            if (hasHref && !settings.editMode) {
                app.chartCommons.openLink(settings.chartProp.info.openDashboard, {
                    ChartInPageId: settings.ChartInPageId,
                    DataSourceId: settings.input.DataSourceId,
                    dimensionName: settings.input.dimensionName,
                    value: d.value,
                    refreshDatasource: settings.input.RefreshDatasource
                });
            }
            return;
        }
        if (isProgress()) return;
        showProgress(true);
        settings.isSort = is;
        app.chartCommons.drillDown.add(settings.ChartInPageId, settings.input.DataSourceId, settings.input.CurrentDimName, d.onClickVal, settings.input.RefreshDatasource);
        settings.parameters = {
            selectedItem: d.onClickVal,
            chartId: settings.chartId,
            ChartInPageId: settings.ChartInPageId,
            notEditMode: !settings.editMode
        };
        app.chartCommons.levelTypeUtils.getParam(settings);
        $(selector).charts(settings.type, "refreshWithData", settings);
        var is = sort.property("checked");
    };
    var transparentCircle = false;
    tempG = circleGroup.selectAll("nothings").data(lineData).enter().append("g").attr("class", function(d) {
        return "circle-group " + (d.onClickVal != "" || flag ? " pointer" : "");
    });
    var entries = tempG.selectAll(".entry").data(function(d) {
        return isStackLine ? d.valueStacked : d.values;
    }).enter().append("g").attr("class", "entry");
    var temp = entries.append("circle").attr("class", function(d) {
        return "circle" + " series-" + d.sIndex;
    }).attr("stroke", function(d, i) {
        var ret = [ d ];
        var label = d3.select(this.parentNode).datum().seriesLable;
        var headers = data[i].series.map(function(d) {
            return d.label;
        });
        var values = data[i].series.map(function(d) {
            return d.data;
        });
        var tarr = app.chartCommons.indicator.getIndicator(values, headers, settings.chartProp.indicator);
        var color = d.prop.seriesColor;
        var dx = _.flatten(tarr);
        _.each(dx, function(thenRowItem) {
            if (label !== thenRowItem.firstField) return true;
            switch (+thenRowItem.operand) {
              case 1:
                color = thenRowItem.secondFieldColor;
                break;
            }
        });
        return color;
    }).attr("stroke-width", function(d, i) {
        return d.prop.lineWeight;
    }).on("click", lineClickCallback).on("mouseover", function(d) {
        d3.select(this).attr("stroke-width", parseInt(d.prop.lineWeight) + 3);
    }).on("mouseout", function(d) {
        d3.select(this).attr("stroke-width", d.prop.lineWeight);
    }).attr("cx", function(d) {
        return line.curve(getCurve(d.prop.lineStyle)).x()(d);
    }).style("opacity", function() {
        var ls = d3.select(this.parentNode).datum().prop.lineType;
        if (ls == "line-area" || ls == "line") return 0;
        return 1;
    }).attr("r", "4");
    if (animate) {
        temp.attr("cy", y(min)).transition().duration(settings.animationDuration).attr("cy", function(d) {
            return line.curve(getCurve(d.prop.lineStyle)).y()(d);
        });
    } else {
        temp.attr("cy", function(d) {
            return line.curve(getCurve(d.prop.lineStyle)).y()(d);
        });
    }
    app.chartCommons.commentUtils.addCommentIcon(settings.ChartInPageId, entries, function(d) {
        return line.curve(getCurve(d.prop.lineStyle)).x()(d) - 5;
    }, function(d) {
        return line.curve(d.prop.lineStyle).y()(d) - 24;
    });
    if (isFromCommentDialog) {
        var t = tempG.selectAll(".entry");
        app.chartCommons.commentUtils.setOnHighlightListener(tempG.selectAll(".entry"), settings.ChartInPageId);
    }
    if (settings.chartProp.indicator && settings.chartProp.indicator.length) colorStepGroup.attr("class", "colorStepGroups").selectAll(".colorStepGroup").data(lineData).enter().append("linearGradient").attr("id", function(d, i) {
        return settings.id + "-" + i;
    }).attr("class", "colorStepGroup").attr("gradientUnits", function(d) {
        var t = _.filter(settings.chartProp.indicator, function(item) {
            return _.map(item.thenRow, "firstField").indexOf(d.label) !== -1;
        });
        return t.length ? "objectBoundingBox" : "userSpaceOnUse";
    }).selectAll("stop-color").data(function(d) {
        var r = [];
        var unit = 1 / ((d.values.length - 1) * 2);
        var sum = -1 * unit;
        d.values.map(function(dd, i) {
            var e = {
                value: dd.value,
                label: d.label,
                color: d.prop.seriesColor
            };
            var ret = [ e ];
            var headers = data[i].series.map(function(d) {
                return d.label;
            });
            var values = data[i].series.map(function(d) {
                return d.data;
            });
            var tarr = app.chartCommons.indicator.getIndicator(values, headers, settings.chartProp.indicator);
            var color = d.prop.seriesColor;
            var dx = _.flatten(tarr);
            _.each(dx, function(thenRowItem) {
                if (e.label !== thenRowItem.firstField) return true;
                switch (+thenRowItem.operand) {
                  case 1:
                    color = thenRowItem.secondFieldColor;
                    break;
                }
            });
            e.color = color;
            e.offset = sum < 0 ? 0 : sum;
            r.push(e);
            e = $.extend({}, e);
            sum += unit * 2;
            e.offset = sum > 1 ? sum - unit : sum;
            r.push(e);
        });
        return r;
    }).enter().append("stop").attr("stop-color", function(d, i) {
        var color = d.color;
        return color;
    }).attr("offset", function(d) {
        return d.offset;
    });
    temp = circleGroup.selectAll("nothings").data(lineData).enter().append("g").attr("class", function(d) {
        return "text-vals";
    }).selectAll("text").data(function(d) {
        return d.prop.showValues ? isStackLine ? d.valueStacked : d.values : 0;
    }).enter().append("text").text(function(d) {
        return persian(d3.format(getFormatString(d.prop.font, d.prop))(d.valueLabel), showPersian);
    }).attr("class", function(d) {
        return "text-value pointer" + " series-" + d.sIndex;
    }).style("font-family", function(d) {
        return d.prop.font.fontName;
    }).style("font-size", function(d) {
        return d.prop.font.fontSize;
    }).attr("fill", function(d) {
        return d.prop.font.color;
    }).style("font-weight", function(d) {
        return d.prop.font.bold ? "bold" : "normal";
    }).style("font-style", function(d) {
        return d.prop.font.italic ? "italic" : "normal";
    }).style("text-anchor", app.lang.isRtl() ? "start" : "end").attr("dy", "-10").attr("dy", "-10").attr("x", function(d, i) {
        var w = d3.select(this).node().getBBox().width;
        var h = d3.select(this).node().getBBox().height;
        var p = x(mapped[i]);
        var y = line.curve(getCurve(d.prop.lineStyle)).y()(d);
        return line.curve(getCurve(d.prop.lineStyle)).x()(d) - w / 2;
    }).on("click", lineClickCallback);
    if (animate) {
        temp.attr("y", y(min)).transition().duration(settings.animationDuration).attr("y", function(d) {
            return line.curve(getCurve(d.prop.lineStyle)).y()(d);
        });
    } else {
        temp.attr("y", function(d) {
            return line.curve(getCurve(d.prop.lineStyle)).y()(d);
        });
    }
    function getGravity(el) {
        return window.innerWidth - el[0].getBoundingClientRect().left < 300 ? "e" : "w";
    }
    $(selector + " .circle").each(function() {
        var e = $(this);
        $(this).tipsy({
            gravity: getGravity(e),
            html: true,
            title: function() {
                var type = +settings.chartProp.info.tooltip || 1;
                var r = "";
                var index = $(this).parent("g.entry").index();
                var indexOfLine = $(this).parents("g.circle-group").index();
                r = getTooltipHtml(index, type, "line", indexOfLine);
                return r;
            }
        });
    });
    $(selector + " .text-value").each(function() {
        var e = $(this);
        $(this).tipsy({
            gravity: getGravity(e),
            html: true,
            title: function() {
                var type = +settings.chartProp.info.tooltip || 1;
                var r = "";
                var index = $(this).index();
                var indexOfLine = $(this).parent("g.text-vals").index() - $(this).parent("g.text-vals").parent().children().length / 2;
                r = getTooltipHtml(index, type, "line", indexOfLine);
                return r;
            }
        });
    });
    sort.on("change", change);
    sortSelector.on("change", change);
    var firstRun = true;
    var sortTimeout = setTimeout(function() {
        if (settings.isSort) sort.property("checked", true).each(change); else sort.each(change);
        firstRun = false;
    }, 0);
    function getLineData(data) {
        var lineMeasures = data[0].series.filter(function(d, i) {
            return d.prop.seriesType == "line" && !d.prop.hidden;
        });
        var res = lineMeasures.map(function(d, i) {
            var r = {
                sIndex: d.sIndex,
                label: d.label,
                prop: d.prop,
                values: data.map(function(dd, ii) {
                    var r = {
                        sIndex: d.sIndex,
                        dIndex: dd.index,
                        label: dd.label + "#" + dd.index,
                        value: dd.series.filter(function(ddd, iii) {
                            return ddd.label == d.label;
                        })[0].data,
                        valueLabel: dd.series.filter(function(ddd, iii) {
                            return ddd.label == d.label;
                        })[0].data,
                        prop: dd.series.filter(function(ddd, iii) {
                            return ddd.label == d.label;
                        })[0].prop,
                        onClickVal: dd.onClickVal,
                        primv: dd.value,
                        category: dd.label,
                        commentCount: dd.series.filter(function(ddd, iii) {
                            return ddd.label == d.label;
                        })[0].commentCount,
                        seriesLable: d.label,
                        seriesKey: d.key
                    };
                    return r;
                }),
                valueStacked: data.map(function(dd, ii) {
                    return {
                        sIndex: d.sIndex,
                        label: dd.label + "#" + dd.index,
                        valueLabel: dd.series.filter(function(ddd, iii) {
                            return ddd.label == d.label;
                        })[0].data,
                        value: dd.series.filter(function(ddd, iii) {
                            return ddd.label == d.label;
                        })[0].data,
                        prop: dd.series.filter(function(ddd, iii) {
                            return ddd.label == d.label;
                        })[0].prop,
                        onClickVal: dd.onClickVal,
                        primv: dd.value
                    };
                })
            };
            return r;
        });
        var sum = res.length == 0 ? [] : res[0].valueStacked.map(function(d) {
            return Math.abs(d.value);
        });
        res.forEach(function(item, i) {
            if (i == 0) return;
            var beforeEl = res[i - 1];
            item.valueStacked.forEach(function(d, j) {
                sum[j] += Math.abs(d.value);
                d.value += beforeEl.valueStacked[j].value;
            });
        });
        if (isStackLinePercent) {
            res.forEach(function(item, i) {
                item.valueStacked.forEach(function(d, j) {
                    d.value = d.value / sum[j] * 100;
                });
            });
        }
        res.forEach(function(r, i) {
            r.values = r.values.filter(function(d) {
                return d.value !== "";
            });
            r.valueStacked = r.valueStacked.filter(function(d) {
                return d.value !== "";
            });
            if (r.prop.dontShowZeroValue) {
                r.values = r.values.filter(function(d) {
                    return d.value != null && d.value != 0;
                });
                r.valueStacked = r.valueStacked.filter(function(d) {
                    return d.value != null && d.value != 0;
                });
            }
        });
        return res;
    }
    function change() {
        clearTimeout(sortTimeout);
        bol = sort.property("checked");
        settings.isSort = bol;
        var index = sortSelector._groups[0][0].selectedIndex;
        var indexVal = sortSelector._groups[0][0].value;
        var df = sortSelector._groups[0][0];
        var isKpi = true;
        if (index >= kpisLabels.length) isKpi = false;
        x.domain(settings.isSort ? data.sort(function(a, b) {
            na = a.series.filter(function(d) {
                return d.label == indexVal;
            });
            nb = b.series.filter(function(d) {
                return d.label == indexVal;
            });
            if (!(na instanceof Array)) return 0;
            na = na[0];
            nb = nb[0];
            if (na.type == "series") {
                return nb.data - na.data;
            } else {
                return nb.data[0] - na.data[0];
            }
            return isKpi ? b.series.filter(function(d) {
                return d.label == indexVal;
            }).data[0] - a.series.filter(function(d) {
                return d.label == indexVal;
            }).data[0] : b.series.filter(function(d) {
                return d.label == indexVal;
            }).data - a.series.filter(function(d) {
                return d.label == indexVal;
            }).data;
        }).map(function(d) {
            return d.label + "#" + d.index;
        }) : data.sort(function(a, b) {
            return a.index - b.index;
        }).map(function(d) {
            return d.label + "#" + d.index;
        }));
        xtrim.domain(settings.isSort ? data.filter(sample).sort(function(a, b) {
            na = a.series.filter(function(d) {
                return d.label == indexVal;
            });
            nb = b.series.filter(function(d) {
                return d.label == indexVal;
            });
            if (!(na instanceof Array)) return 0;
            na = na[0];
            nb = nb[0];
            if (na.type == "series") {
                return nb.data - na.data;
            } else {
                return nb.data[0] - na.data[0];
            }
            return isKpi ? b.series.filter(function(d) {
                return d.label == indexVal;
            }).data[0] - a.series.filter(function(d) {
                return d.label == indexVal;
            }).data[0] : b.series.filter(function(d) {
                return d.label == indexVal;
            }).data - a.series.filter(function(d) {
                return d.label == indexVal;
            }).data;
        }).map(function(d) {
            return d.label + "#" + d.index;
        }) : data.filter(sample).sort(function(a, b) {
            return a.index - b.index;
        }).map(function(d) {
            return d.label + "#" + d.index;
        }));
        var transition = svg.transition().duration(settings.animationDuration), delay = function(d, i) {
            return !needAnimation ? 0 : i * 50;
        };
        transition.on("end", function() {
            $(selector + " .kpi").each(function() {
                var e = $(this);
                $(this).tipsy({
                    gravity: getGravity(e),
                    html: true,
                    title: function() {
                        var type = +settings.chartProp.info.tooltip || 1;
                        var index = data.map(function(d) {
                            return d.index;
                        }).indexOf($(this).parent(".gd").get(0).__data__.index);
                        return getTooltipHtml(index, type, "bar", $(this).index());
                    }
                });
            });
            $(selector + " .series").each(function() {
                var e = $(this);
                $(this).tipsy({
                    gravity: getGravity(e),
                    html: true,
                    title: function() {
                        var arr = data.map(function(d) {
                            return d.index;
                        });
                        var item = $(this).parent(".gd").get(0) || $(this).parent(".gd-text").get(0);
                        var el = item.__data__.index;
                        var type = +settings.chartProp.info.tooltip || 1;
                        var index = arr.indexOf(el);
                        var t = getTooltipHtml(index, type, "bar", $(this).index());
                        return t;
                    }
                });
            });
            $(selector + " .gd-text text").each(function() {
                var e = $(this);
                $(this).tipsy({
                    gravity: getGravity(e),
                    html: true,
                    title: function() {
                        var type = +settings.chartProp.info.tooltip || 1;
                        var index = data.map(function(d) {
                            return d.index;
                        }).indexOf($(this).parent(".gd-text").get(0).__data__.index);
                        return getTooltipHtml(index, type, "bar", $(this).index());
                    }
                });
            });
        });
        transition.selectAll(".gd").delay(delay).attr("transform", function(d) {
            return "translate(" + x(d.label + "#" + d.index) + ",0)";
        });
        transition.selectAll(".gd-text").delay(delay).attr("transform", function(d) {
            return "translate(" + x(d.label + "#" + d.index) + ",0)";
        });
        var lineData = getLineData(data);
        svg.selectAll(".area").data(lineData).datum(function(d) {
            var ls = d.prop.lineType;
            if (ls == "line-dot-area" || ls == "line-area") return isStackLine ? d.valueStacked : d.values; else return 0;
        }).transition().duration(settings.animationDuration).attr("d", function(d) {
            if (_.isArray(d) && d.length == 0) {
                return "M0,0";
            }
            return d === 0 ? "M0,0" : area.curve(getCurve(d[0].prop.lineStyle))(d);
        });
        svg.selectAll(".line").data(lineData).datum(function(d) {
            var ls = d.prop.lineType;
            if (ls == "line-dot-area" || ls == "line-dot" || ls == "line-area" || ls == "line") return isStackLine ? d.valueStacked : d.values; else return 0;
        }).transition().duration(settings.animationDuration).attr("d", function(d) {
            if (_.isArray(d) && d.length == 0) {
                return "M0,0";
            }
            return d === 0 ? "M0,0" : line.curve(getCurve(d[0].prop.lineStyle))(d);
        });
        svg.selectAll(".circle-group").data(lineData).selectAll(".circle").data(function(d) {
            var ls = d.prop.lineType;
            if (ls == "line-dot-area" || ls == "line-dot" || ls == "dot") return isStackLine ? d.valueStacked : d.values; else return 0;
        }).transition().duration(settings.animationDuration).attr("stroke", function(d, i) {
            var ret = [ d ];
            var label = d3.select(this.parentNode).datum().seriesLable;
            var headers = data[i].series.map(function(d) {
                return d.label;
            });
            var values = data[i].series.map(function(d) {
                return d.data;
            });
            pushThenRow(ret, values, headers);
            d = ret[0];
            var color = d.prop.seriesColor;
            if (d.thenRows) {
                $.each(d.thenRows, function(i, thenRow) {
                    $.each(thenRow, function(i, thenRowItem) {
                        if (label != thenRowItem.firstField) return true;
                        switch (+thenRowItem.operand) {
                          case 1:
                            color = thenRowItem.secondFieldColor;
                            break;
                        }
                    });
                });
            }
            return color;
        }).attr("cx", function(d) {
            return line.curve(getCurve(d.prop.lineStyle)).x()(d);
        }).attr("cy", function(d) {
            return line.curve(getCurve(d.prop.lineStyle)).y()(d);
        });
        svg.selectAll(".text-vals").data(lineData).selectAll(".text-value").data(function(d) {
            var ls = d.prop.lineType;
            if (ls == "line-dot-area" || ls == "line-dot" || ls == "dot") return isStackLine ? d.valueStacked : d.values; else return 0;
        }).transition().duration(settings.animationDuration).attr("x", function(d) {
            try {
                var w = d3.select(this).node().getBBox().width;
                return line.curve(getCurve(d.prop.lineStyle)).x()(d) - w / 2;
            } catch (e) {
                return 0;
            }
        }).text(function(d) {
            return persian(d3.format(getFormatString(d.prop.font, d.prop))(d.valueLabel), showPersian);
        }).attr("dy", "-10").attr("y", function(d) {
            return line.curve(getCurve(d.prop.lineStyle)).y()(d);
        });
        svg.selectAll(".colorStepGroup").data(lineData).selectAll("stop").data(function(d) {
            var r = [];
            var unit = 1 / ((d.values.length - 1) * 2);
            var sum = -1 * unit;
            d.values.map(function(dd, i) {
                var e = {
                    value: dd.value,
                    label: d.label,
                    color: d.prop.seriesColor
                };
                var ret = [ e ];
                var headers = data[i].series.map(function(d) {
                    return d.label;
                });
                var values = data[i].series.map(function(d) {
                    return d.data;
                });
                pushThenRow(ret, values, headers);
                e = ret[0];
                e.offset = sum < 0 ? 0 : sum;
                r.push(e);
                e = $.extend({}, e);
                sum += unit * 2;
                e.offset = sum > 1 ? sum - unit : sum;
                r.push(e);
            });
            return r;
        }).transition().attr("stop-color", function(d, i) {
            var color = d.color;
            if (d.thenRows) {
                $.each(d.thenRows, function(i, thenRow) {
                    $.each(thenRow, function(i, thenRowItem) {
                        if (d.label != thenRowItem.firstField) return true;
                        switch (+thenRowItem.operand) {
                          case 1:
                            color = thenRowItem.secondFieldColor;
                            break;
                        }
                    });
                });
            }
            return color;
        }).attr("offset", function(d) {
            return d.offset;
        });
        transition.select(".x.axis").call(xAxis).selectAll("g").delay(delay);
        transition.select(".x.axis").selectAll("g text").attr("transform", function() {
            return xRotate ? getRotate() : "rotate(0)";
        }).attr("class", "axes-x-label").attr("x", "-1em").attr("dy", "0.1em").attr("y", "0").delay(delay);
        svg.select(".x.axis").selectAll("g text").attr("transform", function() {
            return xRotate ? getRotate() : "rotate(0)";
        }).style("font-family", settings.chartProp.info.font.fontName).style("font-size", settings.chartProp.info.font.fontSize).attr("fill", settings.chartProp.info.font.color).style("font-weight", settings.chartProp.info.font.bold ? "bold" : "normal").style("font-style", settings.chartProp.info.font.italic ? "italic" : "normal").style("text-anchor", "end").attr("x", "-1em").attr("dy", "0.1em").attr("y", "0").append("title").text(function(d) {
            return persian(d.replace(new RegExp("#\\d+$"), ""), showPersian);
        });
    }
    $(selector).trigger("heightChange");
};

var chartTypes = {
    BAR: 1,
    PIE: 2,
    LINE: 3,
    GAUGE: 4,
    TABLE: 5,
    MAP: 6,
    UserControl: 7,
    Radar: 8,
    Tree: 9,
    Text: 10,
    CE_MAP: {
        1: "barLine",
        2: "pie",
        4: "gauge",
        5: "table",
        6: "map",
        7: "userControl",
        8: "radar",
        9: "tree",
        10: "text"
    },
    NAMES: {
        1: "نمودار خطی-میله‌ای",
        2: "نمودار دایره‌ای",
        4: "نمودار عقربه‌ای",
        5: "جدول",
        7: "کنترل کاربری",
        8: "نمودار رادار",
        9: "نمودار درختی",
        10: "متن"
    }
};

(function($) {
    var defaultSettings = {
        isSort: false,
        fadeSpeed: 200,
        fadeinEasing: "easeInOutCubic",
        chartId: -1,
        animationDuration: 1e3,
        animationEase: "cubic-out"
    };
    jQuery.fn.charts = function(type, methodName) {
        var methods = {
            init: init,
            refresh: refresh,
            refreshWithData: refreshWithData,
            abort: abort
        };
        if (methods[methodName]) {
            var args = Array.prototype.slice.call(arguments, 0);
            var methodName = args.splice(1, 1);
            return methods[methodName].apply(this, args);
        } else if (typeof method == "object" || typeof method == "undefined" || !methodName) {
            return methods.init.apply(this, arguments);
        } else $.Error("Method " + methodName + " does not exist on jQuery.sitBarChart: you must specify type");
    };
    function refresh(type, options, redrowAll) {
        var settings = $(this).data("settings");
        if (typeof settings == "undefined") return;
        settings.isRefresh = true;
        settings = $.extend(settings, options);
        if (settings.chartProp.info.disable && !settings.editMode) {
            showDisableMessage(settings);
            return;
        }
        setTimeout(function() {
            draw(type, settings.input, settings, true, redrowAll);
            settings.parameters.selectedItem = null;
            settings.parameters.isUp = false;
        }, 0);
        return this;
    }
    function invalidateBackground(settings) {
        if (!settings.editMode) return;
        var info = settings.chartProp.info || {};
        if (settings.type.isCustom) {
            info = settings.chartProp.general.info || {};
        }
        var div = $("#" + settings.id).parents(".chart-widget");
        if (info.backgroundColor) {
            div.find(".ui.card ").css("background", info.backgroundColor);
        }
        if (info.dontShowTitle === true) {
            div.find(".ui.card .title-content").hide();
        } else {
            div.find(".ui.card .title-content").show();
        }
        if (info.titleFont) {
            div.find(".ui.card .title-content").css({
                "font-size": info.titleFont.fontSize,
                color: info.titleFont.color,
                "font-family": info.titleFont.fontName,
                "font-weight": info.titleFont.bold ? "bold" : "normal",
                "font-style": info.titleFont.italic ? "italic" : "normal"
            });
            div.find(".ui.card .title").css({
                "text-align": info.titleFont.align
            });
        }
    }
    function abort($e) {
        var ajaxRequest = $e.data("ajaxRequest");
        if (ajaxRequest != null) ajaxRequest.abort();
        return this;
    }
    function refreshRelatedDatasources(settings) {
        $(".bar-chart").each(function() {
            var s = $(this).data("settings");
            if (typeof s.input != "undefined" && typeof s.input.RefreshDatasource != "undefined") {
                if (+s.ChartInPageId == +settings.ChartInPageId) return;
                s.titlebar.showProgress(true);
                $(this).charts(s.type, "refreshWithData", s, {
                    refreshRelatedDatasources: false
                });
            }
        });
        app.filterBox.refresh();
    }
    function refreshWithData(type, options, opts) {
        abort($(this));
        opts = $.extend({
            refreshRelatedDatasources: true
        }, opts);
        var $el = $(this);
        var settings = $(this).data("settings");
        settings = $.extend(settings, options);
        settings.isRefresh = false;
        if (typeof settings.chartProp == "undefined") {
            return;
        }
        if (typeof type.isCustom == "undefined") {
            type = {
                id: +type,
                isCustom: false
            };
        }
        if (settings.chartProp.info.disable && !settings.editMode) {
            showDisableMessage(settings);
            return;
        }
        app.chartCommons.setFilterParameter(settings);
        settings.parameters.filterHierarchy = app.chartCommons.getFilterHierarchy(settings.ChartInPageId);
        if (settings.editMode) {
            settings.parameters.ChartInfo = $("#divChart").data("chartInfo");
        }
        var resultRows = [];
        if (type.id == chartTypes.TABLE) {
            for (var prop in settings.chartProp.series) {
                if (settings.chartProp.series.hasOwnProperty(prop)) {
                    resultRows.push({
                        Name: prop,
                        Type: settings.chartProp.series[prop].rowResult
                    });
                }
            }
        }
        settings.dataUrl = getDataUrl(type);
        var caller = app.mobileMode ? proxy.ajax : $.ajax;
        var d = $.extend(settings.parameters, {
            resultRows: resultRows,
            type: settings.dataType
        });
        var data = JSON.stringify(d);
        if (opts.refreshRelatedDatasources) {
            if (settings.ChartInPageId) {
                app.moderation.dashboadpage.refreshRelatedDatasources(settings.input.RefreshDatasource, [ +settings.ChartInPageId ]);
                if (app.filterBox && app.filterBox.refresh) app.filterBox.refresh();
            }
        }
        var ajaxRequest = caller({
            url: settings.dataUrl,
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: data,
            async: settings.async,
            requestId: settings.requestId,
            success: function(input) {
                draw(type, input, settings, true);
                settings.parameters.selectedItem = null;
                settings.parameters.isUp = false;
            }
        });
        $(this).data("ajaxRequest", ajaxRequest);
        return this;
    }
    function showDisableMessage(settings) {
        var selector = "#" + settings.id;
        $(selector).empty();
        $(selector).html('<div class="temporal" style="display: flex;justify-content: center;flex-direction: column;text-align: center; align-items: center;flex: 1">                <img style="margin:12px;"width="32" src="' + app.urlPrefix + 'images/barricade-256.png"/>                <p>نمودار در حال تغییر است</p>            </div > ');
    }
    function init(type, options) {
        var settings = $.extend({}, defaultSettings, options);
        var $this = $(this);
        settings.id = $this.attr("id");
        settings.type = type;
        $this.data("isChart", true);
        $this.data("settings", settings);
        if (typeof type.isCustom === "undefined") {
            type = {
                id: +type,
                isCustom: false
            };
        }
        if (settings.chartProp.info.disable && !settings.editMode) {
            showDisableMessage(settings);
            return;
        }
        app.chartCommons.setFilterParameter(settings);
        app.chartCommons.levelTypeUtils.getParam(settings);
        type = settings.type;
        var resultRows = [];
        if (type.id == chartTypes.TABLE) {
            for (var prop in settings.chartProp.series) {
                if (settings.chartProp.series.hasOwnProperty(prop)) {
                    resultRows.push({
                        Name: prop,
                        Type: settings.chartProp.series[prop].rowResult
                    });
                }
            }
        }
        settings.dataUrl = getDataUrl(type);
        var caller = app.mobileMode ? proxy.ajax : $.ajax;
        var d = $.extend(settings.parameters, {
            resultRows: resultRows,
            type: settings.dataType
        });
        var data = JSON.stringify(d);
        var config = app.customChart.getConfig(type);
        if (config.needData === false) {
            draw(type, {
                result: true
            }, settings, false);
        } else {
            var ajaxRequest = caller({
                url: settings.dataUrl,
                type: "POST",
                dataType: "json",
                data: data,
                success: function(input, isOnline, date) {
                    settings.mobileModeData = {
                        isOnline: isOnline,
                        date: date
                    };
                    if (typeof settings.chartProp == "undefined" && input.detail) {
                        settings = $.extend(settings, JSON.parse(input.detail));
                    }
                    if (settings.beforeDraw) settings.beforeDraw(settings);
                    draw(type, input, settings, false);
                    settings.parameters.selectedItem = null;
                    settings.parameters.isUp = false;
                },
                cache: false,
                contentType: "application/json",
                error: function(d) {
                    if (settings.error) settings.error(settings);
                    if (!app.mobileMode && d && d.responseJSON && d.responseJSON.forceSignout) {
                        console.log("شما از برنامه خارج شده‌اید. ممکن است کاربر دیگری با نام کاربری شما وارد سیستم شده باشد.");
                        alert("شما از برنامه خارج شده‌اید. ممکن است کاربر دیگری با نام کاربری شما وارد سیستم شده باشد.");
                        window.location.href = app.urlPrefix;
                    }
                    var selector = "#" + settings.id;
                    $(selector).addClass("bar-chart").empty();
                    if (d && d.responseJSON && d.responseJSON.desc) {
                        $(selector).addClass("bar-chart").html(filterXSS("<b>" + d.responseJSON.title + ' </b>  <span class="glyphicon glyphicon-info-sign"> </span> <br/ > <p style="direction:ltr;">' + d.responseJSON.desc + "</p>"));
                    } else {
                        $(selector).addClass("bar-chart").html('خطا در دریافت اطلاعات <span class="glyphicon glyphicon-info-sign"> </span>');
                    }
                    $(selector).css({
                        display: "flex",
                        overflow: "auto",
                        padding: "20px 14px",
                        "flex-flow": "column"
                    });
                },
                requestId: settings.requestId
            });
            $(this).data("ajaxRequest", ajaxRequest);
        }
        return $this;
    }
    function getDataUrl(type) {
        if (type.isCustom) {
            return app.urlPrefix + "api/chartdata/getdata";
        }
        switch (parseInt(type.id)) {
          case chartTypes.UserControl:
            return app.urlPrefix + "api/chartdata/GetColumnMembers";

          case chartTypes.Tree:
            return app.urlPrefix + "Charts/BarChart/getTreeData";

          default:
            return app.urlPrefix + "api/chartdata/getdata";
        }
    }
    function draw(type, input, settings, refreshWithDataFlag, redrowAll) {
        if (!settings.editMode) {
            dashboard.setLastRefresh(settings.ChartInPageId, input.LastRefresh);
        }
        invalidateBackground(settings);
        settings.input = input;
        if (arguments.length < 4) {
            $.error("تعداد پارامترها باید حداقل چهار تا باشد");
            return;
        }
        if (typeof settings.chartProp == "undefined") {
            return;
        }
        settings.chartProp = _.extend({
            info: {}
        }, settings.chartProp);
        var refreshPeriod = 0;
        if (settings.chartProp.info.refreshPeriod) {
            refreshPeriod = +settings.chartProp.info.refreshPeriod;
        }
        if (settings.type.isCustom && settings.chartProp.general.info) {
            refreshPeriod = +settings.chartProp.general.info.refreshPeriod;
        }
        if (refreshPeriod > 0) {
            var lastTimeout = $("#" + settings.id).data("timeout");
            if (lastTimeout) clearTimeout(lastTimeout);
            var timeout = setTimeout(function() {
                $("#" + settings.id).charts(type, "refreshWithData", null, {
                    refreshRelatedDatasources: false
                });
            }, refreshPeriod * 1e3);
            $("#" + settings.id).data("timeout", timeout);
        }
        $("#dashboard-chart-panel").trigger("chartComplete", [ settings, input ]);
        var selector = "#" + settings.id;
        if (refreshWithDataFlag && !redrowAll) {
            $(selector).parents(".chart-widget").find(".temporal").remove();
        } else {
            $(selector).addClass("bar-chart").empty();
        }
        if (settings.fromCommentDialog) {
            $(selector).addClass("fromCommentDialog");
        }
        input = $.extend({
            EditPermission: false,
            Description: "",
            LastRefresh: 0,
            isFresh: true,
            title: ""
        }, input);
        var titlebar = {
            title: null,
            showProgress: function() {},
            isProgress: function() {}
        };
        titlebar = d3.select(selector).titlebar({
            EditPermission: input.EditPermission,
            editLink: settings.editLink,
            RemoveFromPage: settings.RemoveFromPage,
            deleteLink: settings.removeLink,
            desc: input.Description,
            LastRefresh: input.LastRefresh,
            isFresh: input.isFresh,
            title: input.title,
            chartId: settings.chartId,
            ChartInPageId: settings.ChartInPageId,
            type: type,
            editMode: settings.editMode,
            refreshWithData: refreshWithDataFlag,
            redrowAll: redrowAll,
            settings: settings,
            showFilterIcon: typeof settings.chartProp.info.showFilterIcon == "undefined" ? 1 : +settings.chartProp.info.showFilterIcon
        });
        settings.titlebar = titlebar;
        titlebar.showProgress(false);
        if (!input.result) {
            $("#" + settings.id).append(app.chartCommons.getError(input));
            $("#" + settings.id).css({
                display: "flex",
                overflow: "auto",
                padding: "20px 14px",
                "flex-flow": "column"
            });
            return;
        }
        if (typeof type.isCustom == "undefined") {
            type = {
                id: +type,
                isCustom: false
            };
        }
        if (type.isCustom) {
            settings.selector = "#" + settings.id;
            var seriesLabels = typeof input.series !== "undefined" ? input.series.labels : [];
            var kpisLabels = typeof input.kpis !== "undefined" ? input.kpis.labels : [];
            if (settings.editMode) {
                $(settings.selector).trigger("chartproperty", [ kpisLabels.concat(seriesLabels) ]);
            }
            app.customChart.charts[type.id](input, settings, refreshWithDataFlag, titlebar);
            return;
        }
        switch (parseInt(type.id)) {
          case chartTypes.BAR:
            app.charts.bar.draw(input, settings, refreshWithDataFlag, titlebar);
            break;

          case chartTypes.GAUGE:
            app.charts.gauge.draw(input, settings, refreshWithDataFlag, titlebar);
            break;

          case chartTypes.PIE:
            app.charts.pie.draw(input, settings, refreshWithDataFlag, titlebar);
            break;

          case chartTypes.TABLE:
            app.charts.table.draw(input, settings, refreshWithDataFlag, titlebar);
            break;

          case chartTypes.MAP:
            app.charts.map.draw(input, settings, refreshWithDataFlag, titlebar);
            break;

          case chartTypes.UserControl:
            app.charts.userControl.draw(input, settings, refreshWithDataFlag, titlebar);
            break;

          case chartTypes.Radar:
            app.charts.radar.draw(input, settings, refreshWithDataFlag, titlebar);
            break;

          case chartTypes.Tree:
            app.charts.tree.draw(input, settings, refreshWithDataFlag, titlebar);
            break;

          case chartTypes.Text:
            app.charts.text.draw(input, settings, refreshWithDataFlag, titlebar);
            break;

          default:        }
        app.lang.setLang({
            selector: selector
        });
        if (settings.finishDraw) settings.finishDraw(settings);
        app.chartCommons.renderComments(settings, input);
    }
    app.chartCommons.draw = draw;
    app.customChart = {
        cacheJs: {},
        charts: {},
        getJs: function(id, success, fail) {
            if (typeof app.customChart.cacheJs[id] != "undefined") {
                success(app.customChart.cacheJs[id]);
                return;
            }
            $.ajax({
                url: app.urlPrefix + "api/customcharts/getjs/" + id,
                cache: true
            }).done(function(data) {
                app.customChart.cacheJs[id] = data;
                var $script = $("head script#id-" + id);
                if (!$script.length) {
                    $("head").append("<script id=" + "id-" + id + ">" + " app.customChart.charts[" + id + "] = function(input, settings, refreshWithData, titlebar){" + "\n" + data.code + "\n" + "}</script>");
                    $("head").append('<style type="text/css">' + "\n" + data.css + "\n" + "</style>");
                }
                success(data);
            }).fail(function(xhr, textStatus, errorThrown) {
                if (fail) fail();
            });
        },
        getConfig: function(type) {
            var config = {};
            if (app.customChart.config && app.customChart.config[type.id] && type.isCustom) {
                config = app.customChart.config[type.id] || {};
            }
            return config;
        }
    };
})(jQuery);

var app = app || {};

app.charts = app.charts || {};

app.charts.gauge = {};

app.charts.gauge.draw = function(input, settings, refreshWithData, titlebar) {
    settings.input = input;
    app.chartCommons.calculateFields(input.series, settings.calculatedFields);
    var title = input.title;
    var chartInfo = input.chartInfo;
    var showPersian = typeof input.lang == "undefined" ? true : +input.lang == 0 ? true : false;
    var seriesLabels = typeof input.series != "undefined" ? input.series.labels : [];
    var kpisLabels = typeof input.kpis != "undefined" ? input.kpis.labels : [];
    var seriesLabelsCaptions = input.seriesLablesCaptions;
    var kpisLabelsCaptions = input.kpisLablesCaptions;
    var yAxeLable = settings.LabelY;
    var selector = "#" + settings.id;
    var margin = {
        top: 95,
        right: 20,
        bottom: 0,
        left: 20
    };
    var width = $(selector).width();
    var isFromCommentDialog = $(selector).hasClass("fromCommentDialog");
    var barHeight = settings.chartProp.info.chartSize == "small" ? 70 + 150 : settings.chartProp.info.chartSize == "medium" ? 100 + 150 : settings.chartProp.info.chartSize == "large" ? 130 + 150 : settings.chartProp.info.chartSize == "veryLarge" ? 180 + 150 : 100 + 150;
    var arcHeight = settings.chartProp.info.height == "small" ? 20 : settings.chartProp.info.height == "medium" ? 30 : settings.chartProp.info.height == "large" ? 40 : settings.chartProp.info.height == "veryLarge" ? 50 : 30;
    var hasHref = settings.chartProp.info.openDashboard && settings.chartProp.info.openDashboard.checked;
    var height = barHeight + margin.top + margin.bottom;
    var colors = d3.scaleOrdinal(d3.schemeCategory10);
    settings.width = width;
    var isProgress = titlebar.isProgress;
    var showProgress = titlebar.showProgress;
    var title = titlebar.title;
    function propertyOf(o, k) {
        if (typeof o == "undefined") return null;
        return o[k];
    }
    var formatString = propertyOf(settings.chartProp.info.font, "formatString") || settings.chartProp.info.formatString || ",.2f";
    var formatStringCustom = propertyOf(settings.chartProp.info.font, "formatStringCustom") || settings.chartProp.info.formatString || ",.2f";
    var fontName = propertyOf(settings.chartProp.info.font, "fontName") || "Droid";
    var fontSize = propertyOf(settings.chartProp.info.font, "fontSize") || settings.chartProp.info.fontSize || "46px";
    var italic = propertyOf(settings.chartProp.info.font, "italic") != null ? propertyOf(settings.chartProp.info.font, "italic") : settings.chartProp.info.textItalic || false;
    var color = propertyOf(settings.chartProp.info.font, "color") || settings.chartProp.info.color || "#333333";
    var bold = propertyOf(settings.chartProp.info.font, "bold") != null ? propertyOf(settings.chartProp.info.font, "bold") : settings.chartProp.info.textBold || false;
    var font = {};
    font.formatString = formatString;
    font.formatStringCustom = formatStringCustom;
    font.fontName = fontName;
    font.fontSize = fontSize;
    font.italic = italic;
    font.color = color;
    font.bold = bold;
    font.formatString = font.formatString != "custom" ? font.formatString : font.formatStringCustom;
    app.chartCommons.setDefault(settings.chartProp, kpisLabels.concat(seriesLabels), "gauge");
    if (settings.editMode) {
        $(selector).trigger("chartproperty", [ seriesLabels.concat(kpisLabels) ]);
    }
    if (!input.result) {
        $("#" + settings.id).append(app.chartCommons.getError(input));
        return;
    }
    var data = prepareData(input);
    settings.chartProp.info.segmentType = settings.chartProp.info.segmentType || "singleSegment";
    var isSingleSegment = settings.chartProp.info.segmentType == "singleSegment";
    var defaultValue = settings.chartProp.info.value;
    var defaultTarget = settings.chartProp.info.target;
    var defaultTrend = settings.chartProp.info.trend;
    var defaultStatus = settings.chartProp.info.status;
    var defaultMin = settings.chartProp.info.min;
    var defaultMax = settings.chartProp.info.max;
    var defaultYellow = settings.chartProp.info.yellow;
    var defaultGreen = settings.chartProp.info.green;
    if (defaultTarget == "") defaultTarget = undefined;
    var hasValue = isNaN(defaultValue || "nan") ? false : true;
    var hasTarget = isNaN(defaultTarget || "nan") ? false : true;
    var hasStatus = isNaN(defaultStatus || "nan") ? false : true;
    var hasTrend = isNaN(defaultTrend || "nan") ? false : true;
    var hasMin = isNaN(defaultMin || "nan") ? false : true;
    var hasMax = isNaN(defaultMax || "nan") ? false : true;
    var hasYellow = isNaN(defaultYellow || "nan") ? false : true;
    var hasGreen = isNaN(defaultGreen || "nan") ? false : true;
    $(selector).css({
        overflow: "auto",
        padding: "0"
    });
    if ((!_.isArray(input.levels) || input.levels.length == 0) && !settings.editMode) {
        $(selector).css({
            overflow: "hidden"
        });
    }
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var kpi = [];
        if (isSingleSegment) kpi = [ +defaultValue, +defaultTarget, +defaultStatus, +defaultTrend ]; else kpi = [ +defaultValue, +defaultTarget, +defaultTrend, +defaultMin, +defaultYellow, +defaultGreen, +defaultMax ];
        var changeKpi = false;
        for (var j = 0; j < item.series.length; j++) {
            var prop = settings.chartProp.series[seriesLabels[j]];
            var index = -1;
            if (isSingleSegment) index = prop.type == "value" && !hasValue ? 0 : prop.type == "target" && !hasTarget ? 1 : prop.type == "status" && !hasStatus ? 2 : prop.type == "trend" && !hasTrend ? 3 : -1; else index = prop.typeMs == "value" && !hasValue ? 0 : prop.typeMs == "target" && !hasTarget ? 1 : prop.typeMs == "trend" && !hasTrend ? 2 : prop.typeMs == "min" && !hasMin ? 3 : prop.typeMs == "yellow" && !hasYellow ? 4 : prop.typeMs == "green" && !hasGreen ? 5 : prop.typeMs == "max" && !hasMax ? 6 : -1;
            if (index != -1) {
                kpi[index] = item.series[j] * +prop.numberFactor;
                changeKpi = true;
            }
        }
        if (changeKpi || item.kpis.length == 0) item.kpis.push(kpi);
        if (isSingleSegment) {
            if (typeof kpi[0] == "undefined" || isNaN(kpi[0])) kpi[0] = 0;
            if (typeof kpi[2] == "undefined" || isNaN(kpi[2])) kpi[2] = 1;
            if (typeof kpi[3] == "undefined" || isNaN(kpi[3])) kpi[3] = 1;
        } else {
            if (typeof kpi[0] == "undefined" || isNaN(kpi[0])) kpi[0] = 0;
            if (typeof kpi[2] == "undefined" || isNaN(kpi[2])) kpi[2] = 1;
            if (typeof kpi[3] == "undefined" || isNaN(kpi[3])) kpi[3] = 0;
            if (typeof kpi[4] == "undefined" || isNaN(kpi[4])) kpi[4] = kpi[0] > 0 ? kpi[0] * .3 : 30;
            if (typeof kpi[5] == "undefined" || isNaN(kpi[5])) kpi[5] = kpi[0] > 0 ? kpi[0] * .7 : 70;
            if (typeof kpi[6] == "undefined" || isNaN(kpi[6])) kpi[6] = kpi[0] > 0 ? kpi[0] * 1.2 : 100;
        }
    }
    var legendBar = d3.select(selector).append("div").attr("class", "legend-bar temporal");
    legendBar.breadcrumb(input.levels, settings, titlebar, showPersian);
    if (!input.matrix || input.matrix.length == 0) {
        d3.select(selector).append("div").attr("class", "temporal").style("font-size", "0.8em").style("margin", "15px").append("span").attr("class", "translate").attr("data-trans-key", "داده‌ای برای نمایش وجود ندارد").text("داده‌ای برای نمایش وجود ندارد");
        return;
    }
    function getFloat(d, isMax) {
        return isNaN(d) ? isMax ? -99999 : 99999 : parseFloat(d);
    }
    var max = d3.max(data, function(d) {
        return d3.max(d.kpis, function(d) {
            return Math.max(getFloat(d[0], true), getFloat(d[1], true));
        });
    });
    var min = d3.min(data, function(d) {
        return d3.min(d.kpis, function(d) {
            return Math.min(getFloat(d[0], false), getFloat(d[1], false));
        });
    });
    var pkiColors = [ "#eee", "#ddd", "#ccc" ];
    var redColor = settings.chartProp.info.colorAriaOne || "#e14d57";
    var yellowColor = settings.chartProp.info.colorAriaTwo || "#FBEE58";
    var greenColor = settings.chartProp.info.colorAriaThree || "#71b37c";
    var getStatusColor = function(val) {
        if (val > 0) {
            return greenColor;
        } else if (val == 0) {
            return yellowColor;
        } else {
            return redColor;
        }
    };
    var myInterpolate = function(a, b) {
        var re = /^([0-9,.-]+)$/, ma, mb, f = d3.format(font.formatString);
        ma = re.exec(a);
        mb = re.exec(b);
        if (ma && mb) {
            a = parseFloat(ma[1]);
            b = parseFloat(mb[1]) - a;
            return function(t) {
                var v = a + b * t;
                return persian(f(v), showPersian);
            };
        } else {
            return function(t) {
                return a;
            };
        }
    };
    var gaugeHeight = barHeight;
    if (app.dashboardLayoutVersion == 2) {}
    var vw = $(selector).width();
    var vh = $(selector).height();
    var items = data.length;
    function getWidgetSize(vw, vh, items, type) {
        var minW = type == "arc" ? 200 : type == "number" ? 150 : 150;
        var minH = type == "arc" ? 200 : type == "number" ? 100 : 60;
        if (vw >= items * minW) {
            return {
                w: vw / items,
                h: Math.max(vh, minH)
            };
        }
        if (vh >= items * minH) {
            return {
                w: Math.max(vw, minW),
                h: vh / items
            };
        }
        var columnCount = Math.ceil(vw * 1 / minW);
        var rowCount = Math.ceil(items * 1 / columnCount);
        return {
            w: Math.max(vw / columnCount, minW),
            h: Math.max(vh / rowCount, minH)
        };
    }
    var widgetSize = getWidgetSize(vw, vh, items, settings.chartProp.info.style);
    d3.select(selector).styles({
        display: "flex",
        "align-items": "center",
        "flex-direction": "column"
    });
    var barWidth = width;
    widgetSize.h -= 28;
    widgetSize.w -= 28;
    if ((!_.isArray(input.levels) || input.levels.length == 0) && !settings.editMode && items == 1) {
        $(selector).css({
            overflow: "hidden"
        });
    }
    var div1 = d3.select(selector).append("div").attr("class", "temporal gauge-container").styles({
        display: "flex",
        "align-items": "center",
        "flex-wrap": "wrap",
        "justify-content": "space-around",
        "flex-grow": 1,
        "flex-shrink": 1,
        "flex-basis": "0%",
        width: "100%"
    }).selectAll("nothings").data(data).enter().append("div").attr("class", function(d, i) {
        if (d.onClickVal == "" && !hasHref) return "gauge-item temporal"; else return "gauge-item temporal pointer";
    }).on("click", function(d, i) {
        if (isFromCommentDialog) {
            app.chartCommons.commentUtils.clickOnCommentIcon(d, settings.ChartInPageId);
            return;
        }
        if (d.onClickVal == "") {
            if (hasHref && !settings.editMode) {
                app.chartCommons.openLink(settings.chartProp.info.openDashboard, {
                    ChartInPageId: settings.ChartInPageId,
                    DataSourceId: settings.input.DataSourceId,
                    dimensionName: settings.input.dimensionName,
                    value: d.value,
                    refreshDatasource: settings.input.RefreshDatasource
                });
            }
            return;
        }
        if (isProgress()) return;
        showProgress(true);
        settings.drill = "down";
        app.chartCommons.drillDown.add(settings.ChartInPageId, settings.input.DataSourceId, settings.input.CurrentDimName, d.onClickVal, settings.input.RefreshDatasource);
        settings.parameters = {
            selectedItem: d.onClickVal,
            chartId: settings.chartId,
            ChartInPageId: settings.ChartInPageId
        };
        app.chartCommons.levelTypeUtils.getParam(settings);
        $(selector).charts(settings.type, "refreshWithData", settings);
    }).each(function(d, i) {
        switch (settings.chartProp.info.style) {
          case "arc":
            if (isSingleSegment) createArcGauge(this, d, i, widgetSize.h, widgetSize.w); else createArcGaugeMultiSection(this, d, i, widgetSize.h, widgetSize.w);
            break;

          case "horizontal":
            if (isSingleSegment) createLinearGauge(this, d, i, widgetSize.h, widgetSize.w); else createLinearGaugeMultiSection(this, d, i, widgetSize.h, widgetSize.w);
            break;

          case "circle":
            if (isSingleSegment) createArcGauge(this, d, i, widgetSize.h, widgetSize.w); else createArcGaugeMultiSection(this, d, i, widgetSize.h, widgetSize.w);
            break;

          case "semiCircle":
            if (isSingleSegment) createArcGauge(this, d, i, widgetSize.h, widgetSize.w); else createArcGaugeMultiSection(this, d, i, widgetSize.h, widgetSize.w);
            break;

          case "verical":
            if (isSingleSegment) createLinearGauge(this, d, i, widgetSize.h, widgetSize.w); else createLinearGaugeMultiSection(this, d, i, widgetSize.h, widgetSize.w);
            break;

          case "number":
            createNumber(this, d, i, widgetSize.h, widgetSize.w);
            break;

          default:        }
    });
    function createLinearGauge(n, divdata, divindex, h, w) {
        var pad = 5;
        w -= 24 * 2;
        var divsr = d3.select(n).selectAll("nothings").data(function(d) {
            return d.kpis;
        }).enter().append("div").styles({
            width: w + "px",
            "margin-left": "10px",
            "margin-right": "10px"
        }).append("div");
        var cols = "12";
        if (settings.chartProp.info.showLabels) {
            divsr.append("div").text(function(d, i) {
                var kl = kpisLabels[i];
                return persian(divdata.label + (kl ? " - " + kl : ""), showPersian);
            });
            var cols = "9";
        }
        var divs = divsr.append("div");
        var textDivValue = divs.append("div").style("text-align", "left").style("position", "relative");
        barWidth = $(divs._groups[0][0]).width();
        var svgs = divs.append("svg").attr("width", barWidth).attr("class", "line-svg").attr("height", arcHeight + 2 * pad);
        var newMin = 0, newMax = 0;
        if (min >= 0 && max >= 0) {
            newMin = 0;
            newMax = 1.2 * max;
        } else {
            var m = Math.max(Math.abs(max), Math.abs(min));
            newMin = m * -1.2;
            newMax = m * 1.2;
        }
        var x = d3.scaleLinear().range([ 0, barWidth ]).domain([ newMin, newMax ]);
        svgs.append("rect").attr("height", arcHeight).attr("y", pad).attr("fill", pkiColors[0]).attr("width", barWidth);
        svgs.append("rect").attr("height", arcHeight).attr("y", pad).attr("fill", function(d, i) {
            return getStatusColor(d[2]);
        }).attr("width", 0).transition().duration(settings.animationDuration).attr("width", function(d) {
            return x(d[0]);
        });
        svgs.append("rect").attr("width", "5").attr("x", "0").attr("y", "0").attr("height", arcHeight + pad).attr("fill", "#333").transition().duration(settings.animationDuration).attr("x", function(d) {
            return x(d[0]) - 5 < newMin ? newMin : x(d[0]) - 5;
        });
        svgs.filter(function(d) {
            return !isNaN(d[1]);
        }).append("path").attr("transform", function(d) {
            return "translate(" + (x(d[1]) - 5 < newMin ? newMin : x(d[1]) - 5) + ",0)";
        }).attr("d", "M0 " + pad + " 0 " + (arcHeight + 2 * pad)).attr("stroke-dasharray", "2,2").attr("stroke-width", "2").attr("stroke", "black").attr("fill", "none").attr("class", "target-pointer").style("display", function(d) {
            if (isNaN(d[1])) return "none";
            return "auto";
        });
        var textDiv = divs.append("div").style("text-align", "left").style("position", "relative");
        textDivValue.append("div").attr("class", "gauge-value").style("color", font.color).style("font-family", font.fontName).style("font-size", font.fontSize).style("font-weight", font.bold ? "bold" : "normal").style("font-style", font.italic ? "italic" : "normal").text(function(d) {
            return persian(d3.format(font.formatString)(d[0]), showPersian);
        }).style("left", "0").transition().duration(settings.animationDuration).style("left", function(d) {
            var ow = $(this).outerWidth();
            var left = x(d[0]) - 5 - ow / 2;
            if (left < 0) left = 0;
            if (left + ow > barWidth) left = barWidth - ow;
            return left + "px";
        }).tween("text", function(d) {
            var i = myInterpolate("0", d[0]);
            var node = this;
            return function(t) {
                node.textContent = i(t);
            };
        });
        var target = textDiv.filter(function(d) {
            return !isNaN(d[1]);
        }).append("div").attr("class", "gauge-target").text(function(d) {
            return persian(d3.format(font.formatString)(d[1]), showPersian);
        }).style("left", function(d) {
            var ow = $(this).outerWidth();
            var left = x(d[1]) - 5 - ow / 2;
            if (left < 0) left = 0;
            if (left + ow > barWidth) left = barWidth - ow;
            return left + "px";
        }).style("display", function(d) {
            if (isNaN(d[1])) return "none";
            return "auto";
        });
        var valueDivHeight = $(textDivValue._groups[0][0]).find(".gauge-value").outerHeight();
        var targetDivHeight = $(textDiv._groups[0][0]).find(".gauge-target").outerHeight();
        textDivValue.style("height", valueDivHeight + "px");
        $(textDivValue._groups[0][0]).find(".gauge-value").css("height", valueDivHeight + "px");
        $(textDivValue._groups[0][0]).find(".gauge-value").css("position", "absolute");
        textDiv.style("height", targetDivHeight + "px");
        $(textDiv._groups[0][0]).find(".gauge-target").css("height", targetDivHeight + "px");
        $(textDiv._groups[0][0]).find(".gauge-target").css("position", "absolute");
    }
    function createNumber(n, divdata, divindex, h, w) {
        var root = d3.select(n);
        root.style("display", "none");
        var divs = d3.select(n).selectAll("nothings").data(function(d) {
            return d.kpis;
        }).enter().append("div");
        if (settings.chartProp.info.haveCustomText) {
            divs.append("div").attr("class", "custom-text-gauge").call(function(d) {
                var thens = _.reduce(app.chartCommons.indicator.getIndicator(data[divindex].series, seriesLabels, settings.chartProp.indicator), function(r, v) {
                    r = r || [];
                    r.push(v);
                    return r;
                });
                var selectedLable = seriesLabels[0];
                _.forOwn(settings.chartProp.series, function(value, key) {
                    if (settings.chartProp.series[key].type === "value") {
                        selectedLable = key;
                    }
                });
                var thisThens = _.filter(thens, {
                    firstField: selectedLable
                });
                d.html(function(d2, i) {
                    var kl = kpisLabels[i];
                    var label = persian(divdata.label + (kl ? " - " + kl : ""), showPersian);
                    var value = persian(d3.format(font.formatString)(d2[0]), showPersian);
                    var iconThen = _.filter(thisThens, {
                        operand: "2"
                    });
                    var icon = "";
                    var iconType = "icon";
                    if (settings.chartProp.info.icons && settings.chartProp.info.icons.length) {
                        icon = settings.chartProp.info.icons[divindex % settings.chartProp.info.icons.length];
                        if (typeof icon === "string") {
                            icon = "";
                        } else {
                            iconType = icon.type || "icon";
                            icon = icon.name;
                        }
                    }
                    if (iconThen.length) {
                        icon = iconThen[iconThen.length - 1].secondFieldIcon.name;
                        iconType = iconThen[iconThen.length - 1].secondFieldIcon.type;
                    }
                    var colorThen = _.filter(thisThens, {
                        operand: "1"
                    });
                    var color = font.color;
                    if (colorThen.length) color = colorThen.pop().secondFieldColor;
                    var iconTag = "";
                    if (iconType === "icon") {
                        iconTag = '<i class="' + icon + '"></i>';
                    }
                    if (iconType === "image") {
                        iconTag = '<img style="width:1.5em" src="' + app.urlPrefix + "api/upload/getpic/" + icon + '"></i>';
                    }
                    var o = settings.chartProp.info.customText.replace("@value", '<span class="ltr inline">' + value + "</span>").replace("@label", label).replace("@icon", iconTag);
                    return o;
                });
            });
            $(root.node()).transition("scale");
            return;
        }
        var size = settings.chartProp.info.height === "small" ? "mini" : settings.chartProp.info.height === "medium" ? "tiny" : settings.chartProp.info.height === "large" ? "" : "large";
        var statistic = divs.append("div").attr("class", "ui xstatistic " + size).call(function(d) {
            var thens = _.reduce(app.chartCommons.indicator.getIndicator(data[divindex].series, seriesLabels, settings.chartProp.indicator), function(r, v) {
                r = r || [];
                r.push(v);
                return r;
            });
            var selectedLable = seriesLabels[0];
            _.forOwn(settings.chartProp.series, function(value, key) {
                if (settings.chartProp.series[key].type === "value") {
                    selectedLable = key;
                }
            });
            var thisThens = _.filter(thens, {
                firstField: selectedLable
            });
            d.styles({
                color: font.color,
                "font-family": font.fontName,
                "font-size": font.fontSize,
                "font-weight": font.bold ? "bold" : "normal",
                "font-style": font.italic ? "italic" : "normal"
            });
            d.append("div").classed("value", true).append("span").attr("class", "text ltr inline").text(function(d) {
                return persian(d3.format(font.formatString)(d[0]), showPersian);
            });
            d.select(".value").append("i").attr("class", function(d, i) {
                var iconThen = _.filter(thisThens, {
                    operand: "2"
                });
                var icon = "";
                if (settings.chartProp.info.icons && settings.chartProp.info.icons.length) {
                    icon = settings.chartProp.info.icons[divindex % settings.chartProp.info.icons.length];
                    if (typeof icon === "string") {
                        icon = "";
                    } else {
                        icon = icon.name;
                    }
                }
                if (iconThen.length) icon = iconThen[iconThen.length - 1].secondFieldIcon;
                if (!icon) {
                    icon = "ng-hide";
                }
                return icon;
            }).style("color", function(d) {
                var colorThen = _.filter(thisThens, {
                    operand: "1"
                });
                var color = font.color;
                if (colorThen.length) color = colorThen.pop().secondFieldColor;
                return color;
            }).style("font-size", font.fontSize).style("margin", "0 10px");
        }).call(function(d) {
            var label = d.append("div").classed("xlabel", true).styles({
                "font-family": font.fontName,
                "line-height": "1.7em",
                "font-size": "40%",
                "font-weight": "300"
            });
            if (settings.chartProp.info.valueStaticTop) {
                label.append("div").text(settings.chartProp.info.valueStaticTop);
            }
            if (settings.chartProp.info.showLabels) {
                label.append("div").text(function(d, i) {
                    var kl = kpisLabels[i];
                    return persian(divdata.label + (kl ? " - " + kl : ""), showPersian);
                });
            }
            if (settings.chartProp.info.valueStaticDown) {
                label.append("div").text(settings.chartProp.info.valueStaticDown);
            }
        });
        $(root.node()).transition("scale");
    }
    function createLinearGaugeMultiSection(n, divdata, divindex, h, w) {
        var pad = 5;
        w -= 24 * 2;
        var divsr = d3.select(n).selectAll("nothings").data(function(d) {
            return d.kpis;
        }).enter().append("div").styles({
            "margin-left": "10px",
            "margin-right": "10px",
            width: w + "px"
        }).append("div");
        var cols = "12";
        if (settings.chartProp.info.showLabels) {
            divsr.append("div").text(function(d, i) {
                var kl = kpisLabels[i];
                return persian(divdata.label + (kl ? " - " + kl : ""), showPersian);
            });
            var cols = "9";
        }
        var divs = divsr.append("div").attr("class", "col-md-" + cols);
        var textDivValue = divs.append("div").style("text-align", "left").style("position", "relative");
        barWidth = $(divs._groups[0][0]).width();
        var svgs = divs.append("svg").attr("width", barWidth).attr("height", arcHeight + 2 * pad);
        var xarray = [];
        svgs._groups.forEach(function(d, i) {
            var data = d[0].__data__;
            xarray.push(d3.scaleLinear().range([ 0, barWidth ]).domain([ data[3], data[6] ]));
        });
        svgs.append("rect").attr("height", arcHeight).attr("y", pad).attr("fill", greenColor).attr("width", barWidth);
        svgs.append("rect").attr("height", arcHeight).attr("y", pad).attr("fill", yellowColor).attr("width", function(d, i) {
            return xarray[i](d[5]);
        });
        svgs.append("rect").attr("height", arcHeight).attr("y", pad).attr("fill", redColor).attr("width", function(d, i) {
            return xarray[i](d[4]);
        });
        svgs.append("path").attr("transform", function(d, i) {
            var val = xarray[i](d[3] < d[6] ? d[3] : d[6]);
            return "translate(" + (val < xarray[i](d[3]) ? xarray[i](d[3]) : val) + ",0)";
        }).attr("d", "M0 " + pad + " 0 " + (arcHeight + 2 * pad)).attr("stroke-dasharray", "2,2").attr("stroke-width", "1").attr("stroke", "black").attr("fill", "none").attr("class", "none");
        svgs.append("path").attr("transform", function(d, i) {
            var val = xarray[i](d[6] < d[6] ? d[6] : d[6]);
            return "translate(" + (val < xarray[i](d[3]) ? xarray[i](d[3]) : val) + ",0)";
        }).attr("d", "M0 " + pad + " 0 " + (arcHeight + 2 * pad)).attr("stroke-dasharray", "2,2").attr("stroke-width", "1").attr("stroke", "black").attr("fill", "none").attr("class", "none");
        svgs.append("path").attr("transform", function(d, i) {
            var val = xarray[i](d[5] < d[6] ? d[5] : d[6]);
            return "translate(" + (val < xarray[i](d[3]) ? xarray[i](d[3]) : val) + ",0)";
        }).attr("d", "M0 " + pad + " 0 " + (arcHeight + 2 * pad)).attr("stroke-dasharray", "2,2").attr("stroke-width", "1").attr("stroke", "black").attr("fill", "none").attr("class", "none");
        svgs.append("path").attr("transform", function(d, i) {
            var val = xarray[i](d[4] < d[6] ? d[4] : d[6]);
            return "translate(" + (val < xarray[i](d[3]) ? xarray[i](d[3]) : val) + ",0)";
        }).attr("d", "M0 " + pad + " 0 " + (arcHeight + 2 * pad)).attr("stroke-dasharray", "2,2").attr("stroke-width", "1").attr("stroke", "black").attr("fill", "none");
        svgs.append("rect").attr("width", "5").attr("x", "0").attr("y", "0").attr("height", arcHeight + pad).attr("fill", "#333").transition().duration(settings.animationDuration).attr("x", function(d, i) {
            var val = xarray[i](d[0] < d[3] ? d[3] : d[0] < d[6] ? d[0] : d[6]) - 5;
            return val < xarray[i](d[3]) ? xarray[i](d[3]) : val;
        });
        svgs.filter(function(d) {
            return !isNaN(d[1]);
        }).append("path").attr("transform", function(d, i) {
            var val = xarray[i](d[1] < d[6] ? d[1] : d[6]) - 5;
            return "translate(" + (val < xarray[i](d[3]) ? xarray[i](d[3]) : val) + ",0)";
        }).attr("d", "M0 " + pad + " 0 " + (arcHeight + 2 * pad)).attr("stroke-dasharray", "2,2").attr("stroke-width", "2").attr("stroke", "black").attr("fill", "none");
        var textDiv = divs.append("div").style("text-align", "left").style("position", "relative").style("margin-top", "-10px");
        textDivValue.append("span").attr("class", "gauge-value").style("color", font.color).style("font-family", font.fontName).style("font-size", font.fontSize).style("font-weight", font.bold ? "bold" : "normal").style("font-style", font.italic ? "italic" : "normal").text(function(d) {
            return persian(d3.format(font.formatString)(d[0]), showPersian);
        }).style("left", "0").transition().duration(settings.animationDuration).style("left", function(d, i) {
            var ow = $(this).outerWidth();
            var left = xarray[i](d[0]) - 5 - ow / 2;
            if (left < 0) left = 0;
            if (left + ow > barWidth) left = barWidth - ow;
            return left + "px";
        }).tween("text", function(d) {
            var i = myInterpolate(d[3], d[0]);
            var node = this;
            return function(t) {
                node.textContent = i(t);
            };
        });
        textDiv.filter(function(d) {
            return !isNaN(d[1]);
        }).append("span").attr("class", "gauge-target").text(function(d) {
            return persian(d3.format(font.formatString)(d[1]), showPersian);
        }).style("left", function(d, i) {
            var ow = $(this).outerWidth();
            var left = xarray[i](d[1]) - 5 - ow / 2;
            if (left < 0) left = 0;
            if (left + ow > barWidth) left = barWidth - ow;
            return left + "px";
        });
        textDiv.append("span").attr("class", "gauge-target").text(function(d) {
            return persian(d3.format(font.formatString)(d[3]), showPersian);
        }).style("left", function(d, i) {
            var ow = $(this).outerWidth();
            var left = xarray[i](d[3]) - ow / 2;
            if (left < 0) left = 0;
            if (left + ow > barWidth) left = barWidth - ow;
            return left + "px";
        });
        textDiv.append("span").attr("class", "gauge-target").text(function(d) {
            return persian(d3.format(font.formatString)(d[6]), showPersian);
        }).style("left", function(d, i) {
            var ow = $(this).outerWidth();
            var left = xarray[i](d[6]) - ow / 2;
            if (left < 0) left = 0;
            if (left + ow > barWidth) left = barWidth - ow;
            return left + "px";
        });
        textDiv.append("span").attr("class", "gauge-target").text(function(d) {
            return persian(d3.format(font.formatString)(d[4]), showPersian);
        }).style("left", function(d, i) {
            var ow = $(this).outerWidth();
            var left = xarray[i](d[4]) - ow / 2;
            if (left < 0) left = 0;
            if (left + ow > barWidth) left = barWidth - ow;
            return left + "px";
        });
        textDiv.append("span").attr("class", "gauge-target").text(function(d) {
            return persian(d3.format(font.formatString)(d[5]), showPersian);
        }).style("left", function(d, i) {
            var ow = $(this).outerWidth();
            var left = xarray[i](d[5]) - ow / 2;
            if (left < 0) left = 0;
            if (left + ow > barWidth) left = barWidth - ow;
            return left + "px";
        });
        var valueDivHeight = $(textDivValue._groups[0][0]).find(".gauge-value").outerHeight();
        textDivValue.style("height", valueDivHeight + "px");
        $(textDivValue._groups[0][0]).find(".gauge-value").css("height", valueDivHeight + "px");
        $(textDivValue._groups[0][0]).find(".gauge-value").css("position", "absolute");
        var target = $(textDiv._groups[0][0]).find(".gauge-target").outerHeight();
        textDiv.style("height", target + "px");
        $(textDiv._groups[0][0]).find(".gauge-target").css("height", target + "px");
        $(textDiv._groups[0][0]).find(".gauge-target").css("position", "absolute");
    }
    function createArcGauge(n, divdata, divindex, chartHeight, chartWidth) {
        arcPreProcess(n, divdata, divindex, chartHeight, chartWidth, function(divs, needleExtra, extraPointer, startAngle, endAngle, outerRadius, innerRadius, gaugeHeightRatio, gaugeHeight, gaugeInnerHeight, valueYpos, svgHeight) {
            var newMin = 0, newMax = 0;
            if (min >= 0 && max >= 0) {
                newMin = 0;
                newMax = 1.2 * max;
            } else {
                var m = Math.max(Math.abs(max), Math.abs(min));
                newMin = m * -1.2;
                newMax = m * 1.2;
            }
            var x = d3.scaleLinear().range([ startAngle, endAngle ]).domain([ newMin, newMax ]);
            var arc0 = d3.arc().innerRadius(outerRadius).outerRadius(innerRadius).startAngle(startAngle).endAngle(endAngle);
            var arc = d3.arc().innerRadius(outerRadius).outerRadius(innerRadius).startAngle(startAngle).endAngle(function(d) {
                return x(d);
            });
            var svgs = divs.append("div").style("margin-bottom", "0").append("svg").attr("width", outerRadius * 2).attr("height", svgHeight).append("g").attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");
            if (settings.chartProp.info.showLabels) {
                divs.append("div").text(function(d, i) {
                    var kl = kpisLabels[i];
                    return persian(divdata.label + (kl ? " - " + kl : ""), showPersian);
                });
            }
            var backArc = svgs.append("path").attr("d", arc0).attr("transform", "translate(" + needleExtra + "," + needleExtra + ")").attr("fill", pkiColors[0]);
            var backArcHeight = backArc.node().getBBox().height;
            var path = svgs.append("path").attr("fill", function(d, i) {
                return getStatusColor(d[2]);
            }).attr("transform", "translate(" + needleExtra + "," + needleExtra + ")").transition().duration(settings.animationDuration).attrTween("d", function(a) {
                var i = d3.interpolate(newMin, a[0]);
                return function(t) {
                    return arc(i(t));
                };
            });
            var needle = svgs.append("g");
            needle.append("rect").attr("width", "5").attr("transform", "translate(" + (needleExtra - 2.5) + "," + needleExtra + ")").attr("height", outerRadius + extraPointer).attr("fill", "#333");
            needle.attr("transform", "rotate(" + (startAngle * (180 / Math.PI) + 180) + " " + needleExtra + " " + needleExtra + " )");
            needle.append("circle").attr("r", "5").attr("cx", needleExtra).attr("cy", needleExtra);
            needle.transition().duration(settings.animationDuration).attrTween("transform", function(d) {
                var x0 = x(d[0]);
                var zero = startAngle * (180 / Math.PI) + 180;
                if (isNaN(x0)) final = zero; else var final = x(d[0]) * (180 / Math.PI) + 180;
                var i = d3.interpolate(zero, final);
                return function(t) {
                    return "rotate(" + i(t) + " " + needleExtra + " " + needleExtra + " )";
                };
            });
            svgs.filter(function(d) {
                return !isNaN(d[1]);
            }).append("path").attr("d", "M" + needleExtra + " " + needleExtra + " " + needleExtra + " " + (arcHeight + needleExtra + extraPointer)).attr("stroke-dasharray", "2,2").attr("stroke-width", "2").attr("stroke", "black").attr("fill", "none").attr("transform", function(d) {
                return "rotate(" + x(d[1]) * (180 / Math.PI) + " " + needleExtra + " " + needleExtra + ")" + "translate(" + 0 + "," + (-outerRadius - extraPointer) + ")";
            });
            svgs.filter(function(d) {
                return !isNaN(d[1]);
            }).append("text").attr("class", "gauge-target").attr("text-anchor", "middle").attr("dy", "-0.3em").text(function(d) {
                return persian(d3.format(font.formatString)(d[1]), showPersian);
            }).attr("transform", function(d) {
                return "rotate(" + x(d[1]) * (180 / Math.PI) + " " + needleExtra + " " + needleExtra + " )" + "translate(" + needleExtra + "," + (-outerRadius + needleExtra - extraPointer) + ")";
            });
            var box = $(selector + " svg > g").get(0).getBBox();
            var gaugeVal = svgs.append("text").attr("class", "gauge-value").attr("text-anchor", "middle").style("fill", font.color).style("font-family", font.fontName).attr("dy", "1em").style("font-size", font.fontSize).style("font-weight", font.bold ? "bold" : "normal").style("font-style", font.italic ? "italic" : "normal").text(function(d) {
                return persian(d3.format(font.formatString)(d[0]), showPersian);
            }).attr("transform", "translate(" + needleExtra + "," + valueYpos + ")").transition().duration(settings.animationDuration).tween("text", function(d) {
                var i = myInterpolate(d[3], d[0]);
                var node = this;
                return function(t) {
                    node.textContent = i(t);
                };
            });
        });
    }
    function createArcGaugeMultiSection(n, divdata, divindex, chartHeight, chartWidth) {
        arcPreProcess(n, divdata, divindex, chartHeight, chartWidth, function(divs, needleExtra, extraPointer, startAngle, endAngle, outerRadius, innerRadius, gaugeHeightRatio, gaugeHeight, gaugeInnerHeight, valueYpos, svgHeight) {
            var xarray = [];
            divs.each(function(data, i) {
                xarray.push(d3.scaleLinear().range([ startAngle, endAngle ]).domain([ data[3], data[6] ]));
            });
            var arc0 = d3.arc().innerRadius(outerRadius).outerRadius(innerRadius).startAngle(startAngle).endAngle(endAngle);
            var arc = d3.arc().innerRadius(outerRadius).outerRadius(innerRadius).startAngle(function(d) {
                return d.start;
            }).endAngle(function(d) {
                return d.end;
            });
            var arc0 = d3.arc().innerRadius(outerRadius).outerRadius(innerRadius).startAngle(startAngle).endAngle(endAngle);
            var svgs = divs.append("div").style("margin-bottom", "0").append("svg").attr("width", outerRadius * 2 + 2 * needleExtra).attr("height", svgHeight).append("g").attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");
            if (settings.chartProp.info.showLabels) {
                divs.append("div").style("margin-bottom", "10px").text(function(d, i) {
                    var kl = kpisLabels[i];
                    return persian(divdata.label + (kl ? " - " + kl : ""), showPersian);
                });
            }
            function drowArc(startIndex, endIndex, redColor, needleExtra) {
                svgs.append("path").attr("d", function(d, i) {
                    var map = d.map(function(dd, ii) {
                        return xarray[i](dd);
                    });
                    return arc({
                        start: map[startIndex],
                        end: map[endIndex]
                    });
                }).attr("fill", redColor).attr("transform", "translate(" + needleExtra + "," + needleExtra + ")");
            }
            drowArc(3, 4, redColor, needleExtra);
            drowArc(4, 5, yellowColor, needleExtra);
            drowArc(5, 6, greenColor, needleExtra);
            var needle = svgs.append("g");
            needle.append("rect").attr("width", "5").attr("transform", "translate(" + (needleExtra - 2.5) + "," + needleExtra + ")").attr("height", outerRadius + extraPointer).attr("fill", "#333");
            needle.attr("transform", "rotate(" + (startAngle * (180 / Math.PI) + 180) + " " + needleExtra + " " + needleExtra + ")");
            needle.append("circle").attr("r", "5").attr("cx", needleExtra).attr("cy", needleExtra);
            needle.transition().duration(settings.animationDuration).attrTween("transform", function(d, i) {
                var x0 = xarray[i](d[0] < d[3] ? d[3] : d[0] < d[6] ? d[0] : d[6]);
                var zero = startAngle * (180 / Math.PI) + 180;
                var final = zero;
                if (!isNaN(x0)) {
                    var a = d[0] < d[3] ? d[3] : d[0] < d[6] ? d[0] : d[6];
                    final = xarray[0](a) * (180 / Math.PI) + 180;
                }
                var i = d3.interpolate(zero, final);
                return function(t) {
                    return "rotate(" + i(t) + " " + needleExtra + " " + needleExtra + ")";
                };
            });
            extraPointer = 0;
            function drowDashPath(r) {
                svgs.append("path").attr("d", "M" + needleExtra + " " + needleExtra + " " + needleExtra + " " + (arcHeight + extraPointer + needleExtra)).attr("stroke-dasharray", "2,2").attr("stroke-width", "2").attr("stroke", "black").attr("fill", "none").attr("transform", function(d, i) {
                    return "rotate(" + r(d, i) + " " + needleExtra + " " + needleExtra + ")" + "translate(" + 0 + "," + (-outerRadius - extraPointer) + ")";
                });
            }
            drowDashPath(function(d, i) {
                return xarray[i](d[3]) * (180 / Math.PI);
            });
            drowDashPath(function(d, i) {
                return xarray[i](d[6]) * (180 / Math.PI);
            });
            drowDashPath(function(d, i) {
                return xarray[i](d[4]) * (180 / Math.PI);
            });
            drowDashPath(function(d, i) {
                return xarray[i](d[5]) * (180 / Math.PI);
            });
            function drowValue(r, index) {
                svgs.append("text").attr("class", "gauge-target").attr("text-anchor", "middle").attr("dy", "-0.3em").text(function(d) {
                    return persian(d3.format(font.formatString)(d[index]), showPersian);
                }).attr("transform", function(d, i) {
                    return "rotate(" + xarray[i](r(d)) * (180 / Math.PI) + " " + needleExtra + " " + needleExtra + ")" + "translate(" + needleExtra + "," + (-outerRadius + needleExtra - extraPointer) + ")";
                });
            }
            drowValue(function(d) {
                return d[3];
            }, 3);
            drowValue(function(d) {
                return d[6];
            }, 6);
            drowValue(function(d) {
                return d[4];
            }, 4);
            drowValue(function(d) {
                return d[5];
            }, 5);
            var gaugeVal = svgs.append("text").attr("class", "gauge-value").attr("text-anchor", "middle").style("fill", font.color).style("font-family", font.fontName).attr("dy", "1em").style("font-size", font.fontSize).style("font-weight", font.bold ? "bold" : "normal").style("font-style", font.italic ? "italic" : "normal").text(function(d) {
                return persian(d3.format(font.formatString)(d[0]), showPersian);
            }).attr("transform", "translate(" + needleExtra + "," + valueYpos + ")").transition().duration(settings.animationDuration).tween("text", function(d) {
                var i = myInterpolate(d[3], d[0]);
                var node = this;
                return function(t) {
                    node.textContent = i(t);
                };
            });
            d3.select(svgs.node().parentNode).attr("height", svgHeight);
        });
    }
    function arcPreProcess(n, divdata, divindex, chartHeight, chartWidth, callback) {
        var divs = d3.select(n).selectAll("nothings").data(function(d) {
            return d.kpis;
        }).enter().append("div").style("text-align", "center");
        var needleExtra = 0;
        var extraPointer = 10;
        var margin = 0;
        var startAngle = settings.chartProp.info.chartSize == "small" ? -Math.PI * 2 / 5 : settings.chartProp.info.chartSize == "medium" ? -Math.PI * 2 / 4 : -Math.PI * 2 / 3;
        var endAngle = -1 * startAngle;
        var gaugeHeightRatio = Math.abs(Math.sin(startAngle));
        var t = divs.append("div").attr("class", "gauge-value").style("color", font.color).style("font-family", font.fontName).style("font-size", font.fontSize).style("font-weight", font.bold ? "bold" : "normal").style("font-style", font.italic ? "italic" : "normal").text(function(d) {
            return persian(d3.format(font.formatString)(d[0]), showPersian);
        });
        var targetText = divs.append("svg").append("text").attr("class", "gauge-target").attr("text-anchor", "middle").attr("dy", "-0.3em").text(function(d) {
            return persian(d3.format(font.formatString)("80"), showPersian);
        });
        var gaugeValHeight = $(t.node()).height();
        var gaugeValBox = {
            width: $(t.node()).width(),
            height: $(t.node()).height()
        };
        t.remove();
        var targetTextHeight = targetText.node().getBBox().height;
        var targetTextBox = targetText.node().getBBox();
        divs.select("svg").remove();
        var labelDivHeight = settings.chartProp.info.showLabels ? 22 : 0;
        var gaugeOuterHeight = Math.min(chartWidth - extraPointer * 2, chartHeight - gaugeValHeight - labelDivHeight) - margin * 2;
        var recomRadius = gaugeOuterHeight / 2;
        var outerRadius = recomRadius;
        var innerRadius = outerRadius - arcHeight;
        var gaugeHeight = recomRadius * 2 * gaugeHeightRatio;
        var gaugeInnerHeight = innerRadius * 2 * gaugeHeightRatio;
        var betweenArcSpace = (Math.abs(Math.cos(startAngle)) + Math.abs(Math.cos(endAngle))) * recomRadius;
        var canTextPlaceBetweenArcs = betweenArcSpace >= gaugeValBox.width;
        var valueYpos = Math.abs(Math.sin(startAngle)) * recomRadius - gaugeValHeight;
        var svgHeight = gaugeOuterHeight;
        svgHeight = Math.max(svgHeight, gaugeOuterHeight);
        if (callback) callback(divs, needleExtra, extraPointer, startAngle, endAngle, outerRadius, innerRadius, gaugeHeightRatio, gaugeHeight, gaugeInnerHeight, valueYpos, svgHeight);
    }
};

var app = app || {};

app.charts = app.charts || {};

app.charts.map = {};

app.charts.map.draw = function(input, settings, refreshWithData, titlebar) {
    settings.input = input;
    app.chartCommons.calculateFields(input.series, settings.calculatedFields);
    var chartTitle = input.title;
    var chartInfo = input.chartInfo;
    var showPersian = typeof input.lang == "undefined" ? true : +input.lang == 0 ? true : false;
    var seriesLabels = typeof input.series != "undefined" ? input.series.labels : [];
    var kpisLabels = typeof input.kpis != "undefined" ? input.kpis.labels : [];
    var selector = "#" + settings.id;
    var tootipType = +settings.chartProp.info.tooltip || 1;
    var colors = d3.scaleOrdinal(d3.schemeCategory10);
    var isProgress = titlebar.isProgress;
    var showProgress = titlebar.showProgress;
    var title = titlebar.title;
    var hasHref = settings.chartProp.info.openDashboard && settings.chartProp.info.openDashboard.checked;
    app.chartCommons.setDefault(settings.chartProp, kpisLabels.concat(seriesLabels), "map");
    if (settings.editMode) {
        $(selector).trigger("chartproperty", [ kpisLabels.concat(seriesLabels) ]);
    }
    if (!input.result) {
        $("#" + settings.id).append(app.chartCommons.getError(input));
        return;
    }
    if (!input.matrix || input.matrix.length == 0) {
        d3.select(selector).append("div").attr("class", "temporal").style("font-size", "0.8em").style("margin", "15px").append("span").attr("class", "translate").attr("data-trans-key", "داده‌ای برای نمایش وجود ندارد").text("داده‌ای برای نمایش وجود ندارد");
        return;
    }
    var mapId = settings.chartProp.info.map.selectedMap;
    if (typeof settings.map != "undefined" && mapId == settings.map.id) {
        drawMap(settings.map.data);
    } else {
        d3.select(selector + "").append("div").style("padding", "15px").attr("class", "temporal info").text("در حال بارگذاری نقشه ...");
        $.get(app.urlPrefix + "Moderation/Map/Get?Id=" + mapId, null, function(data) {
            if (data.result) {
                settings.map = data.map;
                settings.map.id = mapId;
                drawMap(data.map.data);
            } else {
                d3.select(selector + " .info").text("نقشه انتخاب شده معتبر نیست. در منوی تنظیمات یک نقشه را انتخاب کنید یا نقشه‌ی مورد نظر خود را بارگذاری نمایید.");
            }
        });
    }
    function drawMap(data) {
        var data = JSON.parse(data);
        var mainIndex = seriesLabels.indexOf(settings.chartProp.info.mainSeries);
        if (mainIndex == -1) mainIndex = 0;
        $(selector + " .temporal").remove();
        var mapData = {};
        var mapDataClickValue = {};
        var sum = 0;
        for (var i = 0; i < input.matrix.length; i++) {
            var d = +input.series.data[i][mainIndex];
            mapData[input.matrix[i].captions[0]] = d;
            mapDataClickValue[input.matrix[i].values[0]] = input.matrix[i].values[0];
            sum += d;
        }
        settings.chartProp.info.colorStart = settings.chartProp.info.colorStart || "#31a354";
        settings.chartProp.info.colorEnd = settings.chartProp.info.colorEnd || "#c7e9c0";
        var mainProp = $.extend({
            formatString: ",.0f",
            colorStart: "#31a354",
            colorEnd: "#c7e9c0"
        }, settings.chartProp.series[input.series.labels[mainIndex]]);
        var max = d3.max(input.series.data, function(d) {
            return +d[mainIndex];
        });
        var min = d3.min(input.series.data, function(d) {
            return +d[mainIndex];
        });
        var color = d3.interpolate(settings.chartProp.info.colorEnd, settings.chartProp.info.colorStart);
        var pointerClass = "pointer";
        if (!settings.editMode) {
            pointerClass = "";
        }
        var legendDiv = d3.select(selector).append("div").attr("class", "legend temporal " + pointerClass).styles({
            "text-align": "left",
            position: "absolute",
            "background-color": "#fff",
            "z-index": "1",
            "border-radius": "4px",
            padding: "10px"
        });
        var legendHaveText = false;
        settings.chartProp.info.legendPosition = settings.chartProp.info.legendPosition || "top left";
        var st = {
            "top right": {
                top: 0,
                right: 0
            },
            "top left": {
                top: 0,
                left: 0
            },
            "top center": {
                top: 0,
                right: "50%",
                transform: "translate(50%)"
            },
            "bottom right": {
                bottom: 0,
                right: 0
            },
            "bottom left": {
                bottom: 0,
                left: 0
            },
            "bottom center": {
                bottom: 0,
                right: "50%",
                transform: "translate(50%)"
            },
            "center right": {
                top: "50%",
                right: 0
            },
            "center left": {
                top: "50%",
                left: 0
            }
        };
        legendDiv.styles(st[settings.chartProp.info.legendPosition]);
        if (settings.chartProp.info.showLegend) {
            legend(selector, settings.chartProp.info.colorStart, settings.chartProp.info.colorEnd, min, max, mainProp, legendDiv, mainIndex);
            legendHaveText = true;
        }
        if (settings.chartProp.indicatorLegendShow) {
            legendHaveText = true;
            legendDiv.legend({
                order: "vertical",
                colorPos: "right",
                width: width,
                font: settings.chartProp.indicatorLegendFont,
                position: settings.chartProp.info.legendPosition,
                selector: selector,
                data: _.map(settings.chartProp.indicator, function(d, i) {
                    var then = _.find(d.thenRow, {
                        operand: "1"
                    });
                    var color = then ? then.secondFieldColor : "#eeeeee";
                    var title = d.title || app.chartCommons.indicator.ifToString(d.ifRow, input.series.labels, input.seriesLablesCaptions, settings);
                    return {
                        label: title,
                        color: color
                    };
                })
            }, showPersian);
        }
        if (settings.chartProp.info.showChart && settings.chartProp.info.showChartLegend) {
            var labels = _.map(input.series.labels, function(d, i) {
                return {
                    name: d,
                    prop: getProp(i)
                };
            });
            legendHaveText = true;
            legendDiv.legend({
                order: "vertical",
                colorPos: "right",
                font: settings.chartProp.info.legendFont,
                width: $(selector).width(),
                selector: selector,
                data: labels.filter(function(d, i) {
                    return !d.prop.hidden;
                }).map(function(d) {
                    return {
                        label: (d.prop.name || d.name).replace(/^\[measure\]/, ""),
                        color: d.prop.color,
                        key: d.name
                    };
                })
            }, showPersian);
        }
        var height = $(selector).height();
        var width = $(selector).width();
        if (height < 150) height = 150;
        var json = topojson.feature(data, data.objects.map);
        var indexes = input.matrix.map(function(d) {
            return d.captions[0];
        });
        var codes = _.map(data.objects.map.geometries, "properties.Code");
        var diff = _.differenceWith(indexes, codes, _.isEqual);
        var extraCode = settings.chartProp.info.extraCode || {};
        if (extraCode.enable) {
            legendHaveText = true;
            legendDiv.insert("div", ":first-child").selectAll(".diff").data(diff).enter().append("div").style("margin-bottom", "10px").html(function(d) {
                var index = indexes.indexOf(d + "");
                var data = input.series.data[index];
                var item = _.find(extraCode.items, {
                    code: d
                });
                var name = item && item.caption ? item.caption : d;
                var h = getTooltipHtml(index, tootipType, name);
                var dh = $("<div />").html(h);
                dh.find("> div").css("font-size", settings.chartProp.info.extraCode.font.fontSize || "9px").css("font-family", settings.chartProp.info.extraCode.font.fontName || "IRANSans").css("font-weight", settings.chartProp.info.extraCode.font.bold ? "bold" : "200" || "200").css("font-style", settings.chartProp.info.extraCode.font.italic ? "italic" : "inherit" || "inherit");
                h = dh.html();
                return h;
            });
        }
        var colors = d3.scaleOrdinal(d3.schemeCategory10);
        var maxHeight = height * .25 * (settings.chartProp.info.chartSize || 50) / 100;
        var barWidth = 5;
        var barOriginOfsset = 8;
        var svg = null;
        function drawLeaflet() {
            var realMap = settings.chartProp.info.realMap || {};
            var url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
            if (realMap.type === "open-street-online") {
                url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
            }
            if (realMap.type === "open-street-offline") {
                url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
            }
            if (realMap.type === "google-offline") {
                url = app.urlPrefix + "map_data//Tiles/{z}/gm_{x}_{y}_{z}.png";
            }
            if (realMap.type === "google-online") {
                url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
            }
            $("#" + settings.id).append('<div class="temporal" id = "map" style = "width: 100%; height:100%;" ></div > ');
            var map = L.map($(selector + " #map").get(0)).setView([ 32.8, 53.6894 ], 5);
            L.tileLayer(url, {
                attributionControl: false,
                attribution: "داشبورد مدیریتی صدف"
            }).addTo(map);
            function onEachFeature(feature, layer) {
                layer.on({
                    mousemove: function(e) {
                        var d = e.target.feature;
                        mouseOver(d, null, null, e.containerPoint);
                    },
                    mouseout: mouseOut,
                    click: function(e) {
                        console.log(e);
                        var d = e.target.feature;
                        clicked(d);
                    }
                });
            }
            var geo = L.geoJson(json, {
                style: function(f, i) {
                    var color = getColorOfMap(f);
                    return {
                        color: settings.chartProp.info.borderColor || "#666",
                        strokeWidth: (settings.chartProp.info.borderWidth || "0.5") + "px",
                        fillColor: color,
                        fillOpacity: realMap.fillOpacity || .5,
                        weight: .8
                    };
                },
                onEachFeature: onEachFeature
            }).addTo(map);
            svg = d3.select(map.getPanes().overlayPane).append("svg");
            if (legendHaveText) {
                var legend = L.control({
                    position: settings.chartProp.info.legendPosition.replace(" ", "")
                });
                legend.onAdd = function(map) {
                    var div = $("<div />").css({
                        background: "#fff",
                        padding: "10px",
                        "border-radius": "4px",
                        "font-family": "iransans"
                    }).html(legendDiv.html()).get(0);
                    legendDiv.style("display", "none");
                    return div;
                };
                legend.addTo(map);
            }
            var getCenter = function(d) {
                var latLng = [ 0, 0 ];
                geo.eachLayer(function(layer) {
                    if (layer.feature.properties.Code === d.properties.Code) {
                        latLng = layer.getBounds().getCenter();
                    }
                });
                var center = map.latLngToLayerPoint(latLng);
                return center;
            };
            var dp = function() {
                if (settings.chartProp.info.showChart && settings.chartProp.info.chartType === "bar") {
                    drawBar(svg, getCenter, null);
                }
                if (settings.chartProp.info.showChart && settings.chartProp.info.chartType === "pie") {
                    drawPie(svg, getCenter, null);
                }
                if (settings.chartProp.info.showName) {
                    showNames(svg, getCenter);
                }
                if (settings.chartProp.info.showValue) {
                    showValues(svg, getCenter);
                }
            };
            map.on("zoomstart", function(e) {
                $(svg.node()).fadeOut();
            });
            var timer = null;
            map.on("zoomend", function(e) {
                if (timer) clearTimeout(timer);
                timer = setTimeout(function() {
                    svg.selectAll("*").remove();
                    dp();
                    $(svg.node()).fadeIn();
                }, 400);
            });
            dp();
            var panes = map.getPanes();
            var z = 1;
            _.each(panes, function(pane) {
                pane.style.zIndex = z++;
            });
            $(selector + " .leaflet-control-container").children().css("z-index", 1);
            console.log($(selector + " .leaflet-control-zoom "));
        }
        var path;
        function drawD3() {
            var projection = d3.geoMercator().scale(1).translate([ 0, 0 ]);
            path = d3.geoPath().projection(projection);
            var b = path.bounds(json), s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height), t = [ (width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2 ];
            projection.scale(s).translate(t);
            path = path.projection(projection);
            svg = d3.select(selector).append("div").style("overflow", "hidden").style("position", "relative").attr("class", "map-container temporal").append("svg").attr("class", "temporal").attr("width", width).attr("height", height).append("g");
            svg.selectAll("path").data(json.features).enter().append("path").attr("d", path).classed("pointer", true).style("fill", getColorOfMap).on("click", clicked).on("mousemove", mouseOver).on("mouseout", mouseOut);
            svg.append("path").datum(topojson.mesh(data, data.objects.map, function(a, b) {
                return true;
            })).attr("id", "state-borders").attr("stroke", settings.chartProp.info.borderColor || "#666").style("stroke-width", (settings.chartProp.info.borderWidth || "0.5") + "px").attr("d", path);
            if (settings.chartProp.info.showChart && settings.chartProp.info.chartType === "bar") {
                drawBar(svg, function(d) {
                    var c = path.centroid(d);
                    return {
                        x: c[0],
                        y: c[1]
                    };
                }, clicked);
            }
            if (settings.chartProp.info.showChart && settings.chartProp.info.chartType === "pie") {
                drawPie(svg, function(d) {
                    var c = path.centroid(d);
                    return {
                        x: c[0],
                        y: c[1]
                    };
                }, clicked);
            }
            if (settings.chartProp.info.showName) {
                showNames(svg, function(d) {
                    var c = path.centroid(d);
                    return {
                        x: c[0],
                        y: c[1]
                    };
                }, clicked);
            }
            if (settings.chartProp.info.showValue) {
                showValues(svg, function(d) {
                    var c = path.centroid(d);
                    return {
                        x: c[0],
                        y: c[1]
                    };
                }, clicked);
            }
        }
        function getColorOfMap(d) {
            var headers = input.series.labels;
            var index = indexes.indexOf(d.properties.Code + "");
            if (index !== -1) {
                var data = input.series.data[index];
                var tarr = app.chartCommons.indicator.getIndicator(data, headers, settings.chartProp.indicator);
                var thens = _.flatten(tarr);
                if (thens.length > 0) {
                    var thenFilter = _.filter(thens, {
                        operand: "1"
                    });
                    var then = _.first(thenFilter);
                    if (then) return then.secondFieldColor;
                }
            }
            var value = mapData[d.properties.Code + ""];
            if (typeof value === "undefined") return settings.chartProp.info.defaultColor || "#eee";
            if (max - min === 0) return color(1);
            return color((value - min) / (max - min));
        }
        if (!legendHaveText) {
            legendDiv.remove();
        }
        var mapType = settings.chartProp.info.mapType || "path";
        if (mapType === "path") {
            drawD3();
        } else {
            drawLeaflet();
        }
        var centered;
        function clicked(d) {
            if (hasHref && !settings.editMode) {
                var data = d.properties.Code + "";
                app.chartCommons.openLink(settings.chartProp.info.openDashboard, {
                    ChartInPageId: settings.ChartInPageId,
                    DataSourceId: settings.input.DataSourceId,
                    dimensionName: settings.input.dimensionName,
                    value: [ data ],
                    caption: [ d.properties.Name + "" ],
                    refreshDatasource: settings.input.RefreshDatasource
                });
                return;
            }
            var value = [ d.properties.Code + "" ];
            var caption = [ d.properties.Name + "" ];
            if (typeof path !== "undefined") {
                var x, y, k;
                if (d && centered !== d) {
                    var centroid = path.centroid(d);
                    x = centroid[0];
                    y = centroid[1];
                    k = 4;
                    centered = d;
                } else {
                    x = width / 2;
                    y = height / 2;
                    k = 1;
                    centered = null;
                    value = null;
                    caption = null;
                }
                svg.selectAll("path").classed("active", centered && function(d) {
                    return d === centered;
                });
                svg.transition().duration(750).attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")").style("stroke-width", 1.5 / k + "px");
            }
            var selectableArea = settings.chartProp.info.selectableArea;
            if (typeof selectableArea === "undefined") selectableArea = true;
            if (!settings.editMode && selectableArea) {
                app.chartCommons.userFilter.setFilter({
                    id: settings.ChartInPageId,
                    values: value,
                    valuesCaption: caption,
                    variableType: 0,
                    dimensionName: input.dimensionName,
                    chartInPageId: settings.ChartInPageId,
                    datasourceId: input.DataSourceId,
                    disableClear: false
                });
                app.moderation.dashboadpage.refreshRelatedDatasources(input.RefreshDatasource, [ +settings.ChartInPageId ]);
                app.filterBox.refresh();
            }
        }
        function mouseOver(d, i, pathes, containerPoint) {
            var index = indexes.indexOf(d.properties.Code + "");
            var center = {};
            if (!containerPoint) {
                var coordinates = d3.mouse($(this).parents("svg").get(0));
                center.x = coordinates[0] + 7;
                center.y = coordinates[1] + 7;
            } else {
                center = containerPoint;
            }
            d3.select(selector + " #map-tooltip ").transition().duration(200).style("opacity", .9);
            d3.select(selector + " #map-tooltip ").html(getTooltipHtml(index, tootipType, d.properties.Name)).style("left", center.x + "px").style("top", center.y + "px");
        }
        function mouseOut() {
            d3.select(selector + " #map-tooltip ").transition().duration(500).style("opacity", 0);
        }
        d3.select(selector).append("div").attr("id", "map-tooltip").attr("class", "temporal");
        _.each(input.series.labels, function(d, i) {
            var p = getProp(i);
            p.color = p.color || colors(i);
        });
        function drawBar(svg, getCenter, clicked) {
            svg.selectAll("g.bar").data(json.features).enter().append("g").classed("bar", true).attr("transform", function(d) {
                var index = indexes.indexOf(d.properties.Code + "");
                var data = input.series.data[index];
                d.childes = _.map(data, function(c, i) {
                    return {
                        index: i,
                        data: c
                    };
                });
                d.childes = _.filter(d.childes, function(c) {
                    return !getProp(c.index).hidden;
                });
                var center = getCenter(d);
                return "translate(" + (center.x - d.childes.length * barWidth / 2) + ", " + center.y + ")";
            }).on("click", clicked).on("mousemove", mouseOver).on("mouseout", mouseOut).selectAll("rect").data(function(d) {
                return d.childes;
            }).enter().append("rect").attr("width", barWidth + "px").attr("fill", function(d, i) {
                return getProp(d.index).color || colors(i);
            }).attr("height", function(d) {
                var normal = d.data / max;
                return normal * maxHeight + "px";
            }).attr("transform", function(d, i) {
                var normal = d.data / max;
                return "translate(" + i * barWidth + ", -" + normal * maxHeight + ")";
            });
        }
        function drawPie(svg, getCenter, clicked) {
            var pie = d3.pie().value(function(d) {
                return d.data;
            });
            var allSeriesMax = d3.max(input.series.data, function(d) {
                return d3.max(d, function(c) {
                    return +c;
                });
            });
            svg.selectAll("g.pie").data(json.features).enter().append("g").classed("pie", true).style("pointer-events", "auto").attr("transform", function(d) {
                var index = indexes.indexOf(d.properties.Code + "");
                var data = input.series.data[index];
                d.childes = _.map(data, function(c, i) {
                    return {
                        index: i,
                        data: c
                    };
                });
                d.childes = _.filter(d.childes, function(c) {
                    return !getProp(c.index).hidden;
                });
                var lMax = d3.max(d.childes, function(c) {
                    return c.data;
                });
                var o = lMax / allSeriesMax * maxHeight * .65;
                var minO = maxHeight * .65 / 2.5;
                if (minO > o) o = minO;
                var arc = d3.arc().innerRadius(0).outerRadius(o);
                _.each(d.childes, function(c) {
                    c.arc = arc;
                });
                var center = getCenter(d);
                return "translate(" + (center.x - d.childes.length * barWidth / 2) + ", " + center.y + ")";
            }).on("click", clicked).on("mousemove", mouseOver).on("mouseout", mouseOut).selectAll("path").data(function(d) {
                return pie(d.childes);
            }).enter().append("path").attr("d", function(d) {
                return d.data.arc(d);
            }).style("pointer-events", "auto").attr("fill", function(d, i) {
                return getProp(d.data.index).color || colors(i);
            });
        }
        function showNames(svg, getCenter, clicked) {
            svg.selectAll(".city-name").data(json.features).enter().append("svg:text").classed("city-name", true).text(function(d) {
                return d.properties.Name;
            }).attr("x", function(d) {
                return getCenter(d).x;
            }).attr("y", function(d) {
                return getCenter(d).y + barOriginOfsset;
            }).attr("text-anchor", "middle").attr("fill", settings.chartProp.info.nameEditor.color || "#333").style("font-size", settings.chartProp.info.nameEditor.fontSize || "9px").style("font-family", settings.chartProp.info.nameEditor.fontName || "IRANSans").style("font-weight", settings.chartProp.info.nameEditor.bold ? "bold" : "200" || "200").style("font-style", settings.chartProp.info.nameEditor.italic ? "italic" : "inherit" || "inherit").on("click", clicked).on("mousemove", mouseOver).on("mouseout", mouseOut);
        }
        function showValues(svg, getCenter, clicked) {
            svg.selectAll(".data-value").data(json.features).enter().append("svg:text").classed("data-value", true).text(function(d) {
                var value = mapData[d.properties.Code + ""];
                if (typeof value === "undefined") {
                    return "";
                }
                return persian(d3.format(settings.chartProp.info.valueEditor.formatString)(value), showPersian);
            }).attr("x", function(d) {
                return getCenter(d).x;
            }).attr("y", function(d) {
                return getCenter(d).y + barOriginOfsset + (settings.chartProp.info.showName ? -10 : 0);
            }).attr("text-anchor", "middle").attr("fill", settings.chartProp.info.valueEditor.color || "#333").style("font-size", settings.chartProp.info.valueEditor.fontSize || "9px").style("font-family", settings.chartProp.info.valueEditor.fontName || "IRANSans").style("font-weight", settings.chartProp.info.valueEditor.bold ? "bold" : "200" || "200").style("font-style", settings.chartProp.info.valueEditor.italic ? "italic" : "inherit" || "inherit").on("click", clicked).on("mousemove", mouseOver).on("mouseout", mouseOut);
        }
    }
    function legend(selector, color1, color2, min, max, mainProp, legend, mainIndex) {
        if (!settings.chartProp.info.showLegend) {
            return d3.select(selector).append("div");
        }
        var label = mainProp.name || input.seriesLablesCaptions[mainIndex];
        var colorGradientWidth = $(selector).width() * .05;
        var div = legend.append("div").style("text-align", "right").style("margin-bottom", "10px");
        div.append("div").text(label).style("margin", "0 0px");
        var innerdiv = div.append("div").classed("ltr", true).style("display", "inline-block");
        innerdiv.append("span").text(persian(d3.format(mainProp.formatString)(min || 0), showPersian));
        innerdiv.append("div").style("background", "-webkit-linear-gradient(to right, " + color2 + ", " + color1 + ")").style("background", "-o-linear-gradient(to right, " + color2 + ", " + color1 + ")").style("background", "-moz-linear-gradient(to right, " + color2 + ", " + color1 + ")").style("background", "linear-gradient(to right, " + color2 + ", " + color1 + ")").style("display", "inline-block").style("height", "7px").style("width", colorGradientWidth + "px").style("margin", "0 7px");
        innerdiv.append("span").text(persian(d3.format(mainProp.formatString)(max || 100), showPersian));
        if (!settings.chartProp.info.showChart || !settings.chartProp.info.showChartLegend) legend.on("click", function() {
            if (selector) {
                $(selector).trigger("legendClick", [ label, 0, {
                    key: input.series.labels[0]
                } ]);
            }
        });
        return legend;
    }
    function getProp(i) {
        return settings.chartProp.series[input.series.labels[i]];
    }
    function getTooltipHtml(index, type, key) {
        if (index == -1) {
            return app.chartCommons.tooltip.tooltipFormatter({
                points: input.series.labels.map(function(d, i) {
                    return {
                        data: "NaN",
                        label: getProp(i).name || input.series.labels[i],
                        format: getProp(i).formatString
                    };
                }),
                key: key,
                sum: "NaN",
                avg: "NaN",
                format: ",.2f"
            }, settings.chartProp.info.tooltipHeader, settings.chartProp.info.tooltipFormat, showPersian);
        }
        var d = input.series.data[index];
        if (type == 1) {
            d = [ d[0] ];
        } else if (type == 2) {
            var d = d.filter(function(d, i) {
                return !getProp(i).hidden;
            });
        }
        d = d.map(function(d, i) {
            return {
                data: d,
                label: getProp(i).name || input.seriesLablesCaptions[i],
                format: getProp(i).formatString
            };
        });
        return app.chartCommons.tooltip.tooltipFormatter({
            points: d,
            key: key,
            sum: d3.sum(d, function(d) {
                return d.data;
            }),
            avg: d3.sum(d, function(d) {
                return d.data;
            }) / d.length,
            format: d.length > 0 ? d[0].format : ",.2f"
        }, settings.chartProp.info.tooltipHeader, settings.chartProp.info.tooltipFormat);
    }
};

var app = app || {};

app.charts = app.charts || {};

app.charts.pie = {};

app.charts.pie.draw = function(input, settings, refreshWithData, titlebar) {
    settings.input = input;
    app.chartCommons.calculateFields(input.series, settings.calculatedFields);
    var title = input.title;
    var chartInfo = input.chartInfo;
    var seriesLabels = typeof input.series != "undefined" ? input.series.labels : [];
    var kpisLabels = typeof input.kpis != "undefined" ? input.kpis.labels : [];
    var showLabelOnChart = settings.chartProp.info.showLabels || settings.chartProp.info.showValues || settings.chartProp.info.showValuesPercent;
    var yAxeLable = settings.LabelY;
    var selector = "#" + settings.id;
    var margin = {
        top: 10,
        right: 20,
        bottom: 0,
        left: 20
    };
    var width = $(selector).width();
    var divHeight = $(selector).height();
    var barHeight = settings.chartProp.info.chartSize == "small" ? 150 : settings.chartProp.info.chartSize == "medium" ? 200 : settings.chartProp.info.chartSize == "large" ? 250 : settings.chartProp.info.chartSize == "veryLarge" ? 400 : 130;
    settings.width = width;
    var showPersian = typeof input.lang == "undefined" ? true : +input.lang == 0 ? true : false;
    var isProgress = titlebar.isProgress;
    var showProgress = titlebar.showProgress;
    var title = titlebar.title;
    var hasHref = settings.chartProp.info.openDashboard && settings.chartProp.info.openDashboard.checked;
    app.chartCommons.setDefault(settings.chartProp, kpisLabels.concat(seriesLabels), "pie");
    if (settings.editMode) {
        $(selector).trigger("chartproperty", [ kpisLabels.concat(seriesLabels) ]);
        $(selector).trigger("dimColor", [ _.map(input.matrix, function(d) {
            return d.values.join("-");
        }) ]);
    }
    if (!input.result) {
        $("#" + settings.id).append(app.chartCommons.getError(input));
        return;
    }
    $(selector).addClass("pie-chart");
    var data = prepareData(input);
    var seriesLabelsCaptions = input.seriesLablesCaptions;
    var kpisLabelsCaptions = input.kpisLablesCaptions;
    d3Utils.prepareDataForBarChart(data, settings, seriesLabels, kpisLabels, seriesLabelsCaptions, kpisLabelsCaptions);
    var sum = data.length == 0 ? [ 1 ] : data[0].series.map(function(d, i) {
        return d3.sum(data.map(function(d) {
            return d.series[i].data;
        }));
    });
    var colors = d3.scaleOrdinal(d3.schemeCategory10);
    switch (+settings.chartProp.info.colorType) {
      case 2:
        colors = d3.scaleOrdinal(d3.schemeBrBG[11]);
        break;

      case 3:
        colors = d3.scaleOrdinal(d3.schemePuOr[11]);
        break;

      case 4:
        colors = d3.scaleOrdinal(d3.schemeRdGy[11]);
        break;

      default:    }
    var getSeriesVal = function(d) {
        var f = d.series.filter(function(d) {
            return d.type === "series" && d.prop.main;
        });
        if (f.length > 0) return f[0].data;
        return d.series.filter(function(d) {
            return d.type === "series";
        })[0].data;
    };
    function getColor(d, i) {
        var dimColor = settings.chartProp.info.dimColor = settings.chartProp.info.dimColor || {};
        if (dimColor.enable) {
            var c = dimColor.data[d.value.join("-")];
            c = c || {};
            return c.color || colors(i);
        }
        return colors(i);
    }
    var legendBar = d3.select(selector).append("div").attr("class", "legend-bar temporal");
    legendBar.breadcrumb(input.levels, settings, titlebar, showPersian);
    if (!settings.chartProp.info.showLabels) {
        legendBar.legend({
            width: width,
            font: settings.chartProp.info.legendFont,
            position: settings.chartProp.info.legendPosition,
            selector: selector,
            data: data.map(function(d, i) {
                var f = d.series.filter(function(d) {
                    return d.type === "series" && d.prop.main;
                });
                var point = null;
                if (f.length > 0) point = f[0]; else point = d.series.filter(function(d) {
                    return d.type === "series";
                })[0];
                var r = {
                    label: d.label.join(", "),
                    color: getColor(d, i)
                };
                return r;
            })
        }, showPersian);
        legendBar.style("margin-bottom", "12px");
    } else {
        legendBar.append("div").attr("class", "legendBar");
    }
    var rootDiv = null;
    if (_.indexOf([ "bottom left", "bottom right", "bottom center" ], settings.chartProp.info.legendPosition) != -1) {
        rootDiv = d3.select(selector).insert("div", ":first-child").attr("class", "temporal").style("position", "relative");
    } else {
        rootDiv = d3.select(selector).append("div").attr("class", "temporal").style("position", "relative");
    }
    var height = 0;
    app.dashboardLayoutVersion = app.dashboardLayoutVersion || 2;
    if (app.dashboardLayoutVersion === 2) {
        var titleHeight = $(selector + " .title").outerHeight() || 0;
        var lb = $(selector + " .legend-bar");
        var legendHeight = typeof lb == "undefined" ? 0 : lb.outerHeight(true);
        height = $(selector).height() - titleHeight - legendHeight;
    } else if (app.dashboardLayoutVersion == 1) {
        width = barHeight;
        if (width > 300) width = 300;
    }
    var svgroot = rootDiv.append("svg").attr("class", "temporal").attr("width", width).attr("height", height);
    function calcRadius() {
        var radius = Math.min(width, height) / 2;
        var innerR = +settings.chartProp.info.hole / 100 * radius;
        var arc = d3.arc().innerRadius(innerR).outerRadius(radius);
        var arcText = d3.arc().innerRadius(radius * 1.1).outerRadius(radius * 1.1);
        return {
            radius: radius,
            arc: arc,
            arcText: arcText
        };
    }
    function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }
    var cr = calcRadius();
    var radius = cr.radius;
    var arc = cr.arc;
    var arcText = cr.arcText;
    svgroot.append("svg:rect").attr("class", "background").style("fill", "white").style("opacity", "0").attr("width", width).attr("height", height).on("click", function(d, i) {
        if (input.levels == "") return;
        if (isProgress()) return;
        showProgress(true);
        settings.parameters = {
            isUp: true,
            chartId: settings.chartId,
            ChartInPageId: settings.ChartInPageId,
            notEditMode: !settings.editMode
        };
        app.chartCommons.drillDown.up(settings.ChartInPageId);
        app.chartCommons.levelTypeUtils.getParam(settings);
        $(selector).charts(settings.type, "refreshWithData", settings);
    }).on("mouseout", mouseout);
    var svg = svgroot.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    var pie = d3.pie().value(getSeriesVal);
    if (!settings.chartProp.info.sort) {
        pie = pie.sort(null);
    }
    var path = svg.datum(data).selectAll("path").data(pie).enter();
    _.each(path._groups[0], function(d) {
        d.__data__.category = d.__data__.data.series[0].category;
        d.__data__.seriesLable = d.__data__.data.series[0].seriesLable;
        d.__data__.seriesKey = d.__data__.data.series[0].seriesKey;
        d.__data__.commentCount = d.__data__.data.series[0].commentCount;
    });
    var text = null;
    if (showLabelOnChart) {
        var leftSpace = 0, rightSpace = 0, labelHeight;
        svg.append("g").attr("class", "labels");
        text = svg.select(".labels").selectAll("text").data(pie).enter().append("text");
        text.attr("class", function(d, i) {
            return d.data.onClickVal != "" || flag || hasHref ? "label pointer" : " label";
        }).attr("id", function(d, j) {
            return "l-" + j;
        }).attr("dy", ".35em").text(function(d, i) {
            var ret = [];
            if (settings.chartProp.info.showLabels) {
                ret.push(persian(d.data.label, showPersian));
            }
            if (settings.chartProp.info.showValues) {
                ret.push(persian(d3.format(settings.chartProp.info.legendFont.formatString)(d.value), showPersian));
            }
            if (settings.chartProp.info.showValuesPercent) {
                ret.push(persian(d3.format(",.2f")(d.value * 100 / sum), showPersian) + "%");
            }
            return ret.join(" - ");
        }).styles({
            direction: "rtl",
            "font-size": settings.chartProp.info.legendFont.fontSize
        }).on("click", click).on("mouseover", mouseover).on("mousemove", mouseover).each(function(d) {
            var side = midAngle(d) >= Math.PI ? "left" : "right";
            var w = this.getBBox();
            labelHeight = w.height;
            if (side == "left") {
                if (leftSpace < w.width) leftSpace = w.width;
            } else {
                if (rightSpace < w.width) rightSpace = w.width;
            }
        });
        width = width - rightSpace - leftSpace - 20;
        if (width < 70) width = 70;
        height = height - labelHeight * 2;
        cr = calcRadius();
        radius = cr.radius;
        arc = cr.arc;
        arcText = cr.arcText;
    }
    var flag = settings.chartProp.globalvariable && settings.chartProp.globalvariable.length > 0 && !settings.editMode && settings.chartProp.globalvariable.filter(function(d) {
        return d.field == input.CurrentDimName;
    }).length > 0;
    var parts = path.append("g").classed("part", true);
    parts.append("path").attr("class", function(d, i) {
        return d.data.onClickVal != "" || flag || hasHref ? "arc pointer" : " arc";
    }).attr("title", "").attr("fill", function(d, i) {
        return getColor(d.data, i);
    }).attr("d", arc).each(function(d) {
        this._current = d.data.series[0].data;
    }).on("click", click).on("mouseover", mouseover).on("mousemove", mouseover);
    var isFromCommentDialog = $(selector).hasClass("fromCommentDialog");
    app.chartCommons.commentUtils.addCommentIcon(settings.ChartInPageId, parts, function(d) {
        return arc.centroid(d)[0];
    }, function(d) {
        return arc.centroid(d)[1];
    });
    if (isFromCommentDialog) {
        app.chartCommons.commentUtils.setOnHighlightListener(parts, settings.ChartInPageId);
    }
    function click(d, i) {
        if (isFromCommentDialog) {
            app.chartCommons.commentUtils.clickOnCommentIcon(d, settings.ChartInPageId);
            return;
        }
        if (settings.chartProp.globalvariable && settings.chartProp.globalvariable.length > 0 && !settings.editMode) {
            app.globalVariableHelper.updateGlobalVariables([ input.CurrentDimName ], [ d.data.value ], settings.chartProp.globalvariable);
            $(selector + " path.selected-item").attr("class", $(this).attr("class").replace("selected-item", ""));
            $(this).attr("class", $(this).attr("class") + " selected-item");
        }
        if (d.data.onClickVal == "") {
            if (hasHref && !settings.editMode) {
                app.chartCommons.openLink(settings.chartProp.info.openDashboard, {
                    ChartInPageId: settings.ChartInPageId,
                    DataSourceId: settings.input.DataSourceId,
                    dimensionName: settings.input.dimensionName,
                    value: d.value,
                    refreshDatasource: settings.input.RefreshDatasource
                });
            }
            return;
        }
        if (isProgress()) return;
        showProgress(true);
        app.chartCommons.drillDown.add(settings.ChartInPageId, settings.input.DataSourceId, settings.input.CurrentDimName, d.data.onClickVal, settings.input.RefreshDatasource);
        settings.parameters = {
            selectedItem: d.data.onClickVal,
            chartId: settings.chartId,
            ChartInPageId: settings.ChartInPageId,
            notEditMode: !settings.editMode
        }, app.chartCommons.levelTypeUtils.getParam(settings);
        $(selector).charts(settings.type, "refreshWithData", settings);
    }
    function getrect(a) {
        return {
            left: a.pos[0] - (a.anchor === "start" ? a.box.width : 0),
            right: a.pos[0] + (a.anchor === "start" ? 0 : a.box.width),
            top: a.pos[1],
            bottom: a.pos[1] + a.box.height
        };
    }
    if (showLabelOnChart) {
        var index = [];
        text.attr("transform", function(d, i) {
            var pos = arcText.centroid(d);
            pos[0] = radius * 1.1 * (midAngle(d) < Math.PI ? 1 : -1);
            index[i] = {
                pos: pos,
                box: this.getBBox(),
                data: d.data.label[0]
            };
            return "translate(" + pos + ")";
        }).style("text-anchor", function(d, i) {
            index[i].anchor = midAngle(d) >= Math.PI ? "start" : "end";
            return midAngle(d) >= Math.PI ? "start" : "end";
        }).style("display", function(d) {
            var a = d3.select(this);
            var atrans = getTransformation(a.attr("transform"));
            var aSign = a.style("text-anchor") == "start" ? 1 : -1;
            var aBox = this.getBBox();
            var ret = "auto";
            return ret;
        });
        for (var i = 0; i < index.length - 1; i++) {
            var base = index[i];
            for (var j = i + 1; j < index.length; j++) {
                var item = index[j];
                if (item.hide === true) continue;
                var r1 = getrect(base);
                var r2 = getrect(item);
                var left = Math.max(r1.left, r2.left);
                var right = Math.min(r1.right, r2.right);
                var bottom = Math.min(r1.bottom, r2.bottom);
                var top = Math.max(r1.top, r2.top);
                if (left < right && bottom > top) {
                    item.hide = true;
                }
            }
        }
        text.style("display", function(d, i) {
            return index[i].hide === true ? "none" : "auto";
        });
        svg.append("g").attr("class", "lines");
        var polyline = svg.select(".lines").selectAll("polyline").data(pie).enter().append("polyline");
        polyline.attr("points", function(d, i) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            var pos = arcText.centroid(d);
            pos[0] = radius * 1 * (midAngle(d) < Math.PI ? 1 : -1);
            return [ arc.centroid(d), arcText.centroid(d), pos ];
        }).style("display", function(d, i) {
            return $(selector + " #l-" + i).css("display");
        });
    }
    var spacing = 22;
    var alpha = .5;
    var loop = 0;
    function relax() {
        loop++;
        again = false;
        text.each(function(d, i) {
            a = this;
            da = d3.select(a);
            y1 = da.attr("y");
            var xy = da.attr("transform").replace(/translate\((.*)\)/gi, "$1").split(",").map(function(d) {
                return +d;
            });
            text.each(function(d, j) {
                b = this;
                if (a == b) return;
                db = d3.select(b);
                var xy2 = db.attr("transform").replace(/translate\((.*)\)/gi, "$1").split(",").map(function(d) {
                    return +d;
                });
                if (da.attr("text-anchor") != db.attr("text-anchor")) return;
                y2 = db.attr("y");
                deltaY = xy[1] - xy2[1];
                if (Math.abs(deltaY) > spacing) return;
                again = true;
                sign = deltaY > 0 ? 1 : -1;
                adjust = sign * alpha;
                da.attr("transform", "translate(" + xy[0] + "," + (xy[1] + adjust) + ")");
                da.attr("transform", "translate(" + xy2[0] + "," + (xy2[1] + adjust) + ")");
            });
        });
        if (again && loop < 5) {
            labelElements = text[0];
            setTimeout(relax, 20);
        }
    }
    function getTransformation(transform) {
        var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttributeNS(null, "transform", transform);
        var matrix = g.transform.baseVal.consolidate().matrix;
        var a = matrix.a;
        var b = matrix.b;
        var c = matrix.c;
        var d = matrix.d;
        var e = matrix.e;
        var f = matrix.f;
        var scaleX, scaleY, skewX;
        if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
        if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
        if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
        if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
        return {
            translateX: e,
            translateY: f,
            rotate: Math.atan2(b, a) * Math.PI / 180,
            skewX: Math.atan(skewX) * Math.PI / 180,
            scaleX: scaleX,
            scaleY: scaleY
        };
    }
    function arrangeLabels(selection, label_class) {
        var move = 1;
        while (move > 0) {
            move = 0;
            selection.selectAll(label_class).each(function() {
                var that = this;
                var a = this.getBoundingClientRect();
                selection.selectAll(label_class).each(function() {
                    if (this != that) {
                        var b = this.getBoundingClientRect();
                        if (Math.abs(a.left - b.left) * 2 < a.width + b.width && Math.abs(a.top - b.top) * 2 < a.height + b.height) {
                            var dx = (Math.max(0, a.right - b.left) + Math.min(0, a.left - b.right)) * .01;
                            var dy = (Math.max(0, a.bottom - b.top) + Math.min(0, a.top - b.bottom)) * .02;
                            var tt = getTransformation(d3.select(this).attr("transform"));
                            var to = getTransformation(d3.select(that).attr("transform"));
                            move += Math.abs(dx) + Math.abs(dy);
                            to.translate = [ to.translateX + dx, to.translateY + dy ];
                            tt.translate = [ tt.translateX - dx, tt.translateY - dy ];
                            d3.select(this).attr("transform", "translate(" + tt.translate + ")");
                            d3.select(that).attr("transform", "translate(" + to.translate + ")");
                            a = this.getBoundingClientRect();
                        }
                    }
                });
            });
        }
    }
    var div = rootDiv.append("div").style("position", "absolute").style("color", "#fff").style("-moz-border-radius", "5px").style("-webkit-border-radius", "5px").style("border-radius", "5px").style("padding", "7px 15px").style("text-align", "right").style("z-index", "10").style("opacity", "0").style("background-color", "#000");
    function mouseover(d) {
        var coordinates = [ 0, 0 ];
        coordinates = d3.mouse(rootDiv.node());
        var x = coordinates[0] + 7;
        var y = coordinates[1] + 7;
        var point = arc.centroid(d);
        var series = d.data.series;
        var type = +settings.chartProp.info.tooltip || 1;
        if (type == 1) {
            series = [ series[0] ];
        }
        if (type == 2) series = series.filter(function(d) {
            return !d.prop.hidden;
        });
        series = series.map(function(d, i) {
            return {
                data: d.data,
                label: d.prop.name || d.label,
                format: settings.chartProp.info.formatString,
                color: d.prop.seriesColor,
                percentage: d.data * 100 / sum[i]
            };
        });
        var html = app.chartCommons.tooltip.tooltipFormatter({
            points: series,
            key: d.data.label,
            sum: d3.sum(d, function(d) {
                return d.data;
            }),
            avg: d3.sum(d, function(d) {
                return d.data;
            }) / d.length,
            format: d.length > 0 ? d[0].format : ",.2f"
        }, settings.chartProp.info.tooltipHeader, settings.chartProp.info.tooltipFormat, showPersian);
        div.html(html);
        div.style("opacity", 1).style("left", x + "px").style("top", y + "px");
    }
    function mouseout(d) {
        div.transition().duration(500).style("opacity", 1e-6).each("end", function() {
            div.style("left", 0 + "px").style("top", 0 + "px");
        });
    }
    $(selector).trigger("heightChange");
};

var app = app || {};

app.charts = app.charts || {};

app.charts.radar = {};

app.charts.radar.draw = function(input, settings, refreshWithData, titlebar) {
    settings.input = input;
    app.chartCommons.calculateFields(input.series, settings.calculatedFields);
    var chartTitle = input.title;
    var chartInfo = input.chartInfo;
    var showPersian = typeof input.lang == "undefined" ? true : +input.lang == 0 ? true : false;
    var seriesLabels = typeof input.series != "undefined" ? input.series.labels : [];
    var kpisLabels = typeof input.kpis != "undefined" ? input.kpis.labels : [];
    var selector = "#" + settings.id;
    var margin = {
        top: 10,
        right: 20,
        bottom: 0,
        left: 20
    };
    var barHeight = settings.chartProp.info.chartSize == "small" ? 180 : settings.chartProp.info.chartSize == "medium" ? 250 : settings.chartProp.info.chartSize == "large" ? 400 : settings.chartProp.info.chartSize == "veryLarge" ? 600 : 130;
    var hasHref = settings.chartProp.info.openDashboard && settings.chartProp.info.openDashboard.checked;
    var width = $(selector).width();
    var height = $(selector).height() - margin.top - margin.bottom;
    var colors = d3.scaleOrdinal(d3.schemeCategory10);
    settings.width = width;
    var isProgress = titlebar.isProgress;
    var showProgress = titlebar.showProgress;
    var title = titlebar.title;
    $(selector).addClass("radar-chart");
    app.chartCommons.setDefault(settings.chartProp, kpisLabels.concat(seriesLabels), "radar");
    if (settings.editMode) {
        $(selector).trigger("chartproperty", [ kpisLabels.concat(seriesLabels) ]);
    }
    if (!input.result) {
        $("#" + settings.id).append(app.chartCommons.getError(input));
        return;
    }
    var data = prepareData(input);
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].series.length; j++) {
            if (settings.chartProp.series[seriesLabels[j]].cumulative) data[i].series[j] += data[i - 1] ? data[i - 1].series[j] : 0;
        }
    }
    var legendBar = d3.select(selector).append("div").attr("class", "legend-bar temporal");
    legendBar.breadcrumb(input.levels, settings, titlebar, showPersian);
    if (!input.matrix || input.matrix.length == 0) {
        d3.select(selector).append("div").attr("class", "temporal").style("font-size", "0.8em").style("margin", "15px").append("span").attr("class", "translate").attr("data-trans-key", "داده‌ای برای نمایش وجود ندارد").text("داده‌ای برای نمایش وجود ندارد");
        return;
    }
    var seriesLabelsCaptions = input.seriesLablesCaptions;
    var kpisLabelsCaptions = input.kpisLablesCaptions;
    d3Utils.prepareDataForBarChart(data, settings, seriesLabels, kpisLabels, seriesLabelsCaptions, kpisLabelsCaptions);
    legendBar.legend({
        width: width,
        selector: selector,
        data: data[0].series.filter(function(d) {
            return !d.prop.hidden;
        }).map(function(d) {
            return {
                label: (d.prop.name || d.label).replace(/^\[measure\]/, ""),
                color: d.prop.seriesColor,
                key: d.key
            };
        })
    }, showPersian);
    var titleHeight = $(selector + " .title").outerHeight() || 0;
    var lb = $(selector + " .legend-bar");
    var legendHeight = typeof lb == "undefined" ? 0 : lb.height() + +lb.css("margin-top").replace("px", "");
    height = $(selector).height() - titleHeight - legendHeight;
    if (height < 150) height = 150;
    var font = _.extend({
        bold: false,
        color: "#737373",
        italic: false,
        fontSize: "10px",
        fontName: "IRANSans",
        formatString: settings.chartProp.info.formatString || ",.2f",
        formatStringCustom: ",.2f"
    }, settings.chartProp.info.font);
    var drow = function() {
        var cfg = {
            radius: 4,
            w: 600,
            h: 600,
            factor: 1,
            factorLegend: .85,
            levels: 6,
            maxValue: 0,
            radians: 2 * Math.PI,
            opacityArea: .5,
            ToRight: 5,
            TranslateX: 0,
            TranslateY: 0,
            ExtraWidthX: 0,
            ExtraWidthY: 0,
            color: d3.scaleOrdinal(d3.schemeCategory10)
        };
        var div = d3.select(selector).append("div").attr("class", "temporal").style("position", "relative").style("margin", "0 auto").style("text-align", "left");
        var allAxis = data.map(function(i, j) {
            return i.label;
        });
        var total = allAxis.length;
        var textDivHeight = 0;
        var axisLableTemp = div.selectAll(".axis-label").data(allAxis).enter().append("div").text(function(d) {
            return persian(d, showPersian);
        }).attr("class", "axis-label").style("width", "100px").style("font-size", "11px").style("padding", "5px").style("text-overflow", "ellipsis").style("white-space", "nowrap").style("text-align", function(d, i) {
            textDivHeight = $(this).outerHeight() || 0;
            return "right";
        });
        axisLableTemp.remove();
        cfg.h = Math.min(height - textDivHeight * 2, width - 200);
        cfg.w = cfg.h;
        cfg.maxValue = Math.max(cfg.maxValue, d3.max(data, function(i) {
            return d3.max(i.series.filter(function(d, i) {
                return !d.prop.hidden;
            }).map(function(o) {
                return o.data;
            }));
        }));
        var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);
        var Format = d3.format("%");
        div.style("height", cfg.h + textDivHeight * 2 + "px");
        div.style("width", cfg.w + 200 + "px");
        var dd = div.append("div");
        var svg = dd.append("svg");
        var axisLable = div.selectAll(".axis-label").data(allAxis).enter().append("div").text(function(d) {
            return persian(d, showPersian);
        }).attr("title", function(d) {
            return d;
        }).attr("class", "axis-label").style("width", "100px").style("position", "absolute").style("font-size", "11px").style("padding", "5px").style("text-overflow", "ellipsis").style("white-space", "nowrap").style("overflow", "hidden").style("text-align", function(d, i) {
            var left = cfg.w / 2 * (1 - cfg.factor * Math.sin(i * cfg.radians / total));
            var align = "right";
            if (left >= cfg.w / 2) align = "left";
            return align;
        });
        var textDivHeight = 0;
        axisLable.style("left", function(d, i) {
            var left = cfg.w / 2 * (1 - cfg.factor * Math.sin(i * cfg.radians / total));
            if (left >= cfg.w / 2) left += 100;
            return left + "px";
        }).style("top", function(d, i) {
            var h = $(d3.select(this).node()).outerHeight() || 0;
            textDivHeight = h;
            var top = cfg.h / 2 * (1 - cfg.factor * Math.cos(i * cfg.radians / total));
            top += h / 2;
            if (i == 0) top = 0;
            return top + "px";
        });
        var topOffset = textDivHeight;
        dd.style("left", "100px").style("position", "absolute").style("top", topOffset + "px");
        var g = svg.attr("width", cfg.w).attr("height", cfg.h).append("g").attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");
        var tooltip;
        for (var j = 0; j < cfg.levels - 1; j++) {
            var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
            g.selectAll(".levels").data(allAxis).enter().append("svg:line").attr("x1", function(d, i) {
                return levelFactor * (1 - cfg.factor * Math.sin(i * cfg.radians / total));
            }).attr("y1", function(d, i) {
                return levelFactor * (1 - cfg.factor * Math.cos(i * cfg.radians / total));
            }).attr("x2", function(d, i) {
                return levelFactor * (1 - cfg.factor * Math.sin((i + 1) * cfg.radians / total));
            }).attr("y2", function(d, i) {
                return levelFactor * (1 - cfg.factor * Math.cos((i + 1) * cfg.radians / total));
            }).attr("class", "line").style("stroke", "grey").style("stroke-opacity", "0.75").style("stroke-width", "0.3px").attr("transform", "translate(" + (cfg.w / 2 - levelFactor) + ", " + (cfg.h / 2 - levelFactor) + ")");
        }
        for (var j = 0; j < cfg.levels; j++) {
            var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
            g.selectAll(".levels").data([ 1 ]).enter().append("svg:text").attr("x", function(d) {
                return levelFactor * (1 - cfg.factor * Math.sin(0));
            }).attr("y", function(d) {
                return levelFactor * (1 - cfg.factor * Math.cos(0));
            }).attr("class", "legend").style("font-size", font.fontSize).style("font-family", font.fontName).attr("dy", "1em").attr("transform", "translate(" + (cfg.w / 2 - levelFactor + cfg.ToRight) + ", " + (cfg.h / 2 - levelFactor) + ")").attr("fill", font.color).text(persian(d3.format(font.formatString)((j + 1) * cfg.maxValue / cfg.levels), showPersian));
        }
        var axis = g.selectAll(".axis").data(allAxis).enter().append("g").attr("class", "axis");
        axis.append("line").attr("x1", cfg.w / 2).attr("y1", cfg.h / 2).attr("x2", function(d, i) {
            return cfg.w / 2 * (1 - cfg.factor * Math.sin(i * cfg.radians / total));
        }).attr("y2", function(d, i) {
            return cfg.h / 2 * (1 - cfg.factor * Math.cos(i * cfg.radians / total));
        }).attr("class", "line").style("stroke", "grey").style("stroke-width", "1px");
        series = 0;
        data[0].series.forEach(function(y, x) {
            if (y.prop.hidden) return;
            dataValues = [];
            g.selectAll(".nodes").data(data, function(j, i) {
                dataValues.push([ cfg.w / 2 * (1 - parseFloat(Math.max(j.series[x].data, 0)) / cfg.maxValue * cfg.factor * Math.sin(i * cfg.radians / total)), cfg.h / 2 * (1 - parseFloat(Math.max(j.series[x].data, 0)) / cfg.maxValue * cfg.factor * Math.cos(i * cfg.radians / total)) ]);
            });
            dataValues.push(dataValues[0]);
            g.selectAll(".area").data([ dataValues ]).enter().append("polygon").attr("class", "radar-chart-serie" + series).style("stroke-width", "2px").style("stroke", data[0].series[x].prop.seriesColor).attr("points", function(d) {
                var str = "";
                for (var pti = 0; pti < d.length; pti++) {
                    str = str + cfg.w / 2 + "," + cfg.h / 2 + " ";
                }
                return str;
            }).style("fill", function(j, i) {
                return data[0].series[x].prop.seriesColor;
            }).style("fill-opacity", cfg.opacityArea).on("mouseover", function(d) {
                z = "polygon." + d3.select(this).attr("class");
                g.selectAll("polygon").transition(200).style("fill-opacity", .1);
                g.selectAll(z).transition(200).style("fill-opacity", .7);
            }).on("mouseout", function() {
                g.selectAll("polygon").transition(200).style("fill-opacity", cfg.opacityArea);
            }).transition(500).attr("points", function(d) {
                var str = "";
                for (var pti = 0; pti < d.length; pti++) {
                    str = str + d[pti][0] + "," + d[pti][1] + " ";
                }
                return str;
            });
            series++;
        });
        series = 0;
        var flag = settings.chartProp.globalvariable && settings.chartProp.globalvariable.length > 0 && !settings.editMode && settings.chartProp.globalvariable.filter(function(d) {
            return d.field == input.CurrentDimName;
        }).length > 0;
        _.each(data, function(d) {});
        var nData = data[0].series.map(function(d, i) {
            return data.map(function(m) {
                var s = m.series[i];
                s.onClickVal = m.onClickVal;
                return s;
            });
        });
        var entriesGroup = g.selectAll(".entry-group").data(nData).enter().append("g").classed("entry-group", true);
        var entries = entriesGroup.selectAll(".entry-group").data(function(d) {
            return d;
        }).enter().append("g").classed("entry", true);
        var isFromCommentDialog = $(selector).hasClass("fromCommentDialog");
        entries.append("svg:circle").attr("class", function(d, i) {
            return "radar-chart-serie" + i + " " + (d.onClickVal != "" || flag || hasHref ? " pointer" : "");
        }).classed("circle", true).attr("r", cfg.radius).attr("alt", function(j) {
            return d3.format(font.formatString)(j.data);
        }).attr("cx", function(j, i) {
            return cfg.w / 2;
        }).attr("cy", function(j, i) {
            return cfg.h / 2;
        }).attr("data-id", function(j) {
            return j.axis;
        }).style("fill", "#fff").style("stroke", function(d) {
            return d.prop.seriesColor;
        }).style("stroke-width", "2px").on("click", function(d, i) {
            if (isFromCommentDialog) {
                app.chartCommons.commentUtils.clickOnCommentIcon(d, settings.ChartInPageId);
                return;
            }
            if (settings.chartProp.globalvariable && settings.chartProp.globalvariable.length > 0 && !settings.editMode) {
                app.globalVariableHelper.updateGlobalVariables([ input.CurrentDimName ], [ d.value ], settings.chartProp.globalvariable);
                $(selector + " circle.selected-item").attr("class", $(this).attr("class").replace("selected-item", ""));
                $(this).attr("class", $(this).attr("class") + " selected-item");
            }
            if (d.onClickVal == "") {
                if (hasHref && !settings.editMode) {
                    app.chartCommons.openLink(settings.chartProp.info.openDashboard, {
                        ChartInPageId: settings.ChartInPageId,
                        DataSourceId: settings.input.DataSourceId,
                        dimensionName: settings.input.dimensionName,
                        value: d.value,
                        refreshDatasource: settings.input.RefreshDatasource
                    });
                }
                return;
            }
            if (isProgress()) return;
            showProgress(true);
            settings.parameters = {
                selectedItem: d.onClickVal,
                chartId: settings.chartId,
                ChartInPageId: settings.ChartInPageId,
                notEditMode: !settings.editMode
            };
            app.chartCommons.drillDown.add(settings.ChartInPageId, settings.input.DataSourceId, settings.input.CurrentDimName, d.onClickVal, settings.input.RefreshDatasource);
            app.chartCommons.levelTypeUtils.getParam(settings);
            $(selector).charts(settings.type, "refreshWithData", settings);
        }).on("mouseover", function(d) {
            newX = parseFloat(d3.select(this).attr("cx"));
            newY = parseFloat(d3.select(this).attr("cy"));
            tooltip.style("left", newX + 105 + "px").style("top", newY - 5 + "px").html(d.label + "<br/><b>" + d.label + ": </b>" + persian(d3.format(font.formatString)(d.data), showPersian)).transition(200).style("opacity", 1);
            var w = $(tooltip[0][0]).width();
            var h = $(tooltip[0][0]).height();
            tooltip.style("top", newY + h / 2 + "px");
            z = "polygon." + d3.select(this).attr("class");
            g.selectAll("polygon").transition(200).style("fill-opacity", .1);
            g.selectAll(z).transition(200).style("fill-opacity", .7);
        }).on("mouseout", function() {
            tooltip.transition(200).style("opacity", 0).each("end", function() {
                tooltip.style("left", 0).style("top", 0);
            });
            g.selectAll("polygon").transition(200).style("fill-opacity", cfg.opacityArea);
        }).transition(500).attr("cx", function(j, i) {
            return cfg.w / 2 * (1 - Math.max(j.data, 0) / cfg.maxValue * cfg.factor * Math.sin(i * cfg.radians / total));
        }).attr("cy", function(j, i) {
            return cfg.h / 2 * (1 - Math.max(j.data, 0) / cfg.maxValue * cfg.factor * Math.cos(i * cfg.radians / total));
        });
        app.chartCommons.commentUtils.addCommentIcon(settings.ChartInPageId, entries, function(j, i) {
            return cfg.w / 2 * (1 - Math.max(j.data, 0) / cfg.maxValue * cfg.factor * Math.sin(i * cfg.radians / total)) - 5;
        }, function(j, i) {
            return cfg.h / 2 * (1 - Math.max(j.data, 0) / cfg.maxValue * cfg.factor * Math.cos(i * cfg.radians / total)) - 24;
        });
        if (isFromCommentDialog) {
            app.chartCommons.commentUtils.setOnHighlightListener(entries, settings.ChartInPageId);
        }
        tooltip = div.append("div").attr("class", "tooltip").style("position", "absolute").style("color", "#fff").style("-moz-border-radius", "5px").style("-webkit-border-radius", "5px").style("border-radius", "5px").style("padding", "7px 15px").style("text-align", "right").style("z-index", "1000").style("opacity", "0").style("background-color", "#000").style("max-width", "200px").style("opacity", 0).style("font-size", "13px");
    };
    drow();
    $(selector).trigger("heightChange");
};

var app = app || {};

app.charts = app.charts || {};

app.charts.table = {};

app.charts.table.draw = function(input, settings, refreshWithData, titlebar) {
    var selector = "#" + settings.id;
    var margin = {
        top: 10,
        right: 20,
        bottom: 0,
        left: 20
    };
    var width = $(selector).width();
    var barHeight = settings.chartProp.info.chartSize == "small" ? 170 : settings.chartProp.info.chartSize == "medium" ? 300 : settings.chartProp.info.chartSize == "large" ? 400 : settings.chartProp.info.chartSize == "veryLarge" ? 500 : 250;
    var height = barHeight + margin.top + margin.bottom;
    settings.width = width;
    var isProgress = titlebar.isProgress;
    var showProgress = titlebar.showProgress;
    var title = titlebar.title;
    var showPersian = typeof input.lang == "undefined" ? true : +input.lang == 0 ? true : false;
    var hasHref = settings.chartProp.info.openDashboard && settings.chartProp.info.openDashboard.checked;
    if (_.isArray(settings.chartProp.info.columnsWidth)) {}
    var nullReplcament = settings.chartProp.info.nullReplacement;
    if (_.isUndefined(nullReplcament)) {
        nullReplcament = "";
    }
    var lastTableInfo = $(selector).data("table-info");
    var TableInfo = lastTableInfo || settings.tableInfo || {};
    $(selector).data("table-info", TableInfo);
    var showHeader = typeof settings.chartProp.info.showHeader != "undefined" ? settings.chartProp.info.showHeader : true;
    $(selector).addClass("table-chart-container table-chart");
    $(selector).parents(".content").addClass("hidden-overflow");
    if (settings.editMode) {
        $(selector).addClass("edit-mode");
        $(selector).css("margin", "0px");
    }
    if (app.dashboardLayoutVersion == 2 && !settings.editMode) {
        var titleHeight = $(selector + " .title").outerHeight() || 0;
        var chartHeight = $(selector).height() - titleHeight;
        barHeight = chartHeight;
    }
    if (typeof settings.chartProp.info.stripped == "undefined") settings.chartProp.info.stripped = true;
    if (typeof settings.chartProp.info.hover == "undefined") settings.chartProp.info.hover = true;
    var tableStyle = (settings.chartProp.info.bordered ? " table-bordered" : "") + (settings.chartProp.info.stripped ? " table-striped" : "") + (settings.chartProp.info.hover ? " table-hover" : "") + " ";
    var rowNumberLablel = "#ردیف";
    var tableInfo = {
        option: {},
        headerTemplate: function(headers) {
            var v = tableInfo;
            _.map(headers, function(h, i) {
                h.index = i;
            });
            this.filteredHeaders = _.filter(headers, function(h) {
                return !h.prop.isHidden;
            });
            var getHeaderStyle = function(prop) {
                var styleArray = [ "font-weight:" + (tableInfo.option.settings.chartProp.info.headerFont.bold ? "bold" : "normal"), "font-style:" + tableInfo.option.settings.chartProp.info.headerFont.italic ? "italic" : "normal", "font-size:" + tableInfo.option.settings.chartProp.info.headerFont.fontSize, "text-align:" + (prop.font.align || tableInfo.option.settings.chartProp.info.headerFont.align), "color:" + tableInfo.option.settings.chartProp.info.headerFont.color, "font-family:" + tableInfo.option.settings.chartProp.info.headerFont.fontName ];
                var style = styleArray.join(";");
                if (!tableInfo.option.settings.chartProp.info.headerNowrap) {
                    style += ";white-space:initial;";
                }
                return style;
            };
            var ths = _.map(this.filteredHeaders, function(h, i) {
                var name = filterXSS(h.prop.name || h.value);
                tableInfo.option.page = tableInfo.option.page || {};
                var entry = _.find(tableInfo.option.page.Order, {
                    Index: i
                });
                var icon = "";
                if (entry) {
                    icon = '<i class="icon sort ' + (entry.DescType == 1 ? "ascending" : "descending") + '"></i>';
                }
                tableInfo.option.settings.chartProp.info.headerFont = tableInfo.option.settings.chartProp.info.headerFont || {
                    bold: true,
                    italic: false,
                    fontSize: "13px",
                    fontName: "IRANSans"
                };
                var styleColumn = tableInfo.option.tableData.headers[h.index].prop;
                styleColumn.font = styleColumn.font || {};
                var style = getHeaderStyle(styleColumn);
                return '<th title="' + name + '" ><span class="resize"></span><div style="' + style + '">' + name + icon + "</div></th>";
            }).join("");
            var rowNum = "";
            if (settings.chartProp.info.showRowNumber) {
                var prop = tableInfo.option.settings.chartProp.series[rowNumberLablel];
                prop = prop || {};
                prop.font = prop.font || {};
                var styleArray = getHeaderStyle(prop);
                rowNum = '<th title="" ><span class="resize"></span><div style="' + styleArray + '">ردیف</div></th>';
            }
            return "<tr>" + rowNum + ths + "</tr>";
        },
        getFooterTemplate: function() {
            if (!_.some(tableInfo.option.resultRows, function(d) {
                return +d.Type > 0;
            })) return "";
            var ths = _.map(_.filter(tableInfo.option.tableData.headers, function(h, i) {
                return !h.prop.isHidden;
            }), function(h) {
                var info = _.find(tableInfo.option.resultRows, {
                    Name: h.key
                });
                if (!info || +info.Type === 0) return "<td><div></div></td>";
                var s = {
                    data: info.Value
                };
                var i = _.findIndex(tableInfo.option.tableData.headers, {
                    key: h.key
                });
                var style = tableInfo.getStyle(tableInfo.option.tableData.headers[i].prop);
                return '<td style="' + style + '" title="' + tableInfo.getText(s, i) + '"><div>' + tableInfo.getText(s, i) + "</div></td>";
            }).join("");
            var rowNum = "";
            if (settings.chartProp.info.showRowNumber) {
                rowNum = "<td><div></div></td>";
            }
            var t = '  <table class="ui celled table unstackable small  footer-table" style="margin:0;border-left: none;border-right: none;">                                                  ' + "    <tbody>                                                " + "<tr>" + rowNum + ths + "</tr>" + "    </tbody>                                               " + "  </table>                                                 ";
            return t;
        },
        svg: '<svg  class="td-comment" width="24" height="24" style="position: absolute; left: 6px; fill-opacity: 0.5;"><g transform="translate(0,0)scale(0.38)" class="comment"><rect width="24" height="24" class="comment-background"></rect><path d="M10.718,18.561l6.78,5.311C17.609,23.957,17.677,24,17.743,24  c0.188,0,0.244-0.127,0.244-0.338v-5.023c0-0.355,0.233-0.637,0.548-0.637L21,18c2.219,0,3-1.094,3-2s0-13,0-14s-0.748-2-3.014-2  H2.989C0.802,0,0,0.969,0,2s0,13.031,0,14s0.828,2,3,2h6C9,18,10.255,18.035,10.718,18.561z"></path><text x="34" y="0.7em" style="font-size: 20px;"></text></g></svg>',
        svgShow: '<svg  class="" width="24" height="24" style="position: absolute; left: 6px; fill-opacity: 0.5;"><g transform="translate(0,0)scale(0.38)" class="comment show"><rect width="24" height="24" class="comment-background"></rect><path d="M10.718,18.561l6.78,5.311C17.609,23.957,17.677,24,17.743,24  c0.188,0,0.244-0.127,0.244-0.338v-5.023c0-0.355,0.233-0.637,0.548-0.637L21,18c2.219,0,3-1.094,3-2s0-13,0-14s-0.748-2-3.014-2  H2.989C0.802,0,0,0.969,0,2s0,13.031,0,14s0.828,2,3,2h6C9,18,10.255,18.035,10.718,18.561z"></path><text x="34" y="0.7em" style="font-size: 20px;"></text></g></svg>',
        bodyTemplate: function(tableData) {
            var pageTemplate = "";
            if (this.option.remoteData) {
                var currentPage = this.option.page.Page;
                pageTemplate = this.paging(currentPage);
            }
            var stripClass = settings.chartProp.info.stripped ? "striped " : "";
            var hoverClass = settings.chartProp.info.hover ? "selectable " : "";
            var borderClass = settings.chartProp.info.bordered ? "celled " : "";
            var t = '<div class="clusterize temporal" style="overflow: hidden;">                                   ' + '  <table class="ui ' + stripClass + hoverClass + borderClass + ' table unstackable small  header-table" style="margin:0;border-left: none;border-right: none;">                                                  ' + "    <thead>                                                " + tableInfo.headerTemplate(tableData.headers) + "    </thead>                                               " + "  </table>                                                 " + '  <div id="scrollArea' + settings.id + '" class="clusterize-scroll" style="xdisplay: flex;max-height:200px; overflow:auto;">          ' + '    <table class="ui ' + stripClass + hoverClass + borderClass + ' table unstackable  small body-table" style="margin:0;border: none; border-bottom: 1px solid #eaeaea;">                                                ' + '      <tbody id="contentArea' + settings.id + '" class="clusterize-content">  ' + '        <tr class="clusterize-no-data">                    ' + "          <td>Loading data…</td>                           " + "        </tr>                                              " + "      </tbody>                                             " + "    </table>                                               " + (app.commentOnChart ? tableInfo.svg : "") + "  </div>                                                   " + tableInfo.getFooterTemplate(tableData.headers) + pageTemplate + "</div>                                                     ";
            return t;
        },
        getStyle: function(prop) {
            if (prop.formatString == "%") prop.formatString = ".0%";
            prop.font = _.extendWith({}, {
                bold: prop.textBold,
                italic: prop.textItalic,
                fontSize: prop.fontSize,
                color: prop.color,
                formatString: prop.formatString,
                fontName: "IRANSans"
            }, prop.font);
            var style = [ "font-weight:" + (prop.font.bold ? "bold" : "normal"), "font-style:" + prop.font.italic ? "italic" : "normal", "font-size:" + prop.font.fontSize, "font-family:" + prop.font.fontName, "text-align:" + (prop.font.align || prop.textAlign), "color:" + prop.font.color, "position:relative", "display:" + (prop.isHidden ? "none" : "auto") ];
            if (prop.forceLtr) {
                style.push(app.lang.isRtl() ? "direction:ltr" : "direction:rtl");
            }
            if (tableInfo.option.settings.chartProp.info.wrapContent) {
                style.push("white-space:initial");
                style.push("height:" + (tableInfo.option.settings.chartProp.info.cellHeight || 50) + "px");
            }
            return style.join(";");
        },
        getThenStyle: function(thens) {
            var style = [];
            if (thens) {
                _.each(thens, function(d) {
                    switch (+d.operand) {
                      case 1:
                        style.push("color:" + d.secondFieldColor);
                        break;

                      case 3:
                        style.push("background-color:" + d.secondFieldBackColor);
                        break;

                      case 4:
                        var v = +d.secondFieldStyle;
                        if (v === 1) {
                            style.push("font-weight: normal");
                            style.push("font-style: normal");
                        }
                        if (v === 2 || v === 4) style.push("font-weight: bold");
                        if (v === 3 || v === 4) style.push("font-style: italic");
                        if (v === 5) style.push("text-decoration: underline");
                        break;
                    }
                });
            }
            var icon = _.head(_.filter(thens, {
                operand: "2"
            }));
            console.log("icon", icon);
            var iconTemp = "";
            if (icon && icon.secondFieldIcon && icon.secondFieldIcon.type === "image") {
                iconTemp = ' <img style="width:1.5em" src="' + app.urlPrefix + "api/upload/getpic/" + icon.secondFieldIcon.name + '"></i>';
            } else if (icon && icon.secondFieldIcon) {
                var name = icon.secondFieldIcon.name || icon.secondFieldIcon;
                iconTemp = ' <i class="' + name + '"></i>';
            }
            var replace = _.head(_.filter(thens, {
                operand: "5"
            }));
            if (replace) replace = replace.secondFieldReplace;
            return {
                style: style.join(";"),
                icon: iconTemp,
                replace: replace
            };
        },
        getText: function(e, i) {
            var d = e.data;
            if (d === "") return nullReplcament;
            var isHtml = tableInfo.option.tableData.headers[i].prop.isHtml;
            var isn = isNaN(d);
            if (!isn) {
                var f = tableInfo.option.tableData.headers[i].prop.font.formatString;
                if (f === "custom") {
                    f = tableInfo.option.tableData.headers[i].prop.font.formatStringCustom;
                }
                return isHtml ? d : persian(d3.format(f)(d), showPersian);
            }
            return isHtml ? d : persian(d, showPersian);
        },
        render: function(option) {
            tableInfo.option = option;
            var selector = option.selector;
            var settings = option.settings;
            var tableData = option.tableData;
            var resultRows = option.resultRows;
            var isFromCommentDialog = $(selector).hasClass("fromCommentDialog");
            $(selector).append(tableInfo.bodyTemplate(tableData));
            var hKeys = _.map(tableData.headers, "key");
            tableInfo.dataset = tableData.rows.map(function(d, rowIndex) {
                var tarr = app.chartCommons.indicator.getIndicator(_.map(d, "data"), hKeys, settings.chartProp.indicator);
                var thens = _.flatten(tarr);
                var tdVals = [];
                var tds = d.map(function(s, colIndex) {
                    var thisThen = _.filter(thens, {
                        firstField: tableInfo.option.tableData.headers[colIndex].key
                    });
                    var style = tableInfo.getStyle(tableInfo.option.tableData.headers[colIndex].prop);
                    var thenStyle = tableInfo.getThenStyle(thisThen);
                    if (!tableInfo.option.tableData.headers[colIndex].prop.isHidden) {
                        tdVals.push(s.data);
                    }
                    var onClickVal = "";
                    if (tableInfo.option.pivoteMode) {
                        var d = tableData.rows[rowIndex][0];
                        onClickVal = d.onClickVal;
                    }
                    var isHtml = tableInfo.option.tableData.headers[colIndex].prop.isHtml;
                    var className = "";
                    if (settings.chartProp.info.selectable !== "none" || onClickVal !== "" || hasHref || _.size(settings.chartProp.globalvariable) > 0) {
                        className = "pointer";
                    }
                    var svg = "";
                    if (s.commentCount > 0) {
                        svg = tableInfo.svgShow.replace("</text>", persian(s.commentCount, showPersian) + "</text>");
                    }
                    if (!app.commentOnChart) {
                        svg = "";
                    }
                    var txt = filterXSS(thenStyle.replace || tableInfo.getText(s, colIndex));
                    return '<td class="entry ' + className + '" data-xrow="' + rowIndex + '" data-xcol="' + colIndex + '" title="' + (isHtml ? "" : txt) + '" ><div style="' + style + ";" + thenStyle.style + '">' + txt + (thenStyle.icon || "") + svg + "</div></td>";
                }).filter(function(s, i) {
                    return !tableInfo.option.tableData.headers[i].prop.isHidden;
                });
                var rowNum = "";
                if (settings.chartProp.info.showRowNumber) {
                    var offset = 0;
                    if (tableInfo.option.page.Page) {
                        offset = tableInfo.option.page.Limit * (tableInfo.option.page.Page - 1);
                    }
                    var prop = tableInfo.option.settings.chartProp.series[rowNumberLablel];
                    prop = prop || {};
                    prop.font = prop.font || {};
                    var style = tableInfo.getStyle(prop);
                    rowNum = '<td><div style="' + style + '">' + persian(offset + rowIndex + 1) + "</div></td>";
                }
                return {
                    markup: "<tr>" + rowNum + tds.join("") + "</tr>",
                    row: tdVals
                };
            });
            var $scroll = $("#scrollArea" + settings.id);
            var $content = $("#contentArea" + settings.id);
            var $headers = $(selector + " .header-table");
            var scrollBarWidth = 7;
            var fitHeaderColumns = function() {
                var columnsWidth = [];
                var first = true;
                return function() {
                    var $firstRow = $content.find("tr:not(.clusterize-extra-row):first");
                    var childs = $firstRow.children();
                    var footer = $(selector + " .footer-table tr:first-child td");
                    var scrollWidthg = 0;
                    var tableHeight = $(selector + " .body-table").height() || 0;
                    var all = ($(selector).height() || 0) - ($(selector + " .legend-bar").height() || 0) - ($(selector + " .header-table").height() || 0) - ($(selector + " .footer-table").height() || 0) - ($(selector + " .ui.pagination").height() || 0) - 4;
                    scrollWidthg = tableHeight > all ? scrollBarWidth : 0;
                    var c = $(selector).data("columnsWidth");
                    if (c) {
                        columnsWidth = c;
                    }
                    if (_.size(columnsWidth) == 0) {
                        childs = $headers.find("tr").children();
                        $firstRow.children().each(function(i) {
                            var w = $(this).outerWidth();
                            var h = $(childs.get(i)).outerWidth();
                            if (i != 0) w--;
                            if (w < 60 && h > w) w = 60;
                            if (_.isArray(settings.chartProp.info.columnsWidth)) {
                                w = Math.max(settings.chartProp.info.columnsWidth[i], w);
                            }
                            columnsWidth.push(w);
                        });
                        if (!_.isArray(settings.chartProp.info.columnsWidth)) {
                            var chartWidth = $(selector).width();
                            var sum = 0;
                            for (var i = 0; i < columnsWidth.length; i++) {
                                sum += columnsWidth[i];
                            }
                            if (sum > chartWidth) {
                                var maxWidth = 600;
                                var lastChangeIndex = 0;
                                for (var i = 0; i < columnsWidth.length; i++) {
                                    if (columnsWidth[i] > maxWidth) {
                                        sum -= columnsWidth[i] - maxWidth;
                                        columnsWidth[i] = maxWidth;
                                        lastChangeIndex = i;
                                    }
                                    if (sum <= chartWidth) {
                                        columnsWidth[lastChangeIndex] += chartWidth - sum - scrollWidthg - columnsWidth.length - 1;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    if (!settings.chartProp.info.enableHorzScroll) {
                        var width = $(selector).width() - scrollWidthg - columnsWidth.length;
                        var sum = _.sum(columnsWidth);
                        while (sum > width) {
                            console.log(width, scrollWidthg, sum);
                            for (var i = 0; i < columnsWidth.length; i++) {
                                columnsWidth[i]--;
                                sum--;
                            }
                        }
                    }
                    $headers.find("tr").children().each(function(i) {
                        var scrollWidth = 0;
                        if (childs.length - 1 == i) {
                            scrollWidth = scrollWidthg;
                        }
                        $(this).find("div").css({
                            width: columnsWidth[i] + scrollWidth + "px"
                        });
                    });
                    childs.each(function(i) {
                        var scrollWidth = 0;
                        if (childs.length - 1 == i) {
                            scrollWidth = scrollWidthg;
                        }
                        $(footer.get(i)).find("div").css({
                            width: columnsWidth[i] + scrollWidth + "px"
                        });
                    });
                    $content.find("tr:not(.clusterize-extra-row)").each(function() {
                        $(this).children().each(function(i) {
                            $(this).find("div").css({
                                width: columnsWidth[i] + "px"
                            });
                        });
                    });
                    first = false;
                };
            }();
            function onCellClick() {
                var i = $(this).data("xrow");
                var col = $(this).data("xcol");
                if (tableInfo.option.tableData.headers[col].prop.preventClick) return;
                if (tableInfo.option.pivoteMode) {
                    var d = tableData.rows[i][0];
                    if (isFromCommentDialog) {
                        return;
                    }
                    if (settings.chartProp.globalvariable && settings.chartProp.globalvariable.length > 0 && !settings.editMode) {
                        var h = input.series.labels.concat([ input.CurrentDimName ]);
                        var dh = d.series.concat(d.label);
                        app.globalVariableHelper.updateGlobalVariables(h, dh, settings.chartProp.globalvariable);
                        $(selector + " .selected-item").removeClass("selected-item");
                        $(this).addClass("selected-item");
                    }
                    if (d.onClickVal === "" || d.onClickVal === null) {
                        if (hasHref && !settings.editMode) {
                            app.chartCommons.openLink(settings.chartProp.info.openDashboard, {
                                ChartInPageId: settings.ChartInPageId,
                                DataSourceId: settings.input.DataSourceId,
                                dimensionName: settings.input.dimensionName,
                                value: d.value,
                                refreshDatasource: settings.input.RefreshDatasource
                            });
                        } else {
                            if (col < input.CurrentDimName.length) {
                                tableInfo.onTdClick(i, col, $(this));
                            }
                        }
                        return;
                    }
                    if (isProgress()) return;
                    showProgress(true);
                    settings.parameters = {
                        selectedItem: d.onClickVal,
                        chartId: settings.chartId,
                        ChartInPageId: settings.ChartInPageId,
                        notEditMode: !settings.editMode
                    };
                    app.chartCommons.drillDown.add(settings.ChartInPageId, settings.input.DataSourceId, settings.input.CurrentDimName, d.onClickVal, settings.input.RefreshDatasource);
                    app.chartCommons.levelTypeUtils.getParam(settings);
                    $(selector).charts(settings.type, "refreshWithData", settings);
                }
                if (!tableInfo.option.pivoteMode) {
                    tableInfo.onTdClick(i, col, $(this));
                }
            }
            var data = tableInfo.dataset;
            if (!tableInfo.option.remoteData && tableInfo.option.page) {
                if (tableInfo.option.page && tableInfo.option.page.Order && tableInfo.option.page.Order.length > 0) {
                    for (var p = 0; p < tableInfo.option.page.Order.length; p++) {
                        var entry = tableInfo.option.page.Order[p];
                        data = _.orderBy(data, function(d) {
                            return d.row[p];
                        }, entry.DescType == 1 ? "asc" : "desc");
                    }
                }
            }
            var $comment;
            tableInfo.clusterize = new Clusterize({
                rows: data.map(function(d) {
                    return d.markup;
                }),
                rows_in_block: Math.floor($(selector).height() / 33) + 1,
                scrollId: "scrollArea" + settings.id + "",
                contentId: "contentArea" + settings.id + "",
                callbacks: {
                    clusterChanged: function() {
                        fitHeaderColumns();
                        if (!tableInfo.option.remoteData) $content.find("tr:not(.clusterize-extra-row) td").on("mouseover", function(e, i) {
                            $(this).find("div").append($comment);
                        });
                        $content.find("tr:not(.clusterize-extra-row) td").on("click", onCellClick);
                        if (isFromCommentDialog) {
                            var collection = $content.find("tr:not(.clusterize-extra-row) td");
                            $(collection[0]).data("table-data", tableInfo.option.tableData);
                            app.chartCommons.commentUtils.setOnHighlightListener($content.find("tr:not(.clusterize-extra-row) td"), settings.ChartInPageId);
                        }
                    }
                }
            });
            $comment = $(selector + " .td-comment");
            $comment.on("click", function(event) {
                var row = $(this).parents("[data-xrow]").data("xrow");
                var col = $(this).parents("[data-xcol]").data("xcol");
                var d = tableInfo.option.tableData.rows[row][col];
                app.chartCommons.commentUtils.clickOnCommentIcon(d, settings.ChartInPageId);
                event.preventDefault();
                return false;
            });
            if (settings.chartProp.info.selectable == "edit" && settings.chartProp.info.showAddButton) {
                $openForm = $(' <div style="margin:5px;" class="temporal ui mini compact button form-new-record"><i class="icon add"></i> ' + app.lang.translate("new record") + " </div>");
                $(selector).parents(".chart-widget").find(".title").append($openForm);
                $openForm.on("click", function() {
                    $("body").trigger("open-form", [ input.form, 0, selector ]);
                });
            }
            var all = ($(selector).height() || 0) - ($(selector + " .legend-bar").height() || 0) - ($(selector + " .header-table").height() || 0) - ($(selector + " .footer-table").height() || 0) - ($(selector + " .form-new-record-container").outerHeight() || 0) - ($(selector + " .ui.pagination").height() || 0) - 4;
            $(selector + " .clusterize-scroll").css({
                "max-height": all + "px",
                "min-height": all + "px"
            });
            var scrollId = "#scrollArea" + settings.id + "";
            var offset = $(scrollId).scrollLeft();
            function trans3d() {
                var sLeft = $(scrollId).scrollLeft();
                $(selector + " .header-table").css("-ms-transform", "translate3d(" + (-offset + sLeft) + "px,0px,0px)");
                $(selector + " .footer-table").css("-ms-transform", "translate3d(" + (-offset + sLeft) + "px,0px,0px)");
                $(selector + " .header-table").css("-webkit-transform", "translate3d(" + (offset - sLeft) + "px,0px,0px)");
                $(selector + " .footer-table").css("-webkit-transform", "translate3d(" + (offset - sLeft) + "px,0px,0px)");
                $(selector + " .header-table").css("-moz-transform", "translate3d(" + -sLeft + "px,0px,0px)");
                $(selector + " .footer-table").css("-moz-transform", "translate3d(" + -sLeft + "px,0px,0px)");
            }
            $(function() {
                var pressed = false;
                var start = undefined;
                var startX, startWidth;
                $(selector + " .header-table th .resize").on("click", function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                });
                $(selector + " .header-table th .resize").mousedown(function(e) {
                    start = $(this).parent().find("div");
                    pressed = true;
                    startX = e.pageX;
                    startWidth = start.outerWidth();
                    $(start).addClass("resizing");
                });
                $(document).mousemove(function(e) {
                    if (pressed) {
                        var wid = startWidth + (startX - e.pageX);
                        $(start).css({
                            width: wid + "px"
                        });
                    }
                });
                $(document).mouseup(function(e) {
                    if (pressed) {
                        $(start).removeClass("resizing");
                        pressed = false;
                        var columnsWidth = [];
                        $(selector + " .header-table th").each(function() {
                            columnsWidth.push($(this).outerWidth());
                        });
                        columnsWidth[columnsWidth.length - 1] -= scrollBarWidth;
                        var s = 0;
                        for (var i = 0; i < columnsWidth.length; i++) {
                            s += columnsWidth[i];
                        }
                        $(selector).data("columnsWidth", columnsWidth);
                        fitHeaderColumns();
                        offset = $(scrollId).scrollLeft();
                        $(selector).trigger("columnsWidth", [ {
                            columnsWidth: columnsWidth
                        } ]);
                    }
                });
            });
            $(scrollId).on("scroll", trans3d);
            trans3d();
            $(selector + " .ui.pagination a").on("click", function() {
                var page = $(this).attr("value");
                tableInfo.gotoPage(parseInt(page));
            });
            $(selector + " .header-table th").on("click", function(e, i) {
                var col = +$(this).index();
                tableInfo.option.page = tableInfo.option.page || {};
                tableInfo.option.page.Order = tableInfo.option.page.Order || [];
                var entry = _.find(tableInfo.option.page.Order, {
                    Index: col
                });
                if (!entry) {
                    entry = {
                        Index: col,
                        DescType: 2
                    };
                }
                _.remove(tableInfo.option.page.Order, entry);
                tableInfo.option.page.Order.push(entry);
                entry.DescType = entry.DescType == 1 ? 2 : 1;
                $(this).find(".icon").remove();
                $(this).find("div").append('<i class="icon sort ' + (entry.DescType == 1 ? "ascending" : "descending") + '"></i>');
                tableInfo.sort();
            });
            if (!tableInfo.option.remoteData && tableInfo.option.page.Order) {
                tableInfo.sort();
            }
        },
        sort: function() {
            if (!tableInfo.option.remoteData) {
                var funArray = _.reverse(tableInfo.option.page.Order.map(function(item) {
                    return function(d) {
                        return d.row[item.Index];
                    };
                }));
                var orderArray = _.reverse(tableInfo.option.page.Order.map(function(item) {
                    return item.DescType == 1 ? "asc" : "desc";
                }));
                tableInfo.clusterize.update(_.map(_.orderBy(tableInfo.dataset, funArray, orderArray), "markup"));
            }
            if (tableInfo.option.remoteData) {
                tableInfo.sortRemote();
            }
            if (settings.editMode) {
                $(selector).trigger("tableInfo", [ {
                    TableInfo: tableInfo.option.page
                } ]);
            }
        },
        sortRemote: function() {
            if (isProgress()) return;
            showProgress(true);
            $.extend(settings.parameters, {
                TableInfo: tableInfo.option.page,
                notEditMode: !settings.editMode
            });
            app.chartCommons.levelTypeUtils.getParam(settings);
            $(selector).charts(settings.type, "refreshWithData", settings, {
                refreshRelatedDatasources: false
            });
        },
        paging: function(current) {
            var total = Math.ceil(tableInfo.option.totalRows / tableInfo.option.page.Limit);
            var showPageCount = 5;
            if (total == 1) return;
            if (total < showPageCount) showPageCount = total;
            var isFirst = current - Math.ceil(showPageCount / 2) > 0;
            var isLast = current + Math.ceil(showPageCount / 2) < total;
            var firstVal = !isFirst ? 1 : !isLast ? total - showPageCount + 1 : current - Math.ceil(showPageCount / 2) + 1;
            var li = "";
            for (var i = 0; i < showPageCount; i++) {
                li += "<a  " + (firstVal + i == current ? 'class="active item"' : 'class="item"') + ' value="' + (firstVal + i) + '"' + ">" + persian(firstVal + i, showPersian) + "</a>";
            }
            var $paging = "";
            if (li != "") $paging = '<div  class="ui borderless pagination menu attached  " style="">                                <a  ' + (!isFirst ? 'class="disabled item"' : 'class="item"') + ' value="' + 1 + '"' + ' style="border-right:1px solid #d4d4d5; border-radius:0;">&laquo;</a>                                ' + li + "                                <a  " + (!isLast ? 'class="disabled item"' : 'class="item"') + ' value="' + total + '"' + '>&raquo;</a>                                <div class="item" style="font-size: 0.8em;color: #9E9E9E;"> ' + app.lang.translate("all rows count") + ": " + persian(this.option.totalRows, showPersian) + "</div>                            </div>";
            return $paging;
        },
        gotoPage: function(page) {
            if (isProgress()) return;
            showProgress(true);
            TableInfo.Page = page;
            TableInfo.IsPageValid = true;
            $.extend(settings.parameters, {
                TableInfo: TableInfo,
                notEditMode: !settings.editMode
            });
            app.chartCommons.levelTypeUtils.getParam(settings);
            $(selector).charts(settings.type, "refreshWithData", settings, {
                refreshRelatedDatasources: false
            });
            settings.parameters.TableInfo.IsPageValid = false;
        },
        onTdClick: function(row, col, $td) {
            if (typeof settings.chartProp.info.selectable == "undefined") settings.chartProp.info.selectable = "multi";
            if (settings.chartProp.info.selectable == "none") return;
            if (settings.chartProp.info.selectable == "edit") {
                $("body").trigger("open-form", [ input.form, input.formIds[row], selector ]);
                return;
            }
            var selected = $td.hasClass("selected-item");
            var idx = col + 1 + (settings.chartProp.info.showRowNumber ? 1 : 0);
            if (settings.chartProp.info.rowAsKey && settings.chartProp.info.rowKey) {
                var i = _.findIndex(this.filteredHeaders, {
                    key: settings.chartProp.info.rowKey
                });
                if (i == -1) return;
                if (settings.chartProp.info.selectable == "one") $(selector + " .selected-item").removeClass("selected-item");
                if (selected) {
                    $td.parents("tr").find("td").removeClass("selected-item");
                } else {
                    $td.parents("tr").find("td").addClass("selected-item");
                }
            } else {
                if (settings.chartProp.info.selectable == "one") $(selector + " td:nth-child(" + idx + ").selected-item").removeClass("selected-item");
                if (selected) {
                    $td.removeClass("selected-item");
                } else {
                    $td.addClass("selected-item");
                }
            }
            if (settings.editMode) return;
            var values = $(selector + " td.selected-item").map(function() {
                var xrow = +$(this).data("xrow");
                var xcol = +$(this).data("xcol");
                if (xcol != col) return null;
                return tableInfo.option.tableData.rows[xrow][xcol].data;
            }).filter(function(d) {
                return d != null;
            }).toArray();
            var dim = this.filteredHeaders[col].key;
            if (hasHref && !settings.editMode) {
                app.chartCommons.openLink(settings.chartProp.info.openDashboard, {
                    ChartInPageId: settings.ChartInPageId,
                    DataSourceId: settings.input.DataSourceId,
                    dimensionName: dim,
                    value: values,
                    refreshDatasource: settings.input.RefreshDatasource
                });
                return;
            }
            var data = {
                Id: -1,
                Values: values,
                VariableType: 0,
                dimensionName: dim,
                datasourceId: input.DataSourceId,
                chartInPageId: settings.ChartInPageId,
                chartId: input.chartId
            };
            app.moderation.dashboadpage.selectValueOnChart(data, input.RefreshDatasource);
        }
    };
    if (+input.isPivot > -1) {
        settings.input = input;
        app.chartCommons.calculateFields(input.series, settings.calculatedFields);
        var chartInfo = input.chartInfo;
        var seriesLabels = typeof input.series != "undefined" ? input.series.labels : [];
        var kpisLabels = typeof input.kpis != "undefined" ? input.kpis.labels : [];
        var labels = d3Utils.convertToKeyValue(input);
        labels.seriesLabels = labels.seriesLabels.map(function(d) {
            d.prop = getProp(d.key);
            return d;
        });
        var seriesLabelsKeys = labels.seriesLabels.map(function(d) {
            return d.key;
        });
        var seriesLabelsValues = labels.seriesLabels.map(function(d) {
            return d.value;
        });
        var yAxeLable = settings.LabelY;
        var colors = d3.scaleOrdinal(d3.schemeCategory10);
        app.chartCommons.setDefault(settings.chartProp, seriesLabelsKeys.concat(chartInfo.hierarchyLabels), "table");
        if (settings.editMode) {
            var mLabels = seriesLabelsKeys.concat(chartInfo.hierarchyLabels);
            if (settings.chartProp.info.showRowNumber) {
                mLabels.splice(0, 0, rowNumberLablel);
            }
            $(selector).trigger("chartproperty", [ mLabels ]);
        }
        if (!input.result) {
            $("#" + settings.id).append(app.chartCommons.getError(input));
            return;
        }
        var data = prepareData(input, null, true);
        var seriesLabelsCaptions = input.seriesLablesCaptions;
        var kpisLabelsCaptions = input.kpisLablesCaptions;
        d3Utils.prepareDataForBarChart(data, settings, seriesLabels, kpisLabels, seriesLabelsCaptions, kpisLabelsCaptions);
        if (input.levels && input.levels.length > 0) {
            var legendBar = d3.select(selector).append("div").attr("class", "legend-bar temporal");
            legendBar.breadcrumb(input.levels, settings, titlebar, showPersian);
        }
        if (app.dashboardLayoutVersion === 2 && !settings.editMode) {
            var lb = $(selector + " .legend-bar");
            var topMargin = lb.css("margin-top");
            var topMarginDigit = topMargin ? +lb.css("margin-top").replace("px", "") : 0;
            var legendHeight = typeof lb === "undefined" ? 0 : lb.height() + 0;
            barHeight -= legendHeight;
        }
        if (!input.matrix || input.matrix.length === 0) {
            d3.select(selector).append("div").attr("class", "temporal").style("font-size", "0.8em").style("margin", "15px").append("span").attr("class", "translate").attr("data-trans-key", "داده‌ای برای نمایش وجود ندارد").text("داده‌ای برای نمایش وجود ندارد");
            return;
        }
        var headers = labels.seriesLabels.map(function(d) {
            return {
                key: d.key,
                value: d.value,
                prop: getProp(d.key)
            };
        });
        _.each(input.CurrentDimName, function(dim) {
            headers.unshift({
                key: dim,
                value: dim,
                prop: getProp(dim)
            });
        });
        var tableData = {
            rows: data.map(function(d) {
                var row = d.series;
                _.each(d.label, function(l, i) {
                    row.unshift({
                        data: l,
                        prop: headers[i].prop,
                        key: headers[i].key,
                        label: headers[i].value,
                        onClickVal: d.onClickVal ? d.value : null,
                        value: d.value
                    });
                });
                return row;
            }),
            headers: headers
        };
        tableInfo.render({
            selector: selector,
            settings: settings,
            tableData: tableData,
            resultRows: input.resultRows,
            pivoteMode: true,
            page: settings.tableInfo
        });
        return;
    } else {
        settings.input = input;
        app.chartCommons.setDefault(settings.chartProp, input.headers, "table");
        if (settings.editMode) {
            var mLabels = input.headers.concat([]);
            if (settings.chartProp.info.showRowNumber) {
                mLabels.splice(0, 0, rowNumberLablel);
            }
            $(selector).trigger("chartproperty", [ mLabels ]);
        }
        if (!input.result) {
            $("#" + settings.id).append(app.chartCommons.getError(input));
            return;
        }
        var nonPivotMatrix = input.nonPivotMatrix;
        var dims = input.Dimentions.Hierarchies.concat(input.Dimentions.SeriesLevel || []);
        var headers = input.headers.map(function(d, i) {
            return {
                key: dims[i],
                value: d,
                prop: getProp(d)
            };
        });
        var tableData = {
            rows: nonPivotMatrix.map(function(d) {
                var row = d.map(function(r) {
                    return {
                        data: r
                    };
                });
                return row;
            }),
            headers: headers
        };
        tableInfo.render({
            selector: selector,
            settings: settings,
            tableData: tableData,
            resultRows: input.resultRows,
            page: input.TableInfo,
            totalRows: input.nonPivotMatrixLength,
            remoteData: true
        });
        return;
        d3.select(selector).append("div").attr("class", "temporal table-body");
        var currentPage = input.TableInfo.Page;
        function paging(current) {
            var total = Math.ceil(input.nonPivotMatrixLength / input.TableInfo.Limit);
            var showPageCount = 5;
            if (total == 1) return;
            if (total < showPageCount) showPageCount = total;
            var isFirst = current - Math.ceil(showPageCount / 2) > 0;
            var isLast = current + Math.ceil(showPageCount / 2) < total;
            var firstVal = !isFirst ? 1 : !isLast ? total - showPageCount + 1 : current - Math.ceil(showPageCount / 2) + 1;
            var li = "";
            for (var i = 0; i < showPageCount; i++) {
                li += "<a  " + (firstVal + i == current ? 'class="active item"' : 'class="item"') + ' value="' + (firstVal + i) + '"' + ">" + (firstVal + i) + "</a>";
            }
            if (li != "") $(selector + " .table-body").append('<div  class="ui borderless pagination menu attached  " style="">                        <a  ' + (!isFirst ? 'class="disabled item"' : 'class="item"') + ' value="' + 1 + '"' + ' style="border-right:1px solid #d4d4d5; border-radius:0;">&laquo;</a>                        ' + li + "                        <a  " + (!isLast ? 'class="disabled item"' : 'class="item"') + ' value="' + total + '"' + ">&raquo;</a>                    </ul>");
            $(selector + " .table-body .pagination a").on("click", function() {
                var page = $(this).attr("value");
                gotoPage(parseInt(page));
            });
        }
        function drawTable(selector, data, currentPage) {
            $(selector + " .table-body").empty();
            var table = d3.select(selector + " .table-body").styles({
                overflow: "hidden"
            }).append("div").attr("id", "tablescroll").append("table").attr("class", " ui celled table unstackable small table-chart" + tableStyle + (settings.chartProp.info.condensed ? "table-condensed" : ""));
            var thead = table.append("thead").style("background-color", "white").append("tr");
            var tr = table.append("tbody").selectAll("nothing").data(data).enter().append("tr").attr("class", "pointer");
            if (settings.chartProp.globalvariable && settings.chartProp.globalvariable.length > 0 && !settings.editMode) {
                tr.on("click", function(filedsData) {
                    $(selector + " .selected-item").removeClass("selected-item");
                    $(this).addClass("selected-item");
                });
            }
            var tds = tr.selectAll("nothing").data(function(d) {
                return d;
            }).enter().append("td").style("font-weight", function(d, i) {
                return headers[i].prop.textBold ? "bold" : "normal";
            }).style("font-style", function(d, i) {
                return headers[i].prop.textItalic ? "italic" : "normal";
            }).style("font-size", function(d, i) {
                return headers[i].prop.fontSize;
            }).style("text-align", function(d, i) {
                return headers[i].prop.textAlign;
            }).style("color", function(d, i) {
                return headers[i].prop.color;
            }).style("display", function(d, i) {
                return headers[i].prop.isHidden ? "none" : "auto";
            }).attr("data-value", function(d) {
                return d;
            }).on("click", function(d, i) {
                onTdClick.call(this, d, i, dims, input.nonPivotMatrix);
            });
            tds.each(function(d, i) {
                var isn = isNaN(d);
                if (!isn) d *= +headers[i].prop.numberFactor;
                var r = d;
                if (!isn) {
                    r = d3.format(headers[i].prop.formatString)(d);
                }
                var isHtml = headers[i].prop.isHtml;
                var t = persian(r, showPersian && !isHtml);
                if (isHtml) d3.select(this).html(t); else d3.select(this).text(t);
            });
            var hasResult = false;
            var headersKey = headers.map(function(d) {
                return d.key;
            });
            input.resultRows.sort(function(a, b) {
                var aindex = headersKey.indexOf(a.Name);
                var bindex = headersKey.indexOf(b.Name);
                return aindex < bindex ? -1 : aindex > bindex ? 1 : 0;
            });
            var hiddenResultRows = table.select("tbody").append("tr").selectAll("nothing").data(input.resultRows).enter().append("td").style("font-weight", "bold").style("display", function(d, i) {
                return headers[i].prop.isHidden ? "none" : "auto";
            }).text(function(d, i) {
                if (d.Value == "" || d.Value == null) return "";
                var isn = isNaN(d.Value);
                var r = d.Value;
                var p = getProp(d.Name);
                if (!isn && +d.Type != 3) r = +d.Value * +p.numberFactor;
                if (!isn) {
                    r = d3.format(p.formatString)(r);
                }
                return persian(r, showPersian);
            });
            var sums = d3.select(selector + " .table-body").append("div").attr("class", "table-footer").append("table").attr("class", " ui celled table unstackable small table-chart" + tableStyle + (settings.chartProp.info.condensed ? "table-condensed" : "")).append("thead").append("tr").selectAll("nothing").data(input.resultRows).enter().append("th").style("width", "1px").style("display", function(d, i) {
                return headers[i].prop.isHidden ? "none" : "auto";
            }).style("font-weight", function(d, i) {
                return headers[i].prop.textBold ? "bold" : "normal";
            }).style("font-style", function(d, i) {
                return headers[i].prop.textItalic ? "italic" : "normal";
            }).style("font-size", function(d, i) {
                return headers[i].prop.fontSize;
            }).style("text-align", function(d, i) {
                return headers[i].prop.textAlign;
            }).style("color", function(d, i) {
                return headers[i].prop.color;
            }).text(function(d, i) {
                if (d.Value == "" || d.Value == null) return "";
                hasResult = true;
                var isn = isNaN(d.Value);
                var r = d.Value;
                var p = getProp(d.Name);
                if (!isn && +d.Type != 3) r = +d.Value * +p.numberFactor;
                if (!isn) {
                    r = d3.format(p.formatString)(r);
                }
                return persian(r, showPersian);
            });
            var table2 = d3.select(selector + " .table-body").insert("div", "#tablescroll").attr("class", "header-table").append("table").attr("class", " ui celled table unstackable small table-chart" + tableStyle + (settings.chartProp.info.condensed ? "table-condensed" : ""));
            var thead2 = table2.append("thead").style("background-color", "white").append("tr");
            addHeaders(headers, thead2, table2, {
                sort: function(k, el, tr) {
                    if (isProgress()) return;
                    showProgress(true);
                    if (TableInfo.Order == null) {
                        TableInfo.Order = [ {
                            Index: k,
                            DescType: 1
                        } ];
                    } else {
                        var find = false;
                        for (var i = 0; i < TableInfo.Order.length; i++) {
                            var d = TableInfo.Order[i];
                            if (d.Index == k) {
                                var newEl = {
                                    Index: k,
                                    DescType: d.DescType == 0 ? 1 : d.DescType == 1 ? 2 : 1
                                };
                                var s = TableInfo.Order.splice(i, 1);
                                TableInfo.Order.push(newEl);
                                find = true;
                                break;
                            }
                        }
                        if (!find) {
                            TableInfo.Order.push({
                                Index: k,
                                DescType: 1
                            });
                        }
                    }
                    $.extend(settings.parameters, {
                        TableInfo: TableInfo,
                        notEditMode: !settings.editMode
                    });
                    if (settings.editMode) {
                        $(selector).trigger("tableInfo", [ {
                            TableInfo: TableInfo
                        } ]);
                    }
                    $(selector).charts(chartTypes.TABLE, "refreshWithData", settings, {
                        refreshRelatedDatasources: false
                    });
                },
                filter: function() {
                    var params = getFilterParameter();
                    if (isProgress()) return;
                    showProgress(true);
                    TableInfo.Filter = params.map(function(d, i) {
                        d.value = depersian(d.value, showPersian);
                        if (RegExp(/^[\d,]+$/).test(d.value)) {
                            d.value = d.value.replace(/,/g, "");
                        }
                        return {
                            Index: i,
                            FilterType: d.type,
                            FilterParameter: d.value
                        };
                    });
                    TableInfo.Page = 1;
                    settings.TableInfo = TableInfo;
                    $.extend(settings.parameters, {
                        TableInfo: TableInfo,
                        notEditMode: !settings.editMode
                    });
                    $(selector).charts(chartTypes.TABLE, "refreshWithData", settings, {
                        refreshRelatedDatasources: false
                    });
                },
                filterclear: function(i) {
                    $(selector + " #filterbox-" + i + " input").val("");
                    var params = getFilterParameter();
                    if (isProgress()) return;
                    showProgress(true);
                    TableInfo.Filter = params.map(function(d, i) {
                        return {
                            Index: i,
                            FilterType: d.type,
                            FilterParameter: d.value
                        };
                    });
                    TableInfo.Page = 1;
                    settings.TableInfo = TableInfo;
                    $.extend(settings.parameters, {
                        TableInfo: TableInfo
                    });
                    $(selector).charts(chartTypes.TABLE, "refreshWithData", settings, {
                        refreshRelatedDatasources: false
                    });
                }
            });
            d3.select(thead2[0][0]).selectAll("th").style("width", "1px");
            if (!nonPivotMatrix || nonPivotMatrix.length == 0) {
                table.select("tbody").append("tr").append("td").attr("colspan", headers.length).append("div").style("font-size", "0.8em").append("span").attr("class", "translate").attr("data-trans-key", "داده‌ای برای نمایش وجود ندارد").text("داده‌ای برای نمایش وجود ندارد");
            }
            var f = tr[0];
            f.forEach(function(d, i) {
                getIndicator(d.__data__, headers, d);
            });
            addHeaders(headers, thead, table, {
                sort: function() {},
                filter: function() {},
                filterclear: function() {}
            });
            paging(currentPage);
            $(selector).trigger("heightChange");
            if (settings.chartProp.info.showRowNumber && showHeader) {
                var offset = (input.TableInfo.Page - 1) * input.TableInfo.Limit + 1;
                tr.insert("td", "td").text(function(d, i) {
                    return persian(offset + i, showPersian);
                }).style("text-align", "right");
                d3.select(hiddenResultRows.node().parentNode).insert("td", "td");
                thead2.insert("th", "th").text("ردیف");
                thead.insert("th", "th").text("ردیف");
                d3.select(selector + " .table-body .table-footer tr").insert("th", "th").style("width", "1px");
                sums = d3.selectAll(selector + " .table-body .table-footer tr th");
                hiddenResultRows = d3.select(hiddenResultRows.node().parentNode).selectAll("td");
            }
            postProcess(tr, thead, thead2, sums, hasResult, hiddenResultRows);
            $(selector).trigger("heightChange");
            var filterparameters = $(selector).data("filterbox");
            restoreFilterboxValue(filterparameters);
        }
        function gotoPage(page) {
            if (isProgress()) return;
            showProgress(true);
            TableInfo.Page = page;
            TableInfo.IsPageValid = true;
            $.extend(settings.parameters, {
                TableInfo: TableInfo,
                notEditMode: !settings.editMode
            });
            $(selector).charts(chartTypes.TABLE, "refreshWithData", settings, {
                refreshRelatedDatasources: false
            });
            settings.parameters.TableInfo.IsPageValid = false;
        }
        drawTable(selector, input.nonPivotMatrix, input.TableInfo.Page);
    }
    function onTdClick(d, i, dims, data) {
        var values = [];
        var dim = "";
        var selected = $(this).hasClass("selected-item");
        var trIndex = $(this).parents("tr").index();
        if (typeof settings.chartProp.info.selectable == "undefined") settings.chartProp.info.selectable = "multi";
        if (settings.chartProp.info.selectable == "none") return;
        if (settings.chartProp.info.selectable == "edit") {
            $("body").trigger("open-form", [ input.form, input.formIds[trIndex], selector ]);
            return;
        }
        if (settings.chartProp.info.rowAsKey && settings.chartProp.info.rowKey) {
            i = dims.indexOf(settings.chartProp.info.rowKey);
            if (i == -1) return;
            if (settings.chartProp.info.selectable == "one") $(selector + " .selected-item").removeClass("selected-item");
            if (selected) {
                $(this).parents("tr").find("td").removeClass("selected-item");
            } else {
                $(this).parents("tr").find("td").addClass("selected-item");
            }
        } else {
            if (settings.chartProp.info.selectable == "one") $(selector + " td:nth-child(" + (i + 1) + ").selected-item").removeClass("selected-item");
            if (selected) {
                $(this).removeClass("selected-item");
            } else {
                $(this).addClass("selected-item");
            }
        }
        var idx = i + 1 + (settings.chartProp.info.showRowNumber ? 1 : 0);
        var values = $(selector + " td:nth-child(" + idx + ").selected-item").map(function() {
            return data[trIndex][i];
        }).toArray();
        dim = dims[i];
        values = values.filter(function(item, pos) {
            return values.indexOf(item) == pos;
        });
        if (settings.editMode) return;
        var data = {
            Id: -1,
            Values: values,
            VariableType: 0,
            dimensionName: dim,
            datasourceId: input.DataSourceId,
            chartInPageId: settings.ChartInPageId,
            chartId: input.chartId
        };
        app.moderation.dashboadpage.selectValueOnChart(data, input.RefreshDatasource);
    }
    function hasScrollBar(el) {
        return $(el).get(0).scrollHeight > $(el).height();
    }
    function postProcess(tr, thead, thead2, sums, hasResult, hiddenResultRows) {
        var tt = tr[0][0];
        var maxWidth = 0;
        var fullWidth = $(selector).parents(".ui.card").width();
        $(tt).find("td").each(function(i, d) {
            var ds = sums[0][i];
            var ths = d3.select(thead2[0][0]).selectAll("th");
            var th = ths[0][i];
            var ths1 = d3.select(thead[0][0]).selectAll("th");
            var th1 = ths1[0][i];
            var width = $(d).outerWidth();
            var innerWidth = $(d).width();
            var padt = $(d).css("padding-top");
            var padl = $(d).css("padding-left");
            var padr = $(d).css("padding-right");
            var padb = $(d).css("padding-bottom");
            var setParams = function(el) {
                el.css("width", width + "px");
                el.css("max-width", width + "px");
                el.css("min-width", width + "px");
                el.css("padding-top", padt);
                el.css("padding-left", padl);
                el.css("padding-right", padr);
                el.css("padding-bottom", padb);
            };
            setParams($(ds));
            setParams($(tr[0][0]).map(function(j, dd) {
                return $(dd).find("td")[i];
            }));
            setParams($(th));
        });
        thead.remove();
        if (!hasResult) $(selector + " .table-footer").remove();
        hiddenResultRows.remove();
        var w = $(tt).outerWidth();
        $(selector + " table").css("width", w + "px");
        $(selector + " table").css("max-width", w + "px");
        function getScrollbarWidth() {
            var outer = document.createElement("div");
            outer.style.visibility = "hidden";
            outer.style.width = "100px";
            outer.style.msOverflowStyle = "scrollbar";
            document.body.appendChild(outer);
            var widthNoScroll = outer.offsetWidth;
            outer.style.overflow = "scroll";
            var inner = document.createElement("div");
            inner.style.width = "100%";
            outer.appendChild(inner);
            var widthWithScroll = inner.offsetWidth;
            outer.parentNode.removeChild(outer);
            return widthNoScroll - widthWithScroll;
        }
        if (hasScrollBar($(selector + " #tablescroll"))) {
            var scw = 0;
            scw = getScrollbarWidth();
            var expanded = scw + $(selector + " .header-table table th:last-child").outerWidth();
            $(selector + " .header-table table th:last-child").css({
                "min-width": expanded + "px",
                "max-width": expanded + "px",
                width: expanded + "px"
            });
            expanded = scw + $(selector + " .table-footer table th:last-child").outerWidth();
            $(selector + " .table-footer table th:last-child").css({
                "min-width": expanded + "px",
                "max-width": expanded + "px",
                width: expanded + "px"
            });
        }
        var offset = $(selector + " #tablescroll").scrollLeft();
        function trans3d() {
            $(selector + " .header-table").css("-ms-transform", "translate3d(" + (-offset + $(selector + " #tablescroll").scrollLeft()) + "px,0px,0px)");
            $(selector + " .table-footer").css("-ms-transform", "translate3d(" + (-offset + $(selector + " #tablescroll").scrollLeft()) + "px,0px,0px)");
            $(selector + " .header-table").css("-webkit-transform", "translate3d(" + (offset - $(selector + " #tablescroll").scrollLeft()) + "px,0px,0px)");
            $(selector + " .table-footer").css("-webkit-transform", "translate3d(" + (offset - $(selector + " #tablescroll").scrollLeft()) + "px,0px,0px)");
            $(selector + " .header-table").css("-moz-transform", "translate3d(" + -$(selector + " #tablescroll").scrollLeft() + "px,0px,0px)");
            $(selector + " .table-footer").css("-moz-transform", "translate3d(" + -$(selector + " #tablescroll").scrollLeft() + "px,0px,0px)");
        }
        $(selector + " #tablescroll").on("scroll", trans3d);
        trans3d();
        if (app.dashboardLayoutVersion == 2 && !settings.editMode) {
            var hScroll = $(selector + " .table-body").get(0).scrollWidth > $(selector + " .table-body").innerWidth() ? 15 : 0;
            hScroll = 0;
            var pagingDiv = 0;
            try {
                pagingDiv = $(selector + " .pagination").height() + +$(selector + " .pagination").css("margin-top").replace("px", "");
            } catch (e) {}
        }
    }
    function checkRow(ifObj, fields, headers) {
        var Index = headers.indexOf(ifObj.firstField);
        var firstVal = fields[Index];
        var secVal = ifObj.secondFieldIsText ? ifObj.secondFieldInput : fields[headers.indexOf(ifObj.secondFieldSelect)];
        firstVal = depersian(firstVal);
        secVal = depersian(secVal);
        if (!isNaN(secVal)) secVal = +secVal;
        if (!isNaN(firstVal)) firstVal = +firstVal;
        switch (+ifObj.operand) {
          case 1:
            return firstVal == secVal;

          case 2:
            return firstVal != secVal;

          case 3:
            return firstVal > secVal;

          case 4:
            return firstVal >= secVal;

          case 5:
            return firstVal < secVal;

          case 6:
            return firstVal <= secVal;

          case 7:
            return firstVal.indexOf(secVal) > -1;

          case 8:
            return firstVal.indexOf(secVal) <= -1;

          default:        }
    }
    function getIndicator(fields, headers, tr) {
        return;
        var result = [];
        var hKeys = headers.map(function(d) {
            return d.key;
        });
        if (settings.chartProp.indicator) settings.chartProp.indicator.forEach(function(ind) {
            var isTrue = true;
            $.each(ind.ifRow, function(i, d) {
                if (!checkRow(d, fields, hKeys)) {
                    isTrue = false;
                    return false;
                }
            });
            if (isTrue) {
                var tds = $(tr).find("td");
                $.each(ind.thenRow, function(i, thenObj) {
                    var firstFieldIndex = hKeys.indexOf(thenObj.firstField);
                    var td = $(tds[firstFieldIndex]);
                    switch (+thenObj.operand) {
                      case 1:
                        td.css("color", thenObj.secondFieldColor);
                        break;

                      case 2:
                        td.append(' <span class="' + thenObj.secondFieldIcon + '"> </span> ');
                        break;

                      case 3:
                        td.css("background-color", thenObj.secondFieldBackColor);
                        break;

                      case 4:
                        var v = +thenObj.secondFieldStyle;
                        if (v == 1) {
                            td.css("font-weight", "normal");
                            td.css("font-style", "normal");
                        }
                        if (v == 2 || v == 4) td.css("font-weight", "bold");
                        if (v == 3 || v == 4) td.css("font-style", "italic");
                        if (v == 5) td.css("text-decoration", "underline");
                        break;

                      case 5:
                        td.text(thenObj.secondFieldReplace);
                        break;
                    }
                });
            }
        });
    }
    function sorting(k, el, tr) {
        var obj = $(el);
        isDesc = false;
        if (TableInfo && TableInfo.Order) {
            for (var i = 0; i < TableInfo.Order.length; i++) {
                var d = TableInfo.Order[i];
                if (d.Index == k) {
                    isDesc = d.DescType == 2;
                    break;
                }
            }
        }
        tr.sort(function(a, b) {
            if (typeof a.label != "undefined") {
                a = [ a.label ].concat(a.series);
                b = [ b.label ].concat(b.series);
            }
            if (typeof isDesc != "undefined" && isDesc) {
                return /^[0-9.]+$/.test(a[k]) ? d3.descending(+a[k], +b[k]) : d3.descending(a[k], b[k]);
            } else {
                return /^[0-9.]+$/.test(a[k]) ? d3.ascending(+a[k], +b[k]) : d3.ascending(a[k], b[k]);
            }
        });
    }
    function addHeaders(headers, thead, table, calbacks) {
        if (!showHeader) return;
        var ths = thead.selectAll("nothing").data(headers).enter().append("th").html(function(d, i) {
            var filter = "";
            filter = '<div class="ui  dropdown " id="filterbox-' + i + '"><i class="table-filter-icon filter icon"></i><div class="menu"><div class="ui left icon input mini"><i class="search icon"></i><input type="text" name="search" placeholder="جستجو"></div><div class="item"></div>';
            var dx = '<div class="dropdown inline grid-filter" id="filterbox-' + i + '">                                      <span class="dropdown-toggle glyphicon glyphicon-filter" href="#" data-toggle="dropdown"></span>                                       <div class="dropdown-menu dropdown-menu-right" style="padding: 15px;z-index:1000">                                                                                           <div style="text-align: right;">                                                                                                             <div class="form-group">                                                                                                                     <select class="form-control">                                                                                                                <option value="1">شامل</option>                                                                                                         <option value="6">شامل نباشد</option>                                                                                                         <option value="2">دقیقا برابر با</option>                                                                                             <option value="3">بزرگ‌تر از</option>                                                                                                    <option value="4">کوچکتر از</option>                                                                                                    <option value="5">بین اعداد</option>                                                                                                </select>                                                                                                                                <input style="margin-top: 10px" class="form-control " value="">                                                                      </div>                                                                                                                                   <div class="btn-group btn-group-justified">                                                                                                  <a style="padding-right: 0; padding-left: 0;" class="btn btn-primary">فیلتر</a>                                                         <a style="padding-right: 0; padding-left: 0;" class="btn btn-default">پاک کردن</a>                                                  </div>                                                                                                                               </div>                                                                                                                               </div>                                                                                                                               </div>';
            return '<div class="inline header-text pointer" style="white-space:initial;">' + persian(d.prop.name || d.value, showPersian).replace(/^\[measure\]/, "") + "</div>" + filter;
        }).attr("class", "pointer hover-show-glyph").style("white-space", "nowrap").style("text-align", function(d, i) {
            return d.prop.textAlign;
        }).style("display", function(d, i) {
            return d.prop.isHidden ? "none" : "auto";
        });
        var sw = 0;
        ths[0].forEach(function(dd, idx) {
            sw += +$(dd).width();
            if (sw < 130 || idx == 0) {
                var el = $(dd).find(".dropdown-menu-right");
                el.removeClass("dropdown-menu-right");
                el.addClass("dropdown-menu-left");
            }
        });
        table.selectAll("thead th").each(function(d, i) {
            d3.select(this).select(".header-text").on("click", function() {
                calbacks.sort(i, this, tr);
                if (settings.editMode && selector) {
                    $(selector).trigger("legendClick", [ d.label, i, d ]);
                }
            });
        });
        table.selectAll("thead th").each(function(d, i) {
            $(this).find("input").keyup(function(e) {
                if (e.keyCode == 13) {
                    calbacks.filter();
                }
            });
        });
        table.selectAll("thead th").each(function(d, i) {
            $(this).find(".btn-default").on("click", function() {
                calbacks.filterclear(i);
            });
        });
        table.selectAll("thead th").each(function(d, i) {
            $(this).find(".dropdown").on("shown.bs.dropdown", function() {
                $(this).find("input").focus();
            });
        });
        for (var i = 0; i < headers.length; i++) {
            d3.select(selector + " #filterbox-" + i + " select").on("click", function(d) {
                d3.event.stopPropagation();
            });
            d3.select(selector + " #filterbox-" + i + " input").on("click", function(d) {
                d3.event.stopPropagation();
            });
            $(selector + " #filterbox-" + i + " input").mousedown(function(e) {
                if (e.which == 3) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }
            });
            $(selector + " #filterbox-" + i).on("keypress", function(e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    $(this).find(".btn-primary").click();
                }
            });
        }
        if (!settings.editMode) {
            $(selector).find(".ui.dropdown").lazyDropdown();
        }
    }
    function getPropOfIndexFromKeyValueLabel(i) {
        if (i >= headers.length) i = headers.length - 1;
        return headers[i].prop;
    }
    function getProp(d) {
        var def = {
            numberFactor: "1",
            textAlign: "right",
            formatString: ",.2f",
            fontSize: "1em",
            textItalic: false,
            textBold: false,
            color: "#000000",
            rowResult: "0",
            isHidden: false
        };
        try {
            return settings.chartProp.series[d] || settings.chartProp.series["default"] || def;
        } catch (e) {
            return def;
        }
    }
    function getFilterParameter() {
        var parameters = [];
        var headers = $(selector + " table thead th input");
        for (var i = 0; i < headers.length; i++) {
            value = $(selector + " #filterbox-" + i + " input").val();
            type = $(selector + " #filterbox-" + i + " select").val() || 1;
            if (type == null) {
                return;
            }
            if (typeof value != "undefined" && value != null && value != "") {
                $(selector + " #filterbox-" + i + " .glyphicon-filter").addClass("show");
                d3.select(selector + " #filterbox-" + i + " select").on("click", function(d) {
                    d3.event.stopPropagation();
                });
                d3.select(selector + " #filterbox-" + i + " input").on("click", function(d) {
                    d3.event.stopPropagation();
                });
                $(selector + " #filterbox-" + i + " input").mousedown(function(e) {
                    if (e.which == 3) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                    }
                });
            }
            parameters.push({
                value: value,
                type: type
            });
        }
        $(selector).data("filterbox", parameters);
        return parameters;
    }
    function filterTable() {
        var parameters = getFilterParameter();
        if (typeof tr != "undefined") {
            tr.style("display", function(a) {
                if (typeof a.label != "undefined") {
                    a = [ a.label ].concat(a.series);
                }
                var r = filter(a, parameters);
                return r ? null : "none";
            });
        }
        if (settings.editMode) {
            $(selector).trigger("tableInfo", [ {
                TableInfo: TableInfo
            } ]);
        }
    }
    function restoreFilterboxValue(filterparameters, dontFilter) {
        if (typeof filterparameters != "undefined") {
            var needfilter = false;
            for (var i = 0; i < filterparameters.length; i++) {
                if (typeof filterparameters[i].value != "undefined" && filterparameters[i].value != "") needfilter = true;
                $(selector + " #filterbox-" + i + " input").val(filterparameters[i].value);
                if (!_.isEmpty(filterparameters[i].value)) {
                    $(selector + " #filterbox-" + i + " .table-filter-icon").addClass("fill");
                }
                $(selector + " #filterbox-" + i + " select").val(filterparameters[i].type);
            }
            if (needfilter && !dontFilter) {
                filterTable();
            }
        }
    }
    if (input.TableInfo && input.TableInfo.Filter) {
        var filterparameters = input.TableInfo.Filter.map(function(d) {
            return {
                value: d.FilterParameter,
                type: d.FilterType
            };
        });
        restoreFilterboxValue(filterparameters);
    }
    var filterparameters = $(selector).data("filterbox");
    restoreFilterboxValue(filterparameters);
    function filter(tableValue, parameters) {
        var finalBool = true;
        for (var i = 0; i < parameters.length; i++) {
            parameter = parameters[i].value;
            parameter = depersian(parameter);
            parameter = RegExp(/^[\d,\s]+$/).test(parameter) ? +parameter.replace(/,/g, "") : parameter;
            type = parameters[i].type;
            if (typeof parameter == "undefined" || parameter == "") continue;
            switch (+type) {
              case 1:
                var dd = tableValue[i];
                finalBool = finalBool && tableValue[i].indexOf(parameter) != -1;
                break;

              case 6:
                var dd = tableValue[i];
                finalBool = finalBool && tableValue[i].indexOf(parameter) == -1;
                break;

              case 2:
                finalBool = finalBool && (parseFloat(tableValue[i]) || 0) == parameter;
                break;

              case 3:
                finalBool = finalBool && (parseFloat(tableValue[i]) || 0) > parameter;
                break;

              case 4:
                finalBool = finalBool && (parseFloat(tableValue[i]) || 0) < parameter;
                break;

              case 5:
                var params = parameter.split(",");
                if (params != "undefined") finalBool = finalBool && (parseFloat(tableValue[i]) || 0) > params[0] && (parseFloat(tableValue[i]) || 0) < params[1];
                break;

              default:            }
        }
        return finalBool;
    }
};

(function(name, definition) {
    if (typeof module != "undefined") module.exports = definition(); else if (typeof define == "function" && typeof define.amd == "object") define(definition); else this[name] = definition();
})("Clusterize", function() {
    "use strict";
    var ie = function() {
        for (var v = 3, el = document.createElement("b"), all = el.all || []; el.innerHTML = "<!--[if gt IE " + ++v + "]><i><![endif]-->", 
        all[0]; ) {}
        return v > 4 ? v : document.documentMode;
    }(), is_mac = navigator.platform.toLowerCase().indexOf("mac") + 1;
    var Clusterize = function(data) {
        if (!(this instanceof Clusterize)) return new Clusterize(data);
        var self = this;
        var defaults = {
            rows_in_block: 50,
            blocks_in_cluster: 4,
            tag: null,
            show_no_data_row: true,
            no_data_class: "clusterize-no-data",
            no_data_text: "No data",
            keep_parity: true,
            callbacks: {}
        };
        self.options = {};
        var options = [ "rows_in_block", "blocks_in_cluster", "show_no_data_row", "no_data_class", "no_data_text", "keep_parity", "tag", "callbacks" ];
        for (var i = 0, option; option = options[i]; i++) {
            self.options[option] = typeof data[option] != "undefined" && data[option] != null ? data[option] : defaults[option];
        }
        var elems = [ "scroll", "content" ];
        for (var i = 0, elem; elem = elems[i]; i++) {
            self[elem + "_elem"] = data[elem + "Id"] ? document.getElementById(data[elem + "Id"]) : data[elem + "Elem"];
            if (!self[elem + "_elem"]) throw new Error("Error! Could not find " + elem + " element");
        }
        if (!self.content_elem.hasAttribute("tabindex")) self.content_elem.setAttribute("tabindex", 0);
        var rows = isArray(data.rows) ? data.rows : self.fetchMarkup(), cache = {}, scroll_top = self.scroll_elem.scrollTop;
        self.insertToDOM(rows, cache);
        self.scroll_elem.scrollTop = scroll_top;
        var last_cluster = false, scroll_debounce = 0, pointer_events_set = false, scrollEv = function() {
            if (is_mac) {
                if (!pointer_events_set) self.content_elem.style.pointerEvents = "none";
                pointer_events_set = true;
                clearTimeout(scroll_debounce);
                scroll_debounce = setTimeout(function() {
                    self.content_elem.style.pointerEvents = "auto";
                    pointer_events_set = false;
                }, 50);
            }
            if (last_cluster != (last_cluster = self.getClusterNum())) {
                self.insertToDOM(rows, cache);
            }
            if (self.options.callbacks.scrollingProgress) self.options.callbacks.scrollingProgress(self.getScrollProgress());
        }, resize_debounce = 0, resizeEv = function() {
            clearTimeout(resize_debounce);
            resize_debounce = setTimeout(self.refresh, 100);
        };
        on("scroll", self.scroll_elem, scrollEv);
        on("resize", window, resizeEv);
        self.destroy = function(clean) {
            off("scroll", self.scroll_elem, scrollEv);
            off("resize", window, resizeEv);
            self.html((clean ? self.generateEmptyRow() : rows).join(""));
        };
        self.refresh = function(force) {
            if (self.getRowsHeight(rows) || force) self.update(rows);
        };
        self.update = function(new_rows) {
            rows = isArray(new_rows) ? new_rows : [];
            var scroll_top = self.scroll_elem.scrollTop;
            if (rows.length * self.options.item_height < scroll_top) {
                self.scroll_elem.scrollTop = 0;
                last_cluster = 0;
            }
            self.insertToDOM(rows, cache);
            self.scroll_elem.scrollTop = scroll_top;
        };
        self.clear = function() {
            self.update([]);
        };
        self.getRowsAmount = function() {
            return rows.length;
        };
        self.getScrollProgress = function() {
            return this.options.scroll_top / (rows.length * this.options.item_height) * 100 || 0;
        };
        var add = function(where, _new_rows) {
            var new_rows = isArray(_new_rows) ? _new_rows : [];
            if (!new_rows.length) return;
            rows = where == "append" ? rows.concat(new_rows) : new_rows.concat(rows);
            self.insertToDOM(rows, cache);
        };
        self.append = function(rows) {
            add("append", rows);
        };
        self.prepend = function(rows) {
            add("prepend", rows);
        };
    };
    Clusterize.prototype = {
        constructor: Clusterize,
        fetchMarkup: function() {
            var rows = [], rows_nodes = this.getChildNodes(this.content_elem);
            while (rows_nodes.length) {
                rows.push(rows_nodes.shift().outerHTML);
            }
            return rows;
        },
        exploreEnvironment: function(rows, cache) {
            var opts = this.options;
            opts.content_tag = this.content_elem.tagName.toLowerCase();
            if (!rows.length) return;
            if (ie && ie <= 9 && !opts.tag) opts.tag = rows[0].match(/<([^>\s\/]*)/)[1].toLowerCase();
            if (this.content_elem.children.length <= 1) cache.data = this.html(rows[0] + rows[0] + rows[0]);
            if (!opts.tag) opts.tag = this.content_elem.children[0].tagName.toLowerCase();
            this.getRowsHeight(rows);
        },
        getRowsHeight: function(rows) {
            var opts = this.options, prev_item_height = opts.item_height;
            opts.cluster_height = 0;
            if (!rows.length) return;
            var nodes = this.content_elem.children;
            if (!nodes.length) return;
            var node = nodes[Math.floor(nodes.length / 2)];
            opts.item_height = node.offsetHeight;
            if (opts.tag == "tr" && getStyle("borderCollapse", this.content_elem) != "collapse") opts.item_height += parseInt(getStyle("borderSpacing", this.content_elem), 10) || 0;
            if (opts.tag != "tr") {
                var marginTop = parseInt(getStyle("marginTop", node), 10) || 0;
                var marginBottom = parseInt(getStyle("marginBottom", node), 10) || 0;
                opts.item_height += Math.max(marginTop, marginBottom);
            }
            opts.block_height = opts.item_height * opts.rows_in_block;
            opts.rows_in_cluster = opts.blocks_in_cluster * opts.rows_in_block;
            opts.cluster_height = opts.blocks_in_cluster * opts.block_height;
            return prev_item_height != opts.item_height;
        },
        getClusterNum: function() {
            this.options.scroll_top = this.scroll_elem.scrollTop;
            return Math.floor(this.options.scroll_top / (this.options.cluster_height - this.options.block_height)) || 0;
        },
        generateEmptyRow: function() {
            var opts = this.options;
            if (!opts.tag || !opts.show_no_data_row) return [];
            var empty_row = document.createElement(opts.tag), no_data_content = document.createTextNode(opts.no_data_text), td;
            empty_row.className = opts.no_data_class;
            if (opts.tag == "tr") {
                td = document.createElement("td");
                td.colSpan = 100;
                td.appendChild(no_data_content);
            }
            empty_row.appendChild(td || no_data_content);
            return [ empty_row.outerHTML ];
        },
        generate: function(rows, cluster_num) {
            var opts = this.options, rows_len = rows.length;
            if (rows_len < opts.rows_in_block) {
                return {
                    top_offset: 0,
                    bottom_offset: 0,
                    rows_above: 0,
                    rows: rows_len ? rows : this.generateEmptyRow()
                };
            }
            var items_start = Math.max((opts.rows_in_cluster - opts.rows_in_block) * cluster_num, 0), items_end = items_start + opts.rows_in_cluster, top_offset = Math.max(items_start * opts.item_height, 0), bottom_offset = Math.max((rows_len - items_end) * opts.item_height, 0), this_cluster_rows = [], rows_above = items_start;
            if (top_offset < 1) {
                rows_above++;
            }
            for (var i = items_start; i < items_end; i++) {
                rows[i] && this_cluster_rows.push(rows[i]);
            }
            return {
                top_offset: top_offset,
                bottom_offset: bottom_offset,
                rows_above: rows_above,
                rows: this_cluster_rows
            };
        },
        renderExtraTag: function(class_name, height) {
            var tag = document.createElement(this.options.tag), clusterize_prefix = "clusterize-";
            tag.className = [ clusterize_prefix + "extra-row", clusterize_prefix + class_name ].join(" ");
            height && (tag.style.height = height + "px");
            return tag.outerHTML;
        },
        insertToDOM: function(rows, cache) {
            if (!this.options.cluster_height) {
                this.exploreEnvironment(rows, cache);
            }
            var data = this.generate(rows, this.getClusterNum()), this_cluster_rows = data.rows.join(""), this_cluster_content_changed = this.checkChanges("data", this_cluster_rows, cache), top_offset_changed = this.checkChanges("top", data.top_offset, cache), only_bottom_offset_changed = this.checkChanges("bottom", data.bottom_offset, cache), callbacks = this.options.callbacks, layout = [];
            if (this_cluster_content_changed || top_offset_changed) {
                if (data.top_offset) {
                    this.options.keep_parity && layout.push(this.renderExtraTag("keep-parity"));
                    layout.push(this.renderExtraTag("top-space", data.top_offset));
                }
                layout.push(this_cluster_rows);
                data.bottom_offset && layout.push(this.renderExtraTag("bottom-space", data.bottom_offset));
                callbacks.clusterWillChange && callbacks.clusterWillChange();
                this.html(layout.join(""));
                this.options.content_tag == "ol" && this.content_elem.setAttribute("start", data.rows_above);
                this.content_elem.style["counter-increment"] = "clusterize-counter " + (data.rows_above - 1);
                callbacks.clusterChanged && callbacks.clusterChanged();
            } else if (only_bottom_offset_changed) {
                this.content_elem.lastChild.style.height = data.bottom_offset + "px";
            }
        },
        html: function(data) {
            var content_elem = this.content_elem;
            if (ie && ie <= 9 && this.options.tag == "tr") {
                var div = document.createElement("div"), last;
                div.innerHTML = "<table><tbody>" + data + "</tbody></table>";
                while (last = content_elem.lastChild) {
                    content_elem.removeChild(last);
                }
                var rows_nodes = this.getChildNodes(div.firstChild.firstChild);
                while (rows_nodes.length) {
                    content_elem.appendChild(rows_nodes.shift());
                }
            } else {
                content_elem.innerHTML = data;
            }
        },
        getChildNodes: function(tag) {
            var child_nodes = tag.children, nodes = [];
            for (var i = 0, ii = child_nodes.length; i < ii; i++) {
                nodes.push(child_nodes[i]);
            }
            return nodes;
        },
        checkChanges: function(type, value, cache) {
            var changed = value != cache[type];
            cache[type] = value;
            return changed;
        }
    };
    function on(evt, element, fnc) {
        return element.addEventListener ? element.addEventListener(evt, fnc, false) : element.attachEvent("on" + evt, fnc);
    }
    function off(evt, element, fnc) {
        return element.removeEventListener ? element.removeEventListener(evt, fnc, false) : element.detachEvent("on" + evt, fnc);
    }
    function isArray(arr) {
        return Object.prototype.toString.call(arr) === "[object Array]";
    }
    function getStyle(prop, elem) {
        return window.getComputedStyle ? window.getComputedStyle(elem)[prop] : elem.currentStyle[prop];
    }
    return Clusterize;
});

!function() {
    "use strict";
    function t(o) {
        if (!o) throw new Error("No options passed to Waypoint constructor");
        if (!o.element) throw new Error("No element option passed to Waypoint constructor");
        if (!o.handler) throw new Error("No handler option passed to Waypoint constructor");
        this.key = "waypoint-" + e, this.options = t.Adapter.extend({}, t.defaults, o), 
        this.element = this.options.element, this.adapter = new t.Adapter(this.element), 
        this.callback = o.handler, this.axis = this.options.horizontal ? "horizontal" : "vertical", 
        this.enabled = this.options.enabled, this.triggerPoint = null, this.group = t.Group.findOrCreate({
            name: this.options.group,
            axis: this.axis
        }), this.context = t.Context.findOrCreateByElement(this.options.context), t.offsetAliases[this.options.offset] && (this.options.offset = t.offsetAliases[this.options.offset]), 
        this.group.add(this), this.context.add(this), i[this.key] = this, e += 1;
    }
    var e = 0, i = {};
    t.prototype.queueTrigger = function(t) {
        this.group.queueTrigger(this, t);
    }, t.prototype.trigger = function(t) {
        this.enabled && this.callback && this.callback.apply(this, t);
    }, t.prototype.destroy = function() {
        this.context.remove(this), this.group.remove(this), delete i[this.key];
    }, t.prototype.disable = function() {
        return this.enabled = !1, this;
    }, t.prototype.enable = function() {
        return this.context.refresh(), this.enabled = !0, this;
    }, t.prototype.next = function() {
        return this.group.next(this);
    }, t.prototype.previous = function() {
        return this.group.previous(this);
    }, t.invokeAll = function(t) {
        var e = [];
        for (var o in i) e.push(i[o]);
        for (var n = 0, r = e.length; r > n; n++) e[n][t]();
    }, t.destroyAll = function() {
        t.invokeAll("destroy");
    }, t.disableAll = function() {
        t.invokeAll("disable");
    }, t.enableAll = function() {
        t.Context.refreshAll();
        for (var e in i) i[e].enabled = !0;
        return this;
    }, t.refreshAll = function() {
        t.Context.refreshAll();
    }, t.viewportHeight = function() {
        return window.innerHeight || document.documentElement.clientHeight;
    }, t.viewportWidth = function() {
        return document.documentElement.clientWidth;
    }, t.adapters = [], t.defaults = {
        context: window,
        continuous: !0,
        enabled: !0,
        group: "default",
        horizontal: !1,
        offset: 0
    }, t.offsetAliases = {
        "bottom-in-view": function() {
            return this.context.innerHeight() - this.adapter.outerHeight();
        },
        "right-in-view": function() {
            return this.context.innerWidth() - this.adapter.outerWidth();
        }
    }, window.Waypoint = t;
}(), function() {
    "use strict";
    function t(t) {
        window.setTimeout(t, 1e3 / 60);
    }
    function e(t) {
        this.element = t, this.Adapter = n.Adapter, this.adapter = new this.Adapter(t), 
        this.key = "waypoint-context-" + i, this.didScroll = !1, this.didResize = !1, this.oldScroll = {
            x: this.adapter.scrollLeft(),
            y: this.adapter.scrollTop()
        }, this.waypoints = {
            vertical: {},
            horizontal: {}
        }, t.waypointContextKey = this.key, o[t.waypointContextKey] = this, i += 1, n.windowContext || (n.windowContext = !0, 
        n.windowContext = new e(window)), this.createThrottledScrollHandler(), this.createThrottledResizeHandler();
    }
    var i = 0, o = {}, n = window.Waypoint, r = window.onload;
    e.prototype.add = function(t) {
        var e = t.options.horizontal ? "horizontal" : "vertical";
        this.waypoints[e][t.key] = t, this.refresh();
    }, e.prototype.checkEmpty = function() {
        var t = this.Adapter.isEmptyObject(this.waypoints.horizontal), e = this.Adapter.isEmptyObject(this.waypoints.vertical), i = this.element == this.element.window;
        t && e && !i && (this.adapter.off(".waypoints"), delete o[this.key]);
    }, e.prototype.createThrottledResizeHandler = function() {
        function t() {
            e.handleResize(), e.didResize = !1;
        }
        var e = this;
        this.adapter.on("resize.waypoints", function() {
            e.didResize || (e.didResize = !0, n.requestAnimationFrame(t));
        });
    }, e.prototype.createThrottledScrollHandler = function() {
        function t() {
            e.handleScroll(), e.didScroll = !1;
        }
        var e = this;
        this.adapter.on("scroll.waypoints", function() {
            (!e.didScroll || n.isTouch) && (e.didScroll = !0, n.requestAnimationFrame(t));
        });
    }, e.prototype.handleResize = function() {
        n.Context.refreshAll();
    }, e.prototype.handleScroll = function() {
        var t = {}, e = {
            horizontal: {
                newScroll: this.adapter.scrollLeft(),
                oldScroll: this.oldScroll.x,
                forward: "right",
                backward: "left"
            },
            vertical: {
                newScroll: this.adapter.scrollTop(),
                oldScroll: this.oldScroll.y,
                forward: "down",
                backward: "up"
            }
        };
        for (var i in e) {
            var o = e[i], n = o.newScroll > o.oldScroll, r = n ? o.forward : o.backward;
            for (var s in this.waypoints[i]) {
                var a = this.waypoints[i][s];
                if (null !== a.triggerPoint) {
                    var l = o.oldScroll < a.triggerPoint, h = o.newScroll >= a.triggerPoint, p = l && h, u = !l && !h;
                    (p || u) && (a.queueTrigger(r), t[a.group.id] = a.group);
                }
            }
        }
        for (var c in t) t[c].flushTriggers();
        this.oldScroll = {
            x: e.horizontal.newScroll,
            y: e.vertical.newScroll
        };
    }, e.prototype.innerHeight = function() {
        return this.element == this.element.window ? n.viewportHeight() : this.adapter.innerHeight();
    }, e.prototype.remove = function(t) {
        delete this.waypoints[t.axis][t.key], this.checkEmpty();
    }, e.prototype.innerWidth = function() {
        return this.element == this.element.window ? n.viewportWidth() : this.adapter.innerWidth();
    }, e.prototype.destroy = function() {
        var t = [];
        for (var e in this.waypoints) for (var i in this.waypoints[e]) t.push(this.waypoints[e][i]);
        for (var o = 0, n = t.length; n > o; o++) t[o].destroy();
    }, e.prototype.refresh = function() {
        var t, e = this.element == this.element.window, i = e ? void 0 : this.adapter.offset(), o = {};
        this.handleScroll(), t = {
            horizontal: {
                contextOffset: e ? 0 : i.left,
                contextScroll: e ? 0 : this.oldScroll.x,
                contextDimension: this.innerWidth(),
                oldScroll: this.oldScroll.x,
                forward: "right",
                backward: "left",
                offsetProp: "left"
            },
            vertical: {
                contextOffset: e ? 0 : i.top,
                contextScroll: e ? 0 : this.oldScroll.y,
                contextDimension: this.innerHeight(),
                oldScroll: this.oldScroll.y,
                forward: "down",
                backward: "up",
                offsetProp: "top"
            }
        };
        for (var r in t) {
            var s = t[r];
            for (var a in this.waypoints[r]) {
                var l, h, p, u, c, d = this.waypoints[r][a], f = d.options.offset, w = d.triggerPoint, y = 0, g = null == w;
                d.element !== d.element.window && (y = d.adapter.offset()[s.offsetProp]), "function" == typeof f ? f = f.apply(d) : "string" == typeof f && (f = parseFloat(f), 
                d.options.offset.indexOf("%") > -1 && (f = Math.ceil(s.contextDimension * f / 100))), 
                l = s.contextScroll - s.contextOffset, d.triggerPoint = Math.floor(y + l - f), h = w < s.oldScroll, 
                p = d.triggerPoint >= s.oldScroll, u = h && p, c = !h && !p, !g && u ? (d.queueTrigger(s.backward), 
                o[d.group.id] = d.group) : !g && c ? (d.queueTrigger(s.forward), o[d.group.id] = d.group) : g && s.oldScroll >= d.triggerPoint && (d.queueTrigger(s.forward), 
                o[d.group.id] = d.group);
            }
        }
        return n.requestAnimationFrame(function() {
            for (var t in o) o[t].flushTriggers();
        }), this;
    }, e.findOrCreateByElement = function(t) {
        return e.findByElement(t) || new e(t);
    }, e.refreshAll = function() {
        for (var t in o) o[t].refresh();
    }, e.findByElement = function(t) {
        return o[t.waypointContextKey];
    }, window.onload = function() {
        r && r(), e.refreshAll();
    }, n.requestAnimationFrame = function(e) {
        var i = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || t;
        i.call(window, e);
    }, n.Context = e;
}(), function() {
    "use strict";
    function t(t, e) {
        return t.triggerPoint - e.triggerPoint;
    }
    function e(t, e) {
        return e.triggerPoint - t.triggerPoint;
    }
    function i(t) {
        this.name = t.name, this.axis = t.axis, this.id = this.name + "-" + this.axis, this.waypoints = [], 
        this.clearTriggerQueues(), o[this.axis][this.name] = this;
    }
    var o = {
        vertical: {},
        horizontal: {}
    }, n = window.Waypoint;
    i.prototype.add = function(t) {
        this.waypoints.push(t);
    }, i.prototype.clearTriggerQueues = function() {
        this.triggerQueues = {
            up: [],
            down: [],
            left: [],
            right: []
        };
    }, i.prototype.flushTriggers = function() {
        for (var i in this.triggerQueues) {
            var o = this.triggerQueues[i], n = "up" === i || "left" === i;
            o.sort(n ? e : t);
            for (var r = 0, s = o.length; s > r; r += 1) {
                var a = o[r];
                (a.options.continuous || r === o.length - 1) && a.trigger([ i ]);
            }
        }
        this.clearTriggerQueues();
    }, i.prototype.next = function(e) {
        this.waypoints.sort(t);
        var i = n.Adapter.inArray(e, this.waypoints), o = i === this.waypoints.length - 1;
        return o ? null : this.waypoints[i + 1];
    }, i.prototype.previous = function(e) {
        this.waypoints.sort(t);
        var i = n.Adapter.inArray(e, this.waypoints);
        return i ? this.waypoints[i - 1] : null;
    }, i.prototype.queueTrigger = function(t, e) {
        this.triggerQueues[e].push(t);
    }, i.prototype.remove = function(t) {
        var e = n.Adapter.inArray(t, this.waypoints);
        e > -1 && this.waypoints.splice(e, 1);
    }, i.prototype.first = function() {
        return this.waypoints[0];
    }, i.prototype.last = function() {
        return this.waypoints[this.waypoints.length - 1];
    }, i.findOrCreate = function(t) {
        return o[t.axis][t.name] || new i(t);
    }, n.Group = i;
}(), function() {
    "use strict";
    function t(t) {
        this.$element = e(t);
    }
    var e = window.jQuery, i = window.Waypoint;
    e.each([ "innerHeight", "innerWidth", "off", "offset", "on", "outerHeight", "outerWidth", "scrollLeft", "scrollTop" ], function(e, i) {
        t.prototype[i] = function() {
            var t = Array.prototype.slice.call(arguments);
            return this.$element[i].apply(this.$element, t);
        };
    }), e.each([ "extend", "inArray", "isEmptyObject" ], function(i, o) {
        t[o] = e[o];
    }), i.adapters.push({
        name: "jquery",
        Adapter: t
    }), i.Adapter = t;
}(), function() {
    "use strict";
    function t(t) {
        return function() {
            var i = [], o = arguments[0];
            return t.isFunction(arguments[0]) && (o = t.extend({}, arguments[1]), o.handler = arguments[0]), 
            this.each(function() {
                var n = t.extend({}, o, {
                    element: this
                });
                "string" == typeof n.context && (n.context = t(this).closest(n.context)[0]), i.push(new e(n));
            }), i;
        };
    }
    var e = window.Waypoint;
    window.jQuery && (window.jQuery.fn.waypoint = t(window.jQuery)), window.Zepto && (window.Zepto.fn.waypoint = t(window.Zepto));
}();

(function($) {
    var d = $(document);
    var h = $("head");
    var drag = null;
    var tables = {};
    var count = 0;
    var ID = "id";
    var PX = "px";
    var SIGNATURE = "JColResizer";
    var FLEX = "JCLRFlex";
    var I = parseInt;
    var M = Math;
    var ie = navigator.userAgent.indexOf("Trident/4.0") > 0;
    var S;
    var pad = "";
    try {
        S = sessionStorage;
    } catch (e) {}
    h.append("<style type='text/css'>  .JColResizer{table-layout:fixed;} .JColResizer > tbody > tr > td, .JColResizer > tbody > tr > th{overflow:hidden}  .JPadding > tbody > tr > td, .JPadding > tbody > tr > th{padding-left:0!important; padding-right:0!important;} .JCLRgrips{ height:0px; position:relative;} .JCLRgrip{margin-left:-5px; position:absolute; z-index:5; } .JCLRgrip .JColResizer{position:absolute;background-color:red;filter:alpha(opacity=1);opacity:0;width:10px;height:100%;cursor: col-resize;top:0px} .JCLRLastGrip{position:absolute; width:1px; } .JCLRgripDrag{ border-left:1px dotted black;\t} .JCLRFlex{width:auto!important;} .JCLRgrip.JCLRdisabledGrip .JColResizer{cursor:default; display:none;}</style>");
    var init = function(tb, options) {
        var t = $(tb);
        t.opt = options;
        t.mode = options.resizeMode;
        t.dc = t.opt.disabledColumns;
        if (t.opt.removePadding) t.addClass("JPadding");
        if (t.opt.disable) return destroy(t);
        var id = t.id = t.attr(ID) || SIGNATURE + count++;
        t.p = t.opt.postbackSafe;
        if (!t.is("table") || tables[id] && !t.opt.partialRefresh) return;
        if (t.opt.hoverCursor !== "col-resize") h.append("<style type='text/css'>.JCLRgrip .JColResizer:hover{cursor:" + t.opt.hoverCursor + "!important}</style>");
        t.addClass(SIGNATURE).attr(ID, id).before('<div class="JCLRgrips"/>');
        t.g = [];
        t.c = [];
        t.w = t.width();
        t.gc = t.prev();
        t.f = t.opt.fixed;
        if (options.marginLeft) t.gc.css("marginLeft", options.marginLeft);
        if (options.marginRight) t.gc.css("marginRight", options.marginRight);
        t.cs = I(ie ? tb.cellSpacing || tb.currentStyle.borderSpacing : t.css("border-spacing")) || 2;
        t.b = I(ie ? tb.border || tb.currentStyle.borderLeftWidth : t.css("border-left-width")) || 1;
        tables[id] = t;
        createGrips(t);
    };
    var destroy = function(t) {
        var id = t.attr(ID), t = tables[id];
        if (!t || !t.is("table")) return;
        t.removeClass(SIGNATURE + " " + FLEX).gc.remove();
        delete tables[id];
    };
    var createGrips = function(t) {
        var th = t.find(">thead>tr:first>th,>thead>tr:first>td");
        if (!th.length) th = t.find(">tbody>tr:first>th,>tr:first>th,>tbody>tr:first>td, >tr:first>td");
        th = th.filter(":visible");
        t.cg = t.find("col");
        t.ln = th.length;
        if (t.p && S && S[t.id]) memento(t, th);
        th.each(function(i) {
            var c = $(this);
            var dc = t.dc.indexOf(i) != -1;
            var g = $(t.gc.append('<div class="JCLRgrip"></div>')[0].lastChild);
            g.append(dc ? "" : t.opt.gripInnerHtml).append('<div class="' + SIGNATURE + '"></div>');
            if (i == t.ln - 1) {
                g.addClass("JCLRLastGrip");
                if (t.f) g.html("");
            }
            g.bind("touchstart mousedown", onGripMouseDown);
            if (!dc) {
                g.removeClass("JCLRdisabledGrip").bind("touchstart mousedown", onGripMouseDown);
            } else {
                g.addClass("JCLRdisabledGrip");
            }
            g.t = t;
            g.i = i;
            g.c = c;
            c.w = c.width();
            t.g.push(g);
            t.c.push(c);
            c.width(c.w).removeAttr("width");
            g.data(SIGNATURE, {
                i: i,
                t: t.attr(ID),
                last: i == t.ln - 1
            });
        });
        t.cg.removeAttr("width");
        t.find("td, th").not(th).not("table th, table td").each(function() {
            $(this).removeAttr("width");
        });
        if (!t.f) {
            t.removeAttr("width").addClass(FLEX);
        }
        syncGrips(t);
    };
    var memento = function(t, th) {
        var w, m = 0, i = 0, aux = [], tw;
        if (th) {
            t.cg.removeAttr("width");
            if (t.opt.flush) {
                S[t.id] = "";
                return;
            }
            w = S[t.id].split(";");
            tw = w[t.ln + 1];
            if (!t.f && tw) {
                t.width(tw *= 1);
                if (t.opt.overflow) {
                    t.css("min-width", tw + PX);
                    t.w = tw;
                }
            }
            for (;i < t.ln; i++) {
                aux.push(100 * w[i] / w[t.ln] + "%");
                th.eq(i).css("width", aux[i]);
            }
            for (i = 0; i < t.ln; i++) t.cg.eq(i).css("width", aux[i]);
        } else {
            S[t.id] = "";
            for (;i < t.c.length; i++) {
                w = t.c[i].width();
                S[t.id] += w + ";";
                m += w;
            }
            S[t.id] += m;
            if (!t.f) S[t.id] += ";" + t.width();
        }
    };
    var syncGrips = function(t) {
        t.gc.width(t.w);
        for (var i = 0; i < t.ln; i++) {
            var c = t.c[i];
            t.g[i].css({
                left: c.offset().left - t.offset().left + c.outerWidth(false) + t.cs / 2 + PX,
                height: t.opt.headerOnly ? t.c[0].outerHeight(false) : t.outerHeight(false)
            });
        }
    };
    var syncCols = function(t, i, isOver) {
        var inc = drag.x - drag.l, c = t.c[i], c2 = t.c[i + 1];
        var w = c.w + inc;
        var w2 = c2.w - inc;
        c.width(w + PX);
        t.cg.eq(i).width(w + PX);
        if (t.f) {
            c2.width(w2 + PX);
            t.cg.eq(i + 1).width(w2 + PX);
        } else if (t.opt.overflow) {
            t.css("min-width", t.w + inc);
        }
        if (isOver) {
            c.w = w;
            c2.w = t.f ? w2 : c2.w;
        }
    };
    var applyBounds = function(t) {
        var w = $.map(t.c, function(c) {
            return c.width();
        });
        t.width(t.w = t.width()).removeClass(FLEX);
        $.each(t.c, function(i, c) {
            c.width(w[i]).w = w[i];
        });
        t.addClass(FLEX);
    };
    var onGripDrag = function(e) {
        if (!drag) return;
        var t = drag.t;
        var oe = e.originalEvent.touches;
        var ox = oe ? oe[0].pageX : e.pageX;
        var x = ox - drag.ox + drag.l;
        var mw = t.opt.minWidth, i = drag.i;
        var l = t.cs * 1.5 + mw + t.b;
        var last = i == t.ln - 1;
        var min = i ? t.g[i - 1].position().left + t.cs + mw : l;
        var max = t.f ? i == t.ln - 1 ? t.w - l : t.g[i + 1].position().left - t.cs - mw : Infinity;
        x = M.max(min, M.min(max, x));
        drag.x = x;
        drag.css("left", x + PX);
        if (last) {
            var c = t.c[drag.i];
            drag.w = c.w + x - drag.l;
        }
        if (t.opt.liveDrag) {
            if (last) {
                c.width(drag.w);
                if (!t.f && t.opt.overflow) {
                    t.css("min-width", t.w + x - drag.l);
                } else {
                    t.w = t.width();
                }
            } else {
                syncCols(t, i);
            }
            syncGrips(t);
            var cb = t.opt.onDrag;
            if (cb) {
                e.currentTarget = t[0];
                cb(e);
            }
        }
        return false;
    };
    var onGripDragOver = function(e) {
        d.unbind("touchend." + SIGNATURE + " mouseup." + SIGNATURE).unbind("touchmove." + SIGNATURE + " mousemove." + SIGNATURE);
        $("head :last-child").remove();
        if (!drag) return;
        drag.removeClass(drag.t.opt.draggingClass);
        if (!(drag.x - drag.l == 0)) {
            var t = drag.t;
            var cb = t.opt.onResize;
            var i = drag.i;
            var last = i == t.ln - 1;
            var c = t.g[i].c;
            if (last) {
                c.width(drag.w);
                c.w = drag.w;
            } else {
                syncCols(t, i, true);
            }
            if (!t.f) applyBounds(t);
            syncGrips(t);
            if (cb) {
                e.currentTarget = t[0];
                cb(e);
            }
            if (t.p && S) memento(t);
        }
        drag = null;
    };
    var onGripMouseDown = function(e) {
        var o = $(this).data(SIGNATURE);
        var t = tables[o.t], g = t.g[o.i];
        var oe = e.originalEvent.touches;
        g.ox = oe ? oe[0].pageX : e.pageX;
        g.l = g.position().left;
        g.x = g.l;
        d.bind("touchmove." + SIGNATURE + " mousemove." + SIGNATURE, onGripDrag).bind("touchend." + SIGNATURE + " mouseup." + SIGNATURE, onGripDragOver);
        h.append("<style type='text/css'>*{cursor:" + t.opt.dragCursor + "!important}</style>");
        g.addClass(t.opt.draggingClass);
        drag = g;
        if (t.c[o.i].l) for (var i = 0, c; i < t.ln; i++) {
            c = t.c[i];
            c.l = false;
            c.w = c.width();
        }
        return false;
    };
    var onResize = function() {
        for (var t in tables) {
            if (tables.hasOwnProperty(t)) {
                t = tables[t];
                var i, mw = 0;
                t.removeClass(SIGNATURE);
                if (t.f) {
                    t.w = t.width();
                    for (i = 0; i < t.ln; i++) mw += t.c[i].w;
                    for (i = 0; i < t.ln; i++) t.c[i].css("width", M.round(1e3 * t.c[i].w / mw) / 10 + "%").l = true;
                } else {
                    applyBounds(t);
                    if (t.mode == "flex" && t.p && S) {
                        memento(t);
                    }
                }
                syncGrips(t.addClass(SIGNATURE));
            }
        }
    };
    $(window).bind("resize." + SIGNATURE, onResize);
    $.fn.extend({
        colResizable: function(options) {
            var defaults = {
                resizeMode: "fit",
                draggingClass: "JCLRgripDrag",
                gripInnerHtml: "",
                liveDrag: false,
                minWidth: 15,
                headerOnly: false,
                hoverCursor: "col-resize",
                dragCursor: "col-resize",
                postbackSafe: false,
                flush: false,
                marginLeft: null,
                marginRight: null,
                disable: false,
                partialRefresh: false,
                disabledColumns: [],
                removePadding: true,
                onDrag: null,
                onResize: null
            };
            var options = $.extend(defaults, options);
            options.fixed = true;
            options.overflow = false;
            switch (options.resizeMode) {
              case "flex":
                options.fixed = false;
                break;

              case "overflow":
                options.fixed = false;
                options.overflow = true;
                break;
            }
            return this.each(function() {
                init(this, options);
            });
        }
    });
})(jQuery);

var app = app || {};

app.charts = app.charts || {};

app.charts.tree = {};

app.charts.tree.draw = function(input, settings, refreshWithData, titlebar) {
    settings.input = input;
    app.chartCommons.calculateFields(input.series, settings.calculatedFields);
    var title = input.title;
    var chartInfo = input.chartInfo;
    var seriesLabels = typeof input.series != "undefined" ? input.series.labels : [];
    var kpisLabels = typeof input.kpis != "undefined" ? input.kpis.labels : [];
    var yAxeLable = settings.LabelY;
    var selector = "#" + settings.id;
    var margin = {
        top: 10,
        right: 20,
        bottom: 0,
        left: 20
    };
    var width = $(selector).width();
    var divHeight = $(selector).height();
    var barHeight = settings.chartProp.info.chartSize == "small" ? 150 : settings.chartProp.info.chartSize == "medium" ? 200 : settings.chartProp.info.chartSize == "large" ? 250 : settings.chartProp.info.chartSize == "veryLarge" ? 400 : 130;
    settings.width = width;
    var showPersian = typeof input.lang == "undefined" ? true : +input.lang == 0 ? true : false;
    var isProgress = titlebar.isProgress;
    var showProgress = titlebar.showProgress;
    var title = titlebar.title;
    if (settings.editMode) {
        $(selector).trigger("chartproperty", [ kpisLabels.concat(seriesLabels) ]);
    }
    if (!input.result) {
        $("#" + settings.id).append(app.chartCommons.getError(input));
        return;
    }
    $(selector).addClass("tree-chart");
    $(selector).css({
        "overflow-y": "auto",
        "overflow-x": "hidden",
        "margin-left": "-1rem"
    });
    var titleHeight = $(selector + " .title").outerHeight();
    var height = $(selector).outerHeight() - titleHeight - 2;
    var root = d3.select(selector).append("ul").attr("class", "root-node temporal tree").text("");
    root.style("height", height + "px");
    var createNode = function(parent, input) {
        parent.select(".loading").remove();
        $(parent.node()).data("vals", input.vals);
        var glyph = $(parent.node()).find(".tree-caret");
        var show = glyph.length == 0 || glyph.hasClass("rotate");
        var root = d3.select($("<ul></ul>").get(0)).attr("class", "tree-element collapse fade " + (show ? "in" : ""));
        input.data = input.data.map(function(d) {
            return {
                id: d[0],
                parent: d[1],
                name: d[2] || d[0],
                type: input.hasType ? d[3] : null,
                childs: d[d.length - 1]
            };
        });
        var li = root.selectAll("li").data(input.data).enter().append("li").attr("class", "node tree-element");
        li.append("span").text(function(d, i) {
            return d.name;
        }).attr("class", "value pointer").on("click", function(d) {
            var selectable = settings.chartProp.info.selectable;
            if (typeof selectable == "undefined" || selectable == "none") return;
            if (selectable == "one") {
                $(this).closest(".tree-chart").find(".value.active").removeClass("active");
            }
            $(this).toggleClass("active");
            var vals = d3.select(selector).selectAll(".active").data().map(function(d) {
                return d.id;
            });
            var newV = _.filter(input.vals, function(d) {
                return d[0] === vals[0];
            }).map(function(d) {
                return d[1];
            });
            if (newV.length === 0) newV = vals;
            ajaxCall({
                Id: -1,
                Values: newV,
                VariableType: 0
            });
        });
        li.each(function(d) {
            if (+d.childs == 0) return;
            d3.select(this).append("i").attr("class", function() {
                return "icon angle left icon-animate large  tree-caret pointer";
            }).text(" ").on("click", function(d, i) {
                if (+d.childs == 0) return;
                var rotateClass = "rotate-90";
                var glyph = $(this);
                var isOpen = glyph.hasClass(rotateClass);
                if (isOpen) glyph.removeClass(rotateClass); else glyph.addClass(rotateClass);
                var loaded = $(this).data("loaded");
                if (loaded) {
                    var ul = $(this).parent().find(" > ul");
                    ul.transition(isOpen ? "out scale right" : "in  scale left");
                    return;
                }
                $(this).data("loaded", true);
                var parameters = {
                    parent: d.id,
                    chartId: settings.chartId,
                    ChartInPageId: settings.ChartInPageId,
                    notEditMode: !settings.editMode
                };
                if (settings.editMode) {
                    parameters.ChartInfo = $("#divChart").data("chartInfo");
                }
                var node = d3.select(this).node().parentElement;
                d3.select(node).append("ul").attr("class", "loading collapse fade in").html('<div class="ui active inline loader mini"></div>');
                var dataUrl = app.urlPrefix + "Charts/BarChart/getTreeData";
                var caller = app.mobileMode ? proxy.ajax : $.ajax;
                var data = JSON.stringify(parameters);
                var ajaxRequest = caller({
                    url: dataUrl,
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json",
                    data: data,
                    async: settings.async,
                    requestId: settings.requestId,
                    success: function(input, isOnline, date) {
                        settings.mobileModeData = {
                            isOnline: isOnline,
                            date: date
                        };
                        createNode(d3.select(node), input);
                    },
                    error: function() {}
                });
            });
        });
        root.style("display", "none");
        $(parent._groups[0][0]).append($(root._groups[0][0]));
        $(parent._groups[0][0]).find("> ul").transition("in scale ");
    };
    createNode(root, input);
    $(selector).trigger("heightChange");
    function ajaxCall(data) {
        data.dimensionName = input.dimensionName;
        data.datasourceId = input.DataSourceId;
        data.chartId = settings.editMode ? -1 : input.chartId;
        if (!settings.editMode && data.Id === -1) {
            app.chartCommons.userFilter.setFilter({
                id: data.Id,
                values: data.Values,
                variableType: data.VariableType,
                dimensionName: data.dimensionName,
                chartInPageId: settings.ChartInPageId,
                datasourceId: data.datasourceId
            });
        }
        if (+data.Id === -1) {
            app.moderation.dashboadpage.refreshRelatedDatasources(input.RefreshDatasource, [ +settings.ChartInPageId ]);
            app.filterBox.refresh();
            return;
        }
        $.ajax({
            type: "POST",
            url: app.urlPrefix + "Moderation/GlobalVariable/SetValueForUser",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            traditional: true,
            data: JSON.stringify(data),
            success: function(data) {
                if (data.result) {
                    app.moderation.dashboadpage.refreshRelatedDatasources(data.relatedDatasource, [ +settings.ChartInPageId ]);
                    app.filterBox.refresh();
                } else {
                    alert(data.Message);
                }
            }
        });
    }
};

var app = app || {};

app.charts = app.charts || {};

app.charts.text = {};

app.charts.text.draw = function(input, settings, refreshWithData, titlebar) {
    settings.input = input;
    app.chartCommons.calculateFields(input.series, settings.calculatedFields);
    var title = input.title;
    var chartInfo = input.chartInfo;
    var seriesLabels = typeof input.series != "undefined" ? input.series.labels : [];
    var kpisLabels = typeof input.kpis != "undefined" ? input.kpis.labels : [];
    var yAxeLable = settings.LabelY;
    var selector = "#" + settings.id;
    var margin = {
        top: 10,
        right: 20,
        bottom: 0,
        left: 20
    };
    var width = $(selector).width();
    var divHeight = $(selector).height();
    var barHeight = settings.chartProp.info.chartSize == "small" ? 150 : settings.chartProp.info.chartSize == "medium" ? 200 : settings.chartProp.info.chartSize == "large" ? 250 : settings.chartProp.info.chartSize == "veryLarge" ? 400 : 130;
    settings.width = width;
    var showPersian = typeof input.lang == "undefined" ? true : +input.lang == 0 ? true : false;
    var isProgress = titlebar.isProgress;
    var showProgress = titlebar.showProgress;
    var title = titlebar.title;
    if (settings.editMode) {
        $(selector).trigger("chartproperty", [ kpisLabels.concat(seriesLabels) ]);
    }
    if (!input.result) {
        $("#" + settings.id).append(app.chartCommons.getError(input));
        return;
    }
    $(selector).addClass("tree-chart").css("text-align", "right");
    var titleHeight = $(selector + " .title").outerHeight();
    var height = $(selector).outerHeight() - titleHeight - 2;
    var root = d3.select(selector).append("ul").attr("class", "root-node temporal tree").text("");
    root.style("height", height + "px");
    $(selector).append(settings.chartProp.info.html);
    function ajaxCall(data) {
        data.dimensionName = input.dimensionName;
        data.datasourceId = input.DataSourceId;
        data.chartId = settings.editMode ? -1 : input.chartId;
        if (!settings.editMode && data.Id == -1) app.chartCommons.userFilter.setFilter({
            id: data.Id,
            values: data.Values,
            variableType: data.VariableType,
            dimensionName: data.dimensionName,
            chartInPageId: settings.ChartInPageId,
            datasourceId: data.datasourceId
        });
        $.ajax({
            type: "POST",
            url: app.urlPrefix + "Moderation/GlobalVariable/SetValueForUser",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            traditional: true,
            data: JSON.stringify(data),
            success: function(data) {
                if (data.result) {
                    app.moderation.dashboadpage.refreshRelatedDatasources(data.relatedDatasource, [ +settings.ChartInPageId ]);
                    app.filterBox.refresh();
                } else {
                    alert(data.Message);
                }
            }
        });
    }
};

var app = app || {};

app.charts = app.charts || {};

app.charts.userControl = {};

String.prototype.deentitize = function() {
    var ret = this.replace(/&gt;/g, ">");
    ret = ret.replace(/&amp;/g, "&");
    ret = ret.replace(/&lt;/g, "<");
    ret = ret.replace(/&quot;/g, '"');
    ret = ret.replace(/&apos;/g, "'");
    ret = ret.replace(/<br r >/g, "\r");
    ret = ret.replace(/<br n >/g, "\n");
    return ret;
};

String.prototype.entitize = function() {
    var ret = this;
    var rr = this;
    ret = ret.replace(/&/g, "&amp;");
    ret = ret.replace(/>/g, "&gt;");
    ret = ret.replace(/</g, "&lt;");
    ret = ret.replace(/"/g, "&quot;");
    ret = ret.replace(/'/g, "&apos;");
    ret = ret.replace(/\r/g, "<br r >");
    ret = ret.replace(/\n/g, "<br n >");
    return ret;
};

app.charts.userControl.draw = function(input, settings, refreshWithData, titlebar) {
    app.dashboardLayoutVersion = app.dashboardLayoutVersion || 2;
    settings.input = input;
    app.chartCommons.calculateFields(input.series, settings.calculatedFields);
    var selector = "#" + settings.id;
    var width = $(selector).width();
    settings.width = width;
    var showPersian = typeof input.lang == "undefined" ? true : +input.lang == 0 ? true : false;
    var isProgress = titlebar.isProgress;
    var showProgress = titlebar.showProgress;
    var title = titlebar.title;
    if (settings.chartProp.info.variableDefaultFunction == "NONE") {
        settings.chartProp.info.variableDefaultType = "NONE";
    }
    if (!input.result && !(settings.chartProp.info.type == "datepicker" || settings.chartProp.info.type == "datepicker-range")) {
        $("#" + settings.id).append(app.chartCommons.getError(input));
        return;
    }
    var isVariableRelated = settings.chartProp.info.variableId != -1;
    setGlobalFilter();
    switch (settings.chartProp.info.type) {
      case "combo":
        drawCombo();
        break;

      case "multi":
        drawCombo(true);
        break;

      case "datepicker":
        drawDatepicker(false);
        break;

      case "datepicker-range":
        drawDatepicker(true);
        break;

      case "multi-filter":
        drawMultiSelectWithFilter();
        break;

      case "slider":
        drawNumericRange();
        break;

      case "text":
        drawText();
        break;

      default:    }
    $(selector).trigger("heightChange");
    function drawText() {
        var t = '<div class="input-group temporal" style="margin-top:10px">                   <span class="input-group-btn">                     <button type="button" class="btn btn-default">                     <span style="font-size:13px" class="glyphicon glyphicon-search"> </span>                     </button>                   </span>                   <input type="text" placeholder="جستجو..." class="form-control">                 </div>';
        t = '<div class="ui form temporal"><div class=" field"><div class="ui icon input">  <input type="text" placeholder="جستجو...">  <i class="search icon"></i></div></div></div>';
        $(selector).append(t);
        function change(value) {
            var v = [ value ];
            var op = settings.chartProp.info.textOperand || "or";
            var useLike = typeof settings.chartProp.info.useLike == "undefined" ? true : settings.chartProp.info.useLike;
            var useNormal = typeof settings.chartProp.info.useNormal == "undefined" ? true : settings.chartProp.info.useNormal;
            v.push(JSON.stringify({
                op: op,
                useLike: useLike,
                useNormal: useNormal
            }));
            var name = settings.chartProp.info.dimensions.map(function(d) {
                return d.Name;
            }).join(", ");
            v.push(name);
            settings.chartProp.info.dimensions.forEach(function(d) {
                v.push(d.formula);
            });
            if (!settings.editMode) {
                var data = {
                    Id: settings.chartProp.info.variableId || -1,
                    Values: v,
                    VariableType: 5
                };
                ajaxCall(data);
            } else {
                $(selector).trigger("default-value", [ true, v, 5 ]);
            }
        }
        $(selector + " input").on("keydown", function(e) {
            if (e.keyCode == 13) {
                var v = $(this).val();
                change(v);
            }
        });
        $(selector + " button").on("click", function() {
            var v = $(selector + " input").val();
            change(v);
        });
        var dv = [];
        if (input.GloablFilterDefaultValue) {
            dv = input.GloablFilterDefaultValue.Value;
        } else if (input.DefaultValue != null && input.DefaultValue.length > 0 && settings.chartProp.info.variableId != -1) {
            dv = input.DefaultValue;
        } else if (settings.chartProp.info.variableDefault && settings.chartProp.info.variableDefault.values && settings.chartProp.info.variableDefaultType == "NONE" && settings.chartProp.info.variableId != -1) {
            dv = settings.chartProp.info.variableDefault.values;
        } else {
            dv = [ "", "" ];
        }
        $(selector + " input").val(dv[0]);
    }
    function setGlobalFilter() {
        if (!settings.editMode) {
            var filter = app.chartCommons.userFilter.getFilterValue(settings.ChartInPageId);
            if (!_.isNull(filter)) {
                input.GloablFilterDefaultValue = input.GloablFilterDefaultValue || {};
                input.GloablFilterDefaultValue.ValuesType = filter.variableType;
                input.GloablFilterDefaultValue.Value = +filter.variableType == 3 ? filter.defaultValue : filter.values;
            }
        }
    }
    function drawMultiSelectWithFilter() {
        var values = input.fields.map(function(d) {
            return d.Value;
        });
        var names = input.fields.map(function(d) {
            return d.Key;
        });
        if (names.length != values.length) {
            $("#" + settings.id).append(app.chartCommons.getError(input));
        }
        var members = [];
        for (var i = 0; i < values.length; i++) {
            members.push({
                Caption: names[i],
                Uniquename: values[i],
                IsChecked: false
            });
        }
        var onChangeFun = function(data) {
            var vals = data.filter(function(d) {
                return d.IsChecked;
            }).map(function(d) {
                return d.Uniquename;
            });
            var names = data.filter(function(d) {
                return d.IsChecked;
            }).map(function(d) {
                return d.Caption;
            });
            var h = '<div style="text-align: right; font-size: 0.9em; margin-top: 7px;"><b>انتخاب‌ها:</b><ul>' + names.map(function(d) {
                return '<li style="  float:right; display:inline; width:33%;">' + d + "</li>";
            }).join("") + "</ul></div>";
            $(selector + " .selected-item").html(filterXSS(h));
            input.DefaultValue = vals;
            if (settings.editMode) {
                $(selector).trigger("default-value", [ true, vals, 0 ]);
            } else {
                ajaxCall({
                    Id: settings.chartProp.info.variableId || -1,
                    Values: vals
                });
            }
        };
        select = '<div class="container-fluid temporal" style="margin: 15px 0px 10px;"><div class="row"><a  class=" btn btn-primary pointer filter-member btn-block"> ' + (settings.chartProp.info.label || "انتخاب") + ' <span class="glyphicon glyphicon-list-alt"></span></a></div><div class="row selected-item col-sm-12"></div></div>';
        $(selector).append(select);
        $(selector + " .filter-member").on("click", function() {
            app.helper.filterMemberDialog(members, onChangeFun);
        });
        if (input.DefaultValue != null && input.DefaultValue.length > 0) {
            members.filter(function(d) {
                return input.DefaultValue.indexOf(d.Uniquename) != -1;
            }).forEach(function(d, i) {
                d.IsChecked = true;
            });
            var h = '<div style="text-align: right; font-size: 0.9em; margin-top: 7px;"><b>انتخاب‌ها:</b><ul>' + members.filter(function(d) {
                return d.IsChecked;
            }).map(function(d) {
                return '<li style="  float:right; display:inline; width:33%;">' + d.Caption + "</li>";
            }).join("") + "</ul></div>";
            $(selector + " .selected-item").html(filterXSS(h));
        } else if (settings.chartProp.info.variableDefault && settings.chartProp.info.variableDefault.values) {
            var dv = settings.chartProp.info.variableDefault.values;
            members.filter(function(d) {
                return dv.indexOf(d.Uniquename) != -1;
            }).forEach(function(d, i) {
                d.IsChecked = true;
            });
            var h = '<div style="text-align: right; font-size: 0.9em; margin-top: 7px;"><b>انتخاب‌ها:</b><ul>' + members.filter(function(d) {
                return d.IsChecked;
            }).map(function(d) {
                return '<li style="  float:right; display:inline; width:33%;">' + d.Caption + "</li>";
            }).join("") + "</ul></div>";
            $(selector + " .selected-item").html(filterXSS(h));
        }
        if (settings.editMode) {
            var selectEl = $(selector).find("select");
            $(selector).trigger("default-value", [ false, [ members[0].UniqueName ], 0 ]);
        }
        if (refreshWithData) onChangeFun(members);
    }
    function drawDatepicker(isMulti) {
        var select = '<div class="ui form temporal"><div class=" field"><div class="ui input">                        <input autocomplete="off" type="text" id=""  class="form-control from" placeholder="تاریخ" /><input id="from-value" type="hidden"/>                      </div></div></div>';
        if (isMulti) {
            select = '<div class="ui grid temporal form-content" ><div class="row">                        <div class="five wide column ui input">                            <input autocomplete="off" type="text" class="datepicker form-control from" placeholder="تاریخ شروع" />                            <input id="from-value" type="hidden"/>                        </div>                        <div class="two wide column">تا</div>                        <div class="five wide column ui input">                            <input autocomplete="off" type="text" class="datepicker form-control to" placeholder="تاریخ پایان"/>                            <input id="to-value" type="hidden"/>                        </div>                      </div></div>';
        }
        select = $(select);
        $(selector).append(select);
        var beforeShow = function() {
            setTimeout(function() {
                $(".ui-datepicker").css("z-index", 4);
            }, 0);
        };
        if (!isMulti) {
            select.find(" .from").datepicker({
                changeMonth: true,
                changeYear: true,
                dateFormat: settings.chartProp.info.dateFormatShow + "",
                altFormat: settings.chartProp.info.dateFormatValue + "",
                altField: select.find("#from-value"),
                onClose: function(selectedDate) {
                    if (!selectedDate) return;
                    changeValue(select, isMulti, select.find("#from-value").val(), null, true);
                },
                yearRange: "-30:+30",
                beforeShow: beforeShow
            });
        } else {
            select.find(".from").datepicker({
                defaultDate: "+1w",
                changeYear: true,
                changeMonth: true,
                dateFormat: settings.chartProp.info.dateFormatShow + "",
                altFormat: settings.chartProp.info.dateFormatValue + "",
                altField: select.find("#from-value"),
                onClose: function(selectedDate) {
                    if (!selectedDate) return;
                    select.find(".to").datepicker("option", "minDate", selectedDate);
                    changeValue(select, isMulti, select.find("#from-value").val(), select.find("#to-value").val(), true);
                },
                yearRange: "-30:+30",
                beforeShow: beforeShow
            });
            select.find(".to").datepicker({
                defaultDate: "+1w",
                changeYear: true,
                changeMonth: true,
                dateFormat: settings.chartProp.info.dateFormatShow + "",
                altFormat: settings.chartProp.info.dateFormatValue + "",
                altField: select.find("#to-value"),
                onClose: function(selectedDate) {
                    if (!selectedDate) return;
                    select.find(".from").datepicker("option", "maxDate", selectedDate);
                    changeValue(select, isMulti, select.find("#from-value").val(), select.find("#to-value").val(), true);
                },
                yearRange: "-30:+30",
                beforeShow: beforeShow
            });
        }
        var dateLimit = settings.chartProp.info.dateLimit || {
            enable: false
        };
        if (dateLimit.enable) {
            if (dateLimit.minDate) {
                select.find(".from").datepicker("option", "minDate", dateLimit.minDate);
                select.find(".to").datepicker("option", "minDate", dateLimit.minDate);
            }
            if (dateLimit.maxDate) {
                select.find(".from").datepicker("option", "maxDate", dateLimit.maxDate);
                select.find(".to").datepicker("option", "maxDate", dateLimit.maxDate);
            }
            if (dateLimit.useDataMinMax && input.dataMinMax) {
                select.find(".from").datepicker("option", "maxDate", input.dataMinMax.max);
                select.find(".to").datepicker("option", "maxDate", input.dataMinMax.max);
                select.find(".from").datepicker("option", "minDate", input.dataMinMax.min);
                select.find(".to").datepicker("option", "minDate", input.dataMinMax.min);
            }
        }
        var lastFrom, lastTo;
        var isToday = false;
        if (typeof input.DefaultValue == "undefined" || !input.DefaultValue) {
            var gregorianDate = new Date();
            function gregorian_to_jalali(d) {
                return jd_to_persian(gregorian_to_jd(d[0], d[1] + 1, d[2]));
            }
            var jalaliDate = gregorian_to_jalali([ gregorianDate.getFullYear(), gregorianDate.getMonth(), gregorianDate.getDate() ]);
            function pad(num, size) {
                var s = "000000000" + num;
                return s.substr(s.length - size);
            }
            var today = jalaliDate[0] + "/" + pad(jalaliDate[1], 2) + "/" + pad(jalaliDate[2], 2);
            select.find(".from").datepicker("option", "dateFormat", "yy/mm/dd");
            select.find(".from").datepicker("setDate", today);
            select.find(".from").datepicker("option", "dateFormat", settings.chartProp.info.dateFormatValue);
            today = select.find(".from").val();
            input.DefaultValue = [ today, today ];
            isToday = true;
        }
        var dv = [];
        if (input.GloablFilterDefaultValue) {
            dv = input.GloablFilterDefaultValue.Value;
        } else if (input.DefaultValue != null && input.DefaultValue.length > 0 && settings.chartProp.info.variableId != -1) {
            dv = input.DefaultValue;
        }
        dv = dv.map(function(d) {
            return d.replace(/\[[^\]]+\]/, "");
        });
        select.find(".from").datepicker("option", "dateFormat", settings.chartProp.info.dateFormatValue + "");
        select.find(".to").datepicker("option", "dateFormat", settings.chartProp.info.dateFormatValue + "");
        lastFrom = isToday ? "" : dv[0];
        select.find(".from").datepicker("setDate", dv[0]);
        if (isMulti) {
            select.find(".to").datepicker("setDate", dv[1]);
            lastTo = isToday ? "" : dv[1];
        }
        changeValue(select, isMulti, select.find("#from-value").val(), select.find("#to-value").val(), false);
        function changeValue(select, isMulti, from, to, callFromUi) {
            if (isMulti && !(from && to)) return;
            if (!isMulti && !from) return;
            if (!settings.editMode && (isMulti && lastFrom == from && lastTo == to || !isMulti && lastFrom == from)) {
                return;
            }
            lastFrom = from;
            lastTo = to;
            var value = isMulti ? [ from, to ] : [ from, settings.chartProp.info.dateOp ];
            settings.input.DefaultValue = value;
            if (!settings.editMode && callFromUi) {
                var data = {
                    Id: settings.chartProp.info.variableId || -1,
                    Values: value,
                    VariableType: isMulti ? 2 : 4
                };
                ajaxCall(data);
            } else {
                var selectEl = $(selector).find("select");
                $(selector).trigger("default-value", [ true, value, isMulti ? 2 : 4 ]);
            }
            $(selector).data("user-value", value);
        }
    }
    function drawNumericRange(isMulti) {
        var values = input.fields.map(function(d) {
            return d.Value;
        });
        var names = input.fields.map(function(d) {
            return d.Key;
        });
        var max = settings.chartProp.info.sliderMax != "" && typeof settings.chartProp.info.sliderMax != "undefined" ? +settings.chartProp.info.sliderMax : d3.max(values, function(d) {
            return +d.replace(/\[[^\]]+\]/, "");
        }) || 100;
        var min = settings.chartProp.info.sliderMin != "" && typeof settings.chartProp.info.sliderMin != "undefined" ? +settings.chartProp.info.sliderMin : d3.min(values, function(d) {
            return +d.replace(/\[[^\]]+\]/, "");
        }) || 0;
        var select = '<div class="temporal" style="padding-left: 15px; padding-right: 15px; padding-top:5px">                        <div class="slider"></div>                        <div class="slider-value ltr" style="margin-top:5px"> </div>                        <input id="from-value" type="hidden"/>                      </div>';
        select = $(select);
        $(selector).append(select);
        settings.chartProp.info.sliderFont = _.extend({
            bold: false,
            color: "#333333",
            italic: false,
            fontSize: "10px",
            fontName: "IRANSans",
            formatString: settings.chartProp.info.sliderFormat || ",.2f",
            formatStringCustom: ",.2f"
        }, settings.chartProp.info.sliderFont);
        var isRange = settings.chartProp.info.sliderRange == "min-max";
        var showLabel = function(p) {
            var format = settings.chartProp.info.sliderFont.formatString || ",.2f";
            if (Array.isArray(p)) {
                return '<div class="inline">' + persian(d3.format(format)(p[0]), showPersian) + '</div> <div class="inline"> تا </div> <div class="inline">' + persian(d3.format(format)(p[1]), showPersian) + "</div>";
            } else {
                return persian(d3.format(format)(p), showPersian);
            }
        };
        select.find(".slider").slider({
            range: isRange ? true : settings.chartProp.info.sliderRange,
            min: min,
            max: max,
            slide: function(event, ui) {
                select.find(".slider-value").html(showLabel(isRange ? ui.values : ui.value));
            },
            stop: function(event, ui) {
                changeValue(isRange, isRange ? ui.values : [ ui.value ]);
            }
        });
        select.find(".slider .ui-slider-range").css("background-color", "#ddd");
        select.find(".slider.ui-widget-content").css("box-shadow", "none");
        select.find(".slider .ui-slider-handle").css("background-color", "#337ab7");
        var dv = [];
        if (input.GloablFilterDefaultValue) {
            dv = input.GloablFilterDefaultValue.Value;
        } else if (input.DefaultValue != null && input.DefaultValue.length > 0 && settings.chartProp.info.variableId != -1) {
            dv = input.DefaultValue;
        } else {
            dv = [ min, max ];
        }
        dv = dv.map(function(d) {
            return +d.toString().replace(/\[[^\]]+\]/, "") || 0;
        });
        if (dv.length == 1) dv.splice(0, 0, 0);
        if (dv[1] < dv[0]) dv[1] = dv[0];
        select.find(".slider-value").html(showLabel(isRange ? dv : dv[0]));
        select.find(".slider-value").css({
            "font-size": settings.chartProp.info.sliderFont.fontSize,
            "font-family": settings.chartProp.info.sliderFont.fontName,
            color: settings.chartProp.info.sliderFont.color,
            "font-weight": settings.chartProp.info.sliderFont.bold ? "bold" : "normal",
            "font-style": settings.chartProp.info.sliderFont.italic ? "italic" : "normal"
        });
        if (isRange) select.find(".slider").slider("values", dv); else select.find(".slider").slider("value", dv[0]);
        $(selector).data("user-value", dv);
        function changeValue(isMulti, value) {
            if (!isMulti) value.push(settings.chartProp.info.sliderRange);
            settings.input.DefaultValue = value;
            if (!settings.editMode) {
                var data = {
                    Id: settings.chartProp.info.variableId || -1,
                    Values: value,
                    VariableType: 1
                };
                $(selector).data("user-value", value);
                ajaxCall(data);
            } else {
                $(selector).trigger("default-value", [ true, value, 1 ]);
            }
        }
    }
    function drawCombo(isMulti) {
        var style = settings.chartProp.info.comboStyle;
        if (app.mobile || settings.editMode) style = "default";
        var values = input.fields.map(function(d) {
            return d.Value.entitize();
        });
        var names = input.fields.map(function(d) {
            return d.Key.entitize();
        });
        if (names.length != values.length) {
            $("#" + settings.id).append(app.chartCommons.getError(input));
        }
        var select = '<div class="dp-container temporal inline"><select class="temporal ui fluid ' + (isMulti ? "multiple" : "") + ' search selection dropdown" ' + (isMulti ? "multiple" : "") + " >";
        select += '  <option value="">' + settings.chartProp.info.label + "</option>";
        for (var i = 0; i < names.length; i++) select += '  <option value="' + values[i] + '">' + names[i] + "</option>";
        select += "</select></div>";
        $(selector).append(select);
        if (settings.chartProp.info.showExclude) {
            var tag = '<div class="temporal ui checkbox" style="display:inline-block; width:70px;text-align: left;padding: 10px;"><input type="checkbox" id="exclude"/><label> نقیض </label></div>';
            $(selector).append(tag);
            $(selector).find(".checkbox").checkbox();
            $(selector).find(".dp-container").css({
                width: "calc(100% - 70px)"
            });
        } else {
            $(selector).find(".dp-container").css("width", "100%");
        }
        function selectValue(val) {
            var returnVal;
            if (val) {
                $(selector + " .ui.dropdown").dropdown("set selected", val);
                returnVal = val;
            } else {
                if (isMulti) {
                    var r = $(selector + " .ui.dropdown").dropdown("get item");
                    returnVal = r ? r.toArray().map(function(d) {
                        return $(d).attr("data-value");
                    }) : [];
                } else {
                    returnVal = $(selector + " .ui.dropdown").dropdown("get value");
                }
            }
            $(selector).data("user-value", returnVal);
            return returnVal;
        }
        var selectEl = $(selector).find("select");
        selectEl.on("change", function() {
            app.lang.setLang({
                selector: selector
            });
        });
        var changeCallback = null;
        var silentChange = false;
        var process = function() {
            var exclude = $(selector).find("#exclude").is(":checked");
            if (!isMulti) {
                var op = settings.chartProp.info.dateOp;
                if (exclude) {
                    var ex = {
                        eq: "nteq",
                        nteq: "eq",
                        gr: "eqls",
                        eqgr: "ls",
                        ls: "eqgr",
                        eqls: "gr"
                    };
                    op = ex[op];
                }
                input.DefaultValue.push(op);
            }
            if (exclude && isMulti) {
                input.DefaultValue.push("exclude=1");
            }
        };
        if (settings.editMode) {
            changeCallback = function(v) {
                input.DefaultValue = v;
                process();
                $(selector).trigger("default-value", [ true, input.DefaultValue, isMulti ? 0 : 4 ]);
            };
        } else {
            changeCallback = function(v) {
                if (settings.chartProp.info.disableClear && (!v || !v.length)) {
                    $(selector + " .ui.dropdown").dropdown("set selected", input.DefaultValue);
                    return;
                }
                input.DefaultValue = v;
                process();
                ajaxCall({
                    Id: settings.chartProp.info.variableId || -1,
                    Values: input.DefaultValue,
                    VariableType: isMulti ? 0 : 4
                });
            };
        }
        var dv = [];
        if (input.GloablFilterDefaultValue && settings.chartProp.info.variableId == -1) {
            dv = input.GloablFilterDefaultValue.Value;
        } else if (input.DefaultValue != null && input.DefaultValue.length > 0) {
            dv = input.DefaultValue;
        }
        if (!isMulti) {
            dv = [].concat(dv);
            dv.splice(dv.length - 1, 1);
        }
        input.DefaultValue = dv;
        var silent = true;
        var lastT;
        function getDropdownValue() {
            var value = $(selector + " .ui.dropdown").dropdown("get value");
            if (!_.isArray(value)) value = [ value ];
            value = _.filter(value, null);
            return value;
        }
        function change() {
            if (silent) return;
            clearTimeout(lastT);
            lastT = setTimeout(function() {
                var value = getDropdownValue();
                changeCallback(_.map(value, function(d) {
                    return d.deentitize();
                }));
            }, 200);
        }
        $(selector + " #exclude").on("change", function() {
            var value = getDropdownValue();
            if (!value.length) return;
            change();
        });
        $(selector + " .ui.dropdown").dropdown({
            onChange: function(value, text, $selectedItem) {
                if (!isMulti) change();
            },
            onRemove: function(removedValue, removedText, $removedChoice) {
                change();
            },
            onAdd: function(addedValue, addedText, $addedChoice) {
                change();
            },
            apiSettings: {
                url: app.urlPrefix + "api/chartdata/GetColumnMembers",
                cache: false,
                method: "post",
                beforeSend: function(s) {
                    var otherFilters = _.filter(app.chartCommons.drillDown.filters, function(d) {
                        if (!settings.input || !settings.input.RefreshDatasource) return false;
                        var refresh = settings.input.RefreshDatasource.indexOf(d.datasourceId) != -1;
                        return refresh && d.chartInPageId != settings.ChartInPageId;
                    });
                    var userControlFilter = $.extend([], _.filter(app.chartCommons.userFilter.filters, function(d) {
                        if (!settings.input || !settings.input.RefreshDatasource) return false;
                        var refresh = settings.input.RefreshDatasource.indexOf(d.datasourceId) != -1;
                        return refresh;
                    }));
                    _.remove(userControlFilter, {
                        chartInPageId: settings.ChartInPageId
                    });
                    var userVariable = JSON.parse(localStorage.getItem("userVariable")) || [];
                    s.data = {
                        chartId: settings.chartId,
                        chartInPageId: settings.ChartInPageId,
                        userVariable: userVariable,
                        userControlFilter: userControlFilter,
                        otherFilters: otherFilters,
                        query: s.urlData.query,
                        chartInfo: $("#divChart").data("chartInfo")
                    };
                    return s;
                },
                onResponse: function(res) {
                    res.fields = res.fields.map(function(d) {
                        return {
                            Key: d.Key.entitize(),
                            Value: d.Value.entitize()
                        };
                    });
                    var values = $(selector + " .ui.dropdown").dropdown("get value");
                    if (!values) values = [];
                    if (!_.isArray(values)) values = [ values ];
                    res.fields = res.fields.filter(function(d) {
                        return values.indexOf(d.Value) == -1;
                    });
                    return res;
                },
                dataType: "json"
            },
            message: {
                noResults: app.lang.translate("No results found.")
            },
            fields: {
                remoteValues: "fields",
                name: "Key",
                value: "Value"
            },
            saveRemoteData: false,
            forceSelection: false
        });
        $(selector + " .ui.dropdown .dropdown.icon").on("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(selector + " .ui.dropdown input").focus();
        });
        $(selector + " .ui.dropdown").dropdown("set selected", dv);
        silent = false;
    }
    function drawTextbox() {
        var label = settings.chartProp.info.label == "" ? "" : '<label class="col-sm-4" style="text-align:right">' + settings.chartProp.info.label + "</label>";
        var textbox = '<div class="container-fluid" style="margin: 15px 0px 10px;"> <div class="row">            ' + label + '<div class="col-sm-' + (label == "" ? "12" : "8") + '">                <input type="text" class="form-control" placeholder="برچسب" />            </div>            </div>        </div>';
        $(selector).append(textbox);
    }
    function changeHieght(settings, requiredHeight) {
        if (typeof dashboard == "undefined") return;
        var wg = $("#" + settings.id).parent(".chart-widget") || $();
        settings.widgetSize = settings.widgetSize || {
            size_y: 3
        };
        var dif = (settings.widgetSize.size_y - (+wg.attr("data-sizey") || 3)) * dashboard.baseDimantion.y;
        requiredHeight += dif;
        var extY = 0;
        if (requiredHeight < 0) extY = Math.floor((-requiredHeight - 1) / dashboard.baseDimantion.y) + 1;
        if (!settings.editMode && extY > 0) dashboard.gs.resize_widget(wg, settings.widgetSize.size_x, +settings.widgetSize.size_y + +extY);
    }
    function ajaxCall(data) {
        var caller = app.mobileMode ? proxy.ajax : $.ajax;
        data.disableClear = settings.chartProp.info.disableClear;
        if (!settings.editMode && !isVariableRelated) {
            var filter = function(ds, dname) {
                var x = {
                    id: data.Id,
                    values: data.Values,
                    variableType: data.VariableType,
                    dimensionName: dname,
                    chartInPageId: settings.ChartInPageId,
                    datasourceId: ds,
                    disableClear: data.disableClear
                };
                app.chartCommons.userFilter.setFilter(x);
                caller({
                    url: app.urlPrefix + "api/chartdata/logUserControl",
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json",
                    data: JSON.stringify(x)
                });
            };
            if (input.datasources) {
                _.each(input.datasources, function(item) {
                    filter(item.datasourceId, item.name);
                });
            } else {
                filter(input.DataSourceId, input.dimensionName);
            }
        }
        if (+data.Id == -1) {
            app.moderation.dashboadpage.refreshRelatedDatasources(input.RefreshDatasource, [ +settings.ChartInPageId ]);
            app.filterBox.refresh();
            return;
        }
        data.dimensionName = input.dimensionName;
        data.datasourceId = input.DataSourceId;
        data.chartId = input.chartId;
        var d = app.mobileMode ? data : JSON.stringify(data);
        console.log("### user control ajaxCall init *****************");
        caller({
            type: "POST",
            url: app.urlPrefix + "api/GlobalVariable/SetValueForUser",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            traditional: true,
            data: d,
            success: function(data) {
                debugger;
                if (data.result) {
                    if (typeof settings.chartProp.info.variableId != "undefined" && settings.chartProp.info.variableId != -1) {
                        $(".bar-chart").each(function() {
                            var s = $(this).data("settings");
                            if (typeof s.input.GlobalVariables != "undefined" && s.input.GlobalVariables.indexOf(settings.chartProp.info.variableId) != -1) {
                                s.titlebar.showProgress(true);
                                $(this).charts(s.type, "refreshWithData", s, {
                                    refreshRelatedDatasources: false
                                });
                            }
                        });
                    } else {
                        if (app.mobileMode) {
                            app.mobile.filterChanged(data.RefreshDatasource, [ +settings.ChartInPageId ]);
                        } else {
                            app.moderation.dashboadpage.refreshRelatedDatasources(data.RefreshDatasource, [ +settings.ChartInPageId ]);
                            app.filterBox.refresh();
                        }
                    }
                } else {
                    alert(data.Message);
                }
            },
            error: function(res) {
                if (app.mobileMode) {
                    app.mobile.showToastMessage(res);
                }
            }
        });
    }
};
// داشبورد مدیریتی صدف info@sadafdashboard.ir 

var manageApp = angular.module("services", [ "ngMaterial", "ngAnimate", "ui.sortable", "uibCollapseCat" ]);

var ngApp = angular.module("services");

ngApp.service("datasources", [ "$http", "$mdMedia", "$mdDialog", "$compile", "$rootScope", "$q", "$timeout", function($http, $mdMedia, $mdDialog, $compile, $rootScope, $q, $timeout) {
    var promise;
    function get() {
        if (!promise) promise = $http.get(app.urlPrefix + "api/menus/get");
        return promise;
    }
    var lastSelected = {};
    var datasources = {
        name: "همه",
        open: true
    };
    var charts = {
        name: "همه",
        open: true
    };
    function reset() {
        datasources = {
            name: "همه",
            open: true
        };
        charts = {
            name: "همه",
            open: true
        };
    }
    var $pickerScope;
    function select(ev, options) {
        var defaults = {
            type: [ "charts" ],
            search: [ "content" ],
            selectableDir: false,
            justDir: false,
            multipleChart: true,
            multipleDatasource: false
        };
        options = angular.extend({}, defaults, options);
        var deferred = $q.defer();
        options.deferred = deferred;
        var picker = $("#asset-picker");
        if (!picker.length) {
            $pickerScope = $rootScope.$new();
            $pickerScope.options = options;
            var el = $compile('<select-asset-dialog ng-model="options" ></select-asset-dialog>')($pickerScope);
            angular.element("div[ng-app]").append(el);
        }
        $timeout(function() {
            picker = $("#asset-picker");
            $pickerScope.options = options;
            $pickerScope.options.setLastSelect = function(d) {
                lastSelected.charts = d.charts;
            };
            picker.modal("show");
        }, 1);
        return deferred.promise;
    }
    function getColumns(id) {
        var link = app.urlPrefix + "Moderation/OlapChartDesign/CubeInformation?DataSourceId=" + id;
        return $http.get(link).then(function(res) {
            return res.data;
        });
    }
    return {
        get: get,
        select: select,
        lastSelected: lastSelected,
        reset: reset,
        getColumns: getColumns
    };
} ]);

ngApp.directive("selectAssetDialog", [ function() {
    return {
        scope: {
            ngModel: "="
        },
        controller: [ "$scope", "$mdDialog", "$timeout", "$http", function(sp, $mdDialog, $timeout, $http) {
            sp.$watch("ngModel", function(n, d) {
                init(n);
            });
            function init(options) {
                var lastSelected = {};
                var datasources = {
                    name: "همه",
                    open: true
                };
                var charts = {
                    name: "همه",
                    open: true
                };
                function reset() {
                    datasources = {
                        name: "همه",
                        open: true
                    };
                    charts = {
                        name: "همه",
                        open: true
                    };
                }
                sp.query = null;
                sp.searchResultDatasource = null;
                sp.searchResultChart = null;
                sp.showCharts = options.type.indexOf("charts") != -1;
                sp.showDatasources = options.type.indexOf("datasources") != -1;
                sp.selectedIndex = sp.showDatasources ? 0 : 1;
                var timer;
                sp.search = function(n, o) {
                    $timeout.cancel(timer);
                    timer = $timeout(function() {
                        search(sp.query);
                    }, 400);
                };
                sp.cancel = function() {
                    $("#asset-picker").modal("hide");
                };
                sp.select = function() {
                    var obj;
                    var type;
                    if (sp.showCharts && sp.showDatasources) {
                        obj = sp.selectedIndex == 0 ? sp.datasources : sp.charts;
                        type = sp.selectedIndex == 0 ? "datasources" : "charts";
                    } else if (sp.showDatasources) {
                        obj = sp.datasources;
                        type = "datasources";
                    } else {
                        obj = sp.charts;
                        type = "charts";
                    }
                    var selected = [];
                    if (!sp.searchResultDatasource && !sp.searchResultChart) {
                        doRecursive(obj, function(item) {
                            if (item.active) selected.push(item);
                        });
                    } else {
                        selected = _.filter(type == "charts" ? sp.searchResultChart : sp.searchResultDatasource, {
                            check: true
                        });
                        options.setLastSelect({
                            charts: selected
                        });
                    }
                    options.deferred.resolve({
                        selected: selected,
                        type: type
                    });
                    $("#asset-picker").modal("hide");
                };
                var urlChart = function(d) {
                    if (!d.nodes) {
                        var urlPrefix = app.urlPrefix + "api/charts/getlist?packageId=" + d.id + "&parentRole=" + options.parentRole;
                        $http.get(urlPrefix).then(function(res) {
                            d.loaded = true;
                            d.nodes = _.filter(res.data.list, {
                                type: 1
                            });
                            d.contents = _.filter(res.data.list, {
                                type: 2
                            });
                        });
                    }
                };
                var urlDatasource = function(d) {
                    if (!d.nodes) {
                        var urlPrefix = app.urlPrefix + "api/datasources/get?packageId=" + d.id + "&parentRole=" + options.parentRole;
                        $http.get(urlPrefix).then(function(res) {
                            d.loaded = true;
                            d.nodes = _.filter(res.data.list, {
                                type: 1
                            });
                            d.contents = _.filter(res.data.list, {
                                type: 2
                            });
                        });
                    }
                };
                sp.optDatasource = {
                    urlPrefix: app.urlPrefix + "api/datasources/get?packageId=",
                    multiple: options.multipleDatasource,
                    selectableDir: options.selectableDir,
                    url: urlDatasource,
                    justDir: options.justDir
                };
                sp.optChart = {
                    urlPrefix: app.urlPrefix + "api/charts/getlist?packageId=",
                    multiple: options.multipleChart,
                    selectableDir: options.selectableDir,
                    url: urlChart,
                    justDir: options.justDir
                };
                sp.datasources = datasources;
                sp.charts = charts;
                doRecursive(sp.datasources, function(item) {
                    item.active = false;
                });
                doRecursive(sp.charts, function(item) {
                    item.active = false;
                });
                if (sp.showCharts) urlChart(sp.charts);
                if (sp.showDatasources) urlDatasource(sp.datasources);
                var showResultContent = options.search.indexOf("content") != -1;
                var showResultDir = options.search.indexOf("dir") != -1;
                function search(q) {
                    console.log("search ", q);
                    if (!q) {
                        sp.searchResultDatasource = null;
                        sp.searchResultChart = null;
                        return;
                    }
                    if (sp.showCharts) {
                        sp.searchProgressChart = true;
                        $http.get(app.urlPrefix + "api/charts/getlist?q=" + q + "&parentRole=" + options.parentRole).then(function(res) {
                            sp.searchProgressChart = false;
                            if (showResultContent && showResultDir) {
                                sp.searchResultChart = res.data.list;
                            } else if (showResultContent) {
                                sp.searchResultChart = _.filter(res.data.list, {
                                    type: 2
                                });
                            } else {
                                sp.searchResultChart = _.filter(res.data.list, {
                                    type: 1
                                });
                            }
                        });
                    }
                    if (sp.showDatasources) {
                        sp.searchProgressDatasource = true;
                        $http.get(app.urlPrefix + "api/datasources/get?q=" + q).then(function(res) {
                            sp.searchProgressDatasource = false;
                            if (showResultContent && showResultDir) {
                                sp.searchResultDatasource = res.data.list;
                            } else if (showResultContent) {
                                sp.searchResultDatasource = _.filter(res.data.list, {
                                    type: 2
                                });
                            } else {
                                searchResultDatasource = _.filter(res.data.list, {
                                    type: 1
                                });
                            }
                        });
                    }
                }
                function doRecursive(e, callback) {
                    callback(e);
                    if (e.nodes) {
                        _.forEach(e.nodes, function(item) {
                            doRecursive(item, callback);
                        });
                        _.forEach(e.contents, function(item) {
                            doRecursive(item, callback);
                        });
                    }
                }
            }
        } ],
        template: '<div class="ui modal" id="asset-picker" aria-label="{{\'choose\' | translate}}" >                                                                                                                                 <div class="header">                                                                                                                                                                              <div class="ui form" >                <div class="field icon ui input fluid">                    <input type="text" ng-model="query" ng-change="search()" placeholder="{{\'جستجو\' | translate}}" />                    <i class="icon" title="{{\'clear\' | translate}}" ng-class="{remove: query.length, search: !query}" ng-click="query = null;search();" style="cursor:pointer !important; pointer-events:all !important"></i>                </div>            </div>        </div>                                                                                                                                                                         <div class="content scrolling">                                                                                                                                                                       <div class ="" >                                                                                                                                                    <div class="ui menu secondary pointing" ng-show="showDatasources&&showCharts">                    <div class="pointer item" ng-class="{active: selectedIndex==0}" ng-click="selectedIndex = 0">{{ \'datasources\' | translate }}</div>                    <div class="pointer item" ng-class="{active: selectedIndex==1}" ng-click="selectedIndex=1">{{ \'charts\' | translate }}</div>                </div>                <div >                    <div ng-if="showDatasources" ng-show="selectedIndex==0" >                                                                                                                                         <div class="ui active dimmer inverted" style="position:inherit;" ng-show="searchProgressDatasource">                            <div class="ui active centered inline text loader">                                                                       {{\'searching\' | translate}}                                                                                                                                                       </div>                                                                                                                                                                                </div>                                                                                                                                                                                <div ng-show="searchResultDatasource && !searchResultDatasource.length && !searchProgressDatasource">{{\'search_no_result\' | translate}}</div>                                 <tree ng-show="!searchResultDatasource" ng-model="datasources" option="optDatasource" class ="block"></tree>                                                                          <div ng-show="searchResultDatasource" layout-margin >                                                                                                                                     <div ng-repeat="i in searchResultDatasource">                                                                                                                                             <label><input type="checkbox" ng-model="i.check"/> {{i.name}}</label>                                                                                                                          </div>                                                                                                                                                                            </div>                                                                                                                                                                            </div>                                                                                                                                                                                                                                                                                                                                                                   <div  ng-if="showCharts" ng-show="selectedIndex==1">                                                                                                                                                <div class="ui active dimmer inverted" style="position:inherit;" ng-show="searchProgressChart">                            <div class="ui active centered inline text loader">                                  {{\'searching\' | translate}}                                                                                                                                                       </div>                                                                                                                                                                                </div>                                                                                                                                                                                <div class ="md-caption" layout-padding ng-show="searchResultChart && !searchResultChart.length && !searchProgressChart">{{\'search_no_result\' | translate}}</div>                                           <tree ng-show="!searchResultChart" ng-model="charts" option="optChart" class ="block"></tree>                                                                                         <div ng-show="searchResultChart" layout-margin >                                                                                                                                          <div ng-repeat="i in searchResultChart">                                                                                                                                                  <label><input type="checkbox" ng-model="i.check"/> {{i.name}}</label>                                                                                                                          </div>                                                                                                                                                                            </div>                                                                                                                                                                            </div>                                                                                                                                                                         </div>                                                                                                                                                                        </div>                                                                                                                                                                            </div>                                                                                                                                                                  <div class="actions">                                                                                                                                                          <div class="ui button green" ng-click="select()"> {{\'choose\' | translate}} </div>            <div class="ui button" ng-click="cancel()"> {{\'cancel\' | translate}} </div>        </div>                                                                                                                                                          </div>'
    };
} ]);

ngApp.directive("collapse", function() {
    return {
        restrict: "E",
        transclude: true,
        scope: {
            title: "@",
            hideIcon: "@",
            onTitleClick: "&",
            model: "=?ngModel",
            selectableDir: "=?"
        },
        controller: [ "$scope", function($scope) {
            var header;
            var body;
            $scope.model = $scope.model || {};
            this.addHeader = function(h) {
                header = h;
                header.show = $scope.model.open;
                header.click = function() {
                    if (body) {
                        $scope.model.open = !body.show;
                        body.show = !body.show;
                    }
                    $scope.onTitleClick();
                };
            };
            this.addBody = function(b) {
                body = b;
                body.show = $scope.model.open;
            };
            if ($scope.hideIcon == "true" && header) {
                header.hideIcon = true;
            }
            $scope.$watch("hideIcon", function(n) {
                if ($scope.hideIcon == "true" && header) {
                    header.hideIcon = true;
                }
            });
        } ],
        template: "<div ng-transclude><div>"
    };
}).directive("collapseHeader", function() {
    return {
        restrict: "E",
        transclude: true,
        require: "^^collapse",
        scope: {},
        link: function(scope, element, attrs, collapse) {
            collapse.addHeader(scope);
        },
        template: '<div ng-click="show = !show; click()" class="pointer title">                        <i style="width:30px;" class="ui icon angle left icon-animate" ng-class ="{\'rotate-90\' : show}" ng-style="{\'visibility\': !hideIcon ? \'visible\' : \'hidden\'}" xng-hide="hideIcon"></i>                        <div ng-transclude style="width: calc(100% - 40px); display:inline-block;" ><div>                 </div>'
    };
}).directive("collapseBody", function() {
    return {
        restrict: "E",
        transclude: true,
        require: "^^collapse",
        scope: {},
        link: function(scope, element, attrs, collapse) {
            collapse.addBody(scope);
        },
        template: '<div class="body" uib-collapse="!show" style="min-height:unset;" ng-transclude></div>'
    };
}).directive("tree", function() {
    return {
        restrict: "E",
        transclude: true,
        scope: {
            root: "=ngModel",
            option: "=",
            url: "&"
        },
        controller: [ "$scope", "$http", "$translate", function($scope, $http, $translate) {
            $scope.root = $scope.root || {
                name: "root",
                open: true
            };
            $scope.active = function(u) {
                var temp = u.active;
                if (!$scope.option.multiple) {
                    doRecursive($scope.root, function(item) {
                        item.active = false;
                    });
                }
                u.active = temp;
            };
            $scope.selectAll = function(data, s) {
                _.each(data.contents, function(d) {
                    d.active = s;
                });
            };
            function doRecursive(e, callback) {
                callback(e);
                if (e.nodes) {
                    _.forEach(e.nodes, function(item) {
                        doRecursive(item, callback);
                    });
                    _.forEach(e.contents, function(item) {
                        doRecursive(item, callback);
                    });
                }
            }
        } ],
        template: '<div class ="sadaf-tree">    <div style="list-style:none" class ="tree-element ul">        <div ng-repeat="data in [root]" class ="tree-element li" ng-include="\'tree_item_renderer.html\'"></div>    </div></div><script type="text/ng-template" id="tree_item_renderer.html">    <collapse class ="block" selectable-dir="option.selectableDir" ng-model="data"        hide-icon="{{(!data.nodes || !data.nodes.length ) && ( option.justDir || ( !data.contents || !data.contents.length) ) && data.loaded }}">        <collapse-header class ="block" ng-click="$event.stopPropagation(); option.url(data)">            <label ng-show="option.selectableDir" style="margin:0">                 <input type="checkbox" ng-model="data.active"ng-change="active(data)" ng-click="$event.stopPropagation()"/> {{data.name}}</label>            <span ng-show="!option.selectableDir">{{data.name}}</span>        </collapse-header>        <collapse-body class ="block">            <div class ="tree-element ul" style="list-style:none" >                <div class="ui active dimmer inverted" style="position:inherit; display:inline" ng-show="!data.loaded">                     <div class="ui active mini inline text loader">                    </div>                </div>                <div ng-show="data.loaded" class ="tree-element li">                    <label ng-show="option.multiple && data.contents.length" >                         <input type="checkbox" ng-click="$event.stopPropagation()" ng-model="data.selectAll" ng-change="selectAll(data, data.selectAll)"/> <small> {{"select_all" | translate}} </small></label></div>                <div ng-repeat="data in data.nodes" class ="tree-element li" ng-include="\'tree_item_renderer.html\'"></div>                <div ng-repeat="u in data.contents" class ="tree-element li" ng-class ="{active : u.active}" ng-hide="option.justDir">                    <label  style="margin-bottom:0"> <input ng-model="u.active" ng-change="active(u)"type="checkbox" /> {{u.name}}</label>                </div>            </div>        </collapse-body>    </collapse></script>'
    };
});

ngApp.service("chartComments", [ "$http", function($http) {
    function save(chartId, data) {
        return $http.post(app.urlPrefix + "api/ChartComments/save/" + chartId, data).then(function(res) {
            return res.data;
        });
    }
    return {
        save: save
    };
} ]);

var sApp = angular.module("services");

sApp.service("menus", [ "$http", function($http) {
    var promise;
    function get(justEdit) {
        if (!promise) promise = $http.get(app.urlPrefix + "api/menus/get" + (justEdit ? "?JustEdit=true" : ""));
        return promise;
    }
    function getMenu(id) {
        return $http.get(app.urlPrefix + "api/menus/getMenu/" + id);
    }
    function save(model) {
        return $http.post(app.urlPrefix + "api/menus/save/", model);
    }
    function getParentMenu(parent) {
        if (!parent) return get();
        return $http.get(app.urlPrefix + "api/menus/get?ParentId=" + parent);
    }
    return {
        get: get,
        save: save,
        getMenu: getMenu,
        getParentMenu: getParentMenu,
        getEditable: function() {
            return get(true);
        }
    };
} ]);

sApp.service("mainmenus", [ "$http", function($http) {
    function get(parent) {
        var promise = $http.get(app.urlPrefix + "api/mainmenus/get/" + parent);
        return promise;
    }
    function save(model) {
        return $http.post(app.urlPrefix + "api/mainmenus/save", model);
    }
    function remove(id) {
        return $http.get(app.urlPrefix + "api/mainmenus/delete/" + id);
    }
    function search(q) {
        return $http.get(app.urlPrefix + "api/mainmenus/search/" + q);
    }
    function savePermissions(id, roles) {
        return $http.post(app.urlPrefix + "api/mainmenus/savePermissions/" + id, roles);
    }
    return {
        get: get,
        save: save,
        remove: remove,
        search: search,
        savePermissions: savePermissions
    };
} ]);

sApp.service("menuCategories", [ "$http", function($http) {
    var promise;
    function get() {
        if (!promise) promise = $http.get(app.urlPrefix + "api/menuCategories/get");
        return promise;
    }
    function save(model) {
        return $http.post(app.urlPrefix + "api/mainmenus/save", model);
    }
    function remove(id) {
        return $http.get(app.urlPrefix + "api/mainmenus/delete/" + id);
    }
    function search(q) {
        return $http.get(app.urlPrefix + "api/mainmenus/search/" + q);
    }
    return {
        get: get,
        save: save,
        remove: remove,
        search: search
    };
} ]);

sApp.service("mostRecentMenus", [ "$http", function($http) {
    function get() {
        var promise = $http.get(app.urlPrefix + "api/mostRecentMenus/get");
        return promise;
    }
    function remove(id) {
        return $http.get(app.urlPrefix + "api/mainmenus/delete/" + id);
    }
    return {
        get: get,
        remove: remove
    };
} ]);

sApp.service("favoriteMenus", [ "$http", function($http) {
    function get() {
        var promise = $http.get(app.urlPrefix + "api/favoriteMenus/get");
        return promise;
    }
    function remove(id) {
        return $http.get(app.urlPrefix + "api/mainmenus/delete/" + id);
    }
    return {
        get: get,
        remove: remove
    };
} ]);

var ngApp = angular.module("services");

ngApp.service("roles", [ "$http", function($http) {
    var promise;
    function get() {
        if (!promise) promise = $http.get(app.urlPrefix + "api/roles/get");
        return promise;
    }
    function reset() {
        promise = null;
    }
    function createTree(data) {
        var root = {
            name: "root",
            nodes: [],
            contents: []
        };
        function findRec(tree, item) {
            if (tree.id == item.id) return tree;
            if (_.isArray(tree.nodes)) {
                for (var i = 0; i < tree.nodes.length; i++) {
                    var f = findRec(tree.nodes[i], item);
                    if (f != null) return f;
                }
            }
            return null;
        }
        _.each(data, function(item) {
            var exists = _.find(data, {
                id: item.parent
            });
            if (!exists) {
                item.parent = 0;
            }
        });
        var array = [].concat(data);
        _.each(array, function(d) {
            d.nodes = [];
        });
        var i = 0, max = array.length * array.length;
        var t = performance.now();
        while (array.length) {
            i++;
            if (i > max) break;
            var item = array.pop();
            if (!item.parent) {
                root.nodes.push(item);
                continue;
            }
            var parent = findRec(root, {
                id: item.parent
            });
            if (parent) {
                parent.nodes = parent.nodes || [];
                parent.nodes.push(item);
            } else {
                array.unshift(item);
            }
        }
        console.log("time", performance.now() - t);
        root.open = true;
        return root;
    }
    return {
        get: get,
        reset: reset,
        createTree: createTree
    };
} ]);

ngApp.directive("selectRoles", function() {
    return {
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            model: "=ngModel",
            settings: "=?"
        },
        controller: [ "$scope", "$http", "roles", function(scope, $http, roles) {
            scope.model = scope.model || [];
            scope.settings = scope.settings || {};
            roles.get().then(function(data) {
                scope.roles = _.extend([], data.data.list);
            });
        } ],
        template: '<div>                     <sm-dropdown class="selection search multiple fluid"  settings="{fullTextSearch: true}" model="model" items="roles" label="item.name" value="item.id" ></sm-dropdown>                   </div>',
        link: function(scope, element, attributes) {}
    };
});

(function($) {
    var md = angular.module("services");
    function getCheckedRole(node, array) {
        if (!node) return;
        if (node.check) array.push({
            id: node.id,
            action: node.action
        });
        _.each(node.nodes, function(item) {
            getCheckedRole(item, array);
        });
    }
    md.directive("datasourcePermission", [ "$timeout", "$http", "roles", function($timeout, $http, roles) {
        return {
            restrict: "E",
            templateUrl: app.urlPrefix + "dist/partial/management/datasource/datasourcePermission.html?v=" + app.version,
            scope: {
                roles: "=ngModel",
                conf: "=?conf",
                id: "@",
                type: "@"
            },
            controller: [ "$scope", "$http", function($scope, $http) {
                var type = !$scope.type || $scope.type === "datasource" ? "datasource" : $scope.type === "chart" ? "chart" : $scope.type === "mainmenu" ? "mainmenu" : "menu";
                if (!$scope.roles || !$scope.roles.length) {
                    roles.get().then(function(res) {
                        $scope.roles = angular.merge({}, res.data.list);
                        _.forEach($scope.roles, function(item) {
                            item.action = 1;
                            item.check = false;
                        });
                        checkRoleActions();
                        var r = _.filter($scope.roles, null);
                        $scope.root = roles.createTree(r);
                    });
                    $scope.$watch("root", function(n) {
                        var checkedRoles = [];
                        getCheckedRole($scope.root, checkedRoles);
                        _.each($scope.roles, function(role) {
                            var checked = _.find(checkedRoles, {
                                id: role.id
                            });
                            role.check = checked != null;
                            if (role.check) {
                                role.action = checked.action;
                            }
                        });
                    }, true);
                }
                if (+$scope.id) {
                    getPermission(+$scope.id, type);
                }
                $scope.$watch("conf.id", function(n, o) {
                    if (n) getPermission(n, type);
                });
                function getPermission(id, type) {
                    var link = app.urlPrefix + "api/permissions/getDatasourcePermissions?id=" + id;
                    switch (type) {
                      case "datasource":
                        link = app.urlPrefix + "api/permissions/getDatasourcePermissions?id=" + id;
                        break;

                      case "chart":
                        link = app.urlPrefix + "api/permissions/getChartPermissions?id=" + id;
                        break;

                      case "menu":
                        link = app.urlPrefix + "api/permissions/getMenuPermissions?id=" + id;
                        break;

                      case "mainmenu":
                        link = app.urlPrefix + "api/permissions/getMainmenuPermissions?id=" + id;
                        break;

                      default:                    }
                    $scope.getPermissionProgress = true;
                    $http.get(link).then(function(res) {
                        $scope.getPermissionProgress = false;
                        $scope.permissions = res.data.list;
                        checkRoleActions();
                    }).catch(function() {
                        $scope.getPermissionProgress = false;
                    });
                }
                function checkRoleActions() {
                    if ($scope.permissions && $scope.roles) {
                        _.forEach($scope.roles, function(role) {
                            role.check = false;
                            var permission = _.find($scope.permissions, {
                                roleId: role.id
                            });
                            if (permission) {
                                role.action = permission.actionSum == 1 ? 1 : permission.actionSum == 3 ? 2 : 4;
                                role.check = true;
                                if (_.isArray(permission.extra)) {
                                    role.extra = permission.extra.slice();
                                }
                            }
                        });
                    }
                }
            } ]
        };
    } ]);
})(jQuery);
// داشبورد مدیریتی صدف info@sadafdashboard.ir 

var cal = angular.module("calendar", []);

var ngApp = angular.module("sadafForms", [ "iframeCommunicate", "ng-sortable", "services", "calendar", "semantic-ui", "ngRoute", "ui.sortable", "pascalprecht.translate", "ngSanitize", "uibCollapseCat", "ngFileUpload" ]);

ngApp.config([ "$translateProvider", function($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        prefix: app.urlPrefix + "dist/locales/locale-",
        suffix: ".js"
    });
    $translateProvider.preferredLanguage("fa");
    $translateProvider.useSanitizeValueStrategy("sanitizeParameters");
} ]);

ngApp.config([ "$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
    $routeProvider.when("/forms/list", {
        templateUrl: app.urlPrefix + "dist/partial/forms/editor/form-generator-list.html?v=" + app.version,
        controller: "fromsCtrl",
        controllerAs: "c"
    }).when("/forms/:id?", {
        templateUrl: app.urlPrefix + "dist/partial/forms/editor/form-generator-editor.html?v=" + app.version,
        controller: "fromGeneratorCtrl",
        controllerAs: "c"
    });
} ]);

var iframeCommunicate = angular.module("iframeCommunicate", []);

iframeCommunicate.service("iframeService", [ "$location", "$http", function($location, $http) {
    return {
        setPath: function(path) {
            window.location.href = app.urlPrefix + path;
            console.log("### [iframeService] window.location.href ", app.urlPrefix + path);
        },
        handleMessage: function(message) {
            console.log("handleMessage", message);
            $this = this;
            if (message.type === "route") {
                this.setPath(message.param);
            }
            if (message.type === "action-call") {
                $http.get(message.param);
            }
            if (message.type === "set-variable") {
                if (_.isArray(message.param.userVariables)) {
                    localStorage.setItem("userVariable", JSON.stringify(message.param.userVariables));
                }
                $this.setPath(message.param.url);
            }
        }
    };
} ]);

var ngApp = angular.module("sadafForms");

ngApp.directive("sadafForm", function() {
    return {
        scope: {
            id: "@",
            rowId: "@?",
            onCancel: "&?",
            onFinish: "&?",
            onSave: "&?",
            option: "=?",
            settings: "=?"
        },
        controller: [ "$scope", "$http", "$sce", "$routeParams", "$timeout", "$q", "formsService", "formsSubmitService", "$attrs", "taskExecutor", function($scope, $http, $sce, $routeParams, $timeout, $q, formsService, formsSubmitService, $attrs, taskExecutor) {
            var c = this;
            $scope.selector = "selector-" + Math.floor(Math.random() * 999999 + 1e6);
            $scope.option = $scope.option || {};
            $scope.onCancel = $scope.onCancel || function() {};
            var id = $scope.id;
            $scope.submittedStatus = 0;
            $scope.formLoading = true;
            $scope.activePage = 0;
            $scope.setActivePage = function(i) {
                $scope.activePage = i;
                if ($scope.settings.modal) {
                    $timeout(function() {
                        $("#" + $scope.selector).modal("refresh");
                    }, 0);
                }
            };
            $scope.isValid = function() {
                var isValid = false;
                if ($scope.data && $scope.data.pages) main: for (var i = 0; i < $scope.data.pages.length; i++) {
                    for (var j = 0; j < $scope.data.pages[i].controls.length; j++) {
                        var cnt = $scope.data.pages[i].controls[j];
                        if (cnt.type == 12 && !cnt.isValid) {
                            isValid = true;
                            break main;
                        }
                    }
                }
                return isValid;
            };
            function executeTask(type) {}
            $scope.submit = function() {
                if ($scope.loading === true) return;
                $scope.loading = true;
                $scope.clearAllErrors();
                formsSubmitService.submit($scope.id, $scope.data).then(function success(data) {
                    $scope.loading = false;
                    $scope.submittedStatus = 0;
                    if (!data.result && data.messages) {
                        $scope.pagesContainError = $scope.pagesContainError || [];
                        _.each($scope.data.pages, function(page) {
                            _.each(data.messages, function(error) {
                                var cnt = _.find(page.controls, {
                                    name: error.name
                                });
                                if (cnt) {
                                    cnt.error = error.error;
                                    if (_.findIndex($scope.pagesContainError, page) == -1) {
                                        $scope.pagesContainError.push(page);
                                    }
                                }
                            });
                        });
                    }
                    if (!data.result && data.pageMessages) {
                        _.each(data.pageMessages, function(error) {
                            var cnt = _.find($scope.data.pages, {
                                name: error.name
                            });
                            if (cnt) cnt.error = error.error;
                        });
                    }
                    if (data.result) {
                        var isNew = +$scope.rowId == 0;
                        var model = $scope.data;
                        _.each(autoIncMap, function(k, v) {
                            autoIncMap[v] = k + 1;
                        });
                        $timeout(function() {
                            $("#" + $scope.selector + " .close-btn").focus();
                        }, 0);
                        if ($scope.data.showSubmitedInfo) {
                            $scope.submittedStatus = 1;
                            runOnAllControll($scope.data, function(d) {
                                d.readonly = true;
                            });
                        } else {
                            $scope.submitNewInfo();
                        }
                        if ($scope.onSave) $scope.onSave({
                            data: data
                        });
                    }
                }, function error(res) {
                    if (res.data.title && res.data.desc) {
                        $scope.error = {
                            title: res.data.title,
                            desc: res.data.desc
                        };
                    } else {
                        $scope.error = null;
                    }
                    $scope.loading = false;
                    $scope.submittedStatus = 2;
                });
            };
            $scope.submitNewInfo = function() {
                $scope.submittedStatus = 0;
                runOnAllControll($scope.data, function(d) {
                    d.readonly = false;
                });
                if ($scope.onFinish) $scope.onFinish();
                $scope.clearForm();
                formsService.clearCache($scope.id);
                getFormEmptyData();
            };
            $scope.clearAllErrors = function() {
                $scope.pagesContainError = [];
                runOnAllControll($scope.data, function(cnt) {
                    cnt.error = null;
                }, function(page) {
                    page.error = null;
                });
            };
            var autoIncMap = {};
            $scope.clearForm = function() {
                $scope.submittedStatus = 0;
                $scope.activePage = 0;
                runOnAllControll($scope.data, function(nItem) {
                    if (nItem && nItem.type == 2 && nItem.validations && nItem.validations.autoIncrement) {
                        nItem.value = autoIncMap[nItem.name];
                        return;
                    }
                    nItem.value = null;
                    if (nItem.dropdown) nItem.dropdown.listValue = null;
                    nItem.value = null;
                    if (nItem.dropdown) nItem.dropdown.listValue = null;
                    if (nItem.type == 13) nItem.multiRowForm.rows.splice(0, nItem.multiRowForm.rows.length - 1);
                });
            };
            function changeDigitType(data) {
                _.each(data, function(page) {
                    rec(page.controls, function(cnt) {
                        if (cnt.type == 2 && cnt.value != null) {
                            cnt.value = +cnt.value;
                        }
                    });
                });
            }
            function rec(cnts, run) {
                _.each(cnts, function(cnt) {
                    run(cnt);
                    if (cnt.type == 13) {
                        _.each(cnt.multiRowForm.rows, function(row) {
                            rec(row, run);
                        });
                    }
                });
            }
            function getFormData() {
                $scope.clearForm();
                if (!$scope.rowId) return;
                if (+$scope.id == 0) return;
                $scope.formLoading = true;
                formsSubmitService.get($scope.id, $scope.rowId).then(function(data) {
                    changeDigitType(data.model.pages);
                    $scope.editPermission = data.editPermission;
                    $scope.addPermission = data.addPermission;
                    $scope.deletePermission = data.deletePermission;
                    $timeout(function() {
                        if ($scope.data && $scope.data.pages) {
                            $scope.data.pages = [];
                        }
                    }, 0);
                    $timeout(function() {
                        $scope.data = data.model;
                        $scope.data.id = data.id;
                        $scope.data.rowId = $scope.rowId;
                        $scope.modelId = data.id;
                        $scope.allControl = [];
                        runOnAllControll($scope.data, function(cnt) {
                            $scope.allControl.push(cnt);
                        });
                    }, 250);
                    $timeout(function() {
                        $scope.formLoading = false;
                        $timeout(function() {
                            $("#" + $scope.selector).modal("refresh");
                        }, 50);
                    }, 500);
                }, function() {
                    $scope.formLoading = false;
                });
            }
            function getFormEmptyData() {
                console.log("### [getFormEmptyData]");
                $scope.clearForm();
                $scope.formLoading = true;
                formsService.get($scope.id).then(function(data) {
                    $scope.formLoading = false;
                    $scope.data = data.model;
                    $scope.editPermission = data.editPermission;
                    $scope.deletePermission = data.deletePermission;
                    $scope.addPermission = data.addPermission;
                    changeDigitType(data.model.pages);
                    $scope.allControl = [];
                    runOnAllControll($scope.data, function(nItem) {
                        $scope.allControl.push(nItem);
                        if (nItem && nItem.type == 2 && nItem.validations && nItem.validations.autoIncrement) {
                            autoIncMap[nItem.name] = autoIncMap[nItem.name] || +nItem.value;
                        }
                    });
                }, function() {
                    $scope.formLoading = false;
                });
            }
            $scope.cancel = function() {
                $scope.submitNewInfo();
                $scope.onCancel();
            };
            $scope.remove = function() {
                var f = confirm("آیا برای حذف اطلاعات جاری فرم اطمینان دارید؟");
                if (f) formsSubmitService.remove($scope.id, $scope.rowId).then(function() {
                    executeTask(2);
                    $scope.onCancel();
                    $scope.submitNewInfo();
                }, function(res) {
                    if (res.data.title && res.data.desc) {
                        alert(res.data.desc);
                    }
                });
            };
            function clearIfFilterHasControl(name, cnt) {
                if (cnt.useFilter && cnt.filters && cnt.filters.length) {
                    var needClear = _.some(cnt.filters, {
                        control: name,
                        type: 2
                    });
                    if (needClear) {
                        cnt.value = null;
                    }
                }
            }
            $scope.$watch(angular.bind(this, function() {
                return this.allControl;
            }), function(n, d) {
                if (!n || !d) return;
                _.each(n, function(nv) {
                    var old = _.find(d, {
                        name: nv.name
                    });
                    if (nv.value != old.value && (nv.type == 12 || nv.type == 4)) {
                        debugger;
                        _.each($scope.allControl, function(cnt) {
                            if (nv.name != cnt.name) {
                                clearIfFilterHasControl(nv.name, cnt);
                            }
                        });
                    }
                });
            }, true);
            var lastRun = null;
            $scope.$watch("data", function(newVal, oldVal) {
                $timeout.cancel(lastRun);
                lastRun = $timeout(updateCalculated, 350);
            }, true);
            function findControl(name, data) {
                var n = null;
                runOnAllControll(data, function(d) {
                    if (d.name === name) {
                        n = d;
                        return false;
                    }
                });
                return n;
            }
            function runOnAllControll(data, run, pageRun) {
                if (!data) return;
                var pagesControls = [];
                _.each(data.pages, function(page) {
                    if (pageRun) pageRun(page);
                    if (page && _.isArray(page.controls)) {
                        pagesControls = pagesControls.concat(page.controls);
                    }
                });
                _.each(pagesControls, function(cnt) {
                    if (cnt.type == 13) {
                        _.each(cnt.multiRowForm.rows, function(row) {
                            _.each(row, function(i) {
                                var ret = run(i, row);
                                if (ret === false) return false;
                            });
                        });
                    }
                    var ret = run(cnt, pagesControls);
                    if (ret === false) return false;
                });
            }
            function GetMultiRowControlBaseOnChildName(name) {
                var row;
                runOnAllControll($scope.data, function(cnt) {
                    if (cnt.type == 13) {
                        var index = _.findIndex(cnt.multiRowForm.rows[0], {
                            name: name
                        });
                        if (index != -1) {
                            row = {
                                control: cnt,
                                index: index
                            };
                        }
                    }
                });
                return row;
            }
            function calcFlatFormula(f, rowControls) {
                var params = [];
                var r = f.replace(/\[(field-\d+)\]/gi, function(a, b, c) {
                    var cc = _.find(rowControls, {
                        name: b
                    });
                    if (cc.type == 8) {
                        var val = "00:00";
                        if (cc.value) val = cc.value.substring(0, 5);
                        params.push({
                            type: "millisecond",
                            value: moment.duration(val).asMilliseconds()
                        });
                    }
                    if (cc.type == 9) {
                        var val = "1300/0/01";
                        if (cc.value) val = cc.value;
                        params.push({
                            type: "millisecond",
                            value: moment(val, "jYYYY/jMM/jDD").utc().unix() * 1e3
                        });
                    }
                    if (cc.type == 14) {
                        var val = "1300/0/01 00:00:00";
                        if (cc.value) val = cc.value;
                        params.push({
                            type: "millisecond",
                            value: moment(val, "jYYYY/jMM/jDD HH:mm:ss").utc().unix() * 1e3
                        });
                    }
                    if (cc.type == 2 || cc.type == 5 && cc.calcType == "digit" || cc.type == 16 && cc.calcType == "digit") {
                        params.push({
                            type: "digit",
                            value: +cc.value || 0
                        });
                    }
                    if (cc.type == 5 && cc.calcType == "millisecond" || cc.type == 16 && cc.calcType == "millisecond") {
                        params.push({
                            type: "millisecond",
                            value: cc.calculate.calculatedValue
                        });
                    }
                    return "{" + (params.length - 1) + "}";
                });
                var newR = r.replace(/\{(\d+)\}/gi, function(a, b, c) {
                    return " " + params[+b].value + " ";
                });
                var haveDate = _.filter(params, function(d) {
                    return d.type == "millisecond" || d.type == "millisecond" || d.type == "millisecond";
                }).length > 0;
                var haveDigit = _.some(params, {
                    type: "digit"
                });
                if (haveDate) {
                    var v = moment.duration(+eval(newR)).format("d روز و h ساعت و m دقیقه");
                    return {
                        value: v,
                        calculatedValue: +eval(newR),
                        type: "millisecond"
                    };
                }
                var v = +eval(newR);
                return {
                    value: v,
                    calculatedValue: +eval(newR),
                    type: "digit"
                };
            }
            function updateCalculated(newVal, oldVal) {
                console.log("updateCalculated");
                runOnAllControll($scope.data, function(control, rowControls) {
                    if (control.type == 5) {
                        var o = calcFlatFormula(control.calculate.expression, rowControls);
                        control.value = o.value;
                        control.formula = o.formula;
                        control.calcType = o.type;
                        control.calculate.calculatedValue = o.calculatedValue;
                    }
                    if (control.type == 16) {
                        var regex = /\s*(sum|avg|var)\s*\(([^\)]+)\)\s*/gi;
                        var hasDurationFormat = false;
                        var r = control.calculate.expression.replace(regex, function(a, b, c) {
                            var array = [];
                            var firstField = c.replace(/.*\[(field-\d+)\].*/gi, "$1");
                            var rows = GetMultiRowControlBaseOnChildName(firstField);
                            if (!rows) {
                                return "از فیلدهای مربوط به فرم چند ردیفه باید استفاده شود";
                            }
                            _.each(rows.control.multiRowForm.rows, function(row) {
                                var o = calcFlatFormula(c, row);
                                if (o.type != "digit") {
                                    hasDurationFormat = true;
                                    array.push(o.calculatedValue || 0);
                                } else {
                                    array.push(o.value || 0);
                                }
                            });
                            var val = 0;
                            if (b === "sum") val = d3.sum(array);
                            if (b === "avg") val = d3.mean(array);
                            if (b === "var") val = d3.variance(array);
                            return " " + val + " ";
                        });
                        if (hasDurationFormat) {
                            var v = moment.duration(+eval(r)).format("d روز و h ساعت و m دقیقه");
                            control.value = v;
                            control.calculate.calculatedValue = +eval(r);
                            control.calcType = "millisecond";
                        } else {
                            try {
                                control.value = +eval(r).toFixed(5);
                                control.calculate.calculatedValue = +eval(r);
                            } catch (e) {
                                control.value = r;
                            }
                        }
                    }
                    if (control.type == 17) {
                        var forwatch = _.find(rowControls, {
                            name: control.tableLookup.controlName
                        });
                        if (!forwatch) {
                            model.value = null;
                            return;
                        }
                        var v = [];
                        if (forwatch.dropdown && forwatch.dropdown.listValue && forwatch.dropdown.listValue.length) v.concat(forwatch.dropdown.listValue); else if (forwatch.value) v.push(forwatch.value);
                        if (control.tableLookup.lastV && v.length == control.tableLookup.lastV.length && _.difference(v, control.tableLookup.lastV).length == 0) {
                            return;
                        }
                        control.tableLookup.lastV = v;
                        control.inProgress = true;
                        formsService.tableLookup(control.tableLookup, v).then(function(data) {
                            control.inProgress = false;
                            console.log("### data", data);
                            if (data && data.length) {
                                control.value = data[0].value;
                            }
                        });
                    }
                    if (control.useFilter && control.filters && control.filters.length) {
                        _.map(control.filters, function(filter) {
                            if (filter.type === 2) {
                                var cl = findControl(filter.control, $scope.data);
                                if (filter.controlValue !== cl.value) {
                                    filter.controlValue = cl.value;
                                }
                            }
                        });
                    }
                });
            }
            if (!$scope.rowId && $scope.id) {
                getFormEmptyData();
            }
            if ($scope.settings) {
                $scope.settings["notify"] = function(formId, rowId) {
                    $scope.rowId = rowId;
                    $scope.id = formId;
                    if (+$scope.id == 0) return;
                    $scope.allControl = null;
                    if (!$scope.rowId) getFormEmptyData(); else getFormData();
                };
            }
            $scope.colseBtn = function(e) {
                if (e.ctrlKey && e.keyCode == 13 || e.keyCode == 27) {
                    $scope.submitNewInfo();
                }
            };
        } ],
        restrict: "AE",
        templateUrl: app.urlPrefix + "dist/partial/forms/form-render.html?v=" + app.version
    };
});

ngApp.service("formsSubmitService", [ "$http", function($http) {
    var get = function(formId, rowId) {
        return $http.get(app.urlPrefix + "api/formsSubmit/getData/" + formId + "?rowId=" + rowId).then(function(res) {
            var data = res.data;
            return data;
        });
    };
    var control = {};
    control.CONTROL_TYPE_TEXT_SINGLE_LINE = 0;
    control.CONTROL_TYPE_TEXT_MULTI_LINE = 1;
    control.CONTROL_TYPE_NUMBER = 2;
    control.CONTROL_TYPE_TEXT_LABEL = 3;
    control.CONTROL_TYPE_DROP_DOWN = 4;
    control.CONTROL_TYPE_CALCULATE = 5;
    control.CONTROL_TYPE_CHECKBOX = 6;
    control.CONTROL_TYPE_MULTI_CHOISE = 7;
    control.CONTROL_TYPE_TIME = 8;
    control.CONTROL_TYPE_DATE = 9;
    control.CONTROL_TYPE_PHOTO = 10;
    control.CONTROL_TYPE_LINK = 11;
    control.CONTROL_TYPE_FORM_LOOKUP = 12;
    control.CONTROL_TYPE_MULTI_ROW = 13;
    control.CONTROL_TYPE_DATE_TIME = 14;
    control.CONTROL_TYPE_BUTTON = 15;
    control.CONTROL_TYPE_CALCULATE_SUM = 16;
    control.CONTROL_TYPE_FILE_ATTACHMENT = 19;
    function cleanObject(obj) {
        var valids = [ "canEdit", "canView", "columnClass", "label", "name", "type", "value", "listValue", "dropdown", "formLookup", "multiRowForm", "attachment", "button", "calculate", "filters" ];
        delete obj.tableLookup;
        if (obj.type != control.CONTROL_TYPE_DROP_DOWN) delete obj.dropdown;
        if (obj.type != control.CONTROL_TYPE_FORM_LOOKUP) delete obj.formLookup;
        if (obj.type != control.CONTROL_TYPE_MULTI_ROW) delete obj.multiRowForm;
        if (obj.type != control.CONTROL_TYPE_FILE_ATTACHMENT) delete obj.attachment;
        if (obj.type != control.CONTROL_TYPE_BUTTON) delete obj.button;
        if (obj.type != control.CONTROL_TYPE_CALCULATE && obj.type != control.CONTROL_TYPE_CALCULATE_SUM) delete obj.calculate;
        if (obj.type != control.CONTROL_TYPE_FORM_LOOKUP) delete obj.filters;
    }
    var submit = function(id, model) {
        return $http.post(app.urlPrefix + "api/formssubmit/submit/" + id, model).then(function(res) {
            app.moderation.dashboadpage.refreshRelatedDatasources(res.data.RefreshDatasource);
            return res.data;
        });
    };
    var remove = function(id, rowId) {
        return $http.post(app.urlPrefix + "api/formssubmit/delete/" + id, rowId).then(function(res) {
            app.moderation.dashboadpage.refreshRelatedDatasources(res.data.RefreshDatasource);
            return res.data;
        });
    };
    return {
        submit: submit,
        remove: remove,
        get: get
    };
} ]);

ngApp.directive("selectForm", function() {
    return {
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            onSelect: "&",
            settings: "=?"
        },
        controller: [ "$scope", "$http", "formsService", function(scope, $http, formsService) {
            scope.model = scope.model || [];
            scope.settings = scope.settings || {};
            formsService.get().then(function(data) {
                scope.forms = data;
            });
            scope.opt = {
                closable: false,
                onApprove: function() {
                    if (!scope.model || !scope.model.length) {
                        alert("حداقل یک مورد باید انتخاب شود");
                        return false;
                    }
                    scope.onSelect({
                        forms: scope.model,
                        settings: scope.settings
                    });
                    return false;
                }
            };
        } ],
        template: '<div>                   <sm-modal visible="settings.visible" settings="opt">                        <div class="header">انتخاب فرم</div>                        <div class="content">                            <p>لطفا فرم‌های مورد نظر خود را انتخاب کنید</p>                            <div class="ui form">                                <div class="field">                                    <label>انتخاب فرم</label>                                    <sm-dropdown class="selection search multiple"  settings="{fullTextSearch: true}" model="model" items="forms" label="item.name" value="item" ></sm-dropdown>                                </div>                            </div>                        </div>                        <div class="actions">                            <div class="ui black deny button">لغو</div>                            <div class="ui positive button" ng-class="{loading: settings.loaging}" >اضافه کردن</div>                        </div>                    </sm-modal>                    </div>',
        link: function(scope, element, attributes) {}
    };
});

(function() {
    var ngApp = angular.module("sadafForms");
    ngApp.controller("fromGeneratorCtrl", [ "$scope", "$http", "$sce", "$timeout", "$mdToast", "$routeParams", "formsService", "controlPropertyService", "$translate", function($scope, $http, $sce, $timeout, $mdToast, $routeParams, formsService, controlPropertyService, $translate) {
        $scope.saveProgress = false;
        var c = this;
        c.id = $routeParams.id || 0;
        var isEdit = c.id > 0;
        c.app = app;
        c.items = [ {
            order: 1,
            columnClass: "four",
            key: "متن کوتاه",
            label: "نام",
            icon: "text cursor",
            type: 0,
            showUniqueProp: true,
            "default": true,
            require: true,
            regex: true,
            accessControlEdit: false,
            accessControlView: false,
            accessControlEditRoles: [],
            accessControlViewRoles: []
        }, {
            order: 2,
            columnClass: "four",
            key: "متن بلند",
            label: "متن بلند",
            icon: "text cursor",
            type: 1,
            showUniqueProp: true,
            "default": true,
            require: true,
            regex: true,
            accessControlEdit: false,
            accessControlView: false,
            accessControlEditRoles: [],
            accessControlViewRoles: []
        }, {
            order: 3,
            columnClass: "four",
            key: "عدد",
            label: "عدد",
            icon: "hashtag",
            type: 2,
            showUniqueProp: true,
            "default": true,
            require: true,
            regex: true,
            format: ",.0f",
            accessControlEdit: false,
            accessControlView: false,
            accessControlEditRoles: [],
            accessControlViewRoles: [],
            validations: {
                autoIncrementSeed: 1
            }
        }, {
            order: 4,
            columnClass: "four",
            key: "برچسب",
            label: "برچسب",
            icon: "font",
            type: 3,
            showUniqueProp: false,
            "default": false,
            require: false,
            accessControlEdit: false,
            accessControlView: false,
            accessControlEditRoles: [],
            accessControlViewRoles: []
        }, {
            order: 5,
            columnClass: "four",
            key: "چند گزینه",
            icon: "caret down",
            label: "چند گزینه",
            type: 4,
            showUniqueProp: true,
            "default": true,
            require: true,
            dropdown: {
                useRemoteData: false
            },
            accessControlEdit: false,
            accessControlView: false,
            accessControlEditRoles: [],
            accessControlViewRoles: []
        }, {
            order: 6,
            columnClass: "four",
            key: "چند گزینه ریموت",
            icon: "caret down",
            label: "چند گزینه ریموت",
            type: 4,
            showUniqueProp: true,
            "default": true,
            require: true,
            accessControlEdit: false,
            accessControlView: false,
            dropdown: {
                useRemoteData: true
            },
            accessControlEditRoles: [],
            accessControlViewRoles: []
        }, {
            columnClass: "four",
            key: "تایید",
            icon: "checkmark box",
            type: 6,
            label: "انتخاب مقدار",
            showUniqueProp: false,
            "default": true,
            require: false,
            accessControlEdit: false,
            accessControlView: false,
            accessControlEditRoles: [],
            accessControlViewRoles: [],
            order: 7
        }, {
            columnClass: "four",
            key: "زمان",
            icon: "wait",
            label: "زمان",
            type: 8,
            showUniqueProp: true,
            "default": true,
            require: true,
            accessControlEdit: false,
            accessControlView: false,
            accessControlEditRoles: [],
            accessControlViewRoles: [],
            order: 8
        }, {
            columnClass: "four",
            key: "تاریخ",
            label: "تاریخ",
            icon: "calendar",
            type: 9,
            showUniqueProp: true,
            "default": true,
            require: true,
            accessControlEdit: false,
            accessControlView: false,
            accessControlEditRoles: [],
            accessControlViewRoles: [],
            order: 9
        }, {
            columnClass: "eight",
            key: " زمان - تاریخ",
            label: " زمان - تاریخ",
            icon: "calendar",
            type: 14,
            showUniqueProp: true,
            "default": true,
            require: true,
            accessControlEdit: false,
            accessControlView: false,
            accessControlEditRoles: [],
            accessControlViewRoles: [],
            order: 9
        }, {
            columnClass: "four",
            key: "ارجاع به فرم",
            label: "ارجاع به فرم",
            icon: "pointing right",
            type: 12,
            formLookup: {
                form: -1,
                keyControls: [],
                showAddButton: true
            },
            showUniqueProp: true,
            "default": true,
            require: true,
            accessControlEdit: false,
            accessControlView: false,
            accessControlEditRoles: [],
            accessControlViewRoles: [],
            order: 10
        }, {
            columnClass: "twelve",
            key: "گروه تکرار شونده",
            label: "لیست",
            dontShowAccessControl: true,
            icon: "table",
            type: 13,
            showUniqueProp: false,
            "default": false,
            require: false,
            accessControlEdit: false,
            accessControlView: false,
            accessControlEditRoles: [],
            accessControlViewRoles: [],
            multiRowForm: {
                addKeyText: "ردیف جدید",
                rows: [ [] ],
                controlSize: "mini"
            },
            order: 11
        }, {
            columnClass: "four",
            key: "کلید",
            label: "کلید",
            icon: "square",
            type: 15,
            showUniqueProp: false,
            "default": false,
            require: false,
            button: {
                type: 1,
                openLinkType: 0,
                colorClass: "black",
                size: "tiny",
                tasks: [ {
                    type: 0,
                    openLinkType: 0
                } ]
            },
            accessControlEdit: false,
            accessControlView: false,
            accessControlEditRoles: [],
            accessControlViewRoles: [],
            order: 12
        }, {
            columnClass: "four",
            key: "محاسباتی",
            icon: "calculator",
            label: "فیلد محاسباتی",
            type: 5,
            showUniqueProp: false,
            "default": false,
            require: false,
            format: "#,#",
            calculate: {
                expression: ""
            },
            accessControlEdit: false,
            accessControlView: false,
            accessControlEditRoles: [],
            accessControlViewRoles: [],
            order: 13
        }, {
            columnClass: "four",
            key: "محاسباتی - جمع",
            label: "محاسباتی - جمع",
            icon: "calculator",
            type: 16,
            showUniqueProp: false,
            "default": false,
            require: false,
            format: "#,#",
            calculate: {
                expression: "",
                func: "sum"
            },
            accessControlEdit: false,
            accessControlView: false,
            accessControlEditRoles: [],
            accessControlViewRoles: [],
            order: 14
        }, {
            columnClass: "four",
            key: "اطلاعات اضافه ارجاع به فرم",
            label: "اطلاعات اضافه ارجاع به فرم",
            dontShowAccessControl: true,
            icon: "info",
            type: 17,
            showUniqueProp: false,
            "default": false,
            require: false,
            format: "#,#",
            accessControlEdit: false,
            accessControlView: false,
            accessControlEditRoles: [],
            accessControlViewRoles: [],
            tableLookup: {},
            order: 15
        }, {
            columnClass: "twelve",
            dontShowColumnSize: true,
            dontShowHide: true,
            dontShowAccessControl: true,
            key: "تیتر",
            label: "تیتر",
            icon: "heading",
            type: 18,
            showUniqueProp: false,
            "default": false,
            require: false,
            format: "#,#",
            accessControlEdit: false,
            accessControlView: false,
            accessControlEditRoles: [],
            accessControlViewRoles: [],
            order: 16
        }, {
            columnClass: "twelve",
            dontShowColumnSize: true,
            dontShowHide: true,
            dontShowAccessControl: true,
            key: "پیوست کردن فایل",
            label: "لیست فایل‌ها",
            icon: "file outline",
            type: 19,
            showUniqueProp: false,
            "default": false,
            require: true,
            format: "#,#",
            accessControlEdit: false,
            accessControlView: false,
            accessControlEditRoles: [],
            accessControlViewRoles: [],
            order: 17
        } ];
        $translate([ "short text", "long text", "number", "label", "combo", "remote combo", "checkbox", "time", "date", "date time", "refer to form", "iterator", "calculator", "calculator sum", "extra info", "header", "key", "file list" ]).then(function(msg) {
            function change(type, filter, key, label) {
                var item = _.find(c.items, filter == null ? {
                    type: type
                } : filter);
                item.key = key;
                item.label = label;
            }
            change(0, null, msg["short text"], msg["short text"]);
            change(1, null, msg["long text"], msg["long text"]);
            change(2, null, msg["number"], msg["number"]);
            change(3, null, msg["label"], msg["label"]);
            change(4, function(d) {
                return d.type == 4 && d.dropdown.useRemoteData == false;
            }, msg["combo"], msg["combo"]);
            change(4, function(d) {
                return d.type == 4 && d.dropdown.useRemoteData == true;
            }, msg["remote combo"], msg["remote combo"]);
            change(6, null, msg["checkbox"], msg["checkbox"]);
            change(8, null, msg["time"], msg["time"]);
            change(9, null, msg["date"], msg["date"]);
            change(14, null, msg["date time"], msg["date time"]);
            change(12, null, msg["refer to form"], msg["refer to form"]);
            change(13, null, msg["iterator"], msg["iterator"]);
            change(15, null, msg["key"], msg["key"]);
            change(5, null, msg["calculator"], msg["calculator"]);
            change(16, null, msg["calculator sum"], msg["calculator sum"]);
            change(17, null, msg["extra info"], msg["extra info"]);
            change(18, null, msg["header"], msg["header"]);
            change(19, null, msg["file list"], msg["file list"]);
        });
        c.publishFrom = function(publish) {
            c.publishProgress = true;
            formsService.publish(c.id, c.name, publish).then(function(data) {
                c.publishProgress = false;
                c.url = data.url;
                c.publish = data.publish;
            });
        };
        c.controlProperty = function(item) {
            if (!item) return {
                showUniqueProp: false,
                "default": false,
                require: false
            };
            return _.find(c.items, {
                type: item.type
            });
        };
        c.sortableOptions = {
            "ui-floating": true
        };
        c.compConf = {
            sort: false,
            group: {
                name: "form",
                pull: "clone",
                put: false
            },
            animation: 150,
            onEnd: function(ev) {
                ev.model.name = c.pages.naming.getName();
                ev.model.columnName = ev.model.name;
                ev.model.canView = true;
                ev.model.canEdit = true;
            }
        };
        c.checkColumnName = function(cntl, last) {
            var exist = false;
            runOnAllControll(c.pages.data, function(cl) {
                if (cl.name !== cntl.name && cl.columnName === cntl.columnName) {
                    exist = true;
                    return true;
                }
            });
            if (exist) {
                $translate("duplicate name").then(function(t) {
                    alert(t);
                });
                cntl.columnName = last;
                return;
            }
            if (currentTableColumns.indexOf(cntl.columnName) != -1) {
                cntl.columnName = last;
                $translate("duplicate name").then(function(t) {
                    alert(t);
                });
            }
        };
        c.drags = c.items.map(function(d) {
            return [ d ];
        });
        var dangerChangeOccured = false;
        c.draggableOptions = {
            connectWith: ".drop-target",
            placeholder: "form-control-highlight",
            helper: "clone",
            stop: function(e, ui) {
                if (ui.item.sortable.source.hasClass("draggable-element") && ui.item.sortable.droptarget && ui.item.sortable.droptarget != ui.item.sortable.source && ui.item.sortable.droptarget.hasClass("drop-target")) {
                    var item = ui.item.sortable.droptargetModel[ui.item.sortable.dropindex];
                    item = _.merge({}, item);
                    item.name = c.pages.naming.getName();
                    item.columnClass = item.columnClass || "twelve";
                    item.formLookup = _.extend({}, ui.item.sortable.model.formLookup);
                    item.dropdown = _.extend({}, ui.item.sortable.model.dropdown);
                    item.canView = true;
                    item.canEdit = true;
                    var ext = JSON.parse(JSON.stringify(ui.item.sortable.model));
                    ui.item.sortable.sourceModel.push(ext);
                }
            }
        };
        c.control = controlPropertyService.get();
        c.formLookupSourceFields = [];
        $scope.$watch("c.control.active.formLookup", function(fl) {
            if (!fl || !fl.form) return;
            getFormLookupFields(fl, formsService);
        });
        c.pages = {
            data: [],
            add: function(index) {
                var page = {
                    name: app.lang.translate("page") + " " + (c.pages.data.length + 1),
                    type: 0,
                    controls: [],
                    rowValidation: {
                        uniqueMultiField: false,
                        uniques: []
                    },
                    size: "tiny"
                };
                c.pages.data.push(page);
                c.pages.setActive(page);
            },
            removeControl: function(i, control) {
                var t = app.lang.translate("delete control message");
                var f = confirm(t);
                if (f) {
                    dangerChangeOccured = true;
                    c.pages.activePage.controls.splice(i, 1);
                }
            },
            copy: function(i, control) {
                dangerChangeOccured = true;
                var clone = _.extend({}, control);
                c.pages.activePage.controls.splice(i, 0, clone);
            },
            remove: function(index) {
                if (!c.pages) return;
                var f = true;
                if (c.pages.data[index].controls.length) f = confirm("delete page message");
                if (f) {
                    if (c.pages.data[index].controls.length) dangerChangeOccured = true;
                    var removed = c.pages.data.splice(index, 1);
                    if (removed[0] === c.pages.activePage) {
                        c.pages.setActive();
                    }
                }
            },
            setActive: function(page) {
                _.each(c.pages.data, function(p) {
                    p.active = false;
                });
                if (!page && c.pages.data.length) {
                    page = c.pages.data[0];
                }
                c.pages.activePage = page;
                c.pages.activePage.active = true;
                if (c.control.active) {
                    c.control.active.isActive = false;
                    c.control.active = null;
                }
            },
            getControlForRowValidation: function() {
                var cnts = c.pages.activePage.controls;
                return cnts;
            },
            naming: {
                getName: function() {
                    return "field-" + c.pages.naming.getMaxId();
                },
                exist: function(name) {
                    if (name == "_id") return true;
                    var flag = false;
                    _.each(c.pages.data, function(page) {
                        _.each(page.controls, function(cnt) {
                            var id = cnt.name || "";
                            if (id == name) {
                                flag = true;
                                return false;
                            }
                        });
                    });
                    return flag;
                },
                getMaxId: function() {
                    c.maxFieldNumber = +c.maxFieldNumber || 0;
                    c.maxFieldNumber++;
                    return c.maxFieldNumber;
                }
            }
        };
        c.controlList = [];
        $scope.$watch("c.pages", function() {
            c.controlList = [];
            runOnAllControll(c.pages.data, function(cnt) {
                if (cnt.type != 13) {
                    c.controlList.push(cnt);
                }
            });
        }, true);
        c.saveProgress = false;
        c.save = function() {
            var flag = false;
            if (dangerChangeOccured) {
                flag = confirm("edit form message‌");
            } else {
                flag = true;
            }
            if (flag) {
                dangerChangeOccured = false;
                c.saveProgress = true;
                formsService.save(c.id, {
                    pages: c.pages.data,
                    name: c.name,
                    maxFieldNumber: c.maxFieldNumber,
                    triggers: c.triggers,
                    showSubmitedInfo: c.showSubmitedInfo
                }).then(function onSave(id) {
                    c.saveProgress = false;
                    c.id = id;
                    location.replace(app.hashUrlPrefix + "#/forms/" + id);
                    setCurrentTableColumns();
                    var toast = $mdToast.simple().textContent(app.lang.translate("saving successfully"));
                    $mdToast.show(toast);
                }, function onError(res) {
                    c.saveProgress = false;
                    var msg = app.lang.translate("error in saving");
                    if (res.data.desc) {
                        msg = res.data.desc;
                    }
                    showErrorToast(msg, $mdToast);
                });
            }
        };
        if (!isEdit) {
            c.name = app.lang.translate("new form");
            c.showSubmitedInfo = true;
            c.pages.add();
        }
        var currentTableColumns = [];
        function setCurrentTableColumns() {
            currentTableColumns = [];
            runOnAllControll(c.pages.data, function(cl) {
                currentTableColumns.push(cl.columnName);
            });
        }
        if (isEdit) {
            formsService.get(c.id, true).then(function(data) {
                c.pages.data = data.model.pages;
                c.name = data.model.name;
                c.showSubmitedInfo = data.model.showSubmitedInfo;
                c.triggers = data.model.triggers;
                c.url = data.url;
                c.publish = data.publish;
                c.maxFieldNumber = data.model.maxFieldNumber;
                c.pages.setActive();
                setCurrentTableColumns();
                runOnAllControll(c.pages.data, function(cnt) {
                    if (cnt.dropdown && cnt.dropdown.items) {
                        cnt.dropdown.itemsTemp = cnt.dropdown.items.map(function(d) {
                            return d.label;
                        }).join("\n");
                    }
                });
            });
        }
        c.getSiblingControl = function(name) {
            var row = {};
            runOnAllControll(c.pages.data, function(cnt, parentRow) {
                if (name === cnt.name) {
                    row.row = parentRow;
                    row.index = _.findIndex(parentRow, {
                        name: name
                    });
                }
            });
            return row;
        };
        $scope.$watch("c.control.active", function(n) {
            if (n && n.name) {
                c.activeSibling = c.getSiblingControl(n.name);
                c.activeSibling.rootControls = [];
                _.each(c.pages.data, function(page) {
                    _.each(page.controls, function(cont) {
                        c.activeSibling.rootControls.push(cont);
                    });
                });
            }
        });
    } ]);
    ngApp.directive("formControl", [ "$compile", function($compile) {
        return {
            restrict: "E",
            replace: true,
            transclude: true,
            scope: {
                model: "=ngModel",
                settingsClick: "&?",
                remove: "&?",
                id: "@",
                edit: "@",
                settings: "=?",
                copy: "&?",
                sdSubmit: "&"
            },
            controller: [ "$scope", "$translate", "$timeout", "$http", "taskExecutor", function($scope, $translate, $timeout, $http, taskExecutor) {
                $scope._ = _;
                $scope.randomId = Math.floor(Math.random() * 1e5) + 1;
                $scope.model.randomId = $scope.randomId;
                $scope.$watch("model.value", function(n) {
                    if (n == null) {
                        $(".form-" + $scope.randomId + " .dropdown").dropdown("clear");
                    }
                });
                $scope.simpleDropdownsettings = {
                    message: {
                        noResults: app.lang.translate("No results found.")
                    },
                    fullTextSearch: true,
                    forceSelection: false
                };
                $scope.$watch("model.dropdown.listValue", function(n) {
                    if (n == null) {
                        $(".form-" + $scope.randomId + " .dropdown").dropdown("clear");
                    }
                });
                if ($scope.model.dropdown && $scope.model.dropdown.multiSelectDropdown && $scope.model.dropdown.useRemoteData) {
                    $scope.model.items = $scope.model.dropdown.listValue;
                }
                $scope.initDropdown = function($dropdown) {
                    if ($scope.model.dropdown && $scope.model.dropdown.multiSelectDropdown && $scope.model.dropdown.useRemoteData) {
                        $timeout(function() {
                            $($dropdown).dropdown("set selected", $scope.model.dropdown.listValue);
                        }, 100);
                    }
                };
                $scope.buttonClick = function() {
                    if ($scope.edit) return;
                    _.each($scope.model.button.tasks, function(t) {
                        taskExecutor.exec(t, $scope.$parent.$parent.$parent.data);
                    });
                };
                $scope.getFilteredDropdonItems = function(value, index, array) {
                    if (!$scope.model.useFilter || !$scope.model.filters) return false;
                    var flag = false;
                    _.each($scope.model.filters, function(filter) {
                        if (!filter || !filter.staticValue || !value || !value.value) return false;
                        if (filter.type == 1) {
                            flag = filter.staticValue.trim().indexOf(value.value.trim()) != -1 || value.value.trim().indexOf(filter.staticValue.trim()) != -1;
                            return false;
                        }
                    });
                    return flag;
                };
                if ($scope.model.type === 12) {
                    $scope.model.formDialogInfo = {
                        formInfo: {
                            form: $scope.model.formLookup.form
                        },
                        showModal: false
                    };
                    $scope.showFormInModal = function() {
                        $scope.model.formDialogInfo.showModalFunc();
                    };
                }
                $scope.keyup = function(e) {
                    if (!e) return;
                    if (e.ctrlKey && e.keyCode == 13) {
                        $scope.sdSubmit();
                    }
                };
            } ],
            templateUrl: app.urlPrefix + "dist/partial/forms/editor/form-generator-control.directive.html?v=" + app.version
        };
    } ]);
    ngApp.directive("multiRowForm", [ "$compile", function($compile) {
        return {
            restrict: "E",
            replace: true,
            transclude: true,
            scope: {
                model: "=ngModel",
                settings: "=?",
                id: "@",
                edit: "@"
            },
            controller: [ "$scope", "$http", "formsService", "controlPropertyService", "$timeout", function(scope, $http, formsService, controlPropertyService, $timeout) {
                scope.model = scope.model || {};
                scope.firstRow = scope.model.multiRowForm.rows[0];
                scope.$watch("firstRow", function() {
                    _.each(scope.firstRow, function(cnt) {
                        cnt.childOfMultiRow = true;
                    });
                }, true);
                scope.sortableOptions = {
                    placeholder: "form-control-highlight",
                    handle: ".drag-handle"
                };
                scope.control = controlPropertyService.get();
                scope.setProp = function(c) {
                    scope.control.setActive(c);
                };
                scope.remove = function(c, index) {
                    var f = confirm(app.lang.translate("delete control message"));
                    if (f) {
                        scope.model.multiRowForm.rows[0].splice(index, 1);
                    }
                };
                var autoIncMap = {};
                scope.addRow = function() {
                    if (scope.edit) return;
                    var a = [];
                    _.each(scope.model.multiRowForm.rows[0], function(item) {
                        var nItem = JSON.parse(JSON.stringify(item));
                        nItem.rowId = 0;
                        if (nItem && nItem.type == 2 && nItem.validations && nItem.validations.autoIncrement) {
                            autoIncMap[nItem.name] = (autoIncMap[nItem.name] || +nItem.value) + 1;
                            nItem.value = autoIncMap[nItem.name];
                            return;
                        }
                        nItem.value = null;
                        if (nItem.dropdown) nItem.dropdown.listValue = null;
                        a.push(nItem);
                    });
                    scope.model.multiRowForm.rows.push(a);
                };
                scope.removeRow = function(row, i) {
                    var r = row.splice(i, 1);
                    scope.model.multiRowForm.deletedIds = scope.model.multiRowForm.deletedIds || [];
                    scope.model.multiRowForm.deletedIds.push(r[0][0].rowId);
                };
            } ],
            template: '<div class="ui form field" ng-class="model.multiRowForm.controlSize">                            <div class="ui secondary pointing tiny menu">                                <div class="active item">{{model.label}} </div>                                <div class="ui right item" ng-hide="model.readonly">                                    <div class="pointer" ng-click="addRow()">{{model.multiRowForm.addKeyText}}<i class="icon plus square outline large"></i></div>                                </div>                            </div>                                <div ng-hide="model.multiRowForm.rows[0].length || !edit" class="gray center aligned twelve wide column"><small>{{\'drag control here\' | translate}}</small></div>                            <div class="ui grid content-form multi-row-container" >                            </div>                       </div>',
            link: function(scope, element, attributes) {
                function columnClass() {
                    scope.model.multiRowForm.columns = scope.model.multiRowForm.columns || 3;
                    var column = scope.model.multiRowForm.columns == 1 ? "one" : scope.model.multiRowForm.columns == 2 ? "two" : scope.model.multiRowForm.columns == 3 ? "three" : scope.model.multiRowForm.columns == 4 ? "four" : scope.model.multiRowForm.columns == 5 ? "five" : scope.model.multiRowForm.columns == 6 ? "six" : "eight";
                    return column;
                }
                scope.$watch("model.multiRowForm.columns", function(newValue, oldValue) {
                    refresh();
                });
                function refresh() {
                    var controls;
                    if (scope.edit) {
                        controls = angular.element('<div class="drop-target doubling ' + columnClass() + ' column row {{model.multiRowForm.separator? \'separator\':\'\'}}" xui-sortable="sortableOptions"  xng-model="model.multiRowForm.rows[0]"                                                         ng-sortable="{group: {name: \'form\', pull:true, put:true}, animation:150}" style="min-height:100px;">                                                                                                        <div class="column"                                                              ng-repeat="component in model.multiRowForm.rows[0] track by $index"                                                             ng-click="setProp(component);$event.stopPropagation();">                                                                <form-control ng-class="{active: component.isActive}" class="column" remove="remove(component, $index)" edit="true" ng-model="component" id="{{id}}" settings="{fromMultiRow:true}"></form-control>                                                    </div>                                                </div>');
                    } else {
                        controls = angular.element('<div ng-repeat="row in model.multiRowForm.rows" class="doubling ' + columnClass() + ' column row no-padding {{model.multiRowForm.separator? \'separator\':\'\'}}">                                                    <div class="column no-padding"                                                          ng-repeat="component in row track by $index">                                                            <div class="ui grid" ng-if="!edit && model.multiRowForm.rows.length > 1 && $last" style="margin:0;">                                                                <form-control class="ten wide column field" remove="remove(component, $index)" ng-model="component" id="{{id}}"  settings="{showLabel:$parent.$parent.$index == 0, fromMultiRow:true}"></form-control>                                                                <div class="two wide column field" ng-hide="model.readonly" >                                                                    <label ng-show="$parent.$parent.$index == 0">&nbsp;</label>                                                                    <div class="ui icon mini xbutton pointer gray" ng-click="removeRow(model.multiRowForm.rows, $parent.$parent.$index)"><i class="icon remove"></i></div>                                                                </div>                                                            </div>                                                            <form-control ng-if="edit || model.multiRowForm.rows.length == 1 || !$last" class="column" remove="remove(component, $index)" ng-model="component" id="{{id}}" settings="{showLabel:$parent.$parent.$index == 0, fromMultiRow:true}"></form-control>                                                    </div>                                                </div>');
                    }
                    $compile(controls)(scope);
                    angular.element(element[0].querySelector(".content-form")).html(controls);
                }
            }
        };
    } ]);
    ngApp.directive("newFormModal", [ "$compile", "$timeout", function($compile, $timeout) {
        return {
            restrict: "E",
            replace: true,
            transclude: true,
            scope: {
                model: "=ngModel",
                show: "=?"
            },
            template: '<div>                            <div class="xcontent" ></div>                       </div>',
            link: function(scope, element, attributes) {
                scope.hideModal = function(data) {
                    scope.model.showModal = false;
                    $(".id" + scope.id).modal("hide");
                };
                scope.saveFinish = function(data) {
                    debugger;
                };
                scope.option = {
                    showCancel: true,
                    allowMultiple: true,
                    autofocus: false
                };
                scope.formSettings = {
                    modal: true
                };
                function showModal() {
                    if (!scope.id) {
                        scope.id = Math.floor(Math.random() * 999999) + 1e6;
                        $($(element).find(".modal")[0]).addClass("id" + scope.id);
                    }
                    scope.modal = $(".id" + scope.id).modal(scope.option);
                    if ($(".ui.modal.active").length > 0) {
                        $(".id" + scope.id + ".modal").css("position", "fixed");
                        $(".id" + scope.id).modal("show");
                    } else {
                        $(".id" + scope.id + ".modal").css("position", "initial");
                        $(".id" + scope.id).modal("show");
                    }
                }
                scope.model.showModalFunc = showModal;
                function compile() {
                    var controls = angular.element('<div xng-if="openFormTask" sadaf-form id="{{model.formInfo.form}}" on-finish="hideModal()" on-save="saveFinish(data)" option="{showCancel:true}" settings="formSettings" on-cancel="hideModal()"></div>                                                    </div>');
                    $compile(controls)(scope);
                    angular.element(element[0].querySelector(".xcontent")).html(controls);
                }
                compile();
            }
        };
    } ]);
    ngApp.directive("formLookupProperty", function() {
        return {
            restrict: "E",
            replace: true,
            transclude: true,
            scope: {
                model: "=ngModel",
                settings: "=?"
            },
            controller: [ "$scope", "$http", "formsService", function(scope, $http, formsService) {
                scope.model = scope.model || {};
                scope.settings = angular.merge({
                    selectableColumns: true
                }, scope.settings || {});
                formsService.get().then(function(data) {
                    scope.forms = data;
                });
                scope.$watch("model.form", function(n) {
                    if (n == -1) {
                        scope.model.form = scope.forms[0].id;
                    }
                    if (!n) return;
                    formsService.get(n).then(function(data) {
                        scope.formControls = [];
                        _.each(data.model.pages, function(page) {
                            _.each(page.controls, function(cnt) {
                                scope.formControls.push(cnt);
                            });
                        });
                        if (scope.model.keyControls) {
                            var validKeys = _.map(scope.formControls, "columnName");
                            scope.model.keyControls = _.intersection(validKeys, scope.model.keyControls);
                        }
                    });
                });
            } ],
            template: ' <div class="field">                        <div class="field">                            <label>{{\'select form\' | translate}}</label>                            <sm-dropdown class="selection search fluid"  settings="{fullTextSearch: true, forceSelection: false}" model="model.form" items="forms" label="item.name" value="item.id" ></sm-dropdown>                        </div>                        <div class="field" ng-show=settings.selectableColumns>                            <label>{{\'key columns\' | translate}}</label>                            <sm-dropdown class="selection search multiple fluid" settings="{fullTextSearch: true, forceSelection: false}" model="model.keyControls" items="formControls" label="item.label" value="item.name" ></sm-dropdown>                        </div>                    </div>',
            link: function(scope, element, attributes) {}
        };
    });
    ngApp.directive("formLookupGetId", function() {
        return {
            restrict: "E",
            replace: true,
            transclude: true,
            scope: {
                model: "=ngModel",
                id: "@"
            },
            controller: [ "$scope", "$http", "formsService", "$timeout", function($scope, $http, formsService, $timeout) {
                $scope.model.formLookup = $scope.model.formLookup || {};
                var dropdownSettings = function(name) {
                    return {
                        apiSettings: {
                            url: app.urlPrefix + "api/forms/getFormColumnData",
                            cache: false,
                            method: "get",
                            dataType: "json",
                            beforeSend: function(s) {
                                s.data = {
                                    id: $scope.model.formLookup.form,
                                    name: name,
                                    query: s.urlData.query,
                                    others: $scope.keys.map(function(k) {
                                        return {
                                            label: k.name,
                                            value: k.value
                                        };
                                    }),
                                    filters: $scope.model.useFilter ? $scope.model.filters : []
                                };
                                return s;
                            },
                            onResponse: function(res) {
                                res.fields = res.fields.map(function(d) {
                                    return {
                                        value: d.value,
                                        label: d.label
                                    };
                                });
                                return res;
                            }
                        },
                        message: {
                            noResults: app.lang.translate("No results found.")
                        },
                        fields: {
                            remoteValues: "fields",
                            name: "label",
                            value: "value"
                        },
                        saveRemoteData: false,
                        fullTextSearch: true,
                        forceSelection: false
                    };
                };
                function calcKeys() {
                    $scope.model.formLookup.keyControls = $scope.model.formLookup.keyControls || [];
                    $scope.keys = $scope.model.formLookup.keyControls.map(function(d) {
                        var t = {
                            name: d,
                            dropdownSettings: dropdownSettings(d),
                            change: function(val) {
                                if (t.value === val) return;
                                t.value = val;
                                getIds();
                            },
                            defaultText: $scope.model.label
                        };
                        return t;
                    });
                }
                function bindValue() {
                    if ($scope.model.formLookup.keyControlsBindedValue && $scope.keys) {
                        for (var i = 0; i < $scope.model.formLookup.keyControlsBindedValue.length; i++) {
                            var v = $scope.model.formLookup.keyControlsBindedValue[i];
                            if ($scope.model.value != null) {
                                $scope.keys[i].defaultText = v;
                                $scope.keys[i].boldText = true;
                            }
                        }
                    }
                }
                function updateFilter() {
                    if ($scope.model.useFilter && $scope.model.filters.length) {
                        _.map($scope.model.filters, function(filter) {});
                    }
                }
                $scope.$watch("model.formLookup.keyControlsBindedValue", function(n) {
                    bindValue();
                }, true);
                $scope.$watch("model.filters", function(n) {
                    updateFilter();
                }, true);
                $scope.$watch("model.formLookup.keyControls", function(n) {
                    calcKeys();
                    bindValue();
                }, true);
                function clear() {
                    $(".form-" + $scope.model.randomId + " .dropdown").dropdown("clear");
                }
                var init = false;
                var needClear = false;
                $scope.$watch("model.value", function(v) {
                    var t = $scope.model;
                    if (v == null) {
                        needClear = true;
                        clear();
                    }
                });
                $scope.init = function(e) {
                    init = true;
                    if (needClear) {
                        clear();
                    }
                };
                $scope.model.isValid = true;
                function getIds() {
                    var vals = $scope.keys.map(function(k) {
                        return {
                            label: k.name,
                            value: k.value
                        };
                    });
                    $scope.model.formLookup.selected = _.map(vals, function(d) {
                        return d.value;
                    });
                    var someNull = _.some(vals, function(d) {
                        return _.isUndefined(d.value) || d.value == null;
                    });
                    if (someNull) return;
                    if ($scope.model.filters && $scope.model.filters.length) {
                        vals = vals || [];
                        var filter1 = $scope.model.filters.map(function(k) {
                            return {
                                label: k.sourceField,
                                value: k.type == 2 ? k.controlValue : k.staticValue
                            };
                        });
                        vals = vals.concat(filter1);
                    }
                    $scope.model.isValid = false;
                    $http.post(app.urlPrefix + "api/forms/getFormLookupIds/" + $scope.model.formLookup.form, vals).then(function(d) {
                        $scope.model.isValid = true;
                        if (_.isArray(d.data) && d.data.length) {
                            $scope.model.value = d.data[0];
                        }
                    });
                }
            } ],
            template: ' <div class="">                        <div class="xfield" ng-repeat="f in keys">                            <sm-dropdown settings="f.dropdownSettings" on-init="init"ng-class="{\'bold-text\':f.boldText}" class="selection search {{f.name}} fluid" label="item.label" on-change="f.change" value="item.value" default-text="f.defaultText" ></sm-dropdown>                        </div>                    </div>'
        };
    });
    ngApp.directive("selectMenu", function() {
        return {
            restrict: "E",
            replace: true,
            transclude: true,
            scope: {
                model: "=ngModel",
                multiple: "@?"
            },
            controller: [ "$scope", "$http", "$timeout", function($scope, $http, $timeout) {
                $http.get(app.urlPrefix + "api/menus/get").then(function(res) {
                    $scope.menus = res.data;
                });
            } ],
            template: '<div><sm-dropdown style="width:100%;"items="menus" model="model" class="selection search {{multiple}}" settings="{forceSelection: false}" label="item.name" value="item.id" ></sm-dropdown></div>'
        };
    });
    ngApp.directive("selectDatasourceColumns", function() {
        return {
            restrict: "E",
            replace: true,
            transclude: true,
            scope: {
                model: "=ngModel"
            },
            controller: [ "$scope", "$http", "datasources", function(scope, $http, datasources) {
                scope.select = function() {
                    datasources.select(null, {
                        type: [ "datasources" ]
                    }).then(function(res) {
                        if (res.selected && res.selected.length) {
                            scope.model.remoteDatasource = {
                                value: res.selected[0].id,
                                label: res.selected[0].name
                            };
                            getColumn();
                            scope.model.remoteColumnKey = null;
                            scope.model.remoteColumnLabel = null;
                        }
                    });
                };
                scope.model = scope.model || {};
                function getColumn() {
                    datasources.getColumns(scope.model.remoteDatasource.value).then(function(data) {
                        scope.model.datasourceColumns = data.CubeInfo.Dimensions[0].Hierarchies;
                        scope.model.userProperties = data.UsersProperty;
                    });
                }
                scope.$watch("model", function(n) {
                    if (n) {
                        getColumn();
                    }
                });
            } ],
            template: ' <div class="ui form">                        <div class="field">                            <label>{{\'انتخاب منبع داده\'| translate}}</label>                            <button class="ui tiny button" ng-click="select()">                                <span ng-show="!model.remoteDatasource">{{\'select\'| translate}}</span>                                <span ng-show="model.remoteDatasource">{{model.remoteDatasource.label}}</span>                            </button>                        </div>                        <div class="field" ng-show="model.datasourceColumns">                            <label>{{\'value column\'| translate}}</label>                            <sm-dropdown class="selection search fluid" settings="{fullTextSearch: true}" model="model.remoteColumnKey" items="model.datasourceColumns" label="item.Name" value="item.Name" ></sm-dropdown>                        </div>                        <div class="field" ng-show="model.datasourceColumns">                            <label>{{\'label column\'| translate}}</label>                            <sm-dropdown class="selection search fluid" settings="{fullTextSearch: true}" model="model.remoteColumnLabel" items="model.datasourceColumns" label="item.Name" value="item.Name" ></sm-dropdown>                        </div>                    </div>',
            link: function(scope, element, attributes) {}
        };
    });
    ngApp.controller("fromsCtrl", [ "$scope", "$http", "$sce", "$timeout", "$mdToast", "$routeParams", "formsService", "$mdDialog", "utils", "$translate", function($scope, $http, $sce, $timeout, $mdToast, $routeParams, formsService, $mdDialog, utils, $translate) {
        var c = this;
        c.progress = true;
        c.app = app;
        c.utils = utils;
        formsService.get().then(function(data) {
            c.progress = false;
            c.data = data;
            c.formsModule = formsService.getFormsModule();
            c.securityCertPatch = formsService.securityCertPatch();
        });
        c.delete = function(ev, row, i) {
            $translate([ "remove", "remove_form_desc", "cancel" ]).then(function(msg) {
                var confirm = $mdDialog.confirm().title(msg["remove"]).textContent(msg["remove_form_desc"] + " " + row.name).ariaLabel(msg["remove"]).targetEvent(ev).ok(msg["remove"]).cancel(msg["cancel"]);
                $mdDialog.show(confirm).then(function() {
                    formsService.remove(row.id).then(function(res) {
                        var d = c.data.splice(i, 1);
                        var toast = $mdToast.simple().textContent("فرم " + d[0].name + " با موفقیت حذف شد");
                        $mdToast.show(toast);
                    });
                });
            });
        };
    } ]);
    ngApp.directive("sadafDropdwon", [ "$compile", "$timeout", function($compile, $timeout) {
        return {
            restrict: "E",
            replace: true,
            transclude: true,
            scope: {
                model: "=ngModel",
                formId: "@",
                edit: "@?"
            },
            controller: [ "$scope", "$http", "formsService", "controlPropertyService", function(scope, $http, formsService, controlPropertyService) {} ],
            template: "<div></div>",
            link: function($scope, element, attributes) {
                var isMulti = $(element).hasClass("multiple");
                var opts = isMulti ? $scope.model.dropdown.listValue || [] : [ $scope.model.value || "" ];
                var select = '<select class="temporal ui fluid ' + (isMulti ? "multiple" : "") + ' search selection dropdown" ' + (isMulti ? "multiple" : "") + " >";
                for (var i = 0; i < opts.length; i++) select += '  <option value="' + opts[i] + '">' + opts[i] + "</option>";
                select += "</select>";
                select = $(select);
                var lastT;
                function updateValue() {
                    clearTimeout(lastT);
                    lastT = setTimeout(function() {
                        var value = $(".form-" + $scope.model.randomId + " .ui.dropdown").dropdown("get value");
                        var texts = _.map($(".form-" + $scope.model.randomId + " .ui.dropdown").dropdown("get item"), function(e) {
                            return $(e).text();
                        });
                        if (!_.isArray(value)) value = [ value ];
                        value = _.filter(value, null);
                        $timeout(function() {
                            $scope.model.dropdown.listValue = value;
                            $scope.model.dropdown.selected = texts;
                        }, 0);
                    }, 200);
                }
                var dropdownSettings = {
                    onChange: function(value, text, $selectedItem) {
                        if (!isMulti) {
                            $timeout(function() {
                                $scope.model.dropdown.selected = [ text ];
                                $scope.model.value = value;
                            }, 0);
                        }
                    },
                    onRemove: function(removedValue, removedText, $removedChoice) {
                        updateValue();
                    },
                    onAdd: function(addedValue, addedText, $addedChoice) {
                        updateValue();
                    },
                    apiSettings: {
                        url: app.urlPrefix + "api/forms/getdropdowndata",
                        cache: false,
                        method: "get",
                        dataType: "json",
                        beforeSend: function(s) {
                            s.data = {
                                id: $scope.formId,
                                name: $scope.model.name,
                                query: s.urlData.query,
                                filters: $scope.model.useFilter ? $scope.model.filters : []
                            };
                            if ($scope.edit) {
                                s.data = {
                                    datasourceId: $scope.model.dropdown.remoteDatasource.value,
                                    remoteColumnKey: $scope.model.dropdown.remoteColumnKey,
                                    remoteColumnLabel: $scope.model.dropdown.remoteColumnLabel,
                                    query: s.urlData.query
                                };
                            }
                            return s;
                        },
                        onResponse: function(res) {
                            res.fields = res.fields.map(function(d) {
                                return {
                                    value: d.value.entitize(),
                                    label: d.label.entitize()
                                };
                            });
                            return res;
                        }
                    },
                    message: {
                        noResults: app.lang.translate("No results found.")
                    },
                    fields: {
                        remoteValues: "fields",
                        name: "label",
                        value: "value"
                    },
                    saveRemoteData: false,
                    fullTextSearch: true,
                    forceSelection: false
                };
                $(element).append(select);
                $(select).dropdown(dropdownSettings);
                if ($scope.model.dropdown.listValue) {
                    var v = $scope.model.dropdown.multiSelectDropdown ? $scope.model.dropdown.listValue : $scope.model.value;
                    if (v != null) $(select).dropdown("set selected", v);
                }
            }
        };
    } ]);
    ngApp.directive("controlSize", [ "$compile", "$timeout", function($compile, $timeout) {
        return {
            restrict: "E",
            transclude: true,
            scope: {
                model: "=ngModel"
            },
            template: "<sm-dropdown items=\"[{label:('خیلی کوچک' | translate), value:'mini'}, {label:('کوچک' | translate), value:'tiny'}, {label:('normal' | translate), value:''}]\" model=\"model\" label=\"item.label\" value=\"item.value\"></sm-dropdown> "
        };
    } ]);
    ngApp.filter("formatNumber", function() {
        return function(s, format) {
            var f = format;
            if (isNaN(s)) return s;
            return f ? d3.format(f)(s) : s;
        };
    });
    ngApp.filter("persian", function() {
        return function(s) {
            if (app.lang && +app.lang.langType == 0) {
                return persian(s, true);
            }
            return s;
        };
    });
    ngApp.directive("sadafCheckbox", [ "$compile", "$timeout", function($compile, $timeout) {
        return {
            restrict: "E",
            transclude: true,
            replace: true,
            scope: {
                model: "=ngModel",
                change: "&?ngChange"
            },
            template: '<div class="ui checkbox"><input type="checkbox" ng-model="model" /><label ng-transclude></label></div>',
            link: function(scope, element, attr) {
                if (scope.model === true || scope.model && scope.model.match(/(true)/gi)) scope.model = true; else scope.model = false;
                $(element).checkbox({
                    onChange: function(d, u) {
                        $timeout(function() {
                            scope.model = $(element).find("input").is(":checked");
                            if (scope.change) scope.change();
                        });
                    }
                });
            }
        };
    } ]);
    ngApp.directive("filterProperty", [ "$compile", "$timeout", function($compile, $timeout) {
        return {
            restrict: "E",
            transclude: true,
            replace: true,
            scope: {
                model: "=ngModel",
                controls: "=",
                sourceFields: "=?",
                name: "=?",
                justValue: "@?"
            },
            controller: [ "$scope", function(scope) {
                scope.justValue = JSON.parse(scope.justValue || "false");
                var empty = {
                    type: 2
                };
                scope.add = function() {
                    scope.model.push(_.extend({}, empty));
                };
                scope.$watch("model", function(m) {
                    if (!m) {
                        scope.model = scope.model || [ empty ];
                    }
                });
                scope.$watch("sourceFields", function(m) {
                    if (m && scope.justValue) {
                        _.each(m, function(item) {
                            item.label = item.Name;
                            item.name = item.UniqueName;
                        });
                    }
                });
                scope.$watch("controls", function(m) {
                    if (!m) return;
                    scope.cnts = [];
                    scope.cnts = scope.cnts.concat(m.row);
                    scope.cnts = scope.cnts.concat(m.rootControls);
                    var filter = scope.justValue ? {
                        type: 4
                    } : {
                        type: 12
                    };
                    scope.cnts = _.filter(scope.cnts, filter);
                    scope.cnts = _.filter(scope.cnts, function(d) {
                        return d.name !== scope.name;
                    });
                    scope.cnts = _.uniqBy(scope.cnts, "name");
                });
            } ],
            template: '<div class="inner-section">                          <div class="field" ng-repeat="f in model track by $index">                            <div class="inline fields" >                                <label class="three wide field">{{\'type\' | translate}}</label>                                <div class="six wide field" >                                    <sm-dropdown model="f.type" class="" settings="{fullTextSearch: true, forceSelection: false}" items="[{type: 1, name:(\'fix value\' | translate)},{type: 2, name:(\'control value\' | translate)}]" label="item.name" value="item.type"></sm-dropdown>                                </div>                                <div class="three wide field">                                    <i class="gray pointer icon plus" ng-click="add()"></i>                                    <i class="gray pointer icon delete" ng-click="model.splice($index, 1)" ng-hide="model.length==1"></i>                                </div>                            </div>                            <div class="inline fields" ng-show="f.type == 1">                                <label class="three wide field">{{\'value\' | translate}}</label>                                <input ng-model="f.staticValue" />                            </div>                                                        <small ng-show="f.type == 2">{{\'control base filter desc\' | translate}}</small>                            <div class="field" >                                <div class="inline fields" ng-show="f.type == 2">                                    <label class="three wide field">{{\'control\' | translate}}</label>                                    <sm-dropdown model="f.control" class="selection fluid" settings="{fullTextSearch: true, forceSelection: false}" items="cnts" label="item.label" value="item.name"></sm-dropdown>                                </div>                            </div>                                                        <small ng-show="f.type == 2">{{\'control base filter desc 2\' | translate}}</small>                            <div class="inline fields" ng-show="sourceFields" ng-show="f.type == 2">                                <label class="three wide field">{{\'column\' | translate}}</label>                                <sm-dropdown model="f.sourceField" class="selection fluid" settings="{fullTextSearch: true, forceSelection: false}" items="sourceFields" label="item.label" value="item.name"></sm-dropdown>                            </div>                        </div>                   </div>',
            link: function(scope, element, attr) {}
        };
    } ]);
    ngApp.directive("tableLookup", [ "$compile", "$timeout", "formsService", function($compile, $timeout, formsService) {
        return {
            restrict: "E",
            transclude: true,
            replace: true,
            scope: {
                model: "=ngModel",
                controls: "="
            },
            controller: [ "$scope", function(scope) {
                scope.$watch("model", function(m) {
                    if (!m) {
                        scope.model = scope.model || {};
                    }
                });
                scope.$watch("controls", function(m) {
                    if (!m) return;
                    scope.cnts = [];
                    scope.cnts = scope.cnts.concat(m.row);
                    scope.cnts = scope.cnts.concat(m.rootControls);
                    scope.cnts = _.filter(scope.cnts, function(d) {
                        return d.type == 12;
                    });
                    scope.cnts = _.filter(scope.cnts, function(d) {
                        return d.name != scope.name;
                    });
                    scope.cnts = _.uniqBy(scope.cnts, "name");
                });
                scope.$watch("model.controlName", function(n, o) {
                    if (!n) return;
                    var f = _.find(scope.cnts, {
                        name: n
                    });
                    scope.model.lookupField = f.formLookup.keyControls[0];
                    scope.model.id = f.formLookup.form;
                    scope.model.type = "form";
                    getFormLookupFields(f.formLookup, formsService, function() {
                        scope.fields = f.formLookup.formLookupSourceFields;
                    });
                });
            } ],
            template: '<div class="">                          <div class="field">                            <small>{{\'extra info desc\' | translate}}</small>                            <div class="inline fields">                                <label class="three wide field">{{\'control\' | translate}}</label>                                <sm-dropdown model="model.controlName" class="selection fluid" settings="{fullTextSearch: true, forceSelection: false}" items="cnts" label="item.label" value="item.name"></sm-dropdown>                            </div>                            <div class="inline fields">                                <label class="three wide field">{{\'column\' | translate}}</label>                                <sm-dropdown model="model.resultField" class="selection fluid" settings="{fullTextSearch: true, forceSelection: false}" items="fields" label="item.label" value="item.name"></sm-dropdown>                            </div>                        </div>                   </div>',
            link: function(scope, element, attr) {}
        };
    } ]);
    ngApp.directive("sadafDraggable", [ "$timeout", function($timeout) {
        return function(scope, element, attr) {
            function setup() {
                $("[sadaf-draggable]").draggable({
                    connectToSortable: "[sadaf-sortable]",
                    helper: "clone",
                    revert: "invalid",
                    start: function(event, ui) {
                        $(ui.helper).css("width", $(ui.helper).width() + "px");
                    },
                    stop: function(event, ui) {
                        $(ui.helper).css("width", "100%");
                    }
                });
                $("[sadaf-draggable]").disableSelection();
            }
            if (scope.$last) {
                setup();
            }
        };
    } ]);
    ngApp.directive("sadafSortable", [ "$timeout", function($timeout) {
        return function(scope, element, attr) {
            function setup() {
                $("[sadaf-sortable]").sortable({
                    revert: true
                });
                $("[sadaf-sortable]").disableSelection();
            }
            if (true) {
                setup();
            }
        };
    } ]);
    ngApp.directive("sadafCalendar", function() {
        return {
            restrict: "E",
            replace: true,
            transclude: true,
            scope: {
                model: "=ngModel",
                change: "&?ngChange",
                sdKeyup: "&"
            },
            template: '<div  style="display:inline-block;width:100%;"><input type="text" id=""  class="form-control from" placeholder="{{\'date\' | translate}}" /><input id="from-value" type="hidden"/></div>',
            link: function(scope, element, attributes) {
                var input = element.find(" .from");
                input.datepicker({
                    changeMonth: true,
                    changeYear: true,
                    dateFormat: "yy/mm/dd",
                    altFormat: "yy/mm/dd",
                    yearRange: "-30:+30",
                    altField: element.find("#from-value"),
                    onClose: function(selectedDate) {
                        scope.model = selectedDate;
                        scope.$apply();
                        if (scope.change) scope.change();
                    }
                });
                input.keyup(function(e) {
                    scope.sdKeyup({
                        $event: e
                    });
                });
                scope.$watch("model", function(v) {
                    element.find(".from").datepicker("setDate", scope.model);
                });
                element.find(".from").datepicker("setDate", scope.model);
            }
        };
    });
    ngApp.directive("sadafCalendarRange", function() {
        return {
            restrict: "E",
            replace: true,
            transclude: true,
            scope: {
                model: "=ngModel",
                sdKeyup: "&"
            },
            template: '<div class="" style="display:flex; flex-direction:row;">                        <div class="" style="flex-grow:1;">                            <input id="" type="text" class="datepicker from" placeholder="تاریخ شروع" />                            <input id="from-value" type="hidden"/>                        </div>                        <div class="" style="padding: 8px;">تا</div>                        <div class="" style="flex-grow:1;">                            <input id="" type="text" class="datepicker to" placeholder="تاریخ پایان"/>                            <input id="to-value" type="hidden"/>                        </div>                      </div>',
            link: function(scope, element, attributes) {
                element.find(" .from").datepicker({
                    changeMonth: true,
                    changeYear: true,
                    dateFormat: "yy/mm/dd",
                    yearRange: "-30:+30",
                    altFormat: "yy/mm/dd",
                    altField: element.find("#from-value"),
                    onClose: function(selectedDate) {
                        scope.model = scope.model || {};
                        if (!selectedDate) {
                            scope.model.from = null;
                            return;
                        }
                        element.find(".to").datepicker("option", "minDate", selectedDate);
                        scope.model.from = selectedDate;
                        scope.$apply();
                    }
                });
                element.find(".to").datepicker({
                    defaultDate: "+1w",
                    changeYear: true,
                    changeMonth: true,
                    dateFormat: "yy/mm/dd",
                    altFormat: "yy/mm/dd",
                    yearRange: "-30:+30",
                    altField: element.find("#to-value"),
                    onClose: function(selectedDate) {
                        scope.model = scope.model || {};
                        if (!selectedDate) {
                            scope.model.to = null;
                            return;
                        }
                        element.find(".from").datepicker("option", "maxDate", selectedDate);
                        scope.model.to = selectedDate;
                        scope.$apply();
                    }
                });
                scope.$watch("model", function(v) {
                    if (!scope.model) {
                        return;
                    }
                    element.find(".from").datepicker("setDate", scope.model.from);
                    element.find(".to").datepicker("setDate", scope.model.to);
                });
            }
        };
    });
    ngApp.directive("sadafTime", [ "$compile", "$timeout", function($compile, $timeout) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                model: "=ngModel",
                change: "&?ngChange"
            },
            template: '<div class="" >                        <input list="timeList" type="time" ng-model="timeValue" ng-change="change()"/>                        <datalist id="timeList">                            <option value="01:00">                            <option value="02:00">                            <option value="03:00">                            <option value="04:00">                            <option value="05:00">                            <option value="06:00">                            <option value="07:00">                            <option value="08:00">                            <option value="09:00">                            <option value="10:00">                            <option value="11:00">                            <option value="12:00">                            <option value="13:00">                            <option value="14:00">                            <option value="15:00">                            <option value="16:00">                            <option value="17:00">                            <option value="18:00">                            <option value="19:00">                            <option value="20:00">                            <option value="21:00">                            <option value="22:00">                            <option value="23:00">                            <option value="24:00">                        </datalist>                   </div>',
            link: function(scope, element, attr) {
                scope.silent = false;
                scope.timeValue;
                scope.$watch("timeValue", function(n, o) {
                    if (!n) {
                        return;
                    }
                    scope.silent = true;
                    scope.model = scope.timeValue.toTimeString().split(" ")[0].substring(0, 5);
                    $timeout(function() {
                        scope.silent = false;
                    });
                });
                scope.$watch("model", function(n, o) {
                    if (scope.silent) return;
                    if (!n) {
                        scope.timeValue = null;
                        return;
                    }
                    scope.timeValue = new Date("1969-12-31 " + scope.model + "");
                });
            }
        };
    } ]);
    ngApp.directive("sadafTimeRange", [ "$compile", "$timeout", function($compile, $timeout) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                model: "=ngModel",
                change: "&?ngChange"
            },
            template: '<div class="" style="display:flex; flex-direction:row;">                        <div class="" style="flex-grow:1;">                        <input list="timeListFrom" type="time" ng-model="timeFrom" ng-change="change()"/>                        <datalist id="timeListFrom">                            <option value="01:00">                            <option value="02:00">                            <option value="03:00">                            <option value="04:00">                            <option value="05:00">                            <option value="06:00">                            <option value="07:00">                            <option value="08:00">                            <option value="09:00">                            <option value="10:00">                            <option value="11:00">                            <option value="12:00">                            <option value="13:00">                            <option value="14:00">                            <option value="15:00">                            <option value="16:00">                            <option value="17:00">                            <option value="18:00">                            <option value="19:00">                            <option value="20:00">                            <option value="21:00">                            <option value="22:00">                            <option value="23:00">                            <option value="24:00">                        </datalist>                        </div>                        <div class="" style="padding: 8px ;">تا</div>                        <div class="" style="flex-grow:1;">                        <input list="timeListTo" type="time" ng-model="timeTo" ng-change="change()" />                        <datalist id="timeListTo">                            <option value="01:00">                            <option value="02:00">                            <option value="03:00">                            <option value="04:00">                            <option value="05:00">                            <option value="06:00">                            <option value="07:00">                            <option value="08:00">                            <option value="09:00">                            <option value="10:00">                            <option value="11:00">                            <option value="12:00">                            <option value="13:00">                            <option value="14:00">                            <option value="15:00">                            <option value="16:00">                            <option value="17:00">                            <option value="18:00">                            <option value="19:00">                            <option value="20:00">                            <option value="21:00">                            <option value="22:00">                            <option value="23:00">                            <option value="24:00">                        </datalist>                        </div>                      </div>',
            link: function(scope, element, attr) {
                scope.silent = false;
                scope.timeFrom;
                scope.timeTo;
                scope.model = scope.model || {};
                scope.$watch("timeFrom", function(n, o) {
                    if (!n) {
                        return;
                    }
                    scope.silent = true;
                    scope.model = scope.model || {};
                    scope.model.from = scope.timeFrom.toTimeString().split(" ")[0].substring(0, 5);
                    if (scope.model.from == "Inval") {
                        scope.model.from = null;
                    }
                    $timeout(function() {
                        scope.silent = false;
                    });
                });
                scope.$watch("timeTo", function(n, o) {
                    if (!n) {
                        return;
                    }
                    scope.silent = true;
                    scope.model = scope.model || {};
                    scope.model.to = scope.timeTo.toTimeString().split(" ")[0].substring(0, 5);
                    if (scope.model.to == "Inval") {
                        scope.model.to = null;
                    }
                    $timeout(function() {
                        scope.silent = false;
                    });
                });
                scope.$watch("model", function(n, o) {
                    if (scope.silent) return;
                    if (!n) {
                        scope.timeFrom = {};
                        scope.timeTo = {};
                        return;
                    }
                    $timeout(function() {
                        scope.timeFrom = new Date("1969-12-31 " + scope.model.from + "");
                        scope.timeTo = new Date("1969-12-31 " + scope.model.to + "");
                    });
                });
                if (!scope.model) {
                    scope.timeFrom = new Date("1969-12-31 " + scope.model.from + "");
                    scope.timeTo = new Date("1969-12-31 " + scope.model.to + "");
                }
            }
        };
    } ]);
    ngApp.directive("sadafDateTime", [ "$compile", "$timeout", function($compile, $timeout) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                model: "=ngModel",
                change: "&?ngChange"
            },
            template: '<div class="ui two columns grid"><div class="row" style="margin: 1rem 0;">                           <sadaf-calendar class="wide column" ng-model="innerModel.date"></sadaf-calendar>                           <sadaf-time class="wide column" ng-model="innerModel.time"></sadaf-time>                       </div></div>',
            link: function(scope, element, attr) {
                scope.innerModel = {};
                scope.silent = false;
                scope.$watch("innerModel", function(n, o) {
                    if (!n || !n.time && !n.date) return;
                    if (scope.silent) return;
                    var time = n.time || "00:00";
                    var date = n.date || "1397/01/01";
                    var dateArray = date.split(/\//).map(function(d) {
                        return +d;
                    });
                    var dateMiladiArray = jd_to_gregorian(persian_to_jd(dateArray[0], dateArray[1], dateArray[2]));
                    scope.silent = true;
                    scope.model = date + " " + time + ":00";
                    notifySilentTrue();
                }, true);
                function notifySilentTrue() {
                    $timeout(function() {
                        scope.silent = false;
                    }, 0);
                }
                scope.$watch("model", function(n, o) {
                    if (!n) return;
                    if (scope.silent) return;
                    var dateArray = n.split(/[\/: ]/).map(function(d) {
                        return +d;
                    });
                    var dateShamsiArray = jd_to_persian(gregorian_to_jd(dateArray[0], dateArray[1], dateArray[2]));
                    scope.silent = true;
                    scope.innerModel.date = dateArray[0] + "/" + format(dateArray[1]) + "/" + format(dateArray[2]);
                    scope.innerModel.time = format(dateArray[3]) + ":" + format(dateArray[4]);
                    notifySilentTrue();
                }, true);
                function format(i) {
                    return i < 10 ? "0" + i : i;
                }
            }
        };
    } ]);
    ngApp.directive("sadafFile", [ "$compile", "$timeout", function($compile, $timeout) {
        return {
            restrict: "E",
            transclude: true,
            replace: true,
            scope: {
                model: "=ngModel"
            },
            controller: [ "$scope", "Upload", function($scope, Upload) {
                $scope.files;
                $scope.progress = null;
                $scope.model.attachment = $scope.model.attachment || {};
                $scope.model.attachment.uploadList = $scope.model.attachment.uploadList || [];
                _.each($scope.model.attachment.uploadList, function(f) {
                    f.added = true;
                    f.name = f.fileName;
                    f.uploadFinish = true;
                    f.success = true;
                    setIcon(f);
                });
                $scope.upload = function($files, $event, $rejectedFiles) {
                    if (!$files || !$files.length) {
                        return;
                    }
                    _.each($files, function(f) {
                        $scope.model.attachment.uploadList.push(f);
                    });
                    refreshList();
                };
                $scope.getLink = function(file) {
                    if (file.serverDbId) {
                        return app.urlPrefix + "api/upload/get/" + file.serverDbId;
                    }
                    return app.urlPrefix + "api/upload/get?path=" + file.serverPath + "&name=" + encodeURI(file.name);
                };
                $scope.getSrc = function(file) {
                    return app.urlPrefix + "images/file_word.png";
                };
                function refreshList() {
                    _.each($scope.model.attachment.uploadList, function(item) {
                        if (!item.added) {
                            item.added = true;
                            uploadFile(item);
                        }
                    });
                }
                function setIcon(file) {
                    var iconMap = {
                        docx: "word",
                        doc: "word",
                        pptx: "powerpoint",
                        ppt: "powerpoint",
                        pdf: "pdf",
                        xlsx: "excel",
                        xls: "excel",
                        mp4: "video",
                        mp3: "audio",
                        wma: "audio"
                    };
                    var ext = file.name.split(".").pop().toLowerCase();
                    file.icon = iconMap[ext];
                }
                function uploadFile(file) {
                    setIcon(file);
                    Upload.upload({
                        url: app.urlPrefix + "api/Upload/PostFile",
                        data: {
                            file: file
                        }
                    }).then(function(resp) {
                        file.serverPath = resp.data[0].path;
                        file.fileName = resp.data[0].name;
                        file.success = true;
                    }, function(resp) {}, function(evt) {
                        var progressPercentage = parseInt(100 * evt.loaded / evt.total);
                        file.progress = progressPercentage;
                        if (evt.loaded == evt.total) {
                            file.uploadFinish = true;
                        }
                    });
                }
            } ],
            template: '<div class="file-uplaod ">                            <div class="ui secondary pointing tiny menu">                                <div class="active item">{{model.label}} <span ng-show="model.validations.isRequire" style="color:#db2828">&nbsp;*&nbsp;</span></div>                                <div class="ui right item" ng-hide="model.readonly">                                    <div class="pointer" ngf-select ngf-change="upload($files, $event, $rejectedFiles)" ngf-multiple="true"  ngf-allow-dir="false" ngf-accept="\'*\'">{{\'add file\' | translate}}<i class="icon plus square outline large"></i></div>                                </div>                            </div>                                                              <div ng-hide="model.attachment.uploadList.length" class="gray center aligned twelve wide column"><small>{{\'no file selected\' | translate}}</small></div>                            <div class="">                                <div ng-repeat="file in model.attachment.uploadList" class="file-item" >                                    <div class="">                                        <div class="">                                            <span class="ui img"><i class="icon file outline large" ng-class="file.icon"></i></span>                                            <span ng-hide="file.serverDbId || file.serverPath">{{file.name}} </span>                                            <a ng-show="file.serverDbId || file.serverPath"class="file-link" target="_blank" href="{{getLink(file)}}">{{file.name}} </a>                                            <span ng-show="file.uploadFinish && file.success && !model.readonly" class="pointer" ng-click="model.attachment.uploadList.splice($index,1)"><i class="icon remove small grey"></i></span>                                            <span ng-show="file.uploadFinish && !file.success" class="ui tiny"><span class="ui text tiny active inline center loader" ></span></span>                                            <sm-progress class="blue tiny" model="file.progress" ng-show="file.progress != null && !file.uploadFinish" style="margin-top:4px;"></sm-progress>                                        </div>                                    <div>                                </div>                             </div>                        </div>'
        };
    } ]);
    ngApp.service("controlPropertyService", function() {
        var c = {};
        c.control = {
            active: null,
            setActive: function(control) {
                if (!control) return;
                if (c.control.active) {
                    c.control.active.isActive = false;
                }
                c.control.active = control;
                c.control.active.isActive = true;
            },
            remove: function(i, control) {
                var f = confirm(app.lang.translate("delete control message"));
                if (f) {
                    dangerChangeOccured = true;
                    c.pages.activePage.controls.splice(i, 1);
                }
            },
            createItems: function(active) {
                if (!active.dropdown.itemsTemp) return;
                var lines = active.dropdown.itemsTemp.split(/[\r\n]/);
                active.dropdown.items = [];
                _.each(lines, function(line) {
                    var l = line.trim();
                    if (active) if (l != "") active.dropdown.items.push({
                        label: l,
                        value: l
                    });
                });
            },
            resetListValue: function() {
                if (c.control.active.dropdown) {
                    c.control.active.dropdown.listValue = [];
                }
            }
        };
        function get() {
            return c.control;
        }
        return {
            setActive: c.control.setActive,
            remove: c.control.remove,
            getActive: c.control.active,
            createItems: c.control.createItems,
            get: get
        };
    });
    ngApp.service("updateModel", [ "$http", function($http) {
        function updateValuesForGet(pages) {}
        function updateValuesForSave(pages) {}
        return {
            updateValuesForSave: updateValuesForSave,
            updateValuesForGet: updateValuesForGet
        };
    } ]);
    ngApp.service("formsService", [ "$http", "updateModel", function($http, updateModel) {
        var formsModule = 0;
        var securityCertPatch = false;
        var qGet = {};
        var clearCache = function(id) {
            if (id) qGet[id] = null;
        };
        var get = function(id, editor) {
            if (!id) id = "";
            var editParam = "";
            if (editor) editParam = "?fromEditor=true";
            if (!qGet[id || "all"]) {
                qGet[id || "all"] = $http.get(app.urlPrefix + "api/forms/get/" + id + editParam).then(function(res) {
                    if (id) {
                        updateModel.updateValuesForGet(res.data.model.pages);
                        return res.data;
                    }
                    formsModule = res.data.formsModule;
                    securityCertPatch = res.data.securityCertPatch;
                    return res.data.list;
                });
            }
            return qGet[id || "all"];
        };
        var save = function(id, model) {
            qGet = {};
            return $http.post(app.urlPrefix + "api/forms/save/" + id, model).then(function(res) {
                return res.data;
            });
        };
        var remove = function(id) {
            qGet = {};
            return $http.get(app.urlPrefix + "api/forms/delete/" + id).then(function(res) {
                return res.data;
            });
        };
        var addFormToDashboard = function(dashboard, forms) {
            qGet = {};
            return $http.post(app.urlPrefix + "api/forms/addFormToDashboard/" + dashboard, forms).then(function(res) {
                return res.data;
            });
        };
        var deleteFormFromDashboard = function(dashboard, forms) {
            return $http.post(app.urlPrefix + "api/forms/deleteFormFromDashboard/" + dashboard, forms).then(function(res) {
                return res.data;
            });
        };
        var tableLookup = function(model, value) {
            var data = {
                values: value,
                tableLookup: model
            };
            return $http.post(app.urlPrefix + "api/forms/getTableLookup", data).then(function(res) {
                return res.data;
            });
        };
        var publish = function(id, name, enable) {
            return $http.get(app.urlPrefix + "api/forms/publish", {
                params: {
                    name: name,
                    id: id,
                    publish: enable
                }
            }).then(function(d) {
                return d.data;
            });
        };
        return {
            save: save,
            get: get,
            remove: remove,
            addFormToDashboard: addFormToDashboard,
            deleteFormFromDashboard: deleteFormFromDashboard,
            getFormsModule: function() {
                return formsModule;
            },
            securityCertPatch: function() {
                return securityCertPatch;
            },
            clearCache: clearCache,
            tableLookup: tableLookup,
            publish: publish
        };
    } ]);
    ngApp.filter("d3format", function() {
        return function(input, format) {
            if (format == "#,#") format = ",.0f";
            if (typeof input == "undefined" || input == null) return input;
            return d3.format(format)(input);
        };
    });
    ngApp.directive("sadafTasks", [ "$compile", "$timeout", function($compile, $timeout) {
        return {
            restrict: "E",
            transclude: true,
            scope: {
                model: "=ngModel"
            },
            controller: [ "$scope", function($scope) {
                function uuidv4() {
                    return ([ 1e7 ] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function(c) {
                        return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
                    });
                }
                $scope.add = function() {
                    $scope.model = $scope.model || [];
                    $scope.model.push({
                        type: 0,
                        openLinkType: 0,
                        uuid: uuidv4()
                    });
                };
                $scope.addWebParam = function(task) {
                    task.webserviceParameters = task.webserviceParameters || [];
                    task.webserviceParameters.push({});
                };
            } ],
            template: "" + '<div class="" style="margin: 30px 0;">' + '<div class="ui mini icon button" ng-click="add()">{{\'add task\' | translate}} <i class="ui icon add"></i></div>' + '<div class="ui secondary black segment" style="margin-left: -12px;margin-right: -12px;border-radius: 0;" ng-repeat="task in model" ng-init="model = model || []">' + '        <button ng-click="model.splice($index, 1)" class="ui mini  basic icon button" style="box-shadow: none; position: absolute; top :0; left:0;" ><i class="ui icon close"></i></button>' + '        <div class="inline fields">' + "            <label class=\"four wide field\">{{'type' | translate}}</label>" + '            <div class="eight wide field"><sm-dropdown items="[{label:(\'goto dashboard\' | translate), value:0}' + "                         , {label:('sms' | translate), value:4}" + "                         , {label:('web service' | translate), value:2}" + "                         , {label:('javascript' | translate), value:3}]\"" + '                         style="width: 100%;"' + '                         model="task.type" label="item.label" value="item.value"></sm-dropdown></div>' + "        </div>" + "" + '        <div class="field" ng-show="task.type == 0">' + "                 <label class=\"\">{{'dashboard'|translate}}</label>" + '                 <select-menu class="" ng-model="task.dashboardId"></select-menu>' + "        </div>" + "" + '        <div class="inline fields" ng-show="task.type == 0">' + "            <label class=\"four wide field\">{{'open type'|translate}}</label>" + "            <div class=\"eight wide field\"><sm-dropdown items=\"[{label:('new page' | translate), value:0}, {label:('current page' | translate), value:1}]\"" + '                         style="width: 100%;"' + '                         model="task.openLinkType" label="item.label" value="item.value"></sm-dropdown></div>' + "        </div>" + "" + "" + '        <div class="field" ng-show="task.type == 1">' + '            <form-lookup-property ng-model="task.formInfo" settings="{selectableColumns:false}"></form-lookup-property>' + "        </div>" + "" + '        <div class="field" ng-show="task.type == 2">' + "            <label>{{'آدرس' | translate}}</label>" + '            <input style="direction: ltr;" ng-model="task.webserviceUrl" placeholder="{{\'آدرس\' | translate}}">' + "        </div>" + "" + '        <div class="field" ng-show="task.type == 4">' + "            <label>{{'sms body' | translate}}</label>" + '            <textarea ng-model="task.smsBody"></textarea>' + "        </div>" + '        <div class="field" ng-show="task.type == 4">' + "            <label>{{'roles' | translate}}</label>" + '            <select-roles ng-model="task.smsRoles"></select-roles>' + "        </div>" + '        <div class="inline fields" ng-show="task.type == 2">' + "            <label class=\"four wide field\">{{'method' | translate}}</label>" + '            <div class="eight wide field"><sm-dropdown items="[' + "                         {label:'GET' , value:0}" + "                         , {label:'POST', value:1}]\"" + '                         style="width: 100%;"' + '                         model="task.webserviceMethod" label="item.label" value="item.value"></sm-dropdown></div>' + "        </div>" + '        <div class="field" ng-show="task.type == 2">' + "            <label>{{'parameters' | translate}}</label>" + '            <div ng-repeat="p in task.webserviceParameters">' + '                <div style="padding-left: 20px;position: relative;">' + '                    <input ng-model="p.key" class="form-flat-input" type="text" placeholder="key">' + '                    <input ng-model="p.value" class="form-flat-input" type="text" placeholder="value">' + '                    <i style="position:absolute; left:0; top:0;" class="ui icon close pointer" ng-click="task.webserviceParameters.splice($index, 1)"></i>' + "                </div>" + "            </div>" + '            <span class="link-button" ng-click="addWebParam(task)">{{\'new row\' | translate}} <i class="ui icon add"></i></span>' + "        </div>" + '        <div class="field" ng-show="task.type == 3">' + "            <label>{{'javascript' | translate}}</label>" + '            <textarea ng-model="task.script" style="direction:ltr; font-family:monospace;"placeholder="{{\'javascript\' | translate}}"></textarea>' + "        </div>" + "    </div>" + "</div>"
        };
    } ]);
    ngApp.service("taskExecutor", [ "$http", function($http) {
        function exec(task, formModel) {
            function replaceValue(val) {
                return val.replace(/@\((field-\d+)\)/gi, function(a, b) {
                    var c = findControl(b, formModel.pages);
                    if (c === null) return "";
                    if (c.type === 19) {
                        var serverPath = c.attachment.uploadList[0].serverPath;
                        var serverDbId = c.attachment.uploadList[0].serverDbId;
                        return serverPath;
                    }
                    return c.value;
                });
            }
            if (task.type === 0) {
                if (!+task.dashboardId) return;
                var name = +task.openLinkType === 0 ? "_blank" : "_self";
                window.open(app.urlPrefix + "#/dashboard/" + task.dashboardId, name);
            }
            if (task.type === 2) {
                if (_.isEmpty(task.webserviceUrl)) return;
                var url = replaceValue(task.webserviceUrl);
                $http.get(url).then(function() {
                    alert(app.lang.translate("successfull run"));
                }).catch(function() {
                    alert(app.lang.translate("unsuccessfull run"));
                });
            }
            if (task.type == 3) {
                if (_.isEmpty(replaceValue(task.script))) return;
                eval(task.script);
            }
        }
        return {
            exec: exec
        };
    } ]);
    function findControl(name, data) {
        var n = null;
        runOnAllControll(data, function(d) {
            if (d.name === name) {
                n = d;
                return false;
            }
        });
        return n;
    }
    function runOnAllControll(pages, run, pageRun) {
        var pagesControls = [];
        _.each(pages, function(page) {
            if (pageRun) pageRun(page);
            if (page && _.isArray(page.controls)) pagesControls = pagesControls.concat(page.controls);
        });
        _.each(pagesControls, function(cnt) {
            if (cnt.type == 13 && cnt.multiRowForm) {
                _.each(cnt.multiRowForm.rows, function(row) {
                    _.each(row, function(d) {
                        run(d, row);
                    });
                });
            }
            run(cnt, pagesControls);
        });
    }
    function showErrorToast(msg, $mdToast) {
        $mdToast.show({
            template: '<md-toast class="md-toast error"> <span class="md-toast-text" flex>' + msg + "</span></md-toast>",
            hideDelay: 3e3,
            position: "bottom left"
        });
    }
    function getFormLookupFields(fl, formsService, callback) {
        if (!fl || !fl.form) return;
        if (fl.formLookupSourceFields && fl.formLookupSourceFields.length) {
            if (callback) callback();
            return;
        }
        formsService.get(fl.form).then(function(data) {
            fl.formLookupSourceFields = [];
            _.each(data.model.pages, function(page) {
                _.each(page.controls, function(cnt) {
                    fl.formLookupSourceFields.push(cnt);
                });
            });
            fl.formLookupSourceFields.push({
                name: "_id",
                label: app.lang.translate("identity")
            });
            if (callback) callback();
        });
    }
})();
// داشبورد مدیریتی صدف info@sadafdashboard.ir 

var notification = angular.module("notificationCat", [ "semantic-ui" ]);

notification.controller("notificationController", [ "$scope", "$http", "$sce", "$timeout", "$rootScope", function($scope, $http, $sce, $timeout, $rootScope) {} ]);

notification.directive("notification", function() {
    return {
        scope: {
            ngModel: "=?"
        },
        controller: [ "$scope", "notificationService", function($scope, notificationService) {
            $scope.persian = persian;
            $scope.momet = moment;
            $scope.d3 = d3;
            $scope.ngModel = $scope.ngModel || {};
            $scope.ngModel.show = false;
            $scope.$watch("notifications", function(n) {
                $scope.ngModel.show = n && n.length;
            }, true);
            notificationService.getUnreader().then(function(notifications) {
                $scope.notifications = notifications;
                invalidateUnreadCount();
            });
            function invalidateUnreadCount() {
                $scope.unreadCount = _.filter($scope.notifications, {
                    Readed: false
                }).length;
            }
            $scope.init = function(el) {
                $scope.el = el;
            };
            $scope.toggleRead = function(notification) {
                notification.Readed = !notification.Readed;
                notificationService.toggleRead(notification.Id, notification.Readed);
                invalidateUnreadCount();
            };
            $scope.remove = function(notification, index) {
                var f = confirm("برای حذف این هشدار اطمینان دارید؟");
                if (!f) return;
                $scope.notifications.splice(index, 1);
                notificationService.remove(notification.Id);
                invalidateUnreadCount();
            };
            $scope.readAll = function() {
                notificationService.readAll();
                _.each($scope.notifications, function(d) {
                    d.Readed = true;
                });
                invalidateUnreadCount();
            };
            $scope.removeAll = function() {
                var f = confirm("برای حذف همه هشدارها اطمینان دارید؟");
                if (!f) return;
                notificationService.removeAll();
                $scope.notifications = [];
                invalidateUnreadCount();
                $scope.el.popup("hide");
            };
        } ],
        templateUrl: app.urlPrefix + "dist/partial/dashboardPage/notification.html?v=" + app.version
    };
});

notification.service("notificationService", [ "$http", function($http) {
    var getUnreader = function() {
        return $http.get(app.urlPrefix + "api/notification/get").then(function(res) {
            _.each(res.data.notifications, function(n) {
                if (n.Type == 0) {
                    n.Content = JSON.parse(n.Content);
                }
                n.time = new Date(n.DateTime).getTime();
                n.fromNow = moment(new Date(n.DateTime).getTime()).fromNow();
            });
            return res.data.notifications;
        });
    };
    var toggleRead = function(id, read) {
        return $http.get(app.urlPrefix + "api/notification/read?id=" + id + "&read=" + read);
    };
    var remove = function(id) {
        return $http.get(app.urlPrefix + "api/notification/delete?id=" + id);
    };
    var removeAll = function(id) {
        return $http.get(app.urlPrefix + "api/notification/deleteAll");
    };
    var readAll = function(id) {
        return $http.get(app.urlPrefix + "api/notification/readAll");
    };
    return {
        getUnreader: getUnreader,
        toggleRead: toggleRead,
        remove: remove,
        removeAll: removeAll,
        readAll: readAll
    };
} ]);

var ngApp = angular.module("navbarCat", [ "pascalprecht.translate", "ngSanitize" ]);

ngApp.factory("navbar", [ "$rootScope", function($rootScope) {
    var mOption = null;
    return {
        getOption: function() {
            return mOption;
        },
        setOption: function(opt) {
            mOption = opt;
            $rootScope.$broadcast("navbarChange");
        }
    };
} ]);

ngApp.factory("drawer", [ function($rootScope) {
    var drawer = {
        init: function() {
            if (!$("body #drawer-overlay").length) {
                var r = '<div class="drawer-overlay" id="drawer-overlay"></div>';
                $("body").append(r);
                $("body #drawer-overlay").on("click", this.close);
            }
        },
        toggle: function() {
            if ($("body").hasClass("drawer-open")) $("body").removeClass("drawer-open"); else $("body").addClass("drawer-open");
        },
        close: function() {
            $("body").removeClass("drawer-open");
        }
    };
    return {
        init: drawer.init,
        toggle: drawer.toggle,
        close: drawer.close
    };
} ]);

ngApp.controller("navbarCtrl", [ "$scope", "$http", "$rootScope", "navbar", "drawer", "$translate", function($scope, $http, $rootScope, navbar, drawer, $translate) {
    $scope.toggle = function() {
        drawer.toggle();
    };
    $translate.use(+$("#lang").val() == 0 ? "fa" : "en");
    $scope.urlPrefix = app.urlPrefix;
    $http.get(app.urlPrefix + "menu/MainMenu").then(function(data) {
        $scope.menu = data.data;
        $scope.menu.menus.splice(0, 0, {
            Id: 1,
            Link: app.urlPrefix + "sadaf/main/",
            Name: "پروژه‌ها",
            Type: 2
        });
        $scope.dashboardActions = {
            fullScreenToggle: function() {},
            designToggle: function() {},
            printToggle: function() {},
            slideShowToggle: function() {},
            canDesign: true
        };
        if (navbar.getOption()) $scope.dashboardActions = navbar.getOption();
        $rootScope.$on("navbarChange", function() {
            if (navbar.getOption()) $scope.dashboardActions = navbar.getOption();
        });
    });
    app.lang.setLang({
        selector: ".navbar.navbar-inverse"
    });
} ]);

angular.module("uibCollapseCat", []).directive("uibCollapse", [ "$animate", "$q", "$parse", "$injector", function($animate, $q, $parse, $injector) {
    var $animateCss = $injector.has("$animateCss") ? $injector.get("$animateCss") : null;
    return {
        link: function(scope, element, attrs) {
            var expandingExpr = $parse(attrs.expanding), expandedExpr = $parse(attrs.expanded), collapsingExpr = $parse(attrs.collapsing), collapsedExpr = $parse(attrs.collapsed);
            if (!scope.$eval(attrs.uibCollapse)) {
                element.addClass("in").addClass("collapse").attr("aria-expanded", true).attr("aria-hidden", false).css({
                    height: "auto"
                });
            }
            function expand() {
                if (element.hasClass("collapse") && element.hasClass("in")) {
                    return;
                }
                $q.resolve(expandingExpr(scope)).then(function() {
                    element.removeClass("collapse").addClass("collapsing").attr("aria-expanded", true).attr("aria-hidden", false);
                    if ($animateCss) {
                        $animateCss(element, {
                            addClass: "in",
                            easing: "ease",
                            to: {
                                height: element[0].scrollHeight + "px"
                            }
                        }).start()["finally"](expandDone);
                    } else {
                        $animate.addClass(element, "in", {
                            to: {
                                height: element[0].scrollHeight + "px"
                            }
                        }).then(expandDone);
                    }
                });
            }
            function expandDone() {
                element.removeClass("collapsing").addClass("collapse").css({
                    height: "auto"
                });
                expandedExpr(scope);
            }
            function collapse() {
                if (!element.hasClass("collapse") && !element.hasClass("in")) {
                    return collapseDone();
                }
                $q.resolve(collapsingExpr(scope)).then(function() {
                    element.css({
                        height: element[0].scrollHeight + "px"
                    }).removeClass("collapse").addClass("collapsing").attr("aria-expanded", false).attr("aria-hidden", true);
                    if ($animateCss) {
                        $animateCss(element, {
                            removeClass: "in",
                            to: {
                                height: "0"
                            }
                        }).start()["finally"](collapseDone);
                    } else {
                        $animate.removeClass(element, "in", {
                            to: {
                                height: "0"
                            }
                        }).then(collapseDone);
                    }
                });
            }
            function collapseDone() {
                element.css({
                    height: "0"
                });
                element.removeClass("collapsing").addClass("collapse");
                collapsedExpr(scope);
            }
            scope.$watch(attrs.uibCollapse, function(shouldCollapse) {
                if (shouldCollapse) {
                    collapse();
                } else {
                    expand();
                }
            });
        }
    };
} ]);

var ngApp = angular.module("sadaf", [ "sadafForms", "ngRoute", "filterBox", "navbarCat", "ui.sortable", "pascalprecht.translate", "ngSanitize", "uibCollapseCat", "notificationCat", "services" ]);

ngApp.config([ "$translateProvider", function($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        prefix: app.urlPrefix + "dist/locales/locale-",
        suffix: ".js"
    });
    $translateProvider.preferredLanguage("fa");
    $translateProvider.useSanitizeValueStrategy("sanitizeParameters");
} ]);

ngApp.config([ "$locationProvider", function($locationProvider) {
    $locationProvider.hashPrefix("");
} ]);

ngApp.factory("httpResponseInterceptor", [ "$q", "$rootScope", "$location", function($q, $rootScope, $location) {
    return {
        responseError: function(rejection) {
            if (rejection.status === 401) {
                alert("مهلت اعتبار ارتباط شما با سایت پایان یافته، لطفا دوباره وارد شوید");
                document.location = "/account/login";
            }
            return $q.reject(rejection);
        }
    };
} ]);

ngApp.config([ "$httpProvider", function($httpProvider) {
    $httpProvider.interceptors.push("httpResponseInterceptor");
    var xsrf = $("input[name=__RequestVerificationToken]").val();
    $httpProvider.defaults.headers.post["__RequestVerificationToken"] = xsrf;
} ]);

var service = [ "$http", "$interval", function($http, $interval) {
    var looper;
    return {
        start: function() {},
        stop: function() {
            $interval.cancel(looper);
        }
    };
} ];

try {
    var sadaf = angular.module("sadaf");
    sadaf.factory("heartBeat", service);
    sadaf.run([ "heartBeat", function(heartBeat) {
        if (!app.mobileMode) heartBeat.start();
    } ]);
} catch (e) {}

try {
    var management = angular.module("management");
    management.factory("heartBeat", service);
    management.run([ "heartBeat", function(heartBeat) {
        if (!app.mobileMode) heartBeat.start();
    } ]);
} catch (e) {}

var app = app || {};

app.contentSegment = $("#content_segment");

app.contentSegmentModal = $("#content_segmentModal");

if (!console) {
    console = {};
    console.log = function() {};
}

app.chartLoadDelay = 120;

app.absoluteUrl = "/";

app.setAboluteUrl = function(absoluteUrl) {
    app.absoluteUrl = absoluteUrl;
};

app.loadContent = function(link) {
    app.showLoadingProgress();
    $("#content_segment").load(app.urlPrefix + link, function() {
        app.hideLoadingProgress();
        app.lang.setLang();
    });
};

app.setContent = function(data) {
    $("#content_segment").html(data);
    app.hideLoadingProgress();
    app.lang.setLang();
};

app.setLocation = function(link) {
    app.router.navigate(link, {
        trigger: true
    });
};

app.urlPrefix = "/";

app.setUrlPrefix = function(link) {
    app.urlPrefix = link.replace(/Moderation.*/g, "");
};

app.showInfo = function(info) {
    $("#app-info-text").html(info);
    $("#app-info-text").fadeIn();
    $("#app-loading-text").hide();
    app.showInfoHolder.show();
    setTimeout(function() {
        app.showInfoHolder.hide();
        $("#app-info-text").fadeOut(400, function() {
            $("#app-loading-text").show();
        });
    }, 4e3);
};

app.showLoadingProgress = function() {
    app.showInfoHolder.show();
};

app.hideLoadingProgress = function() {
    app.showInfoHolder.hide();
};

app.showInfoHolder = {
    holderCount: 0,
    timeout: {},
    hide: function() {
        if (app.showInfoHolder.holderCount > 0) --app.showInfoHolder.holderCount;
        if (app.showInfoHolder.holderCount == 0) {
            var difTime = new Date().getTime() - app.showInfoHolder.ticks;
            clearTimeout(app.showInfoHolder.timeout);
            setTimeout(function() {
                $("#app-loading").parent("div").animate({
                    top: "0",
                    opacity: 0
                }, 400);
            }, difTime < 1e3 ? 1e3 : 0);
        }
    },
    show: function() {
        var el = $("#app-loading").parent("div");
        el.css("left", $(window).width() / 2 - el.outerWidth() / 2);
        ++app.showInfoHolder.holderCount;
        app.showInfoHolder.ticks = new Date().getTime();
        app.showInfoHolder.timeout = setTimeout(function() {
            $("#app-loading").parent("div").animate({
                top: "50",
                opacity: 1
            }, 400);
        }, 1e3);
    }
};

app.encodeHTML = function(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
};

app.convertOldPropObject = function(old, chartType) {
    if (!old) return;
    if (old.chartProp && old.chartProp.info) {
        return old;
    }
    var result = {};
    result.chartProp = {};
    if (+chartType == chartTypes.TABLE) {
        result.chartProp.info = {
            chartSize: old.chartProp.chartSize,
            pivotTable: old.chartProp.pivotTable
        };
        result.chartProp.series = {};
        for (var prop in old.seriesProp) {
            if (old.seriesProp.hasOwnProperty(prop)) {
                result.chartProp.series["" + prop] = {
                    name: old.seriesProp["" + prop].table.headerName,
                    numberFactor: "1",
                    textAlign: old.seriesProp["" + prop].table.textAlign,
                    formatString: old.seriesProp["" + prop].table.formatString,
                    fontSize: old.seriesProp["" + prop].table.fontSize,
                    textBold: false,
                    textItalic: false,
                    color: old.seriesProp["" + prop].table.fontColor
                };
            }
            result.chartProp.series["default"] = {
                name: "",
                numberFactor: "1",
                textAlign: "right",
                formatString: "A",
                fontSize: "1m",
                textBold: false,
                textItalic: false,
                color: "#000000"
            };
        }
    }
    if (+chartType == chartTypes.BAR) {
        result.chartProp.info = {
            chartSize: old.chartProp.chartSize,
            horizontalLines: old.chartProp.horizontalLine,
            formatString: old.chartProp.formatString
        };
        result.chartProp.series = {};
        for (var prop in old.seriesProp) {
            if (old.seriesProp.hasOwnProperty(prop)) {
                result.chartProp.series["" + prop] = {
                    name: "",
                    numberFactor: old.seriesProp["" + prop].barlineChartProp.numberFactor,
                    seriesType: old.seriesProp["" + prop].barlineChartProp.barlineChartType,
                    seriesColor: old.seriesProp["" + prop].barlineChartProp.barlineChartColor,
                    lineType: old.seriesProp["" + prop].barlineChartProp.barlineChartTypeLineProp.lineChartStyle,
                    lineStyle: old.seriesProp["" + prop].barlineChartProp.barlineChartTypeLineProp.lineChartLineStyle,
                    lineWeight: old.seriesProp["" + prop].barlineChartProp.barlineChartTypeLineProp.lineChartLineWeight,
                    lineFace: old.seriesProp["" + prop].barlineChartProp.barlineChartTypeLineProp.lineChartLineDashes
                };
            }
        }
        result.chartProp.series["default"] = {
            name: "",
            numberFactor: "1",
            seriesType: "bar",
            seriesColor: "#1f77b4",
            lineType: "line-dot-area",
            lineStyle: "linear",
            lineWeight: "2",
            lineFace: "5,0"
        };
    }
    if (+chartType == chartTypes.PIE) {
        result.chartProp.info = {
            horizontalLines: old.chartProp.horizontalLine,
            chartSize: old.chartProp.chartSize,
            formatString: old.chartProp.formatString,
            pieStyle: old.chartProp.pieStyle,
            hole: "65"
        };
        result.chartProp.series = {};
        result.chartProp.series["default"] = {
            numberFactor: "1"
        };
    }
    if (+chartType == chartTypes.GAUGE) {
        result.chartProp.info = {
            chartSize: old.chartProp.chartSize,
            style: old.chartProp.gaugeStyle,
            height: "medium",
            color: "#333333",
            fontSize: "3em",
            formatString: ",.2f",
            status: "",
            target: "",
            textBold: true,
            textItalic: false,
            trend: "",
            value: "",
            segmentType: "singleSegment",
            min: "",
            yellow: "",
            green: "",
            max: ""
        };
        result.chartProp.series = {};
        result.chartProp.series["default"] = {
            numberFactor: "1",
            type: "value",
            typeMs: "value"
        };
    }
    result.dataUrl = old.chartProp.DataUrl;
    result.editMode = old.chartProp.editMode;
    return result;
};

app.autoPlayTimer = app.autoPlayTimer || {
    counter: 0
};

app.autoPlay = function(type, interval) {
    if (type && type == "start") {
        var play = function(link) {
            interval = interval || 10;
            $(".sadaf-circular-preogress").progressbar(10, +interval * 1e3);
            app.autoPlayTimer.timer = setTimeout(function() {
                document.location.href = app.urlPrefix + "#/app/" + link.appId + "/dashboard/" + link.id;
                $(".sadaf-circular-preogress").progressbar("stop");
                app.autoPlay("start", interval);
            }, +interval * 1e3);
        };
        if (!app.autoPlayTimer.links) {
            $.get(app.urlPrefix + "api/menus/get").done(function(d) {
                app.autoPlayTimer.links = d;
                play(app.autoPlayTimer.links[app.autoPlayTimer.counter++ % app.autoPlayTimer.links.length]);
            });
        } else {
            play(app.autoPlayTimer.links[app.autoPlayTimer.counter++ % app.autoPlayTimer.links.length]);
        }
    }
    if (type && type == "stop") {
        $(".sadaf-circular-preogress").progressbar("stop");
        clearTimeout(app.autoPlayTimer.timer);
    }
};

var resizeTimer;

app.lestenWindowResize = function(callback) {
    function ff() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            callback();
        }, 400);
    }
    var width = $(window).width();
    $(window).resize(function() {
        var nw = $(window).width();
        if ($(window).width() != width) {
            width = $(this).width();
            ff();
        }
    });
};

var designMenuTimer;

var printMenuTimer;

app.onMenusClick = function(show, showfullScreen) {
    if (show == "showPrintMenu" || show == "hidePrintMenu") {
        clearTimeout(printMenuTimer);
        printMenuTimer = setTimeout(function() {
            if (show == "showPrintMenu") {
                $(".navbar .print-toggle").fadeIn();
            } else if (show == "hidePrintMenu") {
                $(".navbar .print-toggle").fadeOut();
            }
        }, 800);
        return;
    }
    clearTimeout(designMenuTimer);
    designMenuTimer = setTimeout(function() {
        if (show == "showDesignMenu") {
            $(".navbar .design-toggle").fadeIn();
        } else if (show == "hideDesignMenu") {
            $(".navbar .design-toggle").fadeOut();
        }
        if (showfullScreen && showfullScreen == "showfullScreenMenu") $(".navbar .fullscreen-toggle").parents(".pull-right").fadeIn(); else $(".navbar .fullscreen-toggle").parents(".pull-right").fadeOut();
    }, 800);
    $("html,body").animate({
        scrollTop: 0
    }, "slow", function() {
        if ($(".side-menu").hasClass("open")) $("#side-menu-toggle").click();
    });
};

app.print = {
    printSingle: function(selector, title) {
        var html = this.getWidgetHtml(selector);
        app.print.print(html, title);
    },
    getWidgetHtml: function(selector) {
        var height = $(selector).height();
        var width = $(selector).width();
        var clone = $(selector).clone();
        clone.width(width);
        clone.height(height);
        var desc = clone.find(".ui.dimmer .dimmer-info").html();
        clone.find(".header").remove();
        clone.find(".ui.dimmer ").remove();
        clone.find(".gs-resize-handle").remove();
        clone.find(" .title").remove();
        clone.find(" #sort_checkbox").remove();
        clone.find(" .comment").remove();
        var chartHtml = $("<div>").append(clone).html();
        var descDiv = $('<div style="margin-top:10px;">' + desc + "</div>").width(width);
        var div = $("<div>").html(chartHtml).append(descDiv);
        div.css({
            "page-break-inside": "avoid",
            margin: "0 50px 50px 50px"
        });
        div.addClass("pull-left");
        var html = $("<div>").append(div).html();
        return html;
    },
    printPage: function() {
        var html = "";
        $(".chart-widget").each(function() {
            var id = $(this).find(".chart-layout").attr("id");
            html += app.print.getWidgetHtml("#" + id);
        });
        var title = $(".dashboard-page.active > a").text();
        app.print.print(html, title);
    },
    print: function(html, title) {
        var css = '<link href="' + app.absoluteUrl + "dist/css/dash-all" + (app.lang.isRtl ? "-rtl" : "") + ".css?v=" + app.version + '" rel="stylesheet" />                   <style  type="text/css">@page {                                margin: 1.5cm;                                @top-center {                                        content: "sapam";                                    }                                }                                .clusterize-scroll { max-height:initial !important;}                                .chart-data.bar-chart { display:block !important;}                                .ui.card .content { display:block;}                                .ui.card, .ui.cards >.card { -webkit-box-shadow: none;box-shadow: none;   height: auto;      }                                .chart-widget { width:auto !important;   height: auto !important;      }                    </style>';
        var w = window.open();
        w.document.write('<html><head><meta charset="utf-8"><title>' + title + "</title>" + css);
        w.document.write("</head><body>");
        w.document.write(html);
        w.document.write("</body></html>");
        w.document.close();
        w.focus();
        setTimeout(function() {
            w.print();
        }, 400);
    }
};

app.post = function(link, data, callback) {
    $.ajax({
        url: link,
        type: "POST",
        data: JSON.stringify(data),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        traditional: true,
        success: callback
    });
};

app.lang = {
    langType: 0,
    setLangTyle: function(lang) {
        this.langType = +(lang || 0);
    },
    isRtl: function() {
        return app.lang.langType == 0;
    },
    translate: function(key) {
        if (app.lang.lang) return app.lang.lang[key] || key;
        return key;
    },
    q: [],
    translateAsync: function(key, callback) {
        if (app.lang.lang) {
            if (callback) callback(app.lang.lang[key] || key);
        } else {
            this.q.push({
                key: key,
                callback: callback
            });
        }
    },
    setLang: function(opt) {
        if (opt && opt.data) this.lang = opt.data;
        if (!this.lang && this.inProgress) {
            return;
        }
        if (!this.lang && !this.inProgress) {
            var langChar = app.lang.langType == 0 ? "fa" : "en";
            this.inProgress = true;
            var link = app.urlPrefix + "dist/locales/locale-" + langChar + ".js?v=" + app.version;
            $.getJSON(link, null, function(d) {
                app.lang.setLang({
                    data: d
                });
                while (app.lang.q.length > 0) {
                    var item = q.pop();
                    if (item.callback) callback(app.lang.lang[item.key] || item.key);
                }
            });
            return;
        }
        var $els;
        if (opt && opt.selector) {
            $els = $(opt.selector).find("*[data-trans-key]");
        } else {
            $els = $("*[data-trans-key]");
        }
        $els.each(function() {
            var $el = $(this);
            var isTranslated = $el.data("translated");
            if (!isTranslated) {
                var trans = app.lang.lang[$el.data("trans-key")];
                var attr = $el.data("trans-attr");
                if (attr) {
                    $el.attr(attr, trans);
                } else {
                    $el.text(trans);
                }
                $el.data("translated", true);
            }
        });
    }
};

var app = app || {};

app.filterBox = angular.module("filterBox", [ "ngAnimate" ]);

app.filterBox.controller("filterBoxController", [ "$scope", "$http", "$sce", "$timeout", "$rootScope", function($scope, $http, $sce, $timeout, $rootScope) {
    $rootScope.$on("app-filterbox-refresh", function() {
        $scope.refresh();
    });
    $scope.getCleanValue = function(d) {
        var pattern = /.*&\[(.*)\]/gi;
        if (d.match(pattern)) {
            d = d.replace(pattern, "$1");
        }
        return d;
    };
    $scope.refresh = function() {
        $timeout(function() {
            $scope.otherFilters = [];
            _.forEach(app.chartCommons.drillDown.filters, function(d) {
                _.forEach(d.drillDown, function(dd) {
                    $scope.otherFilters.push({
                        key: dd.key,
                        keyCaption: JSON.parse(dd.key).join(", "),
                        value: dd.value,
                        valueCaption: JSON.parse(dd.value).join(", "),
                        chartInPageId: d.chartInPageId,
                        datasourceId: d.datasourceId,
                        refreshDatasource: d.refreshDatasource
                    });
                });
            });
            $scope.userControlFilter = [];
            app.chartCommons.userFilter.filters.forEach(function(d) {
                function mapper(func) {
                    switch (func) {
                      case "GetDate":
                        return "امروز";

                      case "MonthToDate":
                        return "از ابتدای ماه تا امروز";

                      case "YearToDate":
                        return "از ابتدای سال تا امروز";

                      case "minData":
                        return "کمترین: " + d.defaultValue[0];

                      case "maxData":
                        return "بیشترین: " + d.defaultValue[0];

                      case "DaysAgo":
                        return persian(d.values[2] || 0) + " روز قبل تا " + persian(d.values[3] || 0) + " روز قبل";

                      case "MonthAgo":
                        return persian(d.values[2] || 0) + " ماه قبل تا " + persian(d.values[3] || 0) + " ماه قبل";
                    }
                    return "";
                }
                var n = {};
                n.key = d.dimensionName;
                n.disableClear = d.disableClear;
                n.chartInPageId = d.chartInPageId;
                if (d.valuesCaption) {
                    n.values = _.map(d.valuesCaption, function(d) {
                        var pattern = /.*&\[(.*)\]/gi;
                        if (d.toString().match(pattern)) {
                            d = d.replace(pattern, "$1");
                        }
                        return d && isNaN(d) ? d.replace(/\[(calc|index)-\d+\]/, "") : d;
                    });
                } else {
                    n.values = _.map(d.values, function(d) {
                        var pattern = /.*&\[(.*)\]/gi;
                        if (d.toString().match(pattern)) {
                            d = d.replace(pattern, "$1");
                        }
                        return d && isNaN(d) ? d.replace(/\[(calc|index)-\d+\]/, "") : d;
                    });
                }
                var msg = n.values.join(", ");
                if (msg.length > 30) {
                    msg = msg.substring(0, 30) + "...";
                }
                n.Caption = $sce.trustAsHtml(filterXSS(msg));
                if (+d.variableType == 3) {
                    n.Caption = $sce.trustAsHtml(filterXSS(mapper(d.values[0])));
                } else if (+d.variableType == 4) {
                    var m = {
                        gr: "بزرگتر",
                        eqgr: "بزرگتر مساوی",
                        ls: "کوچکتر",
                        eqls: "کوچکتر مساوی",
                        eq: "برابر",
                        nteq: "نابرابر"
                    };
                    n.Caption = $sce.trustAsHtml(filterXSS("<b>" + m[d.values[1]] + "</b> " + d.values[0]));
                } else if (+d.variableType == 5) {
                    n.Caption = $sce.trustAsHtml(filterXSS("<b>" + d.values[0] + "</b>" + (d.values[1] == "or" ? " در یکی از " : " در همه ") + ": " + d.values[2]));
                }
                n.refreshDatasource = d.refreshDatasource;
                $scope.userControlFilter.push(n);
            });
        }, 0);
    };
    $scope.removeUserControl = function(i) {
        var d = $scope.userControlFilter[i];
        $scope.userControlFilter.splice(i, 1);
        var filter = _.find(app.chartCommons.userFilter.filters, {
            chartInPageId: d.chartInPageId,
            dimensionName: d.key
        });
        if (!_.isUndefined(filter)) {
            _.remove(app.chartCommons.userFilter.filters, filter);
        }
        var settings = $("#ID" + d.chartInPageId).data("settings");
        var refreshDatasource = [];
        if (d.refreshDatasource) refreshDatasource = d.refreshDatasource;
        if (settings) refreshDatasource = settings.input.RefreshDatasource;
        app.moderation.dashboadpage.refreshRelatedDatasources(refreshDatasource);
    };
    $scope.removeDrillDown = function(i) {
        var d = $scope.otherFilters[i];
        $scope.otherFilters.splice(i, 1);
        var chartDrillDown = _.find(app.chartCommons.drillDown.filters, {
            chartInPageId: d.chartInPageId
        });
        if (!_.isUndefined(chartDrillDown)) {
            _.remove(chartDrillDown.drillDown, {
                key: d.key
            });
        }
        var settings = $("#ID" + d.chartInPageId).data("settings");
        var refreshDatasource = [];
        if (d.refreshDatasource) refreshDatasource = d.refreshDatasource;
        if (settings) refreshDatasource = settings.input.RefreshDatasource;
        app.moderation.dashboadpage.refreshRelatedDatasources(refreshDatasource);
    };
    $scope.clearAll = function() {
        var ds = [];
        _.each($scope.otherFilters, function(d) {
            var settings = $("#ID" + d.chartInPageId).data("settings");
            if (settings && settings.input && _.isArray(settings.input.RefreshDatasource)) {
                ds = _.concat(ds, settings.input.RefreshDatasource);
            }
        });
        _.each($scope.userControlFilter, function(d) {
            var settings = $("#ID" + d.chartInPageId).data("settings");
            if (_.isArray(settings && settings.input && settings.input.RefreshDatasource) && !d.disableClear) {
                ds = _.concat(ds, settings.input.RefreshDatasource);
            }
        });
        app.chartCommons.drillDown.clearAll();
        app.chartCommons.userFilter.filters = _.filter(app.chartCommons.userFilter.filters, {
            disableClear: true
        });
        $scope.refresh();
        app.moderation.dashboadpage.refreshRelatedDatasources(_.uniq(ds));
    };
} ]);

app.filterBox.refresh = function() {
    angular.element("#filter-box-controller").scope().refresh();
    angular.element("#filter-box-controller").scope().$apply();
};

app.moderation = app.moderation || {};

app.moderation.dashboadpage = app.moderation.dashboadpage || {};

app.moderation.dashboadpage.globalFilterList = [];

app.moderation.dashboadpage.syncWithGlobalFilter = function(list) {
    if (list != null) for (var i = 0; i < list.length; i++) {
        var arr = $.grep(app.moderation.dashboadpage.globalFilterList, function(d) {
            return d.Uniquename == list[i].Uniquename && d.DataSourceId == list[i].DataSourceId && d.CubeName == list[i].CubeName;
        });
        if (arr.length != 0) {
            list[i].Members = arr[0].Members.slice();
        }
    }
};

app.moderation.dashboadpage.isRelated = false;

app.moderation.dashboadpage.onRelatedChange = function(flag) {
    app.moderation.dashboadpage.isRelated = flag;
    var charts = app.moderation.dashboadpage.charts;
    for (var i = 0; i < charts.length; i++) {
        var el = $("#ID" + charts[i].pageId);
        var settings = el.data("settings");
        settings.link = "bold";
    }
    if (app.moderation.dashboadpage.isRelated) {
        $(".glyphicon-link").show();
    } else {
        $(".glyphicon-link").hide();
    }
};

app.moderation.dashboadpage.showDimentions = function() {
    var content = $("#corelate-filter-list .filter-content").html();
    if (content.trim() != "") return;
    $(".glyphicon-link").addClass("link");
    var charts = app.moderation.dashboadpage.charts;
    var dimList = [];
    var hasEditPermission = true;
    for (var i = 0; i < charts.length; i++) {
        var el = $("#ID" + charts[i].pageId);
        var settings = el.data("settings");
        var dims = settings.input.Dimentions;
        if (!settings.input.EditPermission) {
            hasEditPermission = false;
            continue;
        }
        for (var key in dims) {
            for (var j = 0; j < dims[key].length; j++) {
                var el = {
                    Uniquename: dims[key][j],
                    DataSourceId: settings.input.DataSourceId,
                    CubeName: settings.input.CubeName,
                    ChartId: settings.chartId
                };
                var aa = $.grep(dimList, function(e) {
                    return e.Uniquename == el.Uniquename && e.DataSourceId == el.DataSourceId && e.CubeName == el.CubeName;
                });
                if (aa.length == 0) dimList.push(el);
            }
        }
    }
    var filterlist = $("#corelate-filter-list .filter-content");
    filterlist.html('<div style="padding:3px"><img style="width: 1.3em" src="' + app.urlPrefix + 'Images/progress.gif" /><span  data-trans-key="در حال بارگذاری..."></span></div>');
    if (dimList.length == 0) {
        $("#corelate-filter-list .filter-content").empty();
        $("#corelate-filter-list .filter-content").html(!hasEditPermission ? "شما مجوز استفاده از این امکان را ندارید." : "");
    } else {
        $.ajax({
            type: "post",
            url: app.urlPrefix + "Charts/DashboardPage/GetHierarchies",
            data: JSON.stringify(dimList),
            contentType: "application/json; charset=utf-8"
        }).done(function(data) {
            $("#corelate-filter-list .filter-content").empty();
            if (!data.result) {
                $("#corelate-filter-list .filter-content").html(filterXSS(data.message));
                return;
            }
            function convertToUl(data, index) {
                if (data != null) {
                    var result = '<div class="container-fluid form-horizontal " style="margin-bottom:-15px;"><div class="form-group">';
                    var lastDataSourceId = 0;
                    var counter = 0;
                    for (var i = 0; i < data.length; i++) {
                        var item = data[i];
                        if (item.Members == null) continue;
                        if (i > 0 && (counter == 3 || lastDataSourceId != item.DataSourceId)) {
                            result += '</div><div class="form-group">';
                            counter = 0;
                        }
                        if (lastDataSourceId != item.DataSourceId && i > 0) result += '<hr style="margin-top: 5px;;"/>';
                        counter++;
                        lastDataSourceId = item.DataSourceId;
                        result += '<div class="col-md-4">                                    <div class="btn btn-default col-md-12 filter-member-dialog" style="overflow: hidden; text-overflow: ellipsis;"                                            CubeName="' + filterXSS(item.CubeName) + '" DataSourceId="' + item.DataSourceId + '" Uniquename="' + filterXSS(item.Uniquename) + '"                                             title="' + filterXSS(item.Caption) + '">' + filterXSS(item.Caption) + "</div></div>";
                    }
                }
                result += "</div></div>";
                return result;
            }
            function createOption(data) {
                if (data != null) {
                    var result = '<div class="container-fluid form-horizontal " style="margin-bottom:-15px;"><div class="form-group">';
                    for (var i = 0; i < data.length; i++) {
                        var item = data[i];
                        if (item.Members == null) continue;
                        if (i % 3 == 0 && i > 0) result += '</div><div class="form-group">';
                        var option = "";
                        for (var j = 0; j < Math.min(item.Members.length, 500); j++) {
                            option += '<option value="' + filterXSS(item.Members[j].Uniquename) + '">' + filterXSS(item.Members[j].Caption) + "</option>";
                        }
                        result += '<div class="">                                    <div  style="" class="col-md-4">                                    <select class="form-control" data-selected-text-format="count>3" data-live-search="true" multiple                                             CubeName="' + filterXSS(item.CubeName) + '" DataSourceId="' + item.DataSourceId + '" Uniquename="' + filterXSS(item.Uniquename) + '"                                             title="' + filterXSS(item.Caption) + '">' + option + "</select></div></div>";
                    }
                }
                result += "</div></div>";
                return result;
            }
            var ul = convertToUl(data.data, "");
            filterlist.html(ul);
            filterlist.find(".filter-member-dialog").on("click", function() {
                var btn = $(this);
                var Uniquename = $(this).attr("Uniquename");
                var DataSourceId = $(this).attr("DataSourceId");
                var CubeName = $(this).attr("CubeName");
                var element = $.grep(data.data, function(d, i) {
                    return d.Uniquename == Uniquename && d.DataSourceId == DataSourceId && d.CubeName == CubeName;
                })[0];
                app.helper.filterMemberDialog(element.Members, function(mem) {
                    element.Members = mem;
                    var selectedElements = mem.filter(function(d) {
                        return d.IsChecked;
                    }).map(function(d) {
                        return d.Caption;
                    });
                    var text = element.Caption;
                    if (selectedElements.length > 3) text = "انتخاب " + selectedElements.length + " از " + mem.length; else if (selectedElements.length > 0) text = selectedElements.join(" و ");
                    btn.text(text);
                    app.moderation.dashboadpage.getWheres(element, element.DataSourceId);
                });
            });
        });
    }
};

app.moderation.dashboadpage.getWheres = function(data, refreshGlobalFilter) {
    if (typeof refreshGlobalFilter != "undefined") {
        var mems = $.grep(data.Members, function(d) {
            return d.IsChecked;
        });
    }
    if (!app.moderation.dashboadpage.isRelated) return;
    var filterList = app.moderation.dashboadpage.globalFilterList;
    var charts = app.moderation.dashboadpage.charts;
    var found = false;
    for (var i = 0; i < filterList.length; i++) {
        var d = filterList[i];
        if (d.Uniquename == data.Uniquename && d.DataSourceId == data.DataSourceId && d.CubeName == data.CubeName) {
            filterList[i] = $.extend({}, data);
            found = true;
        }
    }
    if (!found) filterList.push($.extend({}, data));
    for (var i = 0; i < charts.length; i++) {
        var el = $("#ID" + charts[i].pageId);
        var settings = el.data("settings");
        if (settings.input.DataSourceId == data.DataSourceId && settings.input.CubeName == data.CubeName && $("#ID" + charts[i].pageId + " .glyphicon-link").hasClass("link")) {
            var f1 = $.inArray(data.Uniquename, settings.input.Dimentions.Where) != -1;
            var f2 = $.inArray(data.Uniquename, settings.input.Dimentions.Hierarchies) != -1;
            var f3 = $.inArray(data.Uniquename, settings.input.Dimentions.SeriesLevel) != -1;
            var filter = el.find("#filter").data("data");
            if (typeof filter != "undefined") {
                app.moderation.dashboadpage.syncWithGlobalFilter(filter.Where);
                app.moderation.dashboadpage.syncWithGlobalFilter(filter.Hierarchies);
                app.moderation.dashboadpage.syncWithGlobalFilter(filter.SeriesLevel);
            }
            settings.titlebar.showProgress(true);
            var newData = $.extend({}, data);
            newData.Members = $.grep(data.Members, function(d) {
                return d.IsChecked;
            });
            settings.parameters = {
                ChartInPageId: settings.ChartInPageId,
                Filter: [ newData ]
            };
            app.chartCommons.levelTypeUtils.getParam(settings);
            el.charts(settings.type, "refreshWithData", settings);
        }
    }
};

app.moderation.dashboadpage.refreshRelatedDatasources = function(relatedDatasource, noRefreshChartPageId) {
    noRefreshChartPageId = noRefreshChartPageId || [];
    relatedDatasource = relatedDatasource || [];
    noRefreshChartPageId = noRefreshChartPageId.map(function(d) {
        return +d;
    });
    var j = 0;
    $(".bar-chart").each(function(i) {
        $el = $(this);
        var s = $el.data("settings");
        if (typeof s == "undefined") {
            return;
        }
        var config = app.customChart.getConfig(s.type);
        if (config.needData === false) {
            return;
        }
        if (typeof s !== "undefined" && typeof s.input !== "undefined" && !s.input.disableFilter) {
            if (noRefreshChartPageId.indexOf(+s.ChartInPageId) !== -1) return;
            var a = _.difference(relatedDatasource, s.input.RefreshDatasource);
            if (a.length === relatedDatasource.length) return;
            if (+s.type !== 7) j++;
            setTimeout(function($el) {
                if (s.titlebar && s.titlebar.showProgress) {
                    s.titlebar.showProgress(true);
                }
                app.chartCommons.levelTypeUtils.getParam(s);
                $el.charts(s.type, "refreshWithData", s, {
                    refreshRelatedDatasources: false
                });
            }, +s.type == 7 ? 0 : j * app.chartLoadDelay, $el);
        }
    });
};

app.moderation.dashboadpage.selectValueOnChart = function(data, RefreshDatasource) {
    var cId = data.chartInPageId;
    if (+data.Id == -1) {
        app.chartCommons.userFilter.setFilter({
            id: data.Id,
            values: data.Values,
            variableType: data.VariableType,
            dimensionName: data.dimensionName,
            chartInPageId: data.chartInPageId,
            datasourceId: data.datasourceId
        });
        app.moderation.dashboadpage.refreshRelatedDatasources(RefreshDatasource, [ +cId ]);
        app.filterBox.refresh();
        return;
    } else {
        $.ajax({
            type: "POST",
            url: app.urlPrefix + "Moderation/GlobalVariable/SetValueForUser",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            traditional: true,
            data: JSON.stringify(data),
            success: function(data) {
                if (data.result) {
                    app.moderation.dashboadpage.refreshRelatedDatasources(data.relatedDatasource, [ +cId ]);
                    app.filterBox.refresh();
                } else {
                    alert(data.Message);
                }
            }
        });
    }
};

var app = app || {};

app.dashboardLayoutVersion = 2;

var dashboard = {
    defuals: {
        maxCols: 12
    },
    charts: [],
    pageInfo: {},
    pageId: -1,
    arrangePer: false,
    minChartSize: {
        1: [ 500, 250 ],
        2: [ 350, 350 ],
        3: [ 300, 200 ],
        4: [ 300, 300 ],
        5: [ 500, 300 ],
        6: [ 300, 200 ],
        7: [ 350, 50 ],
        8: [ 300, 300 ],
        9: [ 300, 300 ]
    },
    padding: 10,
    maxCols: 12,
    baseDimantion: {
        y: 30
    },
    serialize: function() {
        var s = dashboard.gs.serialize();
    },
    drillDownResize: function(settings, barHeight) {},
    setMaxCols: function() {
        var layouts = dashboard.getPagePosition();
        dashboard.maxCols = layouts ? layouts.maxCol || 12 : 12;
        $("#dashboard-col").val(dashboard.maxCols);
    },
    setInfo: function(charts, pageInfo, pageId, arrangePer, forms) {
        this.arrangePer = arrangePer || false;
        this.charts = charts || [], this.pageInfo = pageInfo || {
            chartsOrder: [],
            layout: [],
            pageLayout: "30_30_30"
        };
        this.pageId = pageId || -1;
        this.forms = forms || [];
        this.charts = this.charts.concat(this.forms);
        this.setMaxCols();
    },
    disable: function() {
        dashboard.gs.disable();
        dashboard.gs.disable_resize();
    },
    enable: function() {
        dashboard.gs.enable();
        dashboard.gs.enable_resize();
    },
    saveSerialize: function() {
        dashboard.serializeData = dashboard.gs.serialize();
        var pos = dashboard.serializeData.map(function(d) {
            var id;
            if (d.type === "form") {
                id = d.id;
            } else {
                id = d.data.ChartInPageId;
            }
            return {
                type: d.type,
                chartIdPageId: id,
                col: d.wgd.col,
                row: d.wgd.row,
                size_x: d.wgd.size_x,
                size_y: d.wgd.size_y
            };
        });
        var data = {
            pageId: this.pageId,
            chartsPosition: pos,
            media: dashboard.media,
            maxCol: dashboard.maxCols
        };
        try {
            if (typeof dashboard.pageInfo.layout == "undefined") dashboard.pageInfo.layout = [];
            var positions = dashboard.pageInfo.layout.filter(function(p) {
                return p.media === dashboard.media;
            });
            if (positions.length > 0) positions[0].chartsPosition = pos; else dashboard.pageInfo.layout.push({
                media: dashboard.media,
                chartsPosition: pos,
                maxCol: dashboard.maxCols
            });
        } catch (e) {}
        $.ajax({
            type: "POST",
            url: app.urlPrefix + "Charts/DashboardPage/SetChartsOrder",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            traditional: true,
            data: JSON.stringify(data),
            success: function(data) {}
        });
    },
    add: function(el, size_x, size_y, col, row) {
        size_x = size_x > dashboard.maxCols ? dashboard.maxCols : size_x;
        col = col > dashboard.maxCols ? dashboard.maxCols : col;
        dashboard.gs.add_widget(el, size_x, size_y, col, row);
    },
    initGs: function(designPermission) {
        dashboard.baseDimantion = {
            x: $(".gridster").width() / dashboard.maxCols,
            y: 50
        };
        dashboard.gs = $(".gridster>div").gridster({
            widget_margins: [ 0, 0 ],
            widget_base_dimensions: [ dashboard.baseDimantion.x, dashboard.baseDimantion.y ],
            max_cols: dashboard.maxCols,
            min_cols: dashboard.maxCols,
            min_rows: 1e3,
            resize: {
                enabled: true,
                stop: function(event, ui, el) {
                    dashboard.saveSerialize();
                    var type = $(el).data("type");
                    if (type === "form") return;
                    var s = $(el).find(".chart-data").data("settings");
                    s.isDashboardResize = true;
                    $(el).find(".chart-data").charts(s.type, "refresh", s);
                    s.widgetSize.size_y = +$(el).attr("data-sizey");
                    s.widgetSize.size_x = +$(el).attr("data-sizex");
                }
            },
            serialize_params: function($w, wgd) {
                var type = $w.data("type");
                var id = $w.data("id");
                return {
                    type: type,
                    id: id,
                    data: $w.find(".chart-data").data("settings"),
                    wgd: wgd
                };
            },
            draggable: {
                handle: ".content > .move, content > .move b",
                cancel: ".desc",
                start: function(event, ui) {},
                drag: function(e, u) {},
                stop: function(e, ui) {
                    $(ui.$helper).removeClass("player-revert");
                    dashboard.saveSerialize();
                }
            }
        }).data("gridster");
        if (!designPermission) {
            dashboard.gs.disable();
            dashboard.gs.disable_resize();
        }
        return dashboard.gs;
    },
    deleteAll: function() {
        var data = $("#ID0").data("settings");
        dashboard.gs.remove_widget($("#ID0"));
    },
    deleteChartFromGs: function(id, callback) {
        var wg = $(id).parents(".chart-widget");
        dashboard.gs.remove_widget(wg);
        if (callback) callback();
    },
    getPagePosition: function() {
        var p = dashboard.pageInfo.layout.filter(function(p) {
            return p.media <= dashboard.media;
        }).sort(function(a, b) {
            return +b.media - +a.media;
        });
        if (p.length == 0) {
            var media = _.map(dashboard.pageInfo.layout, function(d) {
                return d.media;
            });
            var index = -1;
            var delta = 1e3;
            _.each(dashboard.pageInfo.layout, function(d, i) {
                var _del = Math.abs(d.media - dashboard.media);
                if (_del < delta) {
                    delta = _del;
                    index = i;
                }
            });
            if (index != -1) {
                p = [ dashboard.pageInfo.layout[index] ];
                p[0].media = media;
                p[0].maxCols = dashboard.maxCols;
            }
        }
        return p[0];
    },
    getChartPosition: function(item, type, chartInPageId) {
        var widgetType = null;
        var chartType = 1e3;
        var widgetId;
        if (item.type === "form") {
            widgetType = "form";
            widgetId = item.id;
        } else {
            widgetId = item.pageId;
            chartType = +item.type;
        }
        var ds = dashboard.minChartSize[+chartType] || [ 300, 300 ];
        var wgd = {
            col: 1,
            row: 1e3,
            size_x: Math.floor(ds[0] / dashboard.baseDimantion.x) + 1,
            size_y: Math.floor(ds[1] / dashboard.baseDimantion.y) + 1
        };
        var chartPos = [];
        try {
            var positions = dashboard.getPagePosition();
            chartPos = positions.chartsPosition.filter(function(p) {
                return p.chartIdPageId === widgetId && (!p.type || p.type === widgetType);
            });
        } catch (e) {}
        return chartPos[0] || wgd;
    },
    sortCharts: function() {
        try {
            this.charts.sort(function(a, b) {
                try {
                    var aId = dashboard.getChartPosition(a);
                    var bId = dashboard.getChartPosition(b);
                    var o = aId.row == bId.row ? aId.col > bId.col ? 1 : aId.col < bId.col ? -1 : 0 : aId.row > bId.row ? 1 : aId.row < bId.row ? -1 : 0;
                    return o;
                } catch (e) {
                    return -1e3;
                }
            });
        } catch (e) {
            Error(e);
        }
    },
    addTasks: [],
    drow: function(onFinish) {
        dashboard.initGs(this.arrangePer);
        dashboard.sortCharts();
        var i = 0;
        this.charts.forEach(function(d, ci) {
            if (+d.type != 7) i++;
            var j = i;
            var t = setTimeout(function() {
                dashboard.addChart(d, null, false, j * app.chartLoadDelay);
                if (ci == dashboard.charts.length - 1 && onFinish) {
                    onFinish();
                }
            }, ci * 50);
            dashboard.addTasks.push(t);
        });
    },
    resize: function() {
        this.setMaxCols();
        var chartOpts = $(".chart-data").map(function(i, d) {
            return $(d).data("settings");
        }).toArray();
        $(".gridster").remove();
        $("#dashboard-chart-panel").html('<div class="gridster"><div></div></div>');
        dashboard.initGs(this.arrangePer);
        chartOpts.forEach(function(d) {
            dashboard.addChart(null, d, true);
        });
        if (dashboard.forms) {
            _.each(dashboard.forms, function(form) {
                dashboard.addChart(form);
            });
        }
    },
    addChart: function(d, opt, refresh, delay, container) {
        var div;
        if (d && d.type === "form") {
            var wgd = dashboard.getChartPosition(d);
            var editLink = app.absoluteUrl + "sadaf/management/#/forms/" + d.id;
            var needFilterIcon = false;
            var removeLink = "javascript:dashboard.deleteForm(" + d.id + ")";
            var CanExportXlsx = false;
            var desc = "";
            div = $('<div data-type="form" data-id="' + d.id + '" class="chart-widget"></div>');
            var chartTemplate = dashboard.getFormTemplate(this.arrangePer, d.permissions.EditPermission, editLink, removeLink, needFilterIcon, d.name, id, d.lastRefresh, desc, CanExportXlsx);
            div.append(chartTemplate);
            div.find(".title-content").text(d.name);
            dashboard.add(div, wgd.size_x, wgd.size_y, wgd.col, wgd.row);
            $("body").trigger("form-widget-add", [ d.id ]);
            app.lang.setLang({
                selector: "div[data-type=form][data-id=" + d.id + "]"
            });
        } else {
            if (typeof delay == "undefined") delay = 0;
            if (opt) {
                d = {
                    id: opt.chartId,
                    pageId: opt.ChartInPageId,
                    title: typeof opt.title != "undefined" ? opt.title : opt.input.title,
                    type: opt.type.id,
                    isCustom: opt.type.isCustom,
                    permissions: opt.permissions,
                    lastRefresh: opt.lastRefresh,
                    desc: opt.desc
                };
            }
            var data = {
                chartId: d.id,
                ChartInPageId: d.pageId
            };
            var id = "ID" + d.pageId;
            div = $("<div class='chart-widget cid" + d.pageId + "'></div>");
            var decodedOptions = opt;
            if (!opt) {
                decodedOptions = JSON.parse(d.detail);
            }
            var config = app.customChart.getConfig({
                isCustom: d.isCustom,
                id: +d.type
            });
            var needData = config.needData !== false;
            var info = decodedOptions.chartProp.info || {};
            if (d.isCustom) {
                info = decodedOptions.chartProp.general.info || {};
            }
            if (info.dontShowTitle === true) {
                config.noTitle = true;
            }
            if (info.noPadding === true) {
                config.noPadding = true;
            }
            var CanExportXlsx = !needData || !d.isCustom && +d.type == 7 ? false : true;
            var needFilterIcon = !needData || !d.isCustom && +d.type == 7 ? false : true;
            var editLink = app.absoluteUrl + "sadaf/management/#/charts/edit/0/" + data.chartId;
            var removeLink = "javascript:dashboard.deleteChart(" + data.ChartInPageId + ", " + data.chartId + ", " + d.permissions.DeletePermission + ")";
            var desc = $("<p />");
            if (!_.isEmpty(d.desc)) {
                desc.html("<br/><b>" + app.lang.translate("desc") + ":</b> ");
                desc.append($("<span />").text(d.desc));
            }
            var isCobmo = decodedOptions.dataType == "combo-kpi";
            var chartTemplate = dashboard.getChartTemplate(this.arrangePer, d.permissions.EditPermission, editLink, removeLink, needFilterIcon, d.title, id, d.lastRefresh, desc, CanExportXlsx, isCobmo, config, info);
            div.append(chartTemplate);
            div.find(".title-content").text(d.title);
            div.find(".desc-content").append(desc);
            if (info.backgroundColor) {
                div.find(".ui.card ").css("background", info.backgroundColor);
            }
            if (info.titleFont) {
                div.find(".ui.card .title-content").css({
                    "font-size": info.titleFont.fontSize,
                    color: info.titleFont.color,
                    "font-family": info.titleFont.fontName,
                    "font-weight": info.titleFont.bold ? "bold" : "normal",
                    "font-style": info.titleFont.italic ? "italic" : "normal"
                });
                div.find(".ui.card .title").css({
                    "text-align": info.titleFont.align
                });
            }
            if (config.noPadding) {
                div.find(".ui.card .title + .description").addClass("chart-fit-to-container");
            }
            if (!d.permissions.Filter) {
                div.find(".icon.filter").remove();
            }
            if (!d.permissions.Description) {
                div.find(".icon.info").remove();
            }
            if (!d.permissions.Comment) {
                div.find(".icon.comments").remove();
            }
            if (!d.permissions.ExportExcel) {
                div.find(".item.export-excel").remove();
            }
            if (d.isCustom) {
                div.find(".export-png").remove();
            }
            var opt = opt || $.extend({
                permissions: d.permissions,
                parameters: data,
                chartId: data.chartId,
                editLink: editLink,
                removeLink: removeLink,
                RemoveFromPage: this.arrangePer,
                ChartInPageId: d.pageId,
                input: {
                    RefreshDatasource: d.RefreshDatasource
                },
                lastRefresh: d.lastRefresh,
                desc: d.desc,
                type: d.type,
                isCustom: d.isCustom
            }, decodedOptions);
            wgd = dashboard.getChartPosition(d);
            opt.widgetSize = wgd;
            if (container) {
                if (refresh) {
                    container.find(".chart-data").charts(opt.type, refresh, opt);
                } else {
                    container.append(div);
                    div.find(".menu-bar ").remove();
                    div.find(".chart-data").charts(opt.type, opt);
                }
                return;
            } else {
                dashboard.add(div, wgd.size_x, wgd.size_y, wgd.col, wgd.row);
            }
            if (refresh) {
                div.find(".bar-chart").data("settings", opt);
                div.find(".chart-data").charts({
                    id: d.type,
                    isCustom: d.isCustom
                }, "refresh", opt, true);
            } else {
                var t = setTimeout(function() {
                    div.find(".chart-data").charts({
                        id: d.type,
                        isCustom: d.isCustom
                    }, opt);
                }, !d.isCustom && +d.type === 7 ? 0 : delay);
                dashboard.addTasks.push(t);
            }
            app.lang.setLang({
                selector: ".chart-widget.cid" + d.pageId
            });
        }
        div.find(".show-extra-info").on("click", function() {
            div.find(".ui.card .ui.dimmer.overflow-auto").dimmer("show");
        });
        div.find(".dimmer-info").on("click", function() {
            div.find(".ui.card .ui.dimmer").dimmer("hide");
        });
        div.find(".refresh-chart").on("click", function() {
            div.find(".chart-data").charts({
                id: d.type,
                isCustom: d.isCustom
            }, "refreshWithData", opt, true);
            div.find(".bar-chart").data("settings").titlebar.showProgress(true);
        });
        div.find(".export-excel").on("click", function() {
            var s = div.find(".chart-data").data("settings");
            app.chartCommons.setFilterParameter(s);
            $.ajax({
                type: "POST",
                url: app.urlPrefix + "Charts/BarChart/ExportToExcel",
                data: JSON.stringify({
                    ChartId: opt.chartId,
                    ChartInPageId: opt.ChartInPageId,
                    TableInfo: decodedOptions.TableInfo,
                    IsPivot: +decodedOptions.chartProp.info.aggregation === 1,
                    drillDown: s.parameters.drillDown,
                    userControlFilter: s.parameters.userControlFilter,
                    userVariable: s.parameters.userVariable,
                    otherFilters: s.parameters.otherFilters,
                    filterHierarchy: app.chartCommons.getFilterHierarchy(opt.ChartInPageId)
                }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(data) {
                    window.location = app.urlPrefix + "Charts/BarChart/Download?name=" + data.id;
                }
            });
        });
        div.find(".export-png").on("click", function() {
            var root = div.get(0);
            html2canvas(root, {
                background: null,
                scale: 5,
                useCORS: true,
                onclone: function(dc) {
                    $(dc).find(".cid" + d.pageId + " .header").remove();
                    $(dc).find(".cid" + d.pageId + " .title").remove();
                    $(dc).find(".cid" + d.pageId + " #sort_checkbox").remove();
                    $(dc).find(".cid" + d.pageId + " .comment").remove();
                    $(dc).find(".cid" + d.pageId + " .ui.card").css("background", "none");
                    $(dc).find(".cid" + d.pageId + " rect.background").css("fill", "none");
                    $(dc).find(".cid" + d.pageId + " .line-chart .line").css("fill", "none");
                    $(dc).find(".cid" + d.pageId + " .line-chart circle").css("fill", "#fff");
                    $(dc).find(".cid" + d.pageId + " .pie-chart polyline").css("fill", "none");
                    $(dc).find(".cid" + d.pageId + " .pie-chart polyline").css("stroke-width", "1px");
                    $(dc).find(".cid" + d.pageId + " .pie-chart polyline").css("stroke", "#000");
                    $(dc).find(".cid" + d.pageId + " *").css("font-family", "IRANSans,Droid,Tahoma,Arial");
                    $(dc).find(".cid" + d.pageId + " .map-container  #state-borders").css("fill", "none");
                }
            }).then(function(canvas) {
                canvas.fillStyle = null;
                canvas.fillRect = null;
                canvas.toBlob(function(blob) {
                    saveAs(blob, d.title + ".png");
                });
            });
        });
        div.find(".export-print").on("click", function() {
            app.print.printSingle(".cid" + d.pageId, d.title);
        });
        div.find(".clone-chart").on("click", function() {
            app.post(app.urlPrefix + "Moderation/Charts/CloneChart", {
                Id: opt.chartId,
                PageId: dashboard.pageId
            }, function(data) {
                if (data.result && data.insertedId) {
                    var id = data.insertedId;
                    var link = app.urlPrefix + "api/dashboards/getSingleChartInfo?chartId=" + id + "&chartInPageId=" + data.chartInPageId;
                    $.get(link, function(data2) {
                        dashboard.charts.push(data2);
                        dashboard.addChart(data2, null, false);
                        $("html, body").animate({
                            scrollTop: $(document).height() - $(window).height()
                        }, 1e3);
                    });
                }
            });
        });
        div.find(".chart-dimentions").on("click", function() {
            div.find(".chart-dimentions-content").transition("fade up");
            div.find(".chart-dimentions").transition("fade");
        });
        div.find(".show-chart-dimensions").on("click", function() {
            var filter = div.find(".chart-dimentions-content");
            div.find(".chart-dimentions-content").transition("fade up");
            div.find(".chart-dimentions").transition("fade");
            if (filter.html() == "") {
                filter.html('<div class="ui text active loader">در حال بارگذاری</div>');
                $.ajax(app.urlPrefix + "api/chartdata/GetChart?Id=" + opt.chartId + "&ChartInPageId=" + opt.ChartInPageId).done(function(data) {
                    filter.data("data", data);
                    var hierarchyHtml = null, ProvisionHtml = null, SeriesLevelHtml = null;
                    function convertToUl(data, index) {
                        if (data != null) {
                            return "<ul class='sortable list-unstyled pointer' index='" + index + "'>" + data.map(function(item, i) {
                                if (!item.ShowFilter) {
                                    return '<li value="' + filterXSS(item.Uniquename) + '"> ' + filterXSS(item.Caption) + "</li>";
                                }
                                return '<li value="' + filterXSS(item.Uniquename) + '">  ' + filterXSS(item.Caption) + '<i class="icon filter filter-member-dialog" style="float:left; margin-right:5px;"></i></li>';
                            }).join("") + "</ul>";
                        }
                        return "";
                    }
                    hierarchyHtml = convertToUl(data.Hierarchies, "Hierarchies");
                    ProvisionHtml = convertToUl(data.Where, "Where");
                    SeriesLevelHtml = convertToUl(data.SeriesLevel, "SeriesLevel");
                    var table = '<table class="ui single line unstackable table chart-design" xstyle="display:none" xstyle="position:absolute;margin-bottom:0px; background-color:#fff;display:none; border-bottom:1px solid silver">                                           <thead><tr class="">                                             <th style="' + (SeriesLevelHtml == "" ? "display:none" : "") + '"><span data-trans-key="شاخص‌ها (ستون‌های عددی)" > </span> </th>                                             <th style="' + (hierarchyHtml == "" ? "display:none" : "") + '"><span data-trans-key="ابعاد (ستون‌های رشته‌ای)" > </span> </th>                                             <th style="' + (ProvisionHtml == "" ? "display:none" : "") + '"><span data-trans-key="شرط" > </span></th>                                         </tr></thead>                                         <tr>                                             <td  style="' + (SeriesLevelHtml == "" ? "display:none" : "") + '"id="div-x" class="myc">' + SeriesLevelHtml + '</td>                                             <td  style="' + (hierarchyHtml == "" ? "display:none" : "") + '"id="div-y" class="myc">' + hierarchyHtml + '</td>                                             <td  style="' + (ProvisionHtml == "" ? "display:none" : "") + '"id="div-where" class="myc">' + ProvisionHtml + "</td>                                         </tr>                                     </table>";
                    filter.html(table);
                    function onChange() {
                        function sortDataHierarchies(data, index) {
                            var array = data[index];
                            var newAr = [];
                            filter.find("ul[index=" + index + "] li").each(function(i, d) {
                                var Uniquename = $(this).attr("value");
                                var item = $.grep(array, function(d) {
                                    return d.Uniquename == Uniquename;
                                })[0];
                                item.Members = $(this).data("members");
                                newAr.push(item);
                            });
                            data[index] = newAr;
                        }
                        sortDataHierarchies(data, "Hierarchies");
                        sortDataHierarchies(data, "Where");
                        sortDataHierarchies(data, "SeriesLevel");
                        var onFilterChange = function(data) {
                            opt.parameters = {
                                filterHierarchy: app.chartCommons.getFilterHierarchy(opt.ChartInPageId),
                                chartId: opt.chartId,
                                ChartInPageId: opt.ChartInPageId
                            };
                            $("#ID" + opt.ChartInPageId).charts({
                                id: opt.type,
                                isCustom: opt.isCustom
                            }, "refreshWithData", opt, {
                                refreshRelatedDatasources: false
                            });
                        };
                        onFilterChange(data);
                    }
                    filter.find(".filter-member-dialog").on("click", function() {
                        var el = $(this).parent();
                        var Uniquename = $(this).parent().attr("value");
                        var array = data[$(this).closest("ul").attr("index")];
                        var element = $.grep(array, function(d, i) {
                            return d.Uniquename == Uniquename;
                        })[0];
                        var members = $(this).parent().data("members");
                        var link = app.urlPrefix + "api/chartdata/GetMemberOfFilterHierarchy?Uniquename=" + Uniquename + "&Id=" + opt.chartId + "&ChartInPageId=" + opt.ChartInPageId;
                        if (typeof members == "undefined") {
                            $.ajax(link).done(function(d) {
                                $(this).parent().data("members", d);
                                showDialog(d, link);
                            });
                        } else {
                            showDialog(members, link);
                        }
                        function showDialog(members, link) {
                            app.helper.filterMemberDialog(members, link, function(mem) {
                                el.data("members", mem);
                                onChange();
                            });
                        }
                    });
                    filter.find(".sortable").sortable({
                        start: function(e, ui) {
                            ui.placeholder.addClass("filter-placeholder");
                            ui.placeholder.height(ui.item.height());
                            ui.placeholder.width(ui.item.width());
                            ui.placeholder.parent().width(ui.item.width());
                            ui.placeholder.parent().parent().width(ui.item.width());
                        },
                        stop: function(e, ui) {
                            onChange();
                        }
                    });
                    app.lang.setLang({
                        selector: filter.selector
                    });
                });
            }
        });
        div.find(".dropdown").lazyDropdown({
            onShow: function(e, i) {
                div.find(".menu-bar").addClass("show-dropdown");
            },
            onHide: function(e, i) {
                div.find(".menu-bar").removeClass("show-dropdown");
            }
        });
        this.showEmptyMessageIfNeed();
    },
    showEmptyMessageIfNeed: function() {
        if (dashboard.charts.length == 0) {
            if ($("#chart-empty-message").hasClass("hidden")) $("#chart-empty-message").transition("scale in");
        } else {
            if (!$("#chart-empty-message").hasClass("hidden")) $("#chart-empty-message").transition("scale out");
        }
    },
    deleteChart: function(cId, chartId, deletePermission) {
        if (cId) {
            if (deletePermission) $("#deleteChart .checkbox").show(); else $("#deleteChart .checkbox").hide();
            $("#deleteChart").data("cId", cId);
            $("#deleteChart").data("chartId", chartId);
            $("#deleteChart").modal("show");
        } else {
            var cId = $("#deleteChart").data("cId");
            var chartId = $("#deleteChart").data("chartId");
            var removeChartLink = app.urlPrefix + "charts/dashboardPage/removeChartFromPage";
            $("#deleteChart .action-btn").addClass("loading");
            $.post(removeChartLink, {
                ChartInPageId: cId,
                pageId: dashboard.pageId
            }, function(data) {
                if (data == false) {
                    alert("شما مجوز پاک کردن این نمودار را ندارید");
                    return;
                }
                var id;
                for (var i = 0; i < dashboard.charts.length; i++) {
                    if (dashboard.charts[i].pageId == cId) {
                        id = dashboard.charts[i].pageId;
                        dashboard.charts.splice(i, 1);
                        var d = "df";
                    }
                }
                dashboard.deleteChartFromGs("#ID" + id, function() {
                    $(this).remove();
                    dashboard.showEmptyMessageIfNeed();
                });
                $("#deleteChart").modal("hide");
                $("#deleteChart .action-btn").removeClass("loading");
            });
            var deletePermanent = $("#delete-from-dash").prop("checked");
            if (deletePermanent) {
                $.post(app.urlPrefix + "Moderation/Charts/DeleteCharts", {
                    Ids: [ "ChartId-" + chartId ]
                }, function(data) {});
            }
        }
    },
    deleteForm: function(id) {
        $("body").trigger("delete-form", [ id, dashboard.pageId ]);
    },
    setReturnUrl: function(id) {
        localStorage.setItem("returnUrl", window.location.href);
        localStorage.setItem("lastEditedChartId", id);
    },
    getChartTemplate: function(arrangePer, EditPermission, editLink, removeLink, needFilterIcon, title, id, lastRefresh, desc, CanExportXlsx, isCobmo, config) {
        return '<div class="ui card">  <div class="content" style="">    <div class="header ' + (arrangePer ? "move" : "") + '" style="position:absolute; width:50%;z-index:2;">&nbsp;</div><div class="title' + (config.noTitle === true ? " no-title " : arrangePer ? " move" : "") + '">            <div class="menu-bar" style="zz-index:1;">                <i class="icon titlebar-icon" style="xbackground: #fff;width: 100%;position: absolute;display: block;top: 0;height: 100%;"></i>                ' + (!app.mobileMode ? '<div class="ui dropdown" >                        <i class="setting icon chart-setting-icon titlebar-icon"></i>                        <div class=" menu transition hidden" tabindex="-1">                          ' + (EditPermission ? ' <a class="item"  href="' + editLink + '" onclick="dashboard.setReturnUrl(\'' + id + '\')"><span data-trans-key="ویرایش" > </span> <i class="edit outline icon"></i></a>' : "") + "                          " + (EditPermission ? ' <a class="item clone-chart"><span data-trans-key="تکرار" > </span> <i class="clone outline icon"></i></a>' : "") + "                          " + (arrangePer ? '<a class="item" href="' + removeLink + '"><span data-trans-key="حذف نمودار از صفحه" > </span> <i class="trash alternate outline icon"></i></a>' : "") + "                          " + (CanExportXlsx ? '<a class="item export-excel"><span data-trans-key="خروجی اکسل" > </span> <i class="file excel outline icon"></i></a>' : "") + "                          " + (CanExportXlsx ? '<a class="item export-png"><span data-trans-key="export png"> </span> <i class="camera icon"></i></a>' : "") + "                          " + (needFilterIcon ? '<a class="item refresh-chart">' + app.lang.translate("data refresh") + ' <i class="refresh icon"></i></a>' : "") + "                          " + (CanExportXlsx ? '<a class="item export-print"><span data-trans-key="print" > </span> <i class="print icon"></i></a>' : "") + '                        </div>                </div>                <div class=" ">                    ' + (!needFilterIcon ? "" : '<i class="info icon chart-setting-icon show-extra-info pointer titlebar-icon"></i>') + "                    " + (!needFilterIcon || isCobmo ? "" : '<i class="filter icon chart-setting-icon show-chart-dimensions pointer titlebar-icon"></i>') + "                    " + (!needFilterIcon || !app.commentOnChart ? "" : '<i class="comments icon chart-setting-icon show-chart-comments pointer titlebar-icon"></i>') + "                </div>" : !needFilterIcon ? "" : '<i class="info icon chart-setting-icon show-extra-info pointer titlebar-icon"></i>') + "            </div>        " + (config.noTitle === true ? "" : '<span class="title-content"></span>') + '    </div>    <div class="description chart-data bar-chart" id="' + id + '">      <div class="ui active inverted dimmer ">        <div class="ui text loader mini">' + '</div>      </div>    </div>  </div>  <div class="progress-overall"></div>  <div class="chart-dimentions"></div>  <div class="chart-dimentions-content"></div>  <div class="ui dimmer overflow-auto" style="padding:10px;border-radius: ' + (app.mobileMode ? "0" : "4") + 'px !important;"><div class="content"><div class="center"><div class="dimmer-info"><b>' + app.lang.translate("lastUpdate") + ':</b> <span class="last-refresh"> ' + '</span><div class="desc-content">' + "</div></div></div></div></div></div>";
    },
    getFormTemplate: function(arrangePer, EditPermission, editLink, removeLink, needFilterIcon, title, id, lastRefresh, desc, CanExportXlsx) {
        return '<div class="ui card ">  <div class="content" style="">    <div class="header ' + (arrangePer ? "move" : "") + '">            <div class="menu-bar ">                ' + (!arrangePer && !EditPermission ? "" : '<div class="ui dropdown" >                        <i class="setting icon chart-setting-icon"></i>                        <div class=" menu transition hidden" tabindex="-1">                          ' + (EditPermission ? ' <a class="item"  href="' + editLink + '" onclick="dashboard.setReturnUrl(\'' + id + '\')"><span data-trans-key="ویرایش" > </span> <i class="edit icon"></i></a>' : "") + "                          " + (arrangePer ? '<a class="item" href="' + removeLink + '"><span data-trans-key="حذف" > </span> <i class="trash alternate outline icon"></i></a>' : "") + "                                                   </div>                </div>") + '                <div class="">                   <i xclass="info icon chart-setting-icon show-extra-info pointer"></i>                </div>            </div>        <span class="title-content"></span>    </div>    <div class="description form-content " id="' + id + '">      <div class="ui active inverted dimmer ">        <div class="ui text loader tiny">' + app.lang.translate("در حال بارگذاری") + '</div>      </div>    </div>  </div>  <div class="progress-overall"></div>  <div class="chart-dimentions"></div>  <div class="chart-dimentions-content"></div>  <div class="ui dimmer overflow-auto" style="padding:10px;border-radius: 4px !important;"><div class="content"><div class="center"><div class="dimmer-info desc-content"></div></div></div></div></div>';
    },
    setLastRefresh: function(chartInPageId, lastRefresh) {
        var e = $(".cid" + chartInPageId + " .last-refresh");
        e.html(app.chartCommons.lastRefreshDateFormat(lastRefresh));
    }
};

var ngApp = angular.module("sadaf");

ngApp.directive("onFinishRender", [ "$timeout", function($timeout) {
    return {
        restrict: "A",
        link: function(scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function() {
                    scope.$emit(attr.onFinishRender);
                });
            }
        }
    };
} ]);

ngApp.directive("sglclick", [ "$parse", function($parse) {
    return {
        restrict: "A",
        link: function(scope, element, attr) {
            var fn = $parse(attr["sglclick"]);
            var delay = 200, clicks = 0, timer = null;
            element.on("click", function(event) {
                clicks++;
                if (clicks === 1) {
                    timer = setTimeout(function() {
                        scope.$apply(function() {
                            fn(scope, {
                                $event: event
                            });
                        });
                        clicks = 0;
                    }, delay);
                } else {
                    clearTimeout(timer);
                    clicks = 0;
                }
            });
        }
    };
} ]);

ngApp.controller("dashboardPageCtrl", [ "$scope", "$http", "$sce", "$routeParams", "$location", "$timeout", "drawer", "$translate", "$rootScope", "$compile", "formsService", "dashboardContainerService", "chartComments", "iframeService", "datasources", function($scope, $http, $sce, $routeParams, $location, $timeout, drawer, $translate, $rootScope, $compile, formsService, dashboardContainerService, chartComments, iframeService, datasources) {
    $scope.mainMenuType = 2;
    $scope.iframeService = iframeService;
    function setDashboardContainer() {
        _renderBefor = true;
        function setMediaBaseonScreen() {
            if ($(window).width() < 768) {
                dashboard.media = 1;
                dashboard.maxCols = 1;
            } else if ($(window).width() < 992) {
                dashboard.media = 2;
                dashboard.maxCols = 1;
            } else if ($(window).width() < 1200) {
                dashboard.media = 3;
                dashboard.maxCols = 12;
            } else {
                dashboard.media = 4;
                dashboard.maxCols = 12;
            }
            try {
                var layouts = dashboard.getPagePosition();
                dashboard.maxCols = layouts && layouts.length && layouts[0].maxCol || 12;
            } catch (e) {
                Error(e);
            }
            $("#dashboard-col").val(dashboard.maxCols);
            $("#device-selector .icon").removeClass("active");
            $($("#device-selector .icon").get(4 - dashboard.media)).addClass("active");
        }
        setMediaBaseonScreen();
        app.lestenWindowResize(function() {
            if ($("#dashboard-chart-panel").length != 0) {
                setMediaBaseonScreen();
                fixLayout(false);
            }
        });
        function updatePageinfoMaxCol(media, maxCol) {
            if (dashboard.pageInfo && dashboard.pageInfo.layout) {
                var layouts = dashboard.pageInfo.layout.filter(function(p) {
                    return +p.media == +media;
                });
                if (layouts.length > 0) layouts[0].maxCol = maxCol;
            }
        }
        $("#dashboard-col").on("change", function() {
            var layout = dashboard.getPagePosition();
            layout.maxCol = +$(this).val() || dashboard.maxCols;
            dashboard.resize(dashboard.arrangePer);
            dashboard.saveSerialize();
            updatePageinfoMaxCol(dashboard.media, dashboard.maxCols);
        });
        var DELAY = 350, clicks = 0, timer = null;
        $("#device-selector .item").on("click", function(i) {
            var el = $(this);
            $("#device-selector .icon").removeClass("active");
            el.find(".icon").addClass("active");
            dashboard.media = 4 - el.index();
            if (dashboard.pageInfo && dashboard.pageInfo.layout) {
                var layouts = dashboard.getPagePosition();
                dashboard.maxCols = layouts.length > 0 && layouts[0].maxCol ? layouts[0].maxCol : dashboard.media == 4 || dashboard.media == 3 ? 12 : 1;
                $("#dashboard-col").val(dashboard.maxCols);
                dashboard.resize(dashboard.arrangePer);
            }
        });
        var sourceCopy = null;
        var copyHandler = $('<div class="copy-handler"></div>').css("position", "fixed").css("display", "none");
        $("body").append(copyHandler);
        $("#device-selector .icon").mousedown(function(e) {
            var el = e.currentTarget;
            sourceCopy = $(el).attr("id");
            copyHandler.show();
            setTimeout(function() {
                sourceCopy = null;
            }, 3e3);
        });
        $("#device-selector .icon").mouseup(function(e) {
            var el = e.currentTarget;
            target = $(el).attr("id");
            if (sourceCopy != null && sourceCopy != target) {
                var getmedia = function(i) {
                    return i == "laptop" ? 4 : i == "tablet" ? 3 : i == "smartphone-land" ? 2 : 1;
                };
                var i = dashboard.pageInfo.layout.indexOf(dashboard.pageInfo.layout.filter(function(d) {
                    return d.media == +getmedia(target);
                })[0]);
                var source = $.extend({}, dashboard.pageInfo.layout.filter(function(d) {
                    return d.media == +getmedia(sourceCopy);
                })[0]);
                source.media = +getmedia(target);
                dashboard.pageInfo.layout.splice(i, 1, source);
                var temp = dashboard.media;
                dashboard.media = source.media;
                dashboard.saveSerialize();
                dashboard.media = temp;
                sourceCopy = null;
                alert("cope done!");
            }
        });
        $(".freeze-menu").on("hide.bs.collapse", function() {
            $(".freeze-menu").addClass("hide-aff");
        }).on("show.bs.collapse", function() {
            $(".freeze-menu").removeClass("hide-aff");
        });
        $(".freeze-menu").on("affixed.bs.affix", function() {
            $(".freeze-menu.affix").css("width", $("#content_segment").width() + "px");
        });
    }
    setDashboardContainer();
    $translate.use(+$("#lang").val() == 0 ? "fa" : "en");
    $scope.persian = persian;
    $scope.isPersian = +$("#lang").val() == 0;
    drawer.init();
    function notifyParentIframeReady() {
        window.parent.postMessage("ready", "*");
    }
    notifyParentIframeReady();
    $scope.setPath = function(path) {
        $location.path(path);
    };
    $scope.$watch("visible", function(v) {
        if (!v) {
            $scope.formId = 0;
            $scope.rowId = 0;
        }
    });
    $scope.hideForm = function() {
        $(".modal.singletone-edit").modal("hide");
    };
    $scope.formInfo = {
        modalSettings: {
            closable: false,
            observeChanges: true,
            autofocus: false,
            allowMultiple: true
        }
    };
    $scope.dashboardOptions = {
        toggleFav: function() {
            $http.get(app.urlPrefix + "api/favoritemenus/favorite", {
                params: {
                    id: dashboard.pageId,
                    fav: !$scope.dashboardOptions.isFav
                }
            }).then(function(res) {
                $scope.dashboardOptions.isFav = res.data.isFav;
            }).catch(function() {});
        },
        isFav: false
    };
    $scope.publishDashboard = {
        show: function() {
            $scope.publishDashboard.showModal = true;
        },
        showModal: false,
        publishProgress: false,
        publish: false,
        setPublishState: function(url) {
            if (url) {
                $scope.publishDashboard.url = url;
                $scope.publishDashboard.publish = true;
            } else {
                $scope.publishDashboard.publish = false;
            }
        },
        publishing: function(enable) {
            this.publishProgress = true;
            $http.get(app.urlPrefix + "api/dashboards/publish", {
                params: {
                    id: dashboard.pageId,
                    enable: enable
                }
            }).then(function(res) {
                $scope.publishDashboard.publishProgress = false;
                $scope.publishDashboard.setPublishState(res.data);
            }).catch(function() {
                $scope.publishDashboard.publishProgress = false;
            });
        }
    };
    $rootScope.$on("publish-url", function(e, opt) {
        $scope.publishDashboard.setPublishState(opt.url);
    });
    $rootScope.$on("fav", function(e, opt) {
        $scope.dashboardOptions.isFav = opt.isFav;
        $scope.dashboardOptions.showTitle = opt.showTitle;
        $scope.dashboardOptions.showTitleFullscreen = opt.showTitleFullscreen;
    });
    $scope.formSettings = {
        modal: true,
        xc: false,
        selector: "singletone-edit"
    };
    $("body").on("open-form", function(a, formId, rowId, chartSelector) {
        $(".modal.form-editor.singletone-edit").modal($scope.formInfo.modalSettings).modal("show");
        var r = $scope.formSettings["notify"];
        r(formId, rowId);
        $timeout(function() {
            var r = $(".modal.form-editor.singletone-edit .form-controls");
        }, 1e3);
    });
    $("body").on("form-widget-add", function(a, formId) {
        $timeout(function() {
            var div = $("div[data-type=form][data-id=" + formId + "] .form-content");
            div.html('<div class="" sadaf-form id="' + formId + '" settings="{pop:true}"></div>');
            $compile(div)($scope);
        }, 0);
    });
    $("body").on("delete-form", function(a, formId, pageId) {
        $timeout(function() {
            $scope.modal = {
                btnClass: "btn-danger red",
                btnText: app.lang.translate("حذف"),
                inProgress: false,
                body: $sce.trustAsHtml("آیا فرم از صفحه حذف شود؟"),
                ok: function() {
                    $scope.modal.btnText = app.lang.translate("در حال حذف...");
                    formsService.deleteFormFromDashboard(pageId, [ formId ]).then(function(res) {
                        $scope.modal.btnText = app.lang.translate("حذف");
                        $("#dashboard-page-modal").modal("hide");
                        hideModal();
                        var wg = $("div[data-type=form][data-id=" + formId + "]");
                        dashboard.gs.remove_widget(wg);
                    }, function error(err) {
                        $scope.modal.btnText = app.lang.translate("حذف");
                        $scope.modal.inProgress = false;
                        $scope.modal.error = err.data;
                        if (typeof $scope.modal.error.title == "undefined") $scope.modal.error = $sce.trustAsHtml(filterXSS(err.data));
                    });
                }
            };
            showModal();
        }, 0);
    });
    $("body").on("show-chart-comments", function(e, data) {
        $timeout(function() {
            $scope.comment = {
                value: null,
                ok: function() {
                    var filters = app.chartCommons.getFilterParameter(data.chartInPageId, data.input.RefreshDatasource);
                    chartComments.save(0, {
                        chartId: data.chartId,
                        dashboardId: data.dashboardId,
                        datasourceId: data.datasourceId,
                        dimention: data.dimention,
                        input: JSON.stringify(data.input),
                        drillDown: filters.drillDown,
                        otherFilters: filters.otherFilters,
                        userControlFilter: filters.userControlFilter,
                        userVariable: filters.userVariable,
                        where: data.where,
                        comment: $scope.comment.value
                    }).then(function(res) {});
                    $(".ui.modal#input-comments").modal("hide");
                }
            };
            $(".ui.modal#input-comments").modal("show");
            $(".ui.modal#input-comments input[type=text]").off("keyup");
            $(".ui.modal#input-comments input[type=text]").on("keyup", function(e) {
                if (e.keyCode == 13) {
                    $(".ui.modal#input-comments .ui.button.btn-primary").click();
                }
            });
        }, 0);
    });
    $rootScope.$on("permission-change", function(e, permission) {
        $scope.hasEditPermission = permission;
        var visible = $(".dashboard-edit-panel").css("visibility") == "visible";
        if (permission && !visible) {
            $(".dashboard-edit-panel").transition("fade left in");
        }
        if (!permission && visible) {
            $(".dashboard-edit-panel").transition("fade right out");
        }
    });
    $scope.$on("ngRepeatFinished", function() {
        $(".side-menu .ui.dropdown").lazyDropdown({
            onShow: function() {
                $(this).parents(".side-menu-item").addClass("show-dropdown");
            },
            onHide: function() {
                $(this).parents(".side-menu-item").removeClass("show-dropdown");
            }
        });
    });
    var defaultId = +localStorage.getItem("defaultDashboard");
    if ($("#dashboardPublishMenuId").val()) {
        defaultId = $("#dashboardPublishMenuId").val();
    }
    if (!app.mobileMode) {
        function renderMenus(data) {
            $scope.menuCategories = data.data;
            var mdefaultId = data.data.defaultId;
            $scope.reorderPermission = data.data.reorderPermission;
            var activeId = $routeParams.id || defaultId || mdefaultId;
            var appid = $routeParams.appid || data.data.appId || 1;
            if (!$routeParams.id) $location.path("app/" + appid + "/dashboard/" + activeId);
            if ($scope.menuCategories) {
                _.each($scope.menuCategories.data, function(mc) {
                    _.each(mc.menus, function(m) {
                        if (m.menu.Id == activeId) {
                            mc.open = true;
                            mc.active = true;
                            m.active = true;
                        }
                    });
                });
            }
        }
        function check() {
            if ($scope.routeChangeSuccess && $scope.getMenusData) {
                renderMenus($scope.getMenusData);
            }
        }
        $scope.$on("$routeChangeSuccess", function() {
            $scope.routeChangeSuccess = true;
            check();
        });
        var cancel = $scope.$on("$routeChangeSuccess", function() {
            var appid = $routeParams.appid || $("#appId").val() || 1;
            if (+$("#isShared").val() == 1) {
                $scope.getMenusData = {
                    result: true,
                    defaultId: $("#dashboardPublishMenuId").val(),
                    appId: 5,
                    hasAminPermission: false,
                    data: [],
                    hasAddPer: false,
                    reorderPermission: false,
                    licenceRemain: {}
                };
                check();
                return;
            }
            $http.get(app.urlPrefix + "menu/MenuCategories/" + appid).then(function(data) {
                $scope.getMenusData = data;
                check();
                cancel();
            }, function(d) {
                if (!app.mobileMode && d && d.data && d.data.forceSignout) {
                    console.log("مجوز برنامه مشکل دارد.");
                    alert("مجوز برنامه مشکل دارد.");
                    window.location.href = app.urlPrefix + "account/logoff";
                }
            });
        });
    }
    $scope.sortableOptions = {
        disabled: !$scope.editMode,
        stop: function(e, ui) {
            $timeout(function() {
                $scope.isDrag = false;
                var parentCategoryId = $(ui.item).parents(".menu-category").data("id");
                var menuId = $(ui.item).data("id");
                var ids = $(ui.item).parents(".menu-category").find(".dashboard-menu").map(function() {
                    return +$(this).data("id");
                }).toArray();
                $http.post(app.urlPrefix + "menu/ChangeMenuOrder", {
                    list: ids,
                    menuId: menuId,
                    parentCategoryId: parentCategoryId
                }).then(null, function(d) {
                    alert(d.data.title + " - " + d.data.desc);
                });
            }, 0);
        },
        connectWith: ".connected-sortable"
    };
    $scope.sortableCatOptions = {
        disabled: !$scope.editMode,
        stop: function(e, ui) {
            $timeout(function() {
                var v = $(".menu-category").map(function() {
                    return +$(this).data("id");
                }).toArray();
                $http.post(app.urlPrefix + "menu/ChangeMenuCategoryOrder", {
                    list: v
                });
            }, 0);
        }
    };
    $scope.clearActive = function() {
        if ($scope.menuCategories) {
            _.each($scope.menuCategories.data, function(mc) {
                mc.open = false;
                mc.active = false;
                _.each(mc.menus, function(m) {
                    m.active = false;
                });
            });
        }
    };
    $scope.closeAll = function(m) {
        var o = m.open;
        if ($scope.menuCategories && !$scope.editMode) {
            _.each($scope.menuCategories.data, function(mc) {
                mc.open = false;
                mc.active = false;
            });
        }
        m.open = !o;
        m.active = !o;
    };
    $scope.editMode = false;
    $scope.toggleEdit = function() {
        $scope.editMode = !$scope.editMode;
        $("div[ui-sortable=sortableOptions]").sortable("option", "disabled", !$scope.editMode);
        $("div[ui-sortable=sortableCatOptions]").sortable("option", "disabled", !$scope.editMode);
        if ($scope.editMode) {
            $(".icon.sort").transition("set looping").transition("pulse");
        } else {
            $(".icon.sort").transition("remove looping");
        }
    };
    $scope.isFullscreen = $("#isFullscreen").val();
    $scope.fullscreenToggle = function() {
        $scope.isFullscreen = !$scope.isFullscreen;
        toc();
        dashboard.resize();
        $http.get(app.urlPrefix + "api/users/toogleFullscreen?isFullScreen=" + $scope.isFullscreen);
        if (!$scope.isFullscreen) {
            app.autoPlay("stop");
            $scope.slidePlay = false;
        }
    };
    $scope.slidePlayToggle = function() {
        $scope.slidePlay = !$scope.slidePlay;
        if ($scope.slidePlay) {
            app.autoPlay("start", dashboard.PageSwiching || 10);
        } else {
            app.autoPlay("stop");
        }
    };
    $scope.addChart = function() {
        datasources.select(null, {
            type: [ "charts" ]
        }).then(function(res) {
            var ids = _.map(res.selected, function(d) {
                return d.id;
            });
            ids.forEach(function(id) {
                var addLink = app.urlPrefix + "api/dashboards/addChartToPage";
                $.get(addLink, {
                    chartId: id,
                    pageId: dashboard.pageId
                }, function(data) {
                    dashboard.charts.push(data);
                    dashboard.addChart(data, null, false);
                });
            });
        });
    };
    $scope.$on("$locationChangeStart", function(event, newUrl, oldUrl) {
        if (/\/app\/\d+\/dashboard\/\d+/.test($location.path())) {
            var id = +$location.path().replace(/\/app\/\d+\/dashboard\/(\d+)/gi, "$1");
            $scope.clearActive();
            if ($scope.menuCategories && $scope.menuCategories.data) _.each($scope.menuCategories.data, function(mc) {
                _.each(mc.menus, function(m) {
                    if (m.menu.Id == id) {
                        mc.active = true;
                        mc.open = true;
                        m.active = true;
                    }
                });
            });
        }
    });
    $scope.modal = {
        body: $sce.trustAsHtml(""),
        btnClass: "btn-primary",
        btnText: "ذخیره",
        inProgress: false
    };
    function showModal() {
        $(".ui.modal#edit-menus").modal("show");
        $(".ui.modal#edit-menus input[type=text]").off("keyup");
        $(".ui.modal#edit-menus input[type=text]").on("keyup", function(e) {
            if (e.keyCode == 13) {
                $(".ui.modal#edit-menus .ui.button.btn-primary").click();
            }
        });
    }
    function hideModal() {
        $(".ui.modal#edit-menus").modal("hide");
    }
    $scope.addFormSettings = {};
    $scope.onFormSelect = function(forms) {
        $scope.addFormSettings.loaging = true;
        formsService.addFormToDashboard(dashboard.pageId, forms.map(function(d) {
            return d.id;
        })).then(function(data) {
            $scope.addFormSettings.loaging = false;
            $scope.addFormSettings.visible = false;
            _.each(forms, function(f) {
                var item = _.extend({}, f);
                item.type = "form";
                dashboard.charts.push(item);
                dashboard.addChart(item);
            });
        });
    };
    $scope.hideModal = function() {
        hideModal();
    };
    $scope.addMenuToCategory = function(mc) {
        $scope.modal = {
            btnClass: "btn-primary green",
            btnText: app.lang.translate("ساختن"),
            inProgress: false,
            label: app.lang.translate("نام منو را وارد کنید"),
            ok: function() {
                $scope.modal.inProgress = true;
                $scope.modal.btnText = app.lang.translate("در حال ساختن...");
                var link = app.urlPrefix + "Charts/DashboardPage/addMenu";
                $http.post(link, {
                    menuName: $scope.modal.val,
                    menuCategory: mc.category.Id,
                    mainMenu: $routeParams.appid,
                    menulink: ""
                }).then(function(res) {
                    $scope.modal.btnText = app.lang.translate("ساختن");
                    $("#dashboard-page-modal").modal("hide");
                    mc.menus = mc.menus || [];
                    mc.menus.push(res.data);
                    $location.path("/app/" + $routeParams.appid + "/dashboard/" + res.data.menu.Id);
                    hideModal();
                }, function error(err) {
                    $scope.modal.btnText = app.lang.translate("ساختن");
                    $scope.modal.inProgress = false;
                    $scope.modal.error = err.data;
                    if (typeof $scope.modal.error.title == "undefined") $scope.modal.error = $sce.trustAsHtml(filterXSS(err.data));
                });
            }
        };
        showModal();
    };
    $scope.editCategory = function(mc) {
        $scope.modal = {
            btnClass: "btn-primary green",
            btnText: app.lang.translate("تغییر"),
            inProgress: false,
            label: app.lang.translate("نام جدید را وارد کنید"),
            val: mc.category.Name,
            ok: function() {
                $scope.modal.inProgress = true;
                $scope.modal.btnText = app.lang.translate("در حال تغییر...");
                var link = app.urlPrefix + "Charts/DashboardPage/editMenu";
                $http.post(link, {
                    menuName: $scope.modal.val,
                    menuCategory: mc.category.Id,
                    mainMenu: $routeParams.appid
                }).then(function(res) {
                    $scope.modal.btnText = app.lang.translate("تغییر");
                    $("#dashboard-page-modal").modal("hide");
                    mc.category.Name = res.data.Name;
                    hideModal();
                }, function error(err) {
                    $scope.modal.btnText = app.lang.translate("تغییر");
                    $scope.modal.inProgress = false;
                    $scope.modal.error = err.data;
                    if (typeof $scope.modal.error.title == "undefined") $scope.modal.error = $sce.trustAsHtml(filterXSS(err.data));
                });
            }
        };
        showModal();
    };
    $scope.deleteCategory = function(mc, index) {
        $scope.modal = {
            btnClass: "btn-danger red",
            btnText: app.lang.translate("حذف"),
            inProgress: false,
            body: $sce.trustAsHtml("با انتخاب گزینه حذف، گروه <b>" + filterXSS(mc.category.Name) + "</b> حذف می‌شود. آیا اطمینان دارید؟"),
            ok: function() {
                $scope.modal.inProgress = true;
                $scope.modal.btnText = app.lang.translate("در حال حذف...");
                var link = app.urlPrefix + "Charts/DashboardPage/deleteMenu";
                $http.post(link, {
                    menuCategory: mc.category.Id
                }).then(function(res) {
                    $scope.modal.btnText = app.lang.translate("حذف");
                    $("#dashboard-page-modal").modal("hide");
                    $scope.menuCategories.data.splice(index, 1);
                    hideModal();
                }, function error(err) {
                    $scope.modal.btnText = app.lang.translate("حذف");
                    $scope.modal.inProgress = false;
                    $scope.modal.error = err.data;
                    if (typeof $scope.modal.error.title == "undefined") $scope.modal.error = $sce.trustAsHtml(filterXSS(err.data));
                });
            }
        };
        showModal();
    };
    $scope.editMenu = function(m, mc) {
        $scope.modal = {
            btnClass: "btn-primary green",
            btnText: app.lang.translate("تغییر"),
            inProgress: false,
            val: m.menu.Name,
            label: app.lang.translate("نام جدید را وارد کنید"),
            ok: function() {
                $scope.modal.inProgress = true;
                $scope.modal.btnText = app.lang.translate("در حال تغییر...");
                var link = app.urlPrefix + "Charts/DashboardPage/editMenu";
                $http.post(link, {
                    menuName: $scope.modal.val,
                    menuId: m.menu.Id
                }).then(function(res) {
                    $scope.modal.btnText = app.lang.translate("تغییر");
                    $("#dashboard-page-modal").modal("hide");
                    m.menu.Name = res.data.Name;
                    hideModal();
                }, function error(err) {
                    $scope.modal.btnText = app.lang.translate("تغییر");
                    $scope.modal.inProgress = false;
                    $scope.modal.error = err.data;
                    if (typeof $scope.modal.error.title == "undefined") $scope.modal.error = $sce.trustAsHtml(filterXSS(err.data));
                });
            }
        };
        showModal();
    };
    $scope.deleteMenu = function(m, mc, index) {
        $scope.modal = {
            btnClass: "btn-danger red",
            btnText: app.lang.translate("حذف"),
            inProgress: false,
            body: $sce.trustAsHtml("با انتخاب گزینه حذف، منوی <b>" + filterXSS(m.menu.Name) + "</b> حذف می‌شود. آیا اطمینان دارید؟"),
            ok: function() {
                $scope.modal.btnText = app.lang.translate("در حال حذف...");
                var link = app.urlPrefix + "Charts/DashboardPage/deleteMenu";
                $http.post(link, {
                    menuId: m.menu.Id
                }).then(function(res) {
                    $scope.modal.btnText = app.lang.translate("حذف");
                    $("#dashboard-page-modal").modal("hide");
                    mc.menus.splice(index, 1);
                    hideModal();
                    var firstId = $(".side-menu-item-child").data("id");
                    $location.path("/app/" + $routeParams.appid + "/dashboard/" + firstId);
                }, function error(err) {
                    $scope.modal.btnText = app.lang.translate("حذف");
                    $scope.modal.inProgress = false;
                    $scope.modal.error = err.data;
                    if (typeof $scope.modal.error.title == "undefined") $scope.modal.error = $sce.trustAsHtml(filterXSS(err.data));
                });
            }
        };
        showModal();
    };
    $scope.duplicateMenu = function(m, mc) {
        $http.post(app.urlPrefix + "menu/DuplicateMenu", {
            Id: m.menu.Id
        }).then(function(res) {
            mc.menus = mc.menus || [];
            mc.menus.push(res.data.item);
            hideModal();
        }, function(err) {
            alert(err.data);
        });
    };
    $scope.addCat = function() {
        $scope.modal = {
            btnClass: "btn-primary green",
            btnText: app.lang.translate("ساختن"),
            inProgress: false,
            label: app.lang.translate("نام منو را وارد کنید"),
            ok: function() {
                $scope.modal.inProgress = true;
                $scope.modal.btnText = app.lang.translate("در حال ساختن...");
                var link = app.urlPrefix + "Charts/DashboardPage/addMenu";
                $http.post(link, {
                    menuName: $scope.modal.val,
                    mainMenu: $routeParams.appid
                }).then(function(res) {
                    $scope.modal.btnText = app.lang.translate("ساختن");
                    $scope.modal.inProgress = false;
                    $("#dashboard-page-modal").modal("hide");
                    $scope.menuCategories = $scope.menuCategories || {};
                    $scope.menuCategories.data = $scope.menuCategories.data || [];
                    var r = {
                        category: {
                            Id: res.data.menu.Id,
                            MainMenuId: res.data.menu.MainMenuId,
                            Name: res.data.menu.Name,
                            Type: res.data.menu.Type
                        },
                        hasAddPer: true,
                        hasDeletePer: true,
                        hasEditPer: true,
                        open: true,
                        menus: []
                    };
                    $scope.menuCategories.data.push(r);
                    hideModal();
                }, function error(err) {
                    $scope.modal.btnText = app.lang.translate("ساختن");
                    $scope.modal.inProgress = false;
                    $scope.modal.error = err.data;
                    if (typeof $scope.modal.error.title == "undefined") $scope.modal.error = $sce.trustAsHtml(filterXSS(err.data));
                });
            }
        };
        showModal();
    };
    $scope.closeSidebar = function() {
        $(".ui.sidebar").sidebar("setting", "transition", "overlay").sidebar("setting", "mobileTransition", "overlay").sidebar("hide");
    };
    $scope.cancelRequests = function() {
        $(".chart-data").each(function() {
            var ajaxRequest = $(this).data("ajaxRequest");
            if (ajaxRequest) ajaxRequest.abort();
        });
        while (dashboard.addTasks.length) {
            var t = dashboard.addTasks.pop();
            clearTimeout(t);
        }
    };
    $(".toc-toggle").on("click", function() {
        $(".ui.sidebar").sidebar("setting", "transition", "overlay").sidebar("setting", "mobileTransition", "overlay").sidebar("toggle");
    });
    function toc() {
        var isMobile = $(window).width() <= 723;
        var menu = $(".side-menu");
        if (!isMobile && !$scope.isFullscreen) {
            $(".toc-toggle").hide();
            menu.addClass("my-fix no-padd no-margin");
            menu.removeClass("sidebar right  menu fixed vertical");
            $(".main-container").removeClass("mobile");
        } else {
            $(".toc-toggle").show();
            menu.removeClass("my-fix no-padd no-margin");
            menu.addClass("sidebar right  menu fixed vertical");
            $(".main-container").addClass("mobile");
        }
        if (isMobile) {
            $(".full-screen-toggle").hide();
        } else {
            $(".full-screen-toggle").show();
        }
    }
    $(window).resize(function() {
        toc();
    });
    toc();
} ]);

ngApp.service("dashboardContainerService", function() {
    function renderBody(render) {
        console.log("### call renderBody");
        render();
    }
    return {
        renderBody: renderBody
    };
});

ngApp.controller("dashboardPageBodyCtrl", [ "$scope", "$http", "$sce", "$routeParams", "navbar", "$rootScope", "$timeout", "drawer", "$q", "$rootScope", "dashboardContainerService", function($scope, $http, $sce, $routeParams, navbar, $rootScope, $timeout, drawer, $q, $rootScope, dashboardContainerService) {
    $scope.app = app;
    drawer.close();
    $scope.model = "param: " + $routeParams.id;
    $scope.paramkey = $routeParams.paramkey;
    var link = app.urlPrefix + "api/dashboards/get/" + $routeParams.id;
    if (dashboard.canceler) {
        dashboard.canceler.resolve("http call aborted");
    }
    dashboard.canceler = $q.defer();
    dashboardContainerService.renderBody(renderBody);
    function renderBody() {
        $scope.progress = true;
        $http({
            method: "GET",
            url: link,
            timeout: dashboard.canceler.promise
        }).then(function(res) {
            $scope.progress = false;
            var isMobile = $(window).width() <= 723;
            var canDesign = !isMobile && res.data.arrangePer;
            document.title = res.data.name;
            if ($scope.$parent) {
                $scope.$parent.name = res.data.name;
            }
            setDashboard(res.data, canDesign);
            if ($scope.paramkey) {
                var allParams = JSON.parse(localStorage.getItem("filter-params") || "[]");
                app.chartCommons.clearFilterParamsCache(allParams);
                var r = _.find(allParams, {
                    dash: +$routeParams.id,
                    key: $routeParams.paramkey
                });
                if (r) {
                    app.chartCommons.drillDown.filters = r.data.drillDown;
                    app.chartCommons.userFilter.filters = r.data.userFilter;
                }
            }
            $rootScope.$broadcast("app-filterbox-refresh");
            $rootScope.$broadcast("publish-url", {
                url: res.data.publishUrl
            });
            $rootScope.$broadcast("fav", {
                isFav: res.data.isFav,
                showTitleFullscreen: res.data.showTitleFullscreen,
                showTitle: res.data.showTitle
            });
            $rootScope.$broadcast("permission-change", canDesign);
            if (res.data.ForceChangePass) {
                $(".ui.modal#change-pass").modal("setting", "closable", false).modal("show");
            }
        }).catch(function(res) {
            $scope.progress = false;
            if (res.data.type === 3) {
                $("#update-message").transition("in scale");
            } else {
                $("#no-page-message").transition("in scale");
            }
        });
    }
    function setDashboard(data, canDesign) {
        $("body").removeClass("full-height-container");
        $(".main-container").addClass("full-height-container");
        app.chartCommons.userFilter.setUserControlFilters(data.userControlFilters);
        app.chartCommons.drillDown.clearAll();
        dashboard.setInfo(data.charts, data.pageInfo, data.pageId, canDesign, data.forms);
        dashboard.PageSwiching = data.PageSwiching;
        app.dashboardLayoutVersion = 2;
        var linkSetChartsOrder = app.urlPrefix + "charts/dashboardpage/setchartsorder";
        app.moderation.dashboadpage.isRelated = false;
        fixLayout(true);
    }
} ]);

function fixLayout(forceRefresh) {
    if (!forceRefresh) {
        dashboard.resize();
        return;
    }
    dashboard.showEmptyMessageIfNeed();
    var onFinish = function() {
        if (typeof Storage !== "undefined") {
            var lastEditedId = localStorage.getItem("lastEditedChartId");
            localStorage.removeItem("lastEditedChartId");
            if (!_.isUndefined(lastEditedId) && lastEditedId) {
                var offset = $("." + lastEditedId.replace("ID", "cid")).offset();
                if (offset) $("html, body").animate({
                    scrollTop: offset.top - 20,
                    scrollLeft: offset.left - 20
                });
            }
        }
    };
    dashboard.drow(onFinish);
}

ngApp.config([ "$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
    $routeProvider.when("/app/:appid/dashboard/:id/:paramkey?", {
        templateUrl: app.urlPrefix + "dist/partial/dashboardPage/su.dashboardBody.html?v=" + app.version,
        controller: "dashboardPageBodyCtrl"
    }).otherwise({
        redirectTo: "/nothings"
    });
} ]);

jQuery.fn.createModal = function(options) {
    $el = $(this);
    if ($el.length == 0) $el = $("#content_segmentModal");
    $el.find("#" + options.id).remove();
    var id = typeof options.okId != "undefined" ? ' id="' + options.okId + '" ' : "";
    var onclick = typeof options.okFun != "undefined" ? ' onclick="' + options.okFun + '" ' : "";
    if (typeof options.okFunObj != "undefined") onclick = "";
    var str = ' <div class="modal ' + (typeof options.Fade == "undefined" || options.Fade ? "fade" : "") + '" id="' + options.id + '" tabindex="-1" role="dialog" aria-labelledby="' + options.id + 'Label" aria-hidden="true">          <div class="modal-dialog">                                                                                                       <div class="modal-content">                                                                                                      <div class="modal-header">                                                                                                       <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>                                 <h4 class="modal-title">' + options.title + '</h4>                                                                       </div>                                                                                                                       <div class="modal-body">                                                                                                         ' + options.body + '                                                                                                     </div>                                                                                                                       <div class="modal-footer">                                                                                                      ' + (typeof options.cancelText != "undefined" ? ' <button type="button" class="btn btn-default" data-dismiss="modal" >' + options.cancelText + "</button>" : "") + "                        " + (typeof options.okText != "undefined" ? '<button type="button" class="btn ' + options.okClass + ' okbtn" data-dismiss="modal" ' + onclick + id + ">" + options.okText + "</button>" : "") + "</div>                                                                                                                   </div>                                                                                                                       <!-- /.modal-content -->                                                                                                 </div>                                                                                                                       <!-- /.modal-dialog -->                                                                                                  </div>                                                                                                                       <!-- /.modal -->                                                                                                                     ";
    var t = $(str);
    t.appendTo($el);
    if (typeof options.okFunObj != "undefined") {
        t.find(".okbtn").on("click", function() {
            options.okFunObj();
        });
    }
    if (typeof options.id != "undefined" && (typeof options.onKey == "undefined" || options.onKey)) {
        $("#" + options.id).on("keypress", function(e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                $("#" + options.id + " .okbtn").click();
            }
        });
        $("#" + options.id).on("shown.bs.modal", function() {
            $("#" + options.id + " input").first().focus();
        });
    }
};

app = app || {};

app.globalVariableHelper = {};

app.globalVariableHelper.updateGlobalVariables = function(headers, filedsData, globalvariable) {
    return;
    var callCount = 0;
    var callDone = 0;
    var vi = [];
    globalvariable.forEach(function(data) {
        var idx = headers.indexOf(data.field);
        if (idx != -1) {
            callCount++;
            vi.push(data.variableId);
            $.ajax({
                type: "POST",
                url: app.urlPrefix + "Moderation/GlobalVariable/SetValueForUser",
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                traditional: true,
                data: JSON.stringify({
                    Id: data.variableId,
                    Values: [ filedsData[idx] ]
                }),
                success: function(data) {
                    callDone++;
                    if (callDone == callCount) $(".bar-chart").each(function() {
                        var s = $(this).data("settings");
                        if (typeof s.input.GlobalVariables != "undefined" && _.intersection(s.input.GlobalVariables, vi).length > 0) {
                            s.titlebar.showProgress(true);
                            $(this).charts(s.type, "refreshWithData", s);
                        }
                    });
                    if (data.result) {} else {
                        alert(data.Message);
                    }
                }
            });
        }
    });
};

app.globalVariableHelper.createModalRow = function(data) {
    var $row = $(app.globalVariableHelper.addModalRow);
    if (data) {
        $row.find(".default-value").val(data);
    }
    $row.find(".btn-plus").on("click", function() {
        var $newRow = app.globalVariableHelper.createModalRow(this);
        $(this).parents(".form-group").after($newRow);
    });
    $row.find(".btn-minus").on("click", function() {
        $(this).parents(".form-group").remove();
    });
    return $row;
};

app.globalVariableHelper.AddGlobalVariables = function(onfinish) {
    var $modal = $(app.globalVariableHelper.addModal);
    $("#gb-modal").remove();
    $modal.find(".row-container").append(app.globalVariableHelper.createModalRow());
    app.contentSegmentModal.append($modal);
    $("#gb-modal .btn-primary").on("click", function() {
        var data = {
            Name: $("#gb-modal input.name").val(),
            Scope: $("#gb-modal select.scope").val(),
            DefaultValue: $("#gb-modal input.default-value").map(function() {
                return $(this).val();
            }).toArray()
        };
        $.ajax({
            type: "POST",
            url: app.urlPrefix + "Moderation/GlobalVariable/Add",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            traditional: true,
            data: JSON.stringify(data),
            success: function(data) {
                if (data.result) {
                    onfinish(data);
                } else {
                    alert(data.Message);
                }
            }
        });
    });
    $("#gb-modal").modal("show");
};

app.globalVariableHelper.EditGlobalVariables = function(data, onfinish) {
    var $modal = $(app.globalVariableHelper.addModal);
    $("#gb-modal").remove();
    $modal.find("input.name").val(data.Name);
    $modal.find("select.scope").val(data.Scope);
    $modal.find(".btn-primary").text("تغییر");
    var defaultValues = JSON.parse(data.DefaultValue || '[""]');
    if (!defaultValues || defaultValues.length == 0) defaultValues = [ "" ];
    defaultValues.forEach(function(item) {
        var $row = app.globalVariableHelper.createModalRow(item);
        $modal.find(".row-container").append($row);
    });
    app.contentSegmentModal.append($modal);
    $("#gb-modal .btn-primary").on("click", function() {
        var d = {
            Id: data.Id,
            Name: $("#gb-modal input.name").val(),
            Scope: $("#gb-modal select.scope").val(),
            DefaultValue: $("#gb-modal input.default-value").map(function() {
                return $(this).val();
            }).toArray()
        };
        $.ajax({
            type: "POST",
            url: app.urlPrefix + "Moderation/GlobalVariable/Add",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            traditional: true,
            data: JSON.stringify(d),
            success: function(data) {
                if (data.result) {
                    onfinish(data);
                } else {
                    alert(data.Message);
                }
            }
        });
    });
    $("#gb-modal").modal("show");
};

app.globalVariableHelper.addModal = '<div class="modal fade" id="gb-modal" tabindex="-1" role="dialog" aria-labelledby="gb-modal-label" aria-hidden="true                style="font-size: 14px; text-align: justify;">                <div class="modal-dialog">                <div class="modal-content">                    <div class="modal-header">                        <button type="button" class="close" data-dismiss="modal">                            <span aria-hidden="true">&times;</span><span class="sr-only">بستن</span></button>                        <h4 class="modal-title" id="gb-modal-label">ساخت متغیر سراسری</h4>                    </div>                <div class="modal-body">                    <p>                        این متغیر برای تمامی کاربران قابل اعمال است.                                        .نام متغیر نباید شامل علامت باشد و باید ترکیبی از حروف و اعداد باشد                    </p>                    <div class="form-horizontal">                        <div class="form-group">                            <label class="col-sm-4" style="font-weight: bold;">نام متغیر: </label>                            <div class="col-sm-8">                                <input type="text" class="form-control name" placeholder="نام متغیر" />                            </div>                        </div>                        <div class="form-group">                            <label class="col-sm-4" style="font-weight: bold;">حوزه اعتبار: </label>                            <div class="col-sm-8">                                <select class="form-control scope" >                                <option value="0">تمام صفحات</option>                                <option value="1" selected="selected">صفحه جاری</option>                                </select>                            </div>                        </div>                        <div class="row-container"></div>                    </div>                                          </div>                                                                                                                                                   <div class="modal-footer">                    <button type="button" class="btn btn-default" data-dismiss="modal">بستن</button>                    <button type="button" class="btn btn-primary" data-dismiss="modal">ساختن</button>                </div>            </div>        </div>    </div>';

app.globalVariableHelper.addModalRow = '            <div class="form-group modal-row">                <label class="col-sm-4" style="font-weight: bold;">مقدار پیش‌فرض: </label>                <div class="col-sm-5">                    <input type="text" class="form-control default-value" placeholder="مقدار پیش‌فرض" />                </div>                <div class="col-md-3">                    <div class="btn-group btn-group-justified">                        <a type="button" class="btn btn-default btn-plus"><span class="glyphicon glyphicon-plus"></span></a>                        <a type="button" class="btn btn-default btn-minus"><span class="glyphicon glyphicon-minus"></span></a>                    </div>                </div>            </div>';

var app = app || {};

app.packages = {};

app.packages.controller = {
    scopes: {
        CHARTS: 1,
        DATASOURCES: 2
    },
    add: function(name, scope, permissions, parentId, callback) {
        $.ajax({
            url: app.urlPrefix + "Moderation/Package/Create",
            data: JSON.stringify({
                name: name,
                scope: scope,
                parentId: parentId,
                permissions: permissions,
                isEdit: isEdit
            }),
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            traditional: true,
            success: function(data) {
                if (data.result) {
                    if (callback) callback();
                } else {
                    alert(data.message);
                }
            }
        });
    },
    getRoles: function(callback) {
        app.post(app.urlPrefix + "Moderation/Package/GetRoles", null, callback);
    }
};

app.packages.view = {
    createPackage: function(scope, parentId, callback) {
        var modal = $(app.packages.view.createModal);
        app.contentSegmentModal.append(modal);
        modal.modal("show");
        modal.on("shown.bs.modal", function() {
            modal.find("#name").focus();
        });
        modal.find("#name").keyup(function(event) {
            if (event.keyCode == 13) {
                modal.find(".btn-primary").click();
            }
        });
        modal.find(".btn-primary").addClass("disabled");
        app.packages.controller.getRoles(function(data) {
            var roles = data.roles || [];
            modal.find(".btn-primary").removeClass("disabled");
            var tem = "<h3>نقش‌ها</h3><form id='packages-permission' style='height: 180px; overflow-y: scroll;'> <table class='table table-hover '>";
            roles.forEach(function(s) {
                tem += "<tr>" + "           <td>                                                                                                                      " + "               <label style='font-weight: normal; font-size: 1em;'>                                                                  " + "                   <input type='checkbox' name='Roles' value='" + s.Id + "' >                                                       " + "                   " + s.RoleName + "                                                                                               " + "               </label>                                                                                                              " + "           </td>                                                                                                                     " + "           <td>                                                                                                                      " + "               <select class='form-control' name='ChartActions'>                                                                     " + "                   <option value='" + 1 + "-" + s.Id + "' >مشاهده</option>                     " + "                   <option value='" + 2 + "-" + s.Id + "'>مشاهده و ویرایش</option>            " + "                   <option value='" + 4 + "-" + s.Id + "' >مشاهده، ویرایش و حذف</option>    " + "               </select>                                                                                                             " + "           </td>                                                                                                                     " + "       </tr>";
            });
            tem += "</form>";
            modal.find("#progress").hide();
            modal.find(".modal-body").append(tem);
            app.packages.view.showPermissionChoise("#package-modal .modal-body");
            modal.find(".btn-primary").on("click", function() {
                var data = modal.find("#packages-permission").serializeArray();
                if (data) data = data.filter(function(d) {
                    return d.name == "ChartActions";
                }).map(function(d) {
                    return d.value;
                });
                $(this).button("loading");
                var name = modal.find("#name").val();
                app.post(app.urlPrefix + "Moderation/Package/Create", {
                    name: name,
                    scope: scope,
                    parentId: parentId,
                    permissions: data
                }, function(d) {
                    modal.find(".btn-primary").button("reset");
                    modal.modal("hide");
                    callback(d);
                });
            });
        });
    },
    editPackage: function(id, callback) {
        var modal = $(app.packages.view.createModal);
        app.contentSegmentModal.append(modal);
        modal.modal("show");
        modal.on("shown.bs.modal", function() {
            modal.find("#name").focus();
            var len = modal.find("#name").val().length;
            modal.find("#name").get(0).setSelectionRange(len, len);
        });
        modal.find("#name").keyup(function(event) {
            if (event.keyCode == 13) {
                modal.find(".btn-primary").click();
            }
        });
        modal.find(".btn-primary").addClass("disabled");
        modal.find(".btn-primary").html("ویرایش");
        app.post(app.urlPrefix + "Moderation/Package/GetInfo", {
            id: id
        }, function(data) {
            var roles = data.roles || [];
            modal.find(".btn-primary").removeClass("disabled");
            var tem = "<h3>نقش‌ها</h3><form id='packages-permission' style='height: 180px; overflow-y: scroll;'> <table class='table table-hover '>";
            roles.forEach(function(s) {
                tem += "<tr>" + "           <td>                                                                                                                      " + "               <label style='font-weight: normal; font-size: 1em;'>                                                                  " + "                   <input type='checkbox' name='Roles' value='" + s.Id + "' >                                                       " + "                   " + s.RoleName + "                                                                                               " + "               </label>                                                                                                              " + "           </td>                                                                                                                     " + "           <td>                                                                                                                      " + "               <select class='form-control' name='ChartActions'>                                                                     " + "                   <option value='" + 1 + "-" + s.Id + "' >مشاهده</option>                     " + "                   <option value='" + 2 + "-" + s.Id + "'>مشاهده و ویرایش</option>            " + "                   <option value='" + 4 + "-" + s.Id + "' >مشاهده، ویرایش و حذف</option>    " + "               </select>                                                                                                             " + "           </td>                                                                                                                     " + "       </tr>";
            });
            tem += "</form>";
            modal.find("#progress").hide();
            modal.find(".modal-body").append(tem);
            app.packages.view.showPermissionChoise("#package-modal .modal-body");
            if (data.info && data.info.actions) {
                var actions = data.info.actions || [];
                actions.forEach(function(d) {
                    modal.find("option[value=" + d.Action + "-" + d.RoleId + "]").attr("selected", "selected").parents("tr").find("input").click();
                });
            }
            modal.find("#name").val(data.info.Name);
            modal.find(".btn-primary").on("click", function() {
                var data = modal.find("#packages-permission").serializeArray();
                if (data) data = data.filter(function(d) {
                    return d.name == "ChartActions";
                }).map(function(d) {
                    return d.value;
                });
                var name = modal.find("#name").val();
                modal.find(".btn-primary").data("loading-text", "در حال تغییر");
                modal.find(".btn-primary").button("loading");
                app.post(app.urlPrefix + "Moderation/Package/Edit", {
                    id: id,
                    name: name,
                    permissions: data
                }, function(d) {
                    modal.find(".btn-primary").button("reset");
                    modal.modal("hide");
                    callback(d);
                });
            });
        });
    },
    showPermissionChoise: function(parentSegmentNme) {
        $(parentSegmentNme + " tr input").each(function() {
            toggleVisibility($(this).prop("checked"), $(this).closest("tr"));
        });
        $(parentSegmentNme + " tr input").change(function() {
            toggleVisibility(this.checked, $(this).closest("tr"));
        });
        function toggleVisibility(t, obj) {
            if (t) {
                obj.find("select").css("visibility", "visible").attr("disabled", null);
            } else {
                obj.find("select").css("visibility", "hidden").attr("disabled", "");
            }
        }
        $(parentSegmentNme + " table thead input").change(function() {
            var isChecked = this.checked;
            $(this).closest("table").find("tr input").each(function() {
                $(this).prop("checked", isChecked);
                toggleVisibility(this.checked, $(this).closest("tr"));
            });
        });
    },
    selectPackage: function(scope, callback, withContent) {
        var modal = $(app.packages.view.selectPackageModal);
        $("body #package-modal").remove();
        $("body").append(modal);
        modal.modal("show");
        app.post(app.urlPrefix + "Moderation/Package/GetPackages", {
            scope: scope,
            withContent: withContent
        }, function(data) {
            modal.find("#progress").hide();
            modal.find(".content").html(filterXSS(data.packages));
            modal.find(".content>ul").css("direction", "ltr");
            modal.find(".content>ul").selectable({
                filter: ".select-package",
                selecting: function(event, ui) {
                    if (!withContent && modal.find(".ui-selected, .ui-selecting").length > 1) {
                        $(ui.selecting).removeClass("ui-selecting");
                    }
                }
            });
            modal.find(".content>ul").treeview({
                animated: "fast",
                collapsed: true,
                toggle: function() {}
            });
            modal.find(".btn-primary").on("click", function() {
                var e = modal.find(".ui-selected");
                var id = e.map(function(d) {
                    return $(this).data("id");
                }).toArray();
                if (callback) callback(id, {
                    hide: function() {
                        modal.modal("hide");
                    },
                    setLoading: function() {
                        modal.find(".btn-primary").addClass("loading");
                    }
                });
            });
        });
    },
    createModal: '<div class="modal fade" id="package-modal" tabindex="-1" role="dialog" aria-labelledby="gb-modal-label" aria-hidden="true                style="font-size: 14px; text-align: justify;">                <div class="modal-dialog">                <div class="modal-content">                    <div class="modal-header">                        <button type="button" class="close" data-dismiss="modal">                            <span aria-hidden="true">&times;</span><span class="sr-only">بستن</span></button>                        <h4 class="modal-title" id="gb-modal-label">ساخت پوشه جدید</h4>                    </div>                <div class="modal-body" >                    <div class="form-group">                        <label for="chartTitleFarsi" class="col-md-4 control-label">نام پوشه:</label>                        <div class="col-md-8" style="margin-bottom: 30px;"><input id="name" class="form-control"placeholder="نام پوشه" /></div>                    </div>                    <div id="progress" >                        <img style="width: 1.3em" src="' + app.urlPrefix + 'Images/progress.gif" />                        در حال بارگذاری . . .                    </div>                </div>                <div class="modal-footer">                    <button type="button" class="btn btn-default" data-dismiss="modal">انصراف</button>                    <button type="button" class="btn btn-primary" data-loading-text="در حال ساختن...">ساختن</button>                </div>            </div>        </div>    </div>',
    selectPackageModal: '<div class="ui modal small" id="package-modal">    <i class="close icon"></i>    <div class="header">فیلتر کردن مقادیر</div>    <div class="content" style="height: 180px; overflow-y: scroll;">        <div class="ui active inverted dimmer"><div class="ui text loader">در حال بارگذاری</div></div></div>    <div class="actions">        <button type="button" class="ui button deny black" >انصراف</button>        <button type="button" class="ui button green btn-primary" >انتخاب</button>    </div></div>'
};

$.fn.tableSortable = function(filter) {
    var table = $(this);
    table.find("th").addClass("pointer").on("click", function(e, i) {
        var i = $(this).index() + 1;
        var tr = table.find("tbody tr");
        if (filter) tr = tr.not(filter);
        var isDesc = $(this).data("isdesc");
        if (typeof isDesc == "undefined") isDesc = true;
        $(this).data("isdesc", !isDesc);
        tr.sort(function(a, b) {
            var at = depersian($(a).find("td:nth-child(" + i + ")").text());
            var bt = depersian($(b).find("td:nth-child(" + i + ")").text());
            if (isDesc) return /^[0-9.]+$/.test(at) ? d3.descending(+at, +bt) : d3.descending(at, bt);
            return /^[0-9.]+$/.test(at) ? d3.ascending(+at, +bt) : d3.ascending(at, bt);
        });
        tr.remove();
        table.append(tr);
    });
};

$.fn.tableBindSearchbox = function(el, filter) {
    var table = $(this);
    var el = el instanceof $ ? el : $(el);
    el.keyup(function() {
        var q = $(this).val();
        var tr = table.find("tbody tr");
        if (filter) tr = tr.not(filter);
        tr.each(function() {
            if ($(this).text().toLocaleLowerCase().indexOf(q.toLocaleLowerCase()) == -1) {
                $(this).hide();
            } else {
                $(this).show();
            }
        });
    });
};

jQuery.fn.progressbar = function(s, timeout) {
    if (s == "stop") {
        d3.select($(this).get(0)).select(".sadaf-circular-timeout").remove();
        return;
    }
    var size = +s || 25;
    var strok = size / 5;
    var width = size * 2, height = size * 2, twoPi = 2 * Math.PI;
    var interval = +timeout || 1e4;
    var arc = d3.arc().startAngle(0).innerRadius(size - strok).outerRadius(size);
    d3.select($(this).get(0)).select(".sadaf-circular-timeout").remove();
    var svg = d3.select($(this).get(0)).append("svg").attr("width", width).attr("height", height).attr("class", "sadaf-circular-timeout").append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    var meter = svg.append("g").attr("class", "progress-meter");
    meter.append("path").attr("class", "background").style("fill", "#666").style("opacity", "0.2").attr("d", arc.endAngle(twoPi));
    var foreground = meter.append("path").style("fill", "#212121").attr("class", "foreground");
    foreground.attr("d", arc.endAngle(twoPi * 0));
    foreground.transition().duration(interval).attrTween("d", arcTween);
    function arcTween() {
        var i = d3.interpolate(0, twoPi);
        return function(t) {
            return arc.endAngle(i(d3.easeLinear(t)))();
        };
    }
};

$.extend($.datepicker, {
    _checkOffset: function(inst, offset, isFixed) {
        var dpWidth = inst.dpDiv.outerWidth();
        var dpHeight = inst.dpDiv.outerHeight();
        var inputWidth = inst.input ? inst.input.outerWidth() : 0;
        var inputHeight = inst.input ? inst.input.outerHeight() : 0;
        var viewWidth = document.documentElement.clientWidth + (isFixed ? 0 : $(document).scrollLeft());
        var viewHeight = document.documentElement.clientHeight + (isFixed ? 0 : $(document).scrollTop());
        offset.left -= this._get(inst, "isRTL") ? dpWidth - inputWidth : 0;
        offset.left -= isFixed && offset.left == inst.input.offset().left ? $(document).scrollLeft() : 0;
        offset.top -= isFixed && offset.top == inst.input.offset().top + inputHeight ? $(document).scrollTop() : 0;
        offset.left -= Math.min(offset.left, offset.left + dpWidth > viewWidth && viewWidth > dpWidth ? Math.abs(offset.left + dpWidth - viewWidth) : 0);
        offset.top -= Math.min(offset.top, offset.top + dpHeight > viewHeight && viewHeight > dpHeight ? Math.abs(dpHeight + inputHeight) : 0);
        if (offset.top < 50) offset.top = 55;
        return offset;
    }
});

var app = app || {};

app.escapeBraket = function(input) {
    return input.replace("[", "\\\\[").replace("]", "\\\\]");
};

var ngApp = angular.module("sadafMain", [ "sadafForms", "ngRoute", "filterBox", "navbarCat", "ui.sortable", "pascalprecht.translate", "ngSanitize", "uibCollapseCat", "notificationCat", "services" ]);

ngApp.controller("dashboardMainPageCtrl", [ "$scope", "$http", "$sce", "$routeParams", "$location", "$timeout", "$translate", "mainmenus", "mostRecentMenus", "favoriteMenus", function($scope, $http, $sce, $routeParams, $location, $timeout, $translate, mainmenus, mostRecentMenus, favoriteMenus) {
    $scope.mainMenuType = 2;
    $scope.gApp = app;
    $scope.moment = moment;
    $translate.use(+$("#lang").val() == 0 ? "fa" : "en");
    $scope.persian = persian;
    $scope.isPersian = +$("#lang").val() == 0;
    $(".ui.dimmer.modals .mainmenu-permission").remove();
    $scope.cModel = {
        name: "salam",
        invalidate: function() {
            console.log("### invalidate");
            $scope.$apply();
        }
    };
    function get() {
        var parent = $routeParams.id || 0;
        $scope.appLoading = true;
        mainmenus.get(parent).then(function(res) {
            $scope.apps = res.data.list;
            $scope.isAdmin = res.data.isAdmin;
            $scope.hasAminPermission = res.data.hasAminPermission;
            $scope.userInfo = res.data.userInfo;
            $scope.brand = res.data.brand;
            $scope.path = _.reverse(res.data.parents);
            $scope.appLoading = false;
            $(".dropdown.userinfo").dropdown();
            _.each($scope.apps, function(app) {
                var s = getStyle();
                app.detail = JSON.parse(app.detail || "{}");
                if (!app.detail.startColor) app.detail.startColor = s[0];
                if (!app.detail.endColor) app.detail.endColor = s[1];
            });
        }).catch(function() {
            $scope.appLoading = false;
        });
    }
    $scope.roles = [];
    function getStyle() {
        var styles = [ [ "#03A9F4", "#0277BD" ], [ "#e91e63", "#ad1457" ], [ "#f44336", "#b71c1c" ], [ "#009688", "#00695c" ], [ "#ff9800", "#ef6c00" ], [ "#ffeb3b", "#f9a825" ], [ "#dce775", "#c0ca33" ], [ "#aed581", "#7cb342" ], [ "#ba68c8", "#8e24aa" ] ];
        var s = styles[Math.ceil(Math.random() * 8)];
        return s;
    }
    function getNew() {
        var s = getStyle();
        var parent = $routeParams.id || 0;
        var a = {
            id: 0,
            edit: true,
            detail: {
                startColor: s[0],
                endColor: s[1]
            },
            parent: parent,
            permissions: {
                ViewPermission: true,
                EditPermission: true,
                DeletePermission: true
            }
        };
        return a;
    }
    function getMosrRecentMenus() {
        mostRecentMenus.get().then(function(res) {
            $scope.mostRecentMenus = res.data.list;
        }).catch(function() {});
        favoriteMenus.get().then(function(res) {
            $scope.favoriteMenus = res.data.list;
        }).catch(function() {});
    }
    getMosrRecentMenus();
    $scope.add = function() {
        var a = getNew();
        $scope.apps.push(a);
    };
    $scope.save = function(app, finish) {
        app.progress = true;
        mainmenus.save(app).then(function(res) {
            app.progress = false;
            app.id = res.data.id;
            app.name = res.data.name;
            app.detail = res.data.detail;
            app.editDesc = false;
            app.edit = false;
            if (finish) finish(app);
        }).catch(function() {
            app.progress = false;
        });
    };
    $scope.keyup = function($event, app) {
        if ($event.keyCode == 13) $scope.save(app);
        if ($event.keyCode == 27) app.edit = false;
    };
    $scope.edit = function(app) {
        app.edit = true;
        $timeout(function() {
            $(".app-" + app.id + " input").focus();
        }, 0);
    };
    $scope.editDesc = function(app) {
        app.editDesc = true;
        $timeout(function() {
            $(".app-" + app.id + " textarea").focus();
        }, 0);
    };
    $scope.remove = function(app, i) {
        var f = confirm("آیا برای حذف اطمینان دارید؟");
        if (!f) return;
        if (!app.id) {
            $scope.apps.splice(i, 1);
            return;
        }
        app.progressTrash = true;
        mainmenus.remove(app.id).then(function(res) {
            app.progressTrash = false;
            $scope.apps.splice(i, 1);
        }).catch(function() {
            app.progressTrash = false;
        });
    };
    $scope.settings = function(app, i) {
        if (app.render) return;
        app.render = true;
        $(".app-" + app.id + " .popup-btn").popup({
            transition: "flip vertical",
            on: "click",
            popup: $(".app-" + app.id + " .setting-popup")
        });
        $(".app-" + app.id + " .popup-btn").click();
    };
    $scope.previewFile = function(el, i) {
        var file = el.files[0];
        if (file.size > 35e3) {
            alert("حجم فایل باید کمتر از ۳۵ کیلو بایت باشد");
            return;
        }
        var reader = new FileReader();
        var index = $(el).attr("index");
        reader.addEventListener("load", function() {
            $timeout(function() {
                var app = $scope.apps[index];
                app.detail.pic = reader.result;
                $scope.save(app);
            }, 0);
        }, false);
        if (file) {
            reader.readAsDataURL(file);
        }
    };
    $scope.search = function(query) {
        console.log("### query ", query);
        if (!query || !query.trim()) {
            $scope.searchResult = null;
        }
        if (query.length < 3) return;
        $scope.searchProgress = true;
        mainmenus.search(query).then(function(res) {
            $scope.searchProgress = false;
            $scope.searchResult = res.data;
        }).catch(function() {
            $scope.searchProgress = false;
        });
    };
    $scope.addChild = function(app) {
        var newapp = getNew();
        newapp.name = "پروژه جدید";
        newapp.parent = app.id;
        $scope.save(newapp, function(newapp) {
            $location.path("/" + newapp.parent);
        });
    };
    $scope.$on("$routeChangeSuccess", function() {
        get();
    });
    $scope.conf = {
        id: 0
    };
    $scope.showSettings = function(app) {
        $scope.conf.id = app.id;
        $(".mainmenu-permission").modal("show");
        $(".app-" + app.id + " .popup-btn").popup("hide");
    };
    $scope.savePermissions = function() {
        $scope.savePerProgress = true;
        var roles = _.filter($scope.roles, {
            check: true
        }).map(function(item) {
            return {
                id: item.id,
                action: item.action
            };
        });
        mainmenus.savePermissions($scope.conf.id, roles).then(function() {
            $scope.savePerProgress = false;
            $(".mainmenu-permission").modal("hide");
        }).catch(function() {
            $scope.savePerProgress = false;
        });
    };
    $scope.mm = {};
} ]);

ngApp.config([ "$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
    $routeProvider.when("/:id", {
        templateUrl: app.urlPrefix + "dist/partial/dashboardPage/su.dashboardMainPage.html?v=" + app.version,
        controller: "dashboardMainPageCtrl"
    }).otherwise({
        redirectTo: "/0"
    });
} ]);

ngApp.config([ "$translateProvider", function($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        prefix: app.urlPrefix + "dist/locales/locale-",
        suffix: ".js"
    });
    $translateProvider.preferredLanguage("fa");
    $translateProvider.useSanitizeValueStrategy("sanitizeParameters");
} ]);

ngApp.config([ "$locationProvider", function($locationProvider) {
    $locationProvider.hashPrefix("");
} ]);

ngApp.factory("httpResponseInterceptor", [ "$q", "$rootScope", "$location", function($q, $rootScope, $location) {
    return {
        responseError: function(rejection) {
            if (rejection.status === 401) {
                alert("مهلت اعتبار ارتباط شما با سایت پایان یافته، لطفا دوباره وارد شوید");
                document.location = "/account/login";
            }
            return $q.reject(rejection);
        }
    };
} ]);

ngApp.config([ "$httpProvider", function($httpProvider) {
    $httpProvider.interceptors.push("httpResponseInterceptor");
    var xsrf = $("input[name=__RequestVerificationToken]").val();
    $httpProvider.defaults.headers.post["__RequestVerificationToken"] = xsrf;
} ]);