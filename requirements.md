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
- **Database**: SQLite (`better-sqlite3`).
- **Autentikasi**: JSON Web Token (JWT) dengan hashing password menggunakan `bcrypt`.
- **Keamanan**: Helmet (untuk proteksi HTTP headers), CORS, dan Morgan (untuk logging request).

---

## 2. Cara Setup & Menjalankan Proyek

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
   JWT_SECRET=super_secret_key_untuk_ecommerce_api_2026
   ```

4. **Menjalankan Migrasi Database**
   Drizzle Kit digunakan untuk mengelola skema database SQLite.
   ```bash
   # Membuat file migrasi baru (jika ada perubahan skema)
   npm run generate

   # Menerapkan migrasi ke database.sqlite
   npm run migrate
   ```

5. **Menjalankan Server dalam Mode Development**
   ```bash
   npm run dev
   ```
   Server akan berjalan secara lokal di `http://localhost:3000`.

---

## 3. Entitas Database & Skema

Sistem ini mendefinisikan 8 tabel utama di dalam database SQLite:

### A. Projects (`projects`)
Menyimpan informasi kelompok atau proyek mahasiswa.
- `id` (Integer, Primary Key, Auto Increment)
- `project_title` (Text, Not Null)
- `project_description` (Text, Nullable)
- `project_class` (Text, Not Null)
- `project_team` (Text, Not Null, JSON String berisi nama & NIM anggota tim)
- `created_at` (Text, Default `CURRENT_TIMESTAMP`)

### B. Users (`users`)
Menyimpan data pengguna yang melakukan registrasi.
- `id` (Integer, Primary Key, Auto Increment)
- `project_id` (Integer, Foreign Key references `projects.id`)
- `name` (Text, Not Null)
- `email` (Text, Not Null, Unique)
- `password` (Text, Not Null, hashed)
- `role` (Text, Default `customer`)
- `created_at` (Text, Default `CURRENT_TIMESTAMP`)

### C. Categories (`categories`)
Kategori klasifikasi produk untuk setiap project.
- `id` (Integer, Primary Key, Auto Increment)
- `project_id` (Integer, Foreign Key references `projects.id`)
- `category_name` (Text, Not Null)
- `created_at` (Text, Default `CURRENT_TIMESTAMP`)

### D. Products (`products`)
Menyimpan data barang/produk yang dijual.
- `id` (Integer, Primary Key, Auto Increment)
- `project_id` (Integer, Foreign Key references `projects.id`)
- `category_id` (Integer, Foreign Key references `categories.id`, Nullable)
- `product_name` (Text, Not Null)
- `product_description` (Text, Nullable)
- `product_price` (Real, Not Null)
- `product_stock` (Integer, Default 0)
- `product_image` (Text, Nullable, URL gambar)
- `created_at` (Text, Default `CURRENT_TIMESTAMP`)

### E. Carts (`carts`)
Keranjang belanja dinamis milik setiap user.
- `id` (Integer, Primary Key, Auto Increment)
- `project_id` (Integer, Foreign Key references `projects.id`)
- `user_id` (Integer, Foreign Key references `users.id`)
- `product_id` (Integer, Foreign Key references `products.id`)
- `quantity` (Integer, Default 1)
- `created_at` (Text, Default `CURRENT_TIMESTAMP`)

### F. Payment Methods (`payment_methods`)
Menyimpan opsi metode pembayaran yang tersedia di bawah masing-masing project.
- `id` (Integer, Primary Key, Auto Increment)
- `project_id` (Integer, Foreign Key references `projects.id`)
- `name` (Text, Not Null)
- `type` (Text, Not Null) -- Harus bernilai `'wallet'` atau `'bank'`
- `logo_url` (Text, Nullable)
- `created_at` (Text, Default `CURRENT_TIMESTAMP`)

### G. Purchases (`purchases`)
Transaksi pembelian/order yang dilakukan oleh user.
- `id` (Integer, Primary Key, Auto Increment)
- `project_id` (Integer, Foreign Key references `projects.id`)
- `user_id` (Integer, Foreign Key references `users.id`)
- `total_price` (Real, Not Null)
- `status` (Text, Default `pending`)
- `address` (Text, Not Null) -- Alamat pengiriman barang
- `payment_method_id` (Integer, Foreign Key references `payment_methods.id`) -- Metode pembayaran yang dipilih
- `created_at` (Text, Default `CURRENT_TIMESTAMP`)

### H. Purchase Items (`purchase_items`)
Detail item produk dari transaksi pembelian (Snapshot harga saat transaksi).
- `id` (Integer, Primary Key, Auto Increment)
- `purchase_id` (Integer, Foreign Key references `purchases.id`)
- `product_id` (Integer, Foreign Key references `products.id`)
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
- **Proses Sistem**:
  1. Validasi keberadaan dan kepemilikan `paymentMethodId` di bawah `projectId` yang sama.
  2. Validasi kecukupan stok masing-masing produk. Jika stok tidak cukup, transaksi dibatalkan (Rollback).
  3. Kalkulasi `totalPrice` otomatis berdasarkan harga aktual produk.
  4. Mengurangi stok produk yang dibeli.
  5. Menyimpan detail transaksi termasuk `address` (alamat kirim) dan `paymentMethodId`.
  6. Menyalin item cart ke data transaksi (`purchase_items`).
  7. Mengosongkan cart user secara otomatis.
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
