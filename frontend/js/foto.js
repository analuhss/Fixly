console.log('Script da foto carregou nesta página!')

document.addEventListener('DOMContentLoaded', async () => {
    const formPerfil = document.getElementById('form-perfil');
    const inputFoto = document.getElementById('upload-foto'); // O input file oculto
    const previewFoto = document.getElementById('preview-foto'); // A tag img do perfil
    
    let fotoBase64 = null; // Guardará a foto convertida

    // 1. CARREGAR DADOS AO ABRIR A PÁGINA
    try {
        const res = await fetch('/api/perfil', { credentials: 'include' });
        
        if (res.status === 401) {
            console.warn('Sessão expirada. Faça login novamente.');
            return;
        }

        const dados = await res.json();

        // Preenche os campos de texto
        if (document.getElementById('nome')) document.getElementById('nome').value = dados.nome || '';
        if (document.getElementById('cpf')) document.getElementById('cpf').value = dados.cpf || '';
        if (document.getElementById('email')) document.getElementById('email').value = dados.email || '';

        // Mostra a foto no perfil central se ela existir no banco
        if (dados.foto && previewFoto) {
            previewFoto.src = dados.foto;
            previewFoto.style.display = 'block';
        }
    } catch (erro) {
        console.error('Erro ao carregar dados do perfil:', erro);
    }

    // 2. CONVERTER FOTO PARA BASE64 QUANDO O USUÁRIO ESCOLHER O ARQUIVO
    if (inputFoto) {
        inputFoto.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    fotoBase64 = e.target.result; 
                    if (previewFoto) {
                        previewFoto.src = fotoBase64;
                        previewFoto.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 3. SALVAR DADOS E FOTO AO CLICAR NO BOTÃO DE SALVAR
    if (formPerfil) {
        formPerfil.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nome = document.getElementById('nome').value;
            const cpf = document.getElementById('cpf').value;
            const email = document.getElementById('email').value;

            try {
                const res = await fetch('/api/perfil', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        nome: nome,
                        cpf: cpf,
                        email: email,
                        foto: fotoBase64 // Envia a foto convertida para o servidor
                    })
                });

                if (res.ok) {
                    alert('Perfil atualizado com sucesso!');
                    
                    // Atualiza a bolinha do cabeçalho na mesma hora (se a função existir)
                    if (typeof carregarFotoCabecalho === 'function') {
                        carregarFotoCabecalho();
                    }
                } else {
                    const erroData = await res.json();
                    alert('Erro: ' + (erroData.mensagem || 'Não foi possível salvar.'));
                }
            } catch (erro) {
                console.error('Erro ao salvar:', erro);
                alert('Falha na comunicação com o servidor.');
            }
        });
    }
});

if (dados.foto) {
            topbarImg.src = dados.foto;
            topbarImg.style.display = 'block';
            topbarSvg.style.display = 'none';
        } else {
            topbarImg.src = '';
            topbarImg.style.display = 'none';
            topbarSvg.style.display = 'block';
        }