import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import FluxoVoluntariado from "../../components/FluxoVoluntariado";
import { useMeuPerfil } from "../../hooks/useMeuPerfil";

import { consultarMeuVoluntariado } from "../../services/voluntariado";
import { criarSalvamentoDadosPerfil } from "../../services/editarPerfil";
import { sair } from "../../services/sessao";

import EditarPerfilScreen from "../../screens/EditarPerfilScreen";
import PerfilScreen from "../../screens/PerfilScreen";

import { useTema, usarEstilosTema, type Cores } from "../../theme/tema";
import type { DadosPerfil } from "../../types/perfil";

export default function PerfilRoute() {
  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  const verificacaoVoluntariado = useRef<string | null>(null);

  const [vendoVoluntariado, setVendoVoluntariado] =
    useState(false);

  const [editando, setEditando] = useState(false);

  const { estado, recarregar } = useMeuPerfil();

  const idPerfil =
    estado.status === "sucesso"
      ? estado.perfil.id
      : null;

  const papelPerfil =
    estado.status === "sucesso"
      ? estado.perfil.papel
      : null;

  useEffect(() => {
    if (!idPerfil || !papelPerfil) {
      return;
    }

    if (papelPerfil !== "VOLUNTARIO") {
      verificacaoVoluntariado.current = null;
      return;
    }

    if (
      editando ||
      vendoVoluntariado ||
      verificacaoVoluntariado.current === idPerfil
    ) {
      return;
    }

    let cancelado = false;

    async function verificarCadastro() {
      try {
        const cadastro = await consultarMeuVoluntariado();

        if (cancelado) return;

        verificacaoVoluntariado.current = idPerfil;

        if (cadastro === null) {
          setVendoVoluntariado(true);
        }
      } catch {
        if (cancelado) return;

        verificacaoVoluntariado.current = idPerfil;

        // O fluxo apresenta o erro e permite tentar novamente.
        setVendoVoluntariado(true);
      }
    }

    void verificarCadastro();

    return () => {
      cancelado = true;
    };
  }, [
    idPerfil,
    papelPerfil,
    editando,
    vendoVoluntariado,
  ]);

  async function encerrarSessao() {
    try {
      const aviso = await sair();

      if (aviso) {
        Alert.alert("Saída da conta", aviso);
      }
    } catch {
      Alert.alert(
        "Não foi possível concluir a saída",
        "Não conseguimos apagar a sessão armazenada. Tente novamente."
      );
    }
  }

  function concluirEdicao(atualizado: DadosPerfil) {
    const virouVoluntario =
      estado.status === "sucesso" &&
      estado.perfil.papel !== "VOLUNTARIO" &&
      atualizado.papel === "VOLUNTARIO";

    setEditando(false);

    if (virouVoluntario) {
      verificacaoVoluntariado.current = atualizado.id;
      setVendoVoluntariado(true);
    } else if (atualizado.papel !== "VOLUNTARIO") {
      verificacaoVoluntariado.current = null;
      setVendoVoluntariado(false);
    }

    void recarregar();
  }

  return (
    <View style={styles.container}>
      <PerfilScreen
        estado={estado}
        onVoltarLogin={() => {
          void encerrarSessao();
        }}
        onTentarNovamente={() => {
          void recarregar();
        }}
        onEditar={
          estado.status === "sucesso"
            ? () => setEditando(true)
            : undefined
        }
        onVoluntariado={
          estado.status === "sucesso" &&
          estado.perfil.papel === "VOLUNTARIO"
            ? () => setVendoVoluntariado(true)
            : undefined
        }
        rotuloVoluntariado="Meu voluntariado"
      />

      {vendoVoluntariado &&
        !editando &&
        estado.status === "sucesso" &&
        estado.perfil.papel === "VOLUNTARIO" && (
          <FluxoVoluntariado
            key={estado.perfil.id}
            perfil={estado.perfil}
            onFechar={() => setVendoVoluntariado(false)}
          />
        )}

      {editando && estado.status === "sucesso" && (
        <EditarPerfilScreen
          key={estado.perfil.id}
          perfil={estado.perfil}
          onCancelar={() => {
            setEditando(false);
            void recarregar();
          }}
          onConcluido={concluirEdicao}
          onSalvar={criarSalvamentoDadosPerfil(
            estado.perfil
          )}
        />
      )}
    </View>
  );
}

const criarStyles = (colors: Cores) => (StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
}));