/**
 * AegisScan Finding Lifecycle State Machine
 * Enforces controlled state transitions & audit trail entries
 */

export const LIFECYCLE_STATES = {
  DETECTED: 'DETECTED',
  EVIDENCE_COLLECTED: 'EVIDENCE_COLLECTED',
  AI_ANALYZED: 'AI_ANALYZED',
  VALIDATED: 'VALIDATED',
  REMEDIATION_OPEN: 'REMEDIATION_OPEN',
  READY_FOR_RETEST: 'READY_FOR_RETEST',
  RETESTED: 'RETESTED',
  VERIFIED: 'VERIFIED',
  REOPENED: 'REOPENED'
};

const ALLOWED_TRANSITIONS = {
  [LIFECYCLE_STATES.DETECTED]: [
    LIFECYCLE_STATES.EVIDENCE_COLLECTED, 
    LIFECYCLE_STATES.AI_ANALYZED, 
    LIFECYCLE_STATES.VALIDATED
  ],
  [LIFECYCLE_STATES.EVIDENCE_COLLECTED]: [
    LIFECYCLE_STATES.AI_ANALYZED, 
    LIFECYCLE_STATES.VALIDATED
  ],
  [LIFECYCLE_STATES.AI_ANALYZED]: [
    LIFECYCLE_STATES.VALIDATED
  ],
  [LIFECYCLE_STATES.VALIDATED]: [
    LIFECYCLE_STATES.REMEDIATION_OPEN
  ],
  [LIFECYCLE_STATES.REMEDIATION_OPEN]: [
    LIFECYCLE_STATES.READY_FOR_RETEST
  ],
  [LIFECYCLE_STATES.READY_FOR_RETEST]: [
    LIFECYCLE_STATES.RETESTED, 
    LIFECYCLE_STATES.VERIFIED, 
    LIFECYCLE_STATES.REOPENED
  ],
  [LIFECYCLE_STATES.RETESTED]: [
    LIFECYCLE_STATES.VERIFIED, 
    LIFECYCLE_STATES.REOPENED
  ],
  [LIFECYCLE_STATES.REOPENED]: [
    LIFECYCLE_STATES.REMEDIATION_OPEN, 
    LIFECYCLE_STATES.READY_FOR_RETEST
  ],
  [LIFECYCLE_STATES.VERIFIED]: [
    LIFECYCLE_STATES.REOPENED
  ]
};

export function canTransition(currentStatus, targetStatus) {
  if (currentStatus === targetStatus) return true;
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

export function transitionFinding(finding, targetStatus, actor = 'System Engine', note = '') {
  if (!canTransition(finding.status, targetStatus)) {
    throw new Error(`Invalid state machine transition: Cannot move finding ${finding.id} directly from '${finding.status}' to '${targetStatus}'.`);
  }

  const previousStatus = finding.status;
  finding.status = targetStatus;
  finding.updatedAt = new Date().toISOString();

  // Initialize audit trail array if missing
  if (!finding.auditTrail) {
    finding.auditTrail = [];
  }

  const auditEntry = {
    timestamp: new Date().toISOString(),
    action: `LIFECYCLE_TRANSITION`,
    previousStatus,
    newStatus: targetStatus,
    actor,
    details: note || `Finding state transitioned from ${previousStatus} to ${targetStatus}`
  };

  finding.auditTrail.unshift(auditEntry);

  // Update sub-properties according to lifecycle stage
  if (targetStatus === LIFECYCLE_STATES.VALIDATED) {
    if (!finding.validation) finding.validation = {};
    finding.validation.status = 'CONFIRMED';
    finding.validation.validatedBy = actor;
    finding.validation.validatedAt = new Date().toISOString();
  }

  if (targetStatus === LIFECYCLE_STATES.REMEDIATION_OPEN) {
    if (!finding.remediation) finding.remediation = {};
    finding.remediation.status = 'OPEN';
    finding.remediation.updatedAt = new Date().toISOString();
  }

  if (targetStatus === LIFECYCLE_STATES.READY_FOR_RETEST) {
    if (!finding.remediation) finding.remediation = {};
    finding.remediation.status = 'READY_FOR_RETEST';
    if (!finding.retest) finding.retest = {};
    finding.retest.status = 'READY';
  }

  if (targetStatus === LIFECYCLE_STATES.VERIFIED) {
    if (!finding.retest) finding.retest = {};
    finding.retest.status = 'PASSED';
    finding.retest.executedBy = actor;
    finding.retest.executedAt = new Date().toISOString();
    finding.retest.currentResult = 'Condition Not Detected (Verified Clean)';
    if (!finding.verification) finding.verification = {};
    finding.verification.status = 'VERIFIED';
    finding.verification.finalNote = 'Vulnerability remediation verified clean on automated retest.';
  }

  if (targetStatus === LIFECYCLE_STATES.REOPENED) {
    if (!finding.retest) finding.retest = {};
    finding.retest.status = 'FAILED';
    finding.retest.executedBy = actor;
    finding.retest.executedAt = new Date().toISOString();
    finding.retest.currentResult = 'Condition Still Detected (Vulnerability Persists)';
    if (!finding.verification) finding.verification = {};
    finding.verification.status = 'REOPENED';
    finding.verification.finalNote = 'Vulnerability condition persisted during retest execution.';
  }

  return finding;
}
