import { ReplaceVariable } from '@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager';
import { Trigger } from '@crowbartools/firebot-custom-scripts-types/types/triggers';
import { logger } from '../main';
import { actionButtonManager } from '../internal/action-button-manager';
import { ActionButtonMetadata } from '../internal/action-button-types';

export const actionButton: ReplaceVariable = {
    definition: {
        handle: "actionButton",
        usage: "actionButton[uuid, property]",
        examples: [
            {
                usage: "actionButton",
                description: "Get button info for the currently executing button."
            },
            {
                usage: "actionButton[button-uuid-123]",
                description: "Get button info for the specified button UUID."
            },
            {
                usage: "actionButton[button-uuid-123, name]",
                description: "Get the name property of the specified button."
            },
            {
                usage: "actionButton[, backgroundColor]",
                description: "Get the backgroundColor of the currently executing button."
            }
        ],
        description: "Get information about an action button. If uuid is not specified, uses the currently executing button. Returns the full button info object or a specific property.",
        categories: ["common"],
        possibleDataOutput: ["text", "number", "object"]
    },
    evaluator: (
        trigger: Trigger,
        ...args: string[]
    ): unknown => {
        let buttonId: string | undefined = args[0];
        let propertyName: string | undefined = args[1];

        // If no buttonId or empty string, use current executing button
        if (!buttonId || buttonId.trim() === '') {
            const actionButtonData = trigger.metadata?.actionButton as ActionButtonMetadata;
            if (!actionButtonData?.stack || actionButtonData.stack.length === 0) {
                return {};
            }
            buttonId = actionButtonData.stack[0].buttonId;

            // If only one arg and it's empty, treat second arg as property if it exists
            if (args.length >= 2) {
                propertyName = args[1];
            }
        } else if (args.length >= 2) {
            // Two args: buttonId and propertyName
            propertyName = args[1];
        }

        const buttonInfo = actionButtonManager.getButtonInfo(buttonId);

        if (Object.keys(buttonInfo).length === 0) {
            logger.debug(`actionButton called with unknown button ID: ${buttonId}`);
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
