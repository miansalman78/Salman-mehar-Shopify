# Custom Design Shopify Theme

A modern, responsive Shopify theme with custom banner and grid sections, built with clean code and best practices.

## Theme Structure

### Assets
- `base.css` - Core theme styles and CSS variables
- `global.js` - Global JavaScript functionality
- `section-*.css` - Section-specific stylesheets
- `*.js` - Component-specific JavaScript files

### Layout
- `theme.liquid` - Main theme layout file

### Sections
- `header.liquid` - Site header with navigation
- `footer.liquid` - Site footer with links and newsletter
- `custom-banner.liquid` - Custom banner section
- `custom-grid.liquid` - Custom grid layout section

### Templates
- `index.liquid` - Homepage template
- `page.custom-design.liquid` - Custom page template
- `cart.liquid` - Shopping cart template
- `404.liquid` - Error page template

### Snippets
- Icon snippets (`icon-*.liquid`) - SVG icons
- `header-drawer.liquid` - Mobile navigation drawer
- `header-search.liquid` - Search functionality
- `cart-notification.liquid` - Cart notification popup
- `social-icons.liquid` - Social media icons
- Localization snippets for multi-language support

### Configuration
- `config/settings_schema.json` - Theme customization options
- `config/settings_data.json` - Default theme settings
- `locales/en.default.json` - English translations

## Features

### Custom Sections
1. **Custom Banner**
   - Configurable background image/video
   - Overlay text with customizable styling
   - Call-to-action buttons
   - Responsive design

2. **Custom Grid**
   - Flexible grid layout
   - Image and text content blocks
   - Responsive columns (1-4 columns)
   - Hover effects and animations

### Header Features
- Responsive navigation menu
- Logo positioning options
- Search functionality
- Cart icon with item count
- Mobile drawer menu
- Multi-language/currency support
- Sticky header options

### Footer Features
- Newsletter signup
- Social media links
- Policy links
- Multi-column layout
- Localization selectors

### Theme Customization
- Color schemes (5 predefined schemes)
- Typography settings
- Layout options
- Button styling
- Card styling
- Social media links
- Search configuration

## Installation

1. **Upload to Shopify:**
   - Zip all theme files
   - Go to Shopify Admin > Online Store > Themes
   - Click "Upload theme" and select your zip file

2. **Customize:**
   - Click "Customize" on your uploaded theme
   - Configure sections, colors, and settings
   - Add your content and images

## Development

### File Structure
```
├── assets/           # CSS, JS, and other assets
├── config/           # Theme configuration
├── layout/           # Theme layout files
├── locales/          # Translation files
├── sections/         # Reusable sections
├── snippets/         # Reusable code snippets
└── templates/        # Page templates
```

### CSS Architecture
- Uses CSS custom properties for theming
- Responsive design with mobile-first approach
- Component-based styling
- Utility classes for common patterns

### JavaScript
- Vanilla JavaScript (no dependencies)
- Component-based architecture
- Event delegation for performance
- Accessibility features included

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Performance
- Optimized images with responsive loading
- Minimal JavaScript footprint
- CSS optimized for critical rendering path
- Lazy loading for non-critical content

## Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Semantic HTML structure

## Customization Guide

### Adding New Sections
1. Create section file in `/sections/`
2. Add corresponding CSS in `/assets/`
3. Include JavaScript if needed
4. Add to theme customizer schema

### Modifying Colors
1. Edit color schemes in `config/settings_data.json`
2. Update CSS custom properties in `base.css`
3. Test across all sections

### Adding Languages
1. Create new locale file in `/locales/`
2. Translate all strings
3. Test localization functionality

## Support

For theme support and customization requests, please refer to Shopify's theme development documentation or contact a Shopify Expert.

## License

This theme is provided as-is for educational and development purposes. Please ensure compliance with Shopify's theme requirements before publishing.