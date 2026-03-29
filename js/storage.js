// storage.js — camada de acesso ao localStorage
// Toda leitura e escrita de dados passa por aqui

const Storage = {

  salvar(chave, valor) {
    localStorage.setItem(chave, JSON.stringify(valor));
  },

  carregar(chave, padrao = null) {
    const dado = localStorage.getItem(chave);
    return dado ? JSON.parse(dado) : padrao;
  },

  remover(chave) {
    localStorage.removeItem(chave);
  },

  limparTudo() {
    localStorage.clear();
  }

};