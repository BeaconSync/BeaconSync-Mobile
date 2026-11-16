import { Redirect } from "expo-router";

import { useSessao } from "../hooks/useSessao";

export default function Index() {
  const {
    autenticado,
    demonstracao,
  } = useSessao();

  const podeEntrar =
    autenticado ||
    (__DEV__ && demonstracao);

  return (
    <Redirect
      href={podeEntrar ? "/inicio" : "/login"}
    />
  );
}