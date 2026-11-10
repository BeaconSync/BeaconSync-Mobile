import { useRef, useState } from "react";

export type RemoverMeuVinculo = (
  pessoaId: string
) => Promise<void>;

export function useRemoverMeuVinculo(
  pessoaId: string,
  onRemover?: RemoverMeuVinculo
) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const envioEmAndamento = useRef(false);

  async function remover(): Promise<boolean> {
    if (envioEmAndamento.current) return false;

    setErro(null);

    if (!onRemover) {
      setErro(
        "A remoção do vínculo está indisponível no momento. Você continua acompanhando esta pessoa."
      );
      return false;
    }

    envioEmAndamento.current = true;
    setEnviando(true);

    try {
      await onRemover(pessoaId);
      return true;
    } catch {
      setErro(
        "Não foi possível confirmar a remoção do vínculo. Consulte novamente suas pessoas acompanhadas."
      );
      return false;
    } finally {
      envioEmAndamento.current = false;
      setEnviando(false);
    }
  }

  return {
    enviando,
    erro,
    remover,
  };
}