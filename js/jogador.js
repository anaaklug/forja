// jogador.js — gerencia XP, nível e streak do jogador

const Jogador = {

  // Configuração dos níveis — quantos XP precisa para cada um
  niveis: [
    { nivel: 1, nome: "Novato",            xpNecessario: 0   },
    { nivel: 2, nome: "Aprendiz",          xpNecessario: 100 },
    { nivel: 3, nome: "Ferreiro Aprendiz", xpNecessario: 250 },
    { nivel: 4, nome: "Ferreiro",          xpNecessario: 500 },
    { nivel: 5, nome: "Ferreiro Hábil",    xpNecessario: 900 },
    { nivel: 6, nome: "Mestre Ferreiro",   xpNecessario: 1400 },
    { nivel: 7, nome: "Lenda da Forja",    xpNecessario: 2000 },
    { nivel: 8, nome: "Imortal da Forja",  xpNecessario: 2800 },
  ],

  // Carrega os dados do jogador do localStorage
  // Se não existir, cria um jogador do zero
  carregar() {
    return Storage.carregar("jogador", {
      nome: "Guerreiro",
      xp: 0,
      nivel: 1,
      streak: 0,
      ultimoLogin: null,
    });
  },

  // Salva os dados do jogador no localStorage
  salvar(jogador) {
    Storage.salvar("jogador", jogador);
  },

  // Adiciona XP e verifica se subiu de nível
  // Retorna { jogador, subioDeNivel }
  ganharXP(quantidade) {
    const jogador = this.carregar();
    jogador.xp += quantidade;

    const nivelAnterior = jogador.nivel;
    jogador.nivel = this.calcularNivel(jogador.xp);

    this.salvar(jogador);

    return {
      jogador,
      subioDeNivel: jogador.nivel > nivelAnterior,
    };
  },

  // Descobre em qual nível o jogador está com base no XP total
  calcularNivel(xp) {
    let nivelAtual = 1;
    for (const n of this.niveis) {
      if (xp >= n.xpNecessario) {
        nivelAtual = n.nivel;
      }
    }
    return nivelAtual;
  },

  // Retorna quantos XP faltam para o próximo nível
  xpParaProximoNivel(xp, nivelAtual) {
    const proximo = this.niveis.find(n => n.nivel === nivelAtual + 1);
    if (!proximo) return null; // já está no nível máximo
    return proximo.xpNecessario - xp;
  },

  // Atualiza o streak ao abrir o app
  atualizarStreak() {
    const jogador = this.carregar();
    const hoje = new Date().toDateString();

    if (jogador.ultimoLogin === hoje) {
      // Já fez login hoje, não muda nada
      return jogador;
    }

    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);

    if (jogador.ultimoLogin === ontem.toDateString()) {
      // Fez login ontem — mantém a sequência
      jogador.streak += 1;
    } else {
      // Quebrou a sequência
      jogador.streak = 1;
    }

    jogador.ultimoLogin = hoje;
    this.salvar(jogador);
    return jogador;
  },

  // Retorna o nome do nível atual
  nomeDoNivel(nivel) {
    const encontrado = this.niveis.find(n => n.nivel === nivel);
    return encontrado ? encontrado.nome : "Desconhecido";
  },

};