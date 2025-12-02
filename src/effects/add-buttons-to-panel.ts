import { Firebot } from '@crowbartools/firebot-custom-scripts-types';
import { EffectScope } from '@crowbartools/firebot-custom-scripts-types/types/effects';
import { actionButtonManager } from '../internal/action-button-manager';
import { ActionButtonDefinition } from '../internal/action-button-types';
import { customChatPanelManager } from '../internal/custom-chat-panel-manager';
import { firebot, logger } from '../main';

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
                label: 'Button IDs',
                description: 'Array of button IDs in the order they were specified',
                defaultName: 'buttonIds'
            }
        ]
    },
    optionsTemplate: `
        <eos-container header="Target Panel">
            <div class="control-fb-inline">
                <h4 class="control-fb-label">Panel ID</h4>
                <firebot-input model="effect.panelId" placeholder="Enter panel ID (supports variables)"></firebot-input>
            </div>
        </eos-container>

        <action-buttons-editor buttons="effect.actionButtons" trigger="{{trigger}}"></action-buttons-editor>
    `,
    optionsController: ($scope: EffectScope<EffectModel>) => {
        $scope.effect = $scope.effect || ({} as EffectModel);
        $scope.effect.panelId = $scope.effect.panelId || '';
        $scope.effect.actionButtons = $scope.effect.actionButtons || [];
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
            const { frontendCommunicator } = firebot.modules;
            if (!frontendCommunicator) {
                logger.error('frontendCommunicator is not available');
                return errorResponse;
            }

            const panel = await customChatPanelManager.getPanel(panelId);
            if (!panel) {
                logger.error(`Panel ${panelId} does not exist`);
                return errorResponse;
            }

            const displayButtons = actionButtonManager.processActionButtons(
                effect.actionButtons,
                panelId,
                event.trigger,
                event.outputs
            );

            logger.debug(`Processed ${displayButtons.length} display buttons for panel ${panelId}`);

            frontendCommunicator.send('action-buttons:panel-updated', panelId);

            logger.info(`Successfully added ${displayButtons.length} buttons to panel ${panelId}`);

            return {
                success: true,
                outputs: {
                    buttonIds: displayButtons.map(button => button.uuid)
                }
            };
        } catch (error) {
            logger.error(`Failed to add buttons to panel: ${error}`);
            return errorResponse;
        }
    }
};
