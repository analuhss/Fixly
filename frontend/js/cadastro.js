document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('cadastro');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault(); // Impede o recarregamento automático da página

        const idCliente = localStorage.getItem('idClienteLogado');

        if (!idCliente) {
            alert('Sessão expirada ou usuário não identificado. Faça login novamente.');
            window.location.href = '/'; // Se não achar o ID, joga para a tela inicial
            return;
        }

        // ========================================================
        //         CAPTURAR OS TEXTOS DIGITADOS NA TELA
        // ========================================================
        // Certifique-se de que os IDs ('nome', 'cpf', etc.) combinam exatamente com o seu HTML
        const nome = document.getElementById('nome').value;
        const cpf = document.getElementById('cpf').value;
        const dataNascimento = document.getElementById('nascimento').value;
        const cep = document.getElementById('cep').value;
        const endereco = document.getElementById('endereco').value;
        const telefone = document.getElementById('telefone').value;

        // Validação básica para impedir o envio de campos em branco
        if (!nome || !dataNascimento || !cpf || !cep || !endereco || !telefone) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        try {
            // Envia o pacote completo de dados para a rota do servidor
            const resposta = await fetch('/api/usuarios/finalizar-cadastro', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idCliente: idCliente,
                    nome: nome,
                    dataNascimento : dataNascimento,
                    cpf: cpf,
                    cep: cep,
                    endereco: endereco,
                    telefone: telefone
                })
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                alert('Cadastro finalizado com sucesso!');
                window.location.href = '/home-c'; // Envia para a página inicial logada
            } else {
                alert(resultado.mensagem || 'Erro ao salvar informações.');
            }

        } catch (erro) {
            console.error('Erro na requisição:', erro);
            alert('Não foi possível conectar ao servidor.');
        }
    });
});
