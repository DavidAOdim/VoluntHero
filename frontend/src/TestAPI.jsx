import { useEffect } from "react";
import { getHistory } from "./services/history";

export default function TestAPI() {
  useEffect(() => {
    getHistory(1)
      .then((res) => console.log("✅ Connected:", res.data))
      .catch((err) => console.error("❌ API Error:", err.message));
  }, []);

  return <h2>Testing Backend Connection...</h2>;
}
