import TelaAcesso from "../components/TelaAcesso";
import type { AcoesAcesso } from "../hooks/useAcessoForm";

export default function LoginScreen({
  onLogin,
}: Pick<AcoesAcesso, "onLogin">) {
  return <TelaAcesso modo="login" onLogin={onLogin} />;
}