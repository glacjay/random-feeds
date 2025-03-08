import MyApp from './MyApp';

export default function RootLayout({ children }: { session: any; children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo192.png" />

        <link rel="manifest" href="/manifest.json" />

        <title>random feeds</title>
      </head>

      <body>
        <MyApp>{children}</MyApp>
      </body>
    </html>
  );
}
