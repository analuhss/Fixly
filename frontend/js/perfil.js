document.addEventListener('DOMContentLoaded', async () => {
    const formPerfil = document.getElementById('perfil-form');
    const btnSalvar = document.getElementById('salvar');
    const inputFoto = document.getElementById('input-foto');
    const avatarImg = document.getElementById('avatar-img');
    const avatarSvg = document.getElementById('avatar-svg');
    const identityName = document.querySelector('.identity__name');

    let fotoBase64 = null;

    // 1. CARREGAR DADOS AO ABRIR A PÁGINA
    try {
        const res = await fetch('/api/perfil', { credentials: 'include' });
        if (res.status === 401) {
            window.location.href = '/login'; // Ajuste para a sua rota de login se necessário
            return;
        }
        const dados = await res.json();

        document.getElementById('nome').value = dados.nome || '';
        document.getElementById('cpf').value = dados.cpf || '';
        document.getElementById('email').value = dados.email || '';
        identityName.textContent = dados.nome || 'Administrador';

        if (dados.foto) {
            avatarImg.src = dados.foto;
            avatarImg.style.display = 'block';
            avatarSvg.style.display = 'none';
        }
    } catch (erro) {
        console.error('Erro ao carregar perfil:', erro);
    }

    // 2. DESBLOQUEAR CAMPOS AO CLICAR NO ÍCONE DE LÁPIS
    document.querySelectorAll('.input__edit').forEach(botao => {
        botao.addEventListener('click', () => {
            const input = document.getElementById(botao.dataset.target);
            input.removeAttribute('readonly');
            input.focus();
            btnSalvar.disabled = false;
        });
    });

    // 3. SELECIONAR E PRÉ-VISUALIZAR NOVA FOTO
    document.getElementById('btn-alterar-foto').addEventListener('click', () => {
        inputFoto.click();
    });

    inputFoto.addEventListener('change', (e) => {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        const leitor = new FileReader();
        leitor.onload = (evento) => {
            fotoBase64 = evento.target.result;
            avatarImg.src = fotoBase64;
            avatarImg.style.display = 'block';
            avatarSvg.style.display = 'none';
            btnSalvar.disabled = false;
        };
        leitor.readAsDataURL(arquivo);
    });

    // 4. SALVAR ALTERAÇÕES (DADOS + FOTO)
    formPerfil.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome').value.trim();
        const cpf = document.getElementById('cpf').value.trim();
        const email = document.getElementById('email').value.trim();

        const res = await fetch('/api/perfil', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ nome, cpf, email, foto: fotoBase64 })
        });

        const resultado = await res.json();
        alert(resultado.mensagem);

        if (res.ok) {
            identityName.textContent = nome || 'Usuário';
            document.querySelectorAll('.input input').forEach(inp => inp.setAttribute('readonly', true));
            btnSalvar.disabled = true;
            fotoBase64 = null; // Limpa o buffer após salvar
        }
    });

    // 5. MODAL DE ALTERAR SENHA
    const modalSenha = document.getElementById('modal-senha');
    document.getElementById('btn-abrir-senha').addEventListener('click', () => modalSenha.showModal());
    document.getElementById('btn-fechar-modal').addEventListener('click', () => modalSenha.close());

    document.getElementById('form-senha').addEventListener('submit', async (e) => {
        e.preventDefault();
        const senhaAtual = document.getElementById('senha-atual').value;
        const novaSenha = document.getElementById('nova-senha').value;

        const res = await fetch('/api/perfil/senha', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ senhaAtual, novaSenha })
        });

        const resultado = await res.json();
        alert(resultado.mensagem);

        if (res.ok) {
            modalSenha.close();
            e.target.reset();
        }
    });

    // 6. EXCLUIR CONTA
    document.getElementById('btn-excluir').addEventListener('click', async () => {
        if (!confirm('Tem certeza que deseja excluir sua conta permanentemente? Esta ação não pode ser desfeita.')) {
            return;
        }

        const res = await fetch('/api/perfil', {
            method: 'DELETE',
            credentials: 'include'
        });

        const resultado = await res.json();
        alert(resultado.mensagem);

        if (res.ok) {
            window.location.href = '/';
        }
    });

    // 7. SAIR DA SESSÃO
    document.getElementById('btn-sair').addEventListener('click', async () => {
        const res = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (res.ok) {
            window.location.href = '/';
        }
    });
});