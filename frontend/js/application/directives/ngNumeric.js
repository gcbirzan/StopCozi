/**
 * ngNumeric - Directive for number format
 */
var ngNumeric = ['CONFIG', '$compile', '$rootScope', 'numericFormatFactory',
    function (CONFIG, $compile, $rootScope, numericFormatFactory) {
        return {
            restrict: 'AE',
            require: '?ngModel',
            link: function (scope, elem, attrs, ngModelController) {
                if (!angular.isEmpty(ngModelController) && ngModelController) {
                    // what you return here will be passed to the text field (when value is set via model)
                    ngModelController.$formatters.push(function (valueFromModel) {
                        return numericFormatFactory.convert(valueFromModel, attrs.ngNumericPrecision, attrs.ngNumericDecimalSeparator, attrs.ngNumericThousandSeparator, attrs.ngNumericMin, attrs.ngNumericMax);
                    });

                    // put the inverse logic, to transform formatted data into model data
                    // what you return here, will be stored in the $scope (when value is set via html)
                    ngModelController.$parsers.push(function (valueFromInput) {
                        return numericFormatFactory.revert(valueFromInput, attrs.ngNumericPrecision, attrs.ngNumericDecimalSeparator, attrs.ngNumericThousandSeparator, attrs.ngNumericMin, attrs.ngNumericMax);
                    });

                    // format value on blur
                    var bindFunction = function () {
                        ngModelController.$viewValue = numericFormatFactory.convert(ngModelController.$modelValue, attrs.ngNumericPrecision, attrs.ngNumericDecimalSeparator, attrs.ngNumericThousandSeparator, attrs.ngNumericMin, attrs.ngNumericMax);
                        elem.val(ngModelController.$viewValue);
                    };

                    elem.bind('blur', bindFunction);

                    scope.$on("$destroy", function () {
                        elem.unbind('blur', bindFunction);
                    });
                } else {
                    elem.html(numericFormatFactory.convert(elem.html(), attrs.ngNumericPrecision, attrs.ngNumericDecimalSeparator, attrs.ngNumericThousandSeparator, attrs.ngNumericMin, attrs.ngNumericMax));
                }
            }
        };
    }
];

angular
    .module('custom')
    .directive('ngNumeric', ngNumeric);