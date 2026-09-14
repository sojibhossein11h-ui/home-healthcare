# Home Healthcare — Supabase সংযোগ

এই রিপোজিটরিতে Supabase database schema ও Row Level Security (RLS)-এর ভিত্তি যোগ করা হয়েছে।

## প্রস্তুত
- Patient profile
- Reports
- Medicines
- Delivery request ও status
- Role structure
- Patient data-এর জন্য RLS ভিত্তি

## পরের সংযোগ
1. Supabase project নির্বাচন/তৈরি
2. `backend/supabase-schema.sql` SQL Editor-এ চালানো
3. Authentication configuration করা
4. Frontend-এ শুধু public URL ও anon key ব্যবহার করা
5. Secure server-side permission check যোগ করা
6. Real patient/report/medicine/delivery flow test করা

## নিরাপত্তা
Service-role/private key কখনো frontend বা public GitHub repository-তে রাখা যাবে না। Delivery worker-কে শুধু delivery-এর প্রয়োজনীয় তথ্য দেখাতে হবে।
