// TODO: have the backend implement the login check
//_CONFIG.checkLoggedInInit()
//.then(function() {
    angular.element(document).ready(function() {
        // Load tooltips even on elements asynchronously loaded
        $(document).tooltip({selector: '[data-toggle=tooltip]'});
        angular.bootstrap(document, ['custom']);
    })
//});