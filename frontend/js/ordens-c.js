const formOS = document.getElementById('formOs-c'); 

formOS.addEventListener('submit', async (event) => {
    event.preventDefault();

   
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
            
            // Junta as variáveis apenas no momento de enviar para o servidor

            credentials: 'include',
            body: JSON.stringify({
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
            // Redirecionar para a tela de ordens do cliente:
            window.location.href = '/ordens-c'; 
        } else {
            alert('Erro: ' + dados.message);
        }
    } catch (erro) {
        console.error('Erro na requisição:', erro);
        alert('Falha na comunicação com o servidor.');
    }
});