/* GoNfly Admin Studio
 * Configure a Supabase project and apply supabase-schema.sql before use.
 * Only the Supabase anon/publishable key belongs in browser code; never put a service-role key here.
 */
(() => {
  const SUPABASE_URL = "https://jhyykuecimynewkhvkzi.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_S19JBZII2pLGUXVBPRxVhg_YQzqvbVM";
  const configured = /^https:\/\//.test(SUPABASE_URL) && !SUPABASE_URL.includes("YOUR_") && !SUPABASE_ANON_KEY.includes("YOUR_");
  const $ = id => document.getElementById(id);
  let client = null, missions = [], currentView = "missions";
  const currency = n => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(n)||0);
  const escapeHtml = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const statusLabel = s => ({draft:"Draft",review:"In review",approved:"Approved"}[s]||"Draft");
  const statusClass = s => ({draft:"draft",review:"review",approved:"approved"}[s]||"draft");
  const showMessage = (id,msg,ok=false) => { const el=$(id); el.textContent=msg; el.className="form-message"+(ok?" ok":""); };
  function initClient(){ if(configured && window.supabase) client=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY); }
  function setView(view){ currentView=view; ["missions","editor","workflow"].forEach(v=>$(v+"View").classList.toggle("hidden",v!==view)); document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.view===view)); $("pageTitle").textContent=({missions:"Visa missions",editor:$("missionId").value?"Edit mission":"Mission editor",workflow:"Review & publish"})[view]; if(view==="workflow")renderWorkflow(); }
  async function loadMissions(){ if(!client)return; const {data,error}=await client.from("visa_missions").select("*").order("updated_at",{ascending:false}); if(error){showMessage("loginMessage","Could not load missions: "+error.message);return;} missions=data||[]; renderRows(); }
  function renderRows(){ const q=$("searchInput").value.toLowerCase(), status=$("statusFilter").value; const filtered=missions.filter(m=>(m.country+" "+m.visa_type+" "+m.slug).toLowerCase().includes(q)&&(status==="all"||m.status===status)); $("totalStat").textContent=missions.length; $("draftStat").textContent=missions.filter(m=>m.status==="draft"||m.status==="review").length; $("approvedStat").textContent=missions.filter(m=>m.status==="approved").length;
    $("missionRows").innerHTML=filtered.length?filtered.map(m=>{const price=total(m.pricing);return `<tr><td><div class="country-cell"><span class="country-icon">${escapeHtml((m.country||"?").slice(0,1).toUpperCase())}</span><div>${escapeHtml(m.country)}<small>/visa/${escapeHtml(m.slug)}</small></div></div></td><td>${escapeHtml(m.visa_type)}</td><td>${escapeHtml(m.processing_time||"—")}</td><td><strong>${currency(price)}</strong></td><td><span class="status ${statusClass(m.status)}">${statusLabel(m.status)}</span></td><td><button class="row-action" data-edit="${escapeHtml(m.id)}">Edit ↗</button></td></tr>`}).join(""):'<tr><td colspan="6" class="empty">No missions found. Create your first mission.</td></tr>';
    $("missionRows").querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>editMission(b.dataset.edit)));
    renderWorkflow();
  }
  function total(p={}){return ["visa_fee","service_fee","verification_fee","convenience_fee","other_fee"].reduce((s,k)=>s+(Number(p[k])||0),0);}
  function pricingFromForm(){return {visa_fee:+$("visaFee").value||0,service_fee:+$("serviceFee").value||0,verification_fee:+$("verifyFee").value||0,convenience_fee:+$("convenienceFee").value||0,other_fee:+$("otherFee").value||0};}
  function updateTotals(){const n=total(pricingFromForm());$("totalPrice").textContent=currency(n);$("railPrice").textContent=currency(n);}
  function splitLines(s){return s.split("\n").map(x=>x.trim()).filter(Boolean);}
  function formData(){return {country:$("country").value.trim(),slug:$("slug").value.trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-|-$/g,""),visa_type:$("visaType").value.trim(),processing_time:$("processing").value.trim(),entry_type:$("entryType").value,validity:$("validity").value.trim(),permitted_stay:$("stay").value.trim(),description:$("description").value.trim(),pricing:pricingFromForm(),documents:splitLines($("documents").value),notes:$("notes").value.trim(),image_url:$("imageUrl").value.trim(),status:$("missionStatus").value};}
  function canEditMissions(){ return ["admin","editor"].includes(window.gonflyAdminRole); }
  function applyRolePermissions(){
    const canEdit=canEditMissions();
    $("newMissionBtn").classList.toggle("hidden",!canEdit);
    $("restoreBtn")?.classList.toggle("hidden",!canEdit);
    document.querySelectorAll('.nav[data-view="editor"]').forEach(b=>b.classList.toggle("hidden",!canEdit));
    $("missionForm").querySelectorAll("input:not([type=hidden]),select,textarea,button[type=submit]").forEach(el=>{el.disabled=!canEdit;});
    if(!canEdit) $("saveMessage").textContent="Read-only access: your role can review mission details but cannot edit or restore data.";
  }
  function openNew(){ if(!canEditMissions()){showMessage("loginMessage","Your account has read-only access to GoNfly Admin.");return;} $("missionForm").reset();$("missionId").value="";["visaFee","serviceFee","verifyFee","convenienceFee","otherFee"].forEach(id=>$(id).value=0);$("missionStatus").value="draft";$("editorStatus").textContent="NEW DRAFT";$("imagePreview").innerHTML="<span>Image preview will appear here</span>";updateTotals();setView("editor"); }
  function editMission(id){const m=missions.find(x=>x.id===id);if(!m)return; $("missionId").value=m.id;$("country").value=m.country||"";$("slug").value=m.slug||"";$("visaType").value=m.visa_type||"";$("processing").value=m.processing_time||"";$("entryType").value=m.entry_type||"Single Entry";$("validity").value=m.validity||"";$("stay").value=m.permitted_stay||"";$("description").value=m.description||"";const p=m.pricing||{};$("visaFee").value=p.visa_fee||0;$("serviceFee").value=p.service_fee||0;$("verifyFee").value=p.verification_fee||0;$("convenienceFee").value=p.convenience_fee||0;$("otherFee").value=p.other_fee||0;$("documents").value=(m.documents||[]).join("\n");$("notes").value=m.notes||"";$("imageUrl").value=m.image_url||"";$("missionStatus").value=m.status||"draft";$("editorStatus").textContent=statusLabel(m.status).toUpperCase();showImage();updateTotals();setView("editor");}
  async function saveMission(e){e.preventDefault();if(!canEditMissions()){showMessage("saveMessage","Read-only access: only admins and editors can save mission changes.");return;}if(!client){showMessage("saveMessage","Connect Supabase first. This form will not save data locally or simulate a secure backend.");return;}const data=formData();const priceErrors=validatePrices(data.pricing);if(priceErrors.length){showMessage("saveMessage",priceErrors.join(" "));return;}if(!data.country.trim()||!data.visa_type.trim()){showMessage("saveMessage","Country and visa product name are required.");return;}if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)){showMessage("saveMessage","URL slug must use lowercase letters, numbers and hyphens.");return;}if(data.status==="approved"&&(!data.processing_time||!data.validity||!data.permitted_stay||!data.documents.length)){showMessage("saveMessage","Before approval, add processing time, validity, permitted stay and document requirements.");return;}if(!data.slug){showMessage("saveMessage","Please provide a valid URL slug.");return;}const id=$("missionId").value;const result=id?await client.from("visa_missions").update(data).eq("id",id).select().single():await client.from("visa_missions").insert(data).select().single();if(result.error){showMessage("saveMessage","Save failed: "+result.error.message);return;}showMessage("saveMessage","Mission saved securely.",true);await recordAudit(id?"mission_updated":"mission_created",data.country,{slug:data.slug,status:data.status});await loadMissions();if(result.data){$("missionId").value=result.data.id;$("editorStatus").textContent=statusLabel(result.data.status).toUpperCase();}}
  function showImage(){const url=$("imageUrl").value.trim();$("imagePreview").innerHTML=url?'<img alt="Destination image preview" src="'+escapeHtml(url)+'" referrerpolicy="no-referrer">':"<span>Image preview will appear here</span>";}
  function preview(){const d=formData(),image=d.image_url;const modal=$("previewModal");$("previewTitle").textContent=d.country||"Mission preview";$("previewContent").innerHTML='<div class="preview-hero" '+(image?'style="background-image:url(\''+escapeHtml(image)+'\')"':'')+'><div class="eyebrow">GONFLY VISA SERVICES</div><h3>'+escapeHtml(d.country||"Destination")+' Visa</h3><p>'+escapeHtml(d.description||d.visa_type||"Visa assistance for your journey.")+'</p></div><div class="preview-body"><div class="preview-tags"><span>'+escapeHtml(d.visa_type||"Visa type")+'</span><span>'+escapeHtml(d.processing_time||"Processing time TBC")+'</span><span>'+escapeHtml(d.entry_type)+'</span><span>Validity: '+escapeHtml(d.validity||"TBC")+'</span></div><div class="preview-price">'+currency(total(d.pricing))+'</div><div class="muted">Indicative total · Confirm fees before publishing</div><h4>Pricing breakdown</h4><ul>'+[['Visa fee',d.pricing.visa_fee],['Service fee',d.pricing.service_fee],['Verification fee',d.pricing.verification_fee],['Convenience fee',d.pricing.convenience_fee],['Other fee / tax',d.pricing.other_fee]].filter(x=>x[1]>0).map(x=>'<li>'+escapeHtml(x[0])+': '+currency(x[1])+'</li>').join("")+'</ul><h4>Required documents</h4><ul>'+(d.documents.length?d.documents.map(x=>'<li>'+escapeHtml(x)+'</li>').join(""):'<li>Requirements not entered yet.</li>')+'</ul>'+(d.notes?'<h4>Important notes</h4><p>'+escapeHtml(d.notes)+'</p>':'')+'</div>';$("previewModal").classList.remove("hidden");}
  function renderWorkflow(){const rows=missions.filter(m=>m.status==="approved");$("workflowRows").innerHTML=rows.length?rows.map(m=>'<tr><td><strong>'+escapeHtml(m.country)+'</strong></td><td>'+escapeHtml(m.visa_type)+'</td><td>'+currency(total(m.pricing))+'</td><td><span class="status approved">Approved</span></td><td><button class="row-action" data-edit="'+escapeHtml(m.id)+'">Review ↗</button></td></tr>').join(""):'<tr><td colspan="5" class="empty">No approved missions yet.</td></tr>'; $("workflowRows").querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>editMission(b.dataset.edit)));}
  async function login(e){e.preventDefault();if(!configured||!client){showMessage("loginMessage","Setup required: add your Supabase project URL and anon/publishable key in admin.js, then apply supabase-schema.sql.");return;}showMessage("loginMessage","Signing in…");const {error}=await client.auth.signInWithPassword({email:$("email").value,password:$("password").value});if(error){showMessage("loginMessage","Sign-in failed. Check your credentials or account access.");return;}await showApp();}
  function showLoginPanel(panel){
    $("loginForm").classList.toggle("hidden",panel!=="login");
    $("forgotPasswordBtn").classList.toggle("hidden",panel!=="login");
    $("resetRequestForm").classList.toggle("hidden",panel!=="request");
    $("newPasswordForm").classList.toggle("hidden",panel!=="newPassword");
    $("loginFootnote").classList.toggle("hidden",panel!=="login");
    if(panel!=="login") $("loginView").classList.remove("hidden");
    $("appView").classList.add("hidden");
  }
  async function requestPasswordReset(e){
    e.preventDefault();
    if(!client){showMessage("resetRequestMessage","Authentication is not configured.");return;}
    const email=$("resetEmail").value.trim();
    showMessage("resetRequestMessage","Sending recovery email…");
    const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+window.location.pathname});
    if(error){showMessage("resetRequestMessage","Could not send the reset email. Please try again or contact the administrator.");return;}
    showMessage("resetRequestMessage","If an account exists for this email, a password-reset link has been sent. Check your inbox and spam folder.",true);
  }
  async function saveNewPassword(e){
    e.preventDefault();
    const password=$("newPassword").value, confirm=$("confirmPassword").value;
    if(password.length<8){showMessage("newPasswordMessage","Use at least 8 characters.");return;}
    if(password!==confirm){showMessage("newPasswordMessage","The passwords do not match.");return;}
    showMessage("newPasswordMessage","Updating password…");
    const {data,error}=await client.auth.updateUser({password});
    if(error){showMessage("newPasswordMessage","The reset session is invalid or expired. Request a new reset email and use the newest link.");return;}
    await client.auth.signOut();
    $("newPasswordForm").reset();
    showLoginPanel("login");
    showMessage("loginMessage","Password updated successfully. Sign in with your new password.",true);
  }
  async function showApp(){const {data}=await client.auth.getSession();if(!data.session){$("loginView").classList.remove("hidden");$("appView").classList.add("hidden");return;}if(!(await assertProvisionedRole())){$("loginView").classList.remove("hidden");$("appView").classList.add("hidden");return;} applyRolePermissions(); $("loginView").classList.add("hidden");$("appView").classList.remove("hidden");await loadMissions();}
  async function logout(){if(client)await client.auth.signOut();$("appView").classList.add("hidden");$("loginView").classList.remove("hidden");}

  async function assertProvisionedRole(){
    const {data:{user}}=await client.auth.getUser();
    if(!user) return false;
    const {data,error}=await client.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
    if(error || !data || !["admin","editor","reviewer"].includes(data.role)){
      await client.auth.signOut();
      showMessage("loginMessage","This account has not been provisioned for GoNfly Admin.");
      return false;
    }
    window.gonflyAdminRole=data.role;
    window.gonflyAdminUser=user;
    return true;
  }
  function validatePrices(p){
    const errors=[];
    Object.entries(p).forEach(([key,val])=>{
      if(!Number.isInteger(Number(val)) || Number(val)<0 || Number(val)>10000000) errors.push("Fee components must be whole INR amounts between ₹0 and ₹1,00,00,000.");
    });
    return [...new Set(errors)];
  }
  async function recordAudit(action,label,details){
    const user=window.gonflyAdminUser;
    if(!user)return;
    const {error}=await client.from("admin_audit_log").insert({actor_id:user.id,action,entity_label:label||"",details:details||{}});
    if(error)console.warn("Audit event not recorded:",error.message);
  }
  async function exportBackup(){
    const {data,error}=await client.from("visa_missions").select("*").order("country");
    if(error){alert("Backup failed: "+error.message);return;}
    const payload={format:"gonfly-admin-backup",version:1,created_at:new Date().toISOString(),missions:data||[]};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));
    const a=document.createElement("a");a.href=url;a.download="gonfly-backup-"+new Date().toISOString().slice(0,10)+".json";a.click();URL.revokeObjectURL(url);
    await recordAudit("backup_exported","JSON backup",{count:payload.missions.length});
  }
  function checkBackup(payload){
    const errors=[];
    if(!payload||payload.format!=="gonfly-admin-backup"||payload.version!==1||!Array.isArray(payload.missions))return ["Invalid or unsupported backup file."];
    if(payload.missions.length>5000)return ["Maximum backup size is 5,000 missions."];
    const slugs=new Set();
    payload.missions.forEach((m,i)=>{
      const n=i+1;
      if(!m||typeof m!=="object"){errors.push("Record "+n+" is invalid.");return;}
      if(!String(m.country||"").trim())errors.push("Record "+n+": country is required.");
      if(!String(m.visa_type||"").trim())errors.push("Record "+n+": visa type is required.");
      if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(m.slug||""))errors.push("Record "+n+": invalid URL slug.");
      if(slugs.has(m.slug))errors.push("Record "+n+": duplicate slug in backup.");slugs.add(m.slug);
      if(!["draft","review","approved"].includes(m.status))errors.push("Record "+n+": invalid status.");
      ["visa_fee","service_fee","verification_fee","convenience_fee","other_fee"].forEach(k=>{const v=Number((m.pricing||{})[k]||0);if(!Number.isInteger(v)||v<0||v>10000000)errors.push("Record "+n+": invalid "+k+".");});
    });
    return errors.slice(0,80);
  }
  async function importBackup(file){
    if(!canEditMissions()){alert("Read-only access: only admins and editors can restore backups.");return;}
    if(!file)return;
    if(!confirm("Restore this backup? Matching URL slugs will be updated; new slugs will be added. Export a fresh backup first."))return;
    try{
      const payload=JSON.parse(await file.text()),errors=checkBackup(payload);
      if(errors.length){alert("Backup validation failed:\n"+errors.join("\n"));return;}
      const {data:existing,error:fetchError}=await client.from("visa_missions").select("id,slug");
      if(fetchError){alert("Could not check existing missions: "+fetchError.message);return;}
      const bySlug=new Map((existing||[]).map(m=>[m.slug,m.id]));let added=0,updated=0;
      for(const m of payload.missions){
        const row={country:m.country.trim(),slug:m.slug,visa_type:m.visa_type.trim(),processing_time:m.processing_time||"",entry_type:m.entry_type||"Single Entry",validity:m.validity||"",permitted_stay:m.permitted_stay||"",description:m.description||"",pricing:m.pricing||{},documents:Array.isArray(m.documents)?m.documents:[],notes:m.notes||"",image_url:m.image_url||"",status:m.status||"draft"};
        const id=bySlug.get(row.slug);
        const result=id?await client.from("visa_missions").update(row).eq("id",id):await client.from("visa_missions").insert(row);
        if(result.error){alert("Restore stopped after "+(added+updated)+" records. "+result.error.message);return;}
        if(id)updated++;else added++;
      }
      await recordAudit("backup_restored","JSON restore",{added:added,updated:updated,source_created_at:payload.created_at});
      await loadMissions();alert("Restore complete. Added: "+added+"; updated: "+updated+".");
    }catch(e){alert("Unable to read backup: "+e.message);}
  }

  document.addEventListener("DOMContentLoaded",()=>{initClient();if(!configured){$("configNotice").classList.remove("hidden");}else{$("configNotice").classList.add("hidden");} $("loginForm").addEventListener("submit",login);$("forgotPasswordBtn").addEventListener("click",()=>{ $("resetEmail").value=$("email").value;showLoginPanel("request");});$("backToLoginBtn").addEventListener("click",()=>showLoginPanel("login"));$("resetRequestForm").addEventListener("submit",requestPasswordReset);$("newPasswordForm").addEventListener("submit",saveNewPassword);$("logoutBtn").addEventListener("click",logout);$("newMissionBtn").addEventListener("click",openNew);$("backBtn").addEventListener("click",()=>setView("missions"));$("goMissionsBtn").addEventListener("click",()=>setView("missions"));document.querySelectorAll(".nav").forEach(b=>b.addEventListener("click",()=>b.dataset.view==="editor"?openNew():setView(b.dataset.view)));$("missionForm").addEventListener("submit",saveMission);$("backupBtn")?.addEventListener("click",exportBackup);$("restoreBtn")?.addEventListener("click",()=>$("restoreFile")?.click());$("restoreFile")?.addEventListener("change",e=>importBackup(e.target.files&&e.target.files[0]));["visaFee","serviceFee","verifyFee","convenienceFee","otherFee"].forEach(id=>$(id).addEventListener("input",updateTotals));$("imageUrl").addEventListener("input",showImage);$("previewBtn").addEventListener("click",preview);$("closePreview").addEventListener("click",()=>$("previewModal").classList.add("hidden"));$("closePreview2").addEventListener("click",()=>$("previewModal").classList.add("hidden"));$("searchInput").addEventListener("input",renderRows);$("statusFilter").addEventListener("change",renderRows);if(client){
      const recoveryHash=window.location.hash.includes("type=recovery");
      if(recoveryHash)showLoginPanel("newPassword");
      client.auth.getSession().then(({data})=>{if(window.location.hash.includes("type=recovery"))showLoginPanel("newPassword");else if(data.session)showApp();});
      client.auth.onAuthStateChange((event,session)=>{
        if(event==="PASSWORD_RECOVERY"){showLoginPanel("newPassword");}
        else if(session && event!=="SIGNED_OUT"){showApp();}
        else if(event==="SIGNED_OUT"){ $("appView").classList.add("hidden");$("loginView").classList.remove("hidden");}
      });
    }}});
})();