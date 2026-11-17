import { api } from "./api";

import {
  categoriasVulnerabilidade,
} from "../utils/validarCadatroJava";

import type {
  DadosEdicaoPessoa,
  ErrosEdicaoPessoa,
  SalvarEdicaoPessoa,
} from "../types/editarPessoa";

function nascimentoValido(valor: string) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
    return false;
  }

  const [dia, mes, ano] =
    valor.split("/").map(Number);

  if (ano < 1) return false;

  const data = new Date(0);

  data.setUTCHours(0, 0, 0, 0);
  data.setUTCFullYear(ano, mes - 1, dia);

  const hoje = new Date();

  const limite =
    hoje.getFullYear() * 10000 +
    (hoje.getMonth() + 1) * 100 +
    hoje.getDate();

  return (
    data.getUTCFullYear() === ano &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === dia &&
    ano * 10000 + mes * 100 + dia <= limite
  );
}

export function validarEdicaoPessoa(
  dados: DadosEdicaoPessoa
): ErrosEdicaoPessoa {
  const erros: ErrosEdicaoPessoa = {};

  if (
    !dados.nome.trim() ||
    dados.nome.trim().length > 120
  ) {
    erros.nome =
      "Informe o nome, com até 120 caracteres.";
  }

  if (!nascimentoValido(dados.dataNascimento)) {
    erros.dataNascimento =
      "Informe uma data válida, que não seja futura.";
  }

  const categoriaValida =
    categoriasVulnerabilidade.some(
      (item) =>
        item.valor === dados.tipoVulnerabilidade
    );

  if (!categoriaValida) {
    erros.tipoVulnerabilidade =
      "Selecione a categoria principal.";
  }

  if (
    dados.necessidadesRemocao.trim().length > 500
  ) {
    erros.necessidadesRemocao =
      "Use no máximo 500 caracteres.";
  }

  return erros;
}

export function criarSalvamentoPessoa(
  pessoaId: string
): SalvarEdicaoPessoa {
  return async (dados) => {
    if (
      !/^[1-9]\d*$/.test(pessoaId) ||
      !Number.isSafeInteger(Number(pessoaId))
    ) {
      throw new Error(
        "O identificador da pessoa é inválido."
      );
    }

    const erros = validarEdicaoPessoa(dados);

    if (Object.keys(erros).length > 0) {
      throw new Error(
        "Confira os campos antes de salvar."
      );
    }

    const [dia, mes, ano] =
      dados.dataNascimento.split("/");

    const corpo = {
      nome: dados.nome.trim(),
      dataNascimento: `${ano}-${mes}-${dia}`,
      tipoVulnerabilidade:
        dados.tipoVulnerabilidade,
      necessidadesRemocao:
        dados.necessidadesRemocao.trim() || null,
    };

    const resposta = await api<unknown>(
      "java",
      `/api/v1/pessoas/${encodeURIComponent(pessoaId)}`,
      {
        metodo: "PUT",
        dados: corpo,
      }
    );

    if (
      typeof resposta !== "object" ||
      resposta === null ||
      !("id" in resposta) ||
      resposta.id !== Number(pessoaId) ||
      !("nome" in resposta) ||
      resposta.nome !== corpo.nome ||
      !("dataNascimento" in resposta) ||
      resposta.dataNascimento !== corpo.dataNascimento ||
      !("tipoVulnerabilidade" in resposta) ||
      resposta.tipoVulnerabilidade !==
        corpo.tipoVulnerabilidade ||
      !("necessidadesRemocao" in resposta) ||
      resposta.necessidadesRemocao !==
        corpo.necessidadesRemocao
    ) {
      throw new Error(
        "A API respondeu ao salvamento, mas os dados retornados não confirmaram a alteração. Reabra os detalhes antes de tentar novamente."
      );
    }
  };
}