/**
 * Deals with translations.
 */
var translationFactory = ['$parse', '$translate', '$http', '$timeout', 'apiUrlFactory', 'CONFIG', 'numericFormatFactory',
    function($parse, $translate, $http, $timeout, apiUrlFactory, CONFIG, numericFormatFactory) {
        var check = function (translationId) {
            if (!translationId) {
                var defaultLocale = 'en';
                if (angular.isString(CONFIG.defaultLocale) && CONFIG.defaultLocale.length) {
                    defaultLocale = CONFIG.defaultLocale;
                }
                if ($translate.use() !== defaultLocale) {
                    $translate.use(defaultLocale);
                }

                return;
            }

            var translationIds = [];

            if (angular.isArray(translationId)) {
                translationIds = translationId;
            } else {
                translationIds = [translationId];
            }

            var defaultLocale = 'en';
            if (angular.isString(CONFIG.defaultLocale) && CONFIG.defaultLocale.length) {
                defaultLocale = CONFIG.defaultLocale;
            }
            angular.forEach(translationIds, function(translationId) {
                if (!CONFIG.translations || angular.isEmpty(CONFIG.translations[defaultLocale]) || angular.isEmpty(CONFIG.translations[defaultLocale][translationId])) {

                    // Filling it in will prevent duplicate sending
                    if (angular.isEmpty(CONFIG.translations[defaultLocale])) {
                        CONFIG.translations[defaultLocale] = {};
                    }
                    CONFIG.translations[defaultLocale][translationId] = translationId;
                }
            });
        };

        var translate = function(translationId, interpolateParams, interpolationId) {
            if (!translationId) {
                return translationId;
            }

            if (!angular.isObject(interpolateParams)) {
                interpolateParams = $parse(interpolateParams)(this);
            }

            var translationIds,
                singular = false;

            if (angular.isArray(translationId)) {
                translationIds = translationId;
            } else {
                translationIds = [translationId];
                singular = true;
            }

            if (angular.isArray(translationIds)) {
                var results = {};
                for (var i = 0; i < translationIds.length; i++) {
                    var translationIdX = String(translationIds[i]);

                    if (CONFIG.showTranslationKeys) {
                        results[translationId] = translationIdX;
                    } else {
                        var result = $translate.instant(translationIdX, interpolateParams, interpolationId);
                        if (result.trim() === translationIdX.trim() && translationIdX.indexOf('|') != -1) {
                            var parts = translationIdX.split('|');

                            var translationIdY = parts[0] + '|' + parts[1];
                            check(translationIdY);

                            if (parts.length == 2) {
                                result = $translate.instant(parts[1].trim(), interpolateParams, interpolationId);
                            } else {
                                result = $translate.instant(translationIdY.trim(), interpolateParams, interpolationId);

                                if (result.trim() === translationIdY.trim()) {
                                    result = $translate.instant(parts[1].trim(), interpolateParams, interpolationId);
                                }

                                var params = parts.slice(2);

                                var formattedParams = [];
                                angular.forEach(params, function(param) {
                                    if (!param && !angular.isNumber(param) && !angular.isString(param)) {
                                        formattedParams.push(param);
                                        return;
                                    }

                                    param = String(param);

                                    // numeric attempt
                                    var potential = parseFloat(param);
                                    if (String(potential) === param) {
                                        formattedParams.push(numericFormatFactory.convert(potential, Math.round(potential) === potential ? potential : CONFIG.decimalPrecision));
                                        return;
                                    }

                                    // date attempt
                                    var potential = moment.utc(param);
                                    if (potential.formatPHP(CONFIG.shortStableDateFormat) === param) {
                                        formattedParams.push(potential.formatPHP(CONFIG.shortDateFormat));
                                        return;
                                    }
                                    if (potential.formatPHP(CONFIG.longStableDateFormat) === param) {
                                        formattedParams.push(potential.formatPHP(CONFIG.longDateFormat));
                                        return;
                                    }
                                    if (potential.formatPHP(CONFIG.shortStableTimeFormat) === param) {
                                        formattedParams.push(potential.formatPHP(CONFIG.shortTimeFormat));
                                        return;
                                    }
                                    if (potential.formatPHP(CONFIG.longStableTimeFormat) === param) {
                                        formattedParams.push(potential.formatPHP(CONFIG.longTimeFormat));
                                        return;
                                    }
                                });
                                params = formattedParams;

                                params.unshift(result);
                                result = sprintf.apply(null, params);
                            }
                        } else {
                            check(translationIdX);
                        }

                        results[translationId] = result;
                    }
                }

                return singular ? (!angular.isEmpty(results[translationId]) ? results[translationId] : translationId) : results;
            }

            return translationId;
        };

        var setupTranslationsCache = {jqGrid: {}, moment: {}, fullCalendar: {}};

        var setupJqGridTranslations = function(force) {
            if (!$.jgrid) {
                return;
            }

            if(!$.jgrid.hasOwnProperty("regional")) {
                $.jgrid.regional = [];
            }

            var defaultLocale = 'en';
            if (angular.isString(CONFIG.defaultLocale) && CONFIG.defaultLocale.length) {
                defaultLocale = CONFIG.defaultLocale;
            }

            // Prevent this from running multiple times
            if (!setupTranslationsCache.jqGrid[defaultLocale] || force) {
                setupTranslationsCache.jqGrid[defaultLocale] = true;
                $.jgrid.regional[defaultLocale] = {
                    defaults : {
                        recordtext: translate("jqGrid|View {0} - {1} of {2}"),
                        emptyrecords: translate("jqGrid|No records to view"),
                        loadtext: translate("jqGrid|Loading..."),
                        savetext: translate("jqGrid|Saving..."),
                        pgtext : translate("jqGrid|Page {0} of {1}"),
                        pgfirst : translate("jqGrid|First Page"),
                        pglast : translate("jqGrid|Last Page"),
                        pgnext : translate("jqGrid|Next Page"),
                        pgprev : translate("jqGrid|Previous Page"),
                        pgrecs : translate("jqGrid|Records per Page"),
                        showhide: translate("jqGrid|Toggle Expand Collapse Grid"),
                        // mobile
                        pagerCaption : translate("jqGrid|Grid::Page Settings"),
                        pageText : translate("jqGrid|Page:"),
                        recordPage : translate("jqGrid|Records per Page"),
                        nomorerecs : translate("jqGrid|No more records..."),
                        scrollPullup: translate("jqGrid|Pull up to load more..."),
                        scrollPulldown : translate("jqGrid|Pull down to refresh..."),
                        scrollRefresh : translate("jqGrid|Release to refresh...")
                    },
                    search : {
                        caption: translate("jqGrid|Search..."),
                        Find: translate("jqGrid|Find"),
                        Reset: translate("jqGrid|Reset"),
                        odata: [{ oper:'eq', text:translate('jqGrid|equal')},{ oper:'ne', text:translate('jqGrid|not equal')},{ oper:'lt', text:translate('jqGrid|less')},{ oper:'le', text:translate('jqGrid|less or equal')},{ oper:'gt', text:translate('jqGrid|greater')},{ oper:'ge', text:translate('jqGrid|greater or equal')},{ oper:'bw', text:translate('jqGrid|begins with')},{ oper:'bn', text:translate('jqGrid|does not begin with')},{ oper:'in', text:translate('jqGrid|is in')},{ oper:'ni', text:translate('jqGrid|is not in')},{ oper:'ew', text:translate('jqGrid|ends with')},{ oper:'en', text:translate('jqGrid|does not end with')},{ oper:'cn', text:translate('jqGrid|contains')},{ oper:'nc', text:translate('jqGrid|does not contain')},{ oper:'nu', text:translate('jqGrid|is null')},{ oper:'nn', text:translate('jqGrid|is not null')}],
                        groupOps: [{ op: "AND", text: translate("jqGrid|all") },{ op: "OR",  text: translate("jqGrid|any") }],
                        operandTitle : translate("jqGrid|Click to select search operation."),
                        resetTitle : translate("jqGrid|Reset Search Value")
                    },
                    edit : {
                        addCaption: translate("jqGrid|Add Record"),
                        editCaption: translate("jqGrid|Edit Record"),
                        bSubmit: translate("jqGrid|Submit"),
                        bCancel: translate("jqGrid|Cancel"),
                        bClose: translate("jqGrid|Close"),
                        saveData: translate("jqGrid|Data has been changed! Save changes?"),
                        bYes : translate("jqGrid|Yes"),
                        bNo : translate("jqGrid|No"),
                        bExit : translate("jqGrid|Cancel"),
                        msg: {
                            required:translate("jqGrid|Field is required"),
                            number:translate("jqGrid|Please, enter valid number"),
                            minValue:translate("jqGrid|value must be greater than or equal to "),
                            maxValue:translate("jqGrid|value must be less than or equal to"),
                            email: translate("jqGrid|is not a valid e-mail"),
                            integer: translate("jqGrid|Please, enter valid integer value"),
                            date: translate("jqGrid|Please, enter valid date value"),
                            url: translate("jqGrid|is not a valid URL. Prefix required ('http://' or 'https://')"),
                            nodefined : ' ' + translate("jqGrid|is not defined!"),
                            novalue : ' ' + translate("jqGrid|return value is required!"),
                            customarray : translate("jqGrid|Custom function should return array!"),
                            customfcheck : translate("jqGrid|Custom function should be present in case of custom checking!")

                        }
                    },
                    view : {
                        caption: translate("jqGrid|View Record"),
                        bClose: translate("jqGrid|Close")
                    },
                    del : {
                        caption: translate("jqGrid|Delete"),
                        msg: translate("jqGrid|Delete selected record(s)?"),
                        bSubmit: translate("jqGrid|Delete"),
                        bCancel: translate("jqGrid|Cancel")
                    },
                    nav : {
                        edittext: "",
                        edittitle: translate("jqGrid|Edit selected row"),
                        addtext:"",
                        addtitle: translate("jqGrid|Add new row"),
                        deltext: "",
                        deltitle: translate("jqGrid|Delete selected row"),
                        searchtext: "",
                        searchtitle: translate("jqGrid|Find records"),
                        refreshtext: "",
                        refreshtitle: translate("jqGrid|Reload Grid"),
                        alertcap: translate("jqGrid|Warning"),
                        alerttext: translate("jqGrid|Please, select row"),
                        viewtext: "",
                        viewtitle: translate("jqGrid|View selected row"),
                        savetext: "",
                        savetitle: translate("jqGrid|Save row"),
                        canceltext: "",
                        canceltitle : translate("jqGrid|Cancel row editing"),
                        selectcaption : translate("jqGrid|Actions...")
                    },
                    col : {
                        caption: translate("jqGrid|Select columns"),
                        bSubmit: translate("jqGrid|Ok"),
                        bCancel: translate("jqGrid|Cancel")
                    },
                    errors : {
                        errcap : translate("jqGrid|Error"),
                        nourl : translate("jqGrid|No url is set"),
                        norecords: translate("jqGrid|No records to process"),
                        model : translate("jqGrid|Length of colNames <> colModel!")
                    },
                    formatter : {
                        integer : {thousandsSeparator: CONFIG.thousandsSeparator ? CONFIG.thousandsSeparator : ",", defaultValue: '0'},
                        number : {decimalSeparator: CONFIG.decimalSeparator ? CONFIG.decimalSeparator : ".", thousandsSeparator: CONFIG.thousandsSeparator ? CONFIG.thousandsSeparator : ",", decimalPlaces: 2, defaultValue: '0.00'},
                        currency : {decimalSeparator: CONFIG.decimalSeparator ? CONFIG.decimalSeparator : ".", thousandsSeparator: CONFIG.thousandsSeparator ? CONFIG.thousandsSeparator : ",", decimalPlaces: 2, prefix: "", suffix:"", defaultValue: '0.00'},
                        date : {
                            dayNames:   [
                                translate("jqGrid|Sun"), translate("jqGrid|Mon"), translate("jqGrid|Tue"), translate("jqGrid|Wed"), translate("jqGrid|Thr"), translate("jqGrid|Fri"), translate("jqGrid|Sat"),
                                translate("jqGrid|Sunday"), translate("jqGrid|Monday"), translate("jqGrid|Tuesday"), translate("jqGrid|Wednesday"), translate("jqGrid|Thursday"), translate("jqGrid|Friday"), translate("jqGrid|Saturday")
                            ],
                            monthNames: [
                                translate("jqGrid|Jan"), translate("jqGrid|Feb"), translate("jqGrid|Mar"), translate("jqGrid|Apr"), translate("jqGrid|May"), translate("jqGrid|Jun"), translate("jqGrid|Jul"), translate("jqGrid|Aug"), translate("jqGrid|Sep"), translate("jqGrid|Oct"), translate("jqGrid|Nov"), translate("jqGrid|Dec"),
                                translate("jqGrid|January"), translate("jqGrid|February"), translate("jqGrid|March"), translate("jqGrid|April"), translate("jqGrid|May"), translate("jqGrid|June"), translate("jqGrid|July"), translate("jqGrid|August"), translate("jqGrid|September"), translate("jqGrid|October"), translate("jqGrid|November"), translate("jqGrid|December")
                            ]
                        }
                    }
                };
            }
        };

        var setupMomentTranslations = function(force) {
            if (!moment) {
                return;
            }

            var defaultLocale = 'en';
            if (angular.isString(CONFIG.defaultLocale) && CONFIG.defaultLocale.length) {
                defaultLocale = CONFIG.defaultLocale;
            }

            // Prevent this from running multiple times
            if (!setupTranslationsCache.moment[defaultLocale] || force) {
                setupTranslationsCache.moment[defaultLocale] = true;
                moment.locale(defaultLocale, {
                    months: [
                        translate('moment|January'),
                        translate('moment|February'),
                        translate('moment|March'),
                        translate('moment|April'),
                        translate('moment|May'),
                        translate('moment|June'),
                        translate('moment|July'),
                        translate('moment|August'),
                        translate('moment|September'),
                        translate('moment|October'),
                        translate('moment|November'),
                        translate('moment|December')
                    ],
                    monthsShort: [
                        translate('moment|Jan'),
                        translate('moment|Feb'),
                        translate('moment|Mar'),
                        translate('moment|Apr'),
                        translate('moment|May'),
                        translate('moment|Jun'),
                        translate('moment|Jul'),
                        translate('moment|Aug'),
                        translate('moment|Sep'),
                        translate('moment|Oct'),
                        translate('moment|Nov'),
                        translate('moment|Dec')
                    ],
                    weekdays: [
                        translate('moment|Sunday'),
                        translate('moment|Monday'),
                        translate('moment|Tuesday'),
                        translate('moment|Wednesday'),
                        translate('moment|Thursday'),
                        translate('moment|Friday'),
                        translate('moment|Saturday')
                    ],
                    weekdaysShort: [
                        translate('moment|Sun'),
                        translate('moment|Mon'),
                        translate('moment|Tue'),
                        translate('moment|Wed'),
                        translate('moment|Thu'),
                        translate('moment|Fri'),
                        translate('moment|Sat')
                    ],
                    weekdaysMin: [
                        translate('moment|Su'),
                        translate('moment|Mo'),
                        translate('moment|Tu'),
                        translate('moment|We'),
                        translate('moment|Th'),
                        translate('moment|Fr'),
                        translate('moment|Sa')
                    ],
                    longDateFormat: {
                        //LT: "HH:mm",
                        //LTS: "HH:mm:ss",
                        //L: "DD/MM/YYYY",
                        //LL: "D MMMM YYYY",
                        //LLL: "D MMMM YYYY LT",
                        //LLLL: "dddd, D MMMM YYYY LT"
                        LT: moment.convertFormatFromPhp(CONFIG.shortTimeFormat),
                        LTS: moment.convertFormatFromPhp(CONFIG.longTimeFormat),
                        L: moment.convertFormatFromPhp(CONFIG.shortDateFormat),
                        LL: moment.convertFormatFromPhp(CONFIG.shortDateFormat),
                        LLL: moment.convertFormatFromPhp(CONFIG.shortDateFormat) + ' ' + moment.convertFormatFromPhp(CONFIG.shortTimeFormat),
                        LLLL: moment.convertFormatFromPhp(CONFIG.shortDateFormat) + ' ' + moment.convertFormatFromPhp(CONFIG.shortTimeFormat)
                    },
                    calendar: {
                        sameDay: translate('moment|[Today at] LT'),
                        nextDay: translate('moment|[Tomorrow at] LT'),
                        nextWeek: translate('moment|dddd [at] LT'),
                        lastDay: translate('moment|[Yesterday at] LT'),
                        lastWeek: translate('moment|[Last] dddd [at] LT'),
                        sameElse: "L"
                    },
                    relativeTime: {
                        future: translate("moment|in %s"),
                        past: translate("moment|%s ago"),
                        s: translate("moment|a few seconds"),
                        m: translate("moment|a minute"),
                        mm: translate("moment|%d minutes"),
                        h: translate("moment|an hour"),
                        hh: translate("moment|%d hours"),
                        d: translate("moment|a day"),
                        dd: translate("moment|%d days"),
                        M: translate("moment|a month"),
                        MM: translate("moment|%d months"),
                        y: translate("moment|a year"),
                        yy: translate("moment|%d years")
                    },
                    ordinalParse: /\d{1,2}(st|nd|rd|th)/,
                    ordinal: function(a) {
                        var b = a % 10,
                            c = 1 === ~~(a % 100 / 10) ? "th" : 1 === b ? "st" : 2 === b ? "nd" : 3 === b ? "rd" : "th";
                        return a + c
                    },
                    week: {
                        dow: 1,
                        doy: 4
                    }
                });
            }

            moment.locale(defaultLocale);
        }

        var setupJqSchedulerTranslations = function(force) {
            if (!$.fullCalendar) {
                return;
            }

            var defaultLocale = 'en';
            if (angular.isString(CONFIG.defaultLocale) && CONFIG.defaultLocale.length) {
                defaultLocale = CONFIG.defaultLocale;
            }

            if (!setupTranslationsCache.fullCalendar[defaultLocale] || force) {
                setupTranslationsCache.fullCalendar[defaultLocale] = true;
                $.fullCalendar.datepickerLang(defaultLocale, defaultLocale, {
                    setupJqSchedulerTranslations: true,
                    closeText: translate("jqScheduler.fullcalendar|Done"),
                    prevText: translate("jqScheduler.fullcalendar|Previous"),
                    nextText: translate("jqScheduler.fullcalendar|Next"),
                    currentText: translate("jqScheduler.fullcalendar|Today"),
                    monthNames: [
                        translate('jqScheduler.fullcalendar|January'),
                        translate('jqScheduler.fullcalendar|February'),
                        translate('jqScheduler.fullcalendar|March'),
                        translate('jqScheduler.fullcalendar|April'),
                        translate('jqScheduler.fullcalendar|May'),
                        translate('jqScheduler.fullcalendar|June'),
                        translate('jqScheduler.fullcalendar|July'),
                        translate('jqScheduler.fullcalendar|August'),
                        translate('jqScheduler.fullcalendar|September'),
                        translate('jqScheduler.fullcalendar|October'),
                        translate('jqScheduler.fullcalendar|November'),
                        translate('jqScheduler.fullcalendar|December')
                    ],
                    monthNamesShort: [
                        translate('jqScheduler.fullcalendar|Jan'),
                        translate('jqScheduler.fullcalendar|Feb'),
                        translate('jqScheduler.fullcalendar|Mar'),
                        translate('jqScheduler.fullcalendar|Apr'),
                        translate('jqScheduler.fullcalendar|May'),
                        translate('jqScheduler.fullcalendar|Jun'),
                        translate('jqScheduler.fullcalendar|Jul'),
                        translate('jqScheduler.fullcalendar|Aug'),
                        translate('jqScheduler.fullcalendar|Sep'),
                        translate('jqScheduler.fullcalendar|Oct'),
                        translate('jqScheduler.fullcalendar|Nov'),
                        translate('jqScheduler.fullcalendar|Dec')
                    ],
                    dayNames: [
                        translate('jqScheduler.fullcalendar|Sunday'),
                        translate('jqScheduler.fullcalendar|Monday'),
                        translate('jqScheduler.fullcalendar|Tuesday'),
                        translate('jqScheduler.fullcalendar|Wednesday'),
                        translate('jqScheduler.fullcalendar|Thursday'),
                        translate('jqScheduler.fullcalendar|Friday'),
                        translate('jqScheduler.fullcalendar|Saturday')
                    ],
                    dayNamesShort: [
                        translate('jqScheduler.fullcalendar|Sun'),
                        translate('jqScheduler.fullcalendar|Mon'),
                        translate('jqScheduler.fullcalendar|Tue'),
                        translate('jqScheduler.fullcalendar|Wed'),
                        translate('jqScheduler.fullcalendar|Thu'),
                        translate('jqScheduler.fullcalendar|Fri'),
                        translate('jqScheduler.fullcalendar|Sat')
                    ],
                    dayNamesMin: [
                        translate('jqScheduler.fullcalendar|Su'),
                        translate('jqScheduler.fullcalendar|Mo'),
                        translate('jqScheduler.fullcalendar|Tu'),
                        translate('jqScheduler.fullcalendar|We'),
                        translate('jqScheduler.fullcalendar|Th'),
                        translate('jqScheduler.fullcalendar|Fr'),
                        translate('jqScheduler.fullcalendar|Sa')
                    ],
                    weekHeader: translate("jqScheduler.fullcalendar|Wk"),
                    dateFormat: moment.convertFormatFromPhp(CONFIG.shortDateFormat),
                    firstDay: 1,
                    isRTL: !1,
                    showMonthAfterYear: !1,
                    yearSuffix: ''
                });
            }

            $.fullCalendar.lang(CONFIG.defaultLocale, {
                buttonText: {
                    prev: translate('jqScheduler.fullcalendar|Previous'),
                    next: translate('jqScheduler.fullcalendar|Next'),
                    prevYear: translate('jqScheduler.fullcalendar|Previous year'),
                    nextYear: translate('jqScheduler.fullcalendar|Next year'),
                    year: translate('jqScheduler.fullcalendar|Year'),
                    today: translate('jqScheduler.fullcalendar|Today'),
                    month: translate('jqScheduler.fullcalendar|Month'),
                    week: translate('jqScheduler.fullcalendar|Week'),
                    day: translate('jqScheduler.fullcalendar|Day'),
                    list: translate('jqScheduler.fullcalendar|Book')
                },
                allDayText: translate('jqScheduler.fullcalendar|all-day'),
                eventLimitText: function(a) {
                    return sprintf(translate('jqScheduler.fullcalendar|+other %s'), a)
                }
            });
        }

        var setup = function(force) {
            setupJqGridTranslations(force);
            setupMomentTranslations(force);
            setupJqSchedulerTranslations(force);
        }

        return {
            check: check,
            setup: setup,
            translate: translate,
            setupMomentTranslations: setupMomentTranslations,
            setupJqGridTranslations: setupJqGridTranslations,
            setupJqSchedulerTranslations: setupJqSchedulerTranslations
        }
    }
]


angular
    .module('custom')
    .factory('translationFactory', translationFactory);