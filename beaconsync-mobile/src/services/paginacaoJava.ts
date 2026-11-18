function objeto(
  valor: unknown
): valor is Record<string, unknown> {
  return (
    typeof valor === "object" &&
    valor !== null &&
    !Array.isArray(valor)
  );
}

function inteiro(valor: unknown): valor is number {
  return (
    typeof valor === "number" &&
    Number.isSafeInteger(valor) &&
    valor >= 0
  );
}

export function normalizarPaginaJava(valor: unknown) {
  if (
    !objeto(valor) ||
    !Array.isArray(valor.content)
  ) {
    throw new Error(
      "A API retornou uma lista em formato inesperado."
    );
  }

  // Aceita a paginação dentro de "page" e o formato
  // anterior, que colocava os campos na raiz.
  const pagina =
    valor.page === undefined ? valor : valor.page;

  if (
    !objeto(pagina) ||
    !inteiro(pagina.number) ||
    !inteiro(pagina.totalPages) ||
    !inteiro(pagina.totalElements) ||
    (
      pagina.totalPages === 0 &&
      (
        pagina.number !== 0 ||
        pagina.totalElements !== 0 ||
        valor.content.length !== 0
      )
    ) ||
    (
      pagina.totalPages > 0 &&
      pagina.number >= pagina.totalPages
    ) ||
    valor.content.length > pagina.totalElements
  ) {
    throw new Error(
      "A API retornou informações de paginação inválidas."
    );
  }

  const last =
    pagina.totalPages === 0 ||
    pagina.number + 1 >= pagina.totalPages;

  if (!last && valor.content.length === 0) {
    throw new Error(
      "A API retornou uma página vazia antes do fim da lista."
    );
  }

  return {
    content: valor.content,
    number: pagina.number,
    totalPages: pagina.totalPages,
    totalElements: pagina.totalElements,
    last,
  };
}