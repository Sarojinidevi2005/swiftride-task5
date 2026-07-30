/* ============================================================
   SwiftRide — faq.js
   Modern accordion behavior for the FAQ page. Only one panel
   stays open at a time; smooth max-height transition.
   ============================================================ */

document.querySelectorAll('.faq-question').forEach(question => {
  question.setAttribute('aria-expanded', 'false');
  question.addEventListener('click', () => {
    const item = question.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item.open').forEach(openItem => {
      if (openItem !== item) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-answer').style.maxHeight = null;
        const openQuestion = openItem.querySelector('.faq-question');
        if (openQuestion) openQuestion.setAttribute('aria-expanded', 'false');
      }
    });

    if (isOpen) {
      item.classList.remove('open');
      answer.style.maxHeight = null;
      question.setAttribute('aria-expanded', 'false');
    } else {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
      question.setAttribute('aria-expanded', 'true');
    }
  });
});

// FAQ search filter (if a search box is present on the page)
const faqSearchInput = document.getElementById('faqSearch');
if (faqSearchInput) {
  const filterFaqs = () => {
    const query = faqSearchInput.value.trim().toLowerCase();
    document.querySelectorAll('.faq-item').forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(query) ? '' : 'none';
    });
  };
  faqSearchInput.addEventListener('input', window.debounce ? window.debounce(filterFaqs, 150) : filterFaqs);
}
