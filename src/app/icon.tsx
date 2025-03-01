import { ImageResponse } from 'next/og';
 
export const runtime = 'edge';
 
export function generateImageMetadata() {
  return [
    {
      contentType: 'image/png',
      size: { width: 48, height: 48 },
      id: 'small',
    },
    {
      contentType: 'image/png',
      size: { width: 72, height: 72 },
      id: 'medium',
    },
    {
      contentType: 'image/png',
      size: { width: 96, height: 96 },
      id: 'large',
    },
    {
      contentType: 'image/png',
      size: { width: 180, height: 180 },
      id: 'apple-touch-icon',
    },
    {
      contentType: 'image/png',
      size: { width: 192, height: 192 },
      id: 'android-chrome-192',
    },
    {
      contentType: 'image/png',
      size: { width: 512, height: 512 },
      id: 'android-chrome-512',
    },
  ];
}
 
export default function Icon({ /* id */ }: { id: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          background: '#0ea5e9',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '12%',
        }}
      >
        Mi
      </div>
    )
  );
}
