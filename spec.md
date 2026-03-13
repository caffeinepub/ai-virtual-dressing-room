# AI Virtual Dressing Room

## Current State
New project, no existing code.

## Requested Changes (Diff)

### Add
- Live webcam feed displayed in the app
- A collection of dress/clothing overlays the user can browse and select
- Selected clothing is rendered on top of the webcam feed using canvas, aligned to the person's torso area
- Controls to adjust overlay position, scale, and opacity
- Toggle to show/hide the overlay

### Modify
N/A

### Remove
N/A

## Implementation Plan
- Backend: store a catalog of dress items (name, image URL) -- use sample/static data
- Frontend:
  - Webcam feed via camera component
  - Canvas layer over webcam to draw dress overlay
  - Sidebar with dress thumbnails to select from
  - Drag/resize controls for overlay positioning
  - Opacity slider
  - Toggle overlay visibility
