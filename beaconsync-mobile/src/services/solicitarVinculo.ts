import { api } from "./api";

import type {
  EnviarSolicitacaoVinculo,
} from "../types/solicitacaoVinculo";

export function criarSolicitacaoVinculo(
  pessoaId: string
): EnviarSolicitacaoVinculo {
  return async (dados) => {
    if (
      !/^[1-9]\d*$/.test(pessoaId) ||
      !Number.isSafeInteger(Number(pessoaId)) ||
      dados.referenciaCadastro !== pessoaId
    ) {
      throw new Error(
        "Não foi possível identificar o cadastro. Volte e confira os dados informados."
      );
    }

    const parentesco = dados.vinculo.trim();

    const vinculosValidos = [
      "Familiar",
      "Amigo",
      "Cuidador",
      "Outro",
    ];

    if (!vinculosValidos.includes(parentesco)) {
      throw new Error(
        "Selecione um vínculo válido."
      );
    }

    if (dados.mensagem.trim()) {
      throw new Error(
        "O envio de mensagem junto à solicitação ainda não está disponível."
      );
    }

    const resposta = await api<unknown>(
      "java",
      `/api/v1/pessoas/${encodeURIComponent(pessoaId)}/vinculos`,
      {
        metodo: "POST",
        dados: {
          parentesco,
        },
      }
    );

    if (
      typeof resposta !== "object" ||
      resposta === null ||
      !("id" in resposta) ||
      typeof resposta.id !== "number" ||
      !Number.isSafeInteger(resposta.id) ||
      resposta.id <= 0 ||
      !("pessoaId" in resposta) ||
      resposta.pessoaId !== Number(pessoaId) ||
      !("status" in resposta) ||
      resposta.status !== "PENDENTE" ||
      !("parentesco" in resposta) ||
      resposta.parentesco !== parentesco
    ) {
      throw new Error(
        "A API respondeu, mas não foi possível confirmar o pedido. Confira com o responsável antes de tentar novamente."
      );
    }

    return {
      id: String(resposta.id),
      status: "pendente",
    };
  };
}