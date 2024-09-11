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

const BACKEND_URL = 'https://c529-78-84-19-24.ngrok-free.app'; // Замените на ваш актуальный URL

const saveTelegramUser = async (initData: string, startParam: string | undefined | null) => {
  console.log('Attempting to save user data:', initData);
  console.log('Start param:', startParam);
  try {
    console.log('Sending request to:', `${BACKEND_URL}/users/save-telegram-user`);
    const response = await axios.post(`${BACKEND_URL}/users/save-telegram-user`, { 
      initData, 
      startParam: startParam || null 
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Response received');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Raw response data:', response.data);
    
    if (typeof response.data === 'string' && response.data.startsWith('<!DOCTYPE')) {
      console.error('Received HTML instead of JSON:');
      console.error(response.data.substring(0, 500) + '...'); // Выводим первые 500 символов HTML
      throw new Error('Received HTML instead of JSON');
    }

    // Попытка распарсить ответ как JSON
    try {
      const jsonData = JSON.parse(JSON.stringify(response.data));
      console.log('Parsed response data:', jsonData);
      return jsonData;
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      console.log('Raw response data type:', typeof response.data);
      console.log('Raw response data:', response.data);
      throw new Error('Invalid JSON response');
    }
  } catch (error) {
    console.error('Error in saveTelegramUser:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.status);
      console.error('Axios error response:', error.response);
      if (error.response?.data) {
        if (typeof error.response.data === 'string' && error.response.data.startsWith('<!DOCTYPE')) {
          console.error('Received HTML in error response:');
          console.error(error.response.data.substring(0, 500) + '...'); // Выводим первые 500 символов HTML
        } else {
          console.log('Raw error response data:', error.response.data);
        }
      }
    }
    throw error;
  }
};

export const App: FC = () => {
  const lp = useLaunchParams();
  const miniApp = useMiniApp();
  const themeParams = useThemeParams();
  const viewport = useViewport();
  const [isDataSaved, setIsDataSaved] = useState(false);

  const saveUserData = useCallback(async () => {
    if (lp.initDataRaw && !isDataSaved) {
      try {
        console.log('Launch params:', lp);
        const result = await saveTelegramUser(lp.initDataRaw, lp.startParam);
        console.log('User data saved result:', result);
        setIsDataSaved(true);
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    } else if (!lp.initDataRaw) {
      console.warn('initDataRaw is empty or undefined');
    }
  }, [lp, isDataSaved]);

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