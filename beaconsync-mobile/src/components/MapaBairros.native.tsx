import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ComponentRef } from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import MapView, { Polygon } from "react-native-maps";

import { useTema, usarEstilosTema, type Cores } from "../theme/tema";
import type { MapaBairrosProps } from "../types/monitoramento";

export default function MapaBairros({
  bairros,
  selecionadoId,
  onSelecionar,
}: MapaBairrosProps) {
  const { colors, tema } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  const mapa = useRef<ComponentRef<typeof MapView>>(null);

  const [pronto, setPronto] = useState(false);
  const [layoutPronto, setLayoutPronto] = useState(false);

  const todosPontos = useMemo(
    () =>
      bairros.flatMap((bairro) =>
        bairro.poligonos.flatMap(
          (poligono) => poligono.contorno
        )
      ),
    [bairros]
  );

  const pontosVisiveis = useMemo(() => {
    const selecionado = bairros.find(
      (bairro) => bairro.id === selecionadoId
    );

    const pontos = selecionado?.poligonos.flatMap(
      (poligono) => poligono.contorno
    );

    return pontos?.length ? pontos : todosPontos;
  }, [bairros, selecionadoId, todosPontos]);

  useEffect(() => {
    if (
      !pronto ||
      !layoutPronto ||
      !pontosVisiveis.length
    ) {
      return;
    }

    mapa.current?.fitToCoordinates(pontosVisiveis, {
      edgePadding: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40,
      },
      animated: true,
    });
  }, [pronto, layoutPronto, pontosVisiveis]);

  if (!todosPontos.length) {
    return (
      <View style={styles.vazio}>
        <Text style={styles.texto}>
          Os limites geográficos não estão disponíveis.
          Consulte a lista abaixo.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView userInterfaceStyle={tema === "escuro" ? "dark" : "light"}
        ref={mapa}
        style={styles.mapa}
        onMapReady={() => setPronto(true)}
        onLayout={() => setLayoutPronto(true)}
        initialRegion={{
          ...todosPontos[0],
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {bairros.flatMap((bairro) =>
          bairro.poligonos.map((poligono, indice) => (
            <Polygon
              key={`${bairro.id}-${indice}`}
              coordinates={poligono.contorno}
              holes={poligono.buracos}
              fillColor={`${bairro.cor}99`}
              strokeColor={
                bairro.id === selecionadoId
                  ? colors.text
                  : bairro.cor
              }
              strokeWidth={
                bairro.id === selecionadoId ? 3 : 1.5
              }
              tappable
              onPress={() => onSelecionar(bairro.id)}
            />
          ))
        )}
      </MapView>
    </View>
  );
}

const criarStyles = (colors: Cores) => (StyleSheet.create({
  mapa: {
    width: "100%",
    height: "100%",
  },
  container: {
    height: 320,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.infoBackground,
  },
  vazio: {
    minHeight: 150,
    padding: 20,
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.infoBackground,
  },
  texto: {
    color: colors.infoText,
    fontSize: 14,
    lineHeight: 22,
  },
}));