import { type NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
const Header = dynamic(() => import("../components/Header"), {
  suspense: true,
});
import { WalletSelectorContextProvider } from "../contexts/WalletSelectorContext";
import YourBets from "../components/YourBets";

const YourBetsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Decentrahoops - Your Bets</title>
        <meta name="description" content="Decentrahoops" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-gray-800 text-white">
        <WalletSelectorContextProvider>
          <Header />
          <div className="container mx-auto flex min-h-screen flex-col items-center p-4">
            <h1 className="py-4 text-6xl font-extrabold">Your Bets</h1>
            <YourBets />
          </div>
        </WalletSelectorContextProvider>
      </main>
    </>
  );
};

export default YourBetsPage;
