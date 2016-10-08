var CommonReservationController = ['$controller', '$scope', '$rootScope', '$state', 'CONFIG', '$http', 'apiUrlFactory', 'aclFactory', 'translationFactory',
    function ($controller, $scope, $rootScope, $state, CONFIG, $http, apiUrlFactory, aclFactory, translationFactory) {
        $controller('ParentController', {$scope: $scope});

        $scope.countyList = [{
            id: 'BH',
            name: 'Bihor'
        }, {
            id: 'GL',
            name: 'Galati'
        }];

        $scope.agencies = [      {
        		parent: 'BH',
            id: 1,
            name: "SPCLEP",
            description: "Evidenta Populatiei",
            location: "BH",
            geo: "2355,46767",
            address: "Cicoarei 17",
            contact:"tel: 07346"
          },{
          	parent: 'GL',
            id: 2,
            name: "Pasapoarte",
            description: "Biroul Pasapoarte",
            location: "GL",
            geo: "6757,63467",
            address: "Prezan 12",
            contact:"tel: 07346"
          }];
        $rootScope.pageTitle = translationFactory.translate('common.reservation.title|Bine ai venit');


    }
];


angular
    .module('custom')
    .config(['$stateProvider', 'CONFIG', function($stateProvider, CONFIG) {
        $stateProvider
            .state('common.reservation', {
                url: '^/common/reservation',
                templateUrl: CONFIG.apiUrlFactory('views/common/reservation.html')
            });
    }])
    .controller('CommonReservationController', CommonReservationController);
