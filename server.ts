import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import {
  authorizeOperation,
  validateEvidenceFileUpload,
  SecurityActor,
  SecurityAction,
  ResourceDescriptor,
} from './src/security/rbacEngine';
import { runAllNexoraSecurityTests } from './src/security/securityTests';
import {
  parseUnstructuredOpportunityDescription,
  StructuredRecommendationExplanation,
} from './src/recommendation/recommendationEngine';
import { runAllNexoraRecommendationTests } from './src/recommendation/recommendationTests';
import { INITIAL_MICRO_SKILLS } from './src/services/demoData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ServerCrossPortalEvent {
  id: string;
  title: string;
  message: string;
  eventType: string;
  recipientRole: string;
  relatedRecordId: string;
  navigationTarget: string;
  dedupeKey: string;
  timestamp: string;
}

export interface ServerSecurityAuditRecord {
  id: string;
  actorUid: string;
  actorName: string;
  actorRole: string;
  institutionId: string;
  organizationId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  outcome: 'SUCCESS' | 'DENIED';
  code: string;
  previousState?: string;
  newState?: string;
  timestamp: string;
}

// Server-authoritative event log with deduplication by dedupeKey
const serverEventLog: ServerCrossPortalEvent[] = [];
const processedDedupeKeys = new Set<string>();

// Append-only server security audit log (Immutable — no update/delete allowed)
const serverAuditLogs: ServerSecurityAuditRecord[] = [
  {
    id: 'srv_aud_init_1',
    actorUid: 'system_boot',
    actorName: 'NEXORA Security Engine',
    actorRole: 'Technical Administrator',
    institutionId: 'inst_nusantara',
    action: 'Initialized Multi-Tenant RBAC & Append-Only Audit Subsystem',
    resourceType: 'institutional_settings',
    resourceId: 'sec_policy_v6',
    outcome: 'SUCCESS',
    code: 'AUTHORIZED',
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
  },
];

// Simple per-IP sliding window rate limiter for sensitive endpoints (PRD 06 Section 14)
const rateLimitWindowMs = 60 * 1000;
const maxRequestsPerMinute = 180;
const ipRequestCounters = new Map<string, { count: number; resetAt: number }>();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '1mb' }));

  // Security headers & rate limiting middleware for /api/*
  app.use('/api', (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-NEXORA-Security-Policy', 'RBAC-Enforced-v6');

    const ip = req.ip || 'local';
    const now = Date.now();
    const record = ipRequestCounters.get(ip);
    if (!record || now > record.resetAt) {
      ipRequestCounters.set(ip, { count: 1, resetAt: now + rateLimitWindowMs });
    } else {
      record.count += 1;
      if (record.count > maxRequestsPerMinute) {
        res.status(429).json({
          error: 'Too many requests. Rate limit exceeded for sensitive endpoint.',
          code: 'RATE_LIMIT_EXCEEDED',
        });
        return;
      }
    }
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      platform: 'NEXORA Institutional Learning Intelligence Platform',
      securityEngine: 'PRD-06 Multi-Tenant RBAC Active',
      recommendationEngine: 'PRD-07 Hybrid Rule + Ranking + Grounded AI Active',
      eventsRecorded: serverEventLog.length,
      auditRecordsCount: serverAuditLogs.length,
    });
  });

  // ============================================================================
  // PRD 04 CROSS-PORTAL EVENT ENGINE
  // ============================================================================
  app.get('/api/events', (_req, res) => {
    res.json({
      events: serverEventLog,
      total: serverEventLog.length,
    });
  });

  app.post('/api/events', (req, res) => {
    const {
      title,
      message,
      eventType = 'SYSTEM',
      recipientRole = 'all',
      relatedRecordId = '',
      navigationTarget = 'overview',
      dedupeKey,
    } = req.body || {};

    if (!title || !message) {
      res.status(400).json({ error: 'title and message are required' });
      return;
    }

    const resolvedDedupeKey =
      dedupeKey || `${eventType}_${recipientRole}_${relatedRecordId}_${title}`;

    if (processedDedupeKeys.has(resolvedDedupeKey)) {
      res.status(200).json({
        deduplicated: true,
        message: 'Duplicate notification prevented by server-side dedupeKey guard.',
      });
      return;
    }

    processedDedupeKeys.add(resolvedDedupeKey);

    const newEvent: ServerCrossPortalEvent = {
      id: `srv_evt_${Date.now()}`,
      title: String(title).slice(0, 200),
      message: String(message).slice(0, 500),
      eventType: String(eventType).slice(0, 60),
      recipientRole: String(recipientRole).slice(0, 40),
      relatedRecordId: String(relatedRecordId).slice(0, 120),
      navigationTarget: String(navigationTarget).slice(0, 80),
      dedupeKey: resolvedDedupeKey,
      timestamp: new Date().toISOString(),
    };

    serverEventLog.unshift(newEvent);
    res.status(201).json({ deduplicated: false, event: newEvent });
  });

  // ============================================================================
  // PRD 06 SERVER-SIDE RBAC AUTHORIZATION & SECURITY ENDPOINTS
  // ============================================================================
  app.post('/api/security/authorize', (req, res) => {
    const { actor, action, resource } = (req.body || {}) as {
      actor?: SecurityActor;
      action?: SecurityAction;
      resource?: ResourceDescriptor;
    };

    if (!action || !resource || !resource.collection) {
      res.status(400).json({
        allowed: false,
        code: 'INVALID_REQUEST',
        reason: 'Missing required action or resource descriptor.',
      });
      return;
    }

    const decision = authorizeOperation(actor, action, resource);

    if (decision.auditRequired || !decision.allowed) {
      serverAuditLogs.unshift({
        id: `srv_aud_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        actorUid: actor?.uid || 'unauthenticated',
        actorName: actor?.name || 'Unauthenticated Caller',
        actorRole: actor?.activeRole || 'None',
        institutionId: actor?.institutionId || resource.institutionId || 'inst_nusantara',
        organizationId: actor?.organizationId || resource.organizationId,
        action: `${action.toUpperCase()} on ${resource.collection}`,
        resourceType: resource.collection,
        resourceId: resource.resourceId || 'unknown',
        outcome: decision.allowed ? 'SUCCESS' : 'DENIED',
        code: decision.code,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      });
    }

    res.status(decision.allowed ? 200 : 403).json(decision);
  });

  app.post('/api/security/validate-upload', (req, res) => {
    const { actor, fileMeta } = req.body || {};
    if (!fileMeta || !fileMeta.fileName) {
      res.status(400).json({
        allowed: false,
        code: 'INVALID_UPLOAD_REQUEST',
        reason: 'fileMeta with fileName, mimeType, sizeBytes, and targetStoragePath is required.',
      });
      return;
    }

    const validation = validateEvidenceFileUpload(actor, fileMeta);
    serverAuditLogs.unshift({
      id: `srv_aud_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      actorUid: actor?.uid || 'unauthenticated',
      actorName: actor?.name || 'Unauthenticated Caller',
      actorRole: actor?.activeRole || 'None',
      institutionId: fileMeta.targetInstitutionId || 'inst_nusantara',
      action: `FILE_UPLOAD_VALIDATION (${fileMeta.fileName})`,
      resourceType: 'evidence_files',
      resourceId: fileMeta.targetStoragePath || fileMeta.fileName,
      outcome: validation.allowed ? 'SUCCESS' : 'DENIED',
      code: validation.code,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });

    res.status(validation.allowed ? 200 : 403).json(validation);
  });

  app.get('/api/security/audit-logs', (_req, res) => {
    res.json({
      immutable: true,
      total: serverAuditLogs.length,
      logs: serverAuditLogs,
    });
  });

  // Strictly block any attempt to mutate or delete audit logs via REST
  app.put('/api/security/audit-logs/*', (_req, res) => {
    res.status(403).json({
      allowed: false,
      code: 'DENIED_IMMUTABLE_AUDIT',
      reason: 'Audit logs are strictly append-only and cannot be modified.',
    });
  });

  app.delete('/api/security/audit-logs/*', (_req, res) => {
    res.status(403).json({
      allowed: false,
      code: 'DENIED_IMMUTABLE_AUDIT',
      reason: 'Audit logs are strictly append-only and cannot be deleted.',
    });
  });

  app.get('/api/security/run-tests', (_req, res) => {
    const report = runAllNexoraSecurityTests();
    res.json(report);
  });

  // ============================================================================
  // PRD 07 SERVER-SIDE RECOMMENDATION INTELLIGENCE & GROUNDED AI ENDPOINTS
  // ============================================================================
  app.get('/api/recommendations/run-tests', (_req, res) => {
    const report = runAllNexoraRecommendationTests();
    res.json(report);
  });

  // Layer C: Grounded AI-Assisted Explanation Endpoint (with deterministic fallback)
  app.post('/api/recommendations/explain', async (req, res) => {
    const { title, structuredExplanation } = (req.body || {}) as {
      title?: string;
      structuredExplanation?: StructuredRecommendationExplanation;
    };

    if (!structuredExplanation) {
      res.status(400).json({ error: 'structuredExplanation is required' });
      return;
    }

    const fallbackNarrative = `${structuredExplanation.whySeeingThis} Related to ${structuredExplanation.relatedGoalOrInterest}. Current gap status: ${structuredExplanation.skillGapSummary} Recommended next step: ${structuredExplanation.nextActionStep}`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.json({
        aiEnhancedNarrative: fallbackNarrative,
        groundingSource: 'Deterministic Rule & Graph Engine (Fallback — No API Key Configured)',
        fallbackUsed: true,
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are the Grounded Explanation Assistant for NEXORA Institutional Learning Intelligence.
Summarize the following verified recommendation facts for the student in 2-3 clear, encouraging sentences.
STRICT GROUNDING RULES:
1. Use ONLY the facts provided below.
2. NEVER invent competencies, grades, assessment scores, or eligibility rules.
3. Explicitly preserve any "Not Assessed" or "Unknown" caveats.

Recommendation Title: ${title || 'Recommendation'}
Why seeing this: ${structuredExplanation.whySeeingThis}
Goal/Interest: ${structuredExplanation.relatedGoalOrInterest}
Competencies: ${(structuredExplanation.involvedCompetencies || []).join(', ')}
Supporting Evidence: ${structuredExplanation.supportingEvidence}
Skill Gap Summary: ${structuredExplanation.skillGapSummary}
Next Action Step: ${structuredExplanation.nextActionStep}
Unknown Information: ${structuredExplanation.unknownInformation}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              conciseGroundedExplanation: {
                type: Type.STRING,
                description: 'A 2-3 sentence grounded explanation using only the provided facts.',
              },
            },
            required: ['conciseGroundedExplanation'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({
        aiEnhancedNarrative: parsed.conciseGroundedExplanation || fallbackNarrative,
        groundingSource: 'Grounded AI (Gemini 3.8 Flash) + Rule Engine',
        fallbackUsed: false,
      });
    } catch (_err) {
      res.json({
        aiEnhancedNarrative: fallbackNarrative,
        groundingSource: 'Deterministic Rule & Graph Engine (Automatic Fallback)',
        fallbackUsed: true,
      });
    }
  });

  // PRD 07 Section 17: Unstructured Opportunity Text Parser (Grounded against canonical taxonomy)
  app.post('/api/recommendations/parse-opportunity', async (req, res) => {
    const { rawText } = (req.body || {}) as { rawText?: string };
    if (!rawText || typeof rawText !== 'string') {
      res.status(400).json({ error: 'rawText is required' });
      return;
    }

    const deterministicResult = parseUnstructuredOpportunityDescription(
      rawText,
      INITIAL_MICRO_SKILLS
    );

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.json(deterministicResult);
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const canonicalCatalogText = INITIAL_MICRO_SKILLS.map(
        s => `${s.id}: ${s.name} (${s.category})`
      ).join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Extract candidate canonical skill IDs from the following unstructured opportunity description.
STRICT RULES:
1. You may ONLY select skillIds that exist in the Canonical NEXORA Taxonomy below.
2. Flag any missing mandatory details (deadline, eligibility, official URL).

Canonical NEXORA Taxonomy:
${canonicalCatalogText}

Unstructured Opportunity Description:
${rawText}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchedCanonicalSkillIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              extractedEligibilitySummary: { type: Type.STRING },
            },
            required: ['matchedCanonicalSkillIds', 'extractedEligibilitySummary'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      const aiSkillIds: string[] = Array.isArray(parsed.matchedCanonicalSkillIds)
        ? parsed.matchedCanonicalSkillIds
        : [];

      // Validate every AI-suggested skillId against the canonical taxonomy (reject hallucinated IDs!)
      const validSet = new Set(INITIAL_MICRO_SKILLS.map(s => s.id));
      const mergedSkillIds = new Set([
        ...deterministicResult.candidateSkills.map(c => c.skillId),
        ...aiSkillIds.filter(id => validSet.has(id)),
      ]);

      const mergedCandidates = Array.from(mergedSkillIds).map(id => {
        const existing = deterministicResult.candidateSkills.find(c => c.skillId === id);
        if (existing) return existing;
        const sk = INITIAL_MICRO_SKILLS.find(s => s.id === id)!;
        return {
          skillId: sk.id,
          skillName: sk.name,
          category: sk.category,
          confidenceScore: 82,
          matchedKeywords: ['AI Semantic Taxonomy Match'],
          requiresHumanReview: true,
        };
      });

      res.json({
        ...deterministicResult,
        candidateSkills: mergedCandidates,
        extractedEligibilityDraft:
          parsed.extractedEligibilitySummary || deterministicResult.extractedEligibilityDraft,
        groundingMode: 'Gemini 3.8 Flash + Taxonomy Validator',
      });
    } catch (_err) {
      res.json(deterministicResult);
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NEXORA Full-Stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start NEXORA server:', err);
  process.exit(1);
});
