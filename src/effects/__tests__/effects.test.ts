import { addActionButtonPanelEffect } from '../../effects/add-action-button-panel';
import { addButtonsToPanelEffect } from '../../effects/add-buttons-to-panel';
import { removeActionButtonPanelEffect } from '../../effects/remove-action-button-panel';
import { toggleActionButtonVisibilityEffect } from '../../effects/toggle-action-button-visibility';
import { toggleActionButtonPanelVisibilityEffect } from '../../effects/toggle-action-button-panel-visibility';

// Mock the modules
jest.mock('../../main', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn()
    },
    customChatPanelManager: {
        injectPanel: jest.fn(),
        removePanel: jest.fn()
    },
    firebot: {
        modules: {}
    }
}));

jest.mock('../../internal/action-button-manager', () => ({
    actionButtonManager: {
        processActionButtons: jest.fn(() => [
            {
                uuid: 'button-uuid-1',
                name: 'Test Button',
                backgroundColor: '#FF0000FF',
                foregroundColor: '#FFFFFFFF',
                icon: 'fas fa-star',
                alignment: 'top-center'
            }
        ]),
        removePanel: jest.fn()
    }
}));

describe('Action Button Effects', () => {
    describe('addActionButtonPanelEffect', () => {
        it('should be defined with correct properties', () => {
            expect(addActionButtonPanelEffect).toBeDefined();
            expect(addActionButtonPanelEffect.definition).toBeDefined();
            expect(addActionButtonPanelEffect.definition.id).toBe('action-buttons:add-action-button-panel');
            expect(addActionButtonPanelEffect.definition.name).toBe('Create Action Button Panel');
            expect(addActionButtonPanelEffect.optionsTemplate).toBeDefined();
        });

        it('should have optionsValidator', () => {
            expect(addActionButtonPanelEffect.optionsValidator).toBeDefined();
        });

        it('should validate actionButtons is required', () => {
            const validator = addActionButtonPanelEffect.optionsValidator;
            if (validator) {
                const errors = validator({ positionType: 'append', actionButtons: [] } as any);
                expect(Array.isArray(errors)).toBe(true);
                expect(errors.some((e: string) => e.includes('action button'))).toBe(true);
            }
        });

        it('should validate message text or icon when showMessage is true', () => {
            const validator = addActionButtonPanelEffect.optionsValidator;
            if (validator) {
                const errors = validator({
                    positionType: 'append',
                    actionButtons: [
                        {
                            name: 'Test',
                            backgroundColor: '#FF0000FF',
                            foregroundColor: '#FFFFFFFF',
                            icon: 'fas fa-star',
                            alignment: 'left',
                            onClick: 'noVisibilityChanges',
                            effectList: []
                        }
                    ],
                    showMessage: true,
                    messageText: '',
                    messageIcon: ''
                } as any);
                expect(Array.isArray(errors)).toBe(true);
                expect(errors.some((e: string) => e.includes('message'))).toBe(true);
            }
        });

        it('should pass validation with message text only', () => {
            const validator = addActionButtonPanelEffect.optionsValidator;
            if (validator) {
                const errors = validator({
                    positionType: 'append',
                    actionButtons: [
                        {
                            name: 'Test',
                            backgroundColor: '#FF0000FF',
                            foregroundColor: '#FFFFFFFF',
                            icon: 'fas fa-star',
                            alignment: 'left',
                            onClick: 'noVisibilityChanges',
                            effectList: []
                        }
                    ],
                    showMessage: true,
                    messageText: 'Test message',
                    messageIcon: ''
                } as any);
                expect(Array.isArray(errors)).toBe(true);
                expect(errors.filter((e: string) => e.includes('message')).length).toBe(0);
            }
        });

        it('should pass validation with icon only', () => {
            const validator = addActionButtonPanelEffect.optionsValidator;
            if (validator) {
                const errors = validator({
                    positionType: 'append',
                    actionButtons: [
                        {
                            name: 'Test',
                            backgroundColor: '#FF0000FF',
                            foregroundColor: '#FFFFFFFF',
                            icon: 'fas fa-star',
                            alignment: 'left',
                            onClick: 'noVisibilityChanges',
                            effectList: []
                        }
                    ],
                    showMessage: true,
                    messageText: '',
                    messageIcon: 'fa-bell'
                } as any);
                expect(Array.isArray(errors)).toBe(true);
                expect(errors.filter((e: string) => e.includes('message')).length).toBe(0);
            }
        });

        it('should pass validation with showMessage false and no message data', () => {
            const validator = addActionButtonPanelEffect.optionsValidator;
            if (validator) {
                const errors = validator({
                    positionType: 'append',
                    actionButtons: [
                        {
                            name: 'Test',
                            backgroundColor: '#FF0000FF',
                            foregroundColor: '#FFFFFFFF',
                            icon: 'fas fa-star',
                            alignment: 'left',
                            onClick: 'noVisibilityChanges',
                            effectList: []
                        }
                    ],
                    showMessage: false,
                    messageText: '',
                    messageIcon: ''
                } as any);
                expect(Array.isArray(errors)).toBe(true);
                expect(errors.filter((e: string) => e.includes('message')).length).toBe(0);
            }
        });

        it('should have onTriggerEvent handler', () => {
            expect(addActionButtonPanelEffect.onTriggerEvent).toBeDefined();
        });
    });

    describe('addButtonsToPanelEffect', () => {
        it('should be defined with correct properties', () => {
            expect(addButtonsToPanelEffect).toBeDefined();
            expect(addButtonsToPanelEffect.definition).toBeDefined();
            expect(addButtonsToPanelEffect.definition.id).toBe('action-buttons:add-buttons-to-panel');
            expect(addButtonsToPanelEffect.definition.name).toBe('Add Action Buttons to Panel');
            expect(addButtonsToPanelEffect.optionsTemplate).toBeDefined();
        });

        it('should have optionsValidator', () => {
            expect(addButtonsToPanelEffect.optionsValidator).toBeDefined();
        });

        it('should validate panelId is required', () => {
            const validator = addButtonsToPanelEffect.optionsValidator;
            if (validator) {
                const errors = validator({ panelId: '', actionButtons: [] } as any);
                expect(Array.isArray(errors)).toBe(true);
                expect(errors.some((e: string) => e.includes('Panel ID'))).toBe(true);
            }
        });

        it('should validate actionButtons is required', () => {
            const validator = addButtonsToPanelEffect.optionsValidator;
            if (validator) {
                const errors = validator({ panelId: 'test-panel', actionButtons: [] } as any);
                expect(Array.isArray(errors)).toBe(true);
                expect(errors.some((e: string) => e.includes('action button'))).toBe(true);
            }
        });

        it('should have onTriggerEvent handler', () => {
            expect(addButtonsToPanelEffect.onTriggerEvent).toBeDefined();
        });
    });

    describe('removeActionButtonPanelEffect', () => {
        it('should be defined with correct properties', () => {
            expect(removeActionButtonPanelEffect).toBeDefined();
            expect(removeActionButtonPanelEffect.definition).toBeDefined();
            expect(removeActionButtonPanelEffect.definition.id).toBe('action-buttons:remove-action-button-panel');
            expect(removeActionButtonPanelEffect.optionsTemplate).toBeDefined();
        });

        it('should have optionsValidator', () => {
            expect(removeActionButtonPanelEffect.optionsValidator).toBeDefined();
        });

        it('should validate panelId is required', () => {
            const validator = removeActionButtonPanelEffect.optionsValidator;
            if (validator) {
                const errors = validator({ panelId: '' } as any);
                expect(Array.isArray(errors)).toBe(true);
                expect(errors.some((e: string) => e.includes('Panel ID'))).toBe(true);
            }
        });

        it('should have onTriggerEvent handler', () => {
            expect(removeActionButtonPanelEffect.onTriggerEvent).toBeDefined();
        });
    });

    describe('toggleActionButtonVisibilityEffect', () => {
        it('should be defined with correct properties', () => {
            expect(toggleActionButtonVisibilityEffect).toBeDefined();
            expect(toggleActionButtonVisibilityEffect.definition).toBeDefined();
            expect(toggleActionButtonVisibilityEffect.definition.id).toBe('action-buttons:toggle-action-button-visibility');
            expect(toggleActionButtonVisibilityEffect.definition.name).toBe('Toggle Action Button Visibility');
            expect(toggleActionButtonVisibilityEffect.optionsTemplate).toBeDefined();
        });

        it('should have optionsValidator', () => {
            expect(toggleActionButtonVisibilityEffect.optionsValidator).toBeDefined();
        });

        it('should validate buttonId is required', () => {
            const validator = toggleActionButtonVisibilityEffect.optionsValidator;
            if (validator) {
                const errors = validator({ mode: 'show', buttonId: '', autoPanelToggle: true } as any);
                expect(Array.isArray(errors)).toBe(true);
                expect(errors.some((e: string) => e.includes('Button ID'))).toBe(true);
            }
        });

        it('should pass validation with valid buttonId', () => {
            const validator = toggleActionButtonVisibilityEffect.optionsValidator;
            if (validator) {
                const errors = validator({ mode: 'show', buttonId: 'test-button-uuid', autoPanelToggle: true } as any);
                expect(Array.isArray(errors)).toBe(true);
                expect(errors.length).toBe(0);
            }
        });

        it('should have onTriggerEvent handler', () => {
            expect(toggleActionButtonVisibilityEffect.onTriggerEvent).toBeDefined();
        });
    });

    describe('toggleActionButtonPanelVisibilityEffect', () => {
        it('should be defined with correct properties', () => {
            expect(toggleActionButtonPanelVisibilityEffect).toBeDefined();
            expect(toggleActionButtonPanelVisibilityEffect.definition).toBeDefined();
            expect(toggleActionButtonPanelVisibilityEffect.definition.id).toBe('action-buttons:toggle-action-button-panel-visibility');
            expect(toggleActionButtonPanelVisibilityEffect.definition.name).toBe('Toggle Action Button Panel Visibility');
            expect(toggleActionButtonPanelVisibilityEffect.optionsTemplate).toBeDefined();
        });

        it('should have optionsValidator', () => {
            expect(toggleActionButtonPanelVisibilityEffect.optionsValidator).toBeDefined();
        });

        it('should validate panelId is required', () => {
            const validator = toggleActionButtonPanelVisibilityEffect.optionsValidator;
            if (validator) {
                const errors = validator({ mode: 'show', panelId: '' } as any);
                expect(Array.isArray(errors)).toBe(true);
                expect(errors.some((e: string) => e.includes('Panel ID'))).toBe(true);
            }
        });

        it('should pass validation with valid panelId', () => {
            const validator = toggleActionButtonPanelVisibilityEffect.optionsValidator;
            if (validator) {
                const errors = validator({ mode: 'show', panelId: 'test-panel-id' } as any);
                expect(Array.isArray(errors)).toBe(true);
                expect(errors.length).toBe(0);
            }
        });

        it('should pass validation with toggle mode', () => {
            const validator = toggleActionButtonPanelVisibilityEffect.optionsValidator;
            if (validator) {
                const errors = validator({ mode: 'toggle', panelId: 'test-panel-id' } as any);
                expect(Array.isArray(errors)).toBe(true);
                expect(errors.length).toBe(0);
            }
        });

        it('should have onTriggerEvent handler', () => {
            expect(toggleActionButtonPanelVisibilityEffect.onTriggerEvent).toBeDefined();
        });
    });
});
