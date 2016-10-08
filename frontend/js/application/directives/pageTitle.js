/**
 * pageTitle - Directive for set Page title - mata title
 */
pageTitle = ['$rootScope', 'CONFIG', '$timeout', function ($rootScope, CONFIG, $timeout) {
    return {
        link: function(scope, element, attrs) {
            var listener = function(event, toState, toParams, fromState, fromParams) {
                // Default title - load on Dashboard 1
                var title = 'Application';
                // Create your own title pattern
                if (toState && toState.data && toState.data.pageTitle) {
                    title = CONFIG.applicationName + ' | ' + toState.data.pageTitle;
                } else if ($rootScope.pageTitle) {
                    title = CONFIG.applicationName + ' | ' + $rootScope.pageTitle;
                }
                $timeout(function() {
                    element.text(title);
                });
            };

            $rootScope.$on('$stateChangeStart', listener);
            $rootScope.$watch('pageTitle', listener);
        }
    }
}];

angular
    .module('custom')
    .directive('pageTitle', pageTitle);
