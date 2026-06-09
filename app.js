(function () {
  "use strict";

  const STORAGE_KEY = "elan-clean-v0.5.0";
  const suggestedActions = {
    off: { title: "Choisir un petit départ", text: "Garde la journée légère avec une action simple.", action: "complete" },
    house: { title: "Faire la vaisselle", text: "Un geste simple pour remettre l'espace en ordre.", action: "complete" },
    mental: { title: "Urgence mentale", text: "OK. Reviens au présent avec une action simple.", action: "complete" }
  };
  const domainInfo = {
    off: { total: 3, reward: "Temps relax" },
    house: { total: 3, reward: "Musique" },
    mental: { total: 10, reward: "Temps calme" }
  };

  const COINS_PER_TASK = 5;
  const CHALLENGE_DURATIONS = [2, 5, 8, 12, 15];
  const checkInChoices = [
    "Je travaille",
    "Je procrastine",
    "Je me repose",
    "Je suis concentré",
    "Je suis perdu",
    "Je fais du ménage",
    "Je joue",
    "Je suis fatigué",
    "Je suis motivé"
  ];
  const defaultShopRewards = [
    { id: "pause-15", title: "Pause", category: "Detente", cost: 10, minutes: 15, rewardType: "timer" },
    { id: "pause-30", title: "Pause", category: "Detente", cost: 18, minutes: 30, rewardType: "timer" },
    { id: "pause-45", title: "Pause", category: "Detente", cost: 25, minutes: 45, rewardType: "timer" },
    { id: "gaming-30", title: "Gaming", category: "Loisirs", cost: 20, minutes: 30, rewardType: "timer" },
    { id: "gaming-45", title: "Gaming", category: "Loisirs", cost: 30, minutes: 45, rewardType: "timer" },
    { id: "gaming-60", title: "Gaming", category: "Loisirs", cost: 40, minutes: 60, rewardType: "timer" },
    { id: "lecture-20", title: "Lecture", category: "Calme", cost: 12, minutes: 20, rewardType: "timer" },
    { id: "lecture-30", title: "Lecture", category: "Calme", cost: 18, minutes: 30, rewardType: "timer" },
    { id: "lecture-45", title: "Lecture", category: "Calme", cost: 25, minutes: 45, rewardType: "timer" },
    { id: "musique-20", title: "Musique", category: "Calme", cost: 10, minutes: 20, rewardType: "timer" },
    { id: "musique-30", title: "Musique", category: "Calme", cost: 15, minutes: 30, rewardType: "timer" },
    { id: "musique-45", title: "Musique", category: "Calme", cost: 22, minutes: 45, rewardType: "timer" },
    { id: "relaxation-15", title: "Relaxation", category: "Detente", cost: 10, minutes: 15, rewardType: "timer" },
    { id: "relaxation-30", title: "Relaxation", category: "Detente", cost: 18, minutes: 30, rewardType: "timer" },
    { id: "relaxation-45", title: "Relaxation", category: "Detente", cost: 25, minutes: 45, rewardType: "timer" },
    { id: "film", title: "Film", category: "Divertissement", cost: 50, uses: 1, rewardType: "free" },
    { id: "soiree-detente", title: "Soirée détente", category: "Bonus", cost: 75, uses: 1, rewardType: "free" },
    { id: "moment-special", title: "Moment spécial", category: "Bonus", cost: 100, uses: 1, rewardType: "free" }
  ];
  const shopCategories = [
    { id: "Detente", label: "Détente", icon: "☕" },
    { id: "Loisirs", label: "Loisirs", icon: "🎮" },
    { id: "Divertissement", label: "Divertissement", icon: "🎬" },
    { id: "Calme", label: "Calme", icon: "📚" },
    { id: "Bonus", label: "Bonus", icon: "🎁" }
  ];
  const blockedRewardTerms = [
    "temps couple",
    "moment ensemble",
    "voir sa famille",
    "famille",
    "dormir",
    "manger",
    "payer une facture",
    "faire une tâche ménagère",
    "promener les chiens",
    "prendre soin des animaux",
    "animaux",
    "temps chasse",
    "chasse",
    "équipement chasse",
    "petit projet personnel",
    "youtube",
    "netflix",
    "xbox",
    "playstation"
  ];

  const agendaTypeColors = {
    Travail: "#dceee8",
    Tâche: "#f3e8d4",
    Pause: "#e7f0f3",
    "Rendez-vous": "#f3e4e7",
    Habitude: "#e8eddc",
    "Bloc de temps": "#ebe6f3",
    Finance: "#f6f0dc",
    Budget: "#f6f0dc"
  };

  const homeDomains = {
    off: { title: "Congé", subtitle: "Journée plus légère, sans pression.", missions: [{ label: "Choisir une petite chose" }, { label: "Préparer un coin calme" }, { label: "Faire 5 minutes utiles" }, { label: "Sortir prendre l'air" }, { label: "Ranger un petit espace" }, { label: "Choisir un moment relax" }] },
    house: { title: "Maison", subtitle: "Petits gestes pour avancer à la maison.", missions: [{ label: "Faire la vaisselle" }, { label: "Ranger une surface" }, { label: "Lancer une brassée" }, { label: "Ranger une pièce" }, { label: "Vider une poubelle" }, { label: "Essuyer un comptoir" }, { label: "Plier quelques vêtements" }, { label: "Nettoyer un coin rapide" }] },
    mental: { title: "Urgence mentale", subtitle: "OK. Tu reprends le contrôle.", missions: [{ label: "Prends 3 grandes respirations" }, { label: "Touche 3 objets" }, { label: "Mets les deux pieds au sol" }] }
  };

  const houseRooms = [
    {
      id: "salon",
      icon: "🛋️",
      label: "Salon",
      tasks: [
        { id: "salon-aspirateur", label: "Passer l'aspirateur", reward: 10 },
        { id: "salon-depoussierer", label: "Dépoussiérer", reward: 5 },
        { id: "salon-ranger-objets", label: "Ranger les objets", reward: 5 },
        { id: "salon-nettoyer-table", label: "Nettoyer la table", reward: 5 },
        { id: "salon-nettoyer-vitres", label: "Nettoyer les vitres", reward: 10 },
        { id: "salon-dechets", label: "Ramasser les déchets", reward: 5 }
      ]
    },
    {
      id: "cuisine",
      icon: "🍳",
      label: "Cuisine",
      tasks: [
        { id: "cuisine-vaisselle", label: "Faire la vaisselle", reward: 5 },
        { id: "cuisine-comptoir", label: "Nettoyer le comptoir", reward: 5 },
        { id: "cuisine-balayer", label: "Balayer le plancher", reward: 10 },
        { id: "cuisine-poubelles", label: "Sortir les poubelles", reward: 5 },
        { id: "cuisine-micro-ondes", label: "Nettoyer le micro-ondes", reward: 10 },
        { id: "cuisine-epicerie", label: "Ranger l'épicerie", reward: 5 },
        { id: "cuisine-evier", label: "Nettoyer l'évier", reward: 5 }
      ]
    },
    {
      id: "chambre",
      icon: "🛏️",
      label: "Chambre",
      tasks: [
        { id: "chambre-lit", label: "Faire le lit", reward: 5 },
        { id: "chambre-vetements", label: "Ranger les vêtements", reward: 5 },
        { id: "chambre-aspirateur", label: "Aspirateur", reward: 10 },
        { id: "chambre-depoussierer", label: "Dépoussiérer", reward: 5 },
        { id: "chambre-poubelle", label: "Vider la poubelle", reward: 5 }
      ]
    },
    {
      id: "salle-bain",
      icon: "🚿",
      label: "Salle de bain",
      tasks: [
        { id: "bain-toilette", label: "Nettoyer la toilette", reward: 10 },
        { id: "bain-lavabo", label: "Nettoyer le lavabo", reward: 5 },
        { id: "bain-miroir", label: "Nettoyer le miroir", reward: 5 },
        { id: "bain-douche", label: "Nettoyer la douche", reward: 10 },
        { id: "bain-serviettes", label: "Changer les serviettes", reward: 5 },
        { id: "bain-balayer", label: "Balayer", reward: 5 },
        { id: "bain-plancher", label: "Laver le plancher", reward: 10 }
      ]
    },
    {
      id: "buanderie",
      icon: "🧺",
      label: "Buanderie",
      tasks: [
        { id: "buanderie-brassee", label: "Faire une brassée", reward: 5 },
        { id: "buanderie-plier", label: "Plier les vêtements", reward: 5 },
        { id: "buanderie-ranger", label: "Ranger les vêtements", reward: 5 },
        { id: "buanderie-secheuse", label: "Nettoyer la sécheuse", reward: 5 },
        { id: "buanderie-plancher", label: "Nettoyer le plancher", reward: 5 }
      ]
    },
    {
      id: "entree",
      icon: "🚪",
      label: "Entrée",
      tasks: [
        { id: "entree-chaussures", label: "Ranger les chaussures", reward: 5 },
        { id: "entree-manteaux", label: "Ranger les manteaux", reward: 5 },
        { id: "entree-balayer", label: "Balayer", reward: 5 },
        { id: "entree-porte", label: "Nettoyer la porte", reward: 5 },
        { id: "entree-tapis", label: "Nettoyer le tapis", reward: 5 }
      ]
    },
    {
      id: "exterieur",
      icon: "🌳",
      label: "Extérieur",
      tasks: [
        { id: "exterieur-pelouse", label: "Tondre la pelouse", reward: 15, season: "Été" },
        { id: "exterieur-desherber", label: "Désherber", reward: 10, season: "Été" },
        { id: "exterieur-arroser", label: "Arroser les plantes", reward: 5, season: "Été" },
        { id: "exterieur-branches", label: "Ramasser les branches", reward: 10, season: "Été" },
        { id: "exterieur-patio", label: "Nettoyer le patio", reward: 10, season: "Été" },
        { id: "exterieur-deneiger", label: "Déneiger l'entrée", reward: 15, season: "Hiver" },
        { id: "exterieur-deglacer", label: "Déglacer les marches", reward: 10, season: "Hiver" },
        { id: "exterieur-sabler", label: "Sabler", reward: 5, season: "Hiver" },
        { id: "exterieur-voiture", label: "Dégager la voiture", reward: 10, season: "Hiver" }
      ]
    }
  ];

  const trainingLabels = {
    type: {
      cardio: "Cardio",
      force: "Force",
      endurance: "Endurance"
    },
    level: {
      beginner: "Débutant",
      intermediate: "Intermédiaire",
      advanced: "Avancé"
    }
  };
  const trainingTypeMeta = {
    cardio: { icon: "🏃", description: "Améliore ton souffle et ton endurance." },
    force: { icon: "🏋️", description: "Développe ta force et ta puissance." },
    endurance: { icon: "🔥", description: "Travaille ta résistance et ta constance." }
  };
  const trainingRewardByLevel = {
    beginner: 5,
    intermediate: 10,
    advanced: 15
  };
  const TRAINING_SKIP_PENALTY = 2;

  const trainingPrograms = {
    cardio: {
      beginner: {
        duration: "2-3 min",
        intensity: "Douce",
        note: "Commence simplement et garde un rythme confortable.",
        steps: [
          { label: "Marche rapide", amount: "60 secondes" },
          { label: "Genoux hauts", amount: "45 secondes" },
          { label: "Jumping Jacks", amount: "30 secondes" }
        ]
      },
      intermediate: {
        duration: "3 min",
        intensity: "Modérée",
        note: "Garde un rythme simple et régulier.",
        steps: [
          { label: "Jumping Jacks", amount: "60 secondes" },
          { label: "Genoux hauts", amount: "60 secondes" },
          { label: "Mountain Climbers", amount: "45 secondes" }
        ]
      },
      advanced: {
        duration: "3 min",
        intensity: "Élevée",
        note: "Reste attentif à tes sensations et ralentis si nécessaire.",
        steps: [
          { label: "Burpees", amount: "45 secondes" },
          { label: "Mountain Climbers", amount: "60 secondes" },
          { label: "Sprint sur place", amount: "60 secondes" }
        ]
      }
    },
    force: {
      beginner: {
        duration: "2-3 min",
        intensity: "Douce",
        note: "Prends ton temps et garde des mouvements simples.",
        steps: [
          { label: "Squats", amount: "8 répétitions" },
          { label: "Pompes", amount: "5 répétitions" },
          { label: "Planche", amount: "20 secondes" }
        ]
      },
      intermediate: {
        duration: "3 min",
        intensity: "Modérée",
        note: "Avance étape par étape, avec des pauses si nécessaire.",
        steps: [
          { label: "Squats", amount: "12 répétitions" },
          { label: "Pompes", amount: "10 répétitions" },
          { label: "Planche", amount: "30 secondes" }
        ]
      },
      advanced: {
        duration: "4 min",
        intensity: "Élevée",
        note: "Garde le contrôle et réduis le rythme si nécessaire.",
        steps: [
          { label: "Squats", amount: "20 répétitions" },
          { label: "Pompes", amount: "15 répétitions" },
          { label: "Planche", amount: "60 secondes" }
        ]
      }
    },
    endurance: {
      beginner: {
        duration: "4 min",
        intensity: "Douce",
        note: "Un rythme tranquille est suffisant pour commencer.",
        steps: [
          { label: "Marche rapide", amount: "2 minutes" },
          { label: "Chaise", amount: "20 secondes" },
          { label: "Planche", amount: "20 secondes" }
        ]
      },
      intermediate: {
        duration: "3 min",
        intensity: "Modérée",
        note: "Garde un rythme stable et fais une pause au besoin.",
        steps: [
          { label: "Fentes", amount: "10 répétitions" },
          { label: "Chaise", amount: "40 secondes" },
          { label: "Planche", amount: "40 secondes" }
        ]
      },
      advanced: {
        duration: "4 min",
        intensity: "Élevée",
        note: "Garde les mouvements simples et réduis l'intensité si nécessaire.",
        steps: [
          { label: "Fentes", amount: "12 répétitions" },
          { label: "Chaise", amount: "60 secondes" },
          { label: "Planche", amount: "60 secondes" }
        ]
      }
    }
  };

  const emergencyActions = [
    "Prends 3 grandes respirations",
    "Touche 3 objets différents",
    "Bois un verre d'eau",
    "Regarde autour de toi",
    "Relâche tes épaules",
    "Mets les deux pieds au sol",
    "Ferme les yeux 10 secondes",
    "Écoute un son autour de toi",
    "Marche un peu",
    "Fais une pause écran"
  ];

  const defaultState = {
    onboardingComplete: false,
    installInviteSeen: false,
    motivation: "",
    rewards: [],
    selectedDomain: "",
    currentHomeDomain: "",
    wins: 0,
    coins: 0,
    progress: {},
    customGoals: {},
    ideas: [],
    quickItems: [],
    checkIns: [],
    goalQueue: { items: [], active: false, currentIndex: 0 },
    agenda: [],
    agendaDate: "",
    agendaView: "today",
    activeChallenge: null,
    purchasedRewards: [],
    activeReward: null,
    history: [],
    notifications: { important: false, summary: false },
    budget: { incomes: [], payments: [] },
    houseCoach: { selectedRoom: "", selectedTasks: [], activeTask: null, completed: {}, completedRooms: {}, quickMission: null },
    training: { mode: "quick", type: "cardio", level: "beginner", paneOpen: false, started: false, currentStep: 0, completed: false, skippedSteps: 0, lastReward: 0, customSteps: [] }
  };

  let state = loadState();
  let toastTimer;
  let quickType = "Tâche";
  let selectedCheckIn = "Je travaille";
  let selectedEnergy = "moyenne";
  let deferredInstallPrompt = null;
  let emergencyIndex = 0;
  let agendaReminderTimers = [];
  let challengeTimerId = null;
  let challengeCountdownId = null;
  let isCompletingChallenge = false;
  let activeRewardTimerId = null;
  let trainingTimerId = null;
  let houseTimerId = null;
  let trainingTimerStepKey = "";
  let trainingTimerRemaining = 0;
  let trainingTimerElapsed = false;
  let trainingTimerPhase = "idle";
  let trainingCountdownValue = 3;
  let trainingAutoAdvanceId = null;
  let shopFlow = { step: "categories", category: "", title: "", rewardType: "", rewardId: "" };

  function cloneState(value) {
    if (typeof structuredClone === "function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) return cloneState(defaultState);
      const nextState = {
        ...cloneState(defaultState),
        ...saved,
        progress: { ...defaultState.progress, ...saved.progress },
        customGoals: { ...defaultState.customGoals, ...saved.customGoals },
        ideas: Array.isArray(saved.ideas) ? saved.ideas : [],
        rewards: Array.isArray(saved.rewards) ? saved.rewards : [],
        checkIns: Array.isArray(saved.checkIns) ? saved.checkIns : [],
        goalQueue: saved.goalQueue && typeof saved.goalQueue === "object"
          ? {
            items: Array.isArray(saved.goalQueue.items) ? saved.goalQueue.items : [],
            active: Boolean(saved.goalQueue.active),
            currentIndex: Number.isFinite(saved.goalQueue.currentIndex) ? saved.goalQueue.currentIndex : 0
          }
          : cloneState(defaultState.goalQueue),
        agenda: Array.isArray(saved.agenda) ? saved.agenda : [],
        agendaDate: typeof saved.agendaDate === "string" ? saved.agendaDate : "",
        agendaView: ["today", "week", "next30"].includes(saved.agendaView) ? saved.agendaView : "today",
        activeChallenge: saved.activeChallenge && typeof saved.activeChallenge === "object" ? saved.activeChallenge : null,
        coins: Number.isFinite(saved.coins) ? saved.coins : (Number.isFinite(saved.wins) ? saved.wins * COINS_PER_TASK : 0),
        purchasedRewards: Array.isArray(saved.purchasedRewards) ? saved.purchasedRewards : [],
        activeReward: (saved.activeReward && typeof saved.activeReward === "object") ? saved.activeReward : null,
        history: Array.isArray(saved.history) ? saved.history : [],
        notifications: { ...defaultState.notifications, ...saved.notifications },
        budget: saved.budget && typeof saved.budget === "object"
          ? {
              incomes: Array.isArray(saved.budget.incomes) ? saved.budget.incomes : [],
              payments: Array.isArray(saved.budget.payments) ? saved.budget.payments : []
            }
          : cloneState(defaultState.budget),
        houseCoach: saved.houseCoach && typeof saved.houseCoach === "object"
          ? {
              selectedRoom: typeof saved.houseCoach.selectedRoom === "string" ? saved.houseCoach.selectedRoom : "",
              selectedTasks: Array.isArray(saved.houseCoach.selectedTasks) ? saved.houseCoach.selectedTasks : [],
              activeTask: saved.houseCoach.activeTask && typeof saved.houseCoach.activeTask === "object" ? saved.houseCoach.activeTask : null,
              completed: saved.houseCoach.completed && typeof saved.houseCoach.completed === "object" ? saved.houseCoach.completed : {},
              completedRooms: saved.houseCoach.completedRooms && typeof saved.houseCoach.completedRooms === "object" ? saved.houseCoach.completedRooms : {},
              quickMission: saved.houseCoach.quickMission && typeof saved.houseCoach.quickMission === "object" ? saved.houseCoach.quickMission : null
            }
          : cloneState(defaultState.houseCoach),
        training: saved.training && typeof saved.training === "object"
          ? {
              mode: saved.training.mode === "custom" ? "custom" : "quick",
              type: trainingPrograms[saved.training.type] ? saved.training.type : defaultState.training.type,
              level: trainingPrograms[saved.training.type]?.[saved.training.level] ? saved.training.level : defaultState.training.level,
              paneOpen: Boolean(saved.training.paneOpen),
              started: Boolean(saved.training.started),
              currentStep: Number.isFinite(saved.training.currentStep) ? saved.training.currentStep : 0,
              completed: Boolean(saved.training.completed),
              skippedSteps: Number.isFinite(saved.training.skippedSteps) ? Math.max(0, saved.training.skippedSteps) : 0,
              lastReward: Number.isFinite(saved.training.lastReward) ? Math.max(0, saved.training.lastReward) : 0,
              customSteps: Array.isArray(saved.training.customSteps)
                ? saved.training.customSteps
                    .filter((step) => step && typeof step.label === "string" && typeof step.amount === "string")
                    .map((step) => ({ label: step.label.trim(), amount: step.amount.trim() }))
                    .filter((step) => step.label && step.amount)
                    .slice(0, 12)
                : []
            }
          : { ...defaultState.training }
      };
      if (nextState.selectedDomain && !suggestedActions[nextState.selectedDomain] && !["training", "budget"].includes(nextState.selectedDomain)) {
        nextState.selectedDomain = "";
      }
      let cleanedAtLoad = false;
      nextState.goalQueue = normalizeGoalQueue(nextState.goalQueue);
      if (nextState.goalQueue.active && !isActiveChallengeValid(nextState.activeChallenge)) {
        nextState.goalQueue = { items: [], active: false, currentIndex: 0 };
        nextState.activeChallenge = null;
        cleanedAtLoad = true;
      }
      if (nextState.activeChallenge && !isActiveChallengeValid(nextState.activeChallenge)) {
        nextState.activeChallenge = null;
        cleanedAtLoad = true;
      }
      if (nextState.activeChallenge?.rewardedAt || nextState.activeChallenge?.status === "completed") {
        nextState.activeChallenge = null;
        cleanedAtLoad = true;
      }
      if (nextState.training?.started) {
        nextState.training = { ...nextState.training, started: false, currentStep: 0, completed: false, skippedSteps: 0, lastReward: 0 };
        cleanedAtLoad = true;
      }
      if (cleanedAtLoad) {
        console.debug("[ELAN activity]", "nettoyage état persistant", { reason: "loadState" });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      }
      return nextState;
    } catch (error) {
      return cloneState(defaultState);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function debugActivityLog(action, detail = {}) {
    console.debug("[ELAN activity]", action, detail);
  }

  function isActiveChallengeValid(challenge) {
    if (!challenge || typeof challenge !== "object") return false;
    if (!challenge.label || !challenge.domain) return false;
    return ["setup", "countdown", "running", "done"].includes(challenge.status);
  }

  function normalizeGoalQueue(queue = state.goalQueue) {
    const items = Array.isArray(queue?.items)
      ? queue.items.filter((item) => item && typeof item.label === "string" && item.label.trim())
      : [];
    const currentIndex = Number.isFinite(queue?.currentIndex) ? queue.currentIndex : 0;
    return {
      items,
      active: Boolean(queue?.active),
      currentIndex: Math.min(Math.max(0, currentIndex), Math.max(items.length - 1, 0))
    };
  }

  function clearTrainingRuntimeState(reason) {
    stopTrainingTimer();
    if (!state.training?.started) return false;
    state.training = { ...state.training, started: false, currentStep: 0, completed: false, skippedSteps: 0, lastReward: 0 };
    debugActivityLog("nettoyage entraînement", { reason });
    return true;
  }

  function clearMaisonRuntimeState(reason, { clearQueue = true } = {}) {
    window.clearInterval(challengeCountdownId);
    window.clearInterval(challengeTimerId);
    challengeCountdownId = null;
    challengeTimerId = null;
    isCompletingChallenge = false;
    const changed = Boolean(state.activeChallenge || state.goalQueue?.active || (clearQueue && queuedItems().length));
    state.activeChallenge = null;
    if (clearQueue) state.goalQueue = { items: [], active: false, currentIndex: 0 };
    debugActivityLog("nettoyage maison", { reason, clearQueue, changed });
    return changed;
  }

  function sanitizePersistedActivityState(reason = "chargement") {
    let changed = false;
    state.goalQueue = normalizeGoalQueue();
    if (!state.goalQueue.items.length && state.goalQueue.active) {
      state.goalQueue.active = false;
      state.goalQueue.currentIndex = 0;
      changed = true;
    }
    if (state.goalQueue.active && !isActiveChallengeValid(state.activeChallenge)) {
      state.goalQueue = { items: [], active: false, currentIndex: 0 };
      state.activeChallenge = null;
      changed = true;
    }
    if (state.activeChallenge && !isActiveChallengeValid(state.activeChallenge)) {
      state.activeChallenge = null;
      changed = true;
    }
    if (state.activeChallenge?.rewardedAt || state.activeChallenge?.status === "completed") {
      state.activeChallenge = null;
      changed = true;
    }
    if (state.training?.started && state.activeChallenge) {
      state.training = { ...state.training, started: false, currentStep: 0, completed: false, skippedSteps: 0, lastReward: 0 };
      changed = true;
    }
    if (state.training?.started) {
      state.training = { ...state.training, started: false, currentStep: 0, completed: false, skippedSteps: 0, lastReward: 0 };
      changed = true;
    }
    if (changed) {
      debugActivityLog("nettoyage état persistant", { reason });
      saveState();
    }
    return changed;
  }

  function $(id) {
    return document.getElementById(id);
  }

  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.remove("hidden");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.add("hidden"), 2300);
    if ("vibrate" in navigator) navigator.vibrate(20);
  }

  function showView(name) {
    document.querySelectorAll(".view").forEach((view) => {
      view.classList.toggle("active", view.id === `view-${name}`);
    });
    document.querySelectorAll("[data-view-button]").forEach((button) => {
      button.classList.toggle("active", button.dataset.viewButton === name);
    });
    const quickButton = $("quick-add-button");
    if (quickButton) quickButton.classList.toggle("hidden", name !== "home");
    if (name !== "home") closeQuickAdd();
  }

  function openDomain(domain) {
    const panel = $(`domain-${domain}`);
    if (!panel) return;
    state.selectedDomain = domain;
    saveState();
    document.querySelectorAll(".domain-panel").forEach((panel) => panel.classList.add("hidden"));
    panel.classList.remove("hidden");
    renderHomeSuggestion();
    if (domain === "house") renderHouseCoach();
    if (domain === "training") renderTrainingProgram();
    if (domain === "budget") renderBudget();
    showView("domains");
    panel.setAttribute("tabindex", "-1");
    window.requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panel.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      panel.focus({ preventScroll: true });
    });
  }

  function closeDomain() {
    document.querySelectorAll(".domain-panel").forEach((panel) => panel.classList.add("hidden"));
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function allHouseTasks() {
    return houseRooms.flatMap((room) => room.tasks.map((task) => ({ ...task, roomId: room.id, roomLabel: room.label, roomIcon: room.icon })));
  }

  function houseTaskById(taskId) {
    return allHouseTasks().find((task) => task.id === taskId) || null;
  }

  function houseRoomById(roomId) {
    return houseRooms.find((room) => room.id === roomId) || null;
  }

  function completedHouseTaskIds(date = todayKey()) {
    const completed = state.houseCoach?.completed?.[date];
    return Array.isArray(completed) ? completed : [];
  }

  function isHouseTaskCompleted(taskId) {
    return completedHouseTaskIds().includes(taskId);
  }

  function completedHouseRoomIds(date = todayKey()) {
    const completedRooms = state.houseCoach?.completedRooms?.[date];
    return Array.isArray(completedRooms) ? completedRooms : [];
  }

  function isHouseRoomCompleted(roomId) {
    return completedHouseRoomIds().includes(roomId);
  }

  function houseStats() {
    const completedIds = completedHouseTaskIds();
    const tasks = allHouseTasks();
    const totalTokens = tasks.reduce((sum, task) => sum + task.reward, 0);
    const earnedTokens = tasks
      .filter((task) => completedIds.includes(task.id))
      .reduce((sum, task) => sum + task.reward, 0);
    const percent = tasks.length ? Math.round((completedIds.length / tasks.length) * 100) : 0;
    return {
      completedCount: completedIds.length,
      totalCount: tasks.length,
      percent,
      earnedTokens,
      remainingTokens: Math.max(0, totalTokens - earnedTokens)
    };
  }

  function houseTaskDurationMs(task) {
    if (!task) return 2 * 60000;
    if (task.reward >= 15) return 8 * 60000;
    if (task.reward >= 10) return 5 * 60000;
    return 2 * 60000;
  }

  function activeHouseSeriesLabel() {
    const series = state.houseCoach?.quickMission;
    if (!Array.isArray(series?.taskIds) || !series.taskIds.length) return "Mission active";
    return `Mission ${(series.currentIndex || 0) + 1}/${series.taskIds.length}`;
  }

  function selectedHouseTasks() {
    const selected = Array.isArray(state.houseCoach?.selectedTasks) ? state.houseCoach.selectedTasks : [];
    return selected
      .map((taskId) => houseTaskById(taskId))
      .filter((task) => task && !isHouseTaskCompleted(task.id));
  }

  function selectedHouseTaskIdsForRoom(roomId) {
    return selectedHouseTasks()
      .filter((task) => !roomId || task.roomId === roomId)
      .map((task) => task.id);
  }

  function activeHouseTaskRemaining() {
    const active = state.houseCoach?.activeTask;
    if (!active?.endsAt) return active?.durationMs || 0;
    return Math.max(0, active.endsAt - Date.now());
  }

  function updateHouseTaskTime() {
    const active = state.houseCoach?.activeTask;
    if (!active) {
      window.clearInterval(houseTimerId);
      houseTimerId = null;
      return;
    }
    const remaining = activeHouseTaskRemaining();
    if (remaining <= 0 && active.status !== "done") {
      state.houseCoach = {
        ...(state.houseCoach || defaultState.houseCoach),
        activeTask: { ...active, status: "done" }
      };
      saveState();
      showToast("Temps écoulé. Tu peux valider la mission.");
    }
    renderHouseCoach();
  }

  function startHouseTaskTicker() {
    window.clearInterval(houseTimerId);
    const active = state.houseCoach?.activeTask;
    if (!active) {
      houseTimerId = null;
      return;
    }
    if (active.status === "done") {
      houseTimerId = null;
      renderHouseCoach();
      return;
    }
    houseTimerId = window.setInterval(updateHouseTaskTime, 1000);
    updateHouseTaskTime();
  }

  function stopHouseTaskTicker() {
    window.clearInterval(houseTimerId);
    houseTimerId = null;
  }

  function resumeHouseTaskTimer() {
    const active = state.houseCoach?.activeTask;
    if (!active) return;
    if (active.status === "running" && active.endsAt && Date.now() >= active.endsAt) {
      state.houseCoach = {
        ...(state.houseCoach || defaultState.houseCoach),
        activeTask: { ...active, status: "done" }
      };
      saveState();
      return;
    }
    if (active.status === "running") startHouseTaskTicker();
  }

  function houseCompletionMessage(task) {
    return `✓ ${task.label} terminé · +${task.reward} jetons`;
  }

  function renderHouseCoach() {
    const roomGrid = $("house-room-grid");
    const detail = $("house-room-detail");
    const detailTitle = $("house-room-title");
    const taskList = $("house-task-list");
    const completedSection = $("house-completed-section");
    const completedList = $("house-completed-list");
    const selectedSummary = $("house-selected-summary");
    const activePanel = $("house-active-mission");
    const activeTask = state.houseCoach?.activeTask ? houseTaskById(state.houseCoach.activeTask.id) : null;
    const selectedRoom = houseRoomById(state.houseCoach?.selectedRoom);
    const selectedTasks = selectedHouseTasks();
    const selectedInRoom = selectedHouseTaskIdsForRoom(selectedRoom?.id);

    if (roomGrid) {
      roomGrid.replaceChildren(...houseRooms.map((room) => {
        const completedInRoom = room.tasks.filter((task) => isHouseTaskCompleted(task.id)).length;
        const roomPercent = room.tasks.length ? Math.round((completedInRoom / room.tasks.length) * 100) : 0;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "house-room-card";
        button.dataset.houseRoom = room.id;
        button.innerHTML = `
          <span class="house-room-icon" aria-hidden="true">${room.icon}</span>
          <strong>${room.label}</strong>
          <span>${completedInRoom} / ${room.tasks.length} objectifs complétés</span>
          <span>${roomPercent} % complété</span>
          <i class="house-room-meter" aria-hidden="true"><b style="width:${roomPercent}%"></b></i>
        `;
        return button;
      }));
    }

    if (detail) detail.classList.toggle("hidden", !selectedRoom);
    if (detailTitle && selectedRoom) detailTitle.textContent = `${selectedRoom.icon} ${selectedRoom.label}`;
    if (taskList && selectedRoom) {
      const availableTasks = selectedRoom.tasks.filter((task) => !isHouseTaskCompleted(task.id));
      taskList.replaceChildren(...availableTasks.map((task) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "house-task-button house-task-row";
        if (selectedInRoom.includes(task.id)) button.classList.add("selected");
        button.dataset.houseTask = task.id;
        button.innerHTML = `
          <span>
            <strong>${selectedInRoom.includes(task.id) ? "☑" : "□"} ${task.label}</strong>
            ${task.season ? `<em>${task.season}</em>` : ""}
          </span>
          <b>+${task.reward}</b>
        `;
        return button;
      }));
      if (!availableTasks.length) {
        const empty = document.createElement("p");
        empty.className = "small-muted";
        empty.textContent = "Toutes les tâches de cette pièce sont terminées aujourd'hui.";
        taskList.replaceChildren(empty);
      }
    } else if (taskList) {
      taskList.replaceChildren();
    }

    if (selectedSummary && selectedRoom) {
      const tasks = selectedTasks.filter((task) => task.roomId === selectedRoom.id);
      const reward = tasks.reduce((sum, task) => sum + task.reward, 0);
      selectedSummary.classList.toggle("hidden", !tasks.length || Boolean(activeTask));
      $("house-selected-count").textContent = `${tasks.length} objectif${tasks.length > 1 ? "s" : ""} sélectionné${tasks.length > 1 ? "s" : ""}`;
      $("house-selected-reward").textContent = `+${reward} jetons`;
    } else {
      selectedSummary?.classList.add("hidden");
    }

    if (completedSection && completedList && selectedRoom) {
      const completedTasks = selectedRoom.tasks.filter((task) => isHouseTaskCompleted(task.id));
      completedSection.classList.toggle("hidden", !completedTasks.length);
      completedList.replaceChildren(...completedTasks.map((task) => {
        const item = document.createElement("p");
        item.innerHTML = `<span>✓ ${task.label}</span><strong>+${task.reward}</strong>`;
        return item;
      }));
    } else {
      completedSection?.classList.add("hidden");
      completedList?.replaceChildren();
    }

    if (activePanel) activePanel.classList.toggle("hidden", !activeTask);
    if (activeTask) {
      const activeState = state.houseCoach.activeTask;
      const remainingMs = activeHouseTaskRemaining();
      const durationMs = activeState.durationMs || houseTaskDurationMs(activeTask);
      const ratio = durationMs ? Math.max(0, Math.min(1, remainingMs / durationMs)) : 0;
      $("house-active-step").textContent = activeHouseSeriesLabel();
      $("house-active-task-name").textContent = activeTask.label;
      $("house-active-task-room").textContent = `${activeTask.roomIcon} ${activeTask.roomLabel}`;
      $("house-active-task-reward").textContent = `+${activeTask.reward} jetons`;
      $("house-timer-display").textContent = formatRemaining(remainingMs);
      $("house-timer-status").textContent = activeState.status === "done" ? "Temps écoulé" : "Mission en cours";
      $("house-timer-progress").style.width = `${ratio * 100}%`;
    }
  }

  function selectHouseRoom(roomId) {
    if (!houseRoomById(roomId)) return;
    state.houseCoach = { ...(state.houseCoach || defaultState.houseCoach), selectedRoom: roomId, selectedTasks: [] };
    state.selectedDomain = "house";
    saveState();
    renderHouseCoach();
    $("house-room-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function backToHouseRooms() {
    state.houseCoach = { ...(state.houseCoach || defaultState.houseCoach), selectedRoom: "", selectedTasks: [] };
    saveState();
    renderHouseCoach();
  }

  function startHouseTask(taskId) {
    const task = houseTaskById(taskId);
    if (!task || isHouseTaskCompleted(task.id)) return;
    const now = Date.now();
    const durationMs = houseTaskDurationMs(task);
    state.houseCoach = {
      ...(state.houseCoach || defaultState.houseCoach),
      selectedRoom: task.roomId,
      activeTask: { id: task.id, startedAt: now, endsAt: now + durationMs, durationMs, status: "running" }
    };
    state.selectedDomain = "house";
    saveState();
    renderHouseCoach();
    startHouseTaskTicker();
    $("house-active-mission")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function toggleHouseTaskSelection(taskId) {
    const task = houseTaskById(taskId);
    if (!task || isHouseTaskCompleted(task.id) || state.houseCoach?.activeTask) return;
    const current = Array.isArray(state.houseCoach?.selectedTasks) ? state.houseCoach.selectedTasks : [];
    const selected = current.includes(task.id)
      ? current.filter((id) => id !== task.id)
      : [...current, task.id];
    state.houseCoach = { ...(state.houseCoach || defaultState.houseCoach), selectedRoom: task.roomId, selectedTasks: selected };
    saveState();
    renderHouseCoach();
  }

  function cancelHouseTask() {
    state.houseCoach = { ...(state.houseCoach || defaultState.houseCoach), activeTask: null };
    stopHouseTaskTicker();
    saveState();
    renderHouseCoach();
  }

  function startSelectedHouseMission() {
    const tasks = selectedHouseTasks().filter((task) => task.roomId === state.houseCoach?.selectedRoom);
    if (!tasks.length) {
      showToast("Sélectionne au moins une tâche.");
      return;
    }
    state.houseCoach = {
      ...(state.houseCoach || defaultState.houseCoach),
      selectedTasks: tasks.map((task) => task.id),
      quickMission: { taskIds: tasks.map((task) => task.id), currentIndex: 0, source: "selection", earned: 0, bonus: 0, roomId: state.houseCoach?.selectedRoom || tasks[0]?.roomId || "" }
    };
    saveState();
    startHouseTask(tasks[0].id);
  }

  function showHouseCompleteModal(summary) {
    const modal = $("house-complete-modal");
    if (!modal) return;
    $("house-complete-title").textContent = summary?.title || "Série terminée";
    $("house-complete-task-name").textContent = summary?.text || "Objectifs complétés";
    $("house-complete-reward").textContent = `+${summary?.reward || 0} jetons gagnés`;
    modal.classList.remove("hidden");
    window.requestAnimationFrame(() => modal.focus({ preventScroll: true }));
  }

  function closeHouseCompleteModal() {
    $("house-complete-modal")?.classList.add("hidden");
    renderHouseCoach();
  }

  function completeHouseTask() {
    const task = state.houseCoach?.activeTask ? houseTaskById(state.houseCoach.activeTask.id) : null;
    if (!task || isHouseTaskCompleted(task.id)) {
      cancelHouseTask();
      return;
    }
    const date = todayKey();
    const completed = completedHouseTaskIds(date);
    const quick = state.houseCoach?.quickMission || null;
    const completedNext = [...completed, task.id];
    const room = houseRoomById(task.roomId);
    const roomCompletedNow = Boolean(room)
      && !isHouseRoomCompleted(task.roomId)
      && room.tasks.every((roomTask) => completedNext.includes(roomTask.id));
    const roomBonus = roomCompletedNow ? 25 : 0;
    const completedRooms = completedHouseRoomIds(date);
    const seriesReward = (quick?.earned || 0) + task.reward + roomBonus;
    const seriesBonus = (quick?.bonus || 0) + roomBonus;
    state.houseCoach = {
      ...(state.houseCoach || defaultState.houseCoach),
      activeTask: null,
      selectedRoom: task.roomId,
      quickMission: quick ? { ...quick, earned: seriesReward, bonus: seriesBonus } : null,
      selectedTasks: (state.houseCoach?.selectedTasks || []).filter((id) => id !== task.id),
      completed: {
        ...(state.houseCoach?.completed || {}),
        [date]: completedNext
      },
      completedRooms: {
        ...(state.houseCoach?.completedRooms || {}),
        [date]: roomCompletedNow ? [...completedRooms, task.roomId] : completedRooms
      }
    };
    state.selectedDomain = "house";
    state.wins += 1;
    state.coins += task.reward + roomBonus;
    state.progress.house = (state.progress.house || 0) + 1;
    const historyItems = [{
      label: `Maison - ${task.roomLabel} : ${task.label}`,
      coins: task.reward,
      at: Date.now(),
      domain: "house"
    }];
    if (roomBonus) {
      historyItems.push({
        label: `Maison - ${task.roomLabel} complétée`,
        coins: roomBonus,
        at: Date.now(),
        domain: "house"
      });
    }
    state.history = [...historyItems, ...state.history].slice(0, 50);
    saveState();
    stopHouseTaskTicker();
    renderHouseCoach();
    renderDomainProgress();
    renderShop();
    renderHistoryList();
    renderAgenda();
    showToast(houseCompletionMessage(task));
    if (quick?.taskIds?.length) {
      const nextIndex = (quick.currentIndex || 0) + 1;
      const nextTaskId = quick.taskIds[nextIndex];
      if (nextTaskId && !isHouseTaskCompleted(nextTaskId)) {
        state.houseCoach = {
          ...(state.houseCoach || defaultState.houseCoach),
          quickMission: { ...quick, currentIndex: nextIndex, earned: seriesReward, bonus: seriesBonus }
        };
        saveState();
        startHouseTask(nextTaskId);
      } else {
        state.houseCoach = { ...(state.houseCoach || defaultState.houseCoach), quickMission: null };
        saveState();
        showHouseCompleteModal({
          title: roomBonus ? "🏆 Pièce complétée" : "🎉 Série terminée",
          text: roomBonus ? `${task.roomLabel} complétée · bonus +25 jetons` : `${quick.taskIds.length} objectifs complétés`,
          reward: seriesReward
        });
      }
    } else {
      showHouseCompleteModal({
        title: roomBonus ? "🏆 Pièce complétée" : "🎉 Série terminée",
        text: roomBonus ? `${task.roomLabel} complétée · bonus +25 jetons` : task.label,
        reward: task.reward + roomBonus
      });
    }
  }

  function currentTrainingProgram() {
    const mode = state.training?.mode === "custom" ? "custom" : "quick";
    if (mode === "custom") {
      const customSteps = Array.isArray(state.training?.customSteps) ? state.training.customSteps : [];
      return {
        mode,
        type: state.training?.type || defaultState.training.type,
        level: state.training?.level || defaultState.training.level,
        title: "Programme personnalisé",
        label: "Programme personnalisé",
        program: {
          duration: customSteps.length ? `${customSteps.length} exercice${customSteps.length > 1 ? "s" : ""}` : "À créer",
          intensity: "À ton rythme",
          note: "Avance étape par étape. Tu peux passer ou arrêter si nécessaire.",
          steps: customSteps
        }
      };
    }
    const type = trainingPrograms[state.training?.type] ? state.training.type : defaultState.training.type;
    const level = trainingPrograms[type]?.[state.training?.level] ? state.training.level : defaultState.training.level;
    const typeIcon = trainingTypeMeta[type]?.icon || "💪";
    return {
      mode,
      type,
      level,
      title: `${typeIcon} ${trainingLabels.type[type]} ${trainingLabels.level[level].toLowerCase()}`,
      label: `${trainingLabels.type[type]} ${trainingLabels.level[level].toLowerCase()}`,
      program: trainingPrograms[type][level]
    };
  }

  function trainingCompletedCount(type) {
    const label = trainingLabels.type[type] || "";
    return (state.history || []).filter((entry) => (
      entry?.domain === "training" && String(entry.label || "").toLowerCase().includes(label.toLowerCase())
    )).length;
  }

  function trainingProgressPercent(type) {
    return Math.min(100, trainingCompletedCount(type) * 10);
  }

  function renderTrainingTypeCards() {
    const target = $("training-type-cards");
    if (!target) return;
    target.replaceChildren(...Object.keys(trainingPrograms).map((type) => {
      const meta = trainingTypeMeta[type] || { icon: "💪", description: "" };
      const count = trainingCompletedCount(type);
      const percent = trainingProgressPercent(type);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "training-type-card";
      button.dataset.trainingTypeCard = type;
      button.innerHTML = `
        <span class="training-type-icon" aria-hidden="true">${meta.icon}</span>
        <strong>${trainingLabels.type[type]}</strong>
        <span>${meta.description}</span>
        <i class="training-type-meter" aria-hidden="true"><b style="width:${percent}%"></b></i>
        <em>${count} séance${count > 1 ? "s" : ""} complétée${count > 1 ? "s" : ""}</em>
      `;
      return button;
    }));
  }

  function renderTrainingProgram() {
    const panel = $("domain-training");
    if (!panel) return;
    const { mode, type, level, title: programTitle, program } = currentTrainingProgram();
    const totalSteps = program.steps.length;
    const currentStepIndex = Math.min(Math.max(state.training?.currentStep || 0, 0), Math.max(totalSteps - 1, 0));
    const isStarted = Boolean(state.training?.started && !state.training?.completed);
    const isCompleted = Boolean(state.training?.completed);
    const paneOpen = Boolean(state.training?.paneOpen || isStarted || isCompleted || mode === "custom");
    panel.classList.toggle("training-active-domain", isStarted);
    document.querySelectorAll("[data-training-mode]").forEach((button) => {
      const active = button.dataset.trainingMode === mode;
      button.classList.toggle("selected", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    document.querySelectorAll("[data-training-type]").forEach((button) => {
      const active = button.dataset.trainingType === type;
      button.classList.toggle("selected", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    document.querySelectorAll("[data-training-level]").forEach((button) => {
      const active = button.dataset.trainingLevel === level;
      button.classList.toggle("selected", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    const title = $("training-program-title");
    const programCard = $("training-program-card");
    const steps = $("training-steps");
    const duration = $("training-duration");
    const intensity = $("training-intensity");
    const intensityText = $("training-intensity-text");
    const note = $("training-note");
    const status = $("training-session-status");
    const activeStep = $("training-active-step");
    const stepCount = $("training-step-count");
    const remainingSteps = $("training-remaining-steps");
    const currentStep = $("training-current-step");
    const currentAmount = $("training-current-amount");
    const progressFill = $("training-progress-fill");
    const completePanel = $("training-complete-panel");
    const completeReward = $("training-complete-reward");
    const completeProgram = $("training-complete-program");
    const startButton = $("start-training-session");
    const quickBuilder = $("training-quick-builder");
    const overview = $("training-overview");
    const customBuilder = $("training-custom-builder");
    const customList = $("training-custom-list");
    const selectedTypeTitle = $("training-selected-type-title");

    renderTrainingTypeCards();
    if (overview) overview.classList.toggle("hidden", mode !== "quick" || isStarted || isCompleted);
    if (quickBuilder) quickBuilder.classList.toggle("hidden", mode !== "quick" || !paneOpen || isStarted || isCompleted);
    if (customBuilder) customBuilder.classList.toggle("hidden", mode !== "custom" || isStarted);
    if (programCard) {
      programCard.classList.toggle("hidden", !paneOpen);
      programCard.classList.toggle("training-session-focused", isStarted);
      programCard.classList.toggle("training-countdown-active", isStarted && trainingTimerPhase === "countdown");
    }

    if (title) title.textContent = programTitle;
    if (selectedTypeTitle) selectedTypeTitle.textContent = `${trainingTypeMeta[type]?.icon || "💪"} ${trainingLabels.type[type]}`;
    if (steps) {
      steps.replaceChildren(...program.steps.map((step, index) => {
        const item = document.createElement("li");
        const label = document.createElement("strong");
        label.textContent = step.label;
        const amount = document.createElement("span");
        amount.textContent = step.amount;
        item.append(label, amount);
        item.classList.toggle("active", isStarted && index === currentStepIndex);
        item.classList.toggle("done", isStarted && index < currentStepIndex);
        return item;
      }));
    }
    if (customList) renderTrainingCustomList(customList);
    if (duration) duration.textContent = program.duration;
    if (intensity) intensity.textContent = program.intensity;
    if (intensityText) intensityText.textContent = program.intensity;
    if (note) note.textContent = program.note;
    if (status) {
      status.classList.toggle("hidden", !isStarted);
      status.textContent = isStarted ? "Séance en cours. Une étape à la fois." : "";
    }
    if (activeStep) activeStep.classList.toggle("hidden", !isStarted);
    if (completePanel) completePanel.classList.toggle("hidden", !isCompleted);
    if (startButton) startButton.classList.toggle("hidden", isStarted || isCompleted);
    if (startButton) startButton.disabled = mode === "custom" && totalSteps === 0;

    if (isStarted && totalSteps) {
      const step = program.steps[currentStepIndex];
      if (stepCount) stepCount.textContent = `Exercice ${currentStepIndex + 1}/${totalSteps}`;
      if (remainingSteps) remainingSteps.textContent = `Étapes restantes : ${Math.max(0, totalSteps - currentStepIndex - 1)}`;
      if (currentStep) currentStep.textContent = step.label;
      const hasTimer = parseTrainingDurationSeconds(step.amount) > 0;
      if (currentAmount) {
        currentAmount.textContent = step.amount;
        currentAmount.classList.toggle("hidden", hasTimer);
      }
      if (progressFill) progressFill.style.width = `${Math.round((currentStepIndex / totalSteps) * 100)}%`;
      updateTrainingCountdownDetails(step, currentStepIndex, totalSteps);
      renderTrainingTimer(step, currentStepIndex);
      if (programCard) programCard.classList.toggle("training-countdown-active", trainingTimerPhase === "countdown");
    } else if (progressFill) {
      progressFill.style.width = isCompleted ? "100%" : "0%";
      stopTrainingTimer();
      $("training-step-timer")?.classList.add("hidden");
    }

    if (isCompleted) {
      const reward = Number.isFinite(state.training?.lastReward) ? state.training.lastReward : trainingRewardForCurrentSession();
      if (completeProgram) completeProgram.textContent = programTitle;
      if (completeReward) {
        completeReward.textContent = reward > 0 ? `+${reward} jetons gagnés` : "";
        completeReward.classList.toggle("hidden", reward <= 0);
      }
    } else if (completeReward) {
      completeReward.textContent = "";
      completeReward.classList.add("hidden");
    }
  }

  function trainingRewardForCurrentSession() {
    const baseReward = trainingRewardByLevel[state.training?.level] || trainingRewardByLevel.beginner;
    const skippedSteps = Number.isFinite(state.training?.skippedSteps) ? state.training.skippedSteps : 0;
    return Math.max(0, baseReward - skippedSteps * TRAINING_SKIP_PENALTY);
  }

  function parseTrainingDurationSeconds(amount) {
    const text = String(amount || "").toLowerCase().replace(",", ".");
    const cycleMatch = text.match(/(\d+)\s*cycles?.*?(\d+(?:\.\d+)?)\s*(?:s|sec|secs|seconde|secondes).*?(\d+(?:\.\d+)?)\s*(?:s|sec|secs|seconde|secondes)/);
    if (cycleMatch) {
      return Math.round(Number(cycleMatch[1]) * (Number(cycleMatch[2]) + Number(cycleMatch[3])));
    }
    const multipliedMatch = text.match(/(\d+)\s*x\s*(\d+(?:\.\d+)?)\s*(s|sec|secs|seconde|secondes|min|minute|minutes)/);
    if (multipliedMatch) {
      const value = Number(multipliedMatch[2]);
      const unit = multipliedMatch[3];
      return Math.round(Number(multipliedMatch[1]) * value * (unit.startsWith("min") ? 60 : 1));
    }
    const durationMatch = text.match(/(\d+(?:\.\d+)?)\s*(s|sec|secs|seconde|secondes|min|minute|minutes)/);
    if (!durationMatch) return 0;
    const value = Number(durationMatch[1]);
    const unit = durationMatch[2];
    return Math.round(value * (unit.startsWith("min") ? 60 : 1));
  }

  function trainingMotionForStep(step) {
    const label = String(step?.label || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (label.includes("planche") || label.includes("chaise")) return { icon: "⏱️", className: "training-motion-timer" };
    if (label.includes("pompe") || label.includes("squat") || label.includes("fente")) return { icon: "💪", className: "training-motion-force" };
    if (label.includes("jump") || label.includes("burpee") || label.includes("mountain")) return { icon: "⚡", className: "training-motion-energy" };
    if (label.includes("marche") || label.includes("sprint") || label.includes("genoux")) return { icon: "🏃", className: "training-motion-cardio" };
    return { icon: "⚡", className: "training-motion-energy" };
  }

  function updateTrainingCountdownDetails(step, stepIndex, totalSteps) {
    const stepLabel = $("training-countdown-step");
    const name = $("training-countdown-name");
    const amount = $("training-countdown-amount");
    const motion = $("training-countdown-motion");
    const motionIcon = $("training-countdown-icon");
    if (stepLabel) {
      stepLabel.textContent = stepIndex === 0
        ? `Exercice ${stepIndex + 1}/${totalSteps}`
        : `Exercice suivant · ${stepIndex + 1}/${totalSteps}`;
    }
    if (name) name.textContent = step.label;
    if (amount) amount.textContent = step.amount;
    if (motion) {
      const motionMeta = trainingMotionForStep(step);
      motion.className = `training-motion ${motionMeta.className}`;
      if (motionIcon) motionIcon.textContent = motionMeta.icon;
    }
  }

  function renderTrainingTimer(step, stepIndex) {
    const timer = $("training-step-timer");
    if (!timer) return;
    const seconds = parseTrainingDurationSeconds(step.amount);
    const stepKey = `${state.training?.mode || "quick"}:${stepIndex}:${step.label}:${step.amount}`;
    if (trainingTimerStepKey !== stepKey) {
      stopTrainingTimer();
      trainingTimerStepKey = stepKey;
      trainingTimerRemaining = Math.max(0, seconds);
      trainingTimerElapsed = false;
      trainingTimerPhase = "countdown";
      trainingCountdownValue = 3;
      trainingTimerId = window.setInterval(tickTrainingTimer, 1000);
    }
    timer.classList.toggle("hidden", !seconds || trainingTimerPhase === "countdown" || trainingTimerPhase === "idle");
    updateTrainingTimerDisplay();
  }

  function tickTrainingTimer() {
    if (trainingTimerPhase === "countdown") {
      if (trainingCountdownValue > 0) {
        trainingCountdownValue -= 1;
        updateTrainingTimerDisplay();
        renderTrainingProgram();
        return;
      }
      trainingTimerPhase = trainingTimerRemaining > 0 ? "timer" : "idle";
      if (trainingTimerPhase === "idle") {
        window.clearInterval(trainingTimerId);
        trainingTimerId = null;
      }
      updateTrainingTimerDisplay();
      renderTrainingProgram();
      return;
    }
    if (trainingTimerRemaining > 0) {
      trainingTimerRemaining -= 1;
    }
    updateTrainingTimerDisplay();
    if (trainingTimerRemaining <= 0) {
      window.clearInterval(trainingTimerId);
      trainingTimerId = null;
      trainingTimerElapsed = true;
      trainingTimerPhase = "complete";
      updateTrainingTimerDisplay();
      if ("vibrate" in navigator) navigator.vibrate([15, 35, 15]);
      window.clearTimeout(trainingAutoAdvanceId);
      trainingAutoAdvanceId = window.setTimeout(() => {
        if (state.training?.started && !state.training?.completed && trainingTimerElapsed) {
          advanceTrainingStep(false);
        }
      }, 1100);
    }
  }

  function updateTrainingTimerDisplay() {
    const display = $("training-timer-display");
    const status = $("training-timer-status");
    const completeButton = $("complete-training-step");
    const countdownScreen = $("training-countdown-screen");
    const countdownDisplay = $("training-countdown-display");
    if (trainingTimerPhase === "countdown") {
      const countdownText = trainingCountdownValue > 0 ? String(trainingCountdownValue) : "GO !";
      if (countdownScreen) countdownScreen.classList.remove("hidden");
      if (countdownDisplay) countdownDisplay.textContent = countdownText;
      if (display) {
        display.textContent = countdownText;
        display.classList.add("training-countdown-display");
      }
      if (status) status.textContent = trainingCountdownValue > 0 ? "Prépare-toi." : "C'est parti.";
      if (completeButton) completeButton.textContent = "Terminé";
      return;
    }
    if (countdownScreen) countdownScreen.classList.add("hidden");
    if (trainingTimerPhase === "idle") {
      if (display) display.classList.remove("training-countdown-display");
      if (status) status.textContent = "";
      if (completeButton) completeButton.textContent = "Terminé";
      return;
    }
    const remaining = Math.max(0, trainingTimerRemaining);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    if (display) {
      display.classList.remove("training-countdown-display");
      display.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    if (status) status.textContent = trainingTimerElapsed ? "✓ Exercice terminé" : "Temps restant :";
    if (completeButton) completeButton.textContent = trainingTimerElapsed ? "Étape suivante" : "Terminé";
  }

  function stopTrainingTimer() {
    window.clearInterval(trainingTimerId);
    window.clearTimeout(trainingAutoAdvanceId);
    trainingTimerId = null;
    trainingAutoAdvanceId = null;
    trainingTimerStepKey = "";
    trainingTimerRemaining = 0;
    trainingTimerElapsed = false;
    trainingTimerPhase = "idle";
    trainingCountdownValue = 3;
    $("training-timer-display")?.classList.remove("training-countdown-display");
    $("training-countdown-screen")?.classList.add("hidden");
    const completeButton = $("complete-training-step");
    if (completeButton) completeButton.textContent = "Terminé";
  }

  function scrollToTrainingActiveStep() {
    const activeStep = $("training-active-step");
    if (!activeStep || activeStep.classList.contains("hidden")) return;
    window.requestAnimationFrame(() => {
      const rect = activeStep.getBoundingClientRect();
      const targetTop = Math.max(0, window.scrollY + rect.top - 12);
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: targetTop, behavior: reducedMotion ? "auto" : "smooth" });
      activeStep.focus({ preventScroll: true });
    });
  }

  function renderTrainingCustomList(list) {
    const customSteps = Array.isArray(state.training?.customSteps) ? state.training.customSteps : [];
    list.replaceChildren(...customSteps.map((step, index) => {
      const item = document.createElement("li");
      const text = document.createElement("div");
      const label = document.createElement("strong");
      label.textContent = step.label;
      const amount = document.createElement("span");
      amount.textContent = step.amount;
      text.append(label, amount);

      const actions = document.createElement("div");
      actions.className = "training-custom-actions";
      const up = document.createElement("button");
      up.type = "button";
      up.textContent = "↑";
      up.setAttribute("aria-label", `Monter ${step.label}`);
      up.disabled = index === 0 || state.training?.started;
      up.addEventListener("click", () => moveTrainingExercise(index, -1));
      const down = document.createElement("button");
      down.type = "button";
      down.textContent = "↓";
      down.setAttribute("aria-label", `Descendre ${step.label}`);
      down.disabled = index === customSteps.length - 1 || state.training?.started;
      down.addEventListener("click", () => moveTrainingExercise(index, 1));
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Retirer";
      remove.disabled = state.training?.started;
      remove.addEventListener("click", () => removeTrainingExercise(index));
      actions.append(up, down, remove);

      item.append(text, actions);
      return item;
    }));
  }

  function setTrainingMode(mode) {
    if (!["quick", "custom"].includes(mode)) return;
    stopTrainingTimer();
    state.training = { ...(state.training || defaultState.training), mode, paneOpen: mode === "custom" ? true : Boolean(state.training?.paneOpen), started: false, currentStep: 0, completed: false, skippedSteps: 0, lastReward: 0 };
    saveState();
    renderTrainingProgram();
  }

  function setTrainingType(type) {
    if (!trainingPrograms[type]) return;
    stopTrainingTimer();
    state.training = { ...(state.training || defaultState.training), type, paneOpen: true, started: false, currentStep: 0, completed: false, skippedSteps: 0, lastReward: 0 };
    saveState();
    renderTrainingProgram();
  }

  function chooseTrainingType(type) {
    setTrainingMode("quick");
    setTrainingType(type);
    $("training-quick-builder")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setTrainingLevel(level) {
    const type = trainingPrograms[state.training?.type] ? state.training.type : defaultState.training.type;
    if (!trainingPrograms[type]?.[level]) return;
    stopTrainingTimer();
    state.training = { ...(state.training || defaultState.training), level, paneOpen: true, started: false, currentStep: 0, completed: false, skippedSteps: 0, lastReward: 0 };
    saveState();
    renderTrainingProgram();
  }

  function startTrainingSession() {
    const { program } = currentTrainingProgram();
    if (!program.steps.length) {
      showToast("Ajoute au moins un exercice.");
      return;
    }
    clearMaisonRuntimeState("démarrage entraînement");
    debugActivityLog("démarrage activité", { type: "training", mode: state.training?.mode, level: state.training?.level });
    state.training = { ...(state.training || defaultState.training), paneOpen: true, started: true, currentStep: 0, completed: false, skippedSteps: 0, lastReward: 0 };
    saveState();
    renderTrainingProgram();
    renderGoalQueue();
    renderChallengeTimer();
    scrollToTrainingActiveStep();
    showToast("Séance commencée. Une étape à la fois.");
  }

  function startQuickTrainingSession() {
    setTrainingMode("quick");
    setTrainingType("cardio");
    setTrainingLevel("beginner");
    startTrainingSession();
  }

  function backToTrainingOverview() {
    stopTrainingTimer();
    state.training = { ...(state.training || defaultState.training), mode: "quick", paneOpen: false, started: false, currentStep: 0, completed: false, skippedSteps: 0, lastReward: 0 };
    saveState();
    renderTrainingProgram();
    $("training-overview")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetTrainingSession() {
    stopTrainingTimer();
    state.training = { ...(state.training || defaultState.training), paneOpen: Boolean(state.training?.paneOpen), started: false, currentStep: 0, completed: false, skippedSteps: 0, lastReward: 0 };
    saveState();
    renderTrainingProgram();
    $("domain-training")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function stopTrainingSession() {
    if (!state.training?.started) return;
    debugActivityLog("arrêt activité", { type: "training" });
    clearTrainingRuntimeState("arrêt entraînement");
    saveState();
    renderTrainingProgram();
    showToast("Séance arrêtée.");
  }

  function completeTrainingStep() {
    advanceTrainingStep(false);
  }

  function skipTrainingStep() {
    advanceTrainingStep(true);
  }

  function advanceTrainingStep(skipped) {
    if (!state.training?.started || state.training.completed) return;
    stopTrainingTimer();
    const { program } = currentTrainingProgram();
    const currentStepIndex = Math.min(Math.max(state.training.currentStep || 0, 0), program.steps.length - 1);
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < program.steps.length) {
      state.training = { ...state.training, currentStep: nextStepIndex, skippedSteps: (state.training.skippedSteps || 0) + (skipped ? 1 : 0) };
      saveState();
      renderTrainingProgram();
      scrollToTrainingActiveStep();
      showToast(skipped ? `Exercice passé. ${nextStepIndex + 1}/${program.steps.length}` : `Exercice ${nextStepIndex + 1}/${program.steps.length}`);
      return;
    }
    if (skipped) {
      state.training = { ...state.training, skippedSteps: (state.training.skippedSteps || 0) + 1 };
    }
    finishTrainingSession();
  }

  function finishTrainingSession() {
    const { program, label: programLabel } = currentTrainingProgram();
    stopTrainingTimer();
    const reward = trainingRewardForCurrentSession();
    debugActivityLog("fin activité", { type: "training", reward });
    state.training = { ...state.training, started: false, currentStep: program.steps.length - 1, completed: true, lastReward: reward };
    state.wins += 1;
    state.coins += reward;
    state.history = [{
      label: `Séance Entraînement : ${programLabel}`,
      coins: reward,
      at: Date.now(),
      domain: "training"
    }, ...state.history].slice(0, 50);
    saveState();
    renderTrainingProgram();
    renderShop();
    renderHistoryList();
    window.requestAnimationFrame(() => $("training-complete-panel")?.focus({ preventScroll: true }));
    showSuccessToast(`Séance terminée. +${reward} jetons gagnés`);
  }

  function addTrainingExercise() {
    const nameInput = $("training-custom-name");
    const amountInput = $("training-custom-amount");
    const label = nameInput?.value.trim() || "";
    const amount = amountInput?.value.trim() || "";
    if (!label || !amount) {
      showToast("Ajoute un nom et une quantité.");
      return;
    }
    const customSteps = Array.isArray(state.training?.customSteps) ? state.training.customSteps : [];
    state.training = {
      ...(state.training || defaultState.training),
      mode: "custom",
      started: false,
      currentStep: 0,
      completed: false,
      skippedSteps: 0,
      lastReward: 0,
      customSteps: [...customSteps, { label, amount }].slice(0, 12)
    };
    if (nameInput) nameInput.value = "";
    if (amountInput) amountInput.value = "";
    saveState();
    renderTrainingProgram();
    nameInput?.focus();
  }

  function removeTrainingExercise(index) {
    const customSteps = Array.isArray(state.training?.customSteps) ? state.training.customSteps : [];
    state.training = { ...(state.training || defaultState.training), customSteps: customSteps.filter((_, itemIndex) => itemIndex !== index), started: false, currentStep: 0, completed: false, skippedSteps: 0, lastReward: 0 };
    saveState();
    renderTrainingProgram();
  }

  function moveTrainingExercise(index, direction) {
    const customSteps = Array.isArray(state.training?.customSteps) ? [...state.training.customSteps] : [];
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= customSteps.length) return;
    const [item] = customSteps.splice(index, 1);
    customSteps.splice(nextIndex, 0, item);
    state.training = { ...(state.training || defaultState.training), customSteps, started: false, currentStep: 0, completed: false, skippedSteps: 0, lastReward: 0 };
    saveState();
    renderTrainingProgram();
  }

  function selectHomeDomain(domain) {
    if (!homeDomains[domain]) return;
    if (domain === "mental") {
      showEmergencyAction(false);
      return;
    }
    state.currentHomeDomain = domain;
    state.selectedDomain = domain;
    saveState();
    renderHomeSuggestion();
    renderSelectedDomain();
    // Basculer en mode "domaine actif" : masque le hero et la grille
    const homeView = $("view-home");
    if (homeView) homeView.classList.add("domain-selected");
    // Scroll vers le haut pour que la carte missions soit visible immédiatement
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function renderSelectedDomain() {
    const card = $("selected-domain-card");
    if (!card) return;
    const domain = state.currentHomeDomain;
    const detail = homeDomains[domain];
    if (!detail) {
      card.classList.add("hidden");
      $("view-home")?.classList.remove("domain-selected");
      return;
    }
    card.classList.remove("hidden");
    $("selected-domain-title").textContent = detail.title;
    $("selected-domain-subtitle").textContent = detail.subtitle;

    const isQueueActive = Boolean(state.goalQueue?.active);
    const currentItem = isQueueActive ? currentQueueItem() : null;

    // Étiquette "Mission en cours" si série active
    let activeMissionLabel = card.querySelector(".active-mission-label");
    if (isQueueActive && currentItem) {
      if (!activeMissionLabel) {
        activeMissionLabel = document.createElement("p");
        activeMissionLabel.className = "active-mission-label";
        card.querySelector(".card-header").after(activeMissionLabel);
      }
      activeMissionLabel.textContent = "🎯 En cours";
      card.classList.add("has-active-goal");
    } else {
      activeMissionLabel?.remove();
      card.classList.remove("has-active-goal");
    }

    const customGoals = (state.customGoals[domain] || []).map((label) => ({ label }));
    const allMissions = [...detail.missions, ...customGoals];
    const queued = queuedItems();
    const queuedLabels = new Set(queued.map((i) => i.label));

    // ── Section "Objectifs sélectionnés" ──
    const selectedSection = $("selected-section");
    const missionsList = $("selected-domain-missions");
    if (missionsList) {
      if (queued.length > 0) {
        selectedSection?.classList.remove("hidden");
        missionsList.replaceChildren(...queued.map((item) => {
          const btn = document.createElement("button");
          btn.type = "button";
          const isActiveNow = isQueueActive && currentItem?.label === item.label && currentItem?.domain === domain;
          const isCompleted = item.completed;
          if (isActiveNow) {
            btn.className = "mission-active";
            btn.textContent = `🎯 ${item.label}`;
          } else if (isCompleted) {
            btn.className = "mission-done";
            btn.textContent = `✓ ${item.label}`;
          } else {
            btn.className = "selected-missions-list";
            btn.textContent = item.label;
          }
          btn.setAttribute("aria-pressed", "true");
          btn.addEventListener("click", () => {
            if (!isCompleted && !isQueueActive) {
              toggleGoalSelection(item.label, domain);
            }
          });
          return btn;
        }));
      } else {
        selectedSection?.classList.add("hidden");
        missionsList.replaceChildren();
      }
    }

    // ── Section "Suggestions" ──
    const suggestionsList = $("domain-suggestions");
    const suggestionsLabel = $("suggestions-label");
    const suggestionsEmptyState = $("suggestions-empty-state");
    if (suggestionsList) {
      const available = allMissions.filter((m) => !queuedLabels.has(m.label));
      if (suggestionsLabel) {
        suggestionsLabel.textContent = queued.length > 0 ? "💡 Autres suggestions" : "💡 Suggestions";
      }
      if (available.length === 0) {
        suggestionsList.replaceChildren();
        if (suggestionsEmptyState) {
          suggestionsEmptyState.classList.remove("hidden");
        }
      } else {
        if (suggestionsEmptyState) {
          suggestionsEmptyState.classList.add("hidden");
        }
        suggestionsList.replaceChildren(...available.map((mission) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "suggestion-btn";
          btn.textContent = mission.label;
          btn.setAttribute("aria-label", `Ajouter : ${mission.label}`);
          btn.addEventListener("click", () => {
            state.selectedDomain = domain;
            saveState();
            toggleGoalSelection(mission.label, domain);
          });
          return btn;
        }));
      }
    }

    // ── Panneau complétion ──
    const completedInQueue = isQueueActive
      ? queuedItems().filter((i) => i.domain === domain && i.completed).map((i) => i.label)
      : [];
    const visibleCount = allMissions.length;
    const allDone = isQueueActive && completedInQueue.length >= queued.length && queued.length > 0;
    const completedPanel = $("domain-completed-panel");
    const addGoalBtn = $("add-selected-goal");
    const inlineSelection = $("goal-selection-inline");
    const suggestionsSection = $("suggestions-section");

    if (allDone && completedPanel) {
      const msg = $("domain-completed-msg");
      if (msg) msg.textContent = `Bravo, ${detail.title.toLowerCase()} complété pour maintenant.`;
      completedPanel.classList.remove("hidden");
      selectedSection?.classList.add("hidden");
      suggestionsSection?.classList.add("hidden");
      if (addGoalBtn) addGoalBtn.classList.add("hidden");
      if (inlineSelection) inlineSelection.classList.add("hidden");
    } else if (completedPanel) {
      completedPanel.classList.add("hidden");
      suggestionsSection?.classList.remove("hidden");
      if (addGoalBtn) addGoalBtn.classList.remove("hidden");
    }

    $("add-selected-goal").dataset.addGoal = domain;
    card.classList.remove("hidden");
    const homeView = $("view-home");
    if (homeView) homeView.classList.add("domain-selected");
    card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function rotateMissions(missions, key, limit) {
    if (missions.length <= limit) return missions;
    const daySeed = Math.floor(Date.now() / 86400000);
    const progressSeed = state.progress[key] || 0;
    const start = (daySeed + progressSeed + key.length) % missions.length;
    const rotated = [...missions.slice(start), ...missions.slice(0, start)];
    return rotated.slice(0, limit);
  }

  function closeSelectedDomain() {
    state.currentHomeDomain = "";
    state.selectedDomain = "";
    saveState();
    $("selected-domain-card")?.classList.add("hidden");
    $("domain-completed-panel")?.classList.add("hidden");
    const homeView = $("view-home");
    if (homeView) homeView.classList.remove("domain-selected");
    showView("home");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function restartDomain() {
    const domain = state.currentHomeDomain;
    if (!domain) return;
    // Réinitialiser la progression du domaine et la file
    clearMaisonRuntimeState("réinitialisation domaine");
    state.progress[domain] = 0;
    saveState();
    renderSelectedDomain();
    renderDomainProgress();
    showToast("Domaine réinitialisé. À toi !");
  }

  function goalKey(label, domain) {
    return `${domain || "general"}::${label}`;
  }

  function queuedItems() {
    const queue = state.goalQueue || { items: [], active: false, currentIndex: 0 };
    return Array.isArray(queue.items) ? queue.items : [];
  }

  function currentQueueItem() {
    const items = queuedItems();
    return items[state.goalQueue?.currentIndex || 0] || null;
  }

  function isGoalQueued(label, domain) {
    return queuedItems().some((item) => goalKey(item.label, item.domain) === goalKey(label, domain));
  }

  function toggleGoalSelection(label, domain = state.selectedDomain || state.currentHomeDomain || "") {
    if (!label) return;
    if (state.goalQueue?.active) {
      showToast("La série est déjà en cours.");
      renderGoalQueue();
      return;
    }
    const key = goalKey(label, domain);
    const items = queuedItems();
    const exists = items.some((item) => goalKey(item.label, item.domain) === key);
    state.goalQueue = {
      active: false,
      currentIndex: 0,
      items: exists
        ? items.filter((item) => goalKey(item.label, item.domain) !== key)
        : [...items, { label, domain, completed: false }]
    };
    state.selectedDomain = domain || state.selectedDomain;
    saveState();
    renderGoalQueue();
    renderSelectedDomain();
    showToast(exists ? "Objectif retiré." : "Objectif ajouté à la série.");
  }

  function startHouseSeries(mission) {
    const item = typeof mission === "string"
      ? { label: mission, domain: state.selectedDomain || state.currentHomeDomain || "house", completed: false }
      : { label: mission?.label, domain: mission?.domain || state.selectedDomain || state.currentHomeDomain || "house", completed: false };
    if (!item.label) return;
    sanitizePersistedActivityState("avant démarrage mission maison");
    if (state.activeChallenge) {
      showToast("La série est déjà en cours.");
      renderGoalQueue();
      renderChallengeTimer();
      return;
    }
    clearTrainingRuntimeState("démarrage mission maison");
    debugActivityLog("démarrage activité", { type: "maison", count: 1, label: item.label });
    state.selectedDomain = item.domain;
    state.currentHomeDomain = item.domain;
    state.goalQueue = { items: [item], active: true, currentIndex: 0 };
    saveState();
    renderGoalQueue();
    renderSelectedDomain();
    launchCurrentQueueGoal(item, { autoStart: true });
  }

  function removeQueuedGoal(index) {
    if (state.goalQueue?.active) return;
    state.goalQueue.items = queuedItems().filter((_, itemIndex) => itemIndex !== index);
    saveState();
    renderGoalQueue();
    renderSelectedDomain();
  }

  function startGoalQueue() {
    sanitizePersistedActivityState("avant démarrage série");
    const items = queuedItems();
    if (!items.length || state.activeChallenge) return;
    clearTrainingRuntimeState("démarrage série maison");
    debugActivityLog("démarrage activité", { type: "maison", count: items.length });
    state.goalQueue = { items, active: true, currentIndex: 0 };
    saveState();
    renderGoalQueue();
    launchCurrentQueueGoal();
  }

  function launchCurrentQueueGoal(itemOverride = null, options = {}) {
    const item = itemOverride || currentQueueItem();
    if (!state.goalQueue?.active || !item) return;
    openChallengeSetup(item.label, item.domain, { fromQueue: true });
    if (options.autoStart) {
      startChallenge();
    }
    showToast(`Étape ${state.goalQueue.currentIndex + 1} / ${queuedItems().length} : ${item.label}`);
  }

  function completeQueueGoal() {
    if (!state.goalQueue?.active) return false;
    const items = queuedItems();
    const currentIndex = state.goalQueue.currentIndex || 0;
    if (!items[currentIndex]) return false;
    items[currentIndex] = { ...items[currentIndex], completed: true };
    const nextIndex = currentIndex + 1;
    if (nextIndex >= items.length) {
      // Vider l'état domaine AVANT le render pour éviter que renderSelectedDomain
      // réaffiche la carte missions par-dessus le retour à l'accueil
      debugActivityLog("fin activité", { type: "maison", count: items.length });
      clearMaisonRuntimeState("fin série maison");
      state.goalQueue = { items: [], active: false, currentIndex: 0 };
      state.currentHomeDomain = "";
      state.selectedDomain = "";
      saveState();
      // Masquer la carte missions et retirer la classe domain-selected immédiatement
      $("selected-domain-card")?.classList.add("hidden");
      $("domain-completed-panel")?.classList.add("hidden");
      $("view-home")?.classList.remove("domain-selected");
      renderGoalQueue();
      // Toast puis retour à l'accueil
      showSuccessToast("Bravo, domaine complété. ✓");
      showView("home");
      window.scrollTo({ top: 0, behavior: "instant" });
      showSeriesComplete(items.length, items.length * COINS_PER_TASK);
      return true;
    }
    state.goalQueue = { items, active: true, currentIndex: nextIndex };
    saveState();
    renderGoalQueue();
    const next = items[nextIndex];
    showToast(`Bravo. Prochaine étape : ${next.label}.`);
    window.setTimeout(() => {
      if (!state.activeChallenge && state.goalQueue?.active) launchCurrentQueueGoal();
    }, 900);
    return true;
  }

  function skipQueueGoal() {
    if (!state.goalQueue?.active || state.activeChallenge) return;
    const items = queuedItems();
    const nextIndex = (state.goalQueue.currentIndex || 0) + 1;
    if (nextIndex >= items.length) {
      stopGoalQueue("Correct. Série arrêtée.");
      return;
    }
    state.goalQueue.currentIndex = nextIndex;
    saveState();
    renderGoalQueue();
    launchCurrentQueueGoal();
  }

  function stopGoalQueue(message = "Correct. Tu peux reprendre plus tard.") {
    debugActivityLog("arrêt activité", { type: "maison" });
    clearMaisonRuntimeState("arrêt série maison");
    saveState();
    renderGoalQueue();
    renderChallengeTimer();
    renderSelectedDomain();
    showToast(message);
  }

  function showSeriesComplete(missionCount, totalCoins) {
    const overlay = $("series-complete-overlay");
    if (!overlay) return;
    const summary = $("series-complete-summary");
    const coinsEl = $("series-complete-coins");
    if (summary) {
      summary.textContent = "Activité terminée.";
    }
    if (coinsEl) {
      coinsEl.textContent = totalCoins > 0 ? `+${totalCoins} pièces gagnées` : "";
      coinsEl.classList.toggle("hidden", totalCoins <= 0);
    }
    overlay.classList.remove("hidden");
    if ("vibrate" in navigator) navigator.vibrate([20, 60, 20]);
  }

  function closeSeriesComplete() {
    $("series-complete-overlay")?.classList.add("hidden");
  }

  function continueAfterSeriesComplete() {
    closeSeriesComplete();
    clearMaisonRuntimeState("continuer après maison");
    saveState();
    renderGoalQueue();
    renderChallengeTimer();
    selectHomeDomain("house");
  }

  function openShopAfterSeriesComplete() {
    closeSeriesComplete();
    clearMaisonRuntimeState("boutique après maison");
    saveState();
    renderGoalQueue();
    renderChallengeTimer();
    showView("shop");
  }

  function finishAfterSeriesComplete() {
    closeSeriesComplete();
    clearMaisonRuntimeState("terminer après maison");
    state.currentHomeDomain = "";
    state.selectedDomain = "";
    saveState();
    renderSelectedDomain();
    renderGoalQueue();
    renderChallengeTimer();
    showView("home");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function continueAfterTrainingComplete() {
    $("training-complete-panel")?.classList.add("hidden");
    state.training = {
      ...(state.training || defaultState.training),
      paneOpen: false,
      started: false,
      completed: false,
      currentStep: 0,
      skippedSteps: 0,
      lastReward: 0
    };
    saveState();
    renderTrainingProgram();
    document.querySelectorAll(".domain-panel").forEach((panel) => {
      panel.classList.toggle("hidden", panel.id !== "domain-training");
    });
    showView("domains");
    $("domain-training")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openShopAfterTrainingComplete() {
    $("training-complete-panel")?.classList.add("hidden");
    state.training = {
      ...(state.training || defaultState.training),
      mode: "quick",
      paneOpen: false,
      started: false,
      completed: false,
      currentStep: 0,
      skippedSteps: 0,
      lastReward: 0
    };
    saveState();
    renderTrainingProgram();
    showView("shop");
  }

  function finishAfterTrainingComplete() {
    $("training-complete-panel")?.classList.add("hidden");
    state.training = {
      ...(state.training || defaultState.training),
      paneOpen: false,
      started: false,
      completed: false,
      currentStep: 0,
      skippedSteps: 0,
      lastReward: 0
    };
    saveState();
    renderTrainingProgram();
    closeDomain();
    showView("domains");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function goalSelectionSummary(count) {
    if (!count) return "";
    return `${count} objectif${count > 1 ? "s" : ""} sélectionné${count > 1 ? "s" : ""}`;
  }

  function isSelectedDomainVisible() {
    const card = $("selected-domain-card");
    return Boolean(card && !card.classList.contains("hidden"));
  }

  function shouldShowChallengePanel() {
    if (!state.activeChallenge) return false;
    const items = queuedItems();
    if (items.length && !state.goalQueue?.active) return false;
    return true;
  }

  function updateFixedBarMetrics() {
    const root = document.documentElement;
    const bottomNav = document.querySelector(".bottom-nav");
    const selectionDock = $("goal-selection-dock");
    const activeBar = $("goal-queue-active-bar");
    if (bottomNav) root.style.setProperty("--bottom-nav-height", `${Math.ceil(bottomNav.offsetHeight)}px`);
    if (selectionDock) root.style.setProperty("--goal-selection-dock-height", `${Math.ceil(selectionDock.offsetHeight)}px`);
    if (activeBar) root.style.setProperty("--goal-active-bar-height", `${Math.ceil(activeBar.offsetHeight)}px`);
  }

  function ensureGoalSelectionClearance() {
    const dock = $("goal-selection-dock");
    if (!dock || dock.classList.contains("hidden")) return;
    const visiblePanel = Array.from(document.querySelectorAll(".domain-panel:not(.hidden)")).at(-1);
    if (!visiblePanel) return;
    const dockTop = dock.getBoundingClientRect().top;
    const panelBottom = visiblePanel.getBoundingClientRect().bottom;
    const overlap = panelBottom - dockTop + 12;
    if (overlap > 0) window.scrollBy({ top: overlap, behavior: "smooth" });
  }

  function placeActiveGoalBar(activeBar, showActiveBar) {
    if (!activeBar) return;
    if (!showActiveBar) {
      document.body.append(activeBar);
      return;
    }
    const host = Array.from(document.querySelectorAll(".domain-panel:not(.hidden)")).at(-1)
      || $("selected-domain-card")
      || document.querySelector("main");
    if (!host) return;
    const taskList = host.querySelector(".task-list");
    if (taskList) {
      taskList.parentElement?.insertBefore(activeBar, taskList);
    } else {
      host.append(activeBar);
    }
  }

  function renderGoalQueue() {
    const items = queuedItems();
    const isActive = Boolean(state.goalQueue?.active);
    const count = items.length;
    const summaryText = goalSelectionSummary(count);

    const showInlineSelection = count > 0 && !isActive && isSelectedDomainVisible();
    const showDockSelection = count > 0 && !isActive && !showInlineSelection;

    document.body.classList.toggle("goal-selecting-dock", showDockSelection);
    document.body.classList.toggle("goal-series-active", count > 0 && isActive);

    const inline = $("goal-selection-inline");
    const inlineSummary = $("goal-selection-inline-summary");
    const inlineStart = $("start-goal-queue-inline");
    const dock = $("goal-selection-dock");
    const dockSummary = $("goal-selection-dock-summary");
    const dockStart = $("start-goal-queue");

    if (inline) inline.classList.toggle("hidden", !showInlineSelection);
    if (dock) dock.classList.toggle("hidden", !showDockSelection);
    if (inlineSummary) inlineSummary.textContent = summaryText;
    if (dockSummary) dockSummary.textContent = summaryText;
    if (inlineStart) inlineStart.disabled = count === 0;
    if (dockStart) dockStart.disabled = count === 0;

    const activeBar = $("goal-queue-active-bar");
    const activeStep = $("goal-queue-active-step");
    const activeLabel = $("goal-queue-active-label");
    const skipButton = $("skip-goal");
    const progressFill = $("goal-queue-progress-fill");
    const showActiveBar = isActive && count > 0;

    placeActiveGoalBar(activeBar, showActiveBar);
    if (activeBar) activeBar.classList.toggle("hidden", !showActiveBar);
    if (showActiveBar) {
      const currentIndex = state.goalQueue.currentIndex || 0;
      const current = items[currentIndex];
      if (activeStep) activeStep.textContent = `${currentIndex + 1} / ${count}`;
      if (activeLabel) activeLabel.textContent = current?.label || "";
      if (skipButton) skipButton.classList.toggle("hidden", Boolean(state.activeChallenge));
      // Barre de progression
      if (progressFill) {
        const pct = count > 1 ? Math.round((currentIndex / (count - 1)) * 100) : 100;
        progressFill.style.width = `${pct}%`;
      }
    }

    updateGoalSelectionButtons();
    updateFixedBarMetrics();
    window.requestAnimationFrame(ensureGoalSelectionClearance);
    renderChallengeTimer();
  }

  function updateGoalSelectionButtons() {
    document.querySelectorAll("[data-complete]").forEach((button) => {
      const domainPanel = button.closest(".domain-panel");
      const domain = button.dataset.goalDomain || button.dataset.homeTask || domainPanel?.id?.replace("domain-", "") || state.selectedDomain;
      const selected = isGoalQueued(button.dataset.complete, domain);
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    document.querySelectorAll("#selected-domain-missions button").forEach((button) => {
      const selected = button.classList.contains("selected");
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  function openChallengeSetup(label, domain = state.selectedDomain || state.currentHomeDomain || "", options = {}) {
    if (!label) return;
    if (state.activeChallenge && !state.activeChallenge.rewardedAt) {
      showToast("Un défi est déjà en cours.");
      renderChallengeTimer();
      return;
    }
    state.selectedDomain = domain || state.selectedDomain;
    state.activeChallenge = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      label,
      domain: state.selectedDomain,
      durationMinutes: 8,
      durationMs: 8 * 60000,
      startedAt: null,
      endsAt: null,
      status: "setup",
      fromQueue: Boolean(options.fromQueue),
      rewardedAt: null
    };
    saveState();
    renderChallengeTimer();
    if (shouldShowChallengePanel()) {
      $("challenge-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function setChallengeDuration(minutes) {
    const duration = Number(minutes);
    if (!state.activeChallenge || !Number.isFinite(duration)) return;
    state.activeChallenge.durationMinutes = duration;
    state.activeChallenge.durationMs = duration * 60000;
    saveState();
    renderChallengeTimer();
  }

  function startChallenge() {
    const challenge = state.activeChallenge;
    if (!challenge || challenge.status !== "setup") return;
    window.clearInterval(challengeCountdownId);
    playStartTone();
    const now = Date.now();
    let count = 3;
    state.activeChallenge = {
      ...challenge,
      startedAt: now,
      endsAt: now + challenge.durationMs,
      status: "countdown"
    };
    saveState();
    renderChallengeTimer(count);
    challengeCountdownId = window.setInterval(() => {
      count -= 1;
      if (count <= 0) {
        window.clearInterval(challengeCountdownId);
        state.activeChallenge = {
          ...state.activeChallenge,
          status: "running"
        };
        saveState();
        startChallengeTicker();
        renderChallengeTimer();
        showToast("GO. Une chose à la fois.");
        return;
      }
      renderChallengeTimer(count);
    }, 700);
  }

  function cancelChallenge() {
    if (!state.activeChallenge) return;
    const challenge = state.activeChallenge;
    debugActivityLog("arrêt activité", { type: "mission", status: challenge.status, fromQueue: challenge.fromQueue });
    if (challenge.fromQueue) {
      clearMaisonRuntimeState("annulation mission maison");
    } else {
      window.clearInterval(challengeCountdownId);
      window.clearInterval(challengeTimerId);
      challengeCountdownId = null;
      challengeTimerId = null;
      state.activeChallenge = null;
    }
    saveState();
    renderChallengeTimer();
    renderGoalQueue();
  }

  function startChallengeTicker() {
    window.clearInterval(challengeTimerId);
    challengeTimerId = window.setInterval(updateChallengeTime, 1000);
    updateChallengeTime();
  }

  function resumeChallengeTimer() {
    if (state.activeChallenge?.status === "countdown") {
      state.activeChallenge.status = "running";
      saveState();
    }
    if (state.activeChallenge?.status === "running") startChallengeTicker();
  }

  function updateChallengeTime() {
    const challenge = state.activeChallenge;
    if (!challenge) {
      window.clearInterval(challengeTimerId);
      return;
    }
    if (challenge.status === "running" && Date.now() >= challenge.endsAt) {
      state.activeChallenge.status = "done";
      window.clearInterval(challengeTimerId);
      saveState();
      notifyChallengeDone();
    }
    renderChallengeTimer();
  }

  function notifyChallengeDone() {
    if ("vibrate" in navigator) navigator.vibrate([25, 40, 25]);
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Défi terminé", { body: "Belle présence. Tu peux valider quand c'est fait." });
    }
    showToast("Défi terminé. Tu as tenu le cap.");
  }

  function completeActiveChallenge() {
    const challenge = state.activeChallenge;
    if (!challenge || !["running", "done"].includes(challenge.status) || challenge.rewardedAt || isCompletingChallenge) return;
    isCompletingChallenge = true;
    debugActivityLog("fin activité", { type: "mission", label: challenge.label, fromQueue: challenge.fromQueue });
    const button = $("finish-challenge");
    if (button) button.disabled = true;
    window.clearInterval(challengeCountdownId);
    window.clearInterval(challengeTimerId);
    challengeCountdownId = null;
    challengeTimerId = null;
    const remainingMs = Math.max(0, (challenge.endsAt || Date.now()) - Date.now());
    const successMessage = remainingMs > 0
      ? `Bravo ! Tu as terminé avec encore ${formatRemainingText(remainingMs)}.`
      : "Bravo ! Défi terminé avec calme.";
    state.activeChallenge.rewardedAt = Date.now();
    state.activeChallenge.status = "completed";
    state.selectedDomain = challenge.domain;
    saveState();
    completeTask(challenge.label, successMessage);
    state.activeChallenge = null;
    isCompletingChallenge = false;
    saveState();
    renderChallengeTimer();
    renderGoalQueue();
    if (challenge.fromQueue) completeQueueGoal();
  }

  function formatRemaining(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function formatRemainingText(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes && seconds) return `${minutes} min ${seconds} s`;
    if (minutes) return `${minutes} min`;
    return `${seconds} seconde${seconds > 1 ? "s" : ""}`;
  }

  function renderChallengeTimer(countdownValue = null) {
    const panel = $("challenge-panel");
    const title = $("challenge-title");
    const durationGroup = $("challenge-durations");
    const readyButton = $("start-challenge");
    const cancelButton = $("cancel-challenge");
    const finishButton = $("finish-challenge");
    const time = $("challenge-time");
    const progress = $("challenge-progress");
    const message = $("challenge-message");
    const challenge = state.activeChallenge;

    const challengeVisible = Boolean(panel && challenge && shouldShowChallengePanel());
    document.body.classList.toggle("challenge-open", challengeVisible);

    if (!challengeVisible) {
      panel?.classList.add("hidden");
      updateFixedBarMetrics();
      return;
    }

    panel.classList.remove("hidden");
    panel.dataset.status = challenge.status;
    if (title) title.textContent = challenge.label;
    if (durationGroup) {
      durationGroup.classList.toggle("hidden", challenge.status !== "setup");
      durationGroup.replaceChildren(...CHALLENGE_DURATIONS.map((duration) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = `${duration} min`;
        button.className = duration === challenge.durationMinutes ? "selected" : "";
        button.addEventListener("click", () => setChallengeDuration(duration));
        return button;
      }));
    }

    const remaining = challenge.endsAt ? challenge.endsAt - Date.now() : challenge.durationMs;
    const ratio = challenge.status === "running" || challenge.status === "done"
      ? Math.max(0, Math.min(1, remaining / challenge.durationMs))
      : 1;
    if (progress) progress.style.setProperty("--progress", `${ratio * 360}deg`);
    if (time) {
      time.textContent = countdownValue
        ? (countdownValue > 0 ? String(countdownValue) : "GO")
        : formatRemaining(remaining);
    }
    if (message) {
      message.textContent = challenge.status === "setup"
        ? "Choisis ta durée, puis démarre doucement."
        : challenge.status === "countdown"
          ? "On y va."
          : challenge.status === "done"
            ? "Réussi. Respire, puis valide ton défi."
            : "Reste avec cette action. C'est suffisant.";
    }
    if (readyButton) readyButton.classList.toggle("hidden", challenge.status !== "setup");
    if (cancelButton) cancelButton.classList.toggle("hidden", challenge.status === "done");
    if (finishButton) {
      finishButton.classList.toggle("hidden", !["running", "done"].includes(challenge.status));
      finishButton.disabled = Boolean(challenge.rewardedAt) || isCompletingChallenge;
    }
    updateFixedBarMetrics();
  }

  function playStartTone() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 540;
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.05, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.16);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.18);
      window.setTimeout(() => context.close(), 300);
    } catch (error) {
      // Le son est bonus; le défi démarre même si le navigateur bloque l'audio.
    }
  }

  function renderHomeSuggestion() {
    const button = $("next-action");
    if (!button) return;
    button.textContent = "Urgence mentale";
    button.classList.remove("hidden");
  }

  function showEmergencyAction(next = false) {
    if (next) {
      emergencyIndex = (emergencyIndex + 1) % emergencyActions.length;
    } else {
      emergencyIndex = (Math.floor(Date.now() / 3600000) + (state.progress.mental || 0)) % emergencyActions.length;
    }
    state.selectedDomain = "mental";
    saveState();
    $("emergency-action").textContent = emergencyActions[emergencyIndex];
    $("emergency-card").classList.remove("hidden");
    $("emergency-card").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function completeEmergencyAction() {
    openChallengeSetup(emergencyActions[emergencyIndex], "mental");
    $("emergency-card")?.classList.add("hidden");
  }

  function completeTask(label, successMessage = "") {
    state.wins += 1;
    state.coins += COINS_PER_TASK;
    const domain = state.selectedDomain;
    if (domainInfo[domain]) {
      state.progress[domain] = (state.progress[domain] || 0) + 1;
    }
    // Enregistrer dans l'historique (max 50 entrées)
    const entry = { label: label, coins: COINS_PER_TASK, at: Date.now(), domain: domain || "" };
    state.history = [entry, ...state.history].slice(0, 50);
    saveState();
    renderDomainProgress();
    renderShop();
    const reward = pickReward(domain);
    const toastMsg = successMessage
      ? `${successMessage} +${COINS_PER_TASK} 🪙`
      : `✓ ${label} — +${COINS_PER_TASK} 🪙`;
    showSuccessToast(toastMsg);
    showView("home");
  }

  function showSuccessToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.remove("hidden", "toast-success");
    void toast.offsetWidth;
    toast.classList.add("toast-success");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.add("hidden");
      toast.classList.remove("toast-success");
    }, 2600);
    if ("vibrate" in navigator) navigator.vibrate([15, 30, 15]);
  }

  function pickReward(domain) {
    const rewards = state.rewards.filter(isCoherentReward);
    if (rewards.length) {
      const index = state.wins % rewards.length;
      return `Récompense possible : ${rewards[index]}.`;
    }
    const reward = domainInfo[domain]?.reward;
    return reward ? `Pause suggérée : ${reward}.` : "Petite victoire.";
  }

  function renderDomainProgress() {
    Object.entries(domainInfo).forEach(([domain, info]) => {
      const meter = $(`progress-${domain}`);
      if (!meter) return;
      if (domain === "house") {
        const stats = houseStats();
        const count = $(`count-${domain}`);
        if (count) {
          count.textContent = stats.completedCount === 0
            ? "À commencer"
            : stats.completedCount >= stats.totalCount
              ? "Complété"
              : `${stats.percent} %`;
        }
        meter.style.width = `${stats.percent}%`;
        meter.parentElement.setAttribute("aria-label", `${stats.completedCount} sur ${stats.totalCount} missions maison faites`);
        return;
      }
      const completed = Math.min(state.progress[domain] || 0, info.total);
      $(`count-${domain}`).textContent = completed === 0
        ? "À commencer"
        : completed >= info.total
          ? "Complété"
          : "En cours";
      meter.style.width = `${Math.round((completed / info.total) * 100)}%`;
      meter.parentElement.setAttribute("aria-label", `${completed} sur ${info.total} objectifs faits`);
    });
  }

  function openQuickAdd() {
    if (!$("quick-add-panel") || !$("quick-add-button")) return;
    $("quick-add-panel").classList.remove("hidden");
    $("quick-add-button").setAttribute("aria-expanded", "true");
    $("quick-input").focus();
  }

  function closeQuickAdd() {
    if (!$("quick-add-panel") || !$("quick-add-button")) return;
    $("quick-add-panel").classList.add("hidden");
    $("quick-add-button").setAttribute("aria-expanded", "false");
  }

  function openCheckIn() {
    const panel = $("checkin-panel");
    const button = $("checkin-button");
    if (!panel || !button) return;
    panel.classList.remove("hidden");
    button.setAttribute("aria-expanded", "true");
    renderHistoryList();
  }

  function renderHistoryList() {
    const list = $("history-list");
    if (!list) return;
    if (!state.history || !state.history.length) {
      list.replaceChildren();
      const empty = document.createElement("p");
      empty.className = "small-muted";
      empty.textContent = "Aucune victoire encore. Complète une action pour commencer !";
      list.append(empty);
      return;
    }
    const now = new Date();
    const todayStr = now.toLocaleDateString("fr-CA");
    list.replaceChildren(...state.history.slice(0, 30).map(function(entry) {
      const row = document.createElement("div");
      row.className = "history-item";
      const d = new Date(entry.at);
      const dayStr = d.toLocaleDateString("fr-CA");
      const timeStr = d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
      const dayLabel = dayStr === todayStr ? "aujourd'hui" : "hier";
      const label = document.createElement("span");
      label.className = "history-item-label";
      label.textContent = entry.label;
      const meta = document.createElement("span");
      meta.className = "history-item-meta";
      meta.textContent = `+${entry.coins} pièces · ${dayLabel} ${timeStr}`;
      row.append(label, meta);
      return row;
    }));
  }

  function closeCheckIn() {
    const panel = $("checkin-panel");
    const button = $("checkin-button");
    if (!panel || !button) return;
    panel.classList.add("hidden");
    button.setAttribute("aria-expanded", "false");
  }

  window.elanOpenHistory = (event) => {
    event?.preventDefault();
    openCheckIn();
  };

  document.addEventListener("click", (event) => {
    if (!event.target.closest("#checkin-button")) return;
    event.preventDefault();
    openCheckIn();
  }, true);

  function selectCheckIn(value) {
    selectedCheckIn = value;
    renderCheckInChoices();
  }

  function selectEnergy(value) {
    selectedEnergy = value;
    renderCheckInChoices();
  }

  function renderCheckInChoices() {
    const choices = $("checkin-choices");
    const energy = $("checkin-energy");
    if (choices) {
      choices.replaceChildren(...checkInChoices.map((choice) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = choice;
        button.className = choice === selectedCheckIn ? "selected" : "";
        button.addEventListener("click", () => selectCheckIn(choice));
        return button;
      }));
    }
    if (energy) {
      energy.replaceChildren(...["basse", "moyenne", "haute"].map((level) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = level;
        button.className = level === selectedEnergy ? "selected" : "";
        button.addEventListener("click", () => selectEnergy(level));
        return button;
      }));
    }
  }

  function saveCheckIn() {
    const noteInput = $("checkin-note");
    const note = noteInput?.value.trim() || "";
    const checkIn = {
      status: selectedCheckIn,
      energy: selectedEnergy,
      note,
      createdAt: Date.now()
    };
    state.checkIns = [...state.checkIns, checkIn].slice(-40);
    saveState();
    if (noteInput) noteInput.value = "";
    renderCheckInHistory();
    closeCheckIn();
    showToast(checkInMessage(checkIn));
  }

  function checkInMessage(checkIn) {
    if (checkIn.status === "Je suis fatigué" || checkIn.energy === "basse") {
      return "Tu sembles fatigué aujourd'hui. On garde ça doux.";
    }
    if (checkIn.status === "Je procrastine" || checkIn.status === "Je suis perdu") {
      return "C'est noté. Une petite mission peut aider à revenir.";
    }
    if (checkIn.status === "Je suis concentré" || checkIn.status === "Je suis motivé") {
      return "Belle clarté. Continue une action à la fois.";
    }
    return "Check-in gardé. Tu viens de reprendre le fil.";
  }

  function renderCheckInHistory() {
    const card = $("checkin-history-card");
    const list = $("checkin-history");
    const stats = $("checkin-stats");
    if (!card || !list || !stats) return;
    const recent = state.checkIns.slice(-4).reverse();
    if (!recent.length) {
      card.classList.add("hidden");
      list.replaceChildren();
      return;
    }
    const today = todayKey();
    const todayItems = state.checkIns.filter((item) => dateKey(new Date(item.createdAt)) === today);
    const lowEnergy = todayItems.filter((item) => item.energy === "basse").length;
    stats.textContent = lowEnergy
      ? `${todayItems.length} aujourd'hui · énergie basse ${lowEnergy} fois`
      : `${todayItems.length} aujourd'hui`;
    list.replaceChildren(...recent.map((item) => {
      const row = document.createElement("p");
      row.className = "checkin-item";
      const time = new Date(item.createdAt).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
      row.textContent = `${time} · ${item.status} · énergie ${item.energy}${item.note ? ` · ${item.note}` : ""}`;
      return row;
    }));
    card.classList.remove("hidden");
  }

  function selectQuickType(type) {
    quickType = type;
    document.querySelectorAll(".quick-type").forEach((button) => {
      button.classList.toggle("active", button.dataset.quickType === type);
    });
    $("quick-label").textContent = type === "Note" ? "Note rapide" : `Nouveau ${type.toLowerCase()}`;
  }

  function renderQuickItems() {
    const list = $("quick-list");
    if (!list) return;
    const visibleItems = state.quickItems.slice(-3).reverse();
    if (!visibleItems.length) {
      list.classList.add("hidden");
      list.replaceChildren();
      return;
    }
    list.replaceChildren(...visibleItems.map((item) => {
      const row = document.createElement("p");
      row.className = "quick-item";
      row.textContent = `${item.type} : ${item.text}`;
      return row;
    }));
    list.classList.remove("hidden");
  }

  function renderIdeas() {
    const list = $("ideas-list");
    const recentIdeas = state.ideas.slice(-3).reverse();
    if (!recentIdeas.length) {
      list.classList.add("hidden");
      list.replaceChildren();
      return;
    }
    list.replaceChildren(...recentIdeas.map((idea) => {
      const item = document.createElement("p");
      item.className = "idea-item";
      item.textContent = idea;
      return item;
    }));
    list.classList.remove("hidden");
  }

  function renderRewards() {
    const list = $("rewards-list");
    if (!list) return;
    const rewards = state.rewards.filter(isCoherentReward);
    if (!rewards.length) {
      list.classList.add("hidden");
      list.replaceChildren();
      return;
    }
    list.replaceChildren(...rewards.map((reward) => {
      const item = document.createElement("p");
      item.className = "idea-item";
      item.textContent = rewardTitle(reward);
      return item;
    }));
    list.classList.remove("hidden");
  }

  function renderCustomGoals() {
    renderSelectedDomain();
  }

  function saveIdea() {
    const input = $("ideas-input");
    const text = input.value.trim();
    if (!text) {
      showToast("Écris une idée d'abord.");
      return;
    }
    state.ideas.push(text);
    state.ideas = state.ideas.slice(-20);
    saveState();
    input.value = "";
    renderIdeas();
    showToast("Idée gardée.");
  }

  function addCustomGoal(domain) {
    const text = window.prompt("Nouvel objectif");
    const goal = text?.trim();
    if (!goal) return;
    state.customGoals[domain] = [...(state.customGoals[domain] || []), goal].slice(-8);
    state.currentHomeDomain = domain;
    state.selectedDomain = domain;
    saveState();
    renderCustomGoals();
    showToast("Objectif ajouté.");
  }

  function saveReward() {
    const input = $("reward-input");
    const reward = input?.value.trim();
    if (!reward) {
      showToast("Écris une récompense.");
      return;
    }
    if (!isCoherentReward(reward)) {
      showToast("Choisis plutôt un petit plaisir personnel.");
      return;
    }
    state.rewards = [...new Set([...state.rewards, reward])].slice(-12);
    saveState();
    input.value = "";
    renderRewards();
    renderShop();
    renderOnboarding();
    showToast("Récompense ajoutée.");
  }

  function saveQuickItem() {
    const input = $("quick-input");
    const text = input.value.trim();
    if (!text) {
      showToast("Écris quelques mots d'abord.");
      return;
    }
    state.quickItems.push({ type: quickType, text });
    saveState();
    input.value = "";
    renderQuickItems();
    closeQuickAdd();
    showToast(`${quickType} ajouté.`);
  }

  function todayKey() {
    return dateKey(new Date());
  }

  function dateKey(date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function money(value) {
    const amount = Number(value) || 0;
    return `${amount.toLocaleString("fr-CA", { maximumFractionDigits: 2 })} $`;
  }

  function budgetEntries() {
    const budget = state.budget || defaultState.budget;
    const incomes = Array.isArray(budget.incomes) ? budget.incomes : [];
    const payments = Array.isArray(budget.payments) ? budget.payments : [];
    return { incomes, payments };
  }

  function addDays(dateValue, days) {
    const date = new Date(`${dateValue}T12:00:00`);
    date.setDate(date.getDate() + days);
    return dateKey(date);
  }

  function addMonths(dateValue, months) {
    const date = new Date(`${dateValue}T12:00:00`);
    date.setMonth(date.getMonth() + months);
    return dateKey(date);
  }

  function budgetOccurrenceDatesBetween(entry, start, end) {
    if (!entry.date) return [];
    const dates = [];
    let current = entry.date;
    const repeat = entry.repeat || "";
    let guard = 0;

    while (current < start && repeat && guard < 120) {
      if (repeat === "weekly") current = addDays(current, 7);
      else if (repeat === "biweekly") current = addDays(current, 14);
      else if (repeat === "monthly") current = addMonths(current, 1);
      else break;
      guard += 1;
    }

    while (current >= start && current <= end && guard < 160) {
      dates.push(current);
      if (repeat === "weekly") current = addDays(current, 7);
      else if (repeat === "biweekly") current = addDays(current, 14);
      else if (repeat === "monthly") current = addMonths(current, 1);
      else break;
      guard += 1;
    }
    return dates;
  }

  function budgetOccurrenceDates(entry) {
    return budgetOccurrenceDatesBetween(entry, todayKey(), addDays(todayKey(), 30));
  }

  function budgetFinanceOccurrences30Days() {
    const { incomes, payments } = budgetEntries();
    return [
      ...incomes.flatMap((entry) => budgetOccurrenceDates(entry).map((date) => ({ ...entry, date, kind: "income" }))),
      ...payments.flatMap((entry) => budgetOccurrenceDates(entry).map((date) => ({ ...entry, date, kind: "payment" })))
    ].sort((a, b) => a.date.localeCompare(b.date));
  }

  function budgetDateText(dateValue) {
    if (!dateValue) return "Sans date";
    if (dateValue === todayKey()) return "Aujourd'hui";
    return new Intl.DateTimeFormat("fr-CA", { day: "numeric", month: "long" }).format(new Date(`${dateValue}T12:00:00`));
  }

  function budgetRepeatText(value) {
    const labels = {
      weekly: "Hebdomadaire",
      biweekly: "Aux 2 semaines",
      monthly: "Mensuel"
    };
    return labels[value] || "Unique";
  }

  function budgetCategoryText(value) {
    const labels = {
      loyer: "Loyer",
      auto: "Auto",
      telephone: "Téléphone",
      assurance: "Assurance",
      autre: "Autre"
    };
    return labels[value] || "Autre";
  }

  function budgetPaymentIcon(item) {
    const text = String(`${item.name || ""} ${item.category || ""}`)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (text.includes("telephone") || text.includes("phone") || text.includes("cell")) return "📱";
    if (text.includes("vehicule") || text.includes("auto") || text.includes("voiture")) return "🚗";
    if (text.includes("loyer")) return "🏠";
    if (text.includes("assurance")) return "🛡️";
    return "📌";
  }

  function inferBudgetPaymentCategory(name) {
    const text = String(name || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (text.includes("loyer")) return "loyer";
    if (text.includes("vehicule") || text.includes("auto") || text.includes("voiture")) return "auto";
    if (text.includes("telephone") || text.includes("phone") || text.includes("cell")) return "telephone";
    if (text.includes("assurance")) return "assurance";
    return "autre";
  }

  function budgetEntryIcon(item) {
    return item.kind === "income" ? "💰" : budgetPaymentIcon(item);
  }

  function budgetWeekdayText(dateValue) {
    return new Intl.DateTimeFormat("fr-CA", { weekday: "long" }).format(new Date(`${dateValue}T12:00:00`));
  }

  function budgetMonthRange() {
    const now = new Date(`${todayKey()}T12:00:00`);
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 12);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 12);
    return { start: dateKey(start), end: dateKey(end) };
  }

  function budgetFinanceOccurrencesForRange(start, end) {
    const { incomes, payments } = budgetEntries();
    return [
      ...incomes.flatMap((entry) => budgetOccurrenceDatesBetween(entry, start, end).map((date) => ({ ...entry, date, kind: "income" }))),
      ...payments.flatMap((entry) => budgetOccurrenceDatesBetween(entry, start, end).map((date) => ({ ...entry, date, kind: "payment" })))
    ].sort((a, b) => a.date.localeCompare(b.date));
  }

  function syncBudgetAgendaEntry(entry, kind) {
    const amount = Number(entry.amount) || 0;
    const sourceId = `budget-${kind}-${entry.id}`;
    const prefix = kind === "income" ? "Revenu" : "Paiement";
    const sign = kind === "income" ? "+" : "-";
    const text = `${prefix} : ${entry.name} ${sign}${money(amount)}`;
    const existing = state.agenda.find((item) => item.sourceId === sourceId);
    const agendaItem = {
      id: existing?.id || sourceId,
      sourceId,
      date: entry.date,
      type: "Finance",
      text,
      time: "",
      reminder: "none",
      repeat: entry.repeat || "",
      amount,
      financeKind: kind,
      notified: false,
      done: false
    };
    state.agenda = existing
      ? state.agenda.map((item) => item.sourceId === sourceId ? { ...item, ...agendaItem, done: item.done } : item)
      : [...state.agenda, agendaItem].slice(-100);
  }

  function removeBudgetAgendaEntry(id, kind) {
    const sourceId = `budget-${kind}-${id}`;
    state.agenda = state.agenda.filter((item) => item.sourceId !== sourceId);
  }

  function renderBudgetList(targetId, items, kind) {
    const target = $(targetId);
    if (!target) return;
    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "budget-empty";
      empty.textContent = kind === "income" ? "Aucun revenu prévu." : "Aucun paiement prévu.";
      target.replaceChildren(empty);
      return;
    }
    target.replaceChildren(...items.slice().sort((a, b) => (a.date || "").localeCompare(b.date || "")).map((item) => {
      const row = document.createElement("article");
      row.className = "budget-item";
      const copy = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = item.name;
      const meta = document.createElement("p");
      meta.className = "small-muted";
      meta.textContent = `${budgetDateText(item.date)} · ${budgetRepeatText(item.repeat)}`;
      copy.append(title, meta);
      const side = document.createElement("div");
      const amount = document.createElement("div");
      amount.className = "budget-amount";
      amount.textContent = money(item.amount);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "budget-delete";
      remove.textContent = "Supprimer";
      remove.addEventListener("click", () => removeBudgetEntry(kind, item.id));
      side.append(amount, remove);
      row.append(copy, side);
      return row;
    }));
  }

  function renderBudget() {
    const panel = $("domain-budget");
    if (!panel) return;
    const { incomes, payments } = budgetEntries();
    const upcoming = budgetFinanceOccurrences30Days();
    const monthRange = budgetMonthRange();
    const monthEvents = budgetFinanceOccurrencesForRange(monthRange.start, monthRange.end);
    const monthIncome = monthEvents.filter((item) => item.kind === "income").reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const monthPayments = monthEvents.filter((item) => item.kind === "payment").reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    if ($("budget-month-income")) $("budget-month-income").textContent = money(monthIncome);
    if ($("budget-month-payments")) $("budget-month-payments").textContent = money(monthPayments);
    if ($("budget-upcoming-count")) $("budget-upcoming-count").textContent = `${upcoming.length}`;

    renderBudgetList("budget-income-list", incomes, "income");
    renderBudgetList("budget-payment-list", payments, "payment");

    const upcomingList = $("budget-upcoming-list");
    if (!upcomingList) return;
    if (!upcoming.length) {
      const empty = document.createElement("p");
      empty.className = "budget-empty";
      empty.textContent = "Rien dans les 30 prochains jours.";
      upcomingList.replaceChildren(empty);
      return;
    }
    upcomingList.replaceChildren(...upcoming.map((item) => {
      const row = document.createElement("article");
      row.className = "budget-item budget-event-item";
      const copy = document.createElement("div");
      const day = document.createElement("p");
      day.className = "budget-event-day";
      day.textContent = budgetWeekdayText(item.date);
      const title = document.createElement("strong");
      title.textContent = `${budgetEntryIcon(item)} ${item.name}`;
      const meta = document.createElement("p");
      meta.className = "small-muted";
      meta.textContent = budgetDateText(item.date);
      copy.append(day, title, meta);
      const amount = document.createElement("div");
      amount.className = "budget-amount";
      amount.textContent = money(item.amount);
      row.append(copy, amount);
      return row;
    }));
  }

  function renderAgendaFinanceUpcoming() {
    renderAgendaPlanningList();
  }

  function addBudgetIncome() {
    const name = $("budget-income-name")?.value.trim();
    const amount = Number.parseFloat($("budget-income-amount")?.value);
    const date = $("budget-income-date")?.value;
    const repeat = $("budget-income-repeat")?.value || "";
    if (!name || !Number.isFinite(amount) || amount <= 0 || !date) {
      showToast("Ajoute un nom, un montant et une date.");
      return;
    }
    const entry = { id: `income-${Date.now()}`, name, amount, date, repeat };
    state.budget = state.budget || cloneState(defaultState.budget);
    state.budget.incomes = [...(state.budget.incomes || []), entry];
    syncBudgetAgendaEntry(entry, "income");
    saveState();
    ["budget-income-name", "budget-income-amount", "budget-income-date"].forEach((id) => { const field = $(id); if (field) field.value = ""; });
    renderBudget();
    renderAgenda();
    renderAgendaFinanceUpcoming();
    showToast("Revenu ajouté au Budget et à l'Agenda.");
  }

  function addBudgetPayment() {
    const name = $("budget-payment-name")?.value.trim();
    const amount = Number.parseFloat($("budget-payment-amount")?.value);
    const date = $("budget-payment-date")?.value;
    const category = inferBudgetPaymentCategory(name);
    const repeat = $("budget-payment-repeat")?.value || "";
    if (!name || !Number.isFinite(amount) || amount <= 0 || !date) {
      showToast("Ajoute un nom, un montant et une date.");
      return;
    }
    const entry = { id: `payment-${Date.now()}`, name, amount, date, category, repeat };
    state.budget = state.budget || cloneState(defaultState.budget);
    state.budget.payments = [...(state.budget.payments || []), entry];
    syncBudgetAgendaEntry(entry, "payment");
    saveState();
    ["budget-payment-name", "budget-payment-amount", "budget-payment-date"].forEach((id) => { const field = $(id); if (field) field.value = ""; });
    renderBudget();
    renderAgenda();
    renderAgendaFinanceUpcoming();
    showToast("Paiement ajouté au Budget et à l'Agenda.");
  }

  function removeBudgetEntry(kind, id) {
    if (!state.budget) return;
    if (kind === "income") {
      state.budget.incomes = (state.budget.incomes || []).filter((item) => item.id !== id);
      removeBudgetAgendaEntry(id, "income");
    } else {
      state.budget.payments = (state.budget.payments || []).filter((item) => item.id !== id);
      removeBudgetAgendaEntry(id, "payment");
    }
    saveState();
    renderBudget();
    renderAgenda();
    renderAgendaFinanceUpcoming();
    showToast("Élément supprimé.");
  }

  function selectedAgendaDate() {
    return state.agendaDate || todayKey();
  }

  function agendaItemsForSelectedDate() {
    const selectedDate = selectedAgendaDate();
    return state.agenda
      .filter((item) => item.date === selectedDate)
      .sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
  }

  function agendaItemsForDate(dateValue) {
    return agendaEventsForRange(dateValue, dateValue);
  }

  function isCoherentReward(label) {
    const normalized = rewardTitle(label).toLowerCase();
    return normalized && !blockedRewardTerms.some((term) => normalized.includes(term));
  }

  function agendaDateLabel(dateValue) {
    const date = new Date(`${dateValue}T12:00:00`);
    const today = todayKey();
    if (dateValue === today) return "Aujourd'hui";
    return new Intl.DateTimeFormat("fr-CA", { weekday: "long", day: "numeric", month: "long" }).format(date);
  }

  function reminderLabel(reminder) {
    const labels = {
      none: "Aucun rappel",
      "0": "Rappel à l'heure",
      "5": "Rappel 5 min avant",
      "15": "Rappel 15 min avant",
      "30": "Rappel 30 min avant",
      "60": "Rappel 1 h avant"
    };
    return labels[`${reminder}`] || labels.none;
  }

  function agendaRepeatText(value) {
    return budgetRepeatText(value);
  }

  function agendaViewRange() {
    const start = todayKey();
    const view = ["today", "week", "next30"].includes(state.agendaView) ? state.agendaView : "today";
    if (view === "week") return { view, start, end: addDays(start, 6), title: "Cette semaine" };
    if (view === "next30") return { view, start, end: addDays(start, 30), title: "30 prochains jours" };
    return { view: "today", start, end: start, title: "Aujourd'hui" };
  }

  function agendaManualOccurrencesForRange(start, end) {
    const financialTypes = new Set(["Finance", "Budget"]);
    return (state.agenda || [])
      .filter((item) => !(item.sourceId || "").startsWith("budget-"))
      .filter((item) => financialTypes.has(item.type) || financialTypes.has(item.domain))
      .flatMap((item) => budgetOccurrenceDatesBetween(item, start, end).map((date) => ({
        id: `${item.id}-${date}`,
        sourceId: item.sourceId || item.id,
        date,
        domain: item.domain || item.type || "Agenda",
        type: item.type || "Agenda",
        title: item.text || item.title || "Événement",
        amount: Number(item.amount) || 0,
        tokens: Number(item.tokens) || 0,
        repeat: item.repeat || "",
        time: item.time || "",
        reminder: item.reminder || "none",
        done: Boolean(item.done),
        source: "agenda"
      })));
  }

  function agendaBudgetOccurrencesForRange(start, end) {
    return budgetFinanceOccurrencesForRange(start, end).map((item) => ({
      id: `budget-${item.kind}-${item.id}-${item.date}`,
      sourceId: `budget-${item.kind}-${item.id}`,
      date: item.date,
      domain: "Budget",
      type: item.kind === "income" ? "Revenu prévu" : "Paiement prévu",
      title: item.name,
      amount: Number(item.amount) || 0,
      tokens: 0,
      repeat: item.repeat || "",
      icon: budgetEntryIcon(item),
      source: "budget",
      financeKind: item.kind
    }));
  }

  function agendaEventsForRange(start, end) {
    return [
      ...agendaBudgetOccurrencesForRange(start, end),
      ...agendaManualOccurrencesForRange(start, end)
    ].sort((a, b) => `${a.date} ${a.time || ""}`.localeCompare(`${b.date} ${b.time || ""}`));
  }

  function agendaEventDomainIcon(event) {
    if (event.icon) return event.icon;
    const icons = {
      Budget: "💰",
      Finance: "💰",
      Agenda: "📅"
    };
    return icons[event.domain] || icons[event.type] || "📅";
  }

  function renderAgendaPlanningList() {
    const target = $("agenda-planning-list");
    if (!target) return;
    const range = agendaViewRange();
    const items = agendaEventsForRange(range.start, range.end);
    const title = $("agenda-planning-title");
    const count = $("agenda-planning-count");
    if (title) title.textContent = range.title;
    if (count) count.textContent = `${items.length} événement${items.length > 1 ? "s" : ""}`;
    document.querySelectorAll("[data-agenda-view]").forEach((button) => {
      const isActive = button.dataset.agendaView === range.view;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "small-muted";
      empty.textContent = "Rien de prévu dans cette vue.";
      target.replaceChildren(empty);
      return;
    }
    const nodes = [];
    let currentDate = "";
    items.forEach((event) => {
      if (event.date !== currentDate) {
        currentDate = event.date;
        const day = document.createElement("h3");
        day.className = "agenda-date-group";
        day.textContent = agendaDateLabel(event.date);
        nodes.push(day);
      }
      const row = document.createElement("article");
      row.className = "agenda-plan-item";
      row.style.borderLeftColor = agendaTypeColors[event.domain] || agendaTypeColors[event.type] || "#e8eddc";
      const main = document.createElement("div");
      const meta = document.createElement("p");
      meta.className = "agenda-meta";
      const details = [event.domain || event.type, event.type];
      if (event.repeat) details.push(agendaRepeatText(event.repeat));
      if (event.time) details.push(event.time);
      meta.textContent = details.filter(Boolean).join(" · ");
      const titleNode = document.createElement("strong");
      titleNode.textContent = `${agendaEventDomainIcon(event)} ${event.title}`;
      const chips = document.createElement("div");
      chips.className = "agenda-plan-chips";
      if (event.amount) {
        const chip = document.createElement("span");
        chip.textContent = money(event.amount);
        chips.append(chip);
      }
      if (event.tokens) {
        const chip = document.createElement("span");
        chip.textContent = `+${event.tokens} jetons`;
        chips.append(chip);
      }
      main.append(meta, titleNode);
      if (chips.childElementCount) main.append(chips);
      row.append(main);
      nodes.push(row);
    });
    target.replaceChildren(...nodes);
  }

  function agendaMonthLabel(dateValue) {
    const date = new Date(`${dateValue}T12:00:00`);
    return new Intl.DateTimeFormat("fr-CA", { month: "long", year: "numeric" }).format(date);
  }

  function renderAgendaCalendar(selectedDate) {
    const calendar = $("agenda-calendar");
    if (!calendar) return;
    const selected = new Date(`${selectedDate}T12:00:00`);
    const first = new Date(selected.getFullYear(), selected.getMonth(), 1, 12);
    const startOffset = (first.getDay() + 6) % 7;
    const start = new Date(first);
    start.setDate(first.getDate() - startOffset);
    const today = todayKey();
    const days = [];
    for (let index = 0; index < 42; index += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const key = dateKey(date);
      const items = agendaItemsForDate(key);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "agenda-day";
      if (date.getMonth() !== selected.getMonth()) button.classList.add("muted-day");
      if (key === today) button.classList.add("today");
      if (key === selectedDate) button.classList.add("selected");
      button.setAttribute("aria-label", `${key}, ${items.length} événement${items.length > 1 ? "s" : ""}`);

      const number = document.createElement("strong");
      number.textContent = date.getDate();
      const dots = document.createElement("span");
      dots.className = "agenda-dots";
      items.slice(0, 3).forEach((item) => {
        const dot = document.createElement("i");
        dot.style.background = agendaTypeColors[item.type] || "#e8eddc";
        dots.append(dot);
      });
      button.append(number, dots);
      button.addEventListener("click", () => setAgendaDate(key));
      days.push(button);
    }
    calendar.replaceChildren(...days);
  }

  function renderAgenda() {
    const list = $("agenda-list");
    const selectedDate = selectedAgendaDate();
    state.agendaDate = selectedDate;
    const agendaDateInput = $("agenda-date");
    const monthLabel = $("agenda-month-label");
    if (agendaDateInput) agendaDateInput.value = selectedDate;
    if (monthLabel) monthLabel.textContent = agendaMonthLabel(selectedDate);
    renderAgendaCalendar(selectedDate);
    renderAgendaFinanceUpcoming();
    if (!list) return;
    const items = agendaItemsForSelectedDate();
    const count = $("agenda-count");
    if (count) count.textContent = `${items.length} item${items.length > 1 ? "s" : ""}`;
    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "small-muted";
      empty.textContent = "Rien de prévu. Ajoute une petite chose si tu veux.";
      list.replaceChildren(empty);
      return;
    }
    list.replaceChildren(...items.map((item) => {
      const row = document.createElement("article");
      row.className = `agenda-item${item.done ? " done" : ""}`;
      row.style.borderLeftColor = agendaTypeColors[item.type] || "#e8eddc";
      const body = document.createElement("div");
      const meta = document.createElement("p");
      meta.className = "agenda-meta";
      const timeText = item.time ? `${item.time} · ` : "";
      meta.textContent = `${timeText}${item.type} · ${reminderLabel(item.reminder)}`;
      const title = document.createElement("strong");
      title.textContent = item.text;
      const tag = document.createElement("span");
      tag.className = "agenda-type-pill";
      tag.style.background = agendaTypeColors[item.type] || "#e8eddc";
      tag.textContent = item.type;
      body.append(meta, title, tag);

      const actions = document.createElement("div");
      actions.className = "agenda-actions";
      const done = document.createElement("button");
      done.type = "button";
      done.className = "secondary";
      done.textContent = item.done ? "Fait" : "Faire";
      done.addEventListener("click", () => toggleAgendaItem(item.id));
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "text-button";
      edit.textContent = "Modifier";
      edit.addEventListener("click", () => editAgendaItem(item.id));
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "text-button";
      remove.textContent = "Supprimer";
      remove.addEventListener("click", () => deleteAgendaItem(item.id));
      actions.append(done, edit, remove);
      row.append(body, actions);
      return row;
    }));
  }

  function saveAgendaItem() {
    const textInput = $("agenda-text");
    const text = textInput.value.trim();
    if (!text) {
      showToast("Écris une chose à faire.");
      return;
    }
    const reminder = $("agenda-reminder").value;
    if (reminder !== "none" && !$("agenda-time").value) {
      showToast("Choisis une heure pour activer un rappel.");
      return;
    }
    const item = {
      id: `${Date.now()}`,
      date: selectedAgendaDate(),
      type: $("agenda-type").value,
      text,
      time: $("agenda-time").value,
      reminder,
      repeat: $("agenda-repeat")?.value || "",
      notified: false,
      done: false
    };
    state.agenda = [...state.agenda, item].slice(-80);
    saveState();
    textInput.value = "";
    $("agenda-time").value = "";
    $("agenda-reminder").value = "none";
    if ($("agenda-repeat")) $("agenda-repeat").value = "";
    closeAgendaForm();
    renderAgenda();
    scheduleAgendaReminders();
    if (reminder !== "none") requestAgendaNotificationPermission();
    showToast("Ajouté à l'agenda.");
  }

  function toggleAgendaItem(id) {
    state.agenda = state.agenda.map((item) => (
      item.id === id ? { ...item, done: !item.done } : item
    ));
    saveState();
    renderAgenda();
    scheduleAgendaReminders();
    showToast("Agenda mis à jour.");
  }

  function editAgendaItem(id) {
    const item = state.agenda.find((entry) => entry.id === id);
    if (!item) return;
    const nextText = window.prompt("Modifier", item.text)?.trim();
    if (!nextText) return;
    const nextDate = window.prompt("Date (AAAA-MM-JJ)", item.date)?.trim();
    if (!nextDate) return;
    const nextTime = window.prompt("Heure", item.time || "")?.trim() || "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(nextDate)) {
      showToast("Date invalide. Format attendu : AAAA-MM-JJ.");
      return;
    }
    if (nextTime && !/^\d{2}:\d{2}$/.test(nextTime)) {
      showToast("Heure invalide. Format attendu : HH:MM.");
      return;
    }
    const nextReminder = window.prompt("Rappel : none, 0, 5, 15, 30 ou 60", item.reminder || "none")?.trim() || "none";
    item.text = nextText;
    item.date = nextDate;
    item.time = nextTime;
    item.reminder = ["none", "0", "5", "15", "30", "60"].includes(nextReminder) ? nextReminder : "none";
    item.notified = false;
    saveState();
    renderAgenda();
    scheduleAgendaReminders();
    if (item.reminder !== "none") requestAgendaNotificationPermission();
    showToast("Item modifié.");
  }

  function deleteAgendaItem(id) {
    state.agenda = state.agenda.filter((item) => item.id !== id);
    saveState();
    renderAgenda();
    scheduleAgendaReminders();
    showToast("Item supprimé.");
  }

  function changeAgendaDate(offsetDays) {
    const date = new Date(`${selectedAgendaDate()}T12:00:00`);
    date.setDate(date.getDate() + offsetDays);
    state.agendaDate = dateKey(date);
    saveState();
    renderAgenda();
  }

  function changeAgendaMonth(offsetMonths) {
    const date = new Date(`${selectedAgendaDate()}T12:00:00`);
    date.setMonth(date.getMonth() + offsetMonths);
    state.agendaDate = dateKey(date);
    saveState();
    renderAgenda();
  }

  function setAgendaDate(value) {
    if (!value) return;
    state.agendaDate = value;
    saveState();
    renderAgenda();
  }

  function openAgendaForm() {
    $("agenda-form-card")?.classList.remove("hidden");
    $("agenda-text")?.focus();
  }

  function closeAgendaForm() {
    $("agenda-form-card")?.classList.add("hidden");
  }

  async function requestAgendaNotificationPermission() {
    if (!("Notification" in window)) {
      showToast("Notifications non disponibles ici.");
      return false;
    }
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") {
      showToast("Notifications bloquées dans Android.");
      return false;
    }
    const permission = await Notification.requestPermission();
    renderSettings();
    if (permission !== "granted") {
      showToast("Rappel gardé, mais notifications non activées.");
      return false;
    }
    showToast("Notifications activées.");
    return true;
  }

  function agendaReminderTime(item) {
    if (!item.time || item.reminder === "none") return null;
    const [hours, minutes] = item.time.split(":").map(Number);
    const date = new Date(`${item.date}T00:00:00`);
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() - Number(item.reminder || 0));
    return date;
  }

  function sendAgendaNotification(item) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    new Notification("ÉLAN - Agenda", {
      body: `${item.time} · ${item.text}`,
      icon: "icons/icon-192.png"
    });
  }

  function scheduleAgendaReminders() {
    agendaReminderTimers.forEach((timer) => window.clearTimeout(timer));
    agendaReminderTimers = [];
    const now = Date.now();
    state.agenda.forEach((item) => {
      if (item.done || item.notified || item.reminder === "none") return;
      const reminderTime = agendaReminderTime(item);
      if (!reminderTime) return;
      const delay = reminderTime.getTime() - now;
      if (delay < 0 || delay > 2147483647) return;
      agendaReminderTimers.push(window.setTimeout(() => {
        sendAgendaNotification(item);
        item.notified = true;
        saveState();
      }, delay));
    });
  }

  function shopRewards() {
    const personal = state.rewards
      .filter(isCoherentReward)
      .filter((reward) => !defaultShopRewards.some((item) => item.title === rewardTitle(reward)))
      .map((reward) => normalizeShopReward(reward));
    return [...defaultShopRewards, ...personal];
  }

  function normalizeShopReward(reward) {
    const title = rewardTitle(reward);
    const type = rewardType(reward);
    const category = shopCategories.some((item) => item.id === rewardCategory(reward)) ? rewardCategory(reward) : "Bonus";
    const minutes = type === "free" ? 0 : Math.max(1, Math.round(Number(reward?.minutes) || 20));
    const cost = Math.max(1, Math.round(Number(reward?.cost) || (type === "free" ? 50 : 20)));
    const id = reward?.id || "custom-" + title.toLowerCase().replace(/\s+/g, "-");
    return {
      id,
      title,
      name: title,
      category,
      cost,
      type,
      rewardType: type,
      minutes,
      uses: type === "free" ? Math.max(1, Math.round(Number(reward?.uses) || 1)) : 0,
      duration: minutes ? minutes + " min" : "Recompense libre",
      durationMs: minutes * 60000
    };
  }

  function rewardTitle(reward) {
    if (typeof reward === "string") return reward.trim();
    return String(reward?.title || reward?.name || "").trim();
  }

  function rewardType(reward) {
    return reward?.rewardType || reward?.typeKey || (["timer", "free"].includes(reward?.type) ? reward.type : "") || (Number.isFinite(reward?.uses) ? "free" : "timer");
  }

  function rewardCategory(reward) {
    return reward?.category || (rewardType(reward) === "free" ? "Divertissement" : "Bonus");
  }

  function rewardMinutes(reward) {
    if (rewardType(reward) === "free") return 0;
    if (Number.isFinite(reward?.minutes)) return Math.max(0, Math.round(reward.minutes));
    if (Number.isFinite(reward?.durationMs)) return Math.max(1, Math.round(reward.durationMs / 60000));
    const match = String(reward?.duration || "").match(/(\d+)/);
    return match ? Math.max(1, Number(match[1])) : 20;
  }

  function rewardUses(reward) {
    if (rewardType(reward) !== "free") return 0;
    return Math.max(1, Math.round(Number(reward?.uses) || 1));
  }

  function aggregatePurchasedRewards() {
    const groups = new Map();
    state.purchasedRewards.forEach((reward) => {
      const title = rewardTitle(reward);
      if (!title) return;
      const type = rewardType(reward);
      const key = type + ":" + title;
      const current = groups.get(key) || {
        id: title.toLowerCase().replace(/\s+/g, "-"),
        title,
        category: rewardCategory(reward),
        rewardType: type,
        minutes: 0,
        uses: 0
      };
      if (type === "free") current.uses += rewardUses(reward);
      else current.minutes += rewardMinutes(reward);
      groups.set(key, current);
    });
    return Array.from(groups.values());
  }

  function shopCategoryMeta(categoryId) {
    return shopCategories.find((category) => category.id === categoryId) || { id: categoryId, label: categoryId, icon: "" };
  }

  function shopBack() {
    if (shopFlow.step === "confirm") {
      shopFlow = { ...shopFlow, step: "variants", rewardId: "" };
    } else if (shopFlow.step === "variants") {
      shopFlow = { step: "categories", category: "", title: "", rewardType: "", rewardId: "" };
    }
    renderShop();
  }

  function resetShopFlow() {
    shopFlow = { step: "categories", category: "", title: "", rewardType: "", rewardId: "" };
  }

  function shopCategoryRewards(categoryId) {
    return shopRewards().filter((reward) => rewardCategory(reward) === categoryId);
  }

  function selectedShopReward() {
    return shopRewards().find((reward) => reward.id === shopFlow.rewardId) || null;
  }

  function shopChoiceCard(titleText, detailText, actionText, onClick, disabled) {
    const item = document.createElement("article");
    item.className = "shop-item";
    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = titleText;
    copy.append(title);
    if (detailText) {
      const detail = document.createElement("p");
      detail.className = "small-muted";
      detail.textContent = detailText;
      copy.append(detail);
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = disabled ? "secondary" : "primary";
    button.textContent = actionText;
    button.disabled = Boolean(disabled);
    button.addEventListener("click", onClick);
    item.append(copy, button);
    return item;
  }

  function shopBackButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary wide";
    button.textContent = "Retour";
    button.addEventListener("click", shopBack);
    return button;
  }

  function shopCancelButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary wide";
    button.textContent = "Annuler";
    button.addEventListener("click", shopBack);
    return button;
  }

  function renderShopFlow(list) {
    const nodes = [];

    if (shopFlow.step === "categories") {
      nodes.push(...shopCategories.map((category) =>
        shopChoiceCard(category.icon + " " + category.label, "Choisir cette catégorie", "Choisir", function() {
          shopFlow = { step: "variants", category: category.id, title: "", rewardType: "", rewardId: "" };
          renderShop();
        })
      ));
      list.replaceChildren(...nodes);
      return;
    }

    const category = shopCategoryMeta(shopFlow.category);
    const heading = document.createElement("section");
    heading.className = "shop-category";
    const title = document.createElement("h3");
    title.textContent = category.icon + " " + category.label;
    heading.append(title);
    nodes.push(heading);

    if (shopFlow.step === "variants") {
      shopCategoryRewards(shopFlow.category).forEach((reward) => {
        const detail = rewardType(reward) === "free"
          ? reward.cost + " pièces - Récompense libre"
          : rewardMinutes(reward) + " min - " + reward.cost + " pièces";
        const titleText = rewardType(reward) === "free"
          ? rewardTitle(reward)
          : rewardTitle(reward) + " " + rewardMinutes(reward) + " min";
        nodes.push(shopChoiceCard(titleText, detail, "Acheter", function() {
          shopFlow = { ...shopFlow, step: "confirm", rewardId: reward.id };
          renderShop();
        }));
      });
      nodes.push(shopBackButton());
      list.replaceChildren(...nodes);
      return;
    }

    const reward = selectedShopReward();
    if (!reward) {
      resetShopFlow();
      renderShop();
      return;
    }
    const canAfford = state.coins >= reward.cost;
    const confirmCard = document.createElement("article");
    confirmCard.className = "shop-item shop-confirm-card";
    const copy = document.createElement("div");
    const confirmTitle = document.createElement("strong");
    confirmTitle.textContent = "Acheter " + rewardTitle(reward) + (rewardType(reward) === "free" ? " ?" : " " + rewardMinutes(reward) + " min ?");
    const duration = document.createElement("p");
    duration.className = "small-muted";
    duration.textContent = rewardType(reward) === "free" ? "1 utilisation" : rewardMinutes(reward) + " minutes";
    const cost = document.createElement("p");
    cost.className = "small-muted";
    cost.textContent = "Coût : " + reward.cost + " pièces";
    copy.append(confirmTitle, duration, cost);
    const buyButton = document.createElement("button");
    buyButton.type = "button";
    buyButton.className = canAfford ? "primary" : "secondary";
    buyButton.textContent = canAfford ? "Confirmer" : "Pas assez";
    buyButton.disabled = !canAfford;
    buyButton.addEventListener("click", function() {
      resetShopFlow();
      unlockReward(reward, buyButton);
    });
    confirmCard.append(copy, buyButton);
    nodes.push(confirmCard, shopCancelButton());
    list.replaceChildren(...nodes);
  }

  function renderShop() {
    const list = $("shop-rewards");
    if (!list) return;
    const coinText = `🪙 ${state.coins} pièce${state.coins > 1 ? "s" : ""}`;
    const coinEl = $("coin-balance");
    if (coinEl) coinEl.textContent = `${state.coins} pièce${state.coins > 1 ? "s" : ""}`;
    const headerBadge = $("header-coin-balance");
    if (headerBadge) headerBadge.textContent = coinText;

    const panel = $("active-reward-panel");
    if (panel) {
      const nameEl = $("active-reward-name");
      const timeEl = $("active-reward-time");
      const stopButton = $("stop-active-reward");
      if (state.activeReward) {
        panel.classList.remove("hidden");
        if (rewardType(state.activeReward) === "free") {
          if (nameEl) nameEl.textContent = rewardTitle(state.activeReward) + " en cours";
          if (timeEl) {
            timeEl.textContent = "Recompense libre";
            timeEl.classList.add("active-reward-free");
          }
          if (stopButton) stopButton.textContent = "Terminer";
        } else {
          const remaining = Math.max(0, state.activeReward.endsAt - Date.now());
          if (nameEl) nameEl.textContent = rewardTitle(state.activeReward) || "Recompense";
          if (timeEl) {
            timeEl.textContent = formatRemaining(remaining);
            timeEl.classList.remove("active-reward-free");
          }
          if (stopButton) stopButton.textContent = "Terminer";
        }
      } else {
        panel.classList.add("hidden");
      }
    }

    const purchasedSection = $("purchased-rewards-section");
    const purchasedList = $("purchased-rewards-list");
    if (purchasedSection && purchasedList) {
      const purchasedRewards = aggregatePurchasedRewards();
      if (purchasedRewards.length > 0) {
        purchasedSection.classList.remove("hidden");
        purchasedList.replaceChildren(...purchasedRewards.map(function(pr) {
          var item = document.createElement("article");
          item.className = "shop-item";
          var copy = document.createElement("div");
          var title = document.createElement("strong");
          title.textContent = pr.title;
          var detail = document.createElement("p");
          detail.className = "small-muted";
          detail.textContent = pr.rewardType === "free" ? pr.uses + " utilisation" + (pr.uses > 1 ? "s" : "") : pr.minutes + " min";
          copy.append(title, detail);
          var useBtn = document.createElement("button");
          useBtn.type = "button";
          useBtn.className = "primary";
          useBtn.textContent = "Utiliser";
          useBtn.disabled = Boolean(state.activeReward);
          useBtn.addEventListener("click", function() { useReward(pr); });
          item.append(copy, useBtn);
          return item;
        }));
      } else {
        purchasedSection.classList.add("hidden");
        purchasedList.replaceChildren();
      }
    }

    renderShopFlow(list);
  }

  function parseDurationMs(durationStr) {
    var match = durationStr.match(/(\d+)\s*min/);
    if (match) return parseInt(match[1], 10) * 60000;
    if (/film|épisode/i.test(durationStr)) return 90 * 60000;
    return 10 * 60000;
  }

  function unlockReward(reward, btn) {
    if (state.coins < reward.cost) {
      showToast("Pas assez de pieces pour cette recompense.");
      return;
    }
    const title = rewardTitle(reward);
    const type = rewardType(reward);
    if (!title) return;
    if (btn) btn.disabled = true;
    state.coins -= reward.cost;
    const existing = state.purchasedRewards.find((item) => rewardTitle(item) === title && rewardType(item) === type);
    if (existing) {
      existing.title = title;
      existing.name = title;
      existing.category = rewardCategory(reward);
      existing.rewardType = type;
      if (type === "free") {
        existing.uses = rewardUses(existing) + rewardUses(reward);
      } else {
        existing.minutes = rewardMinutes(existing) + rewardMinutes(reward);
        existing.duration = existing.minutes + " min";
        existing.durationMs = existing.minutes * 60000;
      }
    } else {
      const minutes = rewardMinutes(reward);
      const uses = rewardUses(reward);
      state.purchasedRewards = state.purchasedRewards.concat([{
        id: type + "-" + title.toLowerCase().replace(/\s+/g, "-"),
        title,
        name: title,
        category: rewardCategory(reward),
        rewardType: type,
        minutes,
        uses,
        duration: minutes ? minutes + " min" : "Recompense libre",
        durationMs: minutes * 60000
      }]);
    }
    saveState();
    renderShop();
    showToast(title + " ajoute a tes recompenses !");
  }

  function useReward(purchased) {
    if (state.activeReward) {
      showToast("Une recompense est deja en cours.");
      return;
    }
    const title = rewardTitle(purchased);
    const type = rewardType(purchased);
    if (!title) return;
    if (type === "free") {
      const target = state.purchasedRewards.find((reward) => rewardTitle(reward) === title && rewardType(reward) === "free");
      if (!target) return;
      const remainingUses = rewardUses(target) - 1;
      if (remainingUses > 0) target.uses = remainingUses;
      else state.purchasedRewards = state.purchasedRewards.filter((reward) => !(rewardTitle(reward) === title && rewardType(reward) === "free"));
      state.activeReward = {
        id: "active-free-" + Date.now(),
        title,
        name: title,
        rewardType: "free",
        startedAt: Date.now()
      };
      saveState();
      renderShop();
      showToast(title + " en cours.");
      return;
    }
    const minutes = rewardMinutes(purchased);
    state.purchasedRewards = state.purchasedRewards.filter((reward) => !(rewardTitle(reward) === title && rewardType(reward) === "timer"));
    state.activeReward = {
      id: "active-timer-" + Date.now(),
      title,
      name: title,
      rewardType: "timer",
      minutes,
      duration: minutes + " min",
      durationMs: minutes * 60000,
      endsAt: Date.now() + minutes * 60000
    };
    saveState();
    startActiveRewardTimer();
    renderShop();
    showToast(title + " lance.");
  }

  function stopActiveReward() {
    window.clearInterval(activeRewardTimerId);
    activeRewardTimerId = null;
    state.activeReward = null;
    saveState();
    renderShop();
    showToast("Recompense terminee.");
  }

  function startActiveRewardTimer() {
    window.clearInterval(activeRewardTimerId);
    if (!state.activeReward || rewardType(state.activeReward) === "free") {
      activeRewardTimerId = null;
      return;
    }
    activeRewardTimerId = window.setInterval(function() {
      if (!state.activeReward) {
        window.clearInterval(activeRewardTimerId);
        activeRewardTimerId = null;
        return;
      }
      if (rewardType(state.activeReward) === "free") {
        window.clearInterval(activeRewardTimerId);
        activeRewardTimerId = null;
        return;
      }
      var remaining = state.activeReward.endsAt - Date.now();
      if (remaining <= 0) {
        window.clearInterval(activeRewardTimerId);
        activeRewardTimerId = null;
        try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) {}
        state.activeReward = null;
        saveState();
        renderShop();
        showToast("Recompense terminee. Beau retour.");
      } else {
        var timeEl = $("active-reward-time");
        if (timeEl) timeEl.textContent = formatRemaining(remaining);
      }
    }, 1000);
  }

  function resumeActiveRewardTimer() {
    if (!state.activeReward) return;
    if (rewardType(state.activeReward) === "free") {
      renderShop();
      return;
    }
    var remaining = state.activeReward.endsAt - Date.now();
    if (remaining <= 0) {
      state.activeReward = null;
      saveState();
      renderShop();
      return;
    }
    startActiveRewardTimer();
  }

  function saveShopReward() {
    const input = $("shop-reward-input");
    const reward = input?.value.trim();
    const category = $("shop-reward-category")?.value || "Bonus";
    const type = $("shop-reward-type")?.value === "free" ? "free" : "timer";
    const minutes = Math.max(1, Math.round(Number($("shop-reward-minutes")?.value) || 20));
    const cost = Math.max(1, Math.round(Number($("shop-reward-cost")?.value) || (type === "free" ? 50 : 20)));
    if (!reward) {
      showToast("Écris une récompense.");
      return;
    }
    if (!isCoherentReward(reward)) {
      showToast("Choisis plutôt un petit plaisir personnel.");
      return;
    }
    const customReward = {
      id: "custom-" + reward.toLowerCase().replace(/\s+/g, "-"),
      title: reward,
      category,
      cost,
      type,
      rewardType: type,
      minutes: type === "free" ? 0 : minutes,
      uses: type === "free" ? 1 : 0
    };
    state.rewards = state.rewards
      .filter((item) => rewardTitle(item) !== reward)
      .concat([customReward])
      .slice(-12);
    saveState();
    input.value = "";
    shopFlow = { step: "variants", category, title: "", rewardType: "", rewardId: "" };
    renderRewards();
    renderShop();
    renderOnboarding();
    showToast("Récompense ajoutée à la boutique.");
  }

  function notificationPermissionText() {
    if (!("Notification" in window)) return "Notifications non disponibles dans ce navigateur.";
    if (Notification.permission === "granted") return "Notifications activées.";
    if (Notification.permission === "denied") return "Notifications bloquées dans les réglages Android.";
    return "Autorisation nécessaire pour recevoir des notifications.";
  }

  function renderSettings() {
    const notifyImportant = $("notify-important");
    const notifySummary = $("notify-summary");
    const notificationStatus = $("notification-status");
    if (notifyImportant) notifyImportant.checked = state.notifications.important;
    if (notifySummary) notifySummary.checked = state.notifications.summary;
    if (notificationStatus) notificationStatus.textContent = notificationPermissionText();
    renderInstallState();
  }

  function isInstalled() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  function renderInstallState() {
    const status = $("install-status");
    const button = $("settings-install-button");
    const help = $("install-help");
    if (!status || !button || !help) return;
    if (isInstalled()) {
      status.textContent = "ÉLAN est installé.";
      button.classList.add("hidden");
      help.classList.add("hidden");
      $("install-invite")?.classList.add("hidden");
      return;
    }
    status.textContent = deferredInstallPrompt
      ? "Installation disponible."
      : "Installation possible depuis le menu du navigateur.";
    button.classList.remove("hidden");
    help.classList.toggle("hidden", Boolean(deferredInstallPrompt));
  }

  function renderInstallInvite() {
    const invite = $("install-invite");
    if (!invite) return;
    const shouldShow = state.onboardingComplete && !state.installInviteSeen && !isInstalled();
    invite.classList.toggle("hidden", !shouldShow);
    renderInstallState();
  }

  async function startInstall() {
    state.installInviteSeen = true;
    saveState();
    $("install-invite")?.classList.add("hidden");
    if (isInstalled()) {
      renderInstallState();
      showToast("ÉLAN est déjà installé.");
      return;
    }
    if (!deferredInstallPrompt) {
      renderInstallState();
      showToast("Utilise le menu Chrome pour ajouter ÉLAN.");
      return;
    }
    try {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      renderInstallState();
    } catch (error) {
      showToast("Installation non disponible ici.");
    }
  }

  function dismissInstallInvite() {
    state.installInviteSeen = true;
    saveState();
    $("install-invite")?.classList.add("hidden");
    renderInstallState();
  }

  function renderOnboarding() {
    const onboarding = $("onboarding");
    if (!onboarding) return;
    onboarding.classList.toggle("hidden", state.onboardingComplete);
    document.querySelectorAll("[data-motivation]").forEach((choice) => {
      choice.classList.toggle("selected", choice.dataset.motivation === state.motivation);
    });
    document.querySelectorAll("[data-reward]").forEach((choice) => {
      choice.classList.toggle("selected", state.rewards.includes(choice.dataset.reward));
    });
  }

  function toggleSelection(button, key, value) {
    if (key === "motivation") {
      state.motivation = value;
      document.querySelectorAll("[data-motivation]").forEach((choice) => {
        choice.classList.toggle("selected", choice === button);
      });
      return;
    }
    const values = new Set(state.rewards);
    if (values.has(value)) {
      values.delete(value);
      button.classList.remove("selected");
    } else {
      values.add(value);
      button.classList.add("selected");
    }
    state.rewards = [...values];
  }

  function finishOnboarding() {
    if (!state.motivation) {
      showToast("Choisis une motivation.");
      return;
    }
    if (!state.rewards.length) {
      showToast("Choisis au moins une récompense.");
      return;
    }
    state.onboardingComplete = true;
    saveState();
    renderOnboarding();
    renderInstallInvite();
    showToast("ÉLAN est prêt.");
  }

  async function renderVersionInfo() {
    if (!location.protocol.startsWith("http")) return;
    try {
      const response = await fetch(`./version.json?release=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) return;
      const release = await response.json();
      $("app-version").textContent = `Version : ${release.version}`;
      $("app-updated").textContent = `Dernière mise à jour : ${release.updated}`;
      $("app-changes").replaceChildren(...release.changes.map((change) => {
        const item = document.createElement("li");
        item.textContent = change;
        return item;
      }));
    } catch (error) {
      // The embedded summary remains visible when opened as a local file.
    }
  }

  async function requestNotifications() {
    if (!("Notification" in window)) {
      showToast("Notifications non disponibles ici.");
      renderSettings();
      return;
    }
    try {
      await Notification.requestPermission();
      renderSettings();
      showToast(notificationPermissionText());
    } catch (error) {
      showToast("Ouvre Élan en HTTPS pour autoriser les notifications.");
    }
  }

  function testNotification() {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      showToast("Autorise les notifications d'abord.");
      return;
    }
    new Notification("Élan", { body: "Notification test reçue.", icon: "icons/icon-192.png" });
    showToast("Notification envoyée.");
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      const hadController = Boolean(navigator.serviceWorker.controller);
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!hadController || refreshing) return;
        refreshing = true;
        location.reload();
      });
      navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" })
        .then((registration) => registration.update())
        .catch(() => {
          showToast("Installation hors ligne indisponible pour le moment.");
        });
    }
  }

  function bindInstallEvents() {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
      renderInstallInvite();
    });
    window.addEventListener("appinstalled", () => {
      state.installInviteSeen = true;
      deferredInstallPrompt = null;
      saveState();
      renderInstallState();
      showToast("ÉLAN est installé.");
    });
  }

  function bindDynamic(root, event, selector, handler) {
    root.addEventListener(event, (e) => {
      if (e.target.closest(selector)) handler(e);
    });
  }

  function bindEvents() {
    const bindById = (id, eventName, handler) => {
      const element = $(id);
      if (!element) return;
      element.addEventListener(eventName, handler);
    };

    bindById("checkin-button", "click", (event) => {
      event.preventDefault();
      openCheckIn();
    });
    bindById("close-checkin", "click", closeCheckIn);
    const checkInButton = $("checkin-button");
    if (checkInButton) {
      checkInButton.onclick = (event) => {
        event.preventDefault();
        openCheckIn();
      };
    }

    document.querySelectorAll("[data-view-button]").forEach((button) => {
      button.addEventListener("click", () => showView(button.dataset.viewButton));
    });
    document.querySelectorAll("[data-choose-domain], [data-open-domain]").forEach((button) => {
      button.addEventListener("click", () => {
        openDomain(button.dataset.chooseDomain || button.dataset.openDomain);
      });
    });
    document.querySelectorAll("[data-close-domain]").forEach((button) => {
      button.addEventListener("click", closeDomain);
    });
    document.querySelectorAll("[data-select-domain]").forEach((button) => {
      button.addEventListener("click", () => selectHomeDomain(button.dataset.selectDomain));
    });
    $("house-room-grid")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-house-room]");
      if (button) selectHouseRoom(button.dataset.houseRoom);
    });
    $("house-task-list")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-house-task]");
      if (button) toggleHouseTaskSelection(button.dataset.houseTask);
    });
    bindById("house-back-rooms", "click", backToHouseRooms);
    bindById("house-complete-task", "click", completeHouseTask);
    bindById("house-cancel-task", "click", cancelHouseTask);
    bindById("house-complete-continue", "click", closeHouseCompleteModal);
    bindById("house-start-selected", "click", startSelectedHouseMission);
    bindById("close-selected-domain", "click", closeSelectedDomain);
    bindById("add-selected-goal", "click", () => addCustomGoal($("add-selected-goal").dataset.addGoal));
    document.querySelectorAll("[data-toggle-missions]").forEach((button) => {
      button.addEventListener("click", () => {
        const card = button.closest(".home-domain-card");
        const extras = card?.querySelector(".extra-missions");
        if (!extras) return;
        const isOpening = extras.classList.contains("hidden");
        extras.classList.toggle("hidden", !isOpening);
        button.textContent = isOpening ? "Voir moins" : "Voir plus";
      });
    });
    document.querySelectorAll("[data-add-goal]").forEach((button) => {
      button.addEventListener("click", () => addCustomGoal(button.dataset.addGoal));
    });
    document.querySelectorAll("[data-complete]").forEach((button) => {
      button.addEventListener("click", () => {
        const domainPanel = button.closest(".domain-panel");
        const panelDomain = domainPanel?.id?.replace("domain-", "") || "";
        if (button.dataset.homeTask) {
          state.selectedDomain = button.dataset.homeTask;
          saveState();
          renderHomeSuggestion();
        } else if (panelDomain) {
          state.selectedDomain = panelDomain;
          saveState();
        }
        button.dataset.goalDomain = state.selectedDomain;
        toggleGoalSelection(button.dataset.complete, state.selectedDomain);
      });
    });

    bindById("next-action", "click", () => showEmergencyAction(false));
    bindById("emergency-done", "click", completeEmergencyAction);
    bindById("emergency-other", "click", () => showEmergencyAction(true));
    bindById("start-challenge", "click", startChallenge);
    bindById("cancel-challenge", "click", cancelChallenge);
    bindById("finish-challenge", "click", completeActiveChallenge);
    bindById("start-goal-queue", "click", startGoalQueue);
    bindById("start-goal-queue-inline", "click", startGoalQueue);
    bindById("skip-goal", "click", skipQueueGoal);
    bindById("stop-goal-queue", "click", () => stopGoalQueue());
    bindById("choose-domain-button", "click", () => showView("domains"));
    $("quick-add-button")?.addEventListener("click", openQuickAdd);
    $("close-quick-add")?.addEventListener("click", closeQuickAdd);
    $("save-checkin")?.addEventListener("click", saveCheckIn);
    $("checkin-note")?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") saveCheckIn();
    });
    document.querySelectorAll("[data-quick-type]").forEach((button) => {
      button.addEventListener("click", () => selectQuickType(button.dataset.quickType));
    });
    $("save-quick-add")?.addEventListener("click", saveQuickItem);
    $("quick-input")?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") saveQuickItem();
    });
    $("save-agenda-item")?.addEventListener("click", saveAgendaItem);
    $("agenda-text")?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") saveAgendaItem();
    });
    $("agenda-date")?.addEventListener("change", (event) => setAgendaDate(event.target.value));
    $("agenda-today")?.addEventListener("click", () => setAgendaDate(todayKey()));
    $("agenda-prev-month")?.addEventListener("click", () => changeAgendaMonth(-1));
    $("agenda-next-month")?.addEventListener("click", () => changeAgendaMonth(1));
    document.querySelectorAll("[data-agenda-view]").forEach((button) => {
      button.addEventListener("click", () => {
        state.agendaView = button.dataset.agendaView;
        saveState();
        renderAgenda();
      });
    });
    $("open-agenda-form")?.addEventListener("click", openAgendaForm);
    $("close-agenda-form")?.addEventListener("click", closeAgendaForm);
    $("save-shop-reward")?.addEventListener("click", saveShopReward);
    $("shop-reward-input")?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") saveShopReward();
    });
    $("stop-active-reward")?.addEventListener("click", stopActiveReward);

    bindById("notify-important", "change", (event) => {
      state.notifications.important = event.target.checked;
      saveState();
      showToast("Réglage enregistré.");
    });
    bindById("notify-summary", "change", (event) => {
      state.notifications.summary = event.target.checked;
      saveState();
      showToast("Réglage enregistré.");
    });
    bindById("enable-notifications", "click", requestNotifications);
    bindById("test-notification", "click", testNotification);
    bindById("settings-install-button", "click", startInstall);
    bindById("install-yes", "click", startInstall);
    bindById("install-later", "click", dismissInstallInvite);
    bindById("save-idea", "click", saveIdea);
    bindById("save-reward", "click", saveReward);
    bindById("reward-input", "keydown", (event) => {
      if (event.key === "Enter") saveReward();
    });
    document.querySelectorAll("[data-motivation]").forEach((button) => {
      button.addEventListener("click", () => toggleSelection(button, "motivation", button.dataset.motivation));
    });
    document.querySelectorAll("[data-reward]").forEach((button) => {
      button.addEventListener("click", () => toggleSelection(button, "rewards", button.dataset.reward));
    });
    document.querySelectorAll("[data-training-mode]").forEach((button) => {
      button.addEventListener("click", () => setTrainingMode(button.dataset.trainingMode));
    });
    document.querySelectorAll("[data-training-type]").forEach((button) => {
      button.addEventListener("click", () => setTrainingType(button.dataset.trainingType));
    });
    $("training-type-cards")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-training-type-card]");
      if (button) chooseTrainingType(button.dataset.trainingTypeCard);
    });
    document.querySelectorAll("[data-training-level]").forEach((button) => {
      button.addEventListener("click", () => setTrainingLevel(button.dataset.trainingLevel));
    });
    bindById("training-start-fast", "click", startQuickTrainingSession);
    bindById("training-back-overview", "click", backToTrainingOverview);
    bindById("start-training-session", "click", startTrainingSession);
    bindById("complete-training-step", "click", completeTrainingStep);
    bindById("skip-training-step", "click", skipTrainingStep);
    bindById("stop-training-session", "click", stopTrainingSession);
    bindById("reset-training-session", "click", resetTrainingSession);
    bindById("training-complete-continue", "click", continueAfterTrainingComplete);
    bindById("training-complete-shop", "click", openShopAfterTrainingComplete);
    bindById("add-training-exercise", "click", addTrainingExercise);
    bindById("training-custom-name", "keydown", (event) => {
      if (event.key === "Enter") addTrainingExercise();
    });
    bindById("training-custom-amount", "keydown", (event) => {
      if (event.key === "Enter") addTrainingExercise();
    });
    bindById("finish-onboarding", "click", finishOnboarding);

    bindById("reset-data", "click", () => {
      clearMaisonRuntimeState("réinitialisation données");
      clearTrainingRuntimeState("réinitialisation données");
      localStorage.removeItem(STORAGE_KEY);
      state = cloneState(defaultState);
      render();
      closeDomain();
      closeCheckIn();
      closeSeriesComplete();
      showView("home");
      showToast("Données effacées.");
    });

    bindById("series-complete-close", "click", continueAfterSeriesComplete);
    bindById("series-complete-shop", "click", openShopAfterSeriesComplete);
    bindById("series-complete-finish", "click", finishAfterSeriesComplete);
    bindById("domain-restart", "click", restartDomain);
    bindById("domain-change", "click", closeSelectedDomain);
    bindById("budget-add-income", "click", addBudgetIncome);
    bindById("budget-add-payment", "click", addBudgetPayment);
  }

  function render() {
    renderHomeSuggestion();
    renderCheckInChoices();
    renderCheckInHistory();
    renderQuickItems();
    renderAgenda();
    renderBudget();
    renderAgendaFinanceUpcoming();
    renderIdeas();
    renderRewards();
    renderShop();
    renderHouseCoach();
    resumeHouseTaskTimer();
    renderTrainingProgram();
    renderSelectedDomain();
    renderDomainProgress();
    renderSettings();
    renderOnboarding();
    renderInstallInvite();
    renderVersionInfo();
    renderGoalQueue();
    renderChallengeTimer();
    resumeChallengeTimer();
    resumeActiveRewardTimer();
    scheduleAgendaReminders();
  }

  function finalizeActivityStateAfterBoot() {
    sanitizePersistedActivityState("chargement différé");
    saveState();
    renderGoalQueue();
    renderTrainingProgram();
    renderChallengeTimer();
    resumeHouseTaskTimer();
  }

  bindInstallEvents();
  bindEvents();
  window.addEventListener("resize", updateFixedBarMetrics);
  sanitizePersistedActivityState("chargement initial");
  saveState();
  render();
  window.setTimeout(finalizeActivityStateAfterBoot, 150);
  updateFixedBarMetrics();
  registerServiceWorker();
}());
