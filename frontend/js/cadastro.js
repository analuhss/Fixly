// Aguarda a página carregar completamente
document.addEventListener('DOMContentLoaded', () => {
  
    const formulario = document.getElementById('cadastro');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault(); // Impede a página de recarregar sozinha

        // 1. Captura o ID do cliente que guardamos no localStorage durante o login
        const idCliente = localStorage.getItem('idClienteLogado');

        if (!idCliente) {
            alert('Sessão expirada ou usuário não identificado. Faça login novamente.');
            window.location.href = '/'; // Manda de volta para o início caso não tenha ID
            return;
        }

       
        const nome = document.getElementById('nome').value;
        const cpf = document.getElementById('cpf').value;
        const dataNascimento = document.getElementById('nascimento').value;
        const cep = document.getElementById('cep').value;
        const endereco = document.getElementById('endereco').value;
        const telefone = document.getElementById('telefone').value;

        // Validação simples antes de enviar
        if (!nome || !dataNascimento || !cpf || !) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        try {
            // 3. Linha de código que envia os dados para a API do Servidor
            const resposta = await fetch('/api/usuarios/finalizar-cadastro', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idCliente: idCliente,
                    nome: nome,
                    data_nascimento: data_nascimento
                })
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                alert('Cadastro finalizado com sucesso!');
                
                // 4. Redireciona o usuário para a tela inicial dele (Home do Cliente)
                window.location.href = '/home-c';
            } else {
                alert(resultado.mensagem || 'Erro ao salvar informações.');
            }

        } catch (erro) {
            console.error('Erro na requisição:', erro);
            alert('Não foi possível conectar ao servidor.');
        }
    });
});
