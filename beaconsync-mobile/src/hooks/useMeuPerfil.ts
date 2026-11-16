import {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  useFocusEffect,
} from "expo-router";

import {
  consultarMeuPerfil,
} from "../services/perfil";

import type {
  EstadoPerfil,
} from "../types/perfil";

import { useSessao } from "./useSessao";

export function useMeuPerfil(
  ativo = true,
) {
  const { autenticado } = useSessao();

  const sequencia = useRef(0);
  const emFoco = useRef(false);

  const [estado, setEstado] =
    useState<EstadoPerfil>({
      status: "indisponivel",
    });

  const carregar = useCallback(async () => {
    if (!emFoco.current) return;

    const consulta = ++sequencia.current;

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
      const perfil =
        await consultarMeuPerfil();

      if (
        consulta !== sequencia.current
      ) {
        return;
      }

      setEstado({
        status: "sucesso",
        perfil,
      });
    } catch (erro) {
      if (
        consulta !== sequencia.current
      ) {
        return;
      }

      setEstado({
        status: "erro",

        mensagem:
          erro instanceof Error
            ? erro.message
            : "Não foi possível consultar seu perfil.",
      });
    }
  }, [autenticado, ativo]);

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
    autenticado && ativo
      ? estado
      : {
          status: "indisponivel",
        };

  return {
    estado: estadoAtual,
    recarregar: carregar,
  };
}