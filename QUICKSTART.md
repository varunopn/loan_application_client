# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

The app will open automatically at `http://localhost:3000`

### Step 3: Try the Demo

1. **Register** a new user (use any phone/email)
2. Enter OTP: `123456`
3. Accept consent and create a PIN
4. Navigate to **Profile** and complete eKYC
5. Go to **Demo Controls** (bottom nav) and **Approve KYC**
6. Return to **Home** and start a **New Application**
7. Fill the 3-step form and submit
8. Use **Demo Controls** again to **Approve Loan**
9. View result and sign the agreement!

## 🎯 Demo Credentials

- **OTP Code**: `123456` (hardcoded for demo)
- **Any phone/email**: Works for registration
- **PIN**: Any 4-6 digits you choose

## 🎮 Key Features to Show

### For Business Development Demos:

1. **Complete User Journey**
   - Show registration flow with OTP
   - Demonstrate consent acceptance
   - Show PIN security

2. **eKYC Integration**
   - Upload selfie with ID
   - Simulate approval/rejection via Demo Controls

3. **Loan Application**
   - Multi-step wizard
   - Auto-save draft feature
   - Document upload
   - Form validation

4. **Real-time Status Tracking**
   - Timeline view
   - Status badges
   - Notifications

5. **E-Signature**
   - Agreement review
   - Electronic signing
   - Legal consent

6. **Demo Controls**
   - Live status changes
   - Different scenarios
   - Quick approvals

## 📱 Mobile-First Design

The app is designed to look like a mobile app. For best demo experience:

1. **Open browser DevTools** (F12)
2. **Toggle device toolbar** (Ctrl+Shift+M or Cmd+Shift+M)
3. **Select a mobile device** (iPhone 12/13/14)
4. **Reload the page**

Or simply resize your browser window to 480px width or less.

## 🎨 Demo Tips

### Scenario 1: Success Path (2-3 minutes)
```
Register → Complete eKYC → Approve via Demo → 
Apply for Loan → Upload Docs → Approve via Demo → 
E-Sign → Done!
```

### Scenario 2: Show Draft Feature (1 minute)
```
Start Application → Fill Step 1 → 
Leave App → Come Back → Resume Draft
```

### Scenario 3: Rejection Handling (1 minute)
```
Submit Application → Reject via Demo → 
Show Rejection Reason → Start New Application
```

### Scenario 4: Notifications (30 seconds)
```
Perform actions → Check Notifications → 
Show timeline → Mark as read
```

## 🔧 Common Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npx tsc --noEmit
```

## 🗑️ Reset Demo Data

### Option 1: Via UI
- Go to **Demo Controls** page
- Click **"Reset All Demo Data"**
- Confirm and refresh

### Option 2: Via Console
- Open Browser DevTools (F12)
- Go to Console tab
- Type: `localStorage.clear()`
- Press Enter and refresh

## 📊 Application Flow

```
Landing Page
    ↓
Register (Phone/Email)
    ↓
OTP Verification (123456)
    ↓
Consent Acceptance
    ↓
PIN Setup
    ↓
Home Dashboard
    ↓
┌─────────────┴─────────────┐
│                           │
Profile/eKYC          Loan Application
    ↓                      ↓
Upload ID            Multi-step Form
    ↓                      ↓
Submit eKYC          Upload Documents
    ↓                      ↓
Demo: Approve        Submit Application
                          ↓
                  Demo: Approve/Reject
                          ↓
                  View Status/Timeline
                          ↓
                    E-Signature
                          ↓
                    Signed & Done!
```

## 🎯 What Makes This Demo Great

✅ **Complete End-to-End** - Full user journey in one app
✅ **No Backend Required** - Runs entirely in browser
✅ **Realistic UX** - Looks and feels like a real app
✅ **Interactive Demo** - Control outcomes in real-time
✅ **Mobile-First** - Perfect for mobile app pitches
✅ **Fast Setup** - Up and running in minutes
✅ **Easy to Reset** - Clean slate for each demo

## 💡 Pro Tips

1. **Pre-demo Setup**: Have a user registered and eKYC approved before demo starts
2. **Multiple Scenarios**: Create 2-3 users to show different outcomes
3. **Clear Data Between Demos**: Use reset button for fresh start
4. **Mobile View**: Always demo in mobile responsive mode
5. **Highlight Timeline**: Show how every action is tracked
6. **Show Notifications**: Point out real-time updates

## 🐛 Troubleshooting

**App won't start?**
- Delete `node_modules` and run `npm install` again
- Check Node version: `node -v` (should be 18+)

**Blank screen?**
- Check browser console for errors (F12)
- Try clearing localStorage: `localStorage.clear()`
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R)

**Can't login after registration?**
- Make sure you remember your PIN
- Try resetting demo data
- Register with a different email/phone

**Documents not uploading?**
- Check file size (max 10MB)
- Use PDF, JPG, or PNG only
- Clear localStorage if it's full

## 📞 Need Help?

Check the main [README.md](./README.md) for detailed documentation.

---

**Happy Demoing! 🎉**
