import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Compass,
  Send,
  Paperclip,
  CheckCircle2,
  Circle,
  Plus,
  FileText,
  Sparkles,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import {
  analyzeDocumentLocally,
  ConversationSlots,
  ExtractedDocumentInfo,
  processConversationTurnLocal,
  ResolvedOfficeDestination,
} from '../services/civicAssistantEngine';
import { ResolvedDestinationView } from '../components/ResolvedDestinationView';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  quickReplies?: string[];
  extractedDoc?: ExtractedDocumentInfo;
}

const EXAMPLE_TASKS = [
  'I need a DDO signature',
  'I need an income certificate',
  'I want to apply for a birth certificate',
  'I need to register a property',
  'I need to renew my trade license',
  'I need to submit a government document',
];

const SEARCHING_ANIMATION_STEPS = [
  'Understanding your task...',
  'Finding relevant department...',
  'Checking location...',
  'Finding office...',
  'Preparing directions...',
];

function renderFormattedText(text: string): React.ReactNode {
  // Simple bold (**text**) and line-break formatter for clean conversational bubbles
  const paragraphs = text.split('\n\n');
  return (
    <div className="space-y-2">
      {paragraphs.map((para, pIdx) => {
        const parts = para.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={pIdx} className="leading-relaxed">
            {parts.map((part, idx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={idx} className="font-bold">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return <React.Fragment key={idx}>{part}</React.Fragment>;
            })}
          </p>
        );
      })}
    </div>
  );
}

export const PostLoginAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const [initialTaskInput, setInitialTaskInput] = useState('');
  const [replyInput, setReplyInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [slots, setSlots] = useState<ConversationSlots>({ rawInitialTask: '' });
  const [progress, setProgress] = useState({
    taskUnderstood: false,
    locationCollectedCount: 0,
    locationTotalNeeded: 4,
    departmentFound: false,
    officeFound: false,
    destinationReady: false,
  });

  // Searching animation state before revealing final destination
  const [isSearchingOffice, setIsSearchingOffice] = useState(false);
  const [searchingStepIndex, setSearchingStepIndex] = useState(0);
  const [resolvedDestination, setResolvedDestination] =
    useState<ResolvedOfficeDestination | null>(null);
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const destinationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (hasStartedConversation && !resolvedDestination) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, isSearchingOffice, hasStartedConversation, resolvedDestination]);

  const triggerSearchingSequence = (destination: ResolvedOfficeDestination) => {
    if (prefersReducedMotion) {
      setResolvedDestination(destination);
      return;
    }

    setIsSearchingOffice(true);
    setSearchingStepIndex(0);

    let step = 0;
    const interval = window.setInterval(() => {
      step += 1;
      if (step < SEARCHING_ANIMATION_STEPS.length) {
        setSearchingStepIndex(step);
      } else {
        window.clearInterval(interval);
        setIsSearchingOffice(false);
        setResolvedDestination(destination);
        window.setTimeout(() => {
          destinationRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 120);
      }
    }, 320);
  };

  const handleStartTask = (taskText: string) => {
    const trimmed = taskText.trim();
    if (!trimmed) return;

    const initialAiPrompt: ChatMessage = {
      id: 'msg-init-ai',
      sender: 'ai',
      text: 'What government work do you need to do?',
    };

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
    };

    const freshSlots: ConversationSlots = { rawInitialTask: trimmed };
    const turnResult = processConversationTurnLocal(trimmed, freshSlots, true);

    const aiReply: ChatMessage = {
      id: `msg-ai-${Date.now() + 1}`,
      sender: 'ai',
      text: turnResult.assistantMessage,
      quickReplies: turnResult.quickReplies,
    };

    setHasStartedConversation(true);
    setMessages([initialAiPrompt, userMsg, aiReply]);
    setSlots(turnResult.updatedSlots);
    setProgress(turnResult.progressState);
    setInitialTaskInput('');
    setReplyInput('');

    if (user) {
      dataService.addSearchHistory(
        user.id,
        trimmed,
        1,
        undefined,
        turnResult.updatedSlots.serviceName
      );
    }

    if (turnResult.resolvedDestination) {
      triggerSearchingSequence(turnResult.resolvedDestination);
    }
  };

  const handleSendReply = (textToSend?: string) => {
    const content = (textToSend ?? replyInput).trim();
    if (!content || isSearchingOffice) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: content,
    };

    const turnResult = processConversationTurnLocal(content, slots, false);

    const aiReply: ChatMessage = {
      id: `msg-ai-${Date.now() + 1}`,
      sender: 'ai',
      text: turnResult.assistantMessage,
      quickReplies: turnResult.quickReplies,
    };

    setMessages((prev) => [...prev, userMsg, aiReply]);
    setSlots(turnResult.updatedSlots);
    setProgress(turnResult.progressState);
    setReplyInput('');

    if (turnResult.resolvedDestination) {
      triggerSearchingSequence(turnResult.resolvedDestination);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setIsAnalyzingDoc(true);
    setHasStartedConversation(true);

    const userUploadMsg: ChatMessage = {
      id: `msg-upload-${Date.now()}`,
      sender: 'user',
      text: `Uploaded document: ${file.name}`,
    };

    setMessages((prev) =>
      prev.length === 0
        ? [
            {
              id: 'msg-init-ai',
              sender: 'ai',
              text: 'What government work do you need to do?',
            },
            userUploadMsg,
          ]
        : [...prev, userUploadMsg]
    );

    try {
      let textContent = '';

      if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
        textContent = await file.text();
      } else {
        // Extract printable text tokens locally from PDF/document buffer without any external API key
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer.slice(0, 250000));
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const rawDecoded = decoder.decode(bytes);
        const printableMatches = rawDecoded.match(/[A-Za-z0-9\-\/\s:,._]{4,}/g);
        if (printableMatches) {
          textContent = printableMatches.join(' ');
        }
      }

      const localResult = analyzeDocumentLocally(file.name, textContent);
      const extracted: ExtractedDocumentInfo = localResult.extracted;

      const nextSlots: ConversationSlots = {
        ...slots,
        rawInitialTask:
          slots.rawInitialTask ||
          extracted.serviceName ||
          extracted.documentType ||
          `Document: ${file.name}`,
        uploadedDoc: extracted,
      };

      if (extracted.documentType) nextSlots.documentType = extracted.documentType;
      if (extracted.serviceName) nextSlots.serviceName = extracted.serviceName;
      if (extracted.district) nextSlots.district = extracted.district;
      if (extracted.taluk) nextSlots.taluk = extracted.taluk;
      if (extracted.locality) nextSlots.locality = extracted.locality;

      const syntheticQuery = `${extracted.serviceName || ''} ${
        extracted.documentType || ''
      } ${file.name}`.trim();
      const turnRes = processConversationTurnLocal(
        syntheticQuery,
        nextSlots,
        !slots.taskCategory
      );

      const aiDocMsg: ChatMessage = {
        id: `msg-ai-doc-${Date.now()}`,
        sender: 'ai',
        text: localResult.clarifyingQuestion || turnRes.assistantMessage,
        extractedDoc: extracted,
        quickReplies: turnRes.quickReplies,
      };

      setSlots(turnRes.updatedSlots);
      setProgress(turnRes.progressState);
      setMessages((prev) => [...prev, aiDocMsg]);

      if (turnRes.resolvedDestination) {
        triggerSearchingSequence(turnRes.resolvedDestination);
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `msg-ai-err-${Date.now()}`,
        sender: 'ai',
        text: `I received your file **"${file.name}"**. What type of government document is this, and what task or signature do you need for it?`,
        quickReplies: [
          'I need a DDO signature',
          'I need an income certificate',
          'I need to register a property',
        ],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsAnalyzingDoc(false);
    }
  };

  const handleInstantDemo = (demoTask = 'I need an income certificate') => {
    const step1 = processConversationTurnLocal(
      demoTask,
      { rawInitialTask: demoTask },
      true
    );
    const step2 = processConversationTurnLocal(
      'Bengaluru Urban',
      step1.updatedSlots,
      false
    );
    const step3 = processConversationTurnLocal(
      'Bangalore North',
      step2.updatedSlots,
      false
    );
    const step4 = processConversationTurnLocal(
      'Yelahanka',
      step3.updatedSlots,
      false
    );

    const demoMessages: ChatMessage[] = [
      {
        id: 'demo-init',
        sender: 'ai',
        text: 'What government work do you need to do?',
      },
      {
        id: 'demo-u1',
        sender: 'user',
        text: demoTask,
      },
      {
        id: 'demo-a1',
        sender: 'ai',
        text: step1.assistantMessage,
      },
      {
        id: 'demo-u2',
        sender: 'user',
        text: 'Bengaluru Urban',
      },
      {
        id: 'demo-a2',
        sender: 'ai',
        text: step2.assistantMessage,
      },
      {
        id: 'demo-u3',
        sender: 'user',
        text: 'Bangalore North',
      },
      {
        id: 'demo-a3',
        sender: 'ai',
        text: step3.assistantMessage,
      },
      {
        id: 'demo-u4',
        sender: 'user',
        text: 'Yelahanka',
      },
      {
        id: 'demo-a4',
        sender: 'ai',
        text: step4.assistantMessage,
      },
    ];

    setHasStartedConversation(true);
    setMessages(demoMessages);
    setSlots(step4.updatedSlots);
    setProgress(step4.progressState);
    if (step4.resolvedDestination) {
      triggerSearchingSequence(step4.resolvedDestination);
    }
  };

  const handleResetConversation = () => {
    setHasStartedConversation(false);
    setInitialTaskInput('');
    setReplyInput('');
    setMessages([]);
    setSlots({ rawInitialTask: '' });
    setProgress({
      taskUnderstood: false,
      locationCollectedCount: 0,
      locationTotalNeeded: 4,
      departmentFound: false,
      officeFound: false,
      destinationReady: false,
    });
    setIsSearchingOffice(false);
    setResolvedDestination(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const latestAiMessage = [...messages]
    .reverse()
    .find((m) => m.sender === 'ai');

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Bar with CivicGuide Title & "+ Find another government office" when active */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#1E3A8A] text-white flex items-center justify-center">
                <Compass className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
              <span className="text-base font-bold text-[#0F172A] tracking-tight">
                CivicGuide
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Find the right government office for your task.
            </p>
          </div>

          {hasStartedConversation && (
            <button
              type="button"
              onClick={handleResetConversation}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-[#1E3A8A] text-xs font-semibold text-[#1E3A8A] transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Find another government office</span>
            </button>
          )}
        </div>

        {/* Hidden file input for document uploads */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
          onChange={handleFileUpload}
          className="hidden"
          aria-label="Upload government document or form"
        />

        {/* ====================================================================
            VIEW 1: POST-LOGIN HOME SCREEN (Before conversation starts)
            ==================================================================== */}
        {!hasStartedConversation ? (
          <motion.section
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-10 lg:p-12 space-y-8"
          >
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-semibold text-[#1E3A8A] uppercase tracking-wider">
                Step-by-Step Civic Assistant
              </span>
              <h1 className="text-2xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
                What government work do you need to do?
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Tell me what you need to do, and I'll guide you step-by-step to
                the exact department, building, counter, and map destination.
              </p>
            </div>

            {/* Large Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleStartTask(initialTaskInput);
              }}
              className="space-y-3"
            >
              <div className="bg-[#F8FAFC] p-2.5 rounded-2xl border-2 border-slate-300 focus-within:border-[#1E3A8A] focus-within:bg-white transition-colors flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <label htmlFor="post-login-task-input" className="sr-only">
                  Tell me what you need to do
                </label>
                <input
                  id="post-login-task-input"
                  type="text"
                  value={initialTaskInput}
                  onChange={(e) => setInitialTaskInput(e.target.value)}
                  placeholder="Tell me what you need to do..."
                  autoFocus
                  className="flex-1 px-4 py-3 text-base sm:text-lg text-[#0F172A] placeholder:text-slate-400 bg-transparent focus:outline-none"
                />

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    title="Upload a government document, form, or certificate to analyze"
                  >
                    <Paperclip className="w-4 h-4 text-[#1E3A8A]" />
                    <span>Upload Document</span>
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-xl bg-[#1E3A8A] hover:bg-[#172E6E] text-white font-semibold text-sm sm:text-base transition-colors inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    <span>Find Office</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>

            {/* Example Inputs */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-500 block">
                  Example tasks (click any example to start):
                </span>
                <button
                  type="button"
                  onClick={() => handleInstantDemo('I need an income certificate')}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Don't know the details? Click for 1-Click Complete Demo</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {EXAMPLE_TASKS.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => handleStartTask(example)}
                    className="p-3.5 rounded-xl bg-slate-50/90 hover:bg-blue-50/60 border border-slate-200 hover:border-[#1E3A8A] text-left text-xs sm:text-sm font-medium text-[#0F172A] hover:text-[#1E3A8A] transition-colors flex items-center justify-between gap-2 cursor-pointer group"
                  >
                    <span>"{example}"</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1E3A8A] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </motion.section>
        ) : (
          /* ==================================================================
             VIEW 2: CONVERSATIONAL EXPERIENCE + PROGRESS + FINAL DESTINATION
             ================================================================== */
          <div className="space-y-6">
            {/* Section 8: SUBTLE PROGRESS INDICATOR */}
            <div
              className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
              aria-label="Office Finder Progress"
            >
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span
                  className={`inline-flex items-center gap-1.5 font-semibold ${
                    progress.taskUnderstood
                      ? 'text-emerald-700'
                      : 'text-slate-500'
                  }`}
                >
                  {progress.taskUnderstood ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Circle className="w-3.5 h-3.5" />
                  )}
                  <span>Understanding task</span>
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 font-semibold font-mono-tabular ${
                    progress.locationCollectedCount >=
                    progress.locationTotalNeeded
                      ? 'text-emerald-700'
                      : progress.locationCollectedCount > 0
                      ? 'text-[#1E3A8A]'
                      : 'text-slate-500'
                  }`}
                >
                  {progress.locationCollectedCount >=
                  progress.locationTotalNeeded ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Circle className="w-3.5 h-3.5" />
                  )}
                  <span className="font-sans">
                    Location {progress.locationCollectedCount}/
                    {progress.locationTotalNeeded}
                  </span>
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 font-semibold ${
                    progress.departmentFound
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  }`}
                >
                  {progress.departmentFound ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Circle className="w-3.5 h-3.5" />
                  )}
                  <span>Finding department</span>
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 font-semibold ${
                    progress.officeFound ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {progress.officeFound ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Circle className="w-3.5 h-3.5" />
                  )}
                  <span>Finding office</span>
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 font-semibold ${
                    progress.destinationReady
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  }`}
                >
                  {progress.destinationReady ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Circle className="w-3.5 h-3.5" />
                  )}
                  <span>Finding destination</span>
                </span>
              </div>

              {(slots.district || slots.taluk || slots.locality) && (
                <span className="text-xs font-mono-tabular text-[#1E3A8A] font-semibold">
                  {[slots.district, slots.taluk, slots.locality]
                    .filter(Boolean)
                    .join(' → ')}
                </span>
              )}
            </div>

            {/* Section 7: CONVERSATIONAL MESSAGE BUBBLES */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 sm:p-6 space-y-4 max-h-[520px] overflow-y-auto">
                {messages.map((msg) => {
                  const isAi = msg.sender === 'ai';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isAi ? 'items-start' : 'items-end'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {isAi ? 'CivicGuide Assistant' : 'You'}
                        </span>
                      </div>

                      <div
                        className={`max-w-xl rounded-2xl px-4 py-3.5 text-sm space-y-3 ${
                          isAi
                            ? 'bg-slate-100 text-[#0F172A] border border-slate-200/80'
                            : 'bg-[#1E3A8A] text-white'
                        }`}
                      >
                        {renderFormattedText(msg.text)}

                        {/* Extracted Document Card (Section 3) */}
                        {msg.extractedDoc && (
                          <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 space-y-2">
                            <div className="flex items-center gap-2 font-bold text-[#1E3A8A]">
                              <FileText className="w-4 h-4 shrink-0" />
                              <span>
                                Document Analysis: {msg.extractedDoc.fileName}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {msg.extractedDoc.documentType && (
                                <div>
                                  <span className="text-slate-400 block">
                                    Document Type
                                  </span>
                                  <strong>{msg.extractedDoc.documentType}</strong>
                                </div>
                              )}
                              {msg.extractedDoc.department && (
                                <div>
                                  <span className="text-slate-400 block">
                                    Department
                                  </span>
                                  <strong>{msg.extractedDoc.department}</strong>
                                </div>
                              )}
                              {msg.extractedDoc.serviceName && (
                                <div>
                                  <span className="text-slate-400 block">
                                    Service
                                  </span>
                                  <strong>{msg.extractedDoc.serviceName}</strong>
                                </div>
                              )}
                              {msg.extractedDoc.officeMentioned && (
                                <div>
                                  <span className="text-slate-400 block">
                                    Office Mentioned
                                  </span>
                                  <strong>{msg.extractedDoc.officeMentioned}</strong>
                                </div>
                              )}
                              {msg.extractedDoc.officerDesignation && (
                                <div>
                                  <span className="text-slate-400 block">
                                    Officer Designation
                                  </span>
                                  <strong>{msg.extractedDoc.officerDesignation}</strong>
                                </div>
                              )}
                              {msg.extractedDoc.requiredSignatureOrApproval && (
                                <div>
                                  <span className="text-slate-400 block">
                                    Required Signature / Approval
                                  </span>
                                  <strong>
                                    {msg.extractedDoc.requiredSignatureOrApproval}
                                  </strong>
                                </div>
                              )}
                              {msg.extractedDoc.applicationReferenceNumber && (
                                <div>
                                  <span className="text-slate-400 block">
                                    Reference No.
                                  </span>
                                  <strong className="font-mono-tabular">
                                    {msg.extractedDoc.applicationReferenceNumber}
                                  </strong>
                                </div>
                              )}
                              {msg.extractedDoc.dates && (
                                <div>
                                  <span className="text-slate-400 block">
                                    Dates
                                  </span>
                                  <strong className="font-mono-tabular">
                                    {msg.extractedDoc.dates}
                                  </strong>
                                </div>
                              )}
                              {msg.extractedDoc.district && (
                                <div>
                                  <span className="text-slate-400 block">
                                    District / Location
                                  </span>
                                  <strong>
                                    {[
                                      msg.extractedDoc.district,
                                      msg.extractedDoc.taluk,
                                      msg.extractedDoc.locality,
                                    ]
                                      .filter(Boolean)
                                      .join(' → ')}
                                  </strong>
                                </div>
                              )}
                            </div>
                            {msg.extractedDoc.summary && (
                              <p className="text-slate-500 pt-1 border-t border-slate-100">
                                {msg.extractedDoc.summary}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isAnalyzingDoc && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 px-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#1E3A8A]" />
                    <span>Analyzing uploaded document...</span>
                  </div>
                )}

                {/* Section 23: TOPIC-RELATED SEARCHING ANIMATION */}
                {isSearchingOffice && (
                  <div className="p-5 rounded-2xl bg-[#0F172A] text-white space-y-3 max-w-md border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                      <Sparkles className="w-4 h-4" />
                      <span>Locating Correct Government Office...</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      {SEARCHING_ANIMATION_STEPS.map((label, idx) => {
                        const done = searchingStepIndex > idx;
                        const active = searchingStepIndex === idx;
                        return (
                          <div
                            key={label}
                            className={`flex items-center gap-2.5 transition-opacity ${
                              done || active ? 'opacity-100' : 'opacity-35'
                            }`}
                          >
                            {done ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : active ? (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                            )}
                            <span
                              className={
                                done
                                  ? 'text-emerald-300 font-medium'
                                  : active
                                  ? 'text-white font-semibold'
                                  : 'text-slate-400'
                              }
                            >
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Quick Reply Suggestions for the Active Question */}
              {!resolvedDestination && !isSearchingOffice && (
                <div className="px-5 py-3.5 bg-slate-50/90 border-t border-slate-200 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      Suggested answers (click any option below, or skip straight to the office result):
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSendReply("I don't have these values — show office")}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>I don't have these values — Show Office & Map Now →</span>
                    </button>
                  </div>
                  {latestAiMessage?.quickReplies &&
                    latestAiMessage.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {latestAiMessage.quickReplies.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => handleSendReply(suggestion)}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-[#1E3A8A] text-xs font-semibold text-[#1E3A8A] hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              )}

              {/* Bottom Input Bar: [ Type your answer... ] [Send] */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendReply();
                }}
                className="p-4 bg-white border-t border-slate-200 flex items-center gap-2.5"
              >
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl border border-slate-300 text-slate-600 hover:text-[#1E3A8A] hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
                  title="Attach or upload a document"
                  aria-label="Upload a document"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <label htmlFor="conversation-reply-input" className="sr-only">
                  Type your answer
                </label>
                <input
                  id="conversation-reply-input"
                  type="text"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder={
                    resolvedDestination
                      ? 'Ask a follow-up or type another location...'
                      : 'Type your answer...'
                  }
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#1E3A8A] focus:outline-none text-sm text-[#0F172A]"
                />

                <button
                  type="submit"
                  disabled={!replyInput.trim() || isSearchingOffice}
                  className="px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#172E6E] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* FINAL RESOLVED DESTINATION SCREEN */}
            {resolvedDestination && (
              <div ref={destinationRef}>
                <ResolvedDestinationView
                  destination={resolvedDestination}
                  onStartNewSearch={handleResetConversation}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
