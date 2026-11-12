import type { EnderecoDetalhesPessoa } from "./detalhaPessoa";

export type FormularioEnderecoPessoa = {
  nomeLocal: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  distrito: string;
  cidade: string;
  uf: string;
  pontoReferencia: string;
  tipoImovel: string;
  andar: string;
  indicadoComoAtual: boolean;
};

export type ErrosEnderecoPessoa = Partial<
  Record<keyof FormularioEnderecoPessoa, string>
>;

export type DadosSalvarEnderecoPessoa = Omit<
  FormularioEnderecoPessoa,
  "andar"
> & { andar: number | null };

export type SalvarEnderecoPessoa = (
  pessoaId: string,
  enderecoId: string | null,
  dados: DadosSalvarEnderecoPessoa,
) => Promise<EnderecoDetalhesPessoa[]>;
