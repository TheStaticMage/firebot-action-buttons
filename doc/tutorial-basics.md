# Tutorial: Approve Channel Reward Requests with Action Buttons

This walkthrough shows how to use the Action Buttons plugin to review a channel reward redemption from the chat feed. It starts from a brand-new reward and wires up an approval workflow inside Firebot. This reward doesn't actually do anything useful, but it demonstrates the concepts that you can then expand upon.

## What you will build

- A channel reward that stays in the Twitch Reward Requests Queue.
- A chat feed alert that fires as soon as the reward is redeemed.
- An action button panel under that alert with Approve and Reject buttons that update the redemption.

## Steps

### 1) Create the channel reward

1. Open Firebot and click **Channel Rewards** in the left sidebar.
2. Click `New Channel Reward` and fill in the **Reward Name**, **Description**, and **Cost** for your approval-required reward.
3. Scroll to **Skip Twitch Reward Requests Queue** and turn the toggle Off so the redemption stays pending.
4. Adjust limits, background color, and other settings as desired.

### 2) Prepare the effect list

1. In the **When Redeemed** section, find the `Manage Effects` list.
2. If any effects are present, use the effect menu on each entry and click `Delete` until the list is empty.

### 3) Add the chat feed alert

1. Still inside **When Redeemed**, click `Add Effect`.
2. Search for **Chat Feed Alert** and select it.
3. In the effect options:
   - Set **Alert Message** to something like `Reward request from $userDisplayName[$username] is waiting for approval.`
   - Pick an **Icon** with the icon picker (for example, a check-circle).
4. Click **Save** in the effect modal. The effect output `messageId` will be used next.

### 4) Create the action button panel

1. Click `Add Effect` again.
2. Select **Create Action Button Panel**.
3. In **Panel Positioning**, pick `Insert after specific message` and set **Message ID** to `$effectOutput[messageId]` so the panel appears under the alert.
4. In the **Action Buttons** editor, click `Add Button` twice to create `Approve` and `Reject`.

   For the **Approve** button:

   - Set **Button Name** to `Approve` and pick a check icon.
   - Set **Alignment** to `Center`.
   - Choose a green **Background Color** and white **Foreground Color**.
   - Set **On Click** to `Hide panel` so the buttons disappear after use.
   - Under **Effects to Execute on Click**, click `Add Effect`, choose **Approve/Reject Channel Reward Redemption**, set **Use current reward**, **Use current redemption**, and set **Action** to `Approve`, then add.

   For the **Reject** button:

   - Set **Button Name** to `Reject` with a clear icon.
   - Set **Alignment** to `Center`.
   - Choose a red **Background Color** and white **Foreground Color**.
   - Set **On Click** to `Hide panel`.
   - Under **Effects to Execute on Click**, add **Approve/Reject Channel Reward Redemption** with **Use current reward**, **Use current redemption**, and set **Action** to `Reject`, then add.

5. Save the effect configuration to return to the reward modal.

### 5) Save and try it

1. Click **Save** in the **Add/Edit Channel Reward** modal.
2. Go to your chat and redeem the reward.
3. In Firebot, click **Channel Rewards** in the left sidebar, and then click **Request Queue**. You should see the redemption in the queue. (Don't act upon it yet!)
4. Click **Dashboard** in the left sidebar. Ensure that the chat feed alert and approve/reject buttons appear in the Firebot chat feed.
5. Click either the **Approve** or **Reject** button. The button panel should disappear. This will also remove the redemption from the request queue.
