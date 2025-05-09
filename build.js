/**
 * Build Script for Auto-Generating Assignment Indexes
 * 
 * This script scans the assignments directory structure and automatically
 * generates index.js files for each subject, as well as updating subjects.js.
 * 
 * Run this script whenever you add new assignments or subjects.
 * Usage: node build.js
 */

const fs = require('fs');
const path = require('path');

// Base paths
const BASE_PATH = path.join(__dirname);
const ASSIGNMENTS_PATH = path.join(BASE_PATH, 'scripts', 'assignments');
const SUBJECTS_PATH = path.join(BASE_PATH, 'scripts', 'subjects.js');

// Scan for all subjects (directories)
function scanSubjects() {
    if (!fs.existsSync(ASSIGNMENTS_PATH)) {
        console.error(`Assignments directory not found: ${ASSIGNMENTS_PATH}`);
        return [];
    }
    
    return fs.readdirSync(ASSIGNMENTS_PATH, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
}

// Scan for all assignment files in a subject directory
function scanAssignmentsForSubject(subject) {
    const subjectPath = path.join(ASSIGNMENTS_PATH, subject);
    
    if (!fs.existsSync(subjectPath)) {
        console.error(`Subject directory not found: ${subjectPath}`);
        return [];
    }
    
    return fs.readdirSync(subjectPath, { withFileTypes: true })
        .filter(dirent => dirent.isFile() && dirent.name.endsWith('.js') && dirent.name !== 'index.js')
        .map(dirent => dirent.name);
}

// Generate the subjects.js file
function generateSubjectsFile(subjects) {
    const content = `/**
 * List of all subjects
 * 
 * This file is auto-generated by the build script.
 * DO NOT EDIT MANUALLY.
 * 
 * Generated: ${new Date().toISOString()}
 */
window.SUBJECTS = ${JSON.stringify(subjects, null, 2)};`;

    fs.writeFileSync(SUBJECTS_PATH, content);
    console.log(`Updated subjects.js with ${subjects.length} subjects`);
}

// Generate index.js for a subject
function generateSubjectIndex(subject, assignments) {
    const indexPath = path.join(ASSIGNMENTS_PATH, subject, 'index.js');
    
    const content = `/**
 * ${subject} subject index
 * 
 * This file is auto-generated by the build script.
 * DO NOT EDIT MANUALLY.
 * 
 * Generated: ${new Date().toISOString()}
 */
(function() {
  const subject = "${subject}";
  const assignments = ${JSON.stringify(assignments, null, 2)};
  
  assignments.forEach(filename => {
    const script = document.createElement('script');
    script.src = \`scripts/assignments/${subject}/\${filename}\`;
    document.head.appendChild(script);
  });
})();`;

    fs.writeFileSync(indexPath, content);
    console.log(`Generated index.js for ${subject} with ${assignments.length} assignments`);
}

// Main function
function main() {
    console.log('Building assignment indexes...');
    
    // Scan subjects
    const subjects = scanSubjects();
    console.log(`Found ${subjects.length} subjects: ${subjects.join(', ')}`);
    
    // Generate subjects.js
    generateSubjectsFile(subjects);
    
    // Generate index.js for each subject
    subjects.forEach(subject => {
        const assignments = scanAssignmentsForSubject(subject);
        console.log(`Found ${assignments.length} assignments for ${subject}`);
        generateSubjectIndex(subject, assignments);
    });
    
    console.log('Build completed successfully!');
}

// Run the main function
main();