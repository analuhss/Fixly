// =========================================================
    // 5. MODAL DE DETALHES DA ORDEM (COM ALTERAÇÃO DE STATUS E FINALIZAR)
    // =========================================================
    function abrirDetalhesOS(os, numeroOs, statusTexto, valorFormatado) {
        let modal = document.getElementById('modal-detalhes-os-prof');

        if (!document.getElementById('estilo-modal-os-prof')) {
            const style = document.createElement('style');
            style.id = 'estilo-modal-os-prof';
            style.innerHTML = `
                .modal-os-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.78); display: none; align-items: center; justify-content: center; padding: 20px; z-index: 99999; }
                .modal-os-overlay.aberto { display: flex; }
                .modal-os-box { background: #1a1a1d; border: 1px solid #333338; border-top: 6px solid #f5c542; border-radius: 16px; width: 100%; max-width: 520px; padding: 24px; color: #ffffff; box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6); max-height: 90vh; overflow-y: auto; }
                .modal-os-topo { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #2e2e33; padding-bottom: 14px; margin-bottom: 18px; }
                .modal-os-topo h2 { margin: 0; font-size: 1.35rem; color: #f5c542; }
                .modal-os-fechar { background: transparent; border: none; color: #a1a1aa; font-size: 1.6rem; cursor: pointer; line-height: 1; }
                .modal-os-fechar:hover { color: #ffffff; }
                .modal-os-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
                .modal-os-campo { background: #242429; padding: 12px 14px; border-radius: 10px; }
                .modal-os-campo.full { grid-column: 1 / -1; }
                .modal-os-campo span { display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; color: #a1a1aa; margin-bottom: 4px; }
                .modal-os-campo p { margin: 0; font-size: 0.95rem; font-weight: 500; color: #f4f4f5; word-break: break-word; }
                .modal-os-acoes { margin-top: 20px; padding-top: 16px; border-top: 1px solid #2e2e33; display: flex; flex-direction: column; gap: 12px; }
                .modal-os-status-row { display: flex; gap: 10px; align-items: center; }
                .modal-os-select { flex: 1; background: #242429; color: #ffffff; border: 1px solid #3f3f46; border-radius: 10px; padding: 10px 12px; font-size: 0.92rem; font-family: inherit; outline: none; }
                .modal-os-select:focus { border-color: #f5c542; }
                .btn-modal-salvar-status { background: #2e2e33; color: #f5c542; border: 1px solid #f5c542; border-radius: 10px; padding: 10px 16px; font-weight: 600; cursor: pointer; transition: 0.2s; }
                .btn-modal-salvar-status:hover { background: #f5c542; color: #1a1a1d; }
                .btn-modal-finalizar { width: 100%; background: #22c55e; color: #09090b; border: none; border-radius: 10px; padding: 12px; font-size: 0.98rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .btn-modal-finalizar:hover { filter: brightness(1.08); }
                .btn-modal-finalizar:disabled, .btn-modal-salvar-status:disabled { opacity: 0.6; cursor: not-allowed; }
            `;
            document.head.appendChild(style);
        }

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-detalhes-os-prof';
            modal.className = 'modal-os-overlay';
            modal.innerHTML = `
                <div class="modal-os-box">
                    <div class="modal-os-topo">
                        <h2 id="prof-detalhe-titulo">OS#</h2>
                        <button type="button" class="modal-os-fechar" id="fechar-modal-prof" aria-label="Fechar">&times;</button>
                    </div>
                    <div class="modal-os-grid">
                        <div class="modal-os-campo"><span>Status</span><p id="prof-detalhe-status"></p></div>
                        <div class="modal-os-campo"><span>Valor</span><p id="prof-detalhe-valor"></p></div>
                        <div class="modal-os-campo"><span>Cliente</span><p id="prof-detalhe-cliente"></p></div>
                        <div class="modal-os-campo"><span>Telefone do Cliente</span><p id="prof-detalhe-telefone"></p></div>
                        <div class="modal-os-campo full"><span>Endereço</span><p id="prof-detalhe-endereco"></p></div>
                        <div class="modal-os-campo"><span>Equipamento</span><p id="prof-detalhe-equipamento"></p></div>
                        <div class="modal-os-campo"><span>Marca</span><p id="prof-detalhe-marca"></p></div>
                        <div class="modal-os-campo full"><span>O que acompanha</span><p id="prof-detalhe-perifericos"></p></div>
                        <div class="modal-os-campo full"><span>Descrição do Problema</span><p id="prof-detalhe-descricao"></p></div>
                    </div>

                    <div class="modal-os-acoes" id="prof-modal-acoes">
                        <div class="modal-os-status-row">
                            <select id="prof-select-status" class="modal-os-select" aria-label="Alterar status da OS">
                                <option value="aberta">Aberta</option>
                                <option value="analise">Em Análise</option>
                                <option value="andamento">Em Andamento</option>
                                <option value="congelada">Congelada</option>
                            </select>
                            <button type="button" id="btn-salvar-status-os" class="btn-modal-salvar-status">Atualizar Status</button>
                        </div>
                        <button type="button" id="btn-finalizar-os" class="btn-modal-finalizar">Finalizar Ordem de Serviço</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('fechar-modal-prof').addEventListener('click', () => modal.classList.remove('aberto'));
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('aberto'); });
        }

        document.getElementById('prof-detalhe-titulo').textContent = `OS# ${numeroOs}`;
        document.getElementById('prof-detalhe-status').textContent = statusTexto;
        document.getElementById('prof-detalhe-valor').textContent = valorFormatado;
        document.getElementById('prof-detalhe-cliente').textContent = os.clienteNome || 'Não informado';
        document.getElementById('prof-detalhe-telefone').textContent = os.clienteTelefone || 'Não informado';
        document.getElementById('prof-detalhe-endereco').textContent = os.clienteEndereco || 'Não informado';
        document.getElementById('prof-detalhe-equipamento').textContent = os.equipamento || os.modelo || 'Não informado';
        document.getElementById('prof-detalhe-marca').textContent = os.marca || 'Não informada';
        document.getElementById('prof-detalhe-perifericos').textContent = os.perifericos || 'Nenhum item';
        document.getElementById('prof-detalhe-descricao').textContent = os.descricao || 'Sem descrição';

        const boxAcoes = document.getElementById('prof-modal-acoes');
        const selectStatus = document.getElementById('prof-select-status');
        const btnSalvarStatus = document.getElementById('btn-salvar-status-os');
        const btnFinalizar = document.getElementById('btn-finalizar-os');

        // Exibe os controles apenas nas ordens atribuídas ao técnico ("Minhas ordens")
        if (abaAtual === 'minhas') {
            boxAcoes.style.display = 'flex';
            const statusAtual = (os.status || 'andamento').toLowerCase();
            selectStatus.value = ['aberta', 'analise', 'andamento', 'congelada'].includes(statusAtual)
                ? statusAtual
                : 'andamento';

            // Botão "Atualizar Status" (ex: colocar em Andamento)
            btnSalvarStatus.onclick = async () => {
                btnSalvarStatus.disabled = true;
                btnSalvarStatus.textContent = 'Salvando...';
                try {
                    const resp = await fetch(`/api/ordens/${numeroOs}/status`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ status: selectStatus.value })
                    });
                    const dados = await resp.json();
                    if (resp.ok) {
                        modal.classList.remove('aberto');
                        await carregarOrdens();
                    } else {
                        alert(dados.mensagem || 'Erro ao atualizar status.');
                    }
                } catch (err) {
                    alert('Falha de comunicação com o servidor.');
                } finally {
                    btnSalvarStatus.disabled = false;
                    btnSalvarStatus.textContent = 'Atualizar Status';
                }
            };

            // Botão "Finalizar Ordem de Serviço"
            if (statusAtual === 'fechada') {
                btnFinalizar.disabled = true;
                btnFinalizar.textContent = 'Ordem já Finalizada';
            } else {
                btnFinalizar.disabled = false;
                btnFinalizar.textContent = 'Finalizar Ordem de Serviço';
                btnFinalizar.onclick = async () => {
                    if (!confirm(`Deseja realmente finalizar a OS# ${numeroOs}?`)) return;

                    btnFinalizar.disabled = true;
                    btnFinalizar.textContent = 'Finalizando...';
                    try {
                        const resp = await fetch(`/api/ordens/${numeroOs}/status`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ status: 'fechada' })
                        });
                        const dados = await resp.json();
                        if (resp.ok) {
                            modal.classList.remove('aberto');
                            await carregarOrdens();
                        } else {
                            alert(dados.mensagem || 'Erro ao finalizar ordem.');
                        }
                    } catch (err) {
                        alert('Falha de comunicação com o servidor.');
                    } finally {
                        btnFinalizar.disabled = false;
                        btnFinalizar.textContent = 'Finalizar Ordem de Serviço';
                    }
                };
            }
        } else {
            boxAcoes.style.display = 'none';
        }

        modal.classList.add('aberto');
    }