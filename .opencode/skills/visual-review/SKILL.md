---
name: visual-review
description: Use when reviewing the portfolio website visually — take screenshots via Chrome DevTools MCP and analyze them with the local vision model. Trigger keywords: screenshot, preview, review, vision, check design, evaluate UI.
---

# Visual Review Skill

Use this skill whenever you need to visually inspect or review the portfolio website. It combines Chrome DevTools MCP (for screenshots) with the local vision model (for analysis).

## Tool Locations

| Tool | Location | Purpose |
|------|----------|---------|
| Vision script | `~/vision_check.py` | Sends images to local Gemma 4 Vision model |
| Chrome MCP | configured in global opencode config | Browser automation & screenshots |
| Jekyll launcher | `_scripts/serve.sh` | Starts/restarts the Jekyll dev server |
| CSS builder | `build-css.sh` | Rebuilds Tailwind CSS from source |

## Prerequisites

- **Jekyll server running** on `http://localhost:4000`. Start/restart it:
  ```bash
  bash _scripts/serve.sh
  ```
  This script kills any existing server, clears the build cache, starts Jekyll, and waits for it to be ready.
- **Vision model server** running on `http://localhost:8082/v1/chat/completions`
- **Chrome DevTools MCP** connected (configured globally, should be available)

## Rebuilding CSS

Whenever you add **new Tailwind utility classes** (e.g., `text-justify`, `w-18`) to the layout, you must rebuild the CSS or the class won't have any effect:

```bash
bash build-css.sh
```

This compiles `_build-assets/input.css` → `assets/css/output.css` using the config in `_scripts/tailwind.config.js`.

## Workflow

### Step 1: Start the Jekyll Server

```bash
bash _scripts/serve.sh
```

### Step 2: Navigate & Reload

```
chrome-devtools_navigate_page(type="reload", ignoreCache=true)
```

Always reload with `ignoreCache=true` to ensure the latest build is shown.

### Step 3: Take Screenshot

```
chrome-devtools_take_screenshot(format="jpeg", quality=85, filePath="/tmp/portfolio-review.jpg")
```

Use `jpeg` format for smaller files. Save to `/tmp/` (never track these in git). For full-page reviews, add `fullPage=true`.

### Step 4: Analyze with Vision Model

```bash
python3 ~/vision_check.py /tmp/portfolio-review.jpg "Your detailed prompt here"
```

**Prompt guidelines:** Be specific about what to review. Example prompts:

- *"Review the hero section. Note profile photo size, name styling, subtitle content, and social icon spacing."*
- *"Check color contrast and accessibility of the navigation cards."*
- *"Evaluate the footer layout and social link consistency."*

## Common Tasks

### After making layout changes (HTML/CSS classes)
1. If you added new Tailwind classes, rebuild CSS: `bash build-css.sh`
2. Restart Jekyll: `bash _scripts/serve.sh`
3. Reload the page (ignore cache)
4. Take a full-page screenshot
5. Prompt the vision model to review the changed area specifically

### After Jekyll server issues
1. Check if server is running: `pgrep -f "jekyll"`
2. If not: `bash _scripts/serve.sh` (handles cleanup automatically)
3. Wait for the "Server is up" message

### Comparing before/after
1. Take "before" screenshot, save to `/tmp/before.jpg`
2. Make changes
3. Rebuild CSS if needed, restart Jekyll, reload page
4. Take "after" screenshot, save to `/tmp/after.jpg`
5. Run vision analysis on both with the same prompt for fair comparison

## Notes

- The vision script expects `.jpg` files — if Chrome saves as `.jpeg`, rename first: `mv /tmp/file.jpeg /tmp/file.jpg`
- Screenshot files in `/tmp/` are not tracked by git — no need to clean up
- The `.chrome-screenshots/` directory exists in the repo but is git-ignored; use `/tmp/` for transient reviews
- The vision model (Gemma 4) is good at layout, spacing, and color analysis but may miss small text details
- Always rebuild CSS (`bash build-css.sh`) after adding new Tailwind classes — the class won't work in the browser until it's compiled into `output.css`
