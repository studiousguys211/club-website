document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('queryForm');
    const resultsBody = document.getElementById('resultsBody');
    
    // In a real application, you would fetch this from a server
    const mockData = [
        {
            firstName: 'John',
            lastName: 'Doe',
            phone: '9876543210',
            email: 'john@example.com',
            dob: '1990-05-15',
            occupation: 'Working Professional'
        },
        {
            firstName: 'Jane',
            lastName: 'Smith',
            phone: '1234567890',
            email: 'jane@example.com',
            dob: '1995-08-22',
            occupation: 'Student'
        }
    ];
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const searchName = document.getElementById('searchName').value.trim().toLowerCase();
        const searchDob = document.getElementById('searchDob').value;
        const searchPhone = document.getElementById('searchPhone').value.trim();
        
        // Validate at least one search criteria
        if (!searchName && !searchDob && !searchPhone) {
            alert('Please enter at least one search criteria.');
            return;
        }
        
        // Validate phone format if provided
        if (searchPhone && !/^[0-9]{10}$/.test(searchPhone)) {
            alert('Please enter a valid 10-digit phone number.');
            return;
        }
        
        // Perform search
        const results = mockData.filter(member => {
            const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
            
            return (
                (!searchName || fullName.includes(searchName)) &&
                (!searchDob || member.dob === searchDob) &&
                (!searchPhone || member.phone === searchPhone)
            );
        });
        
        displayResults(results);
    });
    
    function displayResults(results) {
        resultsBody.innerHTML = '';
        
        if (results.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 5;
            cell.textContent = 'No matching members found.';
            row.appendChild(cell);
            resultsBody.appendChild(row);
            return;
        }
        
        results.forEach(member => {
            const row = document.createElement('tr');
            
            const nameCell = document.createElement('td');
            nameCell.textContent = `${member.firstName} ${member.lastName}`;
            row.appendChild(nameCell);
            
            const phoneCell = document.createElement('td');
            phoneCell.textContent = member.phone;
            row.appendChild(phoneCell);
            
            const emailCell = document.createElement('td');
            emailCell.textContent = member.email;
            row.appendChild(emailCell);
            
            const dobCell = document.createElement('td');
            dobCell.textContent = member.dob;
            row.appendChild(dobCell);
            
            const occupationCell = document.createElement('td');
            occupationCell.textContent = member.occupation;
            row.appendChild(occupationCell);
            
            resultsBody.appendChild(row);
        });
    }
});