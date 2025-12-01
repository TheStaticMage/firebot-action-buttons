import { ActionButtonDefinition, OnClickVisibility } from '../action-button-types';

// Mock the main module
jest.mock('../../main', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn()
    },
    firebot: {
        modules: {
            customChatPanelManager: {
                getPanel: jest.fn(),
                updatePanel: jest.fn()
            },
            frontendCommunicator: {
                send: jest.fn()
            },
            effectRunner: {
                processEffects: jest.fn()
            }
        }
    }
}));

import { actionButtonManager } from '../action-button-manager';

describe('ActionButtonManager', () => {
    beforeEach(() => {
        // Clear state before each test
        const store = (actionButtonManager as any).buttonStore;
        if (store instanceof Map) {
            store.clear();
        }
        const panelButtons = (actionButtonManager as any).panelButtons;
        if (panelButtons instanceof Map) {
            panelButtons.clear();
        }
    });

    describe('processActionButtons', () => {
        it('should process action button definitions and return display buttons', () => {
            const definitions: ActionButtonDefinition[] = [
                {
                    name: 'Test Button',
                    backgroundColor: '#FF0000FF',
                    foregroundColor: '#FFFFFFFF',
                    icon: 'fas fa-star',
                    alignment: 'center',
                    onClick: 'noVisibilityChanges',
                    effectList: { list: [] }
                }
            ];

            const panelId = 'test-panel-1';
            const trigger = {};

            const displayButtons = actionButtonManager.processActionButtons(
                definitions,
                panelId,
                trigger
            );

            expect(displayButtons).toHaveLength(1);
            expect(displayButtons[0].name).toBe('Test Button');
            expect(displayButtons[0].backgroundColor).toBe('#FF0000FF');
            expect(displayButtons[0].foregroundColor).toBe('#FFFFFFFF');
            expect(displayButtons[0].icon).toBe('fas fa-star');
            expect(displayButtons[0].alignment).toBe('center');
            expect(displayButtons[0].onClick).toBe('noVisibilityChanges');
            expect(displayButtons[0].uuid).toBeDefined();
        });

        it('should parse extraMetadata as JSON', () => {
            const definitions: ActionButtonDefinition[] = [
                {
                    name: 'Test Button',
                    backgroundColor: '#FF0000FF',
                    foregroundColor: '#FFFFFFFF',
                    icon: 'fas fa-star',
                    alignment: 'center',
                    onClick: 'noVisibilityChanges',
                    effectList: { list: [] },
                    extraMetadata: '{"customKey": "customValue"}'
                }
            ];

            const panelId = 'test-panel-1';
            const trigger = {};

            const displayButtons = actionButtonManager.processActionButtons(
                definitions,
                panelId,
                trigger
            );

            expect(displayButtons).toHaveLength(1);
            const config = (actionButtonManager as any).buttonStore.get(displayButtons[0].uuid);
            expect(config.extraMetadata).toEqual({ customKey: 'customValue' });
        });

        it('should handle invalid extraMetadata JSON gracefully', () => {
            const definitions: ActionButtonDefinition[] = [
                {
                    name: 'Test Button',
                    backgroundColor: '#FF0000FF',
                    foregroundColor: '#FFFFFFFF',
                    icon: 'fas fa-star',
                    alignment: 'center',
                    onClick: 'noVisibilityChanges',
                    effectList: { list: [] },
                    extraMetadata: 'invalid json'
                }
            ];

            const panelId = 'test-panel-1';
            const trigger = {};

            const displayButtons = actionButtonManager.processActionButtons(
                definitions,
                panelId,
                trigger
            );

            expect(displayButtons).toHaveLength(1);
            const config = (actionButtonManager as any).buttonStore.get(displayButtons[0].uuid);
            expect(config.extraMetadata).toBeUndefined();
        });

        it('should append new buttons to an existing panel without removing prior buttons', () => {
            const panelId = 'test-panel-merge';

            const first = [
                {
                    name: 'First',
                    backgroundColor: '#111111',
                    foregroundColor: '#FFFFFF',
                    icon: 'fas fa-star',
                    alignment: 'left',
                    onClick: 'noVisibilityChanges',
                    effectList: { list: [] }
                }
            ];

            const second = [
                {
                    name: 'Second',
                    backgroundColor: '#222222',
                    foregroundColor: '#FFFFFF',
                    icon: 'fas fa-heart',
                    alignment: 'right',
                    onClick: 'noVisibilityChanges',
                    effectList: { list: [] }
                }
            ];

            const trigger = {};

            const firstDisplay = actionButtonManager.processActionButtons(first as any, panelId, trigger);
            const secondDisplay = actionButtonManager.processActionButtons(second as any, panelId, trigger);

            const combined = actionButtonManager.getPanelButtons(panelId);

            expect(firstDisplay).toHaveLength(1);
            expect(secondDisplay).toHaveLength(1);
            expect(combined).toHaveLength(2);
            const names = combined.map(b => b.name).sort();
            expect(names).toEqual(['First', 'Second']);
        });
    });

    describe('registerButton', () => {
        it('should register a button in the store', () => {
            const buttonConfig = {
                uuid: 'test-uuid',
                panelId: 'test-panel',
                buttonName: 'Test Button',
                onClick: 'noVisibilityChanges' as OnClickVisibility,
                effectList: { list: [] },
                trigger: {},
                timestamp: Date.now()
            };

            actionButtonManager.registerButton('test-uuid', buttonConfig);

            const store = (actionButtonManager as any).buttonStore;
            expect(store.get('test-uuid')).toEqual(buttonConfig);
        });
    });

    describe('removeButton', () => {
        it('should remove a button from the store', () => {
            const buttonConfig = {
                uuid: 'test-uuid',
                panelId: 'test-panel',
                buttonName: 'Test Button',
                onClick: 'noVisibilityChanges' as OnClickVisibility,
                effectList: { list: [] },
                trigger: {},
                timestamp: Date.now()
            };

            actionButtonManager.registerButton('test-uuid', buttonConfig);
            const store1 = (actionButtonManager as any).buttonStore;
            expect(store1.has('test-uuid')).toBe(true);

            actionButtonManager.removeButton('test-uuid');
            const store2 = (actionButtonManager as any).buttonStore;
            expect(store2.has('test-uuid')).toBe(false);
        });
    });

    describe('removePanel', () => {
        it('should remove all buttons for a specific panel', () => {
            const buttonConfig1 = {
                uuid: 'test-uuid-1',
                panelId: 'test-panel',
                buttonName: 'Test Button 1',
                onClick: 'noVisibilityChanges' as OnClickVisibility,
                effectList: { list: [] },
                trigger: {},
                timestamp: Date.now()
            };

            const buttonConfig2 = {
                uuid: 'test-uuid-2',
                panelId: 'test-panel',
                buttonName: 'Test Button 2',
                onClick: 'noVisibilityChanges' as OnClickVisibility,
                effectList: { list: [] },
                trigger: {},
                timestamp: Date.now()
            };

            const buttonConfig3 = {
                uuid: 'test-uuid-3',
                panelId: 'other-panel',
                buttonName: 'Test Button 3',
                onClick: 'noVisibilityChanges' as OnClickVisibility,
                effectList: { list: [] },
                trigger: {},
                timestamp: Date.now()
            };

            actionButtonManager.registerButton('test-uuid-1', buttonConfig1);
            actionButtonManager.registerButton('test-uuid-2', buttonConfig2);
            actionButtonManager.registerButton('test-uuid-3', buttonConfig3);

            actionButtonManager.removePanel('test-panel');

            const store = (actionButtonManager as any).buttonStore;
            expect(store.has('test-uuid-1')).toBe(false);
            expect(store.has('test-uuid-2')).toBe(false);
            expect(store.has('test-uuid-3')).toBe(true);
        });
    });

    describe('getPanelVisibility', () => {
        it('should return false for panels that do not exist', async () => {
            const visible = await actionButtonManager.getPanelVisibility('non-existent-panel');
            expect(visible).toBe(false);
        });
    });

    describe('getButtonVisibility', () => {
        it('should return null for buttons not in the store', () => {
            const visible = actionButtonManager.getButtonVisibility('non-existent-uuid');
            expect(visible).toBe(null);
        });

        it('should return current visibility state for tracked buttons', () => {
            // Create and register a button
            const definitions: ActionButtonDefinition[] = [
                {
                    name: 'Visibility Test Button',
                    backgroundColor: '#FF0000FF',
                    foregroundColor: '#FFFFFFFF',
                    icon: 'fas fa-star',
                    alignment: 'center',
                    onClick: 'noVisibilityChanges',
                    effectList: { list: [] }
                }
            ];
            const displayButtons = actionButtonManager.processActionButtons(definitions, 'test-panel', {});
            const buttonUuid = displayButtons[0].uuid;

            // Initially should be visible (not hidden)
            expect(actionButtonManager.getButtonVisibility(buttonUuid)).toBe(true);

            // Set it to hidden
            actionButtonManager.setButtonVisibility(buttonUuid, false, false);
            expect(actionButtonManager.getButtonVisibility(buttonUuid)).toBe(false);

            // Set it back to visible
            actionButtonManager.setButtonVisibility(buttonUuid, true, false);
            expect(actionButtonManager.getButtonVisibility(buttonUuid)).toBe(true);
        });
    });
});
