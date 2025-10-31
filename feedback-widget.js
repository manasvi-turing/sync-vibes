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

    // FSID: FB-INIT-001
    init: function(options = {}) {
      this.config = { ...this.config, ...options };
      this.loadFeedbacks();
      this.injectStyles();
      
      if (this.config.showButton) {
        this.createToggleButton();
      }
      
      this.setupEventListeners();
      this.setupRouteChangeListeners();
      return this;
    },

    // FSID: FB-STYLE-001
    injectStyles: function() {
      if (document.getElementById('feedback-widget-styles')) return;
      
      const styles = `
        .fb-widget-button {
          position: fixed;
          z-index: 999999;
          padding: 12px 20px;
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
        }
        
        .fb-widget-button:hover {
          background: #4338CA;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }
        
        .fb-widget-button.active {
          background: #DC2626;
        }
        
        .fb-widget-button.bottom-right { bottom: 20px; right: 20px; }
        .fb-widget-button.bottom-left { bottom: 20px; left: 20px; }
        .fb-widget-button.top-right { top: 20px; right: 20px; }
        .fb-widget-button.top-left { top: 20px; left: 20px; }
        
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
      const btn = document.createElement('button');
      btn.className = `fb-widget-button ${this.config.buttonPosition}`;
      btn.textContent = '💬 Feedback';
      btn.onclick = () => this.toggleMode();
      document.body.appendChild(btn);
      this.toggleButton = btn;
    },

    // FSID: FB-TOGGLE-001
    toggleMode: function() {
      this.isActive = !this.isActive;
      this.toggleButton.classList.toggle('active', this.isActive);
      this.toggleButton.textContent = this.isActive ? '✖ Cancel' : '💬 Feedback';
      
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
      
      // Reset feedback mode
      this.isActive = false;
      this.toggleButton.classList.remove('active');
      this.toggleButton.textContent = '💬 Feedback';
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
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

