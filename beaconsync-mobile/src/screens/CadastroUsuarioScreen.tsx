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

import CampoFormulario from "../components/CampoFormulario";

import {
  especialidadesVoluntario,
  type DadosCadastroVoluntario,
} from "../types/voluntario";

import {
  cadastrarVoluntariadoNovaConta,
  validarVoluntariadoNovaConta,
} from "../services/voluntariadoNovaConta";

import TelaAcesso from "../components/TelaAcesso";
import type { AcoesAcesso } from "../hooks/useAcessoForm";

import { prepararFotoPerfil } from "../services/fotoPerfil";
import { enviarFotoNovaConta } from "../services/fotoNovaConta";
import { useTema, usarEstilosTema, type Cores } from "../theme/tema";

export default function CadastroUsuarioScreen({
  onCadastro,
}: Pick<AcoesAcesso, "onCadastro">) {
  const { colors } = useTema();

  const [fotoUri, setFotoUri] =
    useState<string | null>(null);

    const [voluntariado, setVoluntariado] =
  useState<DadosCadastroVoluntario>({
    telefone: "",
    cidade: "",
    uf: "",
    especialidade: "",
    outraEspecialidade: "",
    disponivel: false,
    observacoes: "",
  });

function alterarVoluntariado<
  K extends keyof DadosCadastroVoluntario,
>(
  campo: K,
  valor: DadosCadastroVoluntario[K],
) {
  setVoluntariado((atual) => ({
    ...atual,
    [campo]: valor,
  }));
}

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
        // Valida antes de criar a conta no Java.
        if (dados.papel === "VOLUNTARIO") {
          validarVoluntariadoNovaConta(
            dados,
            voluntariado,
          );
        }

        const formulario = fotoUri
          ? await prepararFotoPerfil(fotoUri)
          : null;

        await onCadastro(dados);

        // A partir daqui, a conta Java já existe.
        // Falhas complementares viram avisos, evitando
        // pedir que o usuário crie a mesma conta novamente.
        const avisos: string[] = [];

        if (dados.papel === "VOLUNTARIO") {
          const aviso =
            await cadastrarVoluntariadoNovaConta(
              dados,
              voluntariado,
            );

          if (aviso) avisos.push(aviso);
        }

        if (formulario) {
          const aviso = await enviarFotoNovaConta(
            {
              email: dados.email,
              senha: dados.senha,
            },
            formulario,
          );

          if (aviso) avisos.push(aviso);
        }

        avisoFinal.current =
          avisos.length > 0
            ? avisos.join("\n\n")
            : dados.papel === "VOLUNTARIO"
              ? "Sua conta e seu cadastro de voluntariado foram salvos. Agora entre com seu e-mail e sua senha."
              : "Sua conta foi criada. Agora entre com seu e-mail e sua senha.";
      }
    : undefined
}
      onCadastroConcluido={() => {
        Alert.alert(
          "Conta criada",
          avisoFinal.current
        );
      }}
      renderizarVoluntariado={(enviando) => (
  <View style={{ gap: 12, marginBottom: 24 }}>
    <Text
      style={{
        fontSize: 20,
        fontWeight: "600",
        color: colors.text,
      }}
    >
      Seu voluntariado
    </Text>

    <Text
      style={{
        fontSize: 14,
        lineHeight: 21,
        color: colors.textSecondary,
      }}
    >
      Informe onde e como você pode ajudar.
      Usaremos o telefone informado na sua conta.
    </Text>

    <CampoFormulario
      label="Cidade de atuação"
      value={voluntariado.cidade}
      onChangeText={(valor) =>
        alterarVoluntariado("cidade", valor)
      }
      placeholder="Ex.: São Paulo"
      maxLength={100}
      autoCapitalize="words"
      editable={!enviando}
    />

    <CampoFormulario
      label="Estado (UF)"
      value={voluntariado.uf}
      onChangeText={(valor) =>
        alterarVoluntariado(
          "uf",
          valor.replace(/[^a-zA-Z]/g, "").toUpperCase(),
        )
      }
      placeholder="Ex.: SP"
      maxLength={2}
      autoCapitalize="characters"
      autoCorrect={false}
      editable={!enviando}
    />

    <Text
      style={{
        fontSize: 15,
        fontWeight: "600",
        color: colors.text,
      }}
    >
      Como você pode ajudar?
    </Text>

    {especialidadesVoluntario.map((especialidade) => {
      const selecionada =
        voluntariado.especialidade === especialidade;

      return (
        <Pressable
          key={especialidade}
          onPress={() =>
            alterarVoluntariado(
              "especialidade",
              especialidade,
            )
          }
          disabled={enviando}
          accessibilityRole="radio"
          accessibilityState={{
            checked: selecionada,
            disabled: enviando,
          }}
          style={({ pressed }) => ({
            minHeight: 48,
            padding: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: selecionada
              ? colors.primary
              : colors.border,
            backgroundColor: selecionada
              ? colors.primaryLight
              : colors.surface,
            opacity: pressed || enviando ? 0.6 : 1,
          })}
        >
          <Text style={{ color: colors.text }}>
            {selecionada ? "● " : "○ "}
            {especialidade}
          </Text>
        </Pressable>
      );
    })}

    {voluntariado.especialidade === "Outro" && (
      <CampoFormulario
        label="Descreva como pode ajudar"
        value={voluntariado.outraEspecialidade}
        onChangeText={(valor) =>
          alterarVoluntariado(
            "outraEspecialidade",
            valor,
          )
        }
        placeholder="Informe sua área de atuação"
        maxLength={200}
        multiline
        editable={!enviando}
      />
    )}

    <CampoFormulario
      label="Observações (opcional)"
      value={voluntariado.observacoes}
      onChangeText={(valor) =>
        alterarVoluntariado("observacoes", valor)
      }
      placeholder="Ex.: disponibilidade aos finais de semana"
      maxLength={1000}
      multiline
      editable={!enviando}
    />

    <Pressable
      onPress={() =>
        alterarVoluntariado(
          "disponivel",
          !voluntariado.disponivel,
        )
      }
      disabled={enviando}
      accessibilityRole="checkbox"
      accessibilityState={{
        checked: voluntariado.disponivel,
        disabled: enviando,
      }}
      style={({ pressed }) => ({
        minHeight: 48,
        padding: 14,
        borderRadius: 12,
        backgroundColor: colors.primaryLight,
        opacity: pressed || enviando ? 0.6 : 1,
      })}
    >
      <Text
        style={{
          color: colors.text,
          lineHeight: 22,
        }}
      >
        {voluntariado.disponivel ? "☑ " : "☐ "}
        Estou disponível para ajudar.
      </Text>
    </Pressable>
  </View>
)}
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