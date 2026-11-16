import {
  ErroApi,
  http,
  type OpcoesHttp,
  type Servico,
} from "./http";

import {
  obterToken,
  renovarToken,
  tokenAtual,
  versaoSessao,
} from "./sessao";

export async function api<T>(
  servico: Servico,
  caminho: string,
  opcoes: OpcoesHttp = {},
): Promise<T> {
  const versao = versaoSessao();
  const token = await obterToken();

  const conferirSessao = () => {
    if (versao !== versaoSessao()) {
      throw new Error(
        "A sessão foi alterada.",
      );
    }
  };

  conferirSessao();

  try {
    const resposta = await http<T>(
      servico,
      caminho,
      opcoes,
      token,
    );

    conferirSessao();

    return resposta;
  } catch (erro) {
    conferirSessao();

    if (
      !(erro instanceof ErroApi) ||
      erro.status !== 401
    ) {
      throw erro;
    }

    const atual = tokenAtual();

    const novo =
      atual && atual !== token
        ? atual
        : await renovarToken();

    conferirSessao();

    // Só uma repetição.
    // Um segundo 401 é devolvido à tela.
    const resposta = await http<T>(
      servico,
      caminho,
      opcoes,
      novo,
    );

    conferirSessao();

    return resposta;
  }
}