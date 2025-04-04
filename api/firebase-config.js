import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Универсальное API для сохранения любых данных
export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { userId, ...data } = req.body;

  if (!userId || Object.keys(data).length === 0) {
    console.log("❌ Некорректные данные:", req.body);
    return res.status(400).json({ error: "Missing userId or data" });
  }

  try {
    console.log("📥 Данные для сохранения:", { userId, ...data });

    const userDocRef = db.collection("All_users").doc(userId);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
      // Обновляем только изменённые или новые данные
      await userDocRef.update(data);
      console.log(`✅ Данные обновлены для UserID: ${userId}`);
    } else {
      // Создаём нового пользователя с переданными данными
      await userDocRef.set({ ...data, TelegramID: userId });
      console.log(`✅ Новый пользователь создан с UserID: ${userId}`);
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Ошибка при записи в Firestore:", err.message);
    res.status(500).json({ error: err.message });
  }
};
