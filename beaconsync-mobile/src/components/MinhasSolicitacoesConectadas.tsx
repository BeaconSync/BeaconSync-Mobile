import {
  useMinhasSolicitacoes,
} from "../hooks/useMinhasSolicitacoes";

import MinhasSolicitacoesScreen
  from "../screens/MinhasSolicitacoesScreen";

type Props = {
  onFechar: () => void;
};

export default function MinhasSolicitacoesConectadas({
  onFechar,
}: Props) {
  const { estado, recarregar } = useMinhasSolicitacoes();

  return (
    <MinhasSolicitacoesScreen
      estado={estado}
      onFechar={onFechar}
      onTentarNovamente={() => {
        void recarregar();
      }}
    />
  );
}