import { type NextPage } from "next";
import Head from "next/head";
import Header from "../components/Header";
import { WalletSelectorContextProvider } from "../contexts/WalletSelectorContext";
import Content from "../components/Content";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Decentrahoops</title>
        <meta name="description" content="Decentrahoops" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-gray-800 text-white">
        <WalletSelectorContextProvider>
          <Header />
          <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
            <h1>NEAR Guest Book</h1>

            <Content />
          </div>
        </WalletSelectorContextProvider>
      </main>
    </>
  );
};

export default Home;
