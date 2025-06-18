document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('queryForm');
    const resultsBody = document.getElementById('resultsBody');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const searchFName = document.getElementById('searchFName').value.trim();
        const searchLName = document.getElementById('searchLName').value.trim();
        const searchEmail = document.getElementById('searchEmail').value.trim();
        const searchPhone = document.getElementById('searchPhone').value.trim();
        
        // Validate at least one search criteria
        if (!searchFName && !searchLName && !searchEmail && !searchPhone) {
            alert('Please enter at least one search criteria.');
            return;
        }
        
        // Validate phone format if provided
        if (searchPhone && !/^[0-9]{10}$/.test(searchPhone)) {
            alert('Please enter a valid 10-digit phone number.');
            return;
        }
        
        // Validate email format if provided
        if (searchEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchEmail)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        try {
            // Build query parameters
            const params = new URLSearchParams();
            if (searchFName) params.append('searchFName', searchFName);
            if (searchLName) params.append('searchLName', searchLName);
            if (searchEmail) params.append('searchEmail', searchEmail);
            if (searchPhone) params.append('searchPhone', searchPhone);
            
            const response = await fetch(`http://localhost:5000/api/members?${params.toString()}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                // Try to get error message from response
                let errorMsg = 'Failed to fetch members';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                } catch (e) {
                    errorMsg = `HTTP error! status: ${response.status}`;
                }
                throw new Error(errorMsg);
            }
            
            const data = await response.json();
            displayResults(data);
        } catch (error) {
            console.error('Search error:', error);
            alert(`Search failed: ${error.message}`);
        }
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
            
            // Name cell
            const nameCell = document.createElement('td');
            nameCell.textContent = `${member.firstName} ${member.lastName}`;
            row.appendChild(nameCell);
            
            // Phone cell
            const phoneCell = document.createElement('td');
            phoneCell.textContent = member.phone;
            row.appendChild(phoneCell);
            
            // Email cell
            const emailCell = document.createElement('td');
            emailCell.textContent = member.email;
            row.appendChild(emailCell);
            
            // DOB cell
            const dobCell = document.createElement('td');
            dobCell.textContent = member.dob;
            row.appendChild(dobCell);
            
            // Occupation cell
            const occupationCell = document.createElement('td');
            occupationCell.textContent = member.occupation || 'N/A';
            row.appendChild(occupationCell);
            
            resultsBody.appendChild(row);
        });
    }
});