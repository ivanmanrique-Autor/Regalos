/** Apps Script API for the Regalos familiares spreadsheet.
 * Bind this script from Extensions > Apps Script while the spreadsheet is open.
 * Sheet columns expected: Regalos A:J, Personas A:B, Celebraciones A:B.
 */
const SHEET_ID = '120XsAhnaWCw7sX1Ib90rVSCis8i7bAvHocKm3YOJtVk';
const HEADERS = { Regalos: ['ID','Descripción','Destinatario','Comprador','Celebración','Importe previsto','Importe real','Estado','Notas','Enlace'], Personas:['Nombre','Notas'], Celebraciones:['Celebración','Notas'] };
function doGet() {
  const ss=SpreadsheetApp.openById(SHEET_ID);
  const read=(name)=>{const sh=ss.getSheetByName(name);if(!sh)throw new Error('Falta la hoja '+name);const values=sh.getDataRange().getValues();return values.slice(1).filter(r=>r.some(v=>v!==''&&v!==null));};
  const regalos=read('Regalos').map(r=>({id:String(r[0]||''),descripcion:String(r[1]||''),destinatario:String(r[2]||''),comprador:String(r[3]||''),celebracion:String(r[4]||''),previsto:num(r[5]),real:num(r[6]),estado:String(r[7]||'Deseo sin asignar'),notas:String(r[8]||''),enlace:String(r[9]||'')}));
  const personas=read('Personas').map(r=>({nombre:String(r[0]||''),notas:String(r[1]||'')})).filter(p=>p.nombre);
  const celebraciones=read('Celebraciones').map(r=>({celebracion:String(r[0]||''),notas:String(r[1]||'')})).filter(c=>c.celebracion);
  return json({regalos,personas,celebraciones});
}
function doPost(e) {
  try { const body=JSON.parse(e.postData.contents||'{}'); if(body.action!=='saveGift')throw new Error('Acción desconocida'); const g=body.gift||{}; if(!g.descripcion)throw new Error('La descripción es obligatoria'); if(!['Deseo sin asignar','Asignado','Comprado'].includes(g.estado))throw new Error('Estado no válido');
    const ss=SpreadsheetApp.openById(SHEET_ID), sh=ss.getSheetByName('Regalos'); if(!sh)throw new Error('Falta la hoja Regalos'); const last=Math.max(sh.getLastRow(),1), ids=last>1?sh.getRange(2,1,last-1,1).getDisplayValues().flat():[]; let row=-1;
    if(g.id){const found=ids.indexOf(String(g.id));if(found>=0)row=found+2;} if(row<0)row=Math.max(2,last+1);
    sh.getRange(row,1,1,10).setValues([[String(g.id||Utilities.getUuid()),String(g.descripcion),String(g.destinatario||''),String(g.comprador||''),String(g.celebracion||''),num(g.previsto),num(g.real),String(g.estado||'Deseo sin asignar'),String(g.notas||''),String(g.enlace||'')]]);
    return json({ok:true});
  } catch(err) {return json({ok:false,error:String(err.message||err)});}
}
function num(v){if(v===''||v===null||v===undefined)return null;const n=Number(v);return Number.isFinite(n)?n:null;}
function json(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
