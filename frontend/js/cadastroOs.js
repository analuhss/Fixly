// valor fixo da taxa de análise (R$ 60,00)
const TAXA_ANALISE = 60;

const formulario = document.getElementById("formOS");
const passos = [...document.querySelectorAll(".passo")];
const pontos = [...document.querySelectorAll(".ponto")];
const setaAnterior = document.getElementById("passoAnterior");
const setaProxima = document.getElementById("passoProximo");

const campoMaoDeObra = document.getElementById("maoDeObra");
const campoMateriais = document.getElementById("materiais");
const campoValorFinal = document.getElementById("valorFinal");

const botaoCadastrar = document.getElementById("botaoCadastrar");
const mensagem = document.getElementById("mensagem");

let passoAtual = 0;


/* ===== Passos ===== */

function mostrarPasso(numero, rolar = true) {
    passoAtual = numero;

    passos.forEach((passo, i) => {
        passo.hidden = i !== numero;
    });

    pontos.forEach((ponto, i) => {
        ponto.classList.toggle("ativo", i === numero);
        ponto.setAttribute("aria-current", i === numero ? "step" : "false");
    });

    setaAnterior.disabled = numero === 0;
    setaProxima.disabled = numero === passos.length - 1;

    if (rolar) {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

// confere os campos de um passo; se tiver erro, abre o passo e mostra o aviso
function passoValido(numero) {
    const campos = [...passos[numero].querySelectorAll("input, textarea")];
    const invalido = campos.find((campo) => !campo.checkValidity());

    if (!invalido) {
        return true;
    }

    mostrarPasso(numero);
    invalido.reportValidity();
    return false;
}

// para avançar, os passos anteriores precisam estar corretos
function irParaPasso(numero) {
    for (let i = passoAtual; i < numero; i++) {
        if (!passoValido(i)) {
            return;
        }
    }

    mostrarPasso(numero);
}

setaAnterior.addEventListener("click", () => mostrarPasso(passoAtual - 1));
setaProxima.addEventListener("click", () => irParaPasso(passoAtual + 1));

pontos.forEach((ponto, i) => {
    ponto.addEventListener("click", () => irParaPasso(i));
});


/* ===== Custos ===== */

function lerDinheiro(campo) {
    return Number(campo.value.replace(",", ".")) || 0;
}

function formatarDinheiro(valor) {
    return valor.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// deixa só números e uma vírgula, com no máximo 2 casas
function limparDinheiro(campo) {
    const [inteiro, ...resto] = campo.value.replace(/[^\d,]/g, "").split(",");

    campo.value = resto.length ? inteiro + "," + resto.join("").slice(0, 2) : inteiro;
}

function calcularTotal() {
    const total = TAXA_ANALISE + lerDinheiro(campoMaoDeObra) + lerDinheiro(campoMateriais);

    return Math.round(total * 100) / 100;
}

function atualizarValorFinal() {
    campoValorFinal.value = formatarDinheiro(calcularTotal());
}

[campoMaoDeObra, campoMateriais].forEach((campo) => {
    campo.addEventListener("input", () => {
        limparDinheiro(campo);
        atualizarValorFinal();
    });
});


/* ===== Data e hora de abertura (já vêm preenchidas) ===== */

function preencherAbertura() {
    const agora = new Date();
    const doisDigitos = (n) => String(n).padStart(2, "0");

    document.getElementById("dataAbertura").value =
        agora.getFullYear() + "-" + doisDigitos(agora.getMonth() + 1) + "-" + doisDigitos(agora.getDate());

    document.getElementById("horaAbertura").value =
        doisDigitos(agora.getHours()) + ":" + doisDigitos(agora.getMinutes());
}


/* ===== Descrição do problema: a caixa cresce conforme o texto ===== */

const campoDescricao = document.getElementById("descricao");

function ajustarDescricao() {
    // se o passo 1 está escondido, o navegador não mede a altura (daria 0)
    if (campoDescricao.offsetParent === null) {
        return;
    }

    campoDescricao.style.height = "auto";
    campoDescricao.style.height = campoDescricao.scrollHeight + 2 + "px";
}

campoDescricao.addEventListener("input", ajustarDescricao);


/* ===== Cadastrar ===== */

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    // confere os 3 passos; para no primeiro que tiver erro
    for (let i = 0; i < passos.length; i++) {
        if (!passoValido(i)) {
            return;
        }
    }

    const dados = new FormData(formulario);
    const texto = (nome) => (dados.get(nome) || "").trim();

    const ordem = {
        clienteId: texto("clienteId"),
        dataAbertura: texto("dataAbertura"),
        horaAbertura: texto("horaAbertura"),

        cliente: {
            nome: texto("nomeCliente"),
            telefone: texto("telefone"),
            email: texto("email")
        },
        descricao: texto("descricao"),

        equipamento: {
            marca: texto("marca"),
            modelo: texto("modelo"),
            perifericos: texto("perifericos")
        },
        tecnico: texto("tecnico"),
        diagnostico: texto("diagnostico"),
        servicosExecutados: texto("servicos"),
        pecasMateriais: texto("pecas"),
        dataFinalizacao: texto("dataFinalizacao"),

        custos: {
            taxaAnalise: TAXA_ANALISE,
            maoDeObra: lerDinheiro(campoMaoDeObra),
            materiais: lerDinheiro(campoMateriais),
            valorFinal: calcularTotal()
        },

        status: texto("status"),
        validacaoCliente: "em-analise"
    };

    botaoCadastrar.disabled = true;
    mensagem.classList.remove("erro");

    try {
        const salva = await salvarOrdem(ordem);

        mensagem.textContent =
            formatarNumeroOS(salva.numero) + " cadastrada! O cliente com o número " +
            salva.clienteId + " já pode ver esta ordem.";

        formulario.reset();
        preencherAbertura();
        atualizarValorFinal();
        mostrarPasso(0, false);
        ajustarDescricao(); // depois de mostrar o passo 1, senão a caixa não consegue medir o texto
        mensagem.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (erro) {
        mensagem.textContent = "Não foi possível cadastrar a ordem. Tente novamente.";
        mensagem.classList.add("erro");
    }

    botaoCadastrar.disabled = false;
});


/* ===== Início ===== */

preencherAbertura();
atualizarValorFinal();
mostrarPasso(0, false);