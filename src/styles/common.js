// LAYOUT
export const pageWrapper = "max-w-5xl mx-auto px-6 py-10";
export const articlePageWrapper = "max-w-4xl mx-auto px-6 py-12";

// CARDS & GRIDS
export const articleGrid = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6";
export const articleCardClass = "bg-white border border-[#e8e8ed] rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col";

// TYPOGRAPHY
export const articleTitle = "text-lg font-semibold text-[#1d1d1f] leading-snug";
export const articleMainTitle = "text-3xl sm:text-4xl font-bold text-[#1d1d1f] leading-tight mt-4";
export const articleExcerpt = "text-sm text-[#6e6e73] line-clamp-2";
export const articleMeta = "text-xs text-[#a1a1a6] uppercase tracking-wide";
export const articleCategory = "inline-block px-3 py-1 bg-[#0066cc]/10 text-[#0066cc] text-xs font-medium rounded-full";
export const articleAuthorRow = "flex items-center gap-3 text-sm text-[#6e6e73] mt-4 pt-4 border-t border-[#e8e8ed]";
export const authorInfo = "flex items-center gap-1";
export const articleContent = "prose prose-slate max-w-none text-[#1d1d1f] leading-relaxed mt-8";
export const articleFooter = "text-xs text-[#a1a1a6] mt-12 pt-6 border-t border-[#e8e8ed]";
export const articleHeader = "mb-8";
export const articleActions = "flex gap-3 mt-8 pt-6 border-t border-[#e8e8ed]";
export const articleStatusActive = "absolute top-4 right-4 px-2.5 py-1 bg-[#34c759]/10 text-[#248a3d] text-xs font-medium rounded-full";
export const articleStatusDeleted = "absolute top-4 right-4 px-2.5 py-1 bg-[#ff3b30]/10 text-[#cc2f26] text-xs font-medium rounded-full";

// COMMENTS
export const commentsWrapper = "mt-12 pt-8 border-t border-[#e8e8ed]";
export const commentCard = "bg-[#f5f5f7] rounded-2xl p-4 mb-4";
export const commentHeader = "flex items-start gap-3 mb-2";
export const commentUserRow = "flex items-center gap-2";
export const avatar = "w-8 h-8 rounded-full bg-[#0066cc]/10 text-[#0066cc] flex items-center justify-center text-sm font-semibold";
export const commentUser = "text-sm font-medium text-[#1d1d1f]";
export const commentTime = "text-xs text-[#a1a1a6]";
export const commentText = "text-sm text-[#1d1d1f] leading-relaxed";

// FORMS
export const formCard = "bg-white border border-[#e8e8ed] rounded-3xl p-6 shadow-sm";
export const formTitle = "text-xl font-semibold text-[#1d1d1f] mb-5";
export const formGroup = "mb-4";
export const labelClass = "block text-sm font-medium text-[#1d1d1f] mb-1.5";
export const inputClass = "w-full px-4 py-2.5 border border-[#e8e8ed] rounded-xl text-[#1d1d1f] placeholder-[#a1a1a6] focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-transparent transition";
export const submitBtn = "w-full py-2.5 bg-[#0066cc] text-white font-medium rounded-xl hover:bg-[#0052a3] transition disabled:opacity-50";

// BUTTONS
export const ghostBtn = "text-[#0066cc] text-sm font-medium hover:text-[#0052a3] transition";
export const editBtn = "px-4 py-2 bg-[#0066cc] text-white text-sm rounded-xl hover:bg-[#0052a3] transition";
export const deleteBtn = "px-4 py-2 bg-[#ff3b30] text-white text-sm rounded-xl hover:bg-[#d62c23] transition";

// STATES
export const loadingClass = "text-center py-12 text-[#a1a1a6] animate-pulse";
export const emptyStateClass = "text-center py-10 text-[#a1a1a6] text-sm";
export const errorClass = "text-sm text-[#ff3b30] mt-2";
export const timestampClass = "text-xs text-[#a1a1a6]";
export const navLinkClass = "text-[#6e6e73] text-sm font-medium hover:text-[#0066cc] transition";
export const divider = "h-px bg-[#e8e8ed] my-6";

// ANIMAL RESCUE ALIASES (NO DUPLICATES)
export const container = pageWrapper;
export const card = articleCardClass;
export const cardGrid = articleGrid;
export const btnPrimary = submitBtn;
export const btnSecondary = "px-4 py-2.5 border border-[#e8e8ed] text-[#1d1d1f] font-medium rounded-xl hover:bg-[#f5f5f7] transition";
export const loadingSpinner = loadingClass;
export const emptyState = emptyStateClass;
export const btnGhost = ghostBtn;
export const section = "py-16 bg-white";
export const sectionAlt = "py-16 bg-slate-50";
export const badgePending = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200";
export const badgeTransit = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200";
export const badgeRescued = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200";
export const badgeAdopted = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200";
export const hero = "relative bg-gradient-to-br from-amber-50 via-white to-emerald-50 py-20 sm:py-28";
export const heroTitle = "text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight";
export const heroSubtitle = "mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl";
export const statCard = "text-center p-6 bg-white rounded-2xl border border-slate-200";
export const statNumber = "text-4xl font-bold text-indigo-600";
export const statLabel = "mt-2 text-sm text-slate-600";