import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { versaoSessao } from "../services/sessao";
import { useSessao } from "./useSessao";

export type ConsultaMonitoramento<T> =
  | { status: "indisponivel" }
  | { status: "carregando" }
  | { status: "erro"; mensagem: string }
  | { status: "sucesso"; dados: T };

export function useConsultaMonitoramento<T>(
  consultar: () => Promise<T>
) {
  const { autenticado } = useSessao();

  const [tentativa, setTentativa] = useState(0);

  const [estado, setEstado] =
    useState<ConsultaMonitoramento<T>>({
      status: "carregando",
    });

  const recarregar = useCallback(() => {
    setEstado({ status: "carregando" });
    setTentativa((valor) => valor + 1);
  }, []);

  useEffect(() => {
    let ativo = true;

    const sessao = versaoSessao();

    const podeAtualizar = () =>
      ativo && sessao === versaoSessao();

    if (!autenticado) {
      setEstado({ status: "indisponivel" });
      return;
    }

    setEstado({ status: "carregando" });

    void (async () => {
      try {
        const dados = await consultar();

        if (podeAtualizar()) {
          setEstado({
            status: "sucesso",
            dados,
          });
        }
      } catch (erro) {
        if (podeAtualizar()) {
          setEstado({
            status: "erro",
            mensagem:
              erro instanceof Error
                ? erro.message
                : "Não foi possível consultar o monitoramento.",
          });
        }
      }
    })();

    return () => {
      ativo = false;
    };
  }, [autenticado, consultar, tentativa]);

  return {
    estado: autenticado
      ? estado
      : { status: "indisponivel" as const },
    recarregar,
  };
}