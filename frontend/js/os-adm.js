console.log("[PASSO 1] Arquivo ordens-c.js foi lido pelo navegador.");

document.addEventListener('DOMContentLoaded', async () => {
    console.log("[PASSO 2] DOM carregado. A iniciar o script...");

    // =========================================================
    // 1. TELA DE SOLICITAR OS
    // =========================================================
    const formOS = document.getElementById('formOs-c');
    if (formOS) {
        console.log("[PASSO 3] Formulário de nova OS encontrado.");
        const inputNome = document.getElementById('nomeCliente');
        const inputTelefone = document.getElementById('telefone');
        const inputEmail = document.getElementById('email');

        try {
            const resPerfil = await fetch('/api/perfil', { credentials: 'include' });
            if (resPerfil.ok) {
                const dadosCliente = await resPerfil.json();
                if (inputNome && dadosCliente.nome) inputNome.value = dadosCliente.nome;
                if (inputTelefone && dadosCliente.telefone) inputTelefone.value = dadosCliente.telefone;
                if (inputEmail && dadosCliente.email) inputEmail.value = dadosCliente.email;
            }
        } catch (erro) {
            console.error('Erro ao carregar perfil na OS:', erro);
        }

        formOS.addEventListener('submit', async (event) => {
            event.preventDefault();
            const nome = inputNome ? inputNome.value : '';
            const telefone = inputTelefone ? inputTelefone.value : '';
            const email = inputEmail ? inputEmail.value : '';
            const marca = document.getElementById('marca').value;
            const modelo = document.getElementById('modelo').value;
            const perifericos = document.getElementById('perifericos').value;
            const descricao = document.getElementById('descricao').value;

            try {
                const resposta = await fetch('/api/ordens', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ nome, telefone, email, modelo, marca, perifericos, descricao })
                });
                const dados = await resposta.json();
                if (resposta.ok) {
                    alert('Chamado aberto com sucesso! Nº: ' + (dados.idChamado || dados.id));
                    formOS.reset();
                    window.location.href = '/ordens-adm';
                } else {
                    alert('Erro: ' + (dados.message || dados.mensagem));
                }
            } catch (erro) {
                alert('Falha na comunicação com o servidor.');
            }
        });
    }

    // =========================================================
    // 2. TELA DE LISTAGEM DE ORDENS E MODAL
    // =========================================================
    const lista = document.getElementById('lista');
    
    if (!lista) {
        console.log("[PASSO 3] Elemento #lista não encontrado. O script para por aqui (normal se não estiver na página de listagem).");
        return;
    }

    console.log("[PASSO 4] Elemento #lista encontrado. A procurar ordens no servidor...");

    const mapStatus = {
        analise:   { texto: 'EM ANÁLISE', classe: 'status-analise' },
        aberta:    { texto: 'ABERTA',     classe: 'status-aberta' },
        andamento: { texto: 'ANDAMENTO',  classe: 'status-andamento' },
        fechada:   { texto: 'FECHADA',    classe: 'status-fechada' },
        congelada: { texto: 'CONGELADA',  classe: 'status-congelada' }
    };

    try {
        const res = await fetch('/api/ordens/cliente', { credentials: 'include' });
        console.log("[PASSO 5] Resposta do servidor recebida. Status HTTP:", res.status);
        
        if (!res.ok) {
            console.error('[ERRO] Falha ao buscar ordens. Status HTTP:', res.status);
            lista.innerHTML = `<p style="color: #ef4444;">Erro ao buscar do servidor (Status ${res.status}).</p>`;
            return;
        }

        const ordens = await res.json();
        console.log("[PASSO 6] Dados JSON recebidos:", ordens);

        lista.innerHTML = '';

        // Previne erro se o servidor devolver um objeto de erro em vez de uma lista (Array)
        if (!Array.isArray(ordens)) {
            console.error('[ERRO] A API não devolveu uma lista (Array). Devolveu:', ordens);
            lista.innerHTML = '<p style="color: #ef4444;">Erro no formato dos dados recebidos.</p>';
            return; 
        }

        if (ordens.length === 0) {
            console.log("[PASSO 7] Lista vazia.");
            lista.innerHTML = '<p style="color: #a1a1aa;">Nenhuma ordem de serviço solicitada ainda.</p>';
            return; 
        }

        console.log(`[PASSO 7] A renderizar ${ordens.length} cartões...`);

        ordens.forEach((os) => {
            const numeroOs = os.id || os.idChamado || os.idOrdem;
            const statusKey = (os.status || 'analise').toLowerCase();
            const info = mapStatus[statusKey] || mapStatus.analise;
            const tecnico = os.tecnico || 'Aguardando técnico';
            const valorFormatado = Number(os.valor || 0) > 0
                ? Number(os.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : 'A definir';

            const cartao = document.createElement('article');
            cartao.className = `cartao-os ${info.classe}`;
            cartao.dataset.status = statusKey;
            cartao.style.cursor = 'pointer'

            cartao.innerHTML = `
                <div class="linha-topo">
                    <svg class="icone-grande" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M5 2h9l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/>
                        <path fill="#525252" d="M8 10h8v1.6H8zm0 3.4h8V15H8zm0 3.4h5v1.6H8z"/>
                    </svg>
                    <div>
                        <p class="numero">OS# ${numeroOs}</p>
                        <p class="legenda">Número da OS</p>
                    </div>
                </div>

                <div class="linha-tecnico">
                    <span class="avatar">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z"/>
                        </svg>
                    </span>
                    <div>
                        <p class="nome">${tecnico}</p>
                        <p class="legenda">Técnico</p>
                    </div>
                </div>

                <p class="selo">
                    <span class="ponto"></span>
                    <span class="selo-texto">${info.texto}</span>
                </p>

                <div class="valor">
                    <svg class="icone-valor" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M3 4a1 1 0 0 1 1-1h7.2a1 1 0 0 1 .7.3l9 9a1 1 0 0 1 0 1.4l-7.2 7.2a1 1 0 0 1-1.4 0l-9-9A1 1 0 0 1 3 11.2z"/>
                        <circle cx="8" cy="8" r="1.6" fill="#737373"/>
                    </svg>
                    <div>
                        <p class="legenda">Valor da OS</p>
                        <p class="reais">${valorFormatado}</p>
                    </div>
                    <svg class="seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 5l7 7-7 7"/>
                    </svg>
                </div>
            `;

            lista.appendChild(cartao);

            cartao.addEventListener('click', () => {
                abrirDetalhesOS(os, numeroOs, info.texto, tecnico, valorFormatado);
            });
        });
        
        console.log("[PASSO 8] Cartões renderizados com sucesso no ecrã.");

    } catch (erro) {
        console.error('[ERRO FATAL] Erro de JavaScript ao renderizar as ordens:', erro);
    }

    // =========================================================
    // FILTRAR PELAS CLASSES E MODAL
    // =========================================================
    const botoesFiltro = document.querySelectorAll('.filtro');
    botoesFiltro.forEach((botao) => {
        botao.addEventListener('click', () => {
            botoesFiltro.forEach((b) => b.setAttribute('aria-pressed', 'false'));
            botao.setAttribute('aria-pressed', 'true');
            const filtro = botao.dataset.filtro;
            const cartoes = document.querySelectorAll('.cartao-os');

            cartoes.forEach((cartao) => {
                const status = cartao.dataset.status;
                if (filtro === 'todas') {
                    cartao.style.display = 'flex';
                } else if (filtro === 'abertas' && (status === 'aberta' || status === 'analise')) {
                    cartao.style.display = 'flex';
                } else if (filtro === 'andamento' && status === 'andamento') {
                    cartao.style.display = 'flex';
                } else if (filtro === 'fechadas' && status === 'fechada') {
                    cartao.style.display = 'flex';
                } else if (filtro === 'congeladas' && status === 'congelada') {
                    cartao.style.display = 'flex';
                } else {
                    cartao.style.display = 'none';
                }
            });
        });
    });

    function abrirDetalhesOS(os, numeroOs, statusTexto, tecnico, valorFormatado) {
        console.log(`[MODAL] A abrir modal para a OS# ${numeroOs}`);
        let modal = document.getElementById('modal-detalhes-os');

        if (!document.getElementById('estilo-modal-os')) {
            const style = document.createElement('style');
            style.id = 'estilo-modal-os';
            style.innerHTML = `
                .modal-os-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.78); display: none; align-items: center; justify-content: center; padding: 20px; z-index: 99999; }
                .modal-os-overlay.aberto { display: flex; }
                .modal-os-box { background: #1a1a1d; border: 1px solid #333338; border-top: 6px solid #f5c542; border-radius: 16px; width: 100%; max-width: 500px; padding: 24px; color: #ffffff; box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6); }
                .modal-os-topo { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #2e2e33; padding-bottom: 14px; margin-bottom: 18px; }
                .modal-os-topo h2 { margin: 0; font-size: 1.35rem; color: #f5c542; }
                .modal-os-fechar { background: transparent; border: none; color: #a1a1aa; font-size: 1.6rem; cursor: pointer; line-height: 1; }
                .modal-os-fechar:hover { color: #ffffff; }
                .modal-os-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
                .modal-os-campo { background: #242429; padding: 12px 14px; border-radius: 10px; }
                .modal-os-campo.full { grid-column: 1 / -1; }
                .modal-os-campo span { display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; color: #a1a1aa; margin-bottom: 4px; }
                .modal-os-campo p { margin: 0; font-size: 0.95rem; font-weight: 500; color: #f4f4f5; word-break: break-word; }
                .cartao-os { transition: transform 0.2s, box-shadow 0.2s; } .cartao-os:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.4); }
                `;
            document.head.appendChild(style);
        }

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-detalhes-os';
            modal.className = 'modal-os-overlay';
            modal.innerHTML = `
                <div class="modal-os-box">
                    <div class="modal-os-topo">
                        <h2 id="detalhe-titulo">OS#</h2>
                        <button type="button" class="modal-os-fechar" id="fechar-modal-os" aria-label="Fechar">&times;</button>
                    </div>
                    <div class="modal-os-grid">
                        <div class="modal-os-campo"><span>Status</span><p id="detalhe-status"></p></div>
                        <div class="modal-os-campo"><span>Valor</span><p id="detalhe-valor"></p></div>
                        <div class="modal-os-campo full"><span>Técnico Responsável</span><p id="detalhe-tecnico"></p></div>
                        <div class="modal-os-campo"><span>Marca</span><p id="detalhe-marca"></p></div>
                        <div class="modal-os-campo"><span>Modelo</span><p id="detalhe-modelo"></p></div>
                        <div class="modal-os-campo full"><span>O que acompanha</span><p id="detalhe-perifericos"></p></div>
                        <div class="modal-os-campo full"><span>Descrição do Problema</span><p id="detalhe-descricao"></p></div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('fechar-modal-os').addEventListener('click', () => modal.classList.remove('aberto'));
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('aberto'); });
        }

        document.getElementById('detalhe-titulo').textContent = `Detalhes da OS# ${numeroOs}`;
        document.getElementById('detalhe-status').textContent = statusTexto;
        document.getElementById('detalhe-valor').textContent = valorFormatado;
        document.getElementById('detalhe-tecnico').textContent = tecnico;
        document.getElementById('detalhe-marca').textContent = os.marca || 'Não informada';
        document.getElementById('detalhe-modelo').textContent = os.modelo || 'Não informado';
        document.getElementById('detalhe-perifericos').textContent = os.perifericos || 'Nenhum item';
        document.getElementById('detalhe-descricao').textContent = os.descricao || 'Sem descrição';

        modal.classList.add('aberto');
    }
});