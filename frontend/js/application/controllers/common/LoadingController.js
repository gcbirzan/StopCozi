var CommonLoadingController = ['$controller', '$scope', '$rootScope', '$state', 'toastr', 'CONFIG', '$http', '$timeout', 'apiUrlFactory', 'translationFactory',
    function($controller, $scope, $rootScope, $state, toastr, CONFIG, $http, $timeout, apiUrlFactory, translationFactory) {
        $controller('ParentController', {$scope: $scope});

        $rootScope.pageTitle = translationFactory.translate('common.loading.title|Loading');
        $rootScope.specialClass = '';
        $rootScope.backgroundClass = '';

        $scope.showTheDashboardLink = false;
        $scope.loadingTimer = $timeout(function() {
            if (CONFIG.user) {
                $state.go('dashboard');
            }
            toastr.error(translationFactory.translate('common.loading| Something must be wrong. Try refreshing or clicking the link if you cannot get to the dashboard.'));
            $scope.showTheDashboardLink = true;
        }, 5000);

        $scope.$on('$destroy', function() {
            if ($scope.loadingTimer) {
                $timeout.cancel($scope.loadingTimer);
            }
        });
    }
];


angular
    .module('custom')
    .config(['$stateProvider', 'CONFIG', function($stateProvider, CONFIG) {
        $stateProvider
            .state('loading', {
                url: '^/loading',
                templateUrl: CONFIG.apiUrlFactory('views/common/loading.html')
            })
    }])
    .controller('CommonLoadingController', CommonLoadingController);