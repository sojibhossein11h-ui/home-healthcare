# Home Healthcare — API Implementation Map

এই map database schema ও API contract-কে বাস্তব backend implementation-এর দিকে নেওয়ার জন্য।

| API | Method | Access | Database |
|---|---|---|---|
| `/auth/register` | POST | Public | users + provider auth |
| `/auth/login` | POST | Public | provider auth |
| `/me` | GET | Authenticated | users |
| `/patients/me` | GET/PUT | Patient | patients |
| `/care-records` | GET | Patient / health_worker / admin | care_records |
| `/medical-reports` | GET | Patient / authorized staff | medical_reports |
| `/medicines` | GET | Patient / authorized staff | medicines |
| `/delivery-requests` | POST/GET | Patient / delivery_worker / admin | delivery_requests |
| `/delivery-requests/:id/status` | PATCH | health_worker/admin/delivery_worker by status | delivery_requests |
| `/chat/messages` | GET/POST | Authenticated | chat_messages |
| `/emergency-contacts` | GET | Public | emergency_contacts |

## Request/response rules

- Client কখনো database-এ সরাসরি privileged write করবে না।
- Authentication token/session server-side যাচাই করতে হবে।
- Patient ID client পাঠালেও server session-এর সঙ্গে ownership মিলিয়ে দেখবে।
- Delivery queue-তে medical diagnosis/report পাঠানো যাবে না।
- Medical report file private storage-এ থাকবে; database-এ reference/metadata থাকবে।
- Error response-এ password, token, service key বা অন্য secret ফেরত দেওয়া যাবে না।

## বর্তমান অবস্থা

Database schema blueprint এখন repository-তে আছে। API contract-ও প্রস্তুত। Production API/auth provider credentials এখনো configured নয়, তাই এই map implementation-ready specification হিসেবে কাজ করবে।
