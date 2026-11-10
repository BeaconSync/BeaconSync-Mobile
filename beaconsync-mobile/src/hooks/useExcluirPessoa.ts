import { useRef, useState } from "react";

export type EnviarExclusaoPessoa = (
  pessoaId: string
) => Promise<void>;

export function useExcluirPessoa(
  pessoaId: string,
  onExcluir?: EnviarExclusaoPessoa
) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const envioEmAndamento = useRef(false);

  async function excluir() {
    if (envioEmAndamento.current) return false;

    setErro(null);

    if (!onExcluir) {
      setErro(
        "A exclusão está indisponível no momento. Nenhum cadastro foi excluído."
      );
      return false;
    }

    envioEmAndamento.current = true;
    setEnviando(true);

    try {
      await onExcluir(pessoaId);
      return true;
    } catch {
      setErro(
        "Não foi possível confirmar a exclusão. Atualize a lista antes de tentar novamente."
      );
      return false;
    } finally {
      envioEmAndamento.current = false;
      setEnviando(false);
    }
  }

  return { enviando, erro, excluir };
}