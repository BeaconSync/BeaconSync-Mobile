export type EnderecoApi = {
  id: number;
  apelido: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  cep: string;
  distritoId: number;
  distritoNome: string;
  atual: boolean;
};

export type NovoEndereco = {
  nomeLocal: string;
  rua: string;
  numero: string;
  complemento: string;
  cep: string;
  distritoId: number | null;
};

export type ErrosNovoEndereco = Partial<
  Record<keyof NovoEndereco, string>
>;