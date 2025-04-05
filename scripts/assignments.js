/**
 * Assignment loader
 * 
 * This file loads all subject indexes based on the SUBJECTS array.
 * No need to modify this file when adding new assignments.
 */
(function() {
  // Load all subject indexes
  if (window.SUBJECTS) {
    window.SUBJECTS.forEach(subject => {
      const script = document.createElement('script');
      script.src = `scripts/assignments/${subject}/index.js`;
      document.head.appendChild(script);
    });
  }
})();