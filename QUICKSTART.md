# ⚡ Quick Start Guide

Get started with Feedback Widget in under 2 minutes!

## 🚀 Installation

### Option 1: Copy & Paste (Fastest)

Add these two lines to your HTML:

```html
<script src="feedback-widget.js"></script>
<script>FeedbackWidget.init();</script>
```

**That's it!** 🎉

### Option 2: CDN (Recommended)

```html
<script src="https://cdn.jsdelivr.net/gh/[username]/[repo]/feedback-widget.min.js"></script>
<script>FeedbackWidget.init();</script>
```

---

## 🎯 Basic Usage

### 1. Try the Demo

```bash
# Open demo.html in your browser
open demo.html

# Or use a local server
python3 -m http.server 8000
# Then visit: http://localhost:8000/demo.html
```

### 2. Add to Your Website

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Hello World</h1>
  
  <!-- Add at the end of body -->
  <script src="feedback-widget.js"></script>
  <script>
    FeedbackWidget.init();
  </script>
</body>
</html>
```

### 3. Use It

1. Click the "💬 Feedback" button (bottom-right corner)
2. Click anywhere on the page
3. Type your comment
4. Click "Save"

Done! ✅

---

## ⚙️ Configuration

### Custom Position

```javascript
FeedbackWidget.init({
  buttonPosition: 'top-left' // top-left, top-right, bottom-left, bottom-right
});
```

### Hide Button (Use Custom Trigger)

```html
<button id="my-feedback-btn">Leave Feedback</button>

<script>
  FeedbackWidget.init({ showButton: false });
  
  document.getElementById('my-feedback-btn').onclick = () => {
    FeedbackWidget.toggleMode();
  };
</script>
```

### Limit Comment Length

```javascript
FeedbackWidget.init({
  maxCommentLength: 200 // Default: 500
});
```

---

## 📤 Export/Import

### Export to Console

```javascript
const feedbacks = FeedbackWidget.exportFeedbacks();
console.log(feedbacks);
```

### Export to File

```javascript
function downloadFeedbacks() {
  const feedbacks = FeedbackWidget.exportFeedbacks();
  const blob = new Blob([JSON.stringify(feedbacks, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'feedbacks.json';
  a.click();
}
```

### Import

```javascript
const myFeedbacks = [
  { id: "abc", comment: "Great!", position: {...}, ... }
];

FeedbackWidget.importFeedbacks(myFeedbacks);
```

### Clear All

```javascript
FeedbackWidget.clearFeedbacks(); // Shows confirmation
```

---

## 🔌 Framework Examples

### React

```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    FeedbackWidget.init();
  }, []);
  
  return <div>My App</div>;
}
```

### Next.js

```jsx
// pages/_app.js
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Script src="/feedback-widget.js" onLoad={() => {
        FeedbackWidget.init();
      }} />
      <Component {...pageProps} />
    </>
  );
}
```

### Vue

```vue
<script>
export default {
  mounted() {
    FeedbackWidget.init();
  }
}
</script>
```

---

## 🔄 Backend Sync

### Send to Server

```javascript
async function syncToBackend() {
  const feedbacks = FeedbackWidget.exportFeedbacks();
  
  await fetch('/api/feedbacks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedbacks)
  });
  
  console.log('✅ Synced!');
}

// Auto-sync every 5 minutes
setInterval(syncToBackend, 5 * 60 * 1000);
```

---

## 📊 Data Structure

Each feedback object contains:

```javascript
{
  "id": "unique-id",
  "comment": "User's comment",
  "position": {
    "x": 450,              // Click X coordinate
    "y": 320,              // Click Y coordinate  
    "viewportWidth": 1920,  // Window width
    "viewportHeight": 1080, // Window height
    "scrollX": 0,          // Horizontal scroll
    "scrollY": 0           // Vertical scroll
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

---

## 🎨 Customization

### Hide Button, Use Custom Trigger

```javascript
FeedbackWidget.init({ showButton: false });

document.getElementById('custom-btn').onclick = () => {
  FeedbackWidget.toggleMode();
};
```

### Custom Storage Key

```javascript
FeedbackWidget.init({
  storageKey: 'my_custom_feedback_key'
});
```

---

## 🐛 Troubleshooting

### Widget not showing?

```javascript
// Check if loaded
console.log(window.FeedbackWidget);

// Force init
if (window.FeedbackWidget) {
  window.FeedbackWidget.init();
}
```

### Feedbacks not saving?

```javascript
// Check localStorage
const data = localStorage.getItem('feedback_widget_data');
console.log(JSON.parse(data));
```

### Clear cache

```javascript
localStorage.removeItem('feedback_widget_data');
location.reload();
```

---

## 📚 Learn More

- **Full Documentation**: See [README.md](README.md)
- **Framework Guides**: See [INTEGRATION.md](INTEGRATION.md)
- **Changelog**: See [CHANGELOG.md](CHANGELOG.md)
- **Examples**: Check `demo.html`, `example-vanilla.html`, `example-react.html`

---

## 💡 Pro Tips

1. **Test locally first**: Open `demo.html` to see how it works
2. **Start simple**: Just use `FeedbackWidget.init()` - that's enough!
3. **Export often**: Use the export feature to backup feedbacks
4. **Plan backend later**: Focus on capturing feedback first, sync later
5. **Check console**: All methods return data - check browser console

---

## 🎯 Common Use Cases

### User Testing
```javascript
// Collect feedback during beta testing
FeedbackWidget.init({ buttonPosition: 'top-right' });
```

### Bug Reporting
```javascript
// Let users report bugs visually
FeedbackWidget.init({ maxCommentLength: 1000 });
```

### Design Review
```javascript
// Get feedback on specific page elements
// Users click exactly where they want changes
```

### Client Approvals
```javascript
// Clients can leave comments on designs/prototypes
```

---

## 🚀 Next Steps

1. ✅ Try the demo (`demo.html`)
2. ✅ Add to your website
3. ✅ Collect some feedback
4. ✅ Export the data
5. ✅ Build backend sync (optional)

---

**That's it! You're ready to collect feedback! 🎉**

Questions? Check the [full documentation](README.md) or open an issue.

---

Made with ❤️ for rapid development

