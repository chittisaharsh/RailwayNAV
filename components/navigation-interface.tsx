"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Volume2, Mic, RotateCcw, Plus, Minus } from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"

export const nodeFriendlyNames: Record<string, string> = {
  "kiosk": "Kiosk",
  "up1": " Upper Platform 1",
  "up2": " Upper Platform 2",
  "up3": " UpperPlatform 3",
  "up4": " Upper Platform 4",
  "lp1": " Platform 1",
  "lp2": " Platform 2",
  "lp3": " Platform 3",
  "lp4": " Platform 4",
  "tc1": "Ticket Counter 1",
  "tc2": "Ticket Counter 2",
  "wtrm": "Waiting Room",
  "wsrm": "Washroom",
  "esc1": "Escalator 1",
  "esc2": "Escalator 2",
  "esc3": "Escalator 3",
  "esc4": "Escalator 4",
  "esc5": "Escalator 5",
  "elv": "Elevator",
  "stm": "Station Mart",
  "bus_st": "Bus Station",
  "pkng": "Parking",
  "enex_e1": "East Exit 1",
  "enex_e2": "East Exit 2",
  "enex_w": "West Exit",
  "e11": "Edge",
  "e12": "Edge",
  "e2": "Middle bridge",
  "e3": "Middle Bridge 1",
  "e51": "stairs",
  "e52": "stairs",
  "e41": "Edge",
  "e42": "Edge",
  "e61": "Edge",
  "e62": "Edge",
  "ub0": "Upper Bridge 0",
  "ub1": "Upper Bridge 1",
  "ub2": "Upper Bridge 2",
  "ub4": "Upper Bridge 4",
  "lb1": "Lower Bridge 1",
  "lb2": "Lower Bridge 2",
  "lb4": "Lower Bridge 4",
  "mb2": "Middle Bridge 2",
  "mb4": "Middle Bridge 4",
  "fd_ct": "Food Court",
  "ep": " Parking elevator ",
  "mdrm": "Medical Room",
  "autost": "Auto Stand"
};

// Simulated Google Translate API (replace with actual API in production)
const translateText = async (text: string, targetLang: string) => {
  // In a real implementation, this would call the Google Translate API
  // For demonstration, we'll just append the language code
  return `${text} (${targetLang})`;
};

const Translate = ({ children, lang = 'en' }: { children: string; lang?: string }) => {
  const [translated, setTranslated] = useState(children);

  useEffect(() => {
    const translate = async () => {
      if (lang !== 'en') {
        const result = await translateText(children, lang);
        // Remove the language code part
        setTranslated(result.split(' (')[0]);
      } else {
        setTranslated(children);
      }
    };
    translate();
  }, [children, lang]);

  return <span>{translated}</span>;
};

const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white-300 text-gray-600 rounded-md p-1 w-[40px] h-[40px] flex items-center justify-center">
    {children}
  </div>
)

const SvgIcon = ({ name, className = "h-14 w-14" }: { name: string; className?: string }) => {
  console.log(`Loading SVG icon: /${name}.svg`); // Add this debug line
  return <img src={`/${name}.svg`} alt={name} className={className} />
}

const stationGraph: Record<string, Record<string, number>> = {
  "kiosk": {"tc1":1,"esc3":1},
  "autost":{"enex_e1":1},
  "enex_e1":{"e12":1,"autost":1},
  "wsrm":{"e11":1},
  "e11":{"wsrm":1,"esc1":1,"e12":3},
  "e12":{"e11":3,"mdrm":1,"enex_e1":1},
  "mdrm":{"e12":1,"wtrm":1},
  "wtrm":{"mdrm":1,"tc1":1},
  "tc1":{"wtrm":1,"kiosk":1},
  "enex_e2":{"ub0":1},
  "esc1":{"e11":1,"ub0":1},
  "ub0":{"esc1":1,"e2":2,"enex_e2":1,"ub1":1},
  "e2":{"e3":1,"ub0":2},
  "ub1":{"esc2":1,"ub0":1,"ub2":2},
  "esc2":{"ub1":1,"up1":1},
  "up1":{"esc2":1,"e3":1},
  "e3":{"up1":1,"lp1":1,"e2":1,"mb2":2},
  "lp1":{"e3":1,"esc3":1},
  "esc3":{"lp1":1,"lb1":1},
  "lb1":{"esc3":1,"lb2":2},
  "ub2":{"ub1":2, "e41":1, "ub4":2},
  "e41":{"ub2":1,"up2":1,"up3":1, "elv":1},
  "up2":{"e41":1},
  "up3":{"e41":1},
  "elv":{"e41":1,"mb2":1},
  "mb2":{"elv":1,"mb4":2,"e3":2,"e42":1.5},
  "e42":{"mb2":1.5,"lp2":1,"lp3":1,"lb2":1.5},
  "lp2":{"e42":1},
  "lp3":{"e42":1},
  "lb2":{"lb1":2,"e42":1.5,"lb4":2},
  "ub4":{"ub2":2,"esc4":1, "e61":2},
  "esc4":{"ub4":1, "up4":1, "stm":1},
  "up4":{"esc4":1, "e51":0.5},
  "e51":{"up4":0.5,"mb4":1,"enex_w":1},
  "mb4":{"e51":0.2,"e52":1,"mb2":2},
  "e52":{"mb4":0.2,"tc2":1,"lp4":0.8},
  "lp4":{"e52":0.8,"esc5":1},
  "esc5":{"lp4":0.5,"lb4":1},
  "lb4":{"esc5":0.5,"lb2":2,"ep":1},
  "stm":{"esc4":1,"tc2":4,"fd_ct":1},
  "enex_w":{"e51":1},
  "tc2":{"e52":1, "stm":4},
  "ep":{"lb4":1,"pkng":1,"e62":1},
  "e61":{"ub4":2,"bus_st":3},
  "bus_st":{"e61":3,"e62":3},
  "e62":{ "bus_st":3, "ep":1},
  "pkng":{"ep":1},
  "fd_ct":{"stm":1}
}

export const coordinates: Record<string, [number, number]> = {
  "kiosk":[198,321],
  "autost":[43,186.5],
  "enex_e1":[84,186.5],
  "wsrm":[137,19],
  "e11":[137,76],
  "e12":[137,186.5],
  "mdrm":[137,230.5],
  "wtrm":[137,271],
  "tc1":[137,321],
  "enex_e2":[204,19],
  "esc1":[176.8,76],
  "ub0":[204,76],
  "e2":[204,208],
  "ub1":[269.5,76],
  "esc2":[269.5,100],
  "up1":[269.5,133.8],
  "e3":[269.5,208],
  "lp1":[269.5,271],
  "esc3":[269.5,321],
  "lb1":[269,341],
  "up2":[400.3,133.8],
  "lp2":[400.3,271],
  "ub2":[429.4,76],
  "e41":[429.4,133.8],
  "elv":[429.4,186.5],
  "mb2":[429.4,208],
  "e42":[429.4,271],
  "lb2":[429.4,341],
  "up3":[459,133.8],
  "lp3":[459,271],
  "ub4":[585,76],
  "esc4":[585,100],
  "up4":[585,133.8],
  "e51":[585,186.5],
  "mb4":[585,208],
  "e52":[585,230.5],
  "lp4":[585,271],
  "esc5":[585,321],
  "lb4":[585,341],
  "stm":[680.3,100],
  "tc2":[680.3,230.5],
  "pkng":[704.5,271],
  "ep":[704.5,341],
  "enex_w":[729,186.5],
  "e61":[820,76],
  "bus_st":[820,186.5],
  "e62":[820,341],
  "fd_ct":[729,100]
}

const scaleCoordinates = (x: number, y: number, svgSize: { width: number; height: number }) => {
  const scaleX = svgSize.width / 900;
  const scaleY = svgSize.height / 400;
  return [x * scaleX, y * scaleY];
};

function findShortestPath(start: string, end: string): string[] {
  // Skip if either node is not in the active graph
  if (!stationGraph[start] || !stationGraph[end]) {
    return [];
  }

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  // Initialize with only nodes that exist in activeGraph
  Object.keys(stationGraph).forEach(node => {
    distances[node] = Infinity;
    previous[node] = null;
    unvisited.add(node);
  });

  distances[start] = 0;

  while (unvisited.size > 0) {
    let current = Array.from(unvisited).reduce((a, b) => 
      distances[a] < distances[b] ? a : b
    );

    if (current === end) break;

    unvisited.delete(current);

    // Only consider neighbors that exist in activeGraph
    Object.entries(stationGraph[current] || {}).forEach(([neighbor, distance]) => {
      if (unvisited.has(neighbor)) {
        const alt = distances[current] + distance;
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = current;
        }
      }
    });
  }

  if (!previous[end]) return [];

  const path: string[] = [];
  let current: string | null = end;
  while (current) {
    path.unshift(current);
    current = previous[current];
  }

  return path;
}

const menuItems = [
  { icon: "platform1", label: { english: "Platform 1", hindi: "प्लेटफ़ॉर्म 1", marathi: "प्लॅटफॉर्म 1", gujarati: "પ્લેટફોર્મ 1" }, value: "lp1" },
  { icon: "platform2", label: { english: "Platform 2", hindi: "प्लेटफ़ॉर्म 2", marathi: "प्लॅटफॉर्म 2", gujarati: "પ્લેટફોર્મ 2" }, value: "lp2" },
  { icon: "platform3", label: { english: "Platform 3", hindi: "प्लेटफ़ॉर्म 3", marathi: "प्लॅटफॉर्म 3", gujarati: "પ્લેટફોર્મ 3" }, value: "lp3" },
  { icon: "platform4", label: { english: "Platform 4", hindi: "प्लेटफ़ॉर्म 4", marathi: "प्लॅटफॉर्म 4", gujarati: "પ્લેટફોર્મ 4" }, value: "lp4" },
  { icon: "ticket_counter", label: { english: "Ticket Counter 1", hindi: "टिकट काउंटर 1", marathi: "तिकीट काउंटर 1", gujarati: "ટિકિટ કાઉન્ટર 1" }, value: "tc1" },
  { icon: "ticket_counter", label: { english: "Ticket Counter 2", hindi: "टिकट काउंटर 2", marathi: "तिकीट काउंटर 2", gujarati: "ટિકિટ કાઉન્ટર 2" }, value: "tc2" },
  { icon: "waiting_room", label: { english: "Waiting Room", hindi: "प्रतीक्षालय", marathi: "प्रतीक्षा कक्ष", gujarati: "પ્રતીક્ષા ખંડ" }, value: "wtrm" },
  { icon: "medical_room", label: { english: "Medical Room", hindi: "चिकित्सा कक्ष", marathi: "वैद्यकीय कक्ष", gujarati: "મેડિકલ રૂમ" }, value: "mdrm" },
  { icon: "washroom", label: { english: "Washroom", hindi: "शौचाय", marathi: "स्वच्छतागृह", gujarati: "શૌચાલય" }, value: "wsrm" },
  { icon: "escalator", label: { english: "Escalator", hindi: "एस्केलेटर", marathi: "एस्केलेटर", gujarati: "એસ્કેલેટર" }, value: "esc2" },
  { icon: "elevator", label: { english: "Elevator", hindi: "लिफ्ट", marathi: "लिफ्ट", gujarati: "લિફ્ટ" }, value: "elv" },
  { icon: "elevator", label: { english: "Parking Elevator", hindi: "पार्किंग लिफ्ट", marathi: "पार्किंग लिफ्ट", gujarati: "પાર્કિંગ લિફ્ટ" }, value: "ep" },
  { icon: "food_court", label: { english: "Food Court", hindi: "फूड कोर्ट", marathi: "फूड कोर्ट", gujarati: "ફૂડ કોર્ટ" }, value: "fd_ct" },
  { icon: "station_master", label: { english: "Station Master", hindi: "स्टेशन मास्टर", marathi: "स्टेशन मास्टर", gujarati: "સ્ટેશન માસ્ટર" }, value: "stm" },
  { icon: "bus", label: { english: "Bus Station", hindi: "बस स्टेशन", marathi: "बस स्थानक", gujarati: "બસ સ્ટેશન" }, value: "bus_st" },
  { icon: "parking", label: { english: "Parking", hindi: "पार्किंग", marathi: "पार्किंग", gujarati: "પાર્કિંગ" }, value: "pkng" },
  { icon: "entex", label: { english: "East Exit 1", hindi: "पूर्वी निकास 1", marathi: "पूर्व निर्गम 1", gujarati: "પૂર્વ નિકાસ 1" }, value: "enex_e1" },
  { icon: "entex", label: { english: "East Exit 2", hindi: "पूर्वी निकास 2", marathi: "पूर्व निर्गम 2", gujarati: "પૂર્વ નિકાસ 2" }, value: "enex_e2" },
  { icon: "entex", label: { english: "West Exit", hindi: "पश्चिमी निकास", marathi: "पश्चिम निर्गम", gujarati: "પશ્ચિમ નિકાસ" }, value: "enex_w" },
]


const translations = {
  english: {
    platform: 'Platform',
    ticketCounter: 'Ticket Counter',
    stationMaster: 'Station Master',
    waitingRoom: 'Waiting Room',
    washroom: 'Washroom',
    staircase: 'Staircase',
    elevator: 'Elevator',
    escalator: 'Escalator',
    busStand: 'Bus Stand',
    otherTransport: 'Other Transport',
    entranceExit: 'Entrance/Exit',
    parking: 'Parking',
    medicalRoom: 'Medical Room',
    atm: 'ATM',
    quickSearch: 'Quick Search',
    announcement: 'Announcement',
    selectedDestination: 'You have selected',
    qrCodeInfo: 'QR Code Information',
    selectedRoute: 'You have selected the route: ',
    selectRouteFirst: 'Please select a route first.'
  },
  hindi: {
    platform: 'प्लेटफॉर्म',
    ticketCounter: 'टिकट काउंटर',
    stationMaster: 'स्टेशन मास्टर',
    waitingRoom: 'प्रतीक्षालय',
    washroom: 'शौचालय',
    staircase: 'सीढ़ी',
    elevator: 'लिफ्ट',
    escalator: 'एस्केलेटर',
    busStand: 'बस स्टैंड',
    otherTransport: 'अन्य परिवहन',
    entranceExit: 'प्रवेश/निर्गमन',
    parking: 'पार्किंग',
    medicalRoom: 'चिकित्सा कक्ष',
    atm: 'एटीएम',
    quickSearch: 'त्वरित खोज',
    announcement: 'घोषणा',
    selectedDestination: 'आपने चुना है',
    qrCodeInfo: 'क्यूआर कोड जानकारी',
    selectedRoute: 'आपने यह मार्ग चुना है: ',
    selectRouteFirst: 'कृपया पहले एक मार्ग चुनें।'
  },
  marathi: {
    platform: 'प्लेटफॉर्म',
    ticketCounter: 'टिकिट काउंटर',
    stationMaster: 'स्टेशन मास्टर',
    waitingRoom: 'वाटचालय',
    washroom: 'स्वच्छतागृह',
    staircase: 'स्तंभ',
    elevator: 'लिफ्ट',
    escalator: 'एस्केलेटर',
    busStand: 'बस स्थान',
    otherTransport: 'इतर वाहतूक',
    entranceExit: 'प्रवेश/निर्गम',
    parking: 'पार्किंग',
    medicalRoom: 'वैद्यकीय खोली',
    atm: 'एटीएम',
    quickSearch: 'त्वरित शोध',
    announcement: 'घोषणा',
    selectedDestination: 'आपण निवडले आहे',
    qrCodeInfo: 'क्यूआर कोड माहिती',
    selectedRoute: 'आपण हा मार्ग निवडला आहे: ',
    selectRouteFirst: 'कृपया प्रथम एक मार्ग निवडा.'
  },
  gujarati: {
    platform: 'પ્લેટફોર્મ',
    ticketCounter: 'ટિકિટ કાઉન્ટર',
    stationMaster: 'સ્ટેશન માસ્ટ���',
    waitingRoom: 'પ્રતીક્ષા કક્ષ',
    washroom: 'શૌચાલય',
    staircase: 'સીડી',
    elevator: 'લિફ્ટ',
    escalator: 'એસ્કેલેટર',
    busStand: 'બસ સ્ટેન્ડ',
    otherTransport: 'અન્ય પરિવહન',
    entranceExit: 'પ્રવેશ/નિ��્ગમ��',
    parking: 'પાર્કિંગ',
    medicalRoom: 'મેડિકલ રૂમ',
    atm: 'ATM',
    quickSearch: 'ઝડપી શોધ',
    announcement: 'જાહેરાત',
    selectedDestination: 'તમે પસંદ કર્યું છે',
    qrCodeInfo: 'ક્યૂઆર કોડ માહિતી',
    selectedRoute: 'તમ��� આ માર્ગ પસંદ કર્યો છે: ',
    selectRouteFirst: 'કૃપા કરીને પહેલા એક માર્ગ પસંદ કરો.'
  }
}

const stationInfo = {
  name: "Kalwa Station Information",
  railwayLines: [
    {
      name: "Central Line (CR)",
      route: "CST - Kalyan/Kasara/Khopoli"
    }
  ],
  platforms: [
    {
      number: 1,
      direction: "Khopoli (Up Direction)",
      color: "#ffb600"
    },
    {
      number: 2,
      direction: "CSMT (Down Direction)",
      color: "#4092f4"
    },
    {
      number: 4,
      direction: "CSMT (Down Direction)",
      color: "#47c947"
    },
    {
      number: 3,
      direction: "Kasara (Up Direction)",
      color: "#6a0872"
    }
  ]
};

// Declare the SpeechRecognitionError interface if not available
interface SpeechRecognitionError {
  error: string; // The error type (e.g., 'no-speech', 'audio-capture', etc.)
  message: string; // A message describing the error
}

// Declare the SpeechRecognition interface if not available
interface SpeechRecognition {
  new (): SpeechRecognition;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionError) => void; // Now this will work
  continuous: boolean;
  interimResults: boolean;
  lang: string;
}

// Declare the SpeechRecognitionEvent interface if not available
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

// Declare the SpeechRecognitionResultList interface if not available
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
}

// Declare the SpeechRecognitionResult interface if not available
interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

// Declare the SpeechRecognitionAlternative interface if not available
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface StationNavigationProps {
  initialData?: {
    nodes: Record<string, string>;
    graph: Record<string, Record<string, number>>;
    coordinates: Record<string, [number, number]>;
  };
}

// Add these new interfaces
interface AdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => void;
}

interface NodeManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Record<string, boolean>;
  onSaveChanges: (nodes: Record<string, boolean>) => void;
}

const StationNavigation: React.FC<StationNavigationProps> = ({ initialData }) => {
  const activeNodes = initialData?.nodes || nodeFriendlyNames;
  const activeGraph = initialData?.graph || stationGraph;
  const activeCoordinates = initialData?.coordinates || coordinates;
  
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [language, setLanguage] = useState('english')
  const [currentLang, setCurrentLang] = useState(initialData?.language || 'english')
  const [zoom, setZoom] = useState(1)
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedDestination, setSelectedDestination] = useState("")
  const [path, setPath] = useState<string[]>([])
  const svgRef = useRef<SVGSVGElement>(null)
  const [svgSize, setSvgSize] = useState({ width: 1800, height: 800 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false)
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [spokenText, setSpokenText] = useState<string>("")
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [isNodeManagementOpen, setIsNodeManagementOpen] = useState(false);
  const [activeNodesState, setActiveNodesState] = useState<Record<string, boolean>>(() => {
    // Initialize with all nodes enabled
    return Object.keys(stationGraph).reduce((acc, node) => {
      acc[node] = true;
      return acc;
    }, {} as Record<string, boolean>);
  });

  useEffect(() => {
    const setVoices = () => {
      window.speechSynthesis.getVoices();
    };
    setVoices();
    window.speechSynthesis.onvoiceschanged = setVoices;
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setSvgSize({ width, height })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('activeNodes');
    if (stored) {
      const nodes = JSON.parse(stored);
      setActiveNodesState(nodes);
      
      // Filter graph based on stored node states
      const filteredGraph = Object.entries(stationGraph).reduce((acc, [node, connections]) => {
        if (nodes[node]) {
          acc[node] = Object.entries(connections).reduce((connAcc, [target, weight]) => {
            if (nodes[target]) {
              connAcc[target] = weight;
            }
            return connAcc;
          }, {} as Record<string, number>);
        }
        return acc;
      }, {} as typeof stationGraph);

      Object.assign(stationGraph, filteredGraph);
      updateSvg();
    }
  }, []);

  const handleQuickSearchClick = async (option: { english: string, hindi: string, marathi: string, gujarati: string }) => {
    const translatedOption = option[language as keyof typeof option];
    const message = `${translations[language].selectedDestination} "${translatedOption}".`
    setAnnouncement(message);
    setIsDialogOpen(true);

    // Prepare the full message for TTS
    const fullMessage = message;

    // Call the TTS API via the API route
    try {
        const response = await fetch('/api/tts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: fullMessage, language }),
        });

        if (!response.ok) {
            throw new Error('Failed to synthesize speech');
        }

        // Handle the audio content if needed
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();

    } catch (error) {
        console.error('Error calling TTS API:', error);
    }

    handleDestinationClick(menuItems.find(item => item.label.english === option.english)?.value || "");
  }

  useEffect(() => {
    if (isDialogOpen) {
        const timer = setTimeout(() => {
            setIsDialogOpen(false);
        }, 5000); // Close dialog after 6 seconds

        return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [isDialogOpen]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCurrentLang(newLang === 'english' ? 'en' : newLang === 'hindi' ? 'hi' : newLang === 'marathi' ? 'mr' : 'gu');
  };

  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom * 1.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom / 1.2, 1))
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const newX = (e.clientX - dragStart.x) / zoom;
      const newY = (e.clientY - dragStart.y) / zoom;
      setPanPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const scaleCoordinates = (x: number, y: number, svgSize: { width: number; height: number }) => {
    const scaleX = svgSize.width / 900;
    const scaleY = svgSize.height / 400;
    return [x * scaleX, y * scaleY];
  };

  const updateSvg = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const edgesGroup = svg.getElementById('edges');
    const nodesGroup = svg.getElementById('nodes');
    const pathGroup = svg.getElementById('path');

    if (!edgesGroup || !nodesGroup || !pathGroup) return;

    // Clear previous elements
    edgesGroup.innerHTML = '';
    nodesGroup.innerHTML = '';
    pathGroup.innerHTML = '';

    // Draw all valid paths in light gray
    Object.entries(activeGraph).forEach(([node, neighbors]) => {
      if (activeNodes[node]) { // Only process if node exists
        Object.keys(neighbors).forEach((neighbor) => {
          if (activeNodes[neighbor] && activeCoordinates[node] && activeCoordinates[neighbor]) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            const [x1, y1] = scaleCoordinates(activeCoordinates[node][0], activeCoordinates[node][1], svgSize);
            const [x2, y2] = scaleCoordinates(activeCoordinates[neighbor][0], activeCoordinates[neighbor][1], svgSize);
            line.setAttribute('x1', x1.toString());
            line.setAttribute('y1', y1.toString());
            line.setAttribute('x2', x2.toString());
            line.setAttribute('y2', y2.toString());
            line.setAttribute('stroke', 'rgba(200, 200, 200, 0.1)');
            line.setAttribute('stroke-width', '2');
            edgesGroup.appendChild(line);
          }
        });
      }
    });

    // Draw all nodes as square buttons
    Object.entries(activeCoordinates).forEach(([node, [x, y]]) => {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const [scaledX, scaledY] = scaleCoordinates(x, y, svgSize);
      rect.setAttribute('x', (scaledX - 14).toString()); // Center the 26px square
      rect.setAttribute('y', (scaledY - 14).toString()); // Center the 26px square
      rect.setAttribute('width', '28');
      rect.setAttribute('height', '28');
      rect.setAttribute('fill', 'transparent');
      rect.setAttribute('stroke', '#00ff00');
      rect.setAttribute('stroke-width', '2');
      rect.setAttribute('data-node', node);

      if (node === "kiosk") {
        rect.setAttribute('fill', '#00ff00');
        rect.setAttribute('filter', 'url(#glow)');
        rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
        rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
      }

      if (node === "e52") {
        rect.setAttribute('fill', '#00ff00');
        rect.setAttribute('filter', 'url(#glow)');
        rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
        rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', 'transparent');
        rect.setAttribute('stroke-width', '2');
        pathGroup.appendChild(rect);  
      }

      if (node === "mb2") {
        rect.setAttribute('fill', '#00ff00');
        rect.setAttribute('filter', 'url(#glow)');
        rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
        rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', 'transparent');
        rect.setAttribute('stroke-width', '2');
        pathGroup.appendChild(rect);  
      }

      if (node === "mb4") {
        rect.setAttribute('fill', '#00ff00');
        rect.setAttribute('filter', 'url(#glow)');
        rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
        rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', 'transparent');
        rect.setAttribute('stroke-width', '2');
        pathGroup.appendChild(rect);  
      }

      if (node === "lb2") {
        rect.setAttribute('fill', '#00ff00');
        rect.setAttribute('filter', 'url(#glow)');
        rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
        rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', 'transparent');
        rect.setAttribute('stroke-width', '2');
        pathGroup.appendChild(rect);  
      }

      if (node === "e51") {
        rect.setAttribute('fill', '#00ff00');
        rect.setAttribute('filter', 'url(#glow)');
        rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
        rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', 'transparent');
        rect.setAttribute('stroke-width', '2');
        pathGroup.appendChild(rect);  
      }

      if (node === "e11") {
        rect.setAttribute('fill', '#00ff00');
        rect.setAttribute('filter', 'url(#glow)');
        rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
        rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', 'transparent');
        rect.setAttribute('stroke-width', '2');
        pathGroup.appendChild(rect);  
      }

      if (node === "e12") {
        rect.setAttribute('fill', '#00ff00');
        rect.setAttribute('filter', 'url(#glow)');
        rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
        rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', 'transparent');
        rect.setAttribute('stroke-width', '2');
        pathGroup.appendChild(rect);  
      }

      if (node === "ub1") {
        rect.setAttribute('fill', '#00ff00');
        rect.setAttribute('filter', 'url(#glow)');
        rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
        rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', 'transparent');
        rect.setAttribute('stroke-width', '2');
        pathGroup.appendChild(rect);  
      }

      if (node === "ub2") {
        rect.setAttribute('fill', '#00ff00');
        rect.setAttribute('filter', 'url(#glow)');
        rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
        rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', 'transparent');
        rect.setAttribute('stroke-width', '2');
        pathGroup.appendChild(rect);  
      }

      if (node === "ub3") {
        rect.setAttribute('fill', '#00ff00');
        rect.setAttribute('filter', 'url(#glow)');
        rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
        rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', 'transparent');
        rect.setAttribute('stroke-width', '2');
        pathGroup.appendChild(rect);  
      }

      if (node === "ub4") {
        rect.setAttribute('fill', '#00ff00');
        rect.setAttribute('filter', 'url(#glow)');
        rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
        rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', 'transparent');
        rect.setAttribute('stroke-width', '2');
        pathGroup.appendChild(rect);  
      }

      if (node === "e61") {
        rect.setAttribute('fill', '#00ff00');
        rect.setAttribute('filter', 'url(#glow)');
        rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
        rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', 'transparent');
        rect.setAttribute('stroke-width', '2');
        pathGroup.appendChild(rect);  
      }

      if (node === "e62") {
        rect.setAttribute('fill', '#00ff00');
        rect.setAttribute('filter', 'url(#glow)');
        rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
        rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', 'transparent');
        rect.setAttribute('stroke-width', '2');
        pathGroup.appendChild(rect);  
      }

      if (node === "e2") {
        rect.setAttribute('fill', '#00ff00');
        rect.setAttribute('filter', 'url(#glow)');
        rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
        rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', 'transparent');
        rect.setAttribute('stroke-width', '2');
        pathGroup.appendChild(rect);  
      }

      if (node === "e3") {
        rect.setAttribute('fill', '#00ff00');
        rect.setAttribute('filter', 'url(#glow)');
        rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
        rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', 'transparent');
        rect.setAttribute('stroke-width', '2');
        pathGroup.appendChild(rect);  
      }

      if (node === "e41") {
        rect.setAttribute('fill', '#00ff00');
        rect.setAttribute('filter', 'url(#glow)');
        rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
        rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', 'transparent');
        rect.setAttribute('stroke-width', '2');
        pathGroup.appendChild(rect);  
      }

      if (node === "ub0") {
        rect.setAttribute('fill', '#00ff00');
        rect.setAttribute('filter', 'url(#glow)');
        rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
        rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', 'transparent');
        rect.setAttribute('stroke-width', '2');
        pathGroup.appendChild(rect);  
      }

      if (node === "lb4") {
        rect.setAttribute('fill', '#00ff00');
        rect.setAttribute('filter', 'url(#glow)');
        rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
        rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', 'transparent');
        rect.setAttribute('stroke-width', '2');
        pathGroup.appendChild(rect);  
      }

      if (node === "e42") {
        rect.setAttribute('fill', '#00ff00');
        rect.setAttribute('filter', 'url(#glow)');
        rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
        rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', 'transparent');
        rect.setAttribute('stroke-width', '2');
        pathGroup.appendChild(rect);  
      }

      if (node === "lb1") {
        rect.setAttribute('fill', '#00ff00');
        rect.setAttribute('filter', 'url(#glow)');
        rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
        rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', 'transparent');
        rect.setAttribute('stroke-width', '2');
        pathGroup.appendChild(rect);  
      }

      nodesGroup.appendChild(rect);
    });

    // Draw the shortest path in red
    if (path.length > 1) {
      for (let i = 0; i < path.length - 1; i++) {
        const current = path[i];
        const next = path[i + 1];
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const [x1, y1] = scaleCoordinates(activeCoordinates[current][0], activeCoordinates[current][1], svgSize);
        const [x2, y2] = scaleCoordinates(activeCoordinates[next][0], activeCoordinates[next][1], svgSize);
        line.setAttribute('x1', x1.toString());
        line.setAttribute('y1', y1.toString());
        line.setAttribute('x2', x2.toString());
        line.setAttribute('y2', y2.toString());
        line.setAttribute('stroke', '#ff1818');
        line.setAttribute('stroke-width', '6');
        pathGroup.appendChild(line);
      }

      // Highlight nodes on the path
      path.forEach((node) => {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const [scaledX, scaledY] = scaleCoordinates(activeCoordinates[node][0], activeCoordinates[node][1], svgSize);
        rect.setAttribute('x', (scaledX - 14).toString());
        rect.setAttribute('y', (scaledY - 14).toString());
        rect.setAttribute('width', '28');
        rect.setAttribute('height', '28');
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', '#ff1818');
        rect.setAttribute('stroke-width', '2');
        pathGroup.appendChild(rect);

        if (node === "kiosk") {
          rect.setAttribute('fill', '#00ff00');
          rect.setAttribute('filter', 'url(#glow)');
          rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
          rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
          rect.setAttribute('width', '18');
          rect.setAttribute('height', '18');
        }

        if (node === "e52") {
          rect.setAttribute('fill', '#00ff00');
          rect.setAttribute('filter', 'url(#glow)');
          rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
          rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
          rect.setAttribute('width', '18');
          rect.setAttribute('height', '18');
          rect.setAttribute('fill', 'transparent');
          rect.setAttribute('stroke', 'transparent');
          rect.setAttribute('stroke-width', '2');
          pathGroup.appendChild(rect);  
        }

        if (node === "e51") {
          rect.setAttribute('fill', '#00ff00');
          rect.setAttribute('filter', 'url(#glow)');
          rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
          rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
          rect.setAttribute('width', '18');
          rect.setAttribute('height', '18');
          rect.setAttribute('fill', 'transparent');
          rect.setAttribute('stroke', 'transparent');
          rect.setAttribute('stroke-width', '2');
          pathGroup.appendChild(rect);  
        }

        if (node === "e11") {
          rect.setAttribute('fill', '#00ff00');
          rect.setAttribute('filter', 'url(#glow)');
          rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
          rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
          rect.setAttribute('width', '18');
          rect.setAttribute('height', '18');
          rect.setAttribute('fill', 'transparent');
          rect.setAttribute('stroke', 'transparent');
          rect.setAttribute('stroke-width', '2');
          pathGroup.appendChild(rect);  
        }

        if (node === "e12") {
          rect.setAttribute('fill', '#00ff00');
          rect.setAttribute('filter', 'url(#glow)');
          rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
          rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
          rect.setAttribute('width', '18');
          rect.setAttribute('height', '18');
          rect.setAttribute('fill', 'transparent');
          rect.setAttribute('stroke', 'transparent');
          rect.setAttribute('stroke-width', '2');
          pathGroup.appendChild(rect);  
        }

        if (node === "ub1") {
          rect.setAttribute('fill', '#00ff00');
          rect.setAttribute('filter', 'url(#glow)');
          rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
          rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
          rect.setAttribute('width', '18');
          rect.setAttribute('height', '18');
          rect.setAttribute('fill', 'transparent');
          rect.setAttribute('stroke', 'transparent');
          rect.setAttribute('stroke-width', '2');
          pathGroup.appendChild(rect);  
        }

        if (node === "ub2") {
          rect.setAttribute('fill', '#00ff00');
          rect.setAttribute('filter', 'url(#glow)');
          rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
          rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
          rect.setAttribute('width', '18');
          rect.setAttribute('height', '18');
          rect.setAttribute('fill', 'transparent');
          rect.setAttribute('stroke', 'transparent');
          rect.setAttribute('stroke-width', '2');
          pathGroup.appendChild(rect);  
        }

        if (node === "ub3") {
          rect.setAttribute('fill', '#00ff00');
          rect.setAttribute('filter', 'url(#glow)');
          rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
          rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
          rect.setAttribute('width', '18');
          rect.setAttribute('height', '18');
          rect.setAttribute('fill', 'transparent');
          rect.setAttribute('stroke', 'transparent');
          rect.setAttribute('stroke-width', '2');
          pathGroup.appendChild(rect);  
        }

        if (node === "ub4") {
          rect.setAttribute('fill', '#00ff00');
          rect.setAttribute('filter', 'url(#glow)');
          rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
          rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
          rect.setAttribute('width', '18');
          rect.setAttribute('height', '18');
          rect.setAttribute('fill', 'transparent');
          rect.setAttribute('stroke', 'transparent');
          rect.setAttribute('stroke-width', '2');
          pathGroup.appendChild(rect);  
        }

        if (node === "e61") {
          rect.setAttribute('fill', '#00ff00');
          rect.setAttribute('filter', 'url(#glow)');
          rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
          rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
          rect.setAttribute('width', '18');
          rect.setAttribute('height', '18');
          rect.setAttribute('fill', 'transparent');
          rect.setAttribute('stroke', 'transparent');
          rect.setAttribute('stroke-width', '2');
          pathGroup.appendChild(rect);  
        }

        if (node === "e62") {
          rect.setAttribute('fill', '#00ff00');
          rect.setAttribute('filter', 'url(#glow)');
          rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
          rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
          rect.setAttribute('width', '18');
          rect.setAttribute('height', '18');
          rect.setAttribute('fill', 'transparent');
          rect.setAttribute('stroke', 'transparent');
          rect.setAttribute('stroke-width', '2');
          pathGroup.appendChild(rect);  
        }

        if (node === "e2") {
          rect.setAttribute('fill', '#00ff00');
          rect.setAttribute('filter', 'url(#glow)');
          rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
          rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
          rect.setAttribute('width', '18');
          rect.setAttribute('height', '18');
          rect.setAttribute('fill', 'transparent');
          rect.setAttribute('stroke', 'transparent');
          rect.setAttribute('stroke-width', '2');
          pathGroup.appendChild(rect);  
        }

        if (node === "e3") {
          rect.setAttribute('fill', '#00ff00');
          rect.setAttribute('filter', 'url(#glow)');
          rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
          rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
          rect.setAttribute('width', '18');
          rect.setAttribute('height', '18');
          rect.setAttribute('fill', 'transparent');
          rect.setAttribute('stroke', 'transparent');
          rect.setAttribute('stroke-width', '2');
          pathGroup.appendChild(rect);  
        }

        if (node === "e41") {
          rect.setAttribute('fill', '#00ff00');
          rect.setAttribute('filter', 'url(#glow)');
          rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
          rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
          rect.setAttribute('width', '18');
          rect.setAttribute('height', '18');
          rect.setAttribute('fill', 'transparent');
          rect.setAttribute('stroke', 'transparent');
          rect.setAttribute('stroke-width', '2');
          pathGroup.appendChild(rect);  
        }

        if (node === "ub0") {
          rect.setAttribute('fill', '#00ff00');
          rect.setAttribute('filter', 'url(#glow)');
          rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
          rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
          rect.setAttribute('width', '18');
          rect.setAttribute('height', '18');
          rect.setAttribute('fill', 'transparent');
          rect.setAttribute('stroke', 'transparent');
          rect.setAttribute('stroke-width', '2');
          pathGroup.appendChild(rect);  
        }

        if (node === "lb4") {
          rect.setAttribute('fill', '#00ff00');
          rect.setAttribute('filter', 'url(#glow)');
          rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
          rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
          rect.setAttribute('width', '18');
          rect.setAttribute('height', '18');
          rect.setAttribute('fill', 'transparent');
          rect.setAttribute('stroke', 'transparent');
          rect.setAttribute('stroke-width', '2');
          pathGroup.appendChild(rect);  
        }

        if (node === "lb1") {
          rect.setAttribute('fill', '#00ff00');
          rect.setAttribute('filter', 'url(#glow)');
          rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
          rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
          rect.setAttribute('width', '18');
          rect.setAttribute('height', '18');
          rect.setAttribute('fill', 'transparent');
          rect.setAttribute('stroke', 'transparent');
          rect.setAttribute('stroke-width', '2');
          pathGroup.appendChild(rect);  
        }

        if (node === "lb2") {
          rect.setAttribute('fill', '#00ff00');
          rect.setAttribute('filter', 'url(#glow)');
          rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
          rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
          rect.setAttribute('width', '18');
          rect.setAttribute('height', '18');
          rect.setAttribute('fill', 'transparent');
          rect.setAttribute('stroke', 'transparent');
          rect.setAttribute('stroke-width', '2');
          pathGroup.appendChild(rect);  
        }

        if (node === "mb2") {
          rect.setAttribute('fill', '#00ff00');
          rect.setAttribute('filter', 'url(#glow)');
          rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
          rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
          rect.setAttribute('width', '18');
          rect.setAttribute('height', '18');
          rect.setAttribute('fill', 'transparent');
          rect.setAttribute('stroke', 'transparent');
          rect.setAttribute('stroke-width', '2');
          pathGroup.appendChild(rect);  
        }

        if (node === "mb4") {
          rect.setAttribute('fill', '#00ff00');
          rect.setAttribute('filter', 'url(#glow)');
          rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
          rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
          rect.setAttribute('width', '18');
          rect.setAttribute('height', '18');
          rect.setAttribute('fill', 'transparent');
          rect.setAttribute('stroke', 'transparent');
          rect.setAttribute('stroke-width', '2');
          pathGroup.appendChild(rect);  
        }

        if (node === "e42") {
          rect.setAttribute('fill', '#00ff00');
          rect.setAttribute('filter', 'url(#glow)');
          rect.setAttribute('x', (scaledX - 9).toString()); // Center the 26px square
          rect.setAttribute('y', (scaledY - 9).toString()); // Center the 26px square
          rect.setAttribute('width', '18');
          rect.setAttribute('height', '18');
          rect.setAttribute('fill', 'transparent');
          rect.setAttribute('stroke', 'transparent');
          rect.setAttribute('stroke-width', '2');
          pathGroup.appendChild(rect);  
        }

        // ... other conditional rendering for highlighted nodes ...

      });
    }
  };

  useEffect(() => {
    updateSvg();
  }, [path, svgSize, zoom, panPosition]);

  const handleDestinationClick = (value: string) => {
    setSelectedDestination(value)
    const calculatedPath = findShortestPath("kiosk", value)
    if (calculatedPath.length > 0) {
      setPath(calculatedPath)
    } else {
      console.error(`Unable to find path from kiosk to ${value}`)
    }
  }

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    
    // Calculate the click position in SVG coordinates, accounting for zoom and pan
    const x = ((e.clientX - rect.left) / rect.width * viewBox.width - panPosition.x) / zoom;
    const y = ((e.clientY - rect.top) / rect.height * viewBox.height - panPosition.y) / zoom;

    let closestNode = '';
    let minDistance = Infinity;

    Object.entries(activeCoordinates).forEach(([node, [nodeX, nodeY]]) => {
      const [scaledNodeX, scaledNodeY] = scaleCoordinates(nodeX, nodeY, svgSize);
      const distance = Math.sqrt(Math.pow(x - scaledNodeX, 2) + Math.pow(y - scaledNodeY, 2));
    
      // Adjust the click threshold based on the zoom level
      const threshold = 30 / zoom;
    
      if (distance < minDistance && distance < threshold) {
        minDistance = distance;
        closestNode = node;
      }
    }); // Ensure this closing parenthesis and bracket are present

    if (closestNode) {
      handleDestinationClick(closestNode);
    }
  };

  const handleReset = () => {
    // Existing reset functionality
    setZoom(1)
    setPanPosition({ x: 0, y: 0 })
    setSelectedDestination("")
    setPath([])
    
    // Add voice navigation reset
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      currentAudio = null
    }
    
    // Stop any ongoing speech synthesis
    window.speechSynthesis.cancel()
    
    // Reset voice input if it's active
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      recognitionRef.current = null
    }
    
    // Clear any announcements
    setAnnouncement('')
  }

  const getRouteInfo = () => {
    const destination = path[path.length - 1];
    
    // Map node values to descriptive terms
    const routeDescriptions: Record<string, string> = {
      "kiosk": "Kiosk",
      "esc3": "Escalator",
      "lp1": "Platform 1",
      "e3": "Middle Bridge",
      "up1": "Up Direction"
      // Add more mappings as needed
    };

    // Create a descriptive route using the mapped terms
    const route = path.map(node => routeDescriptions[node] || node).join(" → ");
    
    // Provide real-time directions
    const direction = "Follow the signs to reach your destination."; // You can customize this further if needed
    return `${translations[language].selectedRoute} ${route}. ${direction}`;
  }

  function getDirection(from: string, to: string): string {
    const [fromX, fromY] = activeCoordinates[from];
    const [toX, toY] = activeCoordinates[to];
    
    if (Math.abs(toX - fromX) > Math.abs(toY - fromY)) {
      return toX > fromX ? "right" : "left";
    } else {
      return toY > fromY ? "down" : "up";
    }
  }

  const getRouteDirections = (path: string[]): string => {
    let directions = '';
    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];
      const direction = getDirection(current, next);
      directions += `From ${activeNodes[current]} go ${direction}. `;
    }
    return directions;
  };

  let currentAudio: HTMLAudioElement | null = null; // Keep track of the currently playing audio

  const handleVoiceGuidance = async () => {
    if (path.length === 0) {
      speakGuidance("Please select a destination first.");
      return;
    }

    const directions = getDetailedDirections(path);
    
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: directions,
          language: language
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      // Play new audio
      currentAudio = new Audio(audioUrl);
      currentAudio.play();
    } catch (error) {
      console.error('Error during voice guidance:', error);
      speakGuidance("Sorry, there was an error with the voice guidance.");
    }
  };

  function simplifyNodeName(name: string): string {
    if (name.startsWith("Edge")) return "edge";
    if (name.startsWith("Escalator")) return "escalator";
    if (name === "Elevator") return "elevator";
    return name;
  }

  function getTurnDirection(currentOrientation: string, newDirection: string): string {
    if (currentOrientation === newDirection) return "straight";
    const directions = ["north", "east", "south", "west"];
    const currentIndex = directions.indexOf(currentOrientation);
    const newIndex = directions.indexOf(newDirection);
    const diff = (newIndex - currentIndex + 4) % 4;
    if (diff === 1) return "right";
    if (diff === 3) return "left";
    return "straight"; // This case shouldn't occur in normal navigation
  }

  function updateOrientation(currentOrientation: string, turnDirection: string): string {
    if (turnDirection === "straight") return currentOrientation;
    
    const directions = ["north", "east", "south", "west"];
    const currentIndex = directions.indexOf(currentOrientation);
    const newIndex = (currentIndex + (turnDirection === "right" ? 1 : turnDirection === "left" ? -1 : 0) + 4) % 4;
    return directions[newIndex];
  }

  const speakGuidance = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Adjust the speaking rate if needed
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    window.speechSynthesis.speak(utterance);
  };

  // Function to start voice input
  const startVoiceInput = () => {
    setSpokenText("");
    speakGuidance("What is your destination? Please say one of the locations from the quick search menu.");
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < (event.results as SpeechRecognitionResultList).length; ++i) {
          const result = event.results[i]; // Access the result using array indexing
          if (result.isFinal) {
              finalTranscript += result[0].transcript; // Access the transcript
          }
      }
      handleRecognizedSpeech(finalTranscript.toLowerCase()); // Normalize input
    };

    recognition.onerror = (event: SpeechRecognitionError) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      // Optionally, provide feedback to the user
    };

    recognition.start();
  };

  // Function to stop voice input
  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Function to handle recognized speech
  const handleRecognizedSpeech = (spokenDestination: string) => {
    const normalizedDestination = spokenDestination.toLowerCase().trim(); // Normalize input

    const matchedItem = menuItems.find(item => {
        const label = item.label[currentLang as keyof typeof item.label];
        console.log(`Checking label: ${label ? label.toLowerCase() : 'undefined'} against: ${normalizedDestination}`); // Log the comparison
        return label && label.toLowerCase().includes(normalizedDestination);
    });

    if (matchedItem) {
        const label = matchedItem.label[currentLang as keyof typeof matchedItem.label]; // Get the label for the current language

        if (label) { // Check if label is defined
            console.log(`Matched Item: ${label}`); // Log matched item
            // Proceed with the matched item
        } else {
            console.error(`Label not found for language: ${currentLang}`);
        }
    } else {
        console.error(`Destination not found: ${normalizedDestination}`);
    }
  };

  useEffect(() => {
    if ('SpeechRecognition' in window) {
      const recognition = new (window.SpeechRecognition || (window as any).webkitSpeechRecognition)();
      recognitionRef.current = recognition;

      recognition.onresult = async (event) => {
        const spokenText = event.results[0][0].transcript.toLowerCase();
        console.log("Recognized text:", spokenText); // Log recognized text
        const destination = Object.keys(activeNodes).find(key => 
          activeNodes[key].toLowerCase().includes(spokenText)
        );

        if (destination) {
          const path = findShortestPath("kiosk", destination);
          setPath(path); // Assuming setPath is a state setter for the path
          const directions = getRouteDirections(path); // Implement this function to get directions
          await synthesizeSpeech(directions, language); // Speak the directions
        } else {
          console.log("No matching destination found for:", spokenText);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      return () => {
        recognition.stop();
      };
    }
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.error('Speech recognition not supported');
        return;
      }
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const spokenText = event.results[0][0].transcript.toLowerCase();
        console.log('Spoken text:', spokenText);

        // Find matching destination from menuItems
        const matchedItem = menuItems.find(item => 
          item.label.english.toLowerCase().includes(spokenText) ||
          item.label.hindi.toLowerCase().includes(spokenText) ||
          item.label.marathi.toLowerCase().includes(spokenText) ||
          item.label.gujarati.toLowerCase().includes(spokenText)
        );

        if (matchedItem) {
          const calculatedPath = findShortestPath("kiosk", matchedItem.value);
          if (calculatedPath.length > 0) {
            setPath(calculatedPath);
            speakGuidance(`Found path to ${matchedItem.label[language as keyof typeof matchedItem.label]}`);
          }
        } else {
          speakGuidance("Sorry, I couldn't find that destination. Please try again.");
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };
    }

    // Start listening and automatically stop after 5 seconds
    if (!isListening) {
      setIsListening(true);
      speakGuidance("Please say your destination");
      recognitionRef.current?.start();

      // Automatically stop after 5 seconds
      setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          setIsListening(false);
          recognitionRef.current = null;
        }
      }, 8000);
    }
  };

  console.log("Available destinations:", Object.values(activeNodes));

  // Add this helper function to get more natural directions
  const getDetailedDirections = (path: string[]): string => {
    let directions = '';
    
    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];
      const currentName = activeNodes[current] || current;
      const nextName = activeNodes[next] || next;
      
      // Get relative direction between nodes
      const [x1, y1] = activeCoordinates[current];
      const [x2, y2] = activeCoordinates[next];
      
      // Calculate direction
      let direction = '';
      if (Math.abs(x2 - x1) > Math.abs(y2 - y1)) {
        direction = x2 > x1 ? 'right' : 'left';
      } else {
        direction = y2 > y1 ? 'down' : 'up';
      }
      
      // Special cases for different node types
      if (next.startsWith('esc')) {
        directions += `From ${currentName}, take the escalator ${y2 > y1 ? 'down' : 'up'}. `;
      } else if (next === 'elv') {
        directions += `From ${currentName}, take the elevator ${y2 > y1 ? 'down' : 'up'}. `;
      } else {
        directions += `From ${currentName}, go ${direction} towards ${nextName}. `;
      }
    }
    
    return directions;
  };

  // Admin login handler
  const handleAdminLogin = async (username: string, password: string) => {
    // In production, this should be a secure API call
    if (username === "admin" && password === "admin") {
      setIsAdminDialogOpen(false);
      setIsNodeManagementOpen(true);
    } else {
      alert("Invalid credentials");
    }
  };

  // Node management save handler
  const handleSaveNodeChanges = async (nodes: Record<string, boolean>) => {
    try {
      // Update active nodes state
      setActiveNodesState(nodes);
      
      // Save to localStorage
      saveNodeStatesToStorage(nodes);
      
      // Filter the stationGraph based on active nodes
      const filteredGraph = Object.entries(stationGraph).reduce((acc, [node, connections]) => {
        if (nodes[node]) {
          acc[node] = Object.entries(connections).reduce((connAcc, [target, weight]) => {
            if (nodes[target]) {
              connAcc[target] = weight;
            }
            return connAcc;
          }, {} as Record<string, number>);
        }
        return acc;
      }, {} as typeof stationGraph);

      // Update the working graph
      Object.assign(stationGraph, filteredGraph);
      
      // Close dialog
      setIsNodeManagementOpen(false);
      
      // Refresh the visualization
      updateSvg();
    } catch (error) {
      console.error('Error saving node changes:', error);
      alert('Failed to save changes');
    }
  };

  // Add these components within StationNavigation
  const AdminLoginDialog: React.FC<AdminDialogProps> = ({ isOpen, onClose, onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <Button onClick={() => onLogin(username, password)}>
              Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const NodeManagementDialog: React.FC<NodeManagementDialogProps> = ({ 
    isOpen, 
    onClose, 
    nodes, 
    onSaveChanges 
  }) => {
    const [localNodes, setLocalNodes] = useState(nodes);

    const handleNodeToggle = (node: string) => {
      setLocalNodes(prev => ({
        ...prev,
        [node]: !prev[node]
      }));
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Node Management</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {Object.entries(localNodes).map(([node, isActive]) => (
                <div key={node} className="flex items-center space-x-2">
                  <Checkbox
                    checked={isActive}
                    onCheckedChange={() => handleNodeToggle(node)}
                  />
                  <label>{nodeFriendlyNames[node] || node}</label>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onSaveChanges(localNodes)}>
              Apply Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const saveNodeStatesToStorage = (nodes: Record<string, boolean>) => {
    localStorage.setItem('activeNodes', JSON.stringify(nodes));
  };

  return (
    <div className="flex h-screen w-screen bg-[#FF6B00] overflow-hidden" style={{ maxWidth: '1920px', maxHeight: '1080px', margin: '0 auto' }}>
      {/* Left Sidebar */}
      <div className="w-1/4 p-4 flex flex-col h-full">
        {/* Logo */}
        <div className="bg-white p-4 rounded-lg mb-4 flex-shrink-0 flex items-center justify-center">
          <img src="/pravasipath_logo.svg" alt="PravasiPath Logo" className="h-20" />
        </div>

        {/* Quick Search Section */}
        <div className="flex flex-col gap-4 overflow-hidden flex-grow bg-white rounded-lg p-4">
          <h2 className="bg-zinc-800 text-white p-4 rounded-lg text-xl flex-shrink-0 text-center">
            <Translate>{translations[language].quickSearch}</Translate>
          </h2>
          <ScrollArea className="h-[calc(100vh-200px)] pr-2 custom-scrollbar">
            <div className="space-y-2 pr-2">
              {menuItems.map(({ icon, label, value }) => (
                <Button
                  key={value}
                  variant={selectedDestination === value ? "default" : "ghost"}
                  className="w-full justify-start h-[60px] text-base bg-zinc-800 hover:bg-zinc-700 text-white"
                  onClick={() => handleQuickSearchClick(label)}
                >
                  <IconWrapper><SvgIcon name={icon} /></IconWrapper>
                  <span className="ml-3">{label[language as keyof typeof label]}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4">
        {/* Map Container */}
        <div className="flex-1 bg-zinc-800 rounded-lg mb-4 p-2" ref={containerRef}>
          {/* Canvas Map */}
          <div
            className="w-full h-full bg-gray-200 rounded-lg overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full"
              style={{
                transform: `scale(${zoom}) translate3d(${panPosition.x}px, ${panPosition.y}px, 0)`,
                transformOrigin: '0 0',
                transition: 'none'
              }}
              onClick={handleSvgClick}
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <image
                href="/mapkiosk2.svg"
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid slice"
              />
              <g id="edges"></g>
              <g id="nodes"></g>
              <g id="path"></g>
            </svg>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center gap-4">
          {/* Language Selection */}
          <div className="flex items-center bg-white rounded-md pr-4">
            <IconWrapper><SvgIcon name="language" /></IconWrapper>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[200px] border-none text-lg h-16 text-black">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hindi">हिंदी</SelectItem>
                <SelectItem value="marathi">मराठी</SelectItem>
                <SelectItem value="gujarati">ગુજરાતી</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Speaker Option */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className="bg-white h-16 w-16"
          >
            <IconWrapper>
              <SvgIcon name={isSpeakerOn ? "unmute" : "mute"} />
            </IconWrapper>
          </Button>

          {/* Navigation Controls */}
          <div className="flex gap-4 ml-auto">
            <Button 
              variant="secondary" 
              className="bg-zinc-800 text-white p-2 h-[65px] w-[65px]"
              onClick={() => setIsQRDialogOpen(true)}
            >
              <IconWrapper><SvgIcon name="qrcode" /></IconWrapper>
            </Button>
            <Button 
              variant="secondary" 
              className="bg-zinc-800 text-white p-2 h-[65px] w-[65px]"
              onClick={() => setIsInfoDialogOpen(true)}
            >
              <IconWrapper><SvgIcon name="info" /></IconWrapper>
            </Button>
            <Button 
              variant="secondary" 
              className="bg-zinc-800 text-white p-2 h-[65px] w-[65px]" 
              onClick={handleReset}
            >
              <IconWrapper><SvgIcon name="reset" /></IconWrapper>
            </Button>
            <Button 
              variant="secondary" 
              className="bg-zinc-800 text-white p-2 h-[65px] w-[65px]" 
              onClick={handleZoomIn}
            >
              <IconWrapper><SvgIcon name="zoomin" /></IconWrapper>
            </Button>
            <Button 
              variant="secondary" 
              className="bg-zinc-800 text-white p-2 h-[65px] w-[65px]" 
              onClick={handleZoomOut}
            >
              <IconWrapper><SvgIcon name="zoomout" /></IconWrapper>
            </Button>
            <Button 
              onClick={handleMicClick} 
              disabled={isListening}
              className="bg-zinc-800 text-white p-2 h-[65px] w-[65px]"
            >
              <IconWrapper>
                <SvgIcon name={isListening ? "mic" : "mic"} />
              </IconWrapper>
            </Button>
            <Button
              variant="secondary" 
              className="bg-zinc-800 text-white p-2 h-[65px] w-[65px]"
              onClick={handleVoiceGuidance}
              disabled={path.length === 0}
            >
              <IconWrapper>
                <SvgIcon name="voice_guide" />
              </IconWrapper>
            </Button>
            <Button 
              variant="secondary" 
              className="bg-zinc-800 text-white p-2 h-[65px] w-[65px]"
              onClick={() => setIsAdminDialogOpen(true)}
            >
              <IconWrapper><SvgIcon name="station_master" /></IconWrapper>
            </Button>
          </div>
        </div>
      </div>

      {/* Announcement Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle><Translate>{translations[language].announcement}</Translate></DialogTitle>
            <DialogDescription><Translate>{announcement}</Translate></DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle><Translate>{translations[language].qrCodeInfo}</Translate></DialogTitle>
            <DialogDescription>
              <Translate>{getRouteInfo()}</Translate>
              <p>{getRouteDirections(path)}</p> {/* Show directions */}
            </DialogDescription>
          </DialogHeader>
          <Button 
            variant="primary" 
            onClick={handleVoiceGuidance} // Trigger voice guidance
          >
            Play Directions
          </Button>
        </DialogContent>
      </Dialog>

      {/* Station Information Dialog */}
      <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{stationInfo.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-orange-500 mb-2">Railway Lines</h3>
              {stationInfo.railwayLines.map((line, index) => (
                <div key={index} className="bg-orange-50 p-4 rounded-lg">
                  <p className="font-medium text-lg">{line.name}</p>
                  <p className="text-gray-600">{line.route}</p>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-500 mb-2">Platform Information</h3>
              <div className="space-y-2">
                {stationInfo.platforms.map((platform) => (
                  <div key={platform.number} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: platform.color }}
                    >
                      {platform.number}
                    </div>
                    <p className="font-medium">Platform {platform.number}: {platform.direction}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add the dialogs */}
      <AdminLoginDialog
        isOpen={isAdminDialogOpen}
        onClose={() => setIsAdminDialogOpen(false)}
        onLogin={handleAdminLogin}
      />

      <NodeManagementDialog
        isOpen={isNodeManagementOpen}
        onClose={() => setIsNodeManagementOpen(false)}
        nodes={activeNodesState}
        onSaveChanges={handleSaveNodeChanges}
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4B5563;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background-color: transparent;
        }
      `}</style>
    </div>
  )
}

export default StationNavigation;
