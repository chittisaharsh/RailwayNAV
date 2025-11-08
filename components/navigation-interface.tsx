"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import jsQR from "jsqr";

/**
 * ===============================================
 *  Clean, Minimal, Modern UI Revamp
 *  Palette: white • pink • purple • blue
 *  — Soft cards, gradient accents, subtle shadows
 *  — Better spacing + typography
 *  — Floating canvas controls
 *  — Focus-visible rings for a11y
 * ===============================================
 */

/* ---------------- Types & helpers ---------------- */

type Language = "english" | "hindi" | "marathi" | "gujarati";

// minimal translations used by this component
const translations: Record<Language, { selectedDestination: string }> = {
  english: { selectedDestination: "You have selected" },
  hindi: { selectedDestination: "आपने चुना है" },
  marathi: { selectedDestination: "आपण निवडले आहे" },
  gujarati: { selectedDestination: "તમે પસંદ કર્યું છે" },
};

interface StationNavigationProps {
  initialData?: {
    nodes?: Record<string, string>;
    graph?: Record<string, Record<string, number>>;
    coordinates?: Record<string, [number, number]>;
    language?: Language;
  };
}

const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl p-2 h-10 w-10 flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 ring-1 ring-pink-100/60">
    {children}
  </div>
);

const SvgIcon = ({ name, className = "h-6 w-6" }: { name: string; className?: string }) => (
  <img src={`/${name}.svg`} alt={name} className={className} />
);

/* ---------------- Data: nodes/graph/coords/menu ---------------- */

export const nodeFriendlyNames: Record<string, string> = {
  kiosk: "Kiosk",
  up1: " Upper Platform 1",
  up2: " Upper Platform 2",
  up3: " UpperPlatform 3",
  up4: " Upper Platform 4",
  lp1: " Platform 1",
  lp2: " Platform 2",
  lp3: " Platform 3",
  lp4: " Platform 4",
  tc1: "Ticket Counter 1",
  tc2: "Ticket Counter 2",
  wtrm: "Waiting Room",
  wsrm: "Washroom",
  esc1: "Escalator 1",
  esc2: "Escalator 2",
  esc3: "Escalator 3",
  esc4: "Escalator 4",
  esc5: "Escalator 5",
  elv: "Elevator",
  stm: "Station Mart",
  bus_st: "Bus Station",
  pkng: "Parking",
  enex_e1: "East Exit 1",
  enex_e2: "East Exit 2",
  enex_w: "West Exit",
  e11: "Edge",
  e12: "Edge",
  e2: "Middle bridge",
  e3: "Middle Bridge 1",
  e51: "stairs",
  e52: "stairs",
  e41: "Edge",
  e42: "Edge",
  e61: "Edge",
  e62: "Edge",
  ub0: "Upper Bridge 0",
  ub1: "Upper Bridge 1",
  ub2: "Upper Bridge 2",
  ub4: "Upper Bridge 4",
  lb1: "Lower Bridge 1",
  lb2: "Lower Bridge 2",
  lb4: "Lower Bridge 4",
  mb2: "Middle Bridge 2",
  mb4: "Middle Bridge 4",
  fd_ct: "Food Court",
  ep: " Parking elevator ",
  mdrm: "Medical Room",
  autost: "Auto Stand",
};

const stationGraph: Record<string, Record<string, number>> = {
  kiosk: { tc1: 1, esc3: 1 },
  autost: { enex_e1: 1 },
  enex_e1: { e12: 1, autost: 1 },
  wsrm: { e11: 1 },
  e11: { wsrm: 1, esc1: 1, e12: 3 },
  e12: { e11: 3, mdrm: 1, enex_e1: 1 },
  mdrm: { e12: 1, wtrm: 1 },
  wtrm: { mdrm: 1, tc1: 1 },
  tc1: { wtrm: 1, kiosk: 1 },
  enex_e2: { ub0: 1 },
  esc1: { e11: 1, ub0: 1 },
  ub0: { esc1: 1, e2: 2, enex_e2: 1, ub1: 1 },
  e2: { e3: 1, ub0: 2 },
  ub1: { esc2: 1, ub0: 1, ub2: 2 },
  esc2: { ub1: 1, up1: 1 },
  up1: { esc2: 1, e3: 1 },
  e3: { up1: 1, lp1: 1, e2: 1, mb2: 2 },
  lp1: { e3: 1, esc3: 1 },
  esc3: { lp1: 1, lb1: 1 },
  lb1: { esc3: 1, lb2: 2 },
  ub2: { ub1: 2, e41: 1, ub4: 2 },
  e41: { ub2: 1, up2: 1, up3: 1, elv: 1 },
  up2: { e41: 1 },
  up3: { e41: 1 },
  elv: { e41: 1, mb2: 1 },
  mb2: { elv: 1, mb4: 2, e3: 2, e42: 1.5 },
  e42: { mb2: 1.5, lp2: 1, lp3: 1, lb2: 1.5 },
  lp2: { e42: 1 },
  lp3: { e42: 1 },
  lb2: { lb1: 2, e42: 1.5, lb4: 2 },
  ub4: { ub2: 2, esc4: 1, e61: 2 },
  esc4: { ub4: 1, up4: 1, stm: 1 },
  up4: { esc4: 1, e51: 0.5 },
  e51: { up4: 0.5, mb4: 1, enex_w: 1 },
  mb4: { e51: 0.2, e52: 1, mb2: 2 },
  e52: { mb4: 0.2, tc2: 1, lp4: 0.8 },
  lp4: { e52: 0.8, esc5: 1 },
  esc5: { lp4: 0.5, lb4: 1 },
  lb4: { esc5: 0.5, lb2: 2, ep: 1 },
  stm: { esc4: 1, tc2: 4, fd_ct: 1 },
  enex_w: { e51: 1 },
  tc2: { e52: 1, stm: 4 },
  ep: { lb4: 1, pkng: 1, e62: 1 },
  e61: { ub4: 2, bus_st: 3 },
  bus_st: { e61: 3, e62: 3 },
  e62: { bus_st: 3, ep: 1 },
  pkng: { ep: 1 },
  fd_ct: { stm: 1 },
};

export const coordinates: Record<string, [number, number]> = {
  kiosk: [198, 321],
  autost: [43, 186.5],
  enex_e1: [84, 186.5],
  wsrm: [137, 19],
  e11: [137, 76],
  e12: [137, 186.5],
  mdrm: [137, 230.5],
  wtrm: [137, 271],
  tc1: [137, 321],
  enex_e2: [204, 19],
  esc1: [176.8, 76],
  ub0: [204, 76],
  e2: [204, 208],
  ub1: [269.5, 76],
  esc2: [269.5, 100],
  up1: [269.5, 133.8],
  e3: [269.5, 208],
  lp1: [269.5, 271],
  esc3: [269.5, 321],
  lb1: [269, 341],
  up2: [400.3, 133.8],
  lp2: [400.3, 271],
  ub2: [429.4, 76],
  e41: [429.4, 133.8],
  elv: [429.4, 186.5],
  mb2: [429.4, 208],
  e42: [429.4, 271],
  lb2: [429.4, 341],
  up3: [459, 133.8],
  lp3: [459, 271],
  ub4: [585, 76],
  esc4: [585, 100],
  up4: [585, 133.8],
  e51: [585, 186.5],
  mb4: [585, 208],
  e52: [585, 230.5],
  lp4: [585, 271],
  esc5: [585, 321],
  lb4: [585, 341],
  stm: [680.3, 100],
  tc2: [680.3, 230.5],
  pkng: [704.5, 271],
  ep: [704.5, 341],
  enex_w: [729, 186.5],
  e61: [820, 76],
  bus_st: [820, 186.5],
  e62: [820, 341],
  fd_ct: [729, 100],
};

const menuItems = [
  { icon: "platform1", label: { english: "Platform 1", hindi: "प्लेटफ़ॉर्म 1", marathi: "प्लॅटफॉर्म 1", gujarati: "પ્લેટફોર્મ 1" }, value: "lp1" },
  { icon: "platform2", label: { english: "Platform 2", hindi: "प्लेटफ़ॉर्म 2", marathi: "प्लॅटफॉर्म 2", gujarati: "પ્લેટફોર્મ 2" }, value: "lp2" },
  { icon: "platform3", label: { english: "Platform 3", hindi: "प्लेटफ़ॉर्म 3", marathi: "प्लॅटफોર્મ 3", gujarati: "પ્લેટફોર્મ 3" }, value: "lp3" },
  { icon: "platform4", label: { english: "Platform 4", hindi: "प्लेटफ़ॉर्म 4", marathi: "प्लॅटफોર્મ 4", gujarati: "પ્લેટફોર્મ 4" }, value: "lp4" },
  { icon: "ticket_counter", label: { english: "Ticket Counter 1", hindi: "टिकट काउंटर 1", marathi: "तिकीट काउंटर 1", gujarati: "ટિકિટ કાઉન્ટર 1" }, value: "tc1" },
  { icon: "ticket_counter", label: { english: "Ticket Counter 2", hindi: "टिकट काउंटर 2", marathi: "तिकीट કાઉન્ટર 2", gujarati: "ટિકિટ કાઉન્ટર 2" }, value: "tc2" },
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
];

/* ---------------- Pathfinding (Dijkstra-lite) ---------------- */

function findShortestPath(start: string, end: string): string[] {
  if (!stationGraph[start] || !stationGraph[end]) return [];

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>(Object.keys(stationGraph));

  Object.keys(stationGraph).forEach((node) => {
    distances[node] = Infinity;
    previous[node] = null;
  });
  distances[start] = 0;

  while (unvisited.size > 0) {
    let current = Array.from(unvisited).reduce((a, b) => (distances[a] < distances[b] ? a : b));
    if (current === end) break;
    unvisited.delete(current);

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

/* ---------------- Component ---------------- */

const StationNavigation: React.FC<StationNavigationProps> = ({ initialData }) => {
  const activeNodes = initialData?.nodes || nodeFriendlyNames;
  const activeCoordinates = initialData?.coordinates || coordinates;

  // // Camera + QR (jsQR only)
  // const [isCameraOpen, setIsCameraOpen] = useState(false);
  // const videoRef = useRef<HTMLVideoElement>(null);
  // const canvasRef = useRef<HTMLCanvasElement>(null);
  // QR Camera states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // always latest state inside animation loop
  const isCameraOpenRef = useRef(false);
  useEffect(() => { isCameraOpenRef.current = isCameraOpen; }, [isCameraOpen]);

  // UI state
  const [, setAnnouncement] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [language, setLanguage] = useState<Language>(initialData?.language || "english");
  const [zoom, setZoom] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedSource, setSelectedSource] = useState("kiosk");

  const [path, setPath] = useState<string[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgSize, setSvgSize] = useState({ width: 1800, height: 800 });
  const containerRef = useRef<HTMLDivElement>(null);

  const [showQuickSearch, setShowQuickSearch] = useState(false);

  // If you need voice later, keep 'any' to avoid TS DOM typings error
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Voice setup (kept minimal)
  useEffect(() => {
    const setVoices = () => {
      if (typeof window !== "undefined") window.speechSynthesis.getVoices();
    };
    setVoices();
    if (typeof window !== "undefined") window.speechSynthesis.onvoiceschanged = setVoices;
  }, []);

  // Resize observer
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setSvgSize({ width, height });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Quick search → speak + navigate
  const handleQuickSearchClick = async (option: {
    english: string;
    hindi: string;
    marathi: string;
    gujarati: string;
  }) => {
    const translatedOption = option[language as keyof typeof option];
    const message = `${translations[language].selectedDestination} "${translatedOption}".`;
    setAnnouncement(message);
    setIsDialogOpen(true);

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message, language }),
      });
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch {
      // ignore TTS errors for now
    }

    const selectedItem = menuItems.find((item) => item.label.english === option.english);
    if (selectedItem) {
      setSelectedDestination(selectedItem.value);
      handleDestinationClick(selectedItem.value);
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      const timer = setTimeout(() => setIsDialogOpen(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isDialogOpen]);

  const handleLanguageChange = (newLang: Language) => setLanguage(newLang);

  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.15, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.15, 1));

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const newX = (e.clientX - dragStart.x) / zoom;
      const newY = (e.clientY - dragStart.y) / zoom;
      setPanPosition({ x: newX, y: newY });
    }
  };
  const handleMouseUp = () => setIsDragging(false);

  const scaleCoordinates = (x: number, y: number, size: { width: number; height: number }) => {
    const scaleX = size.width / 900;
    const scaleY = size.height / 400;
    return [x * scaleX, y * scaleY] as const;
  };

  /* ---------- jsQR scanner (no BarcodeDetector) ---------- */
  const startQRScan = async () => {
    try {
      console.log("Requesting camera…");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // ✅ Wait for metadata so videoWidth & videoHeight are correct
        await new Promise((resolve) => {
          videoRef.current!.addEventListener("loadedmetadata", resolve, { once: true });
        });

        await videoRef.current.play();
        console.log("VIDEO PLAYING ✅");
      }

      setIsCameraOpen(true);

      // ✅ Start scanning AFTER camera is live
      setTimeout(() => scanFrame(), 150);

      const scanFrame = () => {
        if (!videoRef.current || !canvasRef.current || !isCameraOpen) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (!ctx) return requestAnimationFrame(scanFrame);

        // ✅ Exact match to video resolution (important!)
        const w = video.videoWidth;
        const h = video.videoHeight;

        canvas.width = w;
        canvas.height = h;

        // ✅ Draw high-res frame
        ctx.drawImage(video, 0, 0, w, h);

        const imageData = ctx.getImageData(0, 0, w, h);
        const qr = jsQR(imageData.data, w, h, { inversionAttempts: "attemptBoth" });

        if (qr && qr.data) {
          console.log("QR DETECTED ✅", qr.data);

          // ✅ Stop camera
          const media = video.srcObject as MediaStream;
          if (media) media.getTracks().forEach((t) => t.stop());
          setIsCameraOpen(false);

          let nodeId = qr.data.trim();

          // ✅ If QR is a URL, extract ?id=
          try {
            const url = new URL(qr.data);
            nodeId = url.searchParams.get("id") || nodeId;
          } catch { }

          if (coordinates[nodeId]) {
            setSelectedSource(nodeId);
            if (selectedDestination) handleDestinationClick(selectedDestination);
          } else {
            alert("Invalid QR code");
          }

          return;
        }

        // ✅ Continue scanning smoothly
        requestAnimationFrame(scanFrame);
      };

    } catch (err) {
      console.error("Camera error:", err);
      alert("Unable to access camera. Please allow permission.");
    }
  };



  const handleDetectedQR = (raw: string) => {
    try {
      const url = new URL(raw);
      const id = url.searchParams.get("id");
      if (id) {
        setSelectedSource(id);
        if (selectedDestination) handleDestinationClick(selectedDestination);
        return;
      }
    } catch (e) {
      // Not a URL
    }

    // Direct node ID?
    if (coordinates[raw]) {
      setSelectedSource(raw);
      if (selectedDestination) handleDestinationClick(selectedDestination);
      return;
    }

    alert("Invalid QR code");
  };

  const stopCamera = () => {
    const v = videoRef.current;
    if (v?.srcObject) {
      (v.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      v.srcObject = null;
    }
  };



  /* ---------------- SVG drawing ---------------- */

  const updateSvg = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const edgesGroup = svg.getElementById("edges");
    const nodesGroup = svg.getElementById("nodes");
    const pathGroup = svg.getElementById("path");
    if (!edgesGroup || !nodesGroup || !pathGroup) return;

    edgesGroup.innerHTML = "";
    nodesGroup.innerHTML = "";
    pathGroup.innerHTML = "";

    // light network
    Object.entries(stationGraph).forEach(([node, neighbors]) => {
      Object.keys(neighbors).forEach((neighbor) => {
        if (activeCoordinates[node] && activeCoordinates[neighbor]) {
          const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
          const [x1, y1] = scaleCoordinates(activeCoordinates[node][0], activeCoordinates[node][1], svgSize);
          const [x2, y2] = scaleCoordinates(activeCoordinates[neighbor][0], activeCoordinates[neighbor][1], svgSize);
          line.setAttribute("x1", String(x1));
          line.setAttribute("y1", String(y1));
          line.setAttribute("x2", String(x2));
          line.setAttribute("y2", String(y2));
          line.setAttribute("stroke", "rgba(120, 120, 150, 0.12)");
          line.setAttribute("stroke-width", "2");
          edgesGroup.appendChild(line);
        }
      });
    });

    // nodes (hidden unless on path)
    Object.entries(activeCoordinates).forEach(([node, [x, y]]) => {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      const [sx, sy] = scaleCoordinates(x, y, svgSize);
      rect.setAttribute("x", String(sx - 10));
      rect.setAttribute("y", String(sy - 10));
      rect.setAttribute("width", "20");
      rect.setAttribute("height", "20");
      rect.setAttribute("rx", "6");
      rect.setAttribute("fill", "transparent");
      rect.setAttribute("stroke", "transparent");
      rect.setAttribute("stroke-width", "0");
      nodesGroup.appendChild(rect);
    });

    // path highlight
    if (path.length > 1) {
      for (let i = 0; i < path.length - 1; i++) {
        const current = path[i];
        const next = path[i + 1];
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        const [x1, y1] = scaleCoordinates(activeCoordinates[current][0], activeCoordinates[current][1], svgSize);
        const [x2, y2] = scaleCoordinates(activeCoordinates[next][0], activeCoordinates[next][1], svgSize);
        line.setAttribute("x1", String(x1));
        line.setAttribute("y1", String(y1));
        line.setAttribute("x2", String(x2));
        line.setAttribute("y2", String(y2));
        line.setAttribute("stroke", "#8b5cf6");
        line.setAttribute("stroke-width", "6");
        line.setAttribute("stroke-linecap", "round");
        pathGroup.appendChild(line);
      }

      // mark nodes on the path
      path.forEach((node) => {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        const [sx, sy] = scaleCoordinates(activeCoordinates[node][0], activeCoordinates[node][1], svgSize);
        rect.setAttribute("x", String(sx - 11));
        rect.setAttribute("y", String(sy - 11));
        rect.setAttribute("width", "22");
        rect.setAttribute("height", "22");
        rect.setAttribute("rx", "7");
        rect.setAttribute("fill", "#ffffff");
        rect.setAttribute("stroke", node === "kiosk" ? "#ec4899" : "#3b82f6");
        rect.setAttribute("stroke-width", node === "kiosk" ? "2.5" : "2");
        rect.setAttribute("filter", node === "kiosk" ? "url(#glow)" : "");
        pathGroup.appendChild(rect);
      });
    }
  };

  useEffect(() => {
    updateSvg();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, svgSize, zoom, panPosition]);

  /* ---------------- Events ---------------- */

  const handleDestinationClick = (value: string) => {
    setSelectedDestination(value);
    const calculatedPath = findShortestPath(selectedSource, value);
    if (calculatedPath.length > 0) {
      setPath(calculatedPath);
    } else {
      console.error(`Unable to find path from ${selectedSource} to ${value}`);
      setPath([]);
    }
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;

    const x = ((e.clientX - rect.left) / rect.width) * viewBox.width - panPosition.x / zoom;
    const y = ((e.clientY - rect.top) / rect.height) * viewBox.height - panPosition.y / zoom;

    let closestNode = "";
    let minDistance = Infinity;

    Object.entries(activeCoordinates).forEach(([node, [nx, ny]]) => {
      const [sx, sy] = scaleCoordinates(nx, ny, svgSize);
      const d = Math.hypot(x - sx, y - sy);
      const threshold = 30 / zoom;
      if (d < minDistance && d < threshold) {
        minDistance = d;
        closestNode = node;
      }
    });

    if (closestNode) handleDestinationClick(closestNode);
  };

  const handleReset = () => {
    setZoom(1);
    setPanPosition({ x: 0, y: 0 });
    setSelectedDestination("");
    setPath([]);
    if (typeof window !== "undefined") window.speechSynthesis.cancel();

    if (recognitionRef.current) {
      recognitionRef.current.stop?.();
      setIsListening(false);
      recognitionRef.current = null;
    }

    setAnnouncement("");
  };

  /* ---------------- Render ---------------- */

  return (
    <div className="min-h-screen w-full bg-white text-slate-700">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 shadow-sm" />
            <div className="font-semibold">RailwayNav</div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-200/60 bg-pink-50/40 px-3 py-1 text-sm">
              <span className="h-2 w-2 rounded-full bg-pink-500" />
              Capstone Project
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 py-6">
        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Brand card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <img src="/railwaynav_logo.svg" alt="RailwayNav" className="h-7" />
              <span className="text-sm text-slate-500">Wayfinding kiosk</span>
            </div>
          </div>

          {/* From / To */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
              >
                {menuItems.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label[language as keyof typeof item.label]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
              <select
                value={selectedDestination}
                onChange={(e) => handleDestinationClick(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                {menuItems.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label[language as keyof typeof item.label]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
              >
                <option value="english">English</option>
                <option value="hindi">हिन्दी</option>
                <option value="marathi">मराठी</option>
                <option value="gujarati">ગુજરાતી</option>
              </select>
            </div>
          </div>

          {/* Quick Search */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm relative quick-search-container">
            <button
              onClick={() => setShowQuickSearch((prev) => !prev)}
              className="w-full bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 text-white rounded-xl py-3 text-lg font-semibold shadow-sm hover:opacity-95 transition"
            >
              Quick Search
            </button>

            {showQuickSearch && (
              <div className="absolute left-0 right-0 mt-3 bg-white shadow-xl rounded-xl p-3 z-50 border border-purple-200 animate-fadeIn max-h-[300px] overflow-y-auto">
                {/* QR Scan Button */}
                <button
                  onClick={() => {
                    // startQRScan();
                    // setShowQuickSearch(false);
                    // setTimeout(() => startQRScan(), 50);
                    setIsCameraOpen(true);

                    // 2. Wait a moment so <video> actually mounts
                    setTimeout(() => startQRScan(), 80);

                    setShowQuickSearch(false);
                  }}
                  className="flex items-center w-full mb-3 text-left bg-blue-50 hover:bg-blue-100 transition rounded-xl px-3 py-2 shadow-sm border border-blue-200"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 text-white font-bold">
                    QR
                  </div>
                  <span className="ml-3 text-slate-700 text-lg">Scan QR Entry</span>
                </button>

                <div className="space-y-2">
                  {menuItems.map(({ label, value }, index) => (
                    <button
                      key={value}
                      onClick={() => {
                        handleQuickSearchClick(label);
                        setShowQuickSearch(false);
                      }}
                      className="flex items-center w-full text-left bg-purple-50 hover:bg-purple-100 transition rounded-xl px-3 py-2 shadow-sm border border-purple-200"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300">
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                      <span className="ml-3 text-slate-700 text-lg">{label[language as keyof typeof label]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Canvas + Controls */}
        <section className="relative rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" />

          <div className="p-3" ref={containerRef}>
            <div
              className="relative h-[70vh] min-h-[520px] w-full overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-br from-white to-slate-50"
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
                  transformOrigin: "0 0",
                }}
                onClick={handleSvgClick}
              >
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <image href="/map.svg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
                <g id="edges"></g>
                <g id="nodes"></g>
                <g id="path"></g>
              </svg>

              {/* Floating controls */}
              <div className="pointer-events-auto absolute bottom-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  className="h-10 w-10 rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-pink-50"
                  onClick={handleReset}
                >
                  <IconWrapper>
                    <SvgIcon name="reset" />
                  </IconWrapper>
                </Button>
                <Button
                  variant="secondary"
                  className="h-10 w-10 rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-purple-50"
                  onClick={handleZoomIn}
                >
                  <IconWrapper>
                    <SvgIcon name="zoomin" />
                  </IconWrapper>
                </Button>
                <Button
                  variant="secondary"
                  className="h-10 w-10 rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-blue-50"
                  onClick={handleZoomOut}
                >
                  <IconWrapper>
                    <SvgIcon name="zoomout" />
                  </IconWrapper>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Camera Overlay */}
        {isCameraOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999]">
            <div className="bg-white p-4 rounded-2xl shadow-xl">

              <video
                // ref={videoRef}
                // autoPlay
                // playsInline
                // muted
                // className="w-[320px] h-[320px] rounded-xl object-cover bg-gray-900"
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-[320px] h-[320px] rounded-xl object-cover bg-gray-900"
              />

              <canvas ref={canvasRef} className="hidden" />

              <button
                onClick={() => {
                  stopCamera();
                  setIsCameraOpen(false);
                  isCameraOpenRef.current = false;
                }}
                className="mt-3 w-full py-2 rounded-xl bg-red-500 text-white font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </main>

      <style jsx global>{`
        /* minimal scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgb(203 213 225); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-track { background-color: transparent; }
      `}</style>
    </div>
  );
};

export default StationNavigation;
