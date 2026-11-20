# Design System: I.E. Bandera del Perú

This is the visual specification for the PHP portal and CMS. Use it as the design brief in Google Stitch for new or revised screens. The portal serves families and students. The CMS serves the school staff who publish the information.

## 1. Visual Theme & Atmosphere

The portal feels like an editorial front page for a public institution. Warm paper, a firm navy structure and the school's red establish the identity. The photograph of the real campus carries the visual weight. Headlines and surfaces stay orderly enough for someone to find a circular, document or date quickly.

Use density 4, visual variance 7 and motion 3 for the portal. The CMS uses density 6, variance 5 and motion 2. A navy navigation rail anchors a light workspace. Let a record's title, status and next action be the first details a staff member notices.

## 2. Color Palette & Roles

| Name | Light | Dark | Role |
| --- | --- | --- | --- |
| Warm Paper | `#F7F6F3` | `#111A28` | Public canvas and article surroundings |
| Console Slate | `#F2F5F9` | `#101925` | CMS workspace |
| Quiet Surface | `#FFFFFF` | `#182437` | Forms, header, menus and important cards |
| Soft Slate | `#F0F3F7` | `#223047` | Read-only fields, toolbar and neutral chips |
| Navy Ink | `#14233A` | `#F2F6FC` | Primary text |
| Muted Slate | `#566479` | `#C2CEE1` | Metadata, hints and secondary text |
| Structural Border | `#DAE1E9` | `#36455B` | Dividers and surface boundaries |
| Field Boundary | `#A4B1C2` | `#7C8DA9` | Inputs and editable surfaces |
| Institutional Navy | `#15263F` | `#15263F` | Hero, publication rail and footer |
| School Red | `#BC2838` | `#BC2838` | The single action accent and selected-navigation tint |
| Structured Link | `#274B7C` | `#AACBFF` | Text links and informational icons |

Use white on red. The pressed red is `#A31E2D`. Use `#FCEBEE` in light mode and `#3F2939` in dark mode for the subtle red background. Focus has a visible 3 px outline. Use `#437AC5` in light mode, `#A6CFFF` in dark mode and `#FFDBA7` on the navy sidebar and footer. Green and amber describe publication status only. Neutral chips indicate drafts and red chips indicate urgent alerts or removal.

## 3. Typography Rules

- Use the self-hosted Manrope variable family for both surfaces. Use a system sans-serif fallback when the font is unavailable. Symbols use the self-hosted, subsetted Material Symbols Rounded family.
- Set public display titles at 44–66 px, weight 800, line height 1.1 and letter spacing around −0.055 em. Give the title no more than 16 characters of line measure in the hero column.
- Set workspace titles at 32–51 px and group headings at 19 px, weight 800. Put metadata and breadcrumbs at 13–14 px. Keep general body text at 16 px, weight 500, with line height near 1.6. Limit long editorial prose to about 65 characters per line. Use tabular numerals for published dates and counts.
- Use meaningful concise labels. Keep the school’s name intact and text-based for reading and search. Use an inline photo at type height in a campaign headline only when it illustrates that campaign. Move it into its own image region on mobile. The institutional homepage uses the campus in a dedicated image panel.

## 4. Component Stylings

- **Buttons.** Give primary actions a red fill and white text. Use neutral outlines for preview, discard context and filter actions. Show a 1 px downward press on interaction. Use icons with labels on unclear actions and accessible labels on icon-only buttons.
- **Cards.** Use 16 px corners and a quiet border. Give the feature image its own 16:9 container so a portrait or panorama never changes the grid height. Elevate the lead item and use compact text cards for supporting news. The CMS uses rows when people need to compare titles and states.
- **Inputs.** Place labels above controls, in the same left alignment. Use 44 px minimum control height and a 10 px radius. Keep field validation attached to the relevant input and give the error summary a visible focus target.
- **Editor.** Use separate surfaces for writing, metadata and files. At wide sizes the publication inspector sits to the right. Keep preview, save and publication status visible in the flow. Use a compact formatting toolbar with accessible names.
- **Loading, empty and error states.** Use a layout-matched placeholder if data actually has to load. Show a small outlined symbol and a specific sentence when a list is empty. Provide an action if one is available. Use inline validation and a distinct retry message when data is unavailable.
- **Login.** Use a two-panel composition with the real campus photograph and a short login form. Keep field labels, submit and return navigation visible without relying on a placeholder.

## 5. Layout Principles

Use a content width of 1216 px with 16–48 px gutters. The hero has a 47/53 split, a navy copy area and a separate daylight photo. Align all copy to the left. The hero has one primary action. Follow it with shortcuts, recent news, and paired event and notice sections. Use the actual navigational landmarks and page hierarchy in subsequent screens.

Use CSS Grid for structural columns. Prefer a large lead story with smaller adjacent items to a row of identical feature cards. Leave structural gaps of 16–32 px and section gaps of 40–68 px. Use a navy sidebar around 240 px wide for the desktop CMS. Group administration modules by publication, institution and site configuration. Below 768 px, stack reading, shortcuts and editing sections into a single column. At widths up to 920 px, collapse the navigation into a labeled button and provide an accessible disclosure for CMS modules. Keep touch targets at least 44 px tall, and size empty or wide states without horizontal scrolling.

## 6. Motion & Interaction

Use 150–200 ms ease-out for hover and press changes. Use a light spring (stiffness 100, damping 20) only if a future interaction benefits from physical movement. Reveal successive items with short 25 ms differences when delayed content genuinely arrives. Animate movement with transform and opacity. Limit repeated animation to active waits, such as a skeleton when the network is busy. In the PHP portal, SSR content appears immediately. Keep the carousel under user control. Honor reduced motion and retain visible focus when a menu or editor control closes.

## 7. Anti-Patterns

Avoid neon or multicolor accents, pure black, generic serif fonts, Inter, gradient text, decorative cursor effects and overlapping copy. Avoid centered hero copy, repeated decorative badges, identical feature-card grids, novelty emoji and generic marketing language. Do not add unverified school figures, names or addresses. Use licensed local assets and the school's actual crest and campus photograph. In examples, label any nonofficial publication as sample content outside the interface.
