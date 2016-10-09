var CommonReservationValidationController = ['$controller', '$scope', '$rootScope', '$state', 'CONFIG', '$http', 'apiUrlFactory', 'aclFactory', 'translationFactory', '$stateParams', 'toastr',
    function ($controller, $scope, $rootScope, $state, CONFIG, $http, apiUrlFactory, aclFactory, translationFactory, $stateParams, toastr) {
        $controller('ParentController', {$scope: $scope});

        // logic goes here
    }
];


angular
    .module('custom')
    .controller('CommonReservationValidationController', CommonReservationValidationController);
