import { api } from "./api";
import { versaoSessao } from "./sessao";

import type {
  DecisaoVinculo,
  SolicitacaoVinculoRecebida,
} from "../types/solicitacaoVinculo";

type VinculoApi = {
  id: number;
  pessoaId: number;
  usuarioId: number;
  usuarioNome: string;
  parentesco: string;
  status: "PENDENTE" | "ATIVO" | "RECUSADO";
  criadoEm: string | null;
};

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

function vinculoValido(valor: unknown): valor is VinculoApi {
  return (
    objeto(valor) &&
    idValido(valor.id) &&
    idValido(valor.pessoaId) &&
    idValido(valor.usuarioId) &&
    typeof valor.usuarioNome === "string" &&
    Boolean(valor.usuarioNome.trim()) &&
    typeof valor.parentesco === "string" &&
    (
      valor.status === "PENDENTE" ||
      valor.status === "ATIVO" ||
      valor.status === "RECUSADO"
    ) &&
    (
      valor.criadoEm === null ||
      typeof valor.criadoEm === "string"
    )
  );
}

function conferirSessao(versao: number) {
  if (versaoSessao() !== versao) {
    throw new Error(
      "A sessão mudou. Abra novamente as solicitações."
    );
  }
}

export async function consultarSolicitacoesRecebidas():
  Promise<SolicitacaoVinculoRecebida[]> {
  const versao = versaoSessao();

  const resposta = await api<unknown>(
    "java",
    "/api/v1/vinculos/pendentes"
  );

  conferirSessao(versao);

  if (
    !Array.isArray(resposta) ||
    !resposta.every(vinculoValido)
  ) {
    throw new Error(
      "A API devolveu solicitações inválidas."
    );
  }

  if (resposta.some((item) => item.status !== "PENDENTE")) {
    throw new Error(
      "A consulta retornou um pedido que não está pendente."
    );
  }

  const nomes = new Map<number, string>();

  const pessoas = [
    ...new Set(resposta.map((item) => item.pessoaId)),
  ];

  for (const pessoaId of pessoas) {
    conferirSessao(versao);

    const pessoa = await api<unknown>(
      "java",
      `/api/v1/pessoas/${pessoaId}`
    );

    conferirSessao(versao);

    if (
      !objeto(pessoa) ||
      pessoa.id !== pessoaId ||
      typeof pessoa.nome !== "string" ||
      !pessoa.nome.trim()
    ) {
      throw new Error(
        "Não foi possível identificar a pessoa do pedido."
      );
    }

    nomes.set(pessoaId, pessoa.nome.trim());
  }

  return resposta.map((item) => ({
    id: String(item.id),
    pessoaId: String(item.pessoaId),
    pessoaNome: nomes.get(item.pessoaId)!,
    solicitanteNome: item.usuarioNome.trim(),
    vinculo: item.parentesco,
    mensagem: "",
    criadaEm: item.criadoEm,
    status: "pendente",
    podeDecidir: true,
  }));
}

export async function responderSolicitacaoRecebida(
  original: SolicitacaoVinculoRecebida,
  decisao: DecisaoVinculo
): Promise<SolicitacaoVinculoRecebida> {
  if (
    !/^[1-9]\d*$/.test(original.id) ||
    !idValido(Number(original.id)) ||
    original.status !== "pendente" ||
    !original.podeDecidir ||
    (
      decisao !== "aprovada" &&
      decisao !== "recusada"
    )
  ) {
    throw new Error("Solicitação ou decisão inválida.");
  }

  const versao = versaoSessao();

  const resposta = await api<unknown>(
    "java",
    `/api/v1/vinculos/${original.id}`,
    {
      metodo: "PATCH",
      dados: {
        aprovar: decisao === "aprovada",
      },
    }
  );

  conferirSessao(versao);

  if (
    !vinculoValido(resposta) ||
    String(resposta.id) !== original.id ||
    String(resposta.pessoaId) !== original.pessoaId ||
    resposta.status !== (
      decisao === "aprovada" ? "ATIVO" : "RECUSADO"
    )
  ) {
    throw new Error(
      "Não foi possível confirmar a decisão. Atualize a consulta."
    );
  }

  return {
    ...original,
    solicitanteNome: resposta.usuarioNome.trim(),
    vinculo: resposta.parentesco,
    criadaEm: resposta.criadoEm,
    status: decisao,
    podeDecidir: false,
  };
}