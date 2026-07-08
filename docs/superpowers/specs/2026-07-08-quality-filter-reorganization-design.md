# Design Spec: Quality Filter Reorganization & Brand Extraction Fix

## 1. Goal Description
The purpose of this change is to:
1. Reorganize the "Qualidade" (Quality) filter panel on the Catalog page. Currently, it displays all 22+ dynamic qualities from the Excel sheet in a single unstructured wrapping flex list, which is visually overwhelming and confusing. We will organize them into logical sub-headers.
2. Fix a bug where `[OUTLET]` is extracted as a brand (Marca). This happens because some products have model names starting with `[OUTLET]`, and the brand extractor falls back to the first word when no other prefix matches. We will strip leading bracket tags from models during brand extraction.

## 2. Proposed Changes

### Catalog Component
We will modify [CatalogPage.tsx](file:///c:/Users/Felipe/Desktop/Orçamento fácil/orcamento-rapido-catalogo-xp/src/pages/CatalogPage.tsx) to clean model strings for brand extraction and to render quality filters in grouped categories.

#### Brand Extraction Fix
In the brand extraction logic:
- Add a cleanup step that strips brackets at the beginning of `modelo`, such as `[OUTLET]`, `[DESTAQUE]`, or `[Aro]`.
- Map the brand using this cleaned model string instead of the raw model string.

```typescript
const cleanModelo = modelo.replace(/^\[[^\]]+\]\s*/g, '');
```

#### Quality Classification Logic
We will group the available qualities into 6 categories:
- **Original**: Qualities containing `ORI` (e.g., `ORI`, `ORI VV`)
- **OLED**: Qualities containing `OLED` (e.g., `OLED`, `OLED SELECT`, `OLED [Borda Original]`, `SOFT OLED`)
- **Select**: Qualities containing `SELECT` but not classified as OLED (e.g., `SELECT`, `SELECT LCD`, `SELECT MAX`, `SELECT MAX LCD [Borda Original]`, etc.)
- **Premier**: Qualities containing `PREMIER` (e.g., `PREMIER`, `PREMIER LCD`, `PREMIER MAX`, `PREMIER MAX LCD`)
- **LCD / Incell**: Qualities containing `LCD` that are not already under Select or Premier, or exactly `LCD`, `LCD SELECT`, `LCD VV`.
- **Outras**: Any other qualities like `NACIONAL`, `VIVID`, `CONECTOR`, `CONECTOR TURBO`.

#### UI Layout Update
In the filter section, we will group the pill buttons (badges) under small section titles for each category that has at least one active quality in the catalog.

## 3. Verification Plan
- Verify brand list does not contain `[OUTLET]` or `[DESTAQUE]`.
- Verify the quality filter displays grouped sections (Original, OLED, Select, Premier, LCD, Outras) and that badges function exactly as before.
- Verify filtering works seamlessly for multiple selection.
