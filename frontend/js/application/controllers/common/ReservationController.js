var CommonReservationController = ['$controller', '$scope', '$rootScope', '$state', 'CONFIG', '$http', 'apiUrlFactory', 'aclFactory', 'translationFactory', '$stateParams', 'toastr','SweetAlert',
    function ($controller, $scope, $rootScope, $state, CONFIG, $http, apiUrlFactory, aclFactory, translationFactory, $stateParams, toastr, SweetAlert) {
        $controller('ParentController', {$scope: $scope});

        $rootScope.pageTitle = translationFactory.translate('common.reservation.title|Rezervare');

        $scope.data = {};

        $scope.step2Enabled = false;
        $scope.step3Enabled = false;
        $scope.step4Enabled = false;
        $scope.step5Enabled = false;
        $scope.reservationEnabled = false;

        $scope.minDate = moment();
        $scope.data.date = moment();

        var fakeApi = false;

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
            if($scope.data.county && $scope.data.county.id && $scope.data.agency && $scope.data.agency.id && $scope.data.service && $scope.data.service.id && $scope.freeslots && $scope.freeslots.length) {
                $scope.step2Enabled = true;
            } else {
                $scope.step2Enabled = false;
            }

            return $scope.step2Enabled;
        }

        $scope.checkStep3 = function() {
            if($scope.data.date && $scope.times && $scope.times.length) {
                $scope.step3Enabled = true;
            } else {
                $scope.step3Enabled = false;
            }

            return $scope.step3Enabled;
        }

        $scope.checkStep4 = function(time) {
            if (typeof(time) != 'undefined') {
                $scope.data.time = time;
            }
            if($scope.data.time) {
                $scope.step4Enabled = true;
            } else {
                $scope.step4Enabled = false;
            }

            return $scope.step4Enabled;
        }

        $scope.checkStep5 = function() {
            if($scope.data.name && $scope.data.mobile) {
                $scope.step5Enabled = true;
            } else {
                $scope.step5Enabled = false;
            }

            return $scope.step5Enabled;
        }

        $scope.checkReservation = function() {
            if(
                $scope.checkStep2()
                && $scope.checkStep3()
                && $scope.checkStep4()
                && $scope.checkStep5()
            ) {
                $scope.reservationEnabled = true;
            } else {
                $scope.reservationEnabled = false;
            }

            return $scope.reservationEnabled;
        }

        $http
            .get(apiUrlFactory('data/counties.json'))
            .then(function (response) {
                if (response.data) {
                    $scope.countiesOrig = response.data;
                }
                $scope.countiesBase = [];
                angular.forEach($scope.countiesOrig, function(county) {
                    $scope.countiesBase.push({id: county.name, name: county.name.substr(0, 1).toUpperCase() + county.name.substr(1).toLowerCase()});
                });
                $scope.counties = $scope.countiesBase;
                if (!$scope.counties || !$scope.counties.length) {
                    toastr.error(translationFactory.translate('common.reservation|Nu s-au gasit judete'));
                }
            });

        $scope.refreshCounties = function(search) {
            $scope.counties = [];
            $scope.data.agency = {};
            $scope.agencies = [];
            $scope.data.service = {};
            $scope.services = [];
            $scope.data.date = '';
            $scope.data.time = '';
            $scope.freeslots = [];
            $scope.times = [];

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
            $scope.agencies = [];
            $scope.data.service = {};
            $scope.services = [];
            $scope.data.date = '';
            $scope.data.time = '';
            $scope.freeslots = [];

            if($scope.data.county && $scope.data.county.id) {
                $http
                    .get(
                        !fakeApi ? apiUrlFactory('/agencies', true) + '/' + encodeURIComponent($scope.data.county.id) + (search ? '/' + encodeURIComponent(search) : '')
                        : apiUrlFactory('data/agencies.json')
                    )
                    .then(function (response) {
                        if (response.data) {
                            $scope.agencies = response.data;
                        }
                        if (!$scope.agencies || !$scope.agencies.length) {
                            toastr.error(translationFactory.translate('common.reservation|Nu s-au gasit agentii'));
                        }
                    });
            }

            $scope.checkStep2();
        }

        $scope.refreshServices = function(search) {
            $scope.services = [];
            $scope.data.date = '';
            $scope.data.time = '';
            $scope.freeslots = [];
            $scope.times = [];

            if($scope.data.county && $scope.data.county.id && $scope.data.agency && $scope.data.agency.id) {
                $http
                    .get(
                        !fakeApi ? apiUrlFactory('/services', true) + '/' + encodeURIComponent($scope.data.agency.id) + (search ? '/' + encodeURIComponent(search) : '')
                        : apiUrlFactory('data/services.json')
                    )
                    .then(function (response) {
                        if (response.data) {
                            $scope.services = response.data;
                        }
                        if (!$scope.services || !$scope.services.length) {
                            toastr.error(translationFactory.translate('common.reservation|Nu s-au gasit servicii'));
                        }
                    });
            }

            $scope.checkStep2();
        }

        $scope.refreshSlots = function() {
            if($scope.data.county && $scope.data.county.id && $scope.data.agency && $scope.data.agency.id && $scope.data.service && $scope.data.service.id) {
                $http
                    .get(
                        !fakeApi ? apiUrlFactory('/freeslots', true) + '/' + encodeURIComponent($scope.data.service.id) + '/' + moment().get('year') + '/' + (moment().get('month') + 1)
                        : apiUrlFactory('data/freeslots.json')
                    )
                    .then(function (response) {
                        if (response.data) {
                            $scope.freeslots = response.data;
                        }
                        if (!$scope.freeslots || !$scope.freeslots.length) {
                            toastr.error(translationFactory.translate('common.reservation|Nu s-au gasit sloturi libere'));
                        } else {
                            $scope.minDate = $scope.freeslots[0].start;
                        }

                        $scope.checkStep2();

                        $scope.refreshTimes();
                    });
            }
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

        $scope.bookReservation = function() {
            $http
                .post(
                    !fakeApi ? apiUrlFactory('/appointment', true) + '/' + encodeURIComponent($scope.data.service.id)
                        : apiUrlFactory('data/appointment.json'),
                    {
                        start: $scope.data.time,
                        name: $scope.data.name,
                        phone: $scope.data.mobile
                    }
                )
                .then(function (response) {
                    if (response.data && response.data.id) {
                        toastr.success(translationFactory.translate('common.reservation|Rezervare programata. Veti primi un SMS de confirmare.'));
                        $state.go('common.final');
                    } else {
                        toastr.error(translationFactory.translate('common.reservation|Rezervarea a eşuat!'));
                    }
                });
        };

        $scope.$watch('data.date', function(newValue, oldValue) {
            if (newValue !== oldValue) {
                $scope.refreshTimes();
            }
        });

        $scope.$watch('data.name', function(newValue, oldValue) {
            if (newValue !== oldValue) {
                $scope.checkReservation();
            }
        });
        $scope.$watch('data.mobile', function(newValue, oldValue) {
            if (newValue !== oldValue) {
                $scope.checkReservation();
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
            .state('common.adminlist', {
                url: '^/admin',
                templateUrl: CONFIG.apiUrlFactory('views/common/admin/admin-reservation-list.html')
            })
            .state('common.adminsingle', {
                url: '^/admin-reservation',
                templateUrl: CONFIG.apiUrlFactory('views/common/admin/admin-reservation-single.html')
            })
            .state('common.final', {
                url: '^/final',
                templateUrl: CONFIG.apiUrlFactory('views/common/reservation_client_info.html')
            })
        ;
    }])
    .controller('CommonReservationController', CommonReservationController);
