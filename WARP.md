# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Russian-language automotive services website built with vanilla HTML, CSS, and JavaScript with a modern glass-morphism design enhanced with premium typography and iconography. The site provides information about car rental, leasing, and international car purchasing services. It features a vibrant gradient background with translucent glass-like sections, Font Awesome icons throughout, premium Google Fonts (Inter + Orbitron), and sophisticated visual effects.

## Common Development Commands

### Running the Website Locally

Since this is a static website with no build process, you can serve it using any of these methods:

```powershell
# Using Python 3 (if installed)
python -m http.server 8000

# Using Node.js serve package
npx serve

# Using PHP (if installed)
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Simple File Serving (Alternative)
For quick testing without a server, you can directly open `index.html` in any modern browser, though some features may not work due to CORS restrictions.

### Testing Responsive Design
Use browser developer tools to test different screen sizes, particularly the 768px breakpoint where the navigation switches to vertical layout.

## Code Architecture

### File Structure
```
website-project/
├── index.html          # Main HTML file with Russian content
├── css/
│   └── style.css       # All styles including responsive design
├── js/
│   └── script.js       # JavaScript functionality
└── README.md           # Project documentation in Russian
```

### Key Components

**HTML Structure (`index.html`)**
- Language set to Russian (`lang="ru"`)
- Google Fonts integration: Inter (body text) and Orbitron (headings)
- Font Awesome 6.4.0 icons throughout the interface
- Semantic HTML5 structure with enhanced iconography
- Navigation includes icons: home, car, handshake, globe, phone
- Hero section with animated car icon
- Section headers with numbered badges and thematic icons
- Service lists enhanced with relevant automotive icons
- Contact information with communication and location icons

**CSS Architecture (`css/style.css`)**
- Premium typography: Inter font family for body text, Orbitron for headings
- Font Awesome icons with hover animations and scaling effects
- Glass-morphism design with translucent elements and backdrop blur effects
- Vibrant gradient background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
- Navigation with flexbox icon-text layouts and interactive scaling
- Hero section with floating car icon animation (translateY keyframes)
- Section headers combining numbered badges with circular icon containers
- Enhanced list items with icons, hover translations, and scale effects
- Icon styling: consistent sizing, opacity transitions, transform animations
- Mobile-responsive icon scaling and spacing adjustments

**JavaScript Functionality (`js/script.js`)**
- Smooth scrolling navigation using `scrollIntoView()`
- Active section highlighting during scroll
- Intersection Observer API for scroll-triggered animations
- DOM manipulation for dynamic styling

### Important Technical Details

**Russian Language Support**
- All content is in Russian using Cyrillic characters
- Navigation anchors use Cyrillic IDs (`#главная`, `#аренда`, `#лизинг`, `#под-ключ`, `#контакты`)
- Character encoding is UTF-8 to support Cyrillic text
- Content focused on automotive services terminology

**Scroll-Based Features**
- Navigation links automatically scroll to corresponding sections
- Active menu item highlighting based on scroll position (100px offset)
- Section animations triggered when elements come into view
- Uses Intersection Observer with 10% threshold and 50px bottom margin

**Responsive Behavior**
- Semi-transparent fixed header with backdrop-filter blur
- Main content has 100px top margin for spacious feel
- Mobile breakpoint at 768px with flexible navigation wrapping
- Large font sizes: h1 (3.5rem desktop, 2.5rem mobile), h2 (2.5rem desktop, 2rem mobile)
- Minimalist spacing reduces on mobile while maintaining hierarchy
- Section min-height of 60vh for full-screen sections

## Development Guidelines

### When Modifying Navigation
- Always maintain Cyrillic anchor links consistency between HTML and JavaScript
- Update both the navigation `href` attributes and section `id` attributes together
- Ensure scroll offset (100px) accounts for fixed header height

### Adding New Sections
1. Add new section in HTML with appropriate Cyrillic `id`
2. Add corresponding navigation link in the header
3. JavaScript will automatically handle smooth scrolling and active highlighting
4. Apply consistent styling using existing section CSS rules

### Responsive Design Changes
- Test changes at the 768px breakpoint
- Maintain flexbox layouts for navigation
- Ensure text remains readable at smaller sizes
- Consider touch targets for mobile users

### Animation and Interaction
- Glass-morphism hover effects with background opacity changes
- White gradient navigation underlines with scaleX transforms
- List items have glass hover effects with enhanced transparency
- Backdrop blur maintains throughout all animated states
- Section entrance animations via Intersection Observer with glass effects
- All transitions use 0.3s duration for smooth glass-like feel
- Smooth scrolling with `behavior: 'smooth'`

### Language and Content
- All user-facing text should remain in Russian
- Maintain Cyrillic character encoding (UTF-8)
- Comments in code can be in Russian or English
- Keep consistent Russian automotive terminology for sections and navigation
- Business focus: rental (аренда), leasing (лизинг), international car import (под ключ из другой страны)
