# Architecture and Design Documentation

This document outlines the architecture, design decisions, and technical implementation of the [maniatic0.github.io](https://maniatic0.github.io) portfolio website.

## 🏗️ System Architecture

The website is a **Static Site** powered by the **Jekyll** static site generator, hosted via **GitHub Pages**.

### Core Components
- **Engine**: Jekyll (Ruby-based SSG).
- **Hosting**: GitHub Pages (Serverless, high-availability).
- **Deployment Pipeline**: Git-based. Every `git push` to the `main` branch triggers an automatic build and deployment process.
- **Data Layer**: Markdown (`.md`) files stored in the `_posts/` directory.

### Directory Structure
- `/assets/`: Contains static assets like images and the PDF CV.
- `/assets/images/`: Stores design-related imagery (e.g., background textures).
- `/assets/images/icons/`: Stores brand and favicon icons.
- `/_layouts/`: Contains the HTML templates (e.g., `default.html`) that define the site's skeleton.
- `/_posts/`: The "database" of the site, containing all articles and guides in Markdown format.
- `/_scripts/`: Contains internal build and configuration scripts (e.g., Tailwind configuration and build automation).
- `/_build-assets/`: Contains source files for the build process (e.g., Tailwind source CSS).
- `_config.yml`: The global configuration file for site metadata and social links.

---

## 🎨 Design System

The site follows a **"Modern Dark Developer"** aesthetic, optimized for high readability and professional impact.

### Visual Identity
- **Theme**: Dark Mode (Slate/Midnight palette).
- **Background**: A deep, textured background inspired by the itch.io aesthetic.
- **Accent Color**: `Sky Blue` (`#38bdf8`) used for links, headings, and interactive elements to provide high contrast.
- **Typography**: 
    - **Primary**: *Inter* (Sans-serif) for clean, modern reading.
    - **Secondary**: Monospace fonts for code snippets and technical data.

### UI Components (Tailwind CSS)
We use **Tailwind CSS** to implement a utility-first design approach. Key patterns include:
- **Glassmorphism**: Content containers use semi-transparent backgrounds (`rgba(30, 41, 59, 0.7)`) and `backdrop-filter: blur(12px)` to create depth.
- **Responsive Grid**: A mobile-first approach using Tailwind's grid system to ensure the portfolio looks perfect on all devices.
- **Interactive Elements**: Hover transitions and subtle shadows to provide tactile feedback.

---

## 🛠️ Technical Implementation Details

### Content Management
Instead of manual HTML editing, content is managed via **Markdown**. This allows for:
- Rapid content creation.
- Easy version control.
- Separation of content (Markdown) from presentation (HTML/CSS).

### Build & Styling (Tailwind CSS)
The site uses a local **Tailwind CSS CLI** build process to ensure performance and prevent production warnings.
- **Source CSS**: Located in `_build-assets/input.css`.
- **Configuration**: Managed via `_scripts/tailwind.config.js`.
- **Automation**: The `./_scripts/build-css.sh` script automates the compilation, minification, and directory management.

### Deployment Workflow
1. **Local Edit**: Changes are made to `.md` or `.html` files.
2. **CSS Build**: Run `./_scripts/build-css.sh` to generate the production Tailwind CSS.
3. **Git Commit**: Changes are committed with descriptive messages.
4. **Git Push**: The code is pushed to GitHub.
5. **Automated Build**: GitHub Actions detects the push, runs Jekyll, and publishes the static files.

---

## 🖼️ Design Assets
- **Main Background**: `assets/images/background_itch.png`
- **Legacy Background Reference**: `assets/images/background_wordpress.jpg`
