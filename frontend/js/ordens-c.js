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
                    window.location.href = '/ordens-c';
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
        console.log("[PASSO 3] Elemento #lista não encontrado.");
        return;
    }

    console.log("[PASSO 4] Elemento #lista encontrado. A procurar ordens...");

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
                abrirDetalhesOS(os, numeroOs, info.texto, tecnico, valorFormatado);
            });
        });

        console.log("[PASSO 8] Cartões renderizados com sucesso no ecrã.");

    } catch (erro) {
        console.error('[ERRO FATAL] Erro de JavaScript ao renderizar as ordens:', erro);
    }

    // =========================================================
    // FILTRAR PELAS CLASSES E PESQUISA
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

    // =========================================================
    // MODAL DE DETALHES, APROVAÇÃO E FORMA DE PAGAMENTO
    // =========================================================
    function abrirDetalhesOS(os, numeroOs, statusTexto, tecnico, valorFormatado) {
        console.log(`[MODAL] A abrir modal para a OS# ${numeroOs}`, os);
        let modal = document.getElementById('modal-detalhes-os');

        if (!document.getElementById('estilo-modal-os')) {
            const style = document.createElement('style');
            style.id = 'estilo-modal-os';
            style.innerHTML = `
                .modal-os-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.78); display: none; align-items: center; justify-content: center; padding: 20px; z-index: 99999; }
                .modal-os-overlay.aberto { display: flex; }
                .modal-os-box { background: #1a1a1d; border: 1px solid #333338; border-top: 6px solid #f5c542; border-radius: 16px; width: 100%; max-width: 540px; padding: 24px; color: #ffffff; box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6); max-height: 90vh; overflow-y: auto; }
                .modal-os-topo { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #2e2e33; padding-bottom: 14px; margin-bottom: 18px; }
                .modal-os-topo h2 { margin: 0; font-size: 1.35rem; color: #f5c542; }
                .modal-os-fechar { background: transparent; border: none; color: #a1a1aa; font-size: 1.6rem; cursor: pointer; line-height: 1; }
                .modal-os-fechar:hover { color: #ffffff; }
                .modal-os-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
                .modal-os-campo { background: #242429; padding: 12px 14px; border-radius: 10px; }
                .modal-os-campo.full { grid-column: 1 / -1; }
                .modal-os-campo span { display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; color: #a1a1aa; margin-bottom: 4px; }
                .modal-os-campo p { margin: 0; font-size: 0.95rem; font-weight: 500; color: #f4f4f5; word-break: break-word; }
                .modal-os-secao-titulo { grid-column: 1 / -1; margin-top: 6px; padding-top: 12px; border-top: 1px solid #2e2e33; font-size: 0.95rem; font-weight: 700; color: #f5c542; display: flex; justify-content: space-between; align-items: center; }
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
                        <div class="modal-os-campo"><span>Valor Total</span><p id="detalhe-valor"></p></div>
                        <div class="modal-os-campo full"><span>Técnico Responsável</span><p id="detalhe-tecnico"></p></div>
                        <div class="modal-os-campo"><span>Marca</span><p id="detalhe-marca"></p></div>
                        <div class="modal-os-campo"><span>Modelo</span><p id="detalhe-modelo"></p></div>
                        <div class="modal-os-campo full"><span>O que acompanha</span><p id="detalhe-perifericos"></p></div>
                        <div class="modal-os-campo full"><span>Descrição do Problema</span><p id="detalhe-descricao"></p></div>

                        <div class="modal-os-secao-titulo">
                            <span>Laudo Técnico & Orçamento</span>
                        </div>
                        <div class="modal-os-campo full"><span>Diagnóstico</span><p id="detalhe-diagnostico"></p></div>
                        <div class="modal-os-campo full"><span>Serviço Executado</span><p id="detalhe-servico-executado"></p></div>
                        <div class="modal-os-campo"><span>Preço Mão de Obra</span><p id="detalhe-mao-obra"></p></div>
                        <div class="modal-os-campo"><span>Preço Material</span><p id="detalhe-materiais"></p></div>
                        <div class="modal-os-campo"><span>Taxa de Análise</span><p id="detalhe-taxa-analise"></p></div>
                        <div class="modal-os-campo"><span>Previsão / Finalização</span><p id="detalhe-data-finalizacao"></p></div>

                        <div class="modal-os-campo full" id="area-aprovacao-orcamento" style="display: none;"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('fechar-modal-os').addEventListener('click', () => modal.classList.remove('aberto'));
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('aberto'); });
        }

        const formatarMoeda = (val) => Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        const diagnostico = os.diagnostico || os.laudo || 'Aguardando avaliação técnica';
        const servicoExecutado = os.servico_executado || os.servicos_executados || os.servicoExecutado || os.servico || 'Aguardando definição';
        const maoDeObraNum = Number(os.mao_de_obra ?? os.preco_mao_obra ?? os.maoDeObra ?? 0);
        const materiaisNum = Number(os.materiais ?? os.preco_material ?? os.precoMaterial ?? os.pecas ?? 0);
        const taxaNum = Number(os.taxa_analise ?? os.taxaAnalise ?? 60);
        const valorTotal = Number(os.valor ?? os.valor_final ?? os.valorfinal ?? 0);

        const dataFimBruta = os.data_finalizacao || os.dataFinalizacao || '';
        const dataFimFormatada = dataFimBruta
            ? (dataFimBruta.includes('-') ? dataFimBruta.split('T')[0].split('-').reverse().join('/') : dataFimBruta)
            : 'A definir';

        document.getElementById('detalhe-titulo').textContent = `Detalhes da OS# ${numeroOs}`;
        document.getElementById('detalhe-status').textContent = statusTexto;
        document.getElementById('detalhe-valor').textContent = valorFormatado;
        document.getElementById('detalhe-tecnico').textContent = tecnico;
        document.getElementById('detalhe-marca').textContent = os.marca || 'Não informada';
        document.getElementById('detalhe-modelo').textContent = os.modelo || 'Não informado';
        document.getElementById('detalhe-perifericos').textContent = os.perifericos || 'Nenhum item';
        document.getElementById('detalhe-descricao').textContent = os.descricao || 'Sem descrição';

        document.getElementById('detalhe-diagnostico').textContent = diagnostico;
        document.getElementById('detalhe-servico-executado').textContent = servicoExecutado;
        document.getElementById('detalhe-mao-obra').textContent = formatarMoeda(maoDeObraNum);
        document.getElementById('detalhe-materiais').textContent = formatarMoeda(materiaisNum);
        document.getElementById('detalhe-taxa-analise').textContent = formatarMoeda(taxaNum);
        document.getElementById('detalhe-data-finalizacao').textContent = dataFimFormatada;

        // =========================================================
        // BLOCO DE APROVAÇÃO -> FORMA DE PAGAMENTO
        // =========================================================
        const areaAprovacao = document.getElementById('area-aprovacao-orcamento');
        const taxaFormatada = formatarMoeda(taxaNum);
        const validacaoAtual = (os.validacao_cliente || os.validacaoCliente || 'pendente').toLowerCase();
        const statusAtual = (os.status || '').toLowerCase();
        const pagamentoSalvo = os.forma_pagamento || os.formaPagamento || '';

        const aguardandoAprovacao =
            valorTotal > 60 &&
            statusAtual !== 'fechada' &&
            validacaoAtual !== 'aprovado' &&
            validacaoAtual !== 'recusado';

        // Etapa 2: Exibe seleção de forma de pagamento logo após aceitar
        const exibirEtapaPagamento = () => {
            areaAprovacao.style.display = 'block';
            areaAprovacao.innerHTML = `
                <span>Orçamento Aprovado — Forma de Pagamento</span>
                <p style="color: #22c55e; font-weight: 600; margin-bottom: 10px;">
                    Orçamento de ${valorFormatado} aceito! Escolha como deseja pagar:
                </p>
                <select id="select-forma-pagamento" style="width: 100%; background: #18181b; color: #f4f4f5; border: 1px solid #3f3f46; border-radius: 8px; padding: 10px; font-size: 0.95rem; margin-bottom: 12px;">
                    <option value="">-- Selecione a forma de pagamento --</option>
                    <option value="Pix">Pix</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                </select>
                <button type="button" id="btn-salvar-pagamento" style="width: 100%; background: #f5c542; color: #09090b; border: none; border-radius: 8px; padding: 10px 14px; font-weight: 700; cursor: pointer;">
                    Confirmar Forma de Pagamento
                </button>
            `;

            document.getElementById('btn-salvar-pagamento').onclick = async () => {
                const formaEscolhida = document.getElementById('select-forma-pagamento').value;
                if (!formaEscolhida) {
                    alert('Por favor, selecione uma forma de pagamento.');
                    return;
                }

                try {
                    const resPag = await fetch(`/api/ordens/${numeroOs}/pagamento`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ formaPagamento: formaEscolhida })
                    });

                    const dadosPag = await resPag.json();
                    if (!resPag.ok) {
                        alert(dadosPag.mensagem || 'Erro ao salvar pagamento.');
                        return;
                    }

                    alert(dadosPag.mensagem);
                    modal.classList.remove('aberto');
                    window.location.reload();
                } catch (erro) {
                    console.error('Erro ao salvar forma de pagamento:', erro);
                    alert('Falha de comunicação com o servidor.');
                }
            };
        };

        // Etapa 1: Aceitar ou Recusar o orçamento
        if (aguardandoAprovacao) {
            areaAprovacao.style.display = 'block';
            areaAprovacao.innerHTML = `
                <span>Aprovação de Orçamento</span>
                <p style="margin-bottom: 12px; font-size: 0.9rem; color: #d4d4d8;">
                    Composição: <strong>${formatarMoeda(maoDeObraNum)}</strong> (Mão de obra) + 
                    <strong>${formatarMoeda(materiaisNum)}</strong> (Material) + 
                    <strong>${taxaFormatada}</strong> (Taxa de Análise) = 
                    <strong style="color: #f5c542;">${valorFormatado}</strong>. Deseja autorizar o serviço?
                </p>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button type="button" id="btn-aprovar-orcamento" style="flex: 1; background: #22c55e; color: #09090b; border: none; border-radius: 8px; padding: 10px 14px; font-weight: 700; cursor: pointer;">
                        Aceitar Orçamento
                    </button>
                    <button type="button" id="btn-recusar-orcamento" style="flex: 1; background: transparent; color: #ef4444; border: 1px solid #ef4444; border-radius: 8px; padding: 10px 14px; font-weight: 600; cursor: pointer;">
                        Recusar (Pagar só Taxa)
                    </button>
                </div>
            `;

            const responderOrcamento = async (decisao) => {
                const confirmacao = decisao === 'aprovado'
                    ? `Confirmar a aprovação do orçamento no valor de ${valorFormatado}?`
                    : `Deseja recusar o orçamento? O serviço não será executado e será cobrada apenas a Taxa de Análise (${taxaFormatada}).`;

                if (!confirm(confirmacao)) return;

                try {
                    const resOrc = await fetch(`/api/ordens/${numeroOs}/orcamento`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ decisao })
                    });

                    const dadosOrc = await resOrc.json();

                    if (!resOrc.ok) {
                        alert(dadosOrc.mensagem || 'Erro ao registrar decisão.');
                        return;
                    }

                    if (decisao === 'aprovado') {
                        document.getElementById('detalhe-status').textContent = 'ANDAMENTO';
                        exibirEtapaPagamento();
                    } else {
                        alert(dadosOrc.mensagem);
                        modal.classList.remove('aberto');
                        window.location.reload();
                    }
                } catch (erro) {
                    console.error('Erro ao responder orçamento:', erro);
                    alert('Falha de comunicação com o servidor.');
                }
            };

            document.getElementById('btn-aprovar-orcamento').onclick = () => responderOrcamento('aprovado');
            document.getElementById('btn-recusar-orcamento').onclick = () => responderOrcamento('recusado');

        } else if (validacaoAtual === 'aprovado' && !pagamentoSalvo) {
            exibirEtapaPagamento();
        } else if (validacaoAtual === 'aprovado') {
            areaAprovacao.style.display = 'block';
            areaAprovacao.innerHTML = `
                <span>Status do Orçamento</span>
                <p style="color: #22c55e; font-weight: 600;">
                    Orçamento aprovado (${valorFormatado}) — Pagamento: ${pagamentoSalvo}
                </p>
            `;
        } else if (validacaoAtual === 'recusado') {
            areaAprovacao.style.display = 'block';
            areaAprovacao.innerHTML = `
                <span>Status do Orçamento</span>
                <p style="color: #ef4444; font-weight: 600;">Orçamento recusado — Cobrada apenas a Taxa de Análise (${taxaFormatada})</p>
            `;
        } else {
            areaAprovacao.style.display = 'none';
        }

        modal.classList.add('aberto');
    }
});