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