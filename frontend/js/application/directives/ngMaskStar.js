/**
 * ngMaskStar - Directive for number display format by hiding a number of characters
 */
var ngMaskStar = ['CONFIG', '$compile', 'numericFormatFactory',
    function (CONFIG, $compile, numericFormatFactory) {
        var padMyString = function (valueFromModel, count) {
            if (typeof valueFromModel != 'undefined') {
                if (valueFromModel.length <= count) {
                    return Array(valueFromModel.length + 1).join('*');
                } else {
                    return Array(Number(count) + 1).join('*') + valueFromModel.substring(count);
                }
            }
        };
        var mergeInputModification = function(valueFromInput, valueFromModel) {
            if (valueFromInput.length < 9) {
                return valueFromModel
            }
            var mergedValue = '',
                index = 0;
            while (index < valueFromInput.length) {
                mergedValue += valueFromInput[index] == '*' ? valueFromModel[index] : valueFromInput[index];
                index++;
            }
            return mergedValue;
        };
        return {
            restrict: 'AE',
            require: '?ngModel',
            link: function (scope, elem, attrs, ngModelController) {
                if (!angular.isEmpty(ngModelController) && ngModelController) {
                    // what you return here will be passed to the text field (when value is set via model)
                    ngModelController.$formatters.push(function (valueFromModel) {
                        return padMyString(valueFromModel, attrs.ngMaskStarCount ? attrs.ngMaskStarCount : 0);
                    });

                    // put the inverse logic, to transform formatted data into model data
                    // what you return here, will be stored in the $scope (when value is set via html)
                    ngModelController.$parsers.push(function (valueFromInput) {
                        return mergeInputModification(valueFromInput, ngModelController.$modelValue);
                    });

                    // format value on blur
                    var bindFunction = function () {
                        ngModelController.$viewValue =  padMyString(ngModelController.$modelValue, attrs.ngMaskStarCount ? attrs.ngMaskStarCount : 0);
                        elem.val(ngModelController.$viewValue);
                    };

                    elem.bind('blur', bindFunction);

                    scope.$on("$destroy", function () {
                        elem.unbind('blur', bindFunction);
                    });
                } else {
                    // html directly
                    elem.html(padMyString(elem.html(), attrs.ngMaskStarCount ? attrs.ngMaskStarCount : 0));
                }
            }
        };
    }
];

angular
    .module('custom')
    .directive('ngMaskStar', ngMaskStar);