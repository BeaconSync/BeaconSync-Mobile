import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTema, usarEstilosTema, type Cores } from "../theme/tema";
import type { MapaBairrosProps } from "../types/monitoramento";

export default function MapaBairros(
  _props: MapaBairrosProps
) {
  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  return (
    <View style={styles.card}>
      <Text style={styles.texto}>
        Abra no Android ou iPhone para visualizar o mapa.
        No navegador, consulte e selecione os bairros pela
        lista abaixo.
      </Text>
    </View>
  );
}

const criarStyles = (colors: Cores) => (StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: colors.infoBackground,
  },
  texto: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.infoText,
  },
}));