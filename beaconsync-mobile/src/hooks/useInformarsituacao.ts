import { useRef, useState } from "react";

import type {
  EnviarSituacao,
  StatusInformado,
} from "../types/informarSituacao";

export function useInformarSituacao(
  onEnviar?: EnviarSituacao,
  alertaId: string | null = null
) {
  const [status, setStatus] =
    useState<StatusInformado | null>(null);

  const [enderecoId, setEnderecoId] =
    useState<string | null>(null);

  const [observacao, setObservacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const envioEmAndamento = useRef(false);

  function selecionarStatus(valor: StatusInformado) {
    if (envioEmAndamento.current) return;

    setStatus(valor);
    setErro(null);
  }

  function selecionarEndereco(valor: string | null) {
    if (envioEmAndamento.current) return;

    setEnderecoId(valor);
    setErro(null);
  }

  function alterarObservacao(valor: string) {
    if (envioEmAndamento.current) return;

    setObservacao(valor.slice(0, 500));
    setErro(null);
  }

  async function enviar() {
    if (envioEmAndamento.current) return false;

    setErro(null);

    if (!status) {
      setErro("Selecione a situação da pessoa antes de continuar.");
      return false;
    }

    if (!onEnviar) {
      setErro(
        "O envio está indisponível no momento. Nenhuma situação foi registrada."
      );
      return false;
    }

    envioEmAndamento.current = true;
    setEnviando(true);

    try {
      await onEnviar({
  alertaId,
  status,
  enderecoOndeEstaId: enderecoId,
  observacao: observacao.trim(),
});

      return true;
    } catch {
      setErro(
        "Não foi possível confirmar o envio. Seus dados continuam preenchidos. Consulte a situação antes de tentar novamente."
      );

      return false;
    } finally {
      envioEmAndamento.current = false;
      setEnviando(false);
    }
  }

  return {
    status,
    enderecoId,
    observacao,
    enviando,
    erro,
    selecionarStatus,
    selecionarEndereco,
    alterarObservacao,
    enviar,
  };
}