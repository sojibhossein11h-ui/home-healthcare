const SUPABASE_URL = "https://yxgwkfcmsussewogaosc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_zvr4RSEtnUiWD5OvGtomgw_biYzP6vw";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
window.supabaseClient = supabaseClient;

// Supabase service integration for Report → Prescription → Delivery.
// This runs after the page's existing functions are defined, so the current UI stays unchanged.
setTimeout(() => {
  const REPORT_BUCKET = 'medical-reports';

  async function currentUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user || null;
  }

  async function currentPatient(userId) {
    const { data, error } = await supabaseClient
      .from('patients')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  function reportMessage(text) {
    const el = document.getElementById('reportMsg');
    if (el) el.textContent = text;
  }

  function deliveryMessage(text) {
    const el = document.getElementById('deliveryMsg');
    if (el) el.textContent = text;
  }

  window.saveReport = async function () {
    try {
      const user = await currentUser();
      if (!user) { reportMessage('❌ আগে লগইন করুন।'); return; }

      const patient = await currentPatient(user.id);
      if (!patient) {
        reportMessage('❌ আগে রোগীর তথ্য সংরক্ষণ করুন, তারপর রিপোর্ট দিন।');
        return;
      }

      const inputs = document.querySelectorAll('#report textarea');
      const reportNotes = inputs[0]?.value.trim() || '';
      const medicineText = inputs[1]?.value.trim() || '';
      const fileInput = document.getElementById('reportFile');
      const file = fileInput?.files?.[0] || null;
      let reportPath = null;

      if (!reportNotes && !medicineText && !file) {
        reportMessage('❌ রিপোর্টের তথ্য বা ফাইল দিন।');
        return;
      }

      if (file) {
        const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
        const safeExt = ext || 'bin';
        reportPath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${safeExt}`;
        const { error: uploadError } = await supabaseClient.storage
          .from(REPORT_BUCKET)
          .upload(reportPath, file, { contentType: file.type || 'application/octet-stream', upsert: false });
        if (uploadError) throw uploadError;
      }

      const { error: reportError } = await supabaseClient.from('medical_reports').insert({
        patient_id: patient.id,
        report_title: file ? file.name : 'রোগীর রিপোর্ট',
        report_url: reportPath,
        notes: reportNotes || null
      });
      if (reportError) throw reportError;

      let prescriptionSaved = false;
      if (medicineText) {
        const { error: prescriptionError } = await supabaseClient.from('prescriptions').insert({
          patient_id: patient.id,
          doctor_name: 'ডাক্তারের প্রেসক্রিপশন',
          medicines: medicineText,
          instructions: 'স্বাস্থ্যকর্মী/যোগ্য চিকিৎসকের যাচাই অনুযায়ী ব্যবহার করুন।'
        });
        if (prescriptionError) throw prescriptionError;
        prescriptionSaved = true;
      }

      reportMessage('✓ রিপোর্ট Supabase-এ সংরক্ষণ হয়েছে।' + (prescriptionSaved ? ' প্রেসক্রিপশনও সংরক্ষণ হয়েছে।' : '') + (file ? ' ফাইলটি নিরাপদ Storage-এ রাখা হয়েছে।' : ''));
    } catch (error) {
      reportMessage('❌ ' + (error?.message || 'রিপোর্ট সংরক্ষণ করা যায়নি।'));
    }
  };

  window.loadReport = async function () {
    try {
      const user = await currentUser();
      if (!user) { reportMessage('❌ আগে লগইন করুন।'); return; }
      const patient = await currentPatient(user.id);
      if (!patient) { reportMessage('❌ রোগীর তথ্য পাওয়া যায়নি।'); return; }

      const { data: reports, error: reportError } = await supabaseClient
        .from('medical_reports')
        .select('id,report_title,report_url,notes,created_at')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (reportError) throw reportError;

      const { data: prescriptions, error: prescriptionError } = await supabaseClient
        .from('prescriptions')
        .select('id,doctor_name,medicines,instructions,created_at')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (prescriptionError) throw prescriptionError;

      const inputs = document.querySelectorAll('#report textarea');
      if (reports?.[0]?.notes) inputs[0].value = reports[0].notes;
      if (prescriptions?.[0]?.medicines) inputs[1].value = prescriptions[0].medicines;

      const reportCount = reports?.length || 0;
      const prescriptionCount = prescriptions?.length || 0;
      reportMessage(`✓ Supabase থেকে ${reportCount}টি রিপোর্ট এবং ${prescriptionCount}টি প্রেসক্রিপশনের তথ্য পাওয়া গেছে।`);
    } catch (error) {
      reportMessage('❌ ' + (error?.message || 'তথ্য লোড করা যায়নি।'));
    }
  };

  window.requestDelivery = async function () {
    try {
      const user = await currentUser();
      if (!user) { deliveryMessage('❌ ডেলিভারি অনুরোধের আগে লগইন করুন।'); return; }

      const name = document.getElementById('deliveryName')?.value.trim() || '';
      const address = document.getElementById('deliveryAddress')?.value.trim() || '';
      const medicine = document.getElementById('deliveryMedicine')?.value.trim() || '';
      if (!name || !address || !medicine) {
        deliveryMessage('❌ নাম, ঠিকানা ও ওষুধের তথ্য—তিনটিই পূরণ করুন।');
        return;
      }

      const patient = await currentPatient(user.id);
      if (!patient) {
        deliveryMessage('❌ আগে রোগীর তথ্য সংরক্ষণ করুন।');
        return;
      }

      let prescriptionId = null;
      const { data: latestPrescription, error: prescriptionError } = await supabaseClient
        .from('prescriptions')
        .select('id,medicines,created_at')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (prescriptionError) throw prescriptionError;
      if (latestPrescription) prescriptionId = latestPrescription.id;

      const { error: deliveryError } = await supabaseClient.from('deliveries').insert({
        patient_id: patient.id,
        prescription_id: prescriptionId,
        status: 'pending',
        delivery_address: address,
        delivery_phone: null
      });
      if (deliveryError) throw deliveryError;

      deliveryMessage('✓ ডেলিভারি অনুরোধ Supabase-এ জমা হয়েছে। স্বাস্থ্যকর্মী যাচাই করে পরবর্তী ব্যবস্থা নেবেন।');
    } catch (error) {
      deliveryMessage('❌ ' + (error?.message || 'ডেলিভারি অনুরোধ জমা হয়নি।'));
    }
  };

  // Fix the existing patient loader's undeclared textarea variable.
  window.loadPatient = async function () {
    const user = await currentUser();
    if (!user) return;
    const { data, error } = await supabaseClient.from('patients').select('*').eq('user_id', user.id).limit(1).maybeSingle();
    if (error) { document.getElementById('patientMsg').textContent = '❌ ' + error.message; return; }
    if (!data) { document.getElementById('patientMsg').textContent = 'এখনও কোনো রোগীর তথ্য নেই।'; return; }
    document.getElementById('name').value = data.name || '';
    document.getElementById('age').value = data.age || '';
    document.getElementById('bp').value = data.blood_pressure || '';
    document.getElementById('blood').value = data.blood_group || '';
    const ta = document.querySelectorAll('#patient textarea');
    ta[0].value = data.address || '';
    ta[1].value = data.health_condition || '';
    document.getElementById('patientMsg').textContent = '✓ Supabase থেকে আগের তথ্য পাওয়া গেছে।';
  };
}, 0);
