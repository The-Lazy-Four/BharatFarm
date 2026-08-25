import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app.js';

describe('Server Infrastructure', () => {
  it('creates express app instance successfully', () => {
    const app = createApp();
    expect(app).toBeDefined();
  });
});
