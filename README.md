# Spending Tracker

A simple and elegant personal finance application for tracking deposits, withdrawals, and spending patterns. Monitor your balance, view transaction history, and analyze spending habits with automatic weekly and monthly reports.

## Features

- **Real-time Balance Tracking**: View your current balance with live updates
- **Multi-Currency Support**: Switch between 150+ currencies with automatic conversion
- **Transaction Management**: Add deposits and withdrawals with categories and descriptions
- **Spending Analytics**: Automatic calculation of weekly and monthly spending
- **Transaction History**: View all transactions sorted by date with balance snapshots
- **Delete Transactions**: Remove transactions with automatic balance recalculation
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Secure Authentication**: Email/password authentication with Firebase
- **Real-time Sync**: All changes sync instantly across devices

## Tech Stack

- **Frontend**: React 19 with Vite
- **Routing**: React Router DOM v7
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Styling**: Bootstrap 5 + Custom CSS
- **Icons**: React Icons
- **Currency API**: Fawaz Ahmed's Currency API

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account and project

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd spendingtracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── contexts/
│   │   ├── AuthContext.jsx          # Firebase authentication context
│   │   └── ThemeProvider.jsx        # Light/dark theme management
│   ├── layout/
│   │   ├── Layout.jsx               # Main layout wrapper
│   │   └── Navbar.jsx               # Navigation component
│   ├── pages/
│   │   ├── LandingPage.jsx          # Landing/home page
│   │   ├── Home.jsx                 # Main wallet dashboard
│   │   ├── Transactions.jsx         # Full transaction history
│   │   ├── Login.jsx                # Login page
│   │   ├── Signup.jsx               # Registration page
│   │   └── ForgetPassword.jsx       # Password reset
│   └── reusables/
│       ├── Loader.jsx               # Loading spinner
│       └── walletComponents/
│           ├── BalanceActions.jsx   # Balance display & transaction modals
│           └── RecentTransactions.jsx # Recent 5 transactions
├── App.jsx                          # Main app component with routing
├── App.css                          # Global styles
├── firebase.js                      # Firebase configuration
├── fonts.css                        # Custom fonts
└── main.jsx                         # App entry point
```

## Firebase Configuration

### Firestore Collections

The app uses a `wallets` collection with documents structured as:

```javascript
{
  balance: number,           // Current wallet balance
  currency: string,          // Currency code (e.g., "USD", "EUR")
  email: string,            // User email
  transactions: [{
    amount: number,         // Transaction amount
    category: string,       // Transaction category/reason
    description: string,    // Optional description
    timestamp: Timestamp,   // Transaction time
    type: "deposit" | "withdraw",
    balanceAfter: number    // Balance after this transaction
  }]
}
```

### Firestore Rules

Set up appropriate security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /wallets/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
  }
}
```

### Authentication

Enable Email/Password authentication in Firebase Console:
1. Go to Authentication → Sign-in method
2. Enable Email/Password provider

## Key Features Explained

### Multi-Currency Support

The app integrates with a free currency API to:
- Fetch 150+ currency options
- Convert balance and all transactions when currency changes
- Maintain accurate historical data after conversion

```javascript
// Currency conversion example
const rate = data[oldCurrency][newCurrency];
const convertedBalance = (balance * rate).toFixed(2);
```

### Real-time Updates

All balance and transaction operations use Firebase's `onSnapshot` for instant synchronization:

```javascript
const unsubscribe = onSnapshot(walletRef, (snapshot) => {
  // Updates happen automatically
});
```

### Spending Analytics

Automatic calculation of spending patterns:
- **Weekly Spending**: Saturday to Friday (adjustable)
- **Monthly Spending**: Current calendar month
- Only withdrawal transactions are counted

### Transaction Management

- **Add**: Deposit or withdraw with category
- **Delete**: Remove transaction with automatic balance recalculation
- **View**: Recent 5 on home, all on transactions page
- **Sort**: Always sorted by newest first

### Balance Recalculation

When deleting a transaction, the app:
1. Reverses the transaction effect on balance
2. Updates Firestore atomically
3. Maintains data integrity

```javascript
// Deposit reversal: subtract amount
newBalance = currentBalance - transaction.amount;

// Withdrawal reversal: add amount back
newBalance = currentBalance + transaction.amount;
```

## Usage

### Getting Started

1. **Sign Up**: Create account with email and password
2. **Initial Setup**: Wallet starts at 0 in EGP (default)
3. **Change Currency**: Click currency icon to select your preferred currency

### Adding Transactions

1. Click **Deposit** or **Withdraw** button
2. Enter amount
3. Add category/reason (required)
4. Submit to update balance

### Viewing History

- **Home Page**: Shows 5 most recent transactions
- **Transactions Page**: Full history with spending analytics
- Each transaction shows: date, amount, balance after, category

### Managing Transactions

- Click the delete icon (🗑️) next to any transaction
- Confirm deletion
- Balance automatically adjusts

### Currency Conversion

1. Click the currency exchange icon (💱) next to balance
2. Select new currency from dropdown
3. All balances and transactions convert automatically

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Week Calculation

The app uses Saturday as the start of the week:
- Saturday = day 0 of the week
- Friday = last day of the week

This can be adjusted in the `Transactions.jsx` logic:

```javascript
const day = today.getDay();
let diff;
if (day === 6) {       // Saturday
  diff = 0;
} else if (day === 0) { // Sunday
  diff = -6;
} else {
  diff = day + 1;
}
```

## Theme Customization

The app supports light and dark themes with CSS custom properties:

```css
:root {
  --background: #d1d3c4;
  --text: #775253;
  --btns_1: #351431;
  --btns_2: #bdc696;
}

body.dark {
  --background: #351431;
  --text: #d1d3c4;
  /* ... */
}
```

Modify these values in `App.css` to change color scheme.

## API Integration

### Currency API

The app uses [Fawaz Ahmed's Currency API](https://github.com/fawazahmed0/currency-api):

```javascript
// Fetch available currencies
fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json')

// Fetch exchange rates
fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${currency}.json`)
```

**Note**: This is a free API with rate limits. For production use, consider upgrading to a paid currency API service.

## Browser Support

Modern browsers with ES6+ support:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Known Limitations

- Currency API is free tier with potential rate limits
- No transaction editing (only delete and re-add)
- No export to CSV/PDF
- No recurring transactions
- No budget limits/alerts

## Future Enhancements

- [ ] Transaction editing capability
- [ ] Budget setting and alerts
- [ ] Category-based spending breakdown
- [ ] Export to CSV/Excel
- [ ] Recurring transactions
- [ ] Multi-wallet support
- [ ] Transaction search and filtering
- [ ] Data visualization with charts
- [ ] Receipt photo attachments
- [ ] Scheduled transactions
- [ ] Spending goals

## Troubleshooting

### Currency Conversion Fails
- Check internet connection
- API might be temporarily down
- Try again later or refresh page

### Transactions Not Showing
- Verify Firebase connection
- Check Firestore rules
- Ensure user is authenticated

### Balance Not Updating
- Check browser console for errors
- Verify Firestore write permissions
- Refresh the page

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Firebase for backend infrastructure
- Fawaz Ahmed for the free currency API
- Bootstrap for responsive UI components
- React Icons for icon library
- React team for the framework
