import { randomUUID } from 'crypto';
import { firebot, logger } from '../main';

export type CustomChatPanelPosition = 'append' | 'prepend' | { afterMessageId: string } | { beforeMessageId: string };

export interface InjectChatPanelData {
    componentName: string;
    componentData?: unknown;
    position?: CustomChatPanelPosition;
    panelId?: string;
    hidden?: boolean;
}

export interface UpdateChatPanelData {
    panelId: string;
    updates: {
        hidden?: boolean;
        componentData?: unknown;
    };
}

export interface ChatPanelData {
    id: string;
    type: string;
    hidden?: boolean;
    componentName: string;
    componentData?: unknown;
}

class CustomChatPanelManager {
    private getFrontendCommunicator() {
        const communicator = firebot?.modules?.frontendCommunicator;
        if (!communicator) {
            logger.error('frontendCommunicator is not available');
            return null;
        }
        return communicator;
    }

    injectPanel(data: InjectChatPanelData): void {
        if (!data.componentName) {
            logger.warn('Cannot inject chat panel: componentName is required');
            return;
        }

        const frontendCommunicator = this.getFrontendCommunicator();
        if (!frontendCommunicator) {
            return;
        }

        const panelId = data.panelId || randomUUID();

        const payload = {
            fbEvent: 'InjectCustomPanel',
            componentName: data.componentName,
            componentData: data.componentData,
            position: data.position || 'append',
            panelId,
            hidden: data.hidden
        };

        logger.debug(`Injecting custom chat panel ${panelId}`);
        frontendCommunicator.send('chatUpdate', payload);
    }

    updatePanel(data: UpdateChatPanelData): void {
        if (!data.panelId) {
            logger.warn('Cannot update chat panel: panelId is required');
            return;
        }

        if (!data.updates || (data.updates.hidden === undefined && data.updates.componentData === undefined)) {
            logger.warn('Cannot update chat panel: no updates provided');
            return;
        }

        const frontendCommunicator = this.getFrontendCommunicator();
        if (!frontendCommunicator) {
            return;
        }

        const payload = {
            fbEvent: 'UpdateCustomPanel',
            panelId: data.panelId,
            updates: data.updates
        };

        logger.debug(`Updating custom chat panel ${data.panelId}`);
        frontendCommunicator.send('chatUpdate', payload);
    }

    removePanel(panelId: string): void {
        if (!panelId) {
            logger.warn('Cannot remove chat panel: panelId is required');
            return;
        }

        const frontendCommunicator = this.getFrontendCommunicator();
        if (!frontendCommunicator) {
            return;
        }

        logger.debug(`Removing custom chat panel ${panelId}`);
        frontendCommunicator.send('chatUpdate', {
            fbEvent: 'RemoveCustomPanel',
            panelId
        });
    }

    async getPanel(panelId: string): Promise<ChatPanelData | null> {
        if (!panelId) {
            logger.warn('Cannot get chat panel: panelId is required');
            return null;
        }

        const frontendCommunicator = this.getFrontendCommunicator();
        if (!frontendCommunicator) {
            return null;
        }

        logger.debug(`Getting custom chat panel ${panelId}`);
        return await frontendCommunicator.fireEventAsync('firebot:get-chat-panel', panelId);
    }
}

export const customChatPanelManager = new CustomChatPanelManager();
