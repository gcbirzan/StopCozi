var shortTime = [function () {

    var filter = function (value) {
        return moment(value, 'HH:mm:ss').format('HH:mm');
    };

    // Since AngularJS 1.3, filters which are not stateless (depending at the scope)
    // have to explicit define this behavior.
    filter.$stateful = true;

    return filter;
}];

angular
    .module('custom')
    .filter('shortTime', shortTime);