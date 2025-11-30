import { Firebot } from '@crowbartools/firebot-custom-scripts-types';

export type ButtonAlignment = 'left' | 'center' | 'right';
export type OnClickVisibility = 'hideButton' | 'hidePanel' | 'noVisibilityChanges';

export interface ActionButtonDefinition {
    id?: string;
    name: string;
    backgroundColor: string;
    foregroundColor: string;
    icon: string;
    alignment: ButtonAlignment;
    onClick: OnClickVisibility;
    effectList: Firebot.EffectList;
    extraMetadata?: string;
}

export interface ActionButtonDisplay {
    uuid: string;
    name: string;
    backgroundColor: string;
    foregroundColor: string;
    icon: string;
    alignment: ButtonAlignment;
    onClick: OnClickVisibility;
    hidden?: boolean;
}

export interface ActionButtonConfig {
    uuid: string;
    panelId: string;
    buttonName: string;
    onClick: OnClickVisibility;
    effectList: Firebot.EffectList;
    trigger: any;
    timestamp: number;
    extraMetadata?: Record<string, any>;
}

export interface ActionButtonStackEntry {
    buttonId: string;
    panelId: string;
    buttonName: string;
}

export interface ActionButtonMetadata {
    timestamp: number;
    extraMetadata?: Record<string, any>;
    stack: ActionButtonStackEntry[];
}
