(() => {
  'use strict';
  const groups = window.QUESTIONNAIRE.groups;
  document.getElementById('travel-question-count').textContent = groups.reduce((count, group) => count + group.questions.length, 0);
  document.getElementById('travel-group-count').textContent = groups.length;
})();
