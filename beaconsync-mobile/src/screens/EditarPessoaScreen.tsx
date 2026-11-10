import CadastroPessoaScreen from "./CadastroPessoaScreen";
import { necessidades } from "../hooks/usePessoaForm";

import type { DadosCadastroPessoa } from "../types/cadastroPessoa";
import type { PessoaDetalhes } from "../types/detalhaPessoa";

type Props = {
  pessoa: PessoaDetalhes;
  demonstracao?: boolean;
  onCancelar: () => void;

  onSalvar?: (
    pessoaId: string,
    enderecoId: string | null,
    dados: DadosCadastroPessoa
  ) => Promise<void>;
};

function formatarNascimento(valor: string | null) {
  if (!valor) return "";

  const resultado = /^(\d{4})-(\d{2})-(\d{2})(?:T|$)/.exec(valor);

  if (!resultado) return "";

  return `${resultado[3]}/${resultado[2]}/${resultado[1]}`;
}

export default function EditarPessoaScreen({
  pessoa,
  demonstracao = false,
  onCancelar,
  onSalvar,
}: Props) {
  const endereco =
    pessoa.enderecos.find((item) => item.indicadoComoAtual) ??
    pessoa.enderecos[0];

  const necessidadesConhecidas = pessoa.necessidades.filter(
    (item) => necessidades.includes(item)
  );

  const outrasNecessidades = pessoa.necessidades.filter(
    (item) => !necessidades.includes(item)
  );

  const necessidadesSelecionadas = [
    ...new Set([
      ...necessidadesConhecidas,
      ...(outrasNecessidades.length > 0 ? ["Outra"] : []),
    ]),
  ];

  const dados: DadosCadastroPessoa = {
    nome: pessoa.nome,
    dataNascimento: formatarNascimento(pessoa.dataNascimento),
    vinculo: pessoa.vinculo ?? "",
    fotoUri: pessoa.fotoUrl,

    necessidades: necessidadesSelecionadas,
    outraNecessidade: outrasNecessidades.join("; "),
    recursos: [...pessoa.recursos],
    observacoes: pessoa.observacoes ?? "",

    nomeLocal: endereco?.nomeLocal ?? "",
    cep: endereco?.cep ?? "",
    rua: endereco?.logradouro ?? "",
    numero: endereco?.numero ?? "",
    complemento: endereco?.complemento ?? "",
    bairro: endereco?.bairro ?? "",
    cidade: endereco?.cidade ?? "",
    uf: endereco?.uf ?? "",
    pontoReferencia: endereco?.pontoReferencia ?? "",

    localizacaoConfirmada: null,

    autorizado: false,
  };

  return (
    <CadastroPessoaScreen
      key={pessoa.id}
      edicao={{
        dados,
        demonstracao,
        onCancelar,
        onSalvar: onSalvar
          ? (valores) =>
              onSalvar(
                pessoa.id,
                endereco?.id ?? null,
                valores
              )
          : undefined,
      }}
    />
  );
}