
import { useContext } from "react";
import { AutenticacaoContext } from "./AutenticacaoContext";

export function useAutenticacao() {
  return useContext(AutenticacaoContext);
}
