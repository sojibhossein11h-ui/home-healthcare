# Home Healthcare — Backend প্রস্তুতি

এই অংশটি বাস্তব Backend/Database/Auth সংযোগের ভিত্তি প্রস্তুত রাখার জন্য।

## মূল মডিউল
- Patient: নাম, ঠিকানা, বয়স, যোগাযোগ, স্বাস্থ্য-তথ্য
- Doctor/Health Worker: পরিচয় ও দায়িত্ব
- Reports: রোগীর রিপোর্টের রেকর্ড
- Medicines: ডাক্তার-নির্ধারিত ওষুধ ও ডেলিভারি স্ট্যাটাস
- Emergency: জরুরি ফোন ও মেসেজ সহায়তা
- AI Live Chat: প্রাথমিক তথ্য ও নিরাপদ নির্দেশনা; জরুরি/চিকিৎসাগত সিদ্ধান্তে যোগ্য স্বাস্থ্যকর্মীর কাছে রেফার
- Authentication: রোগী/স্বাস্থ্যকর্মী/অ্যাডমিন ভূমিকা অনুযায়ী নিরাপদ প্রবেশাধিকার

## পরবর্তী সংযোগ
Production database, authentication provider এবং secure server-side API যুক্ত করার আগে secret/key GitHub-এ রাখা যাবে না।
