# Branding & Visual Guidelines

**Version:** 1.0  
**Style:** Professional Pacific & Reef-Inspired Design System  
**Applications:** Corporate websites, government platforms, dashboards, applications, presentations, reports and official documents.

## 1. Brand Identity

A formal, modern visual identity inspired by Pacific oceans, reefs, people, and innovation.

**Brand attributes:** Trust, professionalism, accessibility, innovation, sustainability, and Pacific identity.

**Design principles:**
- Prioritise clarity, consistency, accessibility, and responsive layouts.
- Use colour purposefully; white space should dominate.
- Use subtle Pacific reef and wave motifs as supporting elements, not distractions.
- Maintain a professional tone across digital and printed materials.

## 2. Official Colour Palette

### Core colours

| Colour | Hex | Primary usage |
|---|---|---|
| Ocean Blue | `#164B91` | Navigation, headings, official branding, primary actions |
| Sunset Orange | `#F28C28` | Highlights, calls to action, active elements |
| Royal Purple | `#6941A5` | Innovation, premium features, secondary accents |
| Pure White | `#FFFFFF` | Backgrounds, content surfaces, whitespace |
| Reef Teal | `#19A7A0` | Pacific identity, supporting accents, data visualisation |

### Supporting colours

| Colour | Hex | Usage |
|---|---|---|
| Lagoon Mist | `#EAF4F8` | Light section backgrounds |
| Seafoam | `#D9F1EC` | Subtle reef-themed backgrounds |
| Deep Navy | `#24344D` | Body headings and high-contrast text |
| Cloud White | `#F5F7FA` | Alternative page background |

**Recommended visual colour distribution:** White 55%, Ocean Blue 25%, Reef Teal 10%, Purple 6%, Orange 4%. These are aesthetic guidelines, not strict colour-area requirements.

### Colour use rules

- Use Ocean Blue for the main navigation and principal actions.
- Use Sunset Orange sparingly for emphasis and key highlights.
- Use Purple for supporting sections and secondary actions.
- Use Reef Teal for marine-inspired decoration, indicators and charts.
- Keep most content backgrounds white or very light.
- Check all text/background combinations for WCAG AA contrast: at least **4.5:1** for normal text and **3:1** for large text. Do not assume white text over Orange or Reef Teal passes.
- Never convey meaning through colour alone.

## 3. Formal Typography

### Font families

1. **Inter** — primary font for websites, interfaces, navigation, headings, and buttons.
2. **Source Sans 3** — secondary font for paragraphs, forms, guidance, and reports.
3. **Georgia** — optional formal serif font for certificates, ceremonial titles, and official correspondence.

Use system fallbacks: `Arial, Helvetica, sans-serif` for digital type if the preferred fonts are unavailable.

### Digital typography scale

| Element | Desktop | Mobile | Font | Weight |
|---|---:|---:|---|---:|
| H1 — Main title | 36px | 28px | Inter | 700 |
| H2 — Section title | 28px | 24px | Inter | 600 |
| H3 — Subheading | 22px | 20px | Inter | 600 |
| H4 — Card title | 18px | 18px | Inter | 600 |
| Body text | 16px | 16px | Source Sans 3 | 400 |
| Button text | 14px | 14px | Inter | 600 |
| Labels and captions | 12–14px | 12–14px | Inter / Source Sans 3 | 500–600 |

**Typography rules:**
- Use sentence-case headings.
- Body line height: **1.5–1.7**.
- Keep paragraphs short, with sufficient spacing.
- Avoid multiple competing fonts in the same design.
- Use actual semantic heading levels (`h1`–`h4`) in web projects.
- For printed reports, use approximately 11–12pt body text with clear heading hierarchy.

## 4. Layout & Spacing

| Component | Guideline |
|---|---|
| Page background | White or Cloud White |
| Navigation/header | Ocean Blue with white text |
| Cards/panels | White with subtle border and 12px corner radius |
| Primary buttons | Ocean Blue with white text |
| Secondary buttons | Purple (with verified contrast) or outlined Blue |
| Accent elements | Sunset Orange and Reef Teal |
| Icons | Minimal, consistent style; 20–24px |
| Main content width | Maximum 1200–1440px |
| Mobile layout | Responsive; single-column where appropriate |
| Spacing system | 8px base grid (8, 16, 24, 32, 40, 48, 64px) |
| Interactive states | Visible focus ring, clear hover/active/disabled states |

**Recommended responsive breakpoints:**
- Mobile: below 640px
- Tablet: 640–1023px
- Desktop: 1024px and above

## 5. Pacific & Reef Visual Identity

Use reef-inspired illustrations and abstract coral, ocean waves, lagoon curves and geometric Pacific-inspired motifs. Select imagery respectfully and ensure cultural patterns are used with appropriate context and permission when needed.

- Use decorative patterns as low-contrast backgrounds or section dividers.
- Keep imagery authentic and high quality.
- Avoid excessive gradients, textures, and decorative overlays.
- Ensure brand graphics never reduce readability.

## 6. Interface Components

### Buttons

- **Primary:** Ocean Blue background, white label, clear focus ring.
- **Secondary:** Purple background with verified accessible contrast, or Blue outline on White.
- **Accent:** Orange emphasis where appropriate; use dark text if white-text contrast is insufficient.
- Minimum recommended target size: **44 × 44px** for touch interaction.

### Cards

- Use white surfaces, subtle borders and consistent internal spacing.
- Use an 8–12px radius consistently.
- Prefer readable labels and clear hierarchy over elaborate effects.

### Forms

- Labels must remain visible; do not rely on placeholders alone.
- Provide helpful inline validation and error text.
- Indicate required fields by text, not colour alone.

### Charts and data

- Use Ocean Blue, Purple, and Reef Teal as main chart colours.
- Reserve Orange for highlighted series or exceptions.
- Always include legends/labels and accessible descriptions.

## 7. Applications

This identity is suitable for:

- Websites, portals, and administration dashboards
- Digital public-service platforms and internal systems
- Official reports, proposals, and correspondence
- Presentations, templates, and publications
- Social-media campaign graphics and corporate communications

## 8. Branding Checklist

- [ ] Use approved colours and typography.
- [ ] Maintain consistent headings, spacing and components.
- [ ] Check text and control contrast against WCAG AA.
- [ ] Provide accessible states and labels for interactive elements.
- [ ] Review layouts on mobile, tablet, and desktop.
- [ ] Use Pacific/reef motifs subtly and respectfully.
- [ ] Keep all materials formal, modern, and uncluttered.

## 9. CSS Design Tokens

```css
:root {
  --brand-blue: #164B91;
  --brand-orange: #F28C28;
  --brand-purple: #6941A5;
  --brand-white: #FFFFFF;
  --brand-reef: #19A7A0;
  --brand-lagoon-mist: #EAF4F8;
  --brand-seafoam: #D9F1EC;
  --brand-deep-navy: #24344D;
  --brand-cloud-white: #F5F7FA;

  --font-heading: 'Inter', Arial, Helvetica, sans-serif;
  --font-body: 'Source Sans 3', Arial, Helvetica, sans-serif;
  --font-formal: Georgia, 'Times New Roman', serif;

  --text-h1: 36px;
  --text-h2: 28px;
  --text-h3: 22px;
  --text-h4: 18px;
  --text-body: 16px;
  --text-button: 14px;
  --text-caption: 12px;

  --space-unit: 8px;
  --radius-card: 12px;
  --content-max-width: 1440px;
}

@media (max-width: 639px) {
  :root {
    --text-h1: 28px;
    --text-h2: 24px;
    --text-h3: 20px;
  }
}
```

---

**Governance:** Treat this document as the baseline branding standard. Any changes to core colours, fonts, or component rules should be applied consistently across all branded outputs.
