'use strict';
angular.module('bahmni.common.services')
    .factory('analyticService', ['$window', function ($window) {
        var logEvent = function (patient, eventName = '', eventProps = {}) {
            identify(patient);
            $window.analytics.track(eventName, eventProps);
        };

        var identify = function (patient) {
            $window.analytics.identify(
                patient.identifier,
                {
                    name: patient.name
                }
            );
        };

        var load = function (apiKey = 'VtDgJW0n3zuvpYcfzINVlP9B31oHgUBB') {
            $window.analytics.load(apiKey);
        };

        return {
            logEvent: logEvent,
            load: load,
            identify: identify
        };
    }]);
