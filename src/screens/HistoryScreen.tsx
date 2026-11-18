import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function HistoryScreen() {
  const [rotas, setRotas] = useState<any[]>([]);

  const carregar = async () => {
    const data = await AsyncStorage.getItem('@historico_rotas');
    setRotas(data ? JSON.parse(data) : []);
  };

  useEffect(() => {
    carregar();
  }, []);

  const limpar = async () => {
    await AsyncStorage.removeItem('@historico_rotas');
    setRotas([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico de Rotas</Text>
        {rotas.length > 0 && (
          <TouchableOpacity onPress={limpar}>
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={rotas}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma rota registrada ainda.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.value}>R$ {Number(item.valor).toFixed(2)} • {item.bairro || 'Destino'}</Text>
              <Text style={styles.date}>{item.data}</Text>
            </View>
            <Text style={styles.details}>
              {item.km} km • R$ {Number(item.ganhoPorKm).toFixed(2)}/km • Lucro: R$ {Number(item.lucroLiquido).toFixed(2)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 42, backgroundColor: '#0B0F19' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#F8FAFC' },
  clearText: { color: '#EF4444', fontWeight: 'bold' },
  empty: { color: '#64748B', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#111827', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#1E293B', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  value: { color: '#22C55E', fontWeight: 'bold', fontSize: 15 },
  date: { color: '#94A3B8', fontSize: 12 },
  details: { color: '#CBD5E1', fontSize: 13 },
});
