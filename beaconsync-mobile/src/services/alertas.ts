import { api } from "./api";
import { versaoSessao } from "./sessao";
import { normalizarPaginaJava } from "./paginacaoJava";
import type { Alerta } from "../types/alerta";

function objeto(
  valor: unknown
): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function converterAlerta(valor: unknown): Alerta {
  if (
    !objeto(valor) ||
    typeof valor.id !== "number" ||
    !Number.isSafeInteger(valor.id) ||
    valor.id <= 0 ||
    typeof valor.titulo !== "string" ||
    !valor.titulo.trim() ||
    !(
      valor.descricao === null ||
      typeof valor.descricao === "string"
    ) ||
    (
      valor.status !== "ATIVO" &&
      valor.status !== "ENCERRADO"
    ) ||
    !(
      valor.orgaoNome === null ||
      typeof valor.orgaoNome === "string"
    ) ||
    !(
      valor.emitidoEm === null ||
      typeof valor.emitidoEm === "string"
    ) ||
    !Array.isArray(valor.distritos)
  ) {
    throw new Error(
      "A API retornou um alerta em formato inesperado."
    );
  }

  const distritos = valor.distritos.map(
    (distrito: unknown) => {
      if (
        !objeto(distrito) ||
        typeof distrito.nome !== "string" ||
        !distrito.nome.trim()
      ) {
        throw new Error(
          "A API retornou uma região inválida no alerta."
        );
      }

      return distrito.nome.trim();
    }
  );

  return {
    id: String(valor.id),
    titulo: valor.titulo,
    descricao: valor.descricao ?? "",

    status:
      valor.status === "ATIVO"
        ? "ativo"
        : "encerrado",

    area: distritos.join(", ") || null,
    fonte: valor.orgaoNome,
    emitidoEm: valor.emitidoEm,

    nivel: null,
    orientacoes: [],

    pessoasRelacionadas: {
      status: "indisponivel",
    },
  };
}

export async function consultarAlertas():
  Promise<Alerta[]> {
  const versao = versaoSessao();
  const alertas = new Map<string, Alerta>();

  for (let pagina = 0; pagina < 100; pagina += 1) {
    if (versao !== versaoSessao()) {
      throw new Error("A sessão foi alterada.");
    }

const resposta = normalizarPaginaJava(
  await api<unknown>(
    "java",
    `/api/v1/alertas?page=${pagina}&size=50&sort=emitidoEm,desc&sort=id,desc`
  )
);

    if (versao !== versaoSessao()) {
      throw new Error("A sessão foi alterada.");
    }

    if (
      !objeto(resposta) ||
      !Array.isArray(resposta.content) ||
      resposta.number !== pagina ||
      typeof resposta.last !== "boolean" ||
      (
        !resposta.last &&
        resposta.content.length === 0
      )
    ) {
      throw new Error(
        "A API retornou uma página de alertas inválida."
      );
    }

    for (const item of resposta.content) {
      const alerta = converterAlerta(item);
      alertas.set(alerta.id, alerta);
    }

    if (resposta.last) {
      return [...alertas.values()];
    }
  }

  throw new Error(
    "A consulta de alertas excedeu o limite desta tela. A lista completa não foi carregada."
  );
}