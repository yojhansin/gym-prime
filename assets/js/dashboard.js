// ================= DB Helpers =================
function dbGet(k, fallback){ 
  try { 
    const r = localStorage.getItem(k); 
    return r ? JSON.parse(r) : fallback 
  } catch(e) { 
    return fallback 
  } 
}

function dbSet(k,v){ 
  localStorage.setItem(k, JSON.stringify(v)) 
}

// ================= Inicialización DB =================
const DEFAULT_PLANS = [
  { id:'p1', name:'Mensual - Básico', price:19900, slots:30, desc:'Acceso libre al gym por 1 mes' },
  { id:'p2', name:'3 Meses - Popular', price:49900, slots:18, desc:'Mejor precio y 1 clase incluida/mes' },
  { id:'p3', name:'Anual - Premium', price:149900, slots:6, desc:'Acceso ilimitado + 2 sesiones PT/mes' }
];

if(!dbGet('gym_plans')) dbSet('gym_plans', DEFAULT_PLANS);
if(!dbGet('gym_bookings')) dbSet('gym_bookings', []);
if(!dbGet('gym_exercises')) dbSet('gym_exercises', []);

// ================= Helpers =================
const money = v => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(v);
const root = id => document.getElementById(id);

function renderMetrics(){
  const metrics = root('dash-metrics');
  const plans = dbGet('gym_plans', []);
  const bookings = dbGet('gym_bookings', []);

  // Total alumnos
  const totalClientes = bookings.length;

  // Total cupos restantes sumando por plan
  const totalSlotsRestantes = plans.reduce((acc, plan) => {
    const inscritos = bookings.filter(b => b.planId === plan.id).length;
    return acc + Math.max(0, (plan.slots || 0) - inscritos);
  }, 0);

  metrics.innerHTML = `
    <div class="hero-card" style="flex:1; min-width:120px; text-align:center">
      <strong>Total Alumnos</strong>
      <div style="font-size:20px; font-weight:700; color:var(--red)">${totalClientes}</div>
    </div>
    <div class="hero-card" style="flex:1; min-width:120px; text-align:center">
      <strong>Cupos Restantes</strong>
      <div style="font-size:20px; font-weight:700; color:var(--red)">${totalSlotsRestantes}</div>
    </div>
    <div class="hero-card" style="flex:1; min-width:120px; text-align:center">
      <strong>Planes Disponibles</strong>
      <div style="font-size:20px; font-weight:700; color:var(--red)">${plans.length}</div>
    </div>
  `;
}


// ================= Render Planes =================
function renderPlans(){
  const container = root('dash-plans');
  const plans = dbGet('gym_plans', []);
  const bookings = dbGet('gym_bookings', []);
  container.innerHTML = '';
  plans.forEach(p=>{
    const enrolled = bookings.filter(b=>b.planId===p.id).length;
    const remainingSlots = Math.max(0, (p.slots||0) - enrolled);

    const el = document.createElement('div'); 
    el.className='card-plan';
    el.innerHTML = `
      <div class="plan-info">
        <h3>${p.name}</h3>
        <p class="micro">${p.desc}</p>
        <div class="micro">Precio: ${money(p.price)} | Cupos: ${p.slots}</div>
        <div class="micro">Cupos restantes: <strong>${remainingSlots}</strong></div>
        <div class="micro">Alumnos inscritos: <strong>${enrolled}</strong></div>
      </div>
      <div style="display:flex; gap:6px; flex-direction:column;">
        <button class="btn btn-ghost" onclick="editPlan('${p.id}')">Editar</button>
        <button class="btn btn-primary" onclick="deletePlan('${p.id}')">Eliminar</button>
      </div>
    `;
    container.appendChild(el);
  });
}


// ================= Render Reservas =================
function renderBookings(){
  const container = root('dash-bookings');
  const bookings = dbGet('gym_bookings', []);
  const plans = dbGet('gym_plans', []);
  container.innerHTML = bookings.map(b=>{
    const plan = plans.find(p=>p.id===b.planId);
    return `
      <div style="padding:8px;border-bottom:1px solid rgba(255,255,255,0.03); display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong>${b.name}</strong> (${b.email})<br>
          <span class="micro">Plan: ${plan?.name||'--'} | Estado: ${b.status||'pendiente'}</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:4px;">
          <button class="btn btn-ghost" onclick="openBookingDetail('${b.id}')">Ver</button>
          <button class="btn btn-primary" onclick="deleteBooking('${b.id}')">Eliminar</button>
        </div>
      </div>
    `;
  }).join('') || '<div class="micro">Sin reservas</div>';
}

// ================= Modal Ver Alumno =================
function openBookingDetail(id){
  const bookings = dbGet('gym_bookings', []);
  const plans = dbGet('gym_plans', []);
  const b = bookings.find(x=>x.id===id);
  if(!b) return;

  const plan = plans.find(p=>p.id===b.planId);

  const root=document.getElementById('modals-root'); root.innerHTML='';
  const backdrop=document.createElement('div'); backdrop.className='modal-backdrop';
  const modal=document.createElement('div'); modal.className='modal';
  modal.innerHTML=`
    <h3 style="color:var(--red)">Alumno: ${b.name}</h3>
    <p><strong>Email:</strong> ${b.email}</p>
    <p><strong>Plan:</strong> ${plan?.name||'--'}</p>
    <p><strong>Fecha Ingreso:</strong> ${b.fechaIngreso||'--'}</p>
    <p><strong>Fecha Pago:</strong> ${b.fechaPago||'--'}</p>
    <p><strong>Estado:</strong> ${b.status||'pendiente'}</p>
    <div style="margin-top:10px; display:flex; gap:8px;">
      <button class="btn btn-primary" onclick="openBookingEdit('${b.id}')">Editar</button>
      <button class="btn btn-ghost" onclick="document.getElementById('modals-root').innerHTML=''">Cerrar</button>
    </div>
  `;
  backdrop.appendChild(modal); root.appendChild(backdrop);

  backdrop.addEventListener('click', e=>{ if(e.target===backdrop) root.innerHTML=''; });
}

// ================= Modal Editar Alumno =================
function openBookingEdit(id){
  const bookings = dbGet('gym_bookings', []);
  const plans = dbGet('gym_plans', []);
  const b = bookings.find(x=>x.id===id);
  if(!b) return;

  const root=document.getElementById('modals-root'); root.innerHTML='';
  const backdrop=document.createElement('div'); backdrop.className='modal-backdrop';
  const modal=document.createElement('div'); modal.className='modal';
  modal.innerHTML=`
    <h3 style="color:var(--red)">Editar Alumno</h3>
    <input id="edit-name" class="input" placeholder="Nombre" value="${b.name}" />
    <input id="edit-email" class="input" placeholder="Email" value="${b.email}" />
    <input id="edit-fechaIngreso" class="input" type="date" value="${b.fechaIngreso||''}" />
    <input id="edit-fechaPago" class="input" type="date" value="${b.fechaPago||''}" />
    <select id="edit-status" class="input">
      <option value="pendiente" ${b.status==='pendiente'?'selected':''}>Pendiente</option>
      <option value="completado" ${b.status==='completado'?'selected':''}>Completado</option>
    </select>
    <div style="margin-top:10px; display:flex; gap:8px;">
      <button class="btn btn-primary" id="edit-save">Guardar</button>
      <button class="btn btn-ghost" id="edit-cancel">Cancelar</button>
    </div>
  `;
  backdrop.appendChild(modal); root.appendChild(backdrop);

  document.getElementById('edit-cancel').onclick=()=>openBookingDetail(id);

  document.getElementById('edit-save').onclick=()=>{
    const name=document.getElementById('edit-name').value.trim();
    const email=document.getElementById('edit-email').value.trim();
    const fechaIngreso=document.getElementById('edit-fechaIngreso').value;
    const fechaPago=document.getElementById('edit-fechaPago').value;
    const status=document.getElementById('edit-status').value;

    if(!name||!email) return alert('Nombre y email son requeridos');

    b.name=name; 
    b.email=email; 
    b.fechaIngreso=fechaIngreso; 
    b.fechaPago=fechaPago; 
    b.status=status;

    const idx=bookings.findIndex(x=>x.id===id);
    bookings[idx]=b;
    dbSet('gym_bookings', bookings);
    renderBookings();
    openBookingDetail(id);
  };

  backdrop.addEventListener('click', e=>{ if(e.target===backdrop) root.innerHTML=''; });
}


// ================= Render Ejercicios =================
function renderExercises(){
  const container = root('dash-exercises');
  const exercises = dbGet('gym_exercises', []);
  container.innerHTML = '';
  exercises.forEach(ex=>{
    const el = document.createElement('div');
    el.className='card-plan';
    el.innerHTML = `
      <div class="plan-info">
        <h3>${ex.name}</h3>
        <p class="micro">${ex.desc||''}</p>
      </div>
      <div style="display:flex; gap:6px; flex-direction:column;">
        <button class="btn btn-ghost" onclick="openExerciseDetail('${ex.id}')">Ver</button>
        <button class="btn btn-primary" onclick="deleteExercise('${ex.id}')">Eliminar</button>
      </div>
    `;
    container.appendChild(el);
  });
}

// ================= Plan Actions =================
function editPlan(id){
  const plans = dbGet('gym_plans', []);
  const plan = plans.find(p=>p.id===id);
  if(!plan) return alert('Plan no encontrado');
  openPlanForm(plan);
}

function deletePlan(id){
  showConfirmModal('¿Eliminar plan?', function(){
    const plans = dbGet('gym_plans', []).filter(p=>p.id!==id);
    dbSet('gym_plans', plans);
    renderPlans(); 
    renderMetrics(); 
    renderBookings();
  });
}

// ================= Modal Agregar/Editar Plan =================
function openPlanForm(plan=null){
  const root = document.getElementById('modals-root'); root.innerHTML='';
  const backdrop = document.createElement('div'); backdrop.className='modal-backdrop';
  const modal = document.createElement('div'); modal.className='modal';
  modal.innerHTML = `
    <h3 style="color:var(--red); margin-top:0">${plan?'Editar Plan':'Agregar Plan'}</h3>
    <div class="form-row">
      <input id="plan-name" class="input" placeholder="Nombre" value="${plan?.name||''}" />
      <input id="plan-price" class="input" placeholder="Precio" value="${plan?.price||''}" />
      <input id="plan-slots" class="input" placeholder="Cupos" value="${plan?.slots||''}" />
      <textarea id="plan-desc" class="input" placeholder="Descripción" rows="2">${plan?.desc||''}</textarea>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-primary" id="plan-save">Guardar</button>
        <button class="btn btn-ghost" id="plan-cancel">Cancelar</button>
      </div>
    </div>
  `;
  backdrop.appendChild(modal); root.appendChild(backdrop);

  document.getElementById('plan-cancel').onclick = ()=>root.innerHTML='';
  document.getElementById('plan-save').onclick = ()=>{
    const n = document.getElementById('plan-name').value.trim();
    const pr = parseInt(document.getElementById('plan-price').value)||0;
    const sl = parseInt(document.getElementById('plan-slots').value)||0;
    const ds = document.getElementById('plan-desc').value.trim();
    if(!n) return alert('Nombre requerido');

    let plans = dbGet('gym_plans', []);
    if(plan){
      const idx = plans.findIndex(p => p.id===plan.id);
      plans[idx] = { ...plans[idx], name:n, price:pr, slots:sl, desc:ds };
    } else {
      plans.unshift({ id:'p'+Date.now(), name:n, price:pr, slots:sl, desc:ds });
    }
    dbSet('gym_plans', plans);
    root.innerHTML='';
    renderPlans(); renderMetrics(); renderBookings();
  };

  backdrop.addEventListener('click', e=>{ if(e.target===backdrop) root.innerHTML=''; });
}

// ================= Reservas Actions =================
function toggleBookingStatus(id){
  const bookings = dbGet('gym_bookings', []);
  const b = bookings.find(x=>x.id===id);
  if(!b) return;
  b.status = b.status==='pendiente'?'completado':'pendiente';
  dbSet('gym_bookings', bookings);
  renderBookings();
}

function deleteBooking(id){
  showConfirmModal('¿Eliminar reserva?', ()=>{
    const bookings = dbGet('gym_bookings', []).filter(b=>b.id!==id);
    dbSet('gym_bookings', bookings);
    renderBookings();
    renderMetrics();
    renderPlans();
  });
}

// ================= Quick Buy (Agregar Alumno) =================
function quickBuy(planId){
  const name = prompt('Nombre del alumno');
  const email = prompt('Email del alumno');
  if(!name||!email) return;
  let bookings = dbGet('gym_bookings', []);
  bookings.unshift({ id:'b'+Date.now(), planId, name, email, status:'pendiente' });
  dbSet('gym_bookings', bookings);
  renderBookings();
  renderMetrics();
  renderPlans();
}

// ================= Ejercicios Actions =================
function openExerciseForm(exercise=null){
  const root=document.getElementById('modals-root'); root.innerHTML='';
  const backdrop=document.createElement('div'); backdrop.className='modal-backdrop';
  const modal=document.createElement('div'); modal.className='modal';
  modal.innerHTML=`
    <h3 style="color:var(--red)">${exercise?'Editar Ejercicio':'Nuevo Ejercicio'}</h3>
    <input id="ex-name" class="input" placeholder="Nombre del ejercicio" value="${exercise?.name||''}" />
    <textarea id="ex-desc" class="input" placeholder="Descripción" rows="2">${exercise?.desc||''}</textarea>
    <div style="margin-top:10px; display:flex; gap:8px;">
      <button class="btn btn-primary" id="ex-save">Guardar</button>
      <button class="btn btn-ghost" id="ex-cancel">Cancelar</button>
    </div>
  `;
  backdrop.appendChild(modal); root.appendChild(backdrop);

  document.getElementById('ex-cancel').onclick = ()=>root.innerHTML='';
  document.getElementById('ex-save').onclick = ()=>{
    const name = document.getElementById('ex-name').value.trim();
    const desc = document.getElementById('ex-desc').value.trim();
    if(!name) return alert('Nombre requerido');

    let exercises = dbGet('gym_exercises', []);
    if(exercise){
      const idx = exercises.findIndex(e=>e.id===exercise.id);
      exercises[idx] = {...exercises[idx], name, desc};
    } else {
      exercises.unshift({id:'ex'+Date.now(), name, desc, records:[]});
    }
    dbSet('gym_exercises', exercises);
    root.innerHTML='';
    renderExercises();
  };

  backdrop.addEventListener('click', e=>{ if(e.target===backdrop) root.innerHTML=''; });
}

function openExerciseDetail(id){
  const exercises = dbGet('gym_exercises', []);
  const ex = exercises.find(e=>e.id===id);
  if(!ex) return;
  const root=document.getElementById('modals-root'); root.innerHTML='';
  const backdrop=document.createElement('div'); backdrop.className='modal-backdrop';
  const modal=document.createElement('div'); modal.className='modal'; modal.style.maxWidth='600px';

  modal.innerHTML=`
    <h3 style="color:var(--red)">${ex.name}</h3>
    <p class="micro">${ex.desc||''}</p>
    <div id="ex-records" style="max-height:200px; overflow:auto; margin-bottom:10px;">
      ${(ex.records||[]).map((r,i)=>`
        <div style="border-bottom:1px solid rgba(255,255,255,0.05); padding:6px 0; display:flex; justify-content:space-between; align-items:center;">
          <span><strong>${r.student}</strong> - ${r.weight} kg (${r.date})</span>
          <button class="btn btn-ghost btn-sm" onclick="openRecordEditModal('${ex.id}', ${i})">Editar</button>
        </div>
      `).join('')||'<div class="micro">Sin registros</div>'}
    </div>
    <input id="rec-student" class="input" placeholder="Alumno" />
    <input id="rec-weight" class="input" placeholder="Peso (kg)" type="number"/>
    <div style="margin-top:10px; display:flex; gap:8px;">
      <button class="btn btn-primary" id="rec-save">Registrar</button>
      <button class="btn btn-ghost" id="rec-close">Cerrar</button>
    </div>
  `;
  backdrop.appendChild(modal); root.appendChild(backdrop);

  document.getElementById('rec-close').onclick=()=>root.innerHTML='';

  document.getElementById('rec-save').onclick=()=>{
    const student=document.getElementById('rec-student').value.trim();
    const weight=parseFloat(document.getElementById('rec-weight').value);
    if(!student||!weight) return alert('Datos requeridos');

    ex.records=ex.records||[];
    ex.records.push({student, weight, date:new Date().toLocaleDateString()});
    const idx = exercises.findIndex(e=>e.id===ex.id);
    exercises[idx] = ex;
    dbSet('gym_exercises', exercises);
    openExerciseDetail(id);
  };

  backdrop.addEventListener('click', e=>{ if(e.target===backdrop) root.innerHTML=''; });
}

function openRecordEditModal(exId, recordIndex){
  const exercises = dbGet('gym_exercises', []);
  const ex = exercises.find(e=>e.id===exId);
  if(!ex) return;
  const record = ex.records[recordIndex];
  if(!record) return;

  const root=document.getElementById('modals-root'); root.innerHTML='';
  const backdrop=document.createElement('div'); backdrop.className='modal-backdrop';
  const modal=document.createElement('div'); modal.className='modal';
  modal.style.maxWidth="400px";

  modal.innerHTML=`
    <h3 style="color:var(--red)">Editar registro de ${record.student}</h3>
    <input id="rec-weight" class="input" placeholder="Peso (kg)" type="number" value="${record.weight}"/>
    <div style="margin-top:10px; display:flex; gap:8px;">
      <button class="btn btn-primary" id="rec-update">Actualizar</button>
      <button class="btn btn-ghost" id="rec-cancel">Cancelar</button>
    </div>
  `;
  backdrop.appendChild(modal); root.appendChild(backdrop);

  document.getElementById('rec-cancel').onclick=()=>openExerciseDetail(exId);

  document.getElementById('rec-update').onclick=()=>{
    const weight=parseFloat(document.getElementById('rec-weight').value);
    if(!weight) return alert('Peso requerido');
    ex.records[recordIndex].weight = weight;
    const idx = exercises.findIndex(e=>e.id===ex.id);
    exercises[idx] = ex;
    dbSet('gym_exercises', exercises);
    openExerciseDetail(exId);
  };

  backdrop.addEventListener('click', e=>{ if(e.target===backdrop) root.innerHTML=''; });
}

function deleteExercise(id){
  showConfirmModal('¿Eliminar ejercicio?', function(){
    const exercises = dbGet('gym_exercises', []).filter(ex=>ex.id!==id);
    dbSet('gym_exercises', exercises);
    renderExercises();
  });
}

// ================= Confirm Modal =================
function showConfirmModal(msg, cb){
  const root=document.getElementById('modals-root'); root.innerHTML='';
  const backdrop=document.createElement('div'); backdrop.className='modal-backdrop';
  const modal=document.createElement('div'); modal.className='modal';
  modal.innerHTML=`
    <h3 style="color:var(--red); margin-top:0">${msg}</h3>
    <div style="display:flex; gap:8px; margin-top:10px;">
      <button class="btn btn-primary" id="conf-yes">Sí</button>
      <button class="btn btn-ghost" id="conf-no">No</button>
    </div>
  `;
  backdrop.appendChild(modal); root.appendChild(backdrop);
  document.getElementById('conf-no').onclick=()=>root.innerHTML='';
  document.getElementById('conf-yes').onclick=()=>{
    cb(); root.innerHTML='';
  };
  backdrop.addEventListener('click', e=>{ if(e.target===backdrop) root.innerHTML=''; });
}

// ================= Inicialización =================
renderMetrics();
renderPlans();
renderBookings();
renderExercises();


