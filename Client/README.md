# Gig Connect

Gig Connect is a comprehensive freelancing platform designed to bridge the gap between service providers and freelancers. It facilitates seamless collaboration, project management, and secure payments through a modern and intuitive interface.

## 🚀 Features

- **User Roles**: Distinct flows for **Providers** (posting jobs) and **Freelancers** (applying for jobs), or a dual **Both** role.
- **Authentication**: Secure Signup/Login with Email & OTP verification, and Google OAuth integration.
- **Gig Management**:
  - Providers can create, edit, and manage gigs.
  - Freelancers can browse, filter, and apply to gigs.
- **Spotlight (New)**: A dedicated showcase area for users to display their top projects to the community.
- **Real-time Communication**: Integrated global chat and context-specific ticket messaging / negotiation.
- **Ticketing System**: Structured workflow for active jobs (Negotiation -> In Progress -> Submission -> Completion).
- **Wallet & Coins**: Internal currency system for premium features and transactions.
- **Responsive Design**: Built with a mobile-first approach using Tailwind CSS.

## 🛠️ Tech Stack

### Client
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS, PostCSS
- **State/Routing**: React Router DOM, Context API
- **Animations**: Framer Motion, React Spring, Lottie
- **Utilities**: Axios, Lucide React, Recharts, Moment.js

### Server
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io
- **Authentication**: JWT, Passport.js (Google OAuth), Bcrypt
- **Cloud Storage**: Cloudinary (for profile pics, attachments)
- **AI Integration**: Google Generative AI (Gemini)
- **Email**: Nodemailer

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URL)
- [Git](https://git-scm.com/)

You will also need API keys for:
- Cloudinary
- Google OAuth (optional for Social Login)
- Google Gemini AI (optional for AI features)

## 📦 Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/Gig_Connect.git
    cd Gig_Connect
    ```

2.  **Server Setup**
    Navigate to the server directory and install dependencies:
    ```bash
    cd Server
    npm install
    ```
    Create a `.env` file in the `Server` directory with the following variables:
    ```env
    PORT=5000
    MONGODB_URL=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    SESSION_SECRET=your_session_secret
    
    # Email Configuration
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_email_app_password

    # Cloudinary
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret

    # Google Auth (Optional)
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

    # AI (Optional)
    GEMINI_API_KEY=your_gemini_api_key
    ```

3.  **Client Setup**
    Navigate to the client directory and install dependencies:
    ```bash
    cd ../client
    npm install
    ```
    Create a `.env` file in the `client` directory (or use `.env.example` as a template):
    ```env
    VITE_API_URL=http://localhost:5000
    VITE_APP_NAME=Gig Connect
    VITE_ENABLE_GOOGLE_AUTH=true
    ```

## 🏃‍♂️ Running the Application

1.  **Start the Server** (Terminal 1)
    ```bash
    cd Server
    node server.js
    ```
    *Note: `nodemon` is recommended for development.*

2.  **Start the Client** (Terminal 2)
    ```bash
    cd client
    npm run dev
    ```

3.  Access the application at `http://localhost:5173` (or the port shown in your terminal).

## 📖 Usage Guide

### Getting Started
1.  **Sign Up**: Create an account using your email. Verify your identity using the OTP sent to your inbox.
2.  **Profile Setup**: Complete your profile by adding a bio, skills, college info, and a profile picture.

### For Providers (Hiring)
1.  **Post a Gig**: Go to the "Home" or "Gigs" section and click "Create Gig". Fill in details like title, description, budget, and category.
2.  **Manage Applications**: View applicants for your gig. Check their profiles and ratings.
3.  **Open Ticket**: Accept an applicant to open a "Ticket". This is your workspace for the project.
4.  **Negotiate & Pay**: Discuss terms in the ticket chat. Once agreed, proceed with the workflow.

### For Freelancers (Working)
1.  **Find Work**: Browse the "Home" feed for gigs that match your skills. Filter by category or price.
2.  **Apply**: Submit a proposal with a cover letter.
3.  **Execute**: If accepted, communicate with the provider in the Ticket section. Submit your work when done.

### Spotlight Feature
- Visit the **Spotlight** page to discover trending projects from other users.
- Filter by categories like "Web", "Mobile", or "UI/UX".
- Like and support projects you find inspiring.
- *(Coming Soon)*: Upload your own projects to build your portfolio.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request with your features or fixes.
