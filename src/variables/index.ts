import { firebot } from '../main';
import { actionButton } from './action-button';
import { actionButtonByName } from './action-button-by-name';
import { actionButtonId } from './action-button-id';
import { actionButtonName } from './action-button-name';
import { actionButtonPanel } from './action-button-panel';
import { actionButtonPanelId } from './action-button-panel-id';
import { actionButtonStack } from './action-button-stack';

export function registerReplaceVariables() {
    const { replaceVariableManager } = firebot.modules;

    replaceVariableManager.registerReplaceVariable(actionButton);
    replaceVariableManager.registerReplaceVariable(actionButtonByName);
    replaceVariableManager.registerReplaceVariable(actionButtonId);
    replaceVariableManager.registerReplaceVariable(actionButtonName);
    replaceVariableManager.registerReplaceVariable(actionButtonPanel);
    replaceVariableManager.registerReplaceVariable(actionButtonPanelId);
    replaceVariableManager.registerReplaceVariable(actionButtonStack);
}
