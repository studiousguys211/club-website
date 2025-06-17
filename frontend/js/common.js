// Utility functions used across multiple pages

/**
 * Sanitize input to prevent XSS
 */
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

/**
 * Trim whitespace and validate for empty strings
 */
function validateString(input) {
    if (!input || typeof input !== 'string') return false;
    const trimmed = input.trim();
    return trimmed.length > 0 ? trimmed : false;
}

/**
 * Validate date is not in the future
 */
function validateDateNotFuture(dateString) {
    const inputDate = new Date(dateString);
    const today = new Date();
    return inputDate <= today;
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}