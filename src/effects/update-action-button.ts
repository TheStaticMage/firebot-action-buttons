import { Firebot } from '@crowbartools/firebot-custom-scripts-types';
import { logger } from '../main';
import { OnClickVisibility } from '../internal/action-button-types';
import { actionButtonManager } from '../internal/action-button-manager';

interface PropertyUpdate<T> {
    mode: 'unchanged' | 'change';
    value: T;
}

interface EffectModel {
    buttonId: string;
    buttonName: PropertyUpdate<string>;
    icon: PropertyUpdate<string>;
    backgroundColor: PropertyUpdate<string>;
    foregroundColor: PropertyUpdate<string>;
    onClick: PropertyUpdate<OnClickVisibility>;
}

export const updateActionButtonEffect: Firebot.EffectType<EffectModel> = {
    definition: {
        id: 'action-buttons:update-action-button',
        name: 'Update Action Button',
        description: 'Update properties of an existing action button',
        icon: 'far fa-edit',
        categories: ['chat based']
    },
    optionsTemplate: `
        <style>
            .update-action-button-input-container {
                position: relative;
                margin-bottom: 15px;
            }
            .update-action-button-disabled {
                pointer-events: none;
            }
            .update-action-button-disabled .firebot-dropdown-btn {
                cursor: not-allowed;
                opacity: 0.65;
            }
            .update-action-button-input-overlay {
                position: absolute;
                inset: 0;
                border-radius: inherit;
                background: rgba(0, 0, 0, 0.25);
                cursor: not-allowed;
                z-index: 10;
                border-radius: 10px;
            }
            .control-fb-inline + .control-fb-inline {
                margin-top: 15px;
            }
        </style>

        <eos-container header="Button Selection">
            <div class="control-fb-inline update-action-button-input-container">
                <label class="control-fb-label">Button ID</label>
                <firebot-input model="effect.buttonId" placeholder-text="Enter button ID (UUID)"></firebot-input>
            </div>
        </eos-container>

        <eos-container header="Button Name">
            <div class="control-fb-inline">
                <firebot-radio-container>
                    <firebot-radio label="Unchanged" model="effect.buttonName.mode" value="'unchanged'" />
                    <firebot-radio label="Change to" model="effect.buttonName.mode" value="'change'" />
                </firebot-radio-container>
            </div>
            <div class="control-fb-inline update-action-button-input-container">
                <firebot-input
                    model="effect.buttonName.value"
                    placeholder-text="Enter new button name"
                ></firebot-input>
                <div class="update-action-button-input-overlay" ng-if="effect.buttonName.mode === 'unchanged'"></div>
            </div>
        </eos-container>

        <eos-container header="Icon">
            <div class="control-fb-inline">
                <firebot-radio-container>
                    <firebot-radio label="Unchanged" model="effect.icon.mode" value="'unchanged'" />
                    <firebot-radio label="Change to" model="effect.icon.mode" value="'change'" />
                </firebot-radio-container>
            </div>
            <div class="control-fb-inline update-action-button-input-container">
                <input
                    maxlength="2"
                    type="text"
                    class="form-control"
                    ng-model="effect.icon.value"
                    icon-picker
                    placeholder="Select icon"
                    ng-disabled="effect.icon.mode === 'unchanged'"
                />
            </div>
        </eos-container>

        <eos-container header="Background Color">
            <div class="control-fb-inline">
                <firebot-radio-container>
                    <firebot-radio label="Unchanged" model="effect.backgroundColor.mode" value="'unchanged'" />
                    <firebot-radio label="Change to" model="effect.backgroundColor.mode" value="'change'" />
                </firebot-radio-container>
            </div>
            <div class="control-fb-inline update-action-button-input-container">
                <div class="input-group settings-buttontext color-picker-group-wrapper">
                    <span class="input-group-addon">Background Color</span>
                    <color-picker
                        ng-model="effect.backgroundColor.value"
                        options="backgroundColorOptions"
                        event-api="backgroundColorEvents"
                        api="backgroundColorApi"
                    ></color-picker>
                </div>
            </div>
        </eos-container>

        <eos-container header="Foreground Color">
            <div class="control-fb-inline">
                <firebot-radio-container>
                    <firebot-radio label="Unchanged" model="effect.foregroundColor.mode" value="'unchanged'" />
                    <firebot-radio label="Change to" model="effect.foregroundColor.mode" value="'change'" />
                </firebot-radio-container>
            </div>
            <div class="control-fb-inline update-action-button-input-container">
                <div class="input-group settings-buttontext color-picker-group-wrapper">
                    <span class="input-group-addon">Foreground Color</span>
                    <color-picker
                        ng-model="effect.foregroundColor.value"
                        options="foregroundColorOptions"
                        event-api="foregroundColorEvents"
                        api="foregroundColorApi"
                    ></color-picker>
                </div>
            </div>
        </eos-container>

        <eos-container header="On Click Behavior">
            <div class="control-fb-inline">
                <firebot-radio-container>
                    <firebot-radio label="Unchanged" model="effect.onClick.mode" value="'unchanged'" />
                    <firebot-radio label="Change to" model="effect.onClick.mode" value="'change'" />
                </firebot-radio-container>
            </div>
            <div class="control-fb-inline update-action-button-input-container" ng-class="{'update-action-button-disabled': effect.onClick.mode === 'unchanged'}">
                <firebot-dropdown
                    options="onClickOptions"
                    ng-model="effect.onClick.value"
                    placeholder="Select action"
                    option-toggling="false"
                    is-disabled="effect.onClick.mode === 'unchanged'"
                />
            </div>
        </eos-container>
    `,
    optionsController: ($scope: any) => {
        $scope.effect = $scope.effect || ({} as EffectModel);

        // Initialize button ID
        $scope.effect.buttonId = $scope.effect.buttonId || '';

        // Initialize each property with default mode and value
        $scope.effect.buttonName = $scope.effect.buttonName || { mode: 'unchanged', value: '' };
        $scope.effect.icon = $scope.effect.icon || { mode: 'unchanged', value: '' };
        $scope.effect.backgroundColor = $scope.effect.backgroundColor || { mode: 'unchanged', value: '#FF6B6BFF' };
        $scope.effect.foregroundColor = $scope.effect.foregroundColor || { mode: 'unchanged', value: '#FFFFFFFF' };
        $scope.effect.onClick = $scope.effect.onClick || { mode: 'unchanged', value: 'noVisibilityChanges' };

        const buildColorPickerOptions = () => ({
            swatchBootstrap: true,
            required: true,
            inputClass: 'form-control',
            allowEmpty: false,
            format: 'hexString',
            placeholder: '#ffffff',
            case: 'lower',
            alpha: false,
            clear: {
                show: true,
                label: 'Clear',
                class: 'btn btn-danger clear-btn-width'
            },
            disabled: false
        });

        const setColorPickerDisabled = (options: any, mode: 'unchanged' | 'change', api: any) => {
            options.disabled = mode === 'unchanged';
            if (options.disabled) {
                api?.close?.();
            }
        };

        const buildColorPickerEvents = (property: PropertyUpdate<string>) => ({
            onChange: (_: any, color: string) => {
                if (color == null || color.trim() === '') {
                    property.value = null as any;
                }
            }
        });

        $scope.backgroundColorOptions = buildColorPickerOptions();
        $scope.foregroundColorOptions = buildColorPickerOptions();
        $scope.backgroundColorApi = {};
        $scope.foregroundColorApi = {};
        $scope.backgroundColorEvents = buildColorPickerEvents($scope.effect.backgroundColor);
        $scope.foregroundColorEvents = buildColorPickerEvents($scope.effect.foregroundColor);

        setColorPickerDisabled($scope.backgroundColorOptions, $scope.effect.backgroundColor.mode, $scope.backgroundColorApi);
        setColorPickerDisabled($scope.foregroundColorOptions, $scope.effect.foregroundColor.mode, $scope.foregroundColorApi);

        $scope.$watch('effect.backgroundColor.mode', (mode: 'unchanged' | 'change') => {
            setColorPickerDisabled($scope.backgroundColorOptions, mode, $scope.backgroundColorApi);
        });

        $scope.$watch('effect.foregroundColor.mode', (mode: 'unchanged' | 'change') => {
            setColorPickerDisabled($scope.foregroundColorOptions, mode, $scope.foregroundColorApi);
        });

        // Define dropdown options for onClick behavior
        $scope.onClickOptions = [
            { name: 'No visibility changes', value: 'noVisibilityChanges' },
            { name: 'Hide button', value: 'hideButton' },
            { name: 'Hide panel', value: 'hidePanel' }
        ];
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];

        if (!effect.buttonId || effect.buttonId.trim() === '') {
            errors.push('Button ID is required');
        }

        // Check if at least one property is set to 'change'
        const hasChanges =
            effect.buttonName.mode === 'change' ||
            effect.icon.mode === 'change' ||
            effect.backgroundColor.mode === 'change' ||
            effect.foregroundColor.mode === 'change' ||
            effect.onClick.mode === 'change';

        if (!hasChanges) {
            errors.push('At least one property must be changed');
        }

        return errors;
    },
    onTriggerEvent: async (event) => {
        const effect = event.effect;
        const { buttonId } = effect;

        if (!buttonId) {
            logger.error('Button ID is required');
            return {
                success: false,
                execution: {
                    stop: false,
                    bubbleStop: false
                }
            };
        }

        try {
            logger.debug(`Triggered update-action-button: buttonId=${buttonId}`);

            // Collect only properties set to 'change' mode
            const updates: Record<string, any> = {};

            if (effect.buttonName.mode === 'change') {
                updates.buttonName = effect.buttonName.value;
            }
            if (effect.icon.mode === 'change') {
                updates.icon = effect.icon.value;
            }
            if (effect.backgroundColor.mode === 'change') {
                updates.backgroundColor = effect.backgroundColor.value;
            }
            if (effect.foregroundColor.mode === 'change') {
                updates.foregroundColor = effect.foregroundColor.value;
            }
            if (effect.onClick.mode === 'change') {
                updates.onClick = effect.onClick.value;
            }

            logger.debug(`Applying updates to button ${buttonId}: ${JSON.stringify(updates)}`);

            // Call action button manager directly
            const success = actionButtonManager.updateButtonProperties(buttonId, updates);

            if (!success) {
                logger.error(`Failed to update button ${buttonId}`);
                return {
                    success: false,
                    execution: {
                        stop: false,
                        bubbleStop: false
                    }
                };
            }

            logger.info(`Successfully updated button ${buttonId}`);
            return {
                success: true,
                execution: {
                    stop: false,
                    bubbleStop: false
                }
            };
        } catch (error) {
            logger.error(`Failed to update button: ${error}`);
            return {
                success: false,
                execution: {
                    stop: false,
                    bubbleStop: false
                }
            };
        }
    }
};
