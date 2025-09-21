import { MdCurrencyExchange } from "react-icons/md";
import { useEffect, useState, useRef } from "react";
import {
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../../firebase";

export default function BalanceActions() {
  const { currentUser } = useAuth();
  const [balance, setBalance] = useState(null);
  const [currency, setCurrency] = useState("EGP");
  const [showModal, setShowModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [transactionType, setTransactionType] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currencyList, setCurrencyList] = useState([]);

  const modalRef = useRef();

  useEffect(() => {
    if (!currentUser?.uid) {
      return;
    }

    const walletRef = doc(db, "wallets", currentUser.uid);

    const unsubscribe = onSnapshot(
      walletRef,
      (walletSnap) => {
        if (walletSnap.exists()) {
          const walletData = walletSnap.data();
          setBalance(walletData.balance);
          setCurrency(walletData.currency);
        } else {
          setBalance(0);
        }
      },
      (error) => {
        console.error("error getting balance:", error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    const handleOutsideClicks = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener("mousedown", handleOutsideClicks);
    } else {
      document.removeEventListener("mousedown", handleOutsideClicks);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClicks);
  }, [showModal]);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch(
          "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json"
        );
        const data = await response.json();

        const currencies = Object.keys(data).map((code) => ({
          code: code.toUpperCase(),
          name: data[code],
        }));

        setCurrencyList(currencies);
      } catch (error) {
        console.error("Failed to fetch currency list:", error);
      }
    };
    fetchCurrencies();
  }, []);

  const openModal = (type) => {
    setTransactionType(type);
    setShowModal(true);
    setError("");
    setAmount("");
    setCategory("");
    setDescription("");
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const openCurrencyModal = () => {
    setShowCurrencyModal(true);
  };

  const handleCurrencyChange = async (e) => {
    const newCurrency = e.target.value;

    try {
      const walletRef = doc(db, "wallets", currentUser.uid);
      const walletSnap = await getDoc(walletRef);
      const walletData = walletSnap.data();

      const oldCurrency = walletData.currency;
      const transactions = walletData.transactions || [];

      const response = await fetch(
        `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${oldCurrency.toLowerCase()}.json`
      );
      const data = await response.json();
      const rate = data[oldCurrency.toLowerCase()][newCurrency.toLowerCase()];

      const convertedBalance = (walletData.balance * rate).toFixed(2);

      const convertedTransactions = transactions.map((t) => {
        const convertedAmount = (t.amount * rate).toFixed(2);
        const convertedBalanceAfter = (t.balanceAfter * rate).toFixed(2);

        return {
          ...t,
          amount: parseFloat(convertedAmount),
          balanceAfter: parseFloat(convertedBalanceAfter),
        };
      });

      await updateDoc(walletRef, {
        balance: parseFloat(convertedBalance),
        currency: newCurrency,
        transactions: convertedTransactions,
      });

      setShowCurrencyModal(false);
    } catch (error) {
      console.error("Failed to convert currency:", error);
      alert("Failed to change currency. Please try again later.");
      setShowCurrencyModal(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) {
      setError("Amount and Category are required.");
      return;
    }

    try {
      const walletRef = doc(db, "wallets", currentUser.uid);
      const newAmount = parseFloat(amount);

      if (transactionType === "withdraw" && balance < newAmount) {
        setError("Insufficient balance.");
        setLoading(false);
        return;
      }

      const newBalance =
        transactionType === "deposit"
          ? parseFloat(balance) + parseFloat(newAmount)
          : parseFloat(balance) - parseFloat(newAmount);

      const newTransaction = {
        amount: newAmount,
        category: category,
        description: description,
        timestamp: Timestamp.now(),
        type: transactionType,
        balanceAfter: newBalance,
      };

      await updateDoc(walletRef, {
        balance: newBalance,
        transactions: arrayUnion(newTransaction),
      });

      closeModal();
    } catch (err) {
      console.error("Failed to update wallet:", err);
      setError("Failed to process transaction.");
    }

    setLoading(false);
  };

  return (
    <>
      <div className="balance col-12 px-0 mb-2">
        <h3>current balance</h3>
        <h1>
          {balance !== null ? balance.toFixed(2) : "Loading..."} {currency}
          <span>
            <MdCurrencyExchange
              onClick={openCurrencyModal}
              style={{ cursor: "pointer" }}
            />
          </span>
        </h1>
      </div>
      <hr />

      <div className="actions d-flex col-12 px-0">
        <button onClick={() => openModal("deposit")} className="depBtn">
          deposit
        </button>
        <button onClick={() => openModal("withdraw")} className="withdrawBtn">
          withdraw
        </button>
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
        >
          <div
            ref={modalRef}
            style={{
              padding: "20px",
              backgroundColor: "white",
              borderRadius: "5px",
              width: "90%",
              maxWidth: "400px",
            }}
            className="moneyModal text-start"
          >
            <h4>{transactionType} form</h4>
            <form onSubmit={handleSubmit}>
              {error && (
                <p style={{ color: "red", textAlign: "center" }}>{error}</p>
              )}
              <div className="py-2">
                <label htmlFor="amount">Amount</label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="py-2">
                <label htmlFor="category">reason for transaction</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>
              <div className="text-end pt-2">
                <button className="mx-1" type="button" onClick={closeModal}>
                  Cancel
                </button>
                <button className="mx-1" type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCurrencyModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
        >
          <div
            ref={modalRef}
            style={{
              padding: "20px",
              backgroundColor: "white",
              borderRadius: "5px",
              width: "90%",
              maxWidth: "400px",
            }}
            className="moneyModal text-start"
          >
            <h4>Select a new currency</h4>
            <div className="py-2">
              <label htmlFor="currency-select">Choose Currency</label>
              <select
                id="currency-select"
                onChange={handleCurrencyChange}
                value={currency}
              >
                {currencyList.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="text-end">
              <button
                className="mt-2"
                onClick={() => setShowCurrencyModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
