document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const themeToggle = document.getElementById('themeToggle');
    const onboardingModal = document.getElementById('onboardingModal');
    const closeOnboarding = document.getElementById('closeOnboarding');

    const defaultLocale = document.getElementById('defaultLocale');
    const countrySearch = document.getElementById('countrySearch');
    const smartEmail = document.getElementById('smartEmail');
    const matchPasswords = document.getElementById('matchPasswords');
    const checkAllBoxes = document.getElementById('checkAllBoxes');
    const piiSafe = document.getElementById('piiSafe');
    const autoSubmit = document.getElementById('autoSubmit');

    const profilesList = document.getElementById('profilesList');
    const newProfileBtn = document.getElementById('newProfileBtn');
    const profileEditor = document.getElementById('profileEditor');
    const editProfileName = document.getElementById('editProfileName');
    const currentProfileNameText = document.getElementById('currentProfileName');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const deleteProfileBtn = document.getElementById('deleteProfileBtn');
    const profileDataSummary = document.getElementById('profileDataSummary');

    const ruleSelectorInput = document.getElementById('ruleSelector');
    const ruleTypeSelect = document.getElementById('ruleType');
    const addRuleBtn = document.getElementById('addRuleBtn');
    const rulesList = document.getElementById('rulesList');
    const noRulesState = document.getElementById('noRulesState');

    const uiLangSelector = document.getElementById('uiLangSelector');

    // Sürüm etiketi manifest'ten okunur; sabit metin sürümle birlikte kaymaz
    const versionLabel = document.getElementById('versionLabel');
    if (versionLabel) versionLabel.innerText = 'v' + chrome.runtime.getManifest().version;

    let state = {
        theme: 'dark',
        preferredLocale: 'tr',
        uiLang: 'en',
        smartEmail: true,
        matchPasswords: true,
        checkAllBoxes: false,
        piiSafe: true,
        autoSubmit: false,
        profiles: [{ id: 'default', name: 'Standard Persona' }],
        activeProfileId: 'default',
        customRules: [],
        onboardingComplete: false
    };

    // 1. Theme Management
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        themeToggle.checked = (theme === 'dark');
    }

    themeToggle.addEventListener('change', () => {
        state.theme = themeToggle.checked ? 'dark' : 'light';
        applyTheme(state.theme);
        saveState();
    });

    // 2. Localization
    const i18n = {
        en: {
            genTitle: "General Settings",
            genSub: "Global configuration for the filling engine.",
            countryTitle: "Default Country",
            countryDesc: "The primary data source used for initial filling.",
            countrySearch: "Filter countries...",
            smartTitle: "Smart Features",
            smartDesc: "Advanced logic to make fake data feel real.",
            smartEmailLabel: "Smart Email Linking",
            smartEmailDesc: "Generate emails based on names (e.g. john.doe@example.com)",
            matchPasswordsLabel: "Match Passwords",
            checkAllBoxesLabel: "Check All Checkboxes",
            checkAllBoxesDesc: "Check every checkbox instead of a random selection.",
            matchPasswordsDesc: "Automatically fill 'Confirm Password' fields with the same value.",
            piiSafeLabel: "PII Safe Mode",
            piiSafeDesc: "Generate generic data (e.g. 'User 1') to avoid privacy issues.",
            autoSubmitLabel: "Auto-Submit Form",
            autoSubmitDesc: "Tries to click the submit button after filling all fields.",
            profilesTitle: "Data Presets",
            profilesSub: "Create different personas for testing scenarios.",
            myProfilesTitle: "My Profiles",
            newProfileBtn: "+ Create New Preset",
            editPresetLabel: "Edit Preset",
            presetNameLabel: "Preset Name",
            saveProfileBtn: "Save Changes",
            deleteProfileBtn: "Delete Preset",
            rulesTitle: "Custom Rules",
            rulesSub: "Bridge the gap between detection and custom fields.",
            addRuleTitle: "Add Selector Mapping",
            selectorLabel: "CSS Selector (id, class, etc.)",
            typeLabel: "Data Type",
            addRuleBtn: "Add Mapping",
            activeMappingsTitle: "Active Mappings",
            noRulesText: "No custom rules defined yet. Create one above!",
            aboutTitle: "About Filler Max",
            aboutSub: "The elite developer tool for rapid form testing.",
            aboutDescription: "Filler Max is designed for developers who value their time. Our engine uses advanced heuristics and context-aware generation.",
            uiLangLabel: "UI Language",
            onboardingTitle: "Welcome to Filler Max! 🚀",
            startedBtn: "Get Started",
            darkModeLabel: "Dark Mode",
            navTextGeneral: "General",
            navTextProfiles: "Profiles",
            navTextRules: "Custom Rules",
            navTextAbout: "About"
        },
        tr: {
            genTitle: "Genel Ayarlar",
            genSub: "Doldurma motoru için global konfigürasyon.",
            countryTitle: "Varsayılan Ülke",
            countryDesc: "Başlangıç doldurması için kullanılan ana veri kaynağı.",
            countrySearch: "Ülkeleri filtrele...",
            smartTitle: "Akıllı Özellikler",
            smartDesc: "Sahte verileri gerçek hissettiren gelişmiş mantık.",
            smartEmailLabel: "Akıllı E-posta Bağlantısı",
            smartEmailDesc: "İsimlere göre e-posta oluştur (örn: ahmet.yilmaz@test.com)",
            matchPasswordsLabel: "Şifreleri Eşleştir",
            checkAllBoxesLabel: "Tüm Onay Kutularını İşaretle",
            checkAllBoxesDesc: "Rastgele seçim yerine tüm onay kutularını işaretler.",
            matchPasswordsDesc: "'Şifreyi Onayla' alanlarını otomatik olarak aynı değerle doldur.",
            piiSafeLabel: "KVKK/PII Güvenli Mod",
            piiSafeDesc: "Gizlilik için gerçekçi isimler yerine jenerik veriler (örn: 'Kullanıcı 1') üret.",
            autoSubmitLabel: "Otomatik Gönder",
            autoSubmitDesc: "Tüm alanları doldurduktan sonra gönder butonuna tıklamaya çalışır.",
            profilesTitle: "Veri Şablonları",
            profilesSub: "Test senaryoları için farklı personalar oluşturun.",
            myProfilesTitle: "Şablonlarım",
            newProfileBtn: "+ Yeni Şablon Oluştur",
            editPresetLabel: "Şablonu Düzenle",
            presetNameLabel: "Şablon Adı",
            saveProfileBtn: "Değişiklikleri Kaydet",
            deleteProfileBtn: "Şablonu Sil",
            rulesTitle: "Özel Kurallar",
            rulesSub: "Tespit ve özel alanlar arasındaki boşluğu doldurun.",
            addRuleTitle: "Seçici Eşleme Ekle",
            selectorLabel: "CSS Seçici (id, class, vb.)",
            typeLabel: "Veri Tipi",
            addRuleBtn: "Eşleme Ekle",
            activeMappingsTitle: "Aktif Eşlemeler",
            noRulesText: "Henüz özel kural tanımlanmadı. Yukarıdan bir tane oluşturun!",
            aboutTitle: "Filler Max Hakkında",
            aboutSub: "Hızlı form testi için elit geliştirici aracı.",
            aboutDescription: "Filler Max, zamanına değer veren geliştiriciler için tasarlandı. Motorumuz gelişmiş sezgisel yöntemler kullanır.",
            uiLangLabel: "Arayüz Dili",
            onboardingTitle: "Filler Max'a Hoş Geldiniz! 🚀",
            startedBtn: "Başlayın",
            darkModeLabel: "Karanlık Mod",
            navTextGeneral: "Genel",
            navTextProfiles: "Profiller",
            navTextRules: "Özel Kurallar",
            navTextAbout: "Hakkında"
        },
        es: {
            genTitle: "Ajustes Generales",
            genSub: "Configuración global del motor de llenado.",
            countryTitle: "País Predeterminado",
            countryDesc: "La fuente principal de datos para el llenado inicial.",
            countrySearch: "Filtrar países...",
            smartTitle: "Funciones Inteligentes",
            smartDesc: "Lógica avanzada para que los datos falsos parezcan reales.",
            smartEmailLabel: "Vinculación de Email Inteligente",
            smartEmailDesc: "Generar correos basados en nombres.",
            matchPasswordsLabel: "Coincidir Contraseñas",
            checkAllBoxesLabel: "Marcar Todas las Casillas",
            checkAllBoxesDesc: "Marca todas las casillas en lugar de una selección aleatoria.",
            matchPasswordsDesc: "Llenar automáticamente 'Confirmar Contraseña'.",
            piiSafeLabel: "Modo Seguro PII",
            piiSafeDesc: "Generar datos genéricos (ej. 'Usuario 1') para privacidad.",
            autoSubmitLabel: "Envío Automático",
            autoSubmitDesc: "Intenta hacer clic en el botón de envío.",
            profilesTitle: "Ajustes de Datos",
            profilesSub: "Crea diferentes personas para escenarios de prueba.",
            myProfilesTitle: "Mis Perfiles",
            newProfileBtn: "+ Crear Nuevo Ajuste",
            editPresetLabel: "Editar Ajuste",
            presetNameLabel: "Nombre del Ajuste",
            saveProfileBtn: "Guardar Cambios",
            deleteProfileBtn: "Eliminar Ajuste",
            rulesTitle: "Reglas Personalizadas",
            rulesSub: "Cierra la brecha entre detección y campos.",
            addRuleTitle: "Agregar Mapeo",
            selectorLabel: "Selector CSS",
            typeLabel: "Tipo de Datos",
            addRuleBtn: "Agregar Mapeo",
            activeMappingsTitle: "Mapeos Activos",
            noRulesText: "No hay reglas definidas aún.",
            aboutTitle: "Sobre Filler Max",
            aboutSub: "Herramienta de élite para pruebas rápidas.",
            aboutDescription: "Diseñado para desarrolladores que valoran su tiempo.",
            uiLangLabel: "Idioma de la Interfaz",
            onboardingTitle: "¡Bienvenido a Filler Max! 🚀",
            startedBtn: "Empezar",
            darkModeLabel: "Modo Oscuro",
            navTextGeneral: "General",
            navTextProfiles: "Perfiles",
            navTextRules: "Reglas",
            navTextAbout: "Sobre"
        },
        fr: {
            genTitle: "Paramètres Généraux",
            genSub: "Configuration globale du moteur de remplissage.",
            countryTitle: "Pays par Défaut",
            countryDesc: "La source de données principale pour le remplissage.",
            countrySearch: "Filtrer les pays...",
            smartTitle: "Fonctions Intelligentes",
            smartDesc: "Logique avancée pour les données factices.",
            smartEmailLabel: "Liaison Email Intelligente",
            smartEmailDesc: "Emails basés sur les noms.",
            matchPasswordsLabel: "Egaler les mots de passe",
            checkAllBoxesLabel: "Cocher Toutes les Cases",
            checkAllBoxesDesc: "Coche toutes les cases au lieu d'une sélection aléatoire.",
            matchPasswordsDesc: "Remplir 'Confirmer le mot de passe'.",
            piiSafeLabel: "Mode PII Sécurisé",
            piiSafeDesc: "Générer des données génériques (ex. 'Utilisateur 1').",
            autoSubmitLabel: "Envoi Automatique",
            autoSubmitDesc: "Clique sur envoyer automatiquement.",
            profilesTitle: "Préréglages de Données",
            profilesSub: "Créez différentes personas.",
            myProfilesTitle: "Mes Profils",
            newProfileBtn: "+ Nouveau Préréglage",
            editPresetLabel: "Modifier le Préréglage",
            presetNameLabel: "Nom du Préréglage",
            saveProfileBtn: "Enregistrer",
            deleteProfileBtn: "Supprimer",
            rulesTitle: "Règles Personnalisées",
            rulesSub: "Comblez l'écart entre détection et champs.",
            addRuleTitle: "Ajouter un Mappage",
            selectorLabel: "Sélecteur CSS",
            typeLabel: "Type de Données",
            addRuleBtn: "Ajouter",
            activeMappingsTitle: "Mappages Actifs",
            noRulesText: "Aucune règle définie.",
            aboutTitle: "À Propos de Filler Max",
            aboutSub: "Outil d'élite pour le test rapide.",
            aboutDescription: "Conçu pour les développeurs pressés.",
            uiLangLabel: "Langue de l'IU",
            onboardingTitle: "Bienvenue sur Filler Max ! 🚀",
            startedBtn: "Commencer",
            darkModeLabel: "Mode Sombre",
            navTextGeneral: "Général",
            navTextProfiles: "Profils",
            navTextRules: "Règles",
            navTextAbout: "À Propos"
        },
        de: {
            genTitle: "Allgemeine Einstellungen",
            genSub: "Globale Konfiguration für die Füll-Engine.",
            countryTitle: "Standardland",
            countryDesc: "Die primäre Datenquelle für die Erstbefüllung.",
            countrySearch: "Länder filtern...",
            smartTitle: "Intelligente Funktionen",
            smartDesc: "Erweiterte Logik, damit Fake-Daten echt wirken.",
            smartEmailLabel: "Intelligente E-Mail-Verknüpfung",
            smartEmailDesc: "E-Mails basierend auf Namen.",
            matchPasswordsLabel: "Passwörter abgleichen",
            checkAllBoxesLabel: "Alle Kontrollkästchen Aktivieren",
            checkAllBoxesDesc: "Aktiviert alle Kontrollkästchen statt einer zufälligen Auswahl.",
            matchPasswordsDesc: "'Passwort bestätigen' füllen.",
            piiSafeLabel: "PII Sicherer Modus",
            piiSafeDesc: "Generische Daten (z.B. 'Benutzer 1') verwenden.",
            autoSubmitLabel: "Auto-Absenden",
            autoSubmitDesc: "Klickt automatisch auf Absenden.",
            profilesTitle: "Daten-Presets",
            profilesSub: "Verschiedene Personas erstellen.",
            myProfilesTitle: "Meine Profile",
            newProfileBtn: "+ Neues Preset",
            editPresetLabel: "Preset bearbeiten",
            presetNameLabel: "Preset-Name",
            saveProfileBtn: "Speichern",
            deleteProfileBtn: "Löschen",
            rulesTitle: "Benutzerdefinierte Regeln",
            rulesSub: "Lücke zwischen Erkennung und Feldern schließen.",
            addRuleTitle: "Mapping hinzufügen",
            selectorLabel: "CSS-Selektor",
            typeLabel: "Datentyp",
            addRuleBtn: "Hinzufügen",
            activeMappingsTitle: "Aktive Mappings",
            noRulesText: "Keine Regeln definiert.",
            aboutTitle: "Über Filler Max",
            aboutSub: "Elite-Entwicklertool für Tests.",
            aboutDescription: "Für Entwickler, die Zeit sparen wollen.",
            uiLangLabel: "Anzeigesprache",
            onboardingTitle: "Willkommen bei Filler Max! 🚀",
            startedBtn: "Loslegen",
            darkModeLabel: "Dunkelmodus",
            navTextGeneral: "Allgemein",
            navTextProfiles: "Profile",
            navTextRules: "Regeln",
            navTextAbout: "Über"
        },
        ru: {
            genTitle: "Общие Настройки",
            genSub: "Глобальная конфигурация механизма заполнения.",
            countryTitle: "Страна по Умолчанию",
            countryDesc: "Основной источник данных.",
            countrySearch: "Поиск страны...",
            smartTitle: "Умные Функции",
            smartDesc: "Продвинутая логика.",
            smartEmailLabel: "Умная Эл. Почта",
            matchPasswordsLabel: "Сверка Паролей",
            checkAllBoxesLabel: "Отмечать Все Флажки",
            checkAllBoxesDesc: "Отмечает все флажки вместо случайной выборки.",
            piiSafeLabel: "Безопасный режим PII",
            piiSafeDesc: "Генерировать данные типа 'Пользователь 1'.",
            autoSubmitLabel: "Авто-Отправка",
            profilesTitle: "Пресеты Данных",
            profilesSub: "Персоны для тестов.",
            myProfilesTitle: "Мои Профили",
            newProfileBtn: "+ Создать Новый Пресет",
            editPresetLabel: "Редактировать Пресет",
            presetNameLabel: "Имя Пресета",
            saveProfileBtn: "Сохранить Изменения",
            deleteProfileBtn: "Удалить Пресет",
            rulesTitle: "Свои Правила",
            rulesSub: "Сократите разрыв между обнаружением и полями.",
            addRuleTitle: "Добавить Правило",
            selectorLabel: "CSS Селектор",
            typeLabel: "Тип Данных",
            addRuleBtn: "Добавить Правило",
            activeMappingsTitle: "Активные Правила",
            noRulesText: "Пользовательские правила еще не определены. Создайте одно выше!",
            aboutTitle: "О Filler Max",
            aboutSub: "Элитный инструмент разработчика.",
            aboutDescription: "Filler Max разработан для разработчиков, которые ценят свое время. Наш движок использует передовые эвристики.",
            uiLangLabel: "Язык Интерфейса",
            onboardingTitle: "Добро пожаловать в Filler Max! 🚀",
            startedBtn: "Начать",
            darkModeLabel: "Темная Тема",
            navTextGeneral: "Общие",
            navTextProfiles: "Профили",
            navTextRules: "Правила",
            navTextAbout: "О нас"
        },
        pt: {
            genTitle: "Configurações Gerais",
            genSub: "Configuração global para o motor.",
            countryTitle: "País Padrão",
            countryDesc: "Fonte principal de dados.",
            countrySearch: "Filtrar países...",
            smartTitle: "Recursos Inteligentes",
            smartDesc: "Lógica avançada para dados.",
            smartEmailLabel: "Link de E-mail Inteligente",
            smartEmailDesc: "Gerar e-mails com base em nomes.",
            matchPasswordsLabel: "Combinar Senhas",
            checkAllBoxesLabel: "Marcar Todas as Caixas",
            checkAllBoxesDesc: "Marca todas as caixas em vez de uma seleção aleatória.",
            matchPasswordsDesc: "Preencher automaticamente 'Confirmar Senha'.",
            piiSafeLabel: "Modo Seguro PII",
            piiSafeDesc: "Gerar dados genéricos (ex. 'Usuário 1').",
            autoSubmitLabel: "Envio Automático",
            autoSubmitDesc: "Tenta clicar no botão de envio.",
            profilesTitle: "Predefinições de Dados",
            profilesSub: "Personas para testes.",
            myProfilesTitle: "Meus Perfis",
            newProfileBtn: "+ Criar Nova Predefinição",
            editPresetLabel: "Editar Predefinição",
            presetNameLabel: "Nome da Predefinição",
            saveProfileBtn: "Salvar Alterações",
            deleteProfileBtn: "Excluir Predefinição",
            rulesTitle: "Regras Personalizadas",
            rulesSub: "Preencher a lacuna entre detecção e campos.",
            addRuleTitle: "Adicionar Mapeamento",
            selectorLabel: "Seletor CSS",
            typeLabel: "Tipo de Dados",
            addRuleBtn: "Adicionar Mapeamento",
            activeMappingsTitle: "Mapeamentos Ativos",
            noRulesText: "Nenhuma regra personalizada definida ainda. Crie uma acima!",
            aboutTitle: "Sobre Filler Max",
            aboutSub: "Ferramenta de elite para desenvolvedores.",
            aboutDescription: "Filler Max foi projetado para desenvolvedores que valorizam seu tempo. Nosso motor usa heurísticas avançadas.",
            uiLangLabel: "Idioma da UI",
            onboardingTitle: "Bem-vindo ao Filler Max! 🚀",
            startedBtn: "Começar",
            darkModeLabel: "Modo Escuro",
            navTextGeneral: "Geral",
            navTextProfiles: "Perfis",
            navTextRules: "Regras",
            navTextAbout: "Sobre"
        },
        zh: {
            genTitle: "常规设置",
            genSub: "填充引擎的全局配置。",
            countryTitle: "默认国家",
            countryDesc: "初始填充的主要数据源。",
            countrySearch: "筛选国家...",
            smartTitle: "智能功能",
            smartDesc: "使假数据感觉真实的逻辑。",
            smartEmailLabel: "智能电子邮件链接",
            smartEmailDesc: "根据名称生成电子邮件。",
            matchPasswordsLabel: "匹配密码",
            checkAllBoxesLabel: "勾选所有复选框",
            checkAllBoxesDesc: "勾选所有复选框，而不是随机选择。",
            matchPasswordsDesc: "自动填充“确认密码”字段。",
            piiSafeLabel: "PII 安全模式",
            piiSafeDesc: "生成通用数据（例如“用户 1”）以保护隐私。",
            autoSubmitLabel: "自动提交",
            autoSubmitDesc: "尝试在填充所有字段后点击提交按钮。",
            profilesTitle: "数据预设",
            profilesSub: "为不同场景创建人物角色。",
            myProfilesTitle: "我的预设",
            newProfileBtn: "+ 创建新预设",
            editPresetLabel: "编辑预设",
            presetNameLabel: "预设名称",
            saveProfileBtn: "保存更改",
            deleteProfileBtn: "删除预设",
            rulesTitle: "自定义规则",
            rulesSub: "弥合检测和自定义字段之间的差距。",
            addRuleTitle: "添加选择器映射",
            selectorLabel: "CSS 选择器",
            typeLabel: "数据类型",
            addRuleBtn: "添加映射",
            activeMappingsTitle: "活动映射",
            noRulesText: "尚未定义自定义规则。在上方创建一个！",
            aboutTitle: "关于 Filler Max",
            aboutSub: "精英开发人员测试工具。",
            aboutDescription: "Filler Max 专为重视时间的开发人员设计。我们的引擎使用高级启发式和上下文感知生成。",
            uiLangLabel: "界面语言",
            onboardingTitle: "欢迎使用 Filler Max! 🚀",
            startedBtn: "开始使用",
            darkModeLabel: "深色模式",
            navTextGeneral: "常规",
            navTextProfiles: "预设",
            navTextRules: "规则",
            navTextAbout: "关于"
        },
        ja: {
            genTitle: "一般設定",
            genSub: "エンジンのグローバル設定。",
            countryTitle: "デフォルトの国",
            countryDesc: "主要なデータソース。",
            countrySearch: "国を検索...",
            smartTitle: "スマート機能",
            smartDesc: "高度なロジック。",
            smartEmailLabel: "スマートメール連携",
            smartEmailDesc: "名前に基づいてメールを生成。",
            matchPasswordsLabel: "パスワード一致",
            checkAllBoxesLabel: "すべてのチェックボックスを選択",
            checkAllBoxesDesc: "ランダム選択ではなく、すべてのチェックボックスをオンにします。",
            matchPasswordsDesc: "「パスワードの確認」フィールドを自動入力。",
            piiSafeLabel: "PIIセーフモード",
            piiSafeDesc: "プライバシー保護のため一般的なデータを生成。",
            autoSubmitLabel: "自動送信",
            autoSubmitDesc: "すべてのフィールド入力後に送信ボタンをクリック。",
            profilesTitle: "データプリセット",
            profilesSub: "テスト用ペルソナ。",
            myProfilesTitle: "マイプロファイル",
            newProfileBtn: "+ 新しいプリセットを作成",
            editPresetLabel: "プリセットを編集",
            presetNameLabel: "プリセット名",
            saveProfileBtn: "変更を保存",
            deleteProfileBtn: "プリセットを削除",
            rulesTitle: "カスタムルール",
            rulesSub: "検出とカスタムフィールド間のギャップを埋める。",
            addRuleTitle: "新しいルールを追加",
            selectorLabel: "CSS セレクター",
            typeLabel: "データ型",
            addRuleBtn: "マッピングを追加",
            activeMappingsTitle: "アクティブなマッピング",
            noRulesText: "カスタムルールはまだ定義されていません。上記で作成してください！",
            aboutTitle: "Filler Maxについて",
            aboutSub: "迅速なテストのためのツール。",
            aboutDescription: "Filler Maxは、時間を大切にする開発者向けに設計されています。当社のエンジンは高度なヒューリスティクスを使用しています。",
            uiLangLabel: "表示言語",
            onboardingTitle: "Filler Maxへようこそ! 🚀",
            startedBtn: "今すぐ始める",
            darkModeLabel: "ダークモード",
            navTextGeneral: "一般",
            navTextProfiles: "プリセット",
            navTextRules: "ルール",
            navTextAbout: "概要"
        },
        ar: {
            genTitle: "الإعدادات العامة",
            genSub: "التكوين العام للمحرك.",
            countryTitle: "البلد الافتراضي",
            countryDesc: "مصدر البيانات الرئيسي.",
            countrySearch: "تصفية البلدان...",
            smartTitle: "الميزات الذكية",
            smartDesc: "منطق متقدم.",
            smartEmailLabel: "ربط البريد الذكي",
            smartEmailDesc: "إنشاء رسائل بريد إلكتروني بناءً على الأسماء.",
            matchPasswordsLabel: "طابق كلمات السر",
            checkAllBoxesLabel: "تحديد كل مربعات الاختيار",
            checkAllBoxesDesc: "يحدد كل مربعات الاختيار بدلاً من اختيار عشوائي.",
            matchPasswordsDesc: "ملء حقول 'تأكيد كلمة المرور' تلقائيًا.",
            piiSafeLabel: "وضع PII الآمن",
            piiSafeDesc: "استخدام بيانات عامة (مثل 'مستخدم 1') للخصوصية.",
            autoSubmitLabel: "إرسال تلقائي",
            autoSubmitDesc: "يحاول النقر على زر الإرسال بعد ملء جميع الحقول.",
            profilesTitle: "قوالب البيانات",
            profilesSub: "شخصيات للاختبار.",
            myProfilesTitle: "ملفاتي الشخصية",
            newProfileBtn: "+ إنشاء قالب جديد",
            editPresetLabel: "تعديل القالب",
            presetNameLabel: "اسم القالب",
            saveProfileBtn: "حفظ التغييرات",
            deleteProfileBtn: "حذف القالب",
            rulesTitle: "قواعد مخصصة",
            rulesSub: "سد الفجوة بين الكشف والحقول المخصصة.",
            addRuleTitle: "إضافة تعيين",
            selectorLabel: "محدد CSS",
            typeLabel: "نوع البيانات",
            addRuleBtn: "إضافة تعيين",
            activeMappingsTitle: "التعيينات النشطة",
            noRulesText: "لم يتم تعريف قواعد مخصصة بعد. أنشئ واحدة أعلاه!",
            aboutTitle: "حول Filler Max",
            aboutSub: "أداة النخبة للمطورين.",
            aboutDescription: "تم تصميم Filler Max للمطورين الذين يقدرون وقتهم. يستخدم محركنا أساليب استدلالية متقدمة.",
            uiLangLabel: "لغة الواجهة",
            onboardingTitle: "مرحباً بك في Filler Max! 🚀",
            startedBtn: "ابدأ الآن",
            darkModeLabel: "الوضع الداكن",
            navTextGeneral: "عام",
            navTextProfiles: "ملفات",
            navTextRules: "قواعد",
            navTextAbout: "حول"
        }
    };

    function updateUILanguage(lang) {
        const text = i18n[lang] || i18n.en;

        // Process all elements with matching IDs in the i18n object
        Object.keys(text).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (el.tagName === 'INPUT' && el.type === 'text') {
                    el.placeholder = text[id];
                } else {
                    el.innerText = text[id];
                }
            }
        });

        // Handle Nav links specifically if they are part of the sidebar
        if (text.navTextGeneral) document.getElementById('navTextGeneral').innerText = text.navTextGeneral;
        if (text.navTextProfiles) document.getElementById('navTextProfiles').innerText = text.navTextProfiles;
        if (text.navTextRules) document.getElementById('navTextRules').innerText = text.navTextRules;
        if (text.navTextAbout) document.getElementById('navTextAbout').innerText = text.navTextAbout;
    }

    uiLangSelector.addEventListener('change', () => {
        state.uiLang = uiLangSelector.value;
        updateUILanguage(state.uiLang);
        saveState();
    });

    // 3. Profiles Logic
    function buildPersona(name) {
        const firstName = FakeDataGenerator.generate('firstName', state.preferredLocale);
        const lastName = FakeDataGenerator.generate('lastName', state.preferredLocale);
        return {
            name,
            firstName,
            lastName,
            email: FakeDataGenerator.generate('email', state.preferredLocale, { firstName, lastName }),
            phone: FakeDataGenerator.generate('phone', state.preferredLocale),
            address: FakeDataGenerator.generate('address', state.preferredLocale),
            city: FakeDataGenerator.generate('city', state.preferredLocale),
            zip: FakeDataGenerator.generate('zip', state.preferredLocale),
            company: FakeDataGenerator.generate('company', state.preferredLocale),
            position: FakeDataGenerator.generate('position', state.preferredLocale),
            password: FakeDataGenerator.generate('password', state.preferredLocale)
        };
    }

    function renderProfiles() {
        profilesList.innerHTML = "";
        state.profiles.forEach(p => {
            const pill = document.createElement('span');
            pill.className = `profile-pill ${state.activeProfileId === p.id ? 'active' : ''}`;
            pill.innerText = p.name;
            pill.onclick = () => {
                state.activeProfileId = p.id;
                openProfileEditor(p);
                renderProfiles();
                saveState();
            };
            profilesList.appendChild(pill);
        });
    }

    function openProfileEditor(p) {
        profileEditor.style.display = "block";
        currentProfileNameText.innerText = p.name;
        editProfileName.value = p.name;
        profileDataSummary.innerText = Object.entries(p)
            .filter(([key]) => key !== 'id')
            .map(([key, value]) => key + ': ' + value)
            .join('\n');
    }

    // Presets created by older versions carry no persona data: fill them in once
    function ensurePersonaData() {
        let changed = false;
        state.profiles = state.profiles.map(p => {
            if (typeof p.firstName === 'string' && typeof p.lastName === 'string') return p;
            changed = true;
            return { id: p.id, ...buildPersona(p.name || 'Persona') };
        });
        if (changed) chrome.storage.local.set(state);
    }

    newProfileBtn.onclick = () => {
        const id = Date.now().toString();
        const newP = { id, ...buildPersona('New Persona') };
        state.profiles.push(newP);
        state.activeProfileId = id;
        renderProfiles();
        openProfileEditor(newP);
        saveState();
    };

    saveProfileBtn.onclick = () => {
        const p = state.profiles.find(x => x.id === state.activeProfileId);
        if (p) {
            p.name = editProfileName.value;
            renderProfiles();
            openProfileEditor(p);
            saveState();
        }
    };

    deleteProfileBtn.onclick = () => {
        if (state.profiles.length <= 1) return alert("You must have at least one profile.");
        state.profiles = state.profiles.filter(x => x.id !== state.activeProfileId);
        state.activeProfileId = state.profiles[0].id;
        profileEditor.style.display = "none";
        renderProfiles();
        saveState();
    };

    // 4. Custom Rules Logic
    function renderRules() {
        rulesList.innerHTML = "";
        if (state.customRules.length === 0) {
            noRulesState.style.display = "block";
            return;
        }
        noRulesState.style.display = "none";
        state.customRules.forEach((rule, idx) => {
            const row = document.createElement('div');
            row.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:12px; background:rgba(255,255,255,0.05); border-radius:12px; margin-bottom:8px;";
            row.innerHTML = `
        <div style="font-size:13px;"><code style="color:var(--primary); font-weight:bold;">${rule.selector}</code> → ${rule.type}</div>
        <button class="btn btn-danger" style="padding:4px 8px; font-size:11px;">Remove</button>
      `;
            row.querySelector('button').onclick = () => {
                state.customRules.splice(idx, 1);
                renderRules();
                saveState();
            };
            rulesList.appendChild(row);
        });
    }

    // 5. Populate Data
    const countries = FakeDataGenerator.getCountries();
    const dataTypes = FakeDataGenerator.getDataTypes();

    function detectDefaultCountry() {
        const tag = (navigator.language || 'en').toLowerCase();
        const [base, region] = tag.split('-');
        return FakeDataGenerator.getCountryForLanguage(region) || FakeDataGenerator.getCountryForLanguage(base) || 'us';
    }

    function detectDefaultUiLang() {
        const base = (navigator.language || 'en').toLowerCase().split('-')[0];
        return i18n[base] ? base : 'en';
    }

    function populateCountries(filter = "") {
        defaultLocale.innerHTML = "";
        countries.filter(c => c.name.toLowerCase().includes(filter.toLowerCase())).forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.code.toLowerCase();
            opt.innerText = c.name;
            defaultLocale.appendChild(opt);
        });
        defaultLocale.value = state.preferredLocale;
    }

    populateCountries();
    dataTypes.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.innerText = t.charAt(0).toUpperCase() + t.slice(1);
        ruleTypeSelect.appendChild(opt);
    });

    // 6. State Lifecycle
    function saveState() {
        state.preferredLocale = defaultLocale.value;
        state.smartEmail = smartEmail.checked;
        state.matchPasswords = matchPasswords.checked;
        state.checkAllBoxes = checkAllBoxes.checked;
        state.piiSafe = piiSafe.checked;
        state.autoSubmit = autoSubmit.checked;
        chrome.storage.local.set(state);
    }

    function loadState() {
        chrome.storage.local.get(null, (res) => {
            const hasState = Object.keys(res).length > 0;
            if (hasState) state = { ...state, ...res };
            if (!Array.isArray(state.profiles)) state.profiles = [{ id: 'default', name: 'Standard Persona' }];
            if (!hasState) {
                // İlk kurulum: ülke ve arayüz dili tarayıcıdan gelir
                state.preferredLocale = detectDefaultCountry();
                state.uiLang = detectDefaultUiLang();
            }
            ensurePersonaData();

            if (hasState) {
                applyTheme(state.theme);
                defaultLocale.value = state.preferredLocale;
                smartEmail.checked = state.smartEmail;
                matchPasswords.checked = state.matchPasswords;
                checkAllBoxes.checked = !!state.checkAllBoxes;
                piiSafe.checked = !!state.piiSafe;
                autoSubmit.checked = state.autoSubmit;
                uiLangSelector.value = state.uiLang || 'en';
                updateUILanguage(state.uiLang || 'en');
                renderProfiles();
                renderRules();

                if (!state.onboardingComplete) {
                    onboardingModal.style.display = "flex";
                }
            } else {
                // First run
                chrome.storage.local.set(state);
                populateCountries();
                piiSafe.checked = state.piiSafe;
                checkAllBoxes.checked = state.checkAllBoxes;
                uiLangSelector.value = state.uiLang;
                updateUILanguage(state.uiLang);
                renderProfiles();
                onboardingModal.style.display = "flex";
            }
        });
    }

    // Events
    countrySearch.oninput = (e) => populateCountries(e.target.value);
    defaultLocale.onchange = saveState;
    smartEmail.onchange = saveState;
    matchPasswords.onchange = saveState;
    checkAllBoxes.onchange = saveState;
    piiSafe.onchange = saveState;
    autoSubmit.onchange = saveState;

    addRuleBtn.onclick = () => {
        if (!ruleSelectorInput.value) return;
        state.customRules.push({ selector: ruleSelectorInput.value, type: ruleTypeSelect.value });
        ruleSelectorInput.value = "";
        renderRules();
        saveState();
    };

    closeOnboarding.onclick = () => {
        state.onboardingComplete = true;
        onboardingModal.style.display = "none";
        saveState();
    };

    // Nav Switcher
    document.querySelectorAll('.nav-link').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);
            document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
            document.getElementById(target).classList.add('active');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        };
    });

    loadState();
});
