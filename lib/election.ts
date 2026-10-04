export type Candidate = { number: string; name: string; party: string; votes: number; percent: number; elected: boolean };
export type Result = { uf: string; generated: string; timestamp: number; counted: number; sections: number; totalSections: number; valid: number; blank: number; nullVotes: number; totalVotes: number; candidates: Candidate[]; source: string; stale: boolean };
export type Results = { regions: Record<string, Result>; checkedAt: string; unavailable: string[] };
type RawCandidate = { n: string; nmu: string; vap: string; pvap: string; pvapn?: string; e: string };
export type RawResult = { ele: string; cdabr: string; dg: string; hg: string; carg: { cd: string; agr: { par: { sg: string; cand: RawCandidate[] }[] }[] }[]; s: { pst: string; st: string; ts: string }; v: { vv: string; vb: string; tvn: string; tv: string } };
export const UF_NAMES: Record<string,string> = { AC:'Acre', AL:'Alagoas', AP:'Amapá', AM:'Amazonas', BA:'Bahia', CE:'Ceará', DF:'Distrito Federal', ES:'Espírito Santo', GO:'Goiás', MA:'Maranhão', MT:'Mato Grosso', MS:'Mato Grosso do Sul', MG:'Minas Gerais', PA:'Pará', PB:'Paraíba', PR:'Paraná', PE:'Pernambuco', PI:'Piauí', RJ:'Rio de Janeiro', RN:'Rio Grande do Norte', RS:'Rio Grande do Sul', RO:'Rondônia', RR:'Roraima', SC:'Santa Catarina', SP:'São Paulo', SE:'Sergipe', TO:'Tocantins' };
export const num = (v: unknown) => { const n=Number(String(v??'0').replace(',','.')); return Number.isFinite(n)?n:0; };
export const sourceUrl = (uf: string) => `https://resultados.tse.jus.br/oficial/ele2026/6257/dados/${uf.toLowerCase()}/${uf.toLowerCase()}-c0001-e006257-u.json`;
export function normalize(raw: RawResult, uf: string, stale=false): Result {
  if(raw.ele!=='6257'||raw.cdabr?.toUpperCase()!==uf||!raw.s||!raw.v) throw new Error('Resposta do TSE incompatível');
  const cargo=raw.carg?.find(c=>c.cd==='1'); if(!cargo)throw new Error('Cargo ausente');
  const candidates=cargo.agr.flatMap(a=>a.par.flatMap(p=>p.cand.map(c=>({number:c.n,name:c.nmu,party:p.sg,votes:num(c.vap),percent:num(c.pvapn??c.pvap),elected:c.e==='s'})))).sort((a,b)=>b.votes-a.votes||Number(a.number)-Number(b.number));
  const [d,m,y]=raw.dg.split('/');
  return {uf,generated:`${raw.dg} ${raw.hg}`,timestamp:Date.parse(`${y}-${m}-${d}T${raw.hg}-03:00`),counted:num(raw.s.pst),sections:num(raw.s.st),totalSections:num(raw.s.ts),valid:num(raw.v.vv),blank:num(raw.v.vb),nullVotes:num(raw.v.tvn),totalVotes:num(raw.v.tv),candidates,source:sourceUrl(uf),stale};
}
const colors: Record<string,string> = {'13':'#ee6172','22':'#579af5','55':'#b995f5','12':'#f7b75d','30':'#f19155','16':'#d6a850','44':'#72cdb2','80':'#da81d5','21':'#d97959','27':'#a6c668','29':'#dd93aa'};
export function color(number: string){return colors[number]??`hsl(${Number(number)*137.5%360} 65% 65%)`;}
export function leader(r?: Result){return r&&r.candidates[0]?.votes>0&&r.candidates[0].votes!==(r.candidates[1]?.votes??-1)?r.candidates[0]:null;}
export type LeadershipStatus = 'leading' | 'no-votes' | 'tied' | 'unavailable';
export function leadershipStatus(r?: Result): LeadershipStatus {
  if(!r)return 'unavailable';
  if(!r.candidates.some(c=>c.votes>0))return 'no-votes';
  return leader(r)?'leading':'tied';
}
export function leadershipLabel(r?: Result, loading=false): string {
  const status=leadershipStatus(r);
  if(status==='unavailable')return loading?'Carregando dados':'Dados indisponíveis';
  if(status==='no-votes')return 'Ainda sem votos contabilizados';
  if(status==='tied')return 'Empate na liderança';
  return `${displayName(leader(r)!.name)} na liderança`;
}
export function neutralLegend(regions: Record<string, Result>) {
  const counts={'no-votes':0,tied:0,unavailable:0};
  for(const uf of Object.keys(UF_NAMES)){const status=leadershipStatus(regions[uf]);if(status!=='leading')counts[status]++;}
  return counts;
}
export function margin(r?: Result){return r?Math.max(0,(r.candidates[0]?.percent??0)-(r.candidates[1]?.percent??0)):0;}
export const integer=(n:number)=>new Intl.NumberFormat('pt-BR').format(n);
export const percent=(n:number)=>n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
export const displayName=(name:string)=>name.toLocaleLowerCase('pt-BR').replace(/(^|\s)\S/g,c=>c.toLocaleUpperCase('pt-BR'));
