if (angular.isEmpty(_CONFIG)) {
    _CONFIG = {};
}

_CONFIG.extend({
    getTranslations: function() {
        var $injector = angular.injector(['ng']);
        var $http = $injector.get('$http');
        return $http
            .get(_CONFIG.apiUrlFactory('/translations') + '?init=1')
            .then(function(response) {
                var translations = null;
                if ((typeof(response.success) == 'undefined' || response.success) && response.data) {
                    translations = response.data;
                }
                if (response.data && response.data.success && response.data.data) {
                    translations = response.data.data;
                }
                if (translations && translations.rows) {
                    translations = translations.rows;
                }

                if (translations) {
                    var result = null;
                    if (angular.isArray(translations)) {
                        result = {};
                        var defaultLocale = 'en';
                        if (angular.isString(_CONFIG.defaultLocale) && _CONFIG.defaultLocale.length) {
                            defaultLocale = _CONFIG.defaultLocale;
                        }
                        angular.forEach(translations, function(translation) {
                            var locale = translation.locale ? translation.locale : (translation.language ? translation.language : defaultLocale);
                            if (!angular.isEmpty(locale) && !angular.isEmpty(translation.key) && !angular.isEmpty(translation.value)) {
                                if (translation.value === null || translation.value === '') {
                                    translation.value = String(translation.key);
                                }

                                if (!result[locale]) {
                                    result[locale] = {};
                                }
                                result[locale][translation.key] = String(translation.value);

                                if (locale.indexOf('_') != -1) {
                                    var localeX = locale.split('_')[0];
                                    if (!result[localeX]) {
                                        result[localeX] = {};
                                    }
                                    // Make sure not to overwrite a possible arrived translation.
                                    if (angular.isEmpty(result[localeX][translation.key])) {
                                        result[localeX][translation.key] = String(translation.value);
                                    }
                                }
                            }
                        });
                    } else if (angular.isObject(translations)) {
                        result = {};
                        angular.forEach(translations, function(pairs, locale) {
                            angular.forEach(pairs, function(value, key) {
                                if (value === null || value === '') {
                                    value = key;
                                }

                                if (!result[locale]) {
                                    result[locale] = {};
                                }
                                result[locale][key] = String(value);

                                if (locale.indexOf('_') != -1) {
                                    var localeX = locale.split('_')[0];
                                    if (!result[localeX]) {
                                        result[localeX] = {};
                                    }
                                    // Make sure not to overwrite a possible arrived translation.
                                    if (angular.isEmpty(result[localeX][key])) {
                                        result[localeX][key] = String(value);
                                    }
                                }
                            });
                        });
                    }

                    if (angular.isEmpty(_CONFIG)) {
                        _CONFIG = {};
                    }
                    _CONFIG.extend({translations: result});

                    angular.module('custom')
                        .config(_CONFIG.configTranslateProvider);
                }
            }, function(response) {
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
                alert(message ? message : 'server_request_failure');

                var $q = angular.injector(['ng']).get('$q');
                var deferred = $q.defer();
                return deferred.promise;
            });
    }
});

_CONFIG.extend({
    configTranslateProvider: ['$translateProvider', 'CONFIG', function ($translateProvider, CONFIG) {
        if (CONFIG && CONFIG.translations && angular.isObject(CONFIG.translations)) {
            angular.forEach(CONFIG.translations, function (translationTable, locale) {
                if (angular.isString(locale) && locale.length && angular.isObject(translationTable)) {
                    $translateProvider.translations(locale, translationTable);
                }
                var defaultLocale = 'en';
                if (angular.isString(CONFIG.defaultLocale) && CONFIG.defaultLocale.length) {
                    defaultLocale = CONFIG.defaultLocale;
                }
                $translateProvider.preferredLanguage(defaultLocale);
            });
        }
    }]
});