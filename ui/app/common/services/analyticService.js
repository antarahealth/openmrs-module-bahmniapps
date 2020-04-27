'use strict';
angular.module('bahmni.common.services')
    .factory('analyticService', ['$window', function ($window) {
        var logEvent = function (patient, eventName = '', eventProps = {}) {
            identify(patient);
            $window.analytics.track(eventName, eventProps, {
                integrations: {
                    'All': true,
                    'Mixpanel': true
                }
            });
        };

        var logEncounter = function (patient, encounter) {
            const observations = encounter.observations;
            const eventsToSend = observations.map(ob => {
                let values = {};
                if (ob.conceptNameToDisplay === 'Interaction Log Form') {
                    values = {
                        "interactionType": ob.groupMembers.find(m => m.conceptNameToDisplay === "Interactor type").valueAsString,
                        "modeOfCommunication": ob.groupMembers.find(m => m.conceptNameToDisplay === "Mode of Communication").valueAsString,
                        "direction": ob.groupMembers.find(m => m.conceptNameToDisplay === "Interaction direction").valueAsString
                    };
                }
                return {
                    "name": "Encounter Created",
                    props: {
                        "encounterId": encounter.encounterUuid,
                        "category": ob.conceptNameToDisplay,
                        ...values
                    }
                };
            });
            eventsToSend.forEach(e => logEvent(patient, e.name, e.props));
        };

        var identify = function (patient) {
            $window.analytics.identify(
                patient.primaryIdentifier ? patient.primaryIdentifier.identifier : patient.identifier,
                {
                    name: patient.fullNameLocal ? patient.fullNameLocal() : patient.name
                },
                {
                    integrations: {
                        'All': true,
                        'Mixpanel': true
                    }
                }
            );
        };

        var load = function (apiKey = 'VtDgJW0n3zuvpYcfzINVlP9B31oHgUBB') {
            $window.analytics.load(apiKey);
        };

        return {
            logEvent: logEvent,
            load: load,
            identify: identify,
            logEncounter: logEncounter
        };
    }]);
