// const btnNovoPedido = document.getElementById('ordem'); // Use o ID correto do seu botão

// btnNovoPedido.addEventListener('click', () => {
//     window.location.href = '/ordens-c';
// });

document.addEventListener('DOMContentLoaded', () => {
    // Busca o botão pelo ID criado no HTML
    const btnNovoPedido = document.getElementById('ordem');
    
    // Verifica se o botão existe na tela atual para evitar erros
    if (btnNovoPedido) {
        btnNovoPedido.addEventListener('click', () => {
            // Substitua '/criar-os' pelo caminho ou rota real da sua página
            window.location.href = '/criar-os'; 
        });
    }
});