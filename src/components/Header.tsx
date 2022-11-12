import React, { Fragment, useCallback, useEffect, useState } from "react";
import { providers, utils } from "near-api-js";
import type { AccountView } from "near-api-js/lib/providers/provider";
import type { Account } from "../interfaces";
import { useWalletSelector } from "../contexts/WalletSelectorContext";
import { Popover, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { GiBasketballBall } from "react-icons/gi";

export default function Header() {
  const { selector, modal, accounts, accountId } = useWalletSelector();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const getAccount = useCallback(async (): Promise<Account | null> => {
    if (!accountId) {
      return null;
    }

    const { network } = selector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    return provider
      .query<AccountView>({
        request_type: "view_account",
        finality: "final",
        account_id: accountId,
      })
      .then((data) => ({
        ...data,
        account_id: accountId,
      }));
  }, [accountId, selector.options]);

  const handleSignIn = () => {
    modal.show();
  };

  const handleSignOut = async () => {
    const wallet = await selector.wallet();

    wallet.signOut().catch((err) => {
      console.log("Failed to sign out");
      console.error(err);
    });
  };

  const handleSwitchWallet = () => {
    modal.show();
  };

  useEffect(() => {
    if (!accountId) {
      return setAccount(null);
    }

    setLoading(true);

    getAccount().then((nextAccount) => {
      setAccount(nextAccount);
      setLoading(false);
    });
  }, [accountId, getAccount]);

  return (
    <Popover className="relative border-b border-gray-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between  py-6 md:justify-start md:space-x-10">
          <div className="flex items-center justify-start lg:w-0 lg:flex-1">
            <a href="#">
              <span className="sr-only">Your Company</span>
              <GiBasketballBall className="h-8 w-auto text-orange-600 sm:h-10" />
            </a>
            <div className="ml-4 text-4xl font-bold">Decentrahoops</div>
          </div>
          <div className="-my-2 -mr-2 md:hidden">
            <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500">
              <span className="sr-only">Open menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </Popover.Button>
          </div>

          <div className="hidden items-center justify-end md:flex md:flex-1 lg:w-0">
            {account ? (
              <div>
                Your Balance: {utils.format.formatNearAmount(account.amount, 2)}{" "}
                N
                <HeaderButton onClick={handleSwitchWallet}>
                  Switch Wallet
                </HeaderButton>
                <HeaderButton onClick={handleSignOut}>
                  Disconnect Wallet
                </HeaderButton>
              </div>
            ) : (
              <HeaderButton onClick={handleSignIn}>Connect Wallet</HeaderButton>
            )}
          </div>
        </div>
      </div>

      <Transition
        as={Fragment}
        enter="duration-200 ease-out"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="duration-100 ease-in"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Popover.Panel
          focus
          className="absolute inset-x-0 top-0 origin-top-right transform p-2 transition md:hidden"
        >
          <div className="divide-y-2 divide-gray-50 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="px-5 pt-5 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <a href="#">
                    <GiBasketballBall className="h-8 w-auto text-orange-600 sm:h-10" />
                    <div className="ml-4 text-2xl font-bold text-slate-800">
                      Decentrahoops
                    </div>
                  </a>
                </div>
                <div className="-mr-2">
                  <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </Popover.Button>
                </div>
              </div>
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}

interface ButtonProps {
  children?: React.ReactNode;
  onClick: () => void;
}

const HeaderButton: React.FC<ButtonProps> = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className="mx-1 inline-flex items-center justify-center whitespace-nowrap rounded-md border border-transparent bg-orange-600 px-1 py-1 text-base font-medium text-white shadow-sm hover:bg-orange-400"
    >
      {children}
    </button>
  );
};
