# Chat first, then the result

Owner correction, 7 October 2026. The prior release was rejected: an oversized editorial question above an already visible case study is not a chat-first experience. Passing tests did not establish the requested visual behavior.

## Observable acceptance

1. While the example question types, neither the AI answer nor any project result is visible.
2. The AI answer appears next; the project result remains hidden until that answer finishes entering.
3. The existing case study then appears as the result. It must not flash before hydration.
4. The prompt is a normal-size right-aligned chat message. The AI reply is left-aligned. No giant question headline, metadata table or divider separating a second hero.
5. All content remains in the exported HTML. No-JS and reduced motion show the complete state immediately. Skip completes the visual sequence. Automatic playback is silent.
6. Direct project entries and refresh play the conversation. Back/Forward restores the completed result. Previously stored visit flags must not suppress the new interaction.
7. Home is a single centered AI start surface with the real composer, suggested questions and compact real-project shortcuts. Full selected work continues below. The mobile send button must remain visible.
8. One icon-only audio control appears in the toolbar. It opens a native popover containing interface sound mute and optional music. Escape/light dismissal work; mute persists; opening the popover plays no sound.

## Implementation

Canonical prompt/response facts and all six study implementations stay unchanged. `ProjectOpener` controls presentation through Web Animations API: 180 ms settling, typing capped at 1,350 ms, 160 ms pause, 280 ms answer entry, then result reveal. The result's visibility is held back, not its DOM creation. Only the opening header fades; the full long article is not composited for opacity animation.

A scripting-enabled CSS guard prevents the server-rendered result flashing before the client chooses whether to play. No-JS/reduced-motion modes bypass it. The native audio popover consolidates two prior toolbar buttons without replacing the sound engine or adding autoplay. Home continues using the existing Composer and Ask request/busy/Stop implementation.

## Verification

The intro suite now checks the **typing**, **answer-only**, and **completed result** phases separately, rather than checking only that the final DOM exists. It also checks direct refresh, history, Skip/Replay keyboard focus, silent automatic animation, gesture sound and real Ask separation. Shell tests open the unified audio popover before exercising mute persistence and verify its native Escape behavior. The full route matrix checks the Home send button and real project preview visibility at 1440/834/390/320 px.

Screenshots and a real browser recording are in `docs/chat-fix/screenshots/`. No product screenshots, facts, AI context, thumbnails or project inventory changed.
