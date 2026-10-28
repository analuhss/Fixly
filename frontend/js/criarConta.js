const formulario = document.getElementById('cadastro')

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault(); // Impede a página de recarregar sozinha

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
      
        const resposta = await fetch('/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {

            localStorage.setItem('idClienteLogado', dados.id);

            alert('Conta criada com sucesso! Vamos finalizar o seu perfil.');

            // 3. LINHA QUE FAZ O REDIRECIONAMENTO COMPULSÓRIO PARA A TELA DE INFORMAÇÕES
            window.location.href = '/cadastro'; 
        } else {
            alert(dados.mensagem || 'Erro ao criar conta.');
        }

    } catch (erro) {
        console.error('Erro ao conectar com o servidor:', erro);
        alert('Não foi possível conectar ao servidor.');
    }
});
