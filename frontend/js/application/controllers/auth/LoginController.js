var AuthLoginController = ['$controller', '$scope', '$rootScope', '$auth', '$state', 'CONFIG', '$http', 'apiUrlFactory', 'aclFactory', 'translationFactory',
    function ($controller, $scope, $rootScope, $auth, $state, CONFIG, $http, apiUrlFactory, aclFactory, translationFactory) {
        $controller('ParentController', {$scope: $scope});

        $rootScope.pageTitle = translationFactory.translate('auth.login.title|Login');


        var controller = this;
        $scope.name = '';
        $scope.password = '';

        $scope.tryToLogin = function() {

            var credentials = {
                name: $scope.name,
                password: $scope.password
            };

            // Use Satellizer's $auth service to login
            $auth.login(credentials).then(function(data) {
                // If login is successful, redirect to the users state
                // Actually let's wait for the user specific data to arrive
                //CONFIG.user = true;

                $state.go('loading', null, {location: false});

                return $http
                    .get(apiUrlFactory('/auth/check'))
                    .then(function(response) {
                        if ((typeof(response.success) == 'undefined' || response.success) && response.data) {
                            angular.extend(CONFIG, response.data)
                            aclFactory.setup();
                            translationFactory.setup();
                            translationFactory.check();
                            $rootScope.userName = angular.isString(CONFIG.user) ? CONFIG.user : '';

                            if (
                                //!CONFIG.returnToUrl
                                //|| CONFIG.returnToUrl.indexOf('/auth/login') == 0
                                //|| CONFIG.returnToUrl && !aclFactory.can(CONFIG.returnToUrl)
                                false
                                || CONFIG.returnToStateName && !aclFactory.can(CONFIG.returnToStateName)
                            ) {
                                $state.go('dashboard');
                            } else {
                                if (CONFIG.returnToStateName) {
                                    $state.go(CONFIG.returnToStateName, CONFIG.returnToStateParams);
                                } else {
                                    //$location.url(CONFIG.returnToUrl);
                                    $state.go('dashboard');
                                }
                            }
                        } else {
                            CONFIG.user = false;
                            $state.go('auth.login');
                        }
                    }, function(response) {
                        CONFIG.user = false;
                        $state.go('auth.login');
                    });

            });
        }

        $scope.showRegisterMoreInfo = function() {
            $scope.registerMoreInfo = true;
        };
    }
];


angular
    .module('custom')
    .config(['$stateProvider', 'CONFIG', function($stateProvider, CONFIG) {
        $stateProvider
            .state('auth.login', {
                url: '^/auth/login',
                templateUrl: CONFIG.apiUrlFactory('views/auth/login.html')
            });
    }])
    .controller('AuthLoginController', AuthLoginController);