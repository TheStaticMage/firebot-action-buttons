import { ReplaceVariable } from '@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager';
import { Trigger } from '@crowbartools/firebot-custom-scripts-types/types/triggers';
import { ActionButtonMetadata } from '../internal/action-button-types';

export const actionButtonStack: ReplaceVariable = {
    definition: {
        handle: "actionButtonStack",
        description: "Get the call stack of action buttons. Returns an array where each element contains buttonId, panelId, and buttonName. The most recent call is at index 0.",
        categories: ["common"],
        possibleDataOutput: ["object"]
    },
    evaluator: (trigger: Trigger): unknown => {
        const actionButton = trigger.metadata?.actionButton as ActionButtonMetadata;
        return actionButton?.stack || [];
    }
};
