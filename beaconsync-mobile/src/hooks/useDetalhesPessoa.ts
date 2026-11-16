import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

import { ErroApi } from "../services/http";
import { consultarDetalhesPessoa } from "../services/pessoas";
import { versaoSessao } from "../services/sessao";
import type { EstadoDetalhesPessoa } from "../types/detalhaPessoa";
import { useSessao } from "./useSessao";

export function useDetalhesPessoa(id?: string) {
  const { autenticado } = useSessao();

  const [estado, setEstado] = useState<EstadoDetalhesPessoa>({
    status: "indisponivel",
  });

  const sequencia = useRef(0);
  const emFoco = useRef(false);

  const carregar = useCallback(async () => {
    if (!emFoco.current) return;

    const consultaAtual = ++sequencia.current;

    if (!autenticado || !id) {
      setEstado({ status: "indisponivel" });
      return;
    }

    const sessaoInicial = versaoSessao();

    function consultaContinuaValida() {
      return (
        emFoco.current &&
        sequencia.current === consultaAtual &&
        versaoSessao() === sessaoInicial
      );
    }

    setEstado({ status: "carregando" });

    try {
      const pessoa = await consultarDetalhesPessoa(id);

      if (!consultaContinuaValida()) return;

      setEstado({
        status: "sucesso",
        pessoa,
      });
    } catch (erro) {
      if (!consultaContinuaValida()) return;

      if (erro instanceof ErroApi && erro.status === 404) {
        setEstado({ status: "nao_encontrada" });
        return;
      }

      const mensagem =
        erro instanceof ErroApi && erro.status === 403
          ? "Sua conta não tem permissão para acessar este cadastro."
          : erro instanceof Error
            ? erro.message
            : "Não foi possível consultar os dados da pessoa.";

      setEstado({
        status: "erro",
        mensagem,
      });
    }
  }, [autenticado, id]);

  useFocusEffect(
    useCallback(() => {
      emFoco.current = true;
      void carregar();

      return () => {
        emFoco.current = false;
        sequencia.current += 1;
      };
    }, [carregar])
  );

  function recarregar() {
    void carregar();
  }

  return {
    estado:
      autenticado && id
        ? estado
        : ({ status: "indisponivel" } as const),
    recarregar,
  };
}