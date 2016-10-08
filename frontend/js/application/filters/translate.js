/**
 * @description
 * Uses `$translate` service to translate contents. Accepts interpolate parameters
 * to pass dynamized values though translation.
 *
 * @param {string} translationId A translation id to be translated.
 * @param {*=} interpolateParams Optional object literal (as hash or string) to pass values into translation.
 *
 * @returns {string} Translated text.
 */
var translate = ['translationFactory', function (translationFactory) {
    var translateFilter = function (translationId, interpolateParams, interpolation) {
        return translationFactory.translate(translationId, interpolateParams, interpolation);
    };

    // Since AngularJS 1.3, filters which are not stateless (depending at the scope)
    // have to explicit define this behavior.
    translateFilter.$stateful = true;

    return translateFilter;
}];

angular
    .module('custom')
    .filter('translate', translate);