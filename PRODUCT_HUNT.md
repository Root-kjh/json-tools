# Product Hunt Launch Guide

## Product Information

### Name
```
JSON Tools
```

### Tagline (60자 이내)
```
Privacy-first JSON utilities - format, validate, convert in your browser
```

### Description
```
JSON Tools is a free, privacy-focused collection of JSON utilities that runs entirely in your browser.

🔒 **100% Local Processing** - Your data never leaves your device
⚡ **17 Tools in One Place** - Format, validate, minify, convert, compare, and more
🚫 **No Signup Required** - Just open and use

**Features:**
• JSON Formatter & Validator
• JSON to TypeScript converter
• JSON to YAML/CSV/XML converters
• JSON Diff - compare two JSON objects
• JSON Path Finder
• JSON Schema Generator
• AI Assistant (bring your own API key)
• And 10 more tools...

**Also available as a Chrome Extension** for quick access from any webpage.

Built for developers who care about privacy. All processing happens client-side using modern browser APIs.

Website: https://json.jobby-time.com
```

### Topics/Tags
```
- Developer Tools
- Productivity
- Privacy
- JSON
- TypeScript
- Free
- Open Source
```

### First Comment (maker's comment)
```
Hey Product Hunt! 👋

I built JSON Tools because I was tired of pasting sensitive JSON data into random online tools.

Every JSON formatter/validator I found either:
- Sent my data to their servers
- Was cluttered with ads
- Required signup for basic features

So I built a tool that:
✅ Processes everything locally in your browser
✅ Has zero tracking (except basic Google Analytics)
✅ Is completely free and open source
✅ Works offline once loaded

The Chrome extension was just approved, so you can format JSON right from any webpage with a right-click!

I'd love your feedback - what JSON tools do you wish existed?

GitHub: https://github.com/Root-kjh/json-tools
```

---

## Screenshots Needed

1. **Homepage** - 1270x760px
   - Shows all 17 tool cards
   
2. **Formatter in action** - 1270x760px
   - Input JSON on left, formatted output on right
   
3. **TypeScript conversion** - 1270x760px
   - JSON to TypeScript interface generation
   
4. **Chrome Extension** - 1270x760px
   - Extension popup with sample JSON

---

## Launch Checklist

### Before Launch
- [ ] Create Product Hunt maker account (if not exists)
- [ ] Prepare 4 screenshots (1270x760px)
- [ ] Prepare logo (240x240px)
- [ ] Write description and tagline
- [ ] Schedule launch for Tuesday/Wednesday (best days)
- [ ] Notify friends/community to support on launch day

### Launch Day
- [ ] Post first comment immediately after launch
- [ ] Share on Twitter/X
- [ ] Share on LinkedIn
- [ ] Post in relevant Discord/Slack communities
- [ ] Reply to every comment

### Best Launch Times
- **Tuesday, Wednesday, Thursday** are best days
- **12:01 AM PT** (Pacific Time) - products reset at midnight PT
- This is **4:01 PM KST** (Korea Standard Time)

---

## Promotional Graphics

### Logo (already have)
- `chrome-extension/icons/icon128.png` - scale up or use SVG

### Screenshots to capture
Use viewport: 1270x760px

```bash
# Capture screenshots with Playwright
npx playwright screenshot --viewport-size="1270,760" "https://json.jobby-time.com" ph-homepage.png
npx playwright screenshot --viewport-size="1270,760" "https://json.jobby-time.com/formatter" ph-formatter.png
npx playwright screenshot --viewport-size="1270,760" "https://json.jobby-time.com/to-typescript" ph-typescript.png
```

---

## Post-Launch

1. **Update GitHub README** with Product Hunt badge
2. **Add to website** - "Featured on Product Hunt" badge
3. **Respond to all feedback** within 24 hours
4. **Track metrics** - visits, signups, GitHub stars
