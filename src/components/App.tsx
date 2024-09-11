import { useIntegration } from '@telegram-apps/react-router-integration';
import {
  bindMiniAppCSSVars,
  bindThemeParamsCSSVars,
  bindViewportCSSVars,
  initNavigator,
  useLaunchParams,
  useMiniApp,
  useThemeParams,
  useViewport,
} from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { FC, useEffect, useMemo, useState, useCallback } from 'react';
import {
  Navigate,
  Route,
  Router,
  Routes,
} from 'react-router-dom';
import axios from 'axios';

import { routes } from '@/navigation/routes.tsx';

const BACKEND_URL = 'https://ef23-78-84-19-24.ngrok-free.app'; // Замените на ваш актуальный URL

const parseHashParams = () => {
  const hash = window.location.hash.slice(1);
  const params = new URLSearchParams(hash);
  return {
    tgWebAppStartParam: params.get('tgWebAppStartParam'),
    // Добавьте здесь другие параметры, если они вам нужны
  };
};

const saveTelegramUser = async (initData: string, startParam: string | undefined | null) => {
  console.log('Attempting to save user data:', initData);
  console.log('Start param:', startParam);
  try {
    const response = await axios.post(`${BACKEND_URL}/users/save-telegram-user`, { 
      initData, 
      startParam: startParam || null 
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to save user data:', error);
    throw error;
  }
};

export const App: FC = () => {
  const lp = useLaunchParams();
  const miniApp = useMiniApp();
  const themeParams = useThemeParams();
  const viewport = useViewport();
  const [isDataSaved, setIsDataSaved] = useState(false);
  const [hashParams, setHashParams] = useState(parseHashParams());

  useEffect(() => {
    const handleHashChange = () => {
      setHashParams(parseHashParams());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const saveUserData = useCallback(async () => {
    if (lp.initDataRaw && !isDataSaved) {
      try {
        console.log('Launch params:', lp);
        console.log('Hash params:', hashParams);
        const startParam = hashParams.tgWebAppStartParam || lp.startParam;
        await saveTelegramUser(lp.initDataRaw, startParam);
        setIsDataSaved(true);
        console.log('User data saved successfully');
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    } else if (!lp.initDataRaw) {
      console.warn('initDataRaw is empty or undefined');
    }
  }, [lp, isDataSaved, hashParams]);

  useEffect(() => {
    saveUserData();
  }, [saveUserData]);

  useEffect(() => {
    return bindMiniAppCSSVars(miniApp, themeParams);
  }, [miniApp, themeParams]);

  useEffect(() => {
    return bindThemeParamsCSSVars(themeParams);
  }, [themeParams]);

  useEffect(() => {
    return viewport && bindViewportCSSVars(viewport);
  }, [viewport]);

  const navigator = useMemo(() => initNavigator('app-navigation-state'), []);
  const [location, reactNavigator] = useIntegration(navigator);

  useEffect(() => {
    navigator.attach();
    return () => navigator.detach();
  }, [navigator]);

  return (
    <AppRoot
      appearance={miniApp.isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}
    >
      <Router location={location} navigator={reactNavigator}>
        <Routes>
          {routes.map((route) => <Route key={route.path} {...route} />)}
          <Route path='*' element={<Navigate to='/'/>}/>
        </Routes>
      </Router>
    </AppRoot>
  );
};