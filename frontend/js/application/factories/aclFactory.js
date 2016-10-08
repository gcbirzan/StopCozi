/**
 * Provides an easier interface with
 */
var aclFactory = ['$rootScope', 'CONFIG', 'AclService', function ($rootScope, CONFIG, AclService) {
    var setup = function() {
        if (!CONFIG.role) {
            CONFIG.role = 'unknown';
        }
        AclService.attachRole(CONFIG.role);

        if (!CONFIG.aclRules) {
            CONFIG.aclRules = {};
            CONFIG.aclRules[CONFIG.role] = ['allow_*'];
        } else {
            if (angular.isArray(CONFIG.aclRules)) {
                var rules = CONFIG.aclRules
                CONFIG.aclRules = {};
                CONFIG.aclRules[CONFIG.role] = rules;
            }
        }
        angular.forEach(CONFIG.aclRules, function(rules, role) {
            angular.forEach(rules, function(rule, idx) {
                CONFIG.aclRules[role][idx] = String(rule).toLowerCase();
            });
        });

        AclService.setAbilities(CONFIG.aclRules);

        $rootScope.can = can;
    };

    var can = function(ability) {
        ability = String(ability).replace(/\W+/g, "_").replace(/^_|_$/g, '').toLowerCase();

        if (!ability.length) {
            return true;
        }

        return (AclService.can('allow_*') || AclService.can('allow_' + ability)) && !AclService.can('deny_*') && !AclService.can('deny_' + ability);
    };

    return {
        setup:setup,
        can: can
    }
}];

angular
    .module('custom')
    .factory('aclFactory', aclFactory);
