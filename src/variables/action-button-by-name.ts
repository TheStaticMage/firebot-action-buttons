import { ReplaceVariable } from '@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager';
import { Trigger } from '@crowbartools/firebot-custom-scripts-types/types/triggers';
import { logger } from '../main';
import { actionButtonManager } from '../internal/action-button-manager';

export const actionButtonByName: ReplaceVariable = {
    definition: {
        handle: 'actionButtonByName',
        usage: 'actionButtonByName[panelId, buttonName]',
        examples: [
            {
                usage: 'actionButtonByName[panel-123, Click Me]',
                description: 'Get the button properties object for a button named "Click Me" in panel-123.'
            },
            {
                usage: 'actionButtonByName[panel-456, submit button]',
                description: 'Get the button properties (case-insensitive match) for a button named "submit button".'
            }
        ],
        description: 'Look up an action button by name within a panel. Matching is case-insensitive. If multiple buttons have the same name, returns the first match.',
        categories: ['common'],
        possibleDataOutput: ['object']
    },
    evaluator: (
        trigger: Trigger,
        ...args: string[]
    ): unknown => {
        if (args.length < 2) {
            logger.debug('Called actionButtonByName variable without panelId or buttonName.');
            return null;
        }

        const panelId = args[0];
        const searchName = args[1];

        if (!searchName || searchName.trim() === '') {
            logger.debug('Called actionButtonByName with empty buttonName.');
            return null;
        }

        // Get the full button info map for the panel
        const buttonInfoMap = actionButtonManager.getButtonInfoByPanelId(panelId);

        // If the panel doesn't exist, buttonInfoMap will be empty
        if (Object.keys(buttonInfoMap).length === 0) {
            logger.debug(`Called actionButtonByName with unknown panelId: ${panelId}`);
            return null;
        }

        // Search for button by name (case-insensitive)
        const searchNameLower = searchName.toLowerCase();
        for (const buttonInfo of Object.values(buttonInfoMap)) {
            if (buttonInfo.name && buttonInfo.name.toLowerCase() === searchNameLower) {
                return buttonInfo;
            }
        }

        // No matching button found
        logger.debug(`Called actionButtonByName with panelId ${panelId} and unknown buttonName: ${searchName}`);
        return null;
    }
};
