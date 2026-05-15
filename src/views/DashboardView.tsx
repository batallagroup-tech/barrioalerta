import React, { useState, useMemo, useRef, useEffect } from 'react';

import { motion, AnimatePresence } from 'motion/react';

import { X, Camera, Layers, ChevronDown } from 'lucide-react';

import {

  Incident, UserProfile, Category, Location as GeoLocation

} from '../types';

import { useAuth } from '../hooks/useAuth';

import { useIncidents } from '../hooks/useIncidents';

import { useChat } from '../hooks/useChat';

import { useNotices } from '../hooks/useNotices';

import { useLocation } from '../hooks/useLocation';

import { incidentService } from '../services/supabase/incidentService';

import { userService } from '../services/supabase/userService';

import { authService } from '../services/supabase/authService';

import { calculateDistance } from '../utils/geo';

import { LocationOnboarding, useLocationOnboarding } from '../components/onboarding/LocationOnboarding';



// Components

import { AppLayout } from '../components/layout/AppLayout';

import { SplashScreen } from '../components/common/SplashScreen';

import { IncidentFeed } from '../components/incident/IncidentFeed';

import { MapView } from '../components/map/MapView';

import { NoticesView } from '../components/notices/NoticesView';

import { ChatView } from '../components/chat/ChatView';

import { IncidentDetailModal } from '../components/modals/IncidentDetailModal';

import { SosModal } from '../components/modals/SosModal';

import { ProfileModal, ZonesModal } from '../components/modals/SideModals';

import { MapSelector } from '../components/ui/MapSelector';

import { CATEGORY_CONFIG, CATEGORIES } from '../constants/categories';

import { admobService } from '../services/admobService';



export const DashboardView: React.FC = () => {

  const { currentUser, setCurrentUser, loading: authLoading } = useAuth();

  const { incidents } = useIncidents();

  const [activeIncidentChatId, setActiveIncidentChatId] = useState<string | null>(null);

  const communityChat = useChat(!!currentUser, currentUser);


  const incidentChat = useChat(!!currentUser, currentUser, activeIncidentChatId || undefined);

  const { userState, setUserState } = useLocation();
  const { notices, sendNotice } = useNotices(currentUser, userState.location, userState.radiusKm);

  const { showOnboarding, completeOnboarding, checked } = useLocationOnboarding();



  const [showSplash, setShowSplash] = useState(true);

  const [magicEmail, setMagicEmail] = useState("");

  const [magicSent, setMagicSent] = useState(false);

  const [magicLoading, setMagicLoading] = useState(false);

  useEffect(() => {

    const timer = setTimeout(() => setShowSplash(false), 2500);

    return () => clearTimeout(timer);

  }, []);



  const handleOnboardingComplete = (location: GeoLocation, _cityName: string) => {

    setUserState(prev => ({ ...prev, location, isLocationEnabled: true }));

    completeOnboarding();

  };



  const [currentView, setCurrentView] = useState<'feed' | 'map' | 'notices'>('feed');

  const [searchQuery, setSearchQuery] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('All');

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isSosModalOpen, setIsSosModalOpen] = useState(false);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [isZonesModalOpen, setIsZonesModalOpen] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [newAlert, setNewAlert] = useState<{

    title: string;

    description: string;

    category: Category;

    imageUrls: string[];

    radiusKm: number;

    customLocation?: GeoLocation;

  }>({ title: '', description: '', category: 'Crime', imageUrls: [], radiusKm: 20 });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const [locationType, setLocationType] = useState<'current' | 'manual'>('current');

  const [sosCountdown, setSosCountdown] = useState<number | null>(null);

  const [sosActiveTab, setSosActiveTab] = useState<string | null>(null);

  const [newMessage, setNewMessage] = useState('');

  const [userVerifiedIncidents, setUserVerifiedIncidents] = useState<Set<string>>(new Set());

  const [userReportedIncidents, setUserReportedIncidents] = useState<Set<string>>(new Set());

  const [showPublicName, setShowPublicName] = useState(true);

  const [preciseLocation, setPreciseLocation] = useState(true);

  const [reportReason, setReportReason] = useState('');

  const [sosConfirmed, setSosConfirmed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);



  useEffect(() => {

    let interval: NodeJS.Timeout;

    if (sosCountdown !== null && sosCountdown > 0) {

      interval = setInterval(() => {

        setSosCountdown(prev => (prev !== null ? prev - 1 : null));

      }, 1000);

    } else if (sosCountdown === 0) {

      handleSosLaunch();

      setSosCountdown(null);

    }

    return () => clearInterval(interval);

  }, [sosCountdown]);



  useEffect(() => {

    if (currentUser) {

      setShowPublicName(currentUser.showPublicName);

      setPreciseLocation(currentUser.preciseLocation);

    }

  }, [currentUser]);



  // Mostrar banner AdMob cuando está logueado

  useEffect(() => {

    if (currentUser) {

      admobService.showBanner().catch(() => {});

    } else {

      admobService.hideBanner().catch(() => {});

    }

    return () => {

      admobService.removeBanner().catch(() => {});

    };

  }, [currentUser]);



  const handleMagicLink = async () => {

    if (!magicEmail.trim()) return;

    setMagicLoading(true);

    try {

      await authService.signInWithMagicLink(magicEmail.trim());

      setMagicSent(true);

    } catch (e) {

      console.error('[Auth] Magic link error:', e);

    } finally {

      setMagicLoading(false);

    }

  };



  const handleSosLaunch = async () => {

    console.log('[SOS] Lanzando con ubicacion:', userState.location);

    try {

      const result = await incidentService.createIncident({

        userId: currentUser?.uid || undefined,

        userName: currentUser ? (currentUser.showPublicName ? (currentUser.displayName || 'Vecino') : 'Vecino') : 'SOS (Emergencia)',

        userPhoto: currentUser?.showPublicName ? currentUser.photoURL : null,

        userVerified: currentUser?.verification?.verificationLevel === 'full',

        title: 'SOS ALERTA VECINAL',

        description: 'Activacion de boton de panico / Emergencia inmediata.',

        category: 'SOS',

        imageUrls: [],

        location: userState.location,

        broadcastRadiusKm: userState.broadcastRadiusKm || 3,

        isSensitive: false,

        isSOS: true,

      });

      console.log('[SOS] Resultado:', result);

      setIsSosModalOpen(false);

      setSosCountdown(null);

      setSosConfirmed(true);

      setTimeout(() => setSosConfirmed(false), 4000);

    } catch (err) {

      console.error('[SOS] Error completo:', JSON.stringify(err), err);

      alert('Error al enviar la alerta. Intenta de nuevo.');

    }

  };



  const handleLaunchAlert = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!currentUser) { setIsModalOpen(false); setIsProfileModalOpen(true); return; }

    setIsAnalyzing(true);

    setAnalysisError(null);

    const incidentLoc = locationType === 'manual' && newAlert.customLocation ? newAlert.customLocation : userState.location;

    try {

      await incidentService.createIncident({

        userId: currentUser?.uid || undefined,

        userName: currentUser ? (currentUser.showPublicName ? (currentUser.displayName || 'Vecino') : 'Vecino') : 'Anonimo',

        userPhoto: currentUser?.showPublicName ? currentUser.photoURL : null,

        userVerified: currentUser?.verification?.verificationLevel === 'full',

        title: newAlert.title,

        description: newAlert.description,

        category: newAlert.category,

        imageUrls: newAlert.imageUrls,

        location: incidentLoc,

        broadcastRadiusKm: newAlert.radiusKm,

        isSensitive: false,

      });

      setIsModalOpen(false);

      setNewAlert({ title: '', description: '', category: 'Crime', imageUrls: [], radiusKm: 20 });

    } catch (err) {

      console.error('Error al crear incidente:', err);

      setAnalysisError('Error al publicar. Intenta de nuevo.');

    } finally {

      setIsAnalyzing(false);

    }

  };



  const handleVerify = async (id: string) => {

    if (!currentUser || userVerifiedIncidents.has(id)) return;

    await incidentService.verifyIncident(id, currentUser.uid);

    setUserVerifiedIncidents(prev => new Set([...prev, id]));

  };



  const handleReport = (id: string) => { setSelectedId(id); setIsReportModalOpen(true); };



  const handleSavePhoto = async (photoURL: string) => {

    if (!currentUser) return;

    await userService.saveProfile(currentUser.uid, { photoURL });

    setCurrentUser(prev => prev ? { ...prev, photoURL } : null);

  };



  const handleSaveProfile = async () => {

    if (!currentUser) return;

    await userService.saveProfile(currentUser.uid, { showPublicName, preciseLocation });

    setCurrentUser(prev => prev ? { ...prev, showPublicName, preciseLocation } : null);

    setIsProfileModalOpen(false);

  };



  const handleConfirmReport = async () => {

    if (!selectedId || !currentUser || !reportReason) return;

    await incidentService.reportIncident(selectedId, currentUser.uid, reportReason);

    setUserReportedIncidents(prev => new Set([...prev, selectedId]));

    setIsReportModalOpen(false);

    setSelectedId(null);

    setReportReason('');

  };



  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const files = e.target.files;

    if (!files || !currentUser) return;

    const uploaded: string[] = [];

    for (const file of Array.from(files) as File[]) {

      const url = await incidentService.uploadImage(file, currentUser.uid);

      if (url) uploaded.push(url);

    }

    setNewAlert(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...uploaded] }));

  };



  const filteredIncidents = useMemo(() => {

    return incidents.filter(inc => {

      const dist = calculateDistance(userState.location, inc.location);

      const inRadius = !userState.location || dist <= userState.radiusKm;

      const matchesSearch = inc.title.toLowerCase().includes(searchQuery.toLowerCase()) || inc.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || inc.category === selectedCategory;

      return inRadius && matchesSearch && matchesCategory;

    });

  }, [incidents, userState.location, userState.radiusKm, searchQuery, selectedCategory]);



  const selectedIncident = useMemo(() => incidents.find(i => i.id === selectedId) || null, [incidents, selectedId]);

  const isChatOpen = currentView === 'notices' || !!activeIncidentChatId;

  const isAnyModalOpen = isModalOpen || isSosModalOpen || isProfileModalOpen || isZonesModalOpen || isReportModalOpen || !!selectedId || isChatOpen;



  return (

    <>

      <AnimatePresence>

        {showSplash && <SplashScreen key="splash" />}

      </AnimatePresence>



      {/* Onboarding solo si NO está logueado — si ya tiene sesión lo saltamos */}

      {checked && showOnboarding && !showSplash && !currentUser && !authLoading && (

        <LocationOnboarding onComplete={handleOnboardingComplete} />

      )}



      {!showSplash && !currentUser && !authLoading && !showOnboarding && (

        <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-8 gap-8">

          <div className="flex flex-col items-center gap-4">

            <div className="bg-red-600 p-5 rounded-[2rem] shadow-2xl shadow-red-900/50">

              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">

                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>

              </svg>

            </div>

            <div className="text-center">

              <h1 className="text-4xl font-black text-white tracking-tighter">BarrioAlerta</h1>

              <p className="text-red-500 font-black uppercase tracking-[0.2em] text-xs mt-1">Seguridad Vecinal</p>

            </div>

          </div>



          <div className="text-center space-y-2 max-w-xs">

            <p className="text-slate-300 leading-relaxed text-sm">

              Unite a tu comunidad. Reporta incidentes, recibe alertas en tiempo real y manten tu barrio seguro.

            </p>

          </div>



          <div className="flex gap-4 w-full max-w-xs">

            <div className="flex-1 bg-slate-900 rounded-2xl p-4 border border-slate-800 text-center">

              <p className="text-white font-black text-xl">24/7</p>

              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Vigilancia</p>

            </div>

            <div className="flex-1 bg-slate-900 rounded-2xl p-4 border border-slate-800 text-center">

              <p className="text-white font-black text-xl">Real</p>

              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Tiempo</p>

            </div>

            <div className="flex-1 bg-slate-900 rounded-2xl p-4 border border-slate-800 text-center">

              <p className="text-white font-black text-xl">100%</p>

              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Gratis</p>

            </div>

          </div>



          <div className="w-full max-w-xs space-y-3">

            {magicSent ? (

              <div className="text-center space-y-3">

                <div className="bg-green-900/40 border border-green-700 rounded-2xl p-4">

                  <p className="text-green-400 font-bold text-sm">¡Correo enviado!</p>

                  <p className="text-slate-400 text-xs mt-1">

                    Revisa tu email y toca el link para entrar a la app.

                  </p>

                </div>

                <button

                  onClick={() => { setMagicSent(false); setMagicEmail(""); }}

                  className="text-slate-500 text-xs underline"

                >

                  Usar otro correo

                </button>

              </div>

            ) : (

              <>

                <button

                  onClick={async () => { try { await authService.signInWithGoogle(); } catch(e) { console.error(e); } }}

                  className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-slate-100 transition-all active:scale-95 shadow-xl"

                >

                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />

                  Continuar con Google

                </button>



                <div className="flex items-center gap-3">

                  <div className="flex-1 h-px bg-slate-800" />

                  <span className="text-slate-600 text-xs">o con email</span>

                  <div className="flex-1 h-px bg-slate-800" />

                </div>



                <input

                  type="email"

                  placeholder="tu@email.com"

                  value={magicEmail}

                  onChange={(e) => setMagicEmail(e.target.value)}

                  onKeyDown={(e) => e.key === 'Enter' && handleMagicLink()}

                  className="w-full py-4 px-5 bg-slate-900 text-white rounded-2xl border border-slate-700 focus:border-red-500 outline-none text-sm placeholder-slate-600"

                />

                <button

                  onClick={handleMagicLink}

                  disabled={magicLoading || !magicEmail.trim()}

                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-red-500 transition-all active:scale-95 shadow-xl shadow-red-900/30 disabled:opacity-50"

                >

                  {magicLoading ? (

                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />

                  ) : (

                    'Entrar con Magic Link'

                  )}

                </button>

              </>

            )}



            <button

              onClick={() => setIsSosModalOpen(true)}

              className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-slate-700 transition-all active:scale-95"

            >

              Alerta Vecinal SOS

            </button>



            <p className="text-center text-slate-600 text-[10px] uppercase tracking-widest font-bold">

              La alerta SOS no requiere cuenta

            </p>

          </div>

        </div>

      )}



      {!showSplash && authLoading && (

        <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">

          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />

        </div>

      )}



      {!showSplash && !authLoading && currentUser && (

        <AppLayout

          currentUser={currentUser}

          currentView={currentView}

          setCurrentView={setCurrentView as any}

          onOpenZones={() => setIsZonesModalOpen(true)}

          onOpenProfile={() => setIsProfileModalOpen(true)}

          onOpenSOS={() => setIsSosModalOpen(true)}

          onOpenAlert={() => setIsModalOpen(true)}

          hideNavigation={isAnyModalOpen}

        >

          {currentView === 'feed' && (

            <IncidentFeed

              incidents={filteredIncidents}

              userLocation={userState.location}

              searchQuery={searchQuery}

              setSearchQuery={setSearchQuery}

              selectedCategory={selectedCategory}

              setSelectedCategory={setSelectedCategory}

              onSelectIncident={(inc) => setSelectedId(inc.id)}

            />

          )}



          {currentView === 'map' && (

            <MapView

              incidents={filteredIncidents}

              userLocation={userState.location}

              radiusKm={userState.radiusKm}

              onSelectIncident={(inc) => setSelectedId(inc.id)}

            />

          )}



          {currentView === 'notices' && !activeIncidentChatId && (

            <NoticesView

              notices={notices}

              currentUser={currentUser}

              onSendNotice={sendNotice}

              onLogin={() => setIsProfileModalOpen(true)}

              onBack={() => setCurrentView('feed')}

            />

          )}

          {activeIncidentChatId && (

            <ChatView

              messages={incidentChat.messages}

              currentUser={currentUser}

              newMessage={newMessage}

              setNewMessage={setNewMessage}

              onSendMessage={(e) => { e.preventDefault(); if (newMessage.trim()) { incidentChat.sendMessage(newMessage); setNewMessage(''); } }}

              onAddReaction={incidentChat.addReaction}

              onLogin={() => setIsProfileModalOpen(true)}

              onBackClick={() => setActiveIncidentChatId(null)}

            />

          )}

          <IncidentDetailModal

            incident={selectedIncident}

            userLocation={userState.location}

            onClose={() => setSelectedId(null)}

            onVerify={handleVerify}

            onReport={handleReport}

            onDiscuss={(inc) => { setActiveIncidentChatId(inc.id); setCurrentView('notices'); setSelectedId(null); }}

            isVerifiedByUser={!!selectedId && userVerifiedIncidents.has(selectedId)}

            isReportedByUser={!!selectedId && userReportedIncidents.has(selectedId)}

          />



          <SosModal

            isOpen={isSosModalOpen}

            onClose={() => setIsSosModalOpen(false)}

            userState={userState}

            sosCountdown={sosCountdown}

            setSosCountdown={setSosCountdown}

            activeTab={sosActiveTab}

            setActiveTab={setSosActiveTab}

          />



          <ProfileModal

            isOpen={isProfileModalOpen}

            currentUser={currentUser}

            showPublicName={showPublicName}

            setShowPublicName={setShowPublicName}

            preciseLocation={preciseLocation}

            setPreciseLocation={setPreciseLocation}

            onSavePhoto={handleSavePhoto}

            onSave={handleSaveProfile}

            onClose={() => setIsProfileModalOpen(false)}

            onLogin={() => setIsProfileModalOpen(true)}  

            onLogout={() => authService.signOut()}

          />



          <ZonesModal

            isOpen={isZonesModalOpen}

            onClose={() => setIsZonesModalOpen(false)}

            onSave={() => setIsZonesModalOpen(false)}

            userState={userState}

            setUserState={setUserState}

          />



          <AnimatePresence>

            {isReportModalOpen && (

              <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">

                <motion.div

                  initial={{ scale: 0.9, opacity: 0 }}

                  animate={{ scale: 1, opacity: 1 }}

                  exit={{ scale: 0.9, opacity: 0 }}

                  className="bg-slate-900 w-full max-w-xs rounded-3xl border border-slate-700 shadow-2xl p-6 space-y-4"

                >

                  <h3 className="text-lg font-bold text-white">Por que reportas esto?</h3>

                  <div className="space-y-2">

                    {['Falso/Spam', 'Contenido inapropiado', 'Ya no es relevante', 'Ubicacion incorrecta'].map(reason => (

                      <label key={reason} className="flex items-center gap-3 p-3 rounded-xl border border-slate-700 bg-slate-800 cursor-pointer hover:bg-slate-700">

                        <input type="radio" name="reportReason" value={reason} checked={reportReason === reason} onChange={(e) => setReportReason(e.target.value)} className="accent-red-500 w-4 h-4" />

                        <span className="text-sm text-slate-300 font-medium">{reason}</span>

                      </label>

                    ))}

                  </div>

                  <div className="flex gap-3 pt-2">

                    <button onClick={() => setIsReportModalOpen(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold text-sm">Cancelar</button>

                    <button onClick={handleConfirmReport} disabled={!reportReason} className="flex-1 py-3 bg-red-600 disabled:opacity-50 text-white rounded-xl font-bold text-sm">Confirmar</button>

                  </div>

                </motion.div>

              </div>

            )}

          </AnimatePresence>



          <AnimatePresence>

            {isModalOpen && (

              <div className="fixed inset-0 z-[130] flex items-end justify-center">

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />

                <motion.div

                  initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}

                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}

                  className="relative bg-slate-900 w-full p-4 sm:p-8 rounded-t-[2.5rem] border-t border-slate-700 flex flex-col shadow-2xl overflow-hidden max-h-[95vh]"

                >

                  <div className="overflow-y-auto no-scrollbar">

                    <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-8 sm:mb-10"></div>

                    <div className="flex justify-between items-center mb-8">

                      <h2 className="text-2xl font-black text-white tracking-tighter italic">Lanzar Alerta Roja</h2>

                      <button onClick={() => setIsModalOpen(false)} className="bg-slate-800 p-2.5 rounded-full text-slate-400 hover:text-white transition-all"><X size={24} /></button>

                    </div>



                    <form onSubmit={handleLaunchAlert} className="space-y-6 pb-12">

                      <div className="space-y-3">

                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Categoria de Emergencia</label>

                        <div className="relative">

                          <button type="button" onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)} className="w-full flex items-center justify-between p-4 bg-slate-800/80 border-2 border-slate-700 rounded-2xl text-white hover:border-red-500/50 transition-all">

                            <div className="flex items-center gap-3">

                              <span className="text-2xl">{CATEGORY_CONFIG[newAlert.category].emoji}</span>

                              <span className="font-bold uppercase tracking-widest text-sm">{CATEGORY_CONFIG[newAlert.category].label}</span>

                            </div>

                            <ChevronDown size={20} className={`text-slate-500 transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />

                          </button>

                          <AnimatePresence>

                            {isCategoryMenuOpen && (

                              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-50 mt-2 w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto no-scrollbar">

                                {(CATEGORIES as string[]).filter(c => c !== 'All' && c !== 'Other').map(cat => (

                                  <button key={cat} type="button" onClick={() => { setNewAlert({ ...newAlert, category: cat as Category }); setIsCategoryMenuOpen(false); }} className={`w-full flex items-center gap-4 p-4 hover:bg-slate-800 transition-colors border-b border-white/5 last:border-0 ${newAlert.category === cat ? 'bg-red-600/10' : ''}`}>

                                    <span className="text-xl">{CATEGORY_CONFIG[cat].emoji}</span>

                                    <span className={`text-xs font-bold uppercase tracking-widest ${newAlert.category === cat ? 'text-red-500' : 'text-slate-300'}`}>{CATEGORY_CONFIG[cat].label}</span>

                                  </button>

                                ))}

                              </motion.div>

                            )}

                          </AnimatePresence>

                        </div>

                      </div>



                      <div className="space-y-2">

                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Que esta pasando?</label>

                        <input required placeholder="Ej: Robo en progreso, Fuga de agua, etc." value={newAlert.title} onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })} className="w-full bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-4 text-sm text-slate-100 outline-none focus:border-red-600/50 transition-all font-medium" />

                      </div>



                      <div className="space-y-2">

                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Evidencia Visual (Opcional)</label>

                        <div className="flex gap-3">

                          <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex-1 h-20 flex flex-col items-center justify-center bg-slate-800 border-2 border-dashed border-slate-700 rounded-2xl text-slate-400 gap-1 hover:border-slate-500 transition-all">

                            <Camera size={24} /><span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Camara</span>

                          </button>

                          <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 h-20 flex flex-col items-center justify-center bg-slate-800 border-2 border-dashed border-slate-700 rounded-2xl text-slate-400 gap-1 hover:border-slate-500 transition-all">

                            <Layers size={24} /><span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Galeria</span>

                          </button>

                        </div>

                        <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleImageUpload} />

                        <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />

                        {newAlert.imageUrls.length > 0 && (

                          <div className="flex gap-2 flex-wrap mt-2">

                            {newAlert.imageUrls.map((url, i) => (

                              <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700">

                                <img src={url} className="w-full h-full object-cover" />

                                <button type="button" onClick={() => setNewAlert(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, j) => j !== i) }))} className="absolute top-0.5 right-0.5 bg-red-600 rounded-full w-4 h-4 flex items-center justify-center text-white text-[10px] font-black">x</button>

                              </div>

                            ))}

                          </div>

                        )}

                      </div>



                      <div className="space-y-3">

                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Punto de Referencia</label>

                        <div className="flex bg-slate-800/50 p-1 rounded-2xl border border-slate-700">

                          <button type="button" onClick={() => setLocationType('current')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${locationType === 'current' ? 'bg-red-600 text-white shadow-lg font-bold' : 'text-slate-500'}`}>GPS Actual</button>

                          <button type="button" onClick={() => setLocationType('manual')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${locationType === 'manual' ? 'bg-red-600 text-white shadow-lg font-bold' : 'text-slate-500'}`}>Manual</button>

                        </div>

                      </div>



                      {locationType === 'manual' && (

                        <MapSelector center={newAlert.customLocation || userState.location} onChange={(loc) => setNewAlert({ ...newAlert, customLocation: loc })} height={180} />

                      )}



                      {analysisError && <p className="text-red-400 text-sm font-medium text-center">{analysisError}</p>}



                      <button type="submit" disabled={isAnalyzing} className="w-full py-5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black uppercase tracking-[0.2em] text-sm rounded-2xl shadow-xl shadow-red-900/30 transition-all active:scale-95">

                        {isAnalyzing ? (

                          <div className="flex items-center justify-center gap-3">

                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>

                            Publicando...

                          </div>

                        ) : 'Enviar alerta'}

                      </button>

                    </form>

                  </div>

                </motion.div>

              </div>

            )}

          </AnimatePresence>

        </AppLayout>

      )}

      {sosConfirmed && (

        <motion.div

          initial={{ opacity: 0, y: 50 }}

          animate={{ opacity: 1, y: 0 }}

          exit={{ opacity: 0, y: 50 }}

          className="fixed bottom-32 left-4 right-4 z-[300] bg-red-600 text-white rounded-2xl p-4 flex items-center gap-3 shadow-2xl shadow-red-900/50"

        >

          <span className="text-2xl">??</span>

          <div>

            <p className="font-black text-sm uppercase tracking-wide">Alerta SOS enviada</p>

            <p className="text-red-200 text-xs">Los vecinos cercanos han sido notificados.</p>

          </div>

        </motion.div>

      )}



    </>

  );

};





















