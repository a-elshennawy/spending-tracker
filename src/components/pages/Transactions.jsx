import { useAuth } from "../contexts/AuthContext";
import { db } from "../../firebase";
import {
  getDoc,
  doc,
  onSnapshot,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";

import { useEffect, useState } from "react";
import { FcDeleteDatabase, FcInfo } from "react-icons/fc";
import { AnimatePresence, motion as Motion } from "motion/react";
import { truncateText } from "../reusables/helpers";

export default function Transactions() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [currency, setCurrency] = useState("EGP");
  const [monthlySpent, setMonthlySpent] = useState(0);
  const [weeklySpent, setWeeklySpent] = useState(0);
  const [walletData, setWalletData] = useState(null);
  const [targetTransaction, setTargetTransaction] = useState(null);

  useEffect(() => {
    if (!currentUser.uid) {
      return;
    }

    const walletRef = doc(db, "wallets", currentUser.uid);
    const unsubscribe = onSnapshot(walletRef, (walletSnap) => {
      if (walletSnap.exists()) {
        const walletData = walletSnap.data();
        setWalletData(walletData);

        if (walletData.transactions) {
          const sortedTransactions = [...walletData.transactions].sort(
            (a, b) => b.timestamp.seconds - a.timestamp.seconds,
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
              t.timestamp.toDate().getFullYear() === currentYear,
          );

          const totalMonthlySpent = currentMonthWithdrawals.reduce(
            (sum, t) => sum + t.amount,
            0,
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
            (t) => t.type === "withdraw" && t.timestamp.toDate() >= startOfWeek,
          );

          const totalWeeklySpent = currentWeekWithdrawals.reduce(
            (sum, t) => sum + t.amount,
            0,
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

  const handleDeleteTransaction = async (transaction) => {
    if (
      !walletData ||
      !window.confirm("Are you sure you want to delete this transaction?")
    ) {
      return;
    }

    try {
      const walletRef = doc(db, "wallets", currentUser.uid);
      const walletSnap = await getDoc(walletRef);
      const walletData = walletSnap.data();

      let newBalance;
      if (transaction.type === "deposit") {
        newBalance = walletData.balance - transaction.amount;
      } else {
        newBalance = walletData.balance + transaction.amount;
      }

      const updateData = {
        balance: newBalance,
        transactions: arrayRemove(transaction),
      };

      if (transaction.method === "pocket") {
        updateData.pocket_balance =
          transaction.type === "deposit"
            ? walletData.pocket_balance - transaction.amount
            : walletData.pocket_balance + transaction.amount;
      } else {
        updateData.card_balance =
          transaction.type === "deposit"
            ? walletData.card_balance - transaction.amount
            : walletData.card_balance + transaction.amount;
      }

      await updateDoc(walletRef, updateData);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction. Please try again.");
    }
  };

  return (
    <>
      <section className="transactions container-fluid m-0 row gap-1 justify-content-start align-items-center">
        <div className="spendReport col-12 col-lg-4 px-0 m-0 row gap-1 justify-content-start align-items-center">
          <div className="spendItem col-3 m-0">
            <h3>monthly spent</h3>
            <h1>
              {monthlySpent} {currency}
            </h1>
          </div>
          <div className="spendItem col-3 m-0">
            <h3>weekly spent</h3>
            <h1>
              {weeklySpent} {currency}
            </h1>
          </div>
        </div>
        <div className="logs col-12 px-0 m-0 mt-4">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div
                key={`${transaction.timestamp.seconds}_${transaction.amount}`}
                className={`${transaction.type === "deposit" ? "depositCard" : "withdrawCard"} transactionCard`}
              >
                <div
                  className="header"
                  onClick={() => {
                    setTargetTransaction(
                      targetTransaction?.timestamp.seconds ===
                        transaction.timestamp.seconds
                        ? null
                        : transaction,
                    );
                  }}
                >
                  <span>
                    <span className="amount">
                      {transaction.amount.toFixed(2)}&nbsp;{currency}
                    </span>
                    &nbsp;-&nbsp;{truncateText(transaction.category, 15)}
                  </span>
                  <span
                    onClick={() => {
                      setTargetTransaction(
                        targetTransaction?.timestamp.seconds ===
                          transaction.timestamp.seconds
                          ? null
                          : transaction,
                      );
                    }}
                  >
                    <FcInfo size={20} />
                  </span>
                </div>
                <AnimatePresence>
                  {targetTransaction?.timestamp.seconds ===
                    transaction.timestamp.seconds && (
                    <Motion.div
                      initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="body"
                    >
                      <h5>{transaction.category}</h5>
                      <h5>
                        <strong>date :&nbsp;</strong>
                        {formatDate(transaction.timestamp)}
                      </h5>
                      <h5>
                        <strong>balance :&nbsp;</strong>
                        {transaction.balanceAfter.toFixed(2)}
                      </h5>
                      <button
                        className="delLog"
                        onClick={() => handleDeleteTransaction(transaction)}
                        style={{ cursor: "pointer" }}
                      >
                        undo transaction&nbsp;
                        <FcDeleteDatabase />
                      </button>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          ) : (
            <p>No recent transactions.</p>
          )}
        </div>
      </section>
    </>
  );
}
