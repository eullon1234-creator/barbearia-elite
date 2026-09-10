import React, { useState, useRef, useMemo } from 'react';
import { 
  Calendar, Clock, CheckCircle2, Coffee, 
  Palmtree, DollarSign, Edit2, Trash2, Plus, 
  Phone, Scissors, Share2, Check, ExternalLink, Copy,
  ShieldCheck, Sparkles, AlertCircle, Settings, 
  Building2, X, RotateCcw, ChevronRight, User, Eye, EyeOff,
  Upload, Camera, Loader2, Palette, Image as ImageIcon, Download,
  BarChart3, TrendingUp, MapPin, Navigation, LocateFixed, Search,
  Heart, MessageCircle, QrCode, Megaphone, Lock, KeyRound, Gift
} from 'lucide-react';
import { useBarber, THEME_PRESETS } from '../context/BarberContext';
import { uploadImageToCloudinary } from '../services/cloudinary';
import BarberAnalytics from './BarberAnalytics';
import { getMapEmbedUrl } from '../utils/mapUtils';
import ImageCropperModal from './ImageCropperModal';
import { InstagramIcon } from './Icons';
import { getCleanWhatsAppNumber } from '../utils/phoneUtils';
import { useLicense } from '../context/LicenseContext';
import SaaSSubscriptionModal from './SaaSSubscriptionModal';
import SaaSBlockedScreen from './SaaSBlockedScreen';

export default function BarberDashboard({ onBackToClientView, onLockDashboard }) {
  const {
    theme, selectThemePreset, setCustomColor,
    services, addService, updateService, deleteService,
    amenities, toggleAmenity, addAmenity, deleteAmenity,
    barbers, addBarber, updateBarber, deleteBarber, toggleBarberActive,
    galleryImages, addGalleryImage, removeGalleryImage,
    profile, updateProfile, addSpecialty, removeSpecialty,
    scheduleConfig, updateSchedule, triggerQuickPause, resumeStatus, toggleVacationMode,
    appointments, updateAppointmentStatus, addAppointment, deleteAppointment,
    cloudSyncStatus, isCloudSyncing, syncLocalToCloud,
    exportConfiguration, importConfiguration, resetToFactoryDefaults
  } = useBarber();

  const { license, getLicenseMetrics } = useLicense();
  const [isSaaSPayModalOpen, setIsSaaSPayModalOpen] = useState(false);
  const licenseMetrics = getLicenseMetrics();

  const [activeSubTab, setActiveSubTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const tab = p.get('aba');
      if (tab) return tab;
    }
    return 'dashboard';
  }); // 'dashboard' | 'agenda' | 'servicos' | 'temas' | 'horarios' | 'perfil'
  const [copiedLink, setCopiedLink] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Estados de Uploads via Cloudinary
  const [isUploadingServiceImage, setIsUploadingServiceImage] = useState(false);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const [isUploadingCoverImage, setIsUploadingCoverImage] = useState(false);
  const [isUploadingLogoImage, setIsUploadingLogoImage] = useState(false);
  const [isUploadingGalleryImage, setIsUploadingGalleryImage] = useState(false);
  const [isUploadingBarberImage, setIsUploadingBarberImage] = useState(false);

  const serviceFileInputRef = useRef(null);
  const profileFileInputRef = useRef(null);
  const coverFileInputRef = useRef(null);
  const logoFileInputRef = useRef(null);
  const galleryFileInputRef = useRef(null);
  const barberFileInputRef = useRef(null);
  const jsonFileInputRef = useRef(null);

  // Estado do Modal de Recorte e Ajuste de Fotos
  const [cropperModal, setCropperModal] = useState({
    isOpen: false,
    imageSrc: null,
    title: 'Ajustar & Recortar Foto',
    cropType: 'service',
    targetCallback: null,
  });

  // Estados de formulários / modais
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '', category: 'cabelo', duration: '30 min', price: '', description: '', badge: '', image: ''
  });

  // Estados da Equipe de Barbeiros
  const [isBarberModalOpen, setIsBarberModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [barberForm, setBarberForm] = useState({
    name: '',
    role: 'Barbeiro Profissional',
    icon: '✂️',
    phone: '',
    specialties: 'Degradê, Barba na Toalha Quente',
  });

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    client: '', phone: '', service: '', barber: '', date: '', time: '14:00', price: '', payment: 'Pix'
  });

  const [newSpecialtyText, setNewSpecialtyText] = useState('');
  const [newAmenityText, setNewAmenityText] = useState('');
  const [customColorInput, setCustomColorInput] = useState(theme.primary || '#D4AF37');

  const showToast = (msg) => {
    setNotificationMessage(msg);
    setTimeout(() => setNotificationMessage(''), 3000);
  };

  // Função universal de cópia com fallback para qualquer celular ou computador
  const copyToClipboardRobust = async (text) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      // Falha no clipboard nativo, segue para o fallback abaixo
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (success) return true;
    } catch (err) {
      // Fallback falhou
    }
    return false;
  };

  // URL 100% limpa do cliente (sem #barbeiro, sem ?barbeiro=1, sem PIN)
  const getCleanClientUrl = () => {
    if (typeof window === 'undefined') return 'https://eullon1234-creator.github.io/barbearia-elite/';
    const host = window.location.hostname;
    // Se estiver em desenvolvimento local
    if (host === 'localhost' || host === '127.0.0.1') {
      return `${window.location.origin}/`;
    }
    // URL de produção no GitHub Pages
    return 'https://eullon1234-creator.github.io/barbearia-elite/';
  };

  const handleCopyClientLink = async () => {
    const clientUrl = getCleanClientUrl();
    const ok = await copyToClipboardRobust(clientUrl);
    if (ok) {
      setCopiedLink(true);
      showToast('Link do CLIENTE copiado: ' + clientUrl);
      setTimeout(() => setCopiedLink(false), 3000);
    } else {
      prompt('Copie o link dos clientes abaixo:', clientUrl);
    }
  };

  // Handlers de Upload com Pré-recorte e Ajuste Interativo
  const handleServiceFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCropperModal({
        isOpen: true,
        imageSrc: ev.target.result,
        title: 'Recortar Foto do Corte / Serviço',
        cropType: 'service',
        targetCallback: async (croppedFile) => {
          try {
            setIsUploadingServiceImage(true);
            showToast('Enviando foto do corte para o Cloudinary...');
            const imageUrl = await uploadImageToCloudinary(croppedFile);
            setServiceForm(prev => ({ ...prev, image: imageUrl }));
            if (editingService?.id) {
              updateService(editingService.id, { image: imageUrl });
              showToast('Foto do corte salva e atualizada com sucesso!');
            } else {
              showToast('Foto do corte carregada!');
            }
            setCropperModal(prev => ({ ...prev, isOpen: false }));
          } catch (err) {
            alert('Erro ao enviar imagem: ' + (err.message || 'Erro no upload'));
          } finally {
            setIsUploadingServiceImage(false);
          }
        }
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleProfileFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCropperModal({
        isOpen: true,
        imageSrc: ev.target.result,
        title: 'Recortar Sua Foto de Perfil',
        cropType: 'avatar',
        targetCallback: async (croppedFile) => {
          try {
            setIsUploadingProfileImage(true);
            showToast('Enviando foto de perfil para o Cloudinary...');
            const imageUrl = await uploadImageToCloudinary(croppedFile);
            updateProfile({ image: imageUrl });
            showToast('Foto de perfil atualizada com sucesso!');
            setCropperModal(prev => ({ ...prev, isOpen: false }));
          } catch (err) {
            alert('Erro ao enviar imagem: ' + (err.message || 'Erro no upload'));
          } finally {
            setIsUploadingProfileImage(false);
          }
        }
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCoverFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCropperModal({
        isOpen: true,
        imageSrc: ev.target.result,
        title: 'Recortar Foto de Capa (Banner)',
        cropType: 'cover',
        targetCallback: async (croppedFile) => {
          try {
            setIsUploadingCoverImage(true);
            showToast('Enviando foto de capa para o Cloudinary...');
            const imageUrl = await uploadImageToCloudinary(croppedFile);
            updateProfile({ coverImage: imageUrl });
            showToast('Foto de capa atualizada com sucesso!');
            setCropperModal(prev => ({ ...prev, isOpen: false }));
          } catch (err) {
            alert('Erro ao enviar imagem: ' + (err.message || 'Erro no upload'));
          } finally {
            setIsUploadingCoverImage(false);
          }
        }
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleLogoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCropperModal({
        isOpen: true,
        imageSrc: ev.target.result,
        title: 'Recortar Logotipo da Barbearia',
        cropType: 'logo',
        targetCallback: async (croppedFile) => {
          try {
            setIsUploadingLogoImage(true);
            showToast('Enviando logotipo para o Cloudinary...');
            const imageUrl = await uploadImageToCloudinary(croppedFile);
            updateProfile({ logoImage: imageUrl });
            showToast('Logotipo atualizado com sucesso!');
            setCropperModal(prev => ({ ...prev, isOpen: false }));
          } catch (err) {
            alert('Erro ao enviar imagem: ' + (err.message || 'Erro no upload'));
          } finally {
            setIsUploadingLogoImage(false);
          }
        }
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleGalleryFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCropperModal({
        isOpen: true,
        imageSrc: ev.target.result,
        title: 'Recortar Foto do Espaço / Galeria',
        cropType: 'gallery',
        targetCallback: async (croppedFile) => {
          try {
            setIsUploadingGalleryImage(true);
            showToast('Enviando foto do espaço para o Cloudinary...');
            const imageUrl = await uploadImageToCloudinary(croppedFile);
            addGalleryImage(imageUrl);
            showToast('Nova foto adicionada à galeria!');
            setCropperModal(prev => ({ ...prev, isOpen: false }));
          } catch (err) {
            alert('Erro ao enviar imagem: ' + (err.message || 'Erro no upload'));
          } finally {
            setIsUploadingGalleryImage(false);
          }
        }
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleBarberPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCropperModal({
        isOpen: true,
        imageSrc: ev.target.result,
        title: `Recortar Foto de ${barberForm.name || 'Barbeiro'}`,
        cropType: 'avatar',
        targetCallback: async (croppedFile) => {
          try {
            setIsUploadingBarberImage(true);
            showToast('Enviando foto do profissional para o Cloudinary...');
            const imageUrl = await uploadImageToCloudinary(croppedFile);
            setBarberForm(prev => ({ ...prev, photo: imageUrl }));
            if (editingBarber?.id) {
              updateBarber(editingBarber.id, { photo: imageUrl });
              showToast('Foto do barbeiro atualizada e salva!');
            } else {
              showToast('Foto do barbeiro carregada com sucesso!');
            }
            setCropperModal(prev => ({ ...prev, isOpen: false }));
          } catch (err) {
            alert('Erro ao enviar imagem: ' + (err.message || 'Erro no upload'));
          } finally {
            setIsUploadingBarberImage(false);
          }
        }
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleImportJsonFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const success = importConfiguration(content);
        if (success) {
          showToast('Configurações importadas com sucesso!');
        }
      }
    };
    reader.readAsText(file);
  };

  // Funções dinâmicas para controle de datas (fuso horário local)
  const getTodayStr = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  };

  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const getWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const pad = (n) => String(n).padStart(2, '0');
    const startStr = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
    const endStr = `${sunday.getFullYear()}-${pad(sunday.getMonth() + 1)}-${pad(sunday.getDate())}`;
    return { startStr, endStr };
  };

  const [agendaFilter, setAgendaFilter] = useState('hoje'); // 'hoje' | 'amanha' | 'semana' | 'todos'

  const todayStr = getTodayStr();
  const tomorrowStr = getTomorrowStr();
  const { startStr: weekStart, endStr: weekEnd } = getWeekRange();

  // Atendimentos específicos de HOJE para os cards do topo da Agenda
  const todayAppointments = useMemo(() => {
    return appointments.filter(a => (a.date || todayStr) === todayStr);
  }, [appointments, todayStr]);

  const todayCompleted = useMemo(() => {
    return todayAppointments.filter(a => a.status === 'Concluído').length;
  }, [todayAppointments]);

  const todayBilling = useMemo(() => {
    return todayAppointments.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
  }, [todayAppointments]);

  // Lista filtrada para a visualização da Agenda
  const filteredAgendaAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const aptDate = apt.date || todayStr;
      if (agendaFilter === 'hoje') return aptDate === todayStr;
      if (agendaFilter === 'amanha') return aptDate === tomorrowStr;
      if (agendaFilter === 'semana') return aptDate >= weekStart && aptDate <= weekEnd;
      return true; // 'todos'
    });
  }, [appointments, agendaFilter, todayStr, tomorrowStr, weekStart, weekEnd]);

  // Cálculos financeiros gerais (total)
  const totalBilling = appointments.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
  const completedAppointments = appointments.filter(a => a.status === 'Concluído').length;

  // Estado e Handlers de Localização & GPS
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleGetDeviceLocation = () => {
    if (!navigator.geolocation) {
      alert('Seu navegador não possui suporte a geolocalização por GPS.');
      return;
    }

    setIsGettingLocation(true);
    showToast('Acessando o GPS do celular...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        const generatedMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

        let detectedStreet = '';
        let detectedNeighborhood = '';
        let detectedCity = '';
        let detectedState = '';

        // 1. Tenta BigDataCloud (otimizado para browsers móveis sem bloqueio de CORS)
        try {
          const bdcResp = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`
          );
          if (bdcResp.ok) {
            const bdcData = await bdcResp.json();
            if (bdcData) {
              detectedCity = bdcData.locality || bdcData.city || '';
              detectedState = bdcData.principalSubdivisionCode ? bdcData.principalSubdivisionCode.replace('BR-', '') : (bdcData.principalSubdivision || '');
              
              if (bdcData.localityInfo && Array.isArray(bdcData.localityInfo.administrative)) {
                const sub = bdcData.localityInfo.administrative.find(a => a.adminLevel === 8 || a.adminLevel === 7 || a.description?.includes('bairro'));
                if (sub && sub.name && sub.name !== detectedCity) {
                  detectedNeighborhood = sub.name;
                }
              }
            }
          }
        } catch (e) {
          console.warn('BigDataCloud geocode:', e);
        }

        // 2. Tenta Nominatim para complementar com rua e número
        try {
          const osmResp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'pt-BR' } }
          );
          if (osmResp.ok) {
            const osmData = await osmResp.json();
            if (osmData && osmData.address) {
              const road = osmData.address.road || osmData.address.street || osmData.address.pedestrian || '';
              const num = osmData.address.house_number ? `, nº ${osmData.address.house_number}` : '';
              const neigh = osmData.address.suburb || osmData.address.neighbourhood || osmData.address.village || detectedNeighborhood;
              const city = osmData.address.city || osmData.address.town || osmData.address.municipality || detectedCity;
              const state = osmData.address.state ? osmData.address.state : detectedState;

              if (road) detectedStreet = `${road}${num}`;
              if (neigh) detectedNeighborhood = neigh;
              if (city) detectedCity = city;
              if (state) detectedState = state;
            }
          }
        } catch (e) {
          console.warn('Nominatim geocode:', e);
        }

        // Monta os textos finais de endereço e cidade
        const finalAddress = detectedStreet 
          ? (detectedNeighborhood ? `${detectedStreet}, ${detectedNeighborhood}` : detectedStreet)
          : (detectedNeighborhood ? `Bairro ${detectedNeighborhood}` : `Localização GPS (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`);
        
        const finalCityState = [detectedCity, detectedState].filter(Boolean).join(' - ') || 'Localização Atual';

        updateProfile({
          lat: latitude,
          lng: longitude,
          mapsUrl: generatedMapsUrl,
          address: finalAddress,
          cityState: finalCityState,
        });

        setIsGettingLocation(false);
        showToast(`GPS capturado! Local: ${finalCityState}`);
      },
      (err) => {
        setIsGettingLocation(false);
        let errorMsg = 'Não foi possível obter o GPS.';
        if (err.code === 1) {
          errorMsg = 'Permissão de localização negada. Ative a permissão de GPS no seu navegador ou configurações do celular.';
        } else if (err.code === 2) {
          errorMsg = 'Sinal de GPS indisponível no momento. Tente novamente.';
        } else if (err.code === 3) {
          errorMsg = 'Tempo limite esgotado ao buscar GPS. Tente novamente.';
        }
        alert(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleGenerateMapsUrlFromAddress = () => {
    const fullQuery = [profile.address, profile.cityState].filter(Boolean).join(', ');
    if (!fullQuery.trim()) {
      alert('Digite o endereço primeiro.');
      return;
    }
    const generated = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullQuery)}`;
    updateProfile({
      lat: null,
      lng: null,
      mapsUrl: generated
    });
    showToast('Link do Google Maps gerado com sucesso!');
  };

  // Handlers de Serviços
  const handleOpenNewServiceModal = () => {
    setEditingService(null);
    setServiceForm({
      name: '', category: 'cabelo', duration: '30 min', price: '', description: '', badge: '',
      image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80'
    });
    setIsServiceModalOpen(true);
  };

  const handleOpenEditServiceModal = (svc) => {
    setEditingService(svc);
    setServiceForm({
      name: svc.name,
      category: svc.category,
      duration: svc.duration,
      price: svc.price.toString(),
      description: svc.description || '',
      badge: svc.badge || '',
      image: svc.image || '',
    });
    setIsServiceModalOpen(true);
  };

  const handleSaveServiceForm = (e) => {
    e.preventDefault();
    if (!serviceForm.name.trim() || !serviceForm.price) {
      alert('Preencha pelo menos o Nome e o Preço do serviço.');
      return;
    }

    if (editingService) {
      updateService(editingService.id, {
        name: serviceForm.name,
        category: serviceForm.category,
        duration: serviceForm.duration,
        price: parseFloat(serviceForm.price),
        description: serviceForm.description,
        badge: serviceForm.badge,
        image: serviceForm.image || editingService.image,
      });
      showToast('Serviço atualizado com sucesso!');
    } else {
      addService({
        name: serviceForm.name,
        category: serviceForm.category,
        duration: serviceForm.duration,
        price: parseFloat(serviceForm.price),
        description: serviceForm.description,
        badge: serviceForm.badge,
        image: serviceForm.image,
      });
      showToast('Novo corte/pacote cadastrado!');
    }
    setIsServiceModalOpen(false);
  };

  // Handlers da Equipe de Barbeiros
  const handleOpenNewBarberModal = () => {
    setEditingBarber(null);
    setBarberForm({
      name: '',
      role: 'Barbeiro Profissional',
      icon: '✂️',
      photo: '',
      phone: '',
      specialties: 'Degradê, Barba na Toalha Quente',
    });
    setIsBarberModalOpen(true);
  };

  const handleOpenEditBarberModal = (b) => {
    setEditingBarber(b);
    setBarberForm({
      name: b.name || '',
      role: b.role || '',
      icon: b.icon || '✂️',
      photo: b.photo || '',
      phone: b.phone || '',
      specialties: Array.isArray(b.specialties) ? b.specialties.join(', ') : (b.specialties || ''),
    });
    setIsBarberModalOpen(true);
  };

  const handleSaveBarberForm = (e) => {
    e.preventDefault();
    if (!barberForm.name.trim()) {
      alert('Por favor, informe o nome do barbeiro.');
      return;
    }
    const specs = barberForm.specialties
      ? barberForm.specialties.split(',').map(s => s.trim()).filter(Boolean)
      : ['Degradê', 'Corte Masculino'];

    if (editingBarber) {
      updateBarber(editingBarber.id, {
        name: barberForm.name.trim(),
        role: barberForm.role.trim() || 'Barbeiro Profissional',
        icon: barberForm.icon || '✂️',
        photo: barberForm.photo || '',
        phone: barberForm.phone.trim(),
        specialties: specs,
      });
      showToast(`Barbeiro ${barberForm.name} atualizado com sucesso!`);
    } else {
      addBarber({
        name: barberForm.name.trim(),
        role: barberForm.role.trim() || 'Barbeiro Profissional',
        icon: barberForm.icon || '✂️',
        photo: barberForm.photo || '',
        phone: barberForm.phone.trim(),
        specialties: specs,
      });
      showToast(`Novo barbeiro ${barberForm.name} adicionado à equipe!`);
    }
    setIsBarberModalOpen(false);
  };

  const handleDeleteBarber = (barberItem) => {
    if (barbers && barbers.length <= 1) {
      alert('A barbearia deve ter pelo menos 1 barbeiro cadastrado na equipe.');
      return;
    }
    if (confirm(`Tem certeza que deseja remover ${barberItem.name} da equipe?`)) {
      deleteBarber(barberItem.id);
      showToast(`Barbeiro ${barberItem.name} removido da equipe.`);
    }
  };

  const handleToggleBarberActive = (barberItem) => {
    toggleBarberActive(barberItem.id);
    showToast(`Barbeiro ${barberItem.name}: ${barberItem.active !== false ? 'Pausado (indisponível)' : 'Ativo para agendamentos'}!`);
  };

  // Handlers de Agendamento Manual
  const handleSaveAppointmentForm = (e) => {
    e.preventDefault();
    if (!appointmentForm.client.trim() || !appointmentForm.service) {
      alert('Preencha o nome do cliente e o serviço.');
      return;
    }
    const selectedSvc = services.find(s => s.name === appointmentForm.service);
    const finalPrice = appointmentForm.price ? parseFloat(appointmentForm.price) : (selectedSvc ? selectedSvc.price : 30);

    addAppointment({
      client: appointmentForm.client,
      phone: appointmentForm.phone || '(99) 99999-9999',
      service: appointmentForm.service,
      barber: appointmentForm.barber || barbers?.[0]?.name || 'Edivan',
      date: appointmentForm.date || todayStr,
      time: appointmentForm.time,
      price: finalPrice,
      payment: appointmentForm.payment,
      status: 'Confirmado',
    });

    showToast('Agendamento manual adicionado!');
    setIsAppointmentModalOpen(false);
    setAppointmentForm({ client: '', phone: '', service: '', barber: barbers?.[0]?.name || 'Edivan', date: todayStr, time: '14:00', price: '', payment: 'Pix' });
  };

  // Se a licença estiver bloqueada (por falta de pagamento ou bloqueio manual)
  if (licenseMetrics.isBlocked) {
    return (
      <div className="p-3">
        <SaaSBlockedScreen onOpenMaster={() => window.location.hash = '#master'} />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 space-y-4 animate-in fade-in duration-300">
      
      {/* Toast de Notificação */}
      {notificationMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl theme-gradient-accent text-dark-950 text-xs font-black theme-shadow-glow flex items-center gap-2 animate-in slide-in-from-top-3">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{notificationMessage}</span>
        </div>
      )}

      {/* Banner de Teste Grátis Ativo (Contagem Regressiva ao Vivo Segundo a Segundo) */}
      {(license.isTrial || licenseMetrics.isTrial) && !licenseMetrics.isBlocked && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-purple-950/30 to-dark-900 border border-purple-500/50 text-purple-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-purple-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
              <Gift className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-white font-extrabold text-xs">🎁 Período de Teste Grátis Ativo!</strong>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                  {license.trialDays || 7} Dias
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 mt-0.5">
                Tempo restante: <strong className="text-purple-300 font-mono font-bold text-xs">{licenseMetrics.countdownDetailed}</strong> (após o término: R$ 35,00/mês).
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSaaSPayModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-[11px] shrink-0 transition-all shadow-md shadow-purple-600/30 cursor-pointer flex items-center gap-1.5"
          >
            <span>Ver Detalhes do Teste</span>
          </button>
        </div>
      )}

      {/* Alerta de Vencimento da Assinatura Mensal */}
      {!license.isTrial && (licenseMetrics.isWarning || licenseMetrics.isGracePeriod) && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-dark-900 border border-amber-500/40 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Atenção:</strong> Sua assinatura vence em <strong className="font-mono text-white">{licenseMetrics.countdownDetailed}</strong>. Renove para manter o app online!
            </span>
          </div>
          <button
            onClick={() => setIsSaaSPayModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-950 font-extrabold text-[11px] shrink-0 transition-all shadow-gold-glow-sm cursor-pointer"
          >
            Pagar Mensalidade (R$ {licenseMetrics.currentPrice.toFixed(2).replace('.', ',')})
          </button>
        </div>
      )}

      {/* Comunicado / Mensagem do Desenvolvedor (Eullon) */}
      {license.systemNotice?.enabled && license.systemNotice?.text && (
        <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 shadow-lg ${
          license.systemNotice.type === 'warning'
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
            : license.systemNotice.type === 'promo'
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
            : 'bg-blue-500/15 border-blue-500/40 text-blue-200'
        }`}>
          <Megaphone className="w-4 h-4 shrink-0 mt-0.5 text-current" />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <strong className="text-xs font-extrabold text-white">
                Comunicado do Desenvolvedor:
              </strong>
              {license.systemNotice.updatedAt && (
                <span className="text-[10px] text-neutral-400">
                  {new Date(license.systemNotice.updatedAt).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
            <p className="text-[11px] leading-relaxed mt-0.5 text-neutral-200">
              {license.systemNotice.text}
            </p>
          </div>
        </div>
      )}

      {/* Top Header do Painel */}
      <div className="p-3.5 rounded-2xl bg-card-gradient border border-dark-750 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full p-0.5 theme-gradient-accent theme-shadow-glow-sm">
              <img
                src={profile.image}
                alt={profile.owner}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-extrabold text-white">
                  {profile.owner}
                </h1>
                <ShieldCheck className="w-4 h-4 theme-text-accent" />
              </div>
              <p className="text-[11px] text-neutral-400">{profile.name} • Gestão Total</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setIsSaaSPayModalOpen(true)}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${licenseMetrics.badgeColor}`}
              title="Ver e renovar mensalidade do aplicativo"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              <span>{licenseMetrics.label}</span>
            </button>

            <button
              onClick={async () => {
                showToast('Sincronizando com o Firebase...');
                const ok = await syncLocalToCloud();
                showToast(ok ? 'Fotos e dados sincronizados com a nuvem!' : 'Erro ao sincronizar.');
              }}
              disabled={isCloudSyncing}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Sincronizar fotos e dados com o Firebase para atualizar todos os aparelhos"
            >
              <span className={`w-2 h-2 rounded-full bg-emerald-400 ${isCloudSyncing ? 'animate-ping' : 'animate-pulse'}`} />
              <span>{isCloudSyncing ? 'Salvando...' : 'Firebase Nuvem'}</span>
            </button>

            <button
              onClick={handleCopyClientLink}
              className="px-2.5 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 theme-text-accent border border-dark-700 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Copiar link para enviar aos clientes"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copiado!' : 'Link Cliente'}</span>
            </button>

            <button
              onClick={() => {
                try {
                  sessionStorage.removeItem('elite_barber_auth');
                } catch (e) {}
                if (onLockDashboard) {
                  onLockDashboard();
                } else if (onBackToClientView) {
                  onBackToClientView();
                }
              }}
              className="px-2.5 py-1.5 rounded-lg bg-dark-800 hover:bg-rose-500/20 text-neutral-300 hover:text-rose-400 border border-dark-700 hover:border-rose-500/30 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Trancar painel e proteger com PIN 0192"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Trancar</span>
            </button>
          </div>
        </div>

        {/* Card em Destaque: Link Oficial para Enviar aos Clientes */}
        <div className="p-3 rounded-xl bg-dark-900 border border-dark-750 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg theme-gradient-accent flex items-center justify-center text-dark-950 font-black shrink-0 shadow-sm">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-black theme-text-accent block">
                Link Oficial para os Clientes Agendarem:
              </span>
              <span className="font-mono text-xs text-white truncate block select-all font-bold">
                {getCleanClientUrl()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyClientLink}
              className="px-3 py-1.5 rounded-lg theme-gradient-accent text-dark-950 font-black text-xs flex items-center gap-1.5 shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              title="Copiar o link oficial para enviar no WhatsApp ou Instagram dos clientes"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copiado com Sucesso!' : 'Copiar Link do Cliente'}</span>
            </button>
            <a
              href={getCleanClientUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-neutral-300 border border-dark-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
              title="Abrir como cliente em nova aba para testar"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver como Cliente</span>
            </a>
          </div>
        </div>

        {/* Status Atual & Controle Rápido de Pausas */}
        <div className="pt-2 border-t border-dark-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-400 font-medium">Status:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 ${
              scheduleConfig.vacationMode
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : scheduleConfig.status.includes('Pausa')
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {scheduleConfig.vacationMode ? 'Férias Ativada' : scheduleConfig.status}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px]">
            {scheduleConfig.status !== 'Disponível' || scheduleConfig.vacationMode ? (
              <button
                onClick={() => { resumeStatus(); showToast('Status: Disponível'); }}
                className="px-2 py-1 rounded-lg bg-emerald-500 text-dark-950 font-bold hover:bg-emerald-400 transition-all cursor-pointer"
              >
                Ficar Disponível
              </button>
            ) : (
              <>
                <button
                  onClick={() => { triggerQuickPause(scheduleConfig.breakDuration || 30); showToast(`Pausa de ${scheduleConfig.breakDuration || 30}m iniciada`); }}
                  className="px-2 py-1 rounded-lg bg-dark-800 hover:bg-dark-750 text-neutral-300 border border-dark-700 flex items-center gap-1 cursor-pointer"
                >
                  <Coffee className="w-3 h-3 text-amber-400" />
                  <span>Pausar {scheduleConfig.breakDuration || 30}m</span>
                </button>

                <button
                  onClick={() => { toggleVacationMode(); showToast(scheduleConfig.vacationMode ? 'Férias desativadas' : 'Modo Férias ativado!'); }}
                  className="px-2 py-1 rounded-lg bg-dark-800 hover:bg-dark-750 text-neutral-300 border border-dark-700 flex items-center gap-1 cursor-pointer"
                >
                  <Palmtree className="w-3 h-3 text-rose-400" />
                  <span>Férias</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navegação entre as 6 Abas do Painel */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1.5 rounded-2xl bg-dark-900 border border-dark-800 text-[10px] sm:text-[11px] font-bold">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeSubTab === 'dashboard' ? 'theme-gradient-accent text-dark-950 font-black shadow-md' : 'text-neutral-400 hover:text-white hover:bg-dark-800/60'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Métricas</span>
        </button>

        <button
          onClick={() => setActiveSubTab('agenda')}
          className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeSubTab === 'agenda' ? 'theme-gradient-accent text-dark-950 font-black shadow-md' : 'text-neutral-400 hover:text-white hover:bg-dark-800/60'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Agenda</span>
        </button>

        <button
          onClick={() => setActiveSubTab('servicos')}
          className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeSubTab === 'servicos' ? 'theme-gradient-accent text-dark-950 font-black shadow-md' : 'text-neutral-400 hover:text-white hover:bg-dark-800/60'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Cortes</span>
        </button>

        <button
          onClick={() => setActiveSubTab('temas')}
          className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeSubTab === 'temas' ? 'theme-gradient-accent text-dark-950 font-black shadow-md' : 'text-neutral-400 hover:text-white hover:bg-dark-800/60'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Cores & Fotos</span>
        </button>

        <button
          onClick={() => setActiveSubTab('horarios')}
          className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeSubTab === 'horarios' ? 'theme-gradient-accent text-dark-950 font-black shadow-md' : 'text-neutral-400 hover:text-white hover:bg-dark-800/60'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Horários</span>
        </button>

        <button
          onClick={() => setActiveSubTab('perfil')}
          className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeSubTab === 'perfil' ? 'theme-gradient-accent text-dark-950 font-black shadow-md' : 'text-neutral-400 hover:text-white hover:bg-dark-800/60'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Barbearia</span>
        </button>
      </div>

      {/* =========================================================================
          ABA 0: DASHBOARD FINANCEIRO & ANALYTICS
      ========================================================================= */}
      {activeSubTab === 'dashboard' && (
        <BarberAnalytics />
      )}

      {/* =========================================================================
          ABA 1: AGENDA DE ATENDIMENTOS DO DIA
      ========================================================================= */}
      {activeSubTab === 'agenda' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Métricas Rápidas de HOJE */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-dark-900 border border-dark-800">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Hoje</span>
              <span className="text-xl font-black text-white">{todayAppointments.length}</span>
              <span className="text-[10px] text-neutral-500 block">agendamentos</span>
            </div>

            <div className="p-3 rounded-xl bg-dark-900 border border-dark-800">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Concluídos</span>
              <span className="text-xl font-black text-emerald-400">{todayCompleted}</span>
              <span className="text-[10px] text-neutral-500 block">{todayAppointments.length > 0 ? `${todayCompleted} de ${todayAppointments.length} hoje` : 'atendidos hoje'}</span>
            </div>

            <div className="p-3 rounded-xl bg-dark-900 border border-dark-800">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Previsão Hoje</span>
              <span className="text-lg font-black theme-text-accent">R$ {todayBilling.toFixed(0)}</span>
              <span className="text-[10px] text-neutral-500 block">faturamento hoje</span>
            </div>
          </div>

          {/* Filtros de Período da Agenda */}
          <div className="flex items-center gap-1.5 p-1 bg-dark-900 border border-dark-800 rounded-xl overflow-x-auto">
            <button
              onClick={() => setAgendaFilter('hoje')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                agendaFilter === 'hoje'
                  ? 'theme-gradient-accent text-dark-950 shadow-sm font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Hoje</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${agendaFilter === 'hoje' ? 'bg-dark-950/20 text-dark-950 font-black' : 'bg-dark-800 text-neutral-400'}`}>
                {todayAppointments.length}
              </span>
            </button>
            <button
              onClick={() => setAgendaFilter('amanha')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                agendaFilter === 'amanha'
                  ? 'theme-gradient-accent text-dark-950 shadow-sm font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Amanhã
            </button>
            <button
              onClick={() => setAgendaFilter('semana')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                agendaFilter === 'semana'
                  ? 'theme-gradient-accent text-dark-950 shadow-sm font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setAgendaFilter('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                agendaFilter === 'todos'
                  ? 'theme-gradient-accent text-dark-950 shadow-sm font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Todos</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${agendaFilter === 'todos' ? 'bg-dark-950/20 text-dark-950 font-black' : 'bg-dark-800 text-neutral-400'}`}>
                {appointments.length}
              </span>
            </button>
          </div>

          {/* Cabeçalho da Lista & Botão Novo Agendamento */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-300">
              {agendaFilter === 'hoje' ? 'Clientes de Hoje' : agendaFilter === 'amanha' ? 'Clientes de Amanhã' : agendaFilter === 'semana' ? 'Clientes desta Semana' : 'Todos os Agendamentos'}
            </h3>
            <button
              onClick={() => setIsAppointmentModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg theme-gradient-accent text-dark-950 font-black text-xs flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Agendar Cliente</span>
            </button>
          </div>

          {/* Lista de Atendimentos */}
          <div className="space-y-2">
            {filteredAgendaAppointments.length === 0 ? (
              <div className="p-8 rounded-2xl bg-dark-900 border border-dark-800 text-center space-y-2">
                <Calendar className="w-8 h-8 mx-auto theme-text-accent opacity-60" />
                <p className="text-xs text-neutral-300 font-bold">
                  {agendaFilter === 'hoje'
                    ? 'Nenhum agendamento marcado para hoje.'
                    : agendaFilter === 'amanha'
                    ? 'Nenhum agendamento marcado para amanhã.'
                    : agendaFilter === 'semana'
                    ? 'Nenhum agendamento marcado para esta semana.'
                    : 'Nenhum agendamento registrado no histórico.'}
                </p>
                <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                  {agendaFilter === 'hoje'
                    ? 'Quando um cliente agendar pelo link ou você agendar no botão acima, ele aparecerá aqui na hora!'
                    : 'Use o botão "Agendar Cliente" acima para registrar um horário ou aguarde os clientes agendarem.'}
                </p>
              </div>
            ) : (
              filteredAgendaAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-3 rounded-2xl bg-card-gradient border border-dark-750 flex flex-col gap-2.5 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-12 h-12 rounded-xl bg-dark-800 border border-dark-700 flex flex-col items-center justify-center theme-text-accent shrink-0 text-center px-1">
                        <span className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-tighter">
                          {apt.date === todayStr ? 'Hoje' : apt.date === tomorrowStr ? 'Amanhã' : apt.date ? apt.date.split('-').reverse().slice(0, 2).join('/') : 'Hoje'}
                        </span>
                        <span className="text-xs font-black">{apt.time}</span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{apt.client}</span>
                        </h4>
                        <p className="text-[11px] theme-text-accent font-medium">{apt.service}</p>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5 text-[10px] text-neutral-400">
                          <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> {apt.phone}</span>
                          <span>•</span>
                          <span>{apt.payment}</span>
                          {apt.barber && (
                            <>
                              <span>•</span>
                              <span className="font-bold theme-text-accent bg-dark-800 px-1.5 py-0.5 rounded border border-dark-700">
                                ✂️ {apt.barber}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-white block">
                        R$ {parseFloat(apt.price).toFixed(2).replace('.', ',')}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm(`Remover agendamento de ${apt.client}?`)) {
                            deleteAppointment(apt.id);
                            showToast('Agendamento removido.');
                          }
                        }}
                        className="text-neutral-500 hover:text-rose-400 p-1 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-dark-800 flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                      apt.status === 'Concluído'
                        ? 'bg-neutral-800 text-neutral-400'
                        : apt.status === 'Em Atendimento'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {apt.status}
                    </span>

                    <div className="flex items-center gap-1.5 text-[11px]">
                      {apt.status !== 'Concluído' && (
                        <button
                          onClick={() => {
                            updateAppointmentStatus(apt.id, 'Concluído');
                            showToast(`Corte de ${apt.client} concluído!`);
                          }}
                          className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Concluir</span>
                        </button>
                      )}
                      {apt.status === 'Confirmado' && (
                        <button
                          onClick={() => {
                            updateAppointmentStatus(apt.id, 'Em Atendimento');
                            showToast(`Atendimento iniciado.`);
                          }}
                          className="px-2 py-1 rounded-lg theme-gradient-accent text-dark-950 font-bold transition-all cursor-pointer"
                        >
                          Iniciar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          ABA 2: GESTÃO DE CORTES, PACOTES E PREÇOS
      ========================================================================= */}
      {activeSubTab === 'servicos' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-300">
                Catálogo de Serviços ({services.length})
              </h3>
              <p className="text-[10px] text-neutral-400">Adicione novos cortes ou pacotes com foto</p>
            </div>

            <button
              onClick={handleOpenNewServiceModal}
              className="px-3 py-1.5 rounded-lg theme-gradient-accent text-dark-950 font-black text-xs flex items-center gap-1.5 theme-shadow-glow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Novo Corte</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="p-3 rounded-2xl bg-card-gradient border border-dark-750 hover:border-neutral-600 transition-all flex flex-col gap-2 relative overflow-hidden"
              >
                {svc.badge && (
                  <span className="absolute top-0 right-0 px-2.5 py-0.5 theme-gradient-accent text-dark-950 text-[9px] font-black uppercase tracking-wider rounded-bl-lg">
                    {svc.badge}
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <img
                    src={svc.image}
                    alt={svc.name}
                    className="w-14 h-14 rounded-xl object-cover border border-dark-700 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                      {svc.name}
                    </h4>
                    <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                      {svc.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-400">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3 theme-text-accent" />
                        {svc.duration}
                      </span>
                      <span>•</span>
                      <span className="uppercase theme-text-accent font-semibold">{svc.category}</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-extrabold theme-text-accent block">
                      R$ {parseFloat(svc.price).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-dark-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditServiceModal(svc)}
                    className="px-2.5 py-1 rounded-lg bg-dark-800 hover:bg-dark-700 text-neutral-200 text-xs font-semibold flex items-center gap-1 border border-dark-700 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3 theme-text-accent" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Tem certeza que deseja excluir o serviço "${svc.name}"?`)) {
                        deleteService(svc.id);
                        showToast(`Serviço "${svc.name}" excluído.`);
                      }
                    }}
                    className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          ABA 3: APARÊNCIA, CORES & FOTOS (NOVO: WHITELABEL COMPLETO)
      ========================================================================= */}
      {activeSubTab === 'temas' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Seletor de Paleta de Cores */}
          <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-4 h-4 theme-text-accent" />
                <span>Paleta de Cores do Aplicativo</span>
              </h4>
              <span className="text-[10px] text-neutral-400">Muda todo o design</span>
            </div>

            <p className="text-[11px] text-neutral-400">
              Escolha a identidade da barbearia. Botões, destaques e textos mudarão imediatamente.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(THEME_PRESETS).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => {
                    selectThemePreset(key);
                    showToast(`Tema alterado para ${p.name}!`);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                    theme.preset === key
                      ? 'border-white bg-dark-800 shadow-md ring-1 ring-white'
                      : 'border-dark-750 bg-dark-850 hover:border-neutral-600'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full shadow-sm flex-shrink-0 border border-white/20"
                    style={{ backgroundColor: p.primary }}
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">{p.name}</span>
                    <span className="text-[9px] text-neutral-400 block">{p.primary}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Cor Personalizada (Color Picker) */}
            <div className="pt-2 border-t border-dark-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customColorInput}
                  onChange={(e) => setCustomColorInput(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                />
                <div>
                  <span className="text-xs font-bold text-white block">Cor Sob Medida</span>
                  <span className="text-[10px] text-neutral-400">{customColorInput}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setCustomColor(customColorInput);
                  showToast('Cor personalizada aplicada!');
                }}
                className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-white text-xs font-bold border border-dark-700 cursor-pointer"
              >
                Aplicar Cor
              </button>
            </div>
          </div>

          {/* Foto de Capa (Hero Banner) */}
          <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800 space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 theme-text-accent" />
              <span>Foto de Capa do Aplicativo (Banner)</span>
            </h4>
            <p className="text-[10px] text-neutral-400">
              Esta é a foto principal exibida no topo do app do cliente.
            </p>

            <div className="relative h-32 rounded-xl overflow-hidden border border-dark-700">
              <img
                src={profile.coverImage || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80"}
                alt="Capa"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <input
                  ref={coverFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingCoverImage}
                  onClick={() => coverFileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl theme-gradient-accent text-dark-950 font-black text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  {isUploadingCoverImage ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Enviando foto...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5" />
                      <span>Trocar Foto de Capa (Cloudinary)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Logotipo da Barbearia */}
          <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800 space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Scissors className="w-4 h-4 theme-text-accent" />
              <span>Logotipo da Barbearia</span>
            </h4>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-dark-850 border border-dark-700 flex items-center justify-center overflow-hidden p-1">
                {profile.logoImage ? (
                  <img src={profile.logoImage} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Scissors className="w-6 h-6 theme-text-accent" />
                )}
              </div>

              <div className="flex-1">
                <input
                  ref={logoFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingLogoImage}
                  onClick={() => logoFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-white text-xs font-bold border border-dark-700 flex items-center gap-1.5 cursor-pointer"
                >
                  {isUploadingLogoImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  <span>{profile.logoImage ? 'Trocar Logotipo' : 'Enviar Logo (PNG)'}</span>
                </button>
                {profile.logoImage && (
                  <button
                    onClick={() => { updateProfile({ logoImage: '' }); showToast('Logo removido'); }}
                    className="text-[10px] text-rose-400 hover:underline block mt-1"
                  >
                    Remover logo e usar ícone padrão
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Galeria de Fotos do Espaço (Salão / Fachada) */}
          <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 theme-text-accent" />
                <span>Fotos do Espaço & Fachada ({galleryImages.length})</span>
              </h4>
              
              <input
                ref={galleryFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleGalleryFileUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploadingGalleryImage}
                onClick={() => galleryFileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg theme-gradient-accent text-dark-950 font-black text-xs flex items-center gap-1 shadow-sm cursor-pointer"
              >
                {isUploadingGalleryImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3 stroke-[3]" />}
                <span>+ Adicionar Foto</span>
              </button>
            </div>

            <p className="text-[10px] text-neutral-400">
              Essas fotos aparecem para o cliente na seção "Conheça Nosso Espaço".
            </p>

            <div className="grid grid-cols-3 gap-2">
              {galleryImages.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-dark-750 group">
                  <img src={img} alt={`Espaço ${idx}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => {
                      removeGalleryImage(idx);
                      showToast('Foto removida da galeria.');
                    }}
                    className="absolute top-1 right-1 p-1 rounded-md bg-black/80 text-rose-400 hover:text-rose-300 hover:bg-black transition-colors"
                    title="Excluir foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          ABA 4: GESTÃO DE HORÁRIOS, INTERVALOS E FÉRIAS
      ========================================================================= */}
      {activeSubTab === 'horarios' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Card de Férias */}
          <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palmtree className="w-5 h-5 text-rose-400" />
                <div>
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Modo Férias / Folga Coletiva
                  </h4>
                  <p className="text-[10px] text-neutral-400">
                    Trava novos agendamentos e avisa os clientes
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  toggleVacationMode();
                  showToast(scheduleConfig.vacationMode ? 'Férias desativadas' : 'Modo Férias ativado!');
                }}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  scheduleConfig.vacationMode ? 'bg-rose-500' : 'bg-dark-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  scheduleConfig.vacationMode ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {scheduleConfig.vacationMode && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
                <p className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Barbearia pausada no momento para os clientes.
                </p>
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    Mensagem exibida para os clientes:
                  </label>
                  <input
                    type="text"
                    value={scheduleConfig.vacationMessage}
                    onChange={(e) => updateSchedule({ vacationMessage: e.target.value })}
                    className="w-full p-2 rounded-lg bg-dark-950 border border-dark-700 text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Configuração de Intervalos e Pausas */}
          <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800 space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-amber-400" />
              <span>Intervalo de Atendimento & Pausas Rápidas</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  Tempo por Corte (Slots):
                </label>
                <select
                  value={scheduleConfig.slotInterval || 30}
                  onChange={(e) => {
                    updateSchedule({ slotInterval: parseInt(e.target.value) });
                    showToast('Intervalo de slots atualizado!');
                  }}
                  className="w-full p-2 rounded-xl bg-dark-850 border border-dark-700 text-white text-xs font-semibold"
                >
                  <option value={20}>20 em 20 minutos</option>
                  <option value={30}>30 em 30 minutos (Padrão)</option>
                  <option value={45}>45 em 45 minutos</option>
                  <option value={60}>60 minutos (1 hora)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  Duração da Pausa Rápida:
                </label>
                <select
                  value={scheduleConfig.breakDuration || 30}
                  onChange={(e) => {
                    updateSchedule({ breakDuration: parseInt(e.target.value) });
                    showToast('Tempo de pausa atualizado!');
                  }}
                  className="w-full p-2 rounded-xl bg-dark-850 border border-dark-700 text-white text-xs font-semibold"
                >
                  <option value={15}>15 minutos (Café rápido)</option>
                  <option value={30}>30 minutos (Lanche)</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos (Almoço)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-dark-800 flex items-center justify-between">
              <span className="text-xs text-neutral-300">
                Precisa sair para um café ou imprevisto agora?
              </span>
              <button
                onClick={() => {
                  triggerQuickPause(scheduleConfig.breakDuration || 30);
                  showToast(`Pausa de ${scheduleConfig.breakDuration || 30}m ativada!`);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-dark-950 text-xs font-bold transition-all cursor-pointer"
              >
                Pausar Agora
              </button>
            </div>
          </div>

          {/* Horários Gerais de Atendimento */}
          <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800 space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 theme-text-accent" />
              <span>Horários de Funcionamento</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-dark-850 border border-dark-750 space-y-2">
                <span className="font-bold text-white block">Segunda a Sexta-feira</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-neutral-400 block mb-0.5">Início:</span>
                    <input
                      type="time"
                      value={scheduleConfig.weekdaysStart}
                      onChange={(e) => updateSchedule({ weekdaysStart: e.target.value })}
                      className="w-full p-1.5 rounded-lg bg-dark-950 border border-dark-700 text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block mb-0.5">Fechamento:</span>
                    <input
                      type="time"
                      value={scheduleConfig.weekdaysEnd}
                      onChange={(e) => updateSchedule({ weekdaysEnd: e.target.value })}
                      className="w-full p-1.5 rounded-lg bg-dark-950 border border-dark-700 text-white text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-dark-850 border border-dark-750 space-y-2">
                <span className="font-bold text-white block">Sábado</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-neutral-400 block mb-0.5">Início:</span>
                    <input
                      type="time"
                      value={scheduleConfig.saturdayStart}
                      onChange={(e) => updateSchedule({ saturdayStart: e.target.value })}
                      className="w-full p-1.5 rounded-lg bg-dark-950 border border-dark-700 text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block mb-0.5">Fechamento:</span>
                    <input
                      type="time"
                      value={scheduleConfig.saturdayEnd}
                      onChange={(e) => updateSchedule({ saturdayEnd: e.target.value })}
                      className="w-full p-1.5 rounded-lg bg-dark-950 border border-dark-700 text-white text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-dark-850 border border-dark-750 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Domingo</span>
                  <span className="text-[10px] text-neutral-400">Barbearia Fechada</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                  Fechado
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ABA 5: BARBEARIA, ESPECIALIDADES, COMODIDADES & WHITELABEL
      ========================================================================= */}
      {activeSubTab === 'perfil' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Dados Gerais da Barbearia (Whitelabel) */}
          <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800 space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 theme-text-accent" />
              <span>Identidade da Barbearia</span>
            </h4>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  Nome do Estabelecimento:
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => updateProfile({ name: e.target.value })}
                  placeholder="Ex: Barbearia Elite"
                  className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-white font-extrabold text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  Slogan / Frase de Efeito:
                </label>
                <input
                  type="text"
                  value={profile.tagline}
                  onChange={(e) => updateProfile({ tagline: e.target.value })}
                  placeholder="Ex: Estilo, tradição e precisão"
                  className="w-full p-2 rounded-xl bg-dark-850 border border-dark-700 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Dados do Barbeiro com Upload Cloudinary */}
          <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800 space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 theme-text-accent" />
              <span>Dados do Barbeiro Responsável</span>
            </h4>

            {/* Foto de Perfil com Botão de Câmera */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-dark-850 border border-dark-750">
              <div className="relative">
                <img
                  src={profile.image}
                  alt={profile.owner}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gold-500 shadow-md"
                />
                <button
                  type="button"
                  disabled={isUploadingProfileImage}
                  onClick={() => profileFileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full theme-gradient-accent text-dark-950 shadow-md cursor-pointer"
                  title="Trocar foto pelo Cloudinary"
                >
                  {isUploadingProfileImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5 stroke-[2.5]" />}
                </button>
              </div>

              <div className="flex-1">
                <p className="text-xs font-bold text-white">Foto do Barbeiro</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  Foto exibida nos cartões e agendamentos.
                </p>
                <input
                  ref={profileFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingProfileImage}
                  onClick={() => profileFileInputRef.current?.click()}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-white border border-dark-700 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {isUploadingProfileImage ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Enviando para nuvem...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3 h-3" />
                      <span>Carregar da Galeria/Câmera</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  Nome do Profissional:
                </label>
                <input
                  type="text"
                  value={profile.owner}
                  onChange={(e) => updateProfile({ owner: e.target.value })}
                  className="w-full p-2 rounded-xl bg-dark-850 border border-dark-700 text-white font-bold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    WhatsApp (Recebe os agendamentos):
                  </label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => updateProfile({ 
                      phone: e.target.value,
                      whatsappNumber: getCleanWhatsAppNumber(e.target.value)
                    })}
                    className="w-full p-2 rounded-xl bg-dark-850 border border-dark-700 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    Instagram:
                  </label>
                  <input
                    type="text"
                    value={profile.instagram}
                    onChange={(e) => updateProfile({ instagram: e.target.value })}
                    className="w-full p-2 rounded-xl bg-dark-850 border border-dark-700 text-white text-xs"
                  />
                </div>
              </div>

              {/* Seção de Localização & Google Maps */}
              <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750 space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg theme-bg-accent-subtle theme-text-accent">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Localização & Google Maps</h4>
                      <p className="text-[10px] text-neutral-400">Onde os clientes encontrarão a barbearia</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                      Endereço (Rua e Número):
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Rua Principal, 120"
                      value={profile.address || ''}
                      onChange={(e) => updateProfile({ address: e.target.value })}
                      className="w-full p-2 rounded-xl bg-dark-850 border border-dark-700 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                      Bairro, Cidade / Referência:
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Povoado Cigana, Tuntum - MA"
                      value={profile.cityState || ''}
                      onChange={(e) => updateProfile({ cityState: e.target.value })}
                      className="w-full p-2 rounded-xl bg-dark-850 border border-dark-700 text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    Link do Google Maps (Rota):
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="https://maps.app.goo.gl/... ou gerado automaticamente"
                      value={profile.mapsUrl || ''}
                      onChange={(e) => updateProfile({ mapsUrl: e.target.value })}
                      className="flex-1 p-2 rounded-xl bg-dark-850 border border-dark-700 text-white text-xs font-mono text-[11px]"
                    />
                    {profile.mapsUrl && (
                      <a
                        href={profile.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-2 rounded-xl bg-dark-800 hover:bg-dark-750 text-neutral-300 hover:text-white border border-dark-700 flex items-center gap-1 text-xs"
                        title="Testar rota no Google Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Testar</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Botões de Ação Rápida de Localização */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleGetDeviceLocation}
                    disabled={isGettingLocation}
                    className="py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGettingLocation ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Capturando GPS...</span>
                      </>
                    ) : (
                      <>
                        <LocateFixed className="w-3.5 h-3.5" />
                        <span>Usar GPS Atual do Celular</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateMapsUrlFromAddress}
                    className="py-2 px-3 rounded-xl bg-dark-800 hover:bg-dark-750 theme-text-accent border border-dark-700 flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Gerar Link pelo Endereço</span>
                  </button>
                </div>

                {/* Pré-visualização do Mapa ao Vivo */}
                <div className="pt-2 border-t border-dark-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">
                      Pré-visualização do Mapa no App:
                    </span>
                    {profile.lat && profile.lng && (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>GPS Ativo ({Number(profile.lat).toFixed(3)}, {Number(profile.lng).toFixed(3)})</span>
                      </span>
                    )}
                  </div>
                  <div className="w-full h-36 rounded-xl overflow-hidden border border-dark-700/70 relative bg-dark-950">
                    <iframe
                      key={getMapEmbedUrl(profile)}
                      title="Pré-visualização do mapa da barbearia"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight="0"
                      marginWidth="0"
                      src={getMapEmbedUrl(profile)}
                      className="w-full h-full filter contrast-125 opacity-85"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>

              {/* Seção de Configuração do Pix (QR Code & Copia e Cola) */}
              <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750 space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg theme-bg-accent-subtle theme-text-accent">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Chave Pix para Pagamentos</h4>
                      <p className="text-[10px] text-neutral-400">Exibida com QR Code para os clientes no agendamento</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                      Tipo de Chave:
                    </label>
                    <select
                      value={profile.pixKeyType || 'Celular'}
                      onChange={(e) => updateProfile({ pixKeyType: e.target.value })}
                      className="w-full p-2 rounded-xl bg-dark-850 border border-dark-700 text-white text-xs"
                    >
                      <option value="Celular">Celular</option>
                      <option value="CPF">CPF</option>
                      <option value="CNPJ">CNPJ</option>
                      <option value="E-mail">E-mail</option>
                      <option value="Chave Aleatória">Chave Aleatória</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                      Chave Pix:
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 99991220211"
                      value={profile.pixKey || ''}
                      onChange={(e) => updateProfile({ pixKey: e.target.value })}
                      className="w-full p-2 rounded-xl bg-dark-850 border border-dark-700 text-white text-xs font-mono font-bold text-gold-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                      Nome do Favorecido:
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Edivan"
                      value={profile.pixReceiver || ''}
                      onChange={(e) => updateProfile({ pixReceiver: e.target.value })}
                      className="w-full p-2 rounded-xl bg-dark-850 border border-dark-700 text-white text-xs"
                    />
                  </div>
                </div>

                {profile.pixKey && (
                  <div className="pt-2 border-t border-dark-800 flex items-center gap-3">
                    <div className="bg-white p-1 rounded-lg shrink-0">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(profile.pixKey)}`}
                        alt="QR Code Preview"
                        className="w-10 h-10 object-contain rounded"
                      />
                    </div>
                    <div className="text-[11px] text-neutral-300">
                      <span className="font-bold text-emerald-400 block">QR Code Ativo e Funcionando</span>
                      <span className="text-neutral-400 text-[10px]">O cliente pode escanear com a câmera ou copiar a chave Pix com 1 toque.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Seção de Segurança & PIN de Acesso ao Painel */}
              <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750 space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gold-500/20 text-gold-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">PIN de Segurança do Painel</h4>
                      <p className="text-[10px] text-neutral-400">Protege o acesso exclusivo dos barbeiros às finanças e clientes</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-gold-500/15 border border-gold-500/30 text-gold-400 text-[10px] font-mono font-bold">
                    PIN: {profile.barberPin || '0192'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                      Código PIN de 4 Dígitos:
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="0192"
                      value={profile.barberPin || '0192'}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        updateProfile({ barberPin: val || '0192' });
                      }}
                      className="w-full p-2 rounded-xl bg-dark-850 border border-dark-700 text-gold-400 font-mono font-extrabold text-sm tracking-widest text-center"
                    />
                  </div>
                  <div className="flex items-center">
                    <p className="text-[10px] text-neutral-400 leading-tight">
                      🛡️ Este PIN é solicitado sempre que alguém tenta acessar o link do barbeiro (<code className="text-gold-400">#barbeiro</code>). Padrão configurado: <strong className="text-white">0192</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  Biografia de Apresentação:
                </label>
                <textarea
                  rows={2}
                  value={profile.bio}
                  onChange={(e) => updateProfile({ bio: e.target.value })}
                  className="w-full p-2 rounded-xl bg-dark-850 border border-dark-700 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Equipe de Barbeiros da Barbearia (Adicionar e Gerenciar Profissionais) */}
          <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800 space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Scissors className="w-4 h-4 theme-text-accent" />
                  <span>Equipe de Barbeiros ({barbers?.length || 0})</span>
                </h4>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  Adicione e gerencie os barbeiros da barbearia que aparecem para os clientes no agendamento
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenNewBarberModal}
                className="py-1.5 px-3 rounded-xl theme-gradient-accent text-dark-950 font-black text-xs flex items-center gap-1.5 shadow-sm hover:opacity-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Adicionar Barbeiro</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {barbers && barbers.map((b) => (
                <div
                  key={b.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                    b.active !== false
                      ? 'bg-dark-850 border-dark-750 hover:border-neutral-600'
                      : 'bg-dark-950/80 border-dark-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center text-lg shrink-0 shadow-inner">
                        {b.icon || '✂️'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h5 className="text-xs font-bold text-white truncate">{b.name}</h5>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
                            b.active !== false
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}>
                            {b.active !== false ? 'Ativo' : 'Pausa'}
                          </span>
                        </div>
                        <p className="text-[10px] theme-text-accent font-semibold truncate">{b.role || 'Barbeiro Profissional'}</p>
                        {b.phone && (
                          <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5" /> {b.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditBarberModal(b)}
                        className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-neutral-300 hover:theme-text-accent transition-colors cursor-pointer"
                        title="Editar barbeiro"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBarber(b)}
                        className="p-1.5 rounded-lg bg-dark-800 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remover barbeiro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {b.specialties && b.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1.5 border-t border-dark-800">
                      {b.specialties.slice(0, 4).map((spec, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-dark-800 text-neutral-300 border border-dark-750">
                          {spec}
                        </span>
                      ))}
                      {b.specialties.length > 4 && (
                        <span className="text-[9px] text-neutral-500">+{b.specialties.length - 4}</span>
                      )}
                    </div>
                  )}

                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className="text-neutral-400">Disponibilidade:</span>
                    <button
                      type="button"
                      onClick={() => handleToggleBarberActive(b)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                        b.active !== false
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                          : 'bg-dark-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {b.active !== false ? '✓ Ativo no Agendamento' : '✗ Indisponível'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Especialidades do Barbeiro */}
          <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800 space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 theme-text-accent" />
              <span>Especialidades ({profile.specialties.length})</span>
            </h4>

            <div className="flex flex-wrap gap-1.5">
              {profile.specialties.map((esp, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-lg bg-dark-800 border border-dark-700 text-neutral-200 flex items-center gap-1.5"
                >
                  <span>{esp}</span>
                  <button
                    onClick={() => {
                      removeSpecialty(idx);
                      showToast(`Especialidade removida.`);
                    }}
                    className="text-neutral-500 hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-2 border-t border-dark-800">
              <input
                type="text"
                placeholder="Ex: Barboterapia, Nevou, Freestyle..."
                value={newSpecialtyText}
                onChange={(e) => setNewSpecialtyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newSpecialtyText.trim()) {
                      addSpecialty(newSpecialtyText);
                      setNewSpecialtyText('');
                      showToast('Especialidade adicionada!');
                    }
                  }
                }}
                className="flex-1 p-2 rounded-xl bg-dark-850 border border-dark-700 text-xs text-white"
              />
              <button
                onClick={() => {
                  if (newSpecialtyText.trim()) {
                    addSpecialty(newSpecialtyText);
                    setNewSpecialtyText('');
                    showToast('Especialidade adicionada!');
                  }
                }}
                className="px-3 py-2 rounded-xl theme-gradient-accent text-dark-950 font-bold text-xs cursor-pointer"
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Comodidades com Switches */}
          <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 theme-text-accent" />
                <span>Comodidades da Barbearia</span>
              </h4>
              <span className="text-[10px] text-neutral-400">Ligue ou desligue</span>
            </div>

            <div className="space-y-2">
              {amenities.map((am) => (
                <div
                  key={am.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    am.enabled
                      ? 'bg-dark-850 border-neutral-700 text-white'
                      : 'bg-dark-950 border-dark-800 text-neutral-500 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{am.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        toggleAmenity(am.id);
                        showToast(`Comodidade ${am.enabled ? 'desativada' : 'ativada'}!`);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        am.enabled
                          ? 'bg-emerald-500 text-dark-950 shadow-sm'
                          : 'bg-dark-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {am.enabled ? 'Ativo' : 'Desativado'}
                    </button>

                    <button
                      onClick={() => {
                        deleteAmenity(am.id);
                        showToast('Comodidade excluída.');
                      }}
                      className="p-1 text-neutral-600 hover:text-rose-400 transition-colors"
                      title="Excluir comodidade"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2 border-t border-dark-800">
              <input
                type="text"
                placeholder="Nova comodidade (ex: Sinuca, Cerveja gelada...)"
                value={newAmenityText}
                onChange={(e) => setNewAmenityText(e.target.value)}
                className="flex-1 p-2 rounded-xl bg-dark-850 border border-dark-700 text-xs text-white"
              />
              <button
                onClick={() => {
                  if (newAmenityText.trim()) {
                    addAmenity(newAmenityText.trim());
                    setNewAmenityText('');
                    showToast('Nova comodidade criada!');
                  }
                }}
                className="px-3 py-2 rounded-xl theme-gradient-accent text-dark-950 font-bold text-xs cursor-pointer"
              >
                Cadastrar
              </button>
            </div>
          </div>

          {/* Backup, Whitelabel & Reset */}
          <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800 space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Settings className="w-4 h-4 theme-text-accent" />
              <span>Exportar / Importar Barbearia (Backup)</span>
            </h4>
            <p className="text-[10px] text-neutral-400">
              Você pode exportar esta barbearia como arquivo e importar para trocar de cliente em 1 segundo!
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={exportConfiguration}
                className="p-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-dark-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 theme-text-accent" />
                <span>Exportar (.JSON)</span>
              </button>

              <input
                ref={jsonFileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJsonFile}
                className="hidden"
              />
              <button
                onClick={() => jsonFileInputRef.current?.click()}
                className="p-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-dark-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 theme-text-accent" />
                <span>Importar (.JSON)</span>
              </button>
            </div>

            <div className="pt-2 border-t border-dark-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-neutral-400">Restaurar Barbearia Elite original:</span>
              <button
                onClick={() => {
                  if (confirm('Deseja restaurar todos os serviços, cores e dados originais?')) {
                    resetToFactoryDefaults();
                    showToast('Dados originais restaurados!');
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-dark-800 hover:bg-dark-750 text-neutral-400 hover:text-white border border-dark-700 flex items-center gap-1 text-[11px]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Resetar</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Atalho para Abrir Visão do Cliente */}
      {onBackToClientView && (
        <div className="pt-2 pb-6 text-center">
          <button
            onClick={onBackToClientView}
            className="text-xs text-neutral-400 hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 theme-text-accent" />
            <span>Abrir e testar o aplicativo como cliente</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADICIONAR / EDITAR SERVIÇO COM CLOUDINARY
      ========================================================================= */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-dark-900 border border-dark-700 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-dark-800">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <Scissors className="w-4 h-4 theme-text-accent" />
                <span>{editingService ? 'Editar Serviço' : 'Novo Corte ou Pacote'}</span>
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="p-1.5 rounded-full bg-dark-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveServiceForm} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-300 mb-1">
                  Nome do Serviço / Pacote:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Corte Degradê Navalhado"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-300 mb-1">
                    Preço (R$):
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    placeholder="Ex: 35.00"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 theme-text-accent font-extrabold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-300 mb-1">
                    Duração Estimada:
                  </label>
                  <select
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-white font-semibold"
                  >
                    <option value="15 min">15 min</option>
                    <option value="20 min">20 min</option>
                    <option value="25 min">25 min</option>
                    <option value="30 min">30 min</option>
                    <option value="40 min">40 min</option>
                    <option value="50 min">50 min</option>
                    <option value="60 min">60 min (1h)</option>
                    <option value="90 min">90 min (1h30)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-300 mb-1">
                    Categoria:
                  </label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-white"
                  >
                    <option value="cabelo">Cortes de Cabelo</option>
                    <option value="barba">Barba / Terapia</option>
                    <option value="combo">Combos / Pacotes</option>
                    <option value="acabamento">Sobrancelha / Acabamento</option>
                    <option value="quimica">Platinado / Química</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-300 mb-1">
                    Selo / Destaque (opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Mais Pedido, VIP..."
                    value={serviceForm.badge}
                    onChange={(e) => setServiceForm({ ...serviceForm, badge: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-300 mb-1">
                  Descrição dos Benefícios:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Inclui lavagem, navalha e finalização com pomada modeladora."
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-white"
                />
              </div>

              {/* Upload de Foto via Cloudinary com Câmera */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-300 mb-1.5">
                  Foto do Corte / Pacote:
                </label>

                <div className="p-3 rounded-2xl bg-dark-850 border border-dark-750 space-y-2.5">
                  <div className="flex items-center gap-3">
                    {serviceForm.image ? (
                      <img
                        src={serviceForm.image}
                        alt="Preview"
                        className="w-16 h-16 rounded-xl object-cover border border-neutral-600 shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-dark-900 border border-dark-700 flex items-center justify-center text-neutral-500">
                        <Scissors className="w-6 h-6" />
                      </div>
                    )}

                    <div className="flex-1">
                      <input
                        ref={serviceFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleServiceFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isUploadingServiceImage}
                        onClick={() => serviceFileInputRef.current?.click()}
                        className="w-full py-2 px-3 rounded-xl theme-gradient-accent text-dark-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        {isUploadingServiceImage ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Enviando para Cloudinary...</span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-3.5 h-3.5" />
                            <span>Escolher da Galeria / Câmera</span>
                          </>
                        )}
                      </button>
                      <span className="text-[10px] text-neutral-400 block mt-1 text-center">
                        Upload automático na nuvem Cloudinary
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-dark-800">
                    <span className="text-[9px] uppercase font-bold text-neutral-500 block mb-0.5">
                      Ou cole o link direto da imagem:
                    </span>
                    <input
                      type="url"
                      placeholder="https://res.cloudinary.com/..."
                      value={serviceForm.image}
                      onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
                      className="w-full p-2 rounded-lg bg-dark-950 border border-dark-700 text-neutral-300 text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-dark-800 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-dark-800 text-neutral-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl theme-gradient-accent text-dark-950 font-black shadow-sm"
                >
                  {editingService ? 'Salvar Alterações' : 'Cadastrar Serviço'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: NOVO AGENDAMENTO MANUAL
      ========================================================================= */}
      {isAppointmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-dark-900 border border-dark-700 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-dark-800">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 theme-text-accent" />
                <span>Agendar Cliente no Balcão</span>
              </h3>
              <button
                onClick={() => setIsAppointmentModalOpen(false)}
                className="p-1.5 rounded-full bg-dark-800 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAppointmentForm} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-300 mb-1">
                  Nome do Cliente:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo"
                  value={appointmentForm.client}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, client: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-300 mb-1">
                  WhatsApp:
                </label>
                <input
                  type="text"
                  placeholder="(99) 99999-9999"
                  value={appointmentForm.phone}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-300 mb-1">
                    Data:
                  </label>
                  <input
                    type="date"
                    required
                    value={appointmentForm.date || todayStr}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-300 mb-1">
                    Horário:
                  </label>
                  <input
                    type="time"
                    required
                    value={appointmentForm.time}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 theme-text-accent font-extrabold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-300 mb-1">
                  Serviço Desejado:
                </label>
                <select
                  required
                  value={appointmentForm.service}
                  onChange={(e) => {
                    const svc = services.find(s => s.name === e.target.value);
                    setAppointmentForm({
                      ...appointmentForm,
                      service: e.target.value,
                      price: svc ? svc.price : ''
                    });
                  }}
                  className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-white font-semibold"
                >
                  <option value="">Selecione um corte...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} — R$ {parseFloat(s.price).toFixed(2).replace('.', ',')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-300 mb-1">
                  Barbeiro Responsável:
                </label>
                <select
                  value={appointmentForm.barber || barbers?.[0]?.name || 'Edivan'}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, barber: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-white font-semibold"
                >
                  {barbers && barbers.map(b => (
                    <option key={b.id} value={b.name}>
                      {b.icon || '✂️'} {b.name} ({b.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-300 mb-1">
                    Valor (R$):
                  </label>
                  <input
                    type="number"
                    value={appointmentForm.price}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, price: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 theme-text-accent font-extrabold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-300 mb-1">
                    Pagamento:
                  </label>
                  <select
                    value={appointmentForm.payment}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, payment: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-white"
                  >
                    <option value="Pix">Pix</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-dark-800 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAppointmentModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-dark-800 text-neutral-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl theme-gradient-accent text-dark-950 font-black shadow-sm"
                >
                  Salvar Horário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADICIONAR OU EDITAR BARBEIRO NA EQUIPE
      ========================================================================= */}
      {isBarberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-dark-900 border border-dark-700 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-dark-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl theme-gradient-accent flex items-center justify-center text-dark-950 font-black">
                  <Scissors className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-white">
                  {editingBarber ? 'Editar Barbeiro' : 'Adicionar Barbeiro na Barbearia'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { setIsBarberModalOpen(false); setEditingBarber(null); }}
                className="p-1.5 rounded-full bg-dark-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBarberForm} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-300 mb-1">
                  Nome do Barbeiro: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos, Saymon, Thiago..."
                  value={barberForm.name}
                  onChange={(e) => setBarberForm({ ...barberForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-white font-bold"
                />
              </div>

              {/* Foto Real do Barbeiro (Cloudinary) */}
              <div className="p-3 rounded-2xl bg-dark-850 border border-dark-750 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-gold-500/50 bg-dark-950 overflow-hidden flex items-center justify-center shrink-0">
                  {barberForm.photo ? (
                    <img src={barberForm.photo} alt={barberForm.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">{barberForm.icon || '✂️'}</span>
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    Foto do Profissional (Cloudinary):
                  </span>
                  <input
                    ref={barberFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBarberPhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingBarberImage}
                    onClick={() => barberFileInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-white border border-dark-700 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    {isUploadingBarberImage ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-3 h-3" />
                        <span>{barberForm.photo ? 'Trocar Foto' : 'Escolher Foto'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-300 mb-1">
                  Cargo / Especialidade Principal:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Barbeiro Especialista, Degradê & Barba..."
                  value={barberForm.role}
                  onChange={(e) => setBarberForm({ ...barberForm, role: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-white"
                />
              </div>

              {/* Seletor de Ícone / Emoji */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-300 mb-1">
                  Ícone / Emoji do Barbeiro:
                </label>
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  {['✂️', '💈', '🧔', '⚡', '👑', '🔥', '🎩', '💇‍♂️'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setBarberForm({ ...barberForm, icon: em })}
                      className={`w-9 h-9 rounded-xl border text-base flex items-center justify-center transition-all cursor-pointer ${
                        barberForm.icon === em
                          ? 'border-gold-500 bg-gold-500/20 shadow-gold-glow-sm scale-105'
                          : 'border-dark-750 bg-dark-850 hover:border-dark-600'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Ou digite outro emoji/ícone"
                  value={barberForm.icon}
                  onChange={(e) => setBarberForm({ ...barberForm, icon: e.target.value })}
                  className="w-full p-2 rounded-xl bg-dark-850 border border-dark-700 text-white text-center font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-300 mb-1">
                  WhatsApp / Contato (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ex: (86) 99999-9999"
                  value={barberForm.phone}
                  onChange={(e) => setBarberForm({ ...barberForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-300 mb-1">
                  Especialidades (separadas por vírgula):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Degradê, Barba na Toalha Quente, Tesoura..."
                  value={barberForm.specialties}
                  onChange={(e) => setBarberForm({ ...barberForm, specialties: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-white"
                />
              </div>

              <div className="pt-3 border-t border-dark-800 flex gap-2">
                <button
                  type="button"
                  onClick={() => { setIsBarberModalOpen(false); setEditingBarber(null); }}
                  className="flex-1 py-2.5 rounded-xl bg-dark-800 text-neutral-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl theme-gradient-accent text-dark-950 font-black shadow-sm cursor-pointer"
                >
                  {editingBarber ? 'Salvar Alterações' : 'Cadastrar Barbeiro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Recorte e Edição de Fotos Interativo */}
      <ImageCropperModal
        isOpen={cropperModal.isOpen}
        imageSrc={cropperModal.imageSrc}
        title={cropperModal.title}
        cropType={cropperModal.cropType}
        onClose={() => setCropperModal(prev => ({ ...prev, isOpen: false }))}
        onCropConfirm={async (croppedFile) => {
          if (cropperModal.targetCallback) {
            await cropperModal.targetCallback(croppedFile);
          }
        }}
        isUploading={isUploadingServiceImage || isUploadingProfileImage || isUploadingCoverImage || isUploadingLogoImage || isUploadingGalleryImage || isUploadingBarberImage}
        themeColor={theme.primary}
      />

      {/* Modal de Pagamento da Assinatura Mensal */}
      <SaaSSubscriptionModal
        isOpen={isSaaSPayModalOpen}
        onClose={() => setIsSaaSPayModalOpen(false)}
      />

    </div>
  );
}
