/**
 * Processes api URLs and changes them according to the collection received from the server.
 */
if (angular.isEmpty(_CONFIG)) {
    var _CONFIG = {};
}
_CONFIG.extend({
    apiUrlFactory: function(url, urls, baseUrl) {
        if (!angular.isObject(urls)) {
            if (angular.isObject(_CONFIG.apiUrls)) {
                urls = _CONFIG.apiUrls;
            } else {
                urls = {};
            }
        }
        if (!angular.isString(baseUrl)) {
            if (angular.isString(_CONFIG.baseUrl)) {
                baseUrl = _CONFIG.baseUrl;
            } else {
                baseUrl = '';
            }
        }

        if (angular.isString(urls[url])) {
            return baseUrl + urls[url];
        }

        return baseUrl + url;
    }
});

var apiUrlFactory = ['CONFIG', function (CONFIG) {
    return function(url) {
        return CONFIG.apiUrlFactory(url, CONFIG.apiUrls);
    }
}];

angular
    .module('custom')
    .factory('apiUrlFactory', apiUrlFactory);
