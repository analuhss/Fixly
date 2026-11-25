
// No topo do arquivo JS do formulário de cadastro do admin:
if (!window.__cadastroAdminInicializado) {
    window.__cadastroAdminInicializado = true;

    const form = document.getElementById('formCadastro'); // ajuste para o ID do seu <form>
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btnSubmit = form.querySelector('button[type="submit"]');
            if (btnSubmit && btnSubmit.disabled) return; // Impede clique duplo

            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.textContent = 'Salvando...';
            }

            try {
                // ... seu código atual do fetch('/api/usuarios/admin', { method: 'POST', ... }) ...
            } finally {
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = 'Cadastrar';
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formUsuario');
    const radiosTipo = document.querySelectorAll('input[name="tipo"]');
    const blocoProfissional = document.getElementById('blocoProfissional');
    const selectFuncao = document.getElementById('funcao');
    const inputEspecialidades = document.getElementById('especialidades');
    const mensagem = document.getElementById('mensagem');
    const botaoCadastrar = document.getElementById('botaoCadastrar');

    // =========================================================
    // 1. MOSTRAR / ESCONDER BLOCO PROFISSIONAL
    // =========================================================
    function atualizarVisibilidadeProfissional() {
        const selecionado = document.querySelector('input[name="tipo"]:checked');
        const ehProfissional = selecionado && selecionado.value === 'profissional';

        blocoProfissional.hidden = !ehProfissional;
        selectFuncao.required = ehProfissional;

        if (!ehProfissional) {
            selectFuncao.value = '';
            inputEspecialidades.value = '';
        }
    }

    radiosTipo.forEach((radio) => {
        radio.addEventListener('change', atualizarVisibilidadeProfissional);
    });

    atualizarVisibilidadeProfissional();

    // =========================================================
    // 2. MÁSCARAS DE FORMATAÇÃO
    // =========================================================
    const inputCpf = document.getElementById('cpf');
    const inputTelefone = document.getElementById('telefone');
    const inputCep = document.getElementById('cep');

    inputCpf.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 11);
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = v;
    });

    inputTelefone.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 10) {
            v = v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else {
            v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        }
        e.target.value = v.replace(/-$/, '');
    });

    inputCep.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 8);
        v = v.replace(/^(\d{5})(\d)/, '$1-$2');
        e.target.value = v;
    });

    // =========================================================
    // 3. VALIDAÇÃO DE SENHA E ENVIO PARA O BANCO
    // =========================================================
    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;

        if (senha !== confirmarSenha) {
            mensagem.textContent = 'As senhas não coincidem. Verifique e tente novamente.';
            mensagem.style.color = '#ef4444';
            return;
        }

        const tipoSelecionado = document.querySelector('input[name="tipo"]:checked').value;
        const ehProfissional = tipoSelecionado === 'profissional';

        const dadosUsuario = {
            tipo: tipoSelecionado,
            nome: document.getElementById('nome').value.trim(),
            cpf: inputCpf.value.trim(),
            nascimento: document.getElementById('nascimento').value || null,
            telefone: inputTelefone.value.trim(),
            email: document.getElementById('email').value.trim(),
            senha: senha,
            cep: inputCep.value.trim() || null,
            endereco: document.getElementById('endereco').value.trim() || null,
            funcao: ehProfissional ? selectFuncao.value : null,
            especialidades: ehProfissional ? (inputEspecialidades.value.trim() || null) : null
        };

        botaoCadastrar.disabled = true;
        mensagem.textContent = 'Cadastrando usuário...';
        mensagem.style.color = '#a1a1aa';

        try {
            const resposta = await fetch('/api/usuarios/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(dadosUsuario)
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(resultado.mensagem || 'Erro ao cadastrar usuário.');
            }

            mensagem.textContent = resultado.mensagem || 'Usuário cadastrado com sucesso!';
            mensagem.style.color = '#22c55e';

            form.reset();
            atualizarVisibilidadeProfissional();

        } catch (erro) {
            console.error('Erro no cadastro:', erro);
            mensagem.textContent = erro.message;
            mensagem.style.color = '#ef4444';
        } finally {
            botaoCadastrar.disabled = false;
        }
    });
});
