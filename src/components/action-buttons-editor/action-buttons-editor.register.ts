import { actionButtonsEditorComponent } from "./action-buttons-editor.component";
import { firebot } from "../../main";

export function registerActionButtonsEditor(): void {
    const { uiExtensionManager } = firebot.modules;
    if (uiExtensionManager) {
        uiExtensionManager.registerUIExtension({
            id: "action-buttons-editor",
            providers: {
                components: [actionButtonsEditorComponent]
            }
        });
    }
}