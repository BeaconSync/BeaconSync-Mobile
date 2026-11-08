import { useRef, useState } from "react";

import type {
  DadosCadastroPessoa,
  EnviarCadastroPessoa,
  ErrosCadastroPessoa,
  EtapaCadastro,
} from "../types/cadastroPessoa";

export const vinculos = [
  "Familiar",
  "Amigo",
  "Cuidador",
  "Outro",
];

export const necessidades = [
  "Mobilidade reduzida",
  "Pessoa acamada",
  "Deficiência visual",
  "Deficiência auditiva",
  "Dependência de equipamento médico",
  "Bebê ou criança pequena",
  "Outra",
];

export const recursos = [
  "Cadeira de rodas",
  "Maca",
  "Apoio de outra pessoa",
  "Transporte de equipamento médico",
];

export const ufs = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF",
  "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS",
  "RO", "RR", "SC", "SP", "SE", "TO",
];

const dadosIniciais: DadosCadastroPessoa = {
  fotoUri: null,
  nome: "",
  dataNascimento: "",
  vinculo: "",
  necessidades: [],
  outraNecessidade: "",
  recursos: [],
  observacoes: "",
  nomeLocal: "",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
  pontoReferencia: "",
  localizacaoConfirmada: null,
  autorizado: false,
};

export function formatarData(valor: string) {
  const numeros = valor.replace(/\D/g, "").slice(0, 8);

  if (numeros.length <= 2) return numeros;

  if (numeros.length <= 4) {
    return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  }

  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
}

export function formatarCep(valor: string) {
  const numeros = valor.replace(/\D/g, "").slice(0, 8);

  if (numeros.length <= 5) return numeros;

  return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
}

function dataNascimentoValida(
  valor: string,
  hoje = new Date()
) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) return false;

  const [dia, mes, ano] = valor.split("/").map(Number);

  if (ano < 1) return false;

  const data = new Date(0);
  data.setUTCHours(0, 0, 0, 0);
  data.setUTCFullYear(ano, mes - 1, dia);

  return (
    data.getUTCFullYear() === ano &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === dia &&
    data.getTime() <=
      Date.UTC(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate()
      )
  );
}

function validarEtapa(
  dados: DadosCadastroPessoa,
  etapa: EtapaCadastro
): ErrosCadastroPessoa {
  const erros: ErrosCadastroPessoa = {};

  if (etapa === 1) {
    if (dados.nome.trim().length < 2) {
      erros.nome = "Informe o nome da pessoa.";
    }

    if (!dataNascimentoValida(dados.dataNascimento)) {
      erros.dataNascimento =
        "Informe uma data válida, que não seja futura.";
    }

    if (!vinculos.includes(dados.vinculo)) {
      erros.vinculo = "Selecione seu vínculo com a pessoa.";
    }
  }

  if (etapa === 2) {
    if (dados.necessidades.length === 0) {
      erros.necessidades =
        "Selecione pelo menos uma necessidade de apoio.";
    }

    if (
      dados.necessidades.includes("Outra") &&
      !dados.outraNecessidade.trim()
    ) {
      erros.outraNecessidade =
        "Descreva a outra necessidade de apoio.";
    }
  }

  if (etapa === 3) {
    const obrigatorios = [
      "nomeLocal",
      "rua",
      "numero",
      "bairro",
      "cidade",
    ] as const;

    for (const campo of obrigatorios) {
      if (!dados[campo].trim()) {
        erros[campo] = "Preencha este campo.";
      }
    }

    if (dados.cep.replace(/\D/g, "").length !== 8) {
      erros.cep = "Informe um CEP com 8 números.";
    }

    if (!ufs.includes(dados.uf.trim().toUpperCase())) {
      erros.uf = "Informe uma UF válida, como SP.";
    }

    if (!dados.autorizado) {
      erros.autorizado =
        "Confirme que possui autorização para o cadastro.";
    }
  }

  return erros;
}

export function usePessoaForm(
  onCadastrar?: EnviarCadastroPessoa
) {
  const [dados, setDados] =
    useState<DadosCadastroPessoa>(dadosIniciais);

  const [etapa, setEtapa] = useState<EtapaCadastro>(1);
  const [erros, setErros] = useState<ErrosCadastroPessoa>({});
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  const envioEmAndamento = useRef(false);

  function alterarCampo<K extends keyof DadosCadastroPessoa>(
    campo: K,
    valor: DadosCadastroPessoa[K]
  ) {
    setDados((atual) => ({
      ...atual,
      [campo]: valor,
    }));

    setErros((atual) => ({
      ...atual,
      [campo]: undefined,
    }));

    setErroEnvio(null);
  }

function alternarSelecao(
  campo: "necessidades" | "recursos",
  valor: string
) {
  setDados((atual) => {
    const selecionados = atual[campo];

    const novaSelecao = selecionados.includes(valor)
      ? selecionados.filter((item) => item !== valor)
      : [...selecionados, valor];

    return {
      ...atual,
      [campo]: novaSelecao,
    };
  });

  setErros((atual) => ({
    ...atual,
    [campo]: undefined,
    ...(campo === "necessidades"
      ? { outraNecessidade: undefined }
      : {}),
  }));

  setErroEnvio(null);
}

  function avancar() {
    const novosErros = validarEtapa(dados, etapa);
    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) return false;

    if (etapa === 1) setEtapa(2);
    if (etapa === 2) setEtapa(3);

    setErroEnvio(null);
    return true;
  }

  function voltar() {
    if (enviando) return;

    if (etapa === 3) setEtapa(2);
    if (etapa === 2) setEtapa(1);

    setErros({});
    setErroEnvio(null);
  }

  async function enviar() {
    if (envioEmAndamento.current) return false;

    setErroEnvio(null);

    for (const numero of [1, 2, 3] as const) {
      const novosErros = validarEtapa(dados, numero);

      if (Object.keys(novosErros).length > 0) {
        setEtapa(numero);
        setErros(novosErros);
        return false;
      }
    }

    setErros({});

    if (!onCadastrar) {
      setErroEnvio(
        "O envio está indisponível no momento. Nenhum dado foi salvo."
      );
      return false;
    }

    envioEmAndamento.current = true;
    setEnviando(true);

    try {
      await onCadastrar({
        ...dados,
        nome: dados.nome.trim(),
        uf: dados.uf.trim().toUpperCase(),
        outraNecessidade: dados.necessidades.includes("Outra")
          ? dados.outraNecessidade.trim()
          : "",
      });

      return true;
    } catch {
      setErroEnvio(
        "Não foi possível confirmar o cadastro. Seus dados continuam preenchidos."
      );
      return false;
    } finally {
      envioEmAndamento.current = false;
      setEnviando(false);
    }
  }

  return {
    dados,
    etapa,
    erros,
    enviando,
    erroEnvio,
    alterarCampo,
    alternarSelecao,
    avancar,
    voltar,
    enviar,
  };
}