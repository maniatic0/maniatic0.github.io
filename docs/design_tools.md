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

## 🛠️ Testing Tools
We will use **Chrome DevTools** to inspect elements, test responsiveness, and debug the visual implementation of the design.
