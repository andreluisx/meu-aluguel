export const TIPOS = ["Casa", "Apartamento", "Sala comercial", "Terreno", "Outro"] as const;
export const UFS = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");
export const FORMAS = [["pix", "Pix"], ["dinheiro", "Dinheiro"], ["transferencia", "Transferência"], ["boleto", "Boleto"], ["outro", "Outro"]] as const;
export const CATEGORIAS = [["manutencao", "Manutenção"], ["reforma", "Reforma"], ["impostos", "Impostos"], ["agua", "Água"], ["energia", "Energia"], ["condominio", "Condomínio"], ["seguro", "Seguro"], ["outros", "Outros"]] as const;
export const nomeCategoria = (c: string) => CATEGORIAS.find((x) => x[0] === c)?.[1] ?? c;
export const DOC_TIPOS = [["escritura", "Escritura ou matrícula"], ["iptu", "IPTU"], ["seguro", "Seguro"], ["vistoria", "Vistoria ou laudo"], ["conta", "Conta de água, luz ou condomínio"], ["planta", "Planta"], ["outro", "Outro documento"]] as const;
export const nomeDoc = (t: string) => (t === "contrato" ? "Contrato" : t === "comprovante" ? "Comprovante" : t === "foto" ? "Foto" : DOC_TIPOS.find((x) => x[0] === t)?.[1] ?? "Documento");
