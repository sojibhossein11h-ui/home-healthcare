# Home Healthcare — Backend + Authentication + Database Integration Readiness

## বর্তমান অবস্থা

এই নথি production integration-এর শেষ প্রস্তুতি ধাপের checklist।

### Authentication
- [ ] Supabase Authentication provider/project তৈরি
- [ ] Email/phone login policy নির্ধারণ
- [ ] Role claim/authorization server-side যাচাই
- [ ] Private patient data authentication ছাড়া বন্ধ

### Database
- [x] Patient, care record, medical report, medicine, delivery, chat ও emergency schema প্রস্তুত
- [x] Delivery status workflow schema প্রস্তুত
- [x] প্রয়োজনীয় indexes প্রস্তুত
- [ ] Production Supabase project-এ schema/RLS apply ও test
- [ ] Role-based RLS policies test

### Frontend connection
- [x] Public API configuration placeholder প্রস্তুত
- [x] API adapter প্রস্তুত
- [x] Backend URL ফাঁকা রাখা হয়েছে যতক্ষণ production endpoint তৈরি না হয়
- [ ] Production HTTPS API URL বসানো
- [ ] Register/login থেকে authenticated API request test

## নিরাপত্তা বাধ্যতামূলক

- কোনো password, service-role key, private API key বা token source code/GitHub-এ রাখা যাবে না।
- Frontend-এ কেবল প্রয়োজনীয় public client configuration থাকতে পারে।
- Medical data role authorization ছাড়া ফেরত দেওয়া যাবে না।
- Delivery worker-এর response-এ diagnosis/report-এর মতো অপ্রয়োজনীয় medical data থাকবে না।
- Production connection সফলভাবে test না হওয়া পর্যন্ত UI-তে connected/successful backend দাবি করা যাবে না।

## পরবর্তী বাস্তব সংযোগ ক্রম

1. Supabase project তৈরি/নির্বাচন
2. Authentication চালু ও policy সেট
3. Database schema + RLS apply
4. Backend/API endpoint provision
5. Frontend public API URL configure
6. Register/login test
7. Patient/report/medicine/delivery/chat/emergency API test
8. Security + error-state test

**নোট:** এই repository-তে কোনো production credential যোগ করা হয়নি। Credentials প্রয়োজন হলে সেগুলো নিরাপদ environment/secret storage-এ রাখতে হবে।
