import { api } from "./api";

import type {
  EnderecoApi,
  NovoEndereco,
  ErrosNovoEndereco,
} from "../types/enderecosApi";

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

function caminho(pessoaId: string) {
  if (
    !/^[1-9]\d*$/.test(pessoaId) ||
    !Number.isSafeInteger(Number(pessoaId))
  ) {
    throw new Error(
      "O identificador da pessoa é inválido."
    );
  }

  return `/api/v1/pessoas/${encodeURIComponent(pessoaId)}`;
}

function enderecoValido(
  valor: unknown
): valor is EnderecoApi {
  return (
    objeto(valor) &&
    idValido(valor.id) &&
    typeof valor.apelido === "string" &&
    typeof valor.logradouro === "string" &&
    typeof valor.numero === "string" &&
    typeof valor.cep === "string" &&
    (
      valor.complemento === null ||
      typeof valor.complemento === "string"
    ) &&
    idValido(valor.distritoId) &&
    typeof valor.distritoNome === "string" &&
    typeof valor.atual === "boolean"
  );
}

function interpretarLista(
  valor: unknown
): EnderecoApi[] {
  if (
    !Array.isArray(valor) ||
    !valor.every(enderecoValido) ||
    new Set(valor.map((item) => item.id)).size !==
      valor.length ||
    valor.filter((item) => item.atual).length > 1
  ) {
    throw new Error(
      "Não foi possível interpretar os endereços retornados pela API."
    );
  }

  return valor;
}

export function validarNovoEndereco(
  dados: NovoEndereco
): ErrosNovoEndereco {
  const erros: ErrosNovoEndereco = {};

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
        `Preencha com até ${limite} caracteres.`;
    }
  }

  if (dados.complemento.trim().length > 60) {
    erros.complemento =
      "Use no máximo 60 caracteres.";
  }

  if (!/^\d{5}-?\d{3}$/.test(dados.cep.trim())) {
    erros.cep = "Informe um CEP com 8 números.";
  }

  if (!idValido(dados.distritoId)) {
    erros.distritoId = "Selecione um distrito.";
  }

  return erros;
}

export async function consultarEnderecosPessoa(
  pessoaId: string
): Promise<EnderecoApi[]> {
  const resposta = await api<unknown>(
    "java",
    `${caminho(pessoaId)}/enderecos`
  );

  return interpretarLista(resposta);
}

export async function adicionarEnderecoPessoa(
  pessoaId: string,
  dados: NovoEndereco
): Promise<EnderecoApi> {
  if (
    Object.keys(validarNovoEndereco(dados)).length > 0
  ) {
    throw new Error(
      "Confira os campos antes de salvar."
    );
  }

  const resposta = await api<unknown>(
    "java",
    `${caminho(pessoaId)}/enderecos`,
    {
      metodo: "POST",

      dados: {
        apelido: dados.nomeLocal.trim(),
        logradouro: dados.rua.trim(),
        numero: dados.numero.trim(),
        complemento:
          dados.complemento.trim() || null,
        cep: dados.cep.replace(/\D/g, ""),
        distritoId: dados.distritoId,
      },
    }
  );

  if (
    !enderecoValido(resposta) ||
    resposta.atual ||
    resposta.distritoId !== dados.distritoId
  ) {
    throw new Error(
      "A API respondeu, mas não foi possível confirmar o endereço adicionado. Atualize a lista antes de reenviar."
    );
  }

  return resposta;
}

export async function definirEnderecoAtual(
  pessoaId: string,
  enderecoId: number
): Promise<EnderecoApi[]> {
  if (!idValido(enderecoId)) {
    throw new Error(
      "O endereço selecionado é inválido."
    );
  }

  const resposta = await api<unknown>(
    "java",
    `${caminho(pessoaId)}/endereco-atual`,
    {
      metodo: "PUT",
      dados: { enderecoId },
    }
  );

  if (
    !objeto(resposta) ||
    resposta.id !== Number(pessoaId) ||
    !objeto(resposta.enderecoAtual) ||
    resposta.enderecoAtual.id !== enderecoId
  ) {
    throw new Error(
      "Não foi possível confirmar o endereço atual. Atualize a lista para conferir."
    );
  }

  const enderecos =
    interpretarLista(resposta.enderecos);

  if (
    !enderecos.some(
      (item) =>
        item.id === enderecoId && item.atual
    )
  ) {
    throw new Error(
      "A API não confirmou o endereço selecionado como atual. Atualize a lista."
    );
  }

  return enderecos;
}

export async function removerEnderecoPessoa(
  pessoaId: string,
  enderecoId: number
): Promise<void> {
  if (!idValido(enderecoId)) {
    throw new Error(
      "O endereço selecionado é inválido."
    );
  }

  await api<void>(
    "java",
    `${caminho(pessoaId)}/enderecos/${enderecoId}`,
    {
      metodo: "DELETE",
    }
  );
}