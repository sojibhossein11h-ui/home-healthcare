# Home Healthcare — Backend API Contract

এই নকশাটি বাস্তব Backend/Database/Auth সংযোগের আগে নির্ধারিত নিরাপদ API contract। Provider নির্বাচন ও server credentials না পাওয়া পর্যন্ত এটি scaffold হিসেবে থাকবে।

## Authentication

সব private endpoint-এ authenticated user এবং server-side role authorization বাধ্যতামূলক। Frontend-এ কোনো service-role/private secret রাখা যাবে না।

## Roles

`patient` — নিজের delivery request তৈরি ও নিজের status দেখা।

`health_worker` — pending request যাচাই, প্রয়োজনীয় তথ্য সংশোধন/অনুমোদন।

`delivery_worker` — কেবল approved delivery-এর প্রয়োজনীয় delivery তথ্য দেখা এবং delivered হিসেবে update করা।

`admin` — user/role এবং system management।

## Delivery request

প্রস্তাবিত fields:

- `id`
- `patient_id`
- `status`: `pending | approved | delivered | cancelled`
- `delivery_name`
- `delivery_phone`
- `delivery_address`
- `items`
- `created_at`
- `approved_at`
- `delivered_at`
- `approved_by`

রোগীর medical report, diagnosis বা অন্যান্য sensitive health data delivery response-এ থাকবে না।

## Endpoint contract

### Create request
`POST /api/delivery-requests`

Patient authentication প্রয়োজন। নতুন request-এর status server নিজে `pending` করবে। Client যেন নিজে `approved` বা `delivered` সেট করতে না পারে।

### Approve request
`POST /api/delivery-requests/{id}/approve`

শুধু `health_worker` বা অনুমোদিত `admin`। Server-side authorization বাধ্যতামূলক।

### Delivery queue
`GET /api/delivery-requests/approved`

শুধু `delivery_worker`। Response-এ delivery-এর জন্য প্রয়োজনীয় তথ্য থাকবে; medical details থাকবে না।

### Mark delivered
`POST /api/delivery-requests/{id}/delivered`

শুধু assigned/authorized `delivery_worker` বা `admin`। Server timestamp ব্যবহার করবে।

## Database security

Database row-level/record-level authorization ব্যবহার করতে হবে, যাতে একজন patient অন্য patient-এর data পড়তে না পারে এবং delivery worker approved delivery ছাড়া অন্য sensitive record দেখতে না পারে।

## Secrets

Provider URL/client public configuration থাকলেও privileged key server-side environment secret হিসেবে রাখতে হবে। কোনো `.env` secret GitHub repository-তে commit করা যাবে না।

## বাস্তব সংযোগের blocker

এই contract বাস্তব server নয়। বাস্তব backend চালু করতে managed database + authentication provider এবং তার configuration প্রয়োজন। Provider credentials ছাড়া production backend connected হয়েছে বলা যাবে না।
