import { api } from "./api";
import {
  obterCadastroExistente,
} from "./errosCadastroPessoa";

import {
  categoriasVulnerabilidade,
  cpfValido,
} from "../utils/validarCadatroJava";

import type {
  NovoCadastroPessoa,
  ErrosNovoCadastro,
  ResultadoNovoCadastro,
} from "../types/novoCadastroPessoa";

function dataValida(valor: string) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
    return false;
  }

  const [dia, mes, ano] = valor.split("/").map(Number);

  if (ano < 1) return false;

  const data = new Date(0);
  data.setUTCHours(0, 0, 0, 0);
  data.setUTCFullYear(ano, mes - 1, dia);

  const hoje = new Date();

  const limite = new Date(0);
  limite.setUTCHours(0, 0, 0, 0);
  limite.setUTCFullYear(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate()
  );

  return (
    data.getUTCFullYear() === ano &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === dia &&
    data.getTime() <= limite.getTime()
  );
}

export function validarNovoCadastro(
  dados: NovoCadastroPessoa,
  etapa: 1 | 2 | 3
): ErrosNovoCadastro {
  const erros: ErrosNovoCadastro = {};

  if (etapa === 1) {
    if (
      !dados.nome.trim() ||
      dados.nome.trim().length > 120
    ) {
      erros.nome =
        "Informe o nome, com até 120 caracteres.";
    }

    if (!cpfValido(dados.cpf)) {
      erros.cpf = "Informe um CPF válido.";
    }

    if (!dataValida(dados.dataNascimento)) {
      erros.dataNascimento =
        "Informe uma data válida, que não seja futura.";
    }

    if (
      !dados.vinculo.trim() ||
      dados.vinculo.trim().length > 40
    ) {
      erros.vinculo =
        "Informe seu vínculo, com até 40 caracteres.";
    }
  }

  if (etapa === 2) {
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
  }

  if (etapa === 3) {
    const obrigatorios = [
      ["nomeLocal", 60],
      ["rua", 150],
      ["numero", 10],
    ] as const;

    for (const [campo, limite] of obrigatorios) {
      if (
        !dados[campo].trim() ||
        dados[campo].trim().length > limite
      ) {
        erros[campo] =
          `Preencha este campo com até ${limite} caracteres.`;
      }
    }

    if (dados.complemento.trim().length > 60) {
      erros.complemento =
        "Use no máximo 60 caracteres.";
    }

    if (!/^\d{5}-?\d{3}$/.test(dados.cep.trim())) {
      erros.cep = "Informe um CEP com 8 números.";
    }

    if (
      dados.distritoId === null ||
      !Number.isSafeInteger(dados.distritoId) ||
      dados.distritoId <= 0
    ) {
      erros.distritoId = "Selecione um distrito.";
    }

    if (!dados.autorizado) {
      erros.autorizado =
        "Confirme a autorização para cadastrar.";
    }
  }

  return erros;
}

export async function cadastrarPessoa(
  dados: NovoCadastroPessoa
): Promise<ResultadoNovoCadastro> {
  for (const etapa of [1, 2, 3] as const) {
    const erros = validarNovoCadastro(dados, etapa);

    if (Object.keys(erros).length > 0) {
      throw new Error(
        "Confira os campos antes de enviar."
      );
    }
  }

  const [dia, mes, ano] =
    dados.dataNascimento.split("/");

  let resposta: unknown;

  try {
    resposta = await api<unknown>(
      "java",
      "/api/v1/pessoas",
      {
        metodo: "POST",

        dados: {
          nome: dados.nome.trim(),
          cpf: dados.cpf.replace(/\D/g, ""),
          dataNascimento: `${ano}-${mes}-${dia}`,
          parentesco: dados.vinculo.trim(),

          tipoVulnerabilidade:
            dados.tipoVulnerabilidade,

          necessidadesRemocao:
            dados.necessidadesRemocao.trim() || null,

          consentimento: dados.autorizado,

          endereco: {
            apelido: dados.nomeLocal.trim(),
            logradouro: dados.rua.trim(),
            numero: dados.numero.trim(),

            complemento:
              dados.complemento.trim() || null,

            cep: dados.cep.replace(/\D/g, ""),
            distritoId: dados.distritoId,
          },
        },
      }
    );
  } catch (erro) {
    const existente = obterCadastroExistente(erro);

    if (existente) {
      return {
        status: "existente",
        pessoaId: existente.pessoaId,
      };
    }

    throw erro;
  }

  if (
    typeof resposta !== "object" ||
    resposta === null ||
    !("id" in resposta) ||
    typeof resposta.id !== "number" ||
    !Number.isSafeInteger(resposta.id) ||
    resposta.id <= 0
  ) {
    throw new Error(
      "A API respondeu ao envio, mas não foi possível confirmar o cadastro. Consulte Pessoas antes de tentar novamente."
    );
  }

  return {
    status: "criado",
    pessoaId: String(resposta.id),
  };
}