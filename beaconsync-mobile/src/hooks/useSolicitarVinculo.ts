import { useRef, useState } from "react";

import type {
  EnviarSolicitacaoVinculo,
  ResultadoSolicitacaoVinculo,
  TipoVinculoSolicitado,
} from "../types/solicitacaoVinculo";

export const opcoesVinculo: TipoVinculoSolicitado[] = [
  "Familiar",
  "Amigo",
  "Cuidador",
  "Outro",
];

export function useSolicitarVinculo(
  referenciaCadastro: string,
  onSolicitar?: EnviarSolicitacaoVinculo
) {
  const [vinculo, setVinculo] =
    useState<TipoVinculoSolicitado | null>(null);

  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [solicitacao, setSolicitacao] =
    useState<ResultadoSolicitacaoVinculo | null>(null);

  const envioEmAndamento = useRef(false);

  function selecionarVinculo(valor: TipoVinculoSolicitado) {
    if (envioEmAndamento.current || solicitacao) return;

    setVinculo(valor);
    setErro(null);
  }

  function alterarMensagem(valor: string) {
    if (envioEmAndamento.current || solicitacao) return;

    setMensagem(valor.slice(0, 500));
    setErro(null);
  }

  async function solicitar() {
    if (envioEmAndamento.current || solicitacao) return;

    setErro(null);

    if (!vinculo) {
      setErro("Selecione seu vínculo com a pessoa.");
      return;
    }

    if (!referenciaCadastro.trim()) {
      setErro(
        "Não foi possível identificar o cadastro para esta solicitação."
      );
      return;
    }

    if (!onSolicitar) {
      setErro(
        "O envio está indisponível no momento. Nenhuma solicitação foi registrada."
      );
      return;
    }

    envioEmAndamento.current = true;
    setEnviando(true);

    try {
      const resultado = await onSolicitar({
        referenciaCadastro,
        vinculo,
        mensagem: mensagem.trim(),
      });

      if (
        !resultado?.id?.trim() ||
        resultado.status !== "pendente"
      ) {
        throw new Error("Resposta de solicitação inválida.");
      }

      setSolicitacao(resultado);
    } catch {
      setErro(
        "Não foi possível confirmar o envio. Seus dados continuam preenchidos."
      );
    } finally {
      envioEmAndamento.current = false;
      setEnviando(false);
    }
  }

  return {
    vinculo,
    mensagem,
    enviando,
    erro,
    solicitacao,
    selecionarVinculo,
    alterarMensagem,
    solicitar,
  };
}