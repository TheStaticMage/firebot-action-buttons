import { Firebot } from '@crowbartools/firebot-custom-scripts-types';
import { EffectScope } from '@crowbartools/firebot-custom-scripts-types/types/effects';
import { CustomChatPanelPosition, InjectChatPanelData } from '@crowbartools/firebot-custom-scripts-types/types/modules/custom-chat-panel-manager';
import { randomUUID } from 'crypto';
import { actionButtonManager } from '../internal/action-button-manager';
import { ActionButtonDefinition } from '../internal/action-button-types';
import { firebot, logger } from '../main';

interface EffectModel {
    positionType: 'append' | 'prepend' | 'afterMessage' | 'beforeMessage' | 'triggerMessage';
    messageId?: string;
    actionButtons: ActionButtonDefinition[];
    showMessage?: boolean;
    messageText?: string;
    messageIcon?: string;
    backgroundColorType?: 'default' | 'custom';
    backgroundColor?: string;
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
            },
            {
                label: 'Button IDs',
                description: 'Array of button IDs in the order they were specified',
                defaultName: 'buttonIds'
            }
        ]
    },
    optionsTemplate: `
        <eos-container header="Panel Positioning">
            <div class="control-fb-inline">
                <firebot-radio-container>
                    <firebot-radio label="Append to end of chat feed" model="effect.positionType" value="'append'" />
                    <firebot-radio label="Prepend to start of chat feed" model="effect.positionType" value="'prepend'" />
                    <firebot-radio label="Insert after trigger message" model="effect.positionType" value="'triggerMessage'" />
                    <firebot-radio label="Insert after specific message" model="effect.positionType" value="'afterMessage'" />
                    <firebot-radio label="Insert before specific message" model="effect.positionType" value="'beforeMessage'" />
                </firebot-radio-container>
            </div>

            <div class="control-fb-inline" ng-show="effect.positionType === 'afterMessage' || effect.positionType === 'beforeMessage'">
                <h4 class="control-fb-label">Message ID</h4>
                <firebot-input model="effect.messageId" placeholder="Enter the message ID"></firebot-input>
            </div>
        </eos-container>

        <eos-container header="Optional Message" pad-top="true">
            <div class="control-fb-inline">
                <firebot-radio-container>
                    <firebot-radio label="No message" model="effect.showMessage" value="false" />
                    <firebot-radio label="Show message" model="effect.showMessage" value="true" />
                </firebot-radio-container>
            </div>

            <div ng-show="effect.showMessage">
                <div class="control-fb-inline" style="margin-top: 15px;">
                    <h4 class="control-fb-label">Message Text (optional)</h4>
                    <firebot-input
                        model="effect.messageText"
                        use-text-area="true"
                        placeholder-text="Enter message (supports markdown)"
                        rows="3"
                        menu-position="under"
                    />
                </div>

                <div class="control-fb-inline" style="margin-top: 15px;">
                    <h4 class="control-fb-label">Icon (optional)</h4>
                    <input
                        maxlength="2"
                        type="text"
                        class="form-control"
                        ng-model="effect.messageIcon"
                        icon-picker
                    />
                </div>
            </div>
        </eos-container>

        <eos-container header="Background Color" pad-top="true">
            <div class="control-fb-inline">
                <firebot-radio-container>
                    <firebot-radio label="Default (Firebot assigned)" model="effect.backgroundColorType" value="'default'" />
                    <firebot-radio label="Custom" model="effect.backgroundColorType" value="'custom'" />
                </firebot-radio-container>
            </div>

            <div class="control-fb-inline" style="margin-top: 15px;" ng-show="effect.backgroundColorType === 'custom'">
                <color-picker-input
                    model="effect.backgroundColor"
                    label="Panel Background Color"
                ></color-picker-input>
            </div>
        </eos-container>

        <action-buttons-editor buttons="effect.actionButtons" trigger="{{trigger}}"></action-buttons-editor>
    `,
    optionsController: ($scope: EffectScope<EffectModel>) => {
        $scope.effect = $scope.effect || ({} as EffectModel);
        $scope.effect.positionType = $scope.effect.positionType || 'append';
        $scope.effect.actionButtons = $scope.effect.actionButtons || [];
        $scope.effect.messageId = $scope.effect.messageId || '';
        $scope.effect.showMessage = $scope.effect.showMessage ?? false;
        $scope.effect.messageText = $scope.effect.messageText || '';
        $scope.effect.messageIcon = $scope.effect.messageIcon || '';
        $scope.effect.backgroundColorType = $scope.effect.backgroundColorType || 'default';
        $scope.effect.backgroundColor = $scope.effect.backgroundColor || '#2c3e50';
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];

        if ((effect.positionType === 'afterMessage' || effect.positionType === 'beforeMessage') && (!effect.messageId || effect.messageId.trim() === '')) {
            errors.push('Message ID is required when position is after or before a specific message');
        }

        if (effect.showMessage) {
            const hasText = effect.messageText && effect.messageText.trim() !== '';
            const hasIcon = effect.messageIcon && effect.messageIcon.trim() !== '';
            if (!hasText && !hasIcon) {
                errors.push('When message is enabled, you must provide either message text or an icon (or both)');
            }
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
                event.trigger,
                event.outputs
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
            } else if (effect.positionType === 'triggerMessage') {
                const metadata = event.trigger.metadata as Record<string, any>;
                const triggerMessageId = (metadata?.chatMessage?.id as string) ?? (metadata?.eventData?.chatMessage?.id as string);
                if (triggerMessageId) {
                    position = { afterMessageId: triggerMessageId };
                    logger.debug(`Using trigger message ID: ${triggerMessageId}`);
                } else {
                    logger.debug('No trigger message ID found, defaulting to append');
                }
            } else if (effect.positionType === 'afterMessage' && effect.messageId) {
                position = { afterMessageId: effect.messageId };
            } else if (effect.positionType === 'beforeMessage' && effect.messageId) {
                position = { beforeMessageId: effect.messageId };
            }
            logger.debug(`Using position: ${typeof position === 'string' ? position : JSON.stringify(position)}`);

            const injectData: InjectChatPanelData = {
                componentName: 'action-buttons-panel',
                componentData: {
                    panelId,
                    hasMessage: effect.showMessage || false,
                    messageText: effect.showMessage ? effect.messageText : undefined,
                    messageIcon: effect.showMessage ? effect.messageIcon : undefined,
                    backgroundColor: effect.backgroundColorType === 'custom' ? effect.backgroundColor : undefined
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
                    panelId,
                    buttonIds: displayButtons.map(button => button.uuid)
                }
            };
        } catch (error) {
            logger.error(`Failed to create action button panel: ${error}`);
            return errorResponse;
        }
    }
};
