'use strict';
angular.module('bahmni.common.services')
    .factory('analyticService', ['$window', '$rootScope', function ($window, $rootScope) {
        var logEvent = function (patient, eventName, eventProps) {
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
            const genders = {
                "M": "Male",
                "F": "Female"
            };
            const userId = patient.primaryIdentifier ? patient.primaryIdentifier.identifier : patient.identifier;
            const patientNonPIIattributes = {
                name: userId,
                gender: genders[patient.gender],
                dateofbirth: patient.birthdate,
                scribeRegistrationDate: patient.registrationDate,
                maritalStatus: patient['Marital Status'] && patient['Marital Status'].value,
                assignedHns: patient.hnAssignedRelationship && patient.hnAssignedRelationship.map(hn => hn.personB.display),
                preferredLanguage: patient['Preferred language'],
                isEnrolledInNHIF: patient['Is enrolled in NHIF'] && patient['Is enrolled in NHIF'].value,
                typeOfCover: patient['Type of Cover'] && patient['Type of Cover'].value,
                memberType: patient['Member Type, Dependent'] && patient['Member Type, Dependent'].value,
                coverRiders: patient['Cover Riders e.g Dental, Optical'],
                dateOfEnrollment: patient['Date of Enrollment'],
                preferredAntaraFacility: patient['Preferred Antara Facility'] && patient['Preferred Antara Facility'].value,
                payorFullName: patient['Payor Full Name'],
                primaryPreferredMethodofContact: patient['Primary Preferred Method of Contact'] && patient['Primary Preferred Method of Contact'].value,
                preferredSecondaryMethodofContact: patient['preferredSecondaryMethodofContact'] && patient['preferredSecondaryMethodofContact'].value,
                beneficiaryStatus: patient['Beneficiary Status'] && patient['Beneficiary Status'].value,
                chronicCover: patient['Chronic Cover'] && patient['Chronic Cover'].value,
                payorRelationship: patient['Payor Relationship'] && patient['Payor Relationship'].value,
                coverageStartDate: patient['Coverage Start Date'],
                ICUCover: patient['ICU Cover'] && patient['ICU Cover'].value,
                MRI: patient['MRI'],
                dental: patient['Dental'],
                privateRoom: patient['Private Room'],
                ruralCover: patient['Rural Cover'],
                copay: patient['Copay'],
                optical: patient['Optical'],
                executivePass: patient['Executive Pass'],
                inpatientLimit: patient['Inpatient Limit']
            };

            $window.analytics.identify(
                userId,
                patientNonPIIattributes,
                {
                    integrations: {
                        'All': true,
                        'Mixpanel': true
                    }
                }
            );
        };

        var load = function (apiKey) {
            $window.analytics.load(apiKey || 'VtDgJW0n3zuvpYcfzINVlP9B31oHgUBB');
        };

        return {
            logEvent: logEvent,
            load: load,
            identify: identify,
            logEncounter: logEncounter
        };
    }]);
