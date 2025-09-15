import { FaCircle } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Transactions() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [currency, setCurrency] = useState("EGP");
  const [monthlySpent, setMonthlySpent] = useState(0);
  const [weeklySpent, setWeeklySpent] = useState(0);

  useEffect(() => {
    if (!currentUser.uid) {
      return;
    }

    const walletRef = doc(db, "wallets", currentUser.uid);
    const unsubscribe = onSnapshot(walletRef, (walletSnap) => {
      if (walletSnap.exists()) {
        const walletData = walletSnap.data();
        if (walletData.transactions) {
          const sortedTransactions = [...walletData.transactions].sort(
            (a, b) => b.timestamp.seconds - a.timestamp.seconds
          );

          setCurrency(walletData.currency);
          setTransactions(sortedTransactions);
          const today = new Date();
          const currentMonth = today.getMonth();
          const currentYear = today.getFullYear();

          const currentMonthWithdrawals = walletData.transactions.filter(
            (t) =>
              t.type === "withdraw" &&
              t.timestamp.toDate().getMonth() === currentMonth &&
              t.timestamp.toDate().getFullYear() === currentYear
          );

          const totalMonthlySpent = currentMonthWithdrawals.reduce(
            (sum, t) => sum + t.amount,
            0
          );
          setMonthlySpent(totalMonthlySpent);

          const startOfWeek = new Date(today);
          const day = today.getDay();

          let diff;
          if (day === 6) {
            diff = 0;
          } else if (day === 0) {
            diff = -6;
          } else {
            diff = day + 1;
          }

          startOfWeek.setDate(today.getDate() - diff);
          startOfWeek.setHours(0, 0, 0, 0);

          const currentWeekWithdrawals = walletData.transactions.filter(
            (t) => t.type === "withdraw" && t.timestamp.toDate() >= startOfWeek
          );

          const totalWeeklySpent = currentWeekWithdrawals.reduce(
            (sum, t) => sum + t.amount,
            0
          );
          setWeeklySpent(totalWeeklySpent);
        } else {
          setTransactions([]);
          setMonthlySpent(0);
          setWeeklySpent(0);
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  return (
    <>
      <section className="transactions container-fluid m-0 row gap-1 justify-content-start align-items-center">
        <div className="spendReport col-12 col-lg-4 px-0 m-0 row gap-1 justify-content-start align-items-center">
          <div className="spendItem col-5 m-0">
            <h3>monthly withdrawals</h3>
            <h1>
              {monthlySpent} {currency}
            </h1>
          </div>
          <div className="spendItem col-5 m-0">
            <h3>weekly withdrawals</h3>
            <h1>
              {weeklySpent} {currency}
            </h1>
          </div>
        </div>
        <div className="logs col-12 px-0 m-0 mt-4">
          <h3>full transaction history :</h3>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <h5
                key={transaction.timestamp.seconds}
                className={
                  transaction.type === "deposit" ? "deposit" : "withdraw"
                }
              >
                {formatDate(transaction.timestamp)}
                {transaction.type === "deposit" ? "+" : "-"}
                {transaction.amount}
                {currency}&nbsp;(&nbsp;
                {transaction.balanceAfter.toFixed(2)}&nbsp;
                {currency}&nbsp;)&nbsp;{transaction.category}
                <FaCircle />
              </h5>
            ))
          ) : (
            <p>No recent transactions.</p>
          )}
        </div>
      </section>
    </>
  );
}
