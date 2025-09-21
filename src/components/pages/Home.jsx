import { useAuth } from "../contexts/AuthContext";
import BalanceActions from "../reusables/walletComponents/BalanceActions";
import RecentTransactions from "../reusables/walletComponents/RecentTransactions";

export default function Home() {
  const { currentUser } = useAuth();

  const getDisplayName = (email) => {
    if (!email) return "User";
    return email.split("@")[0];
  };

  return (
    <>
      <section className="container-fluid m-0 home row justify-content-start align-items-center gap-2">
        <BalanceActions />
        <RecentTransactions />
      </section>
    </>
  );
}
