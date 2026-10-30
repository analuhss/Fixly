document.addEventListener('DOMContentLoaded', () => {
    // Busca o botão pelo ID criado no HTML
    const botaoNovaOs = document.getElementById('ordem');
    
    // Verifica se o botão existe na tela atual para evitar erros
    if (botaoNovaOs) {
        botaoNovaOs.addEventListener('click', () => {
            // Substitua '/criar-os' pelo caminho ou rota real da sua página
            window.location.href = '/criar-os'; 
        });
    }
});