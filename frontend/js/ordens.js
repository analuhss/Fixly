

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

// ordens do cliente, da mais nova para a mais antigo

