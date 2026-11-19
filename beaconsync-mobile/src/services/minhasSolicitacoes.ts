import { api } from "./api";
import { ErroApi } from "./http";
import { normalizarPaginaJava } from "./paginacaoJava";
import { versaoSessao } from "./sessao";

import type {
  SolicitacaoVinculoEnviada,
} from "../types/solicitacaoVinculo";

function objeto(
  valor: unknown,
): valor is Record<string, unknown> {
  return (
    typeof valor === "object" &&
    valor !== null &&
    !Array.isArray(valor)
  );
}

function dataValida(valor: unknown): valor is string {
  return (
    typeof valor === "string" &&
    Boolean(valor.trim()) &&
    Number.isFinite(Date.parse(valor))
  );
}

function converter(
  valor: unknown,
): SolicitacaoVinculoEnviada {
  if (
    !objeto(valor) ||
    typeof valor.id !== "number" ||
    !Number.isSafeInteger(valor.id) ||
    valor.id <= 0 ||
    typeof valor.parentesco !== "string" ||
    !valor.parentesco.trim() ||
    !dataValida(valor.criadaEm) ||
    !(
      valor.decididaEm === null ||
      dataValida(valor.decididaEm)
    ) ||
    !(
      valor.status === "PENDENTE" ||
      valor.status === "ATIVO" ||
      valor.status === "RECUSADO"
    ) ||
    (
      valor.status === "PENDENTE" &&
      valor.decididaEm !== null
    )
  ) {
    throw new Error(
      "A API retornou uma solicitação em formato inválido.",
    );
  }

  return {
    id: String(valor.id),
    vinculo: valor.parentesco.trim(),
    mensagem: "",
    criadaEm: valor.criadaEm,
    decididaEm: valor.decididaEm,
    status:
      valor.status === "PENDENTE"
        ? "pendente"
        : valor.status === "ATIVO"
          ? "aprovada"
          : "recusada",
  };
}

export async function consultarMinhasSolicitacoes():
  Promise<SolicitacaoVinculoEnviada[]> {
  const versao = versaoSessao();

  const encontrados = new Map<
    string,
    SolicitacaoVinculoEnviada
  >();

  let totalEsperado: number | undefined;

  function conferirSessao() {
    if (versaoSessao() !== versao) {
      throw new Error(
        "A sessão mudou. Abra novamente suas solicitações.",
      );
    }
  }

  for (let numero = 0; numero < 100; numero++) {
    conferirSessao();

    let resposta: unknown;

    try {
      resposta = await api<unknown>(
        "java",
        `/api/v1/vinculos/minhas-solicitacoes?page=${numero}&size=50`,
      );
    } catch (erro) {
      conferirSessao();

      if (erro instanceof ErroApi && erro.status === 404) {
        throw new Error(
          "A consulta de solicitações ainda não está disponível na API. Confirme a atualização do Java.",
        );
      }

      if (erro instanceof ErroApi && erro.status === 403) {
        throw new Error(
          "Sua conta não tem permissão para consultar estes pedidos.",
        );
      }

      throw erro;
    }

    conferirSessao();

    const pagina = normalizarPaginaJava(resposta);

    if (
      pagina.number !== numero ||
      (
        totalEsperado !== undefined &&
        totalEsperado !== pagina.totalElements
      )
    ) {
      throw new Error(
        "A lista mudou durante a consulta. Atualize para consultar novamente.",
      );
    }

    totalEsperado = pagina.totalElements;

    for (const valor of pagina.content) {
      const item = converter(valor);

      if (encontrados.has(item.id)) {
        throw new Error(
          "A lista mudou durante a consulta. Atualize para consultar novamente.",
        );
      }

      encontrados.set(item.id, item);
    }

    if (pagina.last) {
      if (encontrados.size !== totalEsperado) {
        throw new Error(
          "A API retornou uma lista incompleta. Tente novamente.",
        );
      }

      return [...encontrados.values()];
    }
  }

  throw new Error(
    "A lista ultrapassou o limite de consulta do aplicativo.",
  );
}