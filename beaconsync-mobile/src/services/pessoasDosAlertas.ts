import { api } from "./api";
import { ErroApi } from "./http";
import { versaoSessao } from "./sessao";

import type {
  Alerta,
  EstadoPessoasRelacionadas,
  PessoaRelacionadaAlerta,
} from "../types/alerta";

function objeto(
  valor: unknown
): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function idValido(valor: unknown): valor is number {
  return (
    typeof valor === "number" &&
    Number.isSafeInteger(valor) &&
    valor > 0
  );
}

function converterSituacao(
  valor: unknown
): PessoaRelacionadaAlerta["situacao"] {
  switch (valor) {
    case "PENDENTE":
      return null;

    case "SEGURA":
      return "Seguro";

    case "PRECISA_AJUDA":
      return "Precisa de Ajuda";

    case "SEM_CONTATO":
      return "Sem Contato";

    case "RESGATADA":
      return "Resgatada";

    default:
      throw new Error(
        "A API retornou uma situação não reconhecida."
      );
  }
}

function converterRegistro(valor: unknown): {
  alertaId: string;
  pessoa: PessoaRelacionadaAlerta;
} {
  if (
    !objeto(valor) ||
    !idValido(valor.alertaId) ||
    !idValido(valor.pessoaId) ||
    typeof valor.pessoaNome !== "string" ||
    !valor.pessoaNome.trim() ||
    !(
      valor.enderecoApelido === null ||
      typeof valor.enderecoApelido === "string"
    ) ||
    !(
      valor.respondidoEm === null ||
      typeof valor.respondidoEm === "string"
    )
  ) {
    throw new Error(
      "A API retornou uma pessoa relacionada em formato inesperado."
    );
  }

  return {
    alertaId: String(valor.alertaId),

    pessoa: {
      id: String(valor.pessoaId),
      nome: valor.pessoaNome,
      localReferencia: valor.enderecoApelido,
      situacao: converterSituacao(valor.situacao),
      dataResposta: valor.respondidoEm,
    },
  };
}

export async function completarPessoasDosAlertas(
  alertas: Alerta[]
): Promise<Alerta[]> {
  const versao = versaoSessao();

  const grupos = new Map<
    string,
    Map<string, PessoaRelacionadaAlerta>
  >();

  let falha: EstadoPessoasRelacionadas | null = null;

  if (alertas.some((alerta) => alerta.status === "ativo")) {
    try {
      const resposta = await api<unknown>(
        "java",
        "/api/v1/alertas/ativos/meus"
      );

      if (versao !== versaoSessao()) {
        throw new Error("A sessão foi alterada.");
      }

      if (!Array.isArray(resposta)) {
        throw new Error(
          "A API retornou uma lista de pessoas inválida."
        );
      }

      for (const item of resposta) {
        const { alertaId, pessoa } =
          converterRegistro(item);

        const pessoas =
          grupos.get(alertaId) ??
          new Map<string, PessoaRelacionadaAlerta>();

        pessoas.set(pessoa.id, pessoa);
        grupos.set(alertaId, pessoas);
      }
    } catch (erro) {
      if (
        versao !== versaoSessao() ||
        (
          erro instanceof ErroApi &&
          erro.status === 401
        )
      ) {
        throw erro;
      }

      falha =
        erro instanceof ErroApi && erro.status === 403
          ? {
              status: "indisponivel",
              mensagem:
                "A consulta de pessoas acompanhadas neste alerta está disponível apenas para contas de responsável com acesso autorizado.",
            }
          : {
              status: "erro",
              mensagem:
                erro instanceof Error
                  ? erro.message
                  : "Não foi possível consultar as pessoas relacionadas.",
            };
    }
  }

  if (versao !== versaoSessao()) {
    throw new Error("A sessão foi alterada.");
  }

  return alertas.map((alerta) => ({
    ...alerta,

    pessoasRelacionadas:
      alerta.status === "encerrado"
        ? {
            status: "indisponivel",
            mensagem:
              "A consulta atual retorna pessoas apenas dos alertas ativos. O histórico deste alerta ainda não está disponível nesta tela.",
          }
        : falha ?? {
            status: "sucesso",
            pessoas: [
              ...(grupos.get(alerta.id)?.values() ?? []),
            ],
          },
  }));
}