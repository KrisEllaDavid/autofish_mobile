const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Android icon sizes for different densities
const iconSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

// Function to ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Function to create a circular mask
function createCircularMask(size) {
  const radius = size / 2;
  const center = radius;
  
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <mask id="circle">
          <rect width="${size}" height="${size}" fill="white"/>
          <circle cx="${center}" cy="${center}" r="${radius}" fill="black"/>
        </mask>
      </defs>
      <rect width="${size}" height="${size}" fill="#0097B2" mask="url(#circle)"/>
    </svg>
  `;
  
  return Buffer.from(svg);
}

// Main function to generate icons
async function generateIcons() {
  console.log('Generating Android icons...');
  
  const androidResPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
  const svgPath = path.join(__dirname, 'public', 'icons', 'autofish_blue_logo.svg');
  
  try {
    // Read the SVG content
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Generate icons for each density
    for (const [density, size] of Object.entries(iconSizes)) {
      const iconDir = path.join(androidResPath, density);
      ensureDir(iconDir);
      
      // Calculate logo size (80% of the icon size)
      const logoSize = Math.floor(size * 0.8);
      const padding = Math.floor(size * 0.1);
      
      // Create the main icon by resizing the SVG and placing it on a blue background
      const iconBuffer = await sharp(Buffer.from(svgContent))
        .resize(logoSize, logoSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer();
      
      // Create background with the AutoFish blue color
      const background = sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 0, g: 151, b: 178, alpha: 1 } // #0097B2
        }
      });
      
      // Composite the logo onto the background
      const finalIconBuffer = await background
        .composite([{
          input: iconBuffer,
          top: padding,
          left: padding
        }])
        .png()
        .toBuffer();
      
      // Save ic_launcher.png
      const icLauncherPath = path.join(iconDir, 'ic_launcher.png');
      fs.writeFileSync(icLauncherPath, finalIconBuffer);
      
      // Create round icon with circular mask
      const roundMask = createCircularMask(size);
      const roundIconBuffer = await sharp(finalIconBuffer)
        .composite([{
          input: roundMask,
          blend: 'dest-in'
        }])
        .png()
        .toBuffer();
      
      // Save ic_launcher_round.png
      const icLauncherRoundPath = path.join(iconDir, 'ic_launcher_round.png');
      fs.writeFileSync(icLauncherRoundPath, roundIconBuffer);
      
      console.log(`Generated ${density} icons (${size}x${size})`);
    }
    
    console.log('Icon generation complete!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

// Run the script
generateIcons(); 