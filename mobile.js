/* ==========================================================
   CHECK — MOBILE.JS
   Responsabilidade: comportamentos exclusivos da interface mobile.
   - abertura e recolhimento do menu lateral;
   - formato curto das datas de vencimento;
   - efeito de profundidade no carrossel horizontal.
========================================================== */

(function () {
    "use strict";

    /* ==========================================================
       MOBJS-001 | MENU LATERAL MOBILE
    ========================================================== */
    var botaoMenu = document.querySelector("[data-menu-lateral-toggle]");
    var painelLateral = document.getElementById("painel-esquerdo");

    if (botaoMenu && painelLateral) {
        function atualizarEstado(aberto, animarEntrada) {
            var estavaFechado = painelLateral.hidden;
            painelLateral.hidden = !aberto;

            if (aberto && animarEntrada && estavaFechado) {
                painelLateral.classList.remove("painel-abrindo");
                /* Reinicia a animação a cada abertura. */
                void painelLateral.offsetWidth;
                painelLateral.classList.add("painel-abrindo");
            } else if (!aberto) {
                painelLateral.classList.remove("painel-abrindo");
            }

            botaoMenu.setAttribute("aria-expanded", aberto ? "true" : "false");
            botaoMenu.setAttribute(
                "aria-label",
                aberto ? "Recolher menu lateral" : "Abrir menu lateral"
            );
        }

        /* O menu inicia recolhido no Check mobile. */
        atualizarEstado(false, false);

        botaoMenu.addEventListener("click", function () {
            atualizarEstado(painelLateral.hidden, true);
        });

        /* Clique fora recolhe o menu aberto. */
        document.addEventListener("click", function (evento) {
            if (painelLateral.hidden) return;
            if (painelLateral.contains(evento.target) || botaoMenu.contains(evento.target)) {
                return;
            }
            atualizarEstado(false, false);
        }, false);

        /* Escape recolhe o menu e devolve o foco ao botão. */
        document.addEventListener("keydown", function (evento) {
            if (painelLateral.hidden) return;
            if (evento.key === "Escape" || evento.key === "Esc") {
                atualizarEstado(false, false);
                botaoMenu.focus();
            }
        }, false);
    }

    /* ==========================================================
       MOBJS-002 | FORMATO CURTO DAS DATAS DE VENCIMENTO
    ========================================================== */
    function atualizarFormatoDatasVencimento() {
        var datas = document.querySelectorAll(".financeiro-conta-data[datetime]");

        datas.forEach(function (elemento) {
            var dataISO = elemento.getAttribute("datetime");
            var partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataISO || "");
            if (!partes) return;

            var dataCurta = partes[3] + "/" + partes[2] + "/" + partes[1].slice(-2);
            if (elemento.textContent.trim() !== dataCurta) {
                elemento.textContent = dataCurta;
            }
        });
    }

    atualizarFormatoDatasVencimento();

    /* ==========================================================
       MOBJS-003 | EFEITO DE PROFUNDIDADE DO CARROSSEL MOBILE
    ========================================================== */
    function configurarEfeitoProfundidadeCarrossel() {
        var faixaCarrossel = document.querySelector(".grade-cards");
        if (!faixaCarrossel || !faixaCarrossel.children || !faixaCarrossel.children.length) {
            return;
        }

        var paineisCarrossel = [];
        for (var indicePainel = 0; indicePainel < faixaCarrossel.children.length; indicePainel++) {
            var painelAtual = faixaCarrossel.children[indicePainel];
            var identificador = painelAtual.getAttribute("id");
            var classesPainel = painelAtual.classList;

            if (
                (classesPainel && classesPainel.contains("card-financeiro")) ||
                (classesPainel && classesPainel.contains("card-estudo")) ||
                identificador === "painel-rotina" ||
                identificador === "painel-compromisso" ||
                identificador === "painel-lembrete"
            ) {
                paineisCarrossel.push(painelAtual);
            }
        }

        if (!paineisCarrossel.length) return;

        var quadroPendente = false;

        function atualizarEfeitoCarrossel() {
            var larguraPainel = faixaCarrossel.clientWidth;
            var estiloFaixa = window.getComputedStyle(faixaCarrossel);
            var espacamentoPainel = parseFloat(estiloFaixa.columnGap) || 0;
            var passoPainel = larguraPainel + espacamentoPainel;
            if (!passoPainel) return;

            var posicaoAtual = faixaCarrossel.scrollLeft / passoPainel;
            posicaoAtual = Math.max(0, Math.min(paineisCarrossel.length - 1, posicaoAtual));

            for (var indice = 0; indice < paineisCarrossel.length; indice++) {
                var progresso = Math.max(-1, Math.min(1, posicaoAtual - indice));
                var distancia = Math.abs(progresso);
                var escala = 1 - (distancia * 0.13);
                var opacidade = 1 - (distancia * 0.52);
                var rotacao = (progresso * -18).toFixed(2) + "deg";

                paineisCarrossel[indice].style.setProperty("--ci-carrossel-escala", escala.toFixed(3));
                paineisCarrossel[indice].style.setProperty("--ci-carrossel-opacidade", opacidade.toFixed(3));
                paineisCarrossel[indice].style.setProperty("--ci-carrossel-rotacao", rotacao);
            }
        }

        function solicitarAtualizacaoCarrossel() {
            if (typeof window.requestAnimationFrame !== "function") {
                atualizarEfeitoCarrossel();
                return;
            }
            if (quadroPendente) return;

            quadroPendente = true;
            window.requestAnimationFrame(function () {
                quadroPendente = false;
                atualizarEfeitoCarrossel();
            });
        }

        if (typeof faixaCarrossel.addEventListener !== "function") return;
        if (!paineisCarrossel[0].style || typeof paineisCarrossel[0].style.setProperty !== "function") return;

        faixaCarrossel.addEventListener("scroll", solicitarAtualizacaoCarrossel, false);
        window.addEventListener("resize", solicitarAtualizacaoCarrossel, false);
        window.addEventListener("orientationchange", solicitarAtualizacaoCarrossel, false);
        solicitarAtualizacaoCarrossel();
    }

    configurarEfeitoProfundidadeCarrossel();

    /* ==========================================================
       MOBJS-004 | RESTAURAR PAINEL ATIVO APÓS ATUALIZAÇÃO
       REF: APP.MOBILE.CAROUSEL.STATE.RESTORE

       FUNÇÃO:
       - Salvar o painel atualmente selecionado.
       - Preservar a seleção durante a atualização.
       - Restaurar o mesmo painel após o carregamento.
       - Evitar flash do primeiro painel.
       - Não alterar a estrutura nem a posição dos painéis.
    ========================================================== */

    function configurarRestauracaoPainelAtivo() {

        var CHAVE_ESTADO = "check_mobile_painel_ativo";
        var CLASSE_RESTAURACAO = "check-restaurando-painel";

        var faixaCarrossel = document.querySelector(".grade-cards");

        var bloquearGravacao = true;
        var indiceSalvo = null;


        /* LIBERAR VISUALIZAÇÃO */

        function liberarCarrossel() {

            document.documentElement.classList.remove(
                CLASSE_RESTAURACAO
            );

        }


        /* VERIFICAR CARROSSEL */

        if (!faixaCarrossel) {

            liberarCarrossel();
            return;

        }


        /* IDENTIFICAR OS CINCO PAINÉIS */

        var paineis = [];

        for (var i = 0; i < faixaCarrossel.children.length; i++) {

            var painel = faixaCarrossel.children[i];

            var id = painel.getAttribute("id");
            var classes = painel.classList;

            if (
                classes.contains("card-financeiro") ||
                classes.contains("card-estudo") ||
                id === "painel-rotina" ||
                id === "painel-compromisso" ||
                id === "painel-lembrete"
            ) {

                paineis.push(painel);

            }

        }


        if (!paineis.length) {

            liberarCarrossel();
            return;

        }


        /* LER PAINEL SALVO */

        try {

            var estadoSalvo = sessionStorage.getItem(CHAVE_ESTADO);

            if (estadoSalvo !== null) {

                var numeroSalvo = Number(estadoSalvo);

                if (
                    Number.isInteger(numeroSalvo) &&
                    numeroSalvo >= 0 &&
                    numeroSalvo < paineis.length
                ) {

                    indiceSalvo = numeroSalvo;

                }

            }

        } catch (erro) {

            indiceSalvo = null;

        }


        /* CALCULAR DISTÂNCIA ENTRE OS PAINÉIS */

        function obterPassoPainel() {

            var estilo = window.getComputedStyle(faixaCarrossel);

            var espacamento = parseFloat(estilo.columnGap) || 0;

            return paineis[0].offsetWidth + espacamento;

        }


        /* IDENTIFICAR PAINEL ATUAL */

        function obterIndiceAtual() {

            var passo = obterPassoPainel();

            if (!passo) return 0;

            var indice = Math.round(
                faixaCarrossel.scrollLeft / passo
            );

            return Math.max(
                0,
                Math.min(paineis.length - 1, indice)
            );

        }


        /* SALVAR PAINEL ATIVO */

        function salvarPainelAtivo() {

            if (bloquearGravacao) return;

            try {

                sessionStorage.setItem(
                    CHAVE_ESTADO,
                    String(obterIndiceAtual())
                );

            } catch (erro) {

                /* Armazenamento indisponível. */

            }

        }


        /* ESCUTAR NAVEGAÇÃO ENTRE OS PAINÉIS */

        faixaCarrossel.addEventListener(
            "scroll",
            salvarPainelAtivo,
            { passive: true }
        );


        /* SALVAR ANTES DE ATUALIZAR OU SAIR */

        window.addEventListener(
            "pagehide",
            salvarPainelAtivo
        );


        /* RESTAURAR PAINEL ANTERIOR */

        function restaurarPainelAtivo() {

            if (indiceSalvo === null) {

                bloquearGravacao = false;

                liberarCarrossel();

                return;

            }


            window.requestAnimationFrame(function () {

                var passo = obterPassoPainel();

                if (passo > 0) {

                    /* DESATIVAR ROLAGEM SUAVE TEMPORARIAMENTE */

                    var comportamentoOriginal =
                        faixaCarrossel.style.scrollBehavior;

                    faixaCarrossel.style.scrollBehavior = "auto";


                    /* RECUPERAR POSIÇÃO DO PAINEL SALVO */

                    faixaCarrossel.scrollLeft =
                        indiceSalvo * passo;


                    /* AGUARDAR POSICIONAMENTO */

                    window.requestAnimationFrame(function () {

                        faixaCarrossel.style.scrollBehavior =
                            comportamentoOriginal;

                        window.requestAnimationFrame(function () {

                            bloquearGravacao = false;

                            salvarPainelAtivo();

                            /* LIBERAR VISUALIZAÇÃO */

                            liberarCarrossel();

                        });

                    });

                } else {

                    bloquearGravacao = false;

                    liberarCarrossel();

                }

            });

        }


        /* AGUARDAR CARREGAMENTO DA PÁGINA */

        if (document.readyState === "complete") {

            restaurarPainelAtivo();

        } else {

            window.addEventListener(
                "load",
                restaurarPainelAtivo,
                { once: true }
            );

        }

    }


    /* INICIALIZAR RESTAURAÇÃO */

    configurarRestauracaoPainelAtivo();

})();
