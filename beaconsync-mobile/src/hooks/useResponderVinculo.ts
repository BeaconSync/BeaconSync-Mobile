import { useRef, useState } from "react";

import type {
  DecisaoVinculo,
  ResponderSolicitacaoVinculo,
  SolicitacaoVinculoRecebida,
} from "../types/solicitacaoVinculo";

export function useResponderVinculo(
  onResponder?: ResponderSolicitacaoVinculo
) {
  const [processandoId, setProcessandoId] =
    useState<string | null>(null);

  const [erro, setErro] = useState<{
    id: string;
    mensagem: string;
  } | null>(null);

  const envioEmAndamento = useRef(false);

  async function responder(
    solicitacao: SolicitacaoVinculoRecebida,
    decisao: DecisaoVinculo
  ): Promise<SolicitacaoVinculoRecebida | null> {
    if (envioEmAndamento.current) return null;

    setErro(null);

    if (
      solicitacao.status !== "pendente" ||
      !solicitacao.podeDecidir
    ) {
      setErro({
        id: solicitacao.id,
        mensagem: "Esta solicitação não está disponível para decisão.",
      });
      return null;
    }

    if (!onResponder) {
      setErro({
        id: solicitacao.id,
        mensagem:
          "O envio está indisponível no momento. Nenhum vínculo foi alterado.",
      });
      return null;
    }

    envioEmAndamento.current = true;
    setProcessandoId(solicitacao.id);

    try {
      const atualizada = await onResponder(
        solicitacao.id,
        decisao
      );

      if (
        atualizada?.id !== solicitacao.id ||
        atualizada.status !== decisao
      ) {
        throw new Error("Resposta de decisão inválida.");
      }

      return atualizada;
    } catch {
      setErro({
        id: solicitacao.id,
        mensagem:
          "Não foi possível confirmar a decisão. Consulte novamente as solicitações antes de tentar outra vez.",
      });
      return null;
    } finally {
      envioEmAndamento.current = false;
      setProcessandoId(null);
    }
  }

  return {
    processandoId,
    erro,
    responder,
  };
}