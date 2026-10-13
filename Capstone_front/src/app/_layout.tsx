import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

// 화면 전환은 src/app/index.tsx 안에서 직접 관리하므로 여기서는 헤더 없는 Stack 하나만 둔다.
// (예전 템플릿의 Home/Explore 탭은 앱 자체 하단 메뉴와 겹쳐서 제거함)
export default function RootLayout() {
  return (
    // 앱 디자인이 밝은 테마 기준이라 다크 모드에서도 밝은 테마 + 어두운 상태바 글씨를 쓴다
    <ThemeProvider value={DefaultTheme}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
      <AnimatedSplashOverlay />
    </ThemeProvider>
  );
}
