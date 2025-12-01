import { Firebot } from '@crowbartools/firebot-custom-scripts-types';
import { EffectScope } from '@crowbartools/firebot-custom-scripts-types/types/effects';
import { actionButtonManager } from '../internal/action-button-manager';
import { ActionButtonDefinition } from '../internal/action-button-types';
import { firebot, logger } from '../main';

declare const angular: any;

interface EffectModel {
    panelId: string;
    actionButtons: ActionButtonDefinition[];
}

export const addButtonsToPanelEffect: Firebot.EffectType<EffectModel> = {
    definition: {
        id: 'action-buttons:add-buttons-to-panel',
        name: 'Add Action Buttons to Panel',
        description: 'Add action buttons to an existing panel',
        icon: 'far fa-plus-square',
        categories: ["common", "chat based", "advanced"],
        outputs: [
            {
                label: 'Panel ID',
                description: 'The ID of the panel that buttons were added to',
                defaultName: 'panelId'
            }
        ]
    },
    optionsTemplate: `
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
        <eos-container header="Target Panel">
            <div class="control-fb-inline">
                <h4 class="control-fb-label">Panel ID</h4>
                <firebot-input model="effect.panelId" placeholder="Enter panel ID (supports variables)"></firebot-input>
            </div>
        </eos-container>

        <action-buttons-editor-poc buttons="effect.actionButtons"></action-buttons-editor-poc>

        <eos-container header="Action Buttons">
            <div ui-sortable="sortableOptions" ng-model="effect.actionButtons">
                <div ng-repeat="button in effect.actionButtons track by button.id" class="action-button-item">
                    <div class="action-button-header" ng-click="toggleButtonExpanded($index)">
                        <div style="flex: 1; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-grip-vertical" style="cursor: grab; color: #888;"></i>
                            <i class="fas fa-chevron-right collapse-icon" ng-class="{ expanded: expandedButtons[$index] }"></i>
                            <div ng-style="{backgroundColor: effect.actionButtons[$index].backgroundColor, color: effect.actionButtons[$index].foregroundColor}" style="display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 4px; flex-shrink: 0;">
                                <ng-container ng-if="effect.actionButtons[$index].icon && effect.actionButtons[$index].name">
                                    <i class="{{effect.actionButtons[$index].icon}}" style="min-width: 16px;"></i>
                                    <strong>{{effect.actionButtons[$index].name}}</strong>
                                </ng-container>
                                <ng-container ng-if="effect.actionButtons[$index].icon && !effect.actionButtons[$index].name">
                                    <i class="{{effect.actionButtons[$index].icon}}" style="min-width: 16px;"></i>
                                </ng-container>
                                <ng-container ng-if="!effect.actionButtons[$index].icon && effect.actionButtons[$index].name">
                                    <strong>{{effect.actionButtons[$index].name}}</strong>
                                </ng-container>
                                <ng-container ng-if="!effect.actionButtons[$index].icon && !effect.actionButtons[$index].name">
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
                            <firebot-input model="effect.actionButtons[$index].name" placeholder="Button display text"></firebot-input>
                        </div>

                        <div class="control-fb-inline" style="display: block; width: 100%; margin-top: 12px;">
                            <h4 class="control-fb-label">Icon</h4>
                            <input
                                maxlength="2"
                                type="text"
                                class="form-control"
                                ng-model="effect.actionButtons[$index].icon"
                                icon-picker
                            />
                        </div>

                        <div class="control-fb-inline">
                            <h4 class="control-fb-label">Alignment</h4>
                            <firebot-dropdown
                                options="alignmentOptions"
                                ng-model="effect.actionButtons[$index].alignment"
                                placeholder="Select alignment"
                                option-toggling="false"
                            />
                        </div>

                        <div class="control-fb-inline">
                            <h4 class="control-fb-label">Colors</h4>
                            <div style="width: 100%; margin-top: 12px;">
                                <color-picker-input
                                    model="effect.actionButtons[$index].backgroundColor"
                                    label="Background Color"
                                ></color-picker-input>
                            </div>

                            <div style="width: 100%; margin-top: 12px;">
                                <color-picker-input
                                    model="effect.actionButtons[$index].foregroundColor"
                                    label="Foreground Color"
                                ></color-picker-input>
                            </div>
                        </div>

                        <div class="control-fb-inline">
                            <h4 class="control-fb-label">On Click</h4>
                            <firebot-dropdown
                                options="onClickOptions"
                                ng-model="effect.actionButtons[$index].onClick"
                                placeholder="Select action"
                                option-toggling="false"
                            />
                        </div>

                        <div class="control-fb-inline" style="display: block; width: 100%; margin-top: 12px;">
                            <h4 class="control-fb-label">Extra Metadata</h4>
                            <firebot-input
                                input-title="(JSON)"
                                model="effect.actionButtons[$index].extraMetadata"
                                placeholder-text="{}"
                                rows="3"
                                use-text-area="true"
                                menu-position="under"
                            />
                        </div>

                        <div class="control-fb-inline" style="display: block; width: 100%; margin-top: 12px;">
                            <h4 class="control-fb-label">Effects to Execute on Click</h4>
                            <effect-list effects="effect.actionButtons[$index].effectList" trigger="{{trigger}}" header="Button Effects"></effect-list>
                        </div>
                    </div>
                </div>
            </div>

            <div class="control-fb-inline" style="margin-top: 10px;">
                <button class="btn btn-primary" ng-click="addButton()">
                    <i class="fas fa-plus"></i> Add Button
                </button>
            </div>

            <p ng-if="effect.actionButtons.length === 0" style="color: #999; font-style: italic;">No buttons added yet. Click "Add Button" to create one.</p>
        </eos-container>
    `,
    optionsController: ($scope: EffectScope<EffectModel>, backendCommunicator: any, $timeout: any) => {
        $scope.effect = $scope.effect || ({} as EffectModel);
        $scope.effect.panelId = $scope.effect.panelId || '';
        $scope.effect.actionButtons = $scope.effect.actionButtons || [];

        const generateUUID = () => {
            return backendCommunicator.fireEventSync('action-buttons:generate-uuid');
        };

        const fixedButtons = (button: ActionButtonDefinition): ActionButtonDefinition => {
            const id = button.id || generateUUID();
            if (!button.effectList) {
                button.effectList = { id, list: [] };
            }
            button.id = id;
            return button;
        };

        $timeout(() => {
            $scope.effect.actionButtons = $scope.effect.actionButtons.map(fixedButtons);
        }, 0);

        const expandedButtons: Record<number, boolean> = {};
        ($scope as any).expandedButtons = expandedButtons;
        ($scope as any).sortableOptions = {
            handle: '.fa-grip-vertical',
            axis: 'y'
        };
        ($scope as any).alignmentOptions = [
            { name: 'Left', value: 'left' },
            { name: 'Center', value: 'center' },
            { name: 'Right', value: 'right' }
        ];
        ($scope as any).onClickOptions = [
            { name: 'No visibility changes', value: 'noVisibilityChanges' },
            { name: 'Hide button', value: 'hideButton' },
            { name: 'Hide panel', value: 'hidePanel' }
        ];

        ($scope as any).toggleButtonExpanded = (index: number) => {
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

        if ($scope.effect.actionButtons.length === 0) {
            $scope.effect.actionButtons.push(newButton());
        }

        $scope.addButton = () => {
            $scope.effect.actionButtons.push(newButton());
        };

        $scope.duplicateButton = (index: number) => {
            const buttonCopy = angular.copy($scope.effect.actionButtons[index]);
            const newEffectListId = generateUUID() || Math.random().toString(36).slice(2);
            buttonCopy.id = newEffectListId;
            if (!buttonCopy.effectList) {
                buttonCopy.effectList = { id: newEffectListId, list: [] };
            } else {
                buttonCopy.effectList.id = newEffectListId;
            }
            $scope.effect.actionButtons.splice(index + 1, 0, fixedButtons(buttonCopy));
        };

        $scope.removeButton = (index: number) => {
            $scope.effect.actionButtons.splice(index, 1);
        };
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];

        if (!effect.panelId || effect.panelId.trim() === '') {
            errors.push('Panel ID is required');
        }

        if (!effect.actionButtons || effect.actionButtons.length === 0) {
            errors.push('At least one action button is required');
        } else {
            for (let i = 0; i < effect.actionButtons.length; i++) {
                const button = effect.actionButtons[i];
                const hasName = button.name && button.name.trim() !== '';
                const hasIcon = button.icon && button.icon.trim() !== '';
                if (!hasName && !hasIcon) {
                    errors.push(`Button ${i + 1}: Name and/or icon is required`);
                }
                if (!button.backgroundColor) {
                    errors.push(`Button ${i + 1}: Background color is required`);
                }
                if (!button.foregroundColor) {
                    errors.push(`Button ${i + 1}: Foreground color is required`);
                }
            }
        }

        return errors;
    },
    onTriggerEvent: async (event) => {
        logger.debug('Triggered action-buttons:add-buttons-to-panel');

        const errorResponse = {
            success: false,
            execution: {
                stop: false,
                bubbleStop: false
            }
        };

        const effect = event.effect;
        const panelId = effect.panelId;

        if (!panelId || panelId.trim() === '') {
            logger.error('Panel ID is required');
            return errorResponse;
        }

        try {
            const displayButtons = actionButtonManager.processActionButtons(
                effect.actionButtons,
                panelId,
                event.trigger
            );

            logger.debug(`Processed ${displayButtons.length} display buttons for panel ${panelId}`);

            const { frontendCommunicator } = firebot.modules;
            frontendCommunicator.send('action-buttons:panel-updated', panelId);

            logger.info(`Successfully added ${displayButtons.length} buttons to panel ${panelId}`);

            return {
                success: true,
                outputs: {
                    panelId
                }
            };
        } catch (error) {
            logger.error(`Failed to add buttons to panel: ${error}`);
            return errorResponse;
        }
    }
};
