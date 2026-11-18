import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export function DashboardScreen() {
  const [valorCorrida, setValorCorrida] = useState('');
  const [distanciaKm, setDistanciaKm] = useState('');
  const [bairroDestino, setBairroDestino] = useState('');

  const [metaKm, setMetaKm] = useState(2.0);
  const [custoKm, setCustoKm] = useState(0.65);
  const [kmMaximo, setKmMaximo] = useState(15);
  const [preferidos, setPreferidos] = useState<string[]>(['centro', 'major prates', 'ibituruna', 'todos os santos']);
  const [evitados, setEvitados] = useState<string[]>(['zona rural', 'distrito industrial']);
  const [localStatus, setLocalStatus] = useState('GPS pronto');

  useEffect(() => {
    AsyncStorage.getItem('@config_km').then((data) => {
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.valorKm) setMetaKm(parseFloat(parsed.valorKm.replace(',', '.')) || 2.0);
        if (parsed.custoKm) setCustoKm(parseFloat(parsed.custoKm.replace(',', '.')) || 0.65);
        if (parsed.kmMaximo) setKmMaximo(parseFloat(parsed.kmMaximo.replace(',', '.')) || 15);
        if (parsed.bairrosPreferidos !== undefined) {
          setPreferidos(parsed.bairrosPreferidos.split(',').map((b: string) => b.trim().toLowerCase()).filter(Boolean));
        }
        if (parsed.bairrosEvitados !== undefined) {
          setEvitados(parsed.bairrosEvitados.split(',').map((b: string) => b.trim().toLowerCase()).filter(Boolean));
        }
      }
    });
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      setLocalStatus(status === 'granted' ? 'GPS ativo' : 'Sem GPS');
    });
  }, []);

  const valor = parseFloat(valorCorrida.replace(',', '.')) || 0;
  const km = parseFloat(distanciaKm.replace(',', '.')) || 0;
  const bairroLimpo = bairroDestino.trim().toLowerCase();

  const ganhoPorKm = km > 0 ? valor / km : 0;
  const lucroLiquido = km > 0 ? valor - km * custoKm : 0;

  const kmValeAPena = ganhoPorKm >= metaKm;
  const muitoLonge = km > kmMaximo;
  const isBairroPreferido = bairroLimpo.length > 0 && preferidos.some((p) => bairroLimpo.includes(p) || p.includes(bairroLimpo));
  const isBairroEvitado = bairroLimpo.length > 0 && evitados.some((e) => bairroLimpo.includes(e) || e.includes(bairroLimpo));

  let corBarra = '#1E293B';
  let textoArea = 'AGUARDANDO DADOS';

  if (km > 0 || valor > 0 || bairroLimpo.length > 0) {
    if (isBairroEvitado) {
      corBarra = '#DC2626';
      textoArea = 'ÁREA EVITADA!';
    } else if (muitoLonge) {
      corBarra = '#D97706';
      textoArea = 'MUITO LONGE';
    } else if (!kmValeAPena && km > 0 && valor > 0) {
      corBarra = '#DC2626';
      textoArea = 'KM BAIXO';
    } else if (isBairroPreferido) {
      corBarra = '#16A34A';
      textoArea = 'ÁREA BOA';
    } else {
      corBarra = '#2563EB';
      textoArea = 'ÁREA NEUTRA';
    }
  }

  const registrarRota = async () => {
    if (valor <= 0 || km <= 0) {
      Alert.alert('Atenção', 'Preencha o valor e a distância (KM) da corrida.');
      return;
    }
    const atual = await AsyncStorage.getItem('@historico_rotas');
    const lista = atual ? JSON.parse(atual) : [];
    lista.unshift({
      id: Date.now().toString(),
      data: new Date().toLocaleDateString('pt-BR'),
      bairro: bairroDestino.trim() || 'Não informado',
      valor,
      km,
      ganhoPorKm,
      lucroLiquido,
      valeAPena: kmValeAPena && !isBairroEvitado,
    });
    await AsyncStorage.setItem('@historico_rotas', JSON.stringify(lista));
    setValorCorrida('');
    setDistanciaKm('');
    setBairroDestino('');
    Alert.alert('Registrado', 'Corrida salva no histórico!');
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.topOverlayBar, { backgroundColor: corBarra }]}>
        <View style={styles.topItem}>
          <Text style={styles.topLabel}>DISTÂNCIA</Text>
          <Text style={styles.topValue}>{km > 0 ? `${km.toFixed(1)} km` : '-- km'}</Text>
        </View>
        <View style={styles.topDivider} />
        <View style={styles.topItem}>
          <Text style={styles.topLabel}>VALOR (R$/KM)</Text>
          <Text style={styles.topValue}>
            {valor > 0 ? `R$ ${valor.toFixed(2)}` : 'R$ --'}
            {km > 0 && valor > 0 ? ` (${ganhoPorKm.toFixed(2)})` : ''}
          </Text>
        </View>
        <View style={styles.topDivider} />
        <View style={styles.topItem}>
          <Text style={styles.topLabel}>ÁREA / DESTINO</Text>
          <Text style={styles.topValue} numberOfLines={1}>{textoArea}</Text>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Mob Lets • Radar</Text>
          <Text style={styles.badge}>{localStatus}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Valor da Corrida (R$)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={valorCorrida} onChangeText={setValorCorrida} placeholder="Ex: 12.00" placeholderTextColor="#64748B" />
          <Text style={styles.label}>Distância Total (KM)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={distanciaKm} onChangeText={setDistanciaKm} placeholder="Ex: 4.5" placeholderTextColor="#64748B" />
          <Text style={styles.label}>Bairro de Destino</Text>
          <TextInput style={styles.input} value={bairroDestino} onChangeText={setBairroDestino} placeholder="Ex: Centro, Zona Rural..." placeholderTextColor="#64748B" />
        </View>

        {km > 0 && valor > 0 && (
          <View style={[styles.resultCard, { borderColor: corBarra }]}>
            <Text style={styles.profitText}>
              • Ganho por KM: R$ {ganhoPorKm.toFixed(2)}/km ({kmValeAPena ? 'Vale a pena' : `Meta: R$ ${metaKm.toFixed(2)}`})
            </Text>
            <Text style={styles.profitText}>
              • Destino: {bairroDestino.trim() || 'Não informado'} ({isBairroEvitado ? 'NÃO IR - Área evitada' : isBairroPreferido ? 'Bairro bom' : 'Neutro'})
            </Text>
            <Text style={styles.profitText}>• Lucro líquido estimado: R$ {lucroLiquido.toFixed(2)}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={registrarRota}>
          <Text style={styles.buttonText}>Salvar Corrida</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B0F19' },
  topOverlayBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 38,
    paddingBottom: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  topItem: { flex: 1, alignItems: 'center' },
  topDivider: { width: 1, height: 26, backgroundColor: 'rgba(255,255,255,0.25)' },
  topLabel: { color: '#E2E8F0', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  topValue: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold', marginTop: 2 },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#F8FAFC' },
  badge: { color: '#22C55E', fontSize: 12, backgroundColor: '#111827', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#1E293B' },
  card: { backgroundColor: '#111827', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#1E293B' },
  label: { color: '#94A3B8', fontSize: 13, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#0B0F19', color: '#F8FAFC', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1E293B', fontSize: 16 },
  resultCard: { backgroundColor: '#111827', padding: 14, borderRadius: 12, borderWidth: 2, marginTop: 16 },
  profitText: { color: '#F8FAFC', fontSize: 13, marginBottom: 4 },
  button: { backgroundColor: '#22C55E', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 18 },
  buttonText: { color: '#0B0F19', fontWeight: 'bold', fontSize: 16 },
});
