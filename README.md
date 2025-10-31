# 🎯 Feedback Widget

Ultra-lightweight JavaScript library for capturing user feedback on any website. No dependencies, CDN-ready, and works everywhere.

## ✨ Features

- **🪶 Super Lightweight**: Only ~8KB minified, no dependencies
- **🎨 Beautiful UI**: Modern, animated interface
- **📍 Position Tracking**: Captures exact page coordinates and context
- **💾 Auto-Save**: Stores feedbacks in localStorage
- **🔄 Export/Import**: Easy JSON export for backend sync
- **🚀 Universal**: Works with React, Next.js, Vue, or vanilla HTML
- **📱 Responsive**: Mobile-friendly design

## 🚀 Quick Start

### CDN (jsDelivr)

```html
<!-- Add to your website -->
<script src="https://cdn.jsdelivr.net/gh/[username]/[repo]/feedback-widget.min.js"></script>
<script>
  FeedbackWidget.init();
</script>
```

### Local Installation

```html
<script src="feedback-widget.js"></script>
<script>
  FeedbackWidget.init();
</script>
```

## 📖 Usage

### Basic Initialization

```javascript
FeedbackWidget.init();
```

### With Options

```javascript
FeedbackWidget.init({
  buttonPosition: 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
  theme: 'light',                 // 'light' or 'dark' (future)
  maxCommentLength: 500,          // Maximum characters per comment
  showButton: true,               // Show/hide the feedback button
  storageKey: 'feedback_widget_data' // localStorage key
});
```

## 🎯 How It Works

1. User clicks the "💬 Feedback" button
2. Click anywhere on the page to place a feedback marker
3. Add a comment in the popup box
4. Feedback is saved with:
   - Comment text
   - Exact X/Y coordinates
   - Page URL and pathname
   - Timestamp
   - Viewport dimensions
   - Scroll position
   - User agent

## 📊 API Methods

### `init(options)`
Initialize the widget with optional configuration.

```javascript
FeedbackWidget.init({
  buttonPosition: 'bottom-right'
});
```

### `exportFeedbacks()`
Export all feedbacks as JSON array.

```javascript
const feedbacks = FeedbackWidget.exportFeedbacks();
console.log(feedbacks);
// [{ id: "...", comment: "...", position: {...}, ... }]
```

### `importFeedbacks(feedbacks)`
Import feedbacks from JSON array.

```javascript
FeedbackWidget.importFeedbacks([
  { id: "abc123", comment: "Great feature!", position: {...}, ... }
]);
```

### `clearFeedbacks()`
Clear all feedbacks (with confirmation).

```javascript
FeedbackWidget.clearFeedbacks();
```

## 📦 Feedback Object Structure

```javascript
{
  "id": "lj3k2h1k2j3h",
  "comment": "This button should be bigger",
  "position": {
    "x": 450,
    "y": 320,
    "pageX": 450,
    "pageY": 320,
    "viewportWidth": 1920,
    "viewportHeight": 1080,
    "scrollX": 0,
    "scrollY": 0
  },
  "url": "https://example.com/page",
  "pathname": "/page",
  "timestamp": "2025-10-31T12:34:56.789Z",
  "userAgent": "Mozilla/5.0...",
  "screenSize": {
    "width": 1920,
    "height": 1080
  }
}
```

## 🔧 Backend Integration (Future)

```javascript
// Export feedbacks and send to backend
async function syncFeedbacks() {
  const feedbacks = FeedbackWidget.exportFeedbacks();
  
  await fetch('/api/feedbacks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedbacks)
  });
}
```

## 🎨 Framework Examples

### React

```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    FeedbackWidget.init({
      buttonPosition: 'bottom-right'
    });
  }, []);
  
  return <div>Your App</div>;
}
```

### Next.js

```jsx
// pages/_app.js
import { useEffect } from 'react';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      FeedbackWidget.init();
    }
  }, []);
  
  return (
    <>
      <Script src="/feedback-widget.js" />
      <Component {...pageProps} />
    </>
  );
}
```

### Vue

```vue
<template>
  <div id="app">Your App</div>
</template>

<script>
export default {
  mounted() {
    FeedbackWidget.init();
  }
}
</script>
```

## 🎭 Demo

### Quick Test
Open `demo.html` in your browser to see the widget in action.

### Full Demo with Multipage/SPA Support
Check out `demo-multipage/` folder for comprehensive demos showing:
- Traditional multipage website support
- Single-page application (SPA) routing
- Page-specific feedback markers
- Route change detection

```bash
python3 -m http.server 8000
# Visit http://localhost:8000/demo-multipage/
```

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) folder:

**Getting Started:**
- [Quick Start Guide](docs/QUICKSTART.md) - Get up and running in 5 minutes
- [Browser Console Usage](docs/BROWSER-SNIPPET.md) - Use on ANY website instantly (no installation!)
- [Integration Guide](docs/INTEGRATION.md) - Add to your website

**Reference:**
- [CORS Fix Guide](docs/CORS-FIX.md) - Solutions for cross-origin issues
- [Project Structure](docs/PROJECT-STRUCTURE.md) - Understand the codebase
- [Changelog](docs/CHANGELOG.md) - Version history
- [Development Status](docs/status.md) - Current features & roadmap

**[📖 Browse all documentation →](docs/)**

## 📏 Size

- **Unminified**: ~12KB
- **Minified**: ~8KB
- **Gzipped**: ~3KB

## 🔒 Privacy

- All data stored in browser localStorage
- No external requests made
- No tracking or analytics
- Data stays on user's device until exported

## 🛠️ Development

```bash
# No build step needed! Pure vanilla JS
# Just edit feedback-widget.js and refresh

# To minify (optional):
npx terser feedback-widget.js -o feedback-widget.min.js -c -m
```

## 🎯 Roadmap

- [x] Core feedback capture
- [x] Position tracking
- [x] Export/Import JSON
- [ ] Backend API sync
- [ ] Dark theme
- [ ] Screenshot capture
- [ ] Multi-language support
- [ ] Admin dashboard
- [ ] Analytics

## 📄 License

MIT License - feel free to use in any project!

## 🤝 Contributing

Contributions welcome! This is a knowledge-sharing project.

## 📞 Support

Open an issue or contribute to make it better!

---

**Made with ❤️ for the community** | Ultra-lightweight • No dependencies • Works everywhere

