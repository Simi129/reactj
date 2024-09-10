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

const BACKEND_URL = 'https://20b3-78-84-19-24.ngrok-free.app'; // Замените на ваш актуальный URL

const saveTelegramUser = async (initData: string) => {
  console.log('Attempting to save user data:', initData);
  try {
    const response = await axios.post(`${BACKEND_URL}/users/save-telegram-user`, { initData });
    console.log('User data saved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to save user data:', error);
    throw error;
  }
};

const handleReferral = async (initData: string) => {
  console.log('Handling referral with initData:', initData);
  try {
    const response = await axios.post(`${BACKEND_URL}/referrals`, { initData });
    console.log('Referral handled successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to handle referral:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
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
  const [isReferralHandled, setIsReferralHandled] = useState(false);

  const saveUserData = useCallback(async () => {
    if (lp.initDataRaw && !isDataSaved) {
      try {
        console.log('InitDataRaw received:', lp.initDataRaw);
        await saveTelegramUser(lp.initDataRaw);
        setIsDataSaved(true);
        console.log('User data saved successfully');
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    } else if (!lp.initDataRaw) {
      console.warn('initDataRaw is empty or undefined');
    }
  }, [lp.initDataRaw, isDataSaved]);

  const processReferral = useCallback(async () => {
    if (lp.startParam && lp.startParam.startsWith('invite_') && lp.initDataRaw && !isReferralHandled) {
      console.log('Processing referral with startParam:', lp.startParam);
      try {
        await handleReferral(lp.initDataRaw);
        setIsReferralHandled(true);
        console.log('Referral processed successfully');
      } catch (error) {
        console.error('Error processing referral:', error);
      }
    } else {
      console.log('No valid referral data to process');
    }
  }, [lp.startParam, lp.initDataRaw, isReferralHandled]);

  useEffect(() => {
    saveUserData();
  }, [saveUserData]);

  useEffect(() => {
    processReferral();
  }, [processReferral]);

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