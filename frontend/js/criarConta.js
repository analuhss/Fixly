const formulario = document.getElementById('cadastro');
const inputSenha = document.getElementById('senha');

function checarRequisitosSenha(senha) {
    const regras = {
        'req-tamanho': senha.length >= 8,
        'req-maiuscula': /[A-Z]/.test(senha),
        'req-minuscula': /[a-z]/.test(senha),
        'req-numero': /\d/.test(senha),
        'req-especial': /[\W_]/.test(senha)
    };

    let todasValidas = true;

    for (const [id, ok] of Object.entries(regras)) {
        const el = document.getElementById(id);
        if (el) {
            el.style.color = ok ? '#22c55e' : '#a1a1aa';
            el.textContent = (ok ? '✓ ' : '• ') + el.textContent.replace(/^[✓•]\s*/, '');
        }
        if (!ok) todasValidas = false;
    }

    return todasValidas;
}

if (inputSenha) {
    inputSenha.addEventListener('input', () => {
        checarRequisitosSenha(inputSenha.value);
    });
}

// Suporte opcional ao botão de olhinho no cadastro (id="btn-olho-cadastro")
(function () {
    const btnOlho = document.getElementById('btn-olho-cadastro');
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

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault(); // Impede a página de recarregar sozinha

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    if (!checarRequisitosSenha(senha)) {
        alert('A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.');
        if (inputSenha) inputSenha.focus();
        return;
    }

    try {
        const resposta = await fetch('/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            localStorage.setItem('idClienteLogado', dados.id);

            alert('Conta criada com sucesso! Vamos finalizar o seu perfil.');

            // Redirecionamento compulsório para a tela de informações
            window.location.href = '/cadastro';
        } else {
            alert(dados.mensagem || 'Erro ao criar conta.');
        }

    } catch (erro) {
        console.error('Erro ao conectar com o servidor:', erro);
        alert('Não foi possível conectar ao servidor.');
    }
});