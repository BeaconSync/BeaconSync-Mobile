export type StatusInformado =
  | "Seguro"
  | "Precisa de Ajuda"
  | "Sem Contato";

export type DadosInformarSituacao = {
  alertaId: string | null;
  status: StatusInformado;
  enderecoOndeEstaId: string | null;
  observacao: string;
};

export type EnviarSituacao = (
  dados: DadosInformarSituacao
) => Promise<void>;

