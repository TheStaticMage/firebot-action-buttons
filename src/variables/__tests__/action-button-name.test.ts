import { Trigger } from '@crowbartools/firebot-custom-scripts-types/types/triggers';
import { actionButtonName } from '../action-button-name';
import { ActionButtonMetadata } from '../../internal/action-button-types';

describe('actionButtonName replace variable', () => {
    const createTrigger = (actionButtonData?: ActionButtonMetadata): Trigger => ({
        type: 'manual' as any,
        metadata: {
            username: 'testuser',
            actionButton: actionButtonData
        }
    });

    describe('evaluator', () => {
        it('should return empty string when stack depth is 0', () => {
            const trigger = createTrigger({
                timestamp: 1234567890,
                stack: []
            });
            const result = actionButtonName.evaluator(trigger);
            expect(result).toBe("");
        });

        it('should return button name when stack depth is 1', () => {
            const trigger = createTrigger({
                timestamp: 1234567890,
                stack: [
                    {
                        buttonId: 'button-uuid-1',
                        panelId: 'panel-1',
                        buttonName: 'Click Me'
                    }
                ]
            });
            const result = actionButtonName.evaluator(trigger);
            expect(result).toBe('Click Me');
        });

        it('should return most recent button name when stack depth is 3', () => {
            const trigger = createTrigger({
                timestamp: 1234567890,
                stack: [
                    {
                        buttonId: 'button-uuid-3',
                        panelId: 'panel-3',
                        buttonName: 'Submit'
                    },
                    {
                        buttonId: 'button-uuid-2',
                        panelId: 'panel-2',
                        buttonName: 'Confirm'
                    },
                    {
                        buttonId: 'button-uuid-1',
                        panelId: 'panel-1',
                        buttonName: 'Start'
                    }
                ]
            });
            const result = actionButtonName.evaluator(trigger);
            expect(result).toBe('Submit');
        });

        it('should return empty string when actionButton metadata is missing', () => {
            const trigger: Trigger = {
                type: 'manual' as any,
                metadata: {
                    username: 'testuser'
                }
            };
            const result = actionButtonName.evaluator(trigger);
            expect(result).toBe("");
        });
    });
});
