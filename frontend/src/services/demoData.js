// MOCK DATA - DEVELOPMENT DEMONSTRATION ONLY
export const DEMO_REPORTING_YEAR = 2026;

export const DEMO_REPORTING_PROGRESS = {
  percent: 82,
  submitted: 10,
  approved: 6,
  pending: 2,
  correctionRequired: 1,
};

export const DEMO_MONTHLY_ENERGY = [
  { month: "Jan", value: 248000 },
  { month: "Feb", value: 236000 },
  { month: "Mar", value: 259000 },
  { month: "Apr", value: 251000 },
  { month: "May", value: 272000 },
  { month: "Jun", value: 264000 },
  { month: "Jul", value: 281000 },
  { month: "Aug", value: 267000 },
  { month: "Sep", value: 243000 },
  { month: "Oct", value: 258000 },
  { month: "Nov", value: 0 },
  { month: "Dec", value: 0 },
];

export const DEMO_ENERGY_SERIES = {
  2026: {
    all: [248000, 236000, 259000, 251000, 272000, 264000, 281000, 267000, 243000, 258000, 0, 0],
    101: [88000, 86000, 92000, 89000, 94000, 96000, 101000, 97000, 90000, 95000, 0, 0],
    102: [66000, 62000, 69000, 65000, 70000, 68000, 73000, 70000, 64000, 69000, 0, 0],
    103: [45000, 43000, 47000, 46000, 49000, 47000, 50000, 48000, 44000, 48000, 0, 0],
  },
  2025: {
    all: [232000, 220000, 248000, 239000, 255000, 262000, 271000, 259000, 233000, 246000, 264000, 278000],
    101: [82000, 79000, 87000, 84000, 90000, 92000, 96000, 93000, 85000, 89000, 95000, 98000],
    102: [61000, 58000, 65000, 62000, 67000, 69000, 71000, 68000, 62000, 65000, 69000, 73000],
    103: [42000, 40000, 45000, 43000, 46000, 47000, 49000, 46000, 42000, 44000, 47000, 50000],
  },
};

export const DEMO_SUBMISSION_SERIES = {
  2026: {
    all: [2, 3, 4, 2, 5, 4, 6, 4, 3, 3, 0, 0],
    101: [1, 1, 2, 1, 2, 1, 3, 2, 1, 2, 0, 0],
    102: [1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 0, 0],
    103: [0, 1, 1, 0, 1, 1, 2, 1, 1, 0, 0, 0],
  },
  2025: {
    all: [3, 2, 4, 3, 5, 4, 5, 4, 3, 4, 5, 6],
    101: [1, 1, 2, 1, 2, 2, 2, 2, 1, 1, 2, 3],
    102: [1, 0, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1],
    103: [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 2],
  },
};

export const DEMO_PROJECT_PERFORMANCE = [
  { id: 101, name: "Project Alpha", submissionId: 1001, completion: 82, submissions: 3, approved: 1, pending: 1, correctionRequired: 1, energy: 335500, unit: "kWh" },
  { id: 102, name: "Project Beta", submissionId: 1003, completion: 67, submissions: 2, approved: 1, pending: 1, correctionRequired: 0, energy: 98000, unit: "kWh" },
  { id: 103, name: "Project Gamma", submissionId: 1004, completion: 100, submissions: 4, approved: 4, pending: 0, correctionRequired: 0, energy: 76000, unit: "kWh" },
];

export const DEMO_ACTION_ITEMS = [
  { id: "correction", icon: "!", title: "Correction required", description: "Electricity data needs an updated annual bill.", status: "CORRECTION_REQUIRED", action: "Fix now", href: "/esg-submission/1002/edit" },
  { id: "review", icon: "◷", title: "Awaiting review", description: "Your latest energy submission is in the review queue.", status: "UNDER_REVIEW", action: "View submission", href: "/submissions/1003" },
  { id: "period", icon: "+", title: "Reporting period open", description: "Add this period's electricity data when ready.", status: "PENDING", action: "Submit data", href: "/esg-submission" },
];

export const DEMO_RECENT_ACTIVITY = [
  { id: 1, icon: "✓", title: "ESG submission approved", detail: "Project Alpha · FY 2025", time: "2 days ago", tone: "success" },
  { id: 2, icon: "+", title: "Energy data submitted", detail: "Project Alpha · FY 2026", time: "Yesterday", tone: "neutral" },
  { id: 3, icon: "!", title: "Correction requested", detail: "Annual electricity bill needed", time: "3 weeks ago", tone: "warning" },
  { id: 4, icon: "◷", title: "ESG reporting started", detail: "Reporting period FY 2026", time: "1 month ago", tone: "neutral" },
];

export const DEMO_NOTIFICATIONS = [
  { id: "n1", icon: "!", title: "Correction required", message: "Annual energy evidence needs an update.", time: "20 min ago", unread: true, href: "/submissions/1002" },
  { id: "n2", icon: "✓", title: "Submission approved", message: "Your FY 2025 submission was approved.", time: "2 days ago", unread: true, href: "/submissions/1005" },
  { id: "n3", icon: "◷", title: "Review pending", message: "A submission is waiting in the reviewer queue.", time: "Yesterday", unread: false, href: "/submissions/1001" },
  { id: "n4", icon: "▦", title: "New reporting period", message: "FY 2026 reporting is now open.", time: "Oct 1", unread: false, href: "/esg-submission" },
];

export const DEMO_AI_RESPONSES = {
  status: "Your reporting workspace shows 3 submissions: 1 approved, 1 pending, and 1 requiring correction. These are demonstration figures and should be verified against the reporting system.",
  pending: "One submission is awaiting review in this demonstration dataset. Open My Submissions to inspect its current status.",
  energy: "The demonstration energy series shows a September-to-October increase. Open Monthly Comparison to review the monthly values and percentage change.",
  brsr: "BRSR is India's Business Responsibility and Sustainability Reporting framework. The report preview summarizes the environmental information currently available in this workspace.",
  attention: "The demo workspace flags one correction request and one submission awaiting review. Open Action Required on your dashboard for the related records.",
  fallback: "I can help explain reporting status, pending submissions, energy trends, and BRSR concepts. Choose a quick action or ask about one of those topics.",
};

export const DEMO_CALENDAR = [
  { period: "Data submission", date: "31 Oct 2026", state: "OPEN" },
  { period: "Reviewer assessment", date: "01–20 Nov 2026", state: "UPCOMING" },
  { period: "BRSR consolidation", date: "21 Nov–15 Dec 2026", state: "UPCOMING" },
];

export const DEMO_SEARCH_ITEMS = [
  { label: "Project Alpha", detail: "Project · 3 submissions", href: "/project-performance" },
  { label: "Project Beta", detail: "Project · 2 submissions", href: "/project-performance" },
  { label: "Project Gamma", detail: "Project · 4 submissions", href: "/project-performance" },
  { label: "Submission #1001", detail: "Pending · Project Alpha", href: "/submissions/1001" },
  { label: "Submission #1002", detail: "Correction required · Project Alpha", href: "/submissions/1002" },
  { label: "Submission #1003", detail: "Under review · Project Beta", href: "/submissions/1003" },
  { label: "Submission #1004", detail: "Approved · Project Gamma", href: "/submissions/1004" },
];
