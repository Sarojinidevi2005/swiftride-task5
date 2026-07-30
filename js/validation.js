/* ============================================================
   SwiftRide — validation.js
   Shared, reusable form validation helpers used by the Booking
   form and the Contact form (and any future form).
   ============================================================ */

const SwiftValidate = (function () {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function isValidEmail(val) {
    return emailRegex.test(val.trim());
  }

  // Indian mobile numbers: 10 digits, starting 6-9
  function isValidPhone(val) {
    return /^[6-9]\d{9}$/.test(val.replace(/\s+/g, ''));
  }

  function isNotEmpty(val) {
    return val.trim() !== '';
  }

  /**
   * Validates a single field, toggling .error class + error message span.
   * @param {string} fieldId
   * @param {string} errId
   * @param {Function} [customCheck] returns true if valid
   */
  function validateField(fieldId, errId, customCheck) {
    const field = document.getElementById(fieldId);
    const errSpan = document.getElementById(errId);
    if (!field) return true;
    const value = field.value.trim();
    let valid = value !== '';
    if (valid && customCheck) valid = customCheck(value);

    if (!valid) {
      field.classList.add('error');
      field.setAttribute('aria-invalid', 'true');
      if (errSpan) errSpan.classList.add('show');
    } else {
      field.classList.remove('error');
      field.removeAttribute('aria-invalid');
      if (errSpan) errSpan.classList.remove('show');
    }
    return valid;
  }

  /**
   * Wires up "clear error on valid input" live-validation behavior
   * for a map of { fieldId: { err: errId, check: fn } }.
   */
  function wireLiveValidation(fieldMap) {
    Object.keys(fieldMap).forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const { err, check } = fieldMap[id];
      const clearIfValid = () => {
        const val = el.value.trim();
        const ok = val !== '' && (!check || check(val));
        if (ok) {
          el.classList.remove('error');
          el.removeAttribute('aria-invalid');
          const errSpan = document.getElementById(err);
          if (errSpan) errSpan.classList.remove('show');
        }
      };
      el.addEventListener('input', clearIfValid);
      el.addEventListener('change', clearIfValid);
    });
  }

  function scrollToFirstError(form) {
    const firstError = form.querySelector('.error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.focus({ preventScroll: true });
    }
  }

  return {
    isValidEmail, isValidPhone, isNotEmpty,
    validateField, wireLiveValidation, scrollToFirstError,
  };
})();
