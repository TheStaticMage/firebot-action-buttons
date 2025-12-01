import { ReplaceVariable } from '@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager';
import { Trigger } from '@crowbartools/firebot-custom-scripts-types/types/triggers';
import { logger } from '../main';
import { actionButtonManager } from '../internal/action-button-manager';
import { ActionButtonMetadata } from '../internal/action-button-types';

export const currentActionButton: ReplaceVariable = {
    definition: {
        handle: "currentActionButton",
        usage: "currentActionButton[property]",
        examples: [
            {
                usage: "currentActionButton",
                description: "Get button info for the currently executing button."
            },
            {
                usage: "currentActionButton[backgroundColor]",
                description: "Get the backgroundColor of the currently executing button."
            },
            {
                usage: "currentActionButton[name]",
                description: "Get the name of the currently executing button."
            }
        ],
        description: "Get information about the currently executing action button. Returns the full button info object or a specific property.",
        categories: ["common"],
        possibleDataOutput: ["text", "number", "object"]
    },
    evaluator: (
        trigger: Trigger,
        ...args: string[]
    ): unknown => {
        const propertyName: string | undefined = args[0];

        const actionButtonData = trigger.metadata?.actionButton as ActionButtonMetadata;
        if (!actionButtonData?.stack || actionButtonData.stack.length === 0) {
            return {};
        }

        const buttonId = actionButtonData.stack[0].buttonId;
        const buttonInfo = actionButtonManager.getButtonInfo(buttonId);

        if (Object.keys(buttonInfo).length === 0) {
            logger.debug(`currentActionButton called but button ID not found: ${buttonId}`);
            return {};
        }

        // If no property specified, return full object
        if (!propertyName) {
            return buttonInfo;
        }

        // Return specific property
        const value = buttonInfo[propertyName];
        return value ?? "";
    }
};
