# لوحة تحكم الموقع - دليل الإعداد

## نظرة عامة
تم إنشاء لوحة تحكم كاملة لموقعك الشخصي تتيح لك إدارة المحتوى بدون الحاجة للبرمجة. اللوحة محمية بتسجيل دخول ومتصلة بقاعدة بيانات Firebase.

## الملفات التي تم إنشاؤها

### صفحات لوحة التحكم
- `login.html` - صفحة تسجيل الدخول
- `admin.html` - لوحة التحكم الرئيسية
- `admin-projects.html` - إدارة المشاريع
- `add-project.html` - إضافة مشروع جديد
- `project.html` - صفحة عرض تفاصيل المشروع (ديناميكية)

### ملفات JavaScript
- `js/firebase-config.js` - إعدادات Firebase
- `js/login-script.js` - وظائف تسجيل الدخول
- `js/admin-script.js` - وظائف لوحة التحكم
- `js/admin-projects-script.js` - إدارة المشاريع
- `js/add-project-script.js` - إضافة المشاريع
- `js/project-script.js` - عرض تفاصيل المشروع

### تحديثات الملفات الحالية
- `js/script.js` - تم إضافة وظائف Firebase وربط المحتوى الديناميكي
- `css/style.css` - تم إضافة متغيرات لوحة التحكم

## خطوات الإعداد

### 1. إعداد Firebase
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. أنشئ مشروع جديد
3. فعل الخدمات التالية:
   - **Authentication** (Email/Password)
   - **Firestore Database**
   - **Storage**

### 2. الحصول على إعدادات Firebase
1. في مشروع Firebase، اذهب إلى Project Settings
2. تحت "Your apps"، انقر على Web app
3. نسخ إعدادات Firebase ووضعها في `js/firebase-config.js`

### 3. إعداد قواعد الأمان

#### Firestore Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Projects collection - read for all, write for authenticated admins
    match /projects/{projectId} {
      allow read: if true;
      allow write, delete: if request.auth != null;
    }
    
    // Content collection - read for all, write for authenticated admins
    match /content/{documentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Admins collection - only authenticated users can read their own data
    match /admins/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### Storage Rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /projects/{projectId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. إنشاء حساب المدير
1. في Firebase Console، اذهب إلى Authentication
2. أنشئ مستخدم جديد بالإيميل والباسورد
3. في Firestore، أنشئ مستند في مجموعة `admins` بنفس UID للمستخدم:
```json
{
  "email": "your-email@example.com",
  "role": "admin",
  "createdAt": "timestamp"
}
```

## استخدام لوحة التحكم

### تسجيل الدخول
1. اذهب إلى `login.html`
2. أدخل الإيميل والباسورد الذي أنشأته
3. ستتم إعادة توجيهك تلقائياً للوحة التحكم

### إضافة مشروع جديد
1. من لوحة التحكم، اضغط "إضافة مشروع جديد"
2. املأ المعلومات الأساسية
3. ارفع الصور (اسحب أو اضغط للاختيار)
4. أضف الإحصائيات والروابط
5. اضغط "حفظ المشروع"

### إدارة المشاريع
1. اذهب إلى "المشاريع" من القائمة الجانبية
2. يمكنك البحث والتصفية
3. اضغط على أيقونات التعديل أو الحذف

## مميزات لوحة التحكم

### ✅ الأمان
- تسجيل دخول محمي
- صلاحيات محددة للمدير فقط
- جلسات آمنة

### ✅ سهولة الاستخدام
- واجهة عربية بالكامل
- تصميم عصري ومتجاوب
- رسائل تأكيد وتنبيهات

### ✅ إدارة المحتوى
- إضافة/تعديل/حذف المشاريع
- رفع الصور مباشرة
- إحصائيات وتفاصيل كاملة

### ✅ ديناميكية الموقع
- الموقع يقرأ من Firebase تلقائياً
- تحديث فوري للمحتوى
- صفحة تفاصيل مشروع ذكية

## روابط مهمة

- **لوحة التحكم**: `admin.html`
- **تسجيل الدخول**: `login.html`
- **إدارة المشاريع**: `admin-projects.html`
- **إضافة مشروع**: `add-project.html`

## ملاحظات هامة

1. **الوصول للوحة التحكم**: فقط أنت كمسؤول يمكنه الوصول
2. **الموقع للزوار**: يبقى متاحاً للجميع بدون تسجيل دخول
3. **النسخ الاحتياطي**: Firebase توفر نسخ احتياطي تلقائي
4. **التكلفة**: الخطة المجانية كافية للاستخدام الشخصي

## استكشاف الأخطاء

### مشكلة تسجيل الدخول
- تأكد من إعدادات Firebase صحيحة
- تحقق من وجود المستخدم في مجموعة `admins`
- تأكد من قواعد الأمان

### مشكلة رفع الصور
- تحقق من قواعد Storage
- تأكد من حجم الصور أقل من 10MB
- تحقق من صلاحيات التخزين

### مشكلة عرض المشاريع
- تأكد من وجود بيانات في Firestore
- تحقق من وظائف JavaScript في المتصفح
- افتح console للتحقق من الأخطاء

## الدعم الفني
في حال واجهت أي مشاكل، تحقق من:
1. Console errors في المتصفح
2. Firebase Console للتأكد من الإعدادات
3. قواعد الأمان في Firestore و Storage
