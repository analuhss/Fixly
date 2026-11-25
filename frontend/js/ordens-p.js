document.addEventListener('DOMContentLoaded', async () => {
    const conteudo = document.getElementById('conteudo');
    const formIdentificar = document.getElementById('formIdentificar');
    const lista = document.getElementById('lista');
    const resumo = document.getElementById('resumo');
    const filtrosBox = document.getElementById('filtros');
    const inputPesquisa = document.getElementById('pesquisa');
    const formBusca = document.getElementById('formBusca');
    const contMinhas = document.getElementById('contMinhas');
    const contSem = document.getElementById('contSem');
    const templateCartao = document.getElementById('modeloCartao');
    const abas = document.querySelectorAll('.aba');
    const botoesFiltro = document.querySelectorAll('.filtro');

    if (formIdentificar) formIdentificar.hidden = true;
    if (conteudo) conteudo.hidden = false;

    if (!lista) return;

    const mapStatus = {
        analise:   { texto: 'EM ANÁLISE', classe: 'status-analise' },
        aberta:    { texto: 'ABERTA',     classe: 'status-aberta' },
        andamento: { texto: 'ANDAMENTO',  classe: 'status-andamento' },
        fechada:   { texto: 'FECHADA',    classe: 'status-fechada' },
        congelada: { texto: 'CONGELADA',  classe: 'status-congelada' },
        cancelada: { texto: 'CANCELADA',  classe: 'status-fechada' }
    };

    let ordensMinhas = [];
    let ordensSemTecnico = [];
    let abaAtual = 'minhas';

    // =========================================================
    // 1. BUSCAR ORDENS DO SERVIDOR
    // =========================================================
    async function carregarOrdens() {
        try {
            const res = await fetch('/api/ordens/profissional', { credentials: 'include' });

            if (res.status === 401) {
                window.location.href = '/';
                return;
            }

            if (!res.ok) {
                lista.innerHTML = `<p style="color: #ef4444;">Erro ao buscar ordens (Status ${res.status}).</p>`;
                return;
            }

            const dados = await res.json();

            if (Array.isArray(dados)) {
                ordensMinhas = dados;
                ordensSemTecnico = [];
            } else {
                ordensMinhas = dados.atribuidas || [];
                ordensSemTecnico = dados.disponiveis || [];
            }

            if (contMinhas) contMinhas.textContent = ordensMinhas.length;
            if (contSem) contSem.textContent = ordensSemTecnico.length;

            renderizarAbaAtual();
        } catch (erro) {
            console.error('Erro ao carregar ordens do profissional:', erro);
            lista.innerHTML = '<p style="color: #ef4444;">Falha ao comunicar com o servidor.</p>';
        }
    }

    // =========================================================
    // 2. ALTERNAR ENTRE AS ABAS ("MINHAS ORDENS" E "SEM TÉCNICO")
    // =========================================================
    abas.forEach((aba) => {
        aba.addEventListener('click', () => {
            abas.forEach((a) => a.setAttribute('aria-selected', 'false'));
            aba.setAttribute('aria-selected', 'true');
            abaAtual = aba.dataset.aba || 'minhas';

            if (filtrosBox) {
                filtrosBox.style.display = abaAtual === 'minhas' ? '' : 'none';
            }

            renderizarAbaAtual();
        });
    });

    // =========================================================
    // 3. FILTROS E PESQUISA
    // =========================================================
    botoesFiltro.forEach((botao) => {
        botao.addEventListener('click', () => {
            botoesFiltro.forEach((b) => b.setAttribute('aria-pressed', 'false'));
            botao.setAttribute('aria-pressed', 'true');
            renderizarAbaAtual();
        });
    });

    if (inputPesquisa) {
        inputPesquisa.addEventListener('input', renderizarAbaAtual);
    }

    if (formBusca) {
        formBusca.addEventListener('submit', (e) => {
            e.preventDefault();
            renderizarAbaAtual();
        });
    }

    // =========================================================
    // 4. RENDERIZAR CARTÕES
    // =========================================================
    function renderizarAbaAtual() {
        const base = abaAtual === 'minhas' ? ordensMinhas : ordensSemTecnico;
        const botaoFiltroAtivo = document.querySelector('.filtro[aria-pressed="true"]');
        const filtro = (abaAtual === 'minhas' && botaoFiltroAtivo) ? botaoFiltroAtivo.dataset.filtro : 'todas';
        const termo = (inputPesquisa?.value || '').toLowerCase().trim();

        const filtradas = base.filter((os) => {
            const status = (os.status || (abaAtual === 'sem' ? 'aberta' : 'andamento')).toLowerCase();

            let bateStatus = false;
            if (filtro === 'todas') bateStatus = true;
            else if (filtro === 'abertas' && (status === 'aberta' || status === 'analise')) bateStatus = true;
            else if (filtro === 'andamento' && status === 'andamento') bateStatus = true;
            else if (filtro === 'fechadas' && (status === 'fechada' || status === 'cancelada')) bateStatus = true;
            else if (filtro === 'congeladas' && status === 'congelada') bateStatus = true;

            const textoBusca = [
                os.id,
                os.idChamado,
                os.clienteNome,
                os.equipamento,
                os.modelo,
                os.marca,
                os.descricao
            ].filter(Boolean).join(' ').toLowerCase();

            const bateBusca = !termo || textoBusca.includes(termo);
            return bateStatus && bateBusca;
        });

        lista.innerHTML = '';

        if (resumo) {
            resumo.textContent = abaAtual === 'minhas'
                ? `${filtradas.length} ordem(ns) atribuída(s) a você`
                : `${filtradas.length} ordem(ns) aguardando técnico`;
        }

        if (filtradas.length === 0) {
            lista.innerHTML = abaAtual === 'minhas'
                ? '<p style="color: #a1a1aa;">Nenhuma ordem atribuída encontrada.</p>'
                : '<p style="color: #a1a1aa;">Nenhuma ordem disponível sem técnico no momento.</p>';
            return;
        }

        filtradas.forEach((os) => {
            const numeroOs = os.id || os.idChamado || '---';
            const statusKey = (os.status || (abaAtual === 'sem' ? 'aberta' : 'andamento')).toLowerCase();
            const info = mapStatus[statusKey] || mapStatus.andamento;
            const cliente = os.clienteNome || 'Cliente';
            const equipamento = os.equipamento || os.modelo || 'Não informado';
            const valorFormatado = Number(os.valorfinal || os.valor || 0) > 0
                ? Number(os.valorfinal || os.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : 'A definir';

            const clone = templateCartao.content.cloneNode(true);
            const cartao = clone.querySelector('.cartao-os');

            cartao.classList.add(info.classe);
            cartao.dataset.status = statusKey;
            cartao.style.cursor = 'pointer';

            cartao.querySelector('.numero').textContent = `OS# ${numeroOs}`;
            cartao.querySelector('.nome').textContent = abaAtual === 'minhas' ? (os.tecnico || 'Você') : 'Sem técnico';
            cartao.querySelector('.selo-texto').textContent = info.texto;
            cartao.querySelector('.cliente').textContent = cliente;
            cartao.querySelector('.equipamento').textContent = equipamento;
            cartao.querySelector('.problema').textContent = os.descricao || 'Sem descrição';
            cartao.querySelector('.abertura').textContent = os.dataAbertura || os.data || '---';
            cartao.querySelector('.reais').textContent = valorFormatado;

            const btnAssumir = cartao.querySelector('.assumir');
            if (btnAssumir) {
                if (abaAtual === 'sem') {
                    btnAssumir.hidden = false;
                    btnAssumir.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        btnAssumir.disabled = true;
                        btnAssumir.textContent = 'Assumindo...';

                        try {
                            const resp = await fetch(`/api/ordens/${numeroOs}/assumir`, {
                                method: 'PUT',
                                credentials: 'include'
                            });
                            const retorno = await resp.json();

                            if (resp.ok) {
                                await carregarOrdens();
                            } else {
                                alert(retorno.mensagem || 'Não foi possível assumir esta ordem.');
                                btnAssumir.disabled = false;
                                btnAssumir.textContent = 'Assumir ordem';
                            }
                        } catch (err) {
                            alert('Falha de comunicação com o servidor.');
                            btnAssumir.disabled = false;
                            btnAssumir.textContent = 'Assumir ordem';
                        }
                    });
                } else {
                    btnAssumir.remove();
                }
            }

            cartao.addEventListener('click', () => {
                abrirDetalhesOS(os, numeroOs, info.texto, valorFormatado);
            });

            lista.appendChild(clone);
        });
    }

    // =========================================================
    // 5. MODAL DE DETALHES DA ORDEM (TÉCNICO + ORÇAMENTO + VALIDAÇÃO)
    // =========================================================
    function abrirDetalhesOS(os, numeroOs, statusTexto, valorFormatado) {
        let modal = document.getElementById('modal-detalhes-os-prof');

        if (!document.getElementById('estilo-modal-os-prof')) {
            const style = document.createElement('style');
            style.id = 'estilo-modal-os-prof';
            style.innerHTML = `
                .modal-os-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.78); display: none; align-items: center; justify-content: center; padding: 20px; z-index: 99999; }
                .modal-os-overlay.aberto { display: flex; }
                .modal-os-box { background: #1a1a1d; border: 1px solid #333338; border-top: 6px solid #f5c542; border-radius: 16px; width: 100%; max-width: 600px; padding: 24px; color: #ffffff; box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6); max-height: 90vh; overflow-y: auto; }
                .modal-os-topo { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #2e2e33; padding-bottom: 14px; margin-bottom: 18px; }
                .modal-os-topo h2 { margin: 0; font-size: 1.35rem; color: #f5c542; }
                .modal-os-fechar { background: transparent; border: none; color: #a1a1aa; font-size: 1.6rem; cursor: pointer; line-height: 1; }
                .modal-os-fechar:hover { color: #ffffff; }
                .modal-os-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .modal-os-campo { background: #242429; padding: 11px 14px; border-radius: 10px; }
                .modal-os-campo.full { grid-column: 1 / -1; }
                .modal-os-campo span, .modal-os-campo label { display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; color: #a1a1aa; margin-bottom: 5px; }
                .modal-os-campo p { margin: 0; font-size: 0.94rem; font-weight: 500; color: #f4f4f5; word-break: break-word; }
                .modal-input, .modal-textarea, .modal-os-select {
                    width: 100%; box-sizing: border-box; background: #18181b; color: #ffffff;
                    border: 1px solid #3f3f46; border-radius: 8px; padding: 9px 11px;
                    font-size: 0.92rem; font-family: inherit; outline: none;
                }
                .modal-input:focus, .modal-textarea:focus, .modal-os-select:focus { border-color: #f5c542; }
                .modal-textarea { min-height: 68px; resize: vertical; }
                .secao-tecnica-titulo { margin: 20px 0 12px; padding-top: 16px; border-top: 1px solid #2e2e33; font-size: 0.95rem; color: #f5c542; font-weight: 700; display: flex; justify-content: space-between; align-items: center; }
                .badge-validacao { font-size: 0.75rem; padding: 3px 10px; border-radius: 999px; font-weight: 600; background: #27272a; color: #f5c542; border: 1px solid #f5c542; }
                .badge-validacao.aprovado { color: #22c55e; border-color: #22c55e; }
                .badge-validacao.recusado { color: #ef4444; border-color: #ef4444; }
                .modal-os-acoes { margin-top: 18px; padding-top: 16px; border-top: 1px solid #2e2e33; display: flex; flex-direction: column; gap: 10px; }
                .modal-os-status-row { display: flex; gap: 10px; align-items: center; }
                .btn-modal-salvar-status { background: #2e2e33; color: #f5c542; border: 1px solid #f5c542; border-radius: 10px; padding: 10px 16px; font-weight: 600; cursor: pointer; transition: 0.2s; white-space: nowrap; }
                .btn-modal-salvar-status:hover { background: #f5c542; color: #1a1a1d; }
                .btn-modal-validacao { width: 100%; background: #f5c542; color: #1a1a1d; border: none; border-radius: 10px; padding: 12px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .btn-modal-validacao:hover { filter: brightness(1.08); }
                .btn-modal-finalizar { width: 100%; background: #22c55e; color: #09090b; border: none; border-radius: 10px; padding: 12px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .btn-modal-finalizar:hover { filter: brightness(1.08); }
                .btn-modal-cancelar { width: 100%; background: transparent; color: #ef4444; border: 1px solid #ef4444; border-radius: 10px; padding: 11px; font-size: 0.92rem; font-weight: 600; cursor: pointer; transition: 0.2s; }
                .btn-modal-cancelar:hover { background: #ef4444; color: #ffffff; }
                .modal-os-box button:disabled { opacity: 0.55; cursor: not-allowed; }
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
                        <div class="modal-os-campo"><span>Taxa de Análise</span><p id="prof-detalhe-status"></p></div>
                        <div class="modal-os-campo"><span>Valor Total</span><p id="prof-detalhe-valor"></p></div>
                        <div class="modal-os-campo"><span>Cliente</span><p id="prof-detalhe-cliente"></p></div>
                        <div class="modal-os-campo"><span>Telefone do Cliente</span><p id="prof-detalhe-telefone"></p></div>
                        <div class="modal-os-campo full"><span>Endereço</span><p id="prof-detalhe-endereco"></p></div>
                        <div class="modal-os-campo"><span>Equipamento</span><p id="prof-detalhe-equipamento"></p></div>
                        <div class="modal-os-campo"><span>Marca</span><p id="prof-detalhe-marca"></p></div>
                        <div class="modal-os-campo full"><span>O que acompanha</span><p id="prof-detalhe-perifericos"></p></div>
                        <div class="modal-os-campo full"><span>Descrição do Problema</span><p id="prof-detalhe-descricao"></p></div>
                    </div>

                    <div id="prof-bloco-tecnico">
                        <div class="secao-tecnica-titulo">
                            <span>Laudo Técnico & Orçamento</span>
                            <span id="prof-badge-validacao" class="badge-validacao">Não enviado</span>
                        </div>

                        <div class="modal-os-grid">
                            <div class="modal-os-campo full">
                                <label for="prof-input-diagnostico">Diagnóstico</label>
                                <textarea id="prof-input-diagnostico" class="modal-textarea" placeholder="Descreva o defeito identificado na análise..."></textarea>
                            </div>

                            <div class="modal-os-campo full">
                                <label for="prof-input-servico">Serviço Executado</label>
                                <textarea id="prof-input-servico" class="modal-textarea" placeholder="Descreva o procedimento técnico realizado ou a realizar..."></textarea>
                            </div>

                            <div class="modal-os-campo">
                                <label for="prof-input-mao-obra">Preço Mão de Obra (R$)</label>
                                <input type="number" step="0.01" min="0" id="prof-input-mao-obra" class="modal-input" placeholder="0,00">
                            </div>

                            <div class="modal-os-campo">
                                <label for="prof-input-material">Preço Material (R$)</label>
                                <input type="number" step="0.01" min="0" id="prof-input-material" class="modal-input" placeholder="0,00">
                            </div>

                            <div class="modal-os-campo">
                                <label for="prof-input-data-fim">Data de Finalização</label>
                                <input type="date" id="prof-input-data-fim" class="modal-input">
                            </div>

                            <div class="modal-os-campo">
                                <label for="prof-input-processo">Processo</label>
                                <input type="text" id="prof-input-processo" class="modal-input" placeholder="Ex: Aguardando peça / Em bancada">
                            </div>
                        </div>
                    </div>

                    <div class="modal-os-acoes" id="prof-modal-acoes">
                        <button type="button" id="btn-enviar-validacao" class="btn-modal-validacao">
                            Salvar Dados e Abrir Validação do Cliente
                        </button>

                        <div class="modal-os-status-row">
                            <select id="prof-select-status" class="modal-os-select" aria-label="Alterar status da OS">
                                <option value="aberta">Aberta</option>
                                <option value="analise">Em Análise</option>
                                <option value="andamento">Em Andamento</option>
                                <option value="congelada">Congelada</option>
                            </select>
                            <button type="button" id="btn-salvar-status-os" class="btn-modal-salvar-status">Salvar Status</button>
                        </div>

                        <button type="button" id="btn-finalizar-os" class="btn-modal-finalizar">Finalizar Ordem de Serviço</button>
                        <button type="button" id="btn-cancelar-os" class="btn-modal-cancelar">Cancelar Ordem de Serviço</button>
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
        document.getElementById('prof-detalhe-equipamento').textContent = os.equipamento || os.modelo || 'Não informado';
        document.getElementById('prof-detalhe-marca').textContent = os.marca || 'Não informada';
        document.getElementById('prof-detalhe-perifericos').textContent = os.perifericos || 'Nenhum item';
        document.getElementById('prof-detalhe-descricao').textContent = os.descricao || 'Sem descrição';

        const inputDiag = document.getElementById('prof-input-diagnostico');
        const inputServ = document.getElementById('prof-input-servico');
        const inputMaoObra = document.getElementById('prof-input-mao-obra');
        const inputMaterial = document.getElementById('prof-input-material');
        const inputDataFim = document.getElementById('prof-input-data-fim');
        const inputProcesso = document.getElementById('prof-input-processo');
        const badgeValidacao = document.getElementById('prof-badge-validacao');

        inputDiag.value = os.diagnostico || '';
        inputServ.value = os.servico_executado || '';
        inputMaoObra.value = os.preco_mao_obra || '';
        inputMaterial.value = os.preco_material || '';
        inputDataFim.value = os.data_finalizacao || '';
        inputProcesso.value = os.processo || '';

        const TAXA_ANALISE = 60;

        const atualizarTotalPreview = () => {
            const total = (parseFloat(inputMaoObra.value) || 0) + (parseFloat(inputMaterial.value) || 0);
            document.getElementById('prof-detalhe-valor').textContent = total > 0
                ? total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : 'A definir';
        };
        inputMaoObra.oninput = atualizarTotalPreview;
        inputMaterial.oninput = atualizarTotalPreview;

        const valCliente = (os.validacao_cliente || '').toLowerCase();
        badgeValidacao.className = 'badge-validacao';
        if (valCliente === 'pendente') {
            badgeValidacao.textContent = 'Aguardando validação do cliente';
        } else if (valCliente === 'aprovado') {
            badgeValidacao.textContent = 'Validado pelo cliente';
            badgeValidacao.classList.add('aprovado');
        } else if (valCliente === 'recusado') {
            badgeValidacao.textContent = 'Recusado pelo cliente';
            badgeValidacao.classList.add('recusado');
        } else {
            badgeValidacao.textContent = 'Validação não aberta';
        }

        const blocoTecnico = document.getElementById('prof-bloco-tecnico');
        const boxAcoes = document.getElementById('prof-modal-acoes');
        const selectStatus = document.getElementById('prof-select-status');
        const btnSalvarStatus = document.getElementById('btn-salvar-status-os');
        const btnEnviarValidacao = document.getElementById('btn-enviar-validacao');
        const btnFinalizar = document.getElementById('btn-finalizar-os');
        const btnCancelar = document.getElementById('btn-cancelar-os');

        if (abaAtual === 'minhas') {
            blocoTecnico.style.display = 'block';
            boxAcoes.style.display = 'flex';

            const statusAtual = (os.status || 'andamento').toLowerCase();
            const encerrada = statusAtual === 'fechada' || statusAtual === 'cancelada';

            selectStatus.value = ['aberta', 'analise', 'andamento', 'congelada'].includes(statusAtual)
                ? statusAtual
                : 'andamento';

            [inputDiag, inputServ, inputMaoObra, inputMaterial, inputDataFim, inputProcesso, selectStatus, btnSalvarStatus, btnEnviarValidacao]
                .forEach((el) => { el.disabled = encerrada; });

            btnEnviarValidacao.onclick = async () => {
                btnEnviarValidacao.disabled = true;
                btnEnviarValidacao.textContent = 'Enviando para o cliente...';
                try {
                    const resp = await fetch(`/api/ordens/${numeroOs}/tecnico-detalhes`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            diagnostico: inputDiag.value,
                            servico_executado: inputServ.value,
                            data_finalizacao: inputDataFim.value,
                            preco_mao_obra: inputMaoObra.value,
                            preco_material: inputMaterial.value,
                            processo: inputProcesso.value || 'Aguardando validação do cliente',
                            enviar_validacao: true
                        })
                    });
                    const dados = await resp.json();
                    if (resp.ok) {
                        alert(dados.mensagem);
                        modal.classList.remove('aberto');
                        await carregarOrdens();
                    } else {
                        alert(dados.mensagem || 'Erro ao enviar validação.');
                    }
                } catch (err) {
                    alert('Falha de comunicação com o servidor.');
                } finally {
                    btnEnviarValidacao.disabled = false;
                    btnEnviarValidacao.textContent = 'Salvar Dados e Abrir Validação do Cliente';
                }
            };

            btnSalvarStatus.onclick = async () => {
                btnSalvarStatus.disabled = true;
                btnSalvarStatus.textContent = 'Salvando...';
                try {
                    await fetch(`/api/ordens/${numeroOs}/tecnico-detalhes`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            diagnostico: inputDiag.value,
                            servico_executado: inputServ.value,
                            data_finalizacao: inputDataFim.value,
                            preco_mao_obra: inputMaoObra.value,
                            preco_material: inputMaterial.value,
                            processo: inputProcesso.value,
                            enviar_validacao: false
                        })
                    });

                    const resp = await fetch(`/api/ordens/${numeroOs}/status`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ status: selectStatus.value })
                    });
                    const dados = await resp.json();
                    if (resp.ok) {
                        modal.classList.remove('aberto');
                        await carregarOrdens();
                    } else {
                        alert(dados.mensagem || 'Erro ao atualizar status.');
                    }
                } catch (err) {
                    alert('Falha de comunicação com o servidor.');
                } finally {
                    btnSalvarStatus.disabled = false;
                    btnSalvarStatus.textContent = 'Salvar Status';
                }
            };

            if (encerrada) {
                btnFinalizar.disabled = true;
                btnFinalizar.textContent = statusAtual === 'fechada' ? 'Ordem já Finalizada' : 'Ordem Encerrada';
                btnCancelar.disabled = true;
                btnCancelar.textContent = statusAtual === 'cancelada' ? 'Ordem Cancelada' : 'Cancelar Ordem de Serviço';
            } else {
                btnFinalizar.disabled = false;
                btnFinalizar.textContent = 'Finalizar Ordem de Serviço';
                btnFinalizar.onclick = async () => {
                    if (!confirm(`Deseja realmente finalizar a OS# ${numeroOs}?`)) return;
                    btnFinalizar.disabled = true;
                    btnFinalizar.textContent = 'Finalizando...';
                    try {
                        await fetch(`/api/ordens/${numeroOs}/tecnico-detalhes`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({
                                diagnostico: inputDiag.value,
                                servico_executado: inputServ.value,
                                data_finalizacao: inputDataFim.value || new Date().toISOString().split('T')[0],
                                preco_mao_obra: inputMaoObra.value,
                                preco_material: inputMaterial.value,
                                processo: inputProcesso.value || 'Concluída',
                                enviar_validacao: false
                            })
                        });

                        const resp = await fetch(`/api/ordens/${numeroOs}/status`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ status: 'fechada' })
                        });
                        const dados = await resp.json();
                        if (resp.ok) {
                            modal.classList.remove('aberto');
                            await carregarOrdens();
                        } else {
                            alert(dados.mensagem || 'Erro ao finalizar ordem.');
                        }
                    } catch (err) {
                        alert('Falha de comunicação com o servidor.');
                    } finally {
                        btnFinalizar.disabled = false;
                        btnFinalizar.textContent = 'Finalizar Ordem de Serviço';
                    }
                };

                btnCancelar.disabled = false;
                btnCancelar.textContent = 'Cancelar Ordem de Serviço';
                btnCancelar.onclick = async () => {
                    if (!confirm(`Tem certeza que deseja cancelar a OS# ${numeroOs}?`)) return;
                    btnCancelar.disabled = true;
                    btnCancelar.textContent = 'Cancelando...';
                    try {
                        const resp = await fetch(`/api/ordens/${numeroOs}/status`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ status: 'cancelada' })
                        });
                        const dados = await resp.json();
                        if (resp.ok) {
                            modal.classList.remove('aberto');
                            await carregarOrdens();
                        } else {
                            alert(dados.mensagem || 'Erro ao cancelar a ordem.');
                        }
                    } catch (err) {
                        alert('Falha de comunicação com o servidor.');
                    } finally {
                        btnCancelar.disabled = false;
                        btnCancelar.textContent = 'Cancelar Ordem de Serviço';
                    }
                };
            }
        } else {
            blocoTecnico.style.display = 'none';
            boxAcoes.style.display = 'none';
        }

        modal.classList.add('aberto');
    }

    await carregarOrdens();
});