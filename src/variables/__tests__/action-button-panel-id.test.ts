import { Trigger } from '@crowbartools/firebot-custom-scripts-types/types/triggers';
import { actionButtonPanelId } from '../action-button-panel-id';
import { ActionButtonMetadata } from '../../internal/action-button-types';

describe('actionButtonPanelId replace variable', () => {
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
            const result = actionButtonPanelId.evaluator(trigger);
            expect(result).toBe("");
        });

        it('should return panel ID when stack depth is 1', () => {
            const trigger = createTrigger({
                timestamp: 1234567890,
                stack: [
                    {
                        buttonId: 'button-uuid-1',
                        panelId: 'panel-1',
                        buttonName: 'Button 1'
                    }
                ]
            });
            const result = actionButtonPanelId.evaluator(trigger);
            expect(result).toBe('panel-1');
        });

        it('should return most recent panel ID when stack depth is 3', () => {
            const trigger = createTrigger({
                timestamp: 1234567890,
                stack: [
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
                ]
            });
            const result = actionButtonPanelId.evaluator(trigger);
            expect(result).toBe('panel-3');
        });

        it('should return empty string when actionButton metadata is missing', () => {
            const trigger: Trigger = {
                type: 'manual' as any,
                metadata: {
                    username: 'testuser'
                }
            };
            const result = actionButtonPanelId.evaluator(trigger);
            expect(result).toBe("");
        });
    });
});
