import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);
  initializeApp({
    credential: cert(serviceAccount)
  });
}
const db = getFirestore();

export default async function handler(req, res) {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  
  try {
    const docRef = db.collection("users").doc(userId);
    const doc = await docRef.get();
    if (!doc.exists) {
      // Если пользователь ещё не зарегистрирован, можно вернуть начальные данные.
      return res.status(200).json({ coin: 0, maxCoin: 0 });
    }
    return res.status(200).json(doc.data());
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
