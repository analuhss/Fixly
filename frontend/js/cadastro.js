document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('cadastro');

    if (!formulario) return;

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        // Captura das variáveis individuais dos inputs
        const nome = document.getElementById('nome').value;
        const cpf = document.getElementById('cpf').value;
        const dataNascimento = document.getElementById('nascimento').value;
        const cep = document.getElementById('cep').value;
        const endereco = document.getElementById('endereco').value;
        const telefone = document.getElementById('telefone').value;

        if (!nome || !dataNascimento || !cpf || !cep || !endereco || !telefone) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        try {
            const resposta = await fetch('/api/usuarios/finalizar-cadastro', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // <--- Garante o envio do cookie de sessão
                body: JSON.stringify({
                    nome,
                    dataNascimento,
                    cpf,
                    cep,
                    endereco,
                    telefone
                })
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                alert('Cadastro finalizado com sucesso!');
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