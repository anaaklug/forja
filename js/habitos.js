// habitos.js — criar, listar, completar e excluir hábitos

const Habitos = {

  // XP ganho por dificuldade
  xpPorDificuldade: {
    facil:  10,
    medio:  20,
    dificil: 30,
  },

  // Carrega a lista de hábitos do localStorage
  carregar() {
    return Storage.carregar("habitos", []);
  },

  // Salva a lista completa de hábitos
  salvar(habitos) {
    Storage.salvar("habitos", habitos);
  },

  // Cria um novo hábito e adiciona à lista
  criar(nome, dificuldade, frequencia) {
    const habitos = this.carregar();

    const novoHabito = {
      id: Date.now().toString(),
      nome,
      dificuldade,   // "facil", "medio" ou "dificil"
      frequencia,    // "diario", "semana" ou "semanal"
      criadoEm: new Date().toDateString(),
      conclusoes: [], // lista de datas em que foi concluído
    };

    habitos.push(novoHabito);
    this.salvar(habitos);
    return novoHabito;
  },

  // Remove um hábito pelo id
  excluir(id) {
    const habitos = this.carregar();
    const filtrados = habitos.filter(h => h.id !== id);
    this.salvar(filtrados);
  },

  // Marca um hábito como concluído hoje
  // Retorna false se já foi concluído hoje
  concluir(id) {
    const habitos = this.carregar();
    const habito = habitos.find(h => h.id === id);
    if (!habito) return false;

    const hoje = new Date().toDateString();

    // Evita marcar duas vezes no mesmo dia
    if (habito.conclusoes.includes(hoje)) return false;

    habito.conclusoes.push(hoje);
    this.salvar(habitos);

    // Ganha XP de acordo com a dificuldade
    const xpGanho = this.xpPorDificuldade[habito.dificuldade] || 10;
    return Jogador.ganharXP(xpGanho);
  },

  // Desmarca um hábito concluído hoje
 desconcluir(id) {
  const habitos = this.carregar();
  const habito = habitos.find(h => h.id === id);
  if (!habito) return false;

  const hoje = new Date().toDateString();
  if (!habito.conclusoes.includes(hoje)) return false;

  habito.conclusoes = habito.conclusoes.filter(d => d !== hoje);
  this.salvar(habitos);

  // Desconta o XP ganho ao concluir
  const xpPerdido = this.xpPorDificuldade[habito.dificuldade] || 10;
  const jogador = Jogador.carregar();
  jogador.xp = Math.max(0, jogador.xp - xpPerdido);
  jogador.nivel = Jogador.calcularNivel(jogador.xp);
  Jogador.salvar(jogador);

  return true;
},

  // Verifica se um hábito foi concluído hoje
  foiConcluidoHoje(habito) {
    const hoje = new Date().toDateString();
    return habito.conclusoes.includes(hoje);
  },

  // Retorna só os hábitos que devem aparecer hoje
  habitosDeHoje() {
    const habitos = this.carregar();
    const diaDaSemana = new Date().getDay(); // 0 = domingo, 6 = sábado
    const eDiaUtil = diaDaSemana >= 1 && diaDaSemana <= 5;

    return habitos.filter(h => {
      if (h.frequencia === "diario") return true;
      if (h.frequencia === "semana") return eDiaUtil;
      if (h.frequencia === "semanal") {
        // Aparece uma vez por semana — mostra todos os dias
        // mas só permite concluir uma vez por semana
        return true;
      }
      return true;
    });
  },

  // Conta quantos hábitos foram concluídos hoje
  concluidosHoje() {
    return this.habitosDeHoje().filter(h => this.foiConcluidoHoje(h)).length;
  },

};