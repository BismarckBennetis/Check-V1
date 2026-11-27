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
})();
