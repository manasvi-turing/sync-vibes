/**
 * FeedbackWidget - Ultra-lightweight feedback capture library
 * @version 1.0.0
 * @license MIT
 * 
 * Usage:
 *   <script src="https://cdn.jsdelivr.net/gh/[username]/[repo]/feedback-widget.min.js"></script>
 *   <script>FeedbackWidget.init();</script>
 */

(function(window) {
  'use strict';

  // FSID: FB-CORE-001
  const FeedbackWidget = {
    version: '1.0.0',
    feedbacks: [],
    config: {
      storageKey: 'feedback_widget_data',
      showButton: true,
      buttonPosition: 'bottom-right',
      theme: 'light',
      maxCommentLength: 500
    },
    isActive: false,
    currentBox: null,
    isDrawing: false,
    drawStartX: 0,
    drawStartY: 0,
    currentDrawBox: null,
    markersVisible: true,

    // FSID: FB-INIT-001
    init: function(options = {}) {
      this.config = { ...this.config, ...options };
      
      // Restore visibility state from localStorage
      const savedVisibility = localStorage.getItem('feedback_markers_visible');
      if (savedVisibility !== null) {
        this.markersVisible = savedVisibility === 'true';
      }
      
      this.loadFeedbacks();
      this.injectStyles();
      
      if (this.config.showButton) {
        this.createToggleButton();
      }
      
      this.setupEventListeners();
      this.setupRouteChangeListeners();
      
      // Check if we need to scroll to a specific annotation
      this.checkScrollToAnnotation();
      
      return this;
    },
    
    // Check if we need to scroll to annotation after page load
    checkScrollToAnnotation: function() {
      const feedbackId = sessionStorage.getItem('fb_scroll_to_id');
      if (feedbackId) {
        sessionStorage.removeItem('fb_scroll_to_id');
        
        // Wait a bit for page to settle and markers to be created
        setTimeout(() => {
          const feedback = this.feedbacks.find(fb => fb.id === feedbackId);
          if (feedback) {
            this.scrollToAnnotation(feedback);
          }
        }, 500);
      }
    },

    // FSID: FB-STYLE-001
    injectStyles: function() {
      if (document.getElementById('feedback-widget-styles')) return;
      
      // Add Google Material Symbols font
      if (!document.getElementById('google-material-symbols')) {
        const fontLink = document.createElement('link');
        fontLink.id = 'google-material-symbols';
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
        document.head.appendChild(fontLink);
      }
      
      const styles = `
        .fb-widget-container {
          position: fixed;
          z-index: 999999;
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: white;
          padding: 12px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .fb-widget-container:hover {
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
          transform: translateY(-4px) scale(1.03);
        }
        
        .fb-widget-container.bottom-right { bottom: 20px; right: 20px; }
        .fb-widget-container.bottom-left { bottom: 20px; left: 20px; }
        .fb-widget-container.top-right { top: 20px; right: 20px; }
        .fb-widget-container.top-left { top: 20px; left: 20px; }
        
        .fb-button-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
          align-items: center;
        }
        
        .fb-widget-button {
          padding: 10px 14px;
          background: #4F46E5;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          white-space: nowrap;
        }
        
        .fb-widget-button span:not(.material-symbols-outlined) {
          min-width: 70px;
          text-align: center;
        }
        
        .fb-widget-button .material-symbols-outlined {
          font-size: 20px;
        }
        
        .fb-widget-button:hover {
          background: #4338CA;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }
        
        .fb-widget-button.active {
          background: #DC2626;
        }
        
        .fb-toggle-markers-btn {
          min-width: 44px;
          padding: 10px;
          justify-content: center;
        }
        
        .fb-stats-bar {
          display: flex;
          gap: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .fb-stat-item {
          flex: 1;
          padding: 8px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .fb-stat-number {
          color: #4F46E5;
          font-weight: 700;
          font-size: 18px;
          line-height: 1;
        }
        
        .fb-stat-label {
          color: #6B7280;
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          line-height: 1;
        }
        
        .fb-stat-item:hover {
          background: #F3F4F6;
          cursor: pointer;
          transform: translateY(-1px);
        }
        
        .fb-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000000;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }
        
        .fb-modal {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 600px;
          max-height: 80vh;
          width: 90%;
          display: flex;
          flex-direction: column;
        }
        
        .fb-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #E5E7EB;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .fb-modal-title {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }
        
        .fb-modal-close {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6B7280;
          transition: all 0.2s;
          border-radius: 6px;
        }
        
        .fb-modal-close:hover {
          background: #F3F4F6;
          color: #111827;
        }
        
        .fb-modal-body {
          padding: 16px 24px 24px;
          overflow-y: auto;
          flex: 1;
        }
        
        .fb-annotation-item {
          padding: 16px;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .fb-annotation-item:hover {
          border-color: #4F46E5;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
          transform: translateY(-2px);
        }
        
        .fb-annotation-header {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 10px;
        }
        
        .fb-annotation-icon {
          color: #4F46E5;
          font-size: 20px;
          flex-shrink: 0;
        }
        
        .fb-annotation-meta {
          flex: 1;
        }
        
        .fb-annotation-page {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #4F46E5;
          margin-bottom: 4px;
          word-break: break-all;
        }
        
        .fb-annotation-location {
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 11px;
          color: #6B7280;
          word-break: break-all;
        }
        
        .fb-annotation-comment {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14px;
          color: #374151;
          line-height: 1.5;
          padding-left: 28px;
        }
        
        .fb-empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #9CA3AF;
        }
        
        .fb-empty-state .material-symbols-outlined {
          font-size: 48px;
          margin-bottom: 12px;
          opacity: 0.5;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
          50% { transform: scale(1.1); box-shadow: 0 8px 24px rgba(79, 70, 229, 0.6); }
        }
        
        .fb-feedback-marker {
          position: absolute;
          border: 3px solid #4F46E5;
          background: rgba(79, 70, 229, 0.1);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
          z-index: 999998;
          transition: all 0.2s;
          pointer-events: auto;
        }
        
        .fb-feedback-marker:hover {
          background: rgba(79, 70, 229, 0.15);
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.5);
          border-color: #4338CA;
        }
        
        .fb-feedback-marker-label {
          position: absolute;
          top: -12px;
          left: -12px;
          min-width: 28px;
          height: 28px;
          padding: 0 8px;
          background: #4F46E5;
          color: white;
          border: 2px solid white;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: bold;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        .fb-feedback-marker-label::before {
          content: '#';
          margin-right: 2px;
          opacity: 0.9;
        }
        
        .fb-drawing-box {
          position: absolute;
          border: 2px dashed #4F46E5;
          background: rgba(79, 70, 229, 0.08);
          z-index: 999999;
          pointer-events: none;
        }
        
        .fb-feedback-box {
          position: fixed;
          z-index: 1000000;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          padding: 20px;
          width: 320px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          animation: fb-slide-in 0.3s ease-out;
        }
        
        @keyframes fb-slide-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .fb-feedback-box-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .fb-feedback-box-title {
          font-size: 16px;
          font-weight: 600;
          color: #1F2937;
        }
        
        .fb-feedback-box-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6B7280;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .fb-feedback-textarea {
          width: 100%;
          min-height: 100px;
          padding: 12px;
          border: 1px solid #D1D5DB;
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
          box-sizing: border-box;
        }
        
        .fb-feedback-textarea:focus {
          outline: none;
          border-color: #4F46E5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        
        .fb-feedback-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        
        .fb-feedback-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .fb-feedback-btn-primary {
          background: #4F46E5;
          color: white;
        }
        
        .fb-feedback-btn-primary:hover {
          background: #4338CA;
        }
        
        .fb-feedback-btn-secondary {
          background: #F3F4F6;
          color: #374151;
        }
        
        .fb-feedback-btn-secondary:hover {
          background: #E5E7EB;
        }
        
        .fb-feedback-list {
          position: fixed;
          right: 20px;
          top: 20px;
          z-index: 999997;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          padding: 16px;
          width: 280px;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .fb-feedback-item {
          padding: 12px;
          background: #F9FAFB;
          border-radius: 8px;
          margin-bottom: 8px;
          font-size: 13px;
        }
        
        .fb-feedback-item-text {
          color: #374151;
          margin-bottom: 4px;
        }
        
        .fb-feedback-item-meta {
          color: #9CA3AF;
          font-size: 11px;
        }
      `;
      
      const styleEl = document.createElement('style');
      styleEl.id = 'feedback-widget-styles';
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
    },

    // FSID: FB-BTN-001
    createToggleButton: function() {
      // Create container for buttons
      const container = document.createElement('div');
      container.className = `fb-widget-container ${this.config.buttonPosition}`;
      
      // Create button row
      const buttonRow = document.createElement('div');
      buttonRow.className = 'fb-button-row';
      
      // Create main toggle button
      const btn = document.createElement('button');
      btn.className = 'fb-widget-button';
      btn.innerHTML = '<span class="material-symbols-outlined">chat</span><span>SyncVibes</span>';
      btn.onclick = () => this.toggleMode();
      buttonRow.appendChild(btn);
      this.toggleButton = btn;
      
      // Create show/hide markers button
      const toggleMarkersBtn = document.createElement('button');
      toggleMarkersBtn.className = 'fb-widget-button fb-toggle-markers-btn';
      toggleMarkersBtn.innerHTML = this.markersVisible 
        ? '<span class="material-symbols-outlined">visibility</span>'
        : '<span class="material-symbols-outlined">visibility_off</span>';
      toggleMarkersBtn.title = this.markersVisible ? 'Hide markers' : 'Show markers';
      toggleMarkersBtn.onclick = () => this.toggleMarkers();
      buttonRow.appendChild(toggleMarkersBtn);
      this.toggleMarkersButton = toggleMarkersBtn;
      
      container.appendChild(buttonRow);
      
      // Create stats bar
      const statsBar = document.createElement('div');
      statsBar.className = 'fb-stats-bar';
      statsBar.innerHTML = `
        <div class="fb-stat-item">
          <div class="fb-stat-number" id="fb-stat-page">0</div>
          <div class="fb-stat-label">This Page</div>
        </div>
        <div class="fb-stat-item">
          <div class="fb-stat-number" id="fb-stat-total">0</div>
          <div class="fb-stat-label">Total</div>
        </div>
      `;
      container.appendChild(statsBar);
      this.statsBar = statsBar;
      
      // Add click handlers to stats
      const pageStatItem = statsBar.children[0];
      const totalStatItem = statsBar.children[1];
      
      pageStatItem.addEventListener('click', () => {
        this.openAnnotationsModal('page');
      });
      
      totalStatItem.addEventListener('click', () => {
        this.openAnnotationsModal('total');
      });
      
      document.body.appendChild(container);
      this.widgetContainer = container;
      
      // Update stats initially
      this.updateStats();
    },

    // FSID: FB-TOGGLE-001
    toggleMode: function() {
      this.isActive = !this.isActive;
      this.toggleButton.classList.toggle('active', this.isActive);
      this.toggleButton.innerHTML = this.isActive 
        ? '<span class="material-symbols-outlined">close</span><span>Close</span>'
        : '<span class="material-symbols-outlined">chat</span><span>SyncVibes</span>';
      
      // When activating, ensure markers are visible
      if (this.isActive && !this.markersVisible) {
        this.markersVisible = true;
        const markers = document.querySelectorAll('.fb-feedback-marker');
        markers.forEach(marker => {
          marker.style.display = 'block';
        });
        this.toggleMarkersButton.innerHTML = '<span class="material-symbols-outlined">visibility</span>';
        this.toggleMarkersButton.title = 'Hide markers';
        localStorage.setItem('feedback_markers_visible', 'true');
      }
      
      // Update cursor and selection
      if (this.isActive) {
        document.body.style.cursor = 'crosshair';
        document.body.style.userSelect = 'none';
      } else {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
      
      if (!this.isActive && this.currentBox) {
        this.closeCurrentBox();
      }
    },

    // FSID: FB-TOGGLE-MARKERS-001
    toggleMarkers: function() {
      this.markersVisible = !this.markersVisible;
      const markers = document.querySelectorAll('.fb-feedback-marker');
      
      markers.forEach(marker => {
        marker.style.display = this.markersVisible ? 'block' : 'none';
      });
      
      this.toggleMarkersButton.innerHTML = this.markersVisible 
        ? '<span class="material-symbols-outlined">visibility</span>'
        : '<span class="material-symbols-outlined">visibility_off</span>';
      this.toggleMarkersButton.title = this.markersVisible ? 'Hide markers' : 'Show markers';
      
      // Save visibility state to localStorage
      localStorage.setItem('feedback_markers_visible', this.markersVisible.toString());
    },

    // FSID: FB-STATS-001
    updateStats: function() {
      const pageStatEl = document.getElementById('fb-stat-page');
      const totalStatEl = document.getElementById('fb-stat-total');
      
      if (!pageStatEl || !totalStatEl) return;
      
      // Get total count
      const totalCount = this.feedbacks.length;
      
      // Get current page count
      const currentUrl = window.location.href;
      const currentPath = window.location.pathname;
      const currentHash = window.location.hash;
      
      const pageCount = this.feedbacks.filter(fb => {
        try {
          const fbUrl = new URL(fb.url, window.location.origin);
          if (fb.url === currentUrl) return true;
          if (fbUrl.pathname === currentPath && fbUrl.hash === currentHash) return true;
          if (fbUrl.pathname === currentPath && !currentHash && !fbUrl.hash) return true;
          return false;
        } catch (e) {
          return fb.pathname === currentPath;
        }
      }).length;
      
      pageStatEl.textContent = pageCount;
      totalStatEl.textContent = totalCount;
    },

    // Open annotations modal
    openAnnotationsModal: function(type) {
      const currentUrl = window.location.href;
      const currentPath = window.location.pathname;
      const currentHash = window.location.hash;
      
      // Filter feedbacks based on type
      let annotations = [];
      if (type === 'page') {
        annotations = this.feedbacks.filter(fb => {
          try {
            const fbUrl = new URL(fb.url, window.location.origin);
            if (fb.url === currentUrl) return true;
            if (fbUrl.pathname === currentPath && fbUrl.hash === currentHash) return true;
            if (fbUrl.pathname === currentPath && !currentHash && !fbUrl.hash) return true;
            return false;
          } catch (e) {
            return fb.pathname === currentPath;
          }
        });
      } else {
        annotations = this.feedbacks;
      }
      
      // Create modal overlay
      const overlay = document.createElement('div');
      overlay.className = 'fb-modal-overlay';
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'fb-modal';
      
      // Modal header
      const header = document.createElement('div');
      header.className = 'fb-modal-header';
      
      const title = document.createElement('div');
      title.className = 'fb-modal-title';
      title.innerHTML = `<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">bookmark</span>${type === 'page' ? 'This Page' : 'All'} Annotations (${annotations.length})`;
      
      const closeBtn = document.createElement('button');
      closeBtn.className = 'fb-modal-close';
      closeBtn.innerHTML = '<span class="material-symbols-outlined">close</span>';
      closeBtn.title = 'Close';
      
      header.appendChild(title);
      header.appendChild(closeBtn);
      
      // Modal body
      const body = document.createElement('div');
      body.className = 'fb-modal-body';
      
      if (annotations.length === 0) {
        body.innerHTML = `
          <div class="fb-empty-state">
            <span class="material-symbols-outlined">sentiment_satisfied</span>
            <div>No annotations yet</div>
          </div>
        `;
      } else {
        annotations.forEach(fb => {
          const item = document.createElement('div');
          item.className = 'fb-annotation-item';
          
          // Parse URL for display
          let displayPath = 'Unknown';
          let displayHash = '';
          try {
            const fbUrl = new URL(fb.url, window.location.origin);
            displayPath = fbUrl.pathname;
            displayHash = fbUrl.hash;
          } catch (e) {
            displayPath = fb.pathname || 'Unknown';
          }
          
          item.innerHTML = `
            <div class="fb-annotation-header">
              <span class="material-symbols-outlined fb-annotation-icon">location_on</span>
              <div class="fb-annotation-meta">
                <div class="fb-annotation-page">${displayPath}</div>
                <div class="fb-annotation-location">${displayHash || 'Top of page'} • (${fb.x}, ${fb.y})</div>
              </div>
            </div>
            <div class="fb-annotation-comment">${fb.comment}</div>
          `;
          
          // Click handler to navigate
          item.addEventListener('click', () => {
            this.navigateToAnnotation(fb);
            this.closeModal(overlay);
          });
          
          body.appendChild(item);
        });
      }
      
      modal.appendChild(header);
      modal.appendChild(body);
      overlay.appendChild(modal);
      
      // Close handlers
      closeBtn.addEventListener('click', () => this.closeModal(overlay));
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeModal(overlay);
        }
      });
      
      document.body.appendChild(overlay);
    },

    // Close modal
    closeModal: function(overlay) {
      overlay.remove();
    },

    // Navigate to annotation
    navigateToAnnotation: function(feedback) {
      // If different page, navigate first
      const currentUrl = window.location.href;
      if (feedback.url !== currentUrl) {
        // Store feedback ID to scroll to after page load
        sessionStorage.setItem('fb_scroll_to_id', feedback.id);
        window.location.href = feedback.url;
      } else {
        // Same page, just scroll
        this.scrollToAnnotation(feedback);
      }
    },

    // Scroll to annotation
    scrollToAnnotation: function(feedback) {
      // Find the marker by feedback ID
      const marker = document.querySelector(`[data-feedback-id="${feedback.id}"]`);
      
      if (marker) {
        // Scroll to marker
        marker.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Highlight temporarily
        marker.style.animation = 'none';
        setTimeout(() => {
          marker.style.animation = 'pulse 1s ease-in-out 3';
        }, 10);
      } else {
        // If marker not found, scroll to position
        window.scrollTo({
          top: feedback.position.pageY - window.innerHeight / 2,
          left: feedback.position.pageX - window.innerWidth / 2,
          behavior: 'smooth'
        });
      }
    },

    // FSID: FB-EVENT-001
    setupEventListeners: function() {
      // Prevent text selection in feedback mode
      document.addEventListener('selectstart', (e) => {
        if (this.isActive) {
          e.preventDefault();
        }
      });
      
      // Add cursor style when active
      document.addEventListener('mousemove', (e) => {
        if (this.isActive) {
          document.body.style.cursor = 'crosshair';
          document.body.style.userSelect = 'none';
          
          // Update drawing box while dragging
          if (this.isDrawing && this.currentDrawBox) {
            this.updateDrawingBox(e.pageX, e.pageY);
          }
        } else {
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
        }
      });
      
      // Mouse down - start drawing
      document.addEventListener('mousedown', (e) => {
        if (!this.isActive) return;
        if (e.target.closest('.fb-widget-button')) return;
        if (e.target.closest('.fb-feedback-box')) return;
        if (e.target.closest('.fb-feedback-marker')) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        this.startDrawing(e.pageX, e.pageY);
      }, true);
      
      // Mouse up - finish drawing
      document.addEventListener('mouseup', (e) => {
        if (!this.isActive || !this.isDrawing) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        this.finishDrawing(e.pageX, e.pageY);
      }, true);
    },

    // FSID: FB-ROUTE-001
    setupRouteChangeListeners: function() {
      // Listen for browser back/forward buttons
      window.addEventListener('popstate', () => {
        this.handleRouteChange();
      });

      // Intercept pushState and replaceState for SPA support
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      const self = this;

      history.pushState = function() {
        originalPushState.apply(this, arguments);
        self.handleRouteChange();
      };

      history.replaceState = function() {
        originalReplaceState.apply(this, arguments);
        self.handleRouteChange();
      };

      // Also listen for hashchange for hash-based routing
      window.addEventListener('hashchange', () => {
        this.handleRouteChange();
      });
    },

    // FSID: FB-ROUTE-002
    handleRouteChange: function() {
      console.log('Route changed to:', window.location.pathname);
      this.displayMarkersForCurrentPage();
      
      // Close any open feedback boxes when route changes
      if (this.currentBox) {
        this.closeCurrentBox();
      }
      
      // Remove any drawing box
      if (this.currentDrawBox) {
        this.currentDrawBox.remove();
        this.currentDrawBox = null;
      }
      
      // Deactivate feedback mode
      if (this.isActive) {
        this.isActive = false;
        this.toggleButton.classList.remove('active');
        this.toggleButton.textContent = '💬 Feedback';
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    },

    // FSID: FB-DRAW-001
    startDrawing: function(x, y) {
      this.isDrawing = true;
      this.drawStartX = x;
      this.drawStartY = y;
      
      // Create drawing box
      const drawBox = document.createElement('div');
      drawBox.className = 'fb-drawing-box';
      drawBox.style.left = `${x}px`;
      drawBox.style.top = `${y}px`;
      drawBox.style.width = '0px';
      drawBox.style.height = '0px';
      document.body.appendChild(drawBox);
      
      this.currentDrawBox = drawBox;
    },

    // FSID: FB-DRAW-002
    updateDrawingBox: function(currentX, currentY) {
      if (!this.currentDrawBox) return;
      
      const x = Math.min(this.drawStartX, currentX);
      const y = Math.min(this.drawStartY, currentY);
      const width = Math.abs(currentX - this.drawStartX);
      const height = Math.abs(currentY - this.drawStartY);
      
      this.currentDrawBox.style.left = `${x}px`;
      this.currentDrawBox.style.top = `${y}px`;
      this.currentDrawBox.style.width = `${width}px`;
      this.currentDrawBox.style.height = `${height}px`;
    },

    // FSID: FB-DRAW-003
    finishDrawing: function(endX, endY) {
      this.isDrawing = false;
      
      const x = Math.min(this.drawStartX, endX);
      const y = Math.min(this.drawStartY, endY);
      const width = Math.abs(endX - this.drawStartX);
      const height = Math.abs(endY - this.drawStartY);
      
      // Minimum size check
      if (width < 10 || height < 10) {
        // Too small, treat as single click - make default size box
        if (this.currentDrawBox) {
          this.currentDrawBox.remove();
          this.currentDrawBox = null;
        }
        this.createFeedbackBox(this.drawStartX, this.drawStartY, 100, 100);
        return;
      }
      
      this.createFeedbackBox(x, y, width, height);
    },

    // FSID: FB-BOX-001
    createFeedbackBox: function(x, y, width, height) {
      // Create comment input dialog
      const inputBox = document.createElement('div');
      inputBox.className = 'fb-feedback-box';
      inputBox.style.left = `${Math.min(x + width + 10, window.innerWidth - 340)}px`;
      inputBox.style.top = `${Math.min(y, window.innerHeight - 250)}px`;
      
      inputBox.innerHTML = `
        <div class="fb-feedback-box-header">
          <div class="fb-feedback-box-title">Add Feedback</div>
          <button class="fb-feedback-box-close">×</button>
        </div>
        <textarea 
          class="fb-feedback-textarea" 
          placeholder="What's on your mind?"
          maxlength="${this.config.maxCommentLength}"
        ></textarea>
        <div class="fb-feedback-actions">
          <button class="fb-feedback-btn fb-feedback-btn-secondary">Cancel</button>
          <button class="fb-feedback-btn fb-feedback-btn-primary">Save</button>
        </div>
      `;
      
      document.body.appendChild(inputBox);
      this.currentBox = { element: inputBox, x, y, width, height };
      
      const textarea = inputBox.querySelector('.fb-feedback-textarea');
      textarea.focus();
      
      inputBox.querySelector('.fb-feedback-box-close').onclick = () => this.cancelFeedback();
      inputBox.querySelector('.fb-feedback-btn-secondary').onclick = () => this.cancelFeedback();
      inputBox.querySelector('.fb-feedback-btn-primary').onclick = () => this.saveFeedback(textarea.value, x, y, width, height);
    },

    // FSID: FB-CANCEL-001
    cancelFeedback: function() {
      this.closeCurrentBox();
      if (this.currentDrawBox) {
        this.currentDrawBox.remove();
        this.currentDrawBox = null;
      }
    },

    // FSID: FB-SAVE-001
    saveFeedback: function(comment, x, y, width, height) {
      if (!comment.trim()) {
        alert('Please enter a comment');
        return;
      }
      
      const feedback = {
        id: this.generateId(),
        comment: comment.trim(),
        position: {
          x: x,
          y: y,
          width: width,
          height: height,
          pageX: x,
          pageY: y,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          scrollX: window.scrollX,
          scrollY: window.scrollY
        },
        url: window.location.href,
        pathname: window.location.pathname,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenSize: {
          width: window.screen.width,
          height: window.screen.height
        }
      };
      
      this.feedbacks.push(feedback);
      this.saveFeedbacks();
      
      // Remove drawing box and create permanent marker
      if (this.currentDrawBox) {
        this.currentDrawBox.remove();
        this.currentDrawBox = null;
      }
      
      this.createMarker(feedback);
      this.closeCurrentBox();
      
      // Update stats after adding feedback
      this.updateStats();
      
      // Keep feedback mode active so user can add more
      // (Don't reset isActive, keep cursor as crosshair)
      
      console.log('Feedback saved:', feedback);
    },

    // FSID: FB-MARKER-001
    createMarker: function(feedback) {
      const marker = document.createElement('div');
      marker.className = 'fb-feedback-marker';
      const markerNumber = this.feedbacks.indexOf(feedback) + 1;
      
      // Set box dimensions and position
      marker.style.left = `${feedback.position.pageX}px`;
      marker.style.top = `${feedback.position.pageY}px`;
      marker.style.width = `${feedback.position.width}px`;
      marker.style.height = `${feedback.position.height}px`;
      marker.style.display = this.markersVisible ? 'block' : 'none';
      marker.title = feedback.comment;
      marker.dataset.feedbackId = feedback.id;
      
      // Create number label
      const label = document.createElement('div');
      label.className = 'fb-feedback-marker-label';
      label.textContent = markerNumber;
      marker.appendChild(label);
      
      marker.onclick = (e) => {
        e.stopPropagation();
        this.showFeedback(feedback);
      };
      
      document.body.appendChild(marker);
      
      console.log('Created marker #' + markerNumber + ' at:', {
        left: marker.style.left,
        top: marker.style.top,
        width: marker.style.width,
        height: marker.style.height
      });
    },

    // FSID: FB-SHOW-001
    showFeedback: function(feedback) {
      alert(`Feedback #${feedback.id}\n\n${feedback.comment}\n\nTime: ${new Date(feedback.timestamp).toLocaleString()}`);
    },

    // FSID: FB-CLOSE-001
    closeCurrentBox: function() {
      if (this.currentBox) {
        this.currentBox.element.remove();
        this.currentBox = null;
      }
    },

    // FSID: FB-STORAGE-001
    saveFeedbacks: function() {
      try {
        localStorage.setItem(this.config.storageKey, JSON.stringify(this.feedbacks));
      } catch (e) {
        console.error('Failed to save feedbacks:', e);
      }
    },

    // FSID: FB-LOAD-001
    loadFeedbacks: function() {
      try {
        const stored = localStorage.getItem(this.config.storageKey);
        if (stored) {
          this.feedbacks = JSON.parse(stored);
          this.displayMarkersForCurrentPage();
        }
      } catch (e) {
        console.error('Failed to load feedbacks:', e);
      }
    },

    // FSID: FB-DISPLAY-001
    displayMarkersForCurrentPage: function() {
      // Remove all existing markers
      this.clearMarkers();
      
      // Filter feedbacks for current page and create markers
      const currentUrl = window.location.href;
      const currentPath = window.location.pathname;
      const currentHash = window.location.hash;
      
      const matchingFeedbacks = this.feedbacks.filter(fb => {
        try {
          // Parse feedback URL
          const fbUrl = new URL(fb.url, window.location.origin);
          
          // Match full URL (exact match including hash)
          if (fb.url === currentUrl) return true;
          
          // Match pathname + hash for hash-based SPAs
          if (fbUrl.pathname === currentPath && fbUrl.hash === currentHash) return true;
          
          // Fallback: match pathname only if neither has hash
          if (fbUrl.pathname === currentPath && !currentHash && !fbUrl.hash) return true;
          
          return false;
        } catch (e) {
          // Fallback to simple pathname match if URL parsing fails
          return fb.pathname === currentPath;
        }
      });
      
      matchingFeedbacks.forEach(fb => this.createMarker(fb));
      
      // Update stats when displaying markers for new page
      this.updateStats();
      
      console.log(`Displayed ${matchingFeedbacks.length} markers for ${currentPath}${currentHash}`);
    },

    // FSID: FB-CLEAR-MARKERS-001
    clearMarkers: function() {
      document.querySelectorAll('.fb-feedback-marker').forEach(m => m.remove());
    },

    // FSID: FB-EXPORT-001
    exportFeedbacks: function() {
      return JSON.parse(JSON.stringify(this.feedbacks));
    },

    // FSID: FB-IMPORT-001
    importFeedbacks: function(feedbacks) {
      this.feedbacks = feedbacks;
      this.saveFeedbacks();
      this.displayMarkersForCurrentPage();
    },

    // FSID: FB-CLEAR-001
    clearFeedbacks: function() {
      if (confirm('Clear all feedbacks?')) {
        this.feedbacks = [];
        this.saveFeedbacks();
        this.clearMarkers();
        this.updateStats();
      }
    },

    // FSID: FB-UTIL-001
    generateId: function() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
  };

  // Export to window
  window.FeedbackWidget = FeedbackWidget;

})(window);

