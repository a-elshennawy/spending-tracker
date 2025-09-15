import { FaCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function RecentTransactions() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [currency, setCurrency] = useState("EGP");

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
          setTransactions(sortedTransactions.slice(0, 5));
        } else {
          setTransactions([]);
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
      <div className="recent col-12 px-0 pt-3">
        <h3>recent transactions :</h3>
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <h5
              key={transaction.timestamp.seconds}
              className={
                transaction.type === "deposit" ? "deposit" : "withdraw"
              }
            >
              {formatDate(transaction.timestamp)}{" "}
              {transaction.type === "deposit" ? "+" : "-"}
              {transaction.amount.toFixed(2)} {currency} (balance:{" "}
              {transaction.balanceAfter.toFixed(2)} {currency})
              {transaction.type === "deposit"
                ? ` from ${transaction.category}`
                : ` on ${transaction.category}`}
              <FaCircle />
            </h5>
          ))
        ) : (
          <p>No recent transactions.</p>
        )}
        <button className="mt-2">
          <Link to={"transactions"}>view all here</Link>
        </button>
      </div>
    </>
  );
}
