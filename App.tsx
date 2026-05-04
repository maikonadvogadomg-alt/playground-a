import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  StatusBar, BackHandler, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const STORAGE_KEY = "@assistente_juridico_url";
type Screen = "setup" | "loading" | "app";

export default function App() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [serverUrl, setServerUrl] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [webError, setWebError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const webRef = useRef<WebView>(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && saved.startsWith("http")) {
          setServerUrl(saved); setInputUrl(saved); setScreen("app");
        } else { setScreen("setup"); }
      } catch { setScreen("setup"); }
      finally { await SplashScreen.hideAsync(); }
    })();
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (showSettings) { setShowSettings(false); return true; }
      if (canGoBack && webRef.current) { webRef.current.goBack(); return true; }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack, showSettings]);

  const saveUrl = async (url: string) => {
    const clean = url.trim().replace(/\/$/, "");
    if (!clean.startsWith("http")) {
      Alert.alert("URL inválida", "Cole a URL completa começando com https://");
      return;
    }
    await AsyncStorage.setItem(STORAGE_KEY, clean);
    setServerUrl(clean); setInputUrl(clean);
    setShowSettings(false); setWebError(false); setScreen("app");
  };

  const clearUrl = async () => {
    Alert.alert("Redefinir servidor", "Isso vai te levar para a tela de configuração. Continuar?",
      [{ text: "Cancelar", style: "cancel" },
       { text: "Redefinir", style: "destructive", onPress: async () => {
           await AsyncStorage.removeItem(STORAGE_KEY);
           setServerUrl(""); setInputUrl(""); setWebError(false);
           setShowSettings(false); setScreen("setup");
         }
       }]
    );
  };

  if (screen === "loading") return (
    <View style={s.splash}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <Text style={s.splashIcon}>⚖️</Text>
      <Text style={s.splashTitle}>Assistente Jurídico IA</Text>
      <ActivityIndicator color="#6366f1" style={{ marginTop: 24 }} />
    </View>
  );

  if (screen === "setup") return (
    <KeyboardAvoidingView style={s.setup} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView contentContainerStyle={s.setupContent}>
        <Text style={s.setupIcon}>⚖️</Text>
        <Text style={s.setupTitle}>Assistente Jurídico IA</Text>
        <Text style={s.setupSub}>Maikon Caldeira — OAB/MG 183712</Text>
        <View style={s.card}>
          <Text style={s.cardTitle}>🌐 URL do Servidor</Text>
          <Text style={s.cardDesc}>Cole o endereço onde o Assistente Jurídico está hospedado (Replit, Railway, etc).</Text>
          <TextInput
            style={s.input} value={inputUrl} onChangeText={setInputUrl}
            placeholder="https://seuapp.replit.app" placeholderTextColor="#64748b"
            autoCapitalize="none" autoCorrect={false} keyboardType="url"
            onSubmitEditing={() => saveUrl(inputUrl)}
          />
          <TouchableOpacity style={[s.btn, !inputUrl.trim() && s.btnOff]} disabled={!inputUrl.trim()} onPress={() => saveUrl(inputUrl)}>
            <Text style={s.btnText}>Conectar →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      {showSettings && (
        <View style={s.overlay}>
          <View style={s.settingsCard}>
            <Text style={s.settingsTitle}>⚙️ Configurações</Text>
            <Text style={s.lbl}>URL do Servidor</Text>
            <TextInput style={s.input} value={inputUrl} onChangeText={setInputUrl}
              placeholder="https://seuapp.replit.app" placeholderTextColor="#64748b"
              autoCapitalize="none" autoCorrect={false} keyboardType="url" />
            <TouchableOpacity style={s.saveBtn} onPress={() => saveUrl(inputUrl)}>
              <Text style={s.saveBtnText}>Salvar URL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.reloadBtn} onPress={() => { setWebError(false); setShowSettings(false); webRef.current?.reload(); }}>
              <Text style={s.reloadBtnText}>Recarregar App</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.resetBtn} onPress={clearUrl}>
              <Text style={s.resetBtnText}>Redefinir Servidor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.closeBtn} onPress={() => setShowSettings(false)}>
              <Text style={s.closeBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {webError && !showSettings && (
        <View style={s.errorScreen}>
          <Text style={s.errorIcon}>📡</Text>
          <Text style={s.errorTitle}>Servidor não encontrado</Text>
          <Text style={s.errorDesc}>Não foi possível conectar a:{"
"}{serverUrl}</Text>
          <TouchableOpacity style={s.btn} onPress={() => { setWebError(false); webRef.current?.reload(); }}>
            <Text style={s.btnText}>Tentar novamente</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.textBtn} onPress={() => { setWebError(false); setInputUrl(serverUrl); setShowSettings(true); }}>
            <Text style={s.textBtnText}>Alterar URL do servidor</Text>
          </TouchableOpacity>
        </View>
      )}
      {!webError && (
        <WebView ref={webRef} source={{ uri: serverUrl }} style={s.webview}
          onNavigationStateChange={(st) => setCanGoBack(st.canGoBack)}
          onError={() => setWebError(true)}
          onHttpError={(e) => { if (e.nativeEvent.statusCode >= 500) setWebError(true); }}
          startInLoadingState
          renderLoading={() => (
            <View style={s.loading}>
              <ActivityIndicator size="large" color="#6366f1" />
              <Text style={s.loadingText}>Conectando ao servidor...</Text>
            </View>
          )}
          javaScriptEnabled domStorageEnabled allowFileAccess
          mixedContentMode="always" allowUniversalAccessFromFileURLs
          userAgent="AssistenteJuridicoApp/1.0 (Android; Mobile)"
          pullToRefreshEnabled cacheEnabled cacheMode="LOAD_CACHE_ELSE_NETWORK"
        />
      )}
      {!showSettings && screen === "app" && (
        <TouchableOpacity style={s.fab} onPress={() => { setInputUrl(serverUrl); setShowSettings(true); }}>
          <Text style={s.fabIcon}>⚙</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const C = { bg: "#0f172a", card: "#1e293b", border: "#334155", primary: "#6366f1", text: "#f1f5f9", muted: "#94a3b8" };
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  webview: { flex: 1 },
  splash: { flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" },
  splashIcon: { fontSize: 64, marginBottom: 16 },
  splashTitle: { color: C.text, fontSize: 22, fontWeight: "700" },
  setup: { flex: 1, backgroundColor: C.bg },
  setupContent: { flexGrow: 1, padding: 24, paddingTop: 60, alignItems: "center" },
  setupIcon: { fontSize: 72, marginBottom: 16 },
  setupTitle: { color: C.text, fontSize: 24, fontWeight: "800", textAlign: "center" },
  setupSub: { color: C.muted, fontSize: 13, marginTop: 4, marginBottom: 32, textAlign: "center" },
  card: { width: "100%", backgroundColor: C.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: C.border, marginBottom: 16 },
  cardTitle: { color: C.text, fontSize: 16, fontWeight: "700", marginBottom: 8 },
  cardDesc: { color: C.muted, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 14, color: C.text, fontSize: 14, marginBottom: 16 },
  btn: { backgroundColor: C.primary, borderRadius: 10, padding: 14, alignItems: "center" },
  btnOff: { opacity: 0.4 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.85)", zIndex: 100, justifyContent: "center", padding: 20 },
  settingsCard: { backgroundColor: C.card, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: C.border },
  settingsTitle: { color: C.text, fontSize: 18, fontWeight: "800", marginBottom: 20, textAlign: "center" },
  lbl: { color: C.muted, fontSize: 12, marginBottom: 6 },
  saveBtn: { backgroundColor: C.primary, borderRadius: 10, padding: 12, alignItems: "center", marginBottom: 10 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  reloadBtn: { backgroundColor: "#0369a1", borderRadius: 10, padding: 12, alignItems: "center", marginBottom: 10 },
  reloadBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  resetBtn: { borderRadius: 10, padding: 12, alignItems: "center", borderWidth: 1, borderColor: "#ef444466", marginBottom: 10 },
  resetBtnText: { color: "#ef4444", fontWeight: "600", fontSize: 14 },
  closeBtn: { padding: 12, alignItems: "center" },
  closeBtnText: { color: C.muted, fontSize: 14 },
  errorScreen: { flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center", padding: 32 },
  errorIcon: { fontSize: 64, marginBottom: 20 },
  errorTitle: { color: C.text, fontSize: 20, fontWeight: "800", marginBottom: 12, textAlign: "center" },
  errorDesc: { color: C.muted, fontSize: 13, textAlign: "center", marginBottom: 24, lineHeight: 20 },
  textBtn: { padding: 12 },
  textBtnText: { color: C.muted, fontSize: 14 },
  loading: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" },
  loadingText: { color: C.muted, fontSize: 14, marginTop: 16 },
  fab: { position: "absolute", bottom: 24, right: 20, width: 46, height: 46, borderRadius: 23, backgroundColor: "#1e293bcc", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  fabIcon: { fontSize: 20 },
});
