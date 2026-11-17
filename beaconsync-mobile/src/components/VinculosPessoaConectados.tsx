import {
  useEffect,
  useState,
  type ComponentProps,
} from "react";

import VinculosPessoaScreen from "../screens/VinculoPessoaScreen";
import { useSessao } from "../hooks/useSessao";
import { consultarVinculosPessoa } from "../services/vinculosPessoa";
import { ErroApi } from "../services/http";

type Props = {
  pessoaId: string;
  nomePessoa: string;
  onFechar: () => void;
};

type EstadoVinculos =
  ComponentProps<typeof VinculosPessoaScreen>["estado"];

export default function VinculosPessoaConectados({
  pessoaId,
  nomePessoa,
  onFechar,
}: Props) {
  const { autenticado } = useSessao();

  const [estado, setEstado] = useState<EstadoVinculos>({
    status: "carregando",
  });

  useEffect(() => {
    let ativo = true;

    if (!autenticado) {
      setEstado({ status: "indisponivel" });
      return;
    }

    async function carregar() {
      setEstado({ status: "carregando" });

      try {
        const vinculos = await consultarVinculosPessoa(pessoaId);

        if (!ativo) return;

        setEstado({
          status: "sucesso",
          vinculos,
        });
      } catch (erro) {
        if (!ativo) return;

        const mensagem =
          erro instanceof ErroApi && erro.status === 403
            ? "Sua conta não tem permissão para consultar os vínculos desta pessoa."
            : erro instanceof Error
              ? erro.message
              : "Não foi possível consultar os vínculos.";

        setEstado({
          status: "erro",
          mensagem,
        });
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [pessoaId, autenticado]);

  return (
    <VinculosPessoaScreen
      nomePessoa={nomePessoa}
      estado={
        autenticado
          ? estado
          : { status: "indisponivel" }
      }
      demonstracao={false}
      onFechar={onFechar}
    />
  );
}