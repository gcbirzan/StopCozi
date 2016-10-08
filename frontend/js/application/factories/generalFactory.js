var generalFactory = ['CONFIG', '$rootScope', '$http', 'apiUrlFactory', '$stateParams', '$state', 'translationFactory', 'aclFactory',
    function(CONFIG, $rootScope, $http, apiUrlFactory, $stateParams, $state, translationFactory, aclFactory) {

        var authCheck = function () {
            return $http
                .get(apiUrlFactory('/auth/check'))
                .then(function(response) {
                    if ((typeof(response.success) == 'undefined' || response.success) && response.data) {
                        angular.extend(CONFIG, response.data);
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
        };

        return {
            authCheck: authCheck
        }
    }
];


angular
    .module('custom')
    .factory('generalFactory', generalFactory);