export type UrgencyLevel = "EMERGENCY" | "HIGH" | "MODERATE" | "LOW";
export type SupportLang = "en" | "hi" | "te";

export interface TriageOutcome {
  urgency: UrgencyLevel;
  emergency: boolean;
  title: string;
  summary: string;
  selfCare: string[];
  seeDoctorWhen: string[];
  matches: string[];
  isGreeting: boolean;
}

interface TriageRule {
  id: string;
  priority: number;
  keywords: Record<SupportLang, string[]>;
  title: Record<SupportLang, string>;
  summary: Record<SupportLang, string>;
  selfCare: Record<SupportLang, string[]>;
  seeDoctorWhen: Record<SupportLang, string[]>;
}

const GREETINGS: Record<SupportLang, string[]> = {
  en: ["hello", "hi there", "hey", "namaste", "good morning", "good evening", "good afternoon", "thank you", "thanks"],
  hi: ["नमस्ते", "नमस्कार", "हैलो", "हेलो", "धन्यवाद", "सधन्यवाद"],
  te: ["నమస్తే", "నమస్కారం", "హలో", "ధన్యవాదాలు"]
};

const RULES: TriageRule[] = [
  {
    id: "emergency",
    priority: 100,
    keywords: {
      en: [
        "can't breathe", "cannot breathe", "having trouble breathing", "chest pain", "tightness in chest",
        "unconscious", "fainted", "blacked out", "seizure", "having a fit", "severe bleeding", "bleeding heavily",
        "won't stop bleeding", "stroke", "heart attack", "suicide", "self harm", "choking", "suffocating",
        "turning blue", "not waking up", "gunshot", "stabbing"
      ],
      hi: [
        "सांस नहीं", "सांस ले नहीं", "छाती में दर्द", "बेहोश", "बेहोस", "दौरा", "ऐंठन", "खून बह", "स्ट्रोक",
        "दिल का दौरा", "आत्महत्या", "दम घुट", "नीला पड़"
      ],
      te: [
        "ఊపిరి ఆడటం లేదు", "ఛాతీ నొప్పి", "స్పృహలో లేదు", "మూర్ఛ", "రక్తస్రావం", "గుండెపోటు",
        "స్ట్రోక్", "ఊపిరాడక"
      ]
    },
    title: {
      en: "This sounds like an emergency",
      hi: "यह एक आपातकालीन स्थिति लगती है",
      te: "ఇది అత్యవసర పరిస్థితిలా ఉంది"
    },
    summary: {
      en: "Please call emergency services (108 / 112) immediately or go to the nearest emergency room right now. Do not wait for a self-care response.",
      hi: "कृपया तुरंत आपातकालीन सेवाओं (108 / 112) को कॉल करें या अभी निकटतम आपातकालीन कक्ष में जाएं। स्व-देखभाल की प्रतीक्षा न करें।",
      te: "దయచేసి వెంటనే అత్యవసర సేవలను (108 / 112) సంప్రదించండి లేదా సమీప ఆసుపత్రికి వెళ్లండి. స్వీయ-సంరక్షణ కోసం వేచి ఉండకండి."
    },
    selfCare: {
      en: ["Call 108/112 or go to the nearest emergency room immediately", "Do not drive yourself if you feel weak or confused", "Keep breathing slowly and stay calm", "Tell the doctor about existing conditions or allergies while calling"],
      hi: ["108/112 पर कॉल करें या तुरंत निकटतम आपातकालीन कक्ष में जाएं", "यदि आप कमजोरी या भ्रम महसूस कर रहे हैं तो स्वयं गाड़ी न चलाएं", "धीरे-धीरे सांस लें और शांत रहें", "कॉल करते समय मौजूदा स्थितियों या एलर्जी के बारे में बताएं"],
      te: ["వెంటనే 108/112 కి కాల్ చేయండి లేదా సమీప అత్యవసర గదికి వెళ్లండి", "బలహీనంగా లేదా గందరగోళంగా ఉంటే స్వయంగా వాహనం నడపవద్దు", "నెమ్మదిగా ఊపిరి పీల్చుకోండి, ప్రశాంతంగా ఉండండి", "కాల్ చేసేటప్పుడు మీ అలర్జీలు/వ్యాధుల గురించి చెప్పండి"]
    },
    seeDoctorWhen: {
      en: ["IMMEDIATELY: this cannot wait for a scheduled appointment"],
      hi: ["तुरंत: यह निर्धारित अपॉइंटमेंट तक इंतजार नहीं कर सकता"],
      te: ["వెంటనే: ఇది నిర్ణీత అపాయింట్మెంట్ వరకు వేచి ఉండదు"]
    }
  },
  {
    id: "high",
    priority: 80,
    keywords: {
      en: [
        "high fever", "very high fever", "can't swallow", "cannot swallow", "dehydrated", "dehydration",
        "allergic reaction", "hives", "head injury", "hit my head", "vomiting blood", "stiff neck",
        "confused", "confusion", "drowsy", "vomiting for two days", "blood in stool", "blood in urine",
        "suicide thought", "pain in face", "numbness", "yellow skin", "yellow eyes", "not urinating"
      ],
      hi: [
        "तेज बुखार", "तेज़ बुखार", "गंभीर दर्द", "निगल नहीं", "निर्जलीकरण", "एलर्जी", "सिर में चोट",
        "खून की उल्टी", "गर्दन अकड़", "बेहोशी", "भ्रम", "उल्टी हो रही", "आत्महत्या", "पीलिया", "सुन्न"
      ],
      te: [
        "అధిక జ్వరం", "మింగలేకపోతున్నాను", "నిర్జలీకరణ", "అలర్జీ", "తల గాయం", "రక్తం వాంతులు",
        "మెడ నొప్పి", "గందరగోళం", "మసకబారిన", "పచ్చరంగు", "మూత్రం రాకపోవడం"
      ]
    },
    title: {
      en: "You should see a doctor today",
      hi: "आपको आज ही डॉक्टर से मिलना चाहिए",
      te: "మీరు ఈరోజే వైద్యుడిని చూడాలి"
    },
    summary: {
      en: "These symptoms can become serious quickly. Please see a doctor today and do not delay.",
      hi: "ये लक्षण जल्दी ही गंभीर हो सकते हैं। कृपया आज ही डॉक्टर से मिलें और देरी न करें।",
      te: "ఈ లక్షణాలు త్వరగా తీవ్రమవుతాయి. దయచేసి ఈరోజే వైద్యుడిని కలవండి, ఆలస్యం చేయవద్దు."
    },
    selfCare: {
      en: [
        "Drink water or oral rehydration solution in small sips if you can keep it down",
        "Rest and take medicines only as prescribed by a doctor",
        "Do not stop drinking fluids — dehydration makes symptoms worse",
        "Keep a record of when symptoms started"
      ],
      hi: [
        "यदि आप इसे पी सकते हैं तो छोटे घूंट में पानी या ओआरएस पिएं",
        "आराम करें और केवल डॉक्टर द्वारा बताई गई दवाएं लें",
        "तरल पदार्थ पीना बंद न करें — निर्जलीकरण लक्षणों को बढ़ाता है",
        "लक्षण कब शुरू हुए इसका रिकॉर्ड रखें"
      ],
te: [
        "త్రాగగలిగితే చిన్న సిప్స్లో నీరు లేదా ORS త్రాగండి",
        "విశ్రాంతి తీసుకోండి, డాక్టర్ చెప్పిన మందులు మాత్రమే తీసుకోండి",
        "ద్రవాలు ఆపవద్దు — నిర్జలీకరణ లక్షణాలను తీవ్రతరం చేస్తుంది",
        "లక్షణాలు ఎప్పుడు మొదలయ్యాయో గుర్తుంచుకోండి"
      ]
    },
    seeDoctorWhen: {
      en: [
        "Today — even a few hours of delay can matter",
        "Go to emergency if symptoms worsen rapidly"
      ],
      hi: ["आज ही — कुछ घंटों की देरी भी मायने रख सकती है", "लक्षण तेजी से बढ़ें तो आपातकालीन कक्ष जाएं"],
      te: ["ఈరోజే — కొన్ని గంటల ఆలస్యం కూడా ముఖ్యం", "లక్షణాలు వేగంగా తీవ్రమైతే అత్యవసర గదికి వెళ్లండి"]
    }
  },
  {
    id: "fever",
    priority: 60,
    keywords: {
      en: ["fever", "temperature", "feverish", "chills", "body hot", "feeling hot"],
      hi: ["बुखार", "तापमान", "ज्वर", "कंपकपी", "गर्मी लग"],
      te: ["జ్వరం", "శరీరం వేడిగా", "వణుకు"]
    },
    title: {
      en: "Fever — advice",
      hi: "बुखार — सलाह",
      te: "జ్వరం — సలహా"
    },
    summary: {
      en: "Most fevers get better on their own. Monitor your temperature and watch for any warning signs.",
      hi: "अधिकांश बुखार अपने आप ठीक हो जाते हैं। अपना तापमान परखें और किसी भी चेतावनी के संकेत पर नजर रखें।",
      te: "చాలా జ్వరాలు స్వయంగా తగ్గుతాయి. ఉష్ణోగ్రతను కొలవండి, హెచ్చరిక లక్షణాలపై నిఘా ఉంచండి."
    },
    selfCare: {
      en: [
        "Drink plenty of fluids — water, ORS, coconut water",
        "Rest — your body needs energy to fight the infection",
        "Use a light sheet; dress comfortably in light clothing",
        "You may use paracetamol for fever, exactly as the label/doctor advises"
      ],
      hi: [
        "खूब सारे तरल पदार्थ पिएं — पानी, ओआरएस, नारियल पानी",
        "आराम करें — शरीर को संक्रमण से लड़ने के लिए ऊर्जा चाहिए",
        "हल्की चादर का उपयोग करें; आरामदायक हल्के कपड़े पहनें",
        "बुखार के लिए पैरासिटामोल ले सकते हैं, लेबल/डॉक्टर की सलाह के अनुसार ही"
      ],
      te: [
        "తరచుగా ద్రవాలు త్రాగండి — నీరు, ORS, కొబ్బరి నీళ్లు",
        "విశ్రాంతి తీసుకోండి — శరీరానికి శక్తి అవసరం",
        "తేలికపాటి దుస్తులు ధరించండి",
        "జ్వరానికి లేబుల్/డాక్టర్ సలహా ప్రకారం మాత్రమే పారాసిటమాల్ వాడండి"
      ]
    },
    seeDoctorWhen: {
      en: [
        "Fever above 103°F (39.5°C) for more than 48 hours",
        "Fever with a stiff neck, rash, confusion or difficulty breathing",
        "Fever in a child under 3 months"
      ],
      hi: ["48 घंटे से अधिक 103°F (39.5°C) से ऊपर बुखार", "गर्दन अकड़न, दाने, भ्रम या सांस लेने में कठिनाई के साथ बुखार", "3 महीने से कम उम्र के बच्चे में बुखार"],
      te: ["48 గంటలకు పైగా 103°F పైన జ్వరం", "మెడ బిగుతు, దద్దుర్లు, గందరగోళం లేదా శ్వాస కష్టంతో జ్వరం", "3 నెలల లోపు పిల్లలో జ్వరం"]
    }
  },
  {
    id: "cold",
    priority: 40,
    keywords: {
      en: ["cough", "cold", "sore throat", "runny nose", "blocked nose", "sneezing", "flu", "throat pain", "mucus", "phlegm"],
      hi: ["खांसी", "खाँसी", "सर्दी", "जुकाम", "गले में", "गला खराब", "बलगम", "छींक"],
      te: ["దగ్గు", "జలుబు", "గొంతు నొప్పి", "ముక్కు", "తుమ్ము", "దగ్గం"]
    },
    title: {
      en: "Cold and cough — advice",
      hi: "सर्दी और खांसी — सलाह",
      te: "జలుబు, దగ్గు — సలహా"
    },
    summary: {
      en: "Common colds are usually viral and get better in about a week with supportive care.",
      hi: "सामान्य सर्दी आमतौर पर वायरल होती है और सहायक देखभाल से लगभग एक सप्ताह में ठीक हो जाती है।",
      te: "సాధారణ జలుబు వైరల్, సహాయ సంరక్షణతో ఒక వారంలో తగ్గుతుంది."
    },
    selfCare: {
      en: [
        "Warm liquids like ginger tea, warm water with honey and lemon",
        "Gargle with warm salt water for a sore throat",
        "Steam inhalation for a blocked nose",
        "Sleep with an extra pillow to ease coughing at night"
      ],
      hi: [
        "अदरक की चाय, शहद और नींबू के साथ गर्म पानी जैसे गर्म तरल पदार्थ",
        "गले की खराश के लिए गर्म नमक वाले पानी से गरारे करें",
        "नाक बंद होने पर भाप लें",
        "रात में खांसी कम करने के लिए अतिरिक्त तकिये के साथ सोएं"
      ],
      te: [
        "అల్లం టీ, తేనెతో గోరువెచ్చని నీరు త్రాగండి",
        "గొంతు నొప్పికి వెచ్చని ఉప్పు నీటితో పుక్కిలించండి",
        "ముక్కు మూసుకుపోతే ఆవిరి పట్టించుకోండి",
        "రాత్రి దగ్గు తగ్గడానికి అదనపు దిండుతో పడుకోండి"
      ]
    },
    seeDoctorWhen: {
      en: [
        "Cough lasting more than 3 weeks",
        "Shortness of breath, chest pain or blood in mucus",
        "Very high fever with the cold"
      ],
      hi: ["3 सप्ताह से अधिक खांसी", "सांस की कमी, सीने में दर्द या बलगम में खून", "सर्दी के साथ बहुत तेज बुखार"],
      te: ["3 వారాలకు పైగా దగ్గు", "ఊపిరి ఆడకపోవడం, ఛాతీ నొప్పి లేదా కఫంలో రక్తం", "జలుబుతో అధిక జ్వరం"]
    }
  },
  {
    id: "headache",
    priority: 40,
    keywords: {
      en: ["headache", "head ache", "migraine", "head hurts", "head pain", "throbbing head"],
      hi: ["सिरदर्द", "सिर दर्द", "माइग्रेन", "सिर में दर्द"],
      te: ["తలనొప్పి", "తల నొప్పి", "మైగ్రేన్"]
    },
    title: {
      en: "Headache — advice",
      hi: "सिरदर्द — सलाह",
      te: "తలనొప్పి — సలహా"
    },
    summary: {
      en: "Tension headaches and mild migraines often ease with rest. Stay alert for warning signs.",
      hi: "तनाव वाले सिरदर्द और हल्के माइग्रेन अक्सर आराम से ठीक हो जाते हैं। चेतावनी के संकेतों पर ध्यान रखें।",
      te: "మామూలు తలనొప్పి, తేలికపాటి మైగ్రేన్ విశ్రాంతితో తగ్గుతాయి. హెచ్చరిక లక్షణాలపై శ్రద్ధ వహించండి."
    },
    selfCare: {
      en: [
        "Rest in a quiet, dark room",
        "Drink water — dehydration is a common cause",
        "A cool, damp cloth on the forehead helps",
        "Keep a regular sleep schedule"
      ],
      hi: [
        "शांत, अंधेरे कमरे में आराम करें",
        "पानी पिएं — निर्जलीकरण एक सामान्य कारण है",
        "माथे पर ठंडा, नम कपड़ा रखें",
        "नियमित नींद का समय रखें"
      ],
      te: [
        "నిశ్శబ్ద, చీకటి గదిలో విశ్రాంతి తీసుకోండి",
        "నీరు త్రాగండి — డీహైడ్రేషన్ సాధారణ కారణం",
        "నుదుటిపై చల్లని తడి గుడ్డ ఉంచండి",
        "క్రమం తప్పకుండా నిద్రపోండి"
      ]
    },
    seeDoctorWhen: {
      en: [
        "Sudden, severe \"worst ever\" headache",
        "Headache with fever, stiff neck, confusion or vision changes",
        "Headache after a head injury",
        "Headaches lasting more than 3 days"
      ],
      hi: ["अचानक, गंभीर \"सबसे खराब\" सिरदर्द", "बुखार, गर्दन अकड़न, भ्रम या दृष्टि परिवर्तन के साथ सिरदर्द", "सिर में चोट के बाद सिरदर्द", "3 दिन से अधिक लगातार सिरदर्द"],
      te: ["అకస్మాత్తుగా వచ్చే తీవ్ర తలనొప్పి", "జ్వరం, మెడ బిగుతు, గందరగోళం లేదా చూపు మార్పులతో తలనొప్పి", "తల దెబ్బ తగిలిన తర్వాత తలనొప్పి", "3 రోజులకు పైగా తలనొప్పి"]
    }
  },
  {
    id: "stomach",
    priority: 45,
    keywords: {
      en: ["stomach", "belly", "nausea", "vomited", "vomiting", "diarrhea", "loose motion", "indigestion", "acidity", "gas", "bloated", "cramp", "food poisoning", "stomach pain", "tummy"],
      hi: ["पेट", "मतली", "उल्टी", "दस्त", "एसिडिटी", "गैस", "अपच", "ऐंठन", "खाद्य विषाक्तता", "पेट दर्द"],
      te: ["కడుపు", "వాంతి", "విరేచనాలు", "గ్యాస్", "అజీర్ణం", "ఆమ్లం", "కడుపు నొప్పి", "ఫుడ్ పాయిజన్"]
    },
    title: {
      en: "Stomach trouble — advice",
      hi: "पेट की समस्या — सलाह",
      te: "కడుపు సమస్య — సలహా"
    },
    summary: {
      en: "Mild stomach upsets and indigestion usually settle within 24 to 48 hours. Keep yourself hydrated.",
      hi: "हल्की पेट की गड़बड़ी और अपच आमतौर पर 24 से 48 घंटों में ठीक हो जाते हैं। खुद को हाइड्रेटेड रखें।",
      te: "తేలికపాటి కడుపు సమస్యలు 24–48 గంటల్లో తగ్గుతాయి. ద్రవాలు పుష్కలంగా త్రాగండి."
    },
    selfCare: {
      en: [
        "Sips of ORS or plain water — small amounts, often",
        "Eat light, bland foods (rice, banana, toast) when hungry",
        "Avoid spicy, oily and fried food for a couple of days",
        "Rest; avoid heavy meals until symptoms settle"
      ],
      hi: [
        "थोड़ी-थोड़ी मात्रा में ओआरएस या सादा पानी लें",
        "भूख लगने पर हल्का, सादा भोजन खाएं (चावल, केला, टोस्ट)",
        "कुछ दिनों तक मसालेदार, तैलीय और तला हुआ भोजन लेने से बचें",
        "आराम करें; लक्षण ठीक होने तक भारी भोजन न करें"
      ],
      te: [
        "ORS లేదా నీరు కొద్దిగా, తరచుగా త్రాగండి",
        "తేలికపాటి ఆహారం (అన్నం, అరటిపండు, టోస్ట్) తీసుకోండి",
        "కారం, నూనె, వేయించినవి రెండు రోజులు మానుకోండి",
        "విశ్రాంతి తీసుకోండి"
      ]
    },
    seeDoctorWhen: {
      en: [
        "Blood in vomit or stool",
        "Severe abdominal pain or prolonged vomiting",
        "Diarrhea lasting more than 2–3 days",
        "Signs of dehydration (very little urine, extreme thirst, dizziness)"
      ],
      hi: ["उल्टी या मल में खून", "गंभीर पेट दर्द या लगातार उल्टी", "2-3 दिन से अधिक दस्त", "निर्जलीकरण के संकेत (बहुत कम पेशाब, अत्यधिक प्यास, चक्कर)"],
      te: ["వాంతి/మలంలో రక్తం", "తీవ్రమైన కడుపు నొప్పి లేదా దీర్ఘ వాంతులు", "2–3 రోజులకు పైగా విరేచనాలు", "నిర్జలీకరణ లక్షణాలు (తక్కువ మూత్రం, తీవ్ర దాహం, తల తిరగడం)"]
    }
  },
  {
    id: "bodypain",
    priority: 30,
    keywords: {
      en: ["body pain", "muscle pain", "joint pain", "back pain", "leg pain", "arm pain", "ache", "aching", "shoulder pain", "neck pain", "weakness", "tired", "fatigue"],
      hi: ["दर्द", "जोड़ों में", "पीठ दर्द", "मांसपेशियों में", "कमजोरी", "थकान", "सुस्ती", "कंधे में", "गर्दन में"],
      te: ["నొప్పి", "కండరాల నొప్పి", "కీళ్ల నొప్పి", "వెన్నునొప్పి", "కాళ్ల నొప్పి", "అలసట", "బలహీనత"]
    },
    title: {
      en: "Body pain — advice",
      hi: "शरीर में दर्द — सलाह",
      te: "శరీర నొప్పి — సలహా"
    },
    summary: {
      en: "Mild muscle or joint aches often respond well to rest, heat and gentle movement.",
      hi: "हल्की मांसपेशियों या जोड़ों की पीड़ा अक्सर आराम, गर्माहट और हल्की गतिविधि से ठीक होती है।",
      te: "తేలికపాటి కండర/కీళ్ల నొప్పులు విశ్రాంతి, వెచ్చని సెక మరియు సున్నిత కదలికలతో తగ్గుతాయి."
    },
    selfCare: {
      en: [
        "Rest the affected area and avoid strenuous activity",
        "A warm compress or gentle stretching can reduce stiffness",
        "Simple over-the-counter pain relief, only as labelled",
        "Stay hydrated and eat well to help recovery"
      ],
      hi: [
        "प्रभावित क्षेत्र को आराम दें और कठोर गतिविधि से बचें",
        "गर्म सेंक या हल्की स्ट्रेचिंग अकड़न कम कर सकती है",
        "सामान्य ओवर-द-काउंटर दर्द निवारक, केवल लेबल के अनुसार",
        "ठीक होने में मदद के लिए अच्छी तरह से हाइड्रेटेड रहें और खाएं"
      ],
      te: [
        "ప్రభావిత భాగానికి విశ్రాంతి ఇవ్వండి",
        "వెచ్చని కంప్రెస్ లేదా సున్నిత సాగదీత మంచిది",
        "లేబుల్ ప్రకారం మాత్రమే నొప్పి మందులు వాడండి",
        "తగినంత నీరు త్రాగండి"
      ]
    },
    seeDoctorWhen: {
      en: [
        "Pain after an injury or fall",
        "Joint pain with swelling, redness or fever",
        "Pain that lasts more than a week or gets worse"
      ],
      hi: ["चोट या गिरने के बाद दर्द", "सूजन, लालिमा या बुखार के साथ जोड़ों का दर्द", "एक सप्ताह से अधिक या बढ़ता दर्द"],
      te: ["గాయం లేదా పడిపోయిన తర్వాత నొప్పి", "వాపు, ఎరుపు లేదా జ్వరంతో కీళ్ల నొప్పి", "ఒక వారం కంటే ఎక్కువ లేదా పెరుగుతున్న నొప్పి"]
    }
  },
  {
    id: "dizziness",
    priority: 40,
    keywords: {
      en: ["dizzy", "dizziness", "lightheaded", "vertigo", "unsteady", "balance", "head spinning"],
      hi: ["चक्कर", "बेहोशी", "घुमाव", "कमजोरी महसूस", "संतुलन"],
      te: ["తల తిరగడం", "మైకము", "వెర్టిగో", "సంతులనం"]
    },
    title: {
      en: "Dizziness — advice",
      hi: "चक्कर आना — सलाह",
      te: "తల తిరగడం — సలహా"
    },
    summary: {
      en: "Dizziness is often harmless but can sometimes signal something serious. Stay seated and hydrated.",
      hi: "चक्कर आना अक्सर हानिरहित होता है लेकिन कभी-कभी गंभीर संकेत हो सकता है। बैठे रहें और हाइड्रेटेड रहें।",
      te: "తల తిరగడం తరచుగా హానికరం కాదు, కానీ కొన్నిసార్లు తీవ్రమైనది. కూర్చోండి, నీరు త్రాగండి."
    },
    selfCare: {
      en: [
        "Sit or lie down immediately until it passes",
        "Drink water — dehydration and low blood sugar are common causes",
        "Stand up slowly to avoid a sudden drop in blood pressure",
        "Avoid driving or operating machinery while dizzy"
      ],
      hi: [
        "ठीक होने तक तुरंत बैठें या लेट जाएं",
        "पानी पिएं — निर्जलीकरण और निम्न रक्त शर्करा सामान्य कारण हैं",
        "रक्तचाप में अचानक गिरावट से बचने के लिए धीरे-धीरे खड़े हों",
        "चक्कर के दौरान गाड़ी या मशीन न चलाएं"
      ],
      te: [
        "వెంటనే కూర్చోండి లేదా పడుకోండి",
        "నీరు త్రాగండి — డీహైడ్రేషన్ సాధారణ కారణం",
        "నెమ్మదిగా లేవండి",
        "తల తిరుగుతుంటే వాహనం నడపవద్దు"
      ]
    },
    seeDoctorWhen: {
      en: [
        "Dizziness with chest pain, irregular heartbeat or severe headache",
        "Fainting or near-fainting",
        "Numbness, weakness or trouble speaking",
        "Dizziness lasting more than 2 days"
      ],
      hi: ["सीने में दर्द, अनियमित दिल की धड़कन या गंभीर सिरदर्द के साथ चक्कर", "बेहोशी या बेहोशी के करीब", "सुन्नता, कमजोरी या बोलने में कठिनाई", "2 दिन से अधिक चक्कर"],
      te: ["ఛాతీ నొప్పి, గుండె కొట్టుకోవడం, తీవ్ర తలనొప్పితో తల తిరగడం", "స్పృహ కోల్పోవడం", "తిమ్మిరి, బలహీనత లేదా మాట రాకపోవడం", "2 రోజులకు పైగా తల తిరగడం"]
    }
  },
  {
    id: "skin",
    priority: 35,
    keywords: {
      en: ["rash", "itching", "itchy", "skin", "red spots", "eczema", "acne", "blisters", "dry skin"],
      hi: ["दाने", "खुजली", "चकत्ते", "त्वचा", "छाले", "रूखी त्वचा"],
      te: ["దద్దుర్లు", "దురద", "చర్మం", "బొబ్బలు", "పొడి చర్మం"]
    },
    title: {
      en: "Skin concern — advice",
      hi: "त्वचा की समस्या — सलाह",
      te: "చర్మ సమస్య — సలహా"
    },
    summary: {
      en: "Most minor rashes and itchiness settle with gentle skin care. Avoid scratching.",
      hi: "अधिकांश हल्के दाने और खुजली कोमल त्वचा देखभाल से ठीक हो जाते हैं। खरोंचने से बचें।",
      te: "చిన్న దద్దుర్లు, దురద మృదువైన చర్మ సంరక్షణతో తగ్గుతాయి. గోకడం మానుకోండి."
    },
    selfCare: {
      en: [
        "Keep the skin cool, dry and clean",
        "Use a fragrance-free moisturiser for dryness",
        "A cool compress soothes itching",
        "Wear loose, breathable cotton clothing"
      ],
      hi: [
        "त्वचा को ठंडा, सूखा और साफ रखें",
        "सूखापन के लिए खुशबू-मुक्त मॉइस्चराइज़र का उपयोग करें",
        "ठंडा सेंक खुजली को शांत करता है",
        "ढीले, सांस लेने योग्य सूती कपड़े पहनें"
      ],
      te: [
        "చర్మాన్ని చల్లగా, పొడిగా, శుభ్రంగా ఉంచండి",
        "పొడి చర్మానికి సెంట్ లేని మాయిశ్చరైజర్ వాడండి",
        "చల్లని సెక దురదను తగ్గిస్తుంది",
        "వెడల్పు, కాటన్ దుస్తులు ధరించండి"
      ]
    },
    seeDoctorWhen: {
      en: [
        "Rash that spreads quickly or blisters",
        "Rash with fever",
        "Itching that disturbs sleep for more than 2 days",
        "Signs of infection (pus, swelling, warmth)"
      ],
      hi: ["तेजी से फैलने वाले दाने या छाले", "बुखार के साथ दाने", "2 दिन से अधिक नींद बाधित करने वाली खुजली", "संक्रमण के संकेत (मवाद, सूजन, गर्माहट)"],
      te: ["వేగంగా వ్యాపించే దద్దుర్లు/బొబ్బలు", "జ్వరంతో దద్దుర్లు", "2 రోజులకు పైగా నిద్ర పాడుచేసే దురద", "ఇన్ఫెక్షన్ లక్షణాలు (చీము, వాపు, వేడి)"]
    }
  },
  {
    id: "injury",
    priority: 50,
    keywords: {
      en: ["cut", "wound", "sprain", "twisted", "fracture", "broken bone", "burned", "burnt", "bruise", "swollen", "swelling", "dislocated"],
      hi: ["चोट", "कट", "घाव", "मोच", "फ्रैक्चर", "हड्डी", "जलन", "जला", "सूजन", "उखड़"],
      te: ["గాయం", "కోత", "మొరుగు", "ఎముక విరగడం", "కాలిన గాయం", "వాపు", "తిరగడం"]
    },
    title: {
      en: "Injury — advice",
      hi: "चोट — सलाह",
      te: "గాయం — సలహా"
    },
    summary: {
      en: "For minor cuts, sprains and burns, first aid at home is usually enough. Watch for signs of infection.",
      hi: "हल्के कट, मोच और जलन के लिए घर पर प्राथमिक उपचार आमतौर पर पर्याप्त होता है। संक्रमण के संकेतों पर ध्यान दें।",
      te: "చిన్న కోతలు, మొరుగైన చోట్ల, కాలిన గాయాలకు ఇంట్లోనే ప్రథమ చికిత్స సరిపోతుంది. ఇన్ఫెక్షన్ పట్ల జాగ్రత్తగా ఉండండి."
    },
    selfCare: {
      en: [
        "Clean the wound gently with clean water and cover with a sterile dressing",
        "For sprains: rest, ice for 15 minutes, compress, elevate",
        "For minor burns: run cool water for 10 minutes, then cover with a clean cloth",
        "Keep the area above heart level to reduce swelling"
      ],
      hi: [
        "घाव को साफ पानी से धीरे से साफ करें और रोगाणुहीन पट्टी से ढकें",
        "मोच के लिए: आराम, 15 मिनट बर्फ, सिकाई, ऊपर उठाना",
        "हल्की जलन के लिए: 10 मिनट ठंडा पानी बहाएं, फिर साफ कपड़े से ढकें",
        "सूजन कम करने के लिए क्षेत्र को हृदय स्तर से ऊपर रखें"
      ],
      te: [
        "గాయాన్ని శుభ్రమైన నీటితో శుభ్రం చేసి, స్టెరైల్ డ్రెస్సింగ్తో కప్పండి",
        "మొరుగులను: విశ్రాంతి, 15 నిమిషాలు ఐస్, నొక్కి పట్టడం, పైకి ఎత్తడం",
        "కాలిన చోట: 10 నిమిషాలు చల్లని నీరు, ఆపై శుభ్రమైన గుడ్డ",
        "వాపు తగ్గడానికి భాగాన్ని పైకి ఎత్తండి"
      ]
    },
    seeDoctorWhen: {
      en: [
        "Deep cut with heavy bleeding that won't stop",
        "Possible fracture — severe pain, deformity, can't move the part",
        "Large or deep burn, or burn on face/hands",
        "Signs of infection: redness spreading, pus, increasing pain"
      ],
      hi: ["रुकने वाला न होने वाला गहरा कट और भारी रक्तस्राव", "संभावित फ्रैक्चर — गंभीर दर्द, विकृति, अंग हिलाने में असमर्थ", "बड़ी या गहरी जलन, या चेहरे/हाथों पर जलन", "संक्रमण के संकेत: फैलती लालिमा, मवाद, बढ़ता दर्द"],
      te: ["లోతైన కోత, ఆగని రక్తస్రావం", "ఎముక విరిగిన అనుమానం — తీవ్ర నొప్పి, వైకల్యం", "పెద్ద లేదా లోతైన కాలిన గాయం, ముఖం/చేతులపై", "ఇన్ఫెక్షన్ లక్షణాలు — ఎరుపు వ్యాప్తి, చీము"]
    }
  }
];

function pick<T>(record: Record<SupportLang, T>, lang: SupportLang): T {
  return record[lang] ?? record.en;
}

function matchesRule(rule: TriageRule, message: string, lang: SupportLang): { matched: string[]; lang: SupportLang } {
  const candidates: SupportLang[] = [lang, "en", "hi", "te"].filter((l, i, arr) => arr.indexOf(l) === i) as SupportLang[];
  const matched: string[] = [];
  for (const l of candidates) {
    const keywords = rule.keywords[l] ?? [];
    for (const kw of keywords) {
      if (message.includes(kw.toLowerCase())) {
        matched.push(kw);
        if (matched.length >= 2) break;
      }
    }
    if (matched.length >= 2) break;
  }
  return { matched, lang };
}

const URGENCY_PRIORITY: Record<UrgencyLevel, number> = {
  EMERGENCY: 100,
  HIGH: 80,
  MODERATE: 60,
  LOW: 30
};

function urgencyFor(priority: number): UrgencyLevel {
  if (priority >= 100) return "EMERGENCY";
  if (priority >= 80) return "HIGH";
  if (priority >= 45) return "MODERATE";
  return "LOW";
}

function isGreeting(message: string, lang: SupportLang): boolean {
  const candidates: SupportLang[] = [lang, "en", "hi", "te"].filter((l, i, arr) => arr.indexOf(l) === i) as SupportLang[];
  for (const l of candidates) {
    for (const g of GREETINGS[l] ?? []) {
      if (message.includes(g.toLowerCase())) return true;
    }
  }
  return false;
}

export function getTriageOutcome(message: string, lang: SupportLang = "en"): TriageOutcome {
  const text = message.trim().toLowerCase();

  if (isGreeting(text, lang)) {
    return {
      urgency: "LOW",
      emergency: false,
      title: pick({ en: "Hello!", hi: "नमस्ते!", te: "నమస్తే!" }, lang),
      summary: pick(
        {
          en: "Tell me your symptoms in a short sentence — for example \"I have fever and a cough\" or \"I have a headache for two days\" — and I will suggest what to do.",
          hi: "अपने लक्षणों को एक छोटे वाक्य में बताएं — उदाहरण के लिए \"मुझे बुखार और खांसी है\" — और मैं सुझाऊंगा कि क्या करना चाहिए।",
          te: "మీ లక్షణాలను చిన్న వాక్యంలో చెప్పండి — ఉదాహరణకు \"నాకు జ్వరం, దగ్గు వస్తున్నాయి\" — నేను ఏమి చేయాలో సూచిస్తాను."
        },
        lang
      ),
      selfCare: [],
      seeDoctorWhen: [],
      matches: [],
      isGreeting: true
    };
  }

  const hits = RULES.map((rule) => ({ rule, match: matchesRule(rule, text, lang) }))
    .filter((r) => r.match.matched.length > 0)
    .sort((a, b) => b.rule.priority - a.rule.priority);

  if (hits.length === 0) {
    return {
      urgency: "LOW",
      emergency: false,
      title: pick({ en: "Could you describe a little more?", hi: "क्या आप थोड़ा और बता सकते हैं?", te: "మరికొంత వివరంగా చెప్పగలరా?" }, lang),
      summary: pick(
        {
          en: "I could not identify a specific symptom from that message. Please tell me your main symptom (for example: fever, cough, headache, stomach pain, dizziness) or use the Report Symptoms page so your doctor has the full picture.",
          hi: "मैं उस संदेश से एक विशिष्ट लक्षण की पहचान नहीं कर सका। कृपया अपना मुख्य लक्षण बताएं (उदाहरण के लिए: बुखार, खांसी, सिरदर्द, पेट दर्द, चक्कर) या लक्षण रिपोर्ट पृष्ठ का उपयोग करें ताकि आपके डॉक्टर को पूरी जानकारी मिल सके।",
          te: "ఆ సందేశం నుండి నిర్దిష్ట లక్షణాన్ని గుర్తించలేకపోయాను. మీ ప్రధాన లక్షణాన్ని చెప్పండి (ఉదా: జ్వరం, దగ్గు, తలనొప్పి, కడుపు నొప్పి, తల తిరగడం) లేదా Report Symptoms పేజీని వాడండి."
        },
        lang
      ),
      selfCare: [],
      seeDoctorWhen: [],
      matches: [],
      isGreeting: false
    };
  }

  const top = hits[0].rule;
  const urgency = urgencyFor(top.priority);

  const selfCareSet = new Set<string>();
  const seeDoctorSet = new Set<string>();
  for (const { rule } of hits) {
    for (const item of pick(rule.selfCare, lang)) selfCareSet.add(item);
    for (const item of pick(rule.seeDoctorWhen, lang)) seeDoctorSet.add(item);
    if (selfCareSet.size >= 6) break;
  }

  return {
    urgency,
    emergency: urgency === "EMERGENCY",
    title: pick(top.title, lang),
    summary: pick(top.summary, lang),
    selfCare: Array.from(selfCareSet).slice(0, 6),
    seeDoctorWhen: Array.from(seeDoctorSet).slice(0, 5),
    matches: hits.flatMap((h) => h.match.matched).slice(0, 5),
    isGreeting: false
  };
}

export function getDefaultWelcome(lang: SupportLang = "en"): { title: string; message: string } {
  return {
    title: pick(
      { en: "I'm your Health Assistant", hi: "मैं आपका हेल्थ असिस्टेंट हूं", te: "నేను మీ హెల్త్ అసిస్టెంట్" },
      lang
    ),
    message: pick(
      {
        en: "Describe how you're feeling — e.g. \"I have a fever and headache\" — and I'll give you quick, safe guidance.",
        hi: "बताएं कि आप कैसा महसूस कर रहे हैं — जैसे \"मुझे बुखार और सिरदर्द है\" — और मैं आपको त्वरित, सुरक्षित मार्गदर्शन दूंगा।",
        te: "మీరు ఎలా ఉన్నారో చెప్పండి — ఉదా. \"నాకు జ్వరం, తలనొప్పి\" — మీకు త్వరిత, సురక్షితమైన సలహా ఇస్తాను."
      },
      lang
    )
  };
}