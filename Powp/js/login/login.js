document.getElementById('form-login').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    
    // Aqui você adicionaria o código para validar o login com o servidor
    // Por enquanto, vamos apenas redirecionar para o dashboard
    window.location.href = 'dashboard.html';
});