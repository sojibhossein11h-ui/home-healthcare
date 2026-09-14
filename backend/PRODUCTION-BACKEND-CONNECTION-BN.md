# Home Healthcare — Production Backend সংযোগ প্রস্তুতি

## নির্ধারিত provider

Production backend-এর জন্য **Supabase** নির্ধারণ করা হয়েছে। এটি PostgreSQL database, authentication এবং row-level security একসঙ্গে দেওয়ার কারণে বর্তমান Home Healthcare schema/API পরিকল্পনার সঙ্গে মানানসই।

## এই ধাপে যা প্রস্তুত হয়েছে

- `backend/database/schema.sql` — database schema blueprint
- `backend/API-CONTRACT-BN.md` — API contract ও role rules
- `backend/API-IMPLEMENTATION-MAP-BN.md` — endpoint-to-database mapping
- `api-config.js` — frontend-এর public API configuration placeholder

## এখনো production connection নয়

এই repository-তে কোনো Supabase project URL, anon/public key, database password বা service-role key রাখা হয়নি। তাই এই মুহূর্তে production database/auth connected হয়েছে—এমন দাবি করা যাবে না।

## প্রয়োজনীয় production configuration

Supabase project তৈরি হলে শুধু এই দুইটি **public client value** frontend-এ বসবে:

- Project URL
- Publishable/anon client key

**Service-role key কখনো frontend বা GitHub repository-তে রাখা যাবে না।**

## Security checklist

1. Database tables-এ Row Level Security (RLS) চালু করতে হবে।
2. Patient নিজের record ছাড়া অন্য রোগীর private data দেখতে পারবে না।
3. Health worker/admin ছাড়া medical approval করা যাবে না।
4. Delivery worker কেবল approved delivery-এর প্রয়োজনীয় তথ্য পাবে; medical report/অপ্রয়োজনীয় স্বাস্থ্যতথ্য নয়।
5. Authentication ছাড়া private API/data access বন্ধ থাকবে।
6. Production secrets server-side environment/secret storage-এ থাকবে।

## পরের বাস্তব ধাপ

Supabase project এবং authentication/database configuration তৈরি করার পর frontend-এর `api-config.js`-এ public configuration বসিয়ে API calls চালু করতে হবে। তারপর register/login → patient data → reports/medicines → delivery request → chat/emergency flow একে একে live API-তে নেওয়া হবে।
