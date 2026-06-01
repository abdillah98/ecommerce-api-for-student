# Spesifikasi Perangkat Lunak - Ecommerce API

Dokumen ini berisi spesifikasi teknis lengkap untuk proyek **Ecommerce API**, sebuah sistem backend yang dirancang khusus untuk memfasilitasi kebutuhan e-commerce multi-tenant. Setiap entitas dan operasi API di-scope berdasarkan `projectId` untuk memastikan isolasi data antar tim/proyek mahasiswa.

---

## 1. Penjelasan Proyek

Ecommerce API adalah platform backend berbasis RESTful API yang melayani transaksi e-commerce dasar seperti manajemen produk, kategori produk, keranjang belanja (cart), metode pembayaran (payment method), serta transaksi pembelian (checkout).

Sistem ini mendukung arsitektur **multi-tenant berbasis project**. Artinya:
- Setiap tim mahasiswa terdaftar sebagai entitas **Project**.
- Setiap **User** (Customer/Admin) harus terdaftar di dalam suatu Project tertentu.
- Data seperti **Kategori**, **Produk**, **Keranjang**, **Metode Pembayaran**, dan **Pembelian** diisolasi menggunakan kunci asing (`project_id`). Pengguna dari Project A tidak dapat membaca atau memodifikasi data dari Project B.

### Arsitektur Teknis
- **Runtime**: Node.js dengan TypeScript.
- **Framework Web**: Express (v5).
- **ORM**: Drizzle ORM (untuk interaksi database type-safe).
- **Database**: MySQL.
- **Autentikasi**: JSON Web Token (JWT) dengan hashing password menggunakan `bcrypt`.
- **Keamanan**: Helmet (untuk proteksi HTTP headers), CORS, dan Morgan (untuk logging request).

### 🌐 Server Production (Live Online)
Backend API ini telah di-deploy secara resmi dan dapat diakses secara publik pada URL produksi berikut:
**`https://shop.tandurkarya.com`**

> [!NOTE]
> Mahasiswa dapat langsung menguji aplikasi mobile Android/iOS menggunakan server production ini tanpa perlu menjalankan backend secara lokal pada komputer masing-masing.

---

## 2. Cara Setup & Menjalankan Proyek Secara Lokal

### Prasyarat
Pastikan Anda sudah menginstal:
- [Node.js](https://nodejs.org/) (versi 18 ke atas direkomendasikan)
- npm atau yarn

### Langkah-Langkah

1. **Clone Proyek & Masuk ke Direktori**
   ```bash
   cd ecommerce-api
   ```

2. **Instalasi Dependencies**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable**
   Buat file `.env` di root direktori dan sesuaikan konfigurasinya:
   ```env
   PORT=3000
   DATABASE_URL=mysql://username:password@host:port/database
   JWT_SECRET=super_secret_key_untuk_ecommerce_api_2026
   ```

4. **Menjalankan Migrasi Database**
   Drizzle Kit digunakan untuk mengelola skema database MySQL.
   ```bash
   # Membuat file migrasi baru (jika ada perubahan skema)
   npm run generate

   # Menerapkan migrasi ke database MySQL
   npm run migrate
   ```

5. **Menjalankan Server dalam Mode Development**
   ```bash
   npm run dev
   ```
   Server lokal akan berjalan di `http://localhost:3000`.

---

## 3. Entitas Database & Skema

Sistem ini mendefinisikan 8 tabel utama di dalam database MySQL:

### A. Projects (`projects`)
Menyimpan informasi kelompok atau proyek mahasiswa.
- `id` (Integer, Primary Key, Auto Increment)
- `project_title` (Text, Not Null)
- `project_description` (Text, Nullable)
- `project_class` (Text, Not Null)
- `project_team` (JSON/TEXT, Not Null, berisi nama & NIM anggota tim)
- `created_at` (Timestamp, Default `now()`)

### B. Users (`users`)
Menyimpan data pengguna yang melakukan registrasi.
- `id` (Integer, Primary Key, Auto Increment)
- `project_id` (Integer, references `projects.id`)
- `name` (Text, Not Null)
- `email` (Text, Not Null, Unique)
- `password` (Text, Not Null)
- `role` (Text, Default `customer`)
- `created_at` (Timestamp, Default `now()`)

### C. Categories (`categories`)
Kategori klasifikasi produk untuk setiap project.
- `id` (Integer, Primary Key, Auto Increment)
- `project_id` (Integer, references `projects.id`)
- `category_name` (Text, Not Null)
- `created_at` (Timestamp, Default `now()`)

### D. Products (`products`)
Menyimpan data barang/produk yang dijual.
- `id` (Integer, Primary Key, Auto Increment)
- `project_id` (Integer, references `projects.id`)
- `category_id` (Integer, references `categories.id`, Nullable)
- `product_name` (Text, Not Null)
- `product_description` (Text, Nullable)
- `product_price` (Real, Not Null)
- `product_stock` (Integer, Default 0)
- `product_image` (Text, Nullable)
- `created_at` (Timestamp, Default `now()`)

### E. Carts (`carts`)
Keranjang belanja dinamis milik setiap user.
- `id` (Integer, Primary Key, Auto Increment)
- `project_id` (Integer, references `projects.id`)
- `user_id` (Integer, references `users.id`)
- `product_id` (Integer, references `products.id`)
- `quantity` (Integer, Default 1)
- `created_at` (Timestamp, Default `now()`)

### F. Payment Methods (`payment_methods`)
Menyimpan opsi metode pembayaran yang tersedia di bawah masing-masing project.
- `id` (Integer, Primary Key, Auto Increment)
- `project_id` (Integer, references `projects.id`)
- `name` (Text, Not Null)
- `type` (Text, Not Null) -- Harus bernilai `'wallet'` atau `'bank'`
- `logo_url` (Text, Nullable)
- `created_at` (Timestamp, Default `now()`)

### G. Purchases (`purchases`)
Transaksi pembelian/order yang dilakukan oleh user.
- `id` (Integer, Primary Key, Auto Increment)
- `project_id` (Integer, references `projects.id`)
- `user_id` (Integer, references `users.id`)
- `total_price` (Real, Not Null)
- `status` (Text, Default `pending`)
- `address` (Text, Not Null) -- Alamat pengiriman barang
- `payment_method_id` (Integer, references `payment_methods.id`) -- Metode pembayaran yang dipilih
- `created_at` (Timestamp, Default `now()`)

### H. Purchase Items (`purchase_items`)
Detail item produk dari transaksi pembelian (Snapshot harga saat transaksi).
- `id` (Integer, Primary Key, Auto Increment)
- `purchase_id` (Integer, references `purchases.id`)
- `product_id` (Integer, references `products.id`)
- `quantity` (Integer, Not Null)
- `price` (Real, Not Null)

---

## 4. Spesifikasi API Endpoint

Semua endpoint yang memerlukan login harus menyertakan Header:
`Authorization: Bearer <JWT_TOKEN>`

### 4.1 Modul Project (Public)
Digunakan untuk pendaftaran identitas kelompok sebelum menggunakan sistem.

#### A. Membuat Project Baru (`POST /projects`)
- **Request Body**:
  ```json
  {
    "projectTitle": "Toko Elektronik Makmur",
    "projectDescription": "Penjualan gadget terbaru",
    "projectClass": "IF-22-B",
    "projectTeam": [
      { "name": "Ahmad Fulan", "nim": "22115501" },
      { "name": "Jane Doe", "nim": "22115502" }
    ]
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "projectTitle": "Toko Elektronik Makmur",
      "projectDescription": "Penjualan gadget terbaru",
      "projectClass": "IF-22-B",
      "projectTeam": [
        { "name": "Ahmad Fulan", "nim": "22115501" },
        { "name": "Jane Doe", "nim": "22115502" }
      ],
      "createdAt": "2026-05-30 04:00:00"
    }
  }
  ```

#### B. Mengambil Semua Project (`GET /projects`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "projectTitle": "Toko Elektronik Makmur",
        "projectDescription": "Penjualan gadget terbaru",
        "projectClass": "IF-22-B",
        "projectTeam": [
          { "name": "Ahmad Fulan", "nim": "22115501" }
        ],
        "createdAt": "2026-05-30 04:00:00"
      }
    ]
  }
  ```

---

### 4.2 Modul Autentikasi (Public)

#### A. Pendaftaran User Baru (`POST /auth/register`)
- **Request Body**:
  ```json
  {
    "projectId": 1,
    "name": "Ahmad Fulan",
    "email": "ahmad@example.com",
    "password": "password123"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "id": 1,
      "projectId": 1,
      "name": "Ahmad Fulan",
      "email": "ahmad@example.com"
    }
  }
  ```

#### B. Login User (`POST /auth/login`)
- **Request Body**:
  ```json
  {
    "email": "ahmad@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "projectId": 1,
        "name": "Ahmad Fulan",
        "email": "ahmad@example.com",
        "role": "customer"
      }
    }
  }
  ```

#### C. Informasi User Aktif (`GET /auth/me`)
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User fetched successfully",
    "data": {
      "id": 1,
      "projectId": 1,
      "name": "Ahmad Fulan",
      "email": "ahmad@example.com",
      "role": "customer"
    }
  }
  ```

---

### 4.3 Modul Kategori (Protected)

#### A. Membuat Kategori (`POST /categories`)
- **Request Body**:
  ```json
  {
    "categoryName": "Gadget"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Category created successfully",
    "data": {
      "id": 1,
      "projectId": 1,
      "categoryName": "Gadget",
      "createdAt": "2026-05-30 04:05:00"
    }
  }
  ```

#### B. Mengambil Semua Kategori (`GET /categories`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Categories fetched successfully",
    "data": [
      {
        "id": 1,
        "projectId": 1,
        "categoryName": "Gadget",
        "createdAt": "2026-05-30 04:05:00"
      }
    ]
  }
  ```

---

### 4.4 Modul Produk (Protected)

#### A. Membuat Produk Baru (`POST /products`)
- **Request Body**:
  ```json
  {
    "categoryId": 1,
    "productName": "iPhone 15 Pro",
    "productDescription": "Super retina display phone",
    "productPrice": 20000000,
    "productStock": 5,
    "productImage": "https://example.com/iphone15.jpg"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Product created successfully",
    "data": {
      "id": 1,
      "projectId": 1,
      "categoryId": 1,
      "productName": "iPhone 15 Pro",
      "productDescription": "Super retina display phone",
      "productPrice": 20000000,
      "productStock": 5,
      "productImage": "https://example.com/iphone15.jpg",
      "createdAt": "2026-05-30 04:10:00"
    }
  }
  ```

#### B. Mengambil Semua Produk (`GET /products` atau `GET /products?categoryId=1`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Products fetched successfully",
    "data": [
      {
        "id": 1,
        "projectId": 1,
        "categoryId": 1,
        "productName": "iPhone 15 Pro",
        "productDescription": "Super retina display phone",
        "productPrice": 20000000,
        "productStock": 5,
        "productImage": "https://example.com/iphone15.jpg",
        "createdAt": "2026-05-30 04:10:00"
      }
    ]
  }
  ```

#### C. Mengambil Detail Produk (`GET /products/:id`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Product fetched successfully",
    "data": {
      "id": 1,
      "projectId": 1,
      "categoryId": 1,
      "productName": "iPhone 15 Pro",
      "productDescription": "Super retina display phone",
      "productPrice": 20000000,
      "productStock": 5,
      "productImage": "https://example.com/iphone15.jpg",
      "createdAt": "2026-05-30 04:10:00"
    }
  }
  ```

#### D. Memperbarui Produk (`PUT /products/:id`)
- **Request Body**:
  ```json
  {
    "productPrice": 19500000,
    "productStock": 4
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Product updated successfully",
    "data": {
      "id": 1,
      "projectId": 1,
      "categoryId": 1,
      "productName": "iPhone 15 Pro",
      "productDescription": "Super retina display phone",
      "productPrice": 19500000,
      "productStock": 4,
      "productImage": "https://example.com/iphone15.jpg",
      "createdAt": "2026-05-30 04:10:00"
    }
  }
  ```

#### E. Menghapus Produk (`DELETE /products/:id`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Product deleted successfully",
    "data": {
      "id": 1,
      "projectId": 1,
      "productName": "iPhone 15 Pro"
    }
  }
  ```

---

### 4.5 Modul Keranjang Belanja / Cart (Protected)

Endpoint cart secara otomatis discope berdasarkan `userId` pengguna yang sedang login.

#### A. Menambah Item ke Cart (`POST /carts`)
Jika produk sudah ada di cart, kuantitas akan otomatis bertambah sesuai payload.
- **Request Body**:
  ```json
  {
    "productId": 1,
    "quantity": 2
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Product added to cart successfully",
    "data": {
      "id": 1,
      "projectId": 1,
      "userId": 1,
      "productId": 1,
      "quantity": 2,
      "createdAt": "2026-05-30 04:15:00"
    }
  }
  ```

#### B. Mengambil Isi Keranjang (`GET /carts`)
Mengembalikan seluruh cart user yang login lengkap dengan objek produk.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Cart fetched successfully",
    "data": [
      {
        "id": 1,
        "projectId": 1,
        "userId": 1,
        "productId": 1,
        "quantity": 2,
        "createdAt": "2026-05-30 04:15:00",
        "product": {
          "id": 1,
          "productName": "iPhone 15 Pro",
          "productPrice": 19500000,
          "productStock": 4,
          "productImage": "https://example.com/iphone15.jpg",
          "productDescription": "Super retina display phone"
        }
      }
    ]
  }
  ```

#### C. Mengupdate Kuantitas Cart (`PUT /carts/:id`)
- **Request Body**:
  ```json
  {
    "quantity": 3
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Cart item updated successfully",
    "data": {
      "id": 1,
      "projectId": 1,
      "userId": 1,
      "productId": 1,
      "quantity": 3
    }
  }
  ```

#### D. Menghapus Satu Item Cart (`DELETE /carts/:id`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Cart item deleted successfully",
    "data": {
      "id": 1,
      "projectId": 1,
      "userId": 1,
      "productId": 1,
      "quantity": 3
    }
  }
  ```

#### E. Mengosongkan Keranjang (`DELETE /carts`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Cart cleared successfully",
    "data": null
  }
  ```

---

### 4.6 Modul Metode Pembayaran / Payment Method (Protected)

Endpoint metode pembayaran di-scope berdasarkan `projectId` dari user yang login.

#### A. Membuat Metode Pembayaran Baru (`POST /payment-methods`)
- **Request Body**:
  ```json
  {
    "name": "GoPay",
    "type": "wallet",
    "logoUrl": "https://example.com/gopay.png"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Payment method created successfully",
    "data": {
      "id": 1,
      "projectId": 1,
      "name": "GoPay",
      "type": "wallet",
      "logoUrl": "https://example.com/gopay.png",
      "createdAt": "2026-05-30 19:10:00"
    }
  }
  ```

#### B. Mengambil Semua Metode Pembayaran (`GET /payment-methods`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Payment methods fetched successfully",
    "data": [
      {
        "id": 1,
        "projectId": 1,
        "name": "GoPay",
        "type": "wallet",
        "logoUrl": "https://example.com/gopay.png",
        "createdAt": "2026-05-30 19:10:00"
      }
    ]
  }
  ```

#### C. Mengambil Detail Metode Pembayaran (`GET /payment-methods/:id`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Payment method fetched successfully",
    "data": {
      "id": 1,
      "projectId": 1,
      "name": "GoPay",
      "type": "wallet",
      "logoUrl": "https://example.com/gopay.png",
      "createdAt": "2026-05-30 19:10:00"
    }
  }
  ```

#### D. Memperbarui Metode Pembayaran (`PUT /payment-methods/:id`)
- **Request Body**:
  ```json
  {
    "name": "GoPay Coins",
    "logoUrl": "https://example.com/gopay-coins.png"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Payment method updated successfully",
    "data": {
      "id": 1,
      "projectId": 1,
      "name": "GoPay Coins",
      "type": "wallet",
      "logoUrl": "https://example.com/gopay-coins.png",
      "createdAt": "2026-05-30 19:10:00"
    }
  }
  ```

#### E. Menghapus Metode Pembayaran (`DELETE /payment-methods/:id`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Payment method deleted successfully",
    "data": {
      "id": 1,
      "projectId": 1,
      "name": "GoPay Coins"
    }
  }
  ```

---

### 4.7 Modul Pembelian / Purchase & Checkout (Protected)

#### A. Checkout Keranjang (`POST /purchases`)
Melakukan transaksi checkout seluruh item di dalam cart saat ini.
- **Request Body**:
  ```json
  {
    "address": "Jalan Merdeka No. 45, Jakarta Pusat",
    "paymentMethodId": 1
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Checkout successful and purchase record created",
    "data": {
      "id": 1,
      "projectId": 1,
      "userId": 1,
      "totalPrice": 39000000,
      "status": "pending",
      "address": "Jalan Merdeka No. 45, Jakarta Pusat",
      "paymentMethodId": 1,
      "createdAt": "2026-05-30 19:20:00"
    }
  }
  ```

#### B. Mengambil Riwayat Pembelian (`GET /purchases`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Purchases fetched successfully",
    "data": [
      {
        "id": 1,
        "projectId": 1,
        "userId": 1,
        "totalPrice": 39000000,
        "status": "pending",
        "address": "Jalan Merdeka No. 45, Jakarta Pusat",
        "paymentMethodId": 1,
        "createdAt": "2026-05-30 19:20:00"
      }
    ]
  }
  ```

#### C. Detail Transaksi Pembelian (`GET /purchases/:id`)
Mengembalikan invoice lengkap beserta opsi pembayaran dan daftar produk yang dibeli.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Purchase details fetched successfully",
    "data": {
      "id": 1,
      "projectId": 1,
      "userId": 1,
      "totalPrice": 39000000,
      "status": "pending",
      "address": "Jalan Merdeka No. 45, Jakarta Pusat",
      "paymentMethodId": 1,
      "createdAt": "2026-05-30 19:20:00",
      "paymentMethod": {
        "id": 1,
        "name": "GoPay Coins",
        "type": "wallet",
        "logoUrl": "https://example.com/gopay-coins.png"
      },
      "items": [
        {
          "id": 1,
          "purchaseId": 1,
          "productId": 1,
          "quantity": 2,
          "price": 19500000,
          "product": {
            "productName": "iPhone 15 Pro",
            "productImage": "https://example.com/iphone15.jpg",
            "productDescription": "Super retina display phone"
          }
        }
      ]
    }
  }
  ```

#### D. Memperbarui Status Pembelian (`PUT /purchases/:id`)
Digunakan untuk memproses transaksi (misal: membatalkan atau menyelesaikan pesanan).
- **Request Body**:
  ```json
  {
    "status": "completed"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Purchase status updated successfully",
    "data": {
      "id": 1,
      "projectId": 1,
      "userId": 1,
      "totalPrice": 39000000,
      "status": "completed",
      "address": "Jalan Merdeka No. 45, Jakarta Pusat",
      "paymentMethodId": 1,
      "createdAt": "2026-05-30 19:20:00"
    }
  }
  ```

---

## 5. Keamanan & Penanganan Eror

### Keamanan Data
1. **Autentikasi Token JWT**: Seluruh request ke modul Kategori, Produk, Cart, Payment Method, dan Purchase diverifikasi oleh `authMiddleware`. Informasi `projectId` dan `userId` diekstrak dari JWT, mencegah manipulasi payload request body untuk mengakses tenant lain.
2. **Password Hashing**: Menggunakan library `bcrypt` dengan faktor salt `10`.

### Standarisasi Format Response Eror (5xx, 4xx)
Seluruh kegagalan request ditangani secara global menggunakan Express Error Middleware. Format response error yang seragam:
```json
{
  "success": false,
  "message": "Deskripsi pesan kesalahan spesifik"
}
```
Contoh kode status HTTP yang digunakan:
- `400 Bad Request`: Input tidak valid, metode pembayaran salah proyek, stok produk tidak cukup.
- `401 Unauthorized`: Token JWT tidak valid atau tidak disertakan.
- `404 Not Found`: Produk, kategori, metode pembayaran, atau transaksi tidak ditemukan.
- `500 Internal Server Error`: Masalah koneksi basis data atau kesalahan tak terduga pada server.

---

## 6. Panduan Lengkap Import Koleksi Postman

Mahasiswa dapat menguji API ini dengan mudah menggunakan alat pengujian API bernama **Postman**. Berikut adalah panduan langkah demi langkah lengkap untuk melakukan setup awal dan mengimpor file `postman_collections.json` ke workspace Anda.

### Langkah 1: Registrasi Akun & Download Postman
Untuk memulai, Anda membutuhkan aplikasi Postman terinstal pada perangkat Anda atau mengaksesnya langsung di web browser.
1. Kunjungi situs resmi Postman di [www.postman.com](https://www.postman.com/).
2. Klik tombol **Sign Up for Free** di pojok kanan atas untuk mendaftar akun baru.
3. Anda dapat mendaftar menggunakan alamat email atau dengan masuk menggunakan akun Google Anda secara instan.
4. Setelah mendaftar, Anda memiliki dua opsi:
   - **Postman Desktop App (Direkomendasikan)**: Download aplikasi untuk Windows/macOS/Linux melalui [postman.com/downloads](https://www.postman.com/downloads/) lalu instal.
   - **Postman Web**: Gunakan secara online langsung dari web browser Anda setelah masuk.

### Langkah 2: Membuat Workspace Baru di Postman
Workspace adalah area kerja di Postman tempat Anda menyimpan koleksi API agar teratur.
1. Buka aplikasi Postman Desktop atau masuk di browser.
2. Di pojok kiri atas, klik menu drop-down bertuliskan **Workspaces**, lalu klik tombol **Create Workspace**.
3. Berikan konfigurasi berikut pada form workspace baru Anda:
   - **Name**: Beri nama workspace Anda, misalnya `Pemrograman Mobile 2 - ECommerce`.
   - **Summary (Opsional)**: Tulis deskripsi singkat, misalnya `Workspace pengujian backend e-commerce`.
   - **Visibility**: Pilih **Personal** agar hanya Anda yang dapat mengaksesnya, atau **Team** jika bekerja dalam kelompok.
4. Klik **Create Workspace** di bagian bawah.

### Langkah 3: Melakukan Import `postman_collections.json`
Sekarang Anda siap memasukkan seluruh kumpulan endpoint API kita ke dalam area kerja.
1. Pastikan Anda telah mengunduh berkas `postman_collections.json` yang ada pada folder root proyek ini.
2. Pada pojok kiri atas area Workspace Postman Anda, temukan dan klik tombol **Import** (biasanya berada di panel samping kiri di atas daftar koleksi).
3. Akan muncul kotak dialog drag-and-drop:
   - Klik **Files** untuk memilih file secara manual atau cukup drag (tarik) berkas `postman_collections.json` dari File Explorer Windows Anda dan letakkan di dalam kotak tersebut.
4. Postman secara otomatis mendeteksi format berkas sebagai berkas koleksi Postman v2.1.
5. Klik tombol **Import** untuk mengonfirmasi. Koleksi bernama **"Ecommerce API - Final Project (Komprehensif)"** sekarang akan muncul di tab **Collections** di panel kiri Anda.

### Langkah 4: Menyesuaikan Variabel Koleksi (`baseUrl` & `token`)
Koleksi ini menggunakan variabel internal agar pengujian berjalan dengan mulus tanpa mengetik token berulang kali.
1. Klik nama koleksi **Ecommerce API - Final Project (Komprehensif)** pada panel kiri untuk membuka tab pengaturan koleksi utama.
2. Di layar utama sebelah kanan, klik tab bertuliskan **Variables** di samping tab Authorization.
3. Anda akan melihat dua baris variabel:
   - **`baseUrl`**: Memiliki nilai awal **`https://shop.tandurkarya.com`** (Server Online Production). 
     - **Catatan**: Jika Anda ingin menguji menggunakan server lokal komputer Anda, cukup ubah nilai kolom *Current Value* variabel `baseUrl` ini menjadi **`http://localhost:3000`** (atau sesuaikan dengan port lokal Anda).
   - **`token`**: Ini adalah penampung token JWT. Kolom *Current Value* awalnya kosong. Ini wajar, jangan diisi manual!
4. Klik **Save** (Ctrl + S) di pojok kanan atas untuk menyimpan perubahan variabel.

### Langkah 5: Cara Menguji Endpoint & Sistem Auto-Inject Token
Untuk mulai menguji, pastikan server lokal Anda sudah berjalan (jika menguji lokal) atau komputer Anda terhubung internet (jika menguji online).
1. **Membuat Project (Opsional)**:
   - Buka folder **Project** -> klik **Create Project** -> klik tombol **Send**. Project ID unik akan dibuat secara otomatis di database MySQL online/lokal.
2. **Registrasi User Baru**:
   - Buka folder **Auth** -> klik **Register** -> sesuaikan body JSON jika perlu -> klik **Send** untuk mendaftarkan akun mahasiswa.
3. **Login & Auto-Inject Token (KUNCI UTAMA)**:
   - Buka folder **Auth** -> klik **Login** -> klik tombol **Send**.
   - **Di Balik Layar**: Koleksi Postman ini memiliki script otomatis pada bagian *Tests* request Login. Begitu respons sukses (status 200 OK) berisi token JWT didapatkan dari backend, Postman secara otomatis menyimpan token tersebut ke dalam variabel koleksi `token` Anda.
   - Anda dapat memeriksa tab **Variables** koleksi utama Anda lagi; sekarang kolom *Current Value* variabel `token` telah terisi dengan kode JWT panjang.
4. **Menguji Endpoint Terproteksi**:
   - Anda kini bebas mengklik dan mengirim request pada folder **Category**, **Product**, **Cart**, **Payment Method**, dan **Purchase** secara instan dengan mengklik **Send**!
   - Semua request tersebut dikonfigurasi menggunakan otorisasi bertipe `Inherit auth from parent`, yang artinya mereka secara otomatis melampirkan isi variabel `{{token}}` sebagai header bearer token secara transparan. Anda tidak perlu menyalin token satu-per-satu lagi!
