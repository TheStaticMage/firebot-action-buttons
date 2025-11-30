import { ReplaceVariable } from '@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager';
import { Trigger } from '@crowbartools/firebot-custom-scripts-types/types/triggers';
import { ActionButtonMetadata } from '../internal/action-button-types';

export const actionButtonPanelId: ReplaceVariable = {
    definition: {
        handle: "actionButtonPanelId",
        description: "Get the panel ID of the currently executing action button. Returns empty string if no button is executing.",
        categories: ["common"],
        possibleDataOutput: ["text"]
    },
    evaluator: (trigger: Trigger): string => {
        const actionButton = trigger.metadata?.actionButton as ActionButtonMetadata;
        if (!actionButton?.stack || actionButton.stack.length === 0) {
            return "";
        }
        return actionButton.stack[0].panelId;
    }
};
