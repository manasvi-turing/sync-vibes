# Multipage & SPA Demo

This demo showcases the feedback widget's support for both traditional multipage websites and modern single-page applications (SPAs).

## 📁 Demo Structure

### Traditional Multipage Demo
- **index.html** - Home page with overview
- **page1.html** - Products page with product grid
- **page2.html** - About page with team info
- **page3.html** - Contact page with form
- **page4.html** - Blog page with articles

### Single Page Application Demo
- **spa-demo.html** - Simulated SPA with client-side routing

## 🚀 How to Test

### Option 1: Local File System
1. Open any HTML file directly in your browser
2. Navigate between pages using the links
3. Add feedback using the widget button
4. Observe how feedback is page-specific

### Option 2: Local Server (Recommended)
```bash
# From the userfeedback directory, run:
python3 -m http.server 8000

# Or use Node.js:
npx serve

# Then open: http://localhost:8000/demo-multipage/
```

## ✨ Features to Test

### Multipage Support
1. **Page Isolation**: Add feedback on one page, navigate to another - feedback doesn't appear
2. **Persistence**: Feedback persists when you return to a page
3. **URL Tracking**: Each feedback is associated with its page's pathname

### SPA Support
1. **Route Changes**: Navigate in the SPA demo - URL changes without page reload
2. **History API**: Uses pushState/replaceState (like React Router)
3. **Auto-Detection**: Widget automatically detects route changes
4. **Back/Forward**: Browser navigation works correctly

## 🎯 What Makes This Work

The feedback widget now includes:

1. **Page Filtering** - Only shows markers for the current pathname
2. **Route Detection** - Listens to:
   - `popstate` events (back/forward buttons)
   - `pushState` interception (SPA navigation)
   - `replaceState` interception (SPA URL updates)
   - `hashchange` events (hash-based routing)

3. **Smart Cleanup** - Removes old markers and closes dialogs on route changes

## 🔍 Implementation Details

Each feedback includes:
- `pathname` - The page path (e.g., `/demo-multipage/page1.html`)
- `url` - Full URL for additional context
- Position, comment, timestamp, etc.

On page load or route change:
- Widget filters localStorage feedback by pathname
- Only creates markers for matching pages
- Previous markers are cleared first

## 💡 Tips

- Open browser DevTools Console to see route change logs
- Check localStorage to see all stored feedback data
- Try the SPA demo to see real-time route handling
- Add feedback to overlapping UI elements on different pages to see isolation

## 🌟 Real-World Usage

This pattern works with:
- **React** - React Router
- **Vue** - Vue Router
- **Angular** - Angular Router
- **Next.js** - App Router & Pages Router
- **Traditional Sites** - Multi-page HTML sites
- **Hybrid Apps** - Mix of server and client routing

