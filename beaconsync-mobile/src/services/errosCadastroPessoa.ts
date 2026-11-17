import { ErroApi } from "./http";

type CadastroExistente = {
  pessoaId: string;
};

function objeto(
  valor: unknown
): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

export function obterCadastroExistente(
  erro: unknown
): CadastroExistente | null {
  if (!(erro instanceof ErroApi) || erro.status !== 409) {
    return null;
  }

  if (!objeto(erro.dados)) {
    return null;
  }

  const recursoId = erro.dados.recursoId;

  if (
    typeof recursoId !== "number" ||
    !Number.isSafeInteger(recursoId) ||
    recursoId <= 0
  ) {
    return null;
  }

  return {
    pessoaId: String(recursoId),
  };
}