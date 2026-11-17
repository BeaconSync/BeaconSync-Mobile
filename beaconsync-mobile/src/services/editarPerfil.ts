import { api } from "./api";
import { versaoSessao } from "./sessao";

import {
  consultarMeuPerfil,
  converterUsuarioApi,
} from "./perfil";

import {
  enviarFotoPerfil,
  prepararFotoPerfil,
  removerFotoPerfil,
} from "./fotoPerfil";

import type {
  DadosPerfil,
  SalvarPerfil,
} from "../types/perfil";

export function criarSalvamentoDadosPerfil(
  perfilAtual: DadosPerfil
): SalvarPerfil {
  return async (dados) => {
    const versao = versaoSessao();

    const conferirSessao = () => {
      if (versaoSessao() !== versao) {
        throw new Error(
          "A sessão mudou. Consulte novamente seu perfil."
        );
      }
    };

    const nome = dados.nome.trim();
    const telefone = (dados.telefone ?? "").trim();

    if (nome.length < 2 || nome.length > 120) {
      throw new Error(
        "Informe seu nome com 2 a 120 caracteres."
      );
    }

    if (!/^\d{10,11}$/.test(telefone)) {
      throw new Error(
        "Informe um telefone com DDD e 10 ou 11 números."
      );
    }

    // Prepara a imagem antes de enviar qualquer alteração.
    let formulario: (() => FormData) | undefined;

    if (dados.foto.acao === "substituir") {
      try {
        formulario = await prepararFotoPerfil(
          dados.foto.uri
        );
      } catch {
        throw new Error(
          "Não foi possível preparar a foto. Escolha outra imagem. Nenhuma alteração foi enviada."
        );
      }
    }

    conferirSessao();

    const resposta = await api<unknown>(
      "java",
      "/api/v1/usuarios/me",
      {
        metodo: "PUT",
        dados: {
          nome,
          telefone,
        },
      }
    );

    conferirSessao();

    const { perfil: salvo } =
      converterUsuarioApi(resposta);

    if (salvo.id !== perfilAtual.id) {
      throw new Error(
        "Não foi possível confirmar a conta atualizada. Consulte novamente seu perfil."
      );
    }

    try {
      if (formulario) {
        conferirSessao();

        const resultado =
          await enviarFotoPerfil(formulario);

        conferirSessao();

        const enviado =
          converterUsuarioApi(resultado);

        if (
          enviado.perfil.id !== perfilAtual.id ||
          !enviado.temFoto
        ) {
          throw new Error(
            "A API não confirmou a foto enviada."
          );
        }
      } else if (dados.foto.acao === "remover") {
        conferirSessao();

        await removerFotoPerfil();

        conferirSessao();
      }
    } catch (erro) {
      conferirSessao();

      const detalhe =
        erro instanceof Error
          ? ` ${erro.message}`
          : "";

      throw new Error(
        "Nome e telefone foram salvos, mas não foi possível confirmar a alteração da foto." +
          detalhe +
          " Feche e reabra a tela Perfil para conferir antes de tentar novamente."
      );
    }

    try {
      conferirSessao();

      const atualizado =
        await consultarMeuPerfil();

      conferirSessao();

      if (atualizado.id !== perfilAtual.id) {
        throw new Error(
          "A conta consultada mudou."
        );
      }

      return atualizado;
    } catch {
      conferirSessao();

      throw new Error(
        "A API confirmou o salvamento, mas não foi possível recarregar o perfil. Feche e reabra a tela Perfil para consultar os dados salvos."
      );
    }
  };
}