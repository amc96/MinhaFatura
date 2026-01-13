# Financial Dashboard Design Guidelines - PT-BR

## Design Approach
**System-Based Approach** inspired by Linear's clarity + Stripe's data presentation + Material Design patterns. This financial dashboard prioritizes information hierarchy, data readability, and efficient workflows over visual flair.

## Layout System
- **Spacing Units**: Consistently use Tailwind units of 2, 4, 6, 8, 16, 24 (p-2, m-4, gap-6, py-8, etc.)
- **Container Width**: max-w-7xl for main content areas
- **Grid System**: 12-column grid for dashboard layout flexibility

## Typography Hierarchy
- **Primary Font**: Inter (Google Fonts) - exceptional readability for financial data
- **Headings**: 
  - H1: text-3xl font-bold (Dashboard titles)
  - H2: text-2xl font-semibold (Section headers)
  - H3: text-lg font-medium (Card titles)
- **Body**: text-base leading-relaxed (general content)
- **Data/Numbers**: text-xl font-semibold tabular-nums (financial figures)
- **Labels**: text-sm font-medium (form labels, table headers)
- **Captions**: text-xs (timestamps, metadata)

## Dashboard Layout Structure

### Top Navigation Bar (Sticky)
- Logo + product name (left)
- Search bar (center) with icon
- User profile dropdown + notifications bell (right)
- Height: h-16, shadow-sm

### Sidebar Navigation (Collapsible)
- Width: w-64 (expanded), w-16 (collapsed)
- Navigation items with icons (Heroicons) + labels
- Active state: filled background, bold text
- Sections: Dashboard, Cobranças, Relatórios, Configurações

### Main Content Area
- pt-6 px-8 (generous padding for data breathing room)
- Dashboard cards in grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
- Full-width tables/charts with proper spacing

## Core Components

### Stat Cards (KPI Dashboard)
- Rounded corners (rounded-lg)
- Icon in circle (top-left)
- Large number display with tabular-nums
- Label + percentage change indicator
- Subtle shadow (shadow-sm)

### Data Tables
- Striped rows for readability
- Fixed header on scroll
- Sortable columns with arrow indicators
- Action buttons (icon-only) in last column
- Hover state: subtle background change

### Charts & Graphs
- Use Chart.js or Recharts for consistency
- Grid lines in subtle gray
- Legend placement: top-right
- Tooltips on data point hover
- Responsive sizing

### Form Controls
- Input fields: border, rounded, px-4 py-2
- Labels above inputs (text-sm font-medium mb-2)
- Helper text below (text-xs text-gray-600)
- Error states: red border + error message
- Dropdowns: consistent styling with chevron icon

### Buttons
- Primary: Solid fill, font-semibold, px-6 py-2.5, rounded-lg
- Secondary: Border style, transparent background
- Icon buttons: Square (h-10 w-10), centered icon
- Loading state: spinner icon
- **Buttons on images**: backdrop-blur-md, semi-transparent background

### Modal/Dialogs
- Centered overlay with backdrop-blur
- max-w-lg width
- Close button (top-right)
- Action buttons (bottom-right aligned)

### Notification Toasts
- Fixed position (top-right)
- Icon + message + close button
- Auto-dismiss after 5s
- Success/Error/Info variants

## Images

**No Hero Section**: This is a dashboard application - users log directly into their workspace. No marketing hero needed.

**Dashboard Illustrations**:
- Empty state illustrations for "Nenhuma cobrança encontrada"
- Icon-based graphics for onboarding tooltips
- Small decorative elements in cards (subtle, non-distracting)
- Use line-art style illustrations, not photographic

## Accessibility
- All interactive elements: min-height h-10 (40px touch targets)
- ARIA labels for icon-only buttons
- Keyboard navigation: visible focus rings
- Screen reader text for data visualizations
- High contrast ratios maintained throughout

## Portuguese (PT-BR) Localization
- Date format: DD/MM/YYYY
- Currency: R$ with proper spacing
- Decimal separator: comma (,)
- Thousands separator: period (.)
- Proper translations for all UI elements
- Formal "você" treatment in copy

## Responsive Behavior
- Mobile: Single column, collapsed sidebar (drawer)
- Tablet: 2-column grid for cards
- Desktop: Multi-column layouts, expanded sidebar
- Data tables: Horizontal scroll on mobile with sticky first column