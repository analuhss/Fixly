document.addEventListener('DOMContentLoaded', async () => {
    const formPerfil = document.getElementById('perfil-form');
    const btnSalvar = document.getElementById('salvar');
    const inputFoto = document.getElementById('input-foto');
    const avatarImg = document.getElementById('avatar-img');
    const avatarSvg = document.getElementById('avatar-svg');
    const identityName = document.querySelector('.identity__name');
    const btnAlterarFoto = document.getElementById('btn-alterar-foto');
    const btnRemoverSolto = document.getElementById('btn-remover-foto');

    let fotoBase64 = null;

    // Esconde botão solto de "Remover foto" da página (a ação agora fica dentro do modal)
    if (btnRemoverSolto) btnRemoverSolto.style.display = 'none';
    document.querySelectorAll('button').forEach((btn) => {
        if (btn.textContent.trim().toLowerCase() === 'remover foto' && !btn.closest('#modal-foto-perfil')) {
            btn.style.display = 'none';
        }
    });

    // =========================================================
    // 1. CARREGAR DADOS DO PERFIL AO ABRIR A PÁGINA
    // =========================================================
    try {
        const res = await fetch('/api/perfil', { credentials: 'include' });
        if (res.status === 401) {
            window.location.href = '/';
            return;
        }

        if (res.ok) {
            const dados = await res.json();

            if (document.getElementById('nome')) document.getElementById('nome').value = dados.nome || '';
            if (document.getElementById('cpf')) document.getElementById('cpf').value = dados.cpf || '';
            if (document.getElementById('email')) document.getElementById('email').value = dados.email || '';
            if (identityName) identityName.textContent = dados.nome || 'Usuário';

            if (dados.foto && avatarImg) {
                avatarImg.src = dados.foto;
                avatarImg.style.display = 'block';
                if (avatarSvg) avatarSvg.style.display = 'none';
            }
        }
    } catch (erro) {
        console.error('Erro ao carregar perfil:', erro);
    }

    // =========================================================
    // 2. DESBLOQUEAR CAMPOS AO CLICAR NO ÍCONE DE LÁPIS
    // =========================================================
    document.querySelectorAll('.input__edit').forEach((botao) => {
        botao.addEventListener('click', () => {
            const input = document.getElementById(botao.dataset.target);
            if (!input) return;
            input.removeAttribute('readonly');
            input.focus();
            if (btnSalvar) btnSalvar.disabled = false;
        });
    });

  // =========================================================
    // 3. MODAL DE FOTO DE PERFIL (INSERIR FOTO / REMOVER FOTO)
    // =========================================================
    if (!document.getElementById('estilo-modal-foto')) {
        const style = document.createElement('style');
        style.id = 'estilo-modal-foto';
        style.innerHTML = `
            .modal-foto-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.78); display: none; align-items: center; justify-content: center; padding: 20px; z-index: 99999; }
            .modal-foto-overlay.aberto { display: flex; }
            .modal-foto-box { background: #1a1a1d; border: 1px solid #333338; border-top: 5px solid #f5c542; border-radius: 16px; width: 100%; max-width: 360px; padding: 24px; color: #ffffff; text-align: center; box-shadow: 0 15px 40px rgba(0, 0, 0, 0.65); }
            .modal-foto-topo { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
            .modal-foto-topo h3 { margin: 0; font-size: 1.15rem; color: #f5c542; }
            .modal-foto-fechar { background: transparent; border: none; color: #a1a1aa; font-size: 1.5rem; cursor: pointer; line-height: 1; }
            .modal-foto-fechar:hover { color: #ffffff; }
            .modal-foto-acoes { display: flex; flex-direction: column; gap: 12px; }
            .btn-foto-inserir { width: 100%; background: #f5c542; color: #1a1a1d; border: none; border-radius: 10px; padding: 12px; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: 0.2s; }
            .btn-foto-inserir:hover { filter: brightness(1.08); }
            .btn-foto-remover { width: 100%; background: transparent; color: #ef4444; border: 1px solid #ef4444; border-radius: 10px; padding: 11px; font-weight: 600; font-size: 0.92rem; cursor: pointer; transition: 0.2s; }
            .btn-foto-remover:hover { background: #ef4444; color: #ffffff; }
        `;
        document.head.appendChild(style);
    }

    // Cria um input file exclusivo fora de qualquer form para não sofrer bloqueio
    let inputFileExclusivo = document.getElementById('input-foto-exclusivo');
    if (!inputFileExclusivo) {
        inputFileExclusivo = document.createElement('input');
        inputFileExclusivo.type = 'file';
        inputFileExclusivo.id = 'input-foto-exclusivo';
        inputFileExclusivo.accept = 'image/png, image/jpeg, image/webp, image/*';
        inputFileExclusivo.style.cssText = 'position:fixed; top:-9999px; left:-9999px; opacity:0;';
        document.body.appendChild(inputFileExclusivo);
    }

    let modalFoto = document.getElementById('modal-foto-perfil');
    if (!modalFoto) {
        modalFoto = document.createElement('div');
        modalFoto.id = 'modal-foto-perfil';
        modalFoto.className = 'modal-foto-overlay';
        modalFoto.innerHTML = `
            <div class="modal-foto-box">
                <div class="modal-foto-topo">
                    <h3>Foto de Perfil</h3>
                    <button type="button" class="modal-foto-fechar" id="fechar-modal-foto" aria-label="Fechar">&times;</button>
                </div>
                <div class="modal-foto-acoes">
                    <button type="button" class="btn-foto-inserir" id="btn-modal-inserir-foto">Inserir foto</button>
                    <button type="button" class="btn-foto-remover" id="btn-modal-remover-foto">Remover foto</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalFoto);

        document.getElementById('fechar-modal-foto').addEventListener('click', (e) => {
            e.stopPropagation();
            modalFoto.classList.remove('aberto');
        });
        modalFoto.addEventListener('click', (e) => {
            if (e.target === modalFoto) modalFoto.classList.remove('aberto');
        });
    }

    // Abre o modal ao clicar na foto, no avatar ou no botão da câmera
    const alvosCliqueFoto = [
        btnAlterarFoto,
        avatarImg,
        avatarSvg,
        avatarImg?.parentElement
    ].filter(Boolean);

    alvosCliqueFoto.forEach((el) => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            modalFoto.classList.add('aberto');
        });
    });

    // Opção 1: Inserir foto (abre o seletor primeiro e fecha o modal em seguida)
    document.getElementById('btn-modal-inserir-foto').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        inputFileExclusivo.value = '';
        inputFileExclusivo.click();
        setTimeout(() => modalFoto.classList.remove('aberto'), 150);
    });

    // Opção 2: Remover foto
    document.getElementById('btn-modal-remover-foto').addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        modalFoto.classList.remove('aberto');

        if (!confirm('Deseja realmente remover sua foto de perfil?')) return;

        try {
            const res = await fetch('/api/perfil/foto', {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                fotoBase64 = null;
                inputFileExclusivo.value = '';
                if (avatarImg) {
                    avatarImg.src = '';
                    avatarImg.style.display = 'none';
                }
                if (avatarSvg) avatarSvg.style.display = 'block';
                if (typeof carregarFotoCabecalho === 'function') carregarFotoCabecalho();
                alert('Foto removida com sucesso!');
            } else {
                fotoBase64 = '';
                if (avatarImg) {
                    avatarImg.src = '';
                    avatarImg.style.display = 'none';
                }
                if (avatarSvg) avatarSvg.style.display = 'block';
                if (btnSalvar) btnSalvar.disabled = false;
            }
        } catch (erro) {
            console.error('Erro ao remover foto:', erro);
        }
    });

    // Comprime a imagem assim que o usuário seleciona o arquivo
    inputFileExclusivo.addEventListener('change', (e) => {
        const arquivo = e.target.files?.[0];
        if (!arquivo) return;

        const leitor = new FileReader();
        leitor.onload = (evento) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxLado = 360;
                let largura = img.width;
                let altura = img.height;

                if (largura > altura && largura > maxLado) {
                    altura = Math.round((altura * maxLado) / largura);
                    largura = maxLado;
                } else if (altura > maxLado) {
                    largura = Math.round((largura * maxLado) / altura);
                    altura = maxLado;
                }

                canvas.width = largura;
                canvas.height = altura;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, largura, altura);

                fotoBase64 = canvas.toDataURL('image/jpeg', 0.75);

                if (avatarImg) {
                    avatarImg.src = fotoBase64;
                    avatarImg.style.display = 'block';
                }
                if (avatarSvg) avatarSvg.style.display = 'none';
                if (btnSalvar) btnSalvar.disabled = false;
            };
            img.src = evento.target.result;
        };
        leitor.readAsDataURL(arquivo);
    });
    
    // =========================================================
    // 4. SALVAR ALTERAÇÕES (DADOS + FOTO COMPRIMIDA)
    // =========================================================
    if (formPerfil) {
        formPerfil.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('nome')?.value.trim() || '';
            const cpf = document.getElementById('cpf')?.value.trim() || '';
            const email = document.getElementById('email')?.value.trim() || '';

            try {
                const res = await fetch('/api/perfil', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ nome, cpf, email, foto: fotoBase64 })
                });

                if (!res.ok) {
                    const textoErro = await res.text();
                    alert(`Erro ao salvar (${res.status}): ${textoErro.slice(0, 120)}`);
                    return;
                }

                const resultado = await res.json();
                alert(resultado.mensagem || 'Alterações salvas com sucesso!');

                if (identityName) identityName.textContent = nome || 'Usuário';
                document.querySelectorAll('.input input').forEach((inp) => inp.setAttribute('readonly', true));
                if (btnSalvar) btnSalvar.disabled = true;
                fotoBase64 = null;

                if (typeof carregarFotoCabecalho === 'function') {
                    carregarFotoCabecalho();
                }
            } catch (erro) {
                console.error('Erro ao salvar perfil:', erro);
                alert('Falha de comunicação com o servidor.');
            }
        });
    }

    // =========================================================
    // 5. MODAL DE ALTERAR SENHA
    // =========================================================
    const modalSenha = document.getElementById('modal-senha');
    const btnAbrirSenha = document.getElementById('btn-abrir-senha');
    const btnFecharModal = document.getElementById('btn-fechar-modal') || document.getElementById('btn-cancelar-senha');
    const formSenha = document.getElementById('form-senha');

    if (btnAbrirSenha && modalSenha) {
        btnAbrirSenha.addEventListener('click', () => {
            if (typeof modalSenha.showModal === 'function') modalSenha.showModal();
            else modalSenha.style.display = 'flex';
        });
    }

    if (btnFecharModal && modalSenha) {
        btnFecharModal.addEventListener('click', () => {
            if (typeof modalSenha.close === 'function') modalSenha.close();
            else modalSenha.style.display = 'none';
        });
    }

    if (formSenha) {
        formSenha.addEventListener('submit', async (e) => {
            e.preventDefault();
            const senhaAtual = document.getElementById('senha-atual')?.value || '';
            const novaSenha = document.getElementById('nova-senha')?.value || '';

            const res = await fetch('/api/perfil/senha', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ senhaAtual, novaSenha })
            });

            const resultado = await res.json();
            alert(resultado.mensagem);

            if (res.ok) {
                if (modalSenha && typeof modalSenha.close === 'function') modalSenha.close();
                else if (modalSenha) modalSenha.style.display = 'none';
                e.target.reset();
            }
        });
    }

    // =========================================================
    // 6. EXCLUIR CONTA
    // =========================================================
    const btnExcluir = document.getElementById('btn-excluir') || document.getElementById('btn-excluir-conta');
    if (btnExcluir) {
        btnExcluir.addEventListener('click', async () => {
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
    }

    // =========================================================
    // 7. SAIR DA SESSÃO
    // =========================================================
    const btnSair = document.getElementById('btn-sair');
    if (btnSair) {
        btnSair.addEventListener('click', async () => {
            const res = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (res.ok) {
                window.location.href = '/';
            }
        });
    }
});