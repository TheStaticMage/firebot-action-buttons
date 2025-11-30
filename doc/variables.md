# Replace Variables

This document describes all replace variables provided by the Action Buttons plugin.

## Table of Contents

- [`$actionButtonId`](#actionbuttonid)
- [`$actionButtonPanelId`](#actionbuttonpanelid)
- [`$actionButtonName`](#actionbuttonname)
- [`$actionButtonStack`](#actionbuttonstack)
- [`$actionButton`](#actionbutton)
- [`$actionButtonPanel`](#actionbuttonpanel)
- [`$actionButtonByName`](#actionbuttonbyname)

## `$actionButtonId`

Returns the button ID of the currently executing action button (`$actionButtonId`).

**Usage:**

```text
$actionButtonId
```

**Returns:** The UUID of the currently executing button, or empty string if no button is executing.

**Example:**

```text
Current button ID: $actionButtonId
```

**Related Variables:**

- [`$actionButtonPanelId`](#actionbuttonpanelid) - Get the panel ID of the current button
- [`$actionButtonName`](#actionbuttonname) - Get the name of the current button
- [`$actionButton`](#actionbutton) - Get detailed info about a button

## `$actionButtonPanelId`

Returns the panel ID of the currently executing action button (`$actionButtonPanelId`).

**Usage:**

```text
$actionButtonPanelId
```

**Returns:** The panel ID of the currently executing button, or empty string if no button is executing.

**Example:**

```text
Current panel ID: $actionButtonPanelId
```

**Related Variables:**

- [`$actionButtonId`](#actionbuttonid) - Get the button ID of the current button
- [`$actionButtonName`](#actionbuttonname) - Get the name of the current button
- [`$actionButtonPanel`](#actionbuttonpanel) - Get all buttons in a panel

## `$actionButtonName`

Returns the name of the currently executing action button (`$actionButtonName`).

**Usage:**

```text
$actionButtonName
```

**Returns:** The name of the currently executing button, or empty string if no button is executing.

**Example:**

```text
You clicked: $actionButtonName
```

**Related Variables:**

- [`$actionButtonId`](#actionbuttonid) - Get the button ID of the current button
- [`$actionButtonPanelId`](#actionbuttonpanelid) - Get the panel ID of the current button
- [`$actionButton`](#actionbutton) - Get detailed info about a button

## `$actionButtonStack`

Returns the call stack of action buttons as an array (`$actionButtonStack`). The stack is also accessible via `$objectWalkPath[$actionButton, stack]`.

**Usage:**

```text
$actionButtonStack
$objectWalkPath[$actionButton, stack]
```

**Returns:** An array of objects, where each object contains `buttonId`, `panelId`, and `buttonName`. The most recent call is at index 0.

**Example:**

```text
Stack depth: $arrayLength[$actionButtonStack]
Most recent button: $objectWalkPath[$arrayElement[$actionButtonStack, 0], buttonName]
```

**Related Variables:**

- [`$actionButtonId`](#actionbuttonid) - Get the current button ID (equivalent to `$objectWalkPath[$arrayElement[$actionButtonStack, 0], buttonId]`)
- [`$actionButtonPanelId`](#actionbuttonpanelid) - Get the current panel ID (equivalent to `$objectWalkPath[$arrayElement[$actionButtonStack, 0], panelId]`)
- [`$actionButtonName`](#actionbuttonname) - Get the current button name (equivalent to `$objectWalkPath[$arrayElement[$actionButtonStack, 0], buttonName]`)

## `$actionButton`

Returns detailed information about a specific action button (`$actionButton`).

**Usage:**

```text
$actionButton
$actionButton[button-uuid]
$actionButton[button-uuid, property]
$actionButton[, property]
```

**Parameters:**

- `button-uuid` (optional): The UUID of the button. If not specified or empty, uses the UUID of the currently executing button.
- `property` (optional): A specific property to retrieve. If not specified, returns the full button info object.

**Returns:** If a property is specified, returns that property value (or empty string if not found). Otherwise returns an object containing button information.

**Button Info Object Properties:**

- `uuid` - Button UUID
- `name` - Button display name
- `icon` - Font Awesome icon class
- `backgroundColor` - Background color
- `foregroundColor` - Foreground color
- `alignment` - Button alignment (left, center, right)
- `onClick` - Visibility behavior on click (hideButton, hidePanel, noVisibilityChanges)
- `extraMetadata` - Custom metadata object
- `stack` - Call stack array (same as `$actionButtonStack`)
- `effectCount` - Number of effects attached to the button

**Examples:**

```text
$actionButton
$actionButton[button-uuid-123]
$actionButton[button-uuid-123, name]
$actionButton[, backgroundColor]
$objectWalkPath[$actionButton, stack]
$objectWalkPath[$actionButton[button-uuid-123], name]
```

**Related Variables:**

- [`$actionButtonId`](#actionbuttonid) - Get just the current button ID
- [`$actionButtonPanel`](#actionbuttonpanel) - Get all buttons in a panel
- [`$actionButtonByName`](#actionbuttonbyname) - Look up a button by name

## `$actionButtonPanel`

Returns a map of all buttons in a panel (`$actionButtonPanel`).

**Usage:**

```text
$actionButtonPanel[panel-id]
```

**Parameters:**

- `panel-id` (required): The UUID of the panel.

**Returns:** An object mapping button UUIDs to their info objects. Returns empty object if panel not found.

**Example:**

```text
$actionButtonPanel[panel-123]
$objectWalkPath[$actionButtonPanel[panel-123], button-uuid-456]
```

**Related Variables:**

- [`$actionButton`](#actionbutton) - Get info about a specific button
- [`$actionButtonByName`](#actionbuttonbyname) - Look up a button by name within a panel
- [`$actionButtonPanelId`](#actionbuttonpanelid) - Get the current panel ID

## `$actionButtonByName`

Looks up an action button by name within a panel (`$actionButtonByName`).

**Usage:**

```text
$actionButtonByName[panel-id, button-name]
```

**Parameters:**

- `panel-id` (required): The UUID of the panel.
- `button-name` (required): The name of the button (case-insensitive).

**Returns:** The button info object for the first matching button, or empty object if not found.

**Example:**

```text
$actionButtonByName[panel-123, Click Me]
$actionButtonByName[$actionButtonPanelId, submit button]
$objectWalkPath[$actionButtonByName[panel-123, Click Me], name]
```

**Related Variables:**

- [`$actionButton`](#actionbutton) - Get info about a button by UUID
- [`$actionButtonPanel`](#actionbuttonpanel) - Get all buttons in a panel
- [`$actionButtonName`](#actionbuttonname) - Get the current button name
