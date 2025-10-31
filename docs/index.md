# 📚 Feedback Widget Documentation

Welcome to the Feedback Widget documentation! This directory contains comprehensive guides for using, integrating, and understanding the feedback widget.

## 📖 Documentation Index

### Getting Started
- **[Quick Start Guide](QUICKSTART.md)** - Get up and running in 5 minutes
- **[Integration Guide](INTEGRATION.md)** - Integrate into your website or app

### Usage Guides
- **[Browser Console Usage](BROWSER-SNIPPET.md)** - Use on ANY website via browser console
- **[CORS Fix Guide](CORS-FIX.md)** - Solutions for cross-origin issues

### Project Information
- **[Project Structure](PROJECT-STRUCTURE.md)** - Understand the codebase
- **[Changelog](CHANGELOG.md)** - Version history and updates
- **[Status & Development Notes](status.md)** - Current implementation status

## 🚀 Quick Links

### For First-Time Users
1. Start with [QUICKSTART.md](QUICKSTART.md)
2. Check out [BROWSER-SNIPPET.md](BROWSER-SNIPPET.md) to use it on any website

### For Developers
1. Read [INTEGRATION.md](INTEGRATION.md) for implementation details
2. Review [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md) for code organization
3. Check [CORS-FIX.md](CORS-FIX.md) if you encounter cross-origin issues

### For Contributors
1. Review [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md)
2. Check [status.md](status.md) for current features and roadmap
3. See [CHANGELOG.md](CHANGELOG.md) for version history

## 🎯 Common Use Cases

### Use Case 1: Add to Your Website
```html
<script src="feedback-widget.min.js"></script>
<script>
  FeedbackWidget.init();
</script>
```
[Full Guide →](INTEGRATION.md)

### Use Case 2: Test on External Websites
Copy the content from `CONSOLE-SNIPPET.js` and paste in browser console.

[Full Guide →](BROWSER-SNIPPET.md)

### Use Case 3: Development & Testing
Use the demo files in `../demo-multipage/` to test multipage and SPA support.

[Demo README →](../demo-multipage/README.md)

## 📂 Project Structure

```
userfeedback/
├── docs/                          # 📚 You are here
│   ├── README.md                  # This file
│   ├── QUICKSTART.md             # Quick start guide
│   ├── INTEGRATION.md            # Integration guide
│   ├── BROWSER-SNIPPET.md        # Browser console usage
│   ├── CORS-FIX.md               # CORS issue solutions
│   ├── PROJECT-STRUCTURE.md      # Code organization
│   ├── CHANGELOG.md              # Version history
│   └── status.md                 # Development status
├── demo-multipage/               # Demo pages
├── feedback-widget.js            # Main source code
├── feedback-widget.min.js        # Minified version
├── CONSOLE-SNIPPET.js            # Copy-paste for console
├── bookmarklet.html              # Bookmarklet generator
└── README.md                     # Main README
```

## 🔧 Technical Details

### Features
- ✅ Visual feedback capture with drawing tool
- ✅ Multipage website support
- ✅ Single-page application (SPA) support
- ✅ LocalStorage persistence
- ✅ Route change detection
- ✅ No dependencies
- ✅ Lightweight (~10KB minified)

### Browser Support
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

### Requirements
- Modern browser with ES6 support
- LocalStorage enabled
- JavaScript enabled

## 💡 Tips

- **Quick Testing?** → Use [BROWSER-SNIPPET.md](BROWSER-SNIPPET.md)
- **Production Use?** → See [INTEGRATION.md](INTEGRATION.md)
- **Having Issues?** → Check [CORS-FIX.md](CORS-FIX.md)
- **Understanding Code?** → Read [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md)

## 🤝 Contributing

Want to contribute? Check:
1. [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md) - Understand the codebase
2. [status.md](status.md) - See what's needed
3. Main README.md - Contribution guidelines

## 📞 Support

- 📖 Check docs in this folder
- 🐛 Report issues on GitHub
- 💬 Ask questions in discussions

## 🎉 Quick Start Commands

```bash
# Start local demo server
python3 -m http.server 8000

# Open demo in browser
open http://localhost:8000/demo-multipage/

# View console snippet
cat ../CONSOLE-SNIPPET.js

# Build minified version
npx terser ../feedback-widget.js -c -m -o ../feedback-widget.min.js
```

---

**Happy Coding! 🚀**

For more information, visit the main [README.md](../README.md)

