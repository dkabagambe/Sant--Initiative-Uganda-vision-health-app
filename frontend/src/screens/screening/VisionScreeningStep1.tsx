import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getDistrictNames, getCountiesForDistrict, getSubCountiesForCounty, getParishesForSubCounty } from "../../data/ugandaLocations";

const { width } = Dimensions.get("window");

type RootStackParamList = {
  VisionScreeningStep1: undefined;
  VisionScreeningStep2: undefined;
  VisionScreeningStep3: undefined;
  VisionScreeningStep4: undefined;
  VisionScreeningStep5: undefined;
  ClientRegistration: undefined;
  CHWDashboard: undefined;
  MainTabs: undefined;
};

type ScreeningScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "VisionScreeningStep1"
>;

interface DropdownProps {
  label: string;
  value: string;
  placeholder: string;
  options: Array<{ label: string; value: string }>;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

const Dropdown = ({
  label,
  value,
  placeholder,
  options,
  onSelect,
  disabled = false,
}: DropdownProps) => {
  const [showModal, setShowModal] = useState(false);

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setShowModal(false);
  };

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdownButton, disabled && styles.dropdownDisabled]}
        onPress={() => !disabled && setShowModal(true)}
        disabled={disabled}
      >
        <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#6B7280" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.modalOption}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text style={styles.modalOptionText}>{option.label}</Text>
                  {value === option.value && (
                    <Ionicons name="checkmark" size={20} color="#1E40AF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

interface QuestionProps {
  number: number;
  text: string;
  value: boolean | null;
  onAnswer: (answer: boolean) => void;
  infoText?: string;
}

const QuestionItem = ({
  number,
  text,
  value,
  onAnswer,
  infoText,
}: QuestionProps) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <View style={styles.questionContainer}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionNumber}>{number}</Text>
        <Text style={styles.questionText}>{text}</Text>
        {infoText && (
          <TouchableOpacity
            onPress={() => setShowInfo(!showInfo)}
            style={styles.infoButton}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        )}
      </View>

      {showInfo && infoText && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>{infoText}</Text>
        </View>
      )}

      <View style={styles.answerButtons}>
        <TouchableOpacity
          style={[
            styles.answerButton,
            value === true && styles.answerButtonSelected,
          ]}
          onPress={() => onAnswer(true)}
        >
          <Text
            style={[
              styles.answerButtonText,
              value === true && styles.answerButtonTextSelected,
            ]}
          >
            Yes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.answerButton,
            value === false && styles.answerButtonSelected,
          ]}
          onPress={() => onAnswer(false)}
        >
          <Text
            style={[
              styles.answerButtonText,
              value === false && styles.answerButtonTextSelected,
            ]}
          >
            No
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface BloodPressureReadingProps {
  readingNumber: number;
  systolic: string;
  diastolic: string;
  onSystolicChange: (text: string) => void;
  onDiastolicChange: (text: string) => void;
}

const BloodPressureReading = ({
  readingNumber,
  systolic,
  diastolic,
  onSystolicChange,
  onDiastolicChange,
}: BloodPressureReadingProps) => {
  return (
    <View style={styles.bpReadingContainer}>
      <Text style={styles.bpReadingTitle}>
        Reading {readingNumber} (wait 1-2 minutes between readings)
      </Text>
      <View style={styles.bpInputRow}>
        <View style={styles.bpInputContainer}>
          <Text style={styles.bpInputLabel}>Systolic</Text>
          <TextInput
            style={styles.bpInput}
            placeholder="Systolic"
            value={systolic}
            onChangeText={onSystolicChange}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <Text style={styles.bpSlash}>/</Text>
        <View style={styles.bpInputContainer}>
          <Text style={styles.bpInputLabel}>Diastolic</Text>
          <TextInput
            style={styles.bpInput}
            placeholder="Diastolic"
            value={diastolic}
            onChangeText={onDiastolicChange}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>
    </View>
  );
};

interface PowerOptionProps {
  value: string;
  selected: boolean;
  onSelect: () => void;
}

const PowerOption = ({ value, selected, onSelect }: PowerOptionProps) => {
  return (
    <TouchableOpacity
      style={[styles.powerOption, selected && styles.powerOptionSelected]}
      onPress={onSelect}
    >
      <Text
        style={[
          styles.powerOptionText,
          selected && styles.powerOptionTextSelected,
        ]}
      >
        {value}
      </Text>
    </TouchableOpacity>
  );
};

export default function VisionScreeningFlow() {
  const navigation = useNavigation<ScreeningScreenNavigationProp>();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Client Information
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [county, setCounty] = useState("");
  const [subCounty, setSubCounty] = useState("");
  const [parish, setParish] = useState("");
  const [village, setVillage] = useState("");

  // Step 2: Pre-Screening Questions
  const [questions, setQuestions] = useState(Array(10).fill(null));

  // Step 3: Vision Screening
  const [smallestLine, setSmallestLine] = useState("");
  const [notes, setNotes] = useState("");

  // Step 4: NCD Risk Screening
  const [bpReadings, setBpReadings] = useState([
    { systolic: "", diastolic: "" },
    { systolic: "", diastolic: "" },
    { systolic: "", diastolic: "" },
  ]);
  const [bloodSugar, setBloodSugar] = useState("");
  const [riskFactors, setRiskFactors] = useState({
    diabetes: false,
    hypertension: false,
    eyePain: false,
    visionLoss: false,
  });

  // Step 5: Recommended Reading Glasses
  const [selectedPower, setSelectedPower] = useState("");
  const [needsReferral, setNeedsReferral] = useState(false);

  // Client Registration
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedVSLA, setSelectedVSLA] = useState("");
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState("0700123456");

  const districts = useMemo(() => 
    getDistrictNames().map((d) => ({ label: d, value: d })),
    []
  );

  const counties = useMemo(() => 
    district ? getCountiesForDistrict(district).map((c) => ({ label: c, value: c })) : [],
    [district]
  );

  const subCounties = useMemo(() => 
    county ? getSubCountiesForCounty(county).map((sc) => ({ label: sc, value: sc })) : [],
    [county]
  );

  const parishes = useMemo(() => 
    subCounty ? getParishesForSubCounty(subCounty).map((p) => ({ label: p, value: p })) : [],
    [subCounty]
  );

  const villages: { label: string; value: string }[] = [];

  const powerOptions = [
    "+1.00D",
    "+1.50D",
    "+2.00D",
    "+2.50D",
    "+3.00D",
    "+3.50D",
  ];

  const vslaGroups = [
    { label: "Bombo Women's VSLA", value: "bombo_women" },
    { label: "Wobulenzi Farmers Group", value: "wobulenzi_farmers" },
    { label: "Luweero Youth Group", value: "luweero_youth" },
  ];

  const preScreeningQuestions = [
    "Do you have difficulty seeing things far away (like people or signs across the road) or close up (like reading, sewing, or using your phone)?",
    "Has your vision become blurry or cloudy gradually over time, like looking through fog or frosted glass?",
    "Do you see halos or rainbows around lights, especially at night?",
    "Do your eyes feel painful, red, itchy, watery, or like there's sand/grit in them?",
    "Is there any discharge (pus or sticky fluid) from your eyes, or do your eyes stick together in the morning?",
    "Do you have pain in or around the eye(s), headache, or feel like your eye is under pressure?",
    "Have you noticed any white/grey spot in the black part (pupil) of your eye, or does your eye look cloudy/whitish?",
    "Do your eyes feel dry, burning, or irritated often, especially in windy/dusty conditions?",
    "Have your eyelashes turned inward and rub against your eye, causing irritation or redness?",
    "Do you have any swelling, lump, or growth on your eyelid or eyeball, or does your eye look swollen/red?",
  ];

  const questionInfoTexts = [
    "Screens for refractive errors like myopia, hyperopia, or presbyopia",
    "Screens for cataracts or other conditions causing gradual vision clouding",
    "Screens for glaucoma or corneal edema",
    "Screens for conjunctivitis, allergies, or dry eye syndrome",
    "Screens for bacterial or viral conjunctivitis",
    "Screens for glaucoma, migraine, or eye strain",
    "Screens for cataracts, corneal scars, or retinoblastoma",
    "Screens for dry eye syndrome or environmental irritation",
    "Screens for trichiasis (ingrown eyelashes), common in trachoma",
    "Screens for styes, chalazia, tumors, or orbital cellulitis",
  ];

  const handleAnswerQuestion = (index: number, answer: boolean) => {
    const newQuestions = [...questions];
    newQuestions[index] = answer;
    setQuestions(newQuestions);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!fullName.trim() || !age.trim() || !phoneNumber.trim()) {
        Alert.alert("Required Fields", "Please fill in all required fields");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const answeredCount = questions.filter((q) => q !== null).length;
      if (answeredCount < 10) {
        Alert.alert(
          "Incomplete Questions",
          `Please answer all questions (${answeredCount}/10 answered)`,
        );
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!smallestLine) {
        Alert.alert(
          "Required Field",
          "Please select the smallest line read clearly",
        );
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(5);
    } else if (currentStep === 5) {
      if (!selectedPower) {
        Alert.alert("Required Field", "Please select recommended power");
        return;
      }
      setCurrentStep(6); // Client Registration
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.navigate("CHWDashboard");
    }
  };

  const handleUpdateBpReading = (
    index: number,
    field: "systolic" | "diastolic",
    value: string,
  ) => {
    const newReadings = [...bpReadings];
    newReadings[index][field] = value;
    setBpReadings(newReadings);
  };

  const handleToggleRiskFactor = (factor: keyof typeof riskFactors) => {
    setRiskFactors((prev) => ({
      ...prev,
      [factor]: !prev[factor],
    }));
  };

  const handleCompleteScreening = () => {
    Alert.alert(
      "Screening Complete",
      "Client screening has been completed and saved successfully.",
      [
        {
          text: "OK",
          onPress: () => navigation.navigate("MainTabs"),
        },
      ],
    );
  };

  const handleConfirmSale = () => {
    Alert.alert(
      "Sale Confirmed",
      `Glasses sale to ${fullName} has been confirmed.\n\nPayment: ${paymentMethod}\nAmount: UGX 30,000`,
      [
        {
          text: "OK",
          onPress: () => navigation.navigate("CHWDashboard"),
        },
      ],
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <Text style={styles.formTitle}>Client Information</Text>
            <Text style={styles.formSubtitle}>
              Enter basic details to start screening
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter client name"
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter age"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 0700123456"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <Dropdown
              label="District"
              value={district}
              placeholder="Select district"
              options={districts}
              onSelect={(val) => { setDistrict(val); setCounty(""); setSubCounty(""); setParish(""); }}
            />

            <Dropdown
              label="County/Sub-County"
              value={county}
              placeholder="Select county/sub-county"
              options={counties}
              onSelect={(val) => { setCounty(val); setSubCounty(""); setParish(""); }}
              disabled={!district}
            />

            <Dropdown
              label="Sub-County/Parish"
              value={subCounty}
              placeholder="Select sub-county/parish"
              options={subCounties}
              onSelect={(val) => { setSubCounty(val); setParish(""); }}
              disabled={!county}
            />

            {subCounty && parishes.length === 0 ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Parish/Ward</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Type parish name"
                  value={parish}
                  onChangeText={setParish}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            ) : (
              <Dropdown
                label="Parish/Ward"
                value={parish}
                placeholder="Select parish/ward"
                options={parishes}
                onSelect={setParish}
                disabled={!subCounty}
              />
            )}

            <Dropdown
              label="Village"
              value={village}
              placeholder="Select village"
              options={villages}
              onSelect={setVillage}
              disabled={!parish}
            />
          </>
        );

      case 2:
        return (
          <>
            <Text style={styles.formTitle}>Pre-Screening Questions</Text>
            <Text style={styles.formSubtitle}>
              Ask the client these questions before vision testing. Tap the info
              icon to see what each question screens for.
            </Text>

            <View style={styles.questionsProgress}>
              <Text style={styles.questionsProgressText}>
                Answer All Questions (
                {questions.filter((q) => q !== null).length}/10)
              </Text>
            </View>

            {preScreeningQuestions.map((question, index) => (
              <QuestionItem
                key={index}
                number={index + 1}
                text={question}
                value={questions[index]}
                onAnswer={(answer) => handleAnswerQuestion(index, answer)}
                infoText={questionInfoTexts[index]}
              />
            ))}
          </>
        );

      case 3:
        return (
          <>
            <Text style={styles.formTitle}>Vision Screening</Text>

            <View style={styles.instructionBox}>
              <Ionicons
                name="phone-portrait-outline"
                size={24}
                color="#1E40AF"
                style={styles.instructionIcon}
              />
              <Text style={styles.instructionTitle}>
                Hold phone ~40cm from eyes
              </Text>
              <Text style={styles.instructionBullet}>
                • Cover one eye if needed
              </Text>
              <Text style={styles.instructionBullet}>
                • Ask client to read smallest line they can see clearly
              </Text>
            </View>

            <View style={styles.eyeChartContainer}>
              <View style={styles.eyeChartRow}>
                <Text style={styles.eyeChartLetter}>E</Text>
              </View>
              <View style={styles.eyeChartRow}>
                <Text style={styles.eyeChartLetter}>F</Text>
                <Text style={styles.eyeChartLetter}>P</Text>
                <Text style={styles.eyeChartLetter}>T</Text>
              </View>
              <View style={styles.eyeChartRow}>
                <Text style={styles.eyeChartLetter}>T</Text>
                <Text style={styles.eyeChartLetter}>O</Text>
                <Text style={styles.eyeChartLetter}>Z</Text>
                <Text style={styles.eyeChartLetter}>L</Text>
              </View>
              <View style={styles.eyeChartRow}>
                <Text style={styles.eyeChartLetter}>L</Text>
                <Text style={styles.eyeChartLetter}>P</Text>
                <Text style={styles.eyeChartLetter}>E</Text>
                <Text style={styles.eyeChartLetter}>D</Text>
                <Text style={styles.eyeChartLetter}>F</Text>
              </View>
              <View style={styles.eyeChartRow}>
                <Text style={styles.eyeChartLetter}>P</Text>
                <Text style={styles.eyeChartLetter}>E</Text>
                <Text style={styles.eyeChartLetter}>C</Text>
                <Text style={styles.eyeChartLetter}>F</Text>
                <Text style={styles.eyeChartLetter}>D</Text>
                <Text style={styles.eyeChartLetter}>Z</Text>
              </View>
              <View style={styles.eyeChartRow}>
                <Text style={styles.eyeChartLetter}>E</Text>
                <Text style={styles.eyeChartLetter}>D</Text>
                <Text style={styles.eyeChartLetter}>F</Text>
                <Text style={styles.eyeChartLetter}>C</Text>
                <Text style={styles.eyeChartLetter}>Z</Text>
                <Text style={styles.eyeChartLetter}>P</Text>
                <Text style={styles.eyeChartLetter}>O</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Smallest line read clearly:</Text>
              <View style={styles.lineOptions}>
                {["N48", "N36", "N24", "N18", "N12", "N8"].map((line) => (
                  <TouchableOpacity
                    key={line}
                    style={[
                      styles.lineOption,
                      smallestLine === line && styles.lineOptionSelected,
                    ]}
                    onPress={() => setSmallestLine(line)}
                  >
                    <Text
                      style={[
                        styles.lineOptionText,
                        smallestLine === line && styles.lineOptionTextSelected,
                      ]}
                    >
                      {line}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Add Notes (e.g., headaches, eye strain)
              </Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                placeholder="Enter any additional notes..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </>
        );

      case 4:
        return (
          <>
            <Text style={styles.formTitle}>NCD Risk Screening</Text>
            <Text style={styles.formSubtitle}>
              Take 3 blood pressure readings (if equipment available) and check
              blood sugar
            </Text>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                Blood Pressure Measurements
              </Text>

              {bpReadings.map((reading, index) => (
                <BloodPressureReading
                  key={index}
                  readingNumber={index + 1}
                  systolic={reading.systolic}
                  diastolic={reading.diastolic}
                  onSystolicChange={(text) =>
                    handleUpdateBpReading(index, "systolic", text)
                  }
                  onDiastolicChange={(text) =>
                    handleUpdateBpReading(index, "diastolic", text)
                  }
                />
              ))}

              <View style={styles.infoBox}>
                <Text style={styles.infoBoxTitle}>
                  American Heart Association Blood Pressure Categories
                </Text>
                <Text style={styles.infoBoxText}>
                  Normal: ≤120/80 mmHg{"\n"}
                  Elevated: 120-129/80 mmHg{"\n"}
                  Hypertension Stage 1: 130-139/80-89 mmHg{"\n"}
                  Hypertension Stage 2: ≥140/90 mmHg
                </Text>
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Random Blood Sugar</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Blood Sugar Reading (mmol/L)
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., 6.5"
                  value={bloodSugar}
                  onChangeText={setBloodSugar}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <Text style={styles.inputHelper}>
                Enter random/casual blood glucose measurement
              </Text>

              <View style={styles.infoBox}>
                <Text style={styles.infoBoxTitle}>
                  ADA Random Plasma Glucose Guidelines
                </Text>
                <Text style={styles.infoBoxText}>
                  Normal: 7.8 mmol/L{"\n"}
                  Prediabetes: 7.8-11.0 mmol/L{"\n"}
                  Diabetes: ≥11.1 mmol/L
                </Text>
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Additional Risk Factors</Text>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => handleToggleRiskFactor("diabetes")}
                >
                  <View
                    style={[
                      styles.checkbox,
                      riskFactors.diabetes && styles.checkboxChecked,
                    ]}
                  >
                    {riskFactors.diabetes && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>Known diabetes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => handleToggleRiskFactor("hypertension")}
                >
                  <View
                    style={[
                      styles.checkbox,
                      riskFactors.hypertension && styles.checkboxChecked,
                    ]}
                  >
                    {riskFactors.hypertension && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>Known hypertension</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => handleToggleRiskFactor("eyePain")}
                >
                  <View
                    style={[
                      styles.checkbox,
                      riskFactors.eyePain && styles.checkboxChecked,
                    ]}
                  >
                    {riskFactors.eyePain && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>Eye pain or redness</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => handleToggleRiskFactor("visionLoss")}
                >
                  <View
                    style={[
                      styles.checkbox,
                      riskFactors.visionLoss && styles.checkboxChecked,
                    ]}
                  >
                    {riskFactors.visionLoss && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    Vision loss (distance)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        );

      case 5:
        return (
          <>
            <Text style={styles.formTitle}>Recommended Reading Glasses</Text>
            <Text style={styles.formSubtitle}>
              Select the appropriate power
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Recommended Power</Text>
              <View style={styles.powerOptionsGrid}>
                {powerOptions.map((power) => (
                  <PowerOption
                    key={power}
                    value={power}
                    selected={selectedPower === power}
                    onSelect={() => setSelectedPower(power)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.referralContainer}>
              <Text style={styles.inputLabel}>Need advanced eye care?</Text>
              <TouchableOpacity
                style={styles.referralBox}
                onPress={() => setNeedsReferral(!needsReferral)}
              >
                <View
                  style={[
                    styles.checkbox,
                    needsReferral && styles.checkboxChecked,
                  ]}
                >
                  {needsReferral && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.referralText}>
                  Create referral to eye clinic
                </Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case 6:
        return (
          <>
            <Text style={styles.formTitle}>Client Registration</Text>

            <View style={styles.clientSummary}>
              <Text style={styles.clientName}>
                {fullName || "Nakato Grace"}
              </Text>
              <Text style={styles.clientDetail}>Age: {age || "52"} years</Text>
              <Text style={styles.clientDetail}>
                Phone: {phoneNumber || "0700123456"}
              </Text>
              <Text style={styles.clientDetail}>
                Power: {selectedPower || "+2.50D"}
              </Text>
              <Text style={styles.clientDetail}>
                District: {district || "Luweero District"}
              </Text>
              <Text style={styles.clientDetail}>
                County: {county || "Luweero County"}
              </Text>
              <Text style={styles.clientDetail}>
                Sub-County: {subCounty || "Wobulenzi Sub-County"}
              </Text>
              <Text style={styles.clientDetail}>
                Parish: {parish || "Bombo Parish"}
              </Text>
              <Text style={styles.clientDetail}>
                Village: {village || "Bombo Village"}
              </Text>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Issue Glasses</Text>
              <Text style={styles.inputLabel}>Select from Inventory</Text>

              <View style={styles.inventoryItem}>
                <Text style={styles.inventoryText}>
                  +2.50D - Standard Frame (Stock: 10) - UGX 30,000
                </Text>
                <Text style={styles.inventoryStock}>
                  Stock Available: 10 units
                </Text>
              </View>

              <View style={styles.totalCostContainer}>
                <Text style={styles.totalCostLabel}>Total Cost</Text>
                <Text style={styles.totalCostAmount}>UGX 30,000</Text>
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Payment Method</Text>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === "hire" && styles.paymentOptionSelected,
                ]}
                onPress={() => setPaymentMethod("hire")}
              >
                <View style={styles.paymentOptionHeader}>
                  <View
                    style={[
                      styles.radioButton,
                      paymentMethod === "hire" && styles.radioButtonSelected,
                    ]}
                  >
                    {paymentMethod === "hire" && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text style={styles.paymentOptionTitle}>
                    Hire-Purchase (3 months)
                  </Text>
                </View>
                <Text style={styles.paymentOptionDetail}>
                  3 monthly installments via MTN/Airtel Money
                </Text>
                <Text style={styles.paymentOptionDetail}>
                  Total Cost: UGX 30,000
                </Text>
                <Text style={styles.paymentOptionInstallment}>
                  UGX 10,000/month × 3
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === "full" && styles.paymentOptionSelected,
                ]}
                onPress={() => setPaymentMethod("full")}
              >
                <View style={styles.paymentOptionHeader}>
                  <View
                    style={[
                      styles.radioButton,
                      paymentMethod === "full" && styles.radioButtonSelected,
                    ]}
                  >
                    {paymentMethod === "full" && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text style={styles.paymentOptionTitle}>Full Payment</Text>
                </View>
                <Text style={styles.paymentOptionDetail}>
                  Pay UGX 30,000 today
                </Text>
              </TouchableOpacity>
            </View>

            {paymentMethod === "hire" && (
              <View style={styles.sectionContainer}>
                <Text style={styles.inputLabel}>VSLA Group</Text>
                <Dropdown
                  label=""
                  value={selectedVSLA}
                  placeholder="Select VSLA Group"
                  options={vslaGroups}
                  onSelect={setSelectedVSLA}
                />

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mobile Money Number</Text>
                  <View style={styles.mobileMoneyContainer}>
                    <Text style={styles.mobileMoneyPrefix}>MTN</Text>
                    <TextInput
                      style={[styles.textInput, styles.mobileMoneyInput]}
                      value={mobileMoneyNumber}
                      onChangeText={setMobileMoneyNumber}
                      keyboardType="phone-pad"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <View style={styles.merchantCodeContainer}>
                  <Text style={styles.merchantCodeLabel}>Merchant Code</Text>
                  <Text style={styles.merchantCode}>SAN-UG-2025-1234</Text>
                  <Text style={styles.merchantCodeHint}>
                    Share this code with client for installment payments
                  </Text>
                  <Text style={styles.merchantCodeHint}>
                    Client can use this code to pay via Mobile Money or at any
                    Santé Initiative agent
                  </Text>
                </View>

                <View style={styles.installmentNotice}>
                  <Text style={styles.installmentNoticeText}>
                    Collect First Installment (UGX 10,000)
                  </Text>
                  <Text style={styles.installmentNoticeDetail}>
                    Client agrees to pay UGX 10,000 monthly for 3 months. Late
                    payments may incur fees.
                  </Text>
                </View>
              </View>
            )}
          </>
        );

      default:
        return null;
    }
  };

  const renderStepButtons = () => {
    if (currentStep === 6) {
      return (
        <View style={styles.registrationButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handlePreviousStep}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmSale}
          >
            <Text style={styles.confirmButtonText}>Confirm Sale</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.stepButtons}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handlePreviousStep}
        >
          <Ionicons name="arrow-back" size={20} color="#1E40AF" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextButton,
            currentStep === 5 && styles.completeButton,
          ]}
          onPress={handleNextStep}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === 5 ? "Complete & Register Client" : "Next"}
          </Text>
          {currentStep !== 5 && (
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              {/* <View>
                <Text style={styles.organization}>Santé Initiative Uganda</Text>
                <Text style={styles.userName}>New VHT</Text>
                <Text style={styles.userRole}>CHW </Text>
              </View> */}
              <TouchableOpacity
                style={styles.menuButton}
                onPress={handlePreviousStep}
              >
                <Ionicons name="arrow-back" size={24} color="#1E40AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Screening Header */}
          <View style={styles.screeningHeader}>
            <Text style={styles.screeningTitle}>
              {currentStep === 6 ? "Client Registration" : "Vision Screening"}
            </Text>
            {currentStep <= 5 && (
              <>
                <View style={styles.stepIndicator}>
                  {[1, 2, 3, 4, 5].map((step) => (
                    <React.Fragment key={step}>
                      <View
                        style={[
                          styles.stepCircle,
                          step === currentStep && styles.stepCircleActive,
                          step < currentStep && styles.stepCircleCompleted,
                        ]}
                      >
                        {step < currentStep ? (
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color="#FFFFFF"
                          />
                        ) : (
                          <Text
                            style={[
                              styles.stepCircleText,
                              step === currentStep &&
                                styles.stepCircleTextActive,
                            ]}
                          >
                            {step}
                          </Text>
                        )}
                      </View>
                      {step < 5 && (
                        <View
                          style={[
                            styles.stepLine,
                            step < currentStep && styles.stepLineActive,
                          ]}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </View>
                <Text style={styles.stepText}>
                  {currentStep === 6
                    ? "Registration"
                    : `Step ${currentStep} of 5`}
                </Text>
              </>
            )}
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {renderStepContent()}
            {renderStepButtons()}
          </View>

          {/* Bottom Navigation */}
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem}>
              <Ionicons name="home-outline" size={24} color="#6B7280" />
              <Text style={styles.navText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItemActive}>
              <Ionicons name="eye-outline" size={24} color="#1E40AF" />
              <Text style={styles.navTextActive}>Screen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <Ionicons name="cube-outline" size={24} color="#6B7280" />
              <Text style={styles.navText}>Stock</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <Ionicons name="cash-outline" size={24} color="#6B7280" />
              <Text style={styles.navText}>Payments</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color="#6B7280"
              />
              <Text style={styles.navText}>Referrals</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FFF8",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  organization: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 15,
    color: "#6B7280",
  },
  menuButton: {
    padding: 6,
    marginTop: -4,
  },
  screeningHeader: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  screeningTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 16,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    backgroundColor: "#1E40AF",
  },
  stepCircleCompleted: {
    backgroundColor: "#10B981",
  },
  stepCircleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  stepCircleTextActive: {
    color: "#FFFFFF",
  },
  stepLine: {
    width: 40,
    height: 3,
    backgroundColor: "#E5E7EB",
  },
  stepLineActive: {
    backgroundColor: "#10B981",
  },
  stepText: {
    textAlign: "center",
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#374151",
    backgroundColor: "#FFFFFF",
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  dropdownDisabled: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  dropdownText: {
    fontSize: 16,
    color: "#374151",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#374151",
  },
  // Questions styles
  questionContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E40AF",
    marginRight: 8,
    minWidth: 24,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  infoButton: {
    padding: 4,
    marginLeft: 8,
  },
  infoBox: {
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  infoText: {
    fontSize: 13,
    color: "#1E40AF",
    fontStyle: "italic",
  },
  answerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  answerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  answerButtonSelected: {
    backgroundColor: "#1E40AF",
    borderColor: "#1E40AF",
  },
  answerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  answerButtonTextSelected: {
    color: "#FFFFFF",
  },
  questionsProgress: {
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  questionsProgressText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E40AF",
    textAlign: "center",
  },
  // Vision Screening styles
  instructionBox: {
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  instructionIcon: {
    marginBottom: 8,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 8,
  },
  instructionBullet: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
    marginBottom: 4,
  },
  eyeChartContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  eyeChartRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
  },
  eyeChartLetter: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginHorizontal: 8,
    minWidth: 30,
    textAlign: "center",
  },
  lineOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  lineOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    minWidth: 60,
    alignItems: "center",
  },
  lineOptionSelected: {
    backgroundColor: "#1E40AF",
    borderColor: "#1E40AF",
  },
  lineOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  lineOptionTextSelected: {
    color: "#FFFFFF",
  },
  // NCD Risk Screening styles
  sectionContainer: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  bpReadingContainer: {
    marginBottom: 16,
  },
  bpReadingTitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  bpInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bpInputContainer: {
    flex: 1,
  },
  bpInputLabel: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  bpInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#374151",
    backgroundColor: "#FFFFFF",
  },
  bpSlash: {
    fontSize: 24,
    fontWeight: "700",
    color: "#374151",
    marginTop: 20,
  },
  inputHelper: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 16,
  },
  infobox: {
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  infoBoxTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0369A1",
    marginBottom: 8,
  },
  infoBoxText: {
    fontSize: 13,
    color: "#0C4A6E",
    lineHeight: 20,
  },
  checkboxContainer: {
    gap: 12,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#1E40AF",
    borderColor: "#1E40AF",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#374151",
  },
  // Step 5: Reading Glasses styles
  powerOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  powerOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    minWidth: 80,
    alignItems: "center",
  },
  powerOptionSelected: {
    backgroundColor: "#1E40AF",
    borderColor: "#1E40AF",
  },
  powerOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  powerOptionTextSelected: {
    color: "#FFFFFF",
  },
  referralContainer: {
    marginTop: 20,
  },
  referralBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  referralText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400E",
    marginLeft: 12,
  },
  // Client Registration styles
  clientSummary: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  clientName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  clientDetail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  inventoryItem: {
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  inventoryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  inventoryStock: {
    fontSize: 14,
    color: "#10B981",
  },
  totalCostContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  totalCostLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  totalCostAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E40AF",
  },
  paymentOption: {
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  paymentOptionSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#1E40AF",
  },
  paymentOptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: "#1E40AF",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1E40AF",
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  paymentOptionDetail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  paymentOptionInstallment: {
    fontSize: 15,
    fontWeight: "600",
    color: "#10B981",
    marginTop: 4,
  },
  mobileMoneyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  mobileMoneyPrefix: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRightWidth: 0,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    fontSize: 16,
    color: "#374151",
  },
  mobileMoneyInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  merchantCodeContainer: {
    backgroundColor: "#FEF3C7",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  merchantCodeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 4,
  },
  merchantCode: {
    fontSize: 18,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 8,
  },
  merchantCodeHint: {
    fontSize: 13,
    color: "#92400E",
    marginBottom: 4,
  },
  installmentNotice: {
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  installmentNoticeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0369A1",
    marginBottom: 4,
  },
  installmentNoticeDetail: {
    fontSize: 14,
    color: "#0C4A6E",
  },
  // Buttons styles
  stepButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
    marginLeft: 8,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: "#1E40AF",
    flex: 1,
    marginLeft: 12,
  },
  completeButton: {
    backgroundColor: "#10B981",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  registrationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#10B981",
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Bottom Navigation
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: "center",
    padding: 8,
  },
  navItemActive: {
    alignItems: "center",
    padding: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
  },
  navText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  navTextActive: {
    fontSize: 12,
    color: "#1E40AF",
    marginTop: 4,
    fontWeight: "600",
  },
});
