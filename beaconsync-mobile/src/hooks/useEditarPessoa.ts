import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  validarEdicaoPessoa,
} from "../services/editarPessoa";

import {
  categoriasVulnerabilidade,
} from "../utils/validarCadatroJava";

import type {
  PessoaDetalhes,
} from "../types/detalhaPessoa";

import type {
  DadosEdicaoPessoa,
  ErrosEdicaoPessoa,
  SalvarEdicaoPessoa,
} from "../types/editarPessoa";

export function useEditarPessoa(
  pessoa: PessoaDetalhes,
  onSalvar?: SalvarEdicaoPessoa
) {
  const [dados, setDados] =
    useState<DadosEdicaoPessoa>(() => {
      const nascimento =
        /^(\d{4})-(\d{2})-(\d{2})$/.exec(
          pessoa.dataNascimento ?? ""
        );

      const categoria =
        categoriasVulnerabilidade.find(
          (item) =>
            item.valor === pessoa.tipoVulnerabilidade
        );

      return {
        nome: pessoa.nome,

        dataNascimento: nascimento
          ? `${nascimento[3]}/${nascimento[2]}/${nascimento[1]}`
          : "",

        tipoVulnerabilidade:
          categoria?.valor ?? "",

        necessidadesRemocao:
          pessoa.necessidadesRemocao ?? "",
      };
    });

  const [erros, setErros] =
    useState<ErrosEdicaoPessoa>({});

  const [erroEnvio, setErroEnvio] =
    useState<string | null>(null);

  const [enviando, setEnviando] =
    useState(false);

  const trava = useRef(false);
  const ativo = useRef(true);

  useEffect(() => {
    ativo.current = true;

    return () => {
      ativo.current = false;
    };
  }, []);

  function alterar<K extends keyof DadosEdicaoPessoa>(
    campo: K,
    valor: DadosEdicaoPessoa[K]
  ) {
    if (trava.current) return;

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

  async function salvar() {
    if (trava.current) return false;

    setErroEnvio(null);

    const encontrados =
      validarEdicaoPessoa(dados);

    setErros(encontrados);

    if (Object.keys(encontrados).length > 0) {
      return false;
    }

    if (!onSalvar) {
      setErroEnvio(
        "O salvamento não está disponível nesta prévia. Nenhuma alteração foi enviada."
      );

      return false;
    }

    trava.current = true;
    setEnviando(true);

    try {
      await onSalvar(dados);

      return ativo.current;
    } catch (erro) {
      if (ativo.current) {
        const mensagem =
          erro instanceof Error
            ? erro.message
            : "Não foi possível confirmar o salvamento.";

        setErroEnvio(
          mensagem +
          " Os campos continuam preenchidos. Se houve falha de conexão, reabra os detalhes para conferir os dados salvos."
        );
      }

      return false;
    } finally {
      trava.current = false;

      if (ativo.current) {
        setEnviando(false);
      }
    }
  }

  return {
    dados,
    erros,
    erroEnvio,
    enviando,
    alterar,
    salvar,
  };
}