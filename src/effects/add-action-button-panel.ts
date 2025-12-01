import { Firebot } from '@crowbartools/firebot-custom-scripts-types';
import { EffectScope } from '@crowbartools/firebot-custom-scripts-types/types/effects';
import { CustomChatPanelPosition, InjectChatPanelData } from '@crowbartools/firebot-custom-scripts-types/types/modules/custom-chat-panel-manager';
import { randomUUID } from 'crypto';
import { actionButtonManager } from '../internal/action-button-manager';
import { ActionButtonDefinition } from '../internal/action-button-types';
import { firebot, logger } from '../main';

interface EffectModel {
    positionType: 'append' | 'prepend' | 'afterMessage' | 'beforeMessage';
    messageId?: string;
    actionButtons: ActionButtonDefinition[];
}

export const addActionButtonPanelEffect: Firebot.EffectType<EffectModel> = {
    definition: {
        id: 'action-buttons:add-action-button-panel',
        name: 'Create Action Button Panel',
        description: 'Creates a new interactive action button panel in the chat feed',
        icon: 'far fa-plus-square',
        categories: ["common", "chat based", "advanced"],
        outputs: [
            {
                label: 'Panel ID',
                description: 'The ID of the created action button panel',
                defaultName: 'panelId'
            }
        ]
    },
    optionsTemplate: `
        <eos-container header="Panel Positioning">
            <div class="control-fb-inline">
                <firebot-radio-container>
                    <firebot-radio label="Append to end of chat feed" model="effect.positionType" value="'append'" />
                    <firebot-radio label="Prepend to start of chat feed" model="effect.positionType" value="'prepend'" />
                    <firebot-radio label="Insert after specific message" model="effect.positionType" value="'afterMessage'" />
                    <firebot-radio label="Insert before specific message" model="effect.positionType" value="'beforeMessage'" />
                </firebot-radio-container>
            </div>

            <div class="control-fb-inline" ng-show="effect.positionType === 'afterMessage' || effect.positionType === 'beforeMessage'">
                <h4 class="control-fb-label">Message ID</h4>
                <firebot-input model="effect.messageId" placeholder="Enter the message ID"></firebot-input>
            </div>
        </eos-container>

        <action-buttons-editor-poc buttons="effect.actionButtons"></action-buttons-editor-poc>

        <action-buttons-editor buttons="effect.actionButtons"></action-buttons-editor>
    `,
    optionsController: ($scope: EffectScope<EffectModel>) => {
        $scope.effect = $scope.effect || ({} as EffectModel);
        $scope.effect.positionType = $scope.effect.positionType || 'append';
        $scope.effect.actionButtons = $scope.effect.actionButtons || [];
        $scope.effect.messageId = $scope.effect.messageId || '';
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];

        if ((effect.positionType === 'afterMessage' || effect.positionType === 'beforeMessage') && (!effect.messageId || effect.messageId.trim() === '')) {
            errors.push('Message ID is required when position is after or before a specific message');
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
        logger.debug('Triggered action-buttons:add-action-button-panel');

        const errorResponse = {
            success: false,
            execution: {
                stop: false,
                bubbleStop: false
            }
        };

        const effect = event.effect;
        const panelId = `action-buttons-${randomUUID()}`;
        logger.debug(`Generated new panel ID: ${panelId}`);

        try {
            const displayButtons = actionButtonManager.processActionButtons(
                effect.actionButtons,
                panelId,
                event.trigger
            );

            logger.debug(`Processed ${displayButtons.length} display buttons`);

            const { customChatPanelManager } = firebot.modules;

            if (!customChatPanelManager) {
                logger.error('customChatPanelManager is not available');
                return errorResponse;
            }

            let position: CustomChatPanelPosition = 'append';
            if (effect.positionType === 'prepend') {
                position = 'prepend';
            } else if (effect.positionType === 'afterMessage' && effect.messageId) {
                position = { afterMessageId: effect.messageId };
            } else if (effect.positionType === 'beforeMessage' && effect.messageId) {
                position = { beforeMessageId: effect.messageId };
            }
            logger.debug(`Using position: ${typeof position === 'string' ? position : JSON.stringify(position)}`);

            const injectData: InjectChatPanelData = {
                componentName: 'action-buttons-panel',
                componentData: {
                    panelId
                },
                position,
                panelId
            };

            logger.debug(`Injecting panel with panelId: ${panelId}`);
            customChatPanelManager.injectPanel(injectData);

            logger.info(`Successfully created action button panel ${panelId} with ${displayButtons.length} buttons`);

            return {
                success: true,
                outputs: {
                    panelId
                }
            };
        } catch (error) {
            logger.error(`Failed to create action button panel: ${error}`);
            return errorResponse;
        }
    }
};
