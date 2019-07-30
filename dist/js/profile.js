// داشبورد مدیریتی صدف info@sadafdashboard.ir 

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
    app.lang.setLang({
        selector: ".navbar.navbar-inverse"
    });
} ]);

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
        var links = $("#side-navigation2 .simple-link");
        interval = interval || 10;
        $(".sadaf-circular-preogress").progressbar(10, +interval * 1e3);
        app.autoPlayTimer.timer = setTimeout(function() {
            var selectedMenu = $(links[app.autoPlayTimer.counter++ % links.length]);
            document.location.href = selectedMenu.attr("href");
            selectedMenu.parents(".panel-collapse").collapse("show");
            $(".sadaf-circular-preogress").progressbar("stop");
            app.autoPlay("start", interval);
        }, +interval * 1e3);
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
        var desc = clone.find(".title.over-show .desc").html();
        debugger;
        clone.find(" .header").remove();
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
        var css = '<link href="' + app.absoluteUrl + "dist/css/dash-all" + (app.lang.isRtl ? "-rtl" : "") + ".css?v=" + app.version + '" rel="stylesheet" />                   <style  type="text/css">@page {                                margin: 1.5cm;                                @top-center {                                        content: "sapam";                                    }                                }                    </style>';
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
            $.getJSON(app.urlPrefix + "dist/locales/locale-" + langChar + ".js?v=" + app.version, null, function(d) {
                app.lang.setLang({
                    data: d
                });
            });
            while (this.q.length > 0) {
                var item = this.q.pop();
                if (item.callback) callback(app.lang.lang[item.key] || item.key);
            }
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

(function() {
    "use strict";
    var profile = angular.module("profileCat", [ "semantic-ui", "ngAnimate", "ngRoute", "navbarCat", "pascalprecht.translate", "ngSanitize" ]);
    profile.factory("userFactory", [ "$http", function($http) {
        var user;
        function getInfo() {
            if (!user) user = $http.get(app.urlPrefix + "api/users/getCurrent");
            return user;
        }
        function getHistory() {
            return $http.get(app.urlPrefix + "api/users/getLoginHistory");
        }
        function getSessions() {
            return $http.get(app.urlPrefix + "api/users/getActiveSessions");
        }
        function update(user) {
            return $http.post(app.urlPrefix + "api/users/update", user);
        }
        function kick(id) {
            return $http.get(app.urlPrefix + "api/users/kick/" + id);
        }
        function getPolicy() {
            return $http.get(app.urlPrefix + "api/users/getPolicy");
        }
        function changePass(old, newp, repeat) {
            return $http.post(app.urlPrefix + "api/users/changePass", {
                passwordOld: old,
                passwordNew: newp,
                passwordRepeat: repeat
            });
        }
        function updateSettings(user) {
            return $http.post(app.urlPrefix + "api/users/updateSettings", user);
        }
        return {
            getInfo: getInfo,
            update: update,
            changePass: changePass,
            updateSettings: updateSettings,
            getHistory: getHistory,
            getSessions: getSessions,
            kick: kick,
            getPolicy: getPolicy
        };
    } ]);
    function onResult($scope, $sce, d) {
        $scope.result = true;
        $scope.success = d.data.result;
        $scope.error = !d.data.result;
        $scope.message = $sce.trustAsHtml(filterXSS(d.data.message + ""));
    }
    profile.controller("cProfile", [ "$scope", "$http", "userFactory", "$sce", "$translate", "$interval", function($scope, $http, userFactory, $sce, $translate, $interval) {
        $(".ui.dimmer.modals .mobile-verify").remove();
        $scope.persian = function persian(s) {
            if (s == null) return s;
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
        };
        userFactory.getInfo().then(function(d) {
            $scope.user = d.data;
        });
        $scope.update = function() {
            $scope.saveProgress = true;
            userFactory.update($scope.user).then(function(d) {
                onResult($scope, $sce, d);
                $scope.saveProgress = false;
            }).catch(function() {
                $scope.saveProgress = false;
            });
        };
        $scope.model = {};
        $translate.use(+$("#lang").val() == 0 ? "fa" : "en");
        $scope.show = function() {
            $scope.step = 1;
            $scope.reCaptcha();
            $(".ui.modal.mobile-verify").modal({
                closable: false
            }).modal("show");
        };
        $scope.sendPhoneCode = function() {
            $scope.error = null;
            $scope.smsloading = true;
            var smsLink = app.urlPrefix + "account/sendActivationSms";
            $http.post(smsLink, {
                mobile: $scope.model.mobile,
                captcha: $scope.model.captcha
            }).then(function(res) {
                $scope.smsloading = false;
                if (!res.data.result && res.data.type == "mobile") {
                    $scope.error = res.data.error;
                } else if (!res.data.result && res.data.type == "captcha") {
                    $scope.error = res.data.error;
                } else if (!res.data.result) {
                    $scope.error = res.data.error;
                } else {
                    $scope.step = 2;
                    $scope.timer = 120;
                    $scope.interval = $interval(function() {
                        $scope.timer--;
                        if ($scope.timer == 0) {
                            $scope.sendSmsAgain();
                        }
                    }, 1e3);
                }
            }).catch(function() {
                $scope.smsloading = false;
            });
        };
        $scope.sendSmsAgain = function() {
            $scope.step = 1;
            $scope.model.captcha = null;
            $scope.model.activationCode = null;
            $scope.error = null;
            $scope.reCaptcha();
            $interval.cancel($scope.interval);
        };
        $scope.reCaptcha = function() {
            $scope.loadingCaptcha = true;
            var getCaptchalink = app.urlPrefix + "account/getCaptcha";
            $scope.model.captcha = null;
            $http.post(getCaptchalink).then(function(res) {
                $scope.loadingCaptcha = false;
                $scope.captchaPic = res.data;
            });
        };
        $scope.verifyCode = function() {
            $scope.error = null;
            $scope.verifyCodeProgress = true;
            var link = app.urlPrefix + "account/ChangeMobile";
            $http.post(link, $scope.model).then(function(res) {
                $scope.error = null;
                $scope.verifyCodeProgress = false;
            }).catch(function(res) {
                $scope.error = res.data.title || "خطایی به وجود آمده است. لطفا دوباره امتحان کنید";
                $scope.verifyCodeProgress = false;
            });
        };
    } ]);
    function error($sce, $scope, data) {
        $scope.result = true;
        $scope.error = true;
        $scope.success = false;
        $scope.message = $sce.trustAsHtml(filterXSS(data.desc));
    }
    profile.controller("cChangePass", [ "$scope", "userFactory", "$sce", "$translate", function($scope, userFactory, $sce, $translate) {
        $scope.app = app;
        $scope.changePass = function() {
            $scope.progress = true;
            userFactory.changePass($scope.oldPass, $scope.newPass, $scope.repeatPass).then(function(d) {
                $scope.progress = false;
                onResult($scope, $sce, d);
            }).catch(function(res) {
                $scope.progress = false;
                error($sce, $scope, res.data);
            });
        };
        userFactory.getPolicy().then(function(res) {
            $scope.help = res.data;
        });
        $translate.use(+$("#lang").val() == 0 ? "fa" : "en");
    } ]);
    profile.controller("cGeneral", [ "$scope", "$location", "$translate", function($scope, $location, $translate) {
        $scope.path = $location.path();
        $scope.$on("$locationChangeStart", function(event, newUrl, oldUrl) {
            $scope.path = $location.path();
        });
        $translate.use(+$("#lang").val() == 0 ? "fa" : "en");
    } ]);
    profile.controller("cHistory", [ "$scope", "$http", "userFactory", "$sce", "$translate", function($scope, $http, userFactory, $sce, $translate) {
        userFactory.getHistory().then(function(d) {
            $scope.list = d.data;
        });
        $scope.moment = moment;
    } ]);
    profile.controller("cSessions", [ "$scope", "$http", "userFactory", "$sce", "$translate", function($scope, $http, userFactory, $sce, $translate) {
        function getSessions() {
            userFactory.getSessions().then(function(d) {
                $scope.list = d.data;
            });
        }
        getSessions();
        $scope.kick = function(item) {
            var f = confirm("آیا برای بستن نشست اطمینان دارید؟");
            if (!f) return;
            userFactory.kick(item.Id).then(getSessions);
        };
        $scope.moment = moment;
    } ]);
    profile.controller("cSettings", [ "$scope", "$http", "userFactory", "$sce", "$translate", function($scope, $http, userFactory, $sce, $translate) {
        userFactory.getInfo().then(function(d) {
            $scope.user = d.data;
            $scope.user.language = d.data.language + "";
        });
        var changeLang = false;
        $scope.langChange = function() {
            changeLang = true;
        };
        $scope.updateSettings = function() {
            userFactory.updateSettings($scope.user).then(function(d) {
                if (changeLang) {
                    location.reload();
                    changeLang = false;
                }
                onResult($scope, $sce, d);
            });
        };
        $http.get(app.urlPrefix + "api/themes/getNames").then(function(res) {
            $scope.themes = res.data.list;
            $scope.themes.splice(0, 0, {
                id: -1,
                name: "پیش فرض"
            });
        });
        $translate.use(+$("#lang").val() === 0 ? "fa" : "en");
    } ]);
    profile.config([ "$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
        $routeProvider.when("/profile", {
            templateUrl: app.urlPrefix + "dist/partial/profile/partial/profile.html?v=" + app.version,
            controller: "cProfile"
        }).when("/changepass", {
            templateUrl: app.urlPrefix + "dist/partial/profile/partial/changePass.html?v=" + app.version,
            controller: "cChangePass"
        }).when("/settings", {
            templateUrl: app.urlPrefix + "dist/partial/profile/partial/settings.html?v=" + app.version,
            controller: "cSettings"
        }).when("/history", {
            templateUrl: app.urlPrefix + "dist/partial/profile/partial/history.html?v=" + app.version,
            controller: "cHistory"
        }).when("/active_sessions", {
            templateUrl: app.urlPrefix + "dist/partial/profile/partial/sessions.html?v=" + app.version,
            controller: "cSessions"
        }).otherwise({
            redirectTo: "/profile"
        });
    } ]);
    profile.config([ "$translateProvider", function($translateProvider) {
        $translateProvider.useStaticFilesLoader({
            prefix: app.urlPrefix + "dist/locales/locale-",
            suffix: ".js"
        });
        $translateProvider.preferredLanguage("fa");
        $translateProvider.useSanitizeValueStrategy("sanitizeParameters");
    } ]);
    profile.config([ "$locationProvider", function($locationProvider) {
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
})();