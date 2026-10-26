const crypto = require('node:crypto');
const ROLES = {OR:'orchestrator',AR:'architect',DA:'data',BE:'backend',FE:'frontend',AI:'ai_analyst',QA:'qa'};
const ID = /\b(OR|AR|DA|BE|FE|AI|QA)-([0-9]{3,})\b/;
function taskId(title){const m=title.match(ID);return m?m[0]:null;}
function revision(body){return crypto.createHash('sha256').update((body||'').replace(/\r\n/g,'\n')).digest('hex').slice(0,16);}
function parseCommand(text){const m=(text||'').trim().match(/^\/(approve-task|reject-task)\s+((?:OR|AR|DA|BE|FE|AI|QA)-[0-9]{3,})\s+([0-9a-f]{16})$/);return m?{action:m[1],id:m[2],revision:m[3]}:null;}
function validate({issue,comment,owner,approvedIds}){
 if(issue.pull_request) throw Error('Только Issues, не Pull Requests');
 const c=parseCommand(comment.body);if(!c) throw Error('Неверная команда');
 if(comment.user?.login?.toLowerCase()!==owner.toLowerCase()) throw Error('Команда только от Product Owner');
 if(comment.user?.type==='Bot') throw Error('Бот не может одобрять задачи');
 if(c.id!==taskId(issue.title)) throw Error('ID не совпадает с заголовком');
 if(!issue.labels.some(l=>(typeof l==='string'?l:l.name)==='task:proposal')) throw Error('Issue не отмечен как предложение задачи');
 if(c.revision!==revision(issue.body)) throw Error('Задача изменилась: требуется новое одобрение');
 if(!approvedIds.has(c.id)) throw Error('Неизвестный или дублирующийся ID задачи');
 return c;
}
module.exports={taskId,revision,parseCommand,validate,ROLES};
