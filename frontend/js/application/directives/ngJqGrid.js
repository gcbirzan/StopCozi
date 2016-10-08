/**
 * ngJqGrid - Directive for jqGrid
 */
var ngJqGrid = ['CONFIG', '$compile', 'translationFactory', '$rootScope', '$timeout', '$http', 'numericFormatFactory',
    function (CONFIG, $compile, translationFactory, $rootScope, $timeout, $http, numericFormatFactory) {
        return {
            restrict: 'AE',
            scope: {
                config: '='
            },
            link: function (scopeDir, elementDir, attrs) {
                translationFactory.setupJqGridTranslations();

                scopeDir.$watch('config', function (newValueDir) {
                    if (!newValueDir) {
                        return;
                    }

                    var buildJqGrid = function(newValue, element, scope, newValueParent, rowId, rowData) {
                        var table;

                        var randomizer = function() {
                            return Math.floor((Math.random() * 1000) + 1);
                        };

                        element.children().empty();

                        table = angular.element('<table></table>');
                        if (!newValue.id || !angular.isString(newValue.id)) {
                            do {
                                newValue.id = 'jqGrid_' + randomizer();
                            } while (angular.element('#' + newValue.id).length);
                        }
                        if (!angular.element('#' + newValue.id).length) {
                            table.attr('id', newValue.id);
                            element.append($compile(table)(scope));
                        }

                        if (newValue.pager) {
                            if (!angular.isString(newValue.pager)) {
                                do {
                                    newValue.pager = newValue.id + '_pager_' + randomizer();
                                } while (angular.element('#' + newValue.pager).length);
                            }
                            if (newValue.pager.indexOf('#') != 0) {
                                newValue.pager = '#' + newValue.pager;
                            }
                            if (!angular.element(newValue.pager).length) {
                                pager = angular.element('<pager></pager>');
                                pager.attr('id', newValue.pager.substr(1));
                                element.append(pager);
                            }
                        }

                        if (!newValue.jsonReader) {
                            newValue.jsonReader = {
                                root: 'data.rows',
                                page: 'data.page',
                                total: 'data.total',
                                records: 'data.records'
                            };
                        }

                        if (!newValue.regional) {
                            var defaultLocale = 'en';
                            if (angular.isString(CONFIG.defaultLocale) && CONFIG.defaultLocale.length) {
                                defaultLocale = CONFIG.defaultLocale;
                            }
                            newValue.regional = defaultLocale;
                        }
                        if (!newValue.mtype) {
                            newValue.mtype = 'GET';
                        }
                        if (!newValue.datatype) {
                            newValue.datatype = 'json';
                        }
                        if (!newValue.styleUI) {
                            newValue.styleUI = CONFIG.jqGridStyleUI ? CONFIG.jqGridStyleUI : 'Bootstrap';
                        }
                        if (typeof(newValue.viewrecords) == 'undefined') {
                            newValue.viewrecords = true;
                        }
                        if (typeof(newValue.autowidth) == 'undefined') {
                            newValue.autowidth = true;
                        }
                        if (typeof(newValue.height) == 'undefined') {
                            newValue.height = 'auto';
                        }
                        if (typeof(newValue.forceFit) == 'undefined') {
                            newValue.forceFit = true;
                        }
                        if (typeof(newValue.loadui) == 'undefined') {
                            newValue.loadui = 'block';
                        }
                        if (!angular.isNumber(newValue.rowNum)) {
                            newValue.rowNum = 20;
                            if (angular.isNumber(CONFIG.jqGridRowNum)) {
                                newValue.rowNum = CONFIG.jqGridRowNum;
                            }
                            if (newValueParent && angular.isNumber(CONFIG.jqSubGridRowNum)) {
                                newValue.rowNum = CONFIG.jqSubGridRowNum;
                            }
                        }
                        if (!newValue.rowList && CONFIG.jqGridRowList) {
                            newValue.rowList = CONFIG.jqGridRowList;
                        }
                        if (!angular.isNumber(newValue.rowNum)) {
                            newValue.rowNum = angular.isNumber(CONFIG.jqGridRowNum) ? CONFIG.jqGridRowNum : 20;
                        }
                        if (!angular.isString(newValue.emptyrecords)) {
                            newValue.emptyrecords = translationFactory.translate('grid|No records');
                        }

                        if (newValue.colModel) {
                            angular.forEach(newValue.colModel, function(col, key) {

                                // force non-bindable so that angular will not parse values
                                var oldFnc = col.cellattr;
                                col.cellattr = function() {
                                    return (typeof oldFnc == 'function' ? oldFnc.apply(null, arguments) : '') + ' ng-non-bindable';
                                };

                                // short/long date using moment js
                                if (col.formatter == 'shortdate' || col.formatter == 'longdate') {
                                    col.formatter = function(val, opts, rowData) {
                                        if (!val) {
                                            return '';
                                        }

                                        var m = moment.utc(val);
                                        return m.formatPHP(col.formatter == 'longdate' ? CONFIG.longDateFormat : CONFIG.shortDateFormat);
                                    };
                                }

                                // short/long time using moment js
                                if (col.formatter == 'shorttime' || col.formatter == 'longtime') {
                                    col.formatter = function(val, opts, rowData) {
                                        if (!val || angular.isEmpty(val)) {
                                            return '';
                                        }

                                        var m = moment.utc(new Date(val));
                                        if (!m.isValid()) {
                                            m = moment.utc('2015-01-01 ' + val);
                                        }
                                        return m.formatPHP(col.formatter == 'longtime' ? CONFIG.longTimeFormat: CONFIG.shortTimeFormat);
                                    };
                                }

                                // this seems not to work
                                /*
                                 if (col.formatter == 'shortdate' || col.formatter == 'longdate') {
                                 if (!col.formatoptions) {
                                 col.formatoptions = {};
                                 }
                                 if (!col.formatoptions.srcformat) {
                                 col.formatoptions.srcformat = CONFIG.longStableDateFormat;
                                 }
                                 if (!col.formatoptions.newformat) {
                                 col.formatoptions.newformat = col.formatter == 'longdate' ? CONFIG.longDateFormat : CONFIG.shortDateFormat;
                                 }
                                 col.formatter = 'date';
                                 newValue.colModel[key] = col;
                                 }
                                 */

                                // boolean -> yes/no
                                if (col.formatter == 'boolean') {
                                    col.formatter = function(val, opts, rowData) {
                                        return !angular.isEmpty(val) && val ? translationFactory.translate('grid|Yes') : translationFactory.translate('grid|No');
                                    };
                                }

                                // day of week
                                if (col.formatter == 'dayofweek') {
                                    col.formatter = function(val, opts, rowData) {
                                        try{
                                            var vals = [];

                                            if (angular.isNumber(val)) {
                                                vals = [val];
                                            } else if (angular.isString(val) && val.length) {
                                                vals = JSON.parse(val);
                                            } else if (angular.isArray(val)) {
                                                vals = [];
                                                angular.forEach(val, function(v){
                                                    vals.push(parseInt(v));
                                                });
                                            }

                                            if (vals) {
                                                var daysTranslation = [
                                                    translationFactory.translate('grid|Monday'),
                                                    translationFactory.translate('grid|Tuesday'),
                                                    translationFactory.translate('grid|Wednesday'),
                                                    translationFactory.translate('grid|Thursday'),
                                                    translationFactory.translate('grid|Friday'),
                                                    translationFactory.translate('grid|Saturday'),
                                                    translationFactory.translate('grid|Sunday')
                                                ];
                                                angular.forEach(vals, function(v, k){
                                                    if (daysTranslation[v-1]) {
                                                        vals[k] = daysTranslation[v-1];
                                                    } else {
                                                        vals[k] = translationFactory.translate('grid.unset.day|-');
                                                    }
                                                });
                                            }

                                            return vals.join(col.formatoptions && col.formatoptions.separator ? col.formatoptions.separator : '<br />');
                                        } catch (e) {
                                            return '';
                                        }
                                    };
                                }

                                // action buttons
                                if (col.formatter == 'actions') {
                                    if (typeof(col.width) == 'undefined') {
                                        var buttons = 0;
                                        if (col.formatoptions.editButtonSref || col.formatoptions.editButtonClick) {
                                            buttons++;
                                        }
                                        if (col.formatoptions.deleteButtonSref || col.formatoptions.deleteButtonClick) {
                                            buttons++;
                                        }
                                        if (angular.isArray(col.formatoptions.buttons)) {
                                            angular.forEach(col.formatoptions.buttons, function (button) {
                                                if (button.html || button.sref || button.click) {
                                                    html = button.html;
                                                    buttons++;
                                                }
                                            });
                                        }
                                        col.width = 25 + buttons * 25;
                                    }
                                    if (typeof(col.fixed) == 'undefined') {
                                        col.fixed = true;
                                    }
                                    col.formatter = function(id, cellp, rowData) {
                                        var result = [
                                            '<div style="margin-right: 5px;" class="clearfix ' + (col.align == 'right' ? 'pull-right' : '') + '">',
                                        ];

                                        var replacer = function(text) {
                                            if (typeof(text) == 'function') {
                                                return text(id, cellp, rowData);
                                            }

                                            text = String(text);

                                            angular.forEach(rowData, function(value, key) {
                                                text = text.replace('%' + key, value);
                                            });

                                            return text;
                                        };
                                        var callbacker = function(arg) {
                                            if (angular.isFunction(arg)) {
                                                var callbackName;
                                                counter = 1;
                                                do {
                                                    callbackName = '__gridCallback_' + newValue.id + '_' + counter;
                                                    counter++;
                                                } while (scope[callbackName]);
                                                scope[callbackName] = function() {
                                                    arg.apply(newValue, [newValue, id, rowData])
                                                };

                                                return callbackName + '()';
                                            } else {
                                                return replacer(arg);
                                            }
                                        };

                                        var buttons = 0;

                                        if (col.formatoptions.viewButtonSref || col.formatoptions.viewButtonClick) {
                                            result.push([
                                                '<div ',
                                                'onmouseout="jQuery(this).removeClass(\'active\');" ',
                                                'onmouseover="jQuery(this).addClass(\'active\');" ',
                                                'class="ui-pg-div ' + (!buttons ? 'ui-inline-edit' : 'ui-inline-del') + '" ',
                                                'style="float: left; cursor: pointer;" ',
                                                'title="' + (col.formatoptions.viewButtonTitle ? replacer(col.formatoptions.viewButtonTitle) : translationFactory.translate('grid|View selected row')) + '">',
                                                '<span class="glyphicon glyphicon-eye-open" ',
                                                (col.formatoptions.viewButtonSref ? 'ui-sref="' + replacer(col.formatoptions.viewButtonSref) + '"' : ''),
                                                (col.formatoptions.viewButtonClick ? 'ng-click="' + callbacker(col.formatoptions.viewButtonClick) + '"' : ''),
                                                '></span>',
                                                '</div>'
                                            ].join(''));

                                            buttons++;
                                        }

                                        if (col.formatoptions.editButtonSref || col.formatoptions.editButtonClick) {
                                            result.push([
                                                '<div ',
                                                'onmouseout="jQuery(this).removeClass(\'active\');" ',
                                                'onmouseover="jQuery(this).addClass(\'active\');" ',
                                                'class="ui-pg-div ' + (!buttons ? 'ui-inline-edit' : 'ui-inline-del') + '" ',
                                                'style="float: left; cursor: pointer;" ',
                                                'title="' + (col.formatoptions.editButtonTitle ? replacer(col.formatoptions.editButtonTitle) : translationFactory.translate('grid|Edit selected row')) + '">',
                                                '<span class="glyphicon glyphicon-edit" ',
                                                (col.formatoptions.editButtonSref ? 'ui-sref="' + replacer(col.formatoptions.editButtonSref) + '"' : ''),
                                                (col.formatoptions.editButtonClick ? 'ng-click="' + callbacker(col.formatoptions.editButtonClick) + '"' : ''),
                                                '></span>',
                                                '</div>'
                                            ].join(''));

                                            buttons++;
                                        }

                                        if (col.formatoptions.deleteButtonSref || col.formatoptions.deleteButtonClick) {
                                            result.push([
                                                '<div ',
                                                'onmouseout="jQuery(this).removeClass(\'active\');" ',
                                                'onmouseover="jQuery(this).addClass(\'active\');" ',
                                                'class="ui-pg-div ' + (!buttons ? 'ui-inline-edit' : 'ui-inline-del') + '" ',
                                                'style="float: left; cursor: pointer;" ',
                                                'title="' + (col.formatoptions.deleteButtonTitle ? replacer(col.formatoptions.deleteButtonTitle) : translationFactory.translate('grid|Delete selected row')) + '">',
                                                '<span class="glyphicon glyphicon-trash"',
                                                (col.formatoptions.deleteButtonSref ? 'ui-sref="' + replacer(col.formatoptions.deleteButtonSref) + '"' : ''),
                                                (col.formatoptions.deleteButtonClick ? 'ng-click="' + callbacker(col.formatoptions.deleteButtonClick) + '"' : ''),
                                                '></span>',
                                                '</div>'
                                            ].join(''));

                                            buttons++;
                                        }

                                        if (angular.isArray(col.formatoptions.buttons)) {
                                            angular.forEach(col.formatoptions.buttons, function(button) {
                                                var html = '',
                                                    stop = false;

                                                if (!html && button.html) {
                                                    html = replacer(button.html);
                                                }

                                                // If formatter is a function and returns:
                                                // true: we render the normal button
                                                // false/null/undefined: we don't render
                                                // string: we render that string
                                                if (button.formatter) {
                                                    var ret = replacer(button.formatter);
                                                    if (!angular.isEmpty(ret) && ret) {
                                                        if (typeof ret == 'string') {
                                                            html = ret;
                                                            stop = true;
                                                        }
                                                    } else {
                                                        stop = true;
                                                    }
                                                }

                                                if (!html && (button.sref || button.click) && !stop) {
                                                    html = [
                                                        '<div ',
                                                        'onmouseout="jQuery(this).removeClass(\'active\');" ',
                                                        'onmouseover="jQuery(this).addClass(\'active\');" ',
                                                        'class="ui-pg-div ' + (!buttons ? 'ui-inline-edit' : 'ui-inline-del') + '" ',
                                                        'style="float: left; cursor: pointer;" ',
                                                        'title="' + (button.title ? replacer(button.title) : '') + '">',
                                                        '<span class="glyphicon glyphicon-' + (button.icon ? replacer(button.icon) : 'question-sign') + '"',
                                                        (button.sref ? 'ui-sref="' + replacer(button.sref) + '"' : ''),
                                                        (button.click ? 'ng-click="' + callbacker(button.click) + '"' : ''),
                                                        '>' + (button.label ? button.label : '') + '</span>',
                                                        '</div>'
                                                    ].join('');
                                                }

                                                if (html) {
                                                    result.push(html);
                                                    buttons++;
                                                }
                                            });
                                        }

                                        result.push(
                                            '</div>'
                                        );

                                        return result.join('');
                                    }
                                    newValue.colModel[key] = col;
                                }

                                // translate
                                if (col.formatter == 'translate') {
                                    col.formatter = function(val, opts, rowData) {
                                        return translationFactory.translate(val);
                                    }
                                }

                                // array
                                if (col.formatter == 'array') {
                                    col.formatter = function(val, opts, rowData) {
                                        if (angular.isArray(val)) {
                                            var vals = [];
                                            angular.forEach(val, function(item) {
                                                if (item) {
                                                    switch (col.formatoptions) {
                                                        // TODO: implement any scalar formatter
                                                        case 'numeric':
                                                            item = numericFormatFactory.convert(item);
                                                            break
                                                        case 'shortdate':
                                                        case 'longdate':
                                                            item = moment.utc(item).formatPHP(col.formatoptions == 'longdate' ? CONFIG.longDateFormat : CONFIG.shortDateFormat);
                                                            break
                                                        case 'translate':
                                                            item = translationFactory.translate(item);
                                                            break
                                                    }
                                                }
                                                vals.push(item);
                                            });
                                            return vals.join('<br />');
                                        }
                                        return val;
                                    }
                                }
                            });
                        }

                        if (!newValue.loadComplete) {
                            newValue.loadComplete = function(response) {
                                newValue.rawData = response.rows ? response.rows : response.data.rows;
                                $compile(angular.element('#' + newValue.id))(scope);
                            }
                        }

                        if (!newValue.selectedItems) {
                            newValue.selectedItems = [];
                        }

                        newValue.onSelectRowOld = newValue.onSelectRow;

                        newValue.onSelectRow = function(rowid, status, e) {
                            var selected = status || !newValue.multiselect;
                            if (!selected) {
                                if (!newValue.multiselect) {
                                    newValue.selectedItems = [];
                                } else {
                                    var idx = newValue.selectedItems.indexOf(rowid);
                                    if (idx != -1) {
                                        newValue.selectedItems = newValue.selectedItems.splice(idx, 1);
                                    }
                                }
                            } else {
                                if (!newValue.multiselect) {
                                    newValue.selectedItems = [rowid];
                                } else {
                                    newValue.selectedItems.push(rowid);
                                }
                            }

                            if (typeof(newValue.onSelectRowOld) == 'function') {
                                newValue.onSelectRowOld.apply(newValue.getGrid(), arguments);
                            }
                        }

                        if (!newValue.searchData) {
                            newValue.searchData = {};
                        }
                        if (newValue.searchData) {
                            var found = false;
                            angular.forEach(newValue.searchData, function(value, key) {
                                if (String(value).length) {
                                    found = true;
                                }
                            });
                            if (found) {
                                if (!newValue.postData) {
                                    newValue.postData = {};
                                }
                                angular.extend(newValue.postData, {searchData: newValue.searchData})
                            }
                        }
                        if (!newValue.performSearch) {
                            newValue.performSearch = function(searchData) {
                                if (searchData) {
                                    newValue.searchData = angular.extend({}, searchData);
                                }
                            }
                        }

                        if (!newValue.reloadGrid) {
                            newValue.reloadGrid = function() {
                                if ($(table).is(':visible')) {
                                    if (newValue.datatype != 'local') {
                                        $(table).trigger('reloadGrid');
                                    } else if (newValue.url) {
                                        if (newValue.childrenGrids && angular.isObject(newValue.childrenGrids)) {
                                            angular.forEach(newValue.childrenGrids, function (subGrid, rowId) {
                                                if (subGrid.id && $('#' + subGrid.id).length) {
                                                    $.jgrid.gridDestroy('#' + subGrid.id);
                                                }
                                            });

                                            delete newValue.childrenGrids;
                                        }
                                        $(table).jqGrid('clearGridData');
                                        $http.get(newValue.url)
                                            .then(function (response) {
                                                if ((typeof(response.success) == 'undefined' || response.success) && response.data) {
                                                    if (response.data.rows) {
                                                        newValue.data = response.data.rows;
                                                    } else {
                                                        newValue.data = response.data;
                                                    }

                                                    newValue.rawData = newValue.data;

                                                    $(table).jqGrid('setGridParam', {data: newValue.data});

                                                    $(table).trigger('reloadGrid');
                                                }
                                            });
                                    } else {
                                        $(table).trigger('reloadGrid');
                                    }
                                } else {
                                    newValue.queueReload = true;
                                }
                            }
                        }

                        if (!newValue.resizeGrid) {
                            newValue.resizeGrid = function() {
                                var grid = $('#' + newValue.id + ':visible');

                                if (!grid || !grid.length || !grid.closest('.ui-jqgrid') || !grid.closest('.ui-jqgrid').length) {
                                    return;
                                }

                                // try the old way first
                                var el = grid.closest('.ui-jqgrid').parent().parent();
                                var tag = el.prop("tagName").toLowerCase();

                                if (tag.indexOf('ng') == -1) {
                                    grid.jqGrid('setGridWidth', el.width(), true);
                                } else {
                                    el = elementDir;
                                    // find the closest parent which is not an angular element
                                    while (el.parent() && el.parent.length) {

                                        tag = el.parent().prop("tagName").toLowerCase();
                                        if (tag.indexOf('ng') == -1) {
                                            // found the first normal element
                                            grid.jqGrid('setGridWidth', el.parent().width() - 3, true);
                                            break;
                                        }

                                        el = el.parent();
                                    }
                                }

                                if (newValue.queueReload) {
                                    newValue.queueReload = false;
                                    newValue.reloadGrid();
                                }
                            }
                        }

                        if (!newValue.getGrid) {
                            newValue.getGrid = function() {
                                return $(table);
                            }
                        }

                        if (!newValue.focused) {
                            newValue.focused = function() {
                                var childrenGrids = newValue.getChildrenGrids();
                                if (childrenGrids && angular.isObject(childrenGrids)) {
                                    var found = false;
                                    angular.forEach(childrenGrids, function(childGrid) {
                                        if (!found && childGrid.focused()) {
                                            found = true;
                                        }
                                    });
                                    if (found) {
                                        return false;
                                    }
                                }

                                return document.activeElement
                                    && $(document.activeElement).length
                                    && ($(document.activeElement).hasClass('jqgrow') || $(document.activeElement).parent().hasClass('jqgrow'))
                                    && $(document.activeElement).parents('#' + newValue.id).length;
                            }
                        }

                        if (!newValue.ondblClickRow) {
                            newValue.ondblClickRow = function(rowid, iRow, iCol, e) {
                                if (newValue.defaultRecord && typeof(newValue.defaultRecord) == 'function') {
                                    newValue.defaultRecord();
                                } else if (newValue.viewRecord && typeof(newValue.viewRecord) == 'function') {
                                    newValue.viewRecord();
                                } else if (newValue.editRecord && typeof(newValue.editRecord) == 'function') {
                                    newValue.editRecord();
                                }
                            }
                        }

                        if (!newValue.gridComplete) {
                            newValue.gridComplete = function() {
                                if (!newValue.preventAutoFocus) {
                                    $('#' + newValue.id + ' .jqgrow:first').focus();
                                }
                            }
                        }


                        var keyCallBack = function(e) {
                            if (newValue && typeof(newValue) != 'undefined' && newValue.focused && typeof(newValue.focused) == 'function' && newValue.focused()) {
                                if (['Delete', 'Del'].indexOf(e.key) != -1 && newValue.deleteRecord && typeof(newValue.deleteRecord) == 'function') {
                                    newValue.deleteRecord();
                                }
                                if (e.key == 'Enter') {
                                    if (newValue.ondblClickRow) {
                                        newValue.ondblClickRow();
                                    }
                                }
                                if (['ArrowUp', 'Up', 'ArrowDown', 'Down'].indexOf(e.key) != -1) {
                                    e.preventDefault();

                                    var ids = $(table).jqGrid('getDataIDs');
                                    if (ids && ids.length) {
                                        var nextItem = parseInt(ids[0]);

                                        if (newValue.selectedItems && newValue.selectedItems.length) {
                                            nextItem = null;

                                            if (['ArrowUp', 'Up'].indexOf(e.key) != -1) {
                                                ids.reverse();
                                            }

                                            var lastSelectedItem = newValue.selectedItems[newValue.selectedItems.length - 1];

                                            if (lastSelectedItem) {
                                                var found = false;
                                                angular.forEach(ids, function (id) {
                                                    if (parseInt(id) == parseInt(lastSelectedItem)) {
                                                        found = true;
                                                    } else if (found) {
                                                        nextItem = parseInt(id);
                                                        found = false;
                                                    }
                                                });
                                            }
                                        }

                                        if (nextItem) {
                                            $(table).jqGrid('setSelection', nextItem);
                                        }
                                    }
                                }
                                if (e.key == 'PageUp' || e.key == 'PageDown') {
                                    e.preventDefault();
                                    var currentPage = $(table).jqGrid('getGridParam', 'page');
                                    var lastPage = $(table).jqGrid('getGridParam', 'lastpage');
                                    if (e.key == 'PageUp' && currentPage > 1) {
                                        $(table).jqGrid('setGridParam', {page: currentPage - 1});
                                        $(table).trigger('reloadGrid');
                                    }
                                    if (e.key == 'PageDown' && currentPage < lastPage) {
                                        $(table).jqGrid('setGridParam', {page: currentPage + 1});
                                        $(table).trigger('reloadGrid');
                                    }
                                }
                            }
                        };
                        angular.element(window).on('keydown', keyCallBack);
                        scope.$on('$destroy', function() {
                            angular.element(window).off('keydown', keyCallBack);
                            $(window).off('resize', newValue.resizeGrid);
                        });

                        $(window).on('resize', newValue.resizeGrid);

                        if (!$rootScope.globalReloaders) {
                            $rootScope.globalReloaders = {};
                        }
                        $rootScope.globalReloaders[newValue.id] = 0;
                        var cancelReloadWatcher = $rootScope.$watch('globalReloaders.' + newValue.id, function(newValue1, oldValue1) {
                            if (newValue1 === oldValue1) {
                                return;
                            }
                            if (newValue && newValue.reloadGrid) {
                                newValue.reloadGrid();
                            }
                        }, true);
                        scope.$on('$destroy', function() {
                            cancelReloadWatcher();
                        });


                        if (newValue.subGridConfig) {
                            newValue.subGrid = true;
                            if (!newValue.subGridConfig.height) {
                                newValue.subGridConfig.height = '100%';
                            }
                            newValue.subGridRowExpanded = function (subgridDivId, rowId) {
                                if (newValue.childrenGrids && newValue.childrenGrids[rowId] && newValue.childrenGrids[rowId].id) {
                                    if ($('#' + newValue.childrenGrids[rowId].id).length) {
                                        $.jgrid.gridDestroy('#' + newValue.childrenGrids[rowId].id);
                                    }
                                    delete newValue.childrenGrids[rowId];
                                }
                                var rowData = {};
                                if (newValue.rawData && angular.isArray(newValue.rawData)) {
                                    angular.forEach(newValue.rawData, function(item) {
                                        if (item.id && item.id == rowId) {
                                            rowData = item;
                                        }
                                    });
                                }
                                buildJqGrid(angular.copy(newValue.subGridConfig), angular.element('#' + subgridDivId), scope, newValue, rowId, rowData);
                            }
                        }

                        newValue.getParentGrid = function() {
                            return newValueParent;
                        };
                        newValue.getChildrenGrids = function() {
                            return newValue.childrenGrids;
                        };

                        if (newValueParent) {
                            if (!newValueParent.childrenGrids) {
                                newValueParent.childrenGrids = {};
                            }
                            newValueParent.childrenGrids[rowId] = newValue;
                        }

                        newValue.initGrid = function() {
                            // this is here to compensate for ng-hide/ng-show on template parents
                            $timeout(function() {
                                $(table).jqGrid(newValue);
                            });
                        };

                        if (newValue.scheduler) {
                            // preparing scheduler specific backgrounds
                            // TODO: make this more abstract
                            var css = [
                                '.table#' + newValue.id + ' > thead > tr > td.active,',
                                '.table#' + newValue.id + ' > tbody > tr > td.active,',
                                '.table#' + newValue.id + ' > tfoot > tr > td.active,',
                                '.table#' + newValue.id + ' > thead > tr > th.active,',
                                '.table#' + newValue.id + ' > tbody > tr > th.active,',
                                '.table#' + newValue.id + ' > tfoot > tr > th.active,',
                                '.table#' + newValue.id + ' > thead > tr.active > td,',
                                '.table#' + newValue.id + ' > tbody > tr.active > td,',
                                '.table#' + newValue.id + ' > tfoot > tr.active > td,',
                                '.table#' + newValue.id + ' > thead > tr.active > th,',
                                '.table#' + newValue.id + ' > tbody > tr.active > th,',
                                '.table#' + newValue.id + ' > tfoot > tr.active > th {',
                                    'background-color: #f5f5f5 !important;',
                                    'color: #676a6c !important;',
                                '}'
                            ].join('');
                            angular.forEach(CONFIG.scheduler, function (rules, type) {
                                var config = angular.extend({}, rules);

                                if (config.grid) {
                                    angular.extend(config, config.grid);
                                }
                                delete config.grid;

                                if (config.color && !config.backgroundColor) {
                                    config.backgroundColor = config.color;
                                }
                                if (config.backgroundColor && !config.borderColor) {
                                    config.borderColor = config.backgroundColor;
                                }
                                var css2 = '';
                                if (config.backgroundColor) {
                                    css2 += 'background-color: ' + config.backgroundColor + ';';
                                }
                                if (config.borderColor && config.borderColor != config.backgroundColor) {
                                    css2 += 'border: 1px solid ' + config.borderColor + ';';
                                }
                                if (config.textColor) {
                                    css2 += 'color: ' + config.textColor + ';';
                                }
                                css += [
                                    '.table#' + newValue.id + ' > thead > tr > td.jqGrid_scheduler_' + type + ',',
                                    '.table#' + newValue.id + ' > tbody > tr > td.jqGrid_scheduler_' + type + ',',
                                    '.table#' + newValue.id + ' > tfoot > tr > td.jqGrid_scheduler_' + type + ',',
                                    '.table#' + newValue.id + ' > thead > tr > th.jqGrid_scheduler_' + type + ',',
                                    '.table#' + newValue.id + ' > tbody > tr > th.jqGrid_scheduler_' + type + ',',
                                    '.table#' + newValue.id + ' > tfoot > tr > th.jqGrid_scheduler_' + type + ' {',
                                        css2,
                                    '}'
                                ].join('');
                            });
                            $('<style>')
                                .attr('id', 'jqGrid_style_' + newValue.id)
                                .prop('type', 'text/css')
                                .html(css)
                                .appendTo('head');
                            scope.$on('$destroy', function () {
                                $('#' + 'jqGrid_style_' + newValue.id).remove();
                            });
                        }

                        if (typeof(newValue.url) == 'function') {
                            newValue.url = newValue.url.apply(newValue, [rowId, rowData]);
                        }

                        if (newValue.datatype == 'local' && !newValue.data && newValue.url) {
                            $http.get(newValue.url)
                                .then(function (response) {
                                    if ((typeof(response.success) == 'undefined' || response.success) && response.data) {
                                        if (response.data.rows) {
                                            newValue.data = response.data.rows;
                                        } else {
                                            newValue.data = response.data;
                                        }

                                        newValue.rawData = newValue.data;

                                        newValue.initGrid();
                                    }
                                });
                        } else {
                            if(newValue.datatype == 'local' && !newValue.data && newValueParent && newValueParent.rawData && newValue.subItemKey) {
                                var data = newValueParent.rawData;
                                if (data && angular.isArray(data) && data.length) {
                                    var subData;

                                    angular.forEach(data, function (item) {
                                        if (item.id && parseInt(item.id) === parseInt(rowId)) {
                                            subData = item[newValue.subItemKey];
                                        }
                                    });

                                    if (subData && angular.isArray(subData) && subData.length) {
                                        newValue.data = subData;
                                    }
                                }
                            }

                            newValue.initGrid();
                        }


                        scope.$watch('config.searchData', function (newValue, oldValue) {
                            if (newValue !== oldValue) {
                                var postData = scope.config.getGrid().jqGrid('getGridParam', 'postData');
                                if (!postData) {
                                    postData = {};
                                } else if (postData.searchData) {
                                    delete postData.searchData;
                                }

                                var found = false;
                                angular.forEach(newValue, function(value, key) {
                                    if (String(value).length) {
                                        found = true;
                                    }
                                });

                                if (found) {
                                    if (scope.config.datatype == 'local') {
                                        var filters = {groupOp: 'AND', rules:[]};
                                        angular.forEach(newValue, function(value, key) {
                                            if (String(value).length) {
                                                filters.rules.push({field: key, op: 'cn', data: value});
                                            }
                                        });
                                        angular.extend(postData, {
                                            filters: JSON.stringify(filters),
                                            searchField: '',
                                            searchOper: '',
                                            searchString: '',
                                            searchData: ''
                                        });

                                        scope.config.getGrid().jqGrid('setGridParam', {search: found, postData: postData, page: 1});
                                    } else {
                                        angular.extend(postData, {
                                            filters: '',
                                            searchField: '',
                                            searchOper: '',
                                            searchString: '',
                                            searchData: newValue
                                        });

                                        scope.config.getGrid().jqGrid('setGridParam', {search: found, postData: postData, page: 1});
                                    }
                                } else {
                                    angular.extend(postData, {
                                        filters: '',
                                        searchField: '',
                                        searchOper: '',
                                        searchString: '',
                                        searchData: ''
                                    });

                                    scope.config.getGrid().jqGrid('setGridParam', {search: found, postData: postData, page: 1});
                                }

                                scope.config.reloadGrid();
                            }
                        }, true);
                    };

                    buildJqGrid(newValueDir, elementDir, scopeDir);
                });
            }
        };
    }
];

angular
    .module('custom')
    .directive('ngJqGrid', ngJqGrid);
