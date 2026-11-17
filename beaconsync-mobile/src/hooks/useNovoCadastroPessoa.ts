import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  cadastrarPessoa,
  validarNovoCadastro,
} from "../services/cadastrarPessoa";

import type {
  NovoCadastroPessoa,
  ErrosNovoCadastro,
  ResultadoNovoCadastro,
} from "../types/novoCadastroPessoa";

const iniciais: NovoCadastroPessoa = {
  nome: "",
  cpf: "",
  dataNascimento: "",
  vinculo: "",

  tipoVulnerabilidade: "",
  necessidadesRemocao: "",

  nomeLocal: "",
  rua: "",
  numero: "",
  complemento: "",
  cep: "",
  distritoId: null,

  autorizado: false,
};

export function useNovoCadastroPessoa() {
  const [dados, setDados] =
    useState<NovoCadastroPessoa>(iniciais);

  const [etapa, setEtapa] =
    useState<1 | 2 | 3>(1);

  const [erros, setErros] =
    useState<ErrosNovoCadastro>({});

  const [erroEnvio, setErroEnvio] =
    useState<string | null>(null);

  const [enviando, setEnviando] =
    useState(false);

  const [resultado, setResultado] =
    useState<ResultadoNovoCadastro | null>(null);

  const trava = useRef(false);
  const ativo = useRef(true);

  useEffect(() => {
    ativo.current = true;

    return () => {
      ativo.current = false;
    };
  }, []);

  function alterar<K extends keyof NovoCadastroPessoa>(
    campo: K,
    valor: NovoCadastroPessoa[K]
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

  function voltar() {
    if (trava.current) return;

    setEtapa((atual) => atual === 3 ? 2 : 1);
    setErros({});
    setErroEnvio(null);
  }

  function revisar() {
    if (trava.current) return;

    setResultado(null);
    setEtapa(1);
    setErros({});
    setErroEnvio(null);
  }

  async function continuar() {
    if (trava.current || resultado) return;

    setErroEnvio(null);

    for (const numero of [1, 2, 3] as const) {
      if (numero > etapa) break;

      const encontrados =
        validarNovoCadastro(dados, numero);

      if (Object.keys(encontrados).length > 0) {
        setEtapa(numero);
        setErros(encontrados);
        return;
      }
    }

    setErros({});

    if (etapa < 3) {
      setEtapa(etapa === 1 ? 2 : 3);
      return;
    }

    trava.current = true;
    setEnviando(true);

    try {
      const resposta = await cadastrarPessoa(dados);

      if (ativo.current) {
        setResultado(resposta);
      }
    } catch (erro) {
      if (ativo.current) {
        const mensagem =
          erro instanceof Error
            ? erro.message
            : "Não foi possível confirmar o envio.";

        setErroEnvio(
          mensagem +
          " Seus campos continuam preenchidos. Se houve falha de conexão, consulte Pessoas antes de reenviar."
        );
      }
    } finally {
      trava.current = false;

      if (ativo.current) {
        setEnviando(false);
      }
    }
  }

  return {
    dados,
    etapa,
    erros,
    erroEnvio,
    enviando,
    resultado,
    alterar,
    voltar,
    revisar,
    continuar,
  };
}