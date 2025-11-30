import { ReplaceVariable } from '@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager';
import { Trigger } from '@crowbartools/firebot-custom-scripts-types/types/triggers';
import { logger } from '../main';
import { actionButtonManager } from '../internal/action-button-manager';

export const actionButtonPanel: ReplaceVariable = {
    definition: {
        handle: 'actionButtonPanel',
        usage: 'actionButtonPanel[panelId]',
        examples: [
            {
                usage: 'actionButtonPanel[panel-123]',
                description: 'Get the full button info map (UUID to properties) for panel-123.'
            }
        ],
        description: 'Get all button information for a panel. Returns a map of button UUIDs to their properties.',
        categories: ['common'],
        possibleDataOutput: ['object']
    },
    evaluator: (
        _trigger: Trigger,
        ...args: string[]
    ): unknown => {
        if (args.length === 0) {
            logger.debug('Called actionButtonPanel variable without panelId.');
            return {};
        }

        const panelId = args[0];
        const buttonInfoMap = actionButtonManager.getButtonInfoByPanelId(panelId);

        if (Object.keys(buttonInfoMap).length === 0) {
            logger.debug(`Called actionButtonPanel with unknown panelId: ${panelId}`);
            return {};
        }

        return buttonInfoMap;
    }
};
