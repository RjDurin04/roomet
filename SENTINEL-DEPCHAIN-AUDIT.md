# SENTINEL-DEPCHAIN Audit Report

**Project:** roomet/frontend  
**Audit Date:** 2026-03-29  
**Manifest:** `package.json`  
**Lockfile:** `package-lock.json` (lockfileVersion: 3)  
**Total Dependencies:** 727 (471 prod, 230 dev, 68 optional)

---

## Executive Summary

| Metric | Value | Verdict |
|--------|-------|---------|
| **Risk Score** | **72/100** | **FAIL** |
| Critical Findings | 2 | HALT conditions |
| High Findings | 2 | Remediation required |
| Moderate Findings | 3 | Monitoring required |
| Lockfile Committed | ❌ NO | **CRITICAL FAIL** |
| Integrity Hashes | ✅ YES | PASS |
| CVEs (Fixable) | 2 | 1 HIGH, 1 MODERATE |
| License Compliance | ✅ PASS | All permissive |

---

## 1. Dependency Risk Manifest

### Direct Dependencies (Production)

| Name | Resolved | Latest | Trans/Dir | SPDX | Last Pub | CVEs | Maints | Verdict |
|------|----------|--------|-----------|------|----------|------|--------|---------|
| `@base-ui/react` | 1.3.0 | 1.3.0 | Low | MIT | Recent | 0 | Org | **PASS** |
| `@convex-dev/better-auth` | 0.11.3 | 0.11.4 | Low | Apache-2.0 | Recent | 0 | Org | **PASS** |
| `@fontsource-variable/geist` | 5.2.8 | 5.2.8 | 0 | OFL-1.1 | Recent | 0 | 1 | **PASS** |
| `better-auth` | 1.5.3 | 1.5.6 | Medium | MIT | 2026-03-23 | 0 | 2 | **PASS** |
| `class-variance-authority` | 0.7.1 | 0.7.1 | 0 | Apache-2.0 | Stable | 0 | 1 | **PASS** |
| `clsx` | 2.1.1 | 2.1.1 | 0 | MIT | Stable | 0 | 1 | **PASS** |
| `convex` | 1.34.0 | Latest | Medium | Apache-2.0 | Recent | 0 | Org | **PASS** |
| `framer-motion` | 12.38.0 | Latest | Medium | MIT | Recent | 0 | Org | **PASS** |
| `lucide-react` | 1.0.1 | 1.7.0 | Low | ISC | Recent | 0 | Org | **PASS** |
| `maplibre-gl` | 5.21.0 | Latest | Medium | BSD-3-Clause | Recent | 0 | Org | **PASS** |
| `react` | 19.2.4 | 19.2.4 | Low | MIT | Recent | 0 | Meta | **PASS** |
| `react-dom` | 19.2.4 | 19.2.4 | Low | MIT | Recent | 0 | Meta | **PASS** |
| `react-router-dom` | 7.13.2 | 7.13.2 | Medium | MIT | Recent | 0 | Remix | **PASS** |
| `shadcn` | 4.1.0 | Latest | Low | MIT | Recent | 0 | 1 | **PASS** |
| `tailwind-merge` | 3.5.0 | Latest | 0 | MIT | Recent | 0 | 1 | **PASS** |
| `tailwindcss-animate` | 1.0.7 | 1.0.7 | 0 | MIT | Stable | 0 | 1 | **PASS** |
| `tw-animate-css` | 1.4.0 | Latest | 0 | MIT | Recent | 0 | 1 | **PASS** |

### Direct Dependencies (Development)

| Name | Resolved | Latest | SPDX | CVEs | Verdict |
|------|----------|--------|------|------|---------|
| `@eslint/js` | 9.39.4 | Latest | MIT | 0 | **PASS** |
| `@types/node` | 24.12.0 | Latest | MIT | 0 | **PASS** |
| `@types/react` | 19.2.14 | Latest | MIT | 0 | **PASS** |
| `@types/react-dom` | 19.2.3 | Latest | MIT | 0 | **PASS** |
| `@typescript-eslint/*` | 8.57.2 | Latest | MIT | 0 | **WARN** (transitive CVE) |
| `@vitejs/plugin-react` | 6.0.1 | Latest | MIT | 0 | **PASS** |
| `autoprefixer` | 10.4.27 | Latest | MIT | 0 | **PASS** |
| `eslint` | 9.39.4 | Latest | MIT | 0 | **PASS** |
| `lefthook` | 2.1.4 | Latest | MIT | 0 | **PASS** |
| `postcss` | 8.5.8 | Latest | MIT | 0 | **PASS** |
| `tailwindcss` | 3.4.19 | Latest | MIT | 0 | **PASS** |
| `typescript` | 5.9.3 | Latest | Apache-2.0 | 0 | **PASS** |
| `vite` | 8.0.2 | 8.0.3 | MIT | 0 | **PASS** |

---

## 2. Transitive Depth Map

**Max Depth:** ~8 levels  
**Total Transitive Packages:** 727  
**Fan-Out:** 727 direct + transitive

### Fragile Hubs (>3 resolution paths)

| Package | Paths | Risk |
|---------|-------|------|
| `brace-expansion` | 3 | **CVE-affected** |
| `path-to-regexp` | 1 (via `router`) | **CVE-affected** |

### Transitive CVE Chain

```
react-router-dom@7.13.2
  └── router@→ (transitive)
        └── path-to-regexp@8.0.0-8.3.0 ⚠️ HIGH CVE

@typescript-eslint/typescript-estree@8.57.2
  └── brace-expansion@<1.1.13 ⚠️ MOD CVE

@ts-morph/common (via devDeps chain)
  └── brace-expansion@>=4.0.0 <5.0.5 ⚠️ MOD CVE
```

---

## 3. Risk Score Calculation

**Formula:** `(Critical×25) + (High×15) + (Moderate×8) + (LockfileIssues×20) + (SpecIssues×5) + (FanOut/10)`

| Factor | Weight | Score |
|--------|--------|-------|
| Lockfile gitignored (CRITICAL) | 25 | 25 |
| HIGH CVE (path-to-regexp) | 15 | 15 |
| MODERATE CVE (brace-expansion) | 8 | 8 |
| Tilde specifier (`~`) | 5 | 5 |
| Fan-out 727 (>150 threshold) | 10 | 10 |
| Native binary deps (maplibre-gl, lefthook) | 4 | 4 |
| Single-maintainer packages (5 count) | 1 each | 5 |

**Total Score: 72/100** → **FAIL**

---

## 4. Critical Path Dependencies (2× Severity Weight)

These packages handle auth, crypto, data, or net-I/O:

| Package | Function | Risk Multiplier | Adjusted Verdict |
|---------|----------|-----------------|------------------|
| `better-auth` | Authentication | 2× | **PASS** (active maint, MIT) |
| `@convex-dev/better-auth` | Auth integration | 2× | **PASS** (org-backed, Apache) |
| `convex` | Database/Backend | 2× | **PASS** (org-backed, Apache) |
| `react-router-dom` | Routing | 2× | **WARN** (transitive CVE) |
| `maplibre-gl` | Maps (net-I/O) | 2× | **PASS** (BSD-3, org-backed) |

---

## 5. Findings

### FINDING 001: Phantom Lock (AP-DEP-002)

**SEVERITY:** CRITICAL  
**LOCATION:** `.gitignore:64`

**DIAGNOSIS:** Lockfile `package-lock.json` is explicitly gitignored, enabling dependency confusion attacks and non-deterministic builds. Every `npm install` resolves versions independently, allowing attackers to publish malicious versions between installs.

**EVIDENCE:**
```
.gitignore:64: package-lock.json
```

**REMEDIATION:**
```bash
# Remove from gitignore
git rm --cached .gitignore
# Edit .gitignore to remove line 64
# Commit the lockfile
git add package-lock.json
git commit -m "security: commit lockfile for deterministic builds"
```

**VERIFICATION:**
```bash
git ls-files | grep package-lock.json
# Should output: package-lock.json
```

**RATIONALE:** OWASP A06:2021 (Vulnerable Components), NIST SP 800-218 (SSDF). Precedent: event-stream attack exploited unpinned dependencies.

---

### FINDING 002: HIGH CVE - path-to-regexp DoS

**SEVERITY:** HIGH (CVSS 7.5)  
**LOCATION:** `node_modules/router/node_modules/path-to-regexp`

**DIAGNOSIS:** `path-to-regexp@8.0.0-8.3.0` vulnerable to Regular Expression Denial of Service (ReDoS) via sequential optional groups and multiple wildcards. Transitive dependency of `react-router-dom`.

**EVIDENCE:**
- GHSA-j3q9-mxjg-w52f (HIGH, CVSS 7.5)
- GHSA-27v5-c462-wpq7 (MODERATE, CVSS 5.9)
- CWE-400 (Uncontrolled Resource Consumption)
- CWE-1333 (Inefficient Regular Expression Complexity)

**REMEDIATION:**
```bash
# Update react-router-dom to pull patched transitive
npm update react-router-dom
# Or override resolution
npm install --save react-router-dom@latest
# Verify fix
npm ls path-to-regexp
# Should show >=8.4.0
```

**VERIFICATION:**
```bash
npm audit
# Should show 0 high vulnerabilities for path-to-regexp
```

**RATIONALE:** OWASP A06:2021. ReDoS can cause server-side resource exhaustion in SSR contexts.

---

### FINDING 003: MODERATE CVE - brace-expansion DoS

**SEVERITY:** MODERATE (CVSS 6.5)  
**LOCATION:** 
- `node_modules/@ts-morph/common/node_modules/brace-expansion`
- `node_modules/@typescript-eslint/typescript-estree/node_modules/brace-expansion`

**DIAGNOSIS:** `brace-expansion` vulnerable to process hang and memory exhaustion via zero-step sequences. Affects dev tooling only (TypeScript/ESLint), not production runtime.

**EVIDENCE:**
- GHSA-f886-m6hf-6m8v
- CWE-400 (Uncontrolled Resource Consumption)

**REMEDIATION:**
```bash
npm audit fix
# Or manual override
npm install --save-dev @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest
```

**VERIFICATION:**
```bash
npm audit
# Should show 0 moderate vulnerabilities for brace-expansion
```

---

### FINDING 004: Tilde Version Specifier

**SEVERITY:** WARN  
**LOCATION:** `package.json:48`

**DIAGNOSIS:** `typescript: "~5.9.3"` uses tilde specifier allowing patch updates. While lockfile pins exact version, this delegates trust to registry for future patches.

**EVIDENCE:**
```json
"typescript": "~5.9.3"
```

**REMEDIATION:**
```bash
npm install --save-dev --save-exact typescript@5.9.3
```

**VERIFICATION:**
```bash
npm pkg get devDependencies | grep typescript
# Should show: "typescript": "5.9.3" (no tilde/caret)
```

---

### FINDING 005: High Fan-Out (727 packages)

**SEVERITY:** WARN  
**LOCATION:** Entire dependency tree

**DIAGNOSIS:** 727 total packages exceeds 150 threshold. Large attack surface increases probability of supply chain compromise. Many packages are optional native bindings for different platforms.

**EVIDENCE:**
```
npm audit metadata:
  prod: 471
  dev: 230
  optional: 68
  total: 727
```

**REMEDIATION:** Review and remove unused dependencies. Consider:
- Replace `framer-motion` with CSS animations for simple cases
- Audit `shadcn` usage (CLI tool, may not be needed as runtime dep)
- Review if all ESLint plugins are necessary

**VERIFICATION:**
```bash
npm ls --depth=0 | wc -l
# Track reduction over time
```

---

### FINDING 006: Single Maintainer Packages

**SEVERITY:** WARN  
**LOCATION:** Various

**DIAGNOSIS:** Multiple packages have single maintainer (bus factor = 1). Risk of abandonment or compromise.

**Affected Packages:**
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `tailwindcss-animate`
- `tw-animate-css`

**REMEDIATION:** Monitor for deprecation notices. Consider inlining small utilities (clsx is ~20 LoC).

---

## 6. Anti-Pattern Detection

| ID | Pattern | Detected | Location |
|----|---------|----------|----------|
| AP-DEP-001 | Kitchen Sink | No | - |
| AP-DEP-002 | Phantom Lock | **YES** | `.gitignore:64` |
| AP-DEP-003 | Floating Specifier | Partial | `typescript: "~5.9.3"` |
| AP-DEP-004 | Hoarding | Partial | 727 packages |
| AP-DEP-005 | Zombie | Not analyzed | - |
| AP-DEP-006 | Shadow Transitive | No | - |
| AP-DEP-007 | Vendored/Forgotten | No | - |
| AP-DEP-008 | Git-Ref Gamble | No | - |
| AP-DEP-009 | Copyleft Trojan | No | All permissive |
| AP-DEP-010 | Deprecated Chain | No | - |
| AP-DEP-011 | Post-Install Trojan | No | No install scripts |
| AP-DEP-012 | Scope Void | No | All properly scoped |

---

## 7. License Compliance Matrix

| License | Count | Compatibility | Notes |
|---------|-------|---------------|-------|
| MIT | Majority | ✅ Permissive | Commercial use OK |
| Apache-2.0 | 3 | ✅ Permissive | Patent grant included |
| BSD-3-Clause | 1 | ✅ Permissive | maplibre-gl |
| ISC | 1 | ✅ Permissive | lucide-react |
| OFL-1.1 | 1 | ✅ Permissive | Font files |

**No copyleft licenses detected.** Safe for proprietary deployment.

---

## 8. Remediation Priority Queue

| Priority | Finding | Action | Effort |
|----------|---------|--------|--------|
| P0 | Phantom Lock | Commit `package-lock.json` | 5 min |
| P1 | HIGH CVE | `npm update react-router-dom` | 2 min |
| P2 | MOD CVE | `npm audit fix` | 2 min |
| P3 | Tilde specifier | Pin typescript exactly | 1 min |
| P4 | Fan-out | Dependency audit | 1-2 hours |

---

## 9. Verification Commands

```bash
# After remediation, run:
npm audit                    # Should show 0 vulnerabilities
git ls-files | grep package-lock.json  # Should show lockfile
npm ls path-to-regexp        # Should show >=8.4.0
npm ls brace-expansion       # Should show >=1.1.13 or >=5.0.5
```

---

## 10. Blast Radius Assessment

If `better-auth` compromised:
- **Direct:** All authentication flows broken
- **Indirect:** Session management, user data access
- **Operational:** Complete auth bypass potential
- **User Impact:** Account takeover, data exposure

If `convex` compromised:
- **Direct:** All database operations
- **Indirect:** Real-time subscriptions, file storage
- **Operational:** Data exfiltration, corruption
- **User Impact:** Full data breach

---

**Report Generated:** 2026-03-29  
**Auditor:** SENTINEL-DEPCHAIN v1.0.0  
**Status:** **FAIL - HALT for lockfile issue, remediate CVEs before production deployment**
