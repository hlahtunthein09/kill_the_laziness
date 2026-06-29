import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const cssPath = resolve(__dirname, '../globals.css');
const css = readFileSync(cssPath, 'utf-8');

describe('globals.css dark mode foundation', () => {
  it('has .dark block with expected --background', () => {
    expect(css).toMatch(/--background:\s*#0B1120/);
  });

  it('has .dark block with expected --card', () => {
    expect(css).toMatch(/--card:\s*hsl\(217,\s*33%,\s*17%\)/);
  });

  it('has .dark block with expected --primary', () => {
    expect(css).toMatch(/--primary:\s*#C6F135/);
  });

  it('has .dark block with expected --secondary', () => {
    expect(css).toMatch(/--secondary:\s*#22C55E/);
  });

  it('has .dark block with expected --foreground', () => {
    expect(css).toMatch(/--foreground:\s*#FFFFFF/);
  });

  it('has .dark block with expected --muted-foreground', () => {
    expect(css).toMatch(/--muted-foreground:\s*#B0B8C4/);
  });

  it('has .dark block with expected --border', () => {
    expect(css).toMatch(/--border:\s*#2A3649/);
  });

  it('has dark gradient overrides for .bg-gradient-soft', () => {
    expect(css).toMatch(/\.dark\s+\.bg-gradient-soft\s*\{/);
  });

  it('has dark gradient overrides for .bg-gradient-nature', () => {
    expect(css).toMatch(/\.dark\s+\.bg-gradient-nature\s*\{/);
  });

  it('has dark .bg-card-glow variant', () => {
    expect(css).toMatch(/\.dark\s+\.bg-card-glow\s*\{/);
  });
});
