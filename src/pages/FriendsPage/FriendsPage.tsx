import { FC, useState, useEffect } from 'react';
import { Button, Image } from '@telegram-apps/telegram-ui';
import { NavigationBar } from '@/components/NavigationBar/NavigationBar';
import { initUtils, useLaunchParams } from '@telegram-apps/sdk-react';
import axios from 'axios';

import ball1 from '../../../assets/ball1.png';

interface Referral {
  id: number;
  name: string;
}

const utils = initUtils();
const BACKEND_URL = 'https://20b3-78-84-19-24.ngrok-free.app'; // Замените на ваш актуальный URL

export const FriendsPage: FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lp = useLaunchParams();

  useEffect(() => {
    const fetchReferrals = async () => {
      if (lp.initData?.user?.id) {
        try {
          setIsLoading(true);
          const response = await axios.get(`${BACKEND_URL}/referrals/${lp.initData.user.id}`);
          
          // Проверяем, что полученные данные являются массивом
          if (Array.isArray(response.data)) {
            setReferrals(response.data);
          } else {
            console.error('Received non-array data:', response.data);
            setError('Received invalid data format from server.');
          }
        } catch (err) {
          console.error('Error fetching referrals:', err);
          setError('Failed to load referrals. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setError('User ID not available');
        setIsLoading(false);
      }
    };

    fetchReferrals();
  }, [lp.initData?.user?.id]);

  const shareInviteLink = () => {
    const botUsername = 'testonefornew'; // Замените на имя вашего бота
    const appName = 'BallCry'; // Замените на название вашего приложения
    
    if (lp.initData?.user?.id) {
      const userId = lp.initData.user.id;
      const inviteLink = `https://t.me/${botUsername}/${appName}?startapp=invite_${userId}`;
      utils.shareURL(inviteLink, 'Join me in BallCry and get more rewards!');
    } else {
      console.error('User ID not available');
      setError('Unable to create invite link. Please try again later.');
    }
  };

  const renderReferralsList = () => {
    if (!Array.isArray(referrals)) {
      console.error('referrals is not an array:', referrals);
      return <p>Error: Invalid referrals data</p>;
    }
    
    return referrals.length > 0 ? (
      <ol style={{ textAlign: 'left', paddingLeft: '20px' }}>
        {referrals.map(referral => (
          <li key={referral.id}>{referral.name}</li>
        ))}
      </ol>
    ) : (
      <p>No referrals yet. Invite your friends!</p>
    );
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', paddingBottom: '60px' }}>
      <h2>Invite Friends and get more BallCry</h2>
      
      <div style={{ margin: '20px 0' }}>
        <Image src={ball1} alt="BallCry" style={{ width: '100px', height: '100px', margin: '0 auto' }} />
      </div>

      <Button onClick={shareInviteLink} style={{ marginBottom: '20px' }}>Invite Friends</Button>

      <div style={{ marginBottom: '20px' }}>
        <h3>{Array.isArray(referrals) ? referrals.length : 0} Friends</h3>
      </div>

      {isLoading ? (
        <p>Loading referrals...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        renderReferralsList()
      )}

      <NavigationBar />
    </div>
  );
};