import TelaAcesso from "../components/TelaAcesso";
import type { AcoesAcesso } from "../hooks/useAcessoForm";

export default function CadastroUsuarioScreen({
  onCadastro,
}: Pick<AcoesAcesso, "onCadastro">) {
  return <TelaAcesso modo="cadastro" onCadastro={onCadastro} />;
}