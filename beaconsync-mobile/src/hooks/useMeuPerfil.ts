import {
  useCallback,
  useRef,
  useState,
} from "react";

import { useFocusEffect } from "expo-router";

import { consultarMeuPerfil } from "../services/perfil";
import { versaoSessao } from "../services/sessao";
import type { EstadoPerfil } from "../types/perfil";

import { useSessao } from "./useSessao";

type ConsultaPerfil = {
  versao: number;
  estado: EstadoPerfil;
};

export function useMeuPerfil(ativo = true) {
  const { autenticado } = useSessao();
  const versaoAtual = versaoSessao();

  const sequencia = useRef(0);
  const emFoco = useRef(false);

  const [consulta, setConsulta] = useState<ConsultaPerfil>(
    () => ({
      versao: versaoAtual,
      estado: { status: "indisponivel" },
    }),
  );

  const carregar = useCallback(async () => {
    if (!emFoco.current) return;

    const numero = ++sequencia.current;
    const versao = versaoSessao();

    // Não inicia uma consulta usando dados de uma renderização
    // que pertence a outra sessão.
    if (versao !== versaoAtual) return;

    if (!autenticado || !ativo) {
      setConsulta({
        versao,
        estado: { status: "indisponivel" },
      });

      return;
    }

    function consultaContinuaValida() {
      return (
        emFoco.current &&
        numero === sequencia.current &&
        versao === versaoSessao()
      );
    }

    setConsulta({
      versao,
      estado: { status: "carregando" },
    });

    try {
      const perfil = await consultarMeuPerfil();

      if (!consultaContinuaValida()) return;

      setConsulta({
        versao,
        estado: {
          status: "sucesso",
          perfil,
        },
      });
    } catch (erro) {
      if (!consultaContinuaValida()) return;

      setConsulta({
        versao,
        estado: {
          status: "erro",
          mensagem:
            erro instanceof Error
              ? erro.message
              : "Não foi possível consultar seu perfil.",
        },
      });
    }
  }, [autenticado, ativo, versaoAtual]);

  useFocusEffect(
    useCallback(() => {
      emFoco.current = true;

      void carregar();

      return () => {
        emFoco.current = false;
        sequencia.current += 1;
      };
    }, [carregar]),
  );

  const estadoAtual: EstadoPerfil =
    autenticado &&
    ativo &&
    consulta.versao === versaoAtual
      ? consulta.estado
      : { status: "indisponivel" };

  return {
    estado: estadoAtual,
    recarregar: carregar,
  };
}