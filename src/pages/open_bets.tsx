import { type NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
const Header = dynamic(() => import("../components/Header"), {
  suspense: true,
});
import { WalletSelectorContextProvider } from "../contexts/WalletSelectorContext";
import OpenBets from "../components/OpenBets";

const OpenBetsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Decentrahoops - All Open Bets</title>
        <meta name="description" content="Decentrahoops" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <WalletSelectorContextProvider>
          <Header />
          <div className="container mx-auto flex min-h-screen flex-col items-center p-4">
            <h1 className="py-4 text-6xl font-extrabold">
              All Open Bets Below
            </h1>
            <OpenBets />
          </div>
        </WalletSelectorContextProvider>
      </main>
    </>
  );
};

export default OpenBetsPage;
