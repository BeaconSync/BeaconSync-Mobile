import { api } from "./api";
import { ErroApi } from "./http";

export async function excluirPessoa(
  pessoaId: string
): Promise<void> {
  if (
    !/^[1-9]\d*$/.test(pessoaId) ||
    !Number.isSafeInteger(Number(pessoaId))
  ) {
    throw new Error(
      "O identificador da pessoa é inválido."
    );
  }

  try {
    await api<void>(
      "java",
      `/api/v1/pessoas/${encodeURIComponent(pessoaId)}`,
      {
        metodo: "DELETE",
      }
    );
  } catch (erro) {
    if (
      erro instanceof ErroApi &&
      erro.status === 403
    ) {
      throw new Error(
        "Sua conta não tem permissão para excluir este cadastro."
      );
    }

    if (
      erro instanceof ErroApi &&
      erro.status === 404
    ) {
      throw new Error(
        "O cadastro não foi encontrado. Volte para Pessoas e atualize a lista."
      );
    }

    throw erro;
  }
}