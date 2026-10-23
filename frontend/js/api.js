// Seleciona o formulário de cadastro
const formulario = document.getElementById('cadastro');

formulario.addEventListener('submit', async (event) => {
    event.preventDefault(); // Impede a página de recarregar

    // Pega os valores digitados nos inputs
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        // Envia os dados para a rota do backend usando o método POST
        const resposta = await fetch('/api/usuarios', {
            method: 'POST',
            // Avisa o servidor qual é  o formato das informações que você está enviando

            headers: {'Content-Type': 'application/json'
            
            },

            body: JSON.stringify({ email, senha }) // Transforma os dados em texto


        });

        if (resposta.ok) {
            alert('Conta criada com sucesso!');
            window.location.href = '/home-c'; // Serve para ir até a página inicial de cliente.

            //Isso pois, o cadastro de profissionais só pode ser feito pelo gerente.

        } else {
            alert('Erro ao criar conta!');
        }
    } catch (erro) {
        console.error('Erro na requisição:', erro);
        alert('Não foi possível conectar ao servidor')
    }
})