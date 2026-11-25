document.addEventListener('DOMContentLoaded', async () => {
    const lista = document.getElementById('lista');
    const resumo = document.getElementById('resumo');
    const inputPesquisa = document.getElementById('pesquisa');
    const formBusca = document.getElementById('formBusca');
    const botoesFiltro = document.querySelectorAll('.filtro');

    if (!lista) return;

    let todosClientes = [];

    // Oculta botões de filtro de perfil (Profissionais, Administradores, etc.), se existirem no HTML
    botoesFiltro.forEach((botao) => {
        const filtro = (botao.dataset.filtro || '').toLowerCase();
        if (filtro && filtro !== 'todos' && filtro !== 'cliente') {
            botao.style.display = 'none';
        }
    });

    // =========================================================
    // 1. BUSCA APENAS OS CLIENTES NO SERVIDOR
    // =========================================================
    try {
        const res = await fetch('/api/usuarios/admin', { credentials: 'include' });

        if (!res.ok) {
            lista.innerHTML = `<p style="color: #ef4444;">Erro ao carregar clientes (Status ${res.status}).</p>`;
            return;
        }

        const dados = await res.json();
        if (!Array.isArray(dados)) {
            lista.innerHTML = '<p style="color: #ef4444;">Formato de dados inválido recebido do servidor.</p>';
            return;
        }

        // Mantém exclusivamente usuários do tipo 'cliente'
        todosClientes = dados.filter(
            (pessoa) => (pessoa.tipo || '').toLowerCase() === 'cliente'
        );

        aplicarFiltros();
    } catch (erro) {
        console.error('Erro ao buscar clientes:', erro);
        lista.innerHTML = '<p style="color: #ef4444;">Falha de comunicação com o servidor.</p>';
    }

    // =========================================================
    // 2. PESQUISA DE CLIENTES
    // =========================================================
    function aplicarFiltros() {
        const termo = (inputPesquisa?.value || '').toLowerCase().trim();

        const filtrados = todosClientes.filter((cliente) => {
            const textoBusca = [
                cliente.nome,
                cliente.cpf,
                cliente.email,
                cliente.telefone
            ].filter(Boolean).join(' ').toLowerCase();

            return !termo || textoBusca.includes(termo);
        });

        renderizarCartoes(filtrados);
    }

    if (inputPesquisa) {
        inputPesquisa.addEventListener('input', aplicarFiltros);
    }

    if (formBusca) {
        formBusca.addEventListener('submit', (e) => {
            e.preventDefault();
            aplicarFiltros();
        });
    }

    // =========================================================
    // 3. RENDERIZAÇÃO DOS CARTÕES DE CLIENTES
    // =========================================================
    function renderizarCartoes(listaFiltrada) {
        lista.innerHTML = '';

        if (resumo) {
            resumo.textContent = listaFiltrada.length === 1
                ? '1 cliente encontrado'
                : `${listaFiltrada.length} clientes encontrados`;
        }

        if (listaFiltrada.length === 0) {
            lista.innerHTML = '<p style="color: #a1a1aa;">Nenhum cliente encontrado.</p>';
            return;
        }

        listaFiltrada.forEach((cliente) => {
            const nomeExibicao = cliente.nome || 'Sem nome';
            const cpfExibicao = cliente.cpf || 'CPF não informado';
            const telefoneExibicao = cliente.telefone || 'Sem telefone';
            const emailExibicao = cliente.email || 'Sem e-mail';

            const cartao = document.createElement('article');
            cartao.className = 'cartao-os perfil-cliente';
            cartao.style.cursor = 'pointer';

            cartao.innerHTML = `
                <div class="linha-topo">
                    <svg class="icone-grande" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="currentColor" d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z"/>
                    </svg>
                    <div>
                        <p class="numero">${nomeExibicao}</p>
                        <p class="legenda">CPF: ${cpfExibicao}</p>
                    </div>
                </div>

                <div class="linha-tecnico">
                    <span class="avatar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                    </span>
                    <div>
                        <p class="nome">${telefoneExibicao}</p>
                        <p class="legenda">Telefone</p>
                    </div>
                </div>

                <p class="selo">
                    <span class="ponto"></span>
                    <span class="selo-texto">CLIENTE</span>
                </p>

                <div class="valor">
                    <svg class="icone-valor" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    <div>
                        <p class="legenda">E-mail de acesso</p>
                        <p class="reais" style="font-size: 0.9rem;">${emailExibicao}</p>
                    </div>
                    <svg class="seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M9 5l7 7-7 7"/>
                    </svg>
                </div>
            `;

            lista.appendChild(cartao);

            cartao.addEventListener('click', () => {
                abrirDetalhesCliente(cliente);
            });
        });
    }

    // =========================================================
    // 4. MODAL DE DETALHES DO CLIENTE
    // =========================================================
    function abrirDetalhesCliente(cliente) {
        let modal = document.getElementById('modal-detalhes-usuario');

        if (!document.getElementById('estilo-modal-usuario')) {
            const style = document.createElement('style');
            style.id = 'estilo-modal-usuario';
            style.innerHTML = `
                .modal-usr-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.78); display: none; align-items: center; justify-content: center; padding: 20px; z-index: 99999; }
                .modal-usr-overlay.aberto { display: flex; }
                .modal-usr-box { background: #1a1a1d; border: 1px solid #333338; border-top: 6px solid #f5c542; border-radius: 16px; width: 100%; max-width: 500px; padding: 24px; color: #ffffff; box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6); }
                .modal-usr-topo { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #2e2e33; padding-bottom: 14px; margin-bottom: 18px; }
                .modal-usr-topo h2 { margin: 0; font-size: 1.3rem; color: #f5c542; }
                .modal-usr-fechar { background: transparent; border: none; color: #a1a1aa; font-size: 1.6rem; cursor: pointer; line-height: 1; }
                .modal-usr-fechar:hover { color: #ffffff; }
                .modal-usr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
                .modal-usr-campo { background: #242429; padding: 12px 14px; border-radius: 10px; }
                .modal-usr-campo.full { grid-column: 1 / -1; }
                .modal-usr-campo span { display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; color: #a1a1aa; margin-bottom: 4px; }
                .modal-usr-campo p { margin: 0; font-size: 0.95rem; font-weight: 500; color: #f4f4f5; word-break: break-word; }
                .cartao-os { transition: transform 0.2s, box-shadow 0.2s; }
                .cartao-os:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.4); }
            `;
            document.head.appendChild(style);
        }

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-detalhes-usuario';
            modal.className = 'modal-usr-overlay';
            modal.innerHTML = `
                <div class="modal-usr-box">
                    <div class="modal-usr-topo">
                        <h2 id="usr-detalhe-titulo">Detalhes do Cliente</h2>
                        <button type="button" class="modal-usr-fechar" id="fechar-modal-usr" aria-label="Fechar">&times;</button>
                    </div>
                    <div class="modal-usr-grid" id="usr-detalhe-conteudo"></div>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('fechar-modal-usr').addEventListener('click', () => modal.classList.remove('aberto'));
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('aberto'); });
        }

        document.getElementById('usr-detalhe-titulo').textContent = cliente.nome || 'Detalhes do Cliente';
        document.getElementById('usr-detalhe-conteudo').innerHTML = `
            <div class="modal-usr-campo"><span>Perfil</span><p>CLIENTE</p></div>
            <div class="modal-usr-campo"><span>CPF</span><p>${cliente.cpf || 'Não informado'}</p></div>
            <div class="modal-usr-campo"><span>Telefone</span><p>${cliente.telefone || 'Não informado'}</p></div>
            <div class="modal-usr-campo"><span>Nascimento</span><p>${cliente.dataNascimento || 'Não informado'}</p></div>
            <div class="modal-usr-campo full"><span>E-mail de Acesso</span><p>${cliente.email || 'Não informado'}</p></div>
            <div class="modal-usr-campo"><span>CEP</span><p>${cliente.cep || 'Não informado'}</p></div>
            <div class="modal-usr-campo"><span>Endereço</span><p>${cliente.endereco || 'Não informado'}</p></div>
        `;

        modal.classList.add('aberto');
    }
});