import React from 'react';
import { ChatMessage } from '../types/krishiBot.types.js';
import { speakText } from '../utils/krishiBot.utils.js';

export const MessageBubble: React.FC<{ message: ChatMessage; language: string }> = ({ message, language }) => {
  const isBot = message.sender === 'bot';
  return (
    <div
      style={{
        alignSelf: isBot ? 'flex-start' : 'flex-end',
        maxWidth: '75%',
        padding: '0.8rem 1.2rem',
        borderRadius: '16px',
        background: isBot ? 'var(--bg-card-hover)' : 'var(--primary)',
        color: isBot ? 'var(--text-main)' : '#fff',
        border: isBot ? '1px solid var(--border-color)' : 'none'
      }}
    >
      <p style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{message.text}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{message.timestamp}</span>
        {isBot && (
          <button
            onClick={() => speakText(message.text, language)}
            aria-label="Read message aloud"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', opacity: 0.7 }}
          >
            🔊
          </button>
        )}
      </div>
    </div>
  );
};
