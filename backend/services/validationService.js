/**
 * Validation Service
 * Manages the transition from Candidate -> Validating -> Validated OR False Positive.
 * Manages analyst confidence ratings (Low, Medium, High) and updates assessment counters.
 */

import { dbService } from './dbService.js';

export const validationService = {
  /**
   * Validate a finding (mark as Validated or False Positive)
   */
  validateFinding(findingId, {
    action = 'VALIDATE', // 'VALIDATE' | 'MARK_FALSE_POSITIVE'
    confidence = 'High', // 'Low' | 'Medium' | 'High'
    notes = '',
    validatedBy = 'Security Analyst'
  }) {
    const finding = dbService.getFinding(findingId);
    if (!finding) {
      throw new Error(`Finding with ID ${findingId} not found`);
    }

    const timestamp = new Date().toISOString();
    const isConfirmed = action === 'VALIDATE';
    const newStatus = isConfirmed ? 'Validated' : 'False Positive';

    finding.status = newStatus;
    finding.confidence = confidence;

    finding.validation = {
      status: isConfirmed ? 'CONFIRMED' : 'REJECTED_FALSE_POSITIVE',
      validatedBy,
      validatedAt: timestamp,
      confidence,
      notes: notes || (isConfirmed ? 'Analyst verified empirical evidence and confirmed real vulnerability.' : 'Analyst reviewed evidence and flagged as false positive.')
    };

    if (!finding.auditTrail) finding.auditTrail = [];
    finding.auditTrail.push({
      timestamp,
      action: isConfirmed ? 'VALIDATED' : 'FALSE_POSITIVE',
      actor: validatedBy,
      details: `Finding state updated to ${newStatus} with ${confidence} confidence. Notes: ${notes || 'N/A'}`
    });

    dbService.saveFinding(finding);
    dbService.addAuditLog(
      isConfirmed ? 'VALIDATE_FINDING' : 'FLAG_FALSE_POSITIVE',
      validatedBy,
      finding.id,
      `Finding ${finding.id} marked as ${newStatus} (${confidence} confidence)`
    );

    // Update assessment validatedCount counter
    if (finding.assessmentId) {
      const assessment = dbService.getAssessment(finding.assessmentId);
      if (assessment) {
        const allFindings = dbService.getFindings().filter(f => f.assessmentId === finding.assessmentId);
        assessment.validatedCount = allFindings.filter(f => f.status === 'Validated').length;
        dbService.saveAssessment(assessment);
      }
    }

    return finding;
  }
};
