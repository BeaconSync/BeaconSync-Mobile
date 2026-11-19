import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  consultarMinhasSolicitacoes,
} from "../services/minhasSolicitacoes";

import { versaoSessao } from "../services/sessao";
import { useSessao } from "./useSessao";

import type {
  EstadoSolicitacoesEnviadas,
} from "../types/solicitacaoVinculo";

type Consulta = {
  versao: number;
  estado: EstadoSolicitacoesEnviadas;
};

export function useMinhasSolicitacoes() {
  const { autenticado } = useSessao();
  const versaoAtual = versaoSessao();

  const sequencia = useRef(0);
  const montado = useRef(false);

  const [consulta, setConsulta] = useState<Consulta>(() => ({
    versao: versaoAtual,
    estado: { status: "indisponivel" },
  }));

  const recarregar = useCallback(async () => {
    if (!montado.current) return;

    const numero = ++sequencia.current;
    const versao = versaoSessao();

    if (versao !== versaoAtual) return;

    if (!autenticado) {
      setConsulta({
        versao,
        estado: { status: "indisponivel" },
      });
      return;
    }

    function consultaAtual() {
      return (
        montado.current &&
        numero === sequencia.current &&
        versao === versaoSessao()
      );
    }

    setConsulta({
      versao,
      estado: { status: "carregando" },
    });

    try {
      const solicitacoes =
        await consultarMinhasSolicitacoes();

      if (!consultaAtual()) return;

      setConsulta({
        versao,
        estado: {
          status: "sucesso",
          solicitacoes,
        },
      });
    } catch (erro) {
      if (!consultaAtual()) return;

      setConsulta({
        versao,
        estado: {
          status: "erro",
          mensagem:
            erro instanceof Error
              ? erro.message
              : "Não foi possível consultar seus pedidos.",
        },
      });
    }
  }, [autenticado, versaoAtual]);

  useEffect(() => {
    montado.current = true;
    void recarregar();

    return () => {
      montado.current = false;
      sequencia.current += 1;
    };
  }, [recarregar]);

  const estado: EstadoSolicitacoesEnviadas =
    autenticado && consulta.versao === versaoAtual
      ? consulta.estado
      : { status: "indisponivel" };

  return {
    estado,
    recarregar,
  };
}