document.addEventListener('DOMContentLoaded', async () => {
    const formOS = document.getElementById('formOs-c');

    // Se não estiver na página do formulário de Solicitar OS, encerra aqui
    if (!formOS) return;

    // 1. PREENCHER DADOS DO CLIENTE AUTOMATICAMENTE
    const inputNome = document.getElementById('nomeCliente');         // Ajuste o ID se no os-c.html for diferente (ex: 'nome-cliente')
    const inputTelefone = document.getElementById('telefone'); // Ajuste o ID se no os-c.html for diferente (ex: 'celular')
    const inputEmail = document.getElementById('email');       // Ajuste o ID se no os-c.html for diferente

    try {
        const resPerfil = await fetch('/api/perfil', { credentials: 'include' });

        if (resPerfil.ok) {
            const dadosCliente = await resPerfil.json();

            if (inputNome && dadosCliente.nome) {
                inputNome.value = dadosCliente.nome;
            }
            if (inputTelefone && dadosCliente.telefone) {
                inputTelefone.value = dadosCliente.telefone;
            }
            if (inputEmail && dadosCliente.email) {
                inputEmail.value = dadosCliente.email;
            }
        }
    } catch (erro) {
        console.error('Erro ao carregar dados do cliente na OS:', erro);
    }

    // 2. ENVIAR FORMULÁRIO DE NOVA ORDEM DE SERVIÇO
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
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    nome: nome,
                    telefone: telefone,
                    email: email,
                    modelo: modelo,
                    marca: marca,
                    perifericos: perifericos,
                    descricao: descricao
                })
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                alert('Chamado aberto com sucesso! Nº: ' + dados.idChamado);
                formOS.reset();
                window.location.href = '/ordensC';
            } else {
                alert('Erro: ' + (dados.message || dados.mensagem));
            }
        } catch (erro) {
            console.error('Erro na requisição:', erro);
            alert('Falha na comunicação com o servidor.');
        }
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    const lista = document.getElementById('lista');
    const modelo = document.getElementById('modeloCartao');

    // Se não estiver na tela de listagem, não faz nada
    if (!lista || !modelo) return;

    try {
        // 1. Pede as ordens do cliente ao servidor
        const resposta = await fetch('/api/ordens/cliente', { credentials: 'include' });
        const ordens = await resposta.json();

        lista.innerHTML = ''; // Limpa a área

        // 2. Para cada ordem, cria um cartão usando o seu <template>
        ordens.forEach((os) => {
            const cartao = modelo.content.cloneNode(true);

            // Preenche os textos dentro do cartão
            cartao.querySelector('.numero').textContent = `OS# ${os.id}`;
            cartao.querySelector('.nome').textContent = os.tecnico || 'Aguardando técnico';
            cartao.querySelector('.selo-texto').textContent = 'EM ANÁLISE';
            cartao.querySelector('.reais').textContent = os.valor ? `R$ ${os.valor}` : 'A definir';

            // Coloca o cartão pronto na tela
            lista.appendChild(cartao);
        });

    } catch (erro) {
        console.error('Erro ao mostrar ordens:', erro);
    }
});