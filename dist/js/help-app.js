// داشبورد مدیریتی صدف info@sadafdashboard.ir 

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

var ngApp = angular.module("sadafHelp", [ "ngRoute", "ui.sortable", "pascalprecht.translate", "ngSanitize", "uibCollapseCat" ]);

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

var ngApp = angular.module("sadafHelp");

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

var helpMenus = [ {
    id: 1,
    name: "منابع داده",
    menus: [ {
        id: 1,
        name: "ذخیره تاریخچه",
        url: app.urlPrefix + "dist/partial/help/content/DataSource/FileHistory.html"
    }, {
        id: 2,
        name: "ارتباط بین منابع داده",
        url: app.urlPrefix + "dist/partial/help/content/DataSource/DatasurceInterRelation.html"
    }, {
        id: 3,
        name: "متغیر در ساخت منبع داده",
        url: app.urlPrefix + "dist/partial/help/content/DataSource/MsOlapQuery.html"
    }, {
        id: 8,
        name: "دریافت دوره‌ای اطلاعات",
        url: app.urlPrefix + "dist/partial/help/content/DataSource/IntervalFetch.html"
    } ]
}, {
    id: 2,
    name: "نمودارها",
    menus: [ {
        id: 4,
        name: "نقشه",
        url: app.urlPrefix + "dist/partial/help/content/Charts/Map/General.html"
    }, {
        id: 5,
        name: "آپلود کردن نقشه",
        url: app.urlPrefix + "dist/partial/help/content/Charts/Map/UploadMap.html"
    }, {
        id: 7,
        name: "نمودار درختی",
        url: app.urlPrefix + "dist/partial/help/content/Charts/TreeChart.html"
    } ]
}, {
    id: 3,
    name: "تنظیمات عمومی",
    menus: [ {
        id: 6,
        name: "پست الکترونیک",
        url: app.urlPrefix + "dist/partial/help/content/Settings/Mail.html"
    } ]
} ];

ngApp.controller("sideMenuCtrl", [ "$scope", "$http", "$sce", "$routeParams", "$location", "$timeout", "$translate", "$rootScope", function($scope, $http, $sce, $routeParams, $location, $timeout, $translate, $rootScope) {
    var scope = this;
    scope.app = app;
    scope.parents = helpMenus;
    scope.closeAll = function(m) {
        var o = m.open;
        _.each(scope.parents, function(mc) {
            mc.open = false;
            mc.active = false;
        });
        m.open = !o;
        m.active = !o;
    };
    $scope.$on("$locationChangeStart", function(event, newUrl, oldUrl) {
        if (/\/content\/\d+/.test($location.path())) {
            var id = +$location.path().replace(/\/content\/(\d+)/gi, "$1");
            _.each(scope.parents, function(mc) {
                mc.active = false;
                mc.open = false;
                _.each(mc.menus, function(m) {
                    m.active = false;
                    if (m.id == id) {
                        mc.active = true;
                        mc.open = true;
                        m.active = true;
                    }
                });
            });
        }
    });
    var source = [];
    _.each(helpMenus, function(d) {
        _.each(d.menus, function(m) {
            source.push({
                id: m.id,
                title: m.name,
                xurl: m.url,
                parent: d.name
            });
        });
    });
    $.fn.search.settings.templates.message = function(message, type) {
        return '<div style="padding:10px;">' + message + "</div>";
    };
    $(".ui.search").search({
        source: source,
        minCharacters: 0,
        error: {
            source: "Cannot search. No source used, and Semantic API module was not included",
            noResults: "نتیجه‌ای یافت نشد",
            logging: "Error in debug logging, exiting.",
            noTemplate: "A valid template name was not specified.",
            serverError: "There was an issue with querying the server.",
            maxResults: "Results must be an array to use maxResults setting",
            method: "The method you called is not defined."
        },
        onSelect: function(result, response) {
            $timeout(function() {
                console.log(result);
                $location.path("/content/" + result.id);
            }, 0);
        }
    });
} ]);

ngApp.controller("contentCtrl", [ "$scope", "$http", "$sce", "$routeParams", "$rootScope", "$timeout", "$q", "$rootScope", function($scope, $http, $sce, $routeParams, $rootScope, $timeout, $q, $rootScope) {
    this.id = $routeParams.id;
} ]);

function getHelpLinkById(id) {
    var find;
    _.each(helpMenus, function(d) {
        var t = _.find(d.menus, {
            id: +id
        });
        if (!find) find = t;
    });
    console.log(find);
    return find.url;
}

ngApp.config([ "$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
    $routeProvider.when("/content/:id", {
        templateUrl: function(attr) {
            return getHelpLinkById(attr.id);
        },
        controller: "contentCtrl"
    });
} ]);