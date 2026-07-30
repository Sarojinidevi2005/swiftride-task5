/* ============================================================
   SwiftRide — contact.js
   Validates and handles the Contact page form (Name, Email,
   Phone, Message), then shows a success message + toast.
   ============================================================ */

const contactForm = document.getElementById('contactForm');

if (contactForm) {
  SwiftValidate.wireLiveValidation({
    contactName: { err: 'contactNameErr' },
    contactEmail: { err: 'contactEmailErr', check: SwiftValidate.isValidEmail },
    contactPhone: { err: 'contactPhoneErr', check: SwiftValidate.isValidPhone },
    contactMessage: { err: 'contactMessageErr' },
  });

  const submitBtn = document.getElementById('contactSubmitBtn');
  const successMsg = document.getElementById('contactSuccess');

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const v1 = SwiftValidate.validateField('contactName', 'contactNameErr');
    const v2 = SwiftValidate.validateField('contactEmail', 'contactEmailErr', SwiftValidate.isValidEmail);
    const v3 = SwiftValidate.validateField('contactPhone', 'contactPhoneErr', SwiftValidate.isValidPhone);
    const v4 = SwiftValidate.validateField('contactMessage', 'contactMessageErr');

    if (!v1 || !v2 || !v3 || !v4) {
      SwiftValidate.scrollToFirstError(contactForm);
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="ph ph-spinner"></i> Sending…';
    }

    setTimeout(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="ph ph-paper-plane-tilt"></i> Send Message';
      }

      if (successMsg) {
        successMsg.classList.add('show');
        setTimeout(() => successMsg.classList.remove('show'), 6000);
      }
      showToast('Message Sent!', "We'll get back to you within 24 hours.");
      contactForm.reset();
    }, 700);
  });
}
