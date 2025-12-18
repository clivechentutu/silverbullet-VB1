# CompetiScope - Design Guidelines (Exact Reconstruction)

## Design Approach
**Reference-Based**: This is a pre-designed application. All specifications below are extracted from the existing implementation and must be followed exactly without modification.

## Color System
- **Background**: slate-950 (#020617) - primary background
- **Secondary Background**: slate-900 with opacity variations (/40, /50)
- **Brand Primary**: teal-500 (#14b8a6) - "brand-500"
- **Brand Accent**: teal-600 (#0d9488) - "brand-600"
- **Borders**: slate-800, slate-700 with opacity variations
- **Text**: white (headings), slate-300/400 (body), slate-500/600 (muted)
- **Gradients**: brand-500 to purple-600, white to slate-400

## Typography
- **Font Family**: Inter (Google Fonts, weights: 300, 400, 500, 600, 700)
- **Hero Title**: text-5xl md:text-7xl, font-bold, gradient from white to slate-400
- **Section Headers**: text-2xl to text-xl, font-bold
- **Body Text**: text-base to text-lg, font-light to font-medium
- **Small Labels**: text-xs, uppercase, tracking-wider, font-bold

## Layout System
- **Container**: max-w-7xl mx-auto, px-6
- **Spacing Units**: Tailwind standard (p-2, p-4, p-6, p-8, gap-2 through gap-8, mt-12, mb-6, etc.)
- **Grid**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for cards
- **Responsive**: Mobile-first, breakpoints at md: and lg:

## Component Library

### Header (Fixed)
- Height: h-20, fixed top-0, z-50
- Background: slate-950/80 with backdrop-blur-md
- Border: border-b border-white/5
- Logo: Hexagon icon (brand-500) with rotation animation on hover
- Navigation: hidden md:flex, gap-8
- Buttons: "Log In" (text), "Get Demo" (white bg, rounded-full)

### Hero Section
- Decorative gradients: brand-600/20 and purple-600/10 blur-[120px]
- Badge: inline-flex with Sparkles icon, slate-800/50 background
- Input wrapper: gradient border effect on hover, slate-900 bg
- Globe icon prefix, rounded-xl, p-2
- CTA button: white bg with ArrowRight icon

### Scenario Cards
- Grid: 1/2/3 columns responsive
- Card: p-6, rounded-xl, slate-900/40 bg, border-slate-800
- Selected state: brand-950/40 bg, brand-500/50 border, shadow glow effect, scale-[1.02]
- Icon container: p-3, rounded-lg, conditional bg (brand-500/20 or slate-800)
- CheckCircle2/Circle toggle indicator

### Results Dashboard
- Two-column layout: lg:col-span-2 (main) + sidebar
- Cards: slate-900/50 bg, border-slate-800, rounded-2xl, p-8, backdrop-blur-sm
- SWOT grid: 2x2, color-coded (green/red/blue/orange)
- Competitor tags: slate-800 bg, rounded-full, border-slate-700
- Battle card: gradient from brand-900/20, border-brand-500/20

### Workbench Interface
- Sidebar: w-64, fixed left-0, bg-slate-900/50, border-r border-slate-800
- Top bar: h-16, border-b border-slate-800
- Tab system: inline-flex with active state (brand-500 text + bg-brand-500/10)
- Target cards: p-6, hover effects with scale-[1.01]
- Traffic chart: SVG polyline with brand-400 stroke, gradient fill

### Intelligence Panel (Drawer)
- Full-height drawer: max-w-xl, translate-x animation
- Backdrop: bg-black/60 backdrop-blur-sm
- Header: h-20, slate-900/40 bg
- Synthesis cards: color-coded backgrounds (amber/brand/purple with /5 opacity)
- Extraction records: timeline with staggered animation delays

## Animations & Effects
- Transitions: duration-300 to duration-1000, ease-out or cubic-bezier
- Hover scales: scale-[1.01] to scale-[1.02]
- Loading spinner: border-4 with brand-500 gradient, animate-spin
- Fade-in-up: custom keyframe (translateY + opacity)
- Icon rotations: group-hover:rotate-90 (Hexagon logo)
- Backdrop blur: backdrop-blur-sm to backdrop-blur-md throughout

## Custom Scrollbar
- Width: 8px
- Track: #0f172a
- Thumb: #334155, hover #475569
- Border-radius: 4px

## Images
No hero images in this design. All visual interest comes from:
- Gradient backgrounds (decorative blur circles)
- Icon systems (Lucide React)
- SVG charts (traffic visualization)
- Color treatments and effects