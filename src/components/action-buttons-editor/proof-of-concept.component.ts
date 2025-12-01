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
        </div>
    `,
    controller: ($scope: any) => {
        // Bindings are available on $ctrl in the template
    }
};
