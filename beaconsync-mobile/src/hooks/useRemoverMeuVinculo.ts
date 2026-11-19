import {
  useEffect,
  useRef,
  useState,
} from "react";

import { versaoSessao } from "../services/sessao";

export type RemoverMeuVinculo = (
  pessoaId: string,
) => Promise<void>;

export function useRemoverMeuVinculo(
  pessoaId: string,
  onRemover?: RemoverMeuVinculo,
) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const envioEmAndamento = useRef(false);
  const montado = useRef(false);

  useEffect(() => {
    montado.current = true;

    return () => {
      montado.current = false;
    };
  }, []);

  async function remover(): Promise<boolean> {
    if (envioEmAndamento.current || !montado.current) {
      return false;
    }

    setErro(null);

    if (!onRemover) {
      setErro(
        "A remoção do vínculo está indisponível nesta prévia. Nenhum vínculo foi removido.",
      );
      return false;
    }

    const sessao = versaoSessao();

    envioEmAndamento.current = true;
    setEnviando(true);

    try {
      await onRemover(pessoaId);

      return (
        montado.current &&
        versaoSessao() === sessao
      );
    } catch (falha) {
      if (
        montado.current &&
        versaoSessao() === sessao
      ) {
        setErro(
          falha instanceof Error && falha.message.trim()
            ? falha.message
            : "Não foi possível confirmar a remoção. Atualize a lista de pessoas antes de tentar novamente.",
        );
      }

      return false;
    } finally {
      envioEmAndamento.current = false;

      if (montado.current) {
        setEnviando(false);
      }
    }
  }

  return {
    enviando,
    erro,
    remover,
  };
}