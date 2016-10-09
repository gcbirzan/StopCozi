/**
 * ngIboxTools - Directive for iBox tools elements in right corner of ibox
 */
var ngIboxTools = ['CONFIG', '$compile', 'translationFactory', '$timeout', function (CONFIG, $compile, translationFactory, $timeout) {
    return {
        restrict: 'AE',
        scope: {
            config: '='
        },
        templateUrl: 'views/common/ibox_tools.html',
        link: function (scope, element, attrs) {
            scope.$watch('config', function (newValue) {
                if (!newValue) {
                    return;
                }

                if (!angular.isEmpty(newValue['enableCollapse'])) {
                    scope.enableCollapse = newValue['enableCollapse'];
                }

                if (!angular.isEmpty(newValue['enableClose'])) {
                    scope.enableClose = newValue['enableClose'];
                }

                if (!angular.isEmpty(newValue['collapsed'])) {
                    if (newValue['collapsed']) {
                        var icon = element.find('i:first');
                        icon.removeClass('fa-chevron-up').addClass('fa-chevron-down');
                    }
                }
            });

            // Function for collapse ibox
            scope.showhide = function ($event) {
                var ibox = element.closest('div.ibox');
                var icon = element.find('i:first');
                var content = ibox.find('div.ibox-content');
                content.slideToggle(200);
                // Toggle icon from up to down
                icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                //ibox.toggleClass('').toggleClass('border-bottom');
                $timeout(function () {
                    ibox.resize();
                    ibox.find('[id^=map-]').resize();
                }, 50);

                if ($event) {
                    if ($event.stopPropagation) {
                        $event.stopPropagation();
                    }
                    if ($event.preventDefault) {
                        $event.preventDefault();
                    }
                    $event.cancelBubble = true;
                    $event.returnValue = false;
                }
            };

            // Function for close ibox
            scope.closebox = function () {
                var ibox = element.closest('div.ibox');
                ibox.remove();
            };

            // Toggle showhide on title click
            var iboxTitle = element.closest('div.ibox').find('.ibox-title');
            if (iboxTitle && iboxTitle.length) {
                iboxTitle.on('click', function(e){
                    var iboxToolsCollapseIcon = $(this).closest('div.ibox').find('.toggleCollapse');
                    if (iboxToolsCollapseIcon && iboxToolsCollapseIcon.length) {
                        scope.showhide();
                    }
                });
            }
        }
    };
}];

angular
    .module('custom')
    .directive('ngIboxTools', ngIboxTools);