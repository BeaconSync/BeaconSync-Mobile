export type DadosCadastroPessoa = {
  nome: string;
  dataNascimento: string;
  vinculo: string;
  fotoUri?: string | null;

  necessidades: string[];
  outraNecessidade: string;
  recursos: string[];
  observacoes: string;

  nomeLocal: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  pontoReferencia: string;

  localizacaoConfirmada: boolean | null;
  autorizado: boolean;
};

export type ErrosCadastroPessoa = Partial<
  Record<keyof DadosCadastroPessoa, string>
>;

export type EtapaCadastro = 1 | 2 | 3;

export type EnviarCadastroPessoa = (
  dados: DadosCadastroPessoa
) => Promise<void>;