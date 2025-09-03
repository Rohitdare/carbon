# Blue Carbon MRV Web Dashboard

A React.js web dashboard for the Blue Carbon Measurement, Reporting, and Verification (MRV) platform. This dashboard provides role-based interfaces for governments, NGOs, researchers, field workers, and administrators to manage blue carbon projects, MRV reports, and carbon credits.

## Features

### Core Functionality
- **Role-based Access Control**: Different interfaces for different user types
- **Project Management**: Create, view, and manage blue carbon projects
- **MRV Reports**: Submit, review, and verify measurement reports
- **Carbon Credits**: Issue, transfer, and track carbon credits
- **Analytics Dashboard**: Visualize project performance and carbon impact
- **Field Data Collection**: Interface for field workers to upload data

### User Roles
- **Government Officials**: Overview of all projects, credit verification, policy management
- **NGO Representatives**: Project creation, report submission, credit management
- **Researchers**: Data analysis, report creation, research collaboration
- **Field Workers**: Data collection, photo uploads, location tracking
- **Administrators**: System management, user administration, platform configuration

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Icons**: Heroicons
- **Build Tool**: Vite
- **Containerization**: Docker with Nginx

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd web-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the environment variables in `.env`:
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   REACT_APP_AI_ML_API_URL=http://localhost:8000
   REACT_APP_ENABLE_BLOCKCHAIN=true
   REACT_APP_ENABLE_AI_ML=true
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

### Docker Development

1. **Build and run with Docker**
   ```bash
   docker build -t blue-carbon-web-dashboard .
   docker run -p 3000:80 blue-carbon-web-dashboard
   ```

2. **Using Docker Compose (with other services)**
   ```bash
   docker-compose up web-dashboard
   ```

## Project Structure

```
web-dashboard/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Common/        # Common components (LoadingSpinner, ErrorBoundary)
│   │   └── Layout/        # Layout components (Header, Sidebar, Layout)
│   ├── pages/             # Page components
│   ├── services/          # API service functions
│   ├── store/             # Redux store and slices
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions and constants
│   ├── App.tsx            # Main application component
│   └── index.tsx          # Application entry point
├── package.json
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── Dockerfile             # Docker configuration
└── nginx.conf             # Nginx configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests

## API Integration

The dashboard integrates with the following backend services:

### Backend API (Node.js/Express)
- **Base URL**: `http://localhost:3001/api`
- **Authentication**: JWT tokens
- **Endpoints**: Projects, MRV Reports, Carbon Credits, Users

### AI/ML Service (Python/FastAPI)
- **Base URL**: `http://localhost:8000`
- **Authentication**: API keys
- **Endpoints**: Carbon estimation, satellite data, model management

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:3001/api` |
| `REACT_APP_AI_ML_API_URL` | AI/ML service base URL | `http://localhost:8000` |
| `REACT_APP_ENABLE_BLOCKCHAIN` | Enable blockchain features | `true` |
| `REACT_APP_ENABLE_AI_ML` | Enable AI/ML features | `true` |
| `REACT_APP_ENABLE_MOBILE` | Enable mobile app features | `false` |
| `REACT_APP_ENABLE_ANALYTICS` | Enable analytics tracking | `false` |

## Demo Credentials

The application includes demo credentials for testing different user roles:

| Role | Email | Password |
|------|-------|----------|
| Government | gov@example.com | password123 |
| NGO | ngo@example.com | password123 |
| Researcher | researcher@example.com | password123 |
| Field Worker | field@example.com | password123 |
| Admin | admin@example.com | password123 |

## Features by Role

### Government Officials
- View all projects and their status
- Verify MRV reports
- Issue carbon credits
- Monitor platform analytics
- Manage policies and regulations

### NGO Representatives
- Create and manage projects
- Submit MRV reports
- Track carbon credits
- View project analytics
- Collaborate with researchers

### Researchers
- Access project data
- Create detailed reports
- Analyze carbon sequestration
- Collaborate with NGOs
- Publish research findings

### Field Workers
- Upload field data
- Take geo-tagged photos
- Record sensor readings
- Update project status
- Sync data offline

### Administrators
- Manage user accounts
- Configure system settings
- Monitor platform health
- Manage user roles
- System maintenance

## Styling and Theming

The application uses Tailwind CSS with a custom design system:

### Color Palette
- **Primary**: Blue (#0ea5e9) - Trust, technology, environment
- **Secondary**: Green (#22c55e) - Nature, growth, sustainability
- **Success**: Green (#10b981) - Success states
- **Warning**: Yellow (#f59e0b) - Warning states
- **Error**: Red (#ef4444) - Error states
- **Gray**: Various shades for text and backgrounds

### Components
- Custom button styles with variants
- Form components with validation states
- Card layouts for content organization
- Table components for data display
- Modal and dropdown components
- Loading states and animations

## Performance Optimization

- **Code Splitting**: Routes are lazy-loaded
- **Image Optimization**: Optimized images and lazy loading
- **Caching**: API responses cached with Redux
- **Bundle Analysis**: Regular bundle size monitoring
- **Tree Shaking**: Unused code elimination

## Security Features

- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control
- **Input Validation**: Client-side validation
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Token-based protection
- **Secure Headers**: Security headers via Nginx

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

## Roadmap

### Phase 1 (Current)
- ✅ Basic dashboard functionality
- ✅ User authentication and roles
- ✅ Project management
- ✅ MRV report submission

### Phase 2 (Next)
- 🔄 Advanced analytics and reporting
- 🔄 Real-time data visualization
- 🔄 Mobile-responsive improvements
- 🔄 Offline data synchronization

### Phase 3 (Future)
- 📋 Advanced AI/ML integration
- 📋 Blockchain integration
- 📋 Mobile app companion
- 📋 Third-party integrations

