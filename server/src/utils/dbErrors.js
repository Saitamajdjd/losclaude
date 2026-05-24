function getDbErrorMessage(err) {
  switch (err.code) {
    case 'ER_ACCESS_DENIED_ERROR':
      return 'Acesso negado ao banco. Verifique DB_USER e DB_PASSWORD no arquivo .env.';
    case 'ER_BAD_DB_ERROR':
      return 'Banco de dados não encontrado. Crie o banco no RDS e execute o schema.sql.';
    case 'ER_NO_SUCH_TABLE':
      return 'Tabela não encontrada. Reinicie o servidor para criar a tabela de usuários.';
    case 'ER_BAD_FIELD_ERROR':
      return 'Estrutura da tabela users incompatível. Reinicie o servidor para aplicar a migração.';
    case 'ECONNREFUSED':
    case 'ENOTFOUND':
    case 'ETIMEDOUT':
    case 'PROTOCOL_CONNECTION_LOST':
      return 'Não foi possível conectar ao MySQL. Verifique DB_HOST, rede e Security Group do RDS.';
    default:
      return 'Erro de conexão com o banco de dados. Tente novamente em instantes.';
  }
}

module.exports = { getDbErrorMessage };
