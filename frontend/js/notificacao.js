(function () {
    function injetarEstilos() {
        if (document.getElementById('fixly-toast-style')) return;

        const estilo = document.createElement('style');
        estilo.id = 'fixly-toast-style';
        estilo.textContent = `
            fixly-toasts {
                all: initial;
                position: fixed !important;
                top: 24px !important;
                right: 24px !important;
                z-index: 2147483647 !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 10px !important;
                pointer-events: none !important;
            }

            fixly-toast {
                all: initial;
                min-width: 280px !important;
                max-width: 380px !important;
                background: #18181b !important;
                color: #f4f4f5 !important;
                font-family: 'Poppins', Arial, sans-serif !important;
                font-size: 14px !important;
                line-height: 1.4 !important;
                padding: 14px 18px !important;
                border-radius: 12px !important;
                border: 1px solid #27272a !important;
                border-left: 4px solid #eab308 !important;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                gap: 12px !important;
                pointer-events: auto !important;
                opacity: 0 !important;
                transform: translateX(30px) !important;
                transition: opacity 0.35s ease, transform 0.35s ease !important;
                box-sizing: border-box !important;
            }

            fixly-toast.visivel {
                opacity: 1 !important;
                transform: translateX(0) !important;
            }

            fixly-toast.sucesso { border-left-color: #22c55e !important; }
            fixly-toast.erro    { border-left-color: #ef4444 !important; }
            fixly-toast.aviso   { border-left-color: #eab308 !important; }

            fixly-toast button {
                all: initial;
                color: #a1a1aa !important;
                font-family: Arial, sans-serif !important;
                font-size: 18px !important;
                line-height: 1 !important;
                cursor: pointer !important;
                padding: 0 4px !important;
            }

            fixly-toast button:hover {
                color: #ffffff !important;
            }
        `;
        (document.head || document.documentElement).appendChild(estilo);
    }

    function obterContainer() {
        injetarEstilos();
        let container = document.querySelector('fixly-toasts');
        if (!container) {
            container = document.createElement('fixly-toasts');
            (document.body || document.documentElement).appendChild(container);
        }
        return container;
    }

    function detectarTipo(mensagem, tipoPadrao = 'aviso') {
        if (tipoPadrao !== 'aviso' || typeof mensagem !== 'string') return tipoPadrao;

        const texto = mensagem.toLowerCase();
        if (
            texto.includes('sucesso') ||
            texto.includes('criada') ||
            texto.includes('realizado') ||
            texto.includes('alterada') ||
            texto.includes('aprovado') ||
            texto.includes('assumida') ||
            texto.includes('atualizado') ||
            texto.includes('salvos')
        ) {
            return 'sucesso';
        }

        if (
            texto.includes('erro') ||
            texto.includes('incorret') ||
            texto.includes('não foi possível') ||
            texto.includes('expirada') ||
            texto.includes('inválid') ||
            texto.includes('obrigatório') ||
            texto.includes('requisitos') ||
            texto.includes('mínimo') ||
            texto.includes('preencha') ||
            texto.includes('selecione')
        ) {
            return 'erro';
        }

        return 'aviso';
    }

    window.mostrarAlerta = function (mensagem, tipo = 'aviso', duracao = 5000) {
        const container = obterContainer();
        const tipoFinal = detectarTipo(mensagem, tipo);

        const toast = document.createElement('fixly-toast');
        toast.className = tipoFinal;

        const textoSpan = document.createElement('span');
        textoSpan.style.cssText = 'color: #f4f4f5 !important; font-family: Poppins, Arial, sans-serif !important; font-size: 14px !important;';
        textoSpan.textContent = mensagem;

        const btnFechar = document.createElement('button');
        btnFechar.type = 'button';
        btnFechar.setAttribute('aria-label', 'Fechar');
        btnFechar.innerHTML = '&times;';

        toast.appendChild(textoSpan);
        toast.appendChild(btnFechar);

        const remover = () => {
            toast.classList.remove('visivel');
            setTimeout(() => toast.remove(), 350);
        };

        btnFechar.addEventListener('click', remover);
        container.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('visivel'));
        setTimeout(remover, duracao);

        return new Promise((resolve) => setTimeout(resolve, 2500));
    };

    window.redirecionarComAlerta = function (mensagem, url, tipo = 'sucesso', atraso = 2200) {
        window.mostrarAlerta(mensagem, tipo, atraso + 800);
        setTimeout(() => {
            window.location.href = url;
        }, atraso);
    };

    window.alert = function (mensagem) {
        const tipoFinal = detectarTipo(mensagem, 'aviso');
        const resultado = window.mostrarAlerta(mensagem, tipoFinal, 5000);

        const marcarPendente = () => {
            sessionStorage.setItem(
                'fixly_alerta_pendente',
                JSON.stringify({ mensagem, tipo: tipoFinal, duracao: 5000 })
            );
        };

        window.addEventListener('beforeunload', marcarPendente, { once: true });
        setTimeout(() => {
            window.removeEventListener('beforeunload', marcarPendente);
        }, 500);

        return resultado;
    };

    function verificarAlertaPendente() {
        const pendente = sessionStorage.getItem('fixly_alerta_pendente');
        if (!pendente) return;

        sessionStorage.removeItem('fixly_alerta_pendente');
        try {
            const { mensagem, tipo, duracao } = JSON.parse(pendente);
            window.mostrarAlerta(mensagem, tipo || 'aviso', duracao || 5000);
        } catch (e) {
            window.mostrarAlerta(pendente, 'aviso', 5000);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', verificarAlertaPendente);
    } else {
        verificarAlertaPendente();
    }
})();