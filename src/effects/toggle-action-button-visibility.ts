import { Firebot } from '@crowbartools/firebot-custom-scripts-types';
import { logger } from '../main';
import { actionButtonManager } from '../internal/action-button-manager';

interface EffectModel {
    mode: 'hide' | 'show' | 'toggle';
    buttonId: string;
    autoPanelToggle: boolean;
}

export const toggleActionButtonVisibilityEffect: Firebot.EffectType<EffectModel> = {
    definition: {
        id: 'action-buttons:toggle-action-button-visibility',
        name: 'Toggle Action Button Visibility',
        description: 'Show or hide an action button',
        icon: 'far fa-eye',
        categories: ['chat based']
    },
    optionsTemplate: `
        <eos-container header="Visibility Mode">
            <div class="control-fb-inline">
                <firebot-radio-container>
                    <firebot-radio label="Show" model="effect.mode" value="'show'" />
                    <firebot-radio label="Hide" model="effect.mode" value="'hide'" />
                    <firebot-radio label="Toggle" model="effect.mode" value="'toggle'" />
                </firebot-radio-container>
            </div>
        </eos-container>

        <eos-container header="Button">
            <div class="control-fb-inline" style="margin-bottom: 15px;">
                <label class="control-fb-label">Button ID</label>
                <firebot-input model="effect.buttonId" placeholder-text="Enter button ID (UUID)"></firebot-input>
            </div>
        </eos-container>

        <eos-container header="Options">
            <div class="control-fb-inline">
                <label class="control-fb-label" style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" ng-model="effect.autoPanelToggle" />
                    Auto-hide/show panel
                </label>
                <p class="muted" ng-show="effect.mode === 'hide'">When hiding a button, automatically hide the panel if all buttons are hidden.</p>
                <p class="muted" ng-show="effect.mode === 'show'">When showing a button, automatically show the panel if it is hidden.</p>
                <p class="muted" ng-show="effect.mode === 'toggle'">Automatically adjust panel visibility when toggling button state.</p>
            </div>
        </eos-container>
    `,
    optionsController: ($scope: any) => {
        $scope.effect = $scope.effect || ({} as EffectModel);
        $scope.effect.mode = $scope.effect.mode || 'show';
        $scope.effect.buttonId = $scope.effect.buttonId || '';
        $scope.effect.autoPanelToggle = $scope.effect.autoPanelToggle !== undefined ? $scope.effect.autoPanelToggle : true;
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];

        if (!effect.buttonId || effect.buttonId.trim() === '') {
            errors.push('Button ID is required');
        }

        return errors;
    },
    onTriggerEvent: async (event) => {
        const effect = event.effect;
        const { buttonId, mode, autoPanelToggle } = effect;

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
            logger.debug(`Triggered toggle-action-button-visibility: mode=${mode}, buttonId=${buttonId}, autoPanelToggle=${autoPanelToggle}`);

            let visible: boolean;

            if (mode === 'toggle') {
                const currentVisibility = actionButtonManager.getButtonVisibility(buttonId);
                if (currentVisibility === null) {
                    logger.error(`Cannot toggle button ${buttonId}: button not found`);
                    return {
                        success: false,
                        execution: {
                            stop: false,
                            bubbleStop: false
                        }
                    };
                }
                visible = !currentVisibility;
                logger.debug(`Toggling button ${buttonId} from ${currentVisibility} to ${visible}`);
            } else {
                visible = mode === 'show';
            }

            actionButtonManager.setButtonVisibility(buttonId, visible, autoPanelToggle);

            logger.info(`Successfully toggled button ${buttonId} to ${visible ? 'visible' : 'hidden'}`);

            return {
                success: true,
                execution: {
                    stop: false,
                    bubbleStop: false
                }
            };
        } catch (error) {
            logger.error(`Failed to toggle button visibility: ${error}`);
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
