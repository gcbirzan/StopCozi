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

        // no need for this as it is handled by the template check
        // but leave this in for the state provider
        // (with this altered callback option that prevents infinite redirect loops)
        $urlRouterProvider.otherwise(function($injector, $location) {
            $injector.get('$state').go('dashboard');
        });

        $stateProvider
            .state('dashboard', {
                url: '^/dashboard',
                templateUrl: CONFIG.apiUrlFactory('views/dashboard/base.html'),
                resolve: {
                    checkLoggedIn: CONFIG.checkLoggedIn
                }
            })
            .state('dashboard.change_password', {
                url: '^/dashboard/change_password',
                templateUrl: CONFIG.apiUrlFactory('views/change_password/change_password.html'),
                resolve: {
                    checkLoggedIn: CONFIG.checkLoggedIn
                }
            });
    }])
    .controller('DashboardBaseController', DashboardBaseController);
