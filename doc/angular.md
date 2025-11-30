# Angular Injection Architecture

This document provides an advanced technical overview of the Angular injection mechanism used in this plugin. This information is intended for developers working on this plugin or developing similar Firebot plugins.

Users of this plugin do not need to understand any of this material. This is purely for developers who need to understand the internal architecture.

## Overview

This plugin uses Firebot's `uiExtensionManager` to inject Angular components into the Firebot frontend. The injection mechanism creates a bridge between the Node.js backend (where the plugin runs) and the Angular frontend (Firebot's chat interface).

The architecture consists of three primary layers:

1. Backend component registration via `uiExtensionManager`
2. Frontend Angular component with injected services
3. Bidirectional communication via `backendCommunicator` and `frontendCommunicator`

## Component Registration

### Backend Registration (Node.js)

Registration occurs in `registerActionButtonsPanelComponent` within [action-buttons-panel-register.ts](src/components/action-buttons-panel-register.ts).

The registration uses the `uiExtensionManager.registerUIExtension` API:

```typescript
uiExtensionManager.registerUIExtension({
    id: 'action-buttons-panel-extension',
    providers: {
        components: [{
            name: 'actionButtonsPanel',
            bindings: {},
            template: `...`,
            controller: ($scope, backendCommunicator, logger) => { ... }
        }]
    }
});
```

Key aspects:

- `id`: Unique identifier for this UI extension
- `name`: Component name used in Angular templates (becomes `<action-buttons-panel>`)
- `bindings`: Angular component bindings (empty in this case, as data flows through `componentData`)
- `template`: Inline Angular template with HTML, CSS, and Angular directives
- `controller`: Angular controller function with dependency injection

### Angular Controller Dependency Injection

The controller function uses Angular's dependency injection to receive services:

```typescript
controller: ($scope: any, backendCommunicator: any, logger: any) => {
    // Controller implementation
}
```

Angular automatically injects these services by matching parameter names:

- `$scope`: Angular scope object for data binding
- `backendCommunicator`: IPC bridge to the Node.js backend
- `logger`: Firebot's logging service

This is standard AngularJS dependency injection. Parameter names must match service names exactly.

## Data Flow Architecture

### Frontend to Backend Communication

The frontend uses `backendCommunicator` to send messages to the backend:

#### Synchronous Calls

```typescript
const buttons = backendCommunicator.fireEventSync('action-buttons:get-panel-buttons', panelId);
```

The backend registers handlers in `ActionButtonManager.setupListeners`:

```typescript
frontendCommunicator.on('action-buttons:get-panel-buttons', (panelId: string) => {
    return this.getPanelButtons(panelId);
});
```

Note the asymmetry: frontend uses `backendCommunicator.fireEventSync`, backend uses `frontendCommunicator.on`.

#### Asynchronous Calls

```typescript
await backendCommunicator.fireEventAsync('action-button:click', uuid);
```

Backend handler registered with `onAsync`:

```typescript
frontendCommunicator.onAsync('action-button:click', async (uuid: string) => {
    await this.clickButton(uuid);
    return { success: true };
});
```

### Backend to Frontend Communication

The backend pushes updates to the frontend using `frontendCommunicator.send`:

```typescript
frontendCommunicator.send('action-buttons:panel-updated', panelId);
```

The frontend listens with `backendCommunicator.on`:

```typescript
backendCommunicator.on('action-buttons:panel-updated', (panelId: string) => {
    if (panelId === $scope.$parent?.componentData?.panelId) {
        loadButtonsForPanel(panelId);
    }
});
```

This enables reactive updates when button visibility changes or panels are modified.

## Component Data Propagation

### Parent Scope Data Access

The component receives configuration data through `$scope.$parent.componentData`:

```typescript
const data = $scope.$parent?.componentData;
if (data && data.panelId) {
    loadButtonsForPanel(data.panelId);
}
```

This data originates from Firebot's custom chat panel system when a panel is created with:

```typescript
customChatPanelManager.injectChatPanel({
    panelId,
    componentName: 'actionButtonsPanel',
    componentData: { panelId }
});
```

The `componentData` object becomes available on the parent scope, not directly on the component scope.

### Scope Watching

The component uses `$scope.$watch` to detect changes to component data:

```typescript
$scope.$watch(() => $scope.$parent?.componentData, (newVal: any) => {
    if (newVal && newVal.panelId) {
        loadButtonsForPanel(newVal.panelId);
    }
}, true);
```

The third parameter `true` enables deep watching of object properties.

## Angular Data Binding

### Template Directives

The template uses standard AngularJS directives:

- `ng-repeat`: Iterates over button arrays
- `ng-click`: Binds click handlers
- `ng-style`: Dynamic style binding
- `ng-hide`: Conditional visibility
- `ng-if`: Conditional rendering
- `filter`: Filters arrays in templates

Example from the component template:

```html
<button ng-repeat="button in buttons | filter:{alignment:'left'} track by button.uuid"
        class="action-button"
        ng-click="clickButton(button.uuid)"
        ng-style="{backgroundColor: button.backgroundColor, color: button.foregroundColor}"
        ng-hide="button.hidden"
        title="{{button.name}}">
    <i class="{{button.icon}}" ng-if="button.icon"></i>
    <span>{{button.name}}</span>
</button>
```

### Two-Way Binding

The controller modifies scope properties, which Angular automatically reflects in the template:

```typescript
$scope.$applyAsync(() => {
    ctrl.buttons = buttonsCopy;
    $scope.buttons = buttonsCopy;
});
```

Using `$applyAsync` ensures Angular's digest cycle runs to update the view. This is necessary because the data arrives from an asynchronous IPC call outside Angular's normal digest cycle.

## Race Condition Prevention

### Instance Identification

Each component instance generates a unique ID to help with debugging:

```typescript
const instanceId = Math.random().toString(36).substring(7);
```

This appears in log messages to distinguish between multiple panel instances.

### Panel ID Validation

The component validates that updates correspond to the current panel:

```typescript
$scope.$applyAsync(() => {
    const actualPanelId = $scope.$parent?.componentData?.panelId;
    if (actualPanelId !== currentPanelId) {
        logger.warn(`Panel ID mismatch! Ignoring.`);
        return;
    }
    ctrl.buttons = buttonsCopy;
    $scope.buttons = buttonsCopy;
});
```

The panel ID should never change, so this warning should never fire. If it does, it indicates a bug.

### Deep Copying

Button data is deep copied before assignment to prevent reference issues:

```typescript
const buttonsCopy = JSON.parse(JSON.stringify(buttons));
```

This ensures the frontend cannot accidentally modify backend state.

## Effect Configuration

### Angular in Backend Effect Options

The plugin also uses Angular injection for effect configuration UI in the `addActionButtonPanelEffect.optionsController`:

```typescript
optionsController: ($scope: EffectScope<EffectModel>, backendCommunicator: any, $timeout: any) => {
    // Effect configuration logic
}
```

This controller runs in the Firebot effect configuration dialog and provides:

- Form inputs for button configuration
- Effect list builders
- Color pickers
- Icon selectors

### Scope Initialization

The controller initializes the effect model immediately to prevent undefined access:

```typescript
$scope.effect = $scope.effect || ({} as EffectModel);
$scope.effect.mode = $scope.effect.mode || 'create';
$scope.effect.positionType = $scope.effect.positionType || 'append';
$scope.effect.actionButtons = $scope.effect.actionButtons || [];
```

This pattern is essential in Angular controllers to ensure properties exist before template rendering.

### Backend Communication from Effect Options

The effect options controller can also communicate with the backend:

```typescript
return backendCommunicator.fireEvent('action-buttons:generate-uuid');
```

This allows the configuration UI to request backend services like UUID generation. Note that the `crypto` library, external functions, etc. are not directly available in the effect options.

## Key Architectural Decisions

### Why Use Angular Injection

Firebot's frontend is built on AngularJS. Plugins that need custom UI components must integrate with this framework. The `uiExtensionManager` provides the bridge between the Node.js plugin runtime and the Angular frontend.

### Synchronous vs Asynchronous IPC

- Use `fireEventSync` for immediate data retrieval (button lists, simple queries)
- Use `fireEventAsync` for operations that may take time (effect execution, API calls)

Synchronous calls block the frontend until the backend responds. Use sparingly to avoid UI freezes. In this plugin we use those only for operations with instantaneous results (e.g. lookups in a map, generation of a UUID).

### Parent Scope Access Pattern

Custom chat panel entries bind `component-data="chatItem.data.componentData"` (no one-time binding), so changes from `customChatPanelManager.updatePanel` reach the DOM. `dynamic-component` creates an isolated child scope, copies `componentData` onto it, and watches for updates so the component sees fresh data. Inside the component we still read from `$scope.$parent.componentData`, because that parent scope is the one `dynamic-component` keeps synchronized.

## Testing Considerations

Testing Angular-injected components is challenging because:

1. Angular dependency injection requires a full Angular runtime
2. Backend communicator mocking must simulate async behavior
3. Scope watchers and digest cycles must be manually triggered

The plugin uses Jest for unit testing but primarily tests backend logic. Frontend Angular components are tested manually through Firebot.

For developers adding similar components, focus automated tests on backend logic and use manual testing for Angular UI.

## References

- Angular component registration: [action-buttons-panel-register.ts](src/components/action-buttons-panel-register.ts)
- Backend IPC handlers: `ActionButtonManager.setupListeners` in [action-button-manager.ts](src/internal/action-button-manager.ts)
- Effect options controller: `addActionButtonPanelEffect.optionsController` in [add-action-button-panel.ts](src/effects/add-action-button-panel.ts)
- Main plugin initialization: [main.ts](src/main.ts)
