import { api } from "./api";
import { normalizarPaginaJava } from "./paginacaoJava";

export type Distrito = {
  id: number;
  nome: string;
  subprefeitura: string | null;
};

type PaginaDistritos = {
  content: Distrito[];
  number: number;
  totalPages: number;
  last: boolean;
};

function objeto(
  valor: unknown
): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function inteiroNaoNegativo(
  valor: unknown
): valor is number {
  return (
    typeof valor === "number" &&
    Number.isSafeInteger(valor) &&
    valor >= 0
  );
}

function distritoValido(
  valor: unknown
): valor is Distrito {
  if (!objeto(valor)) return false;

  return (
    inteiroNaoNegativo(valor.id) &&
    valor.id > 0 &&
    typeof valor.nome === "string" &&
    valor.nome.trim().length > 0 &&
    (valor.subprefeitura === null ||
      typeof valor.subprefeitura === "string")
  );
}

function paginaValida(
  valor: unknown
): valor is PaginaDistritos {
  if (!objeto(valor)) return false;

  return (
    Array.isArray(valor.content) &&
    valor.content.every(distritoValido) &&
    inteiroNaoNegativo(valor.number) &&
    inteiroNaoNegativo(valor.totalPages) &&
    typeof valor.last === "boolean"
  );
}

export async function consultarDistritos(): Promise<Distrito[]> {
  const distritosPorId = new Map<number, Distrito>();
  let numeroPagina = 0;

  while (true) {
    const resposta = normalizarPaginaJava(
  await api<unknown>(
    "java",
    `/api/v1/distritos?page=${numeroPagina}&size=100&sort=nome,asc&sort=id,asc`
  )
);

    if (
      !paginaValida(resposta) ||
      resposta.number !== numeroPagina
    ) {
      throw new Error(
        "Não foi possível interpretar a lista de distritos."
      );
    }

    for (const distrito of resposta.content) {
      distritosPorId.set(distrito.id, {
        id: distrito.id,
        nome: distrito.nome.trim(),
        subprefeitura: distrito.subprefeitura,
      });
    }

    if (resposta.last) {
      return Array.from(distritosPorId.values()).sort(
        (primeiro, segundo) =>
          primeiro.nome.localeCompare(segundo.nome, "pt-BR")
      );
    }

    if (
      resposta.content.length === 0 ||
      numeroPagina + 1 >= resposta.totalPages
    ) {
      throw new Error(
        "Não foi possível carregar todos os distritos. Tente novamente."
      );
    }

    numeroPagina += 1;
  }
}