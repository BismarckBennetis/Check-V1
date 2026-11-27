/* Compatibilidade com navegadores que ainda não oferecem estes métodos. */
(function () {
    if (!Array.from) {
        Array.from = function (colecao) { return Array.prototype.slice.call(colecao); };
    }
    if (typeof NodeList !== "undefined" && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = Array.prototype.forEach;
    }
    if (!String.prototype.padStart) {
        String.prototype.padStart = function (tamanho, preenchimento) {
            var texto = String(this);
            var caractere = preenchimento || " ";
            while (texto.length < tamanho) texto = caractere + texto;
            return texto.slice(-tamanho);
        };
    }
    if (!Number.parseFloat) Number.parseFloat = parseFloat;
})();

/* ==========================================================
   CHECK — CALENDÁRIO MOBILE
   O Check utiliza um único calendário: o mês atual, navegável
   pelas setas anterior e próximo.
========================================================== */
var hoje = new Date();
var temporizadorAtualizacao = null;
var mesAtual = hoje.getMonth();
var anoAtual = hoje.getFullYear();
var calendarioAtual = document.getElementById("calendario-atual");

var nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
var nomesDias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function preencherCalendario(mes, ano) {
    if (!calendarioAtual) return;

    var titulo = calendarioAtual.querySelector(".calendario-titulo");
    var anoElemento = calendarioAtual.querySelector(".calendario-ano");
    var cabecalhoDias = calendarioAtual.querySelector(".calendario-dias-semana");
    var gradeDias = calendarioAtual.querySelector(".calendario-dias");
    if (!titulo || !anoElemento || !cabecalhoDias || !gradeDias) return;

    titulo.textContent = nomesMeses[mes];
    anoElemento.textContent = ano;
    calendarioAtual.dataset.mes = String(mes);
    calendarioAtual.dataset.ano = String(ano);
    cabecalhoDias.innerHTML = "";
    gradeDias.innerHTML = "";

    nomesDias.forEach(function (nome) {
        var diaSemana = document.createElement("span");
        diaSemana.textContent = nome;
        cabecalhoDias.appendChild(diaSemana);
    });

    var primeiroDia = new Date(ano, mes, 1).getDay();
    var quantidadeDias = new Date(ano, mes + 1, 0).getDate();
    var dataAtual = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

    for (var i = 0; i < primeiroDia; i++) {
        gradeDias.appendChild(document.createElement("span"));
    }

    for (var numeroDia = 1; numeroDia <= quantidadeDias; numeroDia++) {
        var celulaDia = document.createElement("span");
        var dataCelula = new Date(ano, mes, numeroDia);
        celulaDia.classList.add("calendario-dia");
        celulaDia.textContent = numeroDia;

        if (ehFeriadoNacional(dataCelula)) {
            celulaDia.classList.add("feriado-nacional");
        }
        if (dataCelula < dataAtual) {
            celulaDia.classList.add("dia-passado");
        }
        if (dataCelula.getTime() === dataAtual.getTime()) {
            celulaDia.classList.add("hoje");
        }
        gradeDias.appendChild(celulaDia);
    }
}

function navegarCalendario(diferenca) {
    if (!calendarioAtual) return;

    var mes = Number(calendarioAtual.dataset.mes);
    var ano = Number(calendarioAtual.dataset.ano);
    if (!isFinite(mes) || !isFinite(ano)) return;

    mes += diferenca;
    if (mes < 0) {
        mes = 11;
        ano--;
    } else if (mes > 11) {
        mes = 0;
        ano++;
    }
    preencherCalendario(mes, ano);
}

if (calendarioAtual) {
    var setaAnterior = calendarioAtual.querySelector(".seta-anterior");
    var setaProxima = calendarioAtual.querySelector(".seta-proxima");

    if (setaAnterior) {
        setaAnterior.addEventListener("click", function () {
            navegarCalendario(-1);
        });
    }
    if (setaProxima) {
        setaProxima.addEventListener("click", function () {
            navegarCalendario(1);
        });
    }

    preencherCalendario(mesAtual, anoAtual);
}

/* ID: JS-008 | FERIADOS NACIONAIS */
function calcularPascoa(ano) {
    var a = ano % 19;
    var b = Math.floor(ano / 100);
    var c = ano % 100;
    var d = Math.floor(b / 4);
    var e = b % 4;
    var f = Math.floor((b + 8) / 25);
    var g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4);
    var k = c % 4;
    var l = (32 + 2 * e + 2 * i - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    var mes = Math.floor((h + l - 7 * m + 114) / 31);
    var dia = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(ano, mes - 1, dia);
}

function ehFeriadoNacional(data) {
    var chave = String(data.getMonth() + 1).padStart(2, "0") +
        "-" + String(data.getDate()).padStart(2, "0");
    var feriadosFixos = [
        "01-01", "04-21", "05-01", "09-07", "10-12",
        "11-02", "11-15", "11-20", "12-25"
    ];

    if (feriadosFixos.indexOf(chave) !== -1) return true;

    var pascoa = calcularPascoa(data.getFullYear());
    var paixaoDeCristo = new Date(
        pascoa.getFullYear(),
        pascoa.getMonth(),
        pascoa.getDate() - 2
    );
    return data.getFullYear() === paixaoDeCristo.getFullYear() &&
        data.getMonth() === paixaoDeCristo.getMonth() &&
        data.getDate() === paixaoDeCristo.getDate();
}

/* Atualiza relógio, data e destaque do dia no calendário mobile. */
function verificarDataEAgendarAtualizacao() {
    var agora = new Date();
    var horarioValor = document.querySelector(".horario-valor");
    var dataValor = document.querySelector(".data-valor");

    if (horarioValor) {
        horarioValor.textContent =
            String(agora.getHours()).padStart(2, "0") + ":" +
            String(agora.getMinutes()).padStart(2, "0");
    }

    if (dataValor) {
        var diaData = dataValor.querySelector(".data-dia");
        var mesData = dataValor.querySelector(".data-mes");
        var anoData = dataValor.querySelector(".data-ano");
        if (diaData) {
            diaData.textContent = String(agora.getDate()).padStart(2, "0");
            diaData.classList.toggle("feriado-nacional", ehFeriadoNacional(agora));
        }
        if (mesData) mesData.textContent = String(agora.getMonth() + 1).padStart(2, "0");
        if (anoData) anoData.textContent = agora.getFullYear();
    }

    var mudouMes = agora.getFullYear() !== hoje.getFullYear() ||
        agora.getMonth() !== hoje.getMonth();
    var mudouDia = mudouMes || agora.getDate() !== hoje.getDate();

    if (mudouDia) {
        hoje = agora;
        if (mudouMes) {
            mesAtual = agora.getMonth();
            anoAtual = agora.getFullYear();
            preencherCalendario(mesAtual, anoAtual);
        } else if (calendarioAtual) {
            preencherCalendario(
                Number(calendarioAtual.dataset.mes),
                Number(calendarioAtual.dataset.ano)
            );
        }
    }

    clearTimeout(temporizadorAtualizacao);
    var proximoMinuto = new Date(
        agora.getFullYear(), agora.getMonth(), agora.getDate(),
        agora.getHours(), agora.getMinutes() + 1
    );
    temporizadorAtualizacao = setTimeout(
        verificarDataEAgendarAtualizacao,
        proximoMinuto.getTime() - agora.getTime()
    );
}

document.addEventListener("visibilitychange", function () {
    if (!document.hidden) verificarDataEAgendarAtualizacao();
});
verificarDataEAgendarAtualizacao();

/* Utilitário compartilhado pelos controladores de rolagem. */
function limitarValor(valor, minimo, maximo) {
    return Math.max(minimo, Math.min(maximo, valor));
}
/* ID: JS-006 | REF: COMPONENT.SCROLLBAR.HORIZONTAL | SELETOR: .rotina-barra-horizontal[data-scroll-for] */
/* UMA ROTINA COMPARTILHADA: CADA BARRA CONTROLA SOMENTE scrollLeft */
(function configurarBarrasHorizontais() {
    var barras = document.querySelectorAll('.rotina-barra-horizontal[data-scroll-for]');
    if (!barras.length)
        return;
    barras.forEach(function (barra) {
        if (barra.dataset.scrollInitialized === 'horizontal')
            return;
        var lista = document.getElementById(barra.dataset.scrollFor);
        var trilho = barra.querySelector('.rotina-barra-trilho');
        var cursor = barra.querySelector('.rotina-barra-cursor');
        if (!lista || !trilho || !cursor)
            return;
        barra.dataset.scrollInitialized = 'horizontal';
        var arrastando = false;
        var deslocamentoCursor = 0;
        function obterMedidas() {
            var larguraTrilho = trilho.clientWidth;
            var larguraVisivel = lista.clientWidth;
            var larguraTotal = lista.scrollWidth;
            var rolagemMaxima = Math.max(0, larguraTotal - larguraVisivel);
            if (!larguraTrilho) {
                return {
                    larguraTrilho: 0,
                    larguraCursor: 0,
                    deslocamentoMaximo: 0,
                    rolagemMaxima: rolagemMaxima
                };
            }
            var proporcaoVisivel = rolagemMaxima > 0 && larguraTotal > 0
                ? larguraVisivel / larguraTotal
                : 1;
            var larguraMinima = Math.min(28, larguraTrilho);
            var larguraCursor = Math.min(larguraTrilho, Math.max(larguraMinima, larguraTrilho * proporcaoVisivel));
            return {
                larguraTrilho: larguraTrilho,
                larguraCursor: larguraCursor,
                deslocamentoMaximo: Math.max(0, larguraTrilho - larguraCursor),
                rolagemMaxima: rolagemMaxima
            };
        }
        function atualizarBarra() {
            var medidas = obterMedidas();
            if (!medidas.larguraTrilho)
                return;
            var progresso = medidas.rolagemMaxima > 0
                ? limitarValor(lista.scrollLeft / medidas.rolagemMaxima, 0, 1)
                : 0;
            cursor.style.width = medidas.larguraCursor + 'px';
            cursor.style.left = (medidas.deslocamentoMaximo * progresso) + 'px';
            barra.setAttribute('aria-valuenow', String(Math.round(progresso * 100)));
            barra.setAttribute('aria-disabled', medidas.rolagemMaxima > 0 ? 'false' : 'true');
        }
        function moverListaPeloCursor(posicaoX) {
            var medidas = obterMedidas();
            if (medidas.rolagemMaxima <= 0 || medidas.deslocamentoMaximo <= 0)
                return;
            var retangulo = trilho.getBoundingClientRect();
            var novaPosicao = limitarValor(posicaoX - retangulo.left - deslocamentoCursor, 0, medidas.deslocamentoMaximo);
            var progresso = novaPosicao / medidas.deslocamentoMaximo;
            lista.scrollLeft = progresso * medidas.rolagemMaxima;
            atualizarBarra();
        }
        barra.addEventListener('pointerdown', function (evento) {
            if (evento.pointerType === 'mouse' && evento.button !== 0)
                return;
            if (obterMedidas().rolagemMaxima <= 0)
                return;
            var cursorClicado = evento.target === cursor || cursor.contains(evento.target);
            if (cursorClicado) {
                deslocamentoCursor = evento.clientX - cursor.getBoundingClientRect().left;
            }
            else {
                deslocamentoCursor = cursor.offsetWidth / 2;
                moverListaPeloCursor(evento.clientX);
            }
            arrastando = true;
            barra.setPointerCapture(evento.pointerId);
            evento.preventDefault();
        });
        barra.addEventListener('pointermove', function (evento) {
            if (!arrastando)
                return;
            moverListaPeloCursor(evento.clientX);
        });
        function finalizarArraste() {
            arrastando = false;
        }
        barra.addEventListener('pointerup', finalizarArraste);
        barra.addEventListener('pointercancel', finalizarArraste);
        barra.addEventListener('lostpointercapture', finalizarArraste);
        /* A rolagem vertical nativa não é interceptada nem modificada aqui. */
        lista.addEventListener('scroll', atualizarBarra, false);
        window.addEventListener('resize', atualizarBarra, false);
        barra.addEventListener('keydown', function (evento) {
            var passo = 40;
            var maximo = Math.max(0, lista.scrollWidth - lista.clientWidth);
            if (evento.key === 'ArrowRight') {
                lista.scrollLeft = Math.min(maximo, lista.scrollLeft + passo);
            }
            else if (evento.key === 'ArrowLeft') {
                lista.scrollLeft = Math.max(0, lista.scrollLeft - passo);
            }
            else if (evento.key === 'Home') {
                lista.scrollLeft = 0;
            }
            else if (evento.key === 'End') {
                lista.scrollLeft = maximo;
            }
            else {
                return;
            }
            evento.preventDefault();
            atualizarBarra();
        });
        if (typeof ResizeObserver !== 'undefined') {
            var observadorDeTamanho_1 = new ResizeObserver(atualizarBarra);
            observadorDeTamanho_1.observe(lista);
            observadorDeTamanho_1.observe(trilho);
            Array.from(lista.children).forEach(function (item) {
                observadorDeTamanho_1.observe(item);
            });
        }
        if (typeof MutationObserver !== 'undefined') {
            var observadorDeConteudo = new MutationObserver(function () {
                atualizarBarra();
            });
            observadorDeConteudo.observe(lista, {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true
            });
        }
        atualizarBarra();
    });
})();
/* ID: JS-007 | REF: COMPONENT.SCROLLBAR.VERTICAL | CONTROLADORES INDEPENDENTES */
/* Cada barra manipula exclusivamente o scrollTop do elemento indicado em data-scrollbar-for. */
(function configurarBarrasVerticais() {
    var barras = document.querySelectorAll('.ci-scrollbar-vertical[data-scrollbar-for]');
    if (!barras.length)
        return;
    barras.forEach(function (barra) {
        if (barra.dataset.scrollInitialized === 'vertical')
            return;
        var lista = document.getElementById(barra.dataset.scrollbarFor);
        var trilho = barra.querySelector('.ci-scrollbar-trilho');
        var cursor = barra.querySelector('.ci-scrollbar-cursor');
        var ancora = barra.parentElement;
        if (!lista || !trilho || !cursor || !ancora)
            return;
        barra.dataset.scrollInitialized = 'vertical';
        var arrastando = false;
        var deslocamentoCursor = 0;
        function medidas() {
            var alturaTrilho = trilho.clientHeight;
            var alturaVisivel = lista.clientHeight;
            var alturaTotal = lista.scrollHeight;
            var rolagemMaxima = Math.max(0, alturaTotal - alturaVisivel);
            if (!alturaTrilho || !alturaVisivel || !alturaTotal) {
                return { alturaTrilho: alturaTrilho, alturaCursor: 0, deslocamentoMaximo: 0, rolagemMaxima: rolagemMaxima };
            }
            var proporcao = rolagemMaxima > 0 ? alturaVisivel / alturaTotal : 1;
            var alturaMinima = Math.min(26, alturaTrilho);
            var alturaCursor = Math.min(alturaTrilho, Math.max(alturaMinima, alturaTrilho * proporcao));
            return {
                alturaTrilho: alturaTrilho,
                alturaCursor: alturaCursor,
                deslocamentoMaximo: Math.max(0, alturaTrilho - alturaCursor),
                rolagemMaxima: rolagemMaxima
            };
        }
        function posicionar() {
    var largura = barra.offsetWidth || 10;
    var deslocamentoX = Number.parseFloat(
        barra.dataset.offsetX || '0'
    ) || 0;

    var ancoraRect = ancora.getBoundingClientRect();
    var listaRect = lista.getBoundingClientRect();

    barra.style.top = (
        listaRect.top -
        ancoraRect.top -
        ancora.clientTop +
        ancora.scrollTop
    ) + 'px';

    barra.style.left = (
        lista.offsetLeft +
        lista.clientWidth -
        largura +
        deslocamentoX
    ) + 'px';

    barra.style.height = lista.clientHeight + 'px';
}
        function atualizar() {
            posicionar();
            var m = medidas();
            var rolavel = m.rolagemMaxima > 0 && m.alturaTrilho > 0;
            barra.hidden = !rolavel;
            barra.setAttribute('aria-disabled', rolavel ? 'false' : 'true');
            if (!rolavel) {
                cursor.style.height = '0px';
                cursor.style.top = '0px';
                barra.setAttribute('aria-valuenow', '0');
                return;
            }
            var progresso = limitarValor(lista.scrollTop / m.rolagemMaxima, 0, 1);
            cursor.style.height = m.alturaCursor + 'px';
            cursor.style.top = (m.deslocamentoMaximo * progresso) + 'px';
            barra.setAttribute('aria-valuenow', String(Math.round(progresso * 100)));
        }
        function moverLista(posicaoY) {
            var m = medidas();
            if (m.rolagemMaxima <= 0 || m.deslocamentoMaximo <= 0)
                return;
            var r = trilho.getBoundingClientRect();
            var escala = r.height / (trilho.clientHeight || 1);
            var posicao = (posicaoY - r.top) / (escala || 1);
            var cursorTop = limitarValor(posicao - deslocamentoCursor, 0, m.deslocamentoMaximo);
            lista.scrollTop = (cursorTop / m.deslocamentoMaximo) * m.rolagemMaxima;
            atualizar();
        }
        barra.addEventListener('pointerdown', function (evento) {
            if (evento.pointerType === 'mouse' && evento.button !== 0)
                return;
            var m = medidas();
            if (m.rolagemMaxima <= 0)
                return;
            var cursorRect = cursor.getBoundingClientRect();
            var trilhoRect = trilho.getBoundingClientRect();
            var clicouNoCursor = evento.clientY >= cursorRect.top && evento.clientY <= cursorRect.bottom;
            var escala = trilhoRect.height / (trilho.clientHeight || 1);
            deslocamentoCursor = clicouNoCursor
                ? (evento.clientY - cursorRect.top) / (escala || 1)
                : m.alturaCursor / 2;
            arrastando = true;
            barra.setPointerCapture(evento.pointerId);
            if (!clicouNoCursor)
                moverLista(evento.clientY);
            evento.preventDefault();
        });
        barra.addEventListener('pointermove', function (evento) {
            if (arrastando)
                moverLista(evento.clientY);
        });
        var finalizarArraste = function () { arrastando = false; };
        barra.addEventListener('pointerup', finalizarArraste);
        barra.addEventListener('pointercancel', finalizarArraste);
        barra.addEventListener('lostpointercapture', finalizarArraste);
        lista.addEventListener('scroll', atualizar, false);
        window.addEventListener('resize', atualizar, false);
        barra.addEventListener('keydown', function (evento) {
            var passo = Math.max(24, Math.round(lista.clientHeight * 0.15));
            var maximo = Math.max(0, lista.scrollHeight - lista.clientHeight);
            if (evento.key === 'ArrowDown')
                lista.scrollTop = Math.min(maximo, lista.scrollTop + passo);
            else if (evento.key === 'ArrowUp')
                lista.scrollTop = Math.max(0, lista.scrollTop - passo);
            else if (evento.key === 'PageDown')
                lista.scrollTop = Math.min(maximo, lista.scrollTop + lista.clientHeight);
            else if (evento.key === 'PageUp')
                lista.scrollTop = Math.max(0, lista.scrollTop - lista.clientHeight);
            else if (evento.key === 'Home')
                lista.scrollTop = 0;
            else if (evento.key === 'End')
                lista.scrollTop = maximo;
            else
                return;
            evento.preventDefault();
            atualizar();
        });
        if (typeof ResizeObserver !== 'undefined') {
            var resize_1 = new ResizeObserver(atualizar);
            resize_1.observe(lista);
            resize_1.observe(ancora);
            Array.from(lista.children).forEach(function (item) { return resize_1.observe(item); });
            // Mantém uma referência por barra durante todo o ciclo de vida do componente.
            barra._ciResizeObserver = resize_1;
        }
        if (typeof MutationObserver !== 'undefined') {
            var mutations = new MutationObserver(atualizar);
            mutations.observe(lista, { childList: true, subtree: true, characterData: true, attributes: true });
            barra._ciMutationObserver = mutations;
        }
        atualizar();
    });
})();
/* ID: JS-009 | REF: APP.SIDEBAR.SEARCH | FILTRO DOS ITENS DO MENU LATERAL */
(function configurarPesquisaLateral() {
    var campo = document.querySelector(".menu-lateral-pesquisa input[type='search']");
    var botoes = Array.from(document.querySelectorAll(".menu-lateral-botoes .botao-menu-lateral"));
    var aviso = document.querySelector(".menu-lateral-sem-resultados");
    if (!campo || !botoes.length)
        return;
    function normalizar(texto) {
        var valor = String(texto).toLowerCase();
        if (typeof valor.normalize === "function") {
            valor = valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        } else {
            valor = valor.replace(/[áàâãäéèêëíìîïóòôõöúùûüçñ]/g, function (caractere) {
                var equivalencias = {
                    "á": "a", "à": "a", "â": "a", "ã": "a", "ä": "a",
                    "é": "e", "è": "e", "ê": "e", "ë": "e",
                    "í": "i", "ì": "i", "î": "i", "ï": "i",
                    "ó": "o", "ò": "o", "ô": "o", "õ": "o", "ö": "o",
                    "ú": "u", "ù": "u", "û": "u", "ü": "u",
                    "ç": "c", "ñ": "n"
                };
                return equivalencias[caractere] || caractere;
            });
        }
        return valor.trim();
    }
    campo.addEventListener("input", function () {
        var termo = normalizar(campo.value);
        var quantidadeVisivel = 0;
        botoes.forEach(function (botao) {
            var corresponde = !termo || normalizar(botao.textContent).indexOf(termo) !== -1;
            botao.hidden = !corresponde;
            if (corresponde)
                quantidadeVisivel++;
        });
        if (aviso)
            aviso.hidden = quantidadeVisivel > 0;
    });
})();
