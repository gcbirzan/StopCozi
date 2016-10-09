var DashboardBaseController = ['$controller', '$scope', '$rootScope', '$state', 'CONFIG', '$http', 'apiUrlFactory', 'translationFactory', '$timeout', '$auth',
    function($controller, $scope, $rootScope, $state, CONFIG, $http, apiUrlFactory, translationFactory, $timeout, $auth) {
        $controller('ParentController', {$scope: $scope});

        $rootScope.pageTitle = translationFactory.translate('dashboard.base.title|Dashboard');
        $rootScope.specialClass = '';
        $rootScope.backgroundClass = '';

        $scope.userName = angular.isString(CONFIG.user) ? CONFIG.user : '';
        $scope.userLogo = angular.isString(CONFIG.userLogo) ? CONFIG.userLogo: '';

        $scope.logout = function () {
            var finalFunction = function() {
                CONFIG.user = false;
                //CONFIG.returnToUrl = null;
                CONFIG.returnToStateName = null;
                CONFIG.returnToStateParams = null;
                $state.go('auth.login');
                $timeout(function() {
                    // Placed this in a timeout to prevent loss of token before actual logout
                    $auth.logout();
                });
            };

            $http
                .get(apiUrlFactory('/auth/logout'))
                .then(finalFunction(), finalFunction());
        };

        $rootScope.isAdmin = function () {
            return CONFIG.userData.roles.length &&
                (CONFIG.userData.roles[0].key == 'admin' || CONFIG.userData.roles[0].key == 'key');
        };
    }
];


angular
    .module('custom')
    .config(['$stateProvider', '$urlRouterProvider', 'CONFIG', function($stateProvider, $urlRouterProvider, CONFIG) {
        $stateProvider
            .state('dashboard', {
                url: '^/dashboard',
                templateUrl: CONFIG.apiUrlFactory('views/dashboard/base.html'),
                /*
                resolve: {
                    checkLoggedIn: CONFIG.checkLoggedIn
                }
                */
            })
    }])
    .controller('DashboardBaseController', DashboardBaseController);
