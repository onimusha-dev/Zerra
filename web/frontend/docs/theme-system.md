# The 5-Scheme Theme System

Zerra transitions away from the binary Light/Dark mode toward a versatile "Mood-based" system. All UI elements should use CSS variables to ensure they respond correctly to theme changes.

## The Schemes

### 1. Midnight (Classic)

- **Background**: `#000000`
- **Primary**: `#FFFFFF`
- **Secondary**: `#1A1A1A`
- **Vibe**: High contrast, razor-sharp, distraction-free.

### 2. Eclipse (Dim)

- **Background**: `#15202B`
- **Primary**: `#1D9BF0` (Twitter Blue)
- **Secondary**: `#253341`
- **Vibe**: Soft on the eyes, professional, familiar.

### 3. Aurora (Ocean)

- **Background**: `#0B1120`
- **Primary**: `#38BDF8` (Cyan)
- **Secondary**: `#1E293B`
- **Vibe**: Futuristic, technical, calm.

### 4. Velocity (Crimson)

- **Background**: `#0F0505`
- **Primary**: `#E11D48` (Rose)
- **Secondary**: `#2D0A0E`
- **Vibe**: Bold, energetic, high intensity.

### 5. Verdant (Forest)

- **Background**: `#050F0A`
- **Primary**: `#10B981` (Emerald)
- **Secondary**: `#064E3B`
- **Vibe**: Unique, organic, focused.

## Implementation Guide

Themes are applied via the `data-theme` attribute on the root element.

```css
[data-theme='aurora'] {
    --background: #0b1120;
    --foreground: #f8fafc;
    --primary: #38bdf8;
    /* ... etc */
}
```

Components should use semantic colors like `bg-background` or `text-primary` rather than explicit colors like `bg-black`.
