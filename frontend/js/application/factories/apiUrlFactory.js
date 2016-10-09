/**
 * Processes api URLs and changes them according to the collection received from the server.
 */
if (angular.isEmpty(_CONFIG)) {
    var _CONFIG = {};
}
_CONFIG.extend({
    apiUrlFactory: function(url, urls, baseUrl, apiUrl) {
        if (!angular.isObject(urls)) {
            if (angular.isObject(_CONFIG.apiUrls)) {
                urls = _CONFIG.apiUrls;
            } else {
                urls = {};
            }
        }
        if (!angular.isString(baseUrl)) {
            if (apiUrl) {
                if (!angular.isString(apiUrl)) {
                    if (angular.isString(_CONFIG.apiUrl)) {
                        baseUrl = _CONFIG.apiUrl;
                    } else {
                        baseUrl = '';
                    }
                } else {
                    baseUrl = apiUrl;
                }
            } else {
                if (angular.isString(_CONFIG.baseUrl)) {
                    baseUrl = _CONFIG.baseUrl;
                } else {
                    baseUrl = '';
                }
            }
        }

        if (angular.isString(urls[url])) {
            return baseUrl + urls[url];
        }

        return baseUrl + url;
    }
});

var apiUrlFactory = ['CONFIG', function (CONFIG) {
    return function(url, apiUrl) {
        return CONFIG.apiUrlFactory(url, CONFIG.apiUrls, null, apiUrl);
    }
}];

angular
    .module('custom')
    .factory('apiUrlFactory', apiUrlFactory);
