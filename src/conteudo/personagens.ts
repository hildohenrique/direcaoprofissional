import type { IdPersonagem } from '@/nucleo/tipos';

/* O elenco fixo das histórias. As mesmas pessoas voltam ao longo da rota:
   quem aprende acompanha a evolução delas junto com a própria. */
export interface Personagem {
  id: IdPersonagem;
  nome: string;
  idade: number;
  cidade: string;
  faz: string;
  /** traços do boneco */
  pele: string;
  cabelo: string;
  penteado: 'coque' | 'curto' | 'cacheado' | 'longo' | 'careca' | 'rabo' | 'grisalho';
  roupa: string;
}

export const PERSONAGENS: Record<IdPersonagem, Personagem> = {
  cida: { id: 'cida', nome: 'Dona Cida', idade: 58, cidade: 'Feira de Santana (BA)', faz: 'vende marmitas', pele: '#8d5a3b', cabelo: '#d9d4cc', penteado: 'coque', roupa: '#c2553b' },
  rafa: { id: 'rafa', nome: 'Rafa', idade: 19, cidade: 'Campina Grande (PB)', faz: 'edita vídeos para lojas', pele: '#b9794f', cabelo: '#1f1612', penteado: 'curto', roupa: '#2e6f8e' },
  jessica: { id: 'jessica', nome: 'Jéssica', idade: 27, cidade: 'Frutal (MG)', faz: 'é manicure', pele: '#e0a988', cabelo: '#3b2417', penteado: 'rabo', roupa: '#b84a78' },
  antonio: { id: 'antonio', nome: 'Seu Antônio', idade: 46, cidade: 'Londrina (PR)', faz: 'faz pequenos reparos', pele: '#c98e63', cabelo: '#4a4038', penteado: 'careca', roupa: '#3d6b4f' },
  bia: { id: 'bia', nome: 'Bia', idade: 16, cidade: 'Belém (PA)', faz: 'estuda e quer o primeiro trabalho', pele: '#a86b45', cabelo: '#17110d', penteado: 'cacheado', roupa: '#e0a12e' },
  marcos: { id: 'marcos', nome: 'Marcos', idade: 34, cidade: 'Guarulhos (SP)', faz: 'trabalha de carteira assinada em um depósito', pele: '#6f4429', cabelo: '#15100c', penteado: 'curto', roupa: '#4b5d8c' },
  lu: { id: 'lu', nome: 'Luciana', idade: 41, cidade: 'Goiânia (GO)', faz: 'vende roupas pela internet', pele: '#d59a74', cabelo: '#6b3a1e', penteado: 'longo', roupa: '#7a4c9a' },
  neuza: { id: 'neuza', nome: 'Dona Neuza', idade: 63, cidade: 'Pelotas (RS)', faz: 'dá aulas de costura', pele: '#eec3a5', cabelo: '#c9c3ba', penteado: 'grisalho', roupa: '#2f7f7a' },
  davi: { id: 'davi', nome: 'Davi', idade: 23, cidade: 'Fortaleza (CE)', faz: 'estuda programação', pele: '#9a6240', cabelo: '#241812', penteado: 'cacheado', roupa: '#4a4a52' },
};
