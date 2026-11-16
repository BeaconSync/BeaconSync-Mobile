import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import { useSessao } from "../hooks/useSessao";
import { iniciarSessao } from "../services/sessao";
import { colors } from "../theme/colors";

export default function RootLayout() {
  const {
    pronto,
    autenticado,
    demonstracao,
    erro,
  } = useSessao();

  useEffect(() => {
    void iniciarSessao();
  }, []);

  const podeEntrar =
    autenticado ||
    (__DEV__ && demonstracao);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />

      {!pronto || erro ? (
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: colors.background,
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 24,
              gap: 16,
            }}
          >
            {erro ? (
              <>
                <Text
                  style={{
                    color: colors.text,
                    textAlign: "center",
                  }}
                >
                  {erro}
                </Text>

                <Pressable
                  onPress={() => {
                    void iniciarSessao();
                  }}
                  accessibilityRole="button"
                  style={{
                    padding: 16,
                  }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                    }}
                  >
                    Tentar novamente
                  </Text>
                </Pressable>
              </>
            ) : (
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />
            )}
          </View>
        </SafeAreaView>
      ) : (
        <Stack
          screenOptions={{
            headerShown: false,

            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          <Stack.Screen name="index" />

          <Stack.Protected guard={!podeEntrar}>
            <Stack.Screen name="login" />
            <Stack.Screen name="criar-conta" />
          </Stack.Protected>

          <Stack.Protected guard={podeEntrar}>
            <Stack.Screen name="(tabs)" />

            <Stack.Screen name="pessoa/[id]" />

            <Stack.Screen
              name="cadastrar-pessoa"
              options={{
                headerShown: true,
                title: "Cadastrar pessoa",

                headerStyle: {
                  backgroundColor: colors.background,
                },

                headerTintColor: colors.primary,

                headerTitleStyle: {
                  color: colors.text,
                },

                headerShadowVisible: false,
              }}
            />
          </Stack.Protected>
        </Stack>
      )}
    </SafeAreaProvider>
  );
}