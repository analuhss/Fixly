const formulario = document.getElementById('form-login');

formulario.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();

    try {
        const resposta = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            alert('Login realizado com sucesso!');

            if (dados.tipo === 'cliente') {
                window.location.href = '/home-c';
            } else if (dados.tipo === 'profissional') {
                window.location.href = '/home-p';
            } else if (dados.tipo === 'adm') {
                window.location.href = '/home-adm';
            } else {
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

(function () {
    const btnOlho = document.getElementById('btn-olho-login');
    const inputSenha = document.getElementById('senha');
    if (!btnOlho || !inputSenha) return;

    const olhoAberto = '<svg width="20" height="20" viewBox="0 0 24 24" style="pointer-events:none;fill:none!important;stroke:#52525b!important;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    const olhoFechado = '<svg width="20" height="20" viewBox="0 0 24 24" style="pointer-events:none;fill:none!important;stroke:#52525b!important;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

    btnOlho.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const mostrando = inputSenha.type === 'text';
        inputSenha.type = mostrando ? 'password' : 'text';
        btnOlho.innerHTML = mostrando ? olhoAberto : olhoFechado;
    });
})();

if (dados.tipo === 'cliente') redirecionarComAlerta('Login realizado com sucesso!', '/home-c', 'sucesso');