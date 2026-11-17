import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useSessao } from "../hooks/useSessao";
import SolicitacoesRecebidasScreen from "../screens/SolicitacoesRecebidasScreen";

import {
  consultarSolicitacoesRecebidas,
  responderSolicitacaoRecebida,
} from "../services/solicitacoesRecebidas";

import { versaoSessao } from "../services/sessao";

import type {
  EstadoSolicitacoesRecebidas,
  ResponderSolicitacaoVinculo,
  SolicitacaoVinculoRecebida,
} from "../types/solicitacaoVinculo";

type Props = {
  onFechar: () => void;
};

export default function SolicitacoesRecebidasConectadas({
  onFechar,
}: Props) {
  const { autenticado } = useSessao();

  const [estado, setEstado] =
    useState<EstadoSolicitacoesRecebidas>({
      status: "indisponivel",
    });

  const consulta = useRef(0);

  const carregar = useCallback(async () => {
    const numero = ++consulta.current;
    const versao = versaoSessao();

    if (!autenticado) {
      setEstado({ status: "indisponivel" });
      return;
    }

    setEstado({ status: "carregando" });

    try {
      const solicitacoes =
        await consultarSolicitacoesRecebidas();

      if (
        numero === consulta.current &&
        versao === versaoSessao()
      ) {
        setEstado({
          status: "sucesso",
          solicitacoes,
        });
      }
    } catch (erro) {
      if (
        numero === consulta.current &&
        versao === versaoSessao()
      ) {
        setEstado({
          status: "erro",
          mensagem:
            erro instanceof Error
              ? erro.message
              : "Não foi possível consultar as solicitações.",
        });
      }
    }
  }, [autenticado]);

  useEffect(() => {
    void carregar();

    return () => {
      consulta.current += 1;
    };
  }, [carregar]);

  const responder: ResponderSolicitacaoVinculo = async (
    id,
    decisao
  ) => {
    const original =
      estado.status === "sucesso"
        ? estado.solicitacoes.find((item) => item.id === id)
        : undefined;

    if (!autenticado || !original) {
      throw new Error(
        "Abra novamente as solicitações antes de responder."
      );
    }

    return responderSolicitacaoRecebida(
      original,
      decisao
    );
  };

  function atualizar(
    atualizada: SolicitacaoVinculoRecebida
  ) {
    setEstado((atual) =>
      atual.status === "sucesso"
        ? {
            ...atual,
            solicitacoes: atual.solicitacoes.map((item) =>
              item.id === atualizada.id
                ? atualizada
                : item
            ),
          }
        : atual
    );
  }

  return (
    <SolicitacoesRecebidasScreen
      estado={estado}
      consultaParcial
      onFechar={onFechar}
      onResponder={responder}
      onAtualizada={atualizar}
      onTentarNovamente={() => {
        void carregar();
      }}
    />
  );
}