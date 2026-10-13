const FakeDataGenerator = (() => {
    const COUNTRIES = [
        { code: "AF", name: "Afghanistan" }, { code: "AL", name: "Albania" }, { code: "DZ", name: "Algeria" }, { code: "AS", name: "American Samoa" },
        { code: "AD", name: "Andorra" }, { code: "AO", name: "Angola" }, { code: "AI", name: "Anguilla" }, { code: "AQ", name: "Antarctica" },
        { code: "AG", name: "Antigua and Barbuda" }, { code: "AR", name: "Argentina" }, { code: "AM", name: "Armenia" }, { code: "AW", name: "Aruba" },
        { code: "AU", name: "Australia" }, { code: "AT", name: "Austria" }, { code: "AZ", name: "Azerbaijan" }, { code: "BS", name: "Bahamas" },
        { code: "BH", name: "Bahrain" }, { code: "BD", name: "Bangladesh" }, { code: "BB", name: "Barbados" }, { code: "BY", name: "Belarus" },
        { code: "BE", name: "Belgium" }, { code: "BZ", name: "Belize" }, { code: "BJ", name: "Benin" }, { code: "BM", name: "Bermuda" },
        { code: "BT", name: "Bhutan" }, { code: "BO", name: "Bolivia" }, { code: "BA", name: "Bosnia and Herzegovina" }, { code: "BW", name: "Botswana" },
        { code: "BR", name: "Brazil" }, { code: "IO", name: "British Indian Ocean Territory" }, { code: "VG", name: "British Virgin Islands" },
        { code: "BN", name: "Brunei" }, { code: "BG", name: "Bulgaria" }, { code: "BF", name: "Burkina Faso" }, { code: "BI", name: "Burundi" },
        { code: "KH", name: "Cambodia" }, { code: "CM", name: "Cameroon" }, { code: "CA", name: "Canada" }, { code: "CV", name: "Cape Verde" },
        { code: "KY", name: "Cayman Islands" }, { code: "CF", name: "Central African Republic" }, { code: "TD", name: "Chad" }, { code: "CL", name: "Chile" },
        { code: "CN", name: "China" }, { code: "CX", name: "Christmas Island" }, { code: "CC", name: "Cocos [Keeling] Islands" }, { code: "CO", name: "Colombia" },
        { code: "KM", name: "Comoros" }, { code: "CG", name: "Congo - Brazzaville" }, { code: "CD", name: "Congo - Kinshasa" }, { code: "CK", name: "Cook Islands" },
        { code: "CR", name: "Costa Rica" }, { code: "HR", name: "Croatia" }, { code: "CU", name: "Cuba" }, { code: "CY", name: "Cyprus" },
        { code: "CZ", name: "Czech Republic" }, { code: "CI", name: "Côte d’Ivoire" }, { code: "DK", name: "Denmark" }, { code: "DJ", name: "Djibouti" },
        { code: "DM", name: "Dominica" }, { code: "DO", name: "Dominican Republic" }, { code: "EC", name: "Ecuador" }, { code: "EG", name: "Egypt" },
        { code: "SV", name: "El Salvador" }, { code: "GQ", name: "Equatorial Guinea" }, { code: "ER", name: "Eritrea" }, { code: "EE", name: "Estonia" },
        { code: "ET", name: "Ethiopia" }, { code: "FK", name: "Falkland Islands" }, { code: "FO", name: "Faroe Islands" }, { code: "FJ", name: "Fiji" },
        { code: "FI", name: "Finland" }, { code: "FR", name: "France" }, { code: "GF", name: "French Guiana" }, { code: "PF", name: "French Polynesia" },
        { code: "TF", name: "French Southern Territories" }, { code: "GA", name: "Gabon" }, { code: "GM", name: "Gambia" }, { code: "GE", name: "Georgia" },
        { code: "DE", name: "Germany" }, { code: "GH", name: "Ghana" }, { code: "GI", name: "Gibraltar" }, { code: "GR", name: "Greece" },
        { code: "GL", name: "Greenland" }, { code: "GD", name: "Grenada" }, { code: "GP", name: "Guadeloupe" }, { code: "GU", name: "Guam" },
        { code: "GT", name: "Guatemala" }, { code: "GG", name: "Guernsey" }, { code: "GN", name: "Guinea" }, { code: "GW", name: "Guinea-Bissau" },
        { code: "GY", name: "Guyana" }, { code: "HT", name: "Haiti" }, { code: "HM", name: "Heard Island and McDonald Islands" }, { code: "HN", name: "Honduras" },
        { code: "HK", name: "Hong Kong SAR China" }, { code: "HU", name: "Hungary" }, { code: "IS", name: "Iceland" }, { code: "IN", name: "India" },
        { code: "ID", name: "Indonesia" }, { code: "IR", name: "Iran" }, { code: "IQ", name: "Iraq" }, { code: "IE", name: "Ireland" },
        { code: "IM", name: "Isle of Man" }, { code: "IL", name: "Israel" }, { code: "IT", name: "Italy" }, { code: "JM", name: "Jamaica" },
        { code: "JP", name: "Japan" }, { code: "JE", name: "Jersey" }, { code: "JO", name: "Jordan" }, { code: "KZ", name: "Kazakhstan" },
        { code: "KE", name: "Kenya" }, { code: "KI", name: "Kiribati" }, { code: "KW", name: "Kuwait" }, { code: "KG", name: "Kyrgyzstan" },
        { code: "LA", name: "Laos" }, { code: "LV", name: "Latvia" }, { code: "LB", name: "Lebanon" }, { code: "LS", name: "Lesotho" },
        { code: "LR", name: "Liberia" }, { code: "LY", name: "Libya" }, { code: "LI", name: "Liechtenstein" }, { code: "LT", name: "Lithuania" },
        { code: "LU", name: "Luxembourg" }, { code: "MO", name: "Macau SAR China" }, { code: "MK", name: "Macedonia" }, { code: "MG", name: "Madagascar" },
        { code: "MW", name: "Malawi" }, { code: "MY", name: "Malaysia" }, { code: "MV", name: "Maldives" }, { code: "ML", name: "Mali" },
        { code: "MT", name: "Malta" }, { code: "MH", name: "Marshall Islands" }, { code: "MQ", name: "Martinique" }, { code: "MR", name: "Mauritania" },
        { code: "MU", name: "Mauritius" }, { code: "YT", name: "Mayotte" }, { code: "MX", name: "Mexico" }, { code: "FM", name: "Micronesia" },
        { code: "MD", name: "Moldova" }, { code: "MC", name: "Monaco" }, { code: "MN", name: "Mongolia" }, { code: "ME", name: "Montenegro" },
        { code: "MS", name: "Montserrat" }, { code: "MA", name: "Morocco" }, { code: "MZ", name: "Mozambique" }, { code: "MM", name: "Myanmar [Burma]" },
        { code: "NA", name: "Namibia" }, { code: "NR", name: "Nauru" }, { code: "NP", name: "Nepal" }, { code: "NL", name: "Netherlands" },
        { code: "AN", name: "Netherlands Antilles" }, { code: "NC", name: "New Caledonia" }, { code: "NZ", name: "New Zealand" }, { code: "NI", name: "Nicaragua" },
        { code: "NE", name: "Niger" }, { code: "NG", name: "Nigeria" }, { code: "NU", name: "Niue" }, { code: "NF", name: "Norfolk Island" },
        { code: "KP", name: "North Korea" }, { code: "MP", name: "Northern Mariana Islands" }, { code: "NO", name: "Norway" }, { code: "OM", name: "Oman" },
        { code: "PK", name: "Pakistan" }, { code: "PW", name: "Palau" }, { code: "PS", name: "Palestinian Territories" }, { code: "PA", name: "Panama" },
        { code: "PG", name: "Papua New Guinea" }, { code: "PY", name: "Paraguay" }, { code: "PE", name: "Peru" }, { code: "PH", name: "Philippines" },
        { code: "PN", name: "Pitcairn Islands" }, { code: "PL", name: "Poland" }, { code: "PT", name: "Portugal" }, { code: "PR", name: "Puerto Rico" },
        { code: "QA", name: "Qatar" }, { code: "RO", name: "Romania" }, { code: "RU", name: "Russia" }, { code: "RW", name: "Rwanda" },
        { code: "RE", name: "Réunion" }, { code: "BL", name: "Saint Barthélemy" }, { code: "SH", name: "Saint Helena" }, { code: "KN", name: "Saint Kitts and Nevis" },
        { code: "LC", name: "Saint Lucia" }, { code: "MF", name: "Saint Martin" }, { code: "PM", name: "Saint Pierre and Miquelon" }, { code: "VC", name: "Saint Vincent and the Grenadines" },
        { code: "WS", name: "Samoa" }, { code: "SM", name: "San Marino" }, { code: "ST", name: "São Tomé and Príncipe" }, { code: "SA", name: "Saudi Arabia" },
        { code: "SN", name: "Senegal" }, { code: "RS", name: "Serbia" }, { code: "SC", name: "Seychelles" }, { code: "SL", name: "Sierra Leone" },
        { code: "SG", name: "Singapore" }, { code: "SK", name: "Slovakia" }, { code: "SI", name: "Slovenia" }, { code: "SB", name: "Solomon Islands" },
        { code: "SO", name: "Somalia" }, { code: "ZA", name: "South Africa" }, { code: "GS", name: "South Georgia and the South Sandwich Islands" }, { code: "KR", name: "South Korea" },
        { code: "ES", name: "Spain" }, { code: "LK", name: "Sri Lanka" }, { code: "SD", name: "Sudan" }, { code: "SR", name: "Suriname" },
        { code: "SJ", name: "Svalbard and Jan Mayen" }, { code: "SZ", name: "Swaziland" }, { code: "SE", name: "Sweden" }, { code: "CH", name: "Switzerland" },
        { code: "SY", name: "Syria" }, { code: "TW", name: "Taiwan" }, { code: "TJ", name: "Tajikistan" }, { code: "TZ", name: "Tanzania" },
        { code: "TH", name: "Thailand" }, { code: "TL", name: "Timor-Leste" }, { code: "TG", name: "Togo" }, { code: "TK", name: "Tokelau" },
        { code: "TO", name: "Tonga" }, { code: "TT", name: "Trinidad and Tobago" }, { code: "TN", name: "Tunisia" }, { code: "TR", name: "Turkey" },
        { code: "TM", name: "Turkmenistan" }, { code: "TC", name: "Turks and Calvert Islands" }, { code: "TV", name: "Tuvalu" }, { code: "UM", name: "U.S. Minor Outlying Islands" },
        { code: "VI", name: "U.S. Virgin Islands" }, { code: "UG", name: "Uganda" }, { code: "UA", name: "Ukraine" }, { code: "AE", name: "United Arab Emirates" },
        { code: "GB", name: "United Kingdom" }, { code: "US", name: "United States" }, { code: "UY", name: "Uruguay" }, { code: "UZ", name: "Uzbekistan" },
        { code: "VU", name: "Vanuatu" }, { code: "VA", name: "Vatican City" }, { code: "VE", name: "Venezuela" }, { code: "VN", name: "Vietnam" },
        { code: "WF", name: "Wallis and Futuna" }, { code: "EH", name: "Western Sahara" }, { code: "YE", name: "Yemen" }, { code: "ZM", name: "Zambia" },
        { code: "ZW", name: "Zimbabwe" }
    ];

    const LOCALES = {
        tr: {
            name: "Turkish",
            firstNames: ["Ahmet", "Mehmet", "Can", "Burak", "Zeynep", "Elif", "Ayşe", "Merve", "Bora", "Efe", "Derya", "Emre", "Selin", "Murat", "Hakan"],
            lastNames: ["Yılmaz", "Demir", "Kaya", "Şahin", "Çelik", "Yıldız", "Öztürk", "Aydın", "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara"],
            cities: ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Şanlıurfa", "Kocaeli", "Mersin"],
            streets: ["Atatürk Blv", "İstiklal Cd", "Bağdat Cd", "Mevlana Cd", "Cumhuriyet Cd", "İnönü Cd", "Barbaros Blv", "Alemdar Sk"],
            companies: ["Koç Holding", "Sabancı", "Eczacıbaşı", "Vestel", "Turkcell", "THY", "Aselsan", "Arçelik", "Beko"],
            phonePrefixes: ["532", "533", "535", "542", "543", "544", "505", "506", "555"],
            phonePattern: "#######",
            meetingTypes: ["Proje Toplantısı", "Strateji Görüşmesi", "Aylık Değerlendirme", "Bütçe Planlama"],
            organizerTypes: ["İK Departmanı", "Yönetim Kurulu", "Proje Ofisi", "Pazarlama Ekibi"],
            locationTypes: ["Toplantı Odası A", "Konferans Salonu", "Zoom", "Ana Merkez"],
            agendaTypes: ["1. Açılış\n2. Raporlar\n3. Kapanış", "1. Bütçe\n2. Hedefler", "1. Proje Durumu\n2. Riskler"],
            positionTypes: ["Yazılım Mühendisi", "Proje Yöneticisi", "İK Uzmanı", "Satış Temsilcisi", "Genel Müdür"]
        },
        en: {
            name: "English (US)",
            firstNames: ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Patricia", "Jennifer"],
            lastNames: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"],
            cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"],
            streets: ["Main St", "High St", "Broad St", "Maple Ave", "Park Ave", "Oak St", "Washington Blvd", "Lakeview Dr"],
            companies: ["Acme Corp", "Globex", "Soylent Corp", "Initech", "Umbrella Corp", "Stark Ind", "Wayne Ent"],
            phonePrefixes: ["202", "212", "310", "415", "646", "702", "917"],
            phonePattern: "#######",
            meetingTypes: ["Project Kickoff", "Quarterly Review", "Strategy Sync", "Daily Standup"],
            organizerTypes: ["HR Department", "Executive Board", "Engineering Team", "Sales Ops"],
            locationTypes: ["Conference Room A", "Boardroom", "Google Meet", "HQ Lobby"],
            agendaTypes: ["1. Intro\n2. Review\n3. Q&A", "1. Budget\n2. Goals", "1. Status Updates\n2. Blockers"],
            positionTypes: ["Software Engineer", "Product Manager", "HR Specialist", "Sales Rep", "CEO"]
        },
        es: {
            name: "Spanish",
            firstNames: ["José", "María", "Juan", "Ana", "Luis", "Isabel", "Carlos", "Laura", "Diego", "Carmen", "Antonio", "Lucía"],
            lastNames: ["García", "Rodríguez", "González", "Fernández", "López", "Martínez", "Sánchez", "Pérez", "Gómez", "Martín"],
            cities: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Murcia", "Palma", "Las Palmas", "Bilbao"],
            streets: ["Calle Mayor", "Gran Vía", "Calle de Alcalá", "Avenida de la Constitución", "Paseo de la Castellana"],
            companies: ["Inditex", "Mercadona", "Telefónica", "Repsol", "Iberdrola", "Banco Santander", "BBVA"],
            phonePrefixes: ["611", "622", "633", "644", "655", "666", "711", "722"],
            phonePattern: "#######",
            meetingTypes: ["Reunión de Proyecto", "Revisión Trimestral", "Estrategia", "Standup Diario"],
            organizerTypes: ["Recursos Humanos", "Junta Directiva", "Equipo de Ingeniería", "Ventas"],
            locationTypes: ["Sala de Conferencias", "Sala de Juntas", "Videollamada", "Oficina Principal"],
            agendaTypes: ["1. Intro\n2. Revisión\n3. Preguntas", "1. Presupuesto\n2. Objetivos"],
            positionTypes: ["Ingeniero de Software", "Gerente de Producto", "Especialista RRHH", "Representante de Ventas"]
        },
        fr: {
            name: "French",
            firstNames: ["Jean", "Marie", "Pierre", "Anne", "Luc", "Sophie", "Thomas", "Julie", "Nicolas", "Emma", "Louis", "Chloe"],
            lastNames: ["Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Dubois", "Moreau", "Laurent"],
            cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille"],
            streets: ["Rue de Rivoli", "Avenue des Champs-Élysées", "Boulevard Haussmann", "Rue de la Paix", "Rue du Faubourg"],
            companies: ["TotalEnergies", "AXA", "L'Oréal", "Sanofi", "Orange", "Renault", "Peugeot", "Danone", "Carrefour"],
            phonePrefixes: ["06", "07"],
            phonePattern: "########",
            meetingTypes: ["Lancement de Projet", "Revue Trimestrielle", "Stratégie", "Point Quotidien"],
            organizerTypes: ["Ressources Humaines", "Comité Exécutif", "Équipe Technique", "Ventes"],
            locationTypes: ["Salle de Conférence", "Salle de Réunion", "Teams", "Siège Social"],
            agendaTypes: ["1. Intro\n2. Revue\n3. Q&R", "1. Budget\n2. Objectifs"],
            positionTypes: ["Ingénieur Logiciel", "Chef de Produit", "Spécialiste RH", "Commercial", "PDG"]
        },
        de: {
            name: "German",
            firstNames: ["Hans", "Anna", "Karl", "Maria", "Stefan", "Julia", "Thomas", "Laura", "Andreas", "Sarah", "Michael", "Lisa"],
            lastNames: ["Müller", "Schmidt", "Schneider", "Fischer", "Meyer", "Weber", "Schulz", "Wagner", "Becker", "Hoffmann"],
            cities: ["Berlin", "Hamburg", "München", "Köln", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Essen"],
            streets: ["Hauptstraße", "Bahnhofstraße", "Schillerstraße", "Goethestraße", "Lindenstraße", "Dorfstraße", "Schulstraße"],
            companies: ["Volkswagen", "Allianz", "Siemens", "BMW", "Deutsche Telekom", "Mercedes-Benz", "Bayer", "Adidas"],
            phonePrefixes: ["0151", "0160", "0170", "0171", "0175", "0152", "0162", "0172"],
            phonePattern: "#######",
            meetingTypes: ["Projektstart", "Quartalsrückblick", "Strategie", "Tägliches Standup"],
            organizerTypes: ["Personalabteilung", "Vorstand", "Technikteam", "Vertrieb"],
            locationTypes: ["Konferenzraum A", "Sitzungssaal", "Online Meeting", "Hauptquartier"],
            agendaTypes: ["1. Einführung\n2. Rückblick\n3. Fragen", "1. Budget\n2. Ziele"],
            positionTypes: ["Softwareentwickler", "Produktmanager", "Personaler", "Vertriebler", "Geschäftsführer"]
        },
        pt: {
            name: "Portuguese",
            firstNames: ["João", "Maria", "Pedro", "Ana", "Miguel", "Sofia", "Tiago", "Bárbara", "Ricardo", "Inês", "Lucas", "Beatriz"],
            lastNames: ["Silva", "Santos", "Ferreira", "Pereira", "Oliveira", "Costa", "Rodrigues", "Martins", "Jesus", "Sousa"],
            cities: ["Lisboa", "Porto", "Vila Nova de Gaia", "Amadora", "Braga", "Funchal", "Coimbra", "Setúbal", "Almada", "Agualva-Cacém"],
            streets: ["Avenida da Liberdade", "Rua Garrett", "Rua Augusta", "Avenida da Boavista", "Rua de Santa Catarina"],
            companies: ["EDP", "Galp", "Jerónimo Martins", "TAP Air Portugal", "Sonae", "NOS", "Mota-Engil"],
            phonePrefixes: ["91", "92", "93", "96"],
            phonePattern: "#######",
            meetingTypes: ["Início do Projeto", "Revisão Trimestral", "Estratégia", "Reunião Diária"],
            organizerTypes: ["Recursos Humanos", "Diretoria", "Equipe de Engenharia", "Vendas"],
            locationTypes: ["Sala de Conferência", "Sala de Reuniões", "Videochamada", "Sede"],
            agendaTypes: ["1. Intro\n2. Revisão\n3. Perguntas", "1. Orçamento\n2. Metas"],
            positionTypes: ["Engenheiro de Software", "Gerente de Produto", "Especialista de RH", "Vendedor", "CEO"]
        },
        ru: {
            name: "Russian",
            firstNames: ["Ivan", "Anna", "Dmitry", "Elena", "Alexey", "Olga", "Sergey", "Maria", "Andrey", "Tatiana", "Alexander", "Natalia"],
            lastNames: ["Ivanov", "Smirnov", "Kuznetsov", "Popov", "Vasilyev", "Petrov", "Sokolov", "Mikhailov", "Novikov", "Fedorov"],
            cities: ["Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan", "Nizhny Novgorod", "Chelyabinsk", "Samara", "Omsk", "Rostov-on-Don"],
            streets: ["Arbat St", "Nevsky Prospect", "Tverskaya St", "Leninsky Prospect", "Kutuzovsky Prospect"],
            companies: ["Gazprom", "Lukoil", "Rosneft", "Sberbank", "Yandex", "X5 Group", "Surgutneftegas"],
            phonePrefixes: ["901", "902", "903", "905", "906", "909", "910", "911"],
            phonePattern: "#######",
            meetingTypes: ["Запуск проекта", "Квартальный обзор", "Стратегия", "Ежедневная летучка"],
            organizerTypes: ["HR отдел", "Совет директоров", "Инженерный отдел", "Продажи"],
            locationTypes: ["Конференц-зал А", "Переговорная", "Zoom", "Главный офис"],
            agendaTypes: ["1. Введение\n2. Обзор\n3. Вопросы", "1. Бюджет\n2. Цели"],
            positionTypes: ["Разработчик ПО", "Менеджер продукта", "HR специалист", "Менеджер по продажам", "Гендиректор"]
        },
        zh: {
            name: "Chinese",
            firstNames: ["Wei", "Fang", "Lei", "Xiu", "Ming", "Jing", "Qiang", "Li", "Jun", "Yan", "Min", "Yang"],
            lastNames: ["Li", "Wang", "Zhang", "Liu", "Chen", "Yang", "Zhao", "Huang", "Zhou", "Wu"],
            cities: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Wuhan", "Hangzhou", "Xi'an", "Chongqing", "Tianjin"],
            streets: ["Nanjing Road", "Wangfujing St", "Huaihai Road", "Renmin Avenue", "Chang'an Avenue"],
            companies: ["Alibaba", "Tencent", "ByteDance", "Huawei", "ICBC", "Ping An", "China Mobile"],
            phonePrefixes: ["130", "131", "132", "133", "135", "186", "188"],
            phonePattern: "########",
            meetingTypes: ["项目启动会", "季度回顾", "战略会议", "每日站会"],
            organizerTypes: ["人力资源部", "董事会", "工程团队", "销售部"],
            locationTypes: ["会议室 A", "董事会议室", "线上会议", "总部大厅"],
            agendaTypes: ["1. 介绍\n2. 回顾\n3. 问答", "1. 预算\n2. 目标"],
            positionTypes: ["软件工程师", "产品经理", "HR 专员", "销售代表", "CEO"]
        },
        ja: {
            name: "Japanese",
            firstNames: ["Hiroshi", "Yuki", "Kenji", "Ai", "Takashi", "Mami", "Satoshi", "Rina", "Akira", "Yoko", "Taro", "Hanako"],
            lastNames: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato"],
            cities: ["Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Fukuoka", "Kyoto", "Kawasaki", "Saitama", "Hiroshima"],
            streets: ["Chuo-dori", "Takeshita-dori", "Omotesando", "Nakamise-dori", "Yasukuni-dori"],
            companies: ["Toyota", "Sony", "Mitsubishi", "Nintendo", "SoftBank", "Honda", "Hitachi"],
            phonePrefixes: ["070", "080", "090"],
            phonePattern: "########",
            meetingTypes: ["キックオフ", "四半期レビュー", "戦略会議", "朝会"],
            organizerTypes: ["人事部", "役員会", "技術チーム", "営業部"],
            locationTypes: ["会議室 A", "重役室", "オンライン", "本社ロビー"],
            agendaTypes: ["1. 導入\n2. レビュー\n3. Q&A", "1. 予算\n2. 目標"],
            positionTypes: ["ソフトウェアエンジニア", "プロダクトマネージャー", "人事担当", "営業担当", "代表取締役"]
        },
        ar: {
            name: "Arabic",
            firstNames: ["Mohammed", "Fatima", "Ahmed", "Layla", "Ali", "Sara", "Omar", "Mariam", "Youssef", "Noor", "Ibrahim", "Aisha"],
            lastNames: ["Al-Farsi", "Haddad", "Mansour", "Saleh", "Bakir", "Zaid", "Khalil", "Nasser", "Al-Sayed", "Abdullah"],
            cities: ["Cairo", "Dubai", "Riyadh", "Beirut", "Casablanca", "Muscat", "Amman", "Doha", "Kuwait City", "Jeddah"],
            streets: ["Tahrir Square", "Sheikh Zayed Road", "Corniche Rd", "Hamra St", "King Fahd Road"],
            companies: ["Aramco", "Etisalat", "Emirates", "QNB", "STC", "Almarai", "SABIC"],
            phonePrefixes: ["050", "055", "056", "010", "011", "012"],
            phonePattern: "#######",
            meetingTypes: ["إطلاق المشروع", "مراجعة ربع سنوية", "اجتماع استراتيجي", "الاجتماع اليومي"],
            organizerTypes: ["الموارد البشرية", "مجلس الإدارة", "فريق الهندسة", "المبيعات"],
            locationTypes: ["غرفة الاجتماعات أ", "قاعة المجلس", "اجتماع عبر الإنترنت", "ردهة المقر"],
            agendaTypes: ["1. مقدمة\n2. مراجعة\n3. أسئلة وأجوبة", "1. ميزانية\n2. أهداف"],
            positionTypes: ["مهندس برمجيات", "مدير منتج", "اخصائي موارد بشرية", "ممثل مبيعات", "المدير التنفيذي"]
        }
    };

    const LANGUAGE_MAP = {
        // Mapping countries to available generators
        'US': 'en', 'GB': 'en', 'AU': 'en', 'CA': 'en', 'NZ': 'en', 'IE': 'en',
        'TR': 'tr', 'CY': 'tr',
        'DE': 'de', 'AT': 'de', 'CH': 'de', 'LI': 'de', 'LU': 'de',
        'FR': 'fr', 'BE': 'fr', 'MC': 'fr', 'CI': 'fr', 'SN': 'fr', 'CD': 'fr',
        'IT': 'it', 'VA': 'it', 'SM': 'it',
        'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es', 'VE': 'es', 'CL': 'es', 'CU': 'es',
        'PT': 'pt', 'BR': 'pt', 'AO': 'pt', 'MZ': 'pt', 'CV': 'pt',
        'RU': 'ru', 'BY': 'ru', 'KZ': 'ru', 'KG': 'ru', 'UA': 'ru',
        'JP': 'ja', 'ZH': 'zh', 'CN': 'zh', 'TW': 'zh', 'HK': 'zh',
        'KR': 'ko', 'KP': 'ko',
        'EG': 'ar', 'SA': 'ar', 'AE': 'ar', 'IQ': 'ar', 'JO': 'ar', 'LB': 'ar', 'MA': 'ar', 'QA': 'ar',
        'IN': 'hi', 'NP': 'hi', 'BD': 'hi',
        'VN': 'vi', 'ID': 'id', 'MY': 'id',
        'SE': 'sv', 'FI': 'sv', 'NO': 'sv', 'DK': 'sv', 'IS': 'sv',
        'GR': 'el', 'IL': 'he', 'NL': 'nl', 'PL': 'pl'
    };

    const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const slug = (value) => String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');

    const PATTERN_CLASSES = { 'd': '0123456789', 'w': 'abcdefghijklmnopqrstuvwxyz0123456789' };
    const PATTERN_CLASS_BODIES = {
        '0-9': '0123456789',
        'a-z': 'abcdefghijklmnopqrstuvwxyz',
        'A-Z': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        'a-zA-Z': 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        'A-Za-z': 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '0-9a-zA-Z': '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        'a-zA-Z0-9': '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    };

    // `pattern` alt kümesini (sınıflar, {n} niceleyicileri, kaçışlı ayraçlar) karşılayan değer üretir
    function generateFromPattern(pattern) {
        const source = String(pattern || '');
        if (!source || source.length > 120) return null;
        let out = '';
        let i = 0;
        while (i < source.length) {
            const ch = source[i];
            if ((ch === '^' && i === 0) || (ch === '$' && i === source.length - 1)) { i++; continue; }
            let pool = null;
            if (ch === '\\') {
                const next = source[i + 1];
                if (!next) return null;
                pool = PATTERN_CLASSES[next] || null;
                if (!pool && !/[a-zA-Z0-9]/.test(next)) { out += next; i += 2; continue; }
                if (!pool) return null;
                i += 2;
            } else if (ch === '[') {
                const close = source.indexOf(']', i + 1);
                if (close === -1) return null;
                pool = PATTERN_CLASS_BODIES[source.slice(i + 1, close)] || null;
                if (!pool) return null;
                i = close + 1;
            } else if ('*+?()|.{}[]'.includes(ch)) {
                return null;
            } else {
                out += ch;
                i++;
                continue;
            }
            let count = 1;
            if (source[i] === '{') {
                const close = source.indexOf('}', i);
                if (close === -1) return null;
                const spec = /^(\d{1,3})(?:,\d{0,3})?$/.exec(source.slice(i + 1, close));
                if (!spec) return null;
                count = Number(spec[1]);
                i = close + 1;
            }
            if (count < 1 || count > 32) return null;
            for (let n = 0; n < count; n++) out += pool[Math.floor(Math.random() * pool.length)];
            if (out.length > 64) return null;
        }
        if (!out) return null;
        try {
            if (!new RegExp('^(?:' + source + ')$').test(out)) return null;
        } catch (e) {
            return null;
        }
        return out;
    }

    // "2024/123" gibi örnek şablonu aynı biçimde doldurur (# ve rakamlar basamak yer tutucu)
    function fillFromShape(shape) {
        let out = '';
        let atRunStart = true;
        for (const ch of String(shape)) {
            if (ch === '#' || (ch >= '0' && ch <= '9')) {
                out += atRunStart ? String(randomInt(1, 9)) : String(randomInt(0, 9));
                atRunStart = false;
            } else {
                out += ch;
                atRunStart = true;
            }
        }
        return out;
    }

    // Tarih parçaları: yıl 2000 ile içinde bulunulan yıl arasından rastgele (hep bu yıl olmasın)
    function randomDateParts() {
        const minYear = 2000;
        const maxYear = new Date().getFullYear();
        return {
            year: minYear + Math.floor(Math.random() * (maxYear - minYear + 1)),
            month: Math.floor(Math.random() * 12) + 1,
            day: Math.floor(Math.random() * 28) + 1
        };
    }

    return {
        getLocales() { return Object.keys(LOCALES); },
        getCountries() { return COUNTRIES; },
        getCountryForLanguage(lang) {
            const code = String(lang || '').toLowerCase();
            if (!code) return null;
            if (COUNTRIES.some(c => c.code.toLowerCase() === code)) return code;
            const entry = Object.entries(LANGUAGE_MAP).find(([country, locale]) => locale === code && COUNTRIES.some(c => c.code === country));
            return entry ? entry[0].toLowerCase() : null;
        },
        getDataTypes() {
            return ["firstName", "lastName", "fullName", "email", "phone", "address", "city", "zip", "company", "text", "date", "datetime", "select", "password", "number", "url", "meeting", "organizer", "location", "agenda", "position", "website"];
        },
        generate(type, inputLocale = 'en', context = {}) {
            // CHAOS MODE / FUZZING LOGIC
            if (context.chaosMode) {
                const chaosVectors = [
                    "' OR '1'='1", // SQLi
                    "<script>alert(1)</script>", // XSS
                    "admin' --", // SQLi
                    "{{7*7}}", // SSTI
                    "A".repeat(1000), // Buffer Overflow / Length check
                    "test@example.com%00.jpg", // Null Byte
                    "NaN",
                    "undefined",
                    "null",
                    "1E+308" // Large Number
                ];

                // Return context-specific chaos or random vector
                switch (type) {
                    case 'email': return "not-an-email@" + "A".repeat(200) + ".com";
                    case 'number': return "-99999999999";
                    case 'date': return "9999-99-99";
                    case 'url': return "javascript:alert(1)";
                    case 'password': return "' OR '1'='1";
                    default: return chaosVectors[Math.floor(Math.random() * chaosVectors.length)];
                }
            }

            // PII SAFE MODE LOGIC
            if (context.piiSafe) {
                const randomId = Math.floor(Math.random() * 10000);
                switch (type) {
                    case 'firstName': return "User";
                    case 'lastName': return randomId.toString();
                    case 'fullName': return `User ${randomId}`;
                    case 'email': return `user.${randomId}@example.com`;
                    case 'company': return "Test Company Inc.";
                    case 'address': return "123 Test Street, Test City";
                    case 'phone': return "+0000000000";
                    case 'position': return "Test User";
                    case 'website': return "https://example.com";
                    default: break; // Fallback to normal generation for non-PII sensitive fields (like numbers, dates)
                }
            }

            const parts = inputLocale.split('-');
            const country = (parts[1] || parts[0]).toUpperCase();
            const lang = parts[0].toLowerCase();

            const locale = LOCALES[lang] || LOCALES[LANGUAGE_MAP[country]] || LOCALES['en'];

            // Alanın HTML `pattern` kuralı desteklenen alt kümedeyse önce o karşılanır
            if (context.pattern) {
                const patternValue = generateFromPattern(context.pattern);
                if (patternValue) return patternValue;
            }

            // Smart Linking Logic
            if (type === 'email') {
                if (context.smartEmail === false) {
                    return `${slug(random(locale.firstNames))}${randomInt(10, 999)}@${random(['example.com', 'test.com', 'mail.com', 'demo.org'])}`;
                }
                const first = slug(context.firstName || random(locale.firstNames));
                const last = slug(context.lastName || random(locale.lastNames));
                const domains = ['example.com', 'test.com', 'mail.com', 'demo.org'];
                const randomNum = Math.floor(Math.random() * 99);
                return `${first}.${last}${randomNum}@${random(domains)}`;
            }

            switch (type) {
                case 'firstName': return locale.firstNames[Math.floor(Math.random() * locale.firstNames.length)];
                case 'lastName': return locale.lastNames[Math.floor(Math.random() * locale.lastNames.length)];
                case 'fullName':
                    return locale.firstNames[Math.floor(Math.random() * locale.firstNames.length)] + " " +
                        locale.lastNames[Math.floor(Math.random() * locale.lastNames.length)];
                case 'phone':
                    const phonePrefix = locale.phonePrefixes ? locale.phonePrefixes[Math.floor(Math.random() * locale.phonePrefixes.length)] : "";
                    const phonePattern = locale.phonePattern || "#######";
                    return phonePrefix + phonePattern.replace(/#/g, () => Math.floor(Math.random() * 10));
                case 'address':
                    return `${Math.floor(Math.random() * 900 + 100)} ${locale.streets[Math.floor(Math.random() * locale.streets.length)]}`;
                case 'city': return locale.cities[Math.floor(Math.random() * locale.cities.length)];
                case 'zip': return Math.floor(Math.random() * 90000 + 10000).toString();
                case 'company':
                    if (locale.companies) return locale.companies[Math.floor(Math.random() * locale.companies.length)];
                    const suffixes = ['Inc', 'LLC', 'Group', 'Solutions', 'Global'];
                    return locale.lastNames[Math.floor(Math.random() * locale.lastNames.length)] + " " +
                        suffixes[Math.floor(Math.random() * suffixes.length)];
                case 'url':
                    const domains = ['example.com', 'test-site.org', 'demo.net', 'sample.co'];
                    return `https://www.${domains[Math.floor(Math.random() * domains.length)]}`;
                case 'website':
                    const comp = (locale.companies ? locale.companies[Math.floor(Math.random() * locale.companies.length)] : "Business").replace(/\s/g, '').toLowerCase();
                    return `https://www.${comp}.com`;
                case 'meeting':
                    return locale.meetingTypes ? locale.meetingTypes[Math.floor(Math.random() * locale.meetingTypes.length)] : "Project Sync";
                case 'organizer':
                    return locale.organizerTypes ? locale.organizerTypes[Math.floor(Math.random() * locale.organizerTypes.length)] : "Admin";
                case 'location':
                    return locale.locationTypes ? locale.locationTypes[Math.floor(Math.random() * locale.locationTypes.length)] : "Room 101";
                case 'agenda':
                    return locale.agendaTypes ? locale.agendaTypes[Math.floor(Math.random() * locale.agendaTypes.length)] : "1. Review\n2. Plan";
                case 'position':
                    return locale.positionTypes ? locale.positionTypes[Math.floor(Math.random() * locale.positionTypes.length)] : "Employee";
                case 'text':
                    const fname = (context.fieldName || '').toLowerCase();
                    const shaped = context.valueShape ? fillFromShape(context.valueShape) : null;
                    if (shaped) return shaped;
                    if (fname.includes('agenda')) return "Agenda items...";
                    // Specific logic for QR Names based on what might be selected
                    if (fname.includes('qr_name') || fname.includes('kayıt ismi') || fname.includes('qrcode')) {
                        const types = ["Business Card", "Website Link", "Event Pass", "Wifi Access", "Portfolio"];
                        return types[Math.floor(Math.random() * types.length)] + " - " + new Date().getFullYear();
                    }
                    // Rich text: yalnız çok satırlı alanlarda HTML gövde
                    if (context.multiline && (fname.includes('text') || fname.includes('icerik') || fname.includes('content'))) {
                        return "<h2>Welcome</h2><p>This is a generated QR content.</p><ul><li>Feature 1</li><li>Feature 2</li></ul>";
                    }
                    return "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
                case 'date': {
                    const d = randomDateParts();
                    return `${d.year}-${d.month.toString().padStart(2, '0')}-${d.day.toString().padStart(2, '0')}`;
                }
                case 'datetime': {
                    const d = randomDateParts();
                    const hour = Math.floor(Math.random() * 14) + 8; // 08:00 - 22:00
                    const minute = Math.floor(Math.random() * 4) * 15; // 00, 15, 30, 45
                    return `${d.year}-${d.month.toString().padStart(2, '0')}-${d.day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                }
                case 'password': return "P@ssw0rd123!";
                case 'number': return Math.floor(Math.random() * 100).toString();
                case 'select': return null; // Handled in content script
                default:
                    // Only smart fallback for unknown types handled in content script call,
                    // but if it reaches here with 'text', we give generic text.
                    // If type is truly unknown/custom:
                    return "Data " + Math.floor(Math.random() * 1000);
            }
        }
    };
})();

if (typeof module !== 'undefined') {
    module.exports = FakeDataGenerator;
}
