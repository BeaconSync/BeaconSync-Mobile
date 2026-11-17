import { api } from "./api";
import { versaoSessao } from "./sessao";
import type { VinculoPessoa } from "../types/vinculoPessoa";

type VinculoApi = {
  id: number;
  pessoaId: number;
  usuarioId: number;
  usuarioNome: string;
  parentesco: string;
  status: "ATIVO" | "PENDENTE" | "RECUSADO";
  criadoEm: string;
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
  if (!objeto(valor)) return false;

  return (
    idValido(valor.id) &&
    idValido(valor.pessoaId) &&
    idValido(valor.usuarioId) &&
    typeof valor.usuarioNome === "string" &&
    typeof valor.parentesco === "string" &&
    typeof valor.criadoEm === "string" &&
    (
      valor.status === "ATIVO" ||
      valor.status === "PENDENTE" ||
      valor.status === "RECUSADO"
    )
  );
}

export async function consultarVinculosPessoa(
  pessoaId: string
): Promise<VinculoPessoa[]> {
  if (!/^[1-9]\d*$/.test(pessoaId)) {
    throw new Error("O identificador da pessoa é inválido.");
  }

  const sessaoInicial = versaoSessao();

  const [resposta, usuario] = await Promise.all([
    api<unknown>(
      "java",
      `/api/v1/pessoas/${encodeURIComponent(pessoaId)}/vinculos`
    ),
    api<unknown>("java", "/api/v1/usuarios/me"),
  ]);

  if (versaoSessao() !== sessaoInicial) {
    throw new Error(
      "A sessão mudou durante a consulta. Abra a tela novamente."
    );
  }

  if (!objeto(usuario) || !idValido(usuario.id)) {
    throw new Error(
      "Não foi possível identificar o usuário da sessão."
    );
  }

  if (
    !Array.isArray(resposta) ||
    !resposta.every(vinculoValido)
  ) {
    throw new Error(
      "A API retornou os vínculos em um formato inesperado."
    );
  }

  if (
    resposta.some(
      (vinculo) => String(vinculo.pessoaId) !== pessoaId
    )
  ) {
    throw new Error(
      "Os vínculos recebidos não correspondem à pessoa selecionada."
    );
  }

  const usuarioAtualId = usuario.id;

  return resposta
    .filter((vinculo) => vinculo.status === "ATIVO")
    .map((vinculo) => ({
      id: String(vinculo.id),
      nome: vinculo.usuarioNome,
      vinculo: vinculo.parentesco,

      // Data de criação do registro, não de aprovação.
      desde: vinculo.criadoEm,

      usuarioAtual: vinculo.usuarioId === usuarioAtualId,
    }));
}