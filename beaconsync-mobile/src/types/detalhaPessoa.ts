export type SituacaoPessoa = {
  status: "Seguro" | "Precisa de Ajuda" | "Sem Contato";
  dataResposta: string | null;
  observacao: string | null;
};

export type EnderecoDetalhesPessoa = {
  id: string;
  nomeLocal?: string | null;

  logradouro: string;
  numero: string;
  bairro: string;
  distrito?: string | null;

  cidade?: string | null;
  uf?: string | null;
  cep?: string | null;
  complemento?: string | null;
  pontoReferencia?: string | null;

  tipoImovel?: string | null;
  andar?: number | null;

  indicadoComoAtual: boolean;
  presencaInformada?: boolean | null;
  presencaInformadaEm?: string | null;
};

export type PessoaDetalhes = {
  id: string;
  nome: string;

  dataNascimento: string | null;

  tipoVulnerabilidade?: string | null;
  necessidadesRemocao?: string | null;

  fotoUrl: string | null;
  vinculo: string | null;

  necessidades: string[];
  recursos: string[];
  observacoes: string | null;

  enderecos: EnderecoDetalhesPessoa[];
  situacao: SituacaoPessoa | null;
};

export type EstadoDetalhesPessoa =
  | { status: "indisponivel" }
  | { status: "carregando" }
  | { status: "nao_encontrada" }
  | { status: "erro"; mensagem: string }
  | { status: "sucesso"; pessoa: PessoaDetalhes };