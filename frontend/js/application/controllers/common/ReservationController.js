var CommonReservationController = ['$controller', '$scope', '$rootScope', '$state', 'CONFIG', '$http', 'apiUrlFactory', 'aclFactory', 'translationFactory', '$stateParams', 'toastr',
    function ($controller, $scope, $rootScope, $state, CONFIG, $http, apiUrlFactory, aclFactory, translationFactory, $stateParams, toastr) {
        //$controller('ParentController', {$scope: $scope});
        $controller('CommonReservationValidationController', {$scope: $scope});

        $rootScope.pageTitle = translationFactory.translate('common.reservation.title|Rezervare');

        $scope.data = {};

        $scope.step2Enabled = false;
        $scope.step3Enabled = false;
        $scope.step4Enabled = false;
        $scope.step5Enabled = false;
        $scope.reservationEnabled = false;

        $scope.minDate = moment();

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
                || $scope.step >= 2 && (!$scope.data || !$scope.data.county || !$scope.data.county.id || !$scope.data.agency || !$scope.data.agency.id || !$scope.data.service || !$scope.data.service.id)
                || $scope.step >= 3 && (!$scope.data || !$scope.data.date || !$scope.times || !$scope.times.length)
                || $scope.step >= 4 && (!$scope.data || !$scope.data.time)
                || $scope.step >= 5 && (!$scope.data || !$scope.data.name || !$scope.data.mobile)
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


        $scope.checkStep2 = function() {
            if($scope.data.county && $scope.data.county.id && $scope.data.agency && $scope.data.agency.id && $scope.data.service && $scope.data.service.id) {
                // TODO: fetch the slots
                $scope.step2Enabled = true;
            } else {
                $scope.step2Enabled = false;
            }
        }

        $scope.checkStep3 = function() {
            if($scope.data.date && $scope.times && $scope.times.length) {
                $scope.step3Enabled = true;
            } else {
                $scope.step3Enabled = false;
            }
        }

        $scope.checkStep4 = function(time) {
            $scope.data.time = time;
            if($scope.data.time) {
                $scope.step4Enabled = true;
            } else {
                $scope.step4Enabled = false;
            }
        }

        $http
            .get(apiUrlFactory('data/counties.json'))
            .then(function (response) {
                if (response.data && response.data.counties) {
                    $scope.countiesOrig = response.data.counties;
                }
                $scope.countiesBase = [];
                angular.forEach($scope.countiesOrig, function(county) {
                    $scope.countiesBase.push({id: county.name, name: county.name});
                });
                $scope.counties = $scope.countiesBase;
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
            $scope.data.date = '';
            $scope.data.time = '';
            $scope.freeslots = [];

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
            $scope.data.date = '';
            $scope.data.time = '';
            $scope.freeslots = [];

            if($scope.data.county && $scope.data.county.id) {
                $http
                    .get(
                        apiUrlFactory('/agencies', true) + '/' + encodeURIComponent($scope.data.county.id) + (search ? '/' + encodeURIComponent(search) : '')
                        //apiUrlFactory('data/agencies.json')
                    )
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
            $scope.data.date = '';
            $scope.data.time = '';
            $scope.freeslots = [];

            if($scope.data.county && $scope.data.county.id && $scope.data.agency && $scope.data.agency.id) {
                $http
                    .get(apiUrlFactory('data/services.json') + '?agency=' + encodeURIComponent($scope.data.agency.id) + '&search=' + encodeURIComponent(search))
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

        $scope.refreshSlots = function() {
            $scope.checkStep2();

            if($scope.data.county && $scope.data.county.id && $scope.data.agency && $scope.data.agency.id && $scope.data.service && $scope.data.service.id) {
                $http
                    .get(apiUrlFactory('data/freeslots.json') + '?service=' + encodeURIComponent($scope.data.service.id))
                    .then(function (response) {
                        if (response.data && response.data.freeslots) {
                            $scope.freeslots = response.data.freeslots;
                        }
                        if (!$scope.freeslots || !$scope.freeslots.length) {
                            toastr.error(translationFactory.translate('common.reservation|Nu s-au gasit sloturi libere'));
                        } else {
                            $scope.minDate = $scope.freeslots[0].start;
                        }
                    });
            }

            $scope.checkStep3();
        }

        $scope.refreshTimes = function() {
            $scope.times = [];
            if ($scope.data.date) {
                var format = moment.convertFormatFromPhp(CONFIG.shortStableDateFormat);
                angular.forEach($scope.freeslots, function(slot) {
                    if (moment($scope.data.date).format(format) == moment(slot.start).format(format)) {
                        $scope.times.push({id: slot.start, name: moment(slot.start).format(moment.convertFormatFromPhp(CONFIG.shortTimeFormat))});
                    }
                });
            }

            if (!$scope.times.length && $scope.step == 2) {
                // a little bit intrusive
                //toastr.error(translationFactory.translate('common.reservation|Nu s-au gasit sloturi libere'));
            }

            $scope.checkStep3();
        }

        $scope.endReservation = function() {
            $http
                .post(apiUrlFactory('data/validation.json?validationCode=' + encodeURIComponent($scope.data.validationCode)))
                .then(function (response) {
                    if (response.data && response.data.status && response.data.status === 'OK') {
                        toastr.success('Booking ID: ' + response.data.bookingId);

                        return;
                    }

                    if (response.data.status !== 'OK') {
                        toastr.error(translationFactory.translate('common.reservation|Validarea a eşuat!'));
                    }
                });
        };

        $scope.$watch('data.date', function(newValue, oldValue) {
            if (newValue != oldValue) {
                $scope.refreshTimes();
            }
        });
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
