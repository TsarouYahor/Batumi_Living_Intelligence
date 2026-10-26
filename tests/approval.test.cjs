const test=require('node:test');const assert=require('node:assert/strict');
const {revision,parseCommand,validate}=require('../.github/scripts/approval.cjs');
function fixture(){const issue={title:'[FE-001] Карта',body:'Задача 3 часа',labels:[{name:'task:proposal'}]};return {issue,comment:{body:`/approve-task FE-001 ${revision(issue.body)}`,user:{login:'owner',type:'User'}},owner:'owner',approvedIds:new Set(['FE-001'])};}
test('валидное одобрение',()=>assert.equal(validate(fixture()).id,'FE-001'));
test('другой пользователь не может одобрить',()=>assert.throws(()=>validate({...fixture(),owner:'someone'})));
test('подмена revision отклоняется',()=>{const f=fixture();f.issue.body+=' изменена';assert.throws(()=>validate(f))});
test('отклонение по команде',()=>{const f=fixture();f.comment.body=f.comment.body.replace('approve-task','reject-task');assert.equal(validate(f).action,'reject-task')});
test('некорректный ID',()=>assert.equal(parseCommand('/approve-task BL-001 1234567890abcdef'),null));
test('дублирующийся ID отклоняется',()=>assert.throws(()=>validate({...fixture(),approvedIds:new Set()})));
