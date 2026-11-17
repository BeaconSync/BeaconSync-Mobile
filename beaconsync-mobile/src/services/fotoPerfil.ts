import {
  ImageManipulator,
  SaveFormat,
} from "expo-image-manipulator";

import { Platform } from "react-native";

import { api } from "./api";
import { ErroApi } from "./http";

const CAMINHO = "/api/v1/usuarios/me/foto";

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
    base64: true,
  });

  if (!resultado.base64) {
    throw new Error(
      "Não foi possível preparar a foto. Escolha outra imagem."
    );
  }

  const base64 = resultado.base64;

  const padding = base64.endsWith("==")
    ? 2
    : base64.endsWith("=")
      ? 1
      : 0;

  const bytes =
    Math.floor((base64.length * 3) / 4) - padding;

  if (bytes <= 0 || bytes > 2 * 1024 * 1024) {
    throw new Error(
      "A foto precisa ter até 2 MB após a conversão. Escolha outra imagem."
    );
  }

  const arquivoWeb =
    Platform.OS === "web"
      ? await (
          await fetch(
            `data:image/jpeg;base64,${base64}`
          )
        ).blob()
      : null;

  // Cria outro formulário se a chamada precisar
  // ser repetida após a renovação do token.
  return () => {
    const formulario = new FormData();

    if (arquivoWeb) {
      formulario.append(
        "arquivo",
        arquivoWeb,
        "perfil.jpg"
      );
    } else {
      // Arquivo local no formato esperado pelo React Native.
      formulario.append(
        "arquivo",
        {
          uri: resultado.uri,
          name: "perfil.jpg",
          type: "image/jpeg",
        } as unknown as Blob
      );
    }

    return formulario;
  };
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