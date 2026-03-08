import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0E0E14 0%, #1A1A2E 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,181,38,0.12) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,181,38,0.08) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #F5B526, #D4960E)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              fontWeight: 800,
              color: '#1A1A2E',
              letterSpacing: '-2px',
            }}
          >
            RX
          </div>
          <div
            style={{
              fontSize: '56px',
              fontWeight: 800,
              color: '#E0D5C0',
              letterSpacing: '-1px',
              display: 'flex',
            }}
          >
            R
            <span style={{ color: '#F5B526' }}>X</span>
            penses
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '26px',
            fontWeight: 600,
            color: '#8A8078',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.5,
            display: 'flex',
          }}
        >
          Free AI-Powered Expense Tracker for Couples
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '36px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['AI Chat', 'Receipt Scanning', 'Shared Tracking', 'Budgets', 'Debt Management'].map(
            (f) => (
              <div
                key={f}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  background: 'rgba(245,181,38,0.12)',
                  border: '1px solid rgba(245,181,38,0.25)',
                  color: '#F5B526',
                  fontSize: '18px',
                  fontWeight: 600,
                  display: 'flex',
                }}
              >
                {f}
              </div>
            )
          )}
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            fontSize: '20px',
            fontWeight: 600,
            color: '#4A4540',
            display: 'flex',
          }}
        >
          rxpenses.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
