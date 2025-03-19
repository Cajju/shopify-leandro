import sharp from 'sharp'

const COMPOSITE_LAYOUTS = {
  1: [{ top: 0, left: 0, width: 4096, height: 4096 }],
  2: [
    { top: 0, left: 0, width: 2048, height: 4096 },
    { top: 0, left: 2048, width: 2048, height: 4096 }
  ],
  3: [
    { top: 0, left: 0, width: 2048, height: 2048 },
    { top: 0, left: 2048, width: 2048, height: 2048 },
    { top: 2048, left: 0, width: 4096, height: 2048 }
  ],
  4: [
    { top: 0, left: 0, width: 2048, height: 2048 },
    { top: 0, left: 2048, width: 2048, height: 2048 },
    { top: 2048, left: 0, width: 2048, height: 2048 },
    { top: 2048, left: 2048, width: 2048, height: 2048 }
  ],
  5: [
    { top: 0, left: 0, width: 1024, height: 2048 },
    { top: 0, left: 1024, width: 1024, height: 2048 },
    { top: 0, left: 2048, width: 2048, height: 2048 },
    { top: 2048, left: 0, width: 2048, height: 2048 },
    { top: 2048, left: 2048, width: 2048, height: 2048 }
  ],
  6: [
    { top: 0, left: 0, width: 1024, height: 2048 },
    { top: 0, left: 1024, width: 1024, height: 2048 },
    { top: 0, left: 2048, width: 1024, height: 2048 },
    { top: 0, left: 3072, width: 1024, height: 2048 },
    { top: 2048, left: 0, width: 2048, height: 2048 },
    { top: 2048, left: 2048, width: 2048, height: 2048 }
  ],
  7: [
    { top: 0, left: 0, width: 1024, height: 2048 },
    { top: 0, left: 1024, width: 1024, height: 2048 },
    { top: 0, left: 2048, width: 1024, height: 2048 },
    { top: 0, left: 3072, width: 1024, height: 2048 },
    { top: 2048, left: 0, width: 1024, height: 2048 },
    { top: 2048, left: 1024, width: 1024, height: 2048 },
    { top: 2048, left: 2048, width: 2048, height: 2048 }
  ],
  8: [
    { top: 0, left: 0, width: 1024, height: 2048 },
    { top: 0, left: 1024, width: 1024, height: 2048 },
    { top: 0, left: 2048, width: 1024, height: 2048 },
    { top: 0, left: 3072, width: 1024, height: 2048 },
    { top: 2048, left: 0, width: 1024, height: 2048 },
    { top: 2048, left: 1024, width: 1024, height: 2048 },
    { top: 2048, left: 2048, width: 1024, height: 2048 },
    { top: 2048, left: 3072, width: 1024, height: 2048 }
  ]
}

// Function to generate a composite image and upload it to Shopify
const generateCollageImage = async (imagesBuffers) => {
  try {
    // Limit number of images to 8
    if (imagesBuffers.length > 8) {
      imagesBuffers = imagesBuffers.slice(0, 8)
    }
    // Determine the layout based on the number of images
    const layout = COMPOSITE_LAYOUTS[imagesBuffers.length] || COMPOSITE_LAYOUTS[8] // Default to layout 8 if not found

    // Resize and compress images before creating the collage
    const resizedBuffers = await Promise.all(
      imagesBuffers.map(async (buffer, index) => {
        return await sharp(buffer)
          .resize({ width: layout[index].width, height: layout[index].height, fit: 'cover' }) // Resize to cover the box while maintaining aspect ratio
          .toFormat('jpeg', { quality: 70 }) // Convert to JPEG and compress
          .toBuffer()
      })
    )

    // Create a composite image
    let compositeImage = await sharp({
      create: {
        width: 4096,
        height: 4096,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
      }
    })
      .composite(
        resizedBuffers.map((buffer, index) => ({
          input: buffer,
          top: layout[index].top, // Use layout for positioning
          left: layout[index].left // Use layout for positioning
        }))
      )
      .resize(4096, 4096) // Ensure the final image is 4096x4096
      .toFormat('jpeg', { quality: 80 }) // Use JPEG format with compression
      .toBuffer()

    // Check the size of the composite image
    if (compositeImage.length > 12 * 1024 * 1024) {
      // 12 MB in bytes
      throw new Error('Generated image exceeds 12 MB')
    }

    // Prepare the file for upload
    const collageImage = {
      media: {
        name: 'composite-image.jpg', // Change to .jpg if using JPEG format
        type: 'image/jpeg', // Change to 'image/jpeg'
        size: compositeImage.length,
        altText: 'Composite image'
      },
      file: compositeImage
    }

    // console.log('Collage image size:', (collageImage.media.size / (1024 * 1024)).toFixed(2) + ' MB')
    return collageImage
  } catch (error) {
    throw new Error('Image generation failed: ' + error.message)
  }
}

export default generateCollageImage
