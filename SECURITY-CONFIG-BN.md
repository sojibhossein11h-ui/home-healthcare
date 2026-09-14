# Home Healthcare — নিরাপদ কনফিগারেশন নীতি

এই ফাইলটি Home Healthcare-এর GitHub/public code নিরাপদ রাখার জন্য রাখা হয়েছে।

## ১. GitHub-এ কী রাখা যাবে না

- Password
- Database service-role/private key
- Private API key বা secret token
- `.env` বা অন্য local secret configuration file
- `.pem`, `.key`, keystore বা credential file

`.gitignore`-এ এই ধরনের local/secret file ignore করা হয়েছে।

## ২. Frontend নিরাপত্তা

Frontend/public JavaScript-এ কোনো private secret রাখা যাবে না। Production API URL provision না হওয়া পর্যন্ত frontend API configuration ফাঁকা রাখা হয়েছে।

## ৩. Backend নিরাপত্তা

Production backend-এর private credentials hosting/backend environment variables বা secret manager-এ রাখতে হবে। GitHub-এর source code-এ real secret value commit করা যাবে না।

## ৪. Supabase

Supabase service-role/private key কখনো browser/frontend-এ দেওয়া যাবে না। Database access অবশ্যই authentication এবং Row Level Security (RLS) নীতির মাধ্যমে নিয়ন্ত্রিত হবে।

## ৫. বর্তমান অবস্থা

এই ধাপে কোনো real password, private API secret বা service-role key GitHub code-এ যোগ করা হয়নি। Backend connection-এর জন্য প্রয়োজনীয় production credential এখনো intentionally provision করা হয়নি।

## ৬. পরবর্তী ধাপ

Production backend provision হলে শুধু নিরাপদ environment configuration ব্যবহার করে API, authentication এবং database connection পরীক্ষা করা হবে। কোনো secret chat-এ পাঠানো বা source code-এ commit করার প্রয়োজন নেই।
