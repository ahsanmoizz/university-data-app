// frontend/src/pages/PaymentPage.jsx
import { useEffect, useState } from "react";
import API from "../utils/api";

export default function PaymentPage() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [keys, setKeys] = useState([]);

  // ✅ Fetch available plans from backend
  useEffect(() => {
    const loadPlans = async () => {
     const res = await API.get("/payment/plans");
setPlans(Array.isArray(res.data) ? res.data : []);
    };
    loadPlans();
    fetchKeys();
  }, []);

  // ✅ Fetch user API keys
  const fetchKeys = async () => {
    const res = await API.get("/keys/my");
    setKeys(res.data);
  };

  // ✅ Simulate a payment process
  const handlePayment = async () => {
    if (!selectedPlan) return alert("Select a plan first.");
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const { data } = await API.post("/payment/simulate-payment", {
        userId: user.id,
        planName: selectedPlan.name,
      });
      alert(`✅ ${data.message}\nPlan: ${selectedPlan.name}`);
      await API.post("/keys/generate", { plan: selectedPlan.name });
      fetchKeys();
    } catch (err) {
      console.error("Payment error:", err);
      alert("❌ Payment simulation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6">
      <h2 className="text-3xl font-semibold text-center mb-4">
        Subscription Plans & API Keys
      </h2>

      {/* 🧾 Plans Section */}
      <div className="grid sm:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`border rounded-lg p-4 cursor-pointer ${
              selectedPlan?.name === plan.name
                ? "border-blue-600 bg-blue-50"
                : "hover:border-blue-400"
            }`}
            onClick={() => setSelectedPlan(plan)}
          >
            <h3 className="font-semibold text-lg mb-2">{plan.name}</h3>
            <p className="text-gray-700 mb-2">${plan.amount}</p>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 🧩 Payment Button */}
      <div className="text-center">
        <button
          onClick={handlePayment}
          disabled={loading || !selectedPlan}
          className={`px-6 py-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading
            ? "Processing..."
            : selectedPlan
            ? `Activate ${selectedPlan.name}`
            : "Select a Plan"}
        </button>
      </div>

      {/* 🔑 API Keys List */}
      <div className="border p-4 rounded bg-gray-50">
        <h3 className="font-semibold mb-2">Your API Keys</h3>
        {keys.length === 0 ? (
          <p className="text-gray-500 text-sm">No keys yet.</p>
        ) : (
         <ul className="space-y-2">
  {Array.isArray(keys) && keys.length > 0 ? (
    keys.map(k => (
      <li key={k.id} className="flex justify-between items-center">
        <span className="text-sm break-all">{k.key}</span>
        <span className="text-xs text-gray-600">
          {k.validTo ? new Date(k.validTo).toLocaleDateString() : "No Expiry"}
        </span>
      </li>
    ))
  ) : (
    <p className="text-gray-500 text-sm italic">No keys yet.</p>
  )}
</ul>
        )}
      </div>
    </div>
  );
}
