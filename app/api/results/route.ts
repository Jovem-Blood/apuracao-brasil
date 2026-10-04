import snapshot from '@/data/tse-snapshot.json';
import { normalize, sourceUrl, UF_NAMES, type RawResult, type Result, type Results } from '@/lib/election';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const prior: Record<string, Result> = {};
let cached: Results | undefined;
let cacheTime=0;
let pending: Promise<Results>|undefined;
const rawSnapshot=snapshot as unknown as Record<string,RawResult|null>;
async function collect(): Promise<Results> {
 const ufs=['BR',...Object.keys(UF_NAMES)];
 const regions: Record<string, Result>={};const unavailable:string[]=[];
 let cursor=0;
 await Promise.all(Array.from({length:6},async()=>{
  while(cursor<ufs.length){
   const uf=ufs[cursor++];
   try{
    const response=await fetch(sourceUrl(uf),{signal:AbortSignal.timeout(8000),headers:{Accept:'application/json'},cache:'no-store'} as RequestInit);
    if(!response.ok)throw new Error(`TSE ${response.status}`);
    const parsed=normalize(await response.json() as RawResult,uf);
    // Do not regress a region when a CDN edge returns an older version.
    regions[uf]=prior[uf]&&prior[uf].timestamp>parsed.timestamp?prior[uf]:parsed;
    prior[uf]=regions[uf];
   }catch{
    unavailable.push(uf);
    const fallback=prior[uf]??(rawSnapshot[uf]?normalize(rawSnapshot[uf]!,uf,true):undefined);
    if(fallback)regions[uf]={...fallback,stale:true};
   }
  }
 }));
 return {regions,unavailable,checkedAt:new Date().toISOString()};
}
export async function GET(){
 if(!cached||Date.now()-cacheTime>25000){
  pending??=collect();
  try{cached=await pending;cacheTime=Date.now();}finally{pending=undefined;}
 }
 return Response.json(cached,{headers:{'Cache-Control':'public, max-age=0, s-maxage=25, stale-while-revalidate=30'}});
}
