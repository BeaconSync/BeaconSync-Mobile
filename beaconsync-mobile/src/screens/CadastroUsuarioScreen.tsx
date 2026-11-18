import { useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";

import {
  Alert,
  Image,
  Keyboard,
  Pressable,
  Text,
  View,
} from "react-native";

import TelaAcesso from "../components/TelaAcesso";
import type { AcoesAcesso } from "../hooks/useAcessoForm";

import { prepararFotoPerfil } from "../services/fotoPerfil";
import { enviarFotoNovaConta } from "../services/fotoNovaConta";
import { colors } from "../theme/colors";

export default function CadastroUsuarioScreen({
  onCadastro,
}: Pick<AcoesAcesso, "onCadastro">) {
  const [fotoUri, setFotoUri] =
    useState<string | null>(null);

  const [escolhendo, setEscolhendo] = useState(false);

  const selecionando = useRef(false);

  const avisoFinal = useRef(
    "Agora você pode entrar com seu e-mail e sua senha."
  );

  async function escolherFoto() {
    if (selecionando.current) return;

    selecionando.current = true;
    setEscolhendo(true);
    Keyboard.dismiss();

    try {
      const resultado =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (
        !resultado.canceled &&
        resultado.assets[0]?.uri
      ) {
        setFotoUri(resultado.assets[0].uri);
      }
    } catch {
      Alert.alert(
        "Foto de perfil",
        "Não foi possível selecionar a foto. Tente novamente."
      );
    } finally {
      selecionando.current = false;
      setEscolhendo(false);
    }
  }

  return (
    <TelaAcesso
      modo="cadastro"
      bloqueado={escolhendo}
      onCadastro={
        onCadastro
          ? async (dados) => {
              // Valida e prepara a imagem antes de criar a conta.
              const formulario = fotoUri
                ? await prepararFotoPerfil(fotoUri)
                : null;

              await onCadastro(dados);

              const aviso = formulario
                ? await enviarFotoNovaConta(
                    {
                      email: dados.email,
                      senha: dados.senha,
                    },
                    formulario
                  )
                : null;

              avisoFinal.current =
                aviso ??
                (
                  formulario
                    ? "Sua conta e sua foto foram salvas. Agora entre com seu e-mail e sua senha."
                    : "Agora você pode entrar com seu e-mail e sua senha."
                );
            }
          : undefined
      }
      onCadastroConcluido={() => {
        Alert.alert(
          "Conta criada",
          avisoFinal.current
        );
      }}
      renderizarCadastro={(enviando) => (
        <View
          style={{
            gap: 12,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: colors.text,
            }}
          >
            Foto de perfil (opcional)
          </Text>

          {fotoUri && (
            <Image
              source={{ uri: fotoUri }}
              accessibilityLabel="Prévia da sua foto de perfil"
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
              }}
            />
          )}

          <Pressable
            onPress={escolherFoto}
            disabled={enviando}
            accessibilityRole="button"
            style={({ pressed }) => ({
              minHeight: 48,
              padding: 14,
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: colors.primaryLight,
              opacity:
                pressed || enviando ? 0.6 : 1,
            })}
          >
            <Text
              style={{
                color: colors.primary,
                fontWeight: "600",
              }}
            >
              {escolhendo
                ? "Abrindo galeria..."
                : fotoUri
                  ? "Alterar foto"
                  : "Adicionar foto"}
            </Text>
          </Pressable>

          {fotoUri && (
            <Pressable
              onPress={() => setFotoUri(null)}
              disabled={enviando}
              accessibilityRole="button"
              style={{
                minHeight: 44,
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                }}
              >
                Remover foto
              </Text>
            </Pressable>
          )}

          <Text
            style={{
              fontSize: 13,
              lineHeight: 20,
              color: colors.textSecondary,
            }}
          >
            A foto será enviada após a criação da conta.
            Você também pode alterá-la depois no perfil.
          </Text>
        </View>
      )}
    />
  );
}