# Firefox Add-ons Store Submission Guide

## 1. Create Developer Account

1. Go to https://addons.mozilla.org/developers/
2. Sign in with Firefox Account (or create one)
3. **No registration fee** (unlike Chrome Web Store)

---

## 2. Submit Extension

1. Click **"Submit a New Add-on"**
2. Choose **"On this site"** (for public listing)
3. Upload `json-tools-firefox.zip`

---

## 3. Add-on Information

### Name
```
JSON Tools - Format, Validate & Convert
```

### Summary (up to 250 characters)
```
Privacy-first JSON utilities. Format, validate, minify, and convert JSON to TypeScript, YAML, CSV, XML. All processing happens locally in your browser.
```

### Description
```
JSON Tools is a privacy-first collection of JSON utilities that runs entirely in your browser.

FEATURES:
- Format & Beautify JSON with customizable indentation
- Validate JSON with detailed error messages
- Minify JSON to reduce size
- Convert JSON to TypeScript interfaces
- Convert JSON to YAML, CSV, or XML

PRIVACY:
- 100% local processing - your data never leaves your device
- No tracking, no analytics, no data collection
- Works offline once loaded

QUICK ACCESS:
- Keyboard shortcut: Ctrl+Shift+J (Cmd+Shift+J on Mac)
- Right-click context menu on selected text
- Click toolbar icon anytime

Perfect for developers, data analysts, and anyone working with JSON data.

Website: https://json.jobby-time.com
Source Code: https://github.com/Root-kjh/json-tools
```

### Categories
- Developer Tools
- Privacy & Security

### Tags
```
json, formatter, validator, converter, typescript, yaml, developer tools, privacy
```

---

## 4. Version Notes

```
Initial release:
- JSON formatting with customizable indentation
- JSON validation with error details
- JSON minification
- Convert to TypeScript, YAML, CSV, XML
- Context menu integration
- Keyboard shortcuts
```

---

## 5. Privacy Policy

```
https://json.jobby-time.com/privacy.html
```

---

## 6. Screenshots

Upload from `store-assets/` folder:
- `screenshot-format.png`
- `screenshot-convert.png`

---

## 7. Icon

Already included in the zip:
- `icons/icon128.png`

---

## 8. Review Process

- Firefox review typically takes **1-5 days**
- Automated review first, then manual review
- You'll receive email notification when approved

---

## Testing Locally

1. Open Firefox
2. Go to `about:debugging`
3. Click **"This Firefox"**
4. Click **"Load Temporary Add-on"**
5. Select `manifest.json` from `firefox-extension/` folder

---

## Differences from Chrome Extension

| Feature | Chrome | Firefox |
|---------|--------|---------|
| Manifest | V3 with service_worker | V3 with background.scripts |
| API | chrome.* | browser.* (with chrome.* polyfill) |
| Store Fee | $5 one-time | Free |
| Review Time | 1-3 days | 1-5 days |
