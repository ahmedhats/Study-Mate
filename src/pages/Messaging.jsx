import React from 'react';
import { useParams } from 'react-router-dom';
import MessagingPage from '../components/features/messaging/MessagingPage';

const Messaging = () => {
  return (
    <div className="messaging-page-wrapper">
      <MessagingPage />
    </div>
  );
};

export default Messaging; 