/**
 * Deals with general formatting
 */
var formatterFactory = ['$parse', 'CONFIG', 'translationFactory', 'numericFormatFactory',
    function($parse, CONFIG, translationFactory, numericFormatFactory) {

        // person full name
        var personFullName = function(person) {
            if (!angular.isObject(person)) {
                return '';
            }

            var name = [];

            if (person.firstname) {
                name.push(person.firstname);
            }
            if (person.middlename) {
                name.push(person.middlename);
            }
            if (person.lastname) {
                name.push(person.lastname);
            }
            if (person.maidenname) {
                name.push(person.maidenname);
            }

            return name.join(' ');
        };

        var personAddress = function(address) {
            var q = [];
            if (angular.isString(address)) {
                q.push(address);
            } else if (angular.isObject(address)) {
                if (address.street && address.street.length) {
                    q.push(address.street);
                }
                if (address.house_num && address.house_num.length) {
                    q.push(address.house_num);
                }
                if (address.postal_code && address.postal_code.length) {
                    q.push(address.postal_code);
                }
                if (address.city && address.city.length) {
                    q.push(address.city);
                }
                if (address.country && address.country.translation_key_translation && address.country.translation_key_translation.length) {
                    q.push(address.country.translation_key_translation);
                }
            }

            if (q.length) {
                return q.join(' ');
            }
        };

        var employeeCompanyPath = function(company, separator) {
            if (angular.isEmpty(separator)) {
                separator = ' - ';
            }
            if (!angular.isObject(company)) {
                return '';
            }
            var path = [];
            if (company.parent_company) {
                path.push(company.parent_company.name);
            }
            path.push(company.name);

            if (path.length) {
                return path.join(separator);
            }
            return '';
        };

        var urlGoogleMaps = function(address) {
            var googleMapsUrl = 'http://maps.google.com?q=',
                q = [];
            if (angular.isString(address)) {
                q.push(address);
            } else if (angular.isObject(address)) {
                if (address.lat && address.lng) {
                    q.push(address.lat);
                    q.push(address.lng);
                } else {
                    if (address.street && address.street.length) {
                        q.push(address.street);
                    }
                    if (address.house_num && address.house_num.length) {
                        q.push(address.house_num);
                    }
                    if (address.postal_code && address.postal_code.length) {
                        q.push(address.postal_code);
                    }
                    if (address.city && address.city.length) {
                        q.push(address.city);
                    }
                    if (address.country && address.country.name && address.country.name.length) {
                        q.push(address.country.name);
                    }
                }
            }

            if (q.length) {
                return googleMapsUrl + encodeURIComponent(q.join(' '));
            }
        };

        var dateLong = function(str, invalidSign){
            var invalidSign = invalidSign || CONFIG.invalidSign,
                m = moment.utc(str);
            return !angular.isEmpty(str) && m.isValid() ? m.formatPHP(CONFIG.longDateFormat) : invalidSign;
        };

        var dateShort = function(str, invalidSign){
            var invalidSign = invalidSign || CONFIG.invalidSign,
                m = moment.utc(str);
            return !angular.isEmpty(str) && m.isValid() ? m.formatPHP(CONFIG.shortDateFormat) : invalidSign;
        };

        var boolean = function(value, invalidSign){
            var invalidSign = invalidSign || CONFIG.invalidSign;
            return (typeof value != 'undefined') && !(typeof value == 'object' && value === null) ? (value ? translationFactory.translate('formatterFactory|Yes') : translationFactory.translate('formatterFactory|No')) : invalidSign;
        };

        var nl2br = function (str, is_xhtml) {
            var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
            return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
        };

        var accountNumber = function(str) {
            if (!angular.isEmpty(str)) {
                return String(str).toUpperCase();
            }
            return str;
        };

        var paycheckDateMonth = function(str, invalidSign){
            var invalidSign = invalidSign || CONFIG.invalidSign,
                m = moment.utc(str);

            if (!angular.isEmpty(str) && m.isValid()) {
                return sprintf(translationFactory.translate('Paycheck: Month %s'), m.formatPHP(CONFIG.monthDateFormat));
            }

            return invalidSign;
        };

        var paycheckDateWeek = function(str, invalidSign){
            var invalidSign = invalidSign || CONFIG.invalidSign,
                m = moment.utc(str);
            var weekNr = parseInt(m.formatPHP('W')),
                period,
                periodWeekStart,
                periodWeekEnd;

            if (!angular.isEmpty(str) && m.isValid()) {
                if (weekNr == 53) {
                    period = 52 / 4;
                    periodWeekStart = 48;
                    periodWeekEnd = 53;
                } else {
                    period = Math.floor(weekNr / 4);
                    periodWeekStart = period * 4;

                    if ((weekNr % 4) == 0) {
                        periodWeekStart = (period - 1) * 4;
                    }
                    periodWeekEnd = periodWeekStart + 4;
                }

                return sprintf(translationFactory.translate('Paycheck: P-%s From week %s - week %s'), period, periodWeekStart, periodWeekEnd);
            }

            return invalidSign;
        };

        return {
            personFullName: personFullName,
            personAddress: personAddress,
            urlGoogleMaps: urlGoogleMaps,
            dateLong: dateLong,
            dateShort: dateShort,
            translate: translationFactory.translate,
            boolean: boolean,
            numericConvert: numericFormatFactory.convert,
            numericRevert: numericFormatFactory.revert,
            nl2br: nl2br,
            accountNumber: accountNumber,
            employeeCompanyPath: employeeCompanyPath,
            paycheckDateMonth: paycheckDateMonth,
            paycheckDateWeek: paycheckDateWeek
        }
    }
];


angular
    .module('custom')
    .factory('formatterFactory', formatterFactory);