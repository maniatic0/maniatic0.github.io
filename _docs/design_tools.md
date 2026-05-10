# Design Tools and Resources

To assist in the design and testing of the portfolio website, the following tools and resources will be used:

## 👁️ Vision Tool
A high-precision visual analysis tool is available at `~/repos/vision-tool`. This tool allows for visual queries using the Gemma 4 Vision model to analyze screenshots and UI elements.

### How to use with Chrome MCP
To perform a visual design audit, follow this workflow:
1. **Capture**: Use the Chrome MCP tools to navigate to the website and take a screenshot.
2. **Save**: Save the screenshot into the `.chrome-screenshots/` directory (this folder is git-ignored).
3. **Analyze**: Run the `vision_check.py` script from the `~/repos/vision-tool` directory, passing the path to your new screenshot and a prompt describing what you want to check (e.g., "Analyze the color contrast and layout").

## 🌐 Live Website
The deployed version of the portfolio can be viewed at: [https://maniatic0.github.io/](https://maniatic0.github.io/)

## 🎡 Carousel Implementation (Embla Carousel)
For the main navigation carousel, we use **Embla Carousel**. This library provides a high-performance, lightweight, and professional-grade carousel experience that supports both mobile touch gestures and desktop mouse-drag interactions. It is integrated with Tailwind CSS for a seamless design experience.

### Key Features
- **Smooth Dragging**: Supports both touch and mouse-drag.
- **Snap Points**: Ensures cards align perfectly with the viewport.
- **Performance**: Highly optimized for smooth animations and low memory footprint.

