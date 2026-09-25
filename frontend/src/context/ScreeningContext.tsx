import React, {
  createContext, useContext, useState,
  useEffect, useCallback, ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'activeScreeningData';

// ─── Full data shape ──────────────────────────────────────────────────────────
export interface ScreeningData {
  // Client demographics
  clientName:    string;
  clientPhone:   string;
  clientAge:     number;
  clientGender:  string;       // ← was missing; used by ScreeningComplete + VisionScreen5
  clientVillage: string;
  district:      string;
  county:        string;
  subCounty:     string;
  parish:        string;

  // VHT Workflow – Preparation & Greetings
  equipmentChecked:      boolean;
  consentObtained:       boolean;
  educationProvided:     boolean;
  screeningAreaPrepared: boolean;
  testsExplainedToClient:boolean;

  // VHT Workflow – Key Questions (Step 4)
  hasEyeConcerns:               boolean;
  followsMovement:              boolean | undefined;
  hasSevereEyePain:             boolean;
  hasSuddenVisionLoss:          boolean;
  hasDiabetesHypertension:      boolean;
  familyHistoryBlindness:       boolean;
  referralReasonsFromQuestions: string[];

  // Torch test (Step 4 / VisionScreen4)
  torchTestPassed:       boolean;
  torchTestAbnormalSigns:string;

  // Distance vision (VisionScreen5)
  distanceVisionLeft:   string;
  distanceVisionRight:  string;
  distanceVisionBoth:   string;
  distanceVisionResult: string;   // 'passed' | 'failed'

  // Near vision (VisionScreen6)
  nearVisionResult:  string;
  pinholeTestLeft:   string;
  pinholeTestRight:  string;

  // Reading glasses (VHTReadingGlassesScreen / ReadingGlassesSelection)
  glassesDispensed:          boolean;
  glassesPower:              string;
  glassesFrameType:          string;   // ← was missing; used by ScreeningComplete
  selectedGlassesPower:      string;
  selectedFrameType:         string;
  glassesEducationProvided:  boolean;

  // Results / referral
  needsGlasses:        boolean;
  needsReferral:       boolean;
  referralReason:      string;
  referralFacility:    string;
  referralUrgency:     string;
  referralStep:        string;
  recommendedProductId:string;
  recommendedPower:    string;
  notes:               string;
  screeningId:         string;
}

// ─── Context type ─────────────────────────────────────────────────────────────
interface ScreeningContextType {
  screeningData:      Partial<ScreeningData>;
  updateScreeningData:(data: Partial<ScreeningData>) => void;
  resetScreeningData: () => void;
  /** Manually flush current state to AsyncStorage (call before navigating away) */
  persistNow:         () => Promise<void>;
}

const ScreeningContext = createContext<ScreeningContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const ScreeningProvider = ({ children }: { children: ReactNode }) => {
  const [screeningData, setScreeningData] = useState<Partial<ScreeningData>>({});

  // Rehydrate from AsyncStorage on mount (handles Back-nav data retention)
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (raw) {
          try { setScreeningData(JSON.parse(raw)); } catch (_) {}
        }
      })
      .catch(() => {});
  }, []);

  const updateScreeningData = useCallback((data: Partial<ScreeningData>) => {
    setScreeningData(prev => {
      const next = { ...prev, ...data };
      // Fire-and-forget persist on every update
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const resetScreeningData = useCallback(() => {
    setScreeningData({});
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const persistNow = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(screeningData));
    } catch (_) {}
  }, [screeningData]);

  return (
    <ScreeningContext.Provider value={{
      screeningData,
      updateScreeningData,
      resetScreeningData,
      persistNow,
    }}>
      {children}
    </ScreeningContext.Provider>
  );
};

export const useScreening = () => {
  const context = useContext(ScreeningContext);
  if (!context) {
    throw new Error('useScreening must be used within ScreeningProvider');
  }
  return context;
};
