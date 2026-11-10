import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AlertasScreen from "../../screens/AlertasScreen";
import { colors } from "../../theme/colors";
import type {
  Alerta,
  EstadoAlertas,
} from "../../types/alerta";

const alertasExemplo: Alerta[] = [
  {
    id: "alerta-demonstracao",
    titulo: "Alerta de enchente · exemplo",
    descricao:
      "Alerta fictício para visualizar o acompanhamento de pessoas relacionadas a uma região.",
    status: "ativo",
    area: "Região de exemplo",
    nivel: "Exemplo de nível de atenção",
    fonte: "Demonstração do BeaconSync",
    emitidoEm: "2026-11-10T09:00:00-03:00",
    orientacoes: [
      "Conteúdo demonstrativo: aqui aparecerão as orientações fornecidas pela fonte do alerta.",
    ],
    pessoasRelacionadas: {
      status: "sucesso",
      pessoas: [
        {
          id: "demonstracao",
          nome: "Pessoa de exemplo",
          localReferencia: "Casa de referência",
          situacao: null,
          dataResposta: null,
        },
      ],
    },
  },
  {
    id: "alerta-encerrado-demonstracao",
    titulo: "Aviso encerrado · exemplo",
    descricao:
      "Registro fictício para testar o filtro de alertas encerrados.",
    status: "encerrado",
    area: "Outra região de exemplo",
    nivel: null,
    fonte: "Demonstração do BeaconSync",
    emitidoEm: "2026-11-09T15:00:00-03:00",
    orientacoes: [],
    pessoasRelacionadas: {
      status: "sucesso",
      pessoas: [],
    },
  },
];

export default function AlertasRoute() {
  const router = useRouter();
  const [mostrarExemplo, setMostrarExemplo] = useState(false);

  const demonstracao = __DEV__ && mostrarExemplo;

  const estado: EstadoAlertas = demonstracao
    ? {
        status: "sucesso",
        alertas: alertasExemplo,
      }
    : {
        status: "indisponivel",
      };

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
        demonstracao={demonstracao}
        onAbrirPessoa={abrirPessoa}
      />

      {__DEV__ && (
        <Pressable
          onPress={() => setMostrarExemplo((atual) => !atual)}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.previewButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.previewText}>
            {demonstracao
              ? "Fechar prévia dos alertas"
              : "Visualizar alertas de exemplo · teste"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  previewButton: {
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  previewText: {
    fontSize: 13,
    color: colors.primary,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.7,
  },
});