'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('concept', ['RecursionHelper', 'spinner', '$filter', 'messagingService', 'diagnosisService',
        function (RecursionHelper, spinner, $filter, messagingService, diagnosisService) {
            var link = function (scope) {
                var hideAbnormalbuttonConfig = scope.observation && scope.observation.conceptUIConfig && scope.observation.conceptUIConfig['hideAbnormalButton'];

                scope.now = moment().format("YYYY-MM-DD hh:mm:ss");
                scope.showTitle = scope.showTitle === undefined ? true : scope.showTitle;
                scope.hideAbnormalButton = hideAbnormalbuttonConfig == undefined ? scope.hideAbnormalButton : hideAbnormalbuttonConfig;
                if (scope.observation === "Current Condition") {
                    scope.chosenCondition = scope.chosenCondition || new Bahmni.Common.Domain.Condition();
                }

                scope.cloneNew = function (observation, parentObservation) {
                    observation.showAddMoreButton = function () {
                        return false;
                    };
                    var newObs = observation.cloneNew();
                    newObs.scrollToElement = true;
                    var index = parentObservation.groupMembers.indexOf(observation);
                    parentObservation.groupMembers.splice(index + 1, 0, newObs);
                    messagingService.showMessage("info", "A new " + observation.label + " section has been added");
                    scope.$root.$broadcast("event:addMore", newObs);
                };

                scope.removeClonedObs = function (observation, parentObservation) {
                    if (observation.label === "Current Condition") {
                        scope.$emit("removed-condition", scope.chosenCondition);
                    }
                    observation.voided = true;
                    var lastObservationByLabel = _.findLast(parentObservation.groupMembers, function (groupMember) {
                        return groupMember.label === observation.label && !groupMember.voided;
                    });

                    lastObservationByLabel.showAddMoreButton = function () {
                        return true;
                    };
                    observation.hidden = true;
                };

                scope.isClone = function (observation, parentObservation) {
                    if (parentObservation && parentObservation.groupMembers) {
                        var index = parentObservation.groupMembers.indexOf(observation);
                        return (index > 0) ? parentObservation.groupMembers[index].label == parentObservation.groupMembers[index - 1].label : false;
                    }
                    return false;
                };

                scope.isRemoveValid = function (observation) {
                    if (observation.getControlType() == 'image') {
                        return !observation.value;
                    }
                    return true;
                };

                scope.getStringValue = function (observations) {
                    return observations.map(function (observation) {
                        return observation.value + ' (' + $filter('bahmniDate')(observation.date) + ")";
                    }).join(", ");
                };

                scope.toggleSection = function () {
                    scope.collapse = !scope.collapse;
                };

                scope.isCollapsibleSet = function () {
                    return scope.showTitle == true;
                };

                scope.hasPDFAsValue = function () {
                    return scope.observation.value && (scope.observation.value.indexOf(".pdf") > 0);
                };

                scope.$watch('collapseInnerSections', function () {
                    scope.collapse = scope.collapseInnerSections && scope.collapseInnerSections.value;
                });

                scope.handleUpdate = function () {
                    scope.$root.$broadcast("event:observationUpdated-" + scope.conceptSetName, scope.observation.concept.name, scope.rootObservation);
                };

                scope.getAddConditionMethod = function () {
                    return function (item) {
                        scope.chosenCondition = scope.chosenCondition || new Bahmni.Common.Domain.Condition();
                        scope.chosenCondition.concept.uuid = item.lookup.uuid;
                        scope.chosenCondition.concept.name = item.lookup.name;
                        scope.$emit("added-condition", item);
                    };
                };

                var mapConcept = function (result) {
                    return _.map(result.data, function (concept) {
                        var response = {
                            value: concept.matchedName || concept.conceptName,
                            concept: {
                                name: concept.conceptName,
                                uuid: concept.conceptUuid
                            },
                            lookup: {
                                name: concept.matchedName || concept.conceptName,
                                uuid: concept.conceptUuid
                            }
                        };

                        if (concept.matchedName && concept.matchedName !== concept.conceptName) {
                            response.value = response.value + " => " + concept.conceptName;
                        }
                        if (concept.code) {
                            response.value = response.value + " (" + concept.code + ")";
                        }
                        return response;
                    });
                };

                scope.getDiagnosis = function (params) {
                    return diagnosisService.getAllFor(params.term).then(mapConcept);
                };

                scope.update = function (value) {
                    if (scope.getBooleanResult(scope.observation.isObservationNode)) {
                        scope.observation.primaryObs.value = value;
                    } else if (scope.getBooleanResult(scope.observation.isFormElement())) {
                        scope.observation.value = value;
                    }
                    scope.handleUpdate();
                };

                scope.getBooleanResult = function (value) {
                    return !!value;
                };
            };

            var compile = function (element) {
                return RecursionHelper.compile(element, link);
            };

            return {
                restrict: 'E',
                compile: compile,
                scope: {
                    conceptSetName: "=",
                    observation: "=",
                    atLeastOneValueIsSet: "=",
                    showTitle: "=",
                    conceptSetRequired: "=",
                    rootObservation: "=",
                    patient: "=",
                    collapseInnerSections: "=",
                    rootConcept: "&",
                    hideAbnormalButton: "="
                },
                templateUrl: '../common/concept-set/views/observation.html'
            };
        }]);
