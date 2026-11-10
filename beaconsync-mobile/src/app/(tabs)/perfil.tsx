import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import MenuTestes from "../../components/MenuTestes";
import CadastroVoluntarioScreen from "../../screens/CadastroVoluntarioScreen";
import EditarPerfilScreen from "../../screens/EditarPerfilScreen";
import PainelVoluntarioScreen from "../../screens/PainelVoluntarioScreen";
import PerfilScreen from "../../screens/PerfilScreen";

import { colors } from "../../theme/colors";

import type {
  DadosPerfil,
  EstadoPerfil,
} from "../../types/perfil";

import type { Voluntario } from "../../types/voluntario";

const perfilExemplo: DadosPerfil = {
  id: "perfil-demonstracao",
  nome: "Usuário de exemplo",
  email: "usuario@example.com",
  telefone: null,
  fotoUrl: null,
};

const voluntarioExemplo: Voluntario = {
  id: "voluntario-demonstracao",
  telefone: "(11) 90000-0000",
  cidade: "São Paulo",
  uf: "SP",
  especialidade: "Organização de doações",
  outraEspecialidade: "",
  disponivel: true,
  observacoes:
    "Exemplo fictício: disponibilidade aos finais de semana.",
  atualizadoEm: "2026-11-10T10:00:00-03:00",
};

export default function PerfilRoute() {
  const router = useRouter();

  const [mostrarExemplo, setMostrarExemplo] = useState(false);
  const [editando, setEditando] = useState(false);

  const [cadastrandoVoluntario, setCadastrandoVoluntario] =
    useState(false);

  const [vendoPainelVoluntario, setVendoPainelVoluntario] =
    useState(false);

  const [perfil, setPerfil] =
    useState<DadosPerfil>(perfilExemplo);

  const [voluntario, setVoluntario] =
    useState<Voluntario | null>(null);

  const demonstracao = __DEV__ && mostrarExemplo;

  const estado: EstadoPerfil = demonstracao
    ? {
        status: "sucesso",
        perfil,
      }
    : {
        status: "indisponivel",
      };

  function concluirEdicao(atualizado: DadosPerfil) {
    setPerfil(atualizado);
    setEditando(false);
  }

  function abrirVoluntariado() {
    if (voluntario) {
      setVendoPainelVoluntario(true);
    } else {
      setCadastrandoVoluntario(true);
    }
  }

  return (
    <View style={styles.container}>
      <PerfilScreen
        estado={estado}
        demonstracao={demonstracao}
        onVoltarLogin={() => router.replace("/login")}
        onEditar={
          estado.status === "sucesso"
            ? () => setEditando(true)
            : undefined
        }
        onVoluntariado={
          estado.status === "sucesso"
            ? abrirVoluntariado
            : undefined
        }
        rotuloVoluntariado={
          voluntario
            ? "Meu voluntariado"
            : "Quero ser voluntário"
        }
      />

      {__DEV__ && (
        <MenuTestes
          opcoes={[
            {
              id: "perfil-sem-voluntariado",
              titulo: "Perfil sem cadastro de voluntário",
              onPress: () => {
                setMostrarExemplo(true);
                setVoluntario(null);
              },
            },
            {
              id: "painel-voluntario",
              titulo: "Painel de voluntário de exemplo",
              onPress: () => {
                setMostrarExemplo(true);
                setVoluntario(voluntarioExemplo);
                setVendoPainelVoluntario(true);
              },
            },
            {
              id: "fechar-previa",
              titulo: "Fechar prévia do perfil",
              onPress: () => setMostrarExemplo(false),
            },
          ]}
        />
      )}

      {editando && estado.status === "sucesso" && (
        <EditarPerfilScreen
          perfil={estado.perfil}
          demonstracao={demonstracao}
          onCancelar={() => setEditando(false)}
          onConcluido={concluirEdicao}
        />
      )}

      {cadastrandoVoluntario &&
        estado.status === "sucesso" && (
          <CadastroVoluntarioScreen
            perfil={estado.perfil}
            demonstracao={demonstracao}
            onFechar={() => setCadastrandoVoluntario(false)}
          />
        )}

      {vendoPainelVoluntario &&
        estado.status === "sucesso" &&
        voluntario && (
          <PainelVoluntarioScreen
            nomeUsuario={estado.perfil.nome}
            estado={{
              status: "sucesso",
              voluntario,
            }}
            demonstracao={demonstracao}
            onFechar={() => setVendoPainelVoluntario(false)}
            onAtualizado={setVoluntario}
          />
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});