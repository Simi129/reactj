import { FC, useState, useEffect, useCallback } from 'react';
import { Button, Image } from '@telegram-apps/telegram-ui';
import { NavigationBar } from '@/components/NavigationBar/NavigationBar';
import { initUtils, useLaunchParams } from '@telegram-apps/sdk-react';
import axios from 'axios';

import ball1 from '../../../assets/ball1.png';

interface Referral {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
}

const utils = initUtils();
const BACKEND_URL = 'https://c529-78-84-19-24.ngrok-free.app';

export const FriendsPage: FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lp = useLaunchParams();

  const fetchReferrals = useCallback(async () => {
    console.log('Fetching referrals...');
    if (!lp.initData?.user?.id) {
      console.warn('User ID not available');
      setError('User ID not available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`${BACKEND_URL}/users/${lp.initData.user.id}/referrals`);
      console.log('Referrals response:', response);
      console.log('Referrals data:', response.data);

      let processedReferrals: Referral[] = [];

      if (Array.isArray(response.data)) {
        processedReferrals = response.data;
      } else if (typeof response.data === 'object' && response.data !== null) {
        const possibleArray = Object.values(response.data).find(Array.isArray);
        if (possibleArray) {
          processedReferrals = possibleArray;
        } else {
          processedReferrals = Object.values(response.data);
        }
      } else if (typeof response.data === 'string') {
        try {
          const parsedData = JSON.parse(response.data);
          if (Array.isArray(parsedData)) {
            processedReferrals = parsedData;
          } else if (typeof parsedData === 'object' && parsedData !== null) {
            processedReferrals = Object.values(parsedData);
          }
        } catch (e) {
          console.error('Failed to parse response data as JSON:', e);
        }
      }

      if (processedReferrals.length === 0) {
        console.warn('No referrals found in the response');
      }

      setReferrals(processedReferrals);
      setError(null);
    } catch (err) {
      console.error('Error fetching referrals:', err);
      setError('Failed to load referrals. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [lp.initData?.user?.id]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const shareInviteLink = () => {
    const botUsername = 'testonefornew_bot'; // Замените на имя вашего бота
    
    if (lp.initData?.user?.id) {
      const userId = lp.initData.user.id;
      const inviteLink = `https://t.me/${botUsername}?startapp=invite_${userId}`;
      console.log('Generated invite link:', inviteLink);
      utils.shareURL(inviteLink, 'Join me in BallCry and get more rewards!');
    } else {
      console.error('User ID not available');
      setError('Unable to create invite link. Please try again later.');
    }
  };

  const renderReferralsList = () => {
    console.log('Rendering referrals list. Referrals:', referrals);
    if (!Array.isArray(referrals)) {
      console.error('referrals is not an array:', referrals);
      return <p>Error: Invalid referrals data</p>;
    }
    
    return referrals.length > 0 ? (
      <ol style={{ textAlign: 'left', paddingLeft: '20px' }}>
        {referrals.map((referral, index) => (
          <li key={referral.id || index}>
            {typeof referral === 'object' && referral !== null ? (
              <>
                {referral.firstName || ''} {referral.lastName || ''} 
                {referral.username ? `(@${referral.username})` : ''}
              </>
            ) : (
              String(referral)
            )}
          </li>
        ))}
      </ol>
    ) : (
      <p>No referrals yet. Invite your friends!</p>
    );
  };

  console.log('Rendering FriendsPage. State:', { isLoading, error, referralsLength: referrals.length });

  return (
    <div style={{ padding: '20px', textAlign: 'center', paddingBottom: '60px' }}>
      <h2>Invite Friends and get more BallCry</h2>
      
      <div style={{ margin: '20px 0' }}>
        <Image src={ball1} alt="BallCry" style={{ width: '100px', height: '100px', margin: '0 auto' }} />
      </div>

      <Button onClick={shareInviteLink} style={{ marginBottom: '20px' }}>Invite Friends</Button>

      <div style={{ marginBottom: '20px' }}>
        <h3>{referrals.length} Friends</h3>
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

export default FriendsPage;