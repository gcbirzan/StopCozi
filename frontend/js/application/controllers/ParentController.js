var ParentController = ['$controller', '$scope', '$rootScope', 'CONFIG', function($controller, $scope, $rootScope, CONFIG) {
    // Restore previous page title
    var pageTitleCache = $rootScope.pageTitle;
    $scope.$on('$destroy', function() {
        $rootScope.pageTitle = pageTitleCache;
    });
    $scope.CONFIG = CONFIG;
    $rootScope.CONFIG = CONFIG;
}];


angular
    .module('custom')
    .controller('ParentController', ParentController);
