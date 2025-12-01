import { actionButtonsEditorPocComponent } from "./proof-of-concept.component";

export function registerActionButtonsEditorPoc(uiExtensionManager: any): void {
    uiExtensionManager.registerUIExtension({
        id: "action-buttons-editor-poc",
        providers: {
            components: [actionButtonsEditorPocComponent]
        }
    });
}
