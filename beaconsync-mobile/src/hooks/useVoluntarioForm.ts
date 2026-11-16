import { useRef, useState } from "react";

import {
  especialidadesVoluntario,
  type DadosCadastroVoluntario,
  type EnviarCadastroVoluntario,
} from "../types/voluntario";

const ufs = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF",
  "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS",
  "RO", "RR", "SC", "SP", "SE", "TO",
];

function normalizarTelefone(valor: string) {
  const numeros = valor.replace(/\D/g, "");

  if (
    numeros.startsWith("55") &&
    (numeros.length === 12 || numeros.length === 13)
  ) {
    return numeros.slice(2);
  }

  return numeros;
}

export function useVoluntarioForm(
  telefoneInicial: string | null,
  onCadastrar?: EnviarCadastroVoluntario,
  edicao = false
) {
  const [dados, setDados] = useState<DadosCadastroVoluntario>({
    telefone: telefoneInicial ?? "",
    cidade: "",
    uf: "",
    especialidade: "",
    outraEspecialidade: "",
    disponivel: false,
    observacoes: "",
  });

  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const envioEmAndamento = useRef(false);

  function preencher(valores: DadosCadastroVoluntario) {
    if (envioEmAndamento.current) return;

    setDados({
      telefone: valores.telefone,
      cidade: valores.cidade,
      uf: valores.uf,
      especialidade: valores.especialidade,
      outraEspecialidade: valores.outraEspecialidade,
      disponivel: valores.disponivel,
      observacoes: valores.observacoes,
    });

    setConcluido(false);
    setErro(null);
  }

  function alterarCampo<K extends keyof DadosCadastroVoluntario>(
    campo: K,
    valor: DadosCadastroVoluntario[K]
  ) {
    if (envioEmAndamento.current || concluido) return;

    setDados((atual) => ({
      ...atual,
      [campo]: valor,
    }));

    setErro(null);
  }

  async function enviar(): Promise<boolean> {
    if (envioEmAndamento.current || concluido) return false;

    setErro(null);

    const telefone = normalizarTelefone(dados.telefone);
    const uf = dados.uf.trim().toUpperCase();

    if (
      !/^[\d\s()+-]+$/.test(dados.telefone) ||
      (telefone.length !== 10 && telefone.length !== 11)
    ) {
      setErro("Informe um telefone brasileiro com DDD.");
      return false;
    }

    if (dados.cidade.trim().length < 2) {
      setErro("Informe sua cidade de atuação.");
      return false;
    }

    if (!ufs.includes(uf)) {
      setErro("Informe uma UF válida, como SP.");
      return false;
    }

    if (
      !dados.especialidade ||
      !especialidadesVoluntario.some(
        (item) => item === dados.especialidade
      )
    ) {
      setErro("Selecione sua principal área de atuação.");
      return false;
    }

    if (
      dados.especialidade === "Outro" &&
      !dados.outraEspecialidade.trim()
    ) {
      setErro("Descreva como você deseja ajudar.");
      return false;
    }

    if (!onCadastrar) {
      setErro(
        edicao
          ? "A edição está indisponível no momento. Nenhuma alteração foi salva."
          : "O cadastro de voluntário está indisponível no momento. Nenhum dado foi salvo."
      );
      return false;
    }

    envioEmAndamento.current = true;
    setEnviando(true);

    try {
      await onCadastrar({
        ...dados,
        telefone,
        cidade: dados.cidade.trim(),
        uf,
        outraEspecialidade:
          dados.especialidade === "Outro"
            ? dados.outraEspecialidade.trim()
            : "",
        observacoes: dados.observacoes.trim(),
      });

      setConcluido(true);
      return true;
   } catch (erro) {
  setErro(
    erro instanceof Error
      ? erro.message
      : edicao
        ? "Não foi possível confirmar a atualização. Seus dados continuam preenchidos."
        : "Não foi possível confirmar o cadastro. Seus dados continuam preenchidos.",
  );

  return false;
} finally {
      envioEmAndamento.current = false;
      setEnviando(false);
    }
  }

  return {
    dados,
    enviando,
    concluido,
    erro,
    alterarCampo,
    preencher,
    enviar,
  };
}