import { useRef, useState } from "react";

import type {
  AtualizarDisponibilidadeVoluntario,
  Voluntario,
} from "../types/voluntario";

export function useDisponibilidadeVoluntario(
  onAtualizar?: AtualizarDisponibilidadeVoluntario
) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const envioEmAndamento = useRef(false);

  async function atualizar(
    voluntario: Voluntario,
    disponivel: boolean
  ): Promise<Voluntario | null> {
    if (envioEmAndamento.current) return null;
    if (disponivel === voluntario.disponivel) return null;

    setErro(null);

    if (!onAtualizar) {
      setErro(
        "A atualização está indisponível no momento. Sua disponibilidade não foi alterada."
      );
      return null;
    }

    envioEmAndamento.current = true;
    setEnviando(true);

    try {
      const atualizado = await onAtualizar(
        voluntario.id,
        disponivel
      );

      if (
        atualizado?.id !== voluntario.id ||
        atualizado.disponivel !== disponivel
      ) {
        throw new Error("Resposta de atualização inválida.");
      }

      return atualizado;
    } catch (erro) {
  setErro(
    erro instanceof Error
      ? erro.message
      : "Não foi possível confirmar a atualização. Consulte novamente seu cadastro antes de tentar outra vez.",
  );

  return null;
} finally {
      envioEmAndamento.current = false;
      setEnviando(false);
    }
  }

  return {
    enviando,
    erro,
    atualizar,
  };
}