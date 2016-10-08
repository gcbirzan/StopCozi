var CommonReservationController = ['$controller', '$scope', '$rootScope', '$state', 'CONFIG', '$http', 'apiUrlFactory', 'aclFactory', 'translationFactory', '$stateParams',
    function ($controller, $scope, $rootScope, $state, CONFIG, $http, apiUrlFactory, aclFactory, translationFactory, $stateParams) {
        $controller('ParentController', {$scope: $scope});

        $rootScope.pageTitle = translationFactory.translate('common.reservation.title|Pas 1');

        var checkStep = function () {
            $scope.step = 0;
            if ($stateParams.step) {
                angular.forEach([1, 2, 3], function(i) {
                    if ($stateParams.step.indexOf(i) != -1) {
                        $scope.step = i;
                    }
                });
            }
            if (!$scope.step) {
                $scope.step = 1;
            }
        }

        checkStep();

        var cancelStateChangeHandler = $rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
            $stateParams.step = toParams.step;
            checkStep();
        });

        $scope.$on('$destroy', function() {
            cancelStateChangeHandler();
        });

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
            })
            .state('common.reservation.step', {
                url: '^/common/reservation/:step',
                template: '<div ui-view=""></div>'
            })
        ;
    }])
    .controller('CommonReservationController', CommonReservationController);
