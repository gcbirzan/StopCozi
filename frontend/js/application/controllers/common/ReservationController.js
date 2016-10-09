var CommonReservationController = ['$controller', '$scope', '$rootScope', '$state', 'CONFIG', '$http', 'apiUrlFactory', 'aclFactory', 'translationFactory', '$stateParams', 'toastr',
    function ($controller, $scope, $rootScope, $state, CONFIG, $http, apiUrlFactory, aclFactory, translationFactory, $stateParams, toastr) {
        $controller('ParentController', {$scope: $scope});

        $rootScope.pageTitle = translationFactory.translate('common.reservation.title|Rezervare');

        $scope.step2Enabled = false;
        $scope.step3Enabled = true;
        $scope.step4Enabled = true;
        $scope.step5Enabled = true;
        $scope.reservationEnabled = true;

        var checkStep = function () {
            $scope.step = 0;
            if ($stateParams.step) {
                /*
                1 - combos
                2 - month view
                3 - day view
                4 - contact form
                5 - validation form
                 */
                angular.forEach([1, 2, 3, 4, 5], function(i) {
                    if ($stateParams.step.indexOf(i) != -1) {
                        $scope.step = i;
                    }
                });
            }
            if (!$scope.step) {
                $scope.step = 1;
            }

            if (
                false
                //$scope.step >= 2 && (!$scope.data || !$scope.data.county.id || !$scope.data.agency.id || !$scope.data.service.id)
                //|| $scope.step >= 3 && (!$scope.data || !$scope.data.date)
                //|| $scope.step >= 4 && (!$scope.data || !$scope.data.time)
                //|| $scope.step >= 5 && (!$scope.data || !$scope.data.name || !$scope.data.mobile)
            ) {
                $state.go('common.reservation')
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

        $scope.data = {};

        $http
            .get(apiUrlFactory('data/counties.json'))
            .then(function (response) {
                if (response.data && response.data.counties) {
                    $scope.countiesBase = response.data.counties;
                }
                $scope.counties = angular.copy($scope.countiesBase);
                if (!$scope.counties || !$scope.counties.length) {
                    toastr.error(translationFactory.translate('common.reservation|Nu s-au gasit judete'));
                }
            });

        $scope.refreshCounties = function(search) {
            $scope.data.county = {};
            $scope.counties = [];
            $scope.data.agency = {};
            $scope.agencies = [];
            $scope.data.service = {};
            $scope.services = [];

            angular.forEach($scope.countiesBase, function(county) {
                if (county.name.toLowerCase().indexOf(search.toLowerCase()) != -1) {
                    $scope.counties.push(county);
                }
            });
            if (!$scope.counties || !$scope.counties.length) {
                toastr.error(translationFactory.translate('common.reservation|Nu s-au gasit judete'));
            }

            $scope.checkStep2();
        }

        $scope.refreshAgencies = function(search) {
            $scope.data.agency = {};
            $scope.agencies = [];
            $scope.data.service = {};
            $scope.services = [];

            if($scope.data.county && $scope.data.county.id) {
                $http
                    .get(apiUrlFactory('data/agencies.json?county=' + encodeURIComponent($scope.data.county.id) + '&search=' + encodeURIComponent(search)))
                    .then(function (response) {
                        if (response.data && response.data.agencies) {
                            $scope.agencies = response.data.agencies;
                        }
                        if (!$scope.agencies || !$scope.agencies.length) {
                            toastr.error(translationFactory.translate('common.reservation|Nu s-au gasit agentii'));
                        }
                    });
            }

            $scope.checkStep2();
        }

        $scope.refreshServices = function(search) {
            $scope.data.service = {};
            $scope.services = [];

            if($scope.data.county && $scope.data.county.id && $scope.data.agency && $scope.data.agency.id) {
                $http
                    .get(apiUrlFactory('data/services.json?county=' + encodeURIComponent($scope.data.county.id) + '&agency=' + encodeURIComponent($scope.data.agency.id) + '&search=' + encodeURIComponent(search)))
                    .then(function (response) {
                        if (response.data && response.data.services) {
                            $scope.services = response.data.services;
                        }
                        if (!$scope.services || !$scope.services.length) {
                            toastr.error(translationFactory.translate('common.reservation|Nu s-au gasit servicii'));
                        }
                    });
            }

            $scope.checkStep2();
        }

        $scope.checkStep2 = function() {
            if($scope.data.county && $scope.data.county.id && $scope.data.agency && $scope.data.agency.id && $scope.data.service && $scope.data.service.id) {
                // TODO: fetch the slots
                $scope.step2Enabled = true;
            } else {
                $scope.step2Enabled = false;
            }
        }
    }
];


angular
    .module('custom')
    .config(['$stateProvider', 'CONFIG', function($stateProvider, CONFIG) {
        $stateProvider
            .state('common.reservation', {
                url: '^',
                templateUrl: CONFIG.apiUrlFactory('views/common/reservation.html')
            })
            .state('common.reservation.step', {
                url: '^/reservation/:step',
                template: '<div ui-view=""></div>'
            })
        ;
    }])
    .controller('CommonReservationController', CommonReservationController);
