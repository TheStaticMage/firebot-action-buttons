import { Trigger } from '@crowbartools/firebot-custom-scripts-types/types/triggers';
import { actionButtonStack } from '../action-button-stack';
import { ActionButtonMetadata, ActionButtonStackEntry } from '../../internal/action-button-types';

describe('actionButtonStack replace variable', () => {
    const createTrigger = (actionButtonData?: ActionButtonMetadata): Trigger => ({
        type: 'manual' as any,
        metadata: {
            username: 'testuser',
            actionButton: actionButtonData
        }
    });

    describe('evaluator', () => {
        it('should return empty array when stack depth is 0', () => {
            const trigger = createTrigger({
                timestamp: 1234567890,
                stack: []
            });
            const result = actionButtonStack.evaluator(trigger);
            expect(result).toEqual([]);
        });

        it('should return stack with one entry when stack depth is 1', () => {
            const expectedStack: ActionButtonStackEntry[] = [
                {
                    buttonId: 'button-uuid-1',
                    panelId: 'panel-1',
                    buttonName: 'Button 1'
                }
            ];
            const trigger = createTrigger({
                timestamp: 1234567890,
                stack: expectedStack
            });
            const result = actionButtonStack.evaluator(trigger);
            expect(result).toEqual(expectedStack);
            expect((result as ActionButtonStackEntry[]).length).toBe(1);
        });

        it('should return stack with three entries when stack depth is 3', () => {
            const expectedStack: ActionButtonStackEntry[] = [
                {
                    buttonId: 'button-uuid-3',
                    panelId: 'panel-3',
                    buttonName: 'Button 3'
                },
                {
                    buttonId: 'button-uuid-2',
                    panelId: 'panel-2',
                    buttonName: 'Button 2'
                },
                {
                    buttonId: 'button-uuid-1',
                    panelId: 'panel-1',
                    buttonName: 'Button 1'
                }
            ];
            const trigger = createTrigger({
                timestamp: 1234567890,
                stack: expectedStack
            });
            const result = actionButtonStack.evaluator(trigger);
            expect(result).toEqual(expectedStack);
            expect((result as ActionButtonStackEntry[]).length).toBe(3);
            expect((result as ActionButtonStackEntry[])[0].buttonName).toBe('Button 3');
        });

        it('should return empty array when actionButton metadata is missing', () => {
            const trigger: Trigger = {
                type: 'manual' as any,
                metadata: {
                    username: 'testuser'
                }
            };
            const result = actionButtonStack.evaluator(trigger);
            expect(result).toEqual([]);
        });
    });
});
