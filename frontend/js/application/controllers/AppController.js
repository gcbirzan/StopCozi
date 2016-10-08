var AppController = ['$controller', '$scope', '$rootScope', '$state', 'CONFIG', '$http', 'apiUrlFactory', function($controller, $scope, $rootScope, $state, CONFIG, $http, apiUrlFactory) {
    $controller('ParentController', {$scope: $scope});

    // this fixes the date-picker jumping
    // transfer the scroll from the window to the modal
    // and the other way around when modal is not present
    $rootScope.$on('$viewContentLoaded', function() {
        if ($('.modal').length) {
            $('body').addClass('modal-open');
        } else {
            $('body').removeClass('modal-open');
        }
    });

    // trigger tooltips
    $(function(){
        $('[data-toggle="tooltip"]').tooltip();
    });

}];


angular
    .module('custom')
    .controller('AppController', AppController);
