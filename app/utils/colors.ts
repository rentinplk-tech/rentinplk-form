export const Colors = {
  primaryGold: '#BA7517',
  deepNavy: '#042C53',
  teal: '#1D9E75',
  coral: '#D85A30',
  purple: '#534AB7',
  neutralDark: '#2C2C2A',
  surface: '#F8F7F4',
  white: '#FFFFFF',
  amber: '#F59E0B',
  gray: '#6B7280',
  grayLight: '#E5E4E1',
  red: '#EF4444',
  green: '#10B981',

  // Dark mode
  darkBg: '#111827',
  darkSurface: '#1F2937',
  darkBorder: '#374151',
  darkText: '#F9FAFB',
  darkSubtext: '#9CA3AF',
};

export const CategoryColors: Record<string, string> = {
  god: Colors.primaryGold,
  trading: Colors.teal,
  business: Colors.deepNavy,
  people: Colors.coral,
  mind: Colors.purple,
  rest: Colors.gray,
  job: '#EC4899',
};

export const CategoryLabels: Record<string, string> = {
  god: 'God',
  trading: 'Trading',
  business: 'Business',
  people: 'People',
  mind: 'Mind',
  rest: 'Rest',
  job: 'Job',
};

export const StatusColors: Record<string, string> = {
  active: Colors.teal,
  reactivating: Colors.amber,
  lifeline: Colors.coral,
  income: Colors.primaryGold,
};

export const ContactCategoryColors: Record<string, string> = {
  leader: Colors.deepNavy,
  disciple: Colors.coral,
  family: Colors.red,
  friend: Colors.teal,
  community: Colors.purple,
  extended: Colors.gray,
};
