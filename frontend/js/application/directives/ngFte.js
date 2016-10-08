var ngFte = ('ngFte', ['$compile', '$timeout', 'translationFactory', 'CONFIG', function ($compile, $timeout, translationFactory, CONFIG) {
    return {
        require: 'ngModel',
        scope: {
            model: '=ngModel'
        },
        link: function (scope, element, attrs, ngModel) {
            var parentForm = element.inheritedData('$formController'),
                calculatorID = (element[0].id ? element[0].id : 'fte_' + Math.random()) + '_wizard',

                container = null,
                calculator = null
                label = null
            ;

            scope.calculatedValue = 0;

            var modelChanged = false;
            var calculationChanged = false;

            scope.$watch('model', function(newValue) {
                if (modelChanged) {
                    modelChanged = false;
                } else {
                    calculationChanged = true;
                    scope.calculatedValue = newValue * (CONFIG.hoursPerWeek ? parseFloat(CONFIG.hoursPerWeek) : 36);
                }
            });
            scope.$watch('calculatedValue', function(newValue) {
                if (calculationChanged) {
                    calculationChanged = false;
                } else {
                    modelChanged = true;
                    scope.model = newValue / (CONFIG.hoursPerWeek ? parseFloat(CONFIG.hoursPerWeek) : 36);
                }
            });

            function showFteCalculator() {
                if (calculator) {
                    return;
                }

                // create container div
                container = angular.element('<div id="' + calculatorID + '"></div>');
                container.css({
                    position: 'absolute',
                    background: 'white',
                    zIndex: '4',
                    top: element[0].offsetHeight + 'px',
                    left: 0,
                    display: 'block'
                });

                // create calculator element
                scope.calculatedValue = ngModel.$modelValue * (CONFIG.hoursPerWeek ? parseFloat(CONFIG.hoursPerWeek) : 36);
                calculator = $compile('<input type="text" ng-model="calculatedValue" ng-numeric="" />')(scope);
                scope.$digest();

                // create label element
                label = angular.element('<label for="">' + translationFactory.translate('ngFte|hours per week') + '</label>');

                element.parent().append(container);
                container.append(calculator);
                container.append(label);
                calculator.bind('blur', blurFteCalculator);
            }

            function clearFteCalculator() {
                if (calculator) {
                    calculator.remove();
                    calculator = null;
                }
                if (label) {
                    label.remove();
                    label = null;
                }
                if (container) {
                    container.remove();
                    container = null;
                }
            }

            function blurFteCalculator() {
                $timeout(function() {
                    if (document.activeElement &&
                        (
                            calculator && calculator[0] && document.activeElement == calculator[0]
                            || element && element[0] && document.activeElement == element[0]
                        )
                    ) {
                        return;
                    }
                    clearFteCalculator();
                });
            }

            element.bind('focus', showFteCalculator);
            element.bind('blur', blurFteCalculator);
            scope.$on('$destroy', clearFteCalculator);
        }
    };
}]);

angular
    .module('custom')
    .directive('ngFte', ngFte);