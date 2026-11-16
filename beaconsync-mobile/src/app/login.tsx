import LoginScreen from "../screens/LoginScreen";

import { entrar } from "../services/sessao";

export default function LoginRoute() {
  return <LoginScreen onLogin={entrar} />;
}