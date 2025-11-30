import { Trigger } from '@crowbartools/firebot-custom-scripts-types/types/triggers';
import { actionButton } from '../action-button';
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

describe('actionButton replace variable', () => {
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
        it('should return button info for specified UUID', () => {
            const mockGetButtonInfo = jest.fn().mockReturnValue(mockButtonInfo);
            actionButtonManager.getButtonInfo = mockGetButtonInfo;
            const trigger = createTrigger();
            const result = actionButton.evaluator(trigger, 'test-uuid-123');
            expect(mockGetButtonInfo).toHaveBeenCalledWith('test-uuid-123');
            expect(result).toEqual(mockButtonInfo);
        });

        it('should return specific property when requested', () => {
            const mockGetButtonInfo = jest.fn().mockReturnValue(mockButtonInfo);
            actionButtonManager.getButtonInfo = mockGetButtonInfo;
            const trigger = createTrigger();
            const result = actionButton.evaluator(trigger, 'test-uuid-123', 'name');
            expect(result).toBe('Test Button');
        });

        it('should return empty object when button not found', () => {
            const mockGetButtonInfo = jest.fn().mockReturnValue({});
            actionButtonManager.getButtonInfo = mockGetButtonInfo;
            const trigger = createTrigger();
            const result = actionButton.evaluator(trigger, 'unknown-uuid');
            expect(result).toEqual({});
        });

        it('should return empty string for non-existent property', () => {
            const mockGetButtonInfo = jest.fn().mockReturnValue(mockButtonInfo);
            actionButtonManager.getButtonInfo = mockGetButtonInfo;
            const trigger = createTrigger();
            const result = actionButton.evaluator(trigger, 'test-uuid-123', 'nonExistent');
            expect(result).toBe('');
        });
    });
});
