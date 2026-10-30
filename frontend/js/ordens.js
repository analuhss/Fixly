// ===== Armazenamento das ordens de serviço =====
//
// ATENÇÃO: por enquanto as ordens ficam no localStorage, ou seja, só aparecem
// no MESMO navegador/computador onde foram cadastradas (serve para testar).
// Para o cliente ver a ordem em OUTRO aparelho, é preciso um servidor:
// troque só o conteúdo de salvarOrdem() e buscarOrdensDoCliente() por
// chamadas fetch() para a sua API. O resto do código não muda.

const CHAVE_ORDENS = "fixlyOrdens";

function lerOrdens() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE_ORDENS)) || [];
    } catch (erro) {
        return [];
    }
}

function normalizarId(id) {
    return String(id).trim().toLowerCase();
}

// "OS#0001"
function formatarNumeroOS(numero) {
    return "OS#" + String(numero).padStart(4, "0");
}

async function salvarOrdem(ordem) {
    const lista = lerOrdens();
    const maiorNumero = lista.reduce((maior, o) => Math.max(maior, o.numero), 0);

    const nova = {
        ...ordem,
        clienteId: ordem.clienteId.trim(),
        numero: maiorNumero + 1,
        criadaEm: new Date().toISOString()
    };

    lista.push(nova);
    localStorage.setItem(CHAVE_ORDENS, JSON.stringify(lista));

    return nova;
}

// ordens do cliente, da mais nova para a mais antiga
async function buscarOrdensDoCliente(clienteId) {
    const id = normalizarId(clienteId);

    return lerOrdens()
        .filter((ordem) => normalizarId(ordem.clienteId) === id)
        .sort((a, b) => b.numero - a.numero);
}