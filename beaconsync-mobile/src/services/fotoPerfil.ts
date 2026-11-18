import {
  ImageManipulator,
  SaveFormat,
} from "expo-image-manipulator";

import { Platform } from "react-native";

import { api } from "./api";
import { ErroApi } from "./http";

const CAMINHO = "/api/v1/usuarios/me/foto";
const LIMITE_BYTES = 2 * 1024 * 1024;

export async function prepararFotoPerfil(
  uri: string
): Promise<() => FormData> {
  const contexto = ImageManipulator.manipulate(uri);
  const original = await contexto.renderAsync();

  const maior = Math.max(
    original.width,
    original.height
  );

  const imagem =
    maior > 768
      ? await ImageManipulator.manipulate(original)
          .resize(
            original.width >= original.height
              ? { width: 768 }
              : { height: 768 }
          )
          .renderAsync()
      : original;

  const resultado = await imagem.saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.75,
    base64: Platform.OS === "web",
  });

  if (Platform.OS === "web") {
    if (!resultado.base64) {
      throw new Error(
        "Não foi possível preparar a foto. Escolha outra imagem."
      );
    }

    const resposta = await fetch(
      `data:image/jpeg;base64,${resultado.base64}`
    );

    const arquivo = await resposta.blob();

    validarTamanho(arquivo.size);

    return () => {
      const formulario = new FormData();

      formulario.append(
        "arquivo",
        arquivo,
        "perfil.jpg"
      );

      return formulario;
    };
  }

  // No celular, usamos um arquivo que o Expo consegue
  // ler e enviar como parte do formulário.
  const { File } = await import("expo-file-system");

  const arquivo = new File(resultado.uri);

  if (!arquivo.exists) {
    throw new Error(
      "A foto preparada não foi encontrada. Selecione a imagem novamente."
    );
  }

  validarTamanho(arquivo.size);

  return () => {
    const formulario = new FormData();

    formulario.append("arquivo", arquivo);

    return formulario;
  };
}

function validarTamanho(bytes: number) {
  if (
    !Number.isFinite(bytes) ||
    bytes <= 0 ||
    bytes > LIMITE_BYTES
  ) {
    throw new Error(
      "A foto precisa ter até 2 MB após a conversão. Escolha outra imagem."
    );
  }
}

export async function consultarFotoPerfil():
  Promise<string | null> {
  try {
    return await api<string>(
      "java",
      CAMINHO,
      {
        retorno: "imagem",
      }
    );
  } catch (erro) {
    if (
      erro instanceof ErroApi &&
      erro.status === 404
    ) {
      return null;
    }

    throw erro;
  }
}

export function enviarFotoPerfil(
  formulario: () => FormData
) {
  return api<unknown>(
    "java",
    CAMINHO,
    {
      metodo: "PUT",
      formulario,
    }
  );
}

export function removerFotoPerfil() {
  return api<void>(
    "java",
    CAMINHO,
    {
      metodo: "DELETE",
    }
  );
}