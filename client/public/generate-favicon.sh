#!/bin/bash

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Please install it first."
    echo "For macOS: brew install imagemagick"
    echo "For Ubuntu/Debian: sudo apt-get install imagemagick"
    exit 1
fi

# Generate favicon.ico
convert -background none -density 256x256 logo.svg -define icon:auto-resize=64,48,32,16 favicon.ico

# Generate PNG versions of different sizes
convert -background none -density 256x256 logo.svg -resize 192x192 logo192.png
convert -background none -density 256x256 logo.svg -resize 512x512 logo512.png

echo "Favicon and logo files generated successfully!" 