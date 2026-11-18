document.addEventListener('DOMContentLoaded', async () => {
    const lista = document.getElementById('lista');
    const inputPesquisa = document.getElementById('pesquisa');
    const formBusca = document.getElementById('formBusca');

    if (!lista) {
        console.error('Elemento #lista não encontrado no HTML.');
        return;
    }

    let listaTecnicos = [];

    const mapStatus = {
        analise:   { texto: 'EM ANÁLISE', classe: 'status-analise' },
        aberta:    { texto: 'ABERTA',     classe: 'status-aberta' },
        andamento: { texto: 'ANDAMENTO',  classe: 'status-andamento' },
        fechada:   { texto: 'FECHADA',    classe: 'status-fechada' },
        congelada: { texto: 'CONGELADA',  classe: 'status-congelada' }
    };

    // =========================================================
    // 1. CARREGA TÉCNICOS E ORDENS DE SERVIÇO
    // =========================================================
    async function carregarTecnicos() {
        try {
            const res = await fetch('/api/tecnicos', { credentials: 'include' });
            if (res.ok) {
                listaTecnicos = await res.json();
            }
        } catch (erro) {
            console.error('Erro ao carregar técnicos:', erro);
        }
    }

    await carregarTecnicos();

    try {
        const res = await fetch('/api/ordens/admin', { credentials: 'include' });

        if (!res.ok) {
            lista.innerHTML = `<p style="color: #ef4444;">Erro ao buscar do servidor (Status ${res.status}).</p>`;
            return;
        }

        const ordens = await res.json();
        lista.innerHTML = '';

        if (!Array.isArray(ordens) || ordens.length === 0) {
            lista.innerHTML = '<p style="color: #a1a1aa;">Nenhuma ordem de serviço cadastrada.</p>';
            return;
        }

        ordens.forEach((os) => {
            const numeroOs = os.id || os.idChamado || os.idOrdem || '---';
            const statusKey = (os.status || 'analise').toLowerCase();
            const info = mapStatus[statusKey] || mapStatus.analise;
            const tecnico = os.tecnico || 'Aguardando técnico';
            const valorFormatado = Number(os.valor || os.valorfinal || 0) > 0
                ? Number(os.valor || os.valorfinal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
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
                abrirDetalhesOS(os, numeroOs, valorFormatado, cartao);
            });
        });

    } catch (erro) {
        console.error('Erro ao renderizar as ordens:', erro);
        lista.innerHTML = '<p style="color: #ef4444;">Erro interno ao processar as ordens.</p>';
    }

    // =========================================================
    // 2. FILTROS E PESQUISA
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
            else if (filtro === 'abertas' && (status === 'aberta' || status === 'analise')) bateStatus = true;
            else if (filtro === 'andamento' && status === 'andamento') bateStatus = true;
            else if (filtro === 'fechadas' && status === 'fechada') bateStatus = true;
            else if (filtro === 'congeladas' && status === 'congelada') bateStatus = true;

            const bateBusca = !termo || textoCartao.includes(termo);
            cartao.style.display = (bateStatus && bateBusca) ? 'flex' : 'none';
        });
    }

    // =========================================================
    // 3. MODAL DE DETALHES E ATRIBUIÇÃO DE TÉCNICO
    // =========================================================
    function abrirDetalhesOS(os, numeroOs, valorFormatado, cartaoElemento) {
        let modal = document.getElementById('modal-detalhes-os');

        if (!document.getElementById('estilo-modal-os')) {
            const style = document.createElement('style');
            style.id = 'estilo-modal-os';
            style.innerHTML = `
                .modal-os-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.78); display: none; align-items: center; justify-content: center; padding: 20px; z-index: 99999; }
                .modal-os-overlay.aberto { display: flex; }
                .modal-os-box { background: #1a1a1d; border: 1px solid #333338; border-top: 6px solid #f5c542; border-radius: 16px; width: 100%; max-width: 520px; padding: 24px; color: #ffffff; box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6); max-height: 90vh; overflow-y: auto; }
                .modal-os-topo { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #2e2e33; padding-bottom: 14px; margin-bottom: 18px; }
                .modal-os-topo h2 { margin: 0; font-size: 1.35rem; color: #f5c542; }
                .modal-os-fechar { background: transparent; border: none; color: #a1a1aa; font-size: 1.6rem; cursor: pointer; line-height: 1; }
                .modal-os-fechar:hover { color: #ffffff; }
                .modal-os-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
                .modal-os-campo { background: #242429; padding: 12px 14px; border-radius: 10px; }
                .modal-os-campo.full { grid-column: 1 / -1; }
                .modal-os-campo span { display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; color: #a1a1aa; margin-bottom: 6px; }
                .modal-os-campo p { margin: 0; font-size: 0.95rem; font-weight: 500; color: #f4f4f5; word-break: break-word; }
                .modal-os-atribuir-row { display: flex; gap: 10px; align-items: center; margin-top: 6px; }
                .modal-os-select { flex: 1; background: #18181b; color: #ffffff; border: 1px solid #3f3f46; border-radius: 8px; padding: 10px 12px; font-family: inherit; font-size: 0.9rem; outline: none; }
                .modal-os-select:focus { border-color: #f5c542; }
                .modal-os-btn-atribuir { background: #f5c542; color: #18181b; border: none; border-radius: 8px; padding: 10px 16px; font-family: inherit; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: opacity 0.2s; white-space: nowrap; }
                .modal-os-btn-atribuir:hover { opacity: 0.9; }
                .modal-os-btn-atribuir:disabled { opacity: 0.5; cursor: not-allowed; }
                .modal-os-feedback { margin-top: 8px !important; font-size: 0.85rem !important; font-weight: 500; }
                .cartao-os { transition: transform 0.2s, box-shadow 0.2s; }
                .cartao-os:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.4); }
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
                        <div class="modal-os-campo full">
                            <span>Atribuir Técnico Responsável</span>
                            <div class="modal-os-atribuir-row">
                                <select id="select-tecnico-os" class="modal-os-select"></select>
                                <button type="button" id="btn-salvar-tecnico" class="modal-os-btn-atribuir">Atribuir</button>
                            </div>
                            <p id="msg-atribuir-os" class="modal-os-feedback"></p>
                        </div>
                        <div class="modal-os-campo"><span>Marca</span><p id="detalhe-marca"></p></div>
                        <div class="modal-os-campo"><span>Equipamento / Modelo</span><p id="detalhe-modelo"></p></div>
                        <div class="modal-os-campo full"><span>O que acompanha</span><p id="detalhe-perifericos"></p></div>
                        <div class="modal-os-campo full"><span>Descrição do Problema</span><p id="detalhe-descricao"></p></div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('fechar-modal-os').addEventListener('click', () => modal.classList.remove('aberto'));
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('aberto'); });
        }

        const statusKeyAtual = (os.status || 'analise').toLowerCase();
        const infoStatus = mapStatus[statusKeyAtual] || mapStatus.analise;

        document.getElementById('detalhe-titulo').textContent = `Detalhes da OS# ${numeroOs}`;
        document.getElementById('detalhe-status').textContent = infoStatus.texto;
        document.getElementById('detalhe-valor').textContent = valorFormatado;
        document.getElementById('detalhe-marca').textContent = os.marca || 'Não informada';
        document.getElementById('detalhe-modelo').textContent = os.equipamento || os.modelo || 'Não informado';
        document.getElementById('detalhe-perifericos').textContent = os.perifericos || 'Nenhum item';
        document.getElementById('detalhe-descricao').textContent = os.descricao || 'Sem descrição';

        const selectTecnico = document.getElementById('select-tecnico-os');
        const btnSalvar = document.getElementById('btn-salvar-tecnico');
        const msgFeedback = document.getElementById('msg-atribuir-os');
        msgFeedback.textContent = '';

        // Popula o <select> com os técnicos do banco
        if (listaTecnicos.length === 0) {
            selectTecnico.innerHTML = '<option value="">Nenhum técnico cadastrado</option>';
            btnSalvar.disabled = true;
        } else {
            btnSalvar.disabled = false;
            selectTecnico.innerHTML = '<option value="">Selecione um técnico...</option>' +
                listaTecnicos.map((t) => {
                    const labelCargo = t.cargo ? ` — ${t.cargo}` : '';
                    const selecionado = String(t.idTecnico) === String(os.idTecnico) ? 'selected' : '';
                    return `<option value="${t.idTecnico}" ${selecionado}>${t.nome}${labelCargo}</option>`;
                }).join('');
        }

        // Substitui o evento de clique para referenciar a OS atual
        btnSalvar.onclick = async () => {
            const idTecnicoEscolhido = selectTecnico.value;

            if (!idTecnicoEscolhido) {
                msgFeedback.textContent = 'Selecione um técnico na lista.';
                msgFeedback.style.color = '#ef4444';
                return;
            }

            btnSalvar.disabled = true;
            msgFeedback.textContent = 'Salvando atribuição...';
            msgFeedback.style.color = '#a1a1aa';

            try {
                const resposta = await fetch(`/api/ordens/${numeroOs}/atribuir`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ idTecnico: Number(idTecnicoEscolhido) })
                });

                const resultado = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(resultado.mensagem || 'Erro ao atribuir técnico.');
                }

                const tecnicoObj = listaTecnicos.find((t) => String(t.idTecnico) === String(idTecnicoEscolhido));
                const nomeNovoTecnico = tecnicoObj ? tecnicoObj.nome : 'Técnico atribuído';

                // Atualiza os dados em memória e o cartão na tela imediatamente
                os.idTecnico = Number(idTecnicoEscolhido);
                os.tecnico = nomeNovoTecnico;

                if (cartaoElemento) {
                    const nomeEl = cartaoElemento.querySelector('.linha-tecnico .nome');
                    if (nomeEl) nomeEl.textContent = nomeNovoTecnico;

                    if (statusKeyAtual === 'analise') {
                        os.status = 'aberta';
                        cartaoElemento.dataset.status = 'aberta';
                        cartaoElemento.classList.remove('status-analise');
                        cartaoElemento.classList.add('status-aberta');
                        const seloTexto = cartaoElemento.querySelector('.selo-texto');
                        if (seloTexto) seloTexto.textContent = 'ABERTA';
                        document.getElementById('detalhe-status').textContent = 'ABERTA';
                    }
                }

                msgFeedback.textContent = resultado.mensagem;
                msgFeedback.style.color = '#22c55e';

            } catch (erro) {
                console.error('Erro ao atribuir técnico:', erro);
                msgFeedback.textContent = erro.message;
                msgFeedback.style.color = '#ef4444';
            } finally {
                btnSalvar.disabled = false;
            }
        };

        modal.classList.add('aberto');
    }
});