# RepairLink — Master Implementation Prompt

> **How to use this prompt:**
> Feed this document (or any numbered section of it) to an AI coding assistant (Claude Code, Cursor, Copilot, etc.) or use it as your authoritative project specification. Each section is self-contained and sequenced. Work through phases in order. Every phase ends with a checklist — do not proceed until all items are green.

---

## 0. Context & ground rules (read first, always)

You are implementing **RepairLink**, a two-sided web marketplace that connects device owners (customers) with repair service providers (PC, laptop, console, and mobile repair shops). The platform includes:

- A **customer portal** for raising and managing repair tickets
- A **service provider portal** for accepting jobs and managing repairs
- An **admin console** for platform governance
- A **unique ticketing system** with a state machine, bidding window, and repair logs
- A **mock delivery system** with OTP handover confirmation and simulated transit

### Non-negotiable constraints
- **Frontend:** React (JavaScript, not TypeScript), React Router v6, Redux Toolkit + RTK Query, React Hook Form + Zod, shadcn/ui + Tailwind CSS, Socket.io client
- **Backend:** Node.js + Express, Mongoose ODM
- **Database:** MongoDB Atlas (cloud-hosted)
- **Realtime:** Socket.io (authenticated via JWT in handshake)
- **Background jobs:** Bull + Redis (Upstash for hosted Redis)
- **File uploads:** Cloudinary (free tier)
- **Email:** Nodemailer + Gmail SMTP (dev) / SendGrid (prod)
- **Auth:** JWT access tokens (15 min) + httpOnly refresh tokens (7 days), bcrypt for passwords and OTPs
- **RBAC:** Three roles — `customer`, `provider`, `admin`. Role stored in JWT payload. Every protected route uses `authenticate` + `authorize(...roles)` middleware chain.
- **No TypeScript.** Plain JavaScript with JSDoc comments where helpful.
- **No mock data on the frontend.** All data comes from real API calls.
- **All forms validated** on both client (Zod) and server (Zod).
- **Every API response** follows the envelope: `{ success: true, data: {...} }` or `{ success: false, error: "message" }`.
- **All dates stored as UTC** in MongoDB. Display in local time on frontend.

---

## Phase 1 — Project scaffolding & environment

### 1.1 Monorepo structure

Create this exact folder layout:

```
repairlink/
├── frontend/          ← Vite + React app
│   ├── public/
│   └── src/
│       ├── app/           ← Redux store, router root
│       ├── features/
│       │   ├── auth/          ← slice, pages, components
│       │   ├── tickets/       ← slice, pages, components
│       │   ├── bids/          ← slice, components
│       │   ├── delivery/      ← slice, pages, components
│       │   ├── provider/      ← slice, pages, components
│       │   ├── admin/         ← pages, components
│       │   ├── reviews/       ← slice, components
│       │   └── notifications/ ← slice, components
│       ├── components/    ← shared UI (Button, Modal, StatusBadge, etc.)
│       ├── hooks/         ← useSocket, useAuth, useDebounce, usePagination
│       ├── services/      ← RTK Query API slices (apiSlice base + injected endpoints)
│       ├── utils/         ← formatDate, formatCurrency, ticketIdGenerator, etc.
│       ├── constants/     ← STATUS_LABELS, DEVICE_TYPES, URGENCY_OPTIONS, ROLES
│       └── routes/        ← AppRouter, PrivateRoute, RoleRoute
├── backend/
│   └── src/
│       ├── modules/
│       │   ├── auth/          ← routes, controller, service, validators
│       │   ├── tickets/       ← routes, controller, service, validators
│       │   ├── bids/          ← routes, controller, service, validators
│       │   ├── delivery/      ← routes, controller, service, validators
│       │   ├── providers/     ← routes, controller, service, validators
│       │   ├── reviews/       ← routes, controller, service, validators
│       │   ├── notifications/ ← routes, controller, service
│       │   ├── chat/          ← routes, controller, service
│       │   └── admin/         ← routes, controller, service
│       ├── models/        ← all Mongoose schemas
│       ├── middleware/    ← authenticate, authorize, errorHandler, validate, upload
│       ├── jobs/          ← Bull queue definitions and processors
│       ├── sockets/       ← Socket.io event handlers
│       ├── services/      ← EmailService, OtpService, NotificationService
│       ├── config/        ← db.js, redis.js, cloudinary.js, socket.js
│       └── utils/         ← ApiError, ApiResponse, generateTicketNo, asyncHandler
└── .env.example
```

### 1.2 Environment variables

Create `.env.example` at root and `.env` files in both `frontend/` and `backend/`. The backend needs:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/repairlink
JWT_ACCESS_SECRET=<random 64-char hex>
JWT_REFRESH_SECRET=<random 64-char hex>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
CLIENT_URL=http://localhost:5173
```

Frontend `.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

### 1.3 Backend packages

```bash
npm install express mongoose dotenv bcryptjs jsonwebtoken cookie-parser cors helmet morgan express-rate-limit zod multer cloudinary multer-storage-cloudinary nodemailer bull ioredis socket.io uuid
npm install --save-dev nodemon eslint prettier
```

### 1.4 Frontend packages

```bash
npm install react-router-dom @reduxjs/toolkit react-redux react-hook-form @hookform/resolvers zod axios socket.io-client date-fns lucide-react
npx shadcn-ui@latest init
```

Install shadcn components: `button, input, label, card, badge, dialog, dropdown-menu, select, tabs, avatar, progress, toast, skeleton, separator, textarea, popover, command`.

### 1.5 Phase 1 checklist
- [ ] Folder structure created exactly as specified
- [ ] Both `package.json` files have all dependencies installed
- [ ] `.env` files present and populated with real values
- [ ] Backend starts without errors (`nodemon src/index.js`)
- [ ] Frontend starts without errors (`npm run dev`)
- [ ] MongoDB Atlas connection confirmed (log: "MongoDB connected")
- [ ] Redis connection confirmed (Bull queue initializes)

---

## Phase 2 — Backend foundations

### 2.1 Express app setup (`backend/src/index.js`)

Configure in this order:
1. `dotenv.config()`
2. Connect to MongoDB (`config/db.js` — use `mongoose.connect`, log success/failure)
3. Create Express app
4. Apply middleware: `helmet()`, `cors({ origin: process.env.CLIENT_URL, credentials: true })`, `express.json()`, `cookie-parser()`, `morgan('dev')`, global rate limiter (100 req/15min)
5. Mount all module routers under `/api/v1`
6. Mount 404 handler
7. Mount global error handler (must have 4 params: `err, req, res, next`)
8. Create HTTP server, attach Socket.io, start listening

### 2.2 Utility classes

**`utils/ApiError.js`**
```js
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
  }
}
```

**`utils/ApiResponse.js`**
```js
class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}
```

**`utils/asyncHandler.js`** — wraps async route handlers, passes errors to `next()`.

**`utils/generateTicketNo.js`** — generates `TKT-YYYY-CAT-NNNNN` using an atomic MongoDB counter document (collection: `counters`, field: `seq`). Device type codes: `MOB`, `LAP`, `PC`, `CON`. Zero-pad to 5 digits.

### 2.3 Mongoose models

Implement all 8 models with full field definitions, required flags, indexes, and Mongoose timestamps (`{ timestamps: true }`).

#### `models/User.js`
```
_id (ObjectId)
name (String, required, trim)
email (String, required, unique, lowercase, trim)
passwordHash (String, required, select: false)
role (String, enum: ['customer','provider','admin'], default: 'customer')
phone (String)
avatar (String)
isVerified (Boolean, default: false)
isActive (Boolean, default: true)
savedAddresses ([{ label, street, city, state, pincode, lat, lng }])
notifPreferences ({ email: Boolean, inApp: Boolean, sms: Boolean }) — all default true
refreshTokens ([String]) — hashed, for rotation validation

Index: email (unique)
Virtual: isProvider → role === 'provider'
Method: comparePassword(plain) → bcrypt.compare
Method: generateAccessToken() → jwt.sign with access secret
Method: generateRefreshToken() → jwt.sign with refresh secret
Pre-save hook: hash password if modified
```

#### `models/Provider.js`
```
_id (ObjectId)
userId (ObjectId, ref: 'User', required, unique)
shopName (String, required, trim)
description (String)
logo (String — Cloudinary URL)
photos ([String])
serviceCategories ([String], enum: ['mobile','laptop','pc','console'])
brandSpecializations ([String])
address ({ street, city, state, pincode, lat (Number), lng (Number) })
serviceRadius (Number, default: 10) — km
approvalStatus (String, enum: ['pending','approved','rejected','suspended'], default: 'pending')
approvalNote (String) — admin's reason for rejection
rating (Number, default: 0, min: 0, max: 5)
totalReviews (Number, default: 0)
totalJobs (Number, default: 0)
operatingHours ({ mon…sun: { open: String, close: String, isClosed: Boolean } })
documents ([String]) — uploaded ID/cert URLs for admin review
earnings (Number, default: 0) — total platform earnings (gross)

Index: userId (unique), approvalStatus, serviceCategories
```

#### `models/Ticket.js`
```
_id (ObjectId)
ticketNo (String, unique, index) — TKT-YYYY-CAT-NNNNN
customerId (ObjectId, ref: 'User', required, index)
assignedProviderId (ObjectId, ref: 'Provider', default: null)
acceptedBidId (ObjectId, ref: 'Bid', default: null)

deviceType (String, enum: ['mobile','laptop','pc','console'], required)
deviceBrand (String, required)
deviceModel (String, required)
deviceSerial (String)

issueTitle (String, required, maxlength: 100)
issueDescription (String, required)
photos ([String]) — Cloudinary URLs

urgency (String, enum: ['low','medium','high'], default: 'medium')
budgetMin (Number)
budgetMax (Number)
finalPrice (Number) — set on job completion

status (String, enum: [
  'open',           — just created, accepting bids
  'bids_received',  — at least one bid exists
  'assigned',       — customer accepted a bid
  'pickup_scheduled',
  'device_in_transit',
  'device_received',
  'in_repair',
  'repair_complete',
  'return_in_transit',
  'delivered',
  'closed',         — after review or auto-close
  'cancelled',      — cancelled by customer
  'disputed',
  'no_bids'         — bidding window expired with 0 bids
], default: 'open')

pickupAddress ({ street, city, state, pincode, lat, lng })
preferredHandover (String, enum: ['pickup_delivery','drop_off'], default: 'pickup_delivery')

repairLog ([{
  type: (String, enum: ['diagnosis','parts_ordered','repair_started','issue_found','completed','note']),
  note: String,
  visibility: (String, enum: ['internal','shared'], default: 'shared'),
  photos: [String],
  createdAt: Date
}])

statusHistory ([{
  status: String,
  changedBy: (ObjectId, ref: 'User'),
  note: String,
  at: (Date, default: Date.now)
}])

biddingExpiresAt (Date) — set to createdAt + 24h on creation
isBiddingOpen (Boolean, default: true)

Indexes: customerId, assignedProviderId, status, deviceType, createdAt (descending)
```

#### `models/Bid.js`
```
_id (ObjectId)
ticketId (ObjectId, ref: 'Ticket', required, index)
providerId (ObjectId, ref: 'Provider', required, index)
quotedPrice (Number, required, min: 0)
estimatedDays (Number, required, min: 1)
notes (String)
status (String, enum: ['pending','accepted','declined','withdrawn','expired'], default: 'pending')
expiresAt (Date) — same as ticket biddingExpiresAt

Compound unique index: { ticketId, providerId } — one bid per provider per ticket
```

#### `models/Delivery.js`
```
_id (ObjectId)
ticketId (ObjectId, ref: 'Ticket', required, index)
leg (String, enum: ['outbound','return'], required)
status (String, enum: [
  'scheduled','picked_up','in_transit','delivered_to_provider',
  'picked_up_from_provider','return_in_transit','delivered_to_customer','failed'
], default: 'scheduled')

fromAddress ({ street, city, state, pincode })
toAddress ({ street, city, state, pincode })

agentName (String)
agentPhone (String) — masked before sending to client
vehicleNo (String)

otpHash (String, select: false) — bcrypt hashed 6-digit OTP
otpExpiresAt (Date)
otpVerified (Boolean, default: false)

scheduledTime (Date)
estimatedArrival (Date)
deliveredAt (Date)

statusHistory ([{ status: String, at: Date }])
notes (String)

Index: ticketId
```

#### `models/Review.js`
```
_id (ObjectId)
ticketId (ObjectId, ref: 'Ticket', required, unique) — one review per ticket
customerId (ObjectId, ref: 'User', required)
providerId (ObjectId, ref: 'Provider', required, index)
ratingQuality (Number, min: 1, max: 5, required)
ratingSpeed (Number, min: 1, max: 5, required)
ratingCommunication (Number, min: 1, max: 5, required)
overallRating (Number) — virtual: avg of three ratings
comment (String, maxlength: 1000)
photos ([String])
providerReply (String)
providerRepliedAt (Date)
isFlagged (Boolean, default: false)
flagReason (String)

Pre-save: compute overallRating; post-save: recompute provider.rating and totalReviews
```

#### `models/Notification.js`
```
_id (ObjectId)
userId (ObjectId, ref: 'User', required, index)
type (String, enum: ['bid','status','delivery','system','review','chat'])
title (String, required)
message (String, required)
link (String) — in-app route e.g. '/tickets/TKT-2025-MOB-00001'
isRead (Boolean, default: false, index)
metadata (Mixed) — { ticketId, providerId, bidId, deliveryId }

Index: { userId, isRead }, { userId, createdAt }
```

#### `models/Message.js` (chat)
```
_id (ObjectId)
ticketId (ObjectId, ref: 'Ticket', required, index)
senderId (ObjectId, ref: 'User', required)
senderRole (String, enum: ['customer','provider'])
content (String)
attachments ([String]) — Cloudinary URLs
isRead (Boolean, default: false)

Index: { ticketId, createdAt }
```

#### `models/Counter.js` (for ticket number generation)
```
_id (String) — e.g., 'ticket_mob_2025'
seq (Number, default: 0)
```

### 2.4 Middleware

**`middleware/authenticate.js`**
- Extract Bearer token from `Authorization` header
- Verify with `JWT_ACCESS_SECRET`
- Load user from DB (select `-passwordHash -refreshTokens`)
- Attach to `req.user`
- Throw `ApiError(401)` on failure

**`middleware/authorize.js`**
- Accept `...roles` parameter
- Check `req.user.role` is in roles array
- Throw `ApiError(403, 'Forbidden')` if not

**`middleware/validate.js`**
- Accept a Zod schema
- Parse `req.body` (or `req.params`, `req.query` as needed)
- On failure: throw `ApiError(400, 'Validation error', zodErrors)`

**`middleware/upload.js`**
- Configure multer with cloudinary storage
- Export: `uploadSingle('field')`, `uploadMultiple('field', maxCount)`
- Accepted types: `image/jpeg`, `image/png`, `image/webp`, `video/mp4`
- Max file size: 10 MB

**`middleware/errorHandler.js`**
- Catch `ApiError` → return `{ success: false, error: message, errors }`
- Catch Mongoose `ValidationError` → format and return 400
- Catch Mongoose `CastError` (invalid ObjectId) → return 400
- Catch Mongoose duplicate key (code 11000) → return 409
- Catch JWT errors → return 401
- All others → log and return 500

**`middleware/rateLimiter.js`**
- `authLimiter`: 5 requests per 15 minutes (for login/register)
- `globalLimiter`: 100 requests per 15 minutes
- `uploadLimiter`: 20 uploads per hour

### 2.5 Phase 2 checklist
- [ ] All 8 models created with correct fields, indexes, and hooks
- [ ] All middleware functions implemented
- [ ] `asyncHandler`, `ApiError`, `ApiResponse`, `generateTicketNo` utilities working
- [ ] Express app starts and connects to MongoDB Atlas
- [ ] Global error handler catches and formats all error types correctly

---

## Phase 3 — Authentication module

### 3.1 Auth routes (`/api/v1/auth`)

Implement all routes with proper middleware chains:

| Method | Path | Middleware | Controller |
|--------|------|-----------|------------|
| POST | /register | authLimiter, validate(registerSchema) | register |
| POST | /login | authLimiter, validate(loginSchema) | login |
| POST | /refresh | — | refreshToken |
| POST | /logout | authenticate | logout |
| GET | /verify-email | — | verifyEmail |
| POST | /forgot-password | authLimiter | forgotPassword |
| POST | /reset-password | — | resetPassword |
| GET | /me | authenticate | getMe |
| PUT | /me | authenticate, validate(updateProfileSchema) | updateProfile |
| PUT | /me/password | authenticate, validate(changePasswordSchema) | changePassword |

### 3.2 Auth service logic

**register:**
1. Check email not already taken
2. If role is `provider`, set `isActive: false` initially (wait for approval) — actually set to `true` but provider document must be created too
3. Hash password with bcrypt (salt rounds: 12)
4. Create User document
5. If role is `provider`, also create Provider document with `approvalStatus: 'pending'`
6. Generate email verification token (uuid v4), store hashed version in a temp `VerificationToken` model (or a field on User), expire in 24h
7. Send verification email
8. Return user (without password) — do NOT return tokens until email is verified

**login:**
1. Find user by email (with `+passwordHash`)
2. Compare password
3. Check `isVerified` — throw 403 with "Please verify your email" if false
4. Check `isActive` — throw 403 with "Account suspended" if false
5. If provider, check `approvalStatus === 'approved'` — throw 403 with "Account pending approval" if not
6. Generate access token + refresh token
7. Hash refresh token, push to `user.refreshTokens` array (keep max 5, remove oldest)
8. Set refresh token as httpOnly cookie (`sameSite: 'strict'`, `secure` in prod)
9. Return access token + user object (role, name, avatar, providerId if applicable)

**refreshToken:**
1. Read refresh token from cookie
2. Verify with `JWT_REFRESH_SECRET`
3. Find user, check hashed token exists in `refreshTokens`
4. Remove old hashed token, generate and store new one (rotation)
5. Return new access token + set new refresh cookie

**logout:**
1. Read refresh token from cookie
2. Remove its hash from user's `refreshTokens`
3. Clear cookie

**verifyEmail:**
1. Read token from query param
2. Find and validate `VerificationToken` document
3. Set `user.isVerified = true`
4. Delete token document
5. Return success

**forgotPassword / resetPassword:** standard email token flow. Token expires in 1 hour. On reset: remove all refresh tokens (log out all devices).

### 3.3 Zod validation schemas

```js
// registerSchema
{ name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  role: z.enum(['customer','provider']),
  phone: z.string().optional() }

// loginSchema
{ email: z.string().email(), password: z.string().min(1) }
```

### 3.4 Email service (`services/EmailService.js`)

Implement `sendVerificationEmail(user, token)`, `sendPasswordResetEmail(user, token)`, `sendBidReceivedEmail(customer, ticket, bid)`, `sendBidAcceptedEmail(provider, ticket)`, `sendStatusUpdateEmail(user, ticket)`, `sendOtpEmail(user, otp, leg)`. Use HTML templates (inline CSS, no template engine needed — template literal strings).

### 3.5 Phase 3 checklist
- [ ] All auth endpoints return correct status codes and envelope format
- [ ] Passwords are bcrypt hashed (never returned in responses)
- [ ] JWT access token expires in 15 min, refresh token in 7 days
- [ ] Refresh token rotation working (old token invalidated)
- [ ] Email verification flow works end-to-end
- [ ] Password reset flow works end-to-end
- [ ] Provider registration creates both User and Provider documents
- [ ] Login blocked for unverified, inactive, or unapproved accounts

---

## Phase 4 — Tickets module

### 4.1 Ticket routes (`/api/v1/tickets`)

| Method | Path | Auth | Role | Controller |
|--------|------|------|------|-----------|
| POST | / | ✓ | customer | createTicket |
| GET | / | ✓ | customer | getMyTickets |
| GET | /marketplace | ✓ | provider | getMarketplace |
| GET | /:id | ✓ | customer, provider | getTicket |
| PATCH | /:id/cancel | ✓ | customer | cancelTicket |
| PATCH | /:id/status | ✓ | provider | updateRepairStatus |
| POST | /:id/repair-log | ✓ | provider | addRepairLog |
| GET | /:id/repair-log | ✓ | customer, provider | getRepairLog |
| POST | /:id/photos | ✓ | customer | uploadTicketPhotos (multer) |

### 4.2 Ticket service logic

**createTicket:**
1. Validate request body with Zod schema (deviceType, deviceBrand, deviceModel, issueTitle, issueDescription required; photos, urgency, budgetMin, budgetMax, pickupAddress, preferredHandover optional)
2. Generate ticket number using `generateTicketNo(deviceType)`
3. Set `biddingExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)`
4. Create ticket document
5. Append to `statusHistory`: `{ status: 'open', changedBy: req.user._id }`
6. Schedule Bull job: `bidding-expire` delayed by 24h (pass ticketId)
7. Create in-app notification for customer: "Ticket TKT-xxx created"
8. Return created ticket

**getMarketplace (provider):**
- Query: `{ status: { $in: ['open','bids_received'] }, isBiddingOpen: true }`
- Exclude tickets where provider already has a bid
- Filters from query params: `deviceType`, `urgency`, `budgetMin`, `budgetMax`
- Populate `customerId` (name only — no email/phone)
- Sort: newest first by default, support `sort=budget_desc`
- Paginate: `page`, `limit` (default 20)

**getTicket:**
- Customer: can only view own tickets (`customerId === req.user._id`)
- Provider: can view ticket if they have a bid on it OR are the assigned provider
- Admin: can view any ticket
- Populate: `customerId` (name, avatar), `assignedProviderId` (shopName, rating, logo), `acceptedBidId`
- For customer view: include all bids (populate providerId with shopName, rating, logo, totalJobs)
- For provider view: include only their own bid

**updateRepairStatus (provider only):**
- Verify provider is the `assignedProviderId` on ticket
- Enforce state machine transitions (see state machine table below)
- On certain transitions, trigger side effects (see below)
- Append to `statusHistory`
- Emit Socket.io event `ticket:status-updated` to room `ticket:${ticketId}`
- Create notification for customer

**State machine — allowed transitions:**

| From | To | Who | Side effect |
|------|----|-----|-------------|
| assigned | pickup_scheduled | customer (via delivery endpoint) | create Delivery doc (outbound) |
| pickup_scheduled | device_in_transit | system (Bull job) | emit delivery event |
| device_in_transit | device_received | provider (OTP confirm) | — |
| device_received | in_repair | provider | notify customer |
| in_repair | repair_complete | provider | create Delivery doc (return), notify customer |
| repair_complete | return_in_transit | system (Bull job) | emit delivery event |
| return_in_transit | delivered | customer (OTP confirm) | notify provider |
| delivered | closed | system (7-day auto-close) or customer | unlock review form |

Invalid transitions must throw `ApiError(400, 'Invalid status transition')`.

**addRepairLog:**
- Only allowed when ticket status is `device_received` or `in_repair`
- Validate: type (required), note (required), visibility, photos (optional)
- Append to `ticket.repairLog`
- If visibility is `shared`, notify customer with log summary
- Emit `ticket:repair-log-added` via Socket.io

### 4.3 Phase 4 checklist
- [ ] Ticket creation generates correct unique ticket number
- [ ] Bidding expiry Bull job scheduled on ticket creation
- [ ] Marketplace query excludes tickets the provider already bid on
- [ ] Customer cannot view other customers' tickets
- [ ] Provider can only update status of their assigned ticket
- [ ] State machine rejects invalid transitions with 400
- [ ] Repair log entries stored and returned correctly
- [ ] Socket.io events emitted on status change and log addition

---

## Phase 5 — Bids module

### 5.1 Bid routes

| Method | Path | Auth | Role | Controller |
|--------|------|------|------|-----------|
| POST | /tickets/:ticketId/bids | ✓ | provider | submitBid |
| GET | /tickets/:ticketId/bids | ✓ | customer | getTicketBids |
| GET | /providers/me/bids | ✓ | provider | getMyBids |
| PATCH | /bids/:bidId/accept | ✓ | customer | acceptBid |
| PATCH | /bids/:bidId/reject | ✓ | customer | rejectBid |
| PATCH | /bids/:bidId/withdraw | ✓ | provider | withdrawBid |

### 5.2 Bid service logic

**submitBid:**
1. Check ticket exists and `isBiddingOpen === true`
2. Check ticket status is `open` or `bids_received`
3. Check provider is approved (`approvalStatus === 'approved'`)
4. Check no existing bid from this provider on this ticket (compound index enforces, but check for friendly error)
5. Validate: `quotedPrice` (required, > 0), `estimatedDays` (required, >= 1), `notes` (optional)
6. Set `expiresAt` from ticket's `biddingExpiresAt`
7. Create Bid document
8. If ticket status is `open`, update to `bids_received`
9. Append status history entry
10. Create notification for customer: "New bid received from [shopName]"
11. Send email to customer (if preference enabled)
12. Emit Socket.io `bid:new` to room `ticket:${ticketId}`
13. Return bid

**acceptBid:**
1. Verify customer owns the ticket
2. Verify bid belongs to this ticket and status is `pending`
3. Set accepted bid status to `accepted`
4. Set `ticket.assignedProviderId`, `ticket.acceptedBidId`
5. Change ticket status to `assigned`
6. **Bulk-update** all other bids on this ticket to `declined`
7. Close bidding: `ticket.isBiddingOpen = false`
8. Notify accepted provider: "Your bid was accepted!"
9. Notify declined providers: "Your bid was not selected"
10. Emit Socket.io events to all parties
11. Return updated ticket

**withdrawBid:**
- Provider can only withdraw their own pending bid
- If it was the only bid and ticket is `bids_received`, revert ticket to `open`

### 5.3 Phase 5 checklist
- [ ] Provider cannot bid on a ticket twice
- [ ] Only approved providers can bid
- [ ] Accepting a bid declines all other bids atomically
- [ ] Bidding is closed on ticket when bid accepted
- [ ] Notifications sent to all affected providers on acceptance
- [ ] Provider can withdraw bid and ticket status reverts correctly

---

## Phase 6 — Delivery module

### 6.1 Delivery routes

| Method | Path | Auth | Role | Controller |
|--------|------|------|------|-----------|
| POST | /tickets/:ticketId/delivery/schedule | ✓ | customer | schedulePickup |
| GET | /tickets/:ticketId/delivery | ✓ | customer, provider | getDeliveries |
| POST | /delivery/:deliveryId/confirm-otp | ✓ | customer, provider | confirmOtp |
| POST | /delivery/:deliveryId/advance | ✓ | admin | advanceDeliveryStatus (manual trigger for testing) |

### 6.2 Delivery service logic

**schedulePickup (outbound leg):**
1. Verify ticket exists, customer owns it, status is `assigned`
2. Check no outbound delivery already exists for this ticket
3. Validate: `scheduledTime` (required, must be in future, within next 7 days)
4. Generate mock agent (random from a seeded list of 10 mock agents with name, phone, vehicleNo)
5. Generate 6-digit OTP: `Math.floor(100000 + Math.random() * 900000).toString()`
6. Hash OTP with bcrypt (salt: 10)
7. Set `otpExpiresAt = scheduledTime + 30 minutes` — OTP is for provider to confirm receipt
8. Set `estimatedArrival = scheduledTime + 45 minutes` (simulated)
9. Create Delivery document (`leg: 'outbound'`)
10. Update ticket status to `pickup_scheduled`, append history
11. Send OTP to **provider** via in-app notification and email (they enter it when device arrives)
12. Schedule Bull delayed job `delivery-advance` to fire at `scheduledTime + 30min` (advances to `in_transit`)
13. Emit Socket.io `delivery:scheduled`
14. Return delivery (without `otpHash`)

**confirmOtp:**
- Outbound: provider confirms receipt. Verify OTP against hash. On success → delivery status `delivered_to_provider`, ticket status `device_received`.
- Return: customer confirms receipt. Verify OTP against hash. On success → delivery status `delivered_to_customer`, ticket status `delivered`.
- OTP is single-use: set `otpVerified: true` and clear `otpHash` after success.
- Throw `ApiError(400, 'Invalid or expired OTP')` on failure. No brute-force: lock after 3 failed attempts (track attempts on delivery doc).

**Return delivery (triggered by provider marking repair_complete):**
1. Generate new OTP (now for **customer** to confirm)
2. Create Delivery doc with `leg: 'return'`
3. Update ticket status to `repair_complete`
4. Send OTP to **customer**
5. Schedule Bull job for simulated transit

**Bull job processor (`jobs/deliveryAdvance.js`):**
- Receives `{ deliveryId, targetStatus }`
- Updates delivery status
- Appends to `statusHistory`
- Emits `delivery:status-updated` via Socket.io to `ticket:${ticketId}` room

### 6.3 Phase 6 checklist
- [ ] OTP is bcrypt-hashed in DB, never returned in API response
- [ ] OTP expires correctly and fails after expiry
- [ ] After 3 failed OTP attempts, delivery is locked and admin is notified
- [ ] Bull delayed jobs fire and advance delivery status
- [ ] Socket.io events emitted on every delivery status change
- [ ] Return delivery automatically created when provider marks repair complete
- [ ] Ticket status stays in sync with delivery status

---

## Phase 7 — Notifications, chat & reviews

### 7.1 Notification service (`services/NotificationService.js`)

Create a `createNotification(userId, { type, title, message, link, metadata })` function. After creating the DB document, emit `notification:new` via Socket.io to room `user:${userId}`.

Create `NotificationService` methods:
- `notifyCustomer(customerId, payload)` — wraps createNotification
- `notifyProvider(providerUserId, payload)` — wraps createNotification
- `notifyBidReceived(ticket, bid, provider)` — notify customer
- `notifyBidAccepted(ticket, provider)` — notify provider user
- `notifyBidDeclined(ticket, provider)` — notify provider user
- `notifyStatusChange(ticket, newStatus)` — notify relevant party based on who needs to act
- `notifyDeliveryUpdate(ticket, delivery)` — notify both parties
- `notifyOtp(userId, otp, leg)` — send OTP

### 7.2 Notification routes

| Method | Path | Controller |
|--------|------|-----------|
| GET | /notifications | getMyNotifications (paginated, filter: unread, type) |
| PATCH | /notifications/:id/read | markRead |
| PATCH | /notifications/read-all | markAllRead |
| DELETE | /notifications/:id | deleteNotification |

### 7.3 Chat module

**Routes (`/api/v1/tickets/:ticketId/messages`):**

| Method | Path | Auth | Controller |
|--------|------|------|-----------|
| GET | / | ✓ | getMessages (paginated, newest last) |
| POST | / | ✓ | sendMessage |
| POST | /attachments | ✓ | uploadAttachment (multer) |

**sendMessage logic:**
1. Verify sender is customer (owns ticket) or assigned provider
2. Create Message document
3. Emit `chat:message` to Socket.io room `ticket:${ticketId}`
4. Mark all messages from the other party as `isRead: true`
5. Create notification for recipient (if they're not currently in the room — check connected sockets)
6. Return message

### 7.4 Reviews module

**Routes:**

| Method | Path | Auth | Role | Controller |
|--------|------|------|------|-----------|
| POST | /tickets/:ticketId/review | ✓ | customer | submitReview |
| GET | /providers/:providerId/reviews | — | public | getProviderReviews |
| POST | /reviews/:reviewId/reply | ✓ | provider | replyToReview |
| POST | /reviews/:reviewId/flag | ✓ | customer | flagReview |

**submitReview logic:**
1. Verify ticket is `delivered` or `closed`
2. Verify no review already exists for this ticket
3. Validate ratings (1–5 each) and comment
4. Create Review document; post-save hook updates `provider.rating` and `totalReviews` (use `$set` with recalculated average)
5. Notify provider
6. Return review

### 7.5 Phase 7 checklist
- [ ] Every key event in tickets, bids, and delivery creates a notification
- [ ] Socket.io pushes notification to correct user room in real time
- [ ] Chat messages persisted and paginated correctly
- [ ] Chat attachments uploaded to Cloudinary
- [ ] Review only possible after delivery confirmed
- [ ] Only one review per ticket enforced (unique index)
- [ ] Provider rating recalculated correctly on each new review

---

## Phase 8 — Admin module

### 8.1 Admin routes (`/api/v1/admin`) — all require `authenticate + authorize('admin')`

**Users:**
- `GET /users` — paginated, filter by role/status, search by name/email
- `GET /users/:id` — full profile + ticket history
- `PATCH /users/:id/status` — toggle `isActive` (suspend/unsuspend)
- `PATCH /users/:id/ban` — set `isActive: false`, clear all refresh tokens, send ban email

**Providers:**
- `GET /providers` — paginated, filter by approvalStatus
- `GET /providers/:id` — full provider profile + documents + stats
- `PATCH /providers/:id/approve` — set `approvalStatus: 'approved'`, send approval email
- `PATCH /providers/:id/reject` — set `approvalStatus: 'rejected'`, body: `{ reason }`, send rejection email
- `PATCH /providers/:id/suspend` — set `approvalStatus: 'suspended'`

**Tickets:**
- `GET /tickets` — all tickets, filters: status, deviceType, dateRange, customerId, providerId
- `GET /tickets/:id` — full ticket with all populated refs
- `PATCH /tickets/:id/status` — admin override: any status transition allowed
- `PATCH /tickets/:id/reassign` — body: `{ providerId }` — reassign to different provider

**Disputes:**
- `GET /disputes` — tickets with `status: 'disputed'` or flagged reviews
- `PATCH /disputes/:ticketId/resolve` — body: `{ resolution, note }`, `resolution` enum: `['favour_customer','favour_provider','split']`

**Analytics (`GET /analytics`):**
Return aggregated data:
- Total users by role (count)
- Tickets by status, by deviceType, by urgency
- Tickets created per day for last 30 days (`$group` by date)
- Average bid acceptance time
- Top 5 providers by jobs completed
- Revenue: sum of `finalPrice` on closed tickets (last 30 days)
- Average ticket resolution time (from `open` to `delivered` using statusHistory)

**Platform settings:**
- `GET /settings` — return platform config document
- `PUT /settings` — update platform fee %, bidding window duration, device categories

### 8.2 Audit log

Create `models/AuditLog.js`:
```
adminId (ObjectId, ref: 'User')
action (String) — e.g., 'provider.approve', 'user.ban', 'ticket.override'
targetId (ObjectId)
targetModel (String)
before (Mixed) — snapshot before change
after (Mixed) — snapshot after change
ip (String)
at (Date, default: Date.now)
```

Add `createAuditLog(req, action, targetId, targetModel, before, after)` call in every admin controller mutation.

### 8.3 Phase 8 checklist
- [ ] All admin routes blocked for non-admin roles with 403
- [ ] Provider approval sends email and unlocks provider login
- [ ] Provider rejection stores reason and emails provider
- [ ] Admin can override any ticket status
- [ ] Analytics endpoint returns all required aggregations
- [ ] Every admin mutation creates an AuditLog entry

---

## Phase 9 — Socket.io architecture

### 9.1 Socket server setup (`config/socket.js`)

```js
// Authentication middleware on connection
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  // verify JWT, attach socket.user = { _id, role, name }
  // reject with next(new Error('Unauthorized')) if invalid
});

// On connection:
io.on('connection', (socket) => {
  // Auto-join user room
  socket.join(`user:${socket.user._id}`);

  // Client emits 'join-ticket' with ticketId → validate access → join room
  socket.on('join-ticket', async ({ ticketId }) => { ... });

  // Client emits 'leave-ticket'
  socket.on('leave-ticket', ({ ticketId }) => {
    socket.leave(`ticket:${ticketId}`);
  });

  // Client emits 'chat:typing' → broadcast to ticket room
  socket.on('chat:typing', ({ ticketId }) => {
    socket.to(`ticket:${ticketId}`).emit('chat:typing', { userId: socket.user._id });
  });

  socket.on('disconnect', () => { /* cleanup */ });
});
```

### 9.2 Events reference

| Event | Room | Direction | Payload |
|-------|------|-----------|---------|
| `ticket:status-updated` | `ticket:{id}` | server→client | `{ ticketId, status, updatedAt }` |
| `ticket:repair-log-added` | `ticket:{id}` | server→client | `{ ticketId, logEntry }` |
| `bid:new` | `ticket:{id}` | server→client | `{ ticketId, bid }` |
| `bid:accepted` | `ticket:{id}` | server→client | `{ ticketId, bidId }` |
| `delivery:scheduled` | `ticket:{id}` | server→client | `{ ticketId, delivery }` |
| `delivery:status-updated` | `ticket:{id}` | server→client | `{ ticketId, delivery }` |
| `chat:message` | `ticket:{id}` | server→client | `{ message }` |
| `chat:typing` | `ticket:{id}` | server→client | `{ userId }` |
| `notification:new` | `user:{id}` | server→client | `{ notification }` |
| `join-ticket` | — | client→server | `{ ticketId }` |
| `leave-ticket` | — | client→server | `{ ticketId }` |

### 9.3 Access control for joining ticket rooms

Before admitting a socket to `ticket:{id}`, verify:
- Customer: `ticket.customerId === socket.user._id`
- Provider: provider has a bid on ticket OR is assigned provider
- Admin: always allowed

### 9.4 Phase 9 checklist
- [ ] Socket connections require valid JWT
- [ ] User rooms auto-joined on connection
- [ ] Ticket rooms require and verify access
- [ ] All events in the reference table are emitted at the correct moments
- [ ] Typing indicator works (emits to room, excludes sender)
- [ ] Socket disconnects gracefully

---

## Phase 10 — Bull queue jobs

Implement all processors in `jobs/` directory. Register all queues in a central `jobs/index.js`.

### Queues and jobs

**`bidding-expire` queue:**
- Processor: find ticket, check still `isBiddingOpen`, close bidding, set `status: 'no_bids'` if 0 bids, notify customer

**`delivery-advance` queue:**
- Processor: advance delivery status one step. For outbound: `scheduled → picked_up → in_transit`. For return: similar. Each step schedules the next step 15 minutes later (simulated).

**`ticket-auto-close` queue:**
- Scheduled: runs daily (Bull repeatable job, cron: `0 2 * * *`)
- Find all tickets with `status: 'delivered'` and `updatedAt < 7 days ago`
- Set status to `closed`, notify customer review window is closed

**`sla-reminder` queue:**
- Scheduled: runs every 6 hours
- Find tickets `status: 'in_repair'` where last status history entry `at < 48 hours ago`
- Notify provider: "Please update repair status for ticket TKT-xxx"

**`otp-expire` queue:**
- Delayed: fired when `otpExpiresAt` passes
- Set `otpHash = null` on delivery doc

### 10.1 Phase 10 checklist
- [ ] All 5 queue processors implemented and registered
- [ ] Bidding window expiry tested (create ticket, wait for/simulate expiry)
- [ ] Delivery advance chain works: all steps fire in sequence
- [ ] Auto-close job correctly identifies and closes old delivered tickets
- [ ] SLA reminder sends correct notifications without duplication

---

## Phase 11 — Frontend: Auth & shared components

### 11.1 Redux store setup

Configure RTK store in `app/store.js` with slices:
- `authSlice` — `{ user, accessToken, isAuthenticated, isLoading }`
- `notificationsSlice` — `{ items, unreadCount }`
- RTK Query `apiSlice` base (baseQuery with JWT header injection + refresh token retry logic)

**RTK Query base query with refresh logic:**
```js
// On 401, attempt refresh via /auth/refresh, retry original request once.
// On second 401, dispatch logout action.
```

### 11.2 Router setup (`routes/AppRouter.jsx`)

```jsx
// Public routes: /, /login, /register, /forgot-password, /reset-password, /verify-email, /providers (browse)
// Customer routes (PrivateRoute role="customer"):
//   /dashboard, /tickets, /tickets/new, /tickets/:id, /tickets/:id/delivery, /profile, /notifications
// Provider routes (PrivateRoute role="provider"):
//   /provider/dashboard, /provider/marketplace, /provider/jobs, /provider/jobs/:ticketId,
//   /provider/delivery/:ticketId, /provider/earnings, /provider/profile, /provider/messages, /provider/reviews
// Admin routes (PrivateRoute role="admin"):
//   /admin/dashboard, /admin/users, /admin/providers, /admin/tickets, /admin/disputes,
//   /admin/analytics, /admin/settings, /admin/audit-log
```

**`PrivateRoute` component:** Checks `isAuthenticated`. If not, redirect to `/login` with `state: { from: location }`. After login, redirect back.

**`RoleRoute` component:** Checks `user.role`. If wrong role, redirect to their correct dashboard.

### 11.3 Shared components

Build these reusable components in `components/`:

- **`StatusBadge`** — takes `status` string, renders pill with correct color using `STATUS_COLORS` map
- **`TicketCard`** — compact ticket summary card for lists
- **`DeviceIcon`** — renders correct Lucide icon for deviceType
- **`UrgencyBadge`** — low/medium/high with color
- **`ProviderCard`** — shop info card for marketplace/browse
- **`BidCard`** — bid details with accept/reject actions
- **`Pagination`** — next/prev + page numbers
- **`FileUpload`** — drag-and-drop zone with preview, calls Cloudinary signed upload
- **`ConfirmDialog`** — generic shadcn Dialog for destructive actions
- **`NotificationBell`** — icon with unread badge, dropdown of recent 5
- **`ChatThread`** — messages list + input box, Socket.io integrated
- **`StatusStepper`** — horizontal/vertical step tracker showing ticket journey
- **`LoadingSpinner`** / **`PageSkeleton`** — loading states
- **`EmptyState`** — empty list illustration + CTA button
- **`ErrorBoundary`** — React error boundary wrapping all routes

### 11.4 useSocket hook (`hooks/useSocket.js`)

```js
export function useSocket() {
  // Connect with auth.token from Redux store
  // Expose: socket instance, connected state
  // Auto-reconnect on token refresh
  // Cleanup on unmount
}
```

### 11.5 Phase 11 checklist
- [ ] RTK Query retry logic works (refreshes token on 401 and retries)
- [ ] PrivateRoute redirects unauthenticated users
- [ ] RoleRoute prevents cross-role access (customer can't visit /admin/*)
- [ ] All shared components render without errors
- [ ] `useSocket` connects authenticated and joins user room
- [ ] Notification bell shows live unread count from Socket.io

---

## Phase 12 — Customer portal pages

Build all pages in `features/` with these requirements:

### Page: Landing (`/`)
- Animated hero: "Get your device fixed, stress-free" + CTA buttons (Raise a ticket, Browse providers)
- Device category grid (Mobile, Laptop, PC/Desktop, Gaming Console) — clicking pre-selects deviceType in ticket form
- How it works: 3 cards (Post your problem → Get bids → Device repaired & returned)
- Featured providers: 3 provider cards (fetch top-rated approved providers)
- Customer testimonials: static or from reviews
- FAQ accordion (5 common questions)
- Footer with links

### Page: Register (`/register`)
- Role selector: "I need a repair" (customer) vs "I'm a repair shop" (provider)
- For provider: show extra fields: shopName, serviceCategories (multi-select checkboxes), city, serviceRadius
- Password strength indicator
- On success: show "Check your email to verify your account" message

### Page: Customer Dashboard (`/dashboard`)
- Greeting with user name + avatar
- Stats row: Active tickets, Pending bids, Completed repairs, Pending reviews
- Active tickets list (max 5, "View all" link)
- Quick action: "Raise a new repair request" button
- Recent activity timeline (last 5 status changes across all tickets)
- Pending review cards (tickets that are delivered but not reviewed)

### Page: Raise Ticket (`/tickets/new`)
Multi-step wizard with progress bar (4 steps):

**Step 1 — Device:**
- Device type selector (big icon cards: Mobile, Laptop, PC, Console)
- Brand (text input with autocomplete suggestions)
- Model (text input)
- Serial number (optional)

**Step 2 — Problem:**
- Issue title (short description, max 100 chars, with char counter)
- Issue description (textarea, min 30 chars)
- Photo upload (up to 5 images, FileUpload component)
- Urgency selector (Low / Medium / High with descriptions)

**Step 3 — Preferences:**
- Budget range: min and max inputs with a dual-thumb range slider
- Preferred handover: Pickup & Delivery vs Drop-off at shop
- If pickup: address fields (street, city, state, pincode) with "Use saved address" shortcut

**Step 4 — Review & Submit:**
- Full summary of all entries
- Edit links back to each step
- Submit button → on success, show ticket ID and redirect to `/tickets/:id`

### Page: My Tickets List (`/tickets`)
- Filter tabs: All, Open, In Progress, Completed, Cancelled
- Search bar: search by ticket number or device model
- Sort: Newest, Oldest, Urgency
- TicketCard grid (status badge, device type icon, provider name if assigned, last updated)
- Pagination
- Empty state with CTA for first ticket

### Page: Ticket Detail (`/tickets/:id`)
Real-time page. Join Socket.io room `ticket:${id}` on mount, leave on unmount.

Layout:
- Left column (60%): StatusStepper → Ticket info card → Repair log (if in_repair) → Chat thread
- Right column (40%): Provider card (if assigned) OR Bids list (if not assigned) → Delivery card (if applicable) → Actions

**Bids list (when status is `bids_received`):**
- Each BidCard shows: provider avatar, shopName, rating, totalJobs, quotedPrice, estimatedDays, notes
- "Accept bid" button (opens ConfirmDialog)
- "View profile" link → provider public profile

**Actions by status:**
- `open` / `bids_received`: Cancel ticket button
- `assigned`: Schedule pickup button (opens time-slot picker modal)
- `delivered`: Leave review button
- `delivered` or `closed`: Download repair summary (PDF generation — use `jspdf` or `html2canvas`)

**OTP entry modal:** When status is `return_in_transit` and customer needs to confirm receipt, show OTP input field modal. On confirm, call `/delivery/:id/confirm-otp`. Show success animation.

**Real-time updates:** Listen to `ticket:status-updated`, `bid:new`, `chat:message`, `delivery:status-updated` and update UI accordingly without page refresh.

### Page: Delivery Tracker (`/tickets/:id/delivery`)
- Two-leg journey visualization:
  ```
  [Your location] → [In transit] → [Repair shop] → [In transit] → [Your location]
  ```
  Each node shows an icon + label. Current active node is highlighted with a pulse animation.
- Active delivery card: agent name (masked phone), vehicle number, ETA countdown timer
- History of delivery status changes with timestamps
- OTP entry section (when applicable)

### Page: Browse Providers (`/providers`)
- Filters: device type (multi-select), city, min rating, sort (rating, jobs done, newest)
- Provider cards in a grid
- Clicking opens Provider Profile page (`/providers/:id`): shop info, specializations, operating hours, reviews list, "Get a quote" button (links to `/tickets/new?provider=${id}`)

### Page: Notifications Centre (`/notifications`)
- Filter: All, Unread, Bids, Status updates, Delivery, System
- Mark all read button
- Each notification: icon (type-based), title, message, relative time, link
- Delete notification action

### Page: My Profile & Settings (`/profile`)
- Tabs: Profile, Addresses, Notifications, Security, Device History
- **Profile:** edit name, phone, avatar upload
- **Addresses:** CRUD for saved pickup addresses
- **Notifications:** toggle email, in-app preferences
- **Security:** change password form
- **Device History:** list of unique devices from past tickets, re-raise shortcut

### 12.1 Phase 12 checklist
- [ ] All 11 customer pages render without errors
- [ ] Multi-step ticket form preserves data between steps
- [ ] Ticket detail updates in real time (no refresh needed)
- [ ] OTP entry modal works end-to-end
- [ ] Delivery tracker shows correct stage and ETA countdown
- [ ] Socket.io room joined/left correctly on page mount/unmount
- [ ] All empty states and loading skeletons are implemented

---

## Phase 13 — Provider portal pages

### Page: Provider Dashboard (`/provider/dashboard`)
- KPI cards: Active jobs (status `in_repair` + `device_received`), Bids pending response, Completed this month, Rating score
- "New available tickets" feed (3 most recent marketplace tickets in provider's specialty)
- Jobs needing action: device expected today, repairs overdue, awaiting delivery
- Revenue chart: bar chart (last 7 days earnings), line chart (last 30 days)
- Quick links: Go to marketplace, My jobs, My profile

### Page: Ticket Marketplace (`/provider/marketplace`)
- Sticky filter panel: Device type checkboxes, Urgency checkboxes, Budget range slider, Distance/city filter
- Sort: Newest, Highest budget, Most urgent
- TicketCard grid with "Submit bid" button on each card
- **Submit bid modal** (opens on "Submit bid" click):
  - Quoted price input (with currency symbol)
  - Estimated working days
  - Notes textarea
  - "Submit" → POST /tickets/:id/bids → optimistic update
- Real-time: listen for `bid:accepted` (if their bid is accepted while browsing, toast notification)

### Page: My Jobs (`/provider/jobs`)
- Tabs: Active, Awaiting device, In progress, Completed, Rejected/Withdrawn
- Each row: ticket number, device, customer name (first name only), status pill, deadline, action button
- Quick status update from list (e.g., "Mark in repair" button)

### Page: Job Management (`/provider/jobs/:ticketId`)
Active repair interface. Real-time page (join ticket room).

Layout:
- **Top bar:** Ticket number, device, customer name, urgency badge, quick status update button
- **Status control panel:** Current status + "Next action" button (based on state machine), with confirmation
- **Device receipt OTP:** If `pickup_scheduled` and awaiting OTP from customer scheduling outbound, show OTP entry field
- **Diagnosis & repair log:**
  - Log entry form: type dropdown, note textarea, visibility toggle (internal/shared), photo upload
  - Add entry button
  - Log entries list (chronological, internal entries visually different)
- **Parts tracker:** Add parts used (name, cost) — array appended to repair log entry of type `parts_ordered`
- **Before/after photos:** Upload section, displayed in a comparison view
- **Chat with customer:** ChatThread component
- **Mark repair complete:** Big prominent button → triggers return delivery creation → confirmation dialog

### Page: Delivery Management (`/provider/delivery/:ticketId`)
- Current delivery status for this ticket (both legs)
- Outbound leg: show OTP input if device expected, confirm receipt, view pickup details
- Return leg: after marking repair complete, schedule return dispatch time, view delivery status
- Delivery history log

### Page: Earnings (`/provider/earnings`)
- Summary cards: Total earned (all time), This month, Pending payout, Platform fee paid
- Completed jobs table: ticket no, device, final price, platform fee (10%), net earned, date
- Revenue chart (monthly bar chart, last 6 months)
- Invoice button per job: generates downloadable PDF invoice
- Payout section: "Coming soon" banner (stub)

### Page: Shop Profile Editor (`/provider/profile`)
- Tabs: Shop details, Services & brands, Operating hours, Documents, Reviews
- **Shop details:** logo upload, shop name, description, photos (up to 6), address
- **Services:** device type checkboxes, brand specialization tags (add/remove), service radius slider
- **Operating hours:** day-by-day open/close time pickers + "closed" toggle
- **Documents:** upload certifications, business license (view existing, replace)
- **Reviews:** list of received reviews (with reply functionality)

### Page: Inbox / Messages (`/provider/messages`)
- Left panel: list of active ticket threads (sorted by unread, then recent)
- Right panel: ChatThread for selected ticket
- Real-time: Socket.io updates message list

### 13.1 Phase 13 checklist
- [ ] All 8 provider pages render without errors
- [ ] Marketplace bid submission works with optimistic update
- [ ] Job management status controls enforce state machine
- [ ] Repair log entries saved and displayed correctly
- [ ] OTP entry on delivery works for provider (outbound leg)
- [ ] Mark repair complete auto-creates return delivery
- [ ] Earnings table shows correct platform fee calculation

---

## Phase 14 — Admin console pages

### Page: Admin Dashboard (`/admin/dashboard`)
- Platform health bar: total users, total providers (approved), active tickets, today's revenue
- Alert section: pending provider approvals (count + "Review" link), open disputes (count)
- Charts: tickets created (last 7 days, area chart), device type breakdown (donut chart)
- Top providers table: rank, name, jobs, rating, revenue
- Recent sign-ups table

### Page: User Management (`/admin/users`)
- Search + filter (role, status, join date range)
- Table: name, email, role, status pill, joined date, actions (View, Suspend, Ban)
- User detail modal/drawer: full profile, linked ticket history, account actions
- Export CSV button

### Page: Provider Approvals (`/admin/providers`)
- Tabs: Pending, Approved, Rejected, Suspended
- **Pending queue:** each card shows shopName, owner name, categories, city, documents (clickable to view full-screen), submitted date
- "Approve" (green confirm button), "Reject" (opens rejection reason input), "Request info" (sends message to provider)
- Approved tab: searchable table with suspend action
- All actions create AuditLog entries

### Page: All Tickets (`/admin/tickets`)
- Advanced filters: status (multi-select), deviceType, dateRange, customerId input, providerId input
- Table: ticketNo, customer, device, provider (or Unassigned), status, created, actions
- Admin actions: Override status (any state), Reassign provider (search modal), View full detail
- Export CSV

### Page: Disputes (`/admin/disputes`)
- List of disputed tickets and flagged reviews
- Each dispute card: ticket info, customer complaint, provider response, timeline
- Resolution panel: radio buttons (Favour customer / Favour provider / Split), notes textarea, resolve button
- Resolution actions automatically update ticket status and notify both parties

### Page: Analytics (`/admin/analytics`)
- Date range picker (default: last 30 days)
- KPI cards: new users, new tickets, tickets closed, total revenue
- Charts: tickets by status (bar), tickets by device type (donut), revenue trend (line), avg resolution time (bar by device type)
- Top providers table: jobs, avg rating, revenue generated
- Customer retention: % of users with 2+ tickets
- Export report PDF button

### Page: Platform Settings (`/admin/settings`)
- Platform fee % (number input with save)
- Bidding window duration (hours — default 24)
- Delivery simulation duration (minutes — default 30)
- Device categories management: list with add/edit/remove
- Service cities: tag input to add/remove supported cities
- Maintenance mode toggle (shows maintenance banner sitewide)
- Feature flags: delivery system enabled, chat enabled, reviews enabled

### Page: Audit Log (`/admin/audit-log`)
- Filter: action type, date range, admin user
- Table: timestamp, admin name, action, target (clickable link), before/after JSON diff
- Read-only, no delete

### 14.1 Phase 14 checklist
- [ ] All 8 admin pages render without errors
- [ ] Provider approval/rejection sends emails
- [ ] Ticket override changes status and creates audit log
- [ ] Analytics charts render with real aggregated data
- [ ] Dispute resolution sends notifications to both parties
- [ ] Platform settings changes take effect without restart (loaded from DB, not env)
- [ ] Audit log entries are immutable

---

## Phase 15 — Security, error handling & testing

### 15.1 Security hardening (backend)

1. **Helmet.js**: enable all defaults
2. **CORS**: whitelist only `CLIENT_URL`, `credentials: true`
3. **Rate limiting**: stricter limits on auth endpoints (5/15min), general (100/15min)
4. **mongo-sanitize**: prevent NoSQL injection (wrap all req.body, req.params, req.query)
5. **XSS protection**: sanitize all string inputs before saving (use `xss` package on text fields)
6. **HTTP parameter pollution**: use `hpp` middleware
7. **Secure cookies**: `httpOnly: true`, `sameSite: 'strict'`, `secure: process.env.NODE_ENV === 'production'`
8. **JWT**: never log tokens. Access token never stored in localStorage on frontend — store in React state (Redux) only.
9. **File uploads**: validate MIME type server-side (not just extension). Only allow `image/jpeg`, `image/png`, `image/webp` for photos. Max 10 MB.
10. **ObjectId validation**: validate all `:id` params are valid Mongoose ObjectIds before querying
11. **Provider access scoping**: every provider controller must verify `provider.userId === req.user._id`
12. **Customer access scoping**: every customer controller must verify resource ownership

### 15.2 Frontend security

1. Access token in Redux state only (memory). On refresh, re-fetch from `/auth/refresh` using httpOnly cookie.
2. Sanitize any user-generated HTML before rendering (use `DOMPurify` if rendering HTML)
3. Never log auth tokens to console
4. Implement CSP headers via meta tag for `default-src 'self'`

### 15.3 Error handling conventions

**Backend:**
- All async controllers wrapped in `asyncHandler`
- All operational errors thrown as `new ApiError(statusCode, message)`
- Global error handler formats all errors into envelope format
- Unhandled promise rejections and uncaught exceptions: log + graceful shutdown

**Frontend:**
- `ErrorBoundary` wraps all route components
- RTK Query `error` state shown in all query components
- Form errors shown inline below each field (from Zod validation)
- Network errors → toast notification "Something went wrong. Please try again."
- 401 on any request → auto-logout + redirect to login

### 15.4 Testing

Write tests for:

**Backend (Jest + Supertest):**
- Auth: register, login, token refresh, email verification
- Tickets: create, state machine transitions, unauthorized access
- Bids: submit, accept (cascade decline), withdraw
- Delivery: schedule, OTP verify, OTP expiry
- Admin: provider approve, user suspend

**Frontend (React Testing Library):**
- Register form validation
- Login redirect by role
- Ticket creation wizard (step navigation)
- Ticket detail real-time update (mock Socket.io)
- Bid accept flow

### 15.5 Phase 15 checklist
- [ ] All security middleware applied and tested
- [ ] SQL/NoSQL injection attempts return 400, not 500
- [ ] Access token never visible in localStorage or cookies
- [ ] File upload rejects non-image files and oversized files
- [ ] Cross-user data access returns 403 in all modules
- [ ] All async controllers handle errors without crashing server
- [ ] At least 60% test coverage on backend services

---

## Phase 16 — Deployment

### 16.1 Infrastructure

| Service | Provider | Plan |
|---------|----------|------|
| Frontend | Vercel | Free / Hobby |
| Backend | Railway or Render | Free tier |
| Database | MongoDB Atlas | M0 Free |
| Redis | Upstash | Free (10k commands/day) |
| File storage | Cloudinary | Free (25 GB) |
| Email | SendGrid | Free (100/day) |

### 16.2 Vercel (frontend)

1. Connect GitHub repo, set root to `frontend/`
2. Build command: `npm run build`
3. Output dir: `dist`
4. Add all `VITE_*` env vars in Vercel dashboard
5. Set up `vercel.json` for SPA routing:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### 16.3 Railway/Render (backend)

1. Connect GitHub repo, set root to `backend/`
2. Start command: `node src/index.js`
3. Add all env vars in dashboard
4. Set `NODE_ENV=production`
5. Enable health check endpoint: `GET /api/v1/health` → returns `{ status: 'ok', timestamp: new Date() }`

### 16.4 Production checklist
- [ ] `NODE_ENV=production` set on backend
- [ ] CORS only allows production frontend URL
- [ ] MongoDB Atlas IP whitelist includes Railway/Render IP range (or set 0.0.0.0/0 for now)
- [ ] All env vars set in deployment dashboards (no .env files committed)
- [ ] Health check endpoint returns 200
- [ ] Frontend builds successfully with no console errors
- [ ] HTTPS enforced (Vercel and Railway handle this automatically)
- [ ] Cookie `secure: true` in production
- [ ] Error logs monitored (Railway/Render have built-in log streaming)

---

## Reference: Constants & enums

Define these in `frontend/src/constants/index.js` and mirror in `backend/src/constants/index.js`:

```js
export const DEVICE_TYPES = ['mobile', 'laptop', 'pc', 'console'];
export const DEVICE_TYPE_LABELS = { mobile: 'Mobile Phone', laptop: 'Laptop', pc: 'PC / Desktop', console: 'Gaming Console' };
export const DEVICE_TYPE_CODES = { mobile: 'MOB', laptop: 'LAP', pc: 'PC', console: 'CON' };

export const TICKET_STATUSES = [
  'open', 'bids_received', 'assigned', 'pickup_scheduled',
  'device_in_transit', 'device_received', 'in_repair',
  'repair_complete', 'return_in_transit', 'delivered',
  'closed', 'cancelled', 'disputed', 'no_bids'
];

export const STATUS_LABELS = {
  open: 'Open', bids_received: 'Bids Received', assigned: 'Assigned',
  pickup_scheduled: 'Pickup Scheduled', device_in_transit: 'Device in Transit',
  device_received: 'Device Received', in_repair: 'In Repair',
  repair_complete: 'Repair Complete', return_in_transit: 'Return in Transit',
  delivered: 'Delivered', closed: 'Closed', cancelled: 'Cancelled',
  disputed: 'Disputed', no_bids: 'No Bids Received'
};

export const STATUS_COLORS = {
  open: 'blue', bids_received: 'blue', assigned: 'green',
  pickup_scheduled: 'amber', device_in_transit: 'amber',
  device_received: 'amber', in_repair: 'amber',
  repair_complete: 'purple', return_in_transit: 'purple',
  delivered: 'green', closed: 'gray', cancelled: 'red',
  disputed: 'red', no_bids: 'gray'
};

export const URGENCY_OPTIONS = [
  { value: 'low', label: 'Low', description: 'Happy to wait 5–7 days' },
  { value: 'medium', label: 'Medium', description: 'Need it within 3–4 days' },
  { value: 'high', label: 'High', description: 'Urgent — within 1–2 days' }
];

export const ROLES = { CUSTOMER: 'customer', PROVIDER: 'provider', ADMIN: 'admin' };

export const PLATFORM_FEE_PERCENT = 10;

export const BIDDING_WINDOW_HOURS = 24;
export const OTP_EXPIRY_MINUTES = 30;
export const OTP_MAX_ATTEMPTS = 3;
export const REVIEW_WINDOW_DAYS = 7;
export const AUTO_CLOSE_DAYS = 7;

export const MOCK_AGENTS = [
  { name: 'Rajan Kumar', phone: '+91 98765 XXXXX', vehicleNo: 'TN 01 AB 1234' },
  { name: 'Priya Sharma', phone: '+91 87654 XXXXX', vehicleNo: 'TN 02 CD 5678' },
  { name: 'Arjun Nair', phone: '+91 76543 XXXXX', vehicleNo: 'TN 03 EF 9012' },
  { name: 'Divya Menon', phone: '+91 65432 XXXXX', vehicleNo: 'TN 04 GH 3456' },
  { name: 'Karthik Raja', phone: '+91 54321 XXXXX', vehicleNo: 'TN 05 IJ 7890' }
];
```

---

## Reference: Notification messages

Define all notification templates centrally so they're consistent:

```js
export const NOTIFICATION_TEMPLATES = {
  TICKET_CREATED: (ticketNo) => ({
    title: 'Ticket raised successfully',
    message: `Your repair request ${ticketNo} is live. Providers will start bidding soon.`
  }),
  BID_RECEIVED: (shopName, ticketNo) => ({
    title: 'New bid received',
    message: `${shopName} has placed a bid on your ticket ${ticketNo}.`
  }),
  BID_ACCEPTED: (ticketNo) => ({
    title: 'Your bid was accepted!',
    message: `The customer accepted your bid on ticket ${ticketNo}. Check job details to proceed.`
  }),
  BID_DECLINED: (ticketNo) => ({
    title: 'Bid not selected',
    message: `Your bid on ticket ${ticketNo} was not selected. Better luck next time!`
  }),
  PICKUP_SCHEDULED: (time, ticketNo) => ({
    title: 'Device pickup scheduled',
    message: `Pickup for ticket ${ticketNo} is scheduled at ${time}. Please have the device ready.`
  }),
  OTP_FOR_PROVIDER: (otp, ticketNo) => ({
    title: 'Device handover OTP',
    message: `OTP for receiving device for ticket ${ticketNo}: ${otp}. Valid for 30 minutes.`
  }),
  OTP_FOR_CUSTOMER: (otp, ticketNo) => ({
    title: 'Device return OTP',
    message: `OTP to confirm return of your device for ticket ${ticketNo}: ${otp}. Valid for 30 minutes.`
  }),
  DEVICE_RECEIVED: (ticketNo) => ({
    title: 'Device received by shop',
    message: `The repair shop has confirmed receipt of your device for ticket ${ticketNo}. Repair work will begin soon.`
  }),
  REPAIR_COMPLETE: (ticketNo) => ({
    title: 'Repair complete!',
    message: `Your device has been repaired for ticket ${ticketNo}. It will be dispatched back to you shortly.`
  }),
  DEVICE_DELIVERED: (ticketNo) => ({
    title: 'Device delivered',
    message: `Your device has been delivered for ticket ${ticketNo}. Please leave a review!`
  }),
  SLA_REMINDER: (ticketNo) => ({
    title: 'Repair update overdue',
    message: `Please update the repair status for ticket ${ticketNo}. The customer is waiting.`
  }),
  NO_BIDS: (ticketNo) => ({
    title: 'No bids received',
    message: `Ticket ${ticketNo} received no bids. Try widening your budget or device category.`
  }),
};
```

---

## Final project checklist

Before marking the project complete, verify every item:

### Backend
- [ ] All 8 MongoDB models implemented with correct indexes
- [ ] All RBAC middleware tested (customer, provider, admin routes blocked correctly)
- [ ] Auth: register, login, refresh, logout, verify-email, forgot-password, reset-password
- [ ] Tickets: full CRUD + state machine enforcement
- [ ] Bids: submit, accept (cascade decline), withdraw, expire
- [ ] Delivery: schedule (outbound + return), OTP verify, Bull job automation
- [ ] Notifications: created for all key events, Socket.io push working
- [ ] Chat: messages saved, paginated, real-time
- [ ] Reviews: one per ticket, rating aggregation, provider reply
- [ ] Admin: all endpoints working with audit logging
- [ ] Bull queues: all 5 processors tested
- [ ] Global error handler formats all error types correctly
- [ ] Rate limiting applied to auth endpoints
- [ ] Security middleware: helmet, cors, mongo-sanitize, hpp applied

### Frontend
- [ ] Auth flow: register → verify email → login → redirect by role
- [ ] Customer: all 11 pages render with real data
- [ ] Provider: all 8 pages render with real data
- [ ] Admin: all 8 pages render with real data
- [ ] Socket.io: ticket rooms joined/left, all events handled in UI
- [ ] RTK Query: token refresh retry working on 401
- [ ] All forms have client-side Zod validation
- [ ] All loading, empty, and error states implemented
- [ ] Toast notifications for all user actions
- [ ] Mobile responsive (min 375px viewport)

### Integration
- [ ] Ticket creation → bids → accept → delivery → OTP → review: full flow works end-to-end
- [ ] Bull delayed jobs fire correctly in real time
- [ ] Email notifications sent at correct trigger points
- [ ] Admin approval of provider unlocks provider login immediately
- [ ] Platform fee calculated and displayed correctly in earnings

---

*End of RepairLink master implementation prompt. Total coverage: 16 phases, 3 portals, 8 MongoDB models, 5 Bull queues, full Socket.io event system, RBAC, mock delivery with OTP, and deployment.*
