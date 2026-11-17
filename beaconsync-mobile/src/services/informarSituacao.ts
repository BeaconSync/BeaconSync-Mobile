import { api } from "./api";
import { versaoSessao } from "./sessao";

import type { PessoaDetalhes } from "../types/detalhaPessoa";

import type {
  EnviarSituacao,
  StatusInformado,
} from "../types/informarSituacao";

const situacoes: Record<StatusInformado, string> = {
  Seguro: "SEGURA",
  "Precisa de Ajuda": "PRECISA_AJUDA",
  "Sem Contato": "SEM_CONTATO",
};

function converterId(
  valor: string,
  campo: string
): number {
  const numero = Number(valor);

  if (
    !/^[1-9]\d*$/.test(valor) ||
    !Number.isSafeInteger(numero)
  ) {
    throw new Error(
      `${campo} inválido. Reabra a pessoa pela tela de alertas.`
    );
  }

  return numero;
}

function objeto(
  valor: unknown
): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

export function criarEnvioSituacao(
  pessoa: Pick<PessoaDetalhes, "id" | "enderecos">,
  alertaSelecionadoId: string
): EnviarSituacao {
  return async (dados) => {
    if (dados.alertaId !== alertaSelecionadoId) {
      throw new Error(
        "Selecione novamente o alerta antes de informar a situação."
      );
    }

    const pessoaId = converterId(
      pessoa.id,
      "Cadastro da pessoa"
    );

    const alertaId = converterId(
      alertaSelecionadoId,
      "Alerta"
    );

    if (
      !Object.prototype.hasOwnProperty.call(
        situacoes,
        dados.status
      )
    ) {
      throw new Error(
        "Selecione uma situação válida."
      );
    }

    const situacao = situacoes[dados.status];

    let enderecoId: number | null = null;

    if (dados.enderecoOndeEstaId !== null) {
      const pertenceAPessoa = pessoa.enderecos.some(
        (item) => item.id === dados.enderecoOndeEstaId
      );

      if (!pertenceAPessoa) {
        throw new Error(
          "Selecione um endereço disponível no cadastro desta pessoa."
        );
      }

      enderecoId = converterId(
        dados.enderecoOndeEstaId,
        "Endereço"
      );
    }

    const observacao = dados.observacao.trim();

    if (observacao.length > 500) {
      throw new Error(
        "A observação deve ter no máximo 500 caracteres."
      );
    }

    const versao = versaoSessao();

    const resposta = await api<unknown>(
      "java",
      `/api/v1/alertas/${alertaId}/respostas`,
      {
        metodo: "POST",
        dados: {
          pessoaId,
          situacao,
          enderecoId,
          descricaoLivre: observacao || null,
        },
      }
    );

    if (versao !== versaoSessao()) {
      throw new Error(
        "A sessão mudou. Consulte a situação na conta correta antes de tentar novamente."
      );
    }

    if (
      !objeto(resposta) ||
      resposta.pessoaId !== pessoaId ||
      resposta.alertaId !== alertaId ||
      resposta.situacao !== situacao ||
      typeof resposta.situacaoId !== "number" ||
      !Number.isSafeInteger(resposta.situacaoId) ||
      resposta.situacaoId <= 0 ||
      typeof resposta.respondidoEm !== "string" ||
      !resposta.respondidoEm.trim() ||
      (
        enderecoId !== null &&
        resposta.enderecoId !== enderecoId
      )
    ) {
      throw new Error(
        "A API respondeu, mas não foi possível confirmar a situação registrada. Consulte o alerta antes de tentar novamente."
      );
    }
  };
}