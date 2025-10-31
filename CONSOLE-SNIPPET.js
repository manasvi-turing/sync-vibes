// ============================================
// FEEDBACK WIDGET - CONSOLE SNIPPET
// Paste this entire code into browser console
// Works on ANY website (bypasses CORS)
// ============================================

(function(window) {
  'use strict';

  const SyncVibe = {
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

    injectStyles: function() {
      if (document.getElementById('syncvibe-styles')) return;
      
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
      `;
      
      const styleEl = document.createElement('style');
      styleEl.id = 'syncvibe-styles';
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
    },

    createToggleButton: function() {
      const btn = document.createElement('button');
      btn.className = `fb-widget-button ${this.config.buttonPosition}`;
      btn.textContent = '💬 Feedback';
      btn.onclick = () => this.toggleMode();
      document.body.appendChild(btn);
      this.toggleButton = btn;
    },

    toggleMode: function() {
      this.isActive = !this.isActive;
      this.toggleButton.classList.toggle('active', this.isActive);
      this.toggleButton.textContent = this.isActive ? '✖ Cancel' : '💬 Feedback';
      
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

    setupEventListeners: function() {
      document.addEventListener('selectstart', (e) => {
        if (this.isActive) {
          e.preventDefault();
        }
      });
      
      document.addEventListener('mousemove', (e) => {
        if (this.isActive) {
          document.body.style.cursor = 'crosshair';
          document.body.style.userSelect = 'none';
          
          if (this.isDrawing && this.currentDrawBox) {
            this.updateDrawingBox(e.pageX, e.pageY);
          }
        } else {
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
        }
      });
      
      document.addEventListener('mousedown', (e) => {
        if (!this.isActive) return;
        if (e.target.closest('.fb-widget-button')) return;
        if (e.target.closest('.fb-feedback-box')) return;
        if (e.target.closest('.fb-feedback-marker')) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        this.startDrawing(e.pageX, e.pageY);
      }, true);
      
      document.addEventListener('mouseup', (e) => {
        if (!this.isActive || !this.isDrawing) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        this.finishDrawing(e.pageX, e.pageY);
      }, true);
    },

    setupRouteChangeListeners: function() {
      window.addEventListener('popstate', () => {
        this.handleRouteChange();
      });

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

      window.addEventListener('hashchange', () => {
        this.handleRouteChange();
      });
    },

    handleRouteChange: function() {
      console.log('Route changed to:', window.location.pathname);
      this.displayMarkersForCurrentPage();
      
      if (this.currentBox) {
        this.closeCurrentBox();
      }
      
      if (this.currentDrawBox) {
        this.currentDrawBox.remove();
        this.currentDrawBox = null;
      }
      
      if (this.isActive) {
        this.isActive = false;
        this.toggleButton.classList.remove('active');
        this.toggleButton.textContent = '💬 Feedback';
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    },

    startDrawing: function(x, y) {
      this.isDrawing = true;
      this.drawStartX = x;
      this.drawStartY = y;
      
      const drawBox = document.createElement('div');
      drawBox.className = 'fb-drawing-box';
      drawBox.style.left = `${x}px`;
      drawBox.style.top = `${y}px`;
      drawBox.style.width = '0px';
      drawBox.style.height = '0px';
      document.body.appendChild(drawBox);
      
      this.currentDrawBox = drawBox;
    },

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

    finishDrawing: function(endX, endY) {
      this.isDrawing = false;
      
      const x = Math.min(this.drawStartX, endX);
      const y = Math.min(this.drawStartY, endY);
      const width = Math.abs(endX - this.drawStartX);
      const height = Math.abs(endY - this.drawStartY);
      
      if (width < 10 || height < 10) {
        if (this.currentDrawBox) {
          this.currentDrawBox.remove();
          this.currentDrawBox = null;
        }
        this.createFeedbackBox(this.drawStartX, this.drawStartY, 100, 100);
        return;
      }
      
      this.createFeedbackBox(x, y, width, height);
    },

    createFeedbackBox: function(x, y, width, height) {
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

    cancelFeedback: function() {
      this.closeCurrentBox();
      if (this.currentDrawBox) {
        this.currentDrawBox.remove();
        this.currentDrawBox = null;
      }
    },

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
      
      if (this.currentDrawBox) {
        this.currentDrawBox.remove();
        this.currentDrawBox = null;
      }
      
      this.createMarker(feedback);
      this.closeCurrentBox();
      
      this.isActive = false;
      this.toggleButton.classList.remove('active');
      this.toggleButton.textContent = '💬 Feedback';
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      console.log('Feedback saved:', feedback);
    },

    createMarker: function(feedback) {
      const marker = document.createElement('div');
      marker.className = 'fb-feedback-marker';
      const markerNumber = this.feedbacks.indexOf(feedback) + 1;
      
      marker.style.left = `${feedback.position.pageX}px`;
      marker.style.top = `${feedback.position.pageY}px`;
      marker.style.width = `${feedback.position.width}px`;
      marker.style.height = `${feedback.position.height}px`;
      marker.title = feedback.comment;
      marker.dataset.feedbackId = feedback.id;
      
      const label = document.createElement('div');
      label.className = 'fb-feedback-marker-label';
      label.textContent = markerNumber;
      marker.appendChild(label);
      
      marker.onclick = (e) => {
        e.stopPropagation();
        this.showFeedback(feedback);
      };
      
      document.body.appendChild(marker);
    },

    showFeedback: function(feedback) {
      alert(`Feedback #${feedback.id}\n\n${feedback.comment}\n\nTime: ${new Date(feedback.timestamp).toLocaleString()}`);
    },

    closeCurrentBox: function() {
      if (this.currentBox) {
        this.currentBox.element.remove();
        this.currentBox = null;
      }
    },

    saveFeedbacks: function() {
      try {
        localStorage.setItem(this.config.storageKey, JSON.stringify(this.feedbacks));
      } catch (e) {
        console.error('Failed to save feedbacks:', e);
      }
    },

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

    displayMarkersForCurrentPage: function() {
      this.clearMarkers();
      
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

    clearMarkers: function() {
      document.querySelectorAll('.fb-feedback-marker').forEach(m => m.remove());
    },

    exportFeedbacks: function() {
      return JSON.parse(JSON.stringify(this.feedbacks));
    },

    importFeedbacks: function(feedbacks) {
      this.feedbacks = feedbacks;
      this.saveFeedbacks();
      this.displayMarkersForCurrentPage();
    },

    clearFeedbacks: function() {
      if (confirm('Clear all feedbacks?')) {
        this.feedbacks = [];
        this.saveFeedbacks();
        this.clearMarkers();
      }
    },

    generateId: function() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
  };

  window.SyncVibe = SyncVibe;
  
  // Auto-initialize
  SyncVibe.init();
  console.log('%c✅ Feedback Widget Loaded!', 'background: #4F46E5; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;');
  console.log('Click the 💬 Feedback button in the bottom-right corner to start!');

})(window);

