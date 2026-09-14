# Home Healthcare — Authentication + Backend Connection (বাংলা)

এই নথি Production Authentication ও Backend সংযোগের প্রস্তুতি হিসেবে রাখা হয়েছে।

## Authentication

ব্যবহারকারীর role হবে:
- `patient`
- `health_worker`
- `delivery_worker`
- `admin`

### নিরাপত্তা নিয়ম
1. Private patient/medical data দেখতে authentication বাধ্যতামূলক।
2. Role authorization অবশ্যই server-side যাচাই হবে।
3. Patient কেবল নিজের profile, care record ও delivery request-এর অনুমোদিত তথ্য পাবে।
4. Health worker/admin প্রয়োজন অনুযায়ী medical information পাবে।
5. Delivery worker কেবল approved delivery-এর নাম, ফোন, ঠিকানা ও delivery items পাবে; diagnosis/report/অপ্রয়োজনীয় medical data পাবে না।
6. Password, service-role key, API secret বা token GitHub repository-তে রাখা যাবে না।

## Backend connection contract

Frontend থেকে production API URL configuration-এর মাধ্যমে দেওয়া হবে; source code-এ secret রাখা হবে না।

প্রস্তাবিত endpoint group:
- `POST /auth/register`
- `POST /auth/login`
- `GET /me`
- `GET /patients/me`
- `PUT /patients/me`
- `GET /care-records`
- `GET /medical-reports`
- `GET /medicines`
- `POST /delivery-requests`
- `GET /delivery-requests`
- `PATCH /delivery-requests/:id/status`
- `GET /chat/messages`
- `POST /chat/messages`
- `GET /emergency-contacts`

## Connection states

Frontend-এ তিনটি পরিষ্কার অবস্থা থাকবে:
- **প্রস্তুত:** API URL configured এবং backend reachable।
- **সংযোগ নেই:** backend এখনো configured/reachable নয়; ব্যবহারকারীকে ভুলভাবে successful service দেখানো যাবে না।
- **Authentication required:** private তথ্যের আগে login/session যাচাই হবে।

## Production provider

Production database/auth provider এখনো credentials দিয়ে সংযুক্ত করা হয়নি। তাই এই ধাপে নিরাপদ contract ও configuration প্রস্তুত করা হচ্ছে; connected/production backend হিসেবে দাবি করা হবে না। Provider credentials পাওয়ার পর একই contract অনুযায়ী সংযোগ করা যাবে।

## Medical safety

AI Live Chat কেবল প্রাথমিক তথ্য ও নিরাপদ নির্দেশনা দেবে। Diagnosis বা চিকিৎসার চূড়ান্ত সিদ্ধান্ত qualified healthcare professional-এর মাধ্যমে হবে। জরুরি অবস্থায় emergency/health worker escalation থাকবে।
