document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const username = document.getElementById('loginUsername').value;
      const password = document.getElementById('loginPassword').value;

      if (!username || !password) {
        alert("Please enter both username and password.");
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('adminToken', data.token || 'admin-token');
          window.location.href = 'query.html';
        } else {
          alert(data.message || 'Login failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred while logging in.');
      }
    });
  } else {
    console.error("loginForm not found. Check if the HTML has <form id='loginForm'>.");
  }
});
