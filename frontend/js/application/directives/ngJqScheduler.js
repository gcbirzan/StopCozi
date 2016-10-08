/**
 * ngJqGrid - Directive for jqGrid
 */
var ngJqScheduler = ['CONFIG', '$compile', 'translationFactory', 'numericFormatFactory', '$timeout', '$rootScope',
    function (CONFIG, $compile, translationFactory, numericFormatFactory, $timeout, $rootScope) {
        return {
            restrict: 'AE',
            scope: {
                config: '='
            },
            link: function (scope, element, attrs) {
                translationFactory.setupJqSchedulerTranslations();
                translationFactory.setupMomentTranslations();

                var div;

                scope.$watch('config', function (newValue) {
                    if (!newValue) {
                        return;
                    }

                    var randomizer = function() {
                        return Math.floor((Math.random() * 1000) + 1);
                    }

                    div = angular.element('<div></div>');
                    if (!newValue.id || !angular.isString(newValue.id)) {
                        do {
                            newValue.id = 'jqScheduler_' + randomizer();
                        } while (angular.element('#' + newValue.id).length);
                    }
                    if (!angular.element('#' + newValue.id).length) {
                        div.attr('id', newValue.id);
                        element.append($compile(div)(scope));
                    }

                    var legenda = angular.element('<div style="margin-top: 10px;"></div>');
                    element.append(legenda);

                    var errors = angular.element('<div class="alert alert-danger" style="margin-top: 10px;"></div>');
                    element.append(errors);

                    var defaultLocale = 'en';
                    if (angular.isString(CONFIG.defaultLocale) && CONFIG.defaultLocale.length) {
                        defaultLocale = CONFIG.defaultLocale;
                    }

                    var baseValue = {
                        schedulerLicenseKey: CONFIG.schedulerLicenseKey,
                        regional: defaultLocale,
                        lang: defaultLocale,
                        aspectRatio: 1,
                        height: 'auto',
                        scrollTime: '00:00',
                        eventBackgroundColor: CONFIG.eventBackgroundColor,
                        header: {
                            left: 'today prev,next',
                            center: 'title',
                            right: 'timelineDay,timelineTenDay,timelineMonth'
                        },
                        defaultView: 'timelineMonth',
                        views: {
                            timelineDay: {
                                buttonText: translationFactory.translate('ngJqScheduler|:15 slots'),
                                slotDuration: '00:15'
                            },
                            timelineTenDay: {
                                type: 'timeline',
                                duration: { days: 10 }
                            }
                        },
                        resourceAreaWidth: '10%',
                        resourceLabelText: translationFactory.translate('ngJqScheduler|Resources'),
                        viewRender: function(view, element) {
                            newValue.defaultView = view.name;
                            newValue.defaultDate = view.intervalStart.formatPHP(CONFIG.shortStableDateFormat);
                            //newValue.intervalStart = view.intervalStart.formatPHP(CONFIG.shortStableDateFormat);
                            //newValue.intervalEnd = view.intervalEnd.formatPHP(CONFIG.shortStableDateFormat);
                        },
                        loading: function(isLoading, view) {
                            newValue.isLoading = isLoading;
                        },
                        getCalendar: function() {
                            return $(div);
                        },
                        eventRender: function(event, element) {
                            if (event.ranges && angular.isArray(event.ranges)) {
                                var found = false;
                                angular.forEach(event.ranges, function(range) {
                                    var start = range.start ? moment.utc(range.start) : range.start;
                                    var end = range.end ? moment.utc(range.end) : range.end;
                                    if (
                                        start && start.isAfter(event.start)
                                        || end && end.isBefore(event.end)
                                    ) {
                                        return;
                                    }

                                    found = true;
                                });
                                if (!found) {
                                    return false;
                                }
                            }
                            var title = '';
                            if (event.type) {
                                title += (title.length ? '\n' : '')
                                    + translationFactory.translate('table.hours|' + event.type);
                            }
                            if (event.allDay) {
                                title += (title.length ? '\n' : '')
                                    + translationFactory.translate('ngJqScheduler|All day');

                            } else {
                                if (event.start_real){
                                    event.start_real = moment.utc(event.start_real);
                                    title += (title.length ? '\n' : '')
                                    + translationFactory.translate('ngJqScheduler|Start') + ': '
                                    + event.start_real.formatPHP(CONFIG.longDateFormat);
                                } else if (event.start && typeof(event.start.formatPHP) == 'function') {
                                    title += (title.length ? '\n' : '')
                                    + translationFactory.translate('ngJqScheduler|Start') + ': '
                                    + event.start.formatPHP(CONFIG.longDateFormat);
                                }
                                if (event.end_real){
                                    event.end_real = moment.utc(event.end_real);
                                    title += (title.length ? '\n' : '')
                                    + translationFactory.translate('ngJqScheduler|End') + ': '
                                    + event.end_real.formatPHP(CONFIG.longDateFormat);
                                } else if (event.end && typeof(event.end.formatPHP) == 'function') {
                                    title += (title.length ? '\n' : '')
                                    + translationFactory.translate('ngJqScheduler|End') + ': '
                                    + event.end.formatPHP(CONFIG.longDateFormat);
                                }
                            }
                            if (event.title) {
                                if (angular.isNumber(event.title)) {
                                    event.title = numericFormatFactory.convert(event.title);
                                    element.html('<div class="fc-content"><span class="fc-title">' + event.title + '</span></div><div class="fc-bg"></div>');
                                }
                                title += (title.length ? '\n' : '')
                                    + event.title;
                            }
                            if (event.overlapping) {
                                title += (title.length ? '\n' : '')
                                    + translationFactory.translate('ngJqScheduler|Overlapping');
                            }
                            if (event.sundays) {
                                title += (title.length ? '\n' : '')
                                    + translationFactory.translate('ngJqScheduler|Sunday');
                            }
                            if (event.holidays) {
                                title += (title.length ? '\n' : '')
                                    + translationFactory.translate('ngJqScheduler|Holidays');
                            }
                            if (event.outside) {
                                title += (title.length ? '\n' : '')
                                    + translationFactory.translate('ngJqScheduler|Outside');
                            }
                            if (event.readonly) {
                                title += (title.length ? '\n' : '')
                                    + translationFactory.translate('ngJqScheduler|Readonly');
                            }
                            element.attr('title', title);
                        },
                        removeEvents: function(idOrFilter ) {
                            $(div).fullCalendar('removeEvents', [idOrFilter]);
                        },
                        refetchEvents: function( ) {
                            $(div).fullCalendar('refetchEvents');
                        },
                        refetchResources: function( ) {
                            $(div).fullCalendar('refetchResources');
                        },
                        reload: function() {
                            if ($(div).is(':visible')) {
                                if (newValue.resources) {
                                    newValue.refetchResources();
                                }
                                if (newValue.events) {
                                    newValue.refetchEvents();
                                }
                            } else {
                                newValue.queueReload = true;
                            }
                        },
                        render: function() {
                            if (newValue.queueReload) {
                                newValue.queueReload = false;
                                newValue.reload();
                            } else {
                                $(div).fullCalendar('render');
                            }
                        },
                        destroy: function() {
                            $(div).fullCalendar('destroy');
                            element.html('');
                        },
                        removeEvents: function(idOrFilter) {
                            $(div).fullCalendar('removeEvents', idOrFilter);
                        },
                        eventOrder: 'order, title'
                    };

                    if (angular.isString(newValue.resources) || angular.isObject(newValue.resources) && !angular.isArray(newValue.resources)) {
                        newValue.resourcesUrl = newValue.resources;
                        newValue.resources = true;
                    } else if (newValue.resourcesUrl && (!newValue.resources || !angular.isObject(newValue.resources) && !angular.isFunction(newValue.resources))) {
                        newValue.resources = true;
                    }

                    if (newValue.resources === true) {
                        delete newValue.resources;

                        baseValue.resources = function (callback) {
                            if (newValue.resourcesUrl) {
                                var ajaxConfig = {};
                                if (angular.isObject(newValue.resourcesUrl)) {
                                    ajaxConfig = newValue.resourcesUrl;
                                } else {
                                    ajaxConfig.url = newValue.resourcesUrl;
                                }

                                var me = this;
                                ajaxConfig.success = function (response) {
                                    if (response && (typeof(response.success) == 'undefined' || response.success) && response.data && response.data.resources) {
                                        newValue.resourcesData = response.data.resources;
                                        callback.apply(me, [response.data.resources]);
                                    }
                                };

                                $.ajax(ajaxConfig);
                            } else if (newValue.resourcesData && angular.isArray(newValue.resourcesData)) {
                                callback.apply(this, [newValue.resourcesData]);
                            } else {
                                // You must always have dummy resources if the resources option is set
                                callback.apply(this, [[]]);
                            }
                        }
                    }

                    if (angular.isString(newValue.events) || angular.isObject(newValue.events) && !angular.isArray(newValue.events)) {
                        newValue.eventsUrl = newValue.events;
                        delete newValue.events;
                    }

                    if (newValue.eventsUrl && !newValue.events) {
                        baseValue.events = function(start, end, timezone, callback) {
                            errors.html('').hide();
                            legenda.html('').hide();

                            var ajaxConfig = {};
                            if (angular.isObject(newValue.eventsUrl)) {
                                ajaxConfig = newValue.eventsUrl;
                            } else {
                                ajaxConfig.url = newValue.eventsUrl;
                            }
                            if (!ajaxConfig.data) {
                                ajaxConfig.data = {start: start.formatPHP(CONFIG.shortStableDateFormat), end: end.formatPHP(CONFIG.shortStableDateFormat)};
                            }
                            if (newValue.resources && !newValue.resourcesData && !newValue.resourcesUrl) {
                                // TODO: fix fetching resources along with the events
                                //ajaxConfig.data._resources = 1;
                            }

                            var me = this;
                            ajaxConfig.success = function(response) {
                                if (response && (typeof(response.success) == 'undefined' || response.success) && response.data) {
                                    if (response.data.overlapping) {
                                        angular.forEach(response.data.overlapping, function (days, name) {
                                            var daysFormatted = [];
                                            angular.forEach(days, function (day) {
                                                daysFormatted.push(moment.utc(day).formatPHP(CONFIG.shortDateFormat));
                                            });
                                            errors.append(sprintf(translationFactory.translate('ngJqScheduler|%s has overlapping events on %s'), name, daysFormatted.join(', ')) + '<br />').show();
                                        });
                                    }

                                    if (response.data.sundays) {
                                        angular.forEach(response.data.sundays, function (days, name) {
                                            var daysFormatted = [];
                                            angular.forEach(days, function (day) {
                                                daysFormatted.push(moment.utc(day).formatPHP(CONFIG.shortDateFormat));
                                            });
                                            errors.append(sprintf(translationFactory.translate('ngJqScheduler|%s has sunday events on %s'), name, daysFormatted.join(', ')) + '<br />').show();
                                        });
                                    }

                                    if (response.data.week5) {
                                        angular.forEach(response.data.week5, function (weeks, name) {
                                            angular.forEach(weeks, function (days, weekRange) {
                                                var parts = weekRange.split('|');
                                                errors.append(sprintf(translationFactory.translate('ngJqScheduler|%s is planned/worked %s days on week %s - %s'), name, days, moment.utc(parts[0]).formatPHP(CONFIG.shortDateFormat), moment.utc(parts[1]).formatPHP(CONFIG.shortDateFormat)) + '<br />').show();
                                            });
                                        });
                                    }

                                    if (response.data.holidays) {
                                        angular.forEach(response.data.holidays, function (days, name) {
                                            var daysFormatted = [];
                                            angular.forEach(days, function (day) {
                                                daysFormatted.push(moment.utc(day).formatPHP(CONFIG.shortDateFormat));
                                            });
                                            errors.append(sprintf(translationFactory.translate('ngJqScheduler|%s has holiday events on %s'), name, daysFormatted.join(', ')) + '<br />').show();
                                        });
                                    }

                                    if (response.data.outside) {
                                        angular.forEach(response.data.outside, function (days, name) {
                                            var daysFormatted = [];
                                            angular.forEach(days, function (day) {
                                                daysFormatted.push(moment.utc(day).formatPHP(CONFIG.shortDateFormat));
                                            });
                                            errors.append(sprintf(translationFactory.translate('ngJqScheduler|%s has outside events on %s'), name, daysFormatted.join(', ')) + '<br />').show();
                                        });
                                    }

                                    if (response.data.resources) {
                                        newValue.resourcesData = response.data.resources;
                                        $(div).fullCalendar('refetchResources');
                                    }

                                    if (response.data.events) {
                                        //newValue.eventsData = response.data.events;

                                        var types = [];

                                        angular.forEach(response.data.events, function (event, key) {
                                            if (event.type && CONFIG.scheduler && CONFIG.scheduler[event.type] && angular.isObject(CONFIG.scheduler[event.type])) {
                                                var config = angular.extend({}, CONFIG.scheduler[event.type]);

                                                if (newValue.eventConfigs) {
                                                    if (!angular.isArray(newValue.eventConfigs)) {
                                                        newValue.eventConfigs = [String(newValue.eventConfigs)];
                                                    }
                                                    angular.forEach(newValue.eventConfigs, function(key) {
                                                        if (config[key]) {
                                                            angular.extend(config, config[key]);
                                                            delete config[key];
                                                        }
                                                    });
                                                }

                                                if (event.overlapping || event.sundays || event.holidays || event.outside) {
                                                    if (config.errors) {
                                                        angular.extend(config, config.errors);
                                                        delete config.errors;
                                                    }
                                                }

                                                if (event.overlapping) {
                                                    if (config.overlapping) {
                                                        angular.extend(config, config.overlapping);
                                                    }
                                                } else {
                                                    delete config.overlapping;
                                                }

                                                if (event.sundays) {
                                                    if (config.sundays) {
                                                        angular.extend(config, config.sundays);
                                                    }
                                                } else {
                                                    delete config.sundays;
                                                }

                                                if (event.holidays) {
                                                    if (config.holidays) {
                                                        angular.extend(config, config.holidays);
                                                    }
                                                } else {
                                                    delete config.holidays;
                                                }

                                                if (event.outside) {
                                                    if (config.outside) {
                                                        angular.extend(config, config.outside);
                                                    }
                                                } else {
                                                    delete config.outside;
                                                }

                                                if (event.readonly) {
                                                    if (config.readonly) {
                                                        angular.extend(config, config.readonly);
                                                    }
                                                } else {
                                                    delete config.readonly;
                                                }

                                                if (event.totals) {
                                                    if (config.totals) {
                                                        angular.extend(config, config.totals);
                                                    }
                                                } else {
                                                    delete config.totals;
                                                }

                                                if (config.color && !config.backgroundColor) {
                                                    config.backgroundColor = config.color;
                                                }
                                                if (config.backgroundColor && !config.borderColor) {
                                                    config.borderColor = config.backgroundColor;
                                                }

                                                if (event.dow && angular.isArray(event.dow)) {
                                                    var dow = [];
                                                    angular.forEach(event.dow, function (day) {
                                                        if (day == 7) {
                                                            day = 0;
                                                        }
                                                        dow.push(day);
                                                    });
                                                    dow.sort();
                                                    config.dow = dow;
                                                }

                                                response.data.events[key] = angular.extend(config, event);

                                                types.push(event.type);
                                            }
                                        });

                                        if (types.length) {
                                            legenda.html('').show();
                                        }

                                        angular.forEach(CONFIG.scheduler, function (event, name) {
                                            if (types.indexOf(name) != -1) {
                                                name = translationFactory.translate('table.hours|' + name);
                                                var color = event.color;
                                                var backgroundColor = event.backgroundColor ? event.backgroundColor : color;
                                                var borderColor = event.borderColor ? event.borderColor : (backgroundColor ? backgroundColor : '#e7eaec');
                                                var textColor = event.textColor ? event.textColor : (event.backgroundColor ? '#FFFFFF' : '#333');
                                                legenda.append(
                                                    '<span style="padding: 4px 6px; border-width: 1px; border-style: solid; margin: 0 5px 5px 0; display: inline-block;'
                                                    + (textColor ? 'color: ' + textColor + '; ' : '')
                                                    + (backgroundColor ? 'background-color: ' + backgroundColor + ';' : '')
                                                    + (borderColor ? 'border-color: ' + borderColor + ';' : '')
                                                    + '">'
                                                    + name
                                                    + '</span>'
                                                );
                                            }
                                        });

                                        callback.apply(me, [response.data.events]);
                                    }
                                }
                            };

                            $.ajax(ajaxConfig);
                        };
                    }

                    angular.forEach(baseValue, function(value, key) {
                        if (angular.isEmpty(newValue[key])) {
                            newValue[key] = value;
                        }
                    });

                    // this is here to compensate for ng-hide/ng-show on template parents
                    $timeout(function() {
                        $(div).fullCalendar(newValue);
                    });

                    if (!$rootScope.globalReloaders) {
                        $rootScope.globalReloaders = {};
                    }
                    $rootScope.globalReloaders[newValue.id] = 0;
                    var cancelReloadWatcher = $rootScope.$watch('globalReloaders.' + newValue.id, function(newValue1, oldValue1) {
                        if (newValue1 === oldValue1) {
                            return;
                        }
                        if (newValue && newValue.reload) {
                            newValue.reload();
                        }
                    }, true);
                    scope.$on('$destroy', function() {
                        cancelReloadWatcher();
                    });
                });
            }
        };
    }
];

angular
    .module('custom')
    .directive('ngJqScheduler', ngJqScheduler);