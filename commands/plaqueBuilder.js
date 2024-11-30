const fs = require('fs');
const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = async (message) => {
    if (message.content.startsWith('!createplaque')) {
        const args = message.content.slice('!createplaque'.length).trim().split(';');
        if (args.length < 3) {
          message.reply('Please provide the background color, overlay color, and text color (e.g., #FFD700 for gold).');
          return;
        }
    
        const backgroundColor = args[0]?.trim() || '#000000'; // Default to black
        const overlayColor = args[1]?.trim() || '#FFD700'; // Default to gold color
        const textColor = args[2]?.trim() || 'Default Title';
    
        const baseImagePath = './plaque_base.png'; // Replace with the path to your grayscale base image
    
        try {
          const plaqueImage = await generatePlaque(backgroundColor, overlayColor, textColor, baseImagePath, message.author);
          const attachment = new AttachmentBuilder(plaqueImage, { name: 'plaque.png' });
          message.reply({ files: [attachment] });
        } catch (error) {
          console.error(error);
          message.reply('An error occurred while generating the plaque.');
        }
    }
};

// Function to change white pixels to the set color
function changeWhiteToColor(image, color) {
  const { width, height } = image;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  // Get image data from the canvas
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Convert the color from hex to RGB
  const [r, g, b] = hexToRgb(color);

  // Loop through all pixels and replace white with the specified color
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];

    // If the pixel is white (255, 255, 255), change it to the specified color
    if (red === 255 && green === 255 && blue === 255) {
      data[i] = r;     // Set red channel
      data[i + 1] = g; // Set green channel
      data[i + 2] = b; // Set blue channel
    }
  }

  // Put the updated data back into the canvas
  ctx.putImageData(imageData, 0, 0);

  return canvas;
}

// Helper function to convert hex color to RGB
function hexToRgb(hex) {
  // Remove the hash (#) if it exists
  hex = hex.replace(/^#/, '');

  // Parse the RGB components
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return [r, g, b];
}

async function loadImageSafely(imagePath) {
    try {
      return await loadImage(imagePath);  // Attempt to load the image
    } catch (err) {
      console.error('Error loading image:', err);  // Log the error
      return null;  // Return null if loading fails
    }
}

function capitalizeFirstLetter(username) {
  if (!username) return '';  // Return an empty string if username is falsy
  return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
}

// Function to generate the plaque with customizable colors for background, overlay, and username text
async function generatePlaque(backgroundColor, overlayColor, textColor, baseImagePath, user) {
  const canvas = createCanvas(800, 1200);
  const ctx = canvas.getContext('2d');

  // Fixed texts (not customizable)
  const title = "Order 34";  // Fixed Title
  const mainText = "Thanks for boosting";  // Fixed Main Text
  const footer = "Server Booster";  // Fixed Footer

  // Apply the customizable background color
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Load the base image (grayscale)
  const baseImage = await loadImageSafely(baseImagePath);  // Use the safe load function
  if (!baseImage) {
    throw new Error('Failed to load base image');  // If base image loading fails, throw an error
  }

  // Change white pixels in the base image to the overlay color (without affecting other elements)
  const updatedBaseImage = changeWhiteToColor(baseImage, overlayColor);

  // Draw the modified base image
  ctx.drawImage(updatedBaseImage, 0, 0, canvas.width, canvas.height);

  // Get the avatar URL and fix it if necessary
  let avatarURL = user.displayAvatarURL({ size: 128 });
  if (!avatarURL.endsWith('.png')) {
    avatarURL = avatarURL.replace('.webp', '.png');  // Replace .webp with .png
  }

  // Load the avatar image safely
  const avatarImage = await loadImageSafely(avatarURL);  
  if (!avatarImage) {
    throw new Error('Failed to load avatar image');  // If avatar loading fails, throw an error
  }

  // Make the avatar larger
  const avatarSize = 200;  // Increase the avatar size (previously was 150)
  const avatarX = (canvas.width - avatarSize) / 2;  // Center the avatar horizontally
  const avatarY = (canvas.height - avatarSize) / 2 - 200;  // Center the avatar vertically, offset slightly

  // Draw the avatar in a circular shape
  ctx.save();  // Save the current context
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);  // Create circular path
  ctx.closePath();
  ctx.clip();  // Clip the context to the circular path

  // Draw the avatar inside the clipped circular area
  ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);

  // Restore the context to allow further drawing
  ctx.restore();

  // Add text with customizable colors (same color for all text)
  ctx.textAlign = 'center';

  // Set the same color for all text
  ctx.fillStyle = textColor; // Apply the same text color to title, main text, footer, and username
  ctx.font = 'italic bold 120px Gabriola';  // Title Font Size
  ctx.fillText(title, canvas.width / 2, 160);  // Title Text

  // Username Text
  const capitalizedUsername = capitalizeFirstLetter(user.username);
  ctx.font = 'italic bold 80px Gabriola';  // Username Font Size
  ctx.fillText(capitalizedUsername, canvas.width / 2, 600);  // Username Text

  // Main Text
  ctx.font = 'italic bold 115px Gabriola';  // Main Text Font Size
  ctx.fillText(mainText, canvas.width / 2, canvas.height - 300);  // Main Text

  // Footer Text
  ctx.font = 'italic bold 105px Gabriola';  // Footer Font Size
  ctx.fillText(footer, canvas.width / 2, canvas.height - 100);  // Footer Text

  return canvas.toBuffer();
}

