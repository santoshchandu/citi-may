# Citizen-Politician Communication Platform

A web application that facilitates communication between citizens and their elected representatives, improving transparency and responsiveness in governance.

## Features

### Multi-Role System

#### 👤 Citizens
- Report issues and concerns
- Provide feedback to politicians
- Track issue status and progress
- View and comment on issues
- Upvote important issues

#### 🏛️ Politicians
- View all citizen issues
- Respond to concerns with comments
- Update issue status (pending → in-progress → resolved)
- Post public updates for constituents
- Engage in discussions

#### 🛡️ Moderators
- Monitor all platform interactions
- Review flagged content
- Approve or remove inappropriate content
- Filter issues by status
- Ensure respectful communication

#### ⚙️ Admins
- Manage user accounts and roles
- View platform analytics
- Add/delete users
- Oversee platform operations
- Monitor issue resolution rates

## Technical Stack

- **Frontend Framework**: React 18.3
- **Build Tool**: Vite 5.4
- **Routing**: React Router DOM 6.26
- **HTTP Client**: Axios 1.7
- **Styling**: Custom CSS with CSS Variables
- **State Management**: React Context API (Authentication)

## Project Structure

```
src/
├── components/        # Reusable components
│   ├── Navbar.jsx
│   └── Navbar.css
├── pages/            # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── CitizenDashboard.jsx
│   ├── PoliticianDashboard.jsx
│   ├── ModeratorDashboard.jsx
│   ├── AdminDashboard.jsx
│   └── IssueDetails.jsx
├── context/          # React Context
│   └── AuthContext.jsx
├── utils/            # Utility functions
│   └── api.js        # API integration with Axios
├── styles/           # Global styles
│   └── App.css
├── main.jsx          # App entry point
├── App.jsx           # Main app component
└── index.css         # Global CSS
```

## Key Features Implementation

### React Hooks (10 marks) ✓
- `useState` for component state management
- `useEffect` for data fetching and side effects
- `useContext` for authentication state
- `useNavigate` for programmatic navigation
- `useParams` for route parameters
- Custom hooks: `useAuth()`

### Routing & Navigation (10 marks) ✓
- Client-side routing with React Router
- Protected routes based on user roles
- Dynamic routing for issue details
- Responsive navigation bar
- Role-based dashboard redirects
- Nested routing structure

### API Integration (10 marks) ✓
- Axios for HTTP requests
- JSONPlaceholder API as mock backend
- Loading states with spinners
- Error handling with user-friendly messages
- API service abstraction layer
- Request/response interceptors
- Mock data transformation for demo purposes

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## Usage

### Login
The app uses a demo authentication system. To login:
1. Go to `/login`
2. Enter any email and password
3. Select a role from the dropdown:
   - **Citizen**: Access citizen dashboard
   - **Politician**: Access politician dashboard
   - **Moderator**: Access moderator dashboard
   - **Admin**: Access admin dashboard

### Demo Credentials
Since this is a demo app, you can use any email/password combination. The role dropdown determines your access level.

## Features Showcase

### Citizens Can:
1. Report new issues with title, category, and description
2. View their submitted issues
3. Track issue status (pending/in-progress/resolved)
4. See statistics of their reports
5. Add comments to issues

### Politicians Can:
1. View all citizen issues
2. Update issue status
3. Post public updates
4. Respond to issues with comments
5. See platform statistics

### Moderators Can:
1. Review flagged content
2. Approve or remove content
3. Monitor all issues
4. Filter issues by status
5. Ensure platform integrity

### Admins Can:
1. Manage all users
2. Add/delete user accounts
3. Change user roles
4. View platform analytics
5. Monitor issue resolution rates

## API Integration Details

The application uses **JSONPlaceholder** as a mock API to demonstrate:
- GET requests with loading states
- POST requests for creating data
- PATCH requests for updates
- DELETE requests for removal
- Error handling
- Loading indicators
- Data transformation

## Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- Real backend API integration
- File uploads for issue evidence
- Email notifications
- Real-time updates with WebSockets
- Advanced search and filters
- Issue voting system
- Geolocation for local issues
- Analytics dashboard
- Export reports to PDF

## License

MIT License

## Author

Created as part of FEDF-PS08 project
# citi-may
