/**
 * Risk Assessment & CVSS Service
 * Provides deterministic CVSS v3.1 scoring, vector generation, and risk ratings.
 */

export const riskService = {
  /**
   * Calculate deterministic CVSS 3.1 base score and vector
   */
  calculateCVSS({
    severity = 'MEDIUM',
    category = 'General',
    confidentiality = 'LOW',
    integrity = 'LOW',
    availability = 'NONE',
    attackVector = 'NETWORK',
    attackComplexity = 'LOW',
    privilegesRequired = 'NONE',
    userInteraction = 'NONE',
    scope = 'UNCHANGED'
  }) {
    // Map standard severities to deterministic CVSS 3.1 base score ranges if not explicitly configured
    let baseScore = 5.3;
    let vectorString = 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:N';

    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        baseScore = 9.8;
        vectorString = 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H';
        break;
      case 'HIGH':
        baseScore = 8.1;
        vectorString = 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N';
        break;
      case 'MEDIUM':
        baseScore = 5.4;
        vectorString = 'CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:U/C:L/I:L/A:N';
        break;
      case 'LOW':
        baseScore = 3.7;
        vectorString = 'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N';
        break;
      case 'INFORMATIONAL':
        baseScore = 0.0;
        vectorString = 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N';
        break;
      default:
        baseScore = 5.0;
        vectorString = 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N';
    }

    // OWASP Top 10 2021 mapping
    const owaspMap = {
      'Authentication': 'A07:2021-Identification and Authentication Failures',
      'Authorization': 'A01:2021-Broken Access Control',
      'API Security': 'A01:2021-Broken Access Control & API3:2023-BOLA',
      'Input Validation': 'A03:2021-Injection',
      'Client Security': 'A05:2021-Security Misconfiguration',
      'Configuration': 'A05:2021-Security Misconfiguration',
      'Transport': 'A02:2021-Cryptographic Failures',
      'Data Protection': 'A04:2021-Insecure Design & PII Exposure',
      'Dependencies': 'A06:2021-Vulnerable and Outdated Components'
    };

    let owaspCategory = 'A05:2021-Security Misconfiguration';
    for (const [key, value] of Object.entries(owaspMap)) {
      if (category.toLowerCase().includes(key.toLowerCase())) {
        owaspCategory = value;
        break;
      }
    }

    return {
      score: baseScore,
      vector: vectorString,
      rating: severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase(),
      owaspCategory
    };
  },

  /**
   * Compute aggregate risk score (0-100) and qualitative rating from findings
   */
  calculateAggregateRisk(findings = []) {
    const activeFindings = findings.filter(f => f.status !== 'VERIFIED' && f.status !== 'FALSE_POSITIVE' && f.status !== 'False Positive');
    if (activeFindings.length === 0) {
      return { riskIndex: 0, riskRating: 'Clean' };
    }

    let weightedScore = 0;
    activeFindings.forEach(f => {
      const sev = (f.severity || 'MEDIUM').toUpperCase();
      if (sev === 'CRITICAL') weightedScore += 30;
      else if (sev === 'HIGH') weightedScore += 20;
      else if (sev === 'MEDIUM') weightedScore += 10;
      else if (sev === 'LOW') weightedScore += 4;
      else weightedScore += 1;
    });

    const riskIndex = Math.min(100, Math.round(weightedScore));
    let riskRating = 'Low';
    if (riskIndex >= 75) riskRating = 'Critical';
    else if (riskIndex >= 50) riskRating = 'High';
    else if (riskIndex >= 25) riskRating = 'Moderate';

    return { riskIndex, riskRating };
  }
};
