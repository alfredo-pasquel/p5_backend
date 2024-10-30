### **1. Minimum Viable Product (MVP) Checklist**

**Core Features:**
- **User Authentication**:
  - [x] Register and login with JWT-based authentication.
  - [x] Profile page setup with public storefront information, such as basic user details and trade-related info (private data like "saved" and "recently viewed" are non-public).

- **Record Listings**:
  - [x] Record creation with details like title, artist, album ID, genre, cover URL (from Spotify), and optional user-uploaded photos via AWS S3.
  
- **Trading and Community Features**:
  - [ ] Implement “Looking For” list and saved items.
  - [x] Enable JWT-protected real-time messaging between users.

- **Search and Browse**:
  - [ ] Search functionality by artist, genre, and year with filters for location and condition.
  - [ ] Dynamic recommendations on the homepage based on user activity and preferences.

- **Basic Transaction System**:
  - [ ] Implement trade transaction tracking with an option for verified user feedback on completed trades.

---

### **2. Stretch Goals Checklist**

**Enhanced Profile and Storefront Features**:
- [ ] Display feedback from verified trades on public storefronts.
- [ ] Display a cumulative trade count on the storefront.

**Trading and Engagement Enhancements**:
- [ ] Enhanced “Looking For” item visibility to highlight in-demand items across the platform.
- [ ] Trade proposal and negotiation feature.

**Multimedia and Sample Previews**:
- [ ] Embedded Spotify player for track previews.
- [ ] Allow custom sample links (YouTube, SoundCloud) on `RecordDetailsPage`.

**Community Interaction**:
- [ ] Organize virtual meetups or vinyl auctions for enhanced community engagement.

---

### **3. Timeline with Self-Imposed Deadlines**

#### **Phase 1: Core MVP Development (Days 1-8)**
- **Days 1-3**: Project setup, MongoDB Atlas and AWS S3 configuration, and user registration/login.
- **Days 4-5**: Build UI components for ProfilePage, RecordList, and RecordDetailsPage.
- **Days 6-8**: Integrate Spotify API for album data and cover images, implement AWS S3 for user-uploaded photos.

#### **Phase 2: MVP Completion & Testing (Days 9-14)**
- **Days 9-10**: Implement search functionality with filters, and add recommendations to the homepage.
- **Days 11-12**: Finalize messaging, “Looking For,” and saved item features.
- **Days 13-14**: Conduct thorough testing and UI enhancements for deployment.

---

### **4. Documentation for New Technologies**

- **MongoDB Atlas**: Cloud-based NoSQL database with collections for `Users` and `Records`.
- **Spotify API**: Provides album cover, genre, and release date data; access controlled via OAuth.
- **AWS S3**: Used for secure user-uploaded photo storage, with image URLs stored in MongoDB.

---

### **5. Frontend Mockup Outline**

- **Home Page**:
  - Recently viewed items and relevant recommendations by genre, artist, and year.
  
- **Profile Page** (serving as both private profile and public storefront):
  - Public details: user bio, about section, and items available for trade.
  - Private details: messages, “Looking For” items, saved items, and recent purchases.

- **Record Details Page**:
  - Includes album art, Spotify preview, user-uploaded photos, trade initiation options, and optional sample links.

---

### **6. Frontend Routes**

- `/` – Home page with recent views and recommendations.
- `/profile` – Combined profile and storefront with private sections for saved items and trading.
- `/record/:id` – Record detail view showing album data, user-uploaded images, and trade options.
- `/search` – Search page with filtering options for artist, genre, year, and item condition.

---

### **7. Backend Routes**

- **User Authentication**:
  - **POST `/api/users/register`** – Register new users.
  - **POST `/api/users/login`** – User login with JWT.

- **Record Management**:
  - **POST `/api/records/create`** – Create a new record listing with details and album art.
  - **GET `/api/records/:id`** – Fetch specific record details by ID.

- **Profile Management**:
  - **GET `/api/users/:id`** – Retrieve user profile data, including trade-related info and public storefront details.
  - **PUT `/api/users/:id`** – Update profile details, including saved items and “Looking For” list.

---

### **8. Database Diagram**

#### **User Collection**:
- `username` (string, required, unique)
- `email` (string, required, unique)
- `password` (hashed, required)
- `country` (string)
- `favoriteArtists` (array of strings)
- `favoriteGenres` (array of strings)
- `about` (string)
- `lookingFor` (array of record IDs)
- `savedItems` (array of record IDs)
- `recentTrades` (number, default 0)
- `recentlyViewed` (array of record IDs)
- `recordsListedForTrade` (array of record IDs)
- `tradeCount` (number, default 0)
- `feedback` (array of strings)

#### **Record Collection**:
- `title` (string)
- `artist` (string)
- `albumId` (string, Spotify album ID)
- `genres` (array of strings)
- `coverUrl` (string, Spotify album cover)
- `releaseDate` (string)
- `condition` (enum: New/Used)
- `description` (string)
- `shipping` (enum: No Shipping/Local Pickup/US Shipping/International Shipping)
- `userId` (reference to User ID)
- `timestamp` (date, default to current)
