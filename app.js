/* CampusHire - single-file frontend. Routes: #/ (landing), #/student|company|college (login), #/<role>/dashboard */
const K='campushire_single',BR=['CSE','IT','ECE','ME','CE'],$=s=>document.querySelector(s),uid=()=>Math.random().toString(36).slice(2,8);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function seed(){return{users:[{id:'a1',role:'college',name:'Placement Cell',email:'admin@college.edu',pw:'admin123'},
{id:'c1',role:'company',name:'TechNova',email:'hr@technova.com',pw:'tech123',ok:1,about:'Software services'},
{id:'s1',role:'student',name:'Riya Sharma',email:'riya@mail.com',pw:'riya123',branch:'CSE',cgpa:8.2,backlogs:0,skills:'Java, SQL',resume:'riya_resume.pdf'}],
vac:[{id:'v1',cid:'c1',role:'Software Engineer',desc:'Backend development',pkg:6,cgpa:7,br:['CSE','IT'],bl:0,st:'live'}],apps:[],drives:[]}}
let D;try{D=JSON.parse(localStorage.getItem(K))}catch(e){}D=D||seed();
let me=null,tab='',sub='mock',F={},selV='',mode='login';
const save=()=>{try{localStorage.setItem(K,JSON.stringify(D))}catch(e){}},U=id=>D.users.find(u=>u.id==id),V=id=>D.vac.find(v=>v.id==id);
const toast=m=>{const t=$('#toast');t.textContent=m;t.className='show';setTimeout(()=>t.className='',2200)};
const elig=(s,v)=>s.cgpa!==''&&s.cgpa>=v.cgpa&&v.br.includes(s.branch)&&s.backlogs<=v.bl;
const tag=t=>`<span class="tag ${/Selected|live|Approved/.test(t)?'ok':/Rejected|closed/.test(t)?'bad':'wait'}">${t}</span>`;
const tb=(h,r)=>`<div class="wrap"><table><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr>${r.length?r.map(x=>`<tr>${x.map(c=>`<td>${c}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${h.length}" class="mut">Nothing here yet.</td></tr>`}</table></div>`;
const val=i=>$('#'+i).value,crit=v=>`CGPA ${v.cgpa}+, ${v.br.join('/')}, backlogs ≤ ${v.bl}`;
const stats=a=>`<div class="stats">${a.map(([n,l])=>`<div class="stat"><b>${n}</b>${l}</div>`).join('')}</div>`;
const sel=()=>D.apps.filter(a=>a.st=='Selected').map(a=>{const v=V(a.vid);return{s:U(a.sid),c:U(v.cid),v}});
function download(name,rows){const t=rows.map(r=>r.map(c=>`"${String(c??'').replace(/"/g,'""')}"`).join(',')).join('\r\n'),a=document.createElement('a');
 a.href=URL.createObjectURL(new Blob([t],{type:'text/csv'}));a.download=name;a.click();toast('Report downloaded')}
const ROLES={student:'Student',company:'Company (Recruiter)',college:'College Placement Cell'};
const DEMO={student:'riya@mail.com / riya123',company:'hr@technova.com / tech123',college:'admin@college.edu / admin123'};
const getSess=()=>{try{return localStorage.getItem(K+'_s')}catch(e){return null}};
const logout=()=>{try{localStorage.removeItem(K+'_s')}catch(e){}me=null;location.hash='#/'};

/* ---------- routing ---------- */
function route(){const [r,p]=location.hash.replace('#/','').split('/'),role=ROLES[r]?r:'';
 document.body.dataset.role=role;$('#top').hidden=true;
 if(!role){$('#app').innerHTML=landing();return}
 const u=getSess()&&U(getSess());
 if(p=='dashboard'){if(!u||u.role!=role){location.hash='#/'+role;return}
  me=u;$('#top').hidden=false;$('#who').textContent=u.name+' ('+ROLES[role]+')';$('#rep').onclick=REPORT[role];$('#out').onclick=logout;tab=TABS[role][0];draw();return}
 if(u&&u.role==role){location.hash='#/'+role+'/dashboard';return}
 mode='login';$('#app').innerHTML=loginView(role)}
addEventListener('hashchange',route);
const landing=()=>`<div class="landing"><h1 class="hero">CampusHire</h1><p class="lead">Campus placements in one place. Choose your portal to continue.</p><div class="portals">
${[['student','S','Student','Build your profile, find vacancies you are eligible for, apply, and prepare for interviews.'],['company','C','Company','Post vacancies with eligibility criteria, review applicants, shortlist and schedule interviews.'],['college','P','College','Approve companies, manage student records, run placement drives and track placements.']]
.map(([k,i,t,d])=>`<a class="card portal" href="#/${k}"><span class="ico">${i}</span><h2>${t}</h2><p>${d}</p><b>${t} login &rarr;</b></a>`).join('')}</div></div>`;

/* ---------- login / register (one page per role) ---------- */
function loginView(role){return`<div class="auth card"><a href="#/" class="mut">&larr; All portals</a><h1>${ROLES[role]}</h1><p class="mut">Log in to your ${ROLES[role].toLowerCase()} portal.</p>
${role=='college'?'':`<nav class="tabs"><button class="${mode=='login'?'on':''}" onclick="setMode('login')">Log in</button><button class="${mode=='reg'?'on':''}" onclick="setMode('reg')">Register</button></nav>`}
${mode=='reg'?'<label for="nm">Name</label><input id="nm" autocomplete="name">':''}<label for="em">Email</label><input id="em" type="email" autocomplete="email"><label for="pw">Password</label><input id="pw" type="password">
<p class="err" id="err" role="alert"></p><button onclick="doLogin('${role}')">${mode=='login'?'Log in':'Create account'}</button><p class="note mut">Demo login: ${DEMO[role]}</p></div>`}
const setMode=m=>{mode=m;$('#app').innerHTML=loginView(location.hash.split('/')[1])};
function doLogin(role){const em=val('em').trim().toLowerCase(),pw=val('pw'),f=m=>$('#err').textContent=m;let u;
 if(!em||!pw)return f('Enter your email and password.');
 if(mode=='reg'){const nm=val('nm').trim();if(!nm)return f('Enter your name.');if(pw.length<6)return f('Use at least 6 characters for the password.');
  if(D.users.some(x=>x.email==em))return f('This email is already registered.');
  u={id:uid(),role,name:nm,email:em,pw,...(role=='student'?{branch:'CSE',cgpa:'',backlogs:'',skills:'',resume:''}:{ok:0,about:''})};D.users.push(u);save()}
 else{u=D.users.find(x=>x.email==em&&x.pw==pw&&x.role==role);if(!u)return f('Invalid credentials for the '+ROLES[role].toLowerCase()+' portal.')}
 try{localStorage.setItem(K+'_s',u.id)}catch(e){return f('Your browser blocked storage; enable it to continue.')}
 location.hash='#/'+role+'/dashboard'}

/* ---------- dashboards ---------- */
const TABS={student:['Overview','Profile','Vacancies','Applications','Prepare'],company:['Overview','Profile','Post vacancy','My vacancies','Applicants'],college:['Overview','Students','Companies','Vacancies','Drives','Placements']};
function draw(){const role=me.role;$('#app').innerHTML=`<nav class="tabs">${TABS[role].map(t=>`<button class="${t==tab?'on':''}" onclick="tab='${t}';draw()">${t}</button>`).join('')}</nav>`+VIEWS[role][tab]()}
const myApps=()=>D.apps.filter(a=>a.sid==me.id),mine=()=>D.vac.filter(v=>v.cid==me.id),apps=v=>D.apps.filter(a=>a.vid==v);
const STU=()=>D.users.filter(u=>u.role=='student'),COS=()=>D.users.filter(u=>u.role=='company'),cs=c=>c.ok===1?'Approved':c.ok===-1?'Rejected':'Pending';
const byCo=()=>{const C={};sel().forEach(x=>C[x.c.name]=(C[x.c.name]||0)+1);return C};
const QB=[['Aptitude','Next number: 2, 6, 12, 20, ?','30. The differences grow by 2.'],['Aptitude','A 120 m train passes a pole in 6 s. What is its speed?','20 m/s, which is 72 km/h.'],['DSA','Time complexity of binary search?','O(log n).'],['DSA','Stack versus queue?','A stack is last-in first-out; a queue is first-in first-out.'],['SQL','Which keyword removes duplicate rows?','DISTINCT.'],['HR','Describe a time you handled a conflict.','Use STAR: situation, task, action, result.'],['TechNova','REST versus SOAP?','REST uses plain HTTP and JSON; SOAP uses XML with strict contracts.']];
const PREP={
mock:()=>`<p>Answer each question in a few sentences.</p>${['Tell me about yourself.','Describe a project you built and your role in it.',`Explain a core ${me.branch||'engineering'} concept you enjoy.`,'Why should we hire you?'].map((q,i)=>`<label for="q${i}">${i+1}. ${q}</label><textarea class="mq" id="q${i}" rows="2"></textarea>`).join('')}<button onclick="mock()">Get feedback</button><div id="out2"></div>`,
resume:()=>`<p>Check your uploaded resume for missing basics.</p><button onclick="resTest()">Test my resume</button><div id="out2"></div>`,
prac:()=>`<label for="pt">Subject or company</label><select id="pt" onchange="F.t=this.value;draw()"><option value="">All</option>${[...new Set(QB.map(q=>q[0]))].map(t=>`<option ${F.t==t?'selected':''}>${t}</option>`).join('')}</select>${QB.filter(q=>!F.t||q[0]==F.t).map(q=>`<details class="note"><summary><span class="tag">${q[0]}</span> ${q[1]}</summary><p><b>Answer:</b> ${q[2]}</p></details>`).join('')}`};
const VIEWS={
student:{
Overview:()=>{const A=myApps(),n=me.cgpa===''?0:D.vac.filter(v=>v.st=='live'&&U(v.cid).ok===1&&elig(me,v)).length;
 return stats([[n,'Eligible vacancies'],[A.length,'Applications'],[A.filter(a=>/Shortlisted|Interview/.test(a.st)).length,'Shortlisted / interviews'],[A.filter(a=>a.st=='Selected').length,'Offers']])+
 `<div class="card"><h2>Welcome, ${esc(me.name)}</h2>${me.cgpa===''?'<p class="note">Complete your profile to see vacancies you are eligible for.</p>':'<p>Your profile is complete. Browse vacancies or prepare for interviews.</p>'}<p class="mut">Use "Download report" above to save your placement report.</p></div>`},
Profile:()=>`<div class="card"><h2>My profile</h2><div class="row"><div><label for="br">Branch</label><select id="br">${BR.map(b=>`<option ${me.branch==b?'selected':''}>${b}</option>`).join('')}</select></div>
<div><label for="cg">CGPA</label><input id="cg" type="number" step="0.01" min="0" max="10" value="${esc(me.cgpa)}"></div><div><label for="bl">Active backlogs</label><input id="bl" type="number" min="0" value="${esc(me.backlogs)}"></div></div>
<label for="sk">Skills</label><input id="sk" value="${esc(me.skills)}" placeholder="Java, SQL, Python"><label for="rs">Resume (PDF or Word)</label><input id="rs" type="file" accept=".pdf,.doc,.docx">
<p class="mut">Current resume: ${esc(me.resume||'none uploaded')}</p><p class="err" id="err"></p><button onclick="saveProfile()">Save profile</button><button class="ghost" onclick="preview()">See how recruiters view it</button><div id="pv"></div></div>`,
Vacancies:()=>{if(me.cgpa==='')return`<div class="card"><p>Complete your profile (branch, CGPA, backlogs) to see vacancies you are eligible for.</p><button onclick="tab='Profile';draw()">Go to profile</button></div>`;
 const q=(F.q||'').toLowerCase(),mp=+F.p||0,L=D.vac.filter(v=>v.st=='live'&&U(v.cid).ok===1&&elig(me,v)&&(v.role+U(v.cid).name).toLowerCase().includes(q)&&v.pkg>=mp);
 return`<div class="card"><h2>Vacancies you can apply to</h2><div class="row"><div><label for="fq">Role or company</label><input id="fq" value="${esc(F.q||'')}"></div><div><label for="fp">Minimum package (LPA)</label><input id="fp" type="number" value="${esc(F.p||'')}"></div></div>
 <button onclick="F={q:val('fq'),p:val('fp')};draw()">Filter</button><p class="mut">Only vacancies whose criteria match your profile are shown.</p>
 ${tb(['Role','Company','Package','Criteria',''],L.map(v=>{const a=D.apps.find(a=>a.vid==v.id&&a.sid==me.id);return[esc(v.role)+`<br><span class="mut">${esc(v.desc)}</span>`,esc(U(v.cid).name),v.pkg+' LPA',crit(v),a?tag(a.st):`<button class="sm" onclick="apply('${v.id}')">Apply</button>`]}))}</div>`},
Applications:()=>`<div class="card"><h2>My applications</h2>${tb(['Role','Company','Status','Interview'],myApps().map(a=>{const v=V(a.vid);return[esc(v.role),esc(U(v.cid).name),tag(a.st),esc(a.slot||'-')]}))}</div>`,
Prepare:()=>`<div class="card"><h2>Prepare for placements</h2><p class="mut">These tools are optional. You can apply to vacancies without using them.</p><nav class="tabs">${[['mock','Mock interview'],['resume','Resume test'],['prac','Practice questions']].map(([k,t])=>`<button class="${sub==k?'on':''}" onclick="sub='${k}';draw()">${t}</button>`).join('')}</nav>${PREP[sub]()}</div>`},
company:{
Overview:()=>{const M=mine(),A=M.flatMap(v=>apps(v.id));return stats([[M.length,'Vacancies'],[M.filter(v=>v.st=='live').length,'Live'],[A.length,'Applicants'],[A.filter(a=>/Shortlisted|Interview/.test(a.st)).length,'Shortlisted'],[A.filter(a=>a.st=='Selected').length,'Offers']])+
 `<div class="card"><h2>Welcome, ${esc(me.name)}</h2><p>College approval: ${tag(cs(me))}</p>${me.ok!==1?'<p class="note">Vacancies go live only after the college approves your company and the vacancy.</p>':''}</div>`},
Profile:()=>`<div class="card"><h2>Company profile</h2><label for="cn">Company name</label><input id="cn" value="${esc(me.name)}"><label for="ab">About the company</label><textarea id="ab" rows="3">${esc(me.about)}</textarea><p class="err" id="err"></p><button onclick="saveCo()">Save profile</button></div>`,
'Post vacancy':()=>`<div class="card"><h2>Post a vacancy</h2><div class="row"><div><label for="vr">Role</label><input id="vr"></div><div><label for="vp">Package (LPA)</label><input id="vp" type="number" min="0" step="0.1"></div></div><label for="vd">Description</label><textarea id="vd" rows="2"></textarea>
<h3>Eligibility criteria</h3><div class="row"><div><label for="vc">Minimum CGPA</label><input id="vc" type="number" min="0" max="10" step="0.1"></div><div><label for="vb">Maximum backlogs</label><input id="vb" type="number" min="0"></div></div>
<label>Eligible branches</label><div class="chk">${BR.map(b=>`<label><input type="checkbox" class="vbr" value="${b}">${b}</label>`).join('')}</div><p class="err" id="err"></p><button onclick="postVac()">Post vacancy</button></div>`,
'My vacancies':()=>`<div class="card"><h2>My vacancies</h2>${tb(['Role','Package','Criteria','Status','Applicants',''],mine().map(v=>[esc(v.role),v.pkg+' LPA',crit(v),tag(v.st=='changes'?'Changes requested':v.st),apps(v.id).length,v.st!='closed'?`<button class="sm ghost" onclick="V('${v.id}').st='closed';save();draw()">Close</button><button class="sm" onclick="selV='${v.id}';tab='Applicants';draw()">Applicants</button>`:'']))}</div>`,
Applicants:()=>{const M=mine(),v=selV||(M[0]||{}).id;if(!v)return'<div class="card">Post a vacancy to receive applicants.</div>';const f=F.a||{};
 const L=apps(v).map(a=>({a,s:U(a.sid)})).filter(({s})=>(!f.b||s.branch==f.b)&&(!f.c||s.cgpa>=+f.c)&&(!f.k||s.skills.toLowerCase().includes(f.k.toLowerCase())));
 return`<div class="card"><h2>Applicants</h2><div class="row"><div><label for="av">Vacancy</label><select id="av" onchange="selV=this.value;draw()">${M.map(x=>`<option value="${x.id}" ${x.id==v?'selected':''}>${esc(x.role)}</option>`).join('')}</select></div>
 <div><label for="ab2">Branch</label><select id="ab2"><option value="">Any</option>${BR.map(b=>`<option ${f.b==b?'selected':''}>${b}</option>`).join('')}</select></div><div><label for="ac">Min CGPA</label><input id="ac" type="number" value="${esc(f.c||'')}"></div><div><label for="ak">Skill</label><input id="ak" value="${esc(f.k||'')}"></div></div>
 <button onclick="F.a={b:val('ab2'),c:val('ac'),k:val('ak')};draw()">Filter applicants</button>${tb(['Student','Branch','CGPA','Skills','Resume','Status','Action'],L.map(({a,s})=>[esc(s.name),s.branch,s.cgpa,esc(s.skills),esc(s.resume),tag(a.st)+(a.slot?`<br>${esc(a.slot)}`:''),actions(a)]))}</div>`}},
college:{
Overview:()=>stats([[STU().length,'Students'],[COS().length,'Companies'],[COS().filter(c=>c.ok===0).length,'Pending approvals'],[D.drives.length,'Drives'],[sel().length,'Placed students']])+
 `<div class="card"><h2>Placement cell dashboard</h2><p>Approve companies, review vacancy criteria, create drives and track placements. Use "Download report" above to export everything.</p></div>`,
Students:()=>`<div class="card"><h2>Student records</h2>${tb(['Name','Email','Branch','CGPA','Backlogs','Status',''],STU().map(s=>[esc(s.name),esc(s.email),s.branch,s.cgpa,s.backlogs,s.flag?tag('Flagged'):tag('Approved'),`<button class="sm ghost" onclick="U('${s.id}').flag=!U('${s.id}').flag;save();draw()">${s.flag?'Unflag':'Flag'}</button><button class="sm warn" onclick="rm('${s.id}')">Remove</button>`]))}</div>`,
Companies:()=>`<div class="card"><h2>Company approvals</h2>${tb(['Company','Email','Status',''],COS().map(c=>[esc(c.name),esc(c.email),tag(cs(c)),`<button class="sm" onclick="U('${c.id}').ok=1;save();draw()">Approve</button><button class="sm ghost" onclick="U('${c.id}').ok=-1;save();draw()">Reject</button><button class="sm warn" onclick="rm('${c.id}')">Remove</button>`]))}</div>`,
Vacancies:()=>`<div class="card"><h2>Vacancy and criteria review</h2>${tb(['Role','Company','Criteria','Status',''],D.vac.map(v=>[esc(v.role),esc(U(v.cid).name),crit(v),tag(v.st=='changes'?'Changes requested':v.st),v.st=='closed'?'':`<button class="sm" onclick="V('${v.id}').st='live';save();draw()">Approve</button><button class="sm ghost" onclick="V('${v.id}').st='changes';save();draw()">Request change</button>`]))}</div>`,
Drives:()=>`<div class="card"><h2>Placement drives</h2><div class="row"><div><label for="dn">Drive name</label><input id="dn"></div><div><label for="dd">Date</label><input id="dd" type="date"></div><div><label for="dc">Company</label><select id="dc">${COS().filter(c=>c.ok===1).map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div></div>
<p class="err" id="err"></p><button onclick="addDrive()">Create drive</button>${tb(['Drive','Date','Company','Eligible students'],D.drives.map(d=>[esc(d.n),d.d,esc(U(d.c).name),STU().filter(s=>!s.flag&&D.vac.some(v=>v.cid==d.c&&v.st=='live'&&elig(s,v))).length]))}</div>`,
Placements:()=>`<div class="card"><h2>Selected students</h2>${tb(['Student','Company','Role'],sel().map(x=>[esc(x.s.name),esc(x.c.name),esc(x.v.role)]))}</div><div class="card"><h2>Company-wise placements</h2>${tb(['Company','Students selected'],Object.entries(byCo()).map(([k,n])=>[esc(k),n]))}</div>`}};

/* ---------- actions ---------- */
function saveProfile(){const cg=parseFloat(val('cg')),bl=parseInt(val('bl')),f=$('#rs').files[0],e=m=>$('#err').textContent=m;
 if(isNaN(cg)||cg<0||cg>10)return e('Enter a CGPA between 0 and 10.');if(isNaN(bl)||bl<0)return e('Enter the number of backlogs (0 if none).');
 if(!f&&!me.resume)return e('Upload your resume to save the profile.');
 Object.assign(me,{branch:val('br'),cgpa:cg,backlogs:bl,skills:val('sk').trim(),resume:f?f.name:me.resume});save();toast('Profile saved');draw()}
const preview=()=>$('#pv').innerHTML=`<div class="note"><b>${esc(me.name)}</b> · ${me.branch} · CGPA ${esc(me.cgpa)} · ${esc(me.backlogs)} backlogs<br>Skills: ${esc(me.skills||'none')}<br>Resume: ${esc(me.resume||'none')}</div>`;
function apply(id){const v=V(id);if(!elig(me,v))return toast('You do not meet the criteria for this vacancy.');if(D.apps.some(a=>a.vid==id&&a.sid==me.id))return;D.apps.push({id:uid(),vid:id,sid:me.id,st:'Applied',slot:''});save();toast('Application submitted');draw()}
function mock(){const n=[...document.querySelectorAll('.mq')].map(t=>t.value.trim().split(/\s+/).filter(Boolean).length),sc=Math.round(n.reduce((a,x)=>a+Math.min(x,40),0)/(n.length*40)*100);
 $('#out2').innerHTML=`<div class="note"><b>Practice score: ${sc}/100</b><br>${n.map((x,i)=>x<20?`Question ${i+1}: add more detail, aim for about 40 words.`:`Question ${i+1}: good depth.`).join('<br>')}<br><span class="mut">This is preparation guidance, not a prediction of interview results.</span></div>`}
function resTest(){const t=[];if(!me.resume)t.push('Upload a resume in your profile first.');if(!me.skills)t.push('Add a skills section.');if(!me.branch||me.cgpa==='')t.push('Add education details: branch and CGPA.');
 t.push('Put your email and phone number at the top.','Keep the resume to one page.','Describe each project with the result you achieved.');
 $('#out2').innerHTML=`<div class="note"><b>Suggestions</b><ul>${t.map(x=>`<li>${x}</li>`).join('')}</ul><span class="mut">These are suggestions to improve your resume, not a pass or fail.</span></div>`}
function saveCo(){const n=val('cn').trim();if(!n)return $('#err').textContent='Enter the company name.';me.name=n;me.about=val('ab');save();$('#who').textContent=n+' ('+ROLES.company+')';toast('Profile saved')}
function postVac(){const o={role:val('vr').trim(),pkg:parseFloat(val('vp')),cgpa:parseFloat(val('vc')),bl:parseInt(val('vb')),br:[...document.querySelectorAll('.vbr:checked')].map(x=>x.value)},e=m=>$('#err').textContent=m;
 if(!o.role||isNaN(o.pkg))return e('Enter the role and package.');if(isNaN(o.cgpa)||isNaN(o.bl)||!o.br.length)return e('Eligibility criteria are required: minimum CGPA, maximum backlogs and at least one branch.');
 D.vac.push({id:uid(),cid:me.id,desc:val('vd'),st:'pending',...o});save();toast('Vacancy posted for college review');tab='My vacancies';draw()}
function actions(a){const b=(t,s,c='')=>`<button class="sm ${c}" onclick="setApp('${a.id}','${s}')">${t}</button>`;
 if(a.st=='Applied')return b('Shortlist','Shortlisted')+b('Reject','Rejected','ghost');
 if(a.st=='Shortlisted')return`<input type="datetime-local" id="sl${a.id}" aria-label="Interview time"><button class="sm" onclick="setApp('${a.id}','Interview scheduled',val('sl${a.id}'))">Schedule interview</button>`;
 if(a.st=='Interview scheduled')return b('Confirm offer','Selected')+b('Reject','Rejected','ghost');return''}
function setApp(id,st,slot){if(st=='Interview scheduled'&&!slot)return toast('Pick an interview date and time.');const a=D.apps.find(x=>x.id==id);a.st=st;if(slot)a.slot=slot.replace('T',' ');save();toast(st);draw()}
const rm=id=>{D.users=D.users.filter(u=>u.id!=id);D.apps=D.apps.filter(a=>a.sid!=id);D.vac=D.vac.filter(v=>v.cid!=id);save();draw()};
function addDrive(){const n=val('dn').trim(),d=val('dd'),c=val('dc');if(!n||!d||!c)return $('#err').textContent='Enter a name, date and an approved company.';D.drives.push({n,d,c});save();toast('Drive created');draw()}

/* ---------- downloadable reports (CSV) ---------- */
const REPORT={
student:()=>download('student_report.csv',[['CampusHire Student Report'],['Generated',new Date().toLocaleString()],[],['Name',me.name],['Email',me.email],['Branch',me.branch],['CGPA',me.cgpa],['Backlogs',me.backlogs],['Skills',me.skills],['Resume',me.resume],[],
 ['Role','Company','Package (LPA)','Status','Interview slot'],...myApps().map(a=>{const v=V(a.vid);return[v.role,U(v.cid).name,v.pkg,a.st,a.slot]})]),
company:()=>download('company_report.csv',[['CampusHire Company Report'],['Company',me.name],['Generated',new Date().toLocaleString()],[],['Vacancy','Package (LPA)','Criteria','Status','Applicants','Shortlisted','Selected'],
 ...mine().map(v=>[v.role,v.pkg,crit(v),v.st,apps(v.id).length,apps(v.id).filter(a=>/Shortlisted|Interview/.test(a.st)).length,apps(v.id).filter(a=>a.st=='Selected').length]),[],
 ['Vacancy','Student','Branch','CGPA','Skills','Status','Interview slot'],...mine().flatMap(v=>apps(v.id).map(a=>{const s=U(a.sid);return[v.role,s.name,s.branch,s.cgpa,s.skills,a.st,a.slot]}))]),
college:()=>download('college_report.csv',[['CampusHire Placement Report'],['Generated',new Date().toLocaleString()],[],['Students',STU().length],['Companies',COS().length],['Drives',D.drives.length],['Placed students',sel().length],[],
 ['Company-wise placements'],['Company','Selected'],...Object.entries(byCo()),[],['Selected students'],['Student','Company','Role'],...sel().map(x=>[x.s.name,x.c.name,x.v.role]),[],
 ['Companies'],['Company','Email','Status'],...COS().map(c=>[c.name,c.email,cs(c)]),[],['Students'],['Name','Email','Branch','CGPA','Backlogs'],...STU().map(s=>[s.name,s.email,s.branch,s.cgpa,s.backlogs]),[],
 ['Drives'],['Name','Date','Company'],...D.drives.map(d=>[d.n,d.d,U(d.c).name])])};
route();
