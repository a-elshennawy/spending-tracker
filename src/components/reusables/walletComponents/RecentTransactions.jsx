import { FaCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../../firebase";
import { doc, onSnapshot, updateDoc, arrayRemove } from "firebase/firestore";
import { useEffect, useState } from "react";
import { RiDeleteBack2Fill } from "react-icons/ri";

export default function RecentTransactions() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [currency, setCurrency] = useState("EGP");
  const [walletData, setWalletData] = useState(null);

  useEffect(() => {
    if (!currentUser.uid) {
      return;
    }

    const walletRef = doc(db, "wallets", currentUser.uid);
    const unsubscribe = onSnapshot(walletRef, (walletSnap) => {
      if (walletSnap.exists()) {
        const data = walletSnap.data();
        setWalletData(data);

        if (data.transactions) {
          const sortedTransactions = [...data.transactions].sort(
            (a, b) => b.timestamp.seconds - a.timestamp.seconds
          );

          setCurrency(data.currency);
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

  const handleDeleteTransaction = async (transaction) => {
    if (
      !walletData ||
      !window.confirm("Are you sure you want to delete this transaction?")
    ) {
      return;
    }

    try {
      const walletRef = doc(db, "wallets", currentUser.uid);

      let newBalance;
      if (transaction.type === "deposit") {
        newBalance = walletData.balance - transaction.amount;
      } else {
        newBalance = walletData.balance + transaction.amount;
      }

      await updateDoc(walletRef, {
        balance: newBalance,
        transactions: arrayRemove(transaction),
      });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction. Please try again.");
    }
  };

  return (
    <>
      <div className="recent col-12 px-0 pt-3">
        <h3>recent transactions :</h3>
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <h5
              key={`${transaction.timestamp.seconds}_${transaction.amount}`}
              className={
                transaction.type === "deposit" ? "deposit" : "withdraw"
              }
            >
              {formatDate(transaction.timestamp)}&nbsp;
              {transaction.type === "deposit" ? "+" : "-"}
              {transaction.amount.toFixed(2)}&nbsp;
              {currency}&nbsp;(&nbsp;
              {transaction.balanceAfter.toFixed(2)} {currency}&nbsp;)&nbsp;
              {transaction.category}
              <FaCircle />
              <span
                className="delLog"
                onClick={() => handleDeleteTransaction(transaction)}
                style={{ cursor: "pointer" }}
              >
                <RiDeleteBack2Fill />
              </span>
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
