import {
  useEffect,
  useRef,
  useState,
} from "react";

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

  const [enviando, setEnviando] =
    useState(false);

  const [erro, setErro] =
    useState<string | null>(null);

  const [solicitacao, setSolicitacao] =
    useState<ResultadoSolicitacaoVinculo | null>(null);

  const trava = useRef(false);
  const concluida = useRef(false);
  const ativo = useRef(true);

  useEffect(() => {
    ativo.current = true;

    return () => {
      ativo.current = false;
    };
  }, []);

  function selecionarVinculo(
    valor: TipoVinculoSolicitado
  ) {
    if (trava.current || concluida.current) return;

    setVinculo(valor);
    setErro(null);
  }

  async function solicitar() {
    if (trava.current || concluida.current) return;

    setErro(null);

    if (
      !vinculo ||
      !opcoesVinculo.includes(vinculo)
    ) {
      setErro(
        "Selecione seu vínculo com a pessoa."
      );
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
        "O envio está indisponível nesta prévia. Nenhuma solicitação foi enviada."
      );
      return;
    }

    trava.current = true;
    setEnviando(true);

    try {
      const resultado = await onSolicitar({
        referenciaCadastro,
        vinculo,
        mensagem: "",
      });

      if (
        typeof resultado?.id !== "string" ||
        !resultado.id.trim() ||
        resultado.status !== "pendente"
      ) {
        throw new Error(
          "Não foi possível confirmar a solicitação retornada pela API."
        );
      }

      concluida.current = true;

      if (ativo.current) {
        setSolicitacao(resultado);
      }
    } catch (erroRecebido) {
      if (ativo.current) {
        const mensagem =
          erroRecebido instanceof Error
            ? erroRecebido.message
            : "Não foi possível confirmar o envio.";

        setErro(
          mensagem +
          " Se houve falha de conexão, confira com o responsável antes de reenviar."
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
    vinculo,
    enviando,
    erro,
    solicitacao,
    selecionarVinculo,
    solicitar,
  };
}