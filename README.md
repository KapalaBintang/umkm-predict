# InstaTrend - AI-Powered Market Trend Analysis for SMEs

InstaTrend is an intelligent platform designed to help Small and Medium Enterprises (SMEs) analyze market trends and predict seasonal product demand using AI technology. The platform provides interactive chat assistance, trend visualization, and seasonal calendars to maximize sales opportunities.

## 🎯 Key Features

- **AI Chat Assistant**: Get insights and seasonal product trend predictions through interactive chat
- **Trend Analysis**: Market trend visualization and in-depth analysis for seasonal SME products
- **Seasonal Calendar**: Important event schedules and product preparation recommendations
- **User Authentication**: Secure login and registration system
- **Responsive Dashboard**: Real-time analytics and insights

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**:
  - shadcn/ui
  - Radix UI primitives
  - Framer Motion
- **Backend & Authentication**: Firebase
- **Charts**: Recharts
- **AI Integration**: Google Gemini

## 📦 Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/instatrend.git
cd instatrend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your Firebase configuration:

```env
GEMINI_API_KEY=your_gemini_api_key
SERPAPI_API_KEY=your_serpapi_api_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Run the development server:

```bash
npm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Contributing

### Branching Strategy

We follow the Git Flow branching strategy:

- `main`: Production-ready code
- `develop`: Main development branch
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Urgent production fixes
- `release/*`: Release preparation

### Commit Convention

We use Conventional Commits for clear communication:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

Example:

```bash
feat(auth): add Google OAuth login
fix(chat): resolve message ordering issue
docs(readme): update installation instructions
```

## 📄 License

[MIT License](LICENSE)
