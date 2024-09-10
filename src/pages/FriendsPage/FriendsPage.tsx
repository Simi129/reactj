import { FC, useState, useEffect, useCallback } from 'react';
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
const BACKEND_URL = 'https://20b3-78-84-19-24.ngrok-free.app';

export const FriendsPage: FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lp = useLaunchParams();

  const fetchReferrals = useCallback(async () => {
    if (lp.initData?.user?.id) {
      try {
        setIsLoading(true);
        const response = await axios.get(`${BACKEND_URL}/referrals/${lp.initData.user.id}`);
        console.log('Referrals response:', response.data);
        
        if (Array.isArray(response.data)) {
          setReferrals(response.data);
        } else if (typeof response.data === 'object' && response.data !== null) {
          const referralsArray = Object.values(response.data).find(Array.isArray);
          if (referralsArray) {
            setReferrals(referralsArray);
          } else {
            console.error('Unexpected data structure:', response.data);
            setError('Received unexpected data format from server.');
          }
        } else {
          console.error('Received invalid data:', response.data);
          setError('Received invalid data format from server.');
        }
      } catch (err) {
        console.error('Error fetching referrals:', err);
        setError('Failed to load referrals. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    } else {
      console.warn('User ID not available');
      setError('User ID not available');
      setIsLoading(false);
    }
  }, [lp.initData?.user?.id]);

  useEffect(() => {
    console.log('FriendsPage mounted');
    console.log('Launch params:', lp);
    console.log('User ID:', lp.initData?.user?.id);
    fetchReferrals();
  }, [fetchReferrals, lp]);

  useEffect(() => {
    console.log('Current referrals state:', referrals);
  }, [referrals]);

  const shareInviteLink = () => {
    const botUsername = 'testonefornew_bot';
    
    if (lp.initData?.user?.id) {
      const userId = lp.initData.user.id;
      const inviteLink = `https://t.me/${botUsername}?start=invite_${userId}`;
      console.log('Generated invite link:', inviteLink);
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