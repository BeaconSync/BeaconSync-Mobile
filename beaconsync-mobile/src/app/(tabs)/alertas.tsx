import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { useAlertas } from "../../hooks/useAlertas";
import AlertasScreen from "../../screens/AlertasScreen";
import { useTema, usarEstilosTema, type Cores } from "../../theme/tema";
import type { Alerta } from "../../types/alerta";

export default function AlertasRoute() {
  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  const router = useRouter();
  const { estado, recarregar } = useAlertas();

  function abrirPessoa(pessoaId: string, alerta: Alerta) {
    if (alerta.status === "ativo") {
      router.push({
        pathname: "/pessoa/[id]",
        params: {
          id: pessoaId,
          alertaId: alerta.id,
          alertaTitulo: alerta.titulo,
        },
      });

      return;
    }

    router.push({
      pathname: "/pessoa/[id]",
      params: { id: pessoaId },
    });
  }

  return (
    <View style={styles.container}>
      <AlertasScreen
        estado={estado}
        onAbrirPessoa={abrirPessoa}
        onTentarNovamente={() => {
          void recarregar();
        }}
      />
    </View>
  );
}

const criarStyles = (colors: Cores) => (StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
}));