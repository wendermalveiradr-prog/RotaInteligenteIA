import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function SettingsScreen() {
  const [valorKm, setValorKm] = useState('2.00');
  const [custoKm, setCustoKm] = useState('0.65');
  const [kmMaximo, setKmMaximo] = useState('15');
  const [bairrosPreferidos, setBairrosPreferidos] = useState('Centro, Major Prates, Ibituruna, Todos os Santos');
  const [bairrosEvitados, setBairrosEvitados] = useState('Zona Rural, Distrito Industrial');

  useEffect(() => {
    AsyncStorage.getItem('@config_km').then((data) => {
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.valorKm) setValorKm(parsed.valorKm);
        if (parsed.custoKm) setCustoKm(parsed.custoKm);
        if (parsed.kmMaximo) setKmMaximo(parsed.kmMaximo);
        if (parsed.bairrosPreferidos !== undefined) setBairrosPreferidos(parsed.bairrosPreferidos);
        if (parsed.bairrosEvitados !== undefined) setBairrosEvitados(parsed.bairrosEvitados);
      }
    });
  }, []);

  const salvar = async () => {
    await AsyncStorage.setItem('@config_km', JSON.stringify({ valorKm, custoKm, kmMaximo, bairrosPreferidos, bairrosEvitados }));
    Alert.alert('Salvo!', 'Regras atualizadas.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Regras e Bairros</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Meta mínima por KM (R$)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={valorKm} onChangeText={setValorKm} placeholderTextColor="#64748B" />
        <Text style={styles.label}>Distância máxima (KM - acima disso é Muito Longe)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={kmMaximo} onChangeText={setKmMaximo} placeholderTextColor="#64748B" />
        <Text style={styles.label}>Custo médio por KM (R$)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={custoKm} onChangeText={setCustoKm} placeholderTextColor="#64748B" />
        <Text style={styles.label}>Bairros que QUERO ir (vírgula)</Text>
        <TextInput style={[styles.input, styles.textArea]} multiline value={bairrosPreferidos} onChangeText={setBairrosPreferidos} placeholderTextColor="#64748B" />
        <Text style={styles.label}>Bairros a EVITAR (vírgula)</Text>
        <TextInput style={[styles.input, styles.textArea]} multiline value={bairrosEvitados} onChangeText={setBairrosEvitados} placeholderTextColor="#64748B" />
        <TouchableOpacity style={styles.button} onPress={salvar}>
          <Text style={styles.buttonText}>Salvar Regras</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  content: { padding: 20, paddingTop: 42, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 16 },
  card: { backgroundColor: '#111827', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#1E293B' },
  label: { color: '#94A3B8', fontSize: 13, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#0B0F19', color: '#F8FAFC', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1E293B', fontSize: 15 },
  textArea: { minHeight: 55, textAlignVertical: 'top' },
  button: { backgroundColor: '#22C55E', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#0B0F19', fontWeight: 'bold', fontSize: 16 },
});
