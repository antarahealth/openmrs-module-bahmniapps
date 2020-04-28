'use strict';

angular.module('bahmni.common.attributeTypes', []).directive('attributeTypes', [function () {
    return {
        scope: {
            targetModel: '=',
            attribute: '=',
            fieldValidation: '=',
            isAutoComplete: '&',
            getAutoCompleteList: '&',
            getDataResults: '&',
            handleUpdate: '&',
            isReadOnly: '&',
            isForm: '=?',
            setValue: "="
        },
        templateUrl: '../common/attributeTypes/views/attributeInformation.html',
        restrict: 'E',
        controller: function ($scope) {
            const readonlyFields = [
                "Passport Country Code",
                "Passport Country Name",
                "Passport Number",
                "Beneficiary Group Name"
            ];
            $scope.getAutoCompleteList = $scope.getAutoCompleteList();
            $scope.getDataResults = $scope.getDataResults();
            // to avoid watchers in one way binding
            $scope.isAutoComplete = $scope.isAutoComplete() || function () { return false; };
            $scope.isReadOnly = $scope.isReadOnly() || function (field) {
                return readonlyFields.indexOf(field) !== -1;
            };
            $scope.handleUpdate = $scope.handleUpdate() || function () { return false; };
            $scope.appendConceptNameToModel = function (attribute) {
                var attributeValueConceptType = $scope.targetModel[attribute.name];
                var concept = _.find(attribute.answers, function (answer) {
                    return answer.conceptId === attributeValueConceptType.conceptUuid;
                });
                attributeValueConceptType.value = concept && concept.fullySpecifiedName;
                if ($scope.setValue != undefined) {
                    attributeValueConceptType.attributeType = attribute.uuid;
                    $scope.setValue(attribute.name, attributeValueConceptType);
                }
            };
        }
    };
}]);
