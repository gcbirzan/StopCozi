var numeric = ['numericFormatFactory', function (numericFormatFactory) {
    var filter = function (nr, decimals, dec_point, thousands_sep, min, max) {
        return numericFormatFactory.convert(nr, decimals, dec_point, thousands_sep, min, max);
    };

    // Since AngularJS 1.3, filters which are not stateless (depending at the scope)
    // have to explicit define this behavior.
    filter.$stateful = true;

    return filter;
}];

angular
    .module('custom')
    .filter('numeric', numeric);