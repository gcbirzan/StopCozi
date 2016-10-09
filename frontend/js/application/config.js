angular.isEmpty = function (val) {
    return angular.isUndefined(val)
        || val === null
        || angular.isArray(val) && val.length == 0
        || angular.isString(val) && val.length == 0
        // leave this out for now as it consumes alot of resources during the digest cycle
        //|| angular.isObject(val) && JSON.stringify(val) == '{}'
    ;
}

if (angular.isEmpty(_CONFIG)) {
    var _CONFIG = {};
}
angular.extend(_CONFIG, {
    development: false, // set the development flag
    showTranslationKeys: false,
    baseUrl: '', // the base URL
    //apiUrl: 'http://10.10.20.102:8080', // the API base URL
    apiUrl: 'http://193.230.8.27:31080', // the API base URL
    applicationName: 'StopCozi',
    applicationMail: 'info@stopcozi.ro',
    logoName: 'StopCozi',
    user: null, // keep it on null as it is relevant to the check
    role: 'unknown',
    defaultLocale: 'ro_RO',
    jqGridStyleUI: 'Bootstrap',
    jqGridRowNum: 20,
    jqSubGridRowNum: 5,
    jqGridRowList: [5, 10, 15, 20, 50],

    shortStableDateFormat: 'Y-m-d',
    longStableDateFormat: 'Y-m-d H:i:s',
    shortStableTimeFormat: 'H:i',
    longStableTimeFormat: 'H:i:s',

    shortDateFormat: 'd-m-Y',
    longDateFormat: 'd-m-Y H:i',
    shortTimeFormat: 'H:i',
    longTimeFormat: 'H:i:s',

    thousandsSeparator: ',',
    decimalSeparator: '.',
    decimalPrecision: 2,

    aclRules: ['allow_*'],
    translations: {},
    apiUrls: {},
    reloginMessages: ['TOKEN_NOT_PROVIDED', 'TOKEN_EXPIRED', 'TOKEN_INVALID', 'TOKEN_BLACKLISTED', 'LOGGED_OUT_SUCCESSFULLY'],
    redirectMessages: ['ROUTE_BLOCKED', 'MODEL_NOT_FOUND'],
    eventBackgroundColor: '#eeeeee',
    scheduler: {
        worked: {
            color: '#336277',
            errors: {
                borderColor: '#FF0000'
            }
        }
    }
});
// The above config will ONLY be used before application run. Otherwise use the CONFIG injected constant.


angular.extend(_CONFIG, {
    extend: function (object) {
        if (angular.isObject(object)) {
            angular.extend(_CONFIG, object);
            angular.module('custom').constant('CONFIG', _CONFIG);
        }

        if (!_CONFIG.dateTimeFormats) {
            _CONFIG.dateTimeFormats = {};
        }
        angular.forEach([
            'shortStableDateFormat',
            'longStableDateFormat',
            'shortStableTimeFormat',
            'longStableTimeFormat',
            'shortDateFormat',
            'longDateFormat',
            'shortTimeFormat',
            'longTimeFormat'
        ], function(format) {
            if (_CONFIG[format]) {
                _CONFIG.dateTimeFormats[format] = moment.convertFormatFromPhp(_CONFIG[format]);
            }
        });

        var injector = angular.element('body').injector();
        if (injector) {
            var $rootScope = injector.get('$rootScope');
            if ($rootScope) {
                $rootScope.CONFIG = _CONFIG;
            }
        }

        return _CONFIG;
    }
});

_CONFIG.extend({
    getRequestTypes: function(response) {
        var apiUrlFactory = angular.element('body').injector().get('apiUrlFactory');
        if (!apiUrlFactory) {
            var CONFIG = angular.element('body').injector().get('CONFIG');
            if (!CONFIG && !angular.isEmpty(_CONFIG)) {
                CONFIG = _CONFIG;
            }
            if (CONFIG) {
                apiUrlFactory = CONFIG.apiUrlFactory;
            }
        }

        var url = false;
        if (response.config && response.config.url) {
            if (angular.isString(response.config.url)) {
                url = response.config.url;
            } else if (angular.isObject(response.config.url) && response.config.url.url) {
                url = response.config.url.url;
            }
        }
        var requestIsHTML =
            url
            && url.indexOf('.html') != -1;

        var requestIsPrimordial = url && url == apiUrlFactory('/auth/check');

        var requestIsAuthInit = url && url == (apiUrlFactory('/auth/check') + '?init=1');

        return {
            requestIsHTML: requestIsHTML,
            requestIsPrimordial: requestIsPrimordial,
            requestIsAuthInit: requestIsAuthInit
        };
    }
});

_CONFIG.extend({
    httpInterceptor: ['$q', function ($q) {
        return {
            // optional method
            'request': function (config) {
                var CONFIG = angular.element('body').injector().get('CONFIG');
                if (!CONFIG && !angular.isEmpty(_CONFIG)) {
                    CONFIG = _CONFIG;
                }

                // Parse any data before sending further
                var recurseObject = function(object) {
                    if (!object || typeof(object) != 'object') {
                        return object;
                    } else if(typeof(object.formatPHP) == 'function') {
                        return object.formatPHP(CONFIG.longStableDateFormat);
                    } else {
                        angular.forEach(object, function(value, key) {
                            object[key] = recurseObject(value);
                        });
                        return object;
                    }

                    return object;
                };

                config.data = recurseObject(config.data);

                // do something on success
                return config;
            },

            // optional method
            'requestError': function (response) {
                // do something on error
                if (response.config.canRecover) {
                    return responseOrNewPromise
                }
                return $q.reject(response);
            },


            // optional method
            'response': function (response) {
                //response = angular.extend(response, response.data);
                if (response && response.data && typeof(response.success) != 'undefined') {
                    response.success = response.data.success;
                }
                if (response && response.data && response.data.code) {
                    response.code = response.data.code;
                }
                if (response && response.data && response.data.message) {
                    response.message = response.data.message;
                }
                if (response && response.data && response.data.data) {
                    response.data = response.data.data;
                }

                var CONFIG = angular.element('body').injector().get('CONFIG');
                if (!CONFIG && !angular.isEmpty(_CONFIG)) {
                    CONFIG = _CONFIG;
                }
                var requestTypes = CONFIG ? CONFIG.getRequestTypes(response) : null;

                var toastr = angular.element('body').injector().get('toastr');
                var translationFactory = angular.element('body').injector().get('translationFactory');

                if (requestTypes && !requestTypes.requestIsPrimordial && toastr && translationFactory) {
                    if (response.message || response.code) {
                        var message = response.message ? response.message : translationFactory.translate(response.code);
                        var allowHtml = false;
                        if ((response.code == 'VALIDATION_FAILED' || response.message == 'VALIDATION_FAILED') && CONFIG.development && response.data && angular.isObject(response.data)) {
                            allowHtml = true;
                            message += '<br /><br />';
                            angular.forEach(response.data, function(values, key) {
                                angular.forEach(values, function(value) {
                                    message += '<li>' + key + ' - ' + value + '</li>';
                                });
                            });
                        }
                        if (response.success || typeof(response.success) == 'undefined') {
                            toastr.success(message, null, {allowHtml: allowHtml});
                        } else {
                            toastr.error(message, null, {allowHtml: allowHtml});
                        }
                    } else {
                        if (typeof(response.success) != 'undefined' && !response.success && (!response.config || !response.config.url || response.config.url.indexOf('.html') == -1)) {
                            toastr.error(translationFactory.translate('server_request_unsuccessful'));
                        }
                    }
                } else {
                    if (response.message || response.code) {
                        alert(response.message ? response.message : response.code);
                    } else if (typeof(response.success) != 'undefined' && !response.success && (!requestTypes || !requestTypes.requestIsHTML)) {
                        alert('server_request_failure');
                    }
                }

                var $state = angular.element('body').injector().get('$state');
                if (CONFIG.reloginMessages.indexOf(response.code) != -1 || CONFIG.reloginMessages.indexOf(response.message) != -1) {
                    $state.go('auth.login');
                }
                if (CONFIG.redirectMessages.indexOf(response.code) != -1 || CONFIG.redirectMessages.indexOf(response.message) != -1) {
                    if (CONFIG.user) {
                        $state.go('dashboard');
                    }
                }

                if (response && response.headers) {
                    var authorization = response.headers('Authorization');
                    if (authorization && authorization.length) {
                        if (authorization.indexOf('Bearer ') == 0) {
                            authorization = authorization.substring('Bearer '.length);
                        }
                        if (authorization.length) {
                            var $auth = angular.element('body').injector().get('$auth');
                            $auth.setToken(authorization);
                        }
                    }
                }

                // do something on success
                return response;
            },

            // optional method
            'responseError': function (response) {
                //response = angular.extend(response, response.data);
                if (response && response.data && typeof(response.success) != 'undefined') {
                    response.success = response.data.success;
                }
                if (response && response.data && response.data.code) {
                    response.code = response.data.code;
                }
                if (response && response.data && response.data.message) {
                    response.message = response.data.message;
                }
                if (response && response.data && response.data.data) {
                    response.data = response.data.data;
                }

                var CONFIG = angular.element('body').injector().get('CONFIG');
                if (!CONFIG && !angular.isEmpty(_CONFIG)) {
                    CONFIG = _CONFIG;
                }
                var requestTypes = CONFIG ? CONFIG.getRequestTypes(response) : null;

                var toastr = angular.element('body').injector().get('toastr');
                var translationFactory = angular.element('body').injector().get('translationFactory');

                if (requestTypes && !requestTypes.requestIsPrimordial && toastr && translationFactory) {
                    if (response.message || response.code) {
                        toastr.error(response.message ? response.message : translationFactory.translate(response.code));
                    } else {
                        toastr.error(translationFactory.translate('server_request_error'));
                    }
                } else {
                    if (response.message || response.code) {
                        alert(response.message ? response.message : response.code);
                    } else if (!requestTypes.requestIsAuthInit) {
                        alert('server_request_error');
                    }
                }

                var $state = angular.element('body').injector().get('$state');
                if (CONFIG.reloginMessages.indexOf(response.code) != -1 || CONFIG.reloginMessages.indexOf(response.message) != -1) {
                    $state.go('auth.login');
                }
                if (CONFIG.redirectMessages.indexOf(response.code) != -1 || CONFIG.redirectMessages.indexOf(response.message) != -1) {
                    if (CONFIG.user) {
                        $state.go('dashboard');
                    }
                }

                // do something on error
                if (response.config && response.config.canRecover) {
                    return response;
                }

                return $q.reject(response);
            }
        };
    }]
});

// We use this on the initial application load
/*
_CONFIG.extend({
    checkLoggedInInit: function () {
        var req = {
            url: _CONFIG.apiUrlFactory('/auth/check') + '?init=1',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.satellizer_token
            }
        };
        return angular.injector(['ng'])
            .get('$http')(req)
            .then(function (response) {
                if (response.success && response.data || response.data && response.data.success && response.data.data) {
                    _CONFIG.extend(response.data.data ? response.data.data : response.data);
                }
            }, function (response) {
                _CONFIG.extend({user: false});

                var message;
                if (response.message) {
                    message = response.message;
                } else if (response.data && response.data.message) {
                    message = response.data.message;
                } else if (response.code) {
                    message = response.code;
                } else if (response.data && response.data.code) {
                    message = response.data.code;
                }

                if (message && message.indexOf('TOKEN') != -1) {
                    return;
                }
                alert(message ? message : 'server_request_failure');

                var $q = angular.injector(['ng']).get('$q');
                var deferred = $q.defer();
                return deferred.promise;
            });
    }
});
*/

// We use this when employing state
/*
_CONFIG.extend({
    checkLoggedIn: ['$rootScope', '$location', '$state', '$q', '$timeout', '$http', 'apiUrlFactory', 'aclFactory', 'CONFIG',
        function ($rootScope, $location, $state, $q, $timeout, $http, apiUrlFactory, aclFactory, CONFIG) {
            var deferred = $q.defer();
            if (CONFIG.user) {
                deferred.resolve();
                $rootScope.userName = angular.isString(CONFIG.user) ? CONFIG.user : '';
                aclFactory.setup();
            } else {
                if (typeof(CONFIG.user) == 'undefined' || CONFIG.user === null) {
                    $http.get(apiUrlFactory('/auth/check')).then(function (response) {
                        if ((typeof(response.success) == 'undefined' || response.success) && response.data) {
                            angular.extend(CONFIG, response.data);
                            aclFactory.setup();
                            translationFactory.check();
                            $rootScope.userName = angular.isString(CONFIG.user) ? CONFIG.user : '';
                            $timeout(deferred.resolve);
                        } else {
                            CONFIG.user = false;
                            //CONFIG.returnToUrl = $location.url();
                            $timeout(deferred.reject);
                            $state.go('auth.login');
                            //$location.url('/auth/login');
                        }
                    }, function (response) {
                        CONFIG.user = false;
                        //CONFIG.returnToUrl = $location.url();
                        $timeout(deferred.reject);
                        $state.go('auth.login');
                    });
                } else {
                    // This caused some issues when arriving on a protected page without being logged in
                    //deferred.reject();
                    //CONFIG.returnToUrl = $location.url();
                    $state.go('auth.login');
                    //$location.url('/auth/login');
                }
            }

            return deferred.promise;
        }
    ]
});
*/


var configApplication = ['$stateProvider', '$urlRouterProvider', 'IdleProvider', 'KeepaliveProvider', '$authProvider', '$httpProvider', '$provide', 'CONFIG',
    function ($stateProvider, $urlRouterProvider, IdleProvider, KeepaliveProvider, $authProvider, $httpProvider, $provide, CONFIG) {
        // Configure Idle settings
        IdleProvider.idle(5); // in seconds
        IdleProvider.timeout(120); // in seconds

        $provide.factory('appHttpInterceptor', CONFIG.httpInterceptor);
        // register the $http AJAX interceptor as a service
        $httpProvider.interceptors.push('appHttpInterceptor');
        // Not really needed because request is JSON
        //$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

        //initialize get if not there
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }

        // Answer edited to include suggestions from comments
        // because previous version of code introduced browser-related errors

        //disable IE ajax request caching
        $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
        // extra
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';

        // Configure jQuery AJAX
        $(document)
            .ajaxSend(function(event, jqXHR, ajaxOptions) {
                jqXHR.setRequestHeader('Authorization', 'Bearer ' + angular.element('body').injector().get('$auth').getToken());
                jqXHR.setRequestHeader('X-XSRF-TOKEN', angular.element('body').injector().get('$cookies')['XSRF-TOKEN']);
            });
        $(document)
            .ajaxSuccess(function(event, jqXHR, ajaxOptions, data) {
                if (angular.isObject(data)) {
                    var success = typeof(data.success) == 'undefined' ? true : false;
                    var message = '';
                    var code = '';
                    if (!angular.isEmpty(data.success)) {
                        success = data.success;
                    }
                    if (!angular.isEmpty(data.message)) {
                        message = data.message;
                    }
                    if (!angular.isEmpty(data.code)) {
                        code = data.code;
                    }
                    if (data.data) {
                        if (!angular.isEmpty(data.data.success)) {
                            success = data.data.success;
                        }
                        if (!angular.isEmpty(data.data.message)) {
                            message = data.data.message;
                        }
                        if (!angular.isEmpty(data.data.code)) {
                            code = data.data.code;
                        }
                    }

                    var toastr = angular.element('body').injector().get('toastr');
                    var translationFactory = angular.element('body').injector().get('translationFactory');
                    if (success && (message || code)) {
                        toastr
                            .success(message ? message : translationFactory.translate(code));
                    } else if (!success) {
                        if (message || code) {
                            toastr
                                .error(message ? message : translationFactory.translate(code));
                        } else {
                            toastr
                                .error(translationFactory.translate('server_request_unsuccessful'));
                        }
                    }

                    var CONFiG = angular.element('body').injector().get('CONFIG');
                    var $state = angular.element('body').injector().get('$state');
                    if (CONFIG.reloginMessages.indexOf(code) != -1 || CONFIG.reloginMessages.indexOf(message) != -1) {
                        $state.go('auth.login');
                    }
                    if (CONFIG.redirectMessages.indexOf(code) != -1 || CONFIG.redirectMessages.indexOf(message) != -1) {
                        if (CONFIG.user) {
                            $state.go('dashboard');
                        }
                    }
                }
            });
        $(document)
            .ajaxError(function(event, jqXHR, ajaxOptions, thrownError) {
                var translationFactory = angular.element('body').injector().get('translationFactory');
                var message = '';
                var code = '';

                if (jqXHR && jqXHR.responseJSON) {
                    if (jqXHR.responseJSON.message) {
                        message = jqXHR.responseJSON.message;
                    } else if (jqXHR.responseJSON.data && jqXHR.responseJSON.data.message) {
                        message = jqXHR.responseJSON.data.message;
                    }
                }
                if (jqXHR && jqXHR.responseJSON) {
                    if (jqXHR.responseJSON.code) {
                        code = jqXHR.responseJSON.code;
                    } else if (jqXHR.responseJSON.data && jqXHR.responseJSON.data.code) {
                        code = jqXHR.responseJSON.data.code;
                    }
                }

                var toastr = angular.element('body').injector().get('toastr');
                if (message || code) {
                    toastr.error(message ? message : translationFactory.translate(code));
                } else {
                    toastr.error(translationFactory.translate('server_request_error'));
                }

                var CONFiG = angular.element('body').injector().get('CONFIG');
                var $state = angular.element('body').injector().get('$state');
                if (CONFIG.reloginMessages.indexOf(code) != -1 || CONFIG.reloginMessages.indexOf(message) != -1) {
                    $state.go('auth.login');
                }
                if (CONFIG.redirectMessages.indexOf(code) != -1 || CONFIG.redirectMessages.indexOf(message) != -1) {
                    if (CONFIG.user) {
                        $state.go('dashboard');
                    }
                }
            });
        /*
        $(document)
            .ajaxSend(function(event, jqXHR, ajaxOptions) {
                if (!ajaxOptions.dataFilter) {
                    ajaxOptions.dataFilter = function(data, type) {
                        // We can pre-process response data here
                        return data;
                    }
                }
            });
        */

        $urlRouterProvider.otherwise(function($injector, $location) {
            $injector.get('$state').go('common.reservation');
        });

        // Satellizer configuration that specifies which API
        // route the JWT should be retrieved from
        $authProvider.loginUrl = CONFIG.apiUrlFactory('/auth/login');
    }
];

// Make sure the empty dates are not forced to current date in the datepicker
angular.module('datePicker')
    .filter('mFormat', function () {
        return function (m, format, tz) {
            if (angular.isEmpty(m) || m === null || m === '') {
                return '';
            }

            if (!(moment.isMoment(m))) {
                return moment.utc(m).format(format);
            }
            return tz ? moment.tz(m, tz).format(format) : m.format(format);
        };
    })
    .config(['datePickerConfig', function(datePickerConfig){
        datePickerConfig.firstDay = 1;
    }]);

angular
    .module('custom')
    .constant('CONFIG', _CONFIG)
    .config(configApplication)
    .run(['$rootScope', '$location', '$state', '$stateParams', 'toastr', 'apiUrlFactory', 'aclFactory', 'translationFactory', 'CONFIG', 'dateTimeConfig',
        function($rootScope, $location, $state, $stateParams,toastr, apiUrlFactory, aclFactory, translationFactory, CONFIG, dateTimeConfig) {
            // this is for usage like {{ $state.current.data.specialClass }} inside views
            $rootScope.$state = $state;

            if (!$rootScope.can) {
                aclFactory.setup();
            }

            translationFactory.setupMomentTranslations();
            // Setup general date format for the datepicker
            dateTimeConfig.format = moment.convertFormatFromPhp(CONFIG.shortDateFormat);
            var old = dateTimeConfig.template;
            dateTimeConfig.template = function (attrs, id) {
                if (attrs.ngModel.trim().indexOf('$parent.') != 0) {
                    attrs.ngModel = '$parent.' + attrs.ngModel;
                }
                return old(attrs, id);
            }

            // set previous & to state + params
            $rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
                CONFIG.previousState = from;
                CONFIG.previousStateParams = fromParams;
                CONFIG.toState = to;
                CONFIG.toStateParams = toParams;
            });

            $rootScope.pageTitleCache = {};

            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
                // options are useless in this plugin revision; see https://github.com/angular-ui/ui-router/issues/1620

                var pageTitleCacheKey = String(fromState.name) + (toParams ? JSON.stringify(fromParams) : '');
                $rootScope.pageTitleCache[pageTitleCacheKey] = $rootScope.pageTitle;
                var pageTitleCacheKey = String(fromState.name);
                $rootScope.pageTitleCache[pageTitleCacheKey] = $rootScope.pageTitle;

                var pageTitleCacheKey = String(toState.name) + (toParams ? JSON.stringify(toParams) : '');
                if ($rootScope.pageTitleCache[pageTitleCacheKey]) {
                    $rootScope.pageTitle = $rootScope.pageTitleCache[pageTitleCacheKey];
                } else {
                    var pageTitleCacheKey = String(toState.name);
                    if ($rootScope.pageTitleCache[pageTitleCacheKey]) {
                        $rootScope.pageTitle = $rootScope.pageTitleCache[pageTitleCacheKey];
                    }
                }

                 if (
                    (!toState.templateUrl || !angular.isString(toState.templateUrl) || (toState.templateUrl.indexOf('auth') != 0 && toState.name.indexOf('common') != 0 && toState.templateUrl.indexOf('loading') == -1))
                    && (!toState.name || !angular.isString(toState.name) || (toState.name.indexOf('auth') != 0 && toState.name.indexOf('common') != 0 && toState.name != 'loading'))
                ) {
                    //var returnToUrl = CONFIG.returnToUrl;
                    var returnToStateName = CONFIG.returnToStateName;

                    // always remember the last state before going to login
                    //CONFIG.returnToUrl = toState.url;
                    //if (!CONFIG.returnToUrl) {
                    //    CONFIG.returnToUrl = $location.url();
                    //}
                    //if (CONFIG.returnToUrl.indexOf('^') == 0) {
                    //    CONFIG.returnToUrl = CONFIG.returnToUrl.substr(1);
                    //}

                    CONFIG.returnToStateName = toState.name;

                    var params = {};
                    angular.extend(params, $stateParams);
                    angular.extend(params, toParams);
                    CONFIG.returnToStateParams = params;

                    // This seemed irrelevant when not rejecting the checkLoggedIn promise
                    if (CONFIG.user !== null && !CONFIG.user) {
                        event.preventDefault();
                        toastr.error(translationFactory.translate('config|Please login first.'));
                        //CONFIG.returnToUrl = $location.url();
                        $state.go('auth.login');
                        //$location.url('/auth/login');
                    } else if (
                        CONFIG.returnToStateName && !aclFactory.can(CONFIG.returnToStateName)
                        //|| CONFIG.returnToUrl && !aclFactory.can(CONFIG.returnToUrl)
                        //|| toState.templateUrl && !aclFactory.can(toState.templateUrl)
                    ) {
                        event.preventDefault();
                        toastr.error(translationFactory.translate('config|You are not allowed to access the resource you requested.'));
                        if (/*!returnToUrl &&*/ !returnToStateName) {
                            $state.go(CONFIG.dashboardRedirect && CONFIG.dashboardRedirect.length ? CONFIG.dashboardRedirect : 'dashboard');
                        }
                    } else if (toState.name == 'dashboard' && CONFIG.dashboardRedirect && CONFIG.dashboardRedirect.length) {
                        event.preventDefault();
                        $state.go(CONFIG.dashboardRedirect);
                    }
                }
            });
        }
    ]);
