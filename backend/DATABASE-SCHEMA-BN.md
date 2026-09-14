# Home Healthcare — Database Schema (বাংলা)

এই স্কিমাটি Backend/Database সংযোগের জন্য নিরাপদ ভিত্তি। Production database provider ও authentication provider সংযুক্ত করার আগে এটি schema blueprint হিসেবে থাকবে।

## ১. users
- `id` — unique user id
- `role` — `patient | health_worker | delivery_worker | admin`
- `name`
- `phone`
- `created_at`
- `updated_at`

## ২. patients
- `id`
- `user_id` → users
- `address`
- `age`
- `gender`
- `blood_pressure`
- `blood_group`
- `weight_kg`
- `height_cm`
- `health_summary`
- `created_at`
- `updated_at`

**নিরাপত্তা:** patient নিজের record-ই দেখতে/পরিবর্তন করতে পারবে।

## ৩. care_records
- `id`
- `patient_id`
- `health_worker_id`
- `care_type`
- `advice`
- `created_at`

শুধু অনুমোদিত health worker/admin প্রয়োজনীয় record দেখতে পারবে।

## ৪. medical_reports
- `id`
- `patient_id`
- `report_reference`
- `report_date`
- `uploaded_at`
- `uploaded_by`

রিপোর্টের আসল ফাইল নিরাপদ private storage-এ থাকবে; public repository-তে রাখা যাবে না।

## ৫. medicines
- `id`
- `patient_id`
- `prescribed_by`
- `medicine_name`
- `dose`
- `instructions`
- `created_at`

## ৬. delivery_requests
- `id`
- `patient_id`
- `status` — `pending | approved | delivered | cancelled`
- `delivery_name`
- `delivery_phone`
- `delivery_address`
- `items`
- `approved_by`
- `approved_at`
- `delivered_at`
- `created_at`

Delivery worker কেবল approved delivery-এর প্রয়োজনীয় delivery তথ্য পাবে; medical report/diagnosis পাবে না।

## ৭. chat_messages
- `id`
- `user_id`
- `sender` — `user | ai | health_worker`
- `message`
- `created_at`

AI chat প্রাথমিক তথ্য/নির্দেশনার জন্য। জরুরি অবস্থা বা diagnosis/চিকিৎসার সিদ্ধান্তে qualified healthcare professional-এর কাছে escalation থাকবে।

## ৮. emergency_contacts
- `id`
- `label`
- `phone`
- `sms_enabled`
- `active`

## Access rules
1. Authentication ছাড়া private medical data access নয়।
2. Role authorization server-side হবে।
3. Database row-level/record-level security ব্যবহার করতে হবে।
4. API response-এ প্রয়োজনের অতিরিক্ত sensitive medical data পাঠানো যাবে না।
5. কোনো password, service-role key বা private secret GitHub-এ commit করা যাবে না।
6. Production connection না হওয়া পর্যন্ত এই schema-কে connected database হিসেবে দাবি করা যাবে না।
