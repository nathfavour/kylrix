# Stop Sharing & Share Icon Color Issues

## Overview
This document outlines the problems faced when stopping resource sharing (completely or for guests) and how it affects the visual state of the share icon.

---

## 1. The Share Flow (Works Perfectly)
*   **One-Click Share**: When clicking "Share" from the context menu, it hooks into the exact same pathway as the direct `ShareLockButton` click, triggering `toggleResourcePublicGuest` with `mode: 'publish'`.
*   **State Update**: It successfully updates the model and fires `onUpdate?.({ isPublic: true, isGuest: true })` which updates the local React state and database, instantly coloring the share icon.

---

## 2. The Stop Sharing Flow (Fails to Respond Instantly)
*   **Stop Sharing Completely**: When toggled off from the `AccessControlDrawer`, the changes save correctly on the server, but the icon remains colored in the parent context. This is due to state-propagation lag or missing parameters in the callback triggers that update the live query array, causing the icon to stay highlighted.
*   **Stop Sharing to Guests (Half Coloration)**:
    *   **Goal**: If guest access is off but public access is on, the icon should display as half-colored/half-uncolored.
    *   **Current Failure**: Rather than rendering half-opacity or partial color, the icon's color property styling fails to correctly map the exact `isPublic` and `isGuest` variables reactively when changed via the drawer.
    *   **Color States**:
        1.  *Not Shared*: Neither public nor guest is checked. The icon is fully uncolored (`rgba(255, 255, 255, 0.15)`).
        2.  *Half Shared (Public only)*: Authenticated users can view. The icon is half colored.
        3.  *Fully Shared (Public & Guest)*: Anyone can view, and link previews generate correctly. The icon is fully colored.
