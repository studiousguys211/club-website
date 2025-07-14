// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('queryForm');
    const resultsBody = document.getElementById('resultsBody');

    // Add edit form submit listener ONCE
    document.getElementById('editForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const id = document.getElementById('editId').value;
        const updatedData = {
            phone: document.getElementById('editPhone').value,
            email: document.getElementById('editEmail').value,
            currentAddress: document.getElementById('editCurrentAddress').value,
            permanentAddress: document.getElementById('editPermanentAddress').value,
            reason: document.getElementById('editReason').value
        };

        try {
            const response = await fetch(`http://localhost:5000/api/members/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                alert('Member updated successfully');
                document.getElementById('editPopup').style.display = 'none';
                form.dispatchEvent(new Event('submit'));
            } else {
                const data = await response.json();
                alert(`Failed to update: ${data.message || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert('Error updating member');
        }
    });

    // Handle search form submission
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const searchFName = document.getElementById('searchFName').value.trim();
        const searchLName = document.getElementById('searchLName').value.trim();
        const searchEmail = document.getElementById('searchEmail').value.trim();
        const searchPhone = document.getElementById('searchPhone').value.trim();

        if (!searchFName && !searchLName && !searchEmail && !searchPhone) {
            alert('Please enter at least one search criteria.');
            return;
        }

        if (searchPhone && !/^[0-9]{10}$/.test(searchPhone)) {
            alert('Please enter a valid 10-digit phone number.');
            return;
        }

        if (searchEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchEmail)) {
            alert('Please enter a valid email address.');
            return;
        }

        try {
            const params = new URLSearchParams();
            if (searchFName) params.append('searchFName', searchFName);
            if (searchLName) params.append('searchLName', searchLName);
            if (searchEmail) params.append('searchEmail', searchEmail);
            if (searchPhone) params.append('searchPhone', searchPhone);

            const response = await fetch(`http://localhost:5000/api/members?${params.toString()}`, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            displayResults(data);
        } catch (error) {
            console.error('Search error:', error);
            alert(`Search failed: ${error.message}`);
        }
    });

    // Render table
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

            const actionCell = document.createElement('td');

            const detailsLink = document.createElement('a');
            detailsLink.href = '#';
            detailsLink.textContent = 'Details';
            detailsLink.classList.add('details-link');
            detailsLink.addEventListener('click', (e) => {
                e.preventDefault();
                showPopup(member);
            });
            actionCell.appendChild(detailsLink);
            actionCell.appendChild(document.createTextNode(' | '));

            const editLink = document.createElement('a');
            editLink.href = '#';
            editLink.textContent = 'Edit';
            editLink.classList.add('edit-link');
            editLink.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('editId').value = member._id;
                document.getElementById('editPhone').value = member.phone;
                document.getElementById('editEmail').value = member.email;
                document.getElementById('editCurrentAddress').value = member.currentAddress;
                document.getElementById('editPermanentAddress').value = member.permanentAddress;
                document.getElementById('editReason').value = member.reason;
                document.getElementById('editPopup').style.display = 'block';
            });
            actionCell.appendChild(editLink);
            actionCell.appendChild(document.createTextNode(' | '));

            const deleteLink = document.createElement('a');
            deleteLink.href = '#';
            deleteLink.textContent = 'Delete';
            deleteLink.classList.add('delete-link');
            deleteLink.addEventListener('click', async (e) => {
                e.preventDefault();
                if (confirm(`Are you sure you want to delete ${member.firstName}?`)) {
                    try {
                        const res = await fetch(`http://localhost:5000/api/members/${member._id}`, {
                            method: 'DELETE'
                        });
                        if (res.ok) {
                            alert('Deleted successfully.');
                            form.dispatchEvent(new Event('submit'));
                        } else {
                            alert('Failed to delete');
                        }
                    } catch (error) {
                        alert('Error deleting member');
                        console.error(error);
                    }
                }
            });
            actionCell.appendChild(deleteLink);

            row.appendChild(actionCell);
            resultsBody.appendChild(row);
        });
    }

    function showPopup(member) {
        const popup = document.getElementById('memberPopup');
        const details = document.getElementById('popupDetails');

        details.innerHTML = `
            <p><strong>Name:</strong> ${member.firstName} ${member.middleName || ''} ${member.lastName}</p>
            <p><strong>Parent's Name:</strong> ${member.parentsName}</p>
            <p><strong>Phone:</strong> ${member.phone}</p>
            <p><strong>Email:</strong> ${member.email}</p>
            <p><strong>DOB:</strong> ${member.dob}</p>
            <p><strong>Occupation:</strong> ${member.occupation}</p>
            <p><strong>Organization:</strong> ${member.organization}</p>
            <p><strong>Aadhar:</strong> ${member.aadhar}</p>
            <p><strong>Current Address:</strong> ${member.currentAddress}</p>
            <p><strong>Permanent Address:</strong> ${member.permanentAddress}</p>
            <p><strong>Reason:</strong> ${member.reason}</p>
            <p><strong>Art:</strong> ${member.art},
               <strong>Sports:</strong> ${member.sports},
               <strong>Music:</strong> ${member.music},
               <strong>Technology:</strong> ${member.technology},
               <strong>Literature:</strong> ${member.literature},
               <strong>Science:</strong> ${member.science}</p>
            <p><strong>Created At:</strong> ${member.createdAt}</p>
            <p><strong>Updated At:</strong> ${member.updatedAt}</p>
        `;

        popup.style.display = 'block';
    }
});
