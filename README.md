# JCClub — Full-Stack E-Commerce Store

A server-rendered e-commerce store for football jerseys, with a customer storefront and a separate admin panel. Built from scratch with **Node.js, Express, MongoDB and Handlebars**, with Razorpay payments, Cloudinary image hosting, OTP login and shipping-API integration.

![Node](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Handlebars](https://img.shields.io/badge/Handlebars-f0772b?logo=handlebarsdotjs&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-0C2451?logo=razorpay&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?logo=cloudinary&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

### Storefront
- Browse by category, sub-category and club, with sorting and search
- Product pages, cart with quantity updates, and a wishlist
- Login with password **or phone OTP**, plus a password reset flow
- Saved shipping addresses, coupons at checkout
- **Razorpay** online payments, and order creation pushed to a shipping aggregator API
- Order history, order tracking, cancellation and invoices
- Newsletter subscription

### Admin panel
- OTP-protected admin login with a separate JWT and role check
- Dashboard with sales overview
- CRUD for products (multi-image upload to **Cloudinary**), categories, sub-categories, coupons and homepage banners
- Order management with status updates
- **Sales report export to CSV** for any date range
- Subscriber list and promotional email blasts

## Tech stack

| Layer | Tools |
|---|---|
| Server | Node.js, Express, Express-Handlebars (SSR) |
| Database | MongoDB with Mongoose (12 models: users, products, orders, carts, coupons, banners…) |
| Auth | JWT in cookies (separate user/admin secrets), bcrypt, SMS OTP |
| Payments | Razorpay Orders API |
| Media | Multer + Cloudinary |
| Messaging | Nodemailer (Gmail), Spring Edge SMS |

## Project structure

```
app.js              Express setup, view engine, DB connection
routes/             user.js (storefront) · admin.js (admin panel)
controllers/        Request handlers for storefront and admin
helpers/            Business logic: cart, orders, payments, OTP, shipping
middleware/         JWT verification, user/admin route guards
models/             Mongoose schemas
views/              Handlebars templates: user/, admin/, layouts, partials
public/             Static CSS/JS/images
utils/              Cloudinary client, multer config
```

## Run locally

**Requirements:** Node 18+, a MongoDB database, and accounts for the services you want to use (Razorpay test keys and Cloudinary are needed for checkout and image uploads).

```bash
git clone https://github.com/salmanck66/Ecommerce-Project-.git
cd Ecommerce-Project-
cp .env.example .env     # fill in your keys
npm install
npm run dev              # http://localhost:3000  ·  admin at /admin
```

See [`.env.example`](.env.example) for every variable.

## Security notes

When I revisited this project I fixed the following:

- **Added server-side payment verification.** The checkout used to trust the browser: the charge amount came from the client and orders were marked as paid online without any proof. Now the Razorpay order amount comes from the server-side cart, the payment signature is verified with HMAC-SHA256, the paid amount is checked against the cart, and one payment can't be reused for a second order.
- **Removed a hard-coded Cloudinary fallback secret.** All credentials now come from environment variables only.
- **Fixed the sales CSV export.** It used to be written into `public/`, which made order data downloadable by anyone. It's now generated in memory and streamed to the authenticated admin.
- The database connection string is no longer logged at startup.
- Order confirmation emails are now sent only after the order is saved, and an out-of-stock item no longer crashes the request with a double response.
- Removed temp files, committed upload artifacts and sample data from the repo, and declared the `uuid` dependency, which was only working by accident.

## What I'd do differently today

This was one of my first large Node projects, and some parts show it. If I were rebuilding it:

- Split the large controllers into a service layer and add input validation (e.g. Zod)
- Add integration tests around checkout, coupons and payment verification
- Move to TypeScript and a REST/JSON API with a React frontend
- Handle payments with Razorpay webhooks as well, so an order is still recorded if the customer closes the tab right after paying
- Reserve stock atomically inside a transaction during checkout

These lessons fed into the production WooCommerce store I run now at [jcclub.in](https://jcclub.in).

---

Built by **[Salmanul Faris C K](https://github.com/salmanck66)** · [LinkedIn](https://www.linkedin.com/in/salmanul-faris-c-k/)
