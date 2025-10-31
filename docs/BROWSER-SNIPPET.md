# Use Feedback Widget on ANY Website

Use the feedback widget on any website you visit without installing extensions - just paste code in the browser console!

## 🚀 Quick Start - Console Snippet

### ⚠️ CORS Issue Solution

Browsers block HTTPS websites from loading scripts from localhost for security. 

**✅ WORKING METHOD:** Paste the entire script directly (no external loading!)

**Step 1:** Copy the ENTIRE content from `CONSOLE-SNIPPET.js`

**Step 2:** Visit ANY website (Google, GitHub, etc.)

**Step 3:** Open Console (F12 or Cmd+Option+J)

**Step 4:** Paste and press Enter

**Step 5:** ✅ Widget appears!

> See `CORS-FIX.md` for detailed solutions and alternatives

---

### Method 1: Load from GitHub/CDN (Production)

### Method 2: Load from CDN/GitHub (When Deployed)

Once you host the file on GitHub or a CDN, use this snippet:

```javascript
(function() {
  const script = document.createElement('script');
  // Replace with your actual CDN URL
  script.src = 'https://cdn.jsdelivr.net/gh/YOUR-USERNAME/YOUR-REPO/feedback-widget.min.js';
  script.onload = function() {
    FeedbackWidget.init();
    console.log('✅ Feedback Widget loaded!');
  };
  document.head.appendChild(script);
})();
```

## 📌 Bookmarklet (Even Easier!)

Create a bookmarklet that you can click to activate the widget on any page:

**Step 1:** Create a new bookmark in your browser

**Step 2:** Set the URL to this (for local testing):

```javascript
javascript:(function(){const s=document.createElement('script');s.src='http://localhost:8000/feedback-widget.js';s.onload=()=>{FeedbackWidget.init();console.log('✅ Widget loaded!')};document.head.appendChild(s)})();
```

**Step 3:** Click the bookmark on any website to activate the feedback widget!

### Bookmarklet for CDN (Production):

```javascript
javascript:(function(){const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/YOUR-USERNAME/YOUR-REPO/feedback-widget.min.js';s.onload=()=>FeedbackWidget.init();document.head.appendChild(s)})();
```

## 🎯 How to Use

1. **Visit any website** (e.g., google.com, github.com, youtube.com)
2. **Open Console** (F12 or Cmd+Option+J on Mac)
3. **Paste the snippet** and press Enter
4. **Click the "💬 Feedback" button** that appears in the bottom-right
5. **Draw boxes and add feedback** on any element!

## 💾 Storage

- Feedback is saved to `localStorage` for each domain
- Each website will have its own isolated feedback
- Feedback persists across page reloads
- Different pages on the same domain are tracked separately

## 🔧 Advanced Usage

### Custom Configuration

```javascript
(function() {
  const script = document.createElement('script');
  script.src = 'http://localhost:8000/feedback-widget.js';
  script.onload = function() {
    FeedbackWidget.init({
      buttonPosition: 'top-left',        // or 'top-right', 'bottom-left', 'bottom-right'
      maxCommentLength: 1000,            // Maximum characters in feedback
      storageKey: 'my_custom_feedback',  // Custom localStorage key
      theme: 'light'                     // Theme (future feature)
    });
  };
  document.head.appendChild(script);
})();
```

### Export Feedback Data

After adding feedback, run in console:

```javascript
// View all feedback
console.log(FeedbackWidget.exportFeedbacks());

// Copy feedback as JSON
copy(JSON.stringify(FeedbackWidget.exportFeedbacks(), null, 2));
```

### Clear All Feedback

```javascript
FeedbackWidget.clearFeedbacks();
```

### Import Feedback

```javascript
const feedbackData = [/* your feedback array */];
FeedbackWidget.importFeedbacks(feedbackData);
```

## 🌐 Real-World Examples

### Example 1: GitHub
```javascript
// Visit github.com
// Open console
(function() {
  const script = document.createElement('script');
  script.src = 'http://localhost:8000/feedback-widget.js';
  script.onload = () => FeedbackWidget.init();
  document.head.appendChild(script);
})();
// Add feedback to any part of GitHub's UI!
```

### Example 2: Your Own Website
```javascript
// Add to any website you're developing
// Great for getting feedback from testers
```

## 🎨 Browser Extension Alternative (Future)

While this console method works great, we could also create:
- **Chrome Extension** - One-click activation on any site
- **Firefox Add-on** - Cross-browser support
- **User Script** - For Tampermonkey/Greasemonkey

## 📝 Tips

- **Refresh Clears State**: The widget is loaded dynamically, so refreshing removes it (feedback data is saved though)
- **CORS Issues**: If loading from localhost to external sites, you won't have CORS issues since the script is loaded client-side
- **Same Domain**: Feedback is domain-specific (google.com feedback won't appear on github.com)
- **Page-Specific**: Each page path has its own feedback markers

## 🚀 Quick Copy-Paste

Just want it to work? Copy this one-liner:

```javascript
(function(){const s=document.createElement('script');s.src='http://localhost:8000/feedback-widget.js';s.onload=()=>{FeedbackWidget.init();console.log('✅ Ready!')};document.head.appendChild(s)})();
```

## 🎯 Use Cases

- **Website Testing**: Add feedback while browsing sites you're developing
- **Bug Reporting**: Annotate issues on any website
- **Design Feedback**: Comment on UI elements across the web
- **Personal Notes**: Leave markers and notes on websites for your own reference
- **Client Demos**: Show feedback functionality to clients on their existing sites

---

**Note**: Remember to have your local server running (`python3 -m http.server 8000`) when using localhost URLs!

