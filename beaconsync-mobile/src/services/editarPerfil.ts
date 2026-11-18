import { api } from "./api";

import {
  renovarTokenAposTrocaPerfil,
  versaoSessao,
} from "./sessao";

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
  perfilAtual: DadosPerfil,
): SalvarPerfil {
  return async (dados) => {
    const versao = versaoSessao();

    function conferirSessao() {
      if (versaoSessao() !== versao) {
        throw new Error(
          "A sessão mudou. Consulte novamente seu perfil.",
        );
      }
    }

    const nome = dados.nome.trim();
    const telefone = (dados.telefone ?? "").trim();

    const email = (dados.email ?? perfilAtual.email)
      .trim()
      .toLowerCase();

    if (nome.length < 2 || nome.length > 120) {
      throw new Error(
        "Informe seu nome com 2 a 120 caracteres.",
      );
    }

    if (
      email.length > 160 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      throw new Error(
        "Informe um e-mail válido com até 160 caracteres.",
      );
    }

    if (!/^\d{10,11}$/.test(telefone)) {
      throw new Error(
        "Informe um telefone com DDD e 10 ou 11 números.",
      );
    }

    const alterandoEmail =
      email !== perfilAtual.email.trim().toLowerCase();

    const alterandoPapel =
      dados.papel !== undefined &&
      dados.papel !== perfilAtual.papel;

    if (
      dados.papel !== undefined &&
      (
        (
          dados.papel !== "RESPONSAVEL" &&
          dados.papel !== "VOLUNTARIO"
        ) ||
        (
          perfilAtual.papel !== "RESPONSAVEL" &&
          perfilAtual.papel !== "VOLUNTARIO"
        )
      )
    ) {
      throw new Error(
        "Esta conta não permite trocar o tipo de perfil por esta opção.",
      );
    }

    // Prepara a imagem antes de enviar alterações à API.
    let formulario: (() => FormData) | undefined;

    if (dados.foto.acao === "substituir") {
      try {
        formulario = await prepararFotoPerfil(
          dados.foto.uri,
        );
      } catch {
        throw new Error(
          "Não foi possível preparar a foto. Escolha outra imagem. Nenhuma alteração foi enviada.",
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

          ...(alterandoEmail ? { email } : {}),

          ...(alterandoPapel
            ? { papel: dados.papel }
            : {}),
        },
      },
    );

    conferirSessao();

    const { perfil: salvo } =
      converterUsuarioApi(resposta);

    if (salvo.id !== perfilAtual.id) {
      throw new Error(
        "Não foi possível confirmar a conta atualizada. Consulte novamente seu perfil.",
      );
    }

    if (
      alterandoPapel &&
      salvo.papel !== dados.papel
    ) {
      throw new Error(
        "A API não confirmou a troca de perfil. Outros dados podem ter sido salvos. Feche e reabra o perfil para conferir.",
      );
    }

    if (
      alterandoEmail &&
      salvo.email.trim().toLowerCase() !== email
    ) {
      throw new Error(
        "A API não confirmou a alteração do e-mail. Outros dados podem ter sido salvos. Feche e reabra o perfil para conferir.",
      );
    }

    if (
      alterandoPapel ||
      alterandoEmail ||
      salvo.papel !== perfilAtual.papel
    ) {
      try {
        await renovarTokenAposTrocaPerfil();
        conferirSessao();
      } catch {
        throw new Error(
          "O perfil foi salvo, mas não foi possível atualizar a sessão. Saia da conta e entre novamente.",
        );
      }
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
            "A API não confirmou a foto enviada.",
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
        "Os dados do perfil foram salvos, mas não foi possível confirmar a alteração da foto." +
          detalhe +
          " Feche e reabra a tela Perfil para conferir antes de tentar novamente.",
      );
    }

    try {
      conferirSessao();

      const atualizado =
        await consultarMeuPerfil();

      conferirSessao();

      if (atualizado.id !== perfilAtual.id) {
        throw new Error(
          "A conta consultada mudou.",
        );
      }

      if (
        alterandoPapel &&
        atualizado.papel !== dados.papel
      ) {
        throw new Error(
          "O perfil consultado não corresponde ao tipo solicitado.",
        );
      }

      if (
        alterandoEmail &&
        atualizado.email.trim().toLowerCase() !== email
      ) {
        throw new Error(
          "O e-mail consultado não corresponde ao solicitado.",
        );
      }

      return atualizado;
    } catch {
      conferirSessao();

      throw new Error(
        "A API confirmou o salvamento, mas não foi possível recarregar o perfil. Feche e reabra a tela Perfil para consultar os dados salvos.",
      );
    }
  };
}