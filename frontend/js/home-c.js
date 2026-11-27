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

document.addEventListener('DOMContentLoaded', async () => {
    const secaoPedidos = document.querySelector('.pedidos');
    const btnNovaOrdem = document.getElementById('ordem');

    if (btnNovaOrdem) {
        btnNovaOrdem.addEventListener('click', () => {
            window.location.href = '/os-c';
        });
    }

    if (!secaoPedidos) return;

    try {
        const resposta = await fetch('/api/ordens/cliente', {
            credentials: 'include'
        });

        if (!resposta.ok) return;

        const ordens = await resposta.json();

        if (Array.isArray(ordens) && ordens.length > 0) {
            // Substitui o conteúdo vazio pelas últimas 3 ordens do cliente
            secaoPedidos.innerHTML = `
                <h3>Pedidos recentes</h3>
                <div class="lista-pedidos-recentes" style="display: flex; flex-direction: column; gap: 12px; margin-top: 14px;">
                    ${ordens.slice(0, 3).map(os => `
                        <div onclick="window.location.href='/ordens-c'" style="cursor: pointer; padding: 14px 18px; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="display: block; font-size: 1rem;">OS #${os.id} — ${os.equipamento || 'Equipamento'}</strong>
                                <span style="font-size: 0.85rem; opacity: 0.75;">Técnico: ${os.tecnico || 'Aguardando técnico'}</span>
                            </div>
                            <span style="font-weight: 600; color: #f5c518;">${os.processo || os.status}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (erro) {
        console.error('Erro ao carregar pedidos recentes:', erro);
    }
});