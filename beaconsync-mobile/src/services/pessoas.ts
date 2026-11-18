import { api } from "./api";

import type { PessoaResumo } from "../types/pessoa";
import type {
  EnderecoDetalhesPessoa,
  PessoaDetalhes,
} from "../types/detalhaPessoa";
import { normalizarPaginaJava } from "./paginacaoJava";

type EnderecoResumoApi = {
  apelido: string | null;
  logradouro: string | null;
  numero: string | null;
  distritoNome: string | null;
};

type EnderecoDetalheApi = EnderecoResumoApi & {
  id: number;
  complemento: string | null;
  cep: string | null;
  atual: boolean;
};

export type PessoaApi = {
  id: number;
  nome: string;
  dataNascimento: string | null;
  tipoVulnerabilidade: string | null;
  necessidadesRemocao: string | null;
  enderecoAtual: EnderecoResumoApi | null;
};

type PessoaDetalhesApi = PessoaApi & {
  enderecos: EnderecoDetalheApi[];
};

export type PaginaPessoasApi = {
  content: PessoaApi[];
  number: number;
  totalPages: number;
  totalElements: number;
  last: boolean;
};

const tiposVulnerabilidade: Record<string, string> = {
  ACAMADO: "Pessoa acamada",
  PESSOA_COM_DEFICIENCIA: "Pessoa com deficiência",
  BEBE: "Bebê",
  DEPENDENTE_APARELHO_MEDICO:
    "Dependência de equipamento médico",
  OUTRO: "Outra necessidade de apoio",
};

function objeto(
  valor: unknown
): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function textoOuNulo(
  valor: unknown
): valor is string | null {
  return valor === null || typeof valor === "string";
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

function enderecoValido(
  valor: unknown
): valor is EnderecoResumoApi | null {
  if (valor === null) return true;
  if (!objeto(valor)) return false;

  return (
    textoOuNulo(valor.apelido) &&
    textoOuNulo(valor.logradouro) &&
    textoOuNulo(valor.numero) &&
    textoOuNulo(valor.distritoNome)
  );
}

function pessoaValida(
  valor: unknown
): valor is PessoaApi {
  if (!objeto(valor)) return false;

  return (
    inteiroNaoNegativo(valor.id) &&
    valor.id > 0 &&
    typeof valor.nome === "string" &&
    textoOuNulo(valor.dataNascimento) &&
    textoOuNulo(valor.tipoVulnerabilidade) &&
    textoOuNulo(valor.necessidadesRemocao) &&
    enderecoValido(valor.enderecoAtual)
  );
}

function paginaValida(
  valor: unknown
): valor is PaginaPessoasApi {
  if (!objeto(valor)) return false;

  return (
    Array.isArray(valor.content) &&
    valor.content.every(pessoaValida) &&
    inteiroNaoNegativo(valor.number) &&
    inteiroNaoNegativo(valor.totalPages) &&
    inteiroNaoNegativo(valor.totalElements) &&
    typeof valor.last === "boolean"
  );
}

function enderecoDetalheValido(
  valor: unknown
): valor is EnderecoDetalheApi {
  if (!objeto(valor)) return false;

  // Verifica os campos adicionais antes de restringir
  // o valor ao tipo EnderecoResumoApi.
  return (
    inteiroNaoNegativo(valor.id) &&
    valor.id > 0 &&
    textoOuNulo(valor.complemento) &&
    textoOuNulo(valor.cep) &&
    typeof valor.atual === "boolean" &&
    enderecoValido(valor)
  );
}

function pessoaDetalhesValida(
  valor: unknown
): valor is PessoaDetalhesApi {
  if (!objeto(valor)) return false;

  return (
    Array.isArray(valor.enderecos) &&
    valor.enderecos.every(enderecoDetalheValido) &&
    pessoaValida(valor)
  );
}

export async function consultarPaginaPessoas(
  pagina = 0
): Promise<PaginaPessoasApi> {
  if (!inteiroNaoNegativo(pagina)) {
    throw new Error("A página solicitada é inválida.");
  }

const resposta = normalizarPaginaJava(
  await api<unknown>(
    "java",
    `/api/v1/pessoas?page=${pagina}&size=20&sort=nome,asc&sort=id,asc`
  )
);

  if (
    !paginaValida(resposta) ||
    resposta.number !== pagina
  ) {
    throw new Error(
      "A API retornou uma lista de pessoas em um formato inesperado."
    );
  }

  return resposta;
}

export function adaptarPessoaResumo(
  pessoa: PessoaApi
): PessoaResumo {
  const tipo = pessoa.tipoVulnerabilidade
    ? tiposVulnerabilidade[pessoa.tipoVulnerabilidade]
    : undefined;

  const necessidade =
    pessoa.necessidadesRemocao?.trim();

  const descricaoApoio = [tipo, necessidade]
    .filter((texto): texto is string => Boolean(texto))
    .join(" · ");

  const endereco = pessoa.enderecoAtual;
  let localAtual: string | null = null;

  if (endereco) {
    const ruaNumero = [
      endereco.logradouro?.trim(),
      endereco.numero?.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    const descricaoEndereco = [
      endereco.apelido?.trim(),
      ruaNumero,
      endereco.distritoNome?.trim(),
    ]
      .filter(Boolean)
      .join(" · ");

    if (descricaoEndereco) {
      localAtual = `Referência: ${descricaoEndereco}`;
    }
  }

  return {
    id: String(pessoa.id),
    nome: pessoa.nome,
    necessidadeApoio: descricaoApoio || null,
    localAtual,
  };
}

function adaptarEnderecoDetalhe(
  endereco: EnderecoDetalheApi
): EnderecoDetalhesPessoa {
  return {
    id: String(endereco.id),
    nomeLocal: endereco.apelido,
    logradouro: endereco.logradouro ?? "",
    numero: endereco.numero ?? "",

    bairro: "",
    distrito: endereco.distritoNome,

    cidade: null,
    uf: null,
    cep: endereco.cep,
    complemento: endereco.complemento,
    pontoReferencia: null,

    tipoImovel: null,
    andar: null,

    indicadoComoAtual: endereco.atual,
    presencaInformada: null,
    presencaInformadaEm: null,
  };
}

export async function consultarDetalhesPessoa(
  id: string
): Promise<PessoaDetalhes> {
  if (!/^[1-9]\d*$/.test(id)) {
    throw new Error(
      "O identificador da pessoa é inválido."
    );
  }

  const resposta = await api<unknown>(
    "java",
    `/api/v1/pessoas/${encodeURIComponent(id)}`
  );

  if (
    !pessoaDetalhesValida(resposta) ||
    String(resposta.id) !== id
  ) {
    throw new Error(
      "A API retornou os dados da pessoa em um formato inesperado."
    );
  }

  const tipo = resposta.tipoVulnerabilidade
    ? tiposVulnerabilidade[resposta.tipoVulnerabilidade]
    : undefined;

  const necessidadeRemocao =
    resposta.necessidadesRemocao?.trim();

return {
  id: String(resposta.id),
  nome: resposta.nome,
  dataNascimento: resposta.dataNascimento,

  tipoVulnerabilidade: resposta.tipoVulnerabilidade,
  necessidadesRemocao: resposta.necessidadesRemocao,

    fotoUrl: null,
    vinculo: null,

    necessidades: tipo ? [tipo] : [],
    recursos: necessidadeRemocao
      ? [necessidadeRemocao]
      : [],

    observacoes: null,

    enderecos: resposta.enderecos.map(
      adaptarEnderecoDetalhe
    ),

    situacao: null,
  };
}