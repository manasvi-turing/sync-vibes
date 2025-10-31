# 💬 SyncVibes

Ultra-lightweight feedback widget for any website. Draw boxes, leave comments, sync the vibes.

## ✨ Features

- 🪶 **8KB minified** - No dependencies
- 🎨 **Visual feedback** - Draw boxes on any element
- 🔄 **SPA support** - Works with React, Vue, hash routing
- 💾 **Auto-save** - LocalStorage persistence
- 📱 **Mobile-friendly** - Responsive design
- 🌐 **Universal** - Use on ANY website via console

## 🚀 Quick Start

### Add to Your Website

```html
<script src="syncvibes.min.js"></script>
<script>
  SyncVibes.init();
</script>
```

### Use on ANY Website (Console)

1. Copy entire content from `CONSOLE-SNIPPET.js`
2. Paste in browser console (F12)
3. Click the 💬 button that appears
4. Draw and leave feedback!

## 📖 Documentation

See [`docs/`](docs/) for complete documentation:
- [Quick Start](docs/QUICKSTART.md)
- [Integration Guide](docs/INTEGRATION.md)
- [Browser Console Usage](docs/BROWSER-SNIPPET.md)
- [CORS Solutions](docs/CORS-FIX.md)

## 🎯 Use Cases

- 🐛 Bug reporting
- 🎨 Design feedback
- 📝 Content review
- 🧪 User testing
- 💬 Client feedback

## 🎭 Demo

```bash
python3 -m http.server 8000
# Visit http://localhost:8000/demo-multipage/
```

## 💡 Why SyncVibes?

Traditional feedback tools are heavy, require accounts, or need complex integrations. SyncVibes is different - paste one script tag and you're done. Use it anywhere, even on websites you don't own (via console). Keep feedback in sync, keep the vibes flowing.

## 📦 What's Included

```
syncvibes/
├── syncvibes.js          # Main source (20KB)
├── syncvibes.min.js      # Minified (8KB)
├── CONSOLE-SNIPPET.js    # Copy-paste version
├── docs/                 # Documentation
└── demo-multipage/       # Live demos
```

## 🔧 API

```javascript
// Initialize
SyncVibes.init({
  buttonPosition: 'bottom-right',  // 'top-left', 'top-right', 'bottom-left'
  maxCommentLength: 500,
  showButton: true
});

// Export feedbacks
const data = SyncVibes.exportFeedbacks();

// Import feedbacks
SyncVibes.importFeedbacks(data);

// Clear all
SyncVibes.clearFeedbacks();
```

## 🌟 Works With

- ✅ Vanilla HTML/CSS/JS
- ✅ React / Next.js
- ✅ Vue / Nuxt
- ✅ Angular
- ✅ Any framework or no framework
- ✅ Traditional multipage sites
- ✅ Single-page applications
- ✅ Hash-based routing

## 📏 Size

- **Unminified**: 20KB
- **Minified**: 8KB
- **Gzipped**: ~3KB

## 🔒 Privacy

- All data stored in browser localStorage
- No external requests
- No tracking or analytics
- Your data stays on your device

## 📄 License

MIT - Use it anywhere, anytime!

## 🤝 Contributing

Knowledge-sharing project. PRs welcome!

## 💬 Support

- 📖 Check [docs/](docs/)
- 🐛 Report issues
- 💡 Share ideas

---

**Made with ❤️ for the community**

*Ultra-lightweight • No dependencies • Works everywhere*
