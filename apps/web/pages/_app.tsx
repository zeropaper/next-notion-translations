import { AppProps } from 'next/app';
import Head from 'next/head';
import { MantineProvider } from '@mantine/core';

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: 'light',
          primaryColor: 'green', // set to 'primary' and setup the 'primary' color in the colors object to customize the primary color
          primaryShade: 5,
          colors: {
            primary: [
              '#cef187',
              '#ff0000',
              '#ff0000',
              '#a8d956',
              '#ff0000',
              '#ff0000',
              '#ff0000',
              '#ff0000',
              '#ff0000',
              '#ff0000'
            ]
          }
        }}
      >
        <Component {...pageProps} />
      </MantineProvider>
    </>
  );
}