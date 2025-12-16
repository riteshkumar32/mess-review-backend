# IIT KGP Hall Mess Review Platform - Design Guidelines

## Design Philosophy
Information-first, minimal clutter, dark professional theme for daily student usage. Stability and clarity over fancy features.

## Global Design System

### Color Palette
- **Background**: `#0f172a` (dark navy) or `#111827`
- **Card Background**: `#1f2933`
- **Primary Text**: `#e5e7eb`
- **Secondary Text**: `#9ca3af`
- **Accent Color**: `#22c55e` (green) OR `#3b82f6` (blue) - choose one consistently
- **Error**: Red for validation messages

### Typography
- **Headings**: Inter or Poppins, bold weights
- **Body Text**: Inter or system-ui, regular weights
- **Sizes**: Clear hierarchy with large headings, readable body text

### Component Standards
- **Border Radius**: 8px for all cards and buttons
- **No emojis in UI**
- **No flashy gradients**
- **No infinite animations**
- **Mobile responsive throughout**

## Page-Specific Layouts

### Landing Page (Public)
**Top Navbar**: Website name "HallMess | IIT KGP" left-aligned, Login button (accent color) right-aligned

**Hero Section**: Centered card layout
- Left side text: Large heading "Daily Mess Reviews for IIT Kharagpur Halls"
- Subtext: "Rate meals. Raise issues. Improve food quality — together."
- Primary CTA: "Login with IITKGP Email" button

**Info Section**: 3 horizontal cards displaying:
1. Daily Reviews (Breakfast, Lunch, Snacks, Dinner)
2. Verified Students Only (@iitkgp.ac.in restriction)
3. Hall-wise System (RK Hall - more coming soon)

**Footer**: "Built by IIT Kharagpur students, for IIT Kharagpur students" with small links for Privacy and Contact

### Auth Page (Login/Signup)
Centered card only with:
- Title: "Login"
- Email field with note: "Only @iitkgp.ac.in email allowed"
- Password field
- Login button
- Error messages in red simple text (no alerts)

### Student Dashboard
**Layout**: Fixed left sidebar + main content area

**Sidebar Menu**:
- Logo/Site Name
- Dashboard
- Halls
- Submit Complaint
- My Reviews
- Logout

**Main Content Top Section**:
- Greeting: "Welcome, [Student Name]"
- Subtext: "RK Hall · Today: [Date]"

**Stats Cards**: 4-card grid showing today's average ratings
- Breakfast: ⭐ X.X
- Lunch: ⭐ X.X
- Snacks: ⭐ X.X
- Dinner: ⭐ X.X

**Action Buttons**:
- Primary: "Review Today's Food"
- Secondary: "Submit a Complaint"

**Recent Activity Section**: Last 3 reviews and recent complaints (anonymous display)

### Halls List Page
- Title: "Halls"
- Grid layout for hall cards
- RK Hall card containing:
  - Hall name: "Radhakrishnan Hall (RK)"
  - "Active" badge
  - "View Hall" button

### Hall Detail Page (RK Hall)
- Today's menu ratings display
- Average ratings per meal type
- Past 7 days performance (simple list or bar view)
- Recent complaints section (anonymous)
- "Review Today" button prominently placed

### Review Form
Table-style layout for meal types:
- Breakfast, Lunch, Snacks, Dinner rows
- 1-5 star rating input per meal
- Optional comment text field per meal
- Submit button

### Complaint Form
- Auto-filled date
- Meal type dropdown (Breakfast/Lunch/Snacks/Dinner/General)
- Complaint text field (mandatory)
- Category selection: Hygiene/Taste/Quantity/Behaviour/Other
- Submit button

## Images
No hero images required. This is a utility-focused student platform prioritizing information density and daily usability over visual marketing elements.