# ☕ Café Delights - Modern Ordering System

A beautiful, mobile-first café ordering system built with Next.js, Supabase, and Framer Motion.

## 🌟 Features

### Customer Experience (`/order`)
- **Mobile-first design** optimized for smartphones
- **Smooth animations** and micro-interactions
- **Category-based menu** with high-quality product images
- **Real-time cart updates** with sliding drawer
- **Customer name collection** before ordering
- **Dark/light mode toggle** with animated transitions

### Admin Dashboard (`/admin`)
- **Real-time order management** with live updates
- **Visitor analytics** with device/browser tracking
- **Order status management** (pending/completed/cancelled)
- **Revenue and statistics dashboard**
- **Secure authentication** system

### Technical Features
- **Real-time updates** via Supabase subscriptions
- **Persistent data storage** with PostgreSQL
- **Row-level security** for data protection
- **Responsive design** for all screen sizes
- **TypeScript** for type safety
- **Server-side rendering** with Next.js App Router

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier available)

### 1. Clone and Install
\`\`\`bash
git clone <your-repo>
cd cafe-ordering-system
npm install
\`\`\`

### 2. Set up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the setup script:
   \`\`\`sql
   -- Copy content from scripts/supabase-setup.sql
   \`\`\`
3. Get your API keys from Settings → API

### 3. Configure Environment
Create `.env.local`:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit:
- Customer ordering: `http://localhost:3000/order`
- Admin dashboard: `http://localhost:3000/admin` (password: `admin123`)

## 📱 Usage

### For Customers
1. Visit `/order` on any device
2. Enter your name when prompted
3. Browse menu categories (swipe or tap)
4. Add items to cart with quantity selectors
5. Review order in sliding cart drawer
6. Submit order and pay at counter

### For Staff
1. Visit `/admin` and login with password
2. Monitor real-time order feed
3. Mark orders as completed or cancelled
4. View visitor analytics and revenue stats
5. Manage menu items (coming soon)

## 🏗️ Architecture

\`\`\`
├── app/
│   ├── order/          # Customer ordering page
│   ├── admin/          # Admin dashboard
│   └── api/            # API routes
├── components/         # Reusable UI components
├── lib/               # Utilities and Supabase config
├── hooks/             # Custom React hooks
└── scripts/           # Database setup scripts
\`\`\`

### Key Technologies
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL + Real-time)
- **UI Components**: Radix UI primitives
- **Authentication**: Simple password (upgrade to Supabase Auth)

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
- **Netlify**: Works with static export
- **Railway**: Full-stack deployment
- **DigitalOcean**: App Platform deployment

## 🔧 Configuration

### Database Schema
The system uses these main tables:
- `products` - Menu items with categories
- `orders` - Customer orders with status
- `order_items` - Individual items per order
- `visitor_logs` - Analytics and tracking
- `categories` - Menu categories

### Environment Variables
\`\`\`env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional
NEXT_PUBLIC_APP_NAME="Café Delights"
ADMIN_PASSWORD="your_secure_password"
\`\`\`

## 🎨 Customization

### Branding
- Update colors in `app/globals.css`
- Change logo and name in header components
- Modify gradient backgrounds and themes

### Menu Items
- Add products via Supabase dashboard
- Upload images to Supabase Storage
- Create new categories as needed

### Features
- Enable Supabase Auth for secure admin login
- Add payment processing (Stripe/PayPal)
- Implement inventory tracking
- Add email notifications

## 📊 Analytics

The system tracks:
- **Page visits** with timestamps
- **Device information** (mobile/desktop)
- **Browser and OS** details
- **Order patterns** and revenue
- **Peak hours** and popular items

## 🔒 Security

- **Row Level Security** enabled on all tables
- **API rate limiting** (implement as needed)
- **Input validation** on all forms
- **XSS protection** via React
- **CSRF protection** via Next.js

## 🐛 Troubleshooting

### Common Issues

**Orders not appearing in real-time:**
- Check Supabase real-time is enabled
- Verify WebSocket connections
- Check browser console for errors

**Images not loading:**
- Ensure image URLs are accessible
- Check Supabase Storage permissions
- Verify CORS settings

**Authentication failing:**
- Verify environment variables
- Check Supabase project status
- Ensure RLS policies are correct

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - feel free to use for commercial projects!

## 🆘 Support

- **Documentation**: Check this README
- **Issues**: Create GitHub issues
- **Supabase**: Check their excellent docs
- **Community**: Join the discussions

---

Built with ❤️ for café owners who want to delight their customers!
\`\`\`

Finally, let's create a deployment configuration file:
