# 📚 BookWise Frontend

A modern, animated Next.js frontend for the BookWise AI-powered book recommendation system.

## ✨ Features

- **🎨 Modern Design**: Beautiful, responsive UI with smooth animations
- **🔍 Smart Search**: AI-powered book recommendations with emotional analysis
- **📱 Responsive**: Works perfectly on all devices
- **⚡ Fast**: Optimized performance with Next.js 14
- **🎭 Animated**: Smooth transitions and micro-interactions with Framer Motion
- **🎯 TypeScript**: Full type safety and better developer experience

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:5000`

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your API URL if needed.

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
frontend/
├── app/                    # Next.js 14 app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   └── ui/               # UI components
│       ├── BookCard.tsx  # Book display component
│       ├── BookGrid.tsx  # Book grid layout
│       ├── SearchBar.tsx # Search interface
│       ├── Header.tsx    # Site header
│       ├── Footer.tsx    # Site footer
│       └── BookSkeleton.tsx # Loading skeleton
├── lib/                  # Utilities and API
│   ├── api.ts           # API client
│   ├── types.ts        # TypeScript types
│   └── utils.ts        # Helper functions
└── public/              # Static assets
```

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (`#0ea5e9` to `#0284c7`)
- **Secondary**: Purple gradient (`#d946ef` to `#c026d3`)
- **Accent**: Yellow (`#eab308`)

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, gradient text
- **Body**: Clean, readable text

### Animations
- **Framer Motion**: Smooth page transitions
- **Hover Effects**: Interactive book cards
- **Loading States**: Skeleton components
- **Micro-interactions**: Button hover, form focus

## 🔧 API Integration

The frontend connects to the Flask backend API with the following endpoints:

- **POST** `/recommend` - Get book recommendations
- **GET** `/health` - Health check

### Example API Request:
```typescript
{
  query: "A story about forgiveness",
  category: "Fiction",
  tone: "Happy",
  limit: 12
}
```

### Example API Response:
```typescript
{
  success: true,
  data: {
    books: [...],
    total: 12
  },
  message: "Found 12 recommendations"
}
```

## 🎯 Key Components

### BookCard
- Displays book cover, title, author, description
- Shows emotional analysis and ratings
- Hover animations and interactions
- Responsive design

### SearchBar
- Real-time search with debouncing
- Category and tone filters
- Loading states
- Smooth animations

### BookGrid
- Responsive grid layout
- Loading skeletons
- Empty states
- Smooth transitions

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy automatically

### Other Platforms
- **Netlify**: Build command: `npm run build`
- **AWS Amplify**: Standard Next.js deployment
- **Docker**: Use Next.js Dockerfile

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended rules
- **Prettier**: Code formatting
- **Tailwind**: Utility-first CSS

## 🎨 Customization

### Themes
Modify `tailwind.config.js` to customize:
- Colors
- Fonts
- Animations
- Spacing

### Components
All components are in `components/ui/` and can be easily customized.

## 📱 Responsive Design

- **Mobile**: Single column layout
- **Tablet**: 2-column grid
- **Desktop**: 3-4 column grid
- **Large screens**: 4+ column grid

## 🔍 Performance

- **Next.js 14**: App Router, Server Components
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Caching**: API response caching
- **Bundle Size**: Optimized with tree shaking

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check if backend is running on port 5000
   - Verify CORS settings in Flask app
   - Check network tab in browser dev tools

2. **Images Not Loading**
   - Verify image domains in `next.config.js`
   - Check if thumbnail URLs are valid
   - Fallback to placeholder images

3. **Build Errors**
   - Run `npm run lint` to check for issues
   - Ensure all TypeScript types are correct
   - Check for missing dependencies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animation library
- **Lucide React** - Beautiful icons
- **Flask** - Backend API
