async function carregarFotoCabecalho() {
    const topbarImg = document.getElementById('topbar-avatar-img');
    const topbarSvg = document.getElementById('topbar-avatar-svg');

    if (!topbarImg || !topbarSvg) return;

    try {
        const res = await fetch('/api/perfil', { credentials: 'include' });
        if (!res.ok) return;

        const dados = await res.json();

        if (dados.foto) {
            topbarImg.src = dados.foto;
            topbarImg.style.display = 'block';
            topbarSvg.style.display = 'none';
        } else {
            topbarImg.src = '';
            topbarImg.style.display = 'none';
            topbarSvg.style.display = 'block';
        }
    } catch (erro) {
        console.error('Erro ao carregar foto do cabeçalho:', erro);
    }
}

document.addEventListener('DOMContentLoaded', carregarFotoCabecalho);