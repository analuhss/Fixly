const formulario = document.getElementById('form-login');

formulario.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const resposta = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // <--- ADICIONADO: Obrigatório para manter a sessão
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            alert('Login realizado com sucesso!');

            // REDIRECIONAMENTO - TIPO DE ACESSO
            if (dados.tipo === 'cliente') {
                window.location.href = '/home-c';
            } else if (dados.tipo === 'profissional') {
                window.location.href = '/profissionais/home';
            } else if (dados.tipo === 'adm') {
                window.location.href = '/adm/home-adm';
            } else {
                // Se cair aqui, significa que 'dados.tipo' veio undefined ou diferente das opções
                alert('Tipo de usuário desconhecido: ' + dados.tipo); 
            }
        } else {
            alert(dados.mensagem || dados.message || 'E-mail ou senha incorretos');
        }
    } catch (erro) {
        console.error('Erro ao tentar fazer login:', erro);
        alert('Não foi possível conectar ao servidor');
    }
});