import { Trigger } from '@crowbartools/firebot-custom-scripts-types/types/triggers';
import { currentActionButton } from '../current-action-button';
import { actionButtonManager } from '../../internal/action-button-manager';

jest.mock('../../main', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn()
    }
}));

jest.mock('../../internal/action-button-manager');

describe('currentActionButton replace variable', () => {
    const mockButtonInfo = {
        uuid: 'test-uuid-123',
        name: 'Test Button',
        icon: 'fas fa-star',
        backgroundColor: '#FF0000',
        foregroundColor: '#FFFFFF',
        alignment: 'center',
        onClick: 'noVisibilityChanges',
        extraMetadata: { key: 'value' },
        effectCount: 3
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
        it('should return current button info', () => {
            const mockGetButtonInfo = jest.fn().mockReturnValue(mockButtonInfo);
            actionButtonManager.getButtonInfo = mockGetButtonInfo;
            const trigger = createTrigger();
            trigger.metadata.actionButton = {
                stack: [{ buttonId: 'current-button-uuid' }]
            };
            const result = currentActionButton.evaluator(trigger);
            expect(mockGetButtonInfo).toHaveBeenCalledWith('current-button-uuid');
            expect(result).toEqual(mockButtonInfo);
        });

        it('should return specific property when requested', () => {
            const mockGetButtonInfo = jest.fn().mockReturnValue(mockButtonInfo);
            actionButtonManager.getButtonInfo = mockGetButtonInfo;
            const trigger = createTrigger();
            trigger.metadata.actionButton = {
                stack: [{ buttonId: 'current-button-uuid' }]
            };
            const result = currentActionButton.evaluator(trigger, 'name');
            expect(result).toBe('Test Button');
        });

        it('should return empty object when no action button context', () => {
            const trigger = createTrigger();
            const result = currentActionButton.evaluator(trigger);
            expect(result).toEqual({});
        });

        it('should return empty object when stack is empty', () => {
            const trigger = createTrigger();
            trigger.metadata.actionButton = {
                stack: []
            };
            const result = currentActionButton.evaluator(trigger);
            expect(result).toEqual({});
        });

        it('should return empty object when button not found', () => {
            const mockGetButtonInfo = jest.fn().mockReturnValue({});
            actionButtonManager.getButtonInfo = mockGetButtonInfo;
            const trigger = createTrigger();
            trigger.metadata.actionButton = {
                stack: [{ buttonId: 'unknown-uuid' }]
            };
            const result = currentActionButton.evaluator(trigger);
            expect(result).toEqual({});
        });

        it('should return empty string for non-existent property', () => {
            const mockGetButtonInfo = jest.fn().mockReturnValue(mockButtonInfo);
            actionButtonManager.getButtonInfo = mockGetButtonInfo;
            const trigger = createTrigger();
            trigger.metadata.actionButton = {
                stack: [{ buttonId: 'current-button-uuid' }]
            };
            const result = currentActionButton.evaluator(trigger, 'nonExistent');
            expect(result).toBe('');
        });

        it('should return backgroundColor property', () => {
            const mockGetButtonInfo = jest.fn().mockReturnValue(mockButtonInfo);
            actionButtonManager.getButtonInfo = mockGetButtonInfo;
            const trigger = createTrigger();
            trigger.metadata.actionButton = {
                stack: [{ buttonId: 'current-button-uuid' }]
            };
            const result = currentActionButton.evaluator(trigger, 'backgroundColor');
            expect(result).toBe('#FF0000');
        });
    });
});
