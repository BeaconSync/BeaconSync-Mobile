import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  adicionarEnderecoPessoa,
  consultarEnderecosPessoa,
  definirEnderecoAtual,
  removerEnderecoPessoa,
} from "../services/enderecosPessoa";

import {
  versaoSessao,
} from "../services/sessao";

import type {
  EnderecoApi,
  NovoEndereco,
} from "../types/enderecosApi";

export function useEnderecosPessoa(
  pessoaId: string
) {
  const [enderecos, setEnderecos] =
    useState<EnderecoApi[]>([]);

  const [pronto, setPronto] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  const [erro, setErro] =
    useState<string | null>(null);

  const [aviso, setAviso] =
    useState<string | null>(null);

  const trava = useRef(false);
  const ativo = useRef(true);
  const sessao = useRef(versaoSessao());

  const carregar = useCallback(async () => {
    if (
      trava.current ||
      !ativo.current ||
      sessao.current !== versaoSessao()
    ) {
      return;
    }

    trava.current = true;
    setOcupado(true);
    setPronto(false);
    setErro(null);
    setAviso(null);

    try {
      const lista =
        await consultarEnderecosPessoa(pessoaId);

      if (ativo.current) {
        setEnderecos(lista);
        setPronto(true);
      }
    } catch (falha) {
      if (ativo.current) {
        setErro(
          falha instanceof Error
            ? falha.message
            : "Não foi possível consultar os endereços."
        );
      }
    } finally {
      trava.current = false;

      if (ativo.current) {
        setOcupado(false);
      }
    }
  }, [pessoaId]);

  useEffect(() => {
    ativo.current = true;
    void carregar();

    return () => {
      ativo.current = false;
    };
  }, [carregar]);

  async function executar(
    acao: () => Promise<void>,
    mensagem: string
  ) {
    if (
      trava.current ||
      !pronto ||
      !ativo.current ||
      sessao.current !== versaoSessao()
    ) {
      return false;
    }

    trava.current = true;
    setOcupado(true);
    setErro(null);
    setAviso(null);

    try {
      await acao();

      if (ativo.current) {
        setAviso(mensagem);
      }

      return ativo.current;
    } catch (falha) {
      if (ativo.current) {
        const mensagemErro =
          falha instanceof Error
            ? falha.message
            : "Não foi possível confirmar a alteração.";

        setErro(
          mensagemErro +
          " Se houve falha de conexão, atualize a lista antes de tentar novamente."
        );
      }

      return false;
    } finally {
      trava.current = false;

      if (ativo.current) {
        setOcupado(false);
      }
    }
  }

  function adicionar(dados: NovoEndereco) {
    return executar(async () => {
      const novo = await adicionarEnderecoPessoa(
        pessoaId,
        dados
      );

      if (ativo.current) {
        setEnderecos((atuais) => [
          ...atuais.filter(
            (item) => item.id !== novo.id
          ),
          novo,
        ]);
      }
    }, "Endereço adicionado. O endereço atual foi mantido.");
  }

  function definirAtual(enderecoId: number) {
    if (
      !enderecos.some(
        (item) => item.id === enderecoId
      )
    ) {
      return Promise.resolve(false);
    }

    return executar(async () => {
      const lista = await definirEnderecoAtual(
        pessoaId,
        enderecoId
      );

      if (ativo.current) {
        setEnderecos(lista);
      }
    }, "Endereço atual atualizado no cadastro.");
  }

  function remover(enderecoId: number) {
    const endereco = enderecos.find(
      (item) => item.id === enderecoId
    );

    if (!endereco || endereco.atual) {
      setErro(
        "Escolha outro endereço atual antes de remover este endereço."
      );

      return Promise.resolve(false);
    }

    return executar(async () => {
      await removerEnderecoPessoa(
        pessoaId,
        enderecoId
      );

      if (ativo.current) {
        setEnderecos((atuais) =>
          atuais.filter(
            (item) => item.id !== enderecoId
          )
        );
      }
    }, "Endereço removido.");
  }

  return {
    enderecos,
    pronto,
    ocupado,
    erro,
    aviso,
    carregar,
    adicionar,
    definirAtual,
    remover,
  };
}