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
            window.location.href = '/'; // Ajuste para a sua rota de login se necessário
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

const modalSenha = document.getElementById('modal-senha'); // ID do container do modal
    const btnConfirmarSenha = document.getElementById('btn-confirmar-senha'); // ID do botão amarelo "Confirmar"
    const btnCancelarSenha = document.getElementById('btn-cancelar-senha'); // ID do botão "Cancelar"
    const inputSenhaAtual = document.getElementById('senha-atual'); // ID do input "Senha Atual"
    const inputNovaSenha = document.getElementById('nova-senha'); // ID do input "Nova Senha"

    if (btnCancelarSenha && modalSenha) {
        btnCancelarSenha.addEventListener('click', () => {
            modalSenha.style.display = 'none';
            if (inputSenhaAtual) inputSenhaAtual.value = '';
            if (inputNovaSenha) inputNovaSenha.value = '';
        });
    }

    if (btnConfirmarSenha) {
        btnConfirmarSenha.addEventListener('click', async (e) => {
            e.preventDefault(); // Evita recarregar a página caso esteja dentro de um <form>

            const senhaAtual = inputSenhaAtual ? inputSenhaAtual.value : '';
            const novaSenha = inputNovaSenha ? inputNovaSenha.value : '';

            if (!senhaAtual || !novaSenha) {
                alert('Por favor, preencha os dois campos de senha.');
                return;
            }

            try {
                const res = await fetch('/api/perfil/senha', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ senhaAtual, novaSenha })
                });

                const dados = await res.json();

                if (res.ok) {
                    alert(dados.mensagem || 'Senha alterada com sucesso!');
                    if (inputSenhaAtual) inputSenhaAtual.value = '';
                    if (inputNovaSenha) inputNovaSenha.value = '';
                    if (modalSenha) modalSenha.style.display = 'none';
                } else {
                    alert('Erro: ' + (dados.mensagem || 'Não foi possível alterar a senha.'));
                }
            } catch (erro) {
                console.error('Erro ao alterar senha:', erro);
                alert('Falha na comunicação com o servidor.');
            }
        });
    }

const btnRemoverFoto = document.getElementById('btn-remover-foto');
    const avatarSvgPadrao = document.getElementById('avatar-svg-padrao'); // Se você tiver um SVG padrão no centro do perfil

    // Mostra o botão de remover se já existir foto ao carregar a página
    // (Coloque isso dentro do bloco que carrega os dados do GET /api/perfil)
    if (dados.foto && previewFoto) {
        previewFoto.src = dados.foto;
        previewFoto.style.display = 'block';
        if (btnRemoverFoto) btnRemoverFoto.style.display = 'inline-block';
    }

    // Também mostra o botão assim que o usuário escolhe uma nova foto no inputFile
    // (Dentro do reader.onload)
    if (btnRemoverFoto) btnRemoverFoto.style.display = 'inline-block';

    // Ação de clicar em "Remover foto"
    if (btnRemoverFoto) {
        btnRemoverFoto.addEventListener('click', async () => {
            if (!confirm('Deseja realmente remover sua foto de perfil?')) return;

            try {
                const res = await fetch('/api/perfil/foto', {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (res.ok) {
                    fotoBase64 = null;
                    if (inputFoto) inputFoto.value = '';
                    
                    if (previewFoto) {
                        previewFoto.src = '';
                        previewFoto.style.display = 'none';
                    }
                    if (avatarSvgPadrao) {
                        avatarSvgPadrao.style.display = 'block';
                    }
                    
                    btnRemoverFoto.style.display = 'none';

                    // Atualiza a bolinha do cabeçalho para voltar ao ícone padrão
                    if (typeof carregarFotoCabecalho === 'function') {
                        carregarFotoCabecalho();
                    }

                    alert('Foto removida com sucesso!');
                } else {
                    alert('Erro ao remover a foto.');
                }
            } catch (erro) {
                console.error('Erro ao excluir foto:', erro);
                alert('Falha na comunicação com o servidor.');
            }
        });
    }

// 5. EXCLUIR CONTA
    const btnExcluirConta = document.getElementById('btn-excluir-conta'); // Verifique se este é o ID no seu HTML

    if (btnExcluirConta) {
        btnExcluirConta.addEventListener('click', async (e) => {
            e.preventDefault();

            const confirmacao = confirm('Tem certeza absoluta que deseja excluir sua conta? Essa ação não pode ser desfeita.');
            if (!confirmacao) return;

            try {
                const res = await fetch('/api/perfil', {
                    method: 'DELETE',
                    credentials: 'include'
                });

                const dados = await res.json();

                if (res.ok) {
                    alert(dados.mensagem || 'Sua conta foi excluída.');
                    window.location.href = '/'; // Redireciona para a tela inicial ou de login
                } else {
                    alert('Erro: ' + (dados.mensagem || 'Não foi possível excluir a conta.'));
                }
            } catch (erro) {
                console.error('Erro na requisição de exclusão:', erro);
                alert('Falha na comunicação com o servidor.');
            }
        });
    }