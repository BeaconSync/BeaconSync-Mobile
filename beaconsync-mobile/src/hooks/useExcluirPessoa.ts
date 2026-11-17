import {
  useEffect,
  useRef,
  useState,
} from "react";

export type EnviarExclusaoPessoa = (
  pessoaId: string
) => Promise<void>;

export function useExcluirPessoa(
  pessoaId: string,
  onExcluir?: EnviarExclusaoPessoa
) {
  const [enviando, setEnviando] =
    useState(false);

  const [erro, setErro] =
    useState<string | null>(null);

  const envioEmAndamento = useRef(false);
  const concluida = useRef(false);
  const ativo = useRef(true);

  useEffect(() => {
    ativo.current = true;

    return () => {
      ativo.current = false;
    };
  }, []);

  async function excluir() {
    if (
      envioEmAndamento.current ||
      concluida.current
    ) {
      return false;
    }

    setErro(null);

    if (!onExcluir) {
      setErro(
        "A exclusão está indisponível nesta prévia. Nenhum pedido de exclusão foi enviado."
      );

      return false;
    }

    envioEmAndamento.current = true;
    setEnviando(true);

    try {
      await onExcluir(pessoaId);

      concluida.current = true;

      return ativo.current;
    } catch (erroRecebido) {
      if (ativo.current) {
        const mensagem =
          erroRecebido instanceof Error
            ? erroRecebido.message
            : "Não foi possível confirmar a exclusão.";

        setErro(
          mensagem +
          " Se houve falha de conexão, volte para Pessoas e confira a lista antes de tentar novamente."
        );
      }

      return false;
    } finally {
      envioEmAndamento.current = false;

      if (ativo.current) {
        setEnviando(false);
      }
    }
  }

  return {
    enviando,
    erro,
    excluir,
  };
}