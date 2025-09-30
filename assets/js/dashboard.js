 // ----- DB Helpers -----
  function dbGet(k, fallback){ 
    try{ 
      const r=localStorage.getItem(k); 
      return r? JSON.parse(r): fallback 
    }catch(e){ return fallback } 
  }
  function dbSet(k,v){ localStorage.setItem(k, JSON.stringify(v)) }

  // ----- Inicialización DB -----
  const DEFAULT_PLANS = [
    { id:'p1', name:'Mensual - Básico', price:19900, slots:30, desc:'Acceso libre al gym por 1 mes' },
    { id:'p2', name:'3 Meses - Popular', price:49900, slots:18, desc:'Mejor precio y 1 clase incluida/mes' },
    { id:'p3', name:'Anual - Premium', price:149900, slots:6, desc:'Acceso ilimitado + 2 sesiones PT/mes' }
  ];

  if(!dbGet('gym_plans')) dbSet('gym_plans', DEFAULT_PLANS);
  if(!dbGet('gym_bookings')) dbSet('gym_bookings', []);

  // ----- Helpers -----
  const money = v => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(v);
  const root = id => document.getElementById(id);

  // ----- Render Métricas -----
  function renderMetrics(){
    const metrics = root('dash-metrics');
    const plans = dbGet('gym_plans', []);
    const bookings = dbGet('gym_bookings', []);
    const totalSlots = plans.reduce((acc,p)=>acc+(p.slots||0),0);
    const totalClients = bookings.length;

    metrics.innerHTML = `
      <div class="hero-card" style="flex:1; min-width:120px; text-align:center">
        <strong>Total Clientes</strong>
        <div style="font-size:20px; font-weight:700; color:var(--red)">${totalClients}</div>
      </div>
      <div class="hero-card" style="flex:1; min-width:120px; text-align:center">
        <strong>Planes Disponibles</strong>
        <div style="font-size:20px; font-weight:700; color:var(--red)">${plans.length}</div>
      </div>
      <div class="hero-card" style="flex:1; min-width:120px; text-align:center">
        <strong>Cupos Totales</strong>
        <div style="font-size:20px; font-weight:700; color:var(--red)">${totalSlots}</div>
      </div>
    `;
  }

  // ----- Render Plans con alumnos y cupos -----
  function renderPlans(){
    const list = root('plans-list'); list.innerHTML='';
    const plans = dbGet('gym_plans', []);
    const bookings = dbGet('gym_bookings', []);

    plans.forEach(p=>{
      const enrolled = bookings.filter(b=>b.planId===p.id).length;
      const remainingSlots = Math.max(0, (p.slots||0) - enrolled);

      const el = document.createElement('div'); 
      el.className='card-plan'; 
      el.setAttribute('role','listitem');
      el.innerHTML = `
        <div class="plan-info">
          <h3>${p.name}</h3>
          <p class="micro">${p.desc}</p>
        </div>
        <div class="plan-meta">
          <div class="price">${money(p.price)}</div>
          <div class="micro">Cupos restantes: <strong>${remainingSlots}</strong></div>
          <div class="micro">Alumnos inscritos: <strong>${enrolled}</strong></div>
          <div style="margin-top:10px; display:flex; gap:8px; justify-content:flex-end">
            <button class="btn btn-primary" onclick="quickBuy('${p.id}')">Agregar alumno</button>
          </div>
        </div>
      `;
      list.appendChild(el);
    });
  }

  // ----- Booking / Modales -----
  function openModal(type, data){
    const root = document.getElementById('modals-root'); root.innerHTML='';
    const backdrop = document.createElement('div'); backdrop.className='modal-backdrop';
    const modal = document.createElement('div'); modal.className='modal';

    if(type==='book'){
      modal.innerHTML = `
        <h3 style="color:var(--red); margin-top:0">Agregar Alumno</h3>
        <div class="form-row">
          <label class="micro">Plan</label>
          <select id="book-plan" class="input"></select>
          <input id="book-name" class="input" placeholder="Nombre del alumno" />
          <input id="book-email" class="input" placeholder="Correo" />
          <div style="display:flex; gap:8px">
            <button class="btn btn-primary" id="btn-send">Confirmar</button>
            <button class="btn btn-ghost" id="btn-cancel">Cancelar</button>
          </div>
        </div>
      `;
      backdrop.appendChild(modal); root.appendChild(backdrop);

      const sel = document.getElementById('book-plan'); 
      const plans = dbGet('gym_plans', []);
      plans.forEach(p=>{ 
        const o = document.createElement('option'); 
        o.value=p.id; 
        o.textContent=`${p.name} — ${money(p.price)} (${p.slots} cupos)`; 
        sel.appendChild(o) 
      });

      document.getElementById('btn-cancel').onclick = ()=>root.innerHTML='';
      document.getElementById('btn-send').onclick = function(){
        const pid = sel.value;
        const name = document.getElementById('book-name').value.trim();
        const email = document.getElementById('book-email').value.trim();
        if(!name||!email) return alert('Completa nombre y correo');

        const bookings = dbGet('gym_bookings', []);
        bookings.unshift({ id:'b'+Date.now(), planId:pid, name, email, created:new Date().toISOString(), status:'pendiente' });
        dbSet('gym_bookings', bookings);

        renderPlans(); 
        renderMetrics();
        alert('Alumno agregado'); 
        root.innerHTML='';
      }
    }

    backdrop.addEventListener('click', e=>{ if(e.target===backdrop) root.innerHTML=''; });
  }

  function quickBuy(planId){ 
    openModal('book'); 
    setTimeout(()=>{ document.getElementById('book-plan').value = planId; },50);
    setTimeout(()=>{ document.getElementById('book-name').focus(); },150);
  }

  // ----- Inicialización -----
  renderPlans();
  renderMetrics();
  document.getElementById('year').textContent = new Date().getFullYear();



























// ======= DB Helpers =======
function dbGet(k, fallback){ 
  try{ 
    const r=localStorage.getItem(k); 
    return r ? JSON.parse(r) : fallback 
  }catch(e){ 
    return fallback 
  } 
}

function dbSet(k,v){ 
  localStorage.setItem(k, JSON.stringify(v)) 
}

// Inicializar DB si no existe
if(!dbGet('gym_plans')) dbSet('gym_plans', []);
if(!dbGet('gym_bookings')) dbSet('gym_bookings', []);

// ======= Render Métricas =======
function renderMetrics(){
  const metrics = document.getElementById('dash-metrics');
  const plans = dbGet('gym_plans', []);
  const bookings = dbGet('gym_bookings', []);
  const totalSlots = plans.reduce((acc,p)=>acc+(p.slots||0),0);
  const totalClientes = bookings.length;

  metrics.innerHTML = `
    <div class="hero-card" style="flex:1; min-width:120px; text-align:center">
      <strong>Total Clientes</strong>
      <div style="font-size:20px; font-weight:700; color:var(--red)">${totalClientes}</div>
    </div>
    <div class="hero-card" style="flex:1; min-width:120px; text-align:center">
      <strong>Planes Disponibles</strong>
      <div style="font-size:20px; font-weight:700; color:var(--red)">${plans.length}</div>
    </div>
    <div class="hero-card" style="flex:1; min-width:120px; text-align:center">
      <strong>Cupos Totales</strong>
      <div style="font-size:20px; font-weight:700; color:var(--red)">${totalSlots}</div>
    </div>
  `;
}

// ======= Render Planes =======
function renderPlans(){
  const container = document.getElementById('dash-plans');
  const plans = dbGet('gym_plans', []);
  container.innerHTML = '';
  plans.forEach(p=>{
    const el = document.createElement('div'); 
    el.className='card-plan';
    el.innerHTML = `
      <div class="plan-info">
        <h3>${p.name}</h3>
        <p class="micro">${p.desc}</p>
        <div class="micro">Precio: ${new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP'}).format(p.price)} | Cupos: ${p.slots}</div>
      </div>
      <div style="display:flex; gap:6px; flex-direction:column;">
        <button class="btn btn-ghost" onclick="editPlan('${p.id}')">Editar</button>
        <button class="btn btn-primary" onclick="deletePlan('${p.id}')">Eliminar</button>
      </div>
    `;
    container.appendChild(el);
  });
}

// ======= Render Reservas =======
function renderBookings(){
  const container = document.getElementById('dash-bookings');
  const bookings = dbGet('gym_bookings', []);
  const plans = dbGet('gym_plans', []);
  container.innerHTML = bookings.map(b=>{
    const plan = plans.find(p=>p.id===b.planId);
    return `
      <div style="padding:8px;border-bottom:1px solid rgba(255,255,255,0.03); display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong>${b.name}</strong> (${b.email})<br>
          <span class="micro">Plan: ${plan?.name||'--'} | Estado: ${b.status}</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:4px;">
          <button class="btn btn-ghost" onclick="toggleBookingStatus('${b.id}')">Cambiar Estado</button>
          <button class="btn btn-primary" onclick="deleteBooking('${b.id}')">Eliminar</button>
        </div>
      </div>
    `
  }).join('') || '<div class="micro">Sin reservas</div>';
}

// ======= Plan Actions =======
function editPlan(id){
  const plans = dbGet('gym_plans', []);
  const plan = plans.find(p=>p.id===id);
  if(!plan) return alert('Plan no encontrado');
  openPlanForm(plan);
}

function deletePlan(id){
  if(!confirm('Eliminar plan?')) return;
  const plans = dbGet('gym_plans', []).filter(p=>p.id!==id);
  dbSet('gym_plans', plans);
  renderPlans(); renderMetrics(); renderBookings();
}

// ======= Modal para agregar/editar plan =======
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

  // ✅ Guardar plan editado o nuevo
  document.getElementById('plan-save').onclick = ()=>{
    const n = document.getElementById('plan-name').value.trim();
    const pr = parseInt(document.getElementById('plan-price').value)||0;
    const sl = parseInt(document.getElementById('plan-slots').value)||0;
    const ds = document.getElementById('plan-desc').value.trim();
    if(!n) return alert('Nombre requerido');

    let plans = dbGet('gym_plans', []);

    if(plan){
      // actualizar plan dentro del array completo
      plans = plans.map(p=>{
        if(p.id===plan.id){
          return { ...p, name: n, price: pr, slots: sl, desc: ds };
        }
        return p;
      });
    } else {
      plans.unshift({ id:'p'+Date.now(), name:n, price:pr, slots:sl, desc:ds });
    }

    dbSet('gym_plans', plans);
    root.innerHTML='';
    renderPlans(); renderMetrics(); renderBookings();
  };

  backdrop.addEventListener('click', e=>{ if(e.target===backdrop) root.innerHTML=''; });
}

// ======= Reservas Actions =======
function deleteBooking(id){
  if(!confirm('Eliminar reserva?')) return;
  const bookings = dbGet('gym_bookings', []);
  const b = bookings.find(x=>x.id===id);
  if(b){
    const plans = dbGet('gym_plans', []);
    const plan = plans.find(p=>p.id===b.planId);
    if(plan) plan.slots = (plan.slots||0) + 1;
    dbSet('gym_plans', plans);
  }
  const updatedBookings = bookings.filter(bk=>bk.id!==id);
  dbSet('gym_bookings', updatedBookings);
  renderBookings(); renderMetrics(); renderPlans();
}

function toggleBookingStatus(id){
  const bookings = dbGet('gym_bookings', []);
  const b = bookings.find(x=>x.id===id);
  if(!b) return;
  b.status = b.status==='pendiente'?'completado':'pendiente';
  dbSet('gym_bookings', bookings);
  renderBookings();
}

// ======= Inicialización =======
renderMetrics();
renderPlans();
renderBookings();
document.getElementById('year').textContent = new Date().getFullYear();


































































// ======= DB Helpers =======
function dbGet(k, fallback){ 
  try{ 
    const r=localStorage.getItem(k); 
    return r ? JSON.parse(r) : fallback 
  }catch(e){ 
    return fallback 
  } 
}

function dbSet(k,v){ 
  localStorage.setItem(k, JSON.stringify(v)) 
}

// Inicializar DB si no existe
if(!dbGet('gym_plans')) dbSet('gym_plans', []);
if(!dbGet('gym_bookings')) dbSet('gym_bookings', []);
if(!dbGet('gym_exercises')) dbSet('gym_exercises', []);

// ======= Render Métricas =======
function renderMetrics(){
  const metrics = document.getElementById('dash-metrics');
  const plans = dbGet('gym_plans', []);
  const bookings = dbGet('gym_bookings', []);
  const totalSlots = plans.reduce((acc,p)=>acc+(p.slots||0),0);
  const totalClientes = bookings.length;

  metrics.innerHTML = `
    <div class="hero-card" style="flex:1; min-width:120px; text-align:center">
      <strong>Total Alumnos</strong>
      <div style="font-size:20px; font-weight:700; color:var(--red)">${totalClientes}</div>
    </div>
        <div class="hero-card" style="flex:1; min-width:120px; text-align:center">
      <strong>Cupos Disponible</strong>
      <div style="font-size:20px; font-weight:700; color:var(--red)">${totalSlots}</div>
    </div>
    <div class="hero-card" style="flex:1; min-width:120px; text-align:center">
      <strong>Planes</strong>
      <div style="font-size:20px; font-weight:700; color:var(--red)">${plans.length}</div>
    </div>
  `;
}     

// ======= Render Planes =======
function renderPlans(){
  const container = document.getElementById('dash-plans');
  const plans = dbGet('gym_plans', []);
  container.innerHTML = '';
  plans.forEach(p=>{
    const el = document.createElement('div'); 
    el.className='card-plan';
    el.innerHTML = `
      <div class="plan-info">
        <h3>${p.name}</h3>
        <p class="micro">${p.desc}</p>
        <div class="micro">Precio: ${new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP'}).format(p.price)} | Cupos: ${p.slots}</div>
      </div>
      <div style="display:flex; gap:6px; flex-direction:column;">
        <button class="btn btn-ghost" onclick="editPlan('${p.id}')">Editar</button>
        <button class="btn btn-primary" onclick="deletePlan('${p.id}')">Eliminar</button>
      </div>
    `;
    container.appendChild(el);
  });
}

// ======= Render Reservas =======
function renderBookings(){
  const container = document.getElementById('dash-bookings');
  const bookings = dbGet('gym_bookings', []);
  const plans = dbGet('gym_plans', []);
  container.innerHTML = bookings.map(b=>{
    const plan = plans.find(p=>p.id===b.planId);
    return `
      <div style="padding:8px;border-bottom:1px solid rgba(255,255,255,0.03); display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong>${b.name}</strong> (${b.email})<br>
          <span class="micro">Plan: ${plan?.name||'--'} | Estado: ${b.status}</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:4px;">
          <button class="btn btn-ghost" onclick="toggleBookingStatus('${b.id}')">Cambiar Estado</button>
          <button class="btn btn-primary" onclick="deleteBooking('${b.id}')">Eliminar</button>
        </div>
      </div>
    `
  }).join('') || '<div class="micro">Sin reservas</div>';
}

// ======= Plan Actions =======
function editPlan(id){
  const plans = dbGet('gym_plans', []);
  const plan = plans.find(p=>p.id===id);
  if(!plan) return alert('Plan no encontrado');
  openPlanForm(plan);
}

function deletePlan(id){
  if(!confirm('Eliminar plan?')) return;
  const plans = dbGet('gym_plans', []).filter(p=>p.id!==id);
  dbSet('gym_plans', plans);
  renderPlans(); renderMetrics(); renderBookings();
}

// ======= Modal para agregar/editar plan =======
function openPlanForm(plan=null){
  const root = document.getElementById('modals-root'); 
  root.innerHTML='';

  const backdrop = document.createElement('div'); 
  backdrop.className='modal-backdrop';

  const modal = document.createElement('div'); 
  modal.className='modal';
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
  backdrop.appendChild(modal); 
  root.appendChild(backdrop);

  document.getElementById('plan-cancel').onclick = ()=>root.innerHTML='';

  document.getElementById('plan-save').onclick = ()=>{
    const n = document.getElementById('plan-name').value.trim();
    const pr = parseInt(document.getElementById('plan-price').value)||0;
    const sl = parseInt(document.getElementById('plan-slots').value)||0;
    const ds = document.getElementById('plan-desc').value.trim();
    if(!n) return alert('Nombre requerido');

    let plans = dbGet('gym_plans', []);

    if(plan){
      // Buscar índice del plan a editar
      const idx = plans.findIndex(p => p.id === plan.id);
      if(idx > -1){
        plans[idx] = { ...plans[idx], name: n, price: pr, slots: sl, desc: ds };
      }
    } else {
      plans.unshift({ id:'p'+Date.now(), name:n, price:pr, slots:sl, desc:ds });
    }

    dbSet('gym_plans', plans);
    root.innerHTML='';
    renderPlans(); 
    renderMetrics(); 
    renderBookings();
  };

  backdrop.addEventListener('click', e=>{ if(e.target===backdrop) root.innerHTML=''; });
}


// ======= Reservas Actions =======
function deleteBooking(id){
  if(!confirm('Eliminar reserva?')) return;
  const bookings = dbGet('gym_bookings', []);
  const b = bookings.find(x=>x.id===id);
  if(b){
    const plans = dbGet('gym_plans', []);
    const plan = plans.find(p=>p.id===b.planId);
    if(plan) plan.slots = (plan.slots||0) + 1;
    dbSet('gym_plans', plans);
  }
  const updatedBookings = bookings.filter(bk=>bk.id!==id);
  dbSet('gym_bookings', updatedBookings);
  renderBookings(); renderMetrics(); renderPlans();
}

function toggleBookingStatus(id){
  const bookings = dbGet('gym_bookings', []);
  const b = bookings.find(x=>x.id===id);
  if(!b) return;
  b.status = b.status==='pendiente'?'completado':'pendiente';
  dbSet('gym_bookings', bookings);
  renderBookings();
}













// ======= DB Helpers =======
function dbGet(k, fallback){ 
  try{ 
    const r = localStorage.getItem(k); 
    return r ? JSON.parse(r) : fallback 
  } catch(e){ 
    return fallback 
  } 
}

function dbSet(k, v){ 
  localStorage.setItem(k, JSON.stringify(v)) 
}

// Inicializar DB si no existe
if(!dbGet('gym_exercises')) dbSet('gym_exercises', []);

// ======= Render Ejercicios =======
function renderExercises(){
  const container = document.getElementById('dash-exercises');
  const exercises = dbGet('gym_exercises', []);
  container.innerHTML = '';
  exercises.forEach(ex => {
    const el = document.createElement('div');
    el.className = 'card-plan';
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














// ======= Ejercicios =======
function renderExercises(){
  const container = document.getElementById('dash-exercises');
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

function openExerciseForm(exercise=null){
  const root = document.getElementById('modals-root'); root.innerHTML='';
  const backdrop = document.createElement('div'); backdrop.className='modal-backdrop';
  const modal = document.createElement('div'); modal.className='modal';
  modal.innerHTML = `
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
    const name=document.getElementById('ex-name').value.trim();
    const desc=document.getElementById('ex-desc').value.trim();
    if(!name) return alert('Nombre requerido');

    let exercises = dbGet('gym_exercises', []);
    if(exercise){
      exercise.name=name; 
      exercise.desc=desc;
    } else {
      exercises.unshift({id:'ex'+Date.now(), name, desc, records:[]});
    }
    dbSet('gym_exercises', exercises);
    root.innerHTML='';
    renderExercises();
  };

  backdrop.addEventListener('click', e=>{ if(e.target===backdrop) root.innerHTML=''; });
}

function deleteExercise(id){
  if(!confirm('Eliminar ejercicio?')) return;
  const exercises = dbGet('gym_exercises', []).filter(ex=>ex.id!==id);
  dbSet('gym_exercises', exercises);
  renderExercises();
}

function openExerciseDetail(id){
  const exercises=dbGet('gym_exercises',[]);
  const ex=exercises.find(e=>e.id===id);
  if(!ex) return;

  const root=document.getElementById('modals-root'); root.innerHTML='';
  const backdrop=document.createElement('div'); backdrop.className='modal-backdrop';
  const modal=document.createElement('div'); modal.className='modal';
  modal.style.maxWidth="600px";

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

    const exercises=dbGet('gym_exercises',[]);
    const idx=exercises.findIndex(e=>e.id===ex.id);
    exercises[idx]=ex;
    dbSet('gym_exercises', exercises);

    openExerciseDetail(id); // refrescar modal
  };

  backdrop.addEventListener('click', e=>{ if(e.target===backdrop) root.innerHTML=''; });
}

// ======= Editar registro existente =======
function openRecordEditModal(exId, recordIndex){
  const exercises = dbGet('gym_exercises', []);
  const ex = exercises.find(e=>e.id===exId);
  if(!ex) return;
  const record = ex.records[recordIndex];
  if(!record) return;

  // Usar mismo modal
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
    const idx=exercises.findIndex(e=>e.id===ex.id);
    exercises[idx]=ex;
    dbSet('gym_exercises', exercises);

    openExerciseDetail(exId); // refrescar modal
  };

  backdrop.addEventListener('click', e=>{ if(e.target===backdrop) root.innerHTML=''; });
}

// Inicializar
renderExercises();




// ======= Modal de confirmación personalizado =======
function showConfirmModal(message, onConfirm){
  const root = document.getElementById('modals-root'); 
  root.innerHTML='';

  const backdrop = document.createElement('div'); 
  backdrop.className='modal-backdrop';

  const modal = document.createElement('div'); 
  modal.className='modal';
  modal.innerHTML = `
    <h3 style="color:var(--red); margin-top:0">Confirmación</h3>
    <p class="micro">${message}</p>
    <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:10px;">
      <button class="btn btn-primary" id="confirm-yes">Sí</button>
      <button class="btn btn-ghost" id="confirm-no">No</button>
    </div>
  `;

  backdrop.appendChild(modal); 
  root.appendChild(backdrop);

  document.getElementById('confirm-no').onclick = ()=> root.innerHTML='';
  document.getElementById('confirm-yes').onclick = ()=>{
    root.innerHTML='';
    onConfirm(); // Ejecuta la acción de eliminación
  }

  backdrop.addEventListener('click', e => { 
    if(e.target === backdrop) root.innerHTML=''; 
  });
}

// ======= Reemplazar los confirm nativos =======
// Para eliminar plan
function deletePlan(id){
  showConfirmModal('¿Eliminar plan?', function(){
    const plans = dbGet('gym_plans', []).filter(p=>p.id!==id);
    dbSet('gym_plans', plans);
    renderPlans(); 
    renderMetrics(); 
    renderBookings();
  });
}

// Para eliminar reserva
function deleteBooking(id){
  showConfirmModal('¿Eliminar reserva?', function(){
    const bookings = dbGet('gym_bookings', []);
    const b = bookings.find(x=>x.id===id);
    if(b){
      const plans = dbGet('gym_plans', []);
      const plan = plans.find(p=>p.id===b.planId);
      if(plan) plan.slots = (plan.slots||0) + 1;
      dbSet('gym_plans', plans);
    }
    const updatedBookings = bookings.filter(bk=>bk.id!==id);
    dbSet('gym_bookings', updatedBookings);
    renderBookings(); 
    renderMetrics(); 
    renderPlans();
  });
}

// Para eliminar ejercicio
function deleteExercise(id){
  showConfirmModal('¿Eliminar ejercicio?', function(){
    const exercises = dbGet('gym_exercises', []).filter(ex=>ex.id!==id);
    dbSet('gym_exercises', exercises);
    renderExercises();
  });
}

