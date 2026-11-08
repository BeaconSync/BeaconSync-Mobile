import { useMemo, useState } from "react";

import type { PessoaResumo } from "../types/pessoa";

function normalizarTexto(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function useBuscaPessoas(pessoas: PessoaResumo[]) {
  const [busca, setBusca] = useState("");

  const pessoasFiltradas = useMemo(() => {
    const termo = normalizarTexto(busca);

    return pessoas.filter((pessoa) =>
      normalizarTexto(pessoa.nome).includes(termo)
    );
  }, [busca, pessoas]);

  return {
    busca,
    setBusca,
    pessoasFiltradas,
  };
}