
import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

type Tab = 'dashboard' | 'history' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content"  />

      <View style={styles.content}>
        {activeTab === 'dashboard' && <DashboardScreen />}
        {activeTab === 'history' && <HistoryScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('dashboard')}>
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.tabActive]}>
            Painel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('history')}>
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabActive]}>
            Histórico
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('settings')}>
          <Text style={[styles.tabText, activeTab === 'settings' && styles.tabActive]}>
            Configurar KM
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0F19' },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingVertical: 12,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabText: { color: '#94A3B8', fontSize: 14, fontWeight: 'bold' },
  tabActive: { color: '#22C55E' },
});
