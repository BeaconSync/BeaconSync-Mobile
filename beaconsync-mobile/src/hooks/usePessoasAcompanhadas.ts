import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

import {
  adaptarPessoaResumo,
  consultarPaginaPessoas,
} from "../services/pessoas";
import { ErroApi } from "../services/http";
import { versaoSessao } from "../services/sessao";
import type {
  EstadoPessoas,
  PessoaResumo,
} from "../types/pessoa";
import { useSessao } from "./useSessao";

export function usePessoasAcompanhadas() {
  const { autenticado } = useSessao();

  const [estado, setEstado] = useState<EstadoPessoas>({
    status: "indisponivel",
  });

  const emFoco = useRef(false);
  const sequencia = useRef(0);

  const carregar = useCallback(async () => {
    if (!emFoco.current) return;

    const consultaAtual = ++sequencia.current;

    if (!autenticado) {
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
      const pessoasPorId = new Map<string, PessoaResumo>();
      let numeroPagina = 0;

      while (consultaContinuaValida()) {
        const pagina = await consultarPaginaPessoas(numeroPagina);

        if (!consultaContinuaValida()) return;

        for (const pessoaApi of pagina.content) {
          const pessoa = adaptarPessoaResumo(pessoaApi);
          pessoasPorId.set(pessoa.id, pessoa);
        }

        if (pagina.last) {
          setEstado({
            status: "sucesso",
            pessoas: Array.from(pessoasPorId.values()),
          });

          return;
        }

        if (
          pagina.content.length === 0 ||
          numeroPagina + 1 >= pagina.totalPages
        ) {
          throw new Error(
            "Não foi possível carregar a lista completa. Tente novamente."
          );
        }

        numeroPagina += 1;
      }
    } catch (erro) {
      if (!consultaContinuaValida()) return;

      const mensagem =
        erro instanceof ErroApi && erro.status === 403
          ? "Sua conta não tem permissão para consultar pessoas acompanhadas."
          : erro instanceof Error
            ? erro.message
            : "Não foi possível carregar as pessoas acompanhadas.";

      setEstado({
        status: "erro",
        mensagem,
      });
    }
  }, [autenticado]);

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
    estado: autenticado
      ? estado
      : ({ status: "indisponivel" } as const),
    recarregar,
  };
}