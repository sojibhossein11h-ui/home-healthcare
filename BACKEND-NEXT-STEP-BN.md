# Home Healthcare — Backend পরবর্তী কাজ

এই নথিটি বর্তমান প্রকল্পের আসল Backend সংযোগের প্রস্তুতি পরিষ্কারভাবে ধরে রাখার জন্য।

## বর্তমান অবস্থা
- GitHub Pages/PWA ভিত্তি আছে।
- Delivery request এখনো browser `localStorage`-এ থাকে; এটি real server workflow নয়।
- `BACKEND-PLAN-BN.md`-তে নিরাপদ workflow নির্ধারিত হয়েছে।

## পরবর্তী বাস্তব Backend workflow
1. রোগী delivery request পাঠাবে।
2. Backend request-টি `pending` হিসেবে সংরক্ষণ করবে।
3. অনুমোদিত health worker request দেখে প্রয়োজনীয় তথ্য যাচাই করবে।
4. অনুমোদন হলে status হবে `approved`।
5. Delivery team শুধু delivery-এর জন্য প্রয়োজনীয় তথ্য দেখবে।
6. Delivery সম্পন্ন হলে status হবে `delivered`।

## নিরাপত্তা
- Patient health information public করা যাবে না।
- Role-based access দরকার: patient, health worker, delivery worker, admin।
- Frontend-এ কোনো service-role/private secret রাখা যাবে না।
- Delivery worker-এর access হবে least-privilege ভিত্তিতে।

## গুরুত্বপূর্ণ সীমা
শুধু GitHub Pages দিয়ে এই secure backend workflow তৈরি করা যায় না। একটি managed backend/database এবং authentication service সংযোগ করতে হবে। Backend service-এর credentials/secret পাওয়া ছাড়া এই ধাপকে সম্পন্ন বলা হবে না।

## এই commit-এর অর্থ
এই ফাইলটি শুধু পরবর্তী implementation-এর স্পষ্ট নির্দেশনা হিসেবে যোগ করা হয়েছে। এটি নিজে Backend সংযোগ নয়।
