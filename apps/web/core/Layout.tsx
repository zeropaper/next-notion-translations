import Head from 'next/head'
import Header from "./Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="app">
        <Header />
        <main>{children}</main>
      </div>
    </>
  );
}