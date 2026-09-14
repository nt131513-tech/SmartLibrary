import { Stack } from 'expo-router';

import { LibraryProvider } from '../context/LibraryContext';

export default function RootLayout() {
  return (
    <LibraryProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </LibraryProvider>
  );
}