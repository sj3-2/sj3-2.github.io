/**
 * 영어독해 subject index
 * 
 * This file is auto-generated by the build script.
 * DO NOT EDIT MANUALLY.
 * 
 * Generated: 2025-06-09T03:02:54.549Z
 */
(function() {
  const subject = "영어독해";
  const assignments = [
  "[4.25] 영어독해 중간고사.js",
  "[4.8] 영어독해 수행평가.js"
];
  
  assignments.forEach(filename => {
    const script = document.createElement('script');
    script.src = `scripts/assignments/영어독해/${filename}`;
    document.head.appendChild(script);
  });
})();