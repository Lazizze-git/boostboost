---

You are designing **Tap** — a premium lifestyle mobile app companion for a physical NFC bracelet that lets users share customizable profiles with a single tap. This is not a business card app. This is a social identity tool for people with an active lifestyle. The product sits at the intersection of fashion, tech, and social connection.

---

## Brand & visual identity

The app must feel like a luxury tech object. References: Teenage Engineering (industrial precision), Celine (cold minimalism), Nothing Phone (dark hardware aesthetic). It should feel expensive without being flashy.

**Color tokens:**
- Background primary: `#0C0C0C`
- Background secondary (cards): `#161616`
- Background tertiary (inputs, pills): `#202020`
- Accent: `#C8506A` (deep rose — used sparingly, never as background fill)
- Text primary: `#F0F0F0`
- Text secondary: `#888888`
- Text tertiary: `#444444`
- Border default: `rgba(255,255,255,0.07)`
- Border emphasis: `rgba(255,255,255,0.14)`
- Success: `#3A9A6A`
- Info: `#4A7DD4`
- Warning: `#BA7517`

**Typography:** Inter. Weights: 300 (captions), 400 (body), 500 (labels/headings). Never bold. Size scale: 11 / 13 / 15 / 18 / 24 / 32px. Letter spacing: -0.02em on all headings.

**Spacing grid:** 4px base. Padding inside cards: 16px. Gap between sections: 24px. Screen horizontal padding: 20px.

**Corners:** 12px for cards, 8px for pills and inputs, 999px for round badges.

**No gradients. No glow. No blur backgrounds. No shadows.** Depth is created through border contrast and background stacking only.

---

## App structure — 6 screens to design

---

### Screen 1 — Home (dashboard)

**Header area:**
- Top left: wordmark "tap" in lowercase, Inter 300, #F0F0F0, letter-spacing 0.1em
- Top right: small bracelet icon with a green dot (connected) — tapping opens bracelet settings

**Active mode hero block (most prominent element on screen):**
- Full-width card `#161616`, 16px padding, 12px radius
- Top line: label "mode actif" in 11px uppercase, text tertiary, letter-spacing 0.08em
- Mode name in 32px, weight 300, text primary — e.g. "Soirée"
- Color dot (10px circle, mode color) + mode subtitle in 13px text secondary — e.g. "Insta · Snap · Spotify"
- Bottom right: a subtle tap icon (circle with radiating arc lines) in text tertiary

**Last tap row (inside same card, separated by a 0.5px border):**
- "Dernier tap" label 11px text tertiary
- Initials circle 28px (bg: accent at 15% opacity, text: accent), first name, time — e.g. "Sarah · il y a 2h"

**Quick mode switcher:**
- Section label "changer de mode" 11px uppercase text tertiary
- Horizontal scroll row — 4 pills, each: 36px height, 12px horizontal padding, 8px radius, border `rgba(255,255,255,0.07)`
- Active pill: border accent color, mode name in accent, dot in mode color on left
- Inactive pills: text secondary, dot in mode color on left
- Mode colors: Soirée `#C8506A`, Pro `#4A7DD4`, Sport `#3A9A6A`, Discret `#7A5AC8`

**Stats row:**
- 3 metric tiles in a grid (equal width), `#161616` bg, 8px radius, 12px padding
- Tile 1: "23" in 24px weight 300, "taps ce mois" in 11px text secondary
- Tile 2: "14" in 24px, "retours reçus" in 11px
- Tile 3: "4" in 24px, "modes actifs" in 11px

**Bracelet status bar:**
- Full width, `#161616`, 12px padding, flex row
- Left: small waveform icon + "Bracelet connecté" in 13px text secondary
- Right: battery icon + "87%" in 13px text secondary

**No bottom nav bar.** Use a floating pill button at the bottom center: "Changer de mode" with a small arrow icon. `#1E1E1E` bg, accent color text, border accent at 30% opacity, 48px height, 999px radius.

---

### Screen 2 — Mode editor

**Back navigation:** `← Mes modes` in 13px text secondary, top left.

**Profile preview (top of screen):**
- Avatar circle 56px — initials, bg accent at 20%, text accent, 999px radius
- Name in 18px weight 500, text primary
- Short bio in 13px text secondary — e.g. "DJ le weekend, dev la semaine"
- Mode badge pill below bio: dot + mode name, bg `#202020`, border `rgba(255,255,255,0.1)`, 13px

**Section: "Visible lors du tap"**
- Section label 11px uppercase text tertiary, margin-bottom 8px
- List of enabled fields — each row: 52px height, `#161616` card, 12px radius, full width, 0.5px border
  - Left: platform icon circle (28px, bg platform color at 15%, icon in platform color), platform name 14px text primary, handle value 13px text tertiary
  - Right: toggle ON state (accent color track, white thumb)
  - Tapping the row opens an inline edit for the value

**Section: "Masqué"**
- Same style but everything at 40% opacity
- Toggle OFF state (dark track, dim thumb)
- Label "Masqué" 11px uppercase text tertiary

**Fields available:** Instagram (rose), Snapchat (yellow), LinkedIn (blue), Spotify (green), TikTok (near-black), Numéro (neutral), WhatsApp (green), Portfolio (purple), Email (blue), Contact urgence (red)

**Bottom sticky CTA:** "Enregistrer" — full width, 52px height, `#C8506A` bg, white text 15px weight 500, 12px radius. Floating above tab area with 16px bottom margin.

---

### Screen 3 — Contacts reçus

**Header:** "Contacts" in 24px weight 300. Subtitle: "14 personnes ont partagé en retour" in 13px text secondary.

**Filter row:** Horizontal scroll of mode pills (same style as home screen). "Tous" selected by default, accent border.

**Contact list:**
- Each row: `#161616` card, 12px radius, 16px padding, flex row, full width, 0.5px border, margin-bottom 8px
- Left: initials circle 40px (random background from mode colors at 20%, text at full)
- Center column: first name 14px weight 500 text primary / time + mode badge on second line (11px text tertiary — e.g. "hier 23h14 · Soirée")
- Right: chevron icon text tertiary + optional "Nouveau" badge if unseen (accent bg, white text 10px)
- Tapping row expands to show: platforms they shared, small icon row

**Empty state (if no contacts):** centered, 60px circle with tap icon, "Personne encore" 15px weight 300, "Fais un tap pour commencer" 13px text secondary.

---

### Screen 4 — Bracelet settings

**Header:** `← Accueil`, "Mon bracelet" 24px weight 300.

**Bracelet card:**
- Large card `#161616`, centered bracelet illustration (simple SVG — circle band with a small central gem)
- Status row: green dot + "Connecté via Bluetooth" 13px
- Battery: `87%` with progress bar (accent color fill, `#202020` track, 4px height, 999px radius)
- Firmware: "v1.2.4 — à jour" 13px text secondary

**Sections list:**
- "Comportement du double-tap" → select which mode to cycle through
- "LED de confirmation" → toggle on/off
- "Vibration" → toggle on/off
- "Mode automatique par heure" (premium badge) → configure schedule
- "Mode automatique par lieu" (premium badge) → configure geofences

**Danger zone:**
- "Dissocier le bracelet" — 13px text danger, no card, no button, just a plain tappable row with a trash icon

---

### Screen 5 — Analytics (premium screen)

**Header:** "Stats" 24px weight 300. Month picker row below: `< Mars 2026 >` in 13px.

**Summary metrics:** Same 3-tile grid as home.

**Tap activity chart:**
- 28-day bar chart — bars in `#202020`, active day bars in accent color
- X axis: day numbers, 11px text tertiary
- No Y axis — just subtle horizontal guide lines `rgba(255,255,255,0.04)`

**Mode breakdown:**
- Horizontal bar chart for each mode — mode color fill, label left, count right
- E.g. "Soirée ████████░░ 18"

**"Qui a tapé" section:**
- Same list as contacts screen but sorted by frequency

---

### Screen 6 — Recipient web profile (mobile browser, no app)

This is not the app — it's the web page that opens on the recipient's phone when they tap the bracelet. Design it inside a phone browser chrome frame (Safari-style — gray address bar at top showing `tap.io/j/abc123`).

**Full page layout:**

**Hero:**
- Black background `#0C0C0C` full screen
- Avatar circle 72px, centered, initials, accent bg at 20%, accent text
- Name 24px weight 300 centered, text primary
- Short bio 13px text secondary centered
- Active mode badge: "Mode soirée" pill, `#1E1E1E` bg, border `rgba(255,255,255,0.1)`, mode dot + name

**Shared fields section:**
- White-ish surface block `#F8F8F8` covering bottom 60% of screen, 24px top radius (bottom sheet style)
- Each shared field: full-width row, 56px height, 0.5px bottom border `rgba(0,0,0,0.07)`
- Left: platform icon circle 32px (platform brand color bg at 15%), platform name 14px `#1A1A1A` weight 500
- Right: handle or value 13px `#888888` + external link icon

**CTAs at bottom (sticky):**
- Primary: "Enregistrer le contact" — full width, 52px, `#0C0C0C` bg, white text, 12px radius
- Secondary: "Partager mon contact en retour" — full width, 52px, white bg, `#0C0C0C` border 0.5px, `#0C0C0C` text, 12px radius, margin-top 8px

**Footer:**
- "Propulsé par tap" in 11px `#BBBBBB` centered, with small logo mark
- Absolutely no "download the app" prompt anywhere

---

## Interactions & micro-details to include

- Mode switch on home: tapping a pill triggers a subtle scale animation on the hero block (show it with an overlay state)
- Toggle fields in editor: smooth left/right with color change
- Contact row expansion: show an expanded state for one contact (second row fades in below)
- Bracelet connected dot: pulsing animation ring (show as static with ring visible)
- "Nouveau" badge on unseen contacts: accent background, white text, 999px radius, 10px font

---

## What to deliver

Design all 6 screens at 390×844px (iPhone 14 size). Include one dark overlay state (mode switch in progress). Add a 7th artboard: all screens side by side on a `#080808` background with 40px gap between them — as a showcase layout.

Every screen must feel like it belongs to the same system. No inconsistencies in spacing, typography weight, or color usage.

---

Tu colles ça directement dans v0, Galileo ou même dans le chat d'un designer — c'est suffisamment précis pour produire quelque chose d'utilisable au premier essai.