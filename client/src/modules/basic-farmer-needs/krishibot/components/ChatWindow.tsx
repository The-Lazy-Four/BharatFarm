import React from 'react';
import { ChatMessage } from '../types/krishiBot.types';
import { MessageBubble } from './MessageBubble';

export const ChatWindow: React.FC<{ messages: ChatMessage[]; language: string }> = ({ messages, language }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '400px', overflowY: 'auto', padding: '1rem' }}>
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} language={language} />
      ))}
    </div>
  );
};
