document.addEventListener('DOMContentLoaded', function() {
    const TOKEN_KEY = "adminToken";
    const API_URL = "http://127.0.0.1:5000"; // backend/server.js portun

    // === PASSWORD TOGGLE ===
    const toggleLoginPassword = document.getElementById('toggleLoginPassword');
    const loginPassword = document.getElementById('loginPassword');

    function togglePassword(input, button) {
        const icon = button.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'ri-eye-line text-gray-400 hover:text-gray-600 transition-colors';
        } else {
            input.type = 'password';
            icon.className = 'ri-eye-off-line text-gray-400 hover:text-gray-600 transition-colors';
        }
    }

    toggleLoginPassword.addEventListener('click', () => togglePassword(loginPassword, toggleLoginPassword));

    // === FORM SUBMISSION ===
    const loginBtn = document.getElementById('loginBtn');
    const loginForm = document.getElementById('loginForm');

    function showLoading(button, textSelector) {
        const spinner = button.querySelector('.loading-spinner');
        const text = button.querySelector(textSelector);
        text.style.display = 'none';
        spinner.classList.remove('hidden');
        button.disabled = true;
    }

    function hideLoading(button, textSelector) {
        const spinner = button.querySelector('.loading-spinner');
        const text = button.querySelector(textSelector);
        spinner.classList.add('hidden');
        text.style.display = 'inline';
        button.disabled = false;
    }

    function shakeForm(form) {
        form.classList.add('shake');
        setTimeout(() => {
            form.classList.remove('shake');
        }, 300);
    }

    loginBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        const username = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!username || !password) {
            shakeForm(loginForm);
            return;
        }

        showLoading(loginBtn, '.login-text');

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // 🔐 Token kaydet (KEY: token)
                 localStorage.setItem(TOKEN_KEY, data.token);

                // ✅ Admin panel ana sayfa
                window.location.href = "main.html";
            } else {
                shakeForm(loginForm);
                alert(data.error || "Giriş başarısız");
            }
        } catch (err) {
            console.error(err);
            shakeForm(loginForm);
            alert('Sunucu hatası!');
        } finally {
            hideLoading(loginBtn, '.login-text');
        }
    });
});