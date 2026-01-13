## Packages
recharts | Dashboard analytics charts
date-fns | Date formatting for tables and invoices
framer-motion | Smooth page transitions and UI animations
clsx | Utility for conditional classes (often used with tailwind-merge)
tailwind-merge | Merging tailwind classes safely

## Notes
Auth flow uses /api/login and /api/user (me)
File uploads use POST /api/upload (FormData) returning { url: string }
Dashboard requires separating Admin vs Company views based on user.role
