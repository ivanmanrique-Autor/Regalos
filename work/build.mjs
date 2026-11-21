import fs from 'node:fs/promises';
import {Workbook,SpreadsheetFile} from 'file:///C:/Program%20Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1119-907-0_26.1119.907.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const wb=Workbook.create();
for(const n of ['Configuración','Regalos','Personas','Celebraciones','Gastos']) wb.worksheets.add(n);
const cfg=wb.worksheets.getItem('Configuración'), reg=wb.worksheets.getItem('Regalos'), per=wb.worksheets.getItem('Personas'), cel=wb.worksheets.getItem('Celebraciones'), gas=wb.worksheets.getItem('Gastos');
for(const s of [cfg,reg,per,cel,gas]) {s.showGridLines=false;s.getRange('A1:O600').format.font.name='Arial';s.getRange('A1:O600').format.font.size=10;}
function title(s,range,text){s.getRange(range).values=[[text]];s.getRange(range).format.font.bold=true;s.getRange(range).format.font.size=15;s.getRange(range).format.font.color='#17365D';}
function head(s,r){s.getRange(r).format.fill='#244A64';s.getRange(r).format.font.color='#FFFFFF';s.getRange(r).format.font.bold=true;s.getRange(r).format.rowHeight=30;s.getRange(r).format.wrapText=true;}
function widths(s,arr){arr.forEach((w,i)=>s.getRangeByIndexes(0,i,600,1).format.columnWidth=w)}
title(cfg,'A2','Menú principal y configuración');
cfg.getRange('A4:B10').values=[['Sección','Para qué sirve'],['Regalos','Añadir y actualizar cada regalo'],['Personas','Crear el catálogo compartido de personas'],['Celebraciones','Editar las celebraciones disponibles'],['Gastos','Consultar importes por comprador y destinatario'],['Moneda','EUR'],['Uso','Primero añade personas; después registra regalos.']];head(cfg,'A4:B4');
cfg.getRange('A12:B16').values=[['Criterio','Definición'],['Comprado','Suma del importe real de regalos con estado comprado.'],['Pendiente','Suma del importe previsto de regalos no comprados.'],['Identificador','Escribe un ID único y mantenlo al ordenar o editar.'],['Capacidad','500 regalos y 100 personas; amplía rangos si necesitas más.']];head(cfg,'A12:B12');widths(cfg,[24,72]);
cfg.getRange('D4:D7').values=[['Estados'],['Deseo sin asignar'],['Asignado'],['Comprado']];head(cfg,'D4:D4');
reg.getRange('A1:J1').values=[['ID','Descripción','Destinatario','Comprador','Celebración','Importe previsto','Importe real','Estado','Notas','Enlace']];head(reg,'A1:J1');widths(reg,[14,32,22,22,22,19,18,23,36,35]);reg.freezePanes.freezeRows(1);
reg.tables.add('A1:J501',true,'TablaRegalos');
per.getRange('A1:B1').values=[['Nombre','Notas']];head(per,'A1:B1');widths(per,[28,46]);per.tables.add('A1:B101',true,'TablaPersonas');per.freezePanes.freezeRows(1);
cel.getRange('A1:B5').values=[['Celebración','Notas'],['Tió',''],['Papá Noel',''],['Reyes',''],['Cumpleaños','']];head(cel,'A1:B1');widths(cel,[28,46]);cel.tables.add('A1:B101',true,'TablaCelebraciones');cel.freezePanes.freezeRows(1);
reg.getRange('C2:D501').dataValidation={rule:{type:'list',formula1:'Personas!$A$2:$A$101'}};
reg.getRange('E2:E501').dataValidation={rule:{type:'list',formula1:'Celebraciones!$A$2:$A$101'}};
reg.getRange('H2:H501').dataValidation={rule:{type:'list',formula1:"'Configuración'!$D$5:$D$7"}};
reg.getRange('F2:G501').dataValidation={rule:{type:'decimal',operator:'greaterThanOrEqual',formula1:0}};reg.getRange('F2:G501').setNumberFormat('#,##0.00 "€"');
title(gas,'A2','Gastos y resumen');gas.getRange('A4:B5').values=[['Comprador',''],['Destinatario','']];gas.getRange('D4').values=[['Deja los filtros vacíos para incluir a todas las personas.']];gas.getRange('B4:B5').dataValidation={rule:{type:'list',formula1:'Personas!$A$2:$A$101'}};gas.getRange('B4:B5').format.fill='#FFF2CC';
gas.getRange('A7:C7').values=[['Comprado: importe real','Pendiente: importe previsto','Total estimado']];head(gas,'A7:C7');
const cond='Regalos!$D$2:$D$501,IF($B$4="","*",$B$4),Regalos!$C$2:$C$501,IF($B$5="","*",$B$5)';
// SUMPRODUCT treats empty filters as all rows, including unassigned people.
const masks='IF($B$4="",1,--(Regalos!$D$2:$D$501=$B$4))*IF($B$5="",1,--(Regalos!$C$2:$C$501=$B$5))';
gas.getRange('A8').formulas=[[`=SUMPRODUCT(${masks}*--(Regalos!$H$2:$H$501="Comprado")*Regalos!$G$2:$G$501)`]];
gas.getRange('B8').formulas=[[`=SUMPRODUCT(${masks}*--(Regalos!$H$2:$H$501<>"Comprado")*Regalos!$F$2:$F$501)`]];gas.getRange('C8').formulas=[['=A8+B8']];
gas.getRange('A11:C11').values=[['Comprador','Comprado: real','Pendiente: previsto']];head(gas,'A11:C11');
gas.getRange('E11:G11').values=[['Destinatario','Comprado: real','Pendiente: previsto']];head(gas,'E11:G11');
for(let i=12;i<=111;i++){let p=i-10;gas.getRange(`A${i}`).formulas=[[`=IF(Personas!A${p}="","",Personas!A${p})`]];gas.getRange(`E${i}`).formulas=[[`=IF(Personas!A${p}="","",Personas!A${p})`]];for(const [col,personCol,amt,status] of [['B','D','G','="Comprado"'],['C','D','F','<>"Comprado"'],['F','C','G','="Comprado"'],['G','C','F','<>"Comprado"']]){const label=col==='B'||col==='C'?'A':'E';gas.getRange(`${col}${i}`).formulas=[[`=IF(${label}${i}="","",SUMPRODUCT(--(Regalos!$${personCol}$2:$${personCol}$501=${label}${i})*${masks}*--(Regalos!$H$2:$H$501${status})*Regalos!$${amt}$2:$${amt}$501))`]];}}
gas.getRange('A114:G115').values=[['Nota','Los importes sin comprador o destinatario se incluyen en los totales generales.'],['Pendiente','Incluye deseos y asignados; usa el importe previsto.']];gas.getRange('B8:C111').setNumberFormat('#,##0.00 "€"');gas.getRange('F12:G111').setNumberFormat('#,##0.00 "€"');widths(gas,[25,24,25,5,25,24,25]);
wb.recalculate();
await fs.mkdir('outputs',{recursive:true});const out=await SpreadsheetFile.exportXlsx(wb);await out.save('outputs/Regalos_familiares.xlsx');
for(const s of [cfg,reg,per,cel,gas]){try{const b=await wb.render({sheetName:s.name,range:s===gas?'A1:G18':s===reg?'A1:J12':'A1:D18',scale:1,format:'png'});await fs.writeFile(`work/${s.name}.png`,new Uint8Array(await b.arrayBuffer()));}catch(e){console.log('render',s.name,String(e));}}
console.log((await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A',options:{useRegex:true,maxResults:20}})).ndjson);

