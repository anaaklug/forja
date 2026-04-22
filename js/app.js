// app.js — controla a navegação e atualiza a interface

// ─── NAVEGAÇÃO ────────────────────────────────────────────────────────────────

function mostrarTela(nomeTela) {
  document.querySelectorAll(".tela").forEach(t => t.classList.remove("ativa"));
  document.getElementById(`tela-${nomeTela}`).classList.add("ativa");

  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("ativo"));
  document.querySelector(`[data-tela="${nomeTela}"]`).classList.add("ativo");
}

// ─── JOGADOR ─────────────────────────────────────────────────────────────────

function atualizarJogador() {
  const jogador = Jogador.carregar();
  const nivelInfo = Jogador.niveis.find(n => n.nivel === jogador.nivel);
  const proximo = Jogador.niveis.find(n => n.nivel === jogador.nivel + 1);

  // Dashboard
  document.getElementById("jogador-nome").textContent = jogador.nome;
  document.getElementById("jogador-nivel").textContent =
    `Nível ${jogador.nivel} — ${Jogador.nomeDoNivel(jogador.nivel)}`;
  document.getElementById("jogador-xp-atual").textContent = jogador.xp;
  document.getElementById("jogador-xp-proximo").textContent =
    proximo ? proximo.xpNecessario : "MAX";

  const porcentagem = proximo
    ? Math.min((jogador.xp / proximo.xpNecessario) * 100, 100)
    : 100;
  document.getElementById("xp-barra-preenchimento").style.width = `${porcentagem}%`;

  // Stats
  document.getElementById("stat-streak").textContent = jogador.streak;
  document.getElementById("stat-xp").textContent = jogador.xp;

  // Tela do personagem
  document.getElementById("personagem-nome").textContent = jogador.nome;
  document.getElementById("personagem-nivel").textContent =
    `Nível ${jogador.nivel} — ${Jogador.nomeDoNivel(jogador.nivel)}`;
  document.getElementById("personagem-xp-atual").textContent = jogador.xp;
  document.getElementById("personagem-xp-proximo").textContent =
    proximo ? proximo.xpNecessario : "MAX";
  document.getElementById("personagem-xp-barra").style.width = `${porcentagem}%`;

  // Sprite — atualiza em todos os containers
  document.querySelectorAll(".sprite-nivel").forEach(s => s.classList.remove("ativo"));
  document.querySelectorAll(`.sprite-nivel[data-nivel="${jogador.nivel}"]`).forEach(s => s.classList.add("ativo"));

  // Grade de evolução
  document.querySelectorAll(".card-nivel").forEach(card => {
    const nivelCard = parseInt(card.dataset.nivel);
    if (nivelCard <= jogador.nivel) {
      card.classList.add("desbloqueado");
    } else {
      card.classList.remove("desbloqueado");
    }
  });
}

// ─── HÁBITOS ─────────────────────────────────────────────────────────────────

function renderizarHabitos() {
  const lista = document.getElementById("lista-habitos");
  const habitos = Habitos.habitosDeHoje();

  // Stat "hoje"
  const total = habitos.length;
  const concluidos = Habitos.concluidosHoje();
  document.getElementById("stat-hoje").textContent = `${concluidos}/${total}`;

  if (habitos.length === 0) {
    lista.innerHTML = `
      <p class="mensagem-vazia">
        Nenhum hábito ainda. Crie o seu primeiro abaixo!
      </p>`;
    return;
  }

  lista.innerHTML = habitos.map(h => {
    const concluido = Habitos.foiConcluidoHoje(h);
    const xp = Habitos.xpPorDificuldade[h.dificuldade];
    return `
      <div class="habito-item ${concluido ? "concluido" : ""}" data-id="${h.id}">
        <button class="habito-check ${concluido ? "feito" : ""}"
          onclick="alternarHabito('${h.id}')">
          ${concluido ? "✓" : ""}
        </button>
        <span class="habito-nome">${h.nome}</span>
        <span class="habito-xp">+${xp} XP</span>
        <button class="habito-excluir" onclick="excluirHabito('${h.id}')">✕</button>
      </div>`;
  }).join("");
}

function alternarHabito(id) {
  const habito = Habitos.carregar().find(h => h.id === id);
  if (!habito) return;

  let resultado;
  if (Habitos.foiConcluidoHoje(habito)) {
    Habitos.desconcluir(id);
  } else {
    resultado = Habitos.concluir(id);
    if (resultado && resultado.subioDeNivel) {
      mostrarLevelUp(resultado.jogador.nivel);
    }
  }

  atualizarJogador();
  renderizarHabitos();
}

function excluirHabito(id) {
  if (!confirm("Quer mesmo excluir este hábito?")) return;
  Habitos.excluir(id);
  renderizarHabitos();
}

// ─── FORMULÁRIO DE NOVO HÁBITO ────────────────────────────────────────────────

function iniciarFormulario() {
  // Botões de frequência
  document.querySelectorAll(".btn-frequencia").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".btn-frequencia").forEach(b => b.classList.remove("ativo"));
      btn.classList.add("ativo");
    });
  });

  // Botões de dificuldade
  document.querySelectorAll(".btn-dificuldade").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".btn-dificuldade").forEach(b => b.classList.remove("ativo"));
      btn.classList.add("ativo");
    });
  });
}

function salvarHabito() {
  const nome = document.getElementById("input-nome").value.trim();
  if (!nome) {
    alert("Dá um nome para o hábito!");
    return;
  }

  const frequencia = document.querySelector(".btn-frequencia.ativo")?.dataset.valor || "diario";
  const dificuldade = document.querySelector(".btn-dificuldade.ativo")?.dataset.valor || "medio";

  Habitos.criar(nome, dificuldade, frequencia);

  // Limpa o formulário
  document.getElementById("input-nome").value = "";
  document.querySelectorAll(".btn-frequencia").forEach(b => b.classList.remove("ativo"));
  document.querySelectorAll(".btn-dificuldade").forEach(b => b.classList.remove("ativo"));
  document.querySelector('[data-valor="diario"]')?.classList.add("ativo");
  document.querySelector('[data-valor="medio"]')?.classList.add("ativo");

  mostrarTela("inicio");
  renderizarHabitos();
}

// ─── LEVEL UP ────────────────────────────────────────────────────────────────

function mostrarLevelUp(novoNivel) {
  const aviso = document.getElementById("aviso-levelup");
  document.getElementById("levelup-nivel").textContent = novoNivel;
  document.getElementById("levelup-nome").textContent = Jogador.nomeDoNivel(novoNivel);
  aviso.classList.add("visivel");
  setTimeout(() => aviso.classList.remove("visivel"), 3000);
}

// ─── TELA DE HÁBITOS COMPLETA ────────────────────────────────────────────────────

function renderizarHabitosCompletos() {
  const lista = document.getElementById("lista-habitos-completa");
  if (!lista) return;

  const habitos = Habitos.carregar();

  if (habitos.length === 0) {
    lista.innerHTML = `
      <p class="mensagem-vazia">
        Nenhum hábito criado ainda.
      </p>`;
    return;
  }

  lista.innerHTML = habitos.map(h => {
    const concluidoHoje = Habitos.foiConcluidoHoje(h);
    const xp = Habitos.xpPorDificuldade[h.dificuldade];
    const totalConclusoes = h.conclusoes.length;
    return `
      <div class="habito-item ${concluidoHoje ? "concluido" : ""}" data-id="${h.id}">
        <button class="habito-check ${concluidoHoje ? "feito" : ""}"
          onclick="alternarHabito('${h.id}'); renderizarHabitosCompletos();">
          ${concluidoHoje ? "✓" : ""}
        </button>
        <div style="flex:1; min-width:0;">
          <span class="habito-nome">${h.nome}</span>
          <div style="font-size:11px; color:var(--cor-texto-suave); margin-top:2px;">
            ${{ diario: "Diário", semanal: "Semanal", mensal: "Mensal" }[h.frequencia] || h.frequencia} · ${totalConclusoes} conclusão(ões)
          </div>
        </div>
        <span class="habito-xp">+${xp} XP</span>
        <button class="habito-excluir"
          onclick="excluirHabito('${h.id}'); renderizarHabitosCompletos();">✕</button>
      </div>`;
  }).join("");
}

// ─── TEMA ─────────────────────────────────────────────────────────

function alternarTema() {
  const html = document.documentElement;
  const temaAtual = html.getAttribute("data-tema");
  const novoTema = temaAtual === "escuro" ? "claro" : "escuro";
  html.setAttribute("data-tema", novoTema);
  Storage.salvar("tema", novoTema);
  document.getElementById("btn-tema").textContent = novoTema === "escuro" ? "☀️" : "🌙";
}

function carregarTema() {
  const temaSalvo = Storage.carregar("tema", "claro");
  document.documentElement.setAttribute("data-tema", temaSalvo);
  const btn = document.getElementById("btn-tema");
  if (btn) btn.textContent = temaSalvo === "escuro" ? "☀️" : "🌙";
}

// ─── INICIALIZAÇÃO ────────────────────────────────────────────────────────────

function init() {
  carregarTema();
  // Preenche a data de hoje no cabeçalho
  const hoje = new Date();
  const opcoes = { weekday: "short", day: "numeric", month: "short" };
  const dataFormatada = hoje.toLocaleDateString("pt-BR", opcoes);
  const elementoData = document.getElementById("data-hoje");
  if (elementoData) elementoData.textContent = dataFormatada;

  Jogador.atualizarStreak();
  atualizarJogador();
  renderizarHabitos();
  renderizarHabitosCompletos();
  iniciarFormulario();
  mostrarTela("inicio");
}

document.addEventListener("DOMContentLoaded", init);