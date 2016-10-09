var CommonLandingController = ['$controller', '$scope', '$rootScope', '$state', 'CONFIG', '$http', 'apiUrlFactory', 'aclFactory', 'translationFactory',
    function ($controller, $scope, $rootScope, $state, CONFIG, $http, apiUrlFactory, aclFactory, translationFactory) {
        $controller('ParentController', {$scope: $scope});

        $rootScope.pageTitle = translationFactory.translate('common.landing.title|Bine ai venit');
    }
];


angular
    .module('custom')
    .config(['$stateProvider', 'CONFIG', function($stateProvider, CONFIG) {
        $stateProvider
            .state('common.landing', {
                url: '^/landing',
                templateUrl: CONFIG.apiUrlFactory('views/common/landing.html')
            });
    }])
    .controller('CommonLandingController', CommonLandingController);