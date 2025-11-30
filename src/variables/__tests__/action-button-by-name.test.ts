import { Trigger } from '@crowbartools/firebot-custom-scripts-types/types/triggers';
import { actionButtonByName } from '../action-button-by-name';
import { actionButtonManager } from '../../internal/action-button-manager';

jest.mock('../../main', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn()
    }
}));

jest.mock('../../internal/action-button-manager', () => ({
    actionButtonManager: {
        getButtonInfoByPanelId: jest.fn()
    }
}));

describe('actionButtonByName replace variable', () => {
    const mockButtonInfo = {
        'button-uuid-1': {
            uuid: 'button-uuid-1',
            name: 'Click Me',
            icon: 'fas fa-check',
            backgroundColor: '#FF0000',
            foregroundColor: '#FFFFFF',
            alignment: 'left' as const,
            onClick: 'hideButton' as const,
            extraMetadata: undefined,
            effectCount: 1
        },
        'button-uuid-2': {
            uuid: 'button-uuid-2',
            name: 'Submit Button',
            icon: 'fas fa-paper-plane',
            backgroundColor: '#00FF00',
            foregroundColor: '#000000',
            alignment: 'center' as const,
            onClick: 'noVisibilityChanges' as const,
            extraMetadata: { key: 'value' },
            effectCount: 2
        },
        'button-uuid-3': {
            uuid: 'button-uuid-3',
            name: 'Cancel',
            icon: 'fas fa-times',
            backgroundColor: '#FF0000',
            foregroundColor: '#FFFFFF',
            alignment: 'right' as const,
            onClick: 'hidePanel' as const,
            extraMetadata: undefined,
            effectCount: 0
        }
    };

    const createTrigger = (): Trigger => ({
        type: 'manual' as any,
        metadata: {
            username: 'testuser'
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('evaluator', () => {
        it('should return null when called without panelId or buttonName', () => {
            (actionButtonManager.getButtonInfoByPanelId as jest.Mock).mockReturnValue({});
            const trigger = createTrigger();
            const result = actionButtonByName.evaluator(trigger);
            expect(result).toBeNull();
        });

        it('should return null when called with only panelId', () => {
            (actionButtonManager.getButtonInfoByPanelId as jest.Mock).mockReturnValue({});
            const trigger = createTrigger();
            const result = actionButtonByName.evaluator(trigger, 'panel-123');
            expect(result).toBeNull();
        });

        it('should return null when panelId does not exist', () => {
            (actionButtonManager.getButtonInfoByPanelId as jest.Mock).mockReturnValue({});
            const trigger = createTrigger();
            const result = actionButtonByName.evaluator(trigger, 'unknown-panel', 'Click Me');
            expect(result).toBeNull();
        });

        it('should find button by exact name match', () => {
            (actionButtonManager.getButtonInfoByPanelId as jest.Mock).mockReturnValue(mockButtonInfo);
            const trigger = createTrigger();
            const result = actionButtonByName.evaluator(trigger, 'panel-123', 'Click Me');

            expect(result).toEqual(mockButtonInfo['button-uuid-1']);
            expect(result).toHaveProperty('name', 'Click Me');
        });

        it('should find button by case-insensitive name match', () => {
            (actionButtonManager.getButtonInfoByPanelId as jest.Mock).mockReturnValue(mockButtonInfo);
            const trigger = createTrigger();
            const result = actionButtonByName.evaluator(trigger, 'panel-123', 'click me');

            expect(result).toEqual(mockButtonInfo['button-uuid-1']);
            expect(result).toHaveProperty('name', 'Click Me');
        });

        it('should find button with mixed case search', () => {
            (actionButtonManager.getButtonInfoByPanelId as jest.Mock).mockReturnValue(mockButtonInfo);
            const trigger = createTrigger();
            const result = actionButtonByName.evaluator(trigger, 'panel-123', 'SUBMIT BUTTON');

            expect(result).toEqual(mockButtonInfo['button-uuid-2']);
            expect(result).toHaveProperty('name', 'Submit Button');
        });

        it('should return null when button name does not exist', () => {
            (actionButtonManager.getButtonInfoByPanelId as jest.Mock).mockReturnValue(mockButtonInfo);
            const trigger = createTrigger();
            const result = actionButtonByName.evaluator(trigger, 'panel-123', 'Non Existent Button');

            expect(result).toBeNull();
        });

        it('should return null when buttonName is empty', () => {
            (actionButtonManager.getButtonInfoByPanelId as jest.Mock).mockReturnValue(mockButtonInfo);
            const trigger = createTrigger();
            const result = actionButtonByName.evaluator(trigger, 'panel-123', '');

            expect(result).toBeNull();
        });

        it('should return null when buttonName is whitespace only', () => {
            (actionButtonManager.getButtonInfoByPanelId as jest.Mock).mockReturnValue(mockButtonInfo);
            const trigger = createTrigger();
            const result = actionButtonByName.evaluator(trigger, 'panel-123', '   ');

            expect(result).toBeNull();
        });

        it('should return first match when multiple buttons have same name', () => {
            const multipleMatchInfo = {
                'button-uuid-1': {
                    uuid: 'button-uuid-1',
                    name: 'Submit',
                    icon: 'fas fa-check',
                    backgroundColor: '#FF0000',
                    foregroundColor: '#FFFFFF',
                    alignment: 'left' as const,
                    onClick: 'hideButton' as const,
                    extraMetadata: undefined,
                    effectCount: 1
                },
                'button-uuid-2': {
                    uuid: 'button-uuid-2',
                    name: 'Submit',
                    icon: 'fas fa-paper-plane',
                    backgroundColor: '#00FF00',
                    foregroundColor: '#000000',
                    alignment: 'center' as const,
                    onClick: 'noVisibilityChanges' as const,
                    extraMetadata: { version: 2 },
                    effectCount: 2
                },
                'button-uuid-3': {
                    uuid: 'button-uuid-3',
                    name: 'Submit',
                    icon: 'fas fa-send',
                    backgroundColor: '#0000FF',
                    foregroundColor: '#FFFFFF',
                    alignment: 'right' as const,
                    onClick: 'hidePanel' as const,
                    extraMetadata: undefined,
                    effectCount: 3
                }
            };

            (actionButtonManager.getButtonInfoByPanelId as jest.Mock).mockReturnValue(multipleMatchInfo);
            const trigger = createTrigger();
            const result = actionButtonByName.evaluator(trigger, 'panel-123', 'Submit');

            // Should return the first matching button (uuid-1), not uuid-2 or uuid-3
            expect(result).toEqual(multipleMatchInfo['button-uuid-1']);
            expect(result?.icon).toBe('fas fa-check');
            expect(result?.backgroundColor).toBe('#FF0000');
            expect(result?.effectCount).toBe(1);
            expect(result?.extraMetadata).toBeUndefined();

            // Verify we're not getting the other buttons with same name
            expect(result).not.toEqual(multipleMatchInfo['button-uuid-2']);
            expect(result).not.toEqual(multipleMatchInfo['button-uuid-3']);
        });

        it('should include uuid in returned button info', () => {
            (actionButtonManager.getButtonInfoByPanelId as jest.Mock).mockReturnValue(mockButtonInfo);
            const trigger = createTrigger();
            const result = actionButtonByName.evaluator(trigger, 'panel-123', 'Click Me');

            expect(result).toHaveProperty('uuid', 'button-uuid-1');
        });
    });
});
