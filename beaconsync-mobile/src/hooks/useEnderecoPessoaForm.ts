import { useRef, useState } from "react";
import type { EnderecoDetalhesPessoa } from "../types/detalhaPessoa";
import type {
  ErrosEnderecoPessoa,
  FormularioEnderecoPessoa,
  SalvarEnderecoPessoa,
} from "../types/enderecoPessoa";
import {
  criarFormularioEndereco,
  prepararEnderecoPessoa,
  validarEnderecoPessoa,
} from "../utils/enderecoPessoa";

export function useEnderecoPessoaForm(
  pessoaId: string,
  onSalvar?: SalvarEnderecoPessoa,
) {
  const [dados, setDados] = useState(criarFormularioEndereco);
  const [enderecoId, setEnderecoId] = useState<string | null>(null);
  const [aberto, setAberto] = useState(false);
  const [erros, setErros] = useState<ErrosEnderecoPessoa>({});
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const bloqueado = useRef(false);
  const dadosOriginais = useRef(JSON.stringify(dados));

  function abrir(endereco?: EnderecoDetalhesPessoa) {
    if (bloqueado.current) return;
    const valores = criarFormularioEndereco(endereco);
    dadosOriginais.current = JSON.stringify(valores);
    setDados(valores);
    setEnderecoId(endereco?.id ?? null);
    setErros({});
    setErroEnvio(null);
    setAberto(true);
  }

  function fechar() {
    if (bloqueado.current) return;
    setAberto(false);
    setErros({});
    setErroEnvio(null);
  }

  function alterarCampo<K extends keyof FormularioEnderecoPessoa>(
    campo: K,
    valor: FormularioEnderecoPessoa[K],
  ) {
    if (bloqueado.current) return;
    setDados((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
    setErroEnvio(null);
  }

  async function salvar(): Promise<EnderecoDetalhesPessoa[] | null> {
    if (bloqueado.current) return null;
    setErroEnvio(null);
    const novosErros = validarEnderecoPessoa(dados);
    setErros(novosErros);
    if (Object.keys(novosErros).length) return null;

    if (!onSalvar) {
      setErroEnvio(
        "A gravação está indisponível no momento. Nenhum endereço foi salvo ou alterado. Seus campos continuam preenchidos.",
      );
      return null;
    }

    bloqueado.current = true;
    setEnviando(true);
    try {
      const lista = await onSalvar(
        pessoaId,
        enderecoId,
        prepararEnderecoPessoa(dados),
      );

      if (
        !Array.isArray(lista) ||
        lista.length === 0 ||
        lista.some(
          (item) => !item || typeof item.id !== "string" || !item.id.trim(),
        ) ||
        new Set(lista.map((item) => item.id)).size !== lista.length ||
        lista.filter((item) => item.indicadoComoAtual).length > 1 ||
        (enderecoId !== null && !lista.some((item) => item.id === enderecoId))
      ) {
        throw new Error("Resposta de endereços inválida.");
      }

      return lista;
    } catch {
      setErroEnvio(
        "Não foi possível confirmar a gravação. Os campos foram mantidos. Consulte os endereços antes de tentar enviar novamente.",
      );
      return null;
    } finally {
      bloqueado.current = false;
      setEnviando(false);
    }
  }

  return {
    dados,
    enderecoId,
    aberto,
    erros,
    erroEnvio,
    enviando,
    temAlteracoes: JSON.stringify(dados) !== dadosOriginais.current,
    estaEnviando: () => bloqueado.current,
    abrir,
    fechar,
    alterarCampo,
    salvar,
  };
}
