// Line-style icons. All 24x24 viewBox, stroke="currentColor".
const Icon = ({ d, size = 20, fill, stroke = "currentColor", strokeWidth = 1.6, style, ...rest }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={fill || "none"}
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    {...rest}
  >
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);

const IconSearch = (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="6.5" /><line x1="20" y1="20" x2="16" y2="16" /></>} />;
const IconChevronRight = (p) => <Icon {...p} d="M9 5l7 7-7 7" />;
const IconChevronLeft = (p) => <Icon {...p} d="M15 5l-7 7 7 7" />;
const IconChevronDown = (p) => <Icon {...p} d="M5 9l7 7 7-7" />;
const IconClose = (p) => <Icon {...p} d="M6 6l12 12M18 6L6 18" />;
const IconShield = (p) => <Icon {...p} d="M12 3l8 3v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6l8-3z" />;
const IconShieldCheck = (p) => <Icon {...p} d={<><path d="M12 3l8 3v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6l8-3z" /><polyline points="8.5,12 11,14.5 15.5,9.5" /></>} />;
const IconPin = (p) => <Icon {...p} d={<><path d="M12 21s-7-6-7-12a7 7 0 0114 0c0 6-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></>} />;
const IconCheckCircle = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9" /><polyline points="8,12 11,15 16,9" /></>} />;
const IconCheck = (p) => <Icon {...p} d="M5 12l4 4 10-10" />;
const IconClock = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9" /><polyline points="12,7 12,12 15.5,14" /></>} />;
const IconStar = (p) => <Icon {...p} fill="currentColor" stroke="none" d="M12 3.5l2.6 5.5 6 .7-4.5 4.2 1.2 6L12 17l-5.3 2.9 1.2-6L3.4 9.7l6-.7L12 3.5z" />;
const IconStarOutline = (p) => <Icon {...p} d="M12 3.5l2.6 5.5 6 .7-4.5 4.2 1.2 6L12 17l-5.3 2.9 1.2-6L3.4 9.7l6-.7L12 3.5z" />;
const IconCamera = (p) => <Icon {...p} d={<><rect x="3" y="7" width="18" height="13" rx="2.5" /><path d="M8 7l1.5-3h5L16 7" /><circle cx="12" cy="13.5" r="3.5" /></>} />;
const IconPlus = (p) => <Icon {...p} d="M12 5v14M5 12h14" />;
const IconChat = (p) => <Icon {...p} d="M4 5a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H9l-4 4V5z" />;
const IconWhatsapp = (p) => <Icon {...p} strokeWidth={0} fill="currentColor" d="M20 11.9c0 4.8-3.9 8.7-8.7 8.7-1.5 0-3-.4-4.3-1.1L2 21l1.6-4.8c-.8-1.4-1.3-3-1.3-4.6 0-4.8 3.9-8.7 8.7-8.7s9 3.9 9 9zm-8.7-7.3c-4 0-7.3 3.3-7.3 7.3 0 1.6.5 3 1.4 4.3l-1 2.8 2.9-1c1.2.7 2.6 1.1 4 1.1 4 0 7.3-3.3 7.3-7.3s-3.3-7.2-7.3-7.2zm4.4 9.3c0-.1-.2-.2-.5-.3-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1s-.6.7-.7.9c-.1.1-.3.1-.5 0-.7-.3-1.3-.7-2-1.7-.5-.6-.8-1.4-.9-1.6 0-.2 0-.3.1-.4l.3-.4c.1-.1.1-.2.2-.3 0-.1 0-.3 0-.4 0-.1-.4-1.1-.6-1.5-.2-.4-.3-.3-.5-.3h-.4c-.2 0-.4 0-.6.3-.2.3-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.7 2.5 4 3.5.6.2 1 .4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1z" />;
const IconUser = (p) => <Icon {...p} d={<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></>} />;
const IconUsers = (p) => <Icon {...p} d={<><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="8" r="2.5" /><path d="M16 14c2.8 0 5 2 5 4.5" /></>} />;
const IconHome = (p) => <Icon {...p} d={<><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1v-9z" /></>} />;
const IconDashboard = (p) => <Icon {...p} d={<><rect x="3" y="3" width="8" height="11" rx="1.5" /><rect x="13" y="3" width="8" height="6" rx="1.5" /><rect x="13" y="11" width="8" height="10" rx="1.5" /><rect x="3" y="16" width="8" height="5" rx="1.5" /></>} />;
const IconBolt = (p) => <Icon {...p} d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />;
const IconEdit = (p) => <Icon {...p} d={<><path d="M4 20h4l10-10-4-4L4 16v4z" /><path d="M14 6l4 4" /></>} />;
const IconEye = (p) => <Icon {...p} d={<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>} />;
const IconWarning = (p) => <Icon {...p} d={<><path d="M12 3l10 18H2L12 3z" /><line x1="12" y1="10" x2="12" y2="14.5" /><circle cx="12" cy="17.5" r=".7" fill="currentColor" stroke="none" /></>} />;
const IconFilter = (p) => <Icon {...p} d="M3 5h18l-7 9v6l-4-2v-4L3 5z" />;
const IconMore = (p) => <Icon {...p} d={<><circle cx="6" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="18" cy="12" r="1" fill="currentColor" stroke="none" /></>} />;
const IconArrowRight = (p) => <Icon {...p} d="M5 12h14M13 5l7 7-7 7" />;
const IconFlag = (p) => <Icon {...p} d="M4 21V4M4 4h12l-2 4 2 4H4" />;
const IconLogo = ({ size = 28, color = "#0E1530", accent = "#7B7AC4", accent2 = "#7DC6E8" }) => (
  <svg viewBox="0 0 40 40" width={size} height={size}>
    <path d="M9 19 L9 9 L19 4 L29 9 L29 19 L19 24 Z" fill={accent} opacity="0.92" />
    <rect x="13" y="13" width="18" height="18" rx="4" fill={accent2} opacity="0.82" />
    <circle cx="30" cy="9" r="3.2" fill={color} />
    <path d="M16 22 Q20 25 24 22" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
  </svg>
);

Object.assign(window, {
  Icon, IconSearch, IconChevronRight, IconChevronLeft, IconChevronDown, IconClose,
  IconShield, IconShieldCheck, IconPin, IconCheckCircle, IconCheck, IconClock,
  IconStar, IconStarOutline, IconCamera, IconPlus, IconChat, IconWhatsapp,
  IconUser, IconUsers, IconHome, IconDashboard, IconBolt, IconEdit, IconEye,
  IconWarning, IconFilter, IconMore, IconArrowRight, IconFlag, IconLogo,
});
