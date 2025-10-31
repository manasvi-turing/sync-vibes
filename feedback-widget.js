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
    currentUser: null,
    config: {
      storageKey: 'feedback_widget_data',
      userStorageKey: 'feedback_widget_user',
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
      
      // Load or prompt for user profile
      this.loadUser();
      
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
    
    // Load user from localStorage or prompt for profile
    loadUser: function() {
      try {
        const stored = localStorage.getItem(this.config.userStorageKey);
        if (stored) {
          this.currentUser = JSON.parse(stored);
          console.log('Loaded user:', this.currentUser.name);
        } else {
          // No user found, prompt for profile
          this.promptUserProfile();
        }
      } catch (e) {
        console.error('Failed to load user:', e);
        this.promptUserProfile();
      }
    },
    
    // Save user to localStorage
    saveUser: function() {
      try {
        localStorage.setItem(this.config.userStorageKey, JSON.stringify(this.currentUser));
      } catch (e) {
        console.error('Failed to save user:', e);
      }
    },
    
    // Prompt user for profile (name and email)
    promptUserProfile: function() {
      // Wait for DOM to be ready
      setTimeout(() => {
        this.showUserProfileModal();
      }, 100);
    },
    
    // Show user profile modal
    showUserProfileModal: function() {
      const overlay = document.createElement('div');
      overlay.className = 'fb-modal-overlay';
      overlay.style.zIndex = '10000000';
      
      const modal = document.createElement('div');
      modal.className = 'fb-modal fb-user-profile-modal';
      
      modal.innerHTML = `
        <div class="fb-modal-header">
          <div class="fb-modal-title">
            <span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">person</span>
            Welcome to SyncVibes!
          </div>
        </div>
        <div class="fb-modal-body">
          <p style="color: #6B7280; margin-bottom: 20px; line-height: 1.5;">
            Please enter your details to start annotating. Your name will appear on all your comments.
          </p>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 6px; font-size: 14px;">
              Name <span style="color: #EF4444;">*</span>
            </label>
            <input 
              type="text" 
              id="fb-user-name" 
              placeholder="John Doe"
              style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px; font-family: inherit; box-sizing: border-box;"
              required
            />
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 6px; font-size: 14px;">
              Email <span style="color: #9CA3AF;">(optional)</span>
            </label>
            <input 
              type="email" 
              id="fb-user-email" 
              placeholder="john@example.com"
              style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px; font-family: inherit; box-sizing: border-box;"
            />
          </div>
          <button 
            id="fb-user-profile-save"
            style="width: 100%; padding: 12px; background: #4F46E5; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
            onmouseover="this.style.background='#4338CA'"
            onmouseout="this.style.background='#4F46E5'"
          >
            Get Started
          </button>
        </div>
      `;
      
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      
      // Focus on name input
      setTimeout(() => {
        document.getElementById('fb-user-name').focus();
      }, 100);
      
      // Handle save
      const saveBtn = document.getElementById('fb-user-profile-save');
      const nameInput = document.getElementById('fb-user-name');
      const emailInput = document.getElementById('fb-user-email');
      
      const handleSave = () => {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        
        if (!name) {
          alert('Please enter your name');
          nameInput.focus();
          return;
        }
        
        this.currentUser = {
          id: this.generateId(),
          name: name,
          email: email || '',
          createdAt: new Date().toISOString()
        };
        
        this.saveUser();
        overlay.remove();
        
        console.log('User profile created:', this.currentUser.name);
      };
      
      saveBtn.addEventListener('click', handleSave);
      
      // Enter key to submit
      nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSave();
      });
      emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSave();
      });
    },
    
    // Check if we need to scroll to annotation after page load
    checkScrollToAnnotation: function() {
      const feedbackId = sessionStorage.getItem('fb_scroll_to_id');
      const ensureVisible = sessionStorage.getItem('fb_ensure_visible');
      
      if (feedbackId) {
        sessionStorage.removeItem('fb_scroll_to_id');
        
        // Ensure markers are visible if requested
        if (ensureVisible === 'true') {
          sessionStorage.removeItem('fb_ensure_visible');
          this.markersVisible = true;
          localStorage.setItem('feedback_markers_visible', 'true');
        }
        
        // Wait a bit for page to settle and markers to be created
        setTimeout(() => {
          // Update markers visibility if needed
          if (this.markersVisible) {
            const markers = document.querySelectorAll('.fb-feedback-marker');
            markers.forEach(marker => {
              marker.style.display = 'block';
            });
            if (this.toggleMarkersButton) {
              this.toggleMarkersButton.innerHTML = '<span class="material-symbols-outlined">visibility</span>';
              this.toggleMarkersButton.title = 'Hide markers';
            }
          }
          
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
        
        .fb-actions-bar {
          display: flex;
          gap: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .fb-action-btn {
          flex: 1;
          padding: 8px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 500;
          color: #374151;
          transition: all 0.2s;
        }
        
        .fb-action-btn .material-symbols-outlined {
          font-size: 16px;
        }
        
        .fb-action-btn:hover {
          background: #4F46E5;
          color: white;
          border-color: #4F46E5;
          transform: translateY(-1px);
        }
        
        .fb-action-label {
          font-size: 11px;
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
        
        .fb-feedback-marker.active {
          border: 3px solid #10B981;
          background: rgba(16, 185, 129, 0.15);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
          z-index: 999999;
        }
        
        .fb-feedback-marker.active .fb-feedback-marker-label {
          background: #10B981;
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
          position: absolute;
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
        
        .fb-comments-history {
          max-height: 250px;
          overflow-y: auto;
          margin-bottom: 16px;
          padding: 12px;
          background: #F9FAFB;
          border-radius: 8px;
        }
        
        .fb-comment-item {
          margin-bottom: 12px;
          padding: 10px;
          background: white;
          border-radius: 6px;
          border-left: 3px solid #4F46E5;
        }
        
        .fb-comment-item:last-child {
          margin-bottom: 0;
        }
        
        .fb-comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
          gap: 8px;
        }
        
        .fb-comment-author {
          font-size: 12px;
          font-weight: 600;
          color: #4F46E5;
        }
        
        .fb-comment-author-me {
          font-size: 12px;
          font-weight: 600;
          color: #10B981;
        }
        
        .fb-comment-author-me::after {
          content: ' (you)';
          font-weight: 400;
          font-size: 11px;
          color: #6B7280;
        }
        
        .fb-comment-time {
          font-size: 11px;
          color: #9CA3AF;
          white-space: nowrap;
        }
        
        .fb-comment-text {
          font-size: 14px;
          color: #1F2937;
          line-height: 1.5;
          word-wrap: break-word;
        }
        
        .fb-no-comments {
          text-align: center;
          color: #9CA3AF;
          font-size: 13px;
          padding: 20px;
        }
        
        .fb-feedback-textarea {
          width: 100%;
          min-height: 80px;
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
          flex-wrap: wrap;
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
          min-width: 0;
        }
        
        .fb-feedback-btn.fb-feedback-btn-danger {
          flex-basis: 100%;
          order: 3;
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
        
        .fb-feedback-btn-danger {
          background: #EF4444;
          color: white;
          display: flex;
          align-items: center;
          gap: 4px;
          justify-content: center;
        }
        
        .fb-feedback-btn-danger:hover {
          background: #DC2626;
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
        
        .fb-viewport-warning {
          position: fixed;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000001;
          max-width: 600px;
          width: 90%;
          animation: fb-slide-in 0.3s ease-out;
        }
        
        .fb-viewport-warning-content {
          background: white;
          border: 2px solid #F59E0B;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }
        
        .fb-viewport-warning-header {
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: white;
        }
        
        .fb-viewport-warning-header strong {
          flex: 1;
          font-size: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .fb-viewport-warning-icon {
          font-size: 24px;
        }
        
        .fb-viewport-warning-body {
          padding: 20px;
        }
        
        .fb-viewport-metric {
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #E5E7EB;
        }
        
        .fb-viewport-metric:last-of-type {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        
        .fb-viewport-metric-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14px;
        }
        
        .fb-viewport-metric-label .material-symbols-outlined {
          font-size: 20px;
          color: #6B7280;
        }
        
        .fb-viewport-metric-values {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14px;
          color: #6B7280;
          padding-left: 28px;
        }
        
        .fb-viewport-metric-values strong {
          color: #111827;
          font-family: 'Monaco', 'Courier New', monospace;
        }
        
        .fb-status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          font-weight: bold;
          font-size: 14px;
          margin-left: 8px;
          transition: all 0.3s;
        }
        
        .fb-status-badge.fb-status-ok {
          background: #10B981;
          color: white;
        }
        
        .fb-status-badge.fb-status-error {
          background: #EF4444;
          color: white;
        }
        
        .fb-viewport-warning-hint {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: #F3F4F6;
          padding: 12px;
          border-radius: 8px;
          font-size: 13px;
          color: #6B7280;
          line-height: 1.5;
          margin-top: 16px;
        }
        
        .fb-viewport-warning-hint .material-symbols-outlined {
          font-size: 20px;
          color: #9CA3AF;
          flex-shrink: 0;
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
      
      // Create export/import bar
      const actionsBar = document.createElement('div');
      actionsBar.className = 'fb-actions-bar';
      actionsBar.innerHTML = `
        <button class="fb-action-btn" id="fb-export-btn" title="Export annotations to JSON file">
          <span class="material-symbols-outlined">download</span>
          <span class="fb-action-label">Export</span>
        </button>
        <button class="fb-action-btn" id="fb-import-btn" title="Import annotations from JSON file">
          <span class="material-symbols-outlined">upload</span>
          <span class="fb-action-label">Import</span>
        </button>
      `;
      container.appendChild(actionsBar);
      
      // Hidden file input for import
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'application/json';
      fileInput.style.display = 'none';
      fileInput.onchange = (e) => this.handleImportFile(e);
      container.appendChild(fileInput);
      this.fileInput = fileInput;
      
      // Append container first
      document.body.appendChild(container);
      this.widgetContainer = container;
      
      // Then add click handlers (after elements are in DOM)
      document.getElementById('fb-export-btn').addEventListener('click', () => this.exportToFile());
      document.getElementById('fb-import-btn').addEventListener('click', () => fileInput.click());
      
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
      // Ensure markers are visible
      if (!this.markersVisible) {
        this.markersVisible = true;
        const markers = document.querySelectorAll('.fb-feedback-marker');
        markers.forEach(marker => {
          marker.style.display = 'block';
        });
        if (this.toggleMarkersButton) {
          this.toggleMarkersButton.innerHTML = '<span class="material-symbols-outlined">visibility</span>';
          this.toggleMarkersButton.title = 'Hide markers';
        }
        localStorage.setItem('feedback_markers_visible', 'true');
      }
      
      // If different page, navigate first
      const currentUrl = window.location.href;
      if (feedback.url !== currentUrl) {
        // Store feedback ID to scroll to after page load
        sessionStorage.setItem('fb_scroll_to_id', feedback.id);
        // Store that we want markers visible
        sessionStorage.setItem('fb_ensure_visible', 'true');
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
        // Ensure this marker is visible (even if others are hidden)
        marker.style.display = 'block';
        
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
      
      // Listen for window resize to recheck viewport mismatch
      let resizeTimeout;
      window.addEventListener('resize', () => {
        // Debounce resize events
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.recheckViewportMismatch();
        }, 300);
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

    // Calculate smart position for comment box to keep it in viewport
    calculateBoxPosition: function(annotationX, annotationY, annotationWidth, annotationHeight, boxWidth, boxHeight) {
      const gap = 10; // Gap between annotation and box
      const padding = 20; // Padding from viewport edges
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      
      let left, top;
      
      // Default: Try to position on the right
      left = annotationX + annotationWidth + gap;
      top = annotationY;
      
      // Check if box would overflow right edge
      if (left + boxWidth > viewportWidth + scrollX - padding) {
        // Position on the left instead
        left = annotationX - boxWidth - gap;
        
        // If still overflows (annotation is too wide or near left edge), center it horizontally
        if (left < scrollX + padding) {
          left = Math.max(scrollX + padding, annotationX + annotationWidth/2 - boxWidth/2);
        }
      }
      
      // Ensure left edge is visible
      if (left < scrollX + padding) {
        left = scrollX + padding;
      }
      
      // Vertical positioning: Try to align with top of annotation
      top = annotationY;
      
      // Check if box would overflow bottom
      if (top + boxHeight > viewportHeight + scrollY - padding) {
        // Try to align with bottom of annotation
        top = annotationY + annotationHeight - boxHeight;
        
        // If still overflows top, position from bottom of viewport
        if (top < scrollY + padding) {
          top = viewportHeight + scrollY - boxHeight - padding;
        }
      }
      
      // Ensure top edge is visible
      if (top < scrollY + padding) {
        top = scrollY + padding;
      }
      
      return { left, top };
    },
    
    // FSID: FB-BOX-001
    createFeedbackBox: function(x, y, width, height) {
      // Close any existing box first
      this.closeCurrentBox();
      
      // Create comment input dialog
      const inputBox = document.createElement('div');
      inputBox.className = 'fb-feedback-box';
      
      // Temporarily position off-screen to measure
      inputBox.style.visibility = 'hidden';
      inputBox.style.left = '0px';
      inputBox.style.top = '0px';
      
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
      
      // Measure box dimensions
      const boxWidth = inputBox.offsetWidth;
      const boxHeight = inputBox.offsetHeight;
      
      // Calculate smart position
      const position = this.calculateBoxPosition(x, y, width, height, boxWidth, boxHeight);
      
      // Apply position and make visible
      inputBox.style.left = `${position.left}px`;
      inputBox.style.top = `${position.top}px`;
      inputBox.style.visibility = 'visible';
      
      this.currentBox = { element: inputBox, x, y, width, height };
      
      const textarea = inputBox.querySelector('.fb-feedback-textarea');
      textarea.focus();
      
      inputBox.querySelector('.fb-feedback-box-close').onclick = () => this.cancelFeedback();
      inputBox.querySelector('.fb-feedback-btn-secondary').onclick = () => this.cancelFeedback();
      inputBox.querySelector('.fb-feedback-btn-primary').onclick = () => this.saveFeedback(textarea.value, x, y, width, height);
      
      // Support Escape key to close
      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          this.cancelFeedback();
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      document.addEventListener('keydown', escapeHandler);
      
      // Store the escape handler so we can remove it when closing
      inputBox._escapeHandler = escapeHandler;
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
      
      const feedbackId = this.generateId();
      const timestamp = Date.now();
      
      const feedback = {
        id: feedbackId,
        comment: comment.trim(), // Keep for backward compatibility
        comments: [
          {
            text: comment.trim(),
            timestamp: timestamp,
            author: {
              id: this.currentUser?.id || 'anonymous',
              name: this.currentUser?.name || 'Anonymous',
              email: this.currentUser?.email || ''
            }
          }
        ],
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
        timestamp: new Date(timestamp).toISOString(),
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
      
      // Set tooltip with comment history
      this.updateMarkerTooltip(feedback.id);
      
      console.log('Created marker #' + markerNumber + ' at:', {
        left: marker.style.left,
        top: marker.style.top,
        width: marker.style.width,
        height: marker.style.height
      });
    },

    // FSID: FB-SHOW-001
    showFeedback: function(feedback) {
      // Close any existing box first
      this.closeCurrentBox();
      
      // Get the marker and highlight it
      const marker = document.querySelector(`[data-feedback-id="${feedback.id}"]`);
      if (marker) {
        marker.classList.add('active');
      }
      
      // Create chat-style comment box
      const inputBox = document.createElement('div');
      inputBox.className = 'fb-feedback-box';
      
      // Temporarily position off-screen to measure
      inputBox.style.visibility = 'hidden';
      inputBox.style.left = '0px';
      inputBox.style.top = '0px';
      
      // Build comments history HTML
      let commentsHTML = '';
      if (feedback.comments && feedback.comments.length > 0) {
        commentsHTML = feedback.comments.map(c => {
          const authorName = c.author?.name || 'Unknown User';
          const isCurrentUser = c.author?.id === this.currentUser?.id;
          const authorClass = isCurrentUser ? 'fb-comment-author-me' : 'fb-comment-author';
          
          return `
            <div class="fb-comment-item">
              <div class="fb-comment-header">
                <span class="${authorClass}">${this.escapeHtml(authorName)}</span>
                <span class="fb-comment-time">${new Date(c.timestamp).toLocaleString()}</span>
              </div>
              <div class="fb-comment-text">${this.escapeHtml(c.text)}</div>
            </div>
          `;
        }).join('');
      }
      
      inputBox.innerHTML = `
        <div class="fb-feedback-box-header">
          <div class="fb-feedback-box-title">
            <span class="material-symbols-outlined" style="font-size: 18px; vertical-align: middle;">chat</span>
            Annotation #${this.feedbacks.indexOf(feedback) + 1}
          </div>
          <button class="fb-feedback-box-close">×</button>
        </div>
        <div class="fb-comments-history">
          ${commentsHTML || '<div class="fb-no-comments">No comments yet</div>'}
        </div>
        <textarea 
          class="fb-feedback-textarea" 
          placeholder="Add a comment..."
          maxlength="${this.config.maxCommentLength}"
        ></textarea>
        <div class="fb-feedback-actions">
          <button class="fb-feedback-btn fb-feedback-btn-danger">
            <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
            Delete
          </button>
          <button class="fb-feedback-btn fb-feedback-btn-secondary">Close</button>
          <button class="fb-feedback-btn fb-feedback-btn-primary">Add Comment</button>
        </div>
      `;
      
      document.body.appendChild(inputBox);
      
      // Measure box dimensions (important: done after appendChild and HTML set)
      const boxWidth = inputBox.offsetWidth;
      const boxHeight = inputBox.offsetHeight;
      
      // Get annotation position (prefer marker if available for accurate positioning)
      let annotationX, annotationY, annotationWidth, annotationHeight;
      
      if (marker) {
        const markerRect = marker.getBoundingClientRect();
        annotationX = markerRect.left + window.scrollX;
        annotationY = markerRect.top + window.scrollY;
        annotationWidth = markerRect.width;
        annotationHeight = markerRect.height;
      } else {
        annotationX = feedback.position.pageX;
        annotationY = feedback.position.pageY;
        annotationWidth = feedback.position.width;
        annotationHeight = feedback.position.height;
      }
      
      // Calculate smart position
      const position = this.calculateBoxPosition(
        annotationX, 
        annotationY, 
        annotationWidth, 
        annotationHeight, 
        boxWidth, 
        boxHeight
      );
      
      // Apply position and make visible
      inputBox.style.left = `${position.left}px`;
      inputBox.style.top = `${position.top}px`;
      inputBox.style.visibility = 'visible';
      
      this.currentBox = { element: inputBox, feedback: feedback, marker: marker };
      
      const textarea = inputBox.querySelector('.fb-feedback-textarea');
      textarea.focus();
      
      inputBox.querySelector('.fb-feedback-box-close').onclick = () => this.closeCurrentBox();
      inputBox.querySelector('.fb-feedback-btn-secondary').onclick = () => this.closeCurrentBox();
      inputBox.querySelector('.fb-feedback-btn-danger').onclick = () => {
        if (confirm('Are you sure you want to delete this annotation and all its comments?')) {
          this.deleteAnnotation(feedback.id);
        }
      };
      inputBox.querySelector('.fb-feedback-btn-primary').onclick = () => {
        const newComment = textarea.value.trim();
        if (newComment) {
          this.addCommentToFeedback(feedback.id, newComment);
          this.closeCurrentBox();
        } else {
          alert('Please enter a comment');
        }
      };
      
      // Support Escape key to close
      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          this.closeCurrentBox();
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      document.addEventListener('keydown', escapeHandler);
      
      // Store the escape handler so we can remove it when closing
      inputBox._escapeHandler = escapeHandler;
    },
    
    // Add comment to existing feedback
    addCommentToFeedback: function(feedbackId, commentText) {
      const feedback = this.feedbacks.find(fb => fb.id === feedbackId);
      if (!feedback) return;
      
      // Initialize comments array if it doesn't exist
      if (!feedback.comments) {
        feedback.comments = [];
        // Migrate old comment if it exists
        if (feedback.comment) {
          feedback.comments.push({
            text: feedback.comment,
            timestamp: feedback.timestamp,
            author: {
              id: 'legacy',
              name: 'Unknown User',
              email: ''
            }
          });
        }
      }
      
      // Add new comment
      feedback.comments.push({
        text: commentText,
        timestamp: Date.now(),
        author: {
          id: this.currentUser?.id || 'anonymous',
          name: this.currentUser?.name || 'Anonymous',
          email: this.currentUser?.email || ''
        }
      });
      
      this.saveFeedbacks();
      
      // Update marker tooltip
      this.updateMarkerTooltip(feedbackId);
      
      console.log('Added comment to feedback #' + feedbackId);
    },
    
    // Update marker tooltip with all comments
    updateMarkerTooltip: function(feedbackId) {
      const feedback = this.feedbacks.find(fb => fb.id === feedbackId);
      if (!feedback) return;
      
      const marker = document.querySelector(`[data-feedback-id="${feedbackId}"]`);
      if (!marker) return;
      
      const comments = feedback.comments || (feedback.comment ? [{text: feedback.comment, timestamp: feedback.timestamp}] : []);
      const tooltipText = comments.map((c, idx) => 
        `${idx + 1}. ${c.text} (${new Date(c.timestamp).toLocaleString()})`
      ).join('\n\n');
      
      marker.title = tooltipText || 'No comments';
    },
    
    // Delete annotation
    deleteAnnotation: function(feedbackId) {
      // Find the feedback
      const feedbackIndex = this.feedbacks.findIndex(fb => fb.id === feedbackId);
      if (feedbackIndex === -1) return;
      
      // Remove from array
      this.feedbacks.splice(feedbackIndex, 1);
      
      // Remove marker from DOM
      const marker = document.querySelector(`[data-feedback-id="${feedbackId}"]`);
      if (marker) {
        marker.remove();
      }
      
      // Close the comment box
      this.closeCurrentBox();
      
      // Save to localStorage
      this.saveFeedbacks();
      
      // Update stats
      this.updateStats();
      
      console.log('Deleted annotation #' + feedbackId);
    },
    
    // Escape HTML to prevent XSS
    escapeHtml: function(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    // FSID: FB-CLOSE-001
    closeCurrentBox: function() {
      if (this.currentBox) {
        // Remove escape key handler if it exists
        if (this.currentBox.element._escapeHandler) {
          document.removeEventListener('keydown', this.currentBox.element._escapeHandler);
        }
        // Remove active class from marker
        if (this.currentBox.marker) {
          this.currentBox.marker.classList.remove('active');
        }
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
      
      // Check for viewport mismatch
      this.checkViewportMismatch(matchingFeedbacks);
      
      console.log(`Displayed ${matchingFeedbacks.length} markers for ${currentPath}${currentHash}`);
    },
    
    // Check if viewport size has changed significantly
    checkViewportMismatch: function(feedbacks) {
      if (!feedbacks || feedbacks.length === 0) {
        this.hideViewportWarning();
        return;
      }
      
      // Get the most common viewport size from annotations
      const viewports = feedbacks
        .map(fb => fb.position)
        .filter(pos => pos && pos.viewportWidth && pos.viewportHeight);
      
      if (viewports.length === 0) {
        this.hideViewportWarning();
        return;
      }
      
      // Use the first annotation's viewport (most annotations likely made at same size)
      const originalViewport = viewports[0];
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      
      // Threshold: 100px difference is significant
      const widthDiff = Math.abs(currentWidth - originalViewport.viewportWidth);
      const heightDiff = Math.abs(currentHeight - originalViewport.viewportHeight);
      
      if (widthDiff > 100 || heightDiff > 100) {
        this.showViewportWarning(originalViewport.viewportWidth, originalViewport.viewportHeight);
      } else {
        this.hideViewportWarning();
      }
    },
    
    // Show viewport mismatch warning
    showViewportWarning: function(originalWidth, originalHeight) {
      // Remove existing warning if any
      this.hideViewportWarning();
      
      const warning = document.createElement('div');
      warning.id = 'fb-viewport-warning';
      warning.className = 'fb-viewport-warning';
      warning.innerHTML = `
        <div class="fb-viewport-warning-content">
          <div class="fb-viewport-warning-header">
            <span class="material-symbols-outlined fb-viewport-warning-icon">tune</span>
            <strong>Display Mismatch Detected</strong>
          </div>
          <div class="fb-viewport-warning-body">
            <div class="fb-viewport-metric">
              <div class="fb-viewport-metric-label">
                <span class="material-symbols-outlined">aspect_ratio</span>
                Viewport Size
              </div>
              <div class="fb-viewport-metric-values">
                <div>Expected: <strong>${originalWidth}×${originalHeight}</strong></div>
                <div>Current: <strong id="fb-current-viewport">${window.innerWidth}×${window.innerHeight}</strong> <span id="fb-viewport-status" class="fb-status-badge fb-status-error">✗</span></div>
              </div>
            </div>
            <div class="fb-viewport-metric">
              <div class="fb-viewport-metric-label">
                <span class="material-symbols-outlined">zoom_in</span>
                Browser Zoom
              </div>
              <div class="fb-viewport-metric-values">
                <div>Expected: <strong>100%</strong></div>
                <div>Current: <strong id="fb-current-zoom">100%</strong> <span id="fb-zoom-status" class="fb-status-badge fb-status-ok">✓</span></div>
              </div>
            </div>
            <div class="fb-viewport-metric">
              <div class="fb-viewport-metric-label">
                <span class="material-symbols-outlined">format_size</span>
                Font Size
              </div>
              <div class="fb-viewport-metric-values">
                <div>Expected: <strong>16px</strong></div>
                <div>Current: <strong id="fb-current-fontsize">16px</strong> <span id="fb-fontsize-status" class="fb-status-badge fb-status-ok">✓</span></div>
              </div>
            </div>
            <div class="fb-viewport-warning-hint">
              <span class="material-symbols-outlined">info</span>
              Adjust your window size and browser zoom to match the expected values. Indicators will turn green when fixed.
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(warning);
      
      // Store original dimensions
      this._originalViewport = { width: originalWidth, height: originalHeight };
      
      // Start live updates
      this.startViewportMonitoring();
    },
    
    // Start monitoring viewport changes
    startViewportMonitoring: function() {
      if (this._viewportMonitorInterval) {
        clearInterval(this._viewportMonitorInterval);
      }
      
      this._viewportMonitorInterval = setInterval(() => {
        if (!document.getElementById('fb-viewport-warning')) {
          this.stopViewportMonitoring();
          return;
        }
        this.updateViewportMetrics();
      }, 200); // Update every 200ms
    },
    
    // Stop monitoring
    stopViewportMonitoring: function() {
      if (this._viewportMonitorInterval) {
        clearInterval(this._viewportMonitorInterval);
        this._viewportMonitorInterval = null;
      }
    },
    
    // Update metrics in real-time
    updateViewportMetrics: function() {
      const currentViewportEl = document.getElementById('fb-current-viewport');
      const viewportStatusEl = document.getElementById('fb-viewport-status');
      const currentZoomEl = document.getElementById('fb-current-zoom');
      const zoomStatusEl = document.getElementById('fb-zoom-status');
      const currentFontsizeEl = document.getElementById('fb-current-fontsize');
      const fontsizeStatusEl = document.getElementById('fb-fontsize-status');
      
      if (!currentViewportEl) return;
      
      // Current viewport
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      currentViewportEl.textContent = `${currentWidth}×${currentHeight}`;
      
      // Check viewport match (within 20px tolerance)
      const viewportMatch = 
        Math.abs(currentWidth - this._originalViewport.width) <= 20 &&
        Math.abs(currentHeight - this._originalViewport.height) <= 20;
      
      viewportStatusEl.textContent = viewportMatch ? '✓' : '✗';
      viewportStatusEl.className = `fb-status-badge ${viewportMatch ? 'fb-status-ok' : 'fb-status-error'}`;
      
      // Detect zoom level
      const zoom = Math.round(window.devicePixelRatio * 100);
      currentZoomEl.textContent = `${zoom}%`;
      const zoomMatch = zoom === 100;
      zoomStatusEl.textContent = zoomMatch ? '✓' : '✗';
      zoomStatusEl.className = `fb-status-badge ${zoomMatch ? 'fb-status-ok' : 'fb-status-error'}`;
      
      // Detect font size
      const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      currentFontsizeEl.textContent = `${Math.round(fontSize)}px`;
      const fontsizeMatch = Math.abs(fontSize - 16) <= 2;
      fontsizeStatusEl.textContent = fontsizeMatch ? '✓' : '✗';
      fontsizeStatusEl.className = `fb-status-badge ${fontsizeMatch ? 'fb-status-ok' : 'fb-status-error'}`;
      
      // Auto-dismiss if all match
      if (viewportMatch && zoomMatch && fontsizeMatch) {
        setTimeout(() => {
          this.hideViewportWarning();
        }, 2000); // Give user 2s to see the success state
      }
    },
    
    // Recheck viewport mismatch (called on resize)
    recheckViewportMismatch: function() {
      // Get feedbacks for current page
      const currentUrl = window.location.href;
      const currentPath = window.location.pathname;
      const currentHash = window.location.hash;
      
      const matchingFeedbacks = this.feedbacks.filter(fb => {
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
      
      // Recheck viewport mismatch
      if (matchingFeedbacks.length > 0) {
        this.checkViewportMismatch(matchingFeedbacks);
      }
    },
    
    // Hide viewport warning
    hideViewportWarning: function() {
      this.stopViewportMonitoring();
      const warning = document.getElementById('fb-viewport-warning');
      if (warning) {
        warning.remove();
      }
    },

    // FSID: FB-CLEAR-MARKERS-001
    clearMarkers: function() {
      document.querySelectorAll('.fb-feedback-marker').forEach(m => m.remove());
    },

    // Export annotations to JSON file
    exportToFile: function() {
      if (this.feedbacks.length === 0) {
        alert('No annotations to export!');
        return;
      }
      
      const data = {
        version: this.version,
        exportDate: new Date().toISOString(),
        totalAnnotations: this.feedbacks.length,
        annotations: this.exportFeedbacks()
      };
      
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `syncvibes-annotations-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('Exported', this.feedbacks.length, 'annotations');
    },
    
    // Handle import file selection
    handleImportFile: function(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          // Support both old and new format
          const annotations = data.annotations || data;
          
          if (!Array.isArray(annotations)) {
            alert('Invalid file format! Expected an array of annotations.');
            return;
          }
          
          // Count potential new items
          const existingIds = new Set(this.feedbacks.map(fb => fb.id));
          const potentialNewAnnotations = annotations.filter(a => !existingIds.has(a.id)).length;
          const existingAnnotations = annotations.length - potentialNewAnnotations;
          
          let confirm_msg = `Import ${annotations.length} annotation(s)?\n\n`;
          confirm_msg += `Preview:\n`;
          if (potentialNewAnnotations > 0) {
            confirm_msg += `• ${potentialNewAnnotations} new annotation(s)\n`;
          }
          if (existingAnnotations > 0) {
            confirm_msg += `• ${existingAnnotations} existing annotation(s) (will merge new comments)\n`;
          }
          
          if (confirm(confirm_msg)) {
            const result = this.mergeFeedbacks(annotations);
            
            let successMsg = 'Import complete!\n\n';
            if (result.newAnnotations > 0) {
              successMsg += `✓ Added ${result.newAnnotations} new annotation(s)\n`;
            }
            if (result.newComments > 0) {
              successMsg += `✓ Added ${result.newComments} new comment(s) to existing annotations\n`;
            }
            if (result.newAnnotations === 0 && result.newComments === 0) {
              successMsg = 'No new data to import. Everything is up to date!';
            }
            
            alert(successMsg);
          }
        } catch (error) {
          alert('Error reading file: ' + error.message);
          console.error('Import error:', error);
        }
      };
      
      reader.readAsText(file);
      
      // Reset file input so same file can be selected again
      event.target.value = '';
    },
    
    // Merge imported feedbacks with existing ones (smart deep merge)
    mergeFeedbacks: function(importedFeedbacks) {
      let newAnnotationsCount = 0;
      let newCommentsCount = 0;
      
      importedFeedbacks.forEach(importedFb => {
        const existingFb = this.feedbacks.find(fb => fb.id === importedFb.id);
        
        if (!existingFb) {
          // New annotation - add it
          this.feedbacks.push(importedFb);
          newAnnotationsCount++;
        } else {
          // Existing annotation - merge comments
          
          // Initialize comments array if it doesn't exist
          if (!existingFb.comments) {
            existingFb.comments = [];
          }
          
          const importedComments = importedFb.comments || [];
          const existingComments = existingFb.comments;
          
          // Get existing comment identifiers (timestamp + author id + text)
          const existingCommentKeys = new Set(
            existingComments.map(c => 
              `${c.timestamp}-${c.author?.id || 'unknown'}-${c.text}`
            )
          );
          
          // Add only new comments
          importedComments.forEach(importedComment => {
            const commentKey = `${importedComment.timestamp}-${importedComment.author?.id || 'unknown'}-${importedComment.text}`;
            
            if (!existingCommentKeys.has(commentKey)) {
              existingFb.comments.push(importedComment);
              newCommentsCount++;
            }
          });
          
          // Sort comments by timestamp
          existingFb.comments.sort((a, b) => a.timestamp - b.timestamp);
          
          // Update marker tooltip for this annotation
          this.updateMarkerTooltip(existingFb.id);
        }
      });
      
      this.saveFeedbacks();
      this.displayMarkersForCurrentPage();
      
      console.log(`Merged ${newAnnotationsCount} new annotations and ${newCommentsCount} new comments. Total: ${this.feedbacks.length} annotations`);
      
      return { newAnnotations: newAnnotationsCount, newComments: newCommentsCount };
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

