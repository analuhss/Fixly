document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Busca TODAS as ordens no servidor
        const resposta = await fetch('/api/ordens/admin', { credentials: 'include' });
        
        if (!resposta.ok) {
            throw new Error('Falha na comunicação com o servidor. Status: ' + resposta.status);
        }

        // Recebe a resposta bruta do servidor
        const ordensBrutas = await resposta.json();
        
        // Imprime na consola o que o servidor enviou de facto (MUITO IMPORTANTE PARA O DIAGNÓSTICO)
        console.log("O que o servidor respondeu:", ordensBrutas);

        // Se a API enviou o array dentro de uma propriedade (ex: { ordens: [...] }), extraímos o array
        const ordens = Array.isArray(ordensBrutas) ? ordensBrutas : (ordensBrutas.ordens || ordensBrutas.data || []);

        if (!Array.isArray(ordens)) {
             throw new Error("O servidor não devolveu uma lista válida.");
        }

        // 2. Variáveis para a contabilidade
        let total = ordens.length;
        let rendimentoTotal = 0;
        let countAbertas = 0;
        let countAndamento = 0;
        let countFechadas = 0;
        let countCongeladas = 0;

        // 3. Varre todas as ordens para classificar e somar
        ordens.forEach(os => {
            const status = (os.status || 'analise').toLowerCase();
            const valor = Number(os.valor) || 0;

            // Soma ao rendimento apenas ordens fechadas (ou ajuste conforme a sua regra de negócio)
            if (status === 'fechada') {
                rendimentoTotal += valor;
            }

            // Conta a quantidade por status
            if (status === 'aberta' || status === 'analise') {
                countAbertas++;
            } else if (status === 'andamento') {
                countAndamento++;
            } else if (status === 'fechada') {
                countFechadas++;
            } else if (status === 'congelada') {
                countCongeladas++;
            }
        });

        // 4. Injeta os resultados diretamente no HTML
        document.getElementById('totalOS').textContent = total;
        document.getElementById('nAbertas').textContent = countAbertas;
        document.getElementById('nAndamento').textContent = countAndamento;
        document.getElementById('nFechadas').textContent = countFechadas;
        document.getElementById('nCongeladas').textContent = countCongeladas;
        
        // Formata o dinheiro para Reais (BRL)
        document.getElementById('rendimento').textContent = rendimentoTotal.toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        });

    } catch (erro) {
        console.error('Erro ao carregar dados do dashboard:', erro);
        const aviso = document.getElementById('aviso');
        if (aviso) {
            aviso.textContent = 'Não foi possível carregar os dados do painel.';
            aviso.style.color = '#ef4444'; // Vermelho para erro
        }
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const formatarMoeda = (valor) =>
        Number(valor || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

    try {
        const resposta = await fetch('/api/ordens/admin', {
            credentials: 'include'
        });

        if (!resposta.ok) {
            throw new Error('Falha ao carregar ordens do servidor.');
        }

        const ordens = await resposta.json();

        // ==========================================
        // 1. VISÃO GERAL (KPIs do topo)
        // ==========================================
        const totalOS = ordens.length;

        const nAbertas = ordens.filter((os) =>
            ['aberta', 'analise'].includes((os.status || '').toLowerCase().trim())
        ).length;

        const nAndamento = ordens.filter((os) =>
            (os.status || '').toLowerCase().trim() === 'andamento'
        ).length;

        const nFechadas = ordens.filter((os) =>
            (os.status || '').toLowerCase().trim() === 'fechada'
        ).length;

        const nCongeladas = ordens.filter((os) =>
            (os.status || '').toLowerCase().trim() === 'congelada'
        ).length;

        const rendimentoLiquido = ordens
            .filter((os) => (os.status || '').toLowerCase().trim() === 'fechada')
            .reduce((acc, os) => acc + parseFloat(os.valorfinal || os.valor || 0), 0);

        document.getElementById('totalOS').textContent = totalOS;
        document.getElementById('rendimento').textContent = formatarMoeda(rendimentoLiquido);
        document.getElementById('nAbertas').textContent = nAbertas;
        document.getElementById('nAndamento').textContent = nAndamento;
        document.getElementById('nFechadas').textContent = nFechadas;
        document.getElementById('nCongeladas').textContent = nCongeladas;

        // ==========================================
        // 2. VENDAS (Apenas o valor total aprovado)
        // ==========================================
        const osAprovadas = ordens.filter(
            (os) => (os.validacao_cliente || '').toLowerCase().trim() === 'aprovado'
        );

        const totalVendasAprovadas = osAprovadas.reduce(
            (acc, os) => acc + parseFloat(os.valorfinal || os.valor || 0),
            0
        );

        const legendaMeses = document.getElementById('legendaMeses');
        const graficoVendas = document.getElementById('graficoVendas');

        if (legendaMeses) {
            legendaMeses.innerHTML = `
                <li style="font-size: 1.5rem; font-weight: 700; color: #4ade80; list-style: none;">
                    ${formatarMoeda(totalVendasAprovadas)}
                    <span style="display: block; font-size: 0.85rem; font-weight: 400; color: #aaa;">
                        Total aprovado (${osAprovadas.length} ${osAprovadas.length === 1 ? 'ordem' : 'ordens'})
                    </span>
                </li>
            `;
        }

        // Oculta a área das barras verdes
        if (graficoVendas) {
            graficoVendas.style.display = 'none';
            graficoVendas.innerHTML = '';
        }

        // ==========================================
        // 3. ORÇAMENTOS (Novos, Negados, Aprovados)
        // ==========================================
        const qtdNovos = ordens.filter(
            (os) => (os.validacao_cliente || '').toLowerCase().trim() === 'pendente'
        ).length;

        const qtdNegados = ordens.filter((os) => {
            const val = (os.validacao_cliente || '').toLowerCase().trim();
            const st = (os.status || '').toLowerCase().trim();
            return val === 'recusado' || st === 'cancelada';
        }).length;

        const qtdAprovados = osAprovadas.length;

        document.getElementById('orcNovos').textContent = qtdNovos;
        document.getElementById('orcNegados').textContent = qtdNegados;
        document.getElementById('orcAprovados').textContent = qtdAprovados;

        const notaOrc = document.getElementById('notaOrcamentos');
        if (notaOrc) {
            notaOrc.hidden = qtdNovos + qtdNegados + qtdAprovados > 0;
        }

        // ==========================================
        // 4. PEDIDOS (Pizza + legenda limpa)
        // ==========================================
        const pedidosSemTecnico = ordens.filter((os) => {
            const semId = !os.idTecnico || Number(os.idTecnico) === 0;
            const nomeTec = (os.tecnico || '').toLowerCase().trim();
            const semNome = !nomeTec || nomeTec === 'aguardando técnico' || nomeTec === 'sem técnico';
            const st = (os.status || '').toLowerCase().trim();
            return semId && semNome && st !== 'fechada' && st !== 'cancelada';
        });

        const qtdSemTecnico = pedidosSemTecnico.length;
        const qtdComTecnico = Math.max(totalOS - qtdSemTecnico, 0);
        const pctSemTecnico = totalOS > 0 ? Math.round((qtdSemTecnico / totalOS) * 100) : 0;

        const graficoPedidos = document.getElementById('graficoPedidos');
        const legendaPedidos = document.getElementById('legendaPedidos');

        if (graficoPedidos) {
            graficoPedidos.style.width = '110px';
            graficoPedidos.style.height = '110px';
            graficoPedidos.style.borderRadius = '50%';
            graficoPedidos.style.flexShrink = '0';
            graficoPedidos.style.background =
                totalOS === 0
                    ? '#333'
                    : `conic-gradient(#f5c518 0% ${pctSemTecnico}%, #3b82f6 ${pctSemTecnico}% 100%)`;
        }

        if (legendaPedidos) {
            legendaPedidos.innerHTML = `
                <li style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem;">
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: #f5c518; display: inline-block;"></span>
                    Esperando técnico: <strong>${qtdSemTecnico}</strong>
                </li>
                <li style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; margin-top: 6px;">
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: #3b82f6; display: inline-block;"></span>
                    Com técnico: <strong>${qtdComTecnico}</strong>
                </li>
            `;
        }
    } catch (erro) {
        console.error('Erro ao carregar dashboard:', erro);
        const aviso = document.getElementById('aviso');
        if (aviso) {
            aviso.textContent = 'Não foi possível carregar os dados do dashboard.';
        }
    }
});