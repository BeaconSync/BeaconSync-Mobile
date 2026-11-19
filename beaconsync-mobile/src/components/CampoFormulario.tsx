import { useState } from "react";
import { Eye, EyeOff } from "lucide-react-native";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { useTema, usarEstilosTema, type Cores } from "../theme/tema";

type CampoFormularioProps = TextInputProps & {
  label: string;
  erro?: string;
};

export default function CampoFormulario({
  label,
  erro,
  style,
  secureTextEntry,
  ...props
}: CampoFormularioProps) {
  const { colors } = useTema();
  const styles = usarEstilosTema(criarStyles, colors);

  const [senhaVisivel, setSenhaVisivel] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.inputContainer,
          erro ? styles.inputError : undefined,
        ]}
      >
        <TextInput
          {...props}
          accessibilityLabel={label}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={Boolean(secureTextEntry) && !senhaVisivel}
          style={[
            styles.input,
            props.multiline && styles.multiline,
            style,
          ]}
        />

        {secureTextEntry ? (
          <Pressable
            onPress={() => setSenhaVisivel((atual) => !atual)}
            disabled={props.editable === false}
            accessibilityRole="button"
            accessibilityLabel={
              senhaVisivel
                ? `Ocultar ${label.toLowerCase()}`
                : `Mostrar ${label.toLowerCase()}`
            }
            style={styles.eyeButton}
          >
            {senhaVisivel ? (
              <EyeOff size={21} color={colors.textSecondary} />
            ) : (
              <Eye size={21} color={colors.textSecondary} />
            )}
          </Pressable>
        ) : null}
      </View>

      {erro ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {erro}
        </Text>
      ) : null}
    </View>
  );
}

const criarStyles = (colors: Cores) => (StyleSheet.create({
  container: {
    gap: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: colors.warningText,
  },
  eyeButton: {
    width: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  error: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.warningText,
  },
}));