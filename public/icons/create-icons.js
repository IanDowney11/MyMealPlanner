// Simple script to create basic PWA icons using SVG
const fs = require('fs');

// Create SVG icon
const svgIcon = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#1a1d29" rx="76.8"/>
  <rect x="51.2" y="51.2" width="409.6" height="409.6" fill="#ffffff" rx="40"/>
  <text x="256" y="320" font-family="Arial" font-size="180" text-anchor="middle" fill="#1a1d29">🍽️</text>
  <text x="256" y="380" font-family="Arial" font-size="32" font-weight="bold" text-anchor="middle" fill="#1a1d29">Meal Planner</text>
</svg>`;

// Save SVG (we'll convert to PNG manually or use online converter)
fs.writeFileSync('icon.svg', svgIcon);
console.log('SVG icon created. Convert to PNG using online tool or image editor.');