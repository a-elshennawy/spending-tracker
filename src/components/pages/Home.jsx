import BalanceActions from "../reusables/walletComponents/BalanceActions";
import RecentTransactions from "../reusables/walletComponents/RecentTransactions";

export default function Home() {
  return (
    <>
      <section className="container-fluid m-0 home row justify-content-start align-items-center gap-2">
        <BalanceActions />
        <RecentTransactions />
      </section>
    </>
  );
}
