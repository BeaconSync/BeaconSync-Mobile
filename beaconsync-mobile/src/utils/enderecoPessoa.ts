import type { EnderecoDetalhesPessoa } from "../types/detalhaPessoa";
import type {
  DadosSalvarEnderecoPessoa,
  ErrosEnderecoPessoa,
  FormularioEnderecoPessoa,
} from "../types/enderecoPessoa";

const UFS = new Set([
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]);

export function formatarCepEndereco(valor: string) {
  const digitos = valor.replace(/\D/g, "").slice(0, 8);
  return digitos.length <= 5
    ? digitos
    : `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
}

export function criarFormularioEndereco(
  endereco?: EnderecoDetalhesPessoa,
): FormularioEnderecoPessoa {
  return {
    nomeLocal: endereco?.nomeLocal ?? "",
    cep: formatarCepEndereco(endereco?.cep ?? ""),
    logradouro: endereco?.logradouro ?? "",
    numero: endereco?.numero ?? "",
    complemento: endereco?.complemento ?? "",
    bairro: endereco?.bairro ?? "",
    distrito: endereco?.distrito ?? "",
    cidade: endereco?.cidade ?? "",
    uf: endereco?.uf ?? "",
    pontoReferencia: endereco?.pontoReferencia ?? "",
    tipoImovel: endereco?.tipoImovel ?? "",
    andar: endereco?.andar == null ? "" : String(endereco.andar),
    indicadoComoAtual: endereco?.indicadoComoAtual ?? false,
  };
}

export function validarEnderecoPessoa(
  dados: FormularioEnderecoPessoa,
): ErrosEnderecoPessoa {
  const erros: ErrosEnderecoPessoa = {};

  for (const campo of [
    "nomeLocal",
    "logradouro",
    "numero",
    "bairro",
    "cidade",
  ] as const) {
    if (!dados[campo].trim()) erros[campo] = "Preencha este campo.";
  }

  if (!/^\d{5}-?\d{3}$/.test(dados.cep.trim())) {
    erros.cep = "Informe um CEP com 8 números.";
  }

  if (!UFS.has(dados.uf.trim().toUpperCase())) {
    erros.uf = "Informe uma UF válida, como SP.";
  }

  const andar = dados.andar.trim();
  if (
    andar &&
    (!/^-?\d+$/.test(andar) || !Number.isSafeInteger(Number(andar)))
  ) {
    erros.andar = "Informe um andar inteiro, como 0, 2 ou -1.";
  }

  return erros;
}

export function prepararEnderecoPessoa(
  dados: FormularioEnderecoPessoa,
): DadosSalvarEnderecoPessoa {
  return {
    nomeLocal: dados.nomeLocal.trim(),
    cep: dados.cep.replace(/\D/g, ""),
    logradouro: dados.logradouro.trim(),
    numero: dados.numero.trim(),
    complemento: dados.complemento.trim(),
    bairro: dados.bairro.trim(),
    distrito: dados.distrito.trim(),
    cidade: dados.cidade.trim(),
    uf: dados.uf.trim().toUpperCase(),
    pontoReferencia: dados.pontoReferencia.trim(),
    tipoImovel: dados.tipoImovel.trim(),
    andar: dados.andar.trim() ? Number(dados.andar) : null,
    indicadoComoAtual: dados.indicadoComoAtual,
  };
}
