/**
 * Assignment Registry System
 * 
 * This registry allows assignment files to self-register without
 * needing to update any other files.
 */
window.AssignmentRegistry = {
  assignments: [],
  subjects: new Set(),
  
  // Register an assignment
  register: function(assignment) {
    // 과목이 없는 경우 현재 스크립트 경로에서 추출
    if (!assignment.subject) {
      try {
        const scriptPath = document.currentScript.src;
        const matches = scriptPath.match(/\/assignments\/([^\/]+)\//i);
        if (matches && matches[1]) {
          assignment.subject = decodeURIComponent(matches[1]);
        }
      } catch (e) {
        console.warn('과목을 자동으로 추출할 수 없습니다:', e);
      }
    }
    
    // ID가 없는 경우 자동 생성
    if (!assignment.id) {
      const dateStr = assignment.dueDate || new Date().toISOString().split('T')[0];
      const titlePart = assignment.title.replace(/\s+/g, '-').toLowerCase().substring(0, 20);
      const random = Math.random().toString(36).substring(2, 6);
      assignment.id = `${assignment.subject || 'unknown'}-${titlePart}-${dateStr}-${random}`;
    }
    
    this.assignments.push(assignment);
    this.subjects.add(assignment.subject);
    console.log(`Registered: ${assignment.subject}/${assignment.title}`);
    
    // Trigger an event so the UI knows new assignments are available
    const event = new CustomEvent('assignmentRegistered', {
      detail: { assignment: assignment }
    });
    document.dispatchEvent(event);
  },
  
  // Get all registered assignments
  getAll: function() {
    return this.assignments;
  },
  
  // Get all unique subjects
  getSubjects: function() {
    return [...this.subjects];
  },
  
  // Get assignments for a specific subject
  getBySubject: function(subject) {
    return this.assignments.filter(a => a.subject === subject);
  }
};