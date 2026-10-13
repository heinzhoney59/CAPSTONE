import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ingredient } from "../types";
import { formatDDay } from "../utils/date";

interface Props {
  ingredients: Ingredient[];
  onBack: () => void;
  onDelete: (id: number) => void;
}

export default function AllIngredientsScreen({ ingredients, onBack, onDelete }: Props) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"expiry" | "name">("expiry");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortedIngredients = useMemo(() =>
    ingredients
      .filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a, b) => {
        const result = sortBy === "name"
          ? a.name.localeCompare(b.name, "ko")
          : a.days - b.days;
        return sortOrder === "asc" ? result : -result;
      }), [ingredients, query, sortBy, sortOrder]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>〈 돌아가기</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>전체 재료 ({ingredients.length}개)</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ padding: 16, backgroundColor: "#fff" }}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="재료 이름으로 찾아보세요"
          placeholderTextColor="#999"
        />
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={[styles.catChip, sortBy === "expiry" && styles.catChipActive]}
              onPress={() => setSortBy("expiry")}
            >
              <Text style={[styles.catChipText, sortBy === "expiry" && styles.catChipTextActive]}>유통기한순</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.catChip, sortBy === "name" && styles.catChipActive]}
              onPress={() => setSortBy("name")}
            >
              <Text style={[styles.catChipText, sortBy === "name" && styles.catChipTextActive]}>이름순</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.catChip}
            onPress={() => setSortOrder(order => order === "asc" ? "desc" : "asc")}
          >
            <Text style={styles.catChipText}>{sortOrder === "asc" ? "오름차순 ↑" : "내림차순 ↓"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {sortedIngredients.map((item) => (
          <View style={styles.shelfCard} key={item.id}>
            <View style={styles.ingredientRow}>
              <Text style={styles.ingredientEmoji}>{item.emoji || "📦"}</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.ingredientName}>{item.name}</Text>
                <Text style={styles.ingredientSub}>{item.category} · {item.amount} · {item.expiryDate}까지</Text>
              </View>
              <View style={[styles.dateBadge, item.freshness === "urgent" ? styles.urgent : item.freshness === "soon" ? styles.soon : styles.fresh]}>
                <Text style={styles.dateText}>{formatDDay(item.days)}</Text>
              </View>
              <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {!sortedIngredients.length && (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Text style={{ color: "#888", fontSize: 16 }}>찾는 재료가 없어요</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  backText: { fontSize: 14, color: "#007AFF" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 8, fontSize: 14 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#f0f0f0", borderRadius: 16 },
  catChipActive: { backgroundColor: "#2B4C3F" },
  catChipText: { fontSize: 13, color: "#666" },
  catChipTextActive: { color: "#fff", fontWeight: "bold" },
  shelfCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#eee" },
  ingredientRow: { flexDirection: "row", alignItems: "center" },
  ingredientEmoji: { fontSize: 24, marginRight: 8 },
  ingredientName: { fontSize: 15, fontWeight: "600", color: "#333" },
  ingredientSub: { fontSize: 12, color: "#777", marginTop: 2 },
  dateBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  urgent: { backgroundColor: "#FFE5E5" },
  soon: { backgroundColor: "#FFF4E5" },
  fresh: { backgroundColor: "#E8F5EC" },
  dateText: { fontSize: 11, fontWeight: "bold", color: "#333" },
  deleteBtn: { padding: 6, marginLeft: 8 },
  deleteText: { fontSize: 14, color: "#aaa" },
});