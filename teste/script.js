document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const showPasswordToggle = document.getElementById('showPasswordToggle');
    const strengthBars = document.querySelectorAll('.strength-bars .bar');

    function calculatePasswordStrength(password) {
        if (!password) return 0;
        
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength += 1;
        
        // Character variety checks
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        return Math.min(strength, 4);
    }

    function updateStrengthIndicator(strength) {
        const colors = ['#ef4444', '#eab308', '#22c55e', '#171717'];
        
        strengthBars.forEach((bar, index) => {
            if (index < strength) {
                bar.style.backgroundColor = colors[strength - 1];
            } else {
                bar.style.backgroundColor = '#e5e7eb';
            }
        });
    }

    passwordInput.addEventListener('input', () => {
        const strength = calculatePasswordStrength(passwordInput.value);
        updateStrengthIndicator(strength);
    });

    showPasswordToggle.addEventListener('change', () => {
        const type = showPasswordToggle.checked ? 'text' : 'password';
        passwordInput.type = type;
        confirmPasswordInput.type = type;
    });
});