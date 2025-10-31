# 🔧 Integration Guide

Complete guide for integrating Feedback Widget into different frameworks and platforms.

## 📦 Installation Methods

### 1. CDN (Recommended for Quick Start)

```html
<!-- Latest version -->
<script src="https://cdn.jsdelivr.net/gh/[username]/[repo]/syncvibe.min.js"></script>
```

### 2. NPM (Coming Soon)

```bash
npm install syncvibe
```

### 3. Direct Download

Download `syncvibe.js` and include it in your project:

```html
<script src="/js/syncvibe.js"></script>
```

---

## 🎨 Framework Integrations

### React

#### Functional Component

```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Initialize widget after component mounts
    if (window.SyncVibe) {
      window.SyncVibe.init({
        buttonPosition: 'bottom-right',
        maxCommentLength: 500
      });
    }
  }, []);

  const exportFeedbacks = () => {
    const data = window.SyncVibe.exportFeedbacks();
    console.log('Feedbacks:', data);
  };

  return (
    <div>
      <h1>My App</h1>
      <button onClick={exportFeedbacks}>Export Feedbacks</button>
    </div>
  );
}
```

#### Custom Hook

```jsx
import { useEffect, useState } from 'react';

function useSyncVibe(config = {}) {
  const [feedbackCount, setFeedbackCount] = useState(0);

  useEffect(() => {
    if (window.SyncVibe) {
      window.SyncVibe.init(config);
      updateCount();
    }
  }, []);

  const updateCount = () => {
    const feedbacks = window.SyncVibe.exportFeedbacks();
    setFeedbackCount(feedbacks.length);
  };

  const exportFeedbacks = () => {
    return window.SyncVibe.exportFeedbacks();
  };

  const clearFeedbacks = () => {
    window.SyncVibe.clearFeedbacks();
    updateCount();
  };

  return {
    feedbackCount,
    exportFeedbacks,
    clearFeedbacks,
    updateCount
  };
}

// Usage
function App() {
  const { feedbackCount, exportFeedbacks } = useSyncVibe({
    buttonPosition: 'bottom-right'
  });

  return (
    <div>
      <p>Feedbacks: {feedbackCount}</p>
      <button onClick={exportFeedbacks}>Export</button>
    </div>
  );
}
```

---

### Next.js

#### App Router (Next.js 13+)

```jsx
// app/layout.js
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script 
          src="/syncvibe.js" 
          onLoad={() => {
            window.SyncVibe.init({
              buttonPosition: 'bottom-right'
            });
          }}
        />
      </body>
    </html>
  );
}
```

#### Pages Router

```jsx
// pages/_app.js
import { useEffect } from 'react';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.SyncVibe) {
      window.SyncVibe.init({
        buttonPosition: 'bottom-right'
      });
    }
  }, []);

  return (
    <>
      <Script src="/syncvibe.js" strategy="afterInteractive" />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
```

#### Client Component

```jsx
// components/FeedbackProvider.jsx
'use client';

import { useEffect } from 'react';

export default function FeedbackProvider() {
  useEffect(() => {
    if (window.SyncVibe) {
      window.SyncVibe.init();
    }
  }, []);

  return null;
}

// app/layout.js
import FeedbackProvider from '@/components/FeedbackProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <FeedbackProvider />
      </body>
    </html>
  );
}
```

---

### Vue.js

#### Vue 3

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <h1>My Vue App</h1>
    <button @click="exportFeedbacks">Export Feedbacks</button>
  </div>
</template>

<script>
import { onMounted } from 'vue';

export default {
  name: 'App',
  setup() {
    onMounted(() => {
      if (window.SyncVibe) {
        window.SyncVibe.init({
          buttonPosition: 'bottom-right'
        });
      }
    });

    const exportFeedbacks = () => {
      const data = window.SyncVibe.exportFeedbacks();
      console.log('Feedbacks:', data);
    };

    return {
      exportFeedbacks
    };
  }
};
</script>
```

#### Vue 2

```vue
<template>
  <div id="app">
    <h1>My Vue App</h1>
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    if (window.SyncVibe) {
      window.SyncVibe.init({
        buttonPosition: 'bottom-right'
      });
    }
  }
};
</script>
```

---

### Angular

```typescript
// app.component.ts
import { Component, OnInit } from '@angular/core';

declare global {
  interface Window {
    SyncVibe: any;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  ngOnInit() {
    if (window.SyncVibe) {
      window.SyncVibe.init({
        buttonPosition: 'bottom-right'
      });
    }
  }

  exportFeedbacks() {
    return window.SyncVibe.exportFeedbacks();
  }
}
```

```html
<!-- index.html -->
<script src="/assets/syncvibe.js"></script>
```

---

### Svelte

```svelte
<!-- App.svelte -->
<script>
  import { onMount } from 'svelte';

  onMount(() => {
    if (window.SyncVibe) {
      window.SyncVibe.init({
        buttonPosition: 'bottom-right'
      });
    }
  });

  function exportFeedbacks() {
    const data = window.SyncVibe.exportFeedbacks();
    console.log('Feedbacks:', data);
  }
</script>

<main>
  <h1>My Svelte App</h1>
  <button on:click={exportFeedbacks}>Export Feedbacks</button>
</main>
```

---

## 🔌 Backend Integration

### Syncing to Backend

```javascript
// sync-feedbacks.js
async function syncFeedbacks() {
  const feedbacks = SyncVibe.exportFeedbacks();
  
  try {
    const response = await fetch('/api/feedbacks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        feedbacks,
        metadata: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      })
    });
    
    if (response.ok) {
      console.log('✅ Feedbacks synced successfully');
      // Optionally clear local storage after successful sync
      // SyncVibe.clearFeedbacks();
    }
  } catch (error) {
    console.error('❌ Failed to sync feedbacks:', error);
  }
}

// Auto-sync every 5 minutes
setInterval(syncFeedbacks, 5 * 60 * 1000);

// Sync on page unload
window.addEventListener('beforeunload', syncFeedbacks);
```

### Node.js/Express Backend

```javascript
// server.js
const express = require('express');
const app = express();

app.use(express.json());

// Receive feedbacks from frontend
app.post('/api/feedbacks', async (req, res) => {
  const { feedbacks, metadata } = req.body;
  
  try {
    // Save to database
    await saveFeedbacksToDatabase(feedbacks, metadata);
    
    res.json({ 
      success: true, 
      message: 'Feedbacks saved',
      count: feedbacks.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get all feedbacks
app.get('/api/feedbacks', async (req, res) => {
  try {
    const feedbacks = await getFeedbacksFromDatabase();
    res.json({ feedbacks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Next.js API Route

```javascript
// pages/api/feedbacks.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { feedbacks } = req.body;
    
    // Save to your database
    // await db.feedbacks.insertMany(feedbacks);
    
    res.status(200).json({ 
      success: true, 
      count: feedbacks.length 
    });
  } else if (req.method === 'GET') {
    // Fetch from database
    // const feedbacks = await db.feedbacks.find({});
    
    res.status(200).json({ feedbacks: [] });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
```

---

## ⚙️ Configuration Options

```javascript
SyncVibe.init({
  // Button position: 'bottom-right', 'bottom-left', 'top-right', 'top-left'
  buttonPosition: 'bottom-right',
  
  // Show or hide the feedback button
  showButton: true,
  
  // Theme (currently only 'light' supported)
  theme: 'light',
  
  // Maximum comment length
  maxCommentLength: 500,
  
  // localStorage key for storing feedbacks
  storageKey: 'feedback_widget_data'
});
```

---

## 🎯 Advanced Usage

### Custom Sync Strategy

```javascript
// Initialize without button
SyncVibe.init({ showButton: false });

// Create custom trigger
document.getElementById('custom-feedback-btn').addEventListener('click', () => {
  SyncVibe.toggleMode();
});

// Custom export with filtering
function exportPageFeedbacks() {
  const allFeedbacks = SyncVibe.exportFeedbacks();
  const pageFeedbacks = allFeedbacks.filter(
    fb => fb.pathname === window.location.pathname
  );
  return pageFeedbacks;
}
```

### TypeScript Definitions

```typescript
// syncvibe.d.ts
interface FeedbackPosition {
  x: number;
  y: number;
  pageX: number;
  pageY: number;
  viewportWidth: number;
  viewportHeight: number;
  scrollX: number;
  scrollY: number;
}

interface Feedback {
  id: string;
  comment: string;
  position: FeedbackPosition;
  url: string;
  pathname: string;
  timestamp: string;
  userAgent: string;
  screenSize: {
    width: number;
    height: number;
  };
}

interface SyncVibeConfig {
  buttonPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showButton?: boolean;
  theme?: 'light' | 'dark';
  maxCommentLength?: number;
  storageKey?: string;
}

interface SyncVibe {
  version: string;
  init(config?: SyncVibeConfig): SyncVibe;
  exportFeedbacks(): Feedback[];
  importFeedbacks(feedbacks: Feedback[]): void;
  clearFeedbacks(): void;
  toggleMode(): void;
}

declare global {
  interface Window {
    SyncVibe: SyncVibe;
  }
}
```

---

## 🚀 Deployment

### Vercel

1. Add `syncvibe.js` to your `public` folder
2. Reference it in your HTML/layout
3. Deploy normally

### Netlify

Same as Vercel - add to `public` folder.

### GitHub Pages

```html
<!-- Use jsdelivr CDN -->
<script src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/syncvibe.min.js"></script>
```

---

## 🐛 Troubleshooting

### Widget not appearing?

```javascript
// Check if it's loaded
console.log(window.SyncVibe);

// Manually trigger init
if (window.SyncVibe) {
  window.SyncVibe.init();
}
```

### Feedbacks not saving?

```javascript
// Check localStorage
console.log(localStorage.getItem('feedback_widget_data'));

// Check browser console for errors
```

### Conflicts with existing styles?

The widget uses `fb-` prefix for all classes. If there are conflicts, check your CSS.

---

## 📞 Support

For issues and questions, please check the main README or open an issue.

---

**Made with ❤️ for developers everywhere**

