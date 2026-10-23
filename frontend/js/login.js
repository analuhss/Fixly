const formulario = document.getElementById('form-login');

formulario.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const resposta = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            } ,
            body: JSON.stringify({ email, senha})
        });

        const dados = await resposta.json()

        if (resposta.ok) {
            alert('Login realizado com sucesso!')

            // ==============================================
            //      REDIRECINAMENTO - TIPO DE ACESSO
            // ==============================================

            if (dados.tipo === 'cliente') {
                
                window.location.href = '/cliente/home-c'

            } else if (dados.tipo === 'profissional') {
                
                window.location.href = '/profissionais/home'

            } else if (dados.tipo === 'adm') {

                window.location.href = '/adm/home-adm'

            } else {

                alert(dados.message) // Exibe a mensagem de senha incorreta
            }
        }
    }   catch (erro) {
        console.error('Erro ao tentar fazer login:', erro);
        alert('Não foi possível conectar ao sevidor')
    }
})
