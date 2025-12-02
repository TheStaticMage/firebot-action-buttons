jest.mock('crypto', () => ({
    randomUUID: jest.fn(() => 'generated-uuid')
}));

jest.mock('../../main', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn()
    },
    firebot: {
        modules: {
            frontendCommunicator: {
                send: jest.fn(),
                fireEventAsync: jest.fn()
            }
        }
    }
}));

import { customChatPanelManager } from '../custom-chat-panel-manager';
import { firebot, logger } from '../../main';

describe('customChatPanelManager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('injects a panel with provided data', () => {
        const send = firebot.modules.frontendCommunicator.send as jest.Mock;

        customChatPanelManager.injectPanel({
            componentName: 'action-buttons',
            componentData: { sample: true },
            position: 'prepend',
            panelId: 'panel-123',
            hidden: true
        });

        expect(send).toHaveBeenCalledTimes(1);
        expect(send).toHaveBeenCalledWith('chatUpdate', {
            fbEvent: 'InjectCustomPanel',
            componentName: 'action-buttons',
            componentData: { sample: true },
            position: 'prepend',
            panelId: 'panel-123',
            hidden: true
        });
    });

    it('generates a panelId when one is not provided', () => {
        const send = firebot.modules.frontendCommunicator.send as jest.Mock;

        customChatPanelManager.injectPanel({
            componentName: 'action-buttons',
            componentData: { another: true }
        });

        expect(send).toHaveBeenCalledTimes(1);
        expect(send).toHaveBeenCalledWith('chatUpdate', expect.objectContaining({
            panelId: 'generated-uuid'
        }));
    });

    it('warns when attempting to inject without a component name', () => {
        customChatPanelManager.injectPanel({
            componentName: '',
            componentData: {}
        });

        expect(logger.warn).toHaveBeenCalled();
        const send = firebot.modules.frontendCommunicator.send as jest.Mock;
        expect(send).not.toHaveBeenCalled();
    });

    it('updates a panel when updates are provided', () => {
        const send = firebot.modules.frontendCommunicator.send as jest.Mock;

        customChatPanelManager.updatePanel({
            panelId: 'panel-abc',
            updates: {
                hidden: false,
                componentData: { updated: true }
            }
        });

        expect(send).toHaveBeenCalledTimes(1);
        expect(send).toHaveBeenCalledWith('chatUpdate', {
            fbEvent: 'UpdateCustomPanel',
            panelId: 'panel-abc',
            updates: {
                hidden: false,
                componentData: { updated: true }
            }
        });
    });

    it('warns when no updates are provided to updatePanel', () => {
        customChatPanelManager.updatePanel({
            panelId: 'panel-abc',
            updates: {}
        });

        expect(logger.warn).toHaveBeenCalled();
        const send = firebot.modules.frontendCommunicator.send as jest.Mock;
        expect(send).not.toHaveBeenCalled();
    });

    it('removes a panel by id', () => {
        const send = firebot.modules.frontendCommunicator.send as jest.Mock;

        customChatPanelManager.removePanel('panel-to-remove');

        expect(send).toHaveBeenCalledTimes(1);
        expect(send).toHaveBeenCalledWith('chatUpdate', {
            fbEvent: 'RemoveCustomPanel',
            panelId: 'panel-to-remove'
        });
    });

    it('retrieves panel data', async () => {
        const panelData = {
            id: 'panel-xyz',
            type: 'custom',
            componentName: 'action-buttons'
        };
        const fireEventAsync = firebot.modules.frontendCommunicator.fireEventAsync as jest.Mock;
        fireEventAsync.mockResolvedValue(panelData);

        const result = await customChatPanelManager.getPanel('panel-xyz');

        expect(fireEventAsync).toHaveBeenCalledWith('firebot:get-chat-panel', 'panel-xyz');
        expect(result).toEqual(panelData);
    });
});
