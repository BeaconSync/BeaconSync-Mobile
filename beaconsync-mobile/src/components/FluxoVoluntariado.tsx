import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import CadastroVoluntarioScreen from "../screens/CadastroVoluntarioScreen";
import PainelVoluntarioScreen from "../screens/PainelVoluntarioScreen";

import {
  atualizarMinhaDisponibilidade,
  cadastrarMeuVoluntariado,
  consultarMeuVoluntariado,
  salvarMeuVoluntariado,
} from "../services/voluntariado";

import type {
  DadosPerfil,
} from "../types/perfil";

import type {
  EstadoVoluntario,
  Voluntario,
} from "../types/voluntario";

type Props = {
  perfil: DadosPerfil;
  onFechar: () => void;
};

type Estado =
  | EstadoVoluntario
  | { status: "nao_cadastrado" };

export default function FluxoVoluntariado({
  perfil,
  onFechar,
}: Props) {
  const [estado, setEstado] =
    useState<Estado>({
      status: "carregando",
    });

  const sequencia = useRef(0);

  const cadastroConfirmado =
    useRef<Voluntario | null>(null);

  const carregar = useCallback(async () => {
    const consulta = ++sequencia.current;

    setEstado({
      status: "carregando",
    });

    try {
      const voluntario =
        await consultarMeuVoluntariado();

      if (
        consulta !== sequencia.current
      ) {
        return;
      }

      setEstado(
        voluntario
          ? {
              status: "sucesso",
              voluntario,
            }
          : {
              status: "nao_cadastrado",
            },
      );
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
            : "Não foi possível consultar seu voluntariado.",
      });
    }
  }, []);

  useEffect(() => {
    void carregar();

    return () => {
      sequencia.current += 1;
    };
  }, [carregar]);

  if (
    estado.status === "nao_cadastrado"
  ) {
    return (
      <CadastroVoluntarioScreen
        perfil={perfil}

        onCadastrar={async (dados) => {
          cadastroConfirmado.current =
            await cadastrarMeuVoluntariado(
              perfil,
              dados,
            );
        }}

        onFechar={() => {
          const voluntario =
            cadastroConfirmado.current;

          if (voluntario) {
            cadastroConfirmado.current =
              null;

            setEstado({
              status: "sucesso",
              voluntario,
            });
          } else {
            onFechar();
          }
        }}
      />
    );
  }

  return (
    <PainelVoluntarioScreen
      nomeUsuario={perfil.nome}
      estado={estado}
      onFechar={onFechar}

      onTentarNovamente={() => {
        void carregar();
      }}

      onAtualizado={(voluntario) => {
        setEstado({
          status: "sucesso",
          voluntario,
        });
      }}

      onAtualizarDisponibilidade={(
        _id,
        disponivel,
      ) =>
        atualizarMinhaDisponibilidade(
          disponivel,
        )
      }

      onSalvarEdicao={(_id, dados) =>
        salvarMeuVoluntariado(
          perfil,
          dados,
        )
      }
    />
  );
}