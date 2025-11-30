import { Firebot } from '@crowbartools/firebot-custom-scripts-types';
import { logger } from '../main';
import { actionButtonManager } from '../internal/action-button-manager';

interface EffectModel {
    mode: 'hide' | 'show' | 'toggle';
    panelId: string;
}

export const toggleActionButtonPanelVisibilityEffect: Firebot.EffectType<EffectModel> = {
    definition: {
        id: 'action-buttons:toggle-action-button-panel-visibility',
        name: 'Toggle Action Button Panel Visibility',
        description: 'Show or hide an action button panel',
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

        <eos-container header="Panel">
            <div class="control-fb-inline">
                <label class="control-fb-label">Panel ID</label>
                <firebot-input model="effect.panelId" placeholder-text="Enter panel ID"></firebot-input>
            </div>
        </eos-container>
    `,
    optionsController: ($scope: any) => {
        $scope.effect = $scope.effect || ({} as EffectModel);
        $scope.effect.mode = $scope.effect.mode || 'show';
        $scope.effect.panelId = $scope.effect.panelId || '';
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];

        if (!effect.panelId || effect.panelId.trim() === '') {
            errors.push('Panel ID is required');
        }

        return errors;
    },
    onTriggerEvent: async (event) => {
        const effect = event.effect;
        const { panelId, mode } = effect;

        if (!panelId) {
            logger.error('Panel ID is required');
            return {
                success: false,
                execution: {
                    stop: false,
                    bubbleStop: false
                }
            };
        }

        try {
            logger.debug(`Triggered toggle-action-button-panel-visibility: mode=${mode}, panelId=${panelId}`);

            let visible: boolean;
            if (mode === 'toggle') {
                // Get current visibility and flip it
                const currentlyVisible = await actionButtonManager.getPanelVisibility(panelId);
                visible = !currentlyVisible;
            } else {
                visible = mode === 'show';
            }

            actionButtonManager.setPanelVisibility(panelId, visible);

            logger.info(`Successfully toggled panel ${panelId} to ${visible ? 'visible' : 'hidden'}`);

            return {
                success: true,
                execution: {
                    stop: false,
                    bubbleStop: false
                }
            };
        } catch (error) {
            logger.error(`Failed to toggle panel visibility: ${error}`);
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
