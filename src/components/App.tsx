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
import { Navigate, Route, Router, Routes } from 'react-router-dom';
import axios from 'axios';

import { routes } from '@/navigation/routes.tsx';

const BACKEND_URL = 'https://5796d6f7714bae38e075b95d9ce5491a.serveo.net';

const saveTelegramUser = async (initData: string, start_param: string | undefined | null) => {
  console.log('Attempting to save user data:');
  console.log('initData:', initData); // Логируем initData
  console.log('start_param before sending:', start_param); // Логируем startParam до отправки запроса

  try {
    const response = await axios.post(`${BACKEND_URL}/users/save-telegram-user`, { 
      initData, 
      start_param: start_param || null 
    }, {
      headers: { 'Content-Type': 'application/json' }
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

  const saveUserData = useCallback(async () => {
    if (lp.initDataRaw && !isDataSaved) {
      try {
        console.log('Launch params:', lp);
        console.log('start_param from launch params:', lp.start_param);
        console.log('start_param from WebApp:', window.Telegram?.WebApp?.initDataUnsafe?.start_param);
        
        // Пробуем получить параметр startParam
        const startParam = lp.start_param || window.Telegram?.WebApp?.initDataUnsafe?.start_param;

        // Добавляем лог для проверки, определён ли startParam
        if (startParam) {
          console.log('Final startParam used:', startParam);
        } else {
          console.warn('No valid startParam found');
        }

        // Сохраняем данные пользователя
        await saveTelegramUser(lp.initDataRaw, startParam);
        setIsDataSaved(true);
        console.log('User data saved successfully');
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