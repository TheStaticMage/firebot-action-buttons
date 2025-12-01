export const actionButtonsEditorPocComponent = {
    name: "actionButtonsEditorPoc",
    bindings: {
        buttons: "="
    },
    template: `
        <div style="padding: 10px; border: 2px solid #4CAF50; margin: 10px 0;">
            <h3>Hello World from Shared Component!</h3>
            <p>This is a proof of concept component rendered via uiExtensionManager.</p>
            <p ng-if="$ctrl.buttons && $ctrl.buttons.length > 0">First button name: <strong>{{$ctrl.buttons[0].name}}</strong></p>
            <p ng-if="!$ctrl.buttons || $ctrl.buttons.length === 0">No action buttons</p>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button ng-click="showAlert()" class="btn btn-primary">
                    Test Alert Button
                </button>
                <button ng-click="testLogging()" class="btn btn-warning">
                    Test Logging
                </button>
                <button ng-if="$ctrl.buttons && $ctrl.buttons.length > 0" ng-click="renameLastButton()" class="btn btn-success">
                    Rename Button
                </button>
            </div>
        </div>
    `,
    controller: ($scope: any, backendCommunicator: any) => {
        $scope.showAlert = () => {
            alert("Alert from shared component! Bindings work correctly.");
        };

        $scope.testLogging = () => {
            backendCommunicator.send("logging", {
                level: "warn",
                message: "Test button clicked"
            });
        };

        $scope.renameLastButton = () => {
            const ctrl = $scope.$ctrl;
            if (ctrl.buttons && ctrl.buttons.length > 0) {
                ctrl.buttons[ctrl.buttons.length - 1].name = "Renamed";
                $scope.$applyAsync();
            }
        };
    }
};
