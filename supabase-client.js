const SUPABASE_URL = "https://yxgwkfcmsussewogaosc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_zvr4RSEtnUiWD5OvGtomgw_biYzP6vw";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
window.supabaseClient = supabaseClient;

setTimeout(() => {
  const REPORT_BUCKET = 'medical-reports';
  const PATIENT_DRAFT_KEY = 'hh_patient_draft';
  const msg = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };

  async function currentUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user || null;
  }
  async function currentPatient(userId) {
    const { data, error } = await supabaseClient.from('patients').select('*').eq('user_id', userId).limit(1).maybeSingle();
    if (error) throw error; return data || null;
  }
  async function currentProfile(userId) {
    const { data, error } = await supabaseClient.from('profiles').select('id,full_name,phone,address,role').eq('id', userId).maybeSingle();
    if (error) throw error; return data || null;
  }
  function patientForm() {
    const ta = document.querySelectorAll('#patient textarea');
    return {
      name: document.getElementById('patientName')?.value.trim() || '',
      age: document.getElementById('age')?.value || '',
      gender: document.getElementById('gender')?.value || '',
      health: ta[0]?.value.trim() || '',
      bp: document.getElementById('bp')?.value.trim() || '',
      blood: document.getElementById('blood')?.value.trim() || '',
      weight: document.getElementById('weight')?.value || '',
      height: document.getElementById('height')?.value || '',
      address: ta[1]?.value.trim() || ''
    };
  }
  function restorePatientDraft() {
    const raw = sessionStorage.getItem(PATIENT_DRAFT_KEY);
    if (!raw || !document.getElementById('patientName')) return false;
    try {
      const d = JSON.parse(raw);
      document.getElementById('patientName').value = d.name || '';
      document.getElementById('age').value = d.age || '';
      document.getElementById('gender').value = d.gender || 'নির্বাচন করুন';
      document.getElementById('bp').value = d.bp || '';
      document.getElementById('blood').value = d.blood || '';
      document.getElementById('weight').value = d.weight || '';
      document.getElementById('height').value = d.height || '';
      const ta = document.querySelectorAll('#patient textarea');
      if (ta[0]) ta[0].value = d.health || '';
      if (ta[1]) ta[1].value = d.address || '';
      return true;
    } catch (_) { sessionStorage.removeItem(PATIENT_DRAFT_KEY); return false; }
  }

  window.signUp = async function () {
    try {
      const email = document.getElementById('authEmail')?.value.trim();
      const password = document.getElementById('authPassword')?.value || '';
      if (!email || password.length < 6) { msg('authMsg', '❌ ইমেইল দিন এবং কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন।'); return; }
      const { data, error } = await supabaseClient.auth.signUp({ email, password });
      if (error) throw error;
      msg('authMsg', data.session ? '✓ অ্যাকাউন্ট তৈরি ও লগইন হয়েছে।' : '✓ অ্যাকাউন্ট তৈরি হয়েছে। ইমেইল verification প্রয়োজন হলে তা সম্পন্ন করুন।');
      if (data.session) await refreshSession(true);
    } catch (error) { msg('authMsg', '❌ ' + (error?.message || 'অ্যাকাউন্ট তৈরি করা যায়নি।')); }
  };

  window.signIn = async function () {
    try {
      const email = document.getElementById('authEmail')?.value.trim();
      const password = document.getElementById('authPassword')?.value || '';
      if (!email || !password) { msg('authMsg', '❌ ইমেইল ও পাসওয়ার্ড দিন।'); return; }
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      msg('authMsg', '✓ নিরাপদভাবে লগইন হয়েছে।');
      await refreshSession(true);
    } catch (error) { msg('authMsg', '❌ ' + (error?.message || 'লগইন করা যায়নি।')); }
  };

  window.signOutUser = async function () {
    const { error } = await supabaseClient.auth.signOut();
    msg('authMsg', error ? '❌ ' + error.message : '✓ লগআউট হয়েছে।');
    msg('sessionMsg', 'লগইন না করলে ব্যক্তিগত রোগীর তথ্য Supabase-এ সংরক্ষণ করা যাবে না।');
  };

  async function refreshSession(fromAuthPage = false) {
    const user = await currentUser();
    msg('sessionMsg', user ? '✓ লগইন করা আছে: ' + user.email : 'লগইন না করলে ব্যক্তিগত রোগীর তথ্য Supabase-এ সংরক্ষণ করা যাবে না।');
    if (!document.getElementById('patientName')) return;
    if (user) {
      if (restorePatientDraft()) {
        msg('patientMsg', '✓ আপনার আগে দেওয়া তথ্য ফিরে এসেছে। যাচাই করে “তথ্য সংরক্ষণ” চাপুন।');
      } else {
        await window.loadPatient();
      }
    }
  }
  supabaseClient.auth.onAuthStateChange((_event) => { setTimeout(() => refreshSession(false), 0); });

  window.savePatient = async function () {
    try {
      const form = patientForm();
      if (!form.name) { msg('patientMsg', '❌ রোগীর নাম দিন।'); return; }
      if (!form.age) { msg('patientMsg', '❌ বয়স দিন।'); return; }
      if (!form.health) { msg('patientMsg', '❌ স্বাস্থ্য সমস্যা লিখুন।'); return; }
      const user = await currentUser();
      if (!user) {
        sessionStorage.setItem(PATIENT_DRAFT_KEY, JSON.stringify(form));
        msg('patientMsg', '✓ তথ্য প্রস্তুত হয়েছে। এখন আলাদা “নিরাপদ লগইন” করুন; তারপর তথ্য সংরক্ষণ হবে।');
        setTimeout(() => { location.href = './patient-auth.html?return=patient'; }, 250);
        return;
      }
      const payload = {
        user_id: user.id,
        name: form.name,
        age: Number(form.age),
        address: form.address || null,
        health_condition: form.health || null,
        gender: form.gender && form.gender !== 'নির্বাচন করুন' ? form.gender : null,
        weight_kg: form.weight ? Number(form.weight) : null,
        height_cm: form.height ? Number(form.height) : null,
        blood_group: form.blood || null,
        blood_pressure: form.bp || null
      };
      const existing = await currentPatient(user.id);
      const query = existing
        ? supabaseClient.from('patients').update(payload).eq('id', existing.id).select('*').single()
        : supabaseClient.from('patients').insert(payload).select('*').single();
      const { error } = await query;
      if (error) throw error;
      sessionStorage.removeItem(PATIENT_DRAFT_KEY);
      msg('patientMsg', '✓ রোগীর তথ্য Supabase-এ সংরক্ষণ হয়েছে।');
    } catch (error) { msg('patientMsg', '❌ ' + (error?.message || 'রোগীর তথ্য সংরক্ষণ করা যায়নি।')); }
  };

  window.loadPatient = async function () {
    try {
      if (!document.getElementById('patientName')) return;
      if (restorePatientDraft()) { msg('patientMsg', '✓ আপনার আগে দেওয়া তথ্য ফিরে এসেছে। যাচাই করে “তথ্য সংরক্ষণ” চাপুন।'); return; }
      const user = await currentUser();
      if (!user) { msg('patientMsg', '❌ আগে নিরাপদ লগইন করুন।'); return; }
      const data = await currentPatient(user.id);
      if (!data) { msg('patientMsg', 'এখনও কোনো রোগীর তথ্য নেই।'); return; }
      document.getElementById('patientName').value = data.name || '';
      document.getElementById('age').value = data.age ?? '';
      document.getElementById('gender').value = data.gender || 'নির্বাচন করুন';
      document.getElementById('bp').value = data.blood_pressure || '';
      document.getElementById('blood').value = data.blood_group || '';
      document.getElementById('weight').value = data.weight_kg ?? '';
      document.getElementById('height').value = data.height_cm ?? '';
      const ta = document.querySelectorAll('#patient textarea');
      if (ta[0]) ta[0].value = data.health_condition || '';
      if (ta[1]) ta[1].value = data.address || '';
      msg('patientMsg', '✓ Supabase থেকে আগের রোগীর তথ্য পাওয়া গেছে।');
    } catch (error) { msg('patientMsg', '❌ ' + (error?.message || 'তথ্য লোড করা যায়নি।')); }
  };

  window.saveReport = async function () {
    try {
      const user = await currentUser(); if (!user) { msg('reportMsg', '❌ আগে নিরাপদ লগইন করুন।'); return; }
      const patient = await currentPatient(user.id); if (!patient) { msg('reportMsg', '❌ আগে রোগীর তথ্য সংরক্ষণ করুন।'); return; }
      const inputs = document.querySelectorAll('#report textarea');
      const reportNotes = inputs[0]?.value.trim() || '', medicineText = inputs[1]?.value.trim() || '';
      const file = document.getElementById('reportFile')?.files?.[0] || null;
      if (!reportNotes && !medicineText && !file) { msg('reportMsg', '❌ রিপোর্টের তথ্য বা ফাইল দিন।'); return; }
      let reportPath = null;
      if (file) {
        const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
        reportPath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
        const { error } = await supabaseClient.storage.from(REPORT_BUCKET).upload(reportPath, file, { contentType: file.type || 'application/octet-stream', upsert: false });
        if (error) throw error;
      }
      const { data: report, error: reportError } = await supabaseClient.from('medical_reports').insert({ patient_id: patient.id, report_title: file ? file.name : 'রোগীর রিপোর্ট', report_url: reportPath, notes: reportNotes || null }).select('id').single();
      if (reportError) throw reportError;
      if (medicineText) {
        const { error } = await supabaseClient.from('prescriptions').insert({ patient_id: patient.id, report_id: report.id, doctor_name: 'ডাক্তারের প্রেসক্রিপশন', medicines: medicineText, instructions: 'স্বাস্থ্যকর্মী/যোগ্য চিকিৎসকের যাচাই অনুযায়ী ব্যবহার করুন।' });
        if (error) throw error;
      }
      msg('reportMsg', '✓ রিপোর্ট Supabase-এ সংরক্ষণ হয়েছে।' + (medicineText ? ' প্রেসক্রিপশন রিপোর্টের সঙ্গে সংযুক্ত হয়েছে।' : '') + (file ? ' ফাইল Storage-এ রাখা হয়েছে।' : ''));
    } catch (error) { msg('reportMsg', '❌ ' + (error?.message || 'রিপোর্ট সংরক্ষণ করা যায়নি।')); }
  };

  window.loadReport = async function () {
    try {
      const user = await currentUser(); if (!user) { msg('reportMsg', '❌ আগে নিরাপদ লগইন করুন।'); return; }
      const patient = await currentPatient(user.id); if (!patient) { msg('reportMsg', '❌ রোগীর তথ্য পাওয়া যায়নি।'); return; }
      const { data: reports, error: re } = await supabaseClient.from('medical_reports').select('id,report_title,report_url,notes,created_at').eq('patient_id', patient.id).order('created_at', { ascending: false }).limit(10);
      if (re) throw re;
      const { data: prescriptions, error: pe } = await supabaseClient.from('prescriptions').select('id,report_id,doctor_name,medicines,instructions,created_at').eq('patient_id', patient.id).order('created_at', { ascending: false }).limit(10);
      if (pe) throw pe;
      const inputs = document.querySelectorAll('#report textarea');
      if (reports?.[0]?.notes) inputs[0].value = reports[0].notes;
      if (prescriptions?.[0]?.medicines) inputs[1].value = prescriptions[0].medicines;
      msg('reportMsg', `✓ ${reports?.length || 0}টি রিপোর্ট, ${prescriptions?.length || 0}টি প্রেসক্রিপশন পাওয়া গেছে; ${prescriptions?.filter(p => p.report_id).length || 0}টি রিপোর্টের সঙ্গে সংযুক্ত।`);
    } catch (error) { msg('reportMsg', '❌ ' + (error?.message || 'তথ্য লোড করা যায়নি।')); }
  };

  window.requestDelivery = async function () {
    try {
      const user = await currentUser(); if (!user) { msg('deliveryMsg', '❌ আগে নিরাপদ লগইন করুন।'); return; }
      const address = document.getElementById('deliveryAddress')?.value.trim() || '';
      const name = document.getElementById('deliveryName')?.value.trim() || '';
      const medicine = document.getElementById('deliveryMedicine')?.value.trim() || '';
      if (!name || !address || !medicine) { msg('deliveryMsg', '❌ নাম, ঠিকানা ও ওষুধের তথ্য পূরণ করুন।'); return; }
      const patient = await currentPatient(user.id); if (!patient) { msg('deliveryMsg', '❌ আগে রোগীর তথ্য সংরক্ষণ করুন।'); return; }
      const profile = await currentProfile(user.id);
      const { data: prescription, error: pe } = await supabaseClient.from('prescriptions').select('id').eq('patient_id', patient.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (pe) throw pe;
      if (!prescription) { msg('deliveryMsg', '❌ আগে রিপোর্ট/প্রেসক্রিপশন সংরক্ষণ করুন, তারপর ডেলিভারি অনুরোধ করুন।'); return; }
      const { error } = await supabaseClient.from('deliveries').insert({ patient_id: patient.id, prescription_id: prescription.id, status: 'pending', delivery_address: address, delivery_phone: profile?.phone || null });
      if (error) throw error;
      msg('deliveryMsg', '✓ ডেলিভারি অনুরোধ Supabase-এ জমা হয়েছে এবং সর্বশেষ প্রেসক্রিপশনের সঙ্গে যুক্ত হয়েছে।');
    } catch (error) { msg('deliveryMsg', '❌ ' + (error?.message || 'ডেলিভারি অনুরোধ জমা হয়নি।')); }
  };

  window.loadAssignedDeliveries = async function () {
    const user = await currentUser(); if (!user) return { data: [], error: new Error('আগে লগইন করুন।') };
    const profile = await currentProfile(user.id); if (profile?.role !== 'delivery') return { data: [], error: new Error('শুধু অনুমোদিত ডেলিভারি কর্মীর জন্য।') };
    return await supabaseClient.from('deliveries').select('id,status,delivery_address,delivery_phone,prescription_id,patient_id,created_at,updated_at').eq('assigned_to', user.id).order('created_at', { ascending: false });
  };
  window.updateAssignedDeliveryStatus = async function (deliveryId, status) {
    if (!['assigned','out_for_delivery','delivered','cancelled'].includes(status)) throw new Error('অবৈধ delivery status');
    const user = await currentUser(); if (!user) throw new Error('আগে লগইন করুন।');
    const profile = await currentProfile(user.id); if (profile?.role !== 'delivery') throw new Error('শুধু অনুমোদিত ডেলিভারি কর্মী status পরিবর্তন করতে পারবেন।');
    const { data, error } = await supabaseClient.from('deliveries').update({ status }).eq('id', deliveryId).eq('assigned_to', user.id).select('id,status').single();
    if (error) throw error; return data;
  };

  if (document.getElementById('patientName')) {
    setTimeout(() => { if (location.hash === '#patient') { const card = document.querySelector('[onclick="show(\'patient\')"]'); if (card) card.click(); } }, 50);
    restorePatientDraft();
  }
  refreshSession(false);
}, 0);