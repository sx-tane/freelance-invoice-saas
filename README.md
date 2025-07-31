# Freelance Invoice SaaS (backend prototype)

This repository contains a minimal NestJS backend for a micro‑SaaS that helps freelancers
manage clients and invoices. It implements the core logic created during Day 2 of
development:

* **Client management** – create, read, update and delete clients with basic details.
* **Invoice management** – create, read, update and delete invoices, and change their status.

This code is intentionally simple. All data are stored in memory rather than a
database, which makes the prototype easy to run and understand. Use this as a
starting point for your own development, replacing the in‑memory stores with
persistent storage and adding authentication, scheduling and a frontend.

## Payment integration

As of Day 5 the backend includes a basic payment module that integrates with
Stripe to create subscription checkout sessions.  To enable it you will need
to set the following environment variables before starting the backend:

```
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PRICE_ID=price_id_for_your_subscription
SUCCESS_URL=https://yourdomain.com/success  # where Stripe should redirect after payment
CANCEL_URL=https://yourdomain.com/cancel    # where Stripe should redirect if payment is cancelled
```

The `PaymentService` uses these values to create a checkout session when
`POST /payments/create-checkout-session` is called.  The route returns a
JSON object containing a `url` property that your frontend should redirect
the user to for payment.