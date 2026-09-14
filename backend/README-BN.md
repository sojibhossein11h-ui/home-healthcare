# Home Healthcare — নিরাপদ Backend প্রস্তুতি

এই ফোল্ডারটি Home Healthcare-এর বাস্তব Backend সংযোগের জন্য নিরাপদ প্রস্তুতি।

## নির্ধারিত workflow

`pending` → স্বাস্থ্যকর্মীর যাচাই → `approved` → ডেলিভারি → `delivered`

## Role

- `patient`: নিজের অনুরোধ তৈরি/স্ট্যাটাস দেখা
- `health_worker`: প্রয়োজনীয় তথ্য যাচাই ও অনুমোদন
- `delivery_worker`: শুধু অনুমোদিত ডেলিভারির প্রয়োজনীয় তথ্য দেখা
- `admin`: সিস্টেম পরিচালনা

## Delivery data minimization

ডেলিভারি কর্মীর কাছে রোগীর রিপোর্ট, রোগের বিস্তারিত বা অন্যান্য অপ্রয়োজনীয় স্বাস্থ্যতথ্য প্রকাশ করা যাবে না। কেবল ডেলিভারির জন্য প্রয়োজনীয় নাম/যোগাযোগ/ঠিকানা/অর্ডার তথ্য server-side authorization-এর মাধ্যমে দিতে হবে।

## Security rules

- Authentication ছাড়া private patient data ফেরত দেওয়া যাবে না।
- Role-based authorization server-side প্রয়োগ করতে হবে।
- Frontend-এ service-role/private secret রাখা যাবে না।
- Client-side `localStorage` কোনো বাস্তব secure backend-এর বিকল্প নয়।
- সব sensitive request HTTPS-এর মাধ্যমে হবে।

## এখনো প্রয়োজন

বাস্তব server/database/authentication চালু করতে একটি managed backend provider এবং তার configuration/credentials প্রয়োজন। এই repository-তে কোনো private key বা secret commit করা যাবে না।

এই ফাইলটি backend architecture-এর GitHub-side প্রস্তুতি; এটিকে বাস্তব backend connection সম্পন্ন হয়েছে বলে গণ্য করা যাবে না।
