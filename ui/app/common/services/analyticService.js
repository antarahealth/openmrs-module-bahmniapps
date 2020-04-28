'use strict';
angular.module('bahmni.common.services')
    .factory('analyticService', ['$window', '$rootScope', function ($window, $rootScope) {
        var logEvent = function (patient, eventName = '', eventProps = {}) {
            identify(patient);
            $window.analytics.track(eventName, {...eventProps, loggedBy: $rootScope.currentUser.username}, {
                integrations: {
                    'All': true,
                    'Mixpanel': true
                }
            });
        };

        var logEncounter = function (patient, encounter) {
            const observations = encounter.observations;
            const obsEventsToSend = observations.map(ob => {
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
            obsEventsToSend.forEach(e => logEvent(patient, e.name, e.props));

            const medications = encounter.treatmentDrugs;
            const medsEventsToSend = medications.map(med => {
                return {
                    "name": "Medication Created",
                    props: {
                        "encounterId": encounter.encounterUuid
                    }
                };
            });
            medsEventsToSend.forEach(e => logEvent(patient, e.name, e.props));
        };

        var identify = function (patient) {
            $window.analytics.identify(
                patient.primaryIdentifier ? patient.primaryIdentifier.identifier : patient.identifier,
                {
                    name: patient.fullNameLocal ? patient.fullNameLocal() : patient.name,
                    loggedBy: $rootScope.currentUser.username
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
