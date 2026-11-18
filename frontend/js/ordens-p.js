document.addEventListener('DOMContentLoaded', async () => {
    const lista = document.getElementById('lista');
    const resumo = document.getElementById('resumo');
    const inputPesquisa = document.getElementById('pesquisa');
    const formBusca = document.getElementById('formBusca');

    if (!lista) {
        console.error('Elemento #lista não encontrado no HTML.');
        return;
    }

    const mapStatus = {
        analise:   { texto: 'EM ANÁLISE', classe: 'status-analise' },
        aberta:    { texto: 'ABERTA',     classe: 'status-aberta' },
        andamento: { texto: 'ANDAMENTO',  classe: 'status-andamento' },
        fechada:   { texto: 'FECHADA',    classe: 'status-fechada' },
        congelada: { texto: 'CONGELADA',  classe: 'status-congelada' }
    };

    try {
        const res = await fetch('/api/ordens/profissional', { credentials: 'include' });

        if (res.status === 401) {
            window.location.href = '/';
            return;
        }

        if (!res.ok) {
            lista.innerHTML = `<p style="color: #ef4444;">Erro ao buscar suas ordens (Status ${res.status}).</p>`;
            return;
        }

        const ordens = await res.json();
        lista.innerHTML = '';

        if (resumo) {
            resumo.textContent = ordens.length === 1
                ? '1 ordem atribuída a você'
                : `${ordens.length} ordens atribuídas a você`;
        }

        if (!Array.isArray(ordens) || ordens.length === 0) {
            lista.innerHTML = '<p style="color: #a1a1aa;">Você ainda não possui ordens de serviço atribuídas.</p>';
            return;
        }

        ordens.forEach((os) => {
            const numeroOs = os.id || os.idChamado || '---';
            const statusKey = (os.status || 'andamento').toLowerCase();
            const info = mapStatus[statusKey] || mapStatus.andamento;
            const cliente = os.clienteNome || 'Cliente';
            const valorFormatado = Number(os.valorfinal || os.valor || 0) > 0
                ? Number(os.valorfinal || os.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : 'A definir';

            const cartao = document.createElement('article');
            cartao.className = `cartao-os ${info.classe}`;
            cartao.dataset.status = statusKey;
            cartao.style.cursor = 'pointer';

            cartao.innerHTML = `
                <div class="linha-topo">
                    <svg class="icone-grande" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M5 2h9l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/>
                        <path fill="#525252" d="M8 10h8v1.6H8zm0 3.4h8V15H8zm0 3.4h5v1.6H8z"/>
                    </svg>
                    <div>
                        <p class="numero">OS# ${numeroOs}</p>
                        <p class="legenda">${os.equipamento || 'Equipamento'}</p>
                    </div>
                </div>

                <div class="linha-tecnico">
                    <span class="avatar">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z"/>
                        </svg>
                    </span>
                    <div>
                        <p class="nome">${cliente}</p>
                        <p class="legenda">Cliente</p>
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
                abrirDetalhesOS(os, numeroOs, info.texto, valorFormatado);
            });
        });

    } catch (erro) {
        console.error('Erro ao carregar ordens do profissional:', erro);
        lista.innerHTML = '<p style="color: #ef4444;">Falha ao comunicar com o servidor.</p>';
    }

    // =========================================================
    // FILTROS E PESQUISA
    // =========================================================
    const botoesFiltro = document.querySelectorAll('.filtro');
    botoesFiltro.forEach((botao) => {
        botao.addEventListener('click', () => {
            botoesFiltro.forEach((b) => b.setAttribute('aria-pressed', 'false'));
            botao.setAttribute('aria-pressed', 'true');
            aplicarFiltros();
        });
    });

    if (inputPesquisa) {
        inputPesquisa.addEventListener('input', aplicarFiltros);
    }

    if (formBusca) {
        formBusca.addEventListener('submit', (e) => {
            e.preventDefault();
            aplicarFiltros();
        });
    }

    function aplicarFiltros() {
        const botaoAtivo = document.querySelector('.filtro[aria-pressed="true"]');
        const filtro = botaoAtivo ? botaoAtivo.dataset.filtro : 'todas';
        const termo = (inputPesquisa?.value || '').toLowerCase().trim();
        const cartoes = document.querySelectorAll('.cartao-os');

        cartoes.forEach((cartao) => {
            const status = cartao.dataset.status;
            const textoCartao = cartao.textContent.toLowerCase();

            let bateStatus = false;
            if (filtro === 'todas') bateStatus = true;
            else if (filtro === 'andamento' && status === 'andamento') bateStatus = true;
            else if (filtro === 'fechadas' && status === 'fechada') bateStatus = true;
            else if (filtro === 'congeladas' && status === 'congelada') bateStatus = true;

            const bateBusca = !termo || textoCartao.includes(termo);
            cartao.style.display = (bateStatus && bateBusca) ? 'flex' : 'none';
        });
    }

    // =========================================================
    // MODAL DE DETALHES DA ORDEM PARA O TÉCNICO
    // =========================================================
    function abrirDetalhesOS(os, numeroOs, statusTexto, valorFormatado) {
        let modal = document.getElementById('modal-detalhes-os-prof');

        if (!document.getElementById('estilo-modal-os-prof')) {
            const style = document.createElement('style');
            style.id = 'estilo-modal-os-prof';
            style.innerHTML = `
                .modal-os-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.78); display: none; align-items: center; justify-content: center; padding: 20px; z-index: 99999; }
                .modal-os-overlay.aberto { display: flex; }
                .modal-os-box { background: #1a1a1d; border: 1px solid #333338; border-top: 6px solid #f5c542; border-radius: 16px; width: 100%; max-width: 520px; padding: 24px; color: #ffffff; box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6); max-height: 90vh; overflow-y: auto; }
                .modal-os-topo { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #2e2e33; padding-bottom: 14px; margin-bottom: 18px; }
                .modal-os-topo h2 { margin: 0; font-size: 1.35rem; color: #f5c542; }
                .modal-os-fechar { background: transparent; border: none; color: #a1a1aa; font-size: 1.6rem; cursor: pointer; line-height: 1; }
                .modal-os-fechar:hover { color: #ffffff; }
                .modal-os-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
                .modal-os-campo { background: #242429; padding: 12px 14px; border-radius: 10px; }
                .modal-os-campo.full { grid-column: 1 / -1; }
                .modal-os-campo span { display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; color: #a1a1aa; margin-bottom: 4px; }
                .modal-os-campo p { margin: 0; font-size: 0.95rem; font-weight: 500; color: #f4f4f5; word-break: break-word; }
                .cartao-os { transition: transform 0.2s, box-shadow 0.2s; }
                .cartao-os:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.4); }
            `;
            document.head.appendChild(style);
        }

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-detalhes-os-prof';
            modal.className = 'modal-os-overlay';
            modal.innerHTML = `
                <div class="modal-os-box">
                    <div class="modal-os-topo">
                        <h2 id="prof-detalhe-titulo">OS#</h2>
                        <button type="button" class="modal-os-fechar" id="fechar-modal-prof" aria-label="Fechar">&times;</button>
                    </div>
                    <div class="modal-os-grid">
                        <div class="modal-os-campo"><span>Status</span><p id="prof-detalhe-status"></p></div>
                        <div class="modal-os-campo"><span>Valor</span><p id="prof-detalhe-valor"></p></div>
                        <div class="modal-os-campo"><span>Cliente</span><p id="prof-detalhe-cliente"></p></div>
                        <div class="modal-os-campo"><span>Telefone do Cliente</span><p id="prof-detalhe-telefone"></p></div>
                        <div class="modal-os-campo full"><span>Endereço</span><p id="prof-detalhe-endereco"></p></div>
                        <div class="modal-os-campo"><span>Equipamento</span><p id="prof-detalhe-equipamento"></p></div>
                        <div class="modal-os-campo"><span>Marca</span><p id="prof-detalhe-marca"></p></div>
                        <div class="modal-os-campo full"><span>O que acompanha</span><p id="prof-detalhe-perifericos"></p></div>
                        <div class="modal-os-campo full"><span>Descrição do Problema</span><p id="prof-detalhe-descricao"></p></div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('fechar-modal-prof').addEventListener('click', () => modal.classList.remove('aberto'));
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('aberto'); });
        }

        document.getElementById('prof-detalhe-titulo').textContent = `OS# ${numeroOs}`;
        document.getElementById('prof-detalhe-status').textContent = statusTexto;
        document.getElementById('prof-detalhe-valor').textContent = valorFormatado;
        document.getElementById('prof-detalhe-cliente').textContent = os.clienteNome || 'Não informado';
        document.getElementById('prof-detalhe-telefone').textContent = os.clienteTelefone || 'Não informado';
        document.getElementById('prof-detalhe-endereco').textContent = os.clienteEndereco || 'Não informado';
        document.getElementById('prof-detalhe-equipamento').textContent = os.equipamento || 'Não informado';
        document.getElementById('prof-detalhe-marca').textContent = os.marca || 'Não informada';
        document.getElementById('prof-detalhe-perifericos').textContent = os.perifericos || 'Nenhum item';
        document.getElementById('prof-detalhe-descricao').textContent = os.descricao || 'Sem descrição';

        modal.classList.add('aberto');
    }
});

function aplicarFiltros() {
        const botaoAtivo = document.querySelector('.filtro[aria-pressed="true"]');
        const filtro = botaoAtivo ? botaoAtivo.dataset.filtro : 'todas';
        const termo = (inputPesquisa?.value || '').toLowerCase().trim();
        const cartoes = document.querySelectorAll('.cartao-os');

        cartoes.forEach((cartao) => {
            const status = cartao.dataset.status;
            const textoCartao = cartao.textContent.toLowerCase();

            let bateStatus = false;
            if (filtro === 'todas') bateStatus = true;
            else if (filtro === 'abertas' && (status === 'aberta' || status === 'analise')) bateStatus = true;
            else if (filtro === 'andamento' && status === 'andamento') bateStatus = true;
            else if (filtro === 'fechadas' && status === 'fechada') bateStatus = true;
            else if (filtro === 'congeladas' && status === 'congelada') bateStatus = true;

            const bateBusca = !termo || textoCartao.includes(termo);
            cartao.style.display = (bateStatus && bateBusca) ? 'flex' : 'none';
        });
    }