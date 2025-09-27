import { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { getVocabularySets } from "../lib/firebase";
import VocabularyManager from "../components/VocabularyManager";

export const Home: React.FC = () => {
  const { user } = useAuth();
  const [sets, setSets] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchSets = async () => {
      const data = await getVocabularySets(user.id);
      setSets(data);
    };

    fetchSets();
  }, [user]);

  return (
    <div className="min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      {user ? (
        <VocabularyManager />
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-400">
          Vui lòng đăng nhập để quản lý bộ từ vựng của bạn.
        </p>
      )}
    </div>
  );
};
