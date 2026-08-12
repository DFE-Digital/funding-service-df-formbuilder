$(document).ready(function () {
  let index;
  let resources = [];
  let weightingStaff = [];
  let weightingVetting = [];
  let previouslyFocusedElement = null;

  // Get all focusable elements in the dialog
  function getFocusableElements(dialog) {
    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');
    
    return Array.from(dialog.querySelectorAll(focusableSelectors));
  }

  // Initialize focus trap for the dialog
  function initFocusTrap(dialog) {
    const focusableElements = getFocusableElements(dialog);
    
    if (focusableElements.length === 0) return;

    // Announce dialog opening to screen readers
    const dialogTitle = dialog.getAttribute('aria-labelledby');
    const titleElement = dialogTitle ? document.getElementById(dialogTitle) : null;
    if (titleElement) {
      // Create a screen reader announcement
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.className = 'sr-only';
      announcement.textContent = 'Dialog opened: ' + titleElement.textContent + '. Focus automatically moved to confirmation checkbox.';
      document.body.appendChild(announcement);
      
      // Remove after announcement
      setTimeout(() => {
        announcement.remove();
      }, 1000);
    }

    // Set initial focus to the checkbox
    const confirmCheckbox = dialog.querySelector('#confirmcheckbox');
    if (confirmCheckbox) {
      confirmCheckbox.focus();
    } else if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle Tab key to trap focus
    dialog.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements(dialog);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      // If shift+tab on first element, move to last
      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // If tab on last element, move to first
      else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    });

    // Handle Escape key to close dialog
    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' || event.code === 'Escape') {
        event.preventDefault();
        closeDialog();
      }
    });
  }

  // Close dialog and restore focus
  function closeDialog() {
    $(".backdrop-logout").fadeOut(200);
    deselect($('.dialog-close-logout'));
    
    // Restore focus to the element that opened the dialog
    if (previouslyFocusedElement && previouslyFocusedElement.focus) {
      setTimeout(() => {
        previouslyFocusedElement.focus();
      }, 250); // Wait for animation
    }
  }

  function deselect(e) {
    $('.pop').slideFadeToggle(function () {
      e.removeClass('selected');
    });
    // Allow body scroll again
    document.body.style.overflow = '';
  }

  $(function () {
    var foundin = $('body:contains("Continue")');
    if (foundin.length < 1) {
      removeClass();
    }
  });

  function removeClass() {
    var allElements = document.querySelectorAll("#nav-popup");
    for (i = 0; i < allElements.length; i++) {
      allElements[i].classList.remove('#nav-popup');
    }
  }


  $(function () {
    $('#dfe-designer-signout').on('click', function () {
      if ($(this).hasClass('selected')) {
        closeDialog();
      } else {
        // Store the element that will receive focus when dialog closes
        previouslyFocusedElement = this;
        
        // Show dialog and prevent body scroll
        $(".backdrop-logout").fadeTo(200, 1);
        document.body.style.overflow = 'hidden';
        
        let btnSend = document.querySelector('#redirect-button-logout');
        if (btnSend && this.className != "logo nav-popup" && this.className != "govuk-footer__link logo nav-popup") {
          btnSend.setAttribute('name', this.innerHTML);
        } else {
          btnSend.setAttribute('name', 'CCS website');
          document.body.scrollTop = document.documentElement.scrollTop = 0;
        }
        
        $('.pop').slideFadeToggle();
        
        // Initialize focus trap after dialog is visible
        setTimeout(() => {
          const dialog = document.querySelector('[role="dialog"]');
          if (dialog) {
            initFocusTrap(dialog);
          }
        }, 100);
      }
      return false;
    });

    $('.logout-popup').on('click', function () {
      var option = document.querySelector('input[name="event_management_next_step"]:checked').value;
      if (option == 'close') {
        if ($(this).hasClass('selected')) {
          closeDialog();
        } else {
          // Store the element that will receive focus when dialog closes
          previouslyFocusedElement = this;
          
          // Show dialog and prevent body scroll
          $(".backdrop-logout").fadeTo(200, 1);
          document.body.style.overflow = 'hidden';
          
          let btnSend = document.querySelector('#redirect-button-logout');
          if (btnSend && this.className != "logo logout-popup" && this.className != "govuk-footer__link logo logout-popup") {
            btnSend.setAttribute('name', this.innerHTML);
          } else {
            btnSend.setAttribute('name', 'CCS website');
            document.body.scrollTop = document.documentElement.scrollTop = 0;
          }
          
          $('.pop').slideFadeToggle();
          
          // Initialize focus trap after dialog is visible
          setTimeout(() => {
            const dialog = document.querySelector('[role="dialog"]');
            if (dialog) {
              initFocusTrap(dialog);
            }
          }, 100);
        }
        return false;
      } else {
        return true;
      }
    });

    $('.dialog-close-logout').on('click', function () {
      closeDialog();
      return false;
    });

    $('#redirect-button-logout').on('click', function () {
      $(".backdrop-logout").fadeOut(200);
      deselect($('.dialog-close-logout'));
     document.location.href="/logout";
    });
    
    // Close dialog when clicking on backdrop
    $('.backdrop-logout').on('click', function (e) {
      if (e.target === this) {
        closeDialog();
      }
    });
    
    return false;
  });

  $.fn.slideFadeToggle = function (easing, callback) {
    return this.animate({ opacity: 'toggle', height: 'toggle' }, 'fast', easing, callback);
  };
  
  // Update screen reader announcement and button state when checkbox changes
  $('#confirmcheckbox').change(function () {
    const checkboxStatus = document.querySelector('#checkbox-status');
    const signOutButton = document.querySelector('#redirect-button-logout');
    
    if ($(this).is(":checked")) {
      $('#redirect-button-logout').attr("disabled", false);
      // Update aria-label to indicate button is now enabled
      if (signOutButton) {
        signOutButton.setAttribute('aria-label', 'Sign out. Ready to proceed.');
      }
      // Announce to screen readers
      if (checkboxStatus) {
        checkboxStatus.textContent = 'Confirmation checkbox checked. Sign out button is now enabled. Click the Sign out button to proceed.';
      }
    } else {
      $('#redirect-button-logout').attr("disabled", true);
      // Update aria-label to indicate button is disabled
      if (signOutButton) {
        signOutButton.setAttribute('aria-label', 'Sign out. This button is disabled until you confirm.');
      }
      // Announce to screen readers
      if (checkboxStatus) {
        checkboxStatus.textContent = 'Confirmation checkbox unchecked. Sign out button is disabled. Check the confirmation checkbox to enable the Sign out button.';
      }
    }
  });
});