import { api } from "./api";
import { ErroApi } from "./http";

export async function removerMeuVinculo(
  pessoaId: string,
): Promise<void> {
  if (
    !/^[1-9]\d*$/.test(pessoaId) ||
    !Number.isSafeInteger(Number(pessoaId))
  ) {
    throw new Error(
      "Não foi possível identificar o cadastro da pessoa.",
    );
  }

  try {
    await api<void>(
      "java",
      `/api/v1/pessoas/${encodeURIComponent(pessoaId)}/vinculos/me`,
      {
        metodo: "DELETE",
      },
    );
  } catch (erro) {
    if (erro instanceof ErroApi) {
      if (erro.status === 409) {
        throw new Error(
          "Você é a última pessoa com vínculo ativo. Aprove outro responsável antes de parar de acompanhar.",
        );
      }

      if (erro.status === 403) {
        throw new Error(
          "Sua conta não tem permissão para remover este vínculo. Atualize a lista de pessoas.",
        );
      }

      if (erro.status === 404 || erro.status === 405) {
        throw new Error(
          "A remoção do vínculo ainda não está disponível na API. Confirme a atualização do Java.",
        );
      }
    }

    throw erro;
  }
}