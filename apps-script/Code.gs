// Vincula este script a la hoja de cálculo de la familia.
const SHEET_NAME = 'RegalosApp';
const OLD_HEADERS = ['id','persona','regalo','enlace','precio','ocasion','estado','notas','actualizado'];
const HEADERS = [...OLD_HEADERS, 'comprador'];
const TABS = ['Añadir deseo','Ver regalos','Por persona','Gastos'];
function sheet_() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) { sheet = book.insertSheet(SHEET_NAME); sheet.appendRow(HEADERS); sheet.setFrozenRows(1); }
  const actual = sheet.getRange(1,1,1,HEADERS.length).getValues()[0];
  if (actual.slice(0,OLD_HEADERS.length).join('|') !== OLD_HEADERS.join('|') || (actual[9] && actual[9] !== 'comprador')) throw new Error('La pestaña RegalosApp existe pero sus cabeceras no son las esperadas.');
  if (!actual[9]) sheet.getRange(1,10).setValue('comprador');
  return sheet;
}
function config_() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName('RegalosConfig');
  if (!sheet) { sheet = book.insertSheet('RegalosConfig'); sheet.appendRow(['inicio','Añadir deseo']); }
  const value = sheet.getRange(1,2).getValue();
  return {sheet, inicio:TABS.includes(value)?value:'Añadir deseo'};
}
function output_(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
function doGet() {
  try {
    const sheet = sheet_();
    const rows = sheet.getLastRow()>1 ? sheet.getRange(2,1,sheet.getLastRow()-1,HEADERS.length).getValues() : [];
    return output_({items:rows.filter(r=>r[0]).map(r=>Object.fromEntries(HEADERS.map((h,i)=>[h,r[i]]))),config:{inicio:config_().inicio}});
  } catch(e) { return output_({error:String(e.message||e)}); }
}
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'config') {
      if (!TABS.includes(data.inicio)) throw new Error('Pantalla de inicio no válida.');
      config_().sheet.getRange(1,2).setValue(data.inicio);
    } else {
      const sheet = sheet_();
      const ids = sheet.getLastRow()>1 ? sheet.getRange(2,1,sheet.getLastRow()-1,1).getValues().map(r=>String(r[0])) : [];
      if (data.action === 'delete') {
        const index=ids.indexOf(String(data.id||''));
        if(index<0) throw new Error('No se encontró el regalo.');
        sheet.deleteRow(index+2);
      } else if (data.action === 'save') {
        const item=data.item||{};
        if (!String(item.persona||'').trim() || !String(item.regalo||'').trim()) throw new Error('Indica la persona y el regalo.');
        if (item.precio!=='' && item.precio!=null && (!isFinite(Number(item.precio)) || Number(item.precio)<0)) throw new Error('El precio no es válido.');
        if (!['Deseo sin asignar','Asignado','Comprado'].includes(item.estado)) throw new Error('El estado no es válido.');
        const index=item.id?ids.indexOf(String(item.id)):-1;
        if(item.id && index<0) throw new Error('No se encontró el regalo.');
        const safe=v=>String(v||'').replace(/^[=+\-@]/,"'");
        const row=[item.id||Utilities.getUuid(),safe(item.persona.trim()),safe(item.regalo.trim()),safe(item.enlace),item.precio===''||item.precio==null?'':Number(item.precio),safe(item.ocasion),item.estado,safe(item.notas),new Date().toISOString(),safe(item.comprador)];
        if(index<0) sheet.appendRow(row); else sheet.getRange(index+2,1,1,HEADERS.length).setValues([row]);
      } else throw new Error('Operación desconocida.');
    }
    SpreadsheetApp.flush();
    return output_({ok:true});
  } catch(err) { return output_({error:String(err.message||err)}); }
  finally { if(lock.hasLock()) lock.releaseLock(); }
}
