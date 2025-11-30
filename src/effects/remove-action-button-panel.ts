import { Firebot } from '@crowbartools/firebot-custom-scripts-types';
import { logger, customChatPanelManager } from '../main';
import { actionButtonManager } from '../internal/action-button-manager';

interface EffectModel {
    panelId: string;
}

export const removeActionButtonPanelEffect: Firebot.EffectType<EffectModel> = {
    definition: {
        id: 'action-buttons:remove-action-button-panel',
        name: 'Remove Action Button Panel',
        description: 'Removes an action button panel from the chat feed',
        icon: 'far fa-backspace',
        categories: ['chat based']
    },
    optionsTemplate: `
        <eos-container header="Remove Action Button Panel">
            <div class="control-fb-inline">
                <label class="control-fb-label">Panel ID</label>
                <firebot-input ng-model="effect.panelId" placeholder="Enter panel ID to remove"></firebot-input>
            </div>
        </eos-container>
    `,
    optionsValidator: (effect) => {
        const errors: string[] = [];

        if (!effect.panelId || effect.panelId.trim() === '') {
            errors.push('Panel ID is required');
        }

        return errors;
    },
    onTriggerEvent: async (event) => {
        const effect = event.effect;
        const { panelId } = effect;

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
            logger.debug('Triggered action-buttons:remove-action-button-panel');

            // Remove panel via customChatPanelManager
            customChatPanelManager.removePanel(panelId);

            // Clean up button configs
            actionButtonManager.removePanel(panelId);

            logger.info(`Successfully removed action button panel ${panelId}`);

            return {
                success: true,
                execution: {
                    stop: false,
                    bubbleStop: false
                }
            };
        } catch (error) {
            logger.error(`Failed to remove action button panel: ${error}`);
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
