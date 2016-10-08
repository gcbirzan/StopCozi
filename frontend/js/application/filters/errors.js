/**
 * @description
 * Formats an array of error messages
 *
 * @param {string}
 *
 * @returns {string} formatted string
 */
var errors = ['translationFactory', function (translationFactory) {
        var errorsFilter = function (errorsArray) {
            if (angular.isArray(errorsArray)) {
                // no more translations; performed server side
                //angular.forEach(errorsArray, function(v, k) {
                //    errorsArray[k] = translationFactory.translate(v);
                //});
                return errorsArray.join('<br />');
            } else if (angular.isString(errorsArray)) {
                // no more translations; performed server side
                return errorsArray; //translationFactory.translate(errorsArray);
            }

            return '';
        };

        // Since AngularJS 1.3, filters which are not stateless (depending at the scope)
        // have to explicit define this behavior.
        errorsFilter.$stateful = true;

        return errorsFilter;
    }];

angular
    .module('custom')
    .filter('errors', errors);