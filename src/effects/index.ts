import { firebot, logger } from '../main';
import { addActionButtonPanelEffect } from './add-action-button-panel';
import { addButtonsToPanelEffect } from './add-buttons-to-panel';
import { removeActionButtonPanelEffect } from './remove-action-button-panel';
import { toggleActionButtonVisibilityEffect } from './toggle-action-button-visibility';
import { toggleActionButtonPanelVisibilityEffect } from './toggle-action-button-panel-visibility';
import { updateActionButtonEffect } from './update-action-button';

export function registerEffects(): void {
    const { effectManager } = firebot.modules;

    logger.debug("Registering action-buttons effects...");

    effectManager.registerEffect(addActionButtonPanelEffect);
    logger.debug("Registered: Create Action Button Panel effect");

    effectManager.registerEffect(addButtonsToPanelEffect);
    logger.debug("Registered: Add Action Buttons to Panel effect");

    effectManager.registerEffect(removeActionButtonPanelEffect);
    logger.debug("Registered: Remove Action Button Panel effect");

    effectManager.registerEffect(toggleActionButtonVisibilityEffect);
    logger.debug("Registered: Toggle Action Button Visibility effect");

    effectManager.registerEffect(toggleActionButtonPanelVisibilityEffect);
    logger.debug("Registered: Toggle Action Button Panel Visibility effect");

    effectManager.registerEffect(updateActionButtonEffect);
    logger.debug("Registered: Update Action Button effect");

    logger.debug("Action Buttons effects registered successfully.");
}
