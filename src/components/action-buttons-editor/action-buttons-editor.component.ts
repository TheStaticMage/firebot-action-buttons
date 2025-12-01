export const actionButtonsEditorComponent = {
    name: "actionButtonsEditor",
    bindings: {
        buttons: "="
    },
    template: `
        <style>
            .control-fb-inline + .control-fb-inline {
                margin-top: 15px;
            }
            .control-fb-label {
                font-weight: 700;
            }
            h4.control-fb-label {
                font-size: 0.9em;
            }
            .action-button-item {
                border: 1px solid #444;
                padding: 15px;
                margin-bottom: 10px;
                border-radius: 4px;
                background-color: #2a2a2a;
                color: #e0e0e0;
            }
            .action-button-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: pointer;
                user-select: none;
                font-size: 1.1em;
            }
            .action-button-content.expanded {
                margin-top: 10px;
            }
            .action-button-header:hover {
                opacity: 0.8;
            }
            .action-button-header strong {
                color: #e0e0e0;
            }
            .action-button-content {
                display: none;
            }
            .action-button-content.expanded {
                display: block;
            }
            .collapse-icon {
                color: #888;
                transition: transform 0.2s;
            }
            .collapse-icon.expanded {
                transform: rotate(90deg);
            }
            .action-button-header .btn-secondary {
                background-color: #3a3a3a;
                border-color: #2f2f2f;
                color: #f0f0f0;
            }
        </style>
        <eos-container header="Action Buttons">
            <div ui-sortable="sortableOptions" ng-model="$ctrl.buttons">
                <div ng-repeat="button in $ctrl.buttons track by button.id" class="action-button-item">
                    <div class="action-button-header" ng-click="toggleButtonExpanded($index)">
                        <div style="flex: 1; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-grip-vertical" style="cursor: grab; color: #888;"></i>
                            <i class="fas fa-chevron-right collapse-icon" ng-class="{ expanded: expandedButtons[$index] }"></i>
                            <div ng-style="{backgroundColor: $ctrl.buttons[$index].backgroundColor, color: $ctrl.buttons[$index].foregroundColor}" style="display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 4px; flex-shrink: 0;">
                                <ng-container ng-if="$ctrl.buttons[$index].icon && $ctrl.buttons[$index].name">
                                    <i class="{{$ctrl.buttons[$index].icon}}" style="min-width: 16px;"></i>
                                    <strong>{{$ctrl.buttons[$index].name}}</strong>
                                </ng-container>
                                <ng-container ng-if="$ctrl.buttons[$index].icon && !$ctrl.buttons[$index].name">
                                    <i class="{{$ctrl.buttons[$index].icon}}" style="min-width: 16px;"></i>
                                </ng-container>
                                <ng-container ng-if="!$ctrl.buttons[$index].icon && $ctrl.buttons[$index].name">
                                    <strong>{{$ctrl.buttons[$index].name}}</strong>
                                </ng-container>
                                <ng-container ng-if="!$ctrl.buttons[$index].icon && !$ctrl.buttons[$index].name">
                                    <strong>New Button</strong>
                                </ng-container>
                            </div>
                        </div>
                        <div ng-click="$event.stopPropagation();">
                            <button class="btn btn-secondary btn-sm" ng-click="duplicateButton($index)" title="Duplicate">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" ng-click="removeButton($index)" title="Remove" style="margin-left: 5px;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>

                    <div class="action-button-content" ng-class="{ expanded: expandedButtons[$index] }">
                        <div class="control-fb-inline" style="display: block; width: 100%; margin-top: 12px;">
                            <h4 class="control-fb-label">Button Name</h4>
                            <firebot-input model="$ctrl.buttons[$index].name" placeholder="Button display text"></firebot-input>
                        </div>

                        <div class="control-fb-inline" style="display: block; width: 100%; margin-top: 12px;">
                            <h4 class="control-fb-label">Icon</h4>
                            <input
                                maxlength="2"
                                type="text"
                                class="form-control"
                                ng-model="$ctrl.buttons[$index].icon"
                                icon-picker
                            />
                        </div>

                        <div class="control-fb-inline">
                            <h4 class="control-fb-label">Alignment</h4>
                            <firebot-dropdown
                                options="alignmentOptions"
                                ng-model="$ctrl.buttons[$index].alignment"
                                placeholder="Select alignment"
                                option-toggling="false"
                            />
                        </div>

                        <div class="control-fb-inline">
                            <h4 class="control-fb-label">Colors</h4>
                            <div style="width: 100%; margin-top: 12px;">
                                <color-picker-input
                                    model="$ctrl.buttons[$index].backgroundColor"
                                    label="Background Color"
                                ></color-picker-input>
                            </div>

                            <div style="width: 100%; margin-top: 12px;">
                                <color-picker-input
                                    model="$ctrl.buttons[$index].foregroundColor"
                                    label="Foreground Color"
                                ></color-picker-input>
                            </div>
                        </div>

                        <div class="control-fb-inline">
                            <h4 class="control-fb-label">On Click</h4>
                            <firebot-dropdown
                                options="onClickOptions"
                                ng-model="$ctrl.buttons[$index].onClick"
                                placeholder="Select action"
                                option-toggling="false"
                            />
                        </div>

                        <div class="control-fb-inline" style="display: block; width: 100%; margin-top: 12px;">
                            <h4 class="control-fb-label">Extra Metadata</h4>
                            <firebot-input
                                input-title="(JSON)"
                                model="$ctrl.buttons[$index].extraMetadata"
                                placeholder-text="{}"
                                rows="3"
                                use-text-area="true"
                                menu-position="under"
                            />
                        </div>

                        <div class="control-fb-inline" style="display: block; width: 100%; margin-top: 12px;">
                            <h4 class="control-fb-label">Effects to Execute on Click</h4>
                            <effect-list effects="$ctrl.buttons[$index].effectList" trigger="{{trigger}}" header="Button Effects"></effect-list>
                        </div>
                    </div>
                </div>
            </div>

            <div class="control-fb-inline" style="margin-top: 10px;">
                <button class="btn btn-primary" ng-click="addButton()">
                    <i class="fas fa-plus"></i> Add Button
                </button>
            </div>

            <p ng-if="$ctrl.buttons.length === 0" style="color: #999; font-style: italic;">No buttons added yet. Click "Add Button" to create one.</p>
        </eos-container>
    `,
    controller: ($scope: any, backendCommunicator: any, $timeout: any) => {
        const generateUUID = () => {
            return backendCommunicator.fireEventSync('action-buttons:generate-uuid');
        };

        const fixedButtons = (button: any): any => {
            const id = button.id || generateUUID();
            if (!button.effectList) {
                button.effectList = { id, list: [] };
            }
            button.id = id;
            return button;
        };

        $timeout(() => {
            const ctrl = $scope.$ctrl;
            if (ctrl.buttons) {
                ctrl.buttons = ctrl.buttons.map(fixedButtons);
            }
        }, 0);

        const expandedButtons: Record<number, boolean> = {};
        $scope.expandedButtons = expandedButtons;
        $scope.sortableOptions = {
            handle: '.fa-grip-vertical',
            axis: 'y'
        };
        $scope.alignmentOptions = [
            { name: 'Left', value: 'left' },
            { name: 'Center', value: 'center' },
            { name: 'Right', value: 'right' }
        ];
        $scope.onClickOptions = [
            { name: 'No visibility changes', value: 'noVisibilityChanges' },
            { name: 'Hide button', value: 'hideButton' },
            { name: 'Hide panel', value: 'hidePanel' }
        ];

        $scope.toggleButtonExpanded = (index: number) => {
            expandedButtons[index] = !expandedButtons[index];
        };

        const newButton = () => {
            return fixedButtons({
                id: '',
                name: 'New Button',
                backgroundColor: '#FF6B6BFF',
                foregroundColor: '#FFFFFFFF',
                icon: 'fas fa-circle',
                alignment: 'center',
                onClick: 'noVisibilityChanges',
                effectList: {
                    id: '',
                    list: []
                },
                extraMetadata: ''
            });
        };

        $scope.addButton = () => {
            const ctrl = $scope.$ctrl;
            if (ctrl.buttons) {
                ctrl.buttons.push(newButton());
            }
        };

        $scope.duplicateButton = (index: number) => {
            const ctrl = $scope.$ctrl;
            const angular = (window as any).angular;
            const buttonCopy = angular.copy(ctrl.buttons[index]);
            const newEffectListId = generateUUID() || Math.random().toString(36).slice(2);
            buttonCopy.id = newEffectListId;
            if (!buttonCopy.effectList) {
                buttonCopy.effectList = { id: newEffectListId, list: [] };
            } else {
                buttonCopy.effectList.id = newEffectListId;
            }
            ctrl.buttons.splice(index + 1, 0, fixedButtons(buttonCopy));
        };

        $scope.removeButton = (index: number) => {
            const ctrl = $scope.$ctrl;
            ctrl.buttons.splice(index, 1);
        };
    }
};
