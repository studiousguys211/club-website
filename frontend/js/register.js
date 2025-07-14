// Validation Utilities
function validateDateNotFuture(dateString) {
    const inputDate = new Date(dateString);
    const today = new Date();
    return inputDate <= today;
}

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

function showError(input, message) {
    let errorElement = input.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('error-message')) {
        errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        input.parentNode.insertBefore(errorElement, input.nextSibling);
    }
    errorElement.textContent = message;
    input.classList.add('error');
}

// Form Validation
function validateField(e) {
    const input = e.target;
    const errorElement = input.nextElementSibling;
    
    // Clear previous error
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.textContent = '';
        input.classList.remove('error');
    }
    
    // Skip validation if field is not required and empty
    if (!input.required && !input.value.trim()) {
        return true;
    }
    
    // Check required fields
    if (input.required && !input.value.trim()) {
        showError(input, 'This field is required.');
        return false;
    }
    
    // Special validation for date fields
    if (input.type === 'date' && input.value) {
        if (!validateDateNotFuture(input.value)) {
            showError(input, 'Date cannot be in the future.');
            return false;
        }
        if (calculateAge(input.value) < 10) {
            showError(input, 'You must be at least 10 years old.');
            return false;
        }
    }
    
    return true;
}

// Form Submission
document.getElementById('registrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const inputs = e.target.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        alert('Please fix the errors in the form.');
        return;
    }
    
    // Collect all form data
    const formData = {
        firstName: document.getElementById('firstName').value,
        middleName: document.getElementById('middleName').value,
        lastName: document.getElementById('lastName').value,
        parentsName: document.getElementById('parentsName').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        dob: document.getElementById('dob').value,
        aadhar: document.getElementById('aadhar').value,
        occupation: document.getElementById('occupation').value,
        organization: document.getElementById('organization').value,
        currentAddress: document.getElementById('currentAddress').value,
        permanentAddress: document.getElementById('permanentAddress').value,
        art: document.getElementById('art').value,
        sports: document.getElementById('sports').value,
        music: document.getElementById('music').value,
        technology: document.getElementById('technology').value,
        literature: document.getElementById('literature').value,
        science: document.getElementById('science').value,
        reason: document.getElementById('reason').value
    };
    
    try {
        const response = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(result.message);
            e.target.reset();
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        alert('Failed to submit form');
        console.error(error);
    }
});

// Add live validation
document.querySelectorAll('#registrationForm input, #registrationForm select, #registrationForm textarea').forEach(input => {
    input.addEventListener('blur', validateField);
});

// Special validation for reason text length
document.getElementById('reason').addEventListener('input', function() {
    const minLength = parseInt(this.minLength) || 0;
    if (this.value.length < minLength) {
        showError(this, `${minLength - this.value.length} more characters required.`);
    } else {
        const errorElement = this.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = '';
            this.classList.remove('error');
        }
    }
});

function updateBubblePosition(slider, bubble) {
    const val = slider.value;
    const min = slider.min;
    const max = slider.max;
    const percent = ((val - min) * 100) / (max - min);
    
    bubble.innerText = val;
    bubble.style.left = `calc(${percent}% + (${8 - percent * 0.15}px))`;
}

document.addEventListener('DOMContentLoaded', function () {
    ['art', 'sports', 'music', 'technology', 'literature', 'science'].forEach(id => {
        const slider = document.getElementById(id);
        const bubble = document.getElementById(id + 'Value');

        if (slider && bubble) {
            updateBubblePosition(slider, bubble);
            slider.addEventListener('input', () => {
                updateBubblePosition(slider, bubble);
            });
        }
    });
});
