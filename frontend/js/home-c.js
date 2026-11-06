document.addEventListener('DOMContentLoaded', () => {
    // Busca o botão pelo ID criado no HTML
    const btnNovoPedido = document.getElementById('ordem');
    
    // Verifica se o botão existe na tela atual para evitar erros
    if (btnNovoPedido) {
        btnNovoPedido.addEventListener('click', () => {
            window.location.href = '/ordens-c'; // Adicionado ponto e vírgula
        }); 
    }
});