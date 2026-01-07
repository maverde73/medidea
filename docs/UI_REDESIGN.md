# 📘 MEDIDEA - Piano Completo Redesign UI
## Admin Panel Moderna con Sidebar Collassabile

**Data creazione:** 19 Novembre 2024
**Versione:** 1.0
**Status:** ✅ Approvato - In Implementazione

---

## 📊 INDICE

1. [Analisi Situazione Attuale](#1-analisi-situazione-attuale)
2. [Obiettivi del Redesign](#2-obiettivi-del-redesign)
3. [Design System](#3-design-system)
4. [Architettura Componenti](#4-architettura-componenti)
5. [Struttura Layout](#5-struttura-layout)
6. [Specifiche Sidebar](#6-specifiche-sidebar)
7. [Specifiche Header](#7-specifiche-header)
8. [Sistema di Navigazione](#8-sistema-di-navigazione)
9. [Responsive Design](#9-responsive-design)
10. [Piano di Migrazione](#10-piano-di-migrazione)
11. [File da Creare/Modificare](#11-file-da-crearemmodificare)
12. [Timeline e Priorità](#12-timeline-e-priorità)

---

## 1. ANALISI SITUAZIONE ATTUALE

### 1.1 Problemi Identificati

**❌ Navigazione Frammentata**
- Ogni pagina ha il proprio header
- Nessuna navigazione persistente
- Solo pulsanti "Torna indietro"
- Homepage con card isolate

**❌ Design Inconsistente**
- Stili diversi tra pagine
- Colori poco coordinati
- Manca gerarchia visiva chiara
- Layout troppo basic

**❌ UX Limitata**
- Nessun breadcrumb per orientamento
- Manca user profile visibile
- No logout accessibile
- Mobile experience povera

---

## 2. OBIETTIVI DEL REDESIGN

### 2.1 Obiettivi Primari

1. **🎯 Navigazione Unificata**: Sidebar persistente con menu gerarchico
2. **🎨 Design Moderno**: Ispirato a admin panel professionali
3. **📱 Mobile-First**: Responsive con drawer per mobile
4. **🔄 UX Migliorata**: Breadcrumbs, user menu, logout visibile
5. **🎭 Consistenza**: Design system coerente in tutta l'app

---

## 3. DESIGN SYSTEM

### 3.1 Palette Colori

```typescript
const colors = {
  // Primary - Indigo
  primary: {
    500: '#6366F1',  // MAIN
    600: '#4F46E5',
  },

  // Sidebar - Slate Dark
  sidebar: {
    bg: '#0F172A',
    hover: '#1E293B',
    active: '#334155',
    text: '#E2E8F0',
  },

  // Content
  content: {
    bg: '#F8FAFC',
    surface: '#FFFFFF',
  },
}
```

---

## 4. ARCHITETTURA COMPONENTI

```
AppLayout
├── Sidebar
│   ├── Logo
│   ├── MenuItems
│   │   ├── Dashboard
│   │   ├── Attività (group)
│   │   └── Apparecchiature (group)
│   └── UserMenu
├── Header
│   ├── MenuToggle (mobile)
│   ├── Breadcrumbs
│   └── UserDropdown
└── PageContent
```

---

## 5. STRUTTURA LAYOUT

### Desktop (> 1024px)
- Sidebar fissa 256px (collapsed: 64px)
- Header 64px
- Content responsive

### Mobile (< 768px)
- Sidebar drawer overlay
- Hamburger menu
- Backdrop

---

## 6. MENU STRUCTURE

```typescript
const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  {
    label: 'Attività',
    icon: ClipboardList,
    children: [
      { label: 'Lista', href: '/attivita' },
      { label: 'Nuova', href: '/attivita/new' },
    ],
  },
  {
    label: 'Apparecchiature',
    icon: Package,
    children: [
      { label: 'Lista', href: '/apparecchiature' },
      { label: 'Nuova', href: '/apparecchiature/new' },
    ],
  },
];
```

---

## 7. FILE DA CREARE

### Nuovi Componenti (9)
```
components/ui/
├── Sidebar.tsx
├── Header.tsx
├── Breadcrumbs.tsx
├── NavLink.tsx
├── MenuItem.tsx
├── MenuGroup.tsx
├── UserDropdown.tsx
├── AppLayout.tsx
└── lib/utils.ts
```

### File da Modificare (10)
1. `tailwind.config.ts`
2. `app/globals.css`
3. `app/layout.tsx`
4. `app/page.tsx`
5. `app/attivita/page.tsx`
6. `app/attivita/new/page.tsx`
7. `app/attivita/[id]/page.tsx`
8. `app/apparecchiature/page.tsx`
9. `app/apparecchiature/new/page.tsx`
10. `app/apparecchiature/[id]/page.tsx`
11. `components/ui/index.ts`

---

## 8. IMPLEMENTAZIONE STEPS

### Sprint 1: Foundation
1. ✅ Install dependencies (lucide-react, clsx, tailwind-merge)
2. ✅ Update tailwind.config.ts
3. ✅ Update globals.css
4. ✅ Create utils.ts

### Sprint 2: Components
5. ✅ Create Sidebar component
6. ✅ Create Header component
7. ✅ Create Breadcrumbs component
8. ✅ Create MenuItem/MenuGroup components
9. ✅ Create UserDropdown component
10. ✅ Create AppLayout wrapper

### Sprint 3: Integration
11. ✅ Update app/layout.tsx
12. ✅ Update components/ui/index.ts

### Sprint 4: Page Migration
13. ✅ Migrate homepage
14. ✅ Migrate attivita pages (3)
15. ✅ Migrate apparecchiature pages (3)

---

## 9. RESPONSIVE BREAKPOINTS

```typescript
const breakpoints = {
  sm: '640px',
  md: '768px',   // Tablet - sidebar drawer
  lg: '1024px',  // Desktop - sidebar fixed
  xl: '1280px',
};
```

---

## 10. FEATURES

### Sidebar
- ✅ Collapsabile (desktop)
- ✅ Drawer overlay (mobile)
- ✅ Menu gerarchico con icone
- ✅ Active state highlighting
- ✅ Stato persistente (localStorage)
- ✅ User menu con logout

### Header
- ✅ Breadcrumbs dinamici auto-generati
- ✅ User dropdown
- ✅ Hamburger menu (mobile)

### Navigation
- ✅ Link con active state
- ✅ Gruppi espandibili
- ✅ Tooltip su collapsed
- ✅ Smooth transitions

---

## 11. DEPENDENCIES

```json
{
  "lucide-react": "^0.400.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0"
}
```

---

## 12. COLOR SCHEME

**Primary:** Indigo (#6366F1, #4F46E5)
**Sidebar:** Slate Dark (#0F172A)
**Content BG:** Gray 50 (#F8FAFC)
**Surface:** White (#FFFFFF)

---

## 13. TESTING CHECKLIST

- [ ] Sidebar collapse funziona
- [ ] Menu mobile drawer funziona
- [ ] Breadcrumbs auto-generati corretti
- [ ] Active links evidenziati
- [ ] Logout funzionante
- [ ] Responsive su mobile/tablet/desktop
- [ ] LocalStorage persist sidebar state
- [ ] Nessun errore console
- [ ] Build senza warning
- [ ] Campi DDT visibili in form creazione attività
- [ ] Campi DDT visibili in pagina dettaglio attività
- [ ] Upload file DDT con categoria funzionante
- [ ] File DDT filtrati correttamente per categoria
- [ ] Badge categoria visualizzati nei file list
- [ ] Download file DDT funzionante
- [ ] Sezioni DDT Cliente e DDT Consegna separate

---

## 14. PERFORMANCE TARGETS

- Lighthouse Performance: > 90
- Lighthouse Accessibility: > 95
- Bundle size: < 500KB
- Sidebar toggle: < 300ms

---

## 15. CONCLUSIONI

Questo redesign trasforma Medidea in un'admin panel moderna e professionale con:
- ✅ Navigazione unificata e intuitiva
- ✅ Design system coerente
- ✅ UX migliorata con breadcrumbs
- ✅ Mobile-friendly
- ✅ Componenti riutilizzabili

---

**Status:** 🚧 In Implementazione
**Prossimo Step:** Install dependencies
