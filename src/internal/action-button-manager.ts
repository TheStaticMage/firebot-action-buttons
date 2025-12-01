import { Trigger } from '@crowbartools/firebot-custom-scripts-types/types/triggers';
import { randomUUID } from 'crypto';
import { firebot, logger } from '../main';
import {
    ActionButtonConfig,
    ActionButtonDefinition,
    ActionButtonDisplay,
    OnClickVisibility
} from './action-button-types';

export class ActionButtonManager {
    private buttonStore: Map<string, ActionButtonConfig> = new Map<string, ActionButtonConfig>();
    private panelButtons: Map<string, ActionButtonDisplay[]> = new Map<string, ActionButtonDisplay[]>();

    registerButton(uuid: string, config: ActionButtonConfig): void {
        logger.debug(`Registering button ${uuid} for panel ${config.panelId}`);
        this.buttonStore.set(uuid, config);
    }

    processActionButtons(
        definitions: ActionButtonDefinition[],
        panelId: string,
        trigger: any
    ): ActionButtonDisplay[] {
        logger.debug(`Processing ${definitions.length} action buttons for panel ${panelId}`);

        const displayButtons: ActionButtonDisplay[] = [];
        const timestamp = Date.now();

        for (const definition of definitions) {
            const uuid = this.generateUuid();

            // Parse extraMetadata if it's a JSON string
            let parsedMetadata: Record<string, any> | undefined;
            if (definition.extraMetadata) {
                try {
                    parsedMetadata = JSON.parse(definition.extraMetadata);
                } catch (error) {
                    logger.warn(`Failed to parse extraMetadata for button "${definition.name}": ${error}`);
                    parsedMetadata = undefined;
                }
            }

            // Deep copy effect list and assign new UUID
            const effectListCopy = JSON.parse(JSON.stringify(definition.effectList));
            if (effectListCopy && effectListCopy.id) {
                effectListCopy.id = uuid;
            }

            // Register button config
            const config: ActionButtonConfig = {
                uuid,
                panelId,
                buttonName: definition.name,
                onClick: definition.onClick,
                effectList: effectListCopy,
                trigger,
                timestamp,
                extraMetadata: parsedMetadata
            };
            this.registerButton(uuid, config);

            // Create display button
            const displayButton: ActionButtonDisplay = {
                uuid,
                name: definition.name,
                backgroundColor: definition.backgroundColor,
                foregroundColor: definition.foregroundColor,
                icon: definition.icon,
                alignment: definition.alignment,
                onClick: definition.onClick,
                hidden: false
            };
            displayButtons.push(displayButton);
        }

        // Store buttons for later retrieval by panel ID
        const existingButtons = this.panelButtons.get(panelId) || [];
        this.panelButtons.set(panelId, existingButtons.concat(displayButtons));
        return displayButtons;
    }

    getPanelButtons(panelId: string): ActionButtonDisplay[] {
        const buttons = this.panelButtons.get(panelId) || [];
        return buttons;
    }

    getButtonInfoByPanelId(panelId: string): Record<string, any> {
        const displayButtons = this.panelButtons.get(panelId) || [];
        const buttonInfo: Record<string, any> = {};

        for (const displayButton of displayButtons) {
            const config = this.buttonStore.get(displayButton.uuid);
            if (config) {
                // Count effects - effectList structure varies, try multiple approaches
                let effectCount = 0;
                if (Array.isArray(config.effectList)) {
                    effectCount = config.effectList.length;
                } else if (config.effectList && typeof config.effectList === 'object') {
                    // Try accessing effects property if it exists
                    const effects = (config.effectList as any).effects;
                    effectCount = Array.isArray(effects) ? effects.length : 0;
                }

                buttonInfo[displayButton.uuid] = {
                    uuid: displayButton.uuid,
                    name: displayButton.name,
                    icon: displayButton.icon,
                    backgroundColor: displayButton.backgroundColor,
                    foregroundColor: displayButton.foregroundColor,
                    alignment: displayButton.alignment,
                    onClick: displayButton.onClick,
                    extraMetadata: config.extraMetadata,
                    effectCount
                };
            }
        }

        return buttonInfo;
    }

    getButtonInfo(buttonId: string): Record<string, any> {
        const config = this.buttonStore.get(buttonId);
        if (!config) {
            return {};
        }

        const displayButtons = this.panelButtons.get(config.panelId) || [];
        const displayButton = displayButtons.find(b => b.uuid === buttonId);
        if (!displayButton) {
            return {};
        }

        let effectCount = 0;
        if (Array.isArray(config.effectList)) {
            effectCount = config.effectList.length;
        } else if (config.effectList && typeof config.effectList === 'object') {
            const effects = (config.effectList as any).effects;
            effectCount = Array.isArray(effects) ? effects.length : 0;
        }

        return {
            uuid: displayButton.uuid,
            name: displayButton.name,
            icon: displayButton.icon,
            backgroundColor: displayButton.backgroundColor,
            foregroundColor: displayButton.foregroundColor,
            alignment: displayButton.alignment,
            onClick: displayButton.onClick,
            extraMetadata: config.extraMetadata,
            effectCount
        };
    }

    private hidePanel(panelId: string): void {
        logger.debug(`Hiding panel ${panelId}`);

        const { customChatPanelManager } = firebot.modules;
        if (!customChatPanelManager) {
            logger.error('customChatPanelManager is not available');
            return;
        }
        customChatPanelManager.updatePanel({
            panelId,
            updates: {
                hidden: true
            }
        });
    }

    public getButtonVisibility(uuid: string): boolean | null {
        const config = this.buttonStore.get(uuid);
        if (!config) {
            logger.warn(`Button ${uuid} not found in buttonStore`);
            return null;
        }

        const buttons = this.panelButtons.get(config.panelId);
        if (!buttons) {
            return null;
        }

        const button = buttons.find(b => b.uuid === uuid);
        if (!button) {
            return null;
        }

        return !button.hidden;
    }

    public setButtonVisibility(uuid: string, visible: boolean, autoPanelToggle: boolean): void {
        const config = this.buttonStore.get(uuid);
        if (!config) {
            logger.warn(`Button ${uuid} not found in buttonStore`);
            return;
        }

        const panelId = config.panelId;
        const buttons = this.panelButtons.get(panelId);
        if (!buttons) {
            logger.warn(`Panel ${panelId} not found for button ${uuid}`);
            return;
        }

        const button = buttons.find(b => b.uuid === uuid);
        if (!button) {
            logger.warn(`Button ${uuid} not found in panel ${panelId}`);
            return;
        }

        logger.debug(`Setting button ${uuid} visibility to ${visible}`);
        button.hidden = !visible;

        if (autoPanelToggle) {
            if (visible) {
                // Showing a button: if panel is hidden, show it
                this.getPanelVisibility(panelId).then((isPanelVisible) => {
                    if (!isPanelVisible) {
                        logger.debug(`Auto-showing panel ${panelId} because button is being shown`);
                        this.setPanelVisibility(panelId, true);
                    }
                }).catch((error) => {
                    logger.error(`Failed to check panel visibility for auto-toggle: ${error}`);
                });
            } else {
                // Hiding a button: if all buttons are now hidden, hide the panel
                const allHidden = buttons.every(b => b.hidden === true);
                if (allHidden) {
                    logger.debug(`Auto-hiding panel ${panelId} because all buttons are now hidden`);
                    this.setPanelVisibility(panelId, false);
                }
            }
        }

        // Notify frontend to update panel
        logger.debug(`Notifying frontend to update panel ${panelId}`);

        const { frontendCommunicator } = firebot.modules;
        frontendCommunicator.send('action-buttons:panel-updated', panelId);
    }

    public async getPanelVisibility(panelId: string): Promise<boolean> {
        const { customChatPanelManager } = firebot.modules;

        if (!customChatPanelManager) {
            logger.error('customChatPanelManager is not available');
            return false;
        }

        try {
            const panel = await customChatPanelManager.getPanel(panelId);
            if (!panel) {
                // Panel doesn't exist, consider it not visible
                return false;
            }
            // Return true if not hidden (visible)
            return !panel.hidden;
        } catch (error) {
            logger.error(`Failed to get panel visibility for ${panelId}: ${error}`);
            return true; // Assume visible on error
        }
    }

    public setPanelVisibility(panelId: string, visible: boolean): void {
        logger.debug(`Setting panel ${panelId} visibility to ${visible}`);

        const { customChatPanelManager } = firebot.modules;
        if (!customChatPanelManager) {
            logger.error('customChatPanelManager is not available');
            return;
        }
        customChatPanelManager.updatePanel({
            panelId,
            updates: {
                hidden: !visible
            }
        });
    }

    async clickButton(uuid: string): Promise<void> {
        const config = this.buttonStore.get(uuid);
        if (!config) {
            logger.warn(`Button ${uuid} not found in buttonStore`);
            return;
        }

        logger.info(`Action button clicked: ${config.buttonName}`);

        // Get existing stack from trigger metadata, or create new one
        const existingStack = config.trigger?.metadata?.actionButton?.stack || [];

        // Prevent infinite loop: if stack depth exceeds 100, abort execution
        if (existingStack.length >= 100) {
            logger.error(`Action button click aborted: stack depth limit (100) exceeded for button ${config.buttonName}. This likely indicates an infinite loop.`);
            return;
        }

        // Create new stack entry
        const newStackEntry = {
            buttonId: config.uuid,
            panelId: config.panelId,
            buttonName: config.buttonName
        };

        // Construct trigger for effect execution - preserve original trigger
        // type and metadata but hydrate with action button info
        const trigger: Trigger = {
            type: config.trigger?.type || 'action_button',
            metadata: {
                ...(config.trigger?.metadata || { username: 'Unknown' }),
                actionButton: {
                    timestamp: config.timestamp,
                    extraMetadata: config.extraMetadata,
                    stack: [newStackEntry, ...existingStack]
                }
            }
        };

        const { effectRunner, frontendCommunicator } = firebot.modules;

        // Handle visibility changes based on onClick setting
        if (config.onClick === 'hideButton') {
            const buttons = this.panelButtons.get(config.panelId);
            if (buttons) {
                const button = buttons.find(b => b.uuid === uuid);
                if (button) {
                    button.hidden = true;
                    // Check if all buttons are now hidden
                    const allHidden = buttons.every(b => b.hidden === true);
                    if (allHidden) {
                        this.hidePanel(config.panelId);
                    } else if (frontendCommunicator) {
                        logger.debug(`Notifying frontend to update panel ${config.panelId}`);
                        frontendCommunicator.send('action-buttons:panel-updated', config.panelId);
                    }
                }
            }
        } else if (config.onClick === 'hidePanel') {
            this.hidePanel(config.panelId);
        }

        // Execute the effect list with proper structure
        try {
            await effectRunner.processEffects({
                trigger,
                effects: config.effectList
            });
        } catch (error) {
            logger.error(`Failed to execute effects for button ${uuid}: ${error}`);
        }

        // Done
        logger.info(`Action finished processing: ${config.buttonName}`);
    }

    removeButton(uuid: string): void {
        logger.debug(`Removing button ${uuid}`);
        this.buttonStore.delete(uuid);
    }

    removePanel(panelId: string): void {
        const buttonsToRemove: string[] = [];

        for (const [uuid, config] of this.buttonStore.entries()) {
            if (config.panelId === panelId) {
                buttonsToRemove.push(uuid);
            }
        }

        for (const uuid of buttonsToRemove) {
            this.buttonStore.delete(uuid);
        }

        logger.debug(`Removed ${buttonsToRemove.length} buttons for panel ${panelId}`);
    }

    public updateButtonProperties(
        uuid: string,
        updates: {
            buttonName?: string;
            icon?: string;
            backgroundColor?: string;
            foregroundColor?: string;
            onClick?: OnClickVisibility;
        }
    ): boolean {
        const config = this.buttonStore.get(uuid);
        if (!config) {
            logger.warn(`Button ${uuid} not found in buttonStore`);
            return false;
        }

        const panelId = config.panelId;
        const buttons = this.panelButtons.get(panelId);
        if (!buttons) {
            logger.warn(`Panel ${panelId} not found for button ${uuid}`);
            return false;
        }

        const button = buttons.find(b => b.uuid === uuid);
        if (!button) {
            logger.warn(`Button ${uuid} not found in panel ${panelId}`);
            return false;
        }

        // Apply updates to both display button and config
        if (updates.buttonName !== undefined) {
            button.name = updates.buttonName;
            config.buttonName = updates.buttonName;
        }
        if (updates.icon !== undefined) {
            button.icon = updates.icon;
        }
        if (updates.backgroundColor !== undefined) {
            button.backgroundColor = updates.backgroundColor;
        }
        if (updates.foregroundColor !== undefined) {
            button.foregroundColor = updates.foregroundColor;
        }
        if (updates.onClick !== undefined) {
            button.onClick = updates.onClick;
            config.onClick = updates.onClick;
        }

        // Notify frontend of panel update
        const { frontendCommunicator } = firebot.modules;
        frontendCommunicator.send('action-buttons:panel-updated', panelId);

        logger.debug(`Updated button ${uuid} properties`);
        return true;
    }

    setupListeners(): void {
        const { frontendCommunicator } = firebot.modules;

        frontendCommunicator.on('action-buttons:generate-uuid', () => {
            logger.debug("Generating UUID for action button");
            return this.generateUuid();
        });

        frontendCommunicator.onAsync('action-button:click', async (uuid: string) => {
            logger.debug(`Received click event for button ${uuid}`);
            await this.clickButton(uuid);
            return { success: true };
        });

        frontendCommunicator.on('action-buttons:get-panel-buttons', (panelId: string) => {
            logger.debug(`Received request for buttons for panel ${panelId}`);
            return this.getPanelButtons(panelId);
        });

        frontendCommunicator.onAsync('action-buttons:update-button-properties',
            async (data: { uuid: string; updates: Record<string, any> }) => {
                logger.debug(`Received request to update button ${data.uuid}`);
                const success = this.updateButtonProperties(data.uuid, data.updates);
                return { success };
            }
        );

        logger.debug("Action button listeners set up successfully");
    }

    private generateUuid(): string {
        return randomUUID();
    }
}

export const actionButtonManager = new ActionButtonManager();
