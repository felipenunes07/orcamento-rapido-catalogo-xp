# Quality Filter Reorganization & Brand Extraction Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the dynamic Qualidade filters on the CatalogPage to group them under clear sub-headers (Original, OLED, Select, Premier, LCD, Outras) and fix the `[OUTLET]` brand extraction bug.

**Architecture:** Modify CatalogPage.tsx to clean bracket prefixes before extracting brands and to categorize dynamic quality strings into mapped groups before rendering them in separate flex layouts.

**Tech Stack:** React, Tailwind CSS, TypeScript, Lucide Icons

## Global Constraints
- Do not introduce unused imports or variable errors.
- Ensure TypeScript compiles cleanly.

---

### Task 1: Fix Brand Extraction Bug

**Files:**
- Modify: [CatalogPage.tsx](file:///c:/Users/Felipe/Desktop/Orçamento fácil/orcamento-rapido-catalogo-xp/src/pages/CatalogPage.tsx:293-358)

**Interfaces:**
- Consumes: `activeProducts` array containing product details.
- Produces: `availableBrands` array representing only valid brand names, free of bracket prefixes (like `[OUTLET]`, `[DESTAQUE]`).

- [ ] **Step 1: Modify the brand mapper logic to sanitize `modelo` before matching brand prefixes**

```typescript
        // Extrair a marca do modelo com base nos prefixos conhecidos (apenas produtos ativos)
        const brands = activeProducts.map((product) => {
          const modelo = product.modelo

          // Verificar se o modelo existe e não está vazio
          if (!modelo || modelo.trim() === '') {
            return null
          }

          // Baterias: marca vem por extenso no início do modelo
          if (isBateria) {
            return getBateriaBrand(modelo)
          }

          // Remover tags entre colchetes no início (ex: [OUTLET], [DESTAQUE]) para evitar falsos positivos
          const cleanModelo = modelo.replace(/^\[[^\]]+\]\s*/g, '')

          // Verificar prefixos conhecidos
          for (const [prefix, brandName] of Object.entries(brandMapping)) {
            if (cleanModelo.startsWith(prefix)) {
              return brandName
            }
          }

          // Verificação específica para modelos Xiaomi (começam com MI)
          if (cleanModelo.startsWith('MI')) {
            return 'Xiaomi'
          }

          // Verificação específica para modelos Realme
          if (cleanModelo.startsWith('REALME')) {
            return 'Realme'
          }

          // Verificação específica para modelos OPPO (qualquer variação)
          if (cleanModelo.toUpperCase().startsWith('OPPO')) {
            return 'OPPO'
          }

          // Verificação específica para modelos Asus (começam com ZF)
          if (cleanModelo.startsWith('ZF')) {
            return 'Asus'
          }

          // Verificação específica para DOC DE CARGA (qualquer variação)
          if (
            cleanModelo.toUpperCase().includes('DOC DE CARGA') ||
            cleanModelo.toUpperCase().startsWith('DOC')
          ) {
            return 'DOC DE CARGA'
          }

          // Verificação específica para HONOR
          if (cleanModelo.toUpperCase().startsWith('HONOR')) {
            return 'Honor'
          }

          // Verificação específica para HUAWEI
          if (cleanModelo.toUpperCase().startsWith('HUAWEI')) {
            return 'Huawei'
          }

          // Se não encontrar um prefixo conhecido, usar a primeira palavra como fallback
          const modelParts = cleanModelo.split(' ')
          const firstPart = modelParts[0]

          // Verificar se a primeira parte não está vazia
          if (firstPart && firstPart.trim() !== '') {
            return firstPart
          }

          return null
        })
```

- [ ] **Step 2: Save the file and run build check to ensure compilation succeeds**

Run: `npm run build`
Expected: Successful compilation without TypeScript errors.

- [ ] **Step 3: Commit the brand extraction fix**

```bash
git add src/pages/CatalogPage.tsx
git commit -m "fix: resolve [OUTLET] brand extraction bug by cleaning leading bracket tags"
```

---

### Task 2: Reorganize Quality Filter UI

**Files:**
- Modify: [CatalogPage.tsx](file:///c:/Users/Felipe/Desktop/Orçamento fácil/orcamento-rapido-catalogo-xp/src/pages/CatalogPage.tsx:1162-1195)

**Interfaces:**
- Consumes: `availableQualities` array of strings, `selectedQualities` array of strings.
- Produces: Beautifully segmented UI rendering quality badge options grouped under sub-headers.

- [ ] **Step 1: Define the `QualityGroup` interface and `QUALITY_GROUPS` configuration in `CatalogPage.tsx`**

Add these declarations at the top level or inside the component:

```typescript
interface QualityGroup {
  id: string
  name: string
  match: (q: string) => boolean
}

const QUALITY_GROUPS: QualityGroup[] = [
  {
    id: 'original',
    name: 'Original (ORI)',
    match: (q) => q.toUpperCase().includes('ORI'),
  },
  {
    id: 'oled',
    name: 'OLED',
    match: (q) => q.toUpperCase().includes('OLED'),
  },
  {
    id: 'select',
    name: 'Select',
    match: (q) => q.toUpperCase().includes('SELECT') && !q.toUpperCase().includes('OLED'),
  },
  {
    id: 'premier',
    name: 'Premier',
    match: (q) => q.toUpperCase().includes('PREMIER'),
  },
  {
    id: 'lcd',
    name: 'LCD / Incell',
    match: (q) =>
      (q.toUpperCase().includes('LCD') || q.toUpperCase() === 'INCELL') &&
      !q.toUpperCase().includes('SELECT') &&
      !q.toUpperCase().includes('PREMIER'),
  },
  {
    id: 'outros',
    name: 'Outras Qualidades',
    match: (q) => {
      const upper = q.toUpperCase()
      return (
        !upper.includes('ORI') &&
        !upper.includes('OLED') &&
        !upper.includes('SELECT') &&
        !upper.includes('PREMIER') &&
        !upper.includes('LCD') &&
        upper !== 'INCELL'
      )
    },
  },
]
```

- [ ] **Step 2: Replace the single list rendering block with the grouped rendering block in the TSX layout**

Replace:
```typescript
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {availableQualities.map((quality) => (
                        <Badge
                          key={quality}
                          variant="outline"
                          className={`
                          relative overflow-hidden
                          cursor-pointer 
                          text-[11px] md:text-xs
                          py-1.5 md:py-2
                          px-3 md:px-4
                          rounded-lg md:rounded-xl
                          border-2
                          transition-all
                          duration-200
                          font-medium
                          ${selectedQualities.includes(quality)
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border-transparent shadow-md hover:shadow-lg scale-105'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-700 hover:shadow-sm hover:bg-blue-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:text-blue-400 dark:hover:bg-gray-700'
                            }
                        `}
                          onClick={(e) => handleSelectQuality(quality, e)}
                        >
                          {quality}
                          {quality.toUpperCase().includes('VV') && (
                            <span
                              className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500"
                              style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
                              title="Possui vídeo de apresentação"
                            />
                          )}
                        </Badge>
                      ))}
                    </div>
```

With:
```typescript
                    <div className="space-y-4">
                      {QUALITY_GROUPS.map((group) => {
                        const qualitiesInGroup = availableQualities.filter(group.match)
                        if (qualitiesInGroup.length === 0) return null

                        return (
                          <div key={group.id} className="space-y-1.5">
                            <span className="text-[11px] font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase block pl-1">
                              {group.name}
                            </span>
                            <div className="flex flex-wrap gap-1.5 md:gap-2">
                              {qualitiesInGroup.map((quality) => (
                                <Badge
                                  key={quality}
                                  variant="outline"
                                  className={`
                                  relative overflow-hidden
                                  cursor-pointer 
                                  text-[11px] md:text-xs
                                  py-1.5 md:py-2
                                  px-3 md:px-4
                                  rounded-lg md:rounded-xl
                                  border-2
                                  transition-all
                                  duration-200
                                  font-medium
                                  ${selectedQualities.includes(quality)
                                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border-transparent shadow-md hover:shadow-lg scale-105'
                                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-700 hover:shadow-sm hover:bg-blue-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:text-blue-400 dark:hover:bg-gray-700'
                                    }
                                `}
                                  onClick={(e) => handleSelectQuality(quality, e)}
                                >
                                  {quality}
                                  {quality.toUpperCase().includes('VV') && (
                                    <span
                                      className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500"
                                      style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
                                      title="Possui vídeo de apresentação"
                                    />
                                  )}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
```

- [ ] **Step 3: Save file and run build check to ensure compilation succeeds**

Run: `npm run build`
Expected: Successful compilation without TypeScript errors.

- [ ] **Step 4: Commit the quality filter reorganization**

```bash
git add src/pages/CatalogPage.tsx
git commit -m "feat: group qualities under distinct sub-headers in filter UI"
```
