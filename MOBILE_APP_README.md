# Mobile App - School Management System

React Native mobile app for parents and students using Expo.

## Features

- 📱 **Cross-platform** - iOS and Android
- 🔐 **Secure authentication** - JWT tokens with SecureStore
- 📊 **Role-based dashboards** - Parent and Student views
- 📴 **Offline support** - Cached data for offline viewing
- 🔔 **Push notifications** - Expo push notifications
- 🎨 **Modern UI** - Native components with beautiful design

## Tech Stack

- React Native with Expo (managed workflow)
- TypeScript
- @supabase/supabase-js for backend
- Expo SecureStore for token storage
- Expo Notifications for push
- React Navigation for routing

## Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Studio
- Expo Go app on your phone (for testing)

## Project Structure

```
mobile/
├── app/                    # App screens (Expo Router)
│   ├── (auth)/            # Auth screens
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── forgot-password.tsx
│   ├── (parent)/          # Parent portal
│   │   ├── index.tsx
│   │   ├── students.tsx
│   │   └── student/[id].tsx
│   ├── (student)/         # Student portal
│   │   ├── index.tsx
│   │   ├── assignments.tsx
│   │   └── results.tsx
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── StudentCard.tsx
│   ├── AttendanceCard.tsx
│   └── NotificationItem.tsx
├── lib/                   # Utilities
│   ├── supabase.ts       # Supabase client
│   ├── auth.ts           # Auth helpers
│   └── storage.ts        # SecureStore wrapper
├── hooks/                 # Custom hooks
│   ├── useAuth.ts
│   ├── useStudents.ts
│   └── useNotifications.ts
├── types/                 # TypeScript types
├── app.json              # Expo config
└── package.json
```

## Setup Instructions

### 1. Create Mobile App Directory

```bash
mkdir mobile
cd mobile
```

### 2. Initialize Expo Project

```bash
npx create-expo-app@latest . --template blank-typescript
```

### 3. Install Dependencies

```bash
npm install @supabase/supabase-js
npm install @react-navigation/native @react-navigation/stack
npm install expo-secure-store expo-notifications
npm install react-native-safe-area-context react-native-screens
npm install @expo/vector-icons
```

### 4. Configure Environment

Create `.env` file:
```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Configure app.json

```json
{
  "expo": {
    "name": "School Management",
    "slug": "school-management",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourschool.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourschool.app",
      "permissions": [
        "NOTIFICATIONS",
        "INTERNET"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ]
  }
}
```

## Key Files to Create

### lib/supabase.ts

```typescript
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (key) => SecureStore.getItemAsync(key),
      setItem: (key, value) => SecureStore.setItemAsync(key, value),
      removeItem: (key) => SecureStore.deleteItemAsync(key),
    },
    autoRefreshToken: true,
    persistSession: true,
  },
});
```

### hooks/useAuth.ts

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return { user, loading, signIn, signOut };
}
```

### app/(auth)/login.tsx

```typescript
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
    } else {
      router.replace('/(parent)');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>School Management</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});
```

## Running the App

### Development

**Start Expo development server:**
```bash
npm start
```

**Run on iOS Simulator:**
```bash
npm run ios
```

**Run on Android Emulator:**
```bash
npm run android
```

**Run on your phone:**
1. Install Expo Go from App Store/Play Store
2. Scan the QR code from the terminal

### Production Builds

**iOS (requires Mac + Apple Developer account):**
```bash
eas build --platform ios
```

**Android:**
```bash
eas build --platform android
```

## Push Notifications Setup

### 1. Register for Push Notifications

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

async function registerForPushNotifications() {
  let token;
  
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
  }
  
  return token;
}
```

### 2. Store Token in Database

After user logs in, store their push token:

```typescript
const token = await registerForPushNotifications();
if (token) {
  await supabase
    .from('user_push_tokens')
    .upsert({ user_id: user.id, token });
}
```

### 3. Send Notifications from Backend

Use Expo's push notification service in your edge functions.

## Offline Support

### Caching Strategy

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'students_cache';

async function fetchStudents() {
  try {
    // Try to fetch from API
    const { data } = await supabase.from('students').select('*');
    
    // Cache the data
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    
    return data;
  } catch (error) {
    // If offline, return cached data
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  }
}
```

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests (with Detox)
```bash
npm run e2e
```

## Deployment

### TestFlight (iOS)

1. Build for iOS:
```bash
eas build --platform ios
```

2. Upload to TestFlight via Expo dashboard

### Google Play Internal Testing (Android)

1. Build for Android:
```bash
eas build --platform android
```

2. Upload AAB to Google Play Console

## Troubleshooting

### Common Issues

**1. Supabase connection errors**
- Check .env file has correct values
- Ensure network connectivity
- Verify Supabase project is active

**2. Build errors**
- Clear cache: `expo start -c`
- Delete node_modules: `rm -rf node_modules && npm install`
- Update Expo: `npm install expo@latest`

**3. Push notifications not working**
- Check permissions are granted
- Verify push token is saved
- Test on physical device (not simulator)

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-react-native)
- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)

## Support

For mobile app issues:
- GitHub Issues: [your-repo]/issues
- Discord: [your-discord]
- Email: mobile-support@yourschool.com
