// Phoenix i18n Translation System
// Supports 11 languages with instant UI updates

const translations = {
  en: {
    // Phase titles
    'phase.init': 'PHOENIX INITIALIZE',
    'phase.language': 'SELECT LANGUAGE',
    'phase.voice': 'SELECT VOICE',
    'phase.persona': 'SELECT PERSONALITY',
    'phase.auth': 'CREATE ACCOUNT',
    'phase.verify': 'VERIFY YOUR ACCOUNT',
    'phase.sync': 'SYNC DEVICES',
    'phase.goals': 'SET OBJECTIVES',
    'phase.launch': 'INITIALIZATION COMPLETE',

    // Phase subtitles
    'phase.subtitle': 'AI-POWERED LIFE OPERATING SYSTEM',
    'phase.language.subtitle': 'CHOOSE YOUR PREFERRED LANGUAGE',
    'phase.voice.subtitle': 'CHOOSE YOUR PREFERRED VOICE',
    'phase.persona.subtitle': 'CHOOSE YOUR AI PERSONALITY',
    'phase.auth.subtitle': 'REGISTER YOUR CREDENTIALS',
    'phase.verify.subtitle': 'CONFIRM YOUR IDENTITY',
    'phase.sync.subtitle': 'CONNECT YOUR LIFE',
    'phase.goals.subtitle': 'WHAT DO YOU WANT TO ACHIEVE?',
    'phase.launch.subtitle': 'YOUR AI IS READY',

    // Phase 0 intro text
    'intro.companion': 'I\'M PHOENIX, YOUR PERSONAL AI COMPANION.',
    'intro.help': 'I\'LL HELP YOU OPTIMIZE YOUR HEALTH, FITNESS, PRODUCTIVITY, AND LIFE DECISIONS.',
    'intro.setup': 'LET\'S GET YOU SET UP. THIS WILL TAKE APPROXIMATELY 180 SECONDS.',

    // Status messages
    'status.systemReady': '[ SYSTEM READY ]',

    // Buttons
    'btn.continue': 'CONTINUE',
    'btn.back': 'BACK',
    'btn.skip': 'SKIP',
    'btn.test': 'TEST',
    'btn.preview': 'PREVIEW',
    'btn.launch': 'LAUNCH DASHBOARD',
    'btn.initializeSystem': '[ INITIALIZE SYSTEM ]',

    // Personalities
    'persona.friendly': 'Friendly Helper',
    'persona.professional': 'Professional Expert',
    'persona.british': 'British Butler',
    'persona.storyteller': 'Creative Storyteller',
    'persona.gentle': 'Gentle Nurturer',
    'persona.efficient': 'Efficient Assistant',
    'persona.coach': 'Motivational Coach',
    'persona.zen': 'Zen Master',
    'persona.tech': 'Tech Genius',
    'persona.comedian': 'Comedian',
    'persona.therapist': 'Therapist',
    'persona.commander': 'Commander',

    // Personality descriptions
    'persona.friendly.desc': 'Warm and supportive',
    'persona.professional.desc': 'Direct and efficient',
    'persona.british.desc': 'Refined and courteous',
    'persona.storyteller.desc': 'Creative and imaginative',
    'persona.nurturing.desc': 'Caring and patient',
    'persona.efficient.desc': 'Neutral and balanced',
    'persona.coach.desc': 'Energetic motivator',
    'persona.zen.desc': 'Calm and mindful',
    'persona.tech.desc': 'Smart and analytical',
    'persona.comedian.desc': 'Witty and fun',
    'persona.therapist.desc': 'Understanding listener',
    'persona.commander.desc': 'Decisive leader',

    // Form labels
    'form.name': 'Full Name',
    'form.email': 'Email Address',
    'form.password': 'Password',
    'form.phone': 'Phone Number',
    'form.goals': 'What are your goals?',

    // Sync options
    'sync.calendar': 'Calendar',
    'sync.wearables': 'Wearables',
    'sync.fitness': 'Fitness Tracking',
    'sync.nutrition': 'Nutrition',
    'sync.meditation': 'Meditation',
    'sync.finances': 'Finances',
    'sync.transportation': 'Transportation',
    'sync.sleep': 'Sleep Tracking',

    // Status messages
    'status.voice.standby': 'VOICE STANDBY',
    'status.voice.active': 'VOICE ACTIVE',
    'status.loading': 'Loading...',
    'status.success': 'Success!',
    'status.error': 'Error',

    // Voice descriptions
    'voice.nova': 'Warm friendly',
    'voice.fable': 'British storyteller',
    'voice.echo': 'British butler',
    'voice.alloy': 'Neutral balanced',
    'voice.onyx': 'Deep professional',
    'voice.shimmer': 'Gentle guide',

    // Dashboard
    'dashboard.voiceMode': 'VOICE',
    'dashboard.manualMode': 'MANUAL',
    'dashboard.initializing': 'INITIALIZING AI SYSTEMS...',
    'dashboard.welcomeBack': 'Welcome Back',
    'dashboard.allSystemsOperational': 'All systems operational',
    'dashboard.syncYourLife': 'SYNC YOUR LIFE',
    'dashboard.syncDescription': 'Connect your devices, calendars, banks, and goals to unlock Phoenix\'s full potential. The more data I have, the smarter I become.',
    'dashboard.startSync': 'START SYNC',
    'dashboard.skipForNow': 'SKIP FOR NOW',

    // Misc
    'voice.status': 'VOICE STANDBY',
    'goals.placeholder': 'Type your goals here (e.g., "I want to lose 10kg and run a marathon")',
    'goals.ai_note': '✨ Phoenix AI will analyze and structure your goals automatically',
    'voice.loading': 'Loading available voices...',
  },

  es: {
    // Phase titles
    'phase.init': 'INICIALIZAR PHOENIX',
    'phase.language': 'SELECCIONAR IDIOMA',
    'phase.voice': 'SELECCIONAR VOZ',
    'phase.persona': 'SELECCIONAR PERSONALIDAD',
    'phase.auth': 'CREAR CUENTA',
    'phase.verify': 'VERIFICAR CUENTA',
    'phase.sync': 'SINCRONIZAR DISPOSITIVOS',
    'phase.goals': 'ESTABLECER OBJETIVOS',
    'phase.launch': 'INICIALIZACIÓN COMPLETA',

    // Phase subtitles
    'phase.subtitle': 'SISTEMA OPERATIVO DE VIDA IMPULSADO POR IA',
    'phase.language.subtitle': 'ELIGE TU IDIOMA PREFERIDO',
    'phase.voice.subtitle': 'ELIGE TU VOZ PREFERIDA',
    'phase.persona.subtitle': 'ELIGE TU PERSONALIDAD DE IA',
    'phase.auth.subtitle': 'REGISTRA TUS CREDENCIALES',
    'phase.verify.subtitle': 'CONFIRMA TU IDENTIDAD',
    'phase.sync.subtitle': 'CONECTA TU VIDA',
    'phase.goals.subtitle': '¿QUÉ QUIERES LOGRAR?',
    'phase.launch.subtitle': 'TU IA ESTÁ LISTA',

    // Phase 0 intro text
    'intro.companion': 'SOY PHOENIX, TU COMPAÑERO DE IA PERSONAL.',
    'intro.help': 'TE AYUDARÉ A OPTIMIZAR TU SALUD, FITNESS, PRODUCTIVIDAD Y DECISIONES DE VIDA.',
    'intro.setup': 'VAMOS A CONFIGURARTE. ESTO TOMARÁ APROXIMADAMENTE 180 SEGUNDOS.',

    // Status messages
    'status.systemReady': '[ SISTEMA LISTO ]',

    // Buttons
    'btn.continue': 'CONTINUAR',
    'btn.back': 'ATRÁS',
    'btn.skip': 'OMITIR',
    'btn.test': 'PROBAR',
    'btn.preview': 'VISTA PREVIA',
    'btn.launch': 'INICIAR PANEL',
    'btn.initializeSystem': '[ INICIALIZAR SISTEMA ]',

    // Personalities
    'persona.friendly': 'Ayudante Amigable',
    'persona.professional': 'Experto Profesional',
    'persona.british': 'Mayordomo Británico',
    'persona.storyteller': 'Narrador Creativo',
    'persona.gentle': 'Guía Gentil',
    'persona.efficient': 'Asistente Eficiente',
    'persona.coach': 'Entrenador Motivacional',
    'persona.zen': 'Maestro Zen',
    'persona.tech': 'Genio Tecnológico',
    'persona.comedian': 'Comediante',
    'persona.therapist': 'Terapeuta',
    'persona.commander': 'Comandante',

    // Personality descriptions
    'persona.friendly.desc': 'Cálido y solidario',
    'persona.professional.desc': 'Directo y eficiente',
    'persona.british.desc': 'Refinado y cortés',
    'persona.storyteller.desc': 'Creativo e imaginativo',
    'persona.nurturing.desc': 'Cariñoso y paciente',
    'persona.efficient.desc': 'Neutral y equilibrado',
    'persona.coach.desc': 'Motivador enérgico',
    'persona.zen.desc': 'Tranquilo y consciente',
    'persona.tech.desc': 'Inteligente y analítico',
    'persona.comedian.desc': 'Ingenioso y divertido',
    'persona.therapist.desc': 'Oyente comprensivo',
    'persona.commander.desc': 'Líder decisivo',

    'form.name': 'Nombre Completo',
    'form.email': 'Correo Electrónico',
    'form.password': 'Contraseña',
    'form.phone': 'Número de Teléfono',
    'form.goals': '¿Cuáles son tus objetivos?',

    'status.voice.standby': 'VOZ EN ESPERA',
    'status.voice.active': 'VOZ ACTIVA',

    // Voice descriptions
    'voice.nova': 'Cálida y amigable',
    'voice.fable': 'Narrador británico',
    'voice.echo': 'Mayordomo británico',
    'voice.alloy': 'Neutral equilibrada',
    'voice.onyx': 'Profesional profunda',
    'voice.shimmer': 'Guía gentil',

    // Dashboard
    'dashboard.voiceMode': 'VOZ',
    'dashboard.manualMode': 'MANUAL',
    'dashboard.initializing': 'INICIALIZANDO SISTEMAS IA...',
    'dashboard.welcomeBack': 'Bienvenido de Nuevo',
    'dashboard.allSystemsOperational': 'Todos los sistemas operativos',
    'dashboard.syncYourLife': 'SINCRONIZA TU VIDA',
    'dashboard.syncDescription': 'Conecta tus dispositivos, calendarios, bancos y objetivos para desbloquear todo el potencial de Phoenix. Cuantos más datos tenga, más inteligente me vuelvo.',
    'dashboard.startSync': 'INICIAR SINCRONIZACIÓN',
    'dashboard.skipForNow': 'OMITIR POR AHORA',

    'goals.placeholder': 'Escribe tus objetivos aquí (ej: "Quiero perder 10kg y correr un maratón")',
    'goals.ai_note': '✨ Phoenix AI analizará y estructurará tus objetivos automáticamente',
    'voice.loading': 'Cargando voces disponibles...',
  },

  fr: {
    // Phase titles
    'phase.init': 'INITIALISER PHOENIX',
    'phase.language': 'SÉLECTIONNER LA LANGUE',
    'phase.voice': 'SÉLECTIONNER LA VOIX',
    'phase.persona': 'SÉLECTIONNER LA PERSONNALITÉ',
    'phase.auth': 'CRÉER UN COMPTE',
    'phase.verify': 'VÉRIFIER LE COMPTE',
    'phase.sync': 'SYNCHRONISER LES APPAREILS',
    'phase.goals': 'DÉFINIR LES OBJECTIFS',
    'phase.launch': 'INITIALISATION TERMINÉE',

    // Phase subtitles
    'phase.subtitle': 'SYSTÈME D\'EXPLOITATION DE VIE ALIMENTÉ PAR IA',
    'phase.language.subtitle': 'CHOISISSEZ VOTRE LANGUE PRÉFÉRÉE',
    'phase.voice.subtitle': 'CHOISISSEZ VOTRE VOIX PRÉFÉRÉE',
    'phase.persona.subtitle': 'CHOISISSEZ VOTRE PERSONNALITÉ IA',
    'phase.auth.subtitle': 'ENREGISTREZ VOS IDENTIFIANTS',
    'phase.verify.subtitle': 'CONFIRMEZ VOTRE IDENTITÉ',
    'phase.sync.subtitle': 'CONNECTEZ VOTRE VIE',
    'phase.goals.subtitle': 'QUE VOULEZ-VOUS ACCOMPLIR?',
    'phase.launch.subtitle': 'VOTRE IA EST PRÊTE',

    // Phase 0 intro text
    'intro.companion': 'JE SUIS PHOENIX, VOTRE COMPAGNON IA PERSONNEL.',
    'intro.help': 'JE VOUS AIDERAI À OPTIMISER VOTRE SANTÉ, FITNESS, PRODUCTIVITÉ ET DÉCISIONS DE VIE.',
    'intro.setup': 'CONFIGURONS-VOUS. CELA PRENDRA ENVIRON 180 SECONDES.',

    // Status messages
    'status.systemReady': '[ SYSTÈME PRÊT ]',

    // Buttons
    'btn.continue': 'CONTINUER',
    'btn.back': 'RETOUR',
    'btn.skip': 'PASSER',
    'btn.test': 'TESTER',
    'btn.preview': 'APERÇU',
    'btn.launch': 'LANCER LE TABLEAU DE BORD',
    'btn.initializeSystem': '[ INITIALISER LE SYSTÈME ]',

    // Personalities
    'persona.friendly': 'Assistant Amical',
    'persona.professional': 'Expert Professionnel',
    'persona.british': 'Majordome Britannique',
    'persona.storyteller': 'Conteur Créatif',
    'persona.gentle': 'Guide Doux',
    'persona.efficient': 'Assistant Efficace',
    'persona.coach': 'Coach Motivationnel',
    'persona.zen': 'Maître Zen',
    'persona.tech': 'Génie Technologique',
    'persona.comedian': 'Comédien',
    'persona.therapist': 'Thérapeute',
    'persona.commander': 'Commandant',

    // Personality descriptions
    'persona.friendly.desc': 'Chaleureux et bienveillant',
    'persona.professional.desc': 'Direct et efficace',
    'persona.british.desc': 'Raffiné et courtois',
    'persona.storyteller.desc': 'Créatif et imaginatif',
    'persona.nurturing.desc': 'Attentionné et patient',
    'persona.efficient.desc': 'Neutre et équilibré',
    'persona.coach.desc': 'Motivateur énergique',
    'persona.zen.desc': 'Calme et conscient',
    'persona.tech.desc': 'Intelligent et analytique',
    'persona.comedian.desc': 'Spirituel et amusant',
    'persona.therapist.desc': 'Auditeur compréhensif',
    'persona.commander.desc': 'Leader décisif',

    'form.name': 'Nom Complet',
    'form.email': 'Adresse Email',
    'form.password': 'Mot de Passe',
    'form.phone': 'Numéro de Téléphone',
    'form.goals': 'Quels sont vos objectifs?',

    'status.voice.standby': 'VOIX EN ATTENTE',
    'status.voice.active': 'VOIX ACTIVE',

    // Voice descriptions
    'voice.nova': 'Chaleureuse et amicale',
    'voice.fable': 'Conteur britannique',
    'voice.echo': 'Majordome britannique',
    'voice.alloy': 'Neutre équilibrée',
    'voice.onyx': 'Profonde professionnelle',
    'voice.shimmer': 'Guide douce',

    // Dashboard
    'dashboard.voiceMode': 'VOIX',
    'dashboard.manualMode': 'MANUEL',
    'dashboard.initializing': 'INITIALISATION DES SYSTÈMES IA...',
    'dashboard.welcomeBack': 'Bon Retour',
    'dashboard.allSystemsOperational': 'Tous les systèmes opérationnels',
    'dashboard.syncYourLife': 'SYNCHRONISEZ VOTRE VIE',
    'dashboard.syncDescription': 'Connectez vos appareils, calendriers, banques et objectifs pour débloquer tout le potentiel de Phoenix. Plus j\'ai de données, plus je deviens intelligent.',
    'dashboard.startSync': 'COMMENCER LA SYNCHRONISATION',
    'dashboard.skipForNow': 'PASSER POUR LE MOMENT',

    'goals.placeholder': 'Écrivez vos objectifs ici (ex: "Je veux perdre 10kg et courir un marathon")',
    'goals.ai_note': '✨ Phoenix AI analysera et structurera automatiquement vos objectifs',
    'voice.loading': 'Chargement des voix disponibles...',
  },

  de: {
    // Phase titles
    'phase.init': 'PHOENIX INITIALISIEREN',
    'phase.language': 'SPRACHE WÄHLEN',
    'phase.voice': 'STIMME WÄHLEN',
    'phase.persona': 'PERSÖNLICHKEIT WÄHLEN',
    'phase.auth': 'KONTO ERSTELLEN',
    'phase.verify': 'KONTO VERIFIZIEREN',
    'phase.sync': 'GERÄTE SYNCHRONISIEREN',
    'phase.goals': 'ZIELE FESTLEGEN',
    'phase.launch': 'INITIALISIERUNG ABGESCHLOSSEN',

    // Phase subtitles
    'phase.subtitle': 'KI-GESTEUERTES LEBENS-BETRIEBSSYSTEM',
    'phase.language.subtitle': 'WÄHLEN SIE IHRE BEVORZUGTE SPRACHE',
    'phase.voice.subtitle': 'WÄHLEN SIE IHRE BEVORZUGTE STIMME',
    'phase.persona.subtitle': 'WÄHLEN SIE IHRE KI-PERSÖNLICHKEIT',
    'phase.auth.subtitle': 'REGISTRIEREN SIE IHRE ANMELDEDATEN',
    'phase.verify.subtitle': 'BESTÄTIGEN SIE IHRE IDENTITÄT',
    'phase.sync.subtitle': 'VERBINDEN SIE IHR LEBEN',
    'phase.goals.subtitle': 'WAS MÖCHTEN SIE ERREICHEN?',
    'phase.launch.subtitle': 'IHRE KI IST BEREIT',

    // Phase 0 intro text
    'intro.companion': 'ICH BIN PHOENIX, IHR PERSÖNLICHER KI-BEGLEITER.',
    'intro.help': 'ICH HELFE IHNEN, IHRE GESUNDHEIT, FITNESS, PRODUKTIVITÄT UND LEBENSENTSCHEIDUNGEN ZU OPTIMIEREN.',
    'intro.setup': 'LASSEN SIE UNS SIE EINRICHTEN. DIES DAUERT ETWA 180 SEKUNDEN.',

    // Status messages
    'status.systemReady': '[ SYSTEM BEREIT ]',

    // Buttons
    'btn.continue': 'WEITER',
    'btn.back': 'ZURÜCK',
    'btn.skip': 'ÜBERSPRINGEN',
    'btn.test': 'TESTEN',
    'btn.preview': 'VORSCHAU',
    'btn.launch': 'DASHBOARD STARTEN',
    'btn.initializeSystem': '[ SYSTEM INITIALISIEREN ]',

    // Personalities
    'persona.friendly': 'Freundlicher Helfer',
    'persona.professional': 'Professioneller Experte',
    'persona.british': 'Britischer Butler',
    'persona.storyteller': 'Kreativer Geschichtenerzähler',
    'persona.gentle': 'Sanfter Führer',
    'persona.efficient': 'Effizienter Assistent',
    'persona.coach': 'Motivations-Coach',
    'persona.zen': 'Zen-Meister',
    'persona.tech': 'Tech-Genie',
    'persona.comedian': 'Komiker',
    'persona.therapist': 'Therapeut',
    'persona.commander': 'Kommandant',

    // Personality descriptions
    'persona.friendly.desc': 'Warm und unterstützend',
    'persona.professional.desc': 'Direkt und effizient',
    'persona.british.desc': 'Kultiviert und höflich',
    'persona.storyteller.desc': 'Kreativ und fantasievoll',
    'persona.nurturing.desc': 'Fürsorglich und geduldig',
    'persona.efficient.desc': 'Neutral und ausgewogen',
    'persona.coach.desc': 'Energischer Motivator',
    'persona.zen.desc': 'Ruhig und achtsam',
    'persona.tech.desc': 'Klug und analytisch',
    'persona.comedian.desc': 'Witzig und lustig',
    'persona.therapist.desc': 'Verständnisvoller Zuhörer',
    'persona.commander.desc': 'Entscheidungsfreudiger Anführer',

    'form.name': 'Vollständiger Name',
    'form.email': 'E-Mail-Adresse',
    'form.password': 'Passwort',
    'form.phone': 'Telefonnummer',
    'form.goals': 'Was sind Ihre Ziele?',

    'status.voice.standby': 'STIMME BEREIT',
    'status.voice.active': 'STIMME AKTIV',

    'voice.nova': 'Warm freundlich',
    'voice.fable': 'Britischer Geschichtenerzähler',
    'voice.echo': 'Britischer Butler',
    'voice.alloy': 'Neutral ausgewogen',
    'voice.onyx': 'Tief professionell',
    'voice.shimmer': 'Sanfter Führer',

    // Dashboard
    'dashboard.voiceMode': 'STIMME',
    'dashboard.manualMode': 'MANUELL',
    'dashboard.initializing': 'INITIALISIERUNG DER KI-SYSTEME...',
    'dashboard.welcomeBack': 'Willkommen Zurück',
    'dashboard.allSystemsOperational': 'Alle Systeme betriebsbereit',
    'dashboard.syncYourLife': 'SYNCHRONISIEREN SIE IHR LEBEN',
    'dashboard.syncDescription': 'Verbinden Sie Ihre Geräte, Kalender, Banken und Ziele, um das volle Potenzial von Phoenix freizuschalten. Je mehr Daten ich habe, desto intelligenter werde ich.',
    'dashboard.startSync': 'SYNCHRONISATION STARTEN',
    'dashboard.skipForNow': 'VORERST ÜBERSPRINGEN',

    'goals.placeholder': 'Schreiben Sie hier Ihre Ziele (z.B. "Ich möchte 10kg abnehmen und einen Marathon laufen")',
    'goals.ai_note': '✨ Phoenix AI wird Ihre Ziele automatisch analysieren und strukturieren',
    'voice.loading': 'Verfügbare Stimmen werden geladen...',
  },

  it: {
    // Phase titles
    'phase.init': 'INIZIALIZZA PHOENIX',
    'phase.language': 'SELEZIONA LINGUA',
    'phase.voice': 'SELEZIONA VOCE',
    'phase.persona': 'SELEZIONA PERSONALITÀ',
    'phase.auth': 'CREA ACCOUNT',
    'phase.verify': 'VERIFICA ACCOUNT',
    'phase.sync': 'SINCRONIZZA DISPOSITIVI',
    'phase.goals': 'IMPOSTA OBIETTIVI',
    'phase.launch': 'INIZIALIZZAZIONE COMPLETATA',

    // Phase subtitles
    'phase.subtitle': 'SISTEMA OPERATIVO DI VITA ALIMENTATO DA IA',
    'phase.language.subtitle': 'SCEGLI LA TUA LINGUA PREFERITA',
    'phase.voice.subtitle': 'SCEGLI LA TUA VOCE PREFERITA',
    'phase.persona.subtitle': 'SCEGLI LA TUA PERSONALITÀ IA',
    'phase.auth.subtitle': 'REGISTRA LE TUE CREDENZIALI',
    'phase.verify.subtitle': 'CONFERMA LA TUA IDENTITÀ',
    'phase.sync.subtitle': 'CONNETTI LA TUA VITA',
    'phase.goals.subtitle': 'COSA VUOI OTTENERE?',
    'phase.launch.subtitle': 'LA TUA IA È PRONTA',

    // Phase 0 intro text
    'intro.companion': 'SONO PHOENIX, IL TUO COMPAGNO IA PERSONALE.',
    'intro.help': 'TI AIUTERÒ A OTTIMIZZARE LA TUA SALUTE, FITNESS, PRODUTTIVITÀ E DECISIONI DI VITA.',
    'intro.setup': 'CONFIGURIAMOTI. QUESTO RICHIEDERÀ CIRCA 180 SECONDI.',

    // Status messages
    'status.systemReady': '[ SISTEMA PRONTO ]',

    // Buttons
    'btn.continue': 'CONTINUA',
    'btn.back': 'INDIETRO',
    'btn.skip': 'SALTA',
    'btn.test': 'TESTA',
    'btn.preview': 'ANTEPRIMA',
    'btn.launch': 'AVVIA DASHBOARD',
    'btn.initializeSystem': '[ INIZIALIZZA SISTEMA ]',

    // Personalities
    'persona.friendly': 'Aiutante Amichevole',
    'persona.professional': 'Esperto Professionale',
    'persona.british': 'Maggiordomo Britannico',
    'persona.storyteller': 'Narratore Creativo',
    'persona.gentle': 'Guida Gentile',
    'persona.efficient': 'Assistente Efficiente',
    'persona.coach': 'Coach Motivazionale',
    'persona.zen': 'Maestro Zen',
    'persona.tech': 'Genio Tecnologico',
    'persona.comedian': 'Comico',
    'persona.therapist': 'Terapeuta',
    'persona.commander': 'Comandante',

    // Personality descriptions
    'persona.friendly.desc': 'Caloroso e solidale',
    'persona.professional.desc': 'Diretto ed efficiente',
    'persona.british.desc': 'Raffinato e cortese',
    'persona.storyteller.desc': 'Creativo e fantasioso',
    'persona.nurturing.desc': 'Premuroso e paziente',
    'persona.efficient.desc': 'Neutrale ed equilibrato',
    'persona.coach.desc': 'Motivatore energico',
    'persona.zen.desc': 'Calmo e consapevole',
    'persona.tech.desc': 'Intelligente e analitico',
    'persona.comedian.desc': 'Spiritoso e divertente',
    'persona.therapist.desc': 'Ascoltatore comprensivo',
    'persona.commander.desc': 'Leader decisivo',

    'form.name': 'Nome Completo',
    'form.email': 'Indirizzo Email',
    'form.password': 'Password',
    'form.phone': 'Numero di Telefono',
    'form.goals': 'Quali sono i tuoi obiettivi?',

    'status.voice.standby': 'VOCE IN ATTESA',
    'status.voice.active': 'VOCE ATTIVA',

    'voice.nova': 'Calorosa amichevole',
    'voice.fable': 'Narratore britannico',
    'voice.echo': 'Maggiordomo britannico',
    'voice.alloy': 'Neutrale equilibrata',
    'voice.onyx': 'Profonda professionale',
    'voice.shimmer': 'Guida gentile',

    // Dashboard
    'dashboard.voiceMode': 'VOCE',
    'dashboard.manualMode': 'MANUALE',
    'dashboard.initializing': 'INIZIALIZZAZIONE SISTEMI IA...',
    'dashboard.welcomeBack': 'Bentornato',
    'dashboard.allSystemsOperational': 'Tutti i sistemi operativi',
    'dashboard.syncYourLife': 'SINCRONIZZA LA TUA VITA',
    'dashboard.syncDescription': 'Connetti i tuoi dispositivi, calendari, banche e obiettivi per sbloccare il pieno potenziale di Phoenix. Più dati ho, più divento intelligente.',
    'dashboard.startSync': 'AVVIA SINCRONIZZAZIONE',
    'dashboard.skipForNow': 'SALTA PER ORA',

    'goals.placeholder': 'Scrivi qui i tuoi obiettivi (es: "Voglio perdere 10kg e correre una maratona")',
    'goals.ai_note': '✨ Phoenix AI analizzerà e strutturerà automaticamente i tuoi obiettivi',
    'voice.loading': 'Caricamento voci disponibili...',
  },

  pt: {
    // Phase titles
    'phase.init': 'INICIALIZAR PHOENIX',
    'phase.language': 'SELECIONAR IDIOMA',
    'phase.voice': 'SELECIONAR VOZ',
    'phase.persona': 'SELECIONAR PERSONALIDADE',
    'phase.auth': 'CRIAR CONTA',
    'phase.verify': 'VERIFICAR CONTA',
    'phase.sync': 'SINCRONIZAR DISPOSITIVOS',
    'phase.goals': 'DEFINIR OBJETIVOS',
    'phase.launch': 'INICIALIZAÇÃO CONCLUÍDA',

    // Phase subtitles
    'phase.subtitle': 'SISTEMA OPERACIONAL DE VIDA ALIMENTADO POR IA',
    'phase.language.subtitle': 'ESCOLHA SEU IDIOMA PREFERIDO',
    'phase.voice.subtitle': 'ESCOLHA SUA VOZ PREFERIDA',
    'phase.persona.subtitle': 'ESCOLHA SUA PERSONALIDADE IA',
    'phase.auth.subtitle': 'REGISTRE SUAS CREDENCIAIS',
    'phase.verify.subtitle': 'CONFIRME SUA IDENTIDADE',
    'phase.sync.subtitle': 'CONECTE SUA VIDA',
    'phase.goals.subtitle': 'O QUE VOCÊ QUER ALCANÇAR?',
    'phase.launch.subtitle': 'SUA IA ESTÁ PRONTA',

    // Phase 0 intro text
    'intro.companion': 'SOU PHOENIX, SEU COMPANHEIRO IA PESSOAL.',
    'intro.help': 'VOU AJUDÁ-LO A OTIMIZAR SUA SAÚDE, FITNESS, PRODUTIVIDADE E DECISÕES DE VIDA.',
    'intro.setup': 'VAMOS CONFIGURÁ-LO. ISSO LEVARÁ APROXIMADAMENTE 180 SEGUNDOS.',

    // Status messages
    'status.systemReady': '[ SISTEMA PRONTO ]',

    // Buttons
    'btn.continue': 'CONTINUAR',
    'btn.back': 'VOLTAR',
    'btn.skip': 'PULAR',
    'btn.test': 'TESTAR',
    'btn.preview': 'VISUALIZAR',
    'btn.launch': 'INICIAR PAINEL',
    'btn.initializeSystem': '[ INICIALIZAR SISTEMA ]',

    // Personalities
    'persona.friendly': 'Ajudante Amigável',
    'persona.professional': 'Especialista Profissional',
    'persona.british': 'Mordomo Britânico',
    'persona.storyteller': 'Contador de Histórias',
    'persona.gentle': 'Guia Gentil',
    'persona.efficient': 'Assistente Eficiente',
    'persona.coach': 'Coach Motivacional',
    'persona.zen': 'Mestre Zen',
    'persona.tech': 'Gênio da Tecnologia',
    'persona.comedian': 'Comediante',
    'persona.therapist': 'Terapeuta',
    'persona.commander': 'Comandante',

    // Personality descriptions
    'persona.friendly.desc': 'Caloroso e solidário',
    'persona.professional.desc': 'Direto e eficiente',
    'persona.british.desc': 'Refinado e cortês',
    'persona.storyteller.desc': 'Criativo e imaginativo',
    'persona.nurturing.desc': 'Carinhoso e paciente',
    'persona.efficient.desc': 'Neutro e equilibrado',
    'persona.coach.desc': 'Motivador energético',
    'persona.zen.desc': 'Calmo e consciente',
    'persona.tech.desc': 'Inteligente e analítico',
    'persona.comedian.desc': 'Espirituoso e divertido',
    'persona.therapist.desc': 'Ouvinte compreensivo',
    'persona.commander.desc': 'Líder decisivo',

    'form.name': 'Nome Completo',
    'form.email': 'Endereço de Email',
    'form.password': 'Senha',
    'form.phone': 'Número de Telefone',
    'form.goals': 'Quais são seus objetivos?',

    'status.voice.standby': 'VOZ EM ESPERA',
    'status.voice.active': 'VOZ ATIVA',

    'voice.nova': 'Calorosa amigável',
    'voice.fable': 'Contador de histórias britânico',
    'voice.echo': 'Mordomo britânico',
    'voice.alloy': 'Neutral equilibrada',
    'voice.onyx': 'Profunda profissional',
    'voice.shimmer': 'Guia gentil',

    // Dashboard
    'dashboard.voiceMode': 'VOZ',
    'dashboard.manualMode': 'MANUAL',
    'dashboard.initializing': 'INICIALIZANDO SISTEMAS IA...',
    'dashboard.welcomeBack': 'Bem-vindo de Volta',
    'dashboard.allSystemsOperational': 'Todos os sistemas operacionais',
    'dashboard.syncYourLife': 'SINCRONIZE SUA VIDA',
    'dashboard.syncDescription': 'Conecte seus dispositivos, calendários, bancos e objetivos para desbloquear todo o potencial do Phoenix. Quanto mais dados eu tiver, mais inteligente eu me torno.',
    'dashboard.startSync': 'INICIAR SINCRONIZAÇÃO',
    'dashboard.skipForNow': 'PULAR POR ENQUANTO',

    'goals.placeholder': 'Digite seus objetivos aqui (ex: "Quero perder 10kg e correr uma maratona")',
    'goals.ai_note': '✨ Phoenix AI analisará e estruturará seus objetivos automaticamente',
    'voice.loading': 'Carregando vozes disponíveis...',
  },

  nl: {
    // Phase titles
    'phase.init': 'PHOENIX INITIALISEREN',
    'phase.language': 'TAAL SELECTEREN',
    'phase.voice': 'STEM SELECTEREN',
    'phase.persona': 'PERSOONLIJKHEID SELECTEREN',
    'phase.auth': 'ACCOUNT AANMAKEN',
    'phase.verify': 'ACCOUNT VERIFIËREN',
    'phase.sync': 'APPARATEN SYNCHRONISEREN',
    'phase.goals': 'DOELEN INSTELLEN',
    'phase.launch': 'INITIALISATIE VOLTOOID',

    // Phase subtitles
    'phase.subtitle': 'AI-AANGEDREVEN LEVENS-BESTURINGSSYSTEEM',
    'phase.language.subtitle': 'KIES UW VOORKEURSTAAL',
    'phase.voice.subtitle': 'KIES UW VOORKEURSSTEM',
    'phase.persona.subtitle': 'KIES UW AI-PERSOONLIJKHEID',
    'phase.auth.subtitle': 'REGISTREER UW INLOGGEGEVENS',
    'phase.verify.subtitle': 'BEVESTIG UW IDENTITEIT',
    'phase.sync.subtitle': 'VERBIND UW LEVEN',
    'phase.goals.subtitle': 'WAT WIL JE BEREIKEN?',
    'phase.launch.subtitle': 'UW AI IS KLAAR',

    // Phase 0 intro text
    'intro.companion': 'IK BEN PHOENIX, UW PERSOONLIJKE AI-METGEZEL.',
    'intro.help': 'IK ZAL U HELPEN UW GEZONDHEID, FITNESS, PRODUCTIVITEIT EN LEVENSBESLISSINGEN TE OPTIMALISEREN.',
    'intro.setup': 'LATEN WE U INSTELLEN. DIT DUURT ONGEVEER 180 SECONDEN.',

    // Status messages
    'status.systemReady': '[ SYSTEEM KLAAR ]',

    // Buttons
    'btn.continue': 'DOORGAAN',
    'btn.back': 'TERUG',
    'btn.skip': 'OVERSLAAN',
    'btn.test': 'TESTEN',
    'btn.preview': 'VOORBEELD',
    'btn.launch': 'DASHBOARD STARTEN',
    'btn.initializeSystem': '[ SYSTEEM INITIALISEREN ]',

    // Personalities
    'persona.friendly': 'Vriendelijke Helper',
    'persona.professional': 'Professionele Expert',
    'persona.british': 'Britse Butler',
    'persona.storyteller': 'Creatieve Verteller',
    'persona.gentle': 'Zachte Gids',
    'persona.efficient': 'Efficiënte Assistent',
    'persona.coach': 'Motiverende Coach',
    'persona.zen': 'Zen Meester',
    'persona.tech': 'Tech Genie',
    'persona.comedian': 'Komiek',
    'persona.therapist': 'Therapeut',
    'persona.commander': 'Commandant',

    // Personality descriptions
    'persona.friendly.desc': 'Warm en ondersteunend',
    'persona.professional.desc': 'Direct en efficiënt',
    'persona.british.desc': 'Verfijnd en hoffelijk',
    'persona.storyteller.desc': 'Creatief en fantasierijk',
    'persona.nurturing.desc': 'Zorgzaam en geduldig',
    'persona.efficient.desc': 'Neutraal en evenwichtig',
    'persona.coach.desc': 'Energieke motivator',
    'persona.zen.desc': 'Kalm en bewust',
    'persona.tech.desc': 'Slim en analytisch',
    'persona.comedian.desc': 'Geestig en leuk',
    'persona.therapist.desc': 'Begripvolle luisteraar',
    'persona.commander.desc': 'Besluitvaardige leider',

    'form.name': 'Volledige Naam',
    'form.email': 'E-mailadres',
    'form.password': 'Wachtwoord',
    'form.phone': 'Telefoonnummer',
    'form.goals': 'Wat zijn je doelen?',

    'status.voice.standby': 'STEM STAND-BY',
    'status.voice.active': 'STEM ACTIEF',

    'voice.nova': 'Warm vriendelijk',
    'voice.fable': 'Britse verteller',
    'voice.echo': 'Britse butler',
    'voice.alloy': 'Neutraal gebalanceerd',
    'voice.onyx': 'Diep professioneel',
    'voice.shimmer': 'Zachte gids',

    // Dashboard
    'dashboard.voiceMode': 'STEM',
    'dashboard.manualMode': 'HANDMATIG',
    'dashboard.initializing': 'AI-SYSTEMEN INITIALISEREN...',
    'dashboard.welcomeBack': 'Welkom Terug',
    'dashboard.allSystemsOperational': 'Alle systemen operationeel',
    'dashboard.syncYourLife': 'SYNCHRONISEER UW LEVEN',
    'dashboard.syncDescription': 'Verbind uw apparaten, agenda\'s, banken en doelen om het volledige potentieel van Phoenix te ontsluiten. Hoe meer gegevens ik heb, hoe slimmer ik word.',
    'dashboard.startSync': 'START SYNCHRONISATIE',
    'dashboard.skipForNow': 'NU OVERSLAAN',

    'goals.placeholder': 'Typ hier je doelen (bijv. "Ik wil 10kg afvallen en een marathon lopen")',
    'goals.ai_note': '✨ Phoenix AI zal je doelen automatisch analyseren en structureren',
    'voice.loading': 'Beschikbare stemmen laden...',
  },

  pl: {
    // Phase titles
    'phase.init': 'INICJALIZACJA PHOENIX',
    'phase.language': 'WYBIERZ JĘZYK',
    'phase.voice': 'WYBIERZ GŁOS',
    'phase.persona': 'WYBIERZ OSOBOWOŚĆ',
    'phase.auth': 'UTWÓRZ KONTO',
    'phase.verify': 'ZWERYFIKUJ KONTO',
    'phase.sync': 'SYNCHRONIZUJ URZĄDZENIA',
    'phase.goals': 'USTAW CELE',
    'phase.launch': 'INICJALIZACJA ZAKOŃCZONA',

    // Phase subtitles
    'phase.subtitle': 'SYSTEM OPERACYJNY ŻYCIA ZASILANY AI',
    'phase.language.subtitle': 'WYBIERZ PREFEROWANY JĘZYK',
    'phase.voice.subtitle': 'WYBIERZ PREFEROWANY GŁOS',
    'phase.persona.subtitle': 'WYBIERZ OSOBOWOŚĆ AI',
    'phase.auth.subtitle': 'ZAREJESTRUJ SWOJE DANE',
    'phase.verify.subtitle': 'POTWIERDŹ SWOJĄ TOŻSAMOŚĆ',
    'phase.sync.subtitle': 'POŁĄCZ SWOJE ŻYCIE',
    'phase.goals.subtitle': 'CO CHCESZ OSIĄGNĄĆ?',
    'phase.launch.subtitle': 'TWOJE AI JEST GOTOWE',

    // Phase 0 intro text
    'intro.companion': 'JESTEM PHOENIX, TWOIM OSOBISTYM TOWARZYSZEM AI.',
    'intro.help': 'POMOGĘ CI ZOPTYMALIZOWAĆ ZDROWIE, FITNESS, PRODUKTYWNOŚĆ I DECYZJE ŻYCIOWE.',
    'intro.setup': 'SKONFIGURUJMY CIĘ. ZAJMIE TO OKOŁO 180 SEKUND.',

    // Status messages
    'status.systemReady': '[ SYSTEM GOTOWY ]',

    // Buttons
    'btn.continue': 'KONTYNUUJ',
    'btn.back': 'WSTECZ',
    'btn.skip': 'POMIŃ',
    'btn.test': 'TESTUJ',
    'btn.preview': 'PODGLĄD',
    'btn.launch': 'URUCHOM PANEL',
    'btn.initializeSystem': '[ ZAINICJALIZUJ SYSTEM ]',

    // Personalities
    'persona.friendly': 'Przyjazny Pomocnik',
    'persona.professional': 'Profesjonalny Ekspert',
    'persona.british': 'Brytyjski Kamerdyner',
    'persona.storyteller': 'Kreatywny Opowiadacz',
    'persona.gentle': 'Delikatny Przewodnik',
    'persona.efficient': 'Wydajny Asystent',
    'persona.coach': 'Motywujący Trener',
    'persona.zen': 'Mistrz Zen',
    'persona.tech': 'Geniusz Technologii',
    'persona.comedian': 'Komik',
    'persona.therapist': 'Terapeuta',
    'persona.commander': 'Dowódca',

    // Personality descriptions
    'persona.friendly.desc': 'Ciepły i wspierający',
    'persona.professional.desc': 'Bezpośredni i wydajny',
    'persona.british.desc': 'Wyrafinowany i uprzejmy',
    'persona.storyteller.desc': 'Kreatywny i pomysłowy',
    'persona.nurturing.desc': 'Troskliwy i cierpliwy',
    'persona.efficient.desc': 'Neutralny i zrównoważony',
    'persona.coach.desc': 'Energiczny motywator',
    'persona.zen.desc': 'Spokojny i uważny',
    'persona.tech.desc': 'Inteligentny i analityczny',
    'persona.comedian.desc': 'Dowcipny i zabawny',
    'persona.therapist.desc': 'Wyrozumiały słuchacz',
    'persona.commander.desc': 'Zdecydowany przywódca',

    'form.name': 'Pełne Imię i Nazwisko',
    'form.email': 'Adres Email',
    'form.password': 'Hasło',
    'form.phone': 'Numer Telefonu',
    'form.goals': 'Jakie są twoje cele?',

    'status.voice.standby': 'GŁOS W GOTOWOŚCI',
    'status.voice.active': 'GŁOS AKTYWNY',

    'voice.nova': 'Ciepła przyjazna',
    'voice.fable': 'Brytyjski gawędziarz',
    'voice.echo': 'Brytyjski lokaj',
    'voice.alloy': 'Neutralna zrównoważona',
    'voice.onyx': 'Głęboka profesjonalna',
    'voice.shimmer': 'Delikatna przewodniczka',

    // Dashboard
    'dashboard.voiceMode': 'GŁOS',
    'dashboard.manualMode': 'MANUALNY',
    'dashboard.initializing': 'INICJALIZACJA SYSTEMÓW AI...',
    'dashboard.welcomeBack': 'Witaj Ponownie',
    'dashboard.allSystemsOperational': 'Wszystkie systemy działają',
    'dashboard.syncYourLife': 'ZSYNCHRONIZUJ SWOJE ŻYCIE',
    'dashboard.syncDescription': 'Połącz swoje urządzenia, kalendarze, banki i cele, aby odblokować pełny potencjał Phoenix. Im więcej danych mam, tym bardziej staję się inteligentny.',
    'dashboard.startSync': 'ROZPOCZNIJ SYNCHRONIZACJĘ',
    'dashboard.skipForNow': 'POMIŃ NA RAZIE',

    'goals.placeholder': 'Wpisz tutaj swoje cele (np. "Chcę schudnąć 10kg i przebiec maraton")',
    'goals.ai_note': '✨ Phoenix AI automatycznie przeanalizuje i uporządkuje Twoje cele',
    'voice.loading': 'Ładowanie dostępnych głosów...',
  },

  ru: {
    // Phase titles
    'phase.init': 'ИНИЦИАЛИЗАЦИЯ PHOENIX',
    'phase.language': 'ВЫБРАТЬ ЯЗЫК',
    'phase.voice': 'ВЫБРАТЬ ГОЛОС',
    'phase.persona': 'ВЫБРАТЬ ЛИЧНОСТЬ',
    'phase.auth': 'СОЗДАТЬ АККАУНТ',
    'phase.verify': 'ПОДТВЕРДИТЬ АККАУНТ',
    'phase.sync': 'СИНХРОНИЗИРОВАТЬ УСТРОЙСТВА',
    'phase.goals': 'УСТАНОВИТЬ ЦЕЛИ',
    'phase.launch': 'ИНИЦИАЛИЗАЦИЯ ЗАВЕРШЕНА',

    // Phase subtitles
    'phase.subtitle': 'ЖИЗНЕННАЯ ОПЕРАЦИОННАЯ СИСТЕМА НА БАЗЕ ИИ',
    'phase.language.subtitle': 'ВЫБЕРИТЕ ПРЕДПОЧИТАЕМЫЙ ЯЗЫК',
    'phase.voice.subtitle': 'ВЫБЕРИТЕ ПРЕДПОЧИТАЕМЫЙ ГОЛОС',
    'phase.persona.subtitle': 'ВЫБЕРИТЕ ЛИЧНОСТЬ ИИ',
    'phase.auth.subtitle': 'ЗАРЕГИСТРИРУЙТЕ СВОИ УЧЕТНЫЕ ДАННЫЕ',
    'phase.verify.subtitle': 'ПОДТВЕРДИТЕ СВОЮ ЛИЧНОСТЬ',
    'phase.sync.subtitle': 'ПОДКЛЮЧИТЕ СВОЮ ЖИЗНЬ',
    'phase.goals.subtitle': 'ЧЕГО ВЫ ХОТИТЕ ДОСТИЧЬ?',
    'phase.launch.subtitle': 'ВАШ ИИ ГОТОВ',

    // Phase 0 intro text
    'intro.companion': 'Я PHOENIX, ВАШ ЛИЧНЫЙ ИИ-КОМПАНЬОН.',
    'intro.help': 'Я ПОМОГУ ВАМ ОПТИМИЗИРОВАТЬ ЗДОРОВЬЕ, ФИТНЕС, ПРОДУКТИВНОСТЬ И ЖИЗНЕННЫЕ РЕШЕНИЯ.',
    'intro.setup': 'ДАВАЙТЕ НАСТРОИМ ВАС. ЭТО ЗАЙМЁТ ПРИМЕРНО 180 СЕКУНД.',

    // Status messages
    'status.systemReady': '[ СИСТЕМА ГОТОВА ]',

    // Buttons
    'btn.continue': 'ПРОДОЛЖИТЬ',
    'btn.back': 'НАЗАД',
    'btn.skip': 'ПРОПУСТИТЬ',
    'btn.test': 'ТЕСТ',
    'btn.preview': 'ПРЕДПРОСМОТР',
    'btn.launch': 'ЗАПУСТИТЬ ПАНЕЛЬ',
    'btn.initializeSystem': '[ ИНИЦИАЛИЗИРОВАТЬ СИСТЕМУ ]',

    // Personalities
    'persona.friendly': 'Дружелюбный Помощник',
    'persona.professional': 'Профессиональный Эксперт',
    'persona.british': 'Британский Дворецкий',
    'persona.storyteller': 'Творческий Рассказчик',
    'persona.gentle': 'Мягкий Проводник',
    'persona.efficient': 'Эффективный Ассистент',
    'persona.coach': 'Мотивационный Тренер',
    'persona.zen': 'Мастер Дзен',
    'persona.tech': 'Технический Гений',
    'persona.comedian': 'Комик',
    'persona.therapist': 'Терапевт',
    'persona.commander': 'Командир',

    // Personality descriptions
    'persona.friendly.desc': 'Теплый и поддерживающий',
    'persona.professional.desc': 'Прямой и эффективный',
    'persona.british.desc': 'Утонченный и вежливый',
    'persona.storyteller.desc': 'Творческий и образный',
    'persona.nurturing.desc': 'Заботливый и терпеливый',
    'persona.efficient.desc': 'Нейтральный и сбалансированный',
    'persona.coach.desc': 'Энергичный мотиватор',
    'persona.zen.desc': 'Спокойный и осознанный',
    'persona.tech.desc': 'Умный и аналитический',
    'persona.comedian.desc': 'Остроумный и веселый',
    'persona.therapist.desc': 'Понимающий слушатель',
    'persona.commander.desc': 'Решительный лидер',

    'form.name': 'Полное Имя',
    'form.email': 'Адрес Электронной Почты',
    'form.password': 'Пароль',
    'form.phone': 'Номер Телефона',
    'form.goals': 'Каковы ваши цели?',

    'status.voice.standby': 'ГОЛОС В ОЖИДАНИИ',
    'status.voice.active': 'ГОЛОС АКТИВЕН',

    'voice.nova': 'Теплый дружелюбный',
    'voice.fable': 'Британский рассказчик',
    'voice.echo': 'Британский дворецкий',
    'voice.alloy': 'Нейтральный сбалансированный',
    'voice.onyx': 'Глубокий профессиональный',
    'voice.shimmer': 'Мягкий проводник',

    // Dashboard
    'dashboard.voiceMode': 'ГОЛОС',
    'dashboard.manualMode': 'РУЧНОЙ',
    'dashboard.initializing': 'ИНИЦИАЛИЗАЦИЯ СИСТЕМ ИИ...',
    'dashboard.welcomeBack': 'С Возвращением',
    'dashboard.allSystemsOperational': 'Все системы в норме',
    'dashboard.syncYourLife': 'СИНХРОНИЗИРУЙТЕ СВОЮ ЖИЗНЬ',
    'dashboard.syncDescription': 'Подключите свои устройства, календари, банки и цели, чтобы раскрыть весь потенциал Phoenix. Чем больше данных у меня есть, тем умнее я становлюсь.',
    'dashboard.startSync': 'НАЧАТЬ СИНХРОНИЗАЦИЮ',
    'dashboard.skipForNow': 'ПРОПУСТИТЬ ПОКА',

    'goals.placeholder': 'Введите здесь свои цели (напр. "Я хочу похудеть на 10кг и пробежать марафон")',
    'goals.ai_note': '✨ Phoenix AI автоматически проанализирует и структурирует ваши цели',
    'voice.loading': 'Загрузка доступных голосов...',
  },

  ja: {
    // Phase titles
    'phase.init': 'PHOENIX初期化',
    'phase.language': '言語を選択',
    'phase.voice': '音声を選択',
    'phase.persona': 'パーソナリティを選択',
    'phase.auth': 'アカウント作成',
    'phase.verify': 'アカウント確認',
    'phase.sync': 'デバイス同期',
    'phase.goals': '目標設定',
    'phase.launch': '初期化完了',

    // Phase subtitles
    'phase.subtitle': 'AI駆動のライフオペレーティングシステム',
    'phase.language.subtitle': '希望する言語を選んでください',
    'phase.voice.subtitle': '希望する音声を選んでください',
    'phase.persona.subtitle': 'AIのパーソナリティを選んでください',
    'phase.auth.subtitle': '認証情報を登録してください',
    'phase.verify.subtitle': '本人確認を行ってください',
    'phase.sync.subtitle': 'あなたの生活を接続してください',
    'phase.goals.subtitle': '何を達成したいですか？',
    'phase.launch.subtitle': 'あなたのAIが準備できました',

    // Phase 0 intro text
    'intro.companion': '私はPHOENIX、あなたの個人AIコンパニオンです。',
    'intro.help': 'あなたの健康、フィットネス、生産性、人生の決断を最適化するお手伝いをします。',
    'intro.setup': 'セットアップを始めましょう。これには約180秒かかります。',

    // Status messages
    'status.systemReady': '[ システム準備完了 ]',

    // Buttons
    'btn.continue': '続ける',
    'btn.back': '戻る',
    'btn.skip': 'スキップ',
    'btn.test': 'テスト',
    'btn.preview': 'プレビュー',
    'btn.launch': 'ダッシュボードを起動',
    'btn.initializeSystem': '[ システムを初期化 ]',

    // Personalities
    'persona.friendly': 'フレンドリーヘルパー',
    'persona.professional': 'プロフェッショナルエキスパート',
    'persona.british': 'イギリス執事',
    'persona.storyteller': 'クリエイティブストーリーテラー',
    'persona.gentle': 'ジェントルガイド',
    'persona.efficient': 'エフィシェントアシスタント',
    'persona.coach': 'モチベーションコーチ',
    'persona.zen': '禅マスター',
    'persona.tech': 'テックジーニアス',
    'persona.comedian': 'コメディアン',
    'persona.therapist': 'セラピスト',
    'persona.commander': 'コマンダー',

    // Personality descriptions
    'persona.friendly.desc': '温かく支援的',
    'persona.professional.desc': '率直で効率的',
    'persona.british.desc': '洗練され礼儀正しい',
    'persona.storyteller.desc': '創造的で想像力豊か',
    'persona.nurturing.desc': '思いやりがあり忍耐強い',
    'persona.efficient.desc': '中立的でバランスのとれた',
    'persona.coach.desc': 'エネルギッシュな動機づけ',
    'persona.zen.desc': '穏やかでマインドフル',
    'persona.tech.desc': '賢く分析的',
    'persona.comedian.desc': '機知に富み楽しい',
    'persona.therapist.desc': '理解ある聞き手',
    'persona.commander.desc': '決断力のあるリーダー',

    'form.name': '氏名',
    'form.email': 'メールアドレス',
    'form.password': 'パスワード',
    'form.phone': '電話番号',
    'form.goals': 'あなたの目標は何ですか？',

    'status.voice.standby': '音声スタンバイ',
    'status.voice.active': '音声アクティブ',

    'voice.nova': '温かくフレンドリー',
    'voice.fable': 'イギリスの語り部',
    'voice.echo': 'イギリスの執事',
    'voice.alloy': 'ニュートラルバランス',
    'voice.onyx': '深く専門的',
    'voice.shimmer': '優しいガイド',

    // Dashboard
    'dashboard.voiceMode': '音声',
    'dashboard.manualMode': '手動',
    'dashboard.initializing': 'AIシステムを初期化中...',
    'dashboard.welcomeBack': 'おかえりなさい',
    'dashboard.allSystemsOperational': 'すべてのシステムが正常に動作しています',
    'dashboard.syncYourLife': '生活を同期する',
    'dashboard.syncDescription': 'デバイス、カレンダー、銀行、目標を接続して、Phoenixの全機能を解放しましょう。データが多ければ多いほど、私はより賢くなります。',
    'dashboard.startSync': '同期を開始',
    'dashboard.skipForNow': '今はスキップ',

    'goals.placeholder': 'ここに目標を入力してください（例：「10kg痩せてマラソンを走りたい」）',
    'goals.ai_note': '✨ Phoenix AIが目標を自動的に分析して構造化します',
    'voice.loading': '利用可能な音声を読み込んでいます...',
  },

  zh: {
    // Phase titles
    'phase.init': 'PHOENIX初始化',
    'phase.language': '选择语言',
    'phase.voice': '选择语音',
    'phase.persona': '选择个性',
    'phase.auth': '创建账户',
    'phase.verify': '验证账户',
    'phase.sync': '同步设备',
    'phase.goals': '设置目标',
    'phase.launch': '初始化完成',

    // Phase subtitles
    'phase.subtitle': 'AI驱动的生活操作系统',
    'phase.language.subtitle': '选择您的首选语言',
    'phase.voice.subtitle': '选择您的首选语音',
    'phase.persona.subtitle': '选择您的AI个性',
    'phase.auth.subtitle': '注册您的凭据',
    'phase.verify.subtitle': '确认您的身份',
    'phase.sync.subtitle': '连接您的生活',
    'phase.goals.subtitle': '您想实现什么？',
    'phase.launch.subtitle': '您的AI已准备就绪',

    // Phase 0 intro text
    'intro.companion': '我是PHOENIX，您的个人AI伴侣。',
    'intro.help': '我将帮助您优化健康、健身、生产力和人生决策。',
    'intro.setup': '让我们开始设置。这大约需要180秒。',

    // Status messages
    'status.systemReady': '[ 系统就绪 ]',

    // Buttons
    'btn.continue': '继续',
    'btn.back': '返回',
    'btn.skip': '跳过',
    'btn.test': '测试',
    'btn.preview': '预览',
    'btn.launch': '启动仪表板',
    'btn.initializeSystem': '[ 初始化系统 ]',

    // Personalities
    'persona.friendly': '友好助手',
    'persona.professional': '专业专家',
    'persona.british': '英国管家',
    'persona.storyteller': '创意讲故事者',
    'persona.gentle': '温柔向导',
    'persona.efficient': '高效助理',
    'persona.coach': '励志教练',
    'persona.zen': '禅师',
    'persona.tech': '科技天才',
    'persona.comedian': '喜剧演员',
    'persona.therapist': '治疗师',
    'persona.commander': '指挥官',

    // Personality descriptions
    'persona.friendly.desc': '温暖且支持',
    'persona.professional.desc': '直接且高效',
    'persona.british.desc': '优雅且礼貌',
    'persona.storyteller.desc': '创意且富有想象力',
    'persona.nurturing.desc': '关怀且耐心',
    'persona.efficient.desc': '中立且平衡',
    'persona.coach.desc': '充满活力的激励者',
    'persona.zen.desc': '冷静且专注',
    'persona.tech.desc': '聪明且善于分析',
    'persona.comedian.desc': '机智且有趣',
    'persona.therapist.desc': '善解人意的倾听者',
    'persona.commander.desc': '果断的领导者',

    'form.name': '全名',
    'form.email': '电子邮件地址',
    'form.password': '密码',
    'form.phone': '电话号码',
    'form.goals': '您的目标是什么？',

    'status.voice.standby': '语音待机',
    'status.voice.active': '语音激活',

    'voice.nova': '温暖友好',
    'voice.fable': '英国讲故事者',
    'voice.echo': '英国管家',
    'voice.alloy': '中性平衡',
    'voice.onyx': '深沉专业',
    'voice.shimmer': '温柔向导',

    // Dashboard
    'dashboard.voiceMode': '语音',
    'dashboard.manualMode': '手动',
    'dashboard.initializing': '正在初始化AI系统...',
    'dashboard.welcomeBack': '欢迎回来',
    'dashboard.allSystemsOperational': '所有系统运行正常',
    'dashboard.syncYourLife': '同步您的生活',
    'dashboard.syncDescription': '连接您的设备、日历、银行和目标，以解锁Phoenix的全部潜力。我拥有的数据越多，我就变得越聪明。',
    'dashboard.startSync': '开始同步',
    'dashboard.skipForNow': '暂时跳过',

    'goals.placeholder': '在此输入您的目标（例如："我想减掉10公斤并跑马拉松"）',
    'goals.ai_note': '✨ Phoenix AI将自动分析和构建您的目标',
    'voice.loading': '正在加载可用语音...',
  },
};

// Current language (default English)
let currentLanguage = localStorage.getItem('phoenixLanguage') || 'en';

// Translation function
function t(key) {
  const lang = translations[currentLanguage];
  return lang[key] || translations.en[key] || key;
}

// Set language and update UI
function setLanguage(langCode) {
  currentLanguage = langCode;
  localStorage.setItem('phoenixLanguage', langCode);
  updateAllTranslations();
}

// Update all translatable elements
function updateAllTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = t(key);
    } else {
      el.textContent = t(key);
    }
  });
}

// Initialize i18n on page load
window.addEventListener('DOMContentLoaded', () => {
  updateAllTranslations();
});

// Export for global use
window.PhoenixI18n = {
  t,
  setLanguage,
  currentLanguage: () => currentLanguage,
  updateAllTranslations
};
