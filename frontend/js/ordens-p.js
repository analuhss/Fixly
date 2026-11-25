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

    // Garante que o formulário provisório fique oculto e o conteúdo principal apareça
    if (formIdentificar) formIdentificar.hidden = true;
    if (conteudo) conteudo.hidden = false;

    if (!lista) return;

    const mapStatus = {
        analise:   { texto: 'EM ANÁLISE', classe: 'status-analise' },
        aberta:    { texto: 'ABERTA',     classe: 'status-aberta' },
        andamento: { texto: 'ANDAMENTO',  classe: 'status-andamento' },
        fechada:   { texto: 'FECHADA',    classe: 'status-fechada' },
        congelada: { texto: 'CONGELADA',  classe: 'status-congelada' }
    };

    let ordensMinhas = [];
    let ordensSemTecnico = [];
    let abaAtual = 'minhas'; // 'minhas' ou 'sem'

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
    // 2. ALTERNAR ENTRE AS DUAS ABAS ("MINHAS ORDENS" E "SEM TÉCNICO")
    // =========================================================
    abas.forEach((aba) => {
        aba.addEventListener('click', () => {
            abas.forEach((a) => a.setAttribute('aria-selected', 'false'));
            aba.setAttribute('aria-selected', 'true');
            abaAtual = aba.dataset.aba || 'minhas';

            // Mostra os filtros de status apenas na aba "Minhas ordens"
            if (filtrosBox) {
                filtrosBox.style.display = abaAtual === 'minhas' ? '' : 'none';
            }

            renderizarAbaAtual();
        });
    });

    // =========================================================
    // 3. FILTROS DE STATUS E PESQUISA
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
    // 4. RENDERIZAR CARTÕES USANDO O <template id="modeloCartao">
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
            else if (filtro === 'fechadas' && status === 'fechada') bateStatus = true;
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
            if (abaAtual === 'minhas') {
                resumo.textContent = `${filtradas.length} ordem(ns) atribuída(s) a você`;
            } else {
                resumo.textContent = `${filtradas.length} ordem(ns) aguardando técnico`;
            }
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
    // 5. MODAL DE DETALHES DA ORDEM
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
        document.getElementById('prof-detalhe-equipamento').textContent = os.equipamento || os.modelo || 'Não informado';
        document.getElementById('prof-detalhe-marca').textContent = os.marca || 'Não informada';
        document.getElementById('prof-detalhe-perifericos').textContent = os.perifericos || 'Nenhum item';
        document.getElementById('prof-detalhe-descricao').textContent = os.descricao || 'Sem descrição';

        modal.classList.add('aberto');
    }

    await carregarOrdens();
});