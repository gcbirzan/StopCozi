var AuthBaseController = ['$controller', '$scope', '$rootScope', 'CONFIG',
    function ($controller, $scope, $rootScope, CONFIG) {
        $controller('ParentController', {$scope: $scope});

        $rootScope.specialClass = 'gray-bg';
    }
];


angular
    .module('custom')
    .config(['$stateProvider', 'CONFIG', function($stateProvider, CONFIG) {
        $stateProvider
            .state('auth', {
                abstract: true,
                url: '^/auth',
                templateUrl: CONFIG.apiUrlFactory('views/auth/base.html')
            });
    }])
    .controller('AuthBaseController', AuthBaseController);