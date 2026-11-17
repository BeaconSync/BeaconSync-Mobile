import {
  useCallback,
  useRef,
  useState,
} from "react";

import { useFocusEffect } from "expo-router";

import { consultarAlertas } from "../services/alertas";
import { versaoSessao } from "../services/sessao";
import { completarPessoasDosAlertas } from "../services/pessoasDosAlertas";
import type { EstadoAlertas } from "../types/alerta";

import { useSessao } from "./useSessao";

export function useAlertas(ativo = true) {
  const { autenticado } = useSessao();

  const sequencia = useRef(0);
  const emFoco = useRef(false);

  const [estado, setEstado] =
    useState<EstadoAlertas>({
      status: "indisponivel",
    });

  const recarregar = useCallback(async () => {
    if (!emFoco.current) return;

    const consulta = ++sequencia.current;
    const versao = versaoSessao();

    if (!autenticado || !ativo) {
      setEstado({
        status: "indisponivel",
      });

      return;
    }

    setEstado({
      status: "carregando",
    });

    try {
      const consultados = await consultarAlertas();

if (
  consulta !== sequencia.current ||
  versao !== versaoSessao()
) {
  return;
}

const alertas =
  await completarPessoasDosAlertas(consultados);

      if (
        consulta === sequencia.current &&
        versao === versaoSessao()
      ) {
        setEstado({
          status: "sucesso",
          alertas,
        });
      }
    } catch (erro) {
      if (
        consulta === sequencia.current &&
        versao === versaoSessao()
      ) {
        setEstado({
          status: "erro",
          mensagem:
            erro instanceof Error
              ? erro.message
              : "Não foi possível consultar os alertas.",
        });
      }
    }
  }, [autenticado, ativo]);

  useFocusEffect(
    useCallback(() => {
      emFoco.current = true;

      void recarregar();

      return () => {
        emFoco.current = false;
        sequencia.current += 1;
      };
    }, [recarregar])
  );

  const estadoAtual: EstadoAlertas =
    autenticado && ativo
      ? estado
      : {
          status: "indisponivel",
        };

  return {
    estado: estadoAtual,
    recarregar,
  };
}