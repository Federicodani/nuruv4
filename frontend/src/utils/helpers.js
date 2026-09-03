// Formats a phone number into a WhatsApp-compatible link with a pre-filled message.
export const getWhatsAppLink = (phoneNumber, message) => {
  if (!phoneNumber) return '#';
  // Strip non-digit characters except leading + then remove + for wa.me format
  const cleaned = phoneNumber.replace(/[^\d+]/g, '').replace(/^\+/, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${encodedMessage}`;
};

// Formats a phone number into a tel: link
export const getCallLink = (phoneNumber) => {
  if (!phoneNumber) return '#';
  return `tel:${phoneNumber}`;
};

// Formats a number as Kenyan Shillings currency
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return 'KSh 0';
  return `KSh ${Number(amount).toLocaleString('en-KE')}`;
};

// Formats a date into a readable relative-ish string
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Truncates text to a max length with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

// Generates initials from a full name, for avatar fallbacks
export const getInitials = (fullName) => {
  if (!fullName) return '?';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Standard WhatsApp message templates required by the spec
export const WHATSAPP_MESSAGES = {
  professional:
    'Hello, I found your profile on Nuru Holdings Construction Hub and would like to discuss a project.',
  product:
    'Hello, I found your product on Nuru Holdings Construction Hub and would like more information.',
  store:
    'Hello, I found your store on Nuru Holdings Construction Hub and would like more information.',
  quote:
    'Hello Nuru Electricals, I would like to request a quote for your services.',
};
