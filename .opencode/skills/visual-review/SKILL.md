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
| Screenshot cache | `.chrome-screenshots/` (git-ignored) | Store screenshots locally |

## Prerequisites

- **Jekyll server running** on `http://localhost:4000`. If not running, start it:
  ```bash
  nohup jekyll serve --host 0.0.0.0 --port 4000 > /tmp/jekyll.log 2>&1 &
  sleep 3
  ```
- **Vision model server** running on `http://localhost:8082/v1/chat/completions`
- **Chrome DevTools MCP** connected (configured globally, should be available)

## Workflow

### Step 1: Navigate & Reload

```
chrome-devtools_navigate_page(type="reload", ignoreCache=true)
```

Always reload with `ignoreCache=true` to ensure the latest build is shown.

### Step 2: Take Screenshot

```
chrome-devtools_take_screenshot(format="jpeg", quality=85, filePath="/tmp/portfolio-review.jpg")
```

Use `jpeg` format for smaller files. Save to `/tmp/` (never track these in git). For full-page reviews, add `fullPage=true`.

### Step 3: Analyze with Vision Model

```bash
python3 ~/vision_check.py /tmp/portfolio-review.jpg "Your detailed prompt here"
```

**Prompt guidelines:** Be specific about what to review. Example prompts:

- *"Review the hero section. Note profile photo size, name styling, subtitle content, and social icon spacing."*
- *"Check color contrast and accessibility of the navigation cards."*
- *"Evaluate the footer layout and social link consistency."*

## Common Tasks

### After making CSS/layout changes
1. Reload the page (ignore cache)
2. Take a full-page screenshot
3. Prompt the vision model to review the changed area specifically

### After Jekyll server issues
1. Check if server is running: `pgrep -f "jekyll"`
2. If not: `pkill -9 -f "jekyll"` then restart
3. Wait 3 seconds, verify with: `curl -s --max-time 5 http://localhost:4000/ | head -5`

### Comparing before/after
1. Take "before" screenshot, save to `/tmp/before.jpg`
2. Make changes
3. Reload, take "after" screenshot, save to `/tmp/after.jpg`
4. Run vision analysis on both with the same prompt for fair comparison

## Notes

- The vision script expects `.jpg` files — if Chrome saves as `.jpeg`, rename first: `mv /tmp/file.jpeg /tmp/file.jpg`
- Screenshot files in `/tmp/` are not tracked by git — no need to clean up
- The `.chrome-screenshots/` directory exists in the repo but is git-ignored; use `/tmp/` for transient reviews
- The vision model (Gemma 4) is good at layout, spacing, and color analysis but may miss small text details
