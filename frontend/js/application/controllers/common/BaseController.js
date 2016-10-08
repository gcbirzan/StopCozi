var CommonBaseController = ['$controller', '$scope', '$rootScope', 'CONFIG',
    function ($controller, $scope, $rootScope, CONFIG) {
        $controller('ParentController', {$scope: $scope});

        $rootScope.specialClass = 'gray-bg';
    }
];


angular
    .module('custom')
    .config(['$stateProvider', 'CONFIG', function($stateProvider, CONFIG) {
        $stateProvider
            .state('common', {
                abstract: true,
                url: '^/common',
                templateUrl: CONFIG.apiUrlFactory('views/common/base.html')
            });
    }])
    .controller('CommonBaseController', CommonBaseController);